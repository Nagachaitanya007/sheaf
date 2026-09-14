import { uid } from "./ids";
import {
  HTTP_METHODS,
  type BodyType,
  type HeaderRow,
  type HttpMethod,
  type HttpResponse,
  type ParsedRequest,
  MAX_RESPONSE_CHARS,
} from "./types";

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
  while (i < lines.length && (lines[i]?.trim() === "" || lines[i]?.trim().startsWith("#") || lines[i]?.trim().startsWith("//"))) {
    i += 1;
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
  return {
    name,
    method,
    url,
    headers: headers.length ? headers : emptyHeaders(),
    body,
    bodyType: inferBodyType(headers, body),
  };
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
}): string {
  const parts = [`curl -X ${req.method}`];
  parts.push(`'${req.url.replace(/'/g, `'\\''`)}'`);
  for (const h of req.headers ?? []) {
    if (!h.enabled || !h.key.trim()) continue;
    parts.push(`-H '${h.key}: ${h.value.replace(/'/g, `'\\''`)}'`);
  }
  if (req.body?.trim() && req.method !== "GET" && req.method !== "HEAD") {
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
};

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

function clipBody(body: string): { body: string; truncated: boolean; size: number } {
  const size = new TextEncoder().encode(body).length;
  if (body.length > MAX_RESPONSE_CHARS) {
    return { body: body.slice(0, MAX_RESPONSE_CHARS), truncated: true, size };
  }
  return { body, truncated: false, size };
}

export async function executeDirect(input: ExecuteInput, signal?: AbortSignal): Promise<HttpResponse> {
  const started = performance.now();
  const init: RequestInit = {
    method: input.method,
    headers: input.headers,
    signal,
  };
  if (input.body && input.method !== "GET" && input.method !== "HEAD") {
    init.body = input.body;
  }
  const res = await fetch(input.url, init);
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
    ...clipped,
  };
}

export async function executeViaProxy(input: ExecuteInput, signal?: AbortSignal): Promise<HttpResponse> {
  const started = performance.now();
  const res = await fetch("/api/proxy", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
    signal,
  });
  const data = (await res.json()) as HttpResponse & { error?: string };
  if (!res.ok && data.error) {
    return {
      status: data.status || res.status,
      statusText: data.statusText || res.statusText,
      headers: data.headers ?? {},
      cookies: data.cookies ?? [],
      body: data.body ?? "",
      truncated: false,
      timeMs: data.timeMs ?? performance.now() - started,
      size: data.size ?? 0,
      error: data.error,
      fromProxy: true,
    };
  }
  return {
    ...data,
    timeMs: data.timeMs ?? performance.now() - started,
    fromProxy: true,
  };
}

export async function executeRequest(input: ExecuteInput, signal?: AbortSignal): Promise<HttpResponse> {
  try {
    return await executeDirect(input, signal);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const corsLike =
      message.includes("Failed to fetch") ||
      message.includes("NetworkError") ||
      message.includes("CORS") ||
      message.includes("Load failed");
    if (!corsLike) {
      return {
        status: 0,
        statusText: "",
        headers: {},
        cookies: [],
        body: "",
        truncated: false,
        timeMs: 0,
        size: 0,
        error: message,
      };
    }
    try {
      return await executeViaProxy(input, signal);
    } catch (proxyErr) {
      const proxyMessage = proxyErr instanceof Error ? proxyErr.message : String(proxyErr);
      return {
        status: 0,
        statusText: "",
        headers: {},
        cookies: [],
        body: "",
        truncated: false,
        timeMs: 0,
        size: 0,
        error: `${message}. Proxy fallback failed: ${proxyMessage}`,
      };
    }
  }
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
