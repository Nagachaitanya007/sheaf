import { uid } from "./ids.ts";
import { parseExtractDirectives, blockKey } from "./extract.ts";
import {
  HTTP_METHODS,
  DEFAULT_TIMEOUT_MS,
  type BodyType,
  type ErrorKind,
  type HeaderRow,
  type HttpMethod,
  type HttpResponse,
  type ParsedRequest,
  MAX_RESPONSE_CHARS,
} from "./types.ts";

const METHOD_RE = new RegExp(`^(${HTTP_METHODS.join("|")})\\s+(\\S+)(?:\\s+HTTP/\\d(?:\\.\\d)?)?\\s*$`, "i");
const HEADER_RE = /^([A-Za-z0-9!#$%&'*+.^_`|~-]+)\s*:\s*(.*)$/;

export function isHttpMethod(value: string): value is HttpMethod {
  return (HTTP_METHODS as readonly string[]).includes(value.toUpperCase());
}

export function emptyHeaders(): HeaderRow[] {
  return [
    { id: uid("h"), key: "", value: "", enabled: true },
    { id: uid("h"), key: "", value: "", enabled: true },
  ];
}

export function interpolate(text: string, vars: Record<string, string>): string {
  return text.replace(/\{\{\s*([A-Za-z0-9_.-]+)\s*\}\}/g, (match, key: string) => {
    if (Object.prototype.hasOwnProperty.call(vars, key)) return vars[key] ?? "";
    return match;
  });
}

export function varsFromEnv(
  variables: { key: string; value: string }[] | undefined,
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const v of variables ?? []) {
    if (v.key.trim()) out[v.key.trim()] = v.value;
  }
  return out;
}

export function parseHttpFile(source: string): ParsedRequest[] {
  const chunks = source.replace(/\r\n/g, "\n").split(/^\s*###[^\n]*$/m);
  const requests: ParsedRequest[] = [];
  for (const chunk of chunks) {
    const parsed = parseSingleRequest(chunk);
    if (parsed) requests.push(parsed);
  }
  return requests;
}

export function parseSingleRequest(source: string): ParsedRequest | null {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  let i = 0;
  while (i < lines.length) {
    const t = lines[i]?.trim() ?? "";
    if (t === "" || t.startsWith("//") || (t.startsWith("#") && !t.startsWith("###"))) {
      i += 1;
      continue;
    }
    break;
  }
  if (i >= lines.length) return null;

  let name: string | undefined;
  const nameLine = lines[i] ?? "";
  if (nameLine.trim().startsWith("#") && !METHOD_RE.test(nameLine.trim())) {
    name = nameLine.replace(/^#+\s*/, "").trim() || undefined;
    i += 1;
    while (i < lines.length && lines[i]?.trim() === "") i += 1;
  }

  const requestLine = lines[i]?.trim() ?? "";
  const match = requestLine.match(METHOD_RE);
  if (!match) return null;
  i += 1;

  const method = match[1]!.toUpperCase() as HttpMethod;
  const url = match[2]!;
  const headers: HeaderRow[] = [];

  while (i < lines.length) {
    const line = lines[i] ?? "";
    if (line.trim() === "") {
      i += 1;
      break;
    }
    if (line.trim().startsWith("#") || line.trim().startsWith("//")) {
      i += 1;
      continue;
    }
    const hm = line.match(HEADER_RE);
    if (!hm) break;
    headers.push({
      id: uid("h"),
      key: hm[1]!,
      value: hm[2] ?? "",
      enabled: true,
    });
    i += 1;
  }

  const body = lines.slice(i).join("\n").replace(/\n+$/, "");
  const parsed: ParsedRequest = {
    name,
    method,
    url,
    headers: headers.length ? headers : emptyHeaders(),
    body,
    bodyType: inferBodyType(headers, body),
  };
  parsed.extracts = parseExtractDirectives(source, blockKey(parsed, 0));
  return parsed;
}

export function inferBodyType(headers: HeaderRow[], body: string): BodyType {
  if (!body.trim()) return "none";
  const ct = headers.find((h) => h.enabled && h.key.toLowerCase() === "content-type")?.value.toLowerCase() ?? "";
  if (ct.includes("application/json") || looksLikeJson(body)) return "json";
  if (ct.includes("application/x-www-form-urlencoded")) return "urlencoded";
  if (ct.includes("multipart/form-data")) return "form-data";
  return "raw";
}

export function looksLikeJson(text: string): boolean {
  const t = text.trim();
  return (t.startsWith("{") && t.endsWith("}")) || (t.startsWith("[") && t.endsWith("]"));
}

export function serializeHttp(req: {
  name?: string;
  method: HttpMethod;
  url: string;
  headers?: HeaderRow[];
  body?: string;
}): string {
  const lines: string[] = [];
  if (req.name) lines.push(`### ${req.name}`, "");
  lines.push(`${req.method} ${req.url}`);
  for (const h of req.headers ?? []) {
    if (!h.enabled || !h.key.trim()) continue;
    lines.push(`${h.key}: ${h.value}`);
  }
  if (req.body?.trim()) {
    lines.push("", req.body.trimEnd());
  }
  return lines.join("\n") + "\n";
}

export function toCurl(req: {
  method: HttpMethod;
  url: string;
  headers?: HeaderRow[];
  body?: string;
  bodyType?: BodyType;
  formFields?: { key: string; value: string; enabled: boolean }[];
}): string {
  const parts = [`curl -X ${req.method}`];
  parts.push(`'${req.url.replace(/'/g, `'\\''`)}'`);
  const isMultipart = req.bodyType === "form-data";
  for (const h of req.headers ?? []) {
    if (!h.enabled || !h.key.trim()) continue;
    if (isMultipart && h.key.toLowerCase() === "content-type") continue;
    parts.push(`-H '${h.key}: ${h.value.replace(/'/g, `'\\''`)}'`);
  }
  if (isMultipart && req.formFields?.length) {
    for (const f of req.formFields) {
      if (!f.enabled || !f.key) continue;
      parts.push(`-F '${f.key}=${f.value.replace(/'/g, `'\\''`)}'`);
    }
  } else if (req.body?.trim() && req.method !== "GET" && req.method !== "HEAD") {
    parts.push(`--data-raw '${req.body.replace(/'/g, `'\\''`)}'`);
  }
  return parts.join(" \\\n  ");
}

export function headersToRecord(headers: HeaderRow[], vars: Record<string, string>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const h of headers) {
    if (!h.enabled || !h.key.trim()) continue;
    out[interpolate(h.key, vars)] = interpolate(h.value, vars);
  }
  return out;
}

export function parseSetCookie(headerValue: string): { name: string; value: string; raw: string } {
  const first = headerValue.split(";")[0] ?? headerValue;
  const eq = first.indexOf("=");
  if (eq === -1) return { name: first.trim(), value: "", raw: headerValue };
  return {
    name: first.slice(0, eq).trim(),
    value: first.slice(eq + 1).trim(),
    raw: headerValue,
  };
}

export function statusTone(status: number): "success" | "warn" | "danger" | "muted" | "info" {
  if (status >= 200 && status < 300) return "success";
  if (status >= 300 && status < 400) return "info";
  if (status >= 400 && status < 500) return "warn";
  if (status >= 500) return "danger";
  return "muted";
}

export function prettyBody(body: string, contentType: string): string {
  if (!body) return "";
  if (contentType.includes("json") || looksLikeJson(body)) {
    try {
      return JSON.stringify(JSON.parse(body), null, 2);
    } catch {
      return body;
    }
  }
  return body;
}

export function contentTypeOf(headers: Record<string, string>): string {
  const key = Object.keys(headers).find((k) => k.toLowerCase() === "content-type");
  return key ? (headers[key] ?? "") : "";
}

export type ExecuteInput = {
  method: HttpMethod;
  url: string;
  headers: Record<string, string>;
  body?: string;
  bodyType?: BodyType;
  formFields?: { key: string; value: string; enabled: boolean }[];
  timeoutMs?: number;
};

export function classifyError(err: unknown): { message: string; kind: ErrorKind } {
  const name = err instanceof Error ? err.name : "";
  const message = err instanceof Error ? err.message : String(err);
  if (typeof navigator !== "undefined" && navigator.onLine === false) {
    return {
      message: "You're offline. Notes, investigations, and utilities still work. HTTP needs a network.",
      kind: "offline",
    };
  }
  if (name === "AbortError" || /aborted|AbortError/i.test(message)) {
    if (/timeout/i.test(message)) return { message: "Request timed out.", kind: "timeout" };
    return { message: "Request was cancelled.", kind: "aborted" };
  }
  if (/timed out|timeout/i.test(message)) return { message: "Request timed out.", kind: "timeout" };
  if (/Blocked destination|private|loopback|metadata/i.test(message)) {
    return { message, kind: "blocked" };
  }
  if (/ENOTFOUND|getaddrinfo|DNS|err_name_not_resolved/i.test(message)) {
    return { message: `DNS lookup failed. ${message}`, kind: "dns" };
  }
  if (/Failed to fetch|NetworkError|Load failed|CORS|Failed to load/i.test(message)) {
    return { message, kind: "cors" };
  }
  return { message, kind: "network" };
}

function headersFromResponse(res: Response): Record<string, string> {
  const headers: Record<string, string> = {};
  res.headers.forEach((value, key) => {
    headers[key] = value;
  });
  return headers;
}

function cookiesFromHeaders(headers: Record<string, string>) {
  const cookies = [];
  for (const [k, v] of Object.entries(headers)) {
    if (k.toLowerCase() !== "set-cookie") continue;
    for (const part of v.split(/,(?=[^ ;]+=)/)) {
      cookies.push(parseSetCookie(part.trim()));
    }
  }
  return cookies;
}

function clipBody(body: string): { body: string; truncated: boolean; size: number; truncatedOf?: number } {
  const size = new TextEncoder().encode(body).length;
  if (body.length > MAX_RESPONSE_CHARS) {
    return { body: body.slice(0, MAX_RESPONSE_CHARS), truncated: true, size, truncatedOf: size };
  }
  return { body, truncated: false, size };
}

function errorResponse(err: unknown, extra?: Partial<HttpResponse>): HttpResponse {
  const { message, kind } = classifyError(err);
  return {
    status: 0,
    statusText: "",
    headers: {},
    cookies: [],
    body: "",
    truncated: false,
    timeMs: extra?.timeMs ?? 0,
    size: 0,
    error: message,
    errorKind: kind,
    aborted: kind === "aborted",
    ...extra,
  };
}

function combineSignals(external: AbortSignal | undefined, timeoutMs: number): { signal: AbortSignal; dispose: () => void; timedOut: () => boolean } {
  const ctrl = new AbortController();
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    ctrl.abort(new DOMException("timeout", "AbortError"));
  }, timeoutMs);
  const onAbort = () => ctrl.abort(external?.reason ?? new DOMException("aborted", "AbortError"));
  if (external?.aborted) onAbort();
  else external?.addEventListener("abort", onAbort);
  return {
    signal: ctrl.signal,
    dispose: () => {
      clearTimeout(timer);
      external?.removeEventListener("abort", onAbort);
    },
    timedOut: () => timedOut,
  };
}

function buildDirectBody(input: ExecuteInput): { body?: BodyInit; headers: Record<string, string> } {
  const headers = { ...input.headers };
  if (input.bodyType === "form-data" && input.formFields) {
    const fd = new FormData();
    for (const f of input.formFields) {
      if (f.enabled && f.key) fd.append(f.key, f.value);
    }
    const next: Record<string, string> = {};
    for (const [k, v] of Object.entries(headers)) {
      if (k.toLowerCase() === "content-type") continue;
      next[k] = v;
    }
    return { body: fd, headers: next };
  }
  if (input.body && input.method !== "GET" && input.method !== "HEAD") {
    return { body: input.body, headers };
  }
  return { headers };
}

export async function executeDirect(input: ExecuteInput, signal?: AbortSignal): Promise<HttpResponse> {
  const started = performance.now();
  const timeoutMs = input.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const combined = combineSignals(signal, timeoutMs);
  try {
    const built = buildDirectBody(input);
    const res = await fetch(input.url, {
      method: input.method,
      headers: built.headers,
      body: input.method === "GET" || input.method === "HEAD" ? undefined : built.body,
      signal: combined.signal,
    });
    const raw = await res.text();
    const headers = headersFromResponse(res);
    const clipped = clipBody(raw);
    return {
      status: res.status,
      statusText: res.statusText,
      headers,
      cookies: cookiesFromHeaders(headers),
      timeMs: performance.now() - started,
      fromProxy: false,
      transport: "direct",
      ...clipped,
    };
  } catch (err) {
    if (combined.timedOut()) {
      return errorResponse(new Error("Request timed out."), { timeMs: performance.now() - started, transport: "direct" });
    }
    return errorResponse(err, { timeMs: performance.now() - started, transport: "direct" });
  } finally {
    combined.dispose();
  }
}

export async function executeViaProxy(input: ExecuteInput, signal?: AbortSignal): Promise<HttpResponse> {
  const started = performance.now();
  const timeoutMs = input.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const combined = combineSignals(signal, timeoutMs);
  try {
    const res = await fetch("/api/proxy", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        method: input.method,
        url: input.url,
        headers: input.headers,
        body: input.body,
        bodyType: input.bodyType,
        formFields: input.formFields,
        timeoutMs,
      }),
      signal: combined.signal,
    });
    const data = (await res.json()) as HttpResponse & { error?: string };
    if (data.error && !data.status) {
      return {
        status: data.status || 0,
        statusText: data.statusText || "",
        headers: data.headers ?? {},
        cookies: data.cookies ?? [],
        body: data.body ?? "",
        truncated: Boolean(data.truncated),
        timeMs: data.timeMs ?? performance.now() - started,
        size: data.size ?? 0,
        error: data.error,
        errorKind: data.errorKind ?? classifyError(new Error(data.error)).kind,
        fromProxy: true,
        transport: "proxy",
      };
    }
    return {
      ...data,
      timeMs: data.timeMs ?? performance.now() - started,
      fromProxy: true,
      transport: "proxy",
    };
  } catch (err) {
    if (combined.timedOut()) {
      return errorResponse(new Error("Request timed out."), { timeMs: performance.now() - started, fromProxy: true, transport: "proxy" });
    }
    return errorResponse(err, { timeMs: performance.now() - started, fromProxy: true, transport: "proxy" });
  } finally {
    combined.dispose();
  }
}

export async function executeRequest(input: ExecuteInput, signal?: AbortSignal): Promise<HttpResponse> {
  const direct = await executeDirect(input, signal);
  if (!direct.error) return direct;
  if (direct.errorKind === "aborted" || direct.errorKind === "timeout" || direct.errorKind === "offline" || direct.errorKind === "blocked") {
    return direct;
  }
  const corsLike = direct.errorKind === "cors" || direct.errorKind === "network";
  if (!corsLike) return direct;
  const proxied = await executeViaProxy(input, signal);
  if (proxied.error && direct.error) {
    return {
      ...proxied,
      error: `${direct.error}. Proxy: ${proxied.error}`,
    };
  }
  return proxied;
}

export function methodClass(method: HttpMethod): string {
  switch (method) {
    case "GET":
      return "text-method-get";
    case "POST":
      return "text-method-post";
    case "PUT":
      return "text-method-put";
    case "PATCH":
      return "text-method-patch";
    case "DELETE":
      return "text-method-delete";
    default:
      return "text-muted";
  }
}

export function encodeUrlencoded(fields: { key: string; value: string; enabled: boolean }[]): string {
  const params = new URLSearchParams();
  for (const f of fields) {
    if (f.enabled && f.key) params.append(f.key, f.value);
  }
  return params.toString();
}
