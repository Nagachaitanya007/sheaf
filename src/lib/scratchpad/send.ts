import { toast } from "sonner";
import { encodeUrlencoded, executeRequest, headersToRecord } from "./http";
import { uid } from "./ids";
import { applyExtractions, blockKey, parseExtractDirectives } from "./extract";
import { parseMarkdown } from "./markdown";
import { contextFromState, resolveTemplate, upsertVar } from "./variables";
import { useScratchpad } from "./store";
import type { HeaderRow, HttpMethod, HttpResponse, Item, ParsedRequest, RequestAuth } from "./types";
import { DEFAULT_TIMEOUT_MS } from "./types";

let activeAbort: AbortController | null = null;
let runToken = 0;

export function cancelSend(): void {
  activeAbort?.abort(new DOMException("aborted", "AbortError"));
}

export function isSending(): boolean {
  return useScratchpad.getState().sendState === "sending";
}

function applyAuth(headers: Record<string, string>, auth: RequestAuth | undefined, resolve: (s: string) => string): Record<string, string> {
  if (!auth || auth.type === "none") return headers;
  const next = { ...headers };
  if (auth.type === "bearer" && auth.token) {
    if (!hasHeader(next, "authorization")) next.Authorization = `Bearer ${resolve(auth.token)}`;
  } else if (auth.type === "basic") {
    const pair = `${resolve(auth.username ?? "")}:${resolve(auth.password ?? "")}`;
    if (!hasHeader(next, "authorization")) next.Authorization = `Basic ${btoa(unescape(encodeURIComponent(pair)))}`;
  } else if (auth.type === "apikey" && auth.key && auth.value) {
    const value = resolve(auth.value);
    if (auth.in === "query") return next;
    if (!hasHeader(next, auth.key)) next[auth.key] = value;
  }
  return next;
}

function applyAuthQuery(url: string, auth: RequestAuth | undefined, resolve: (s: string) => string): string {
  if (!auth || auth.type !== "apikey" || auth.in !== "query" || !auth.key) return url;
  const u = new URL(url, "https://placeholder.invalid");
  u.searchParams.set(auth.key, resolve(auth.value ?? ""));
  if (url.startsWith("http")) return u.toString();
  return `${u.pathname}${u.search}${u.hash}`;
}

function hasHeader(headers: Record<string, string>, name: string): boolean {
  const lower = name.toLowerCase();
  return Object.keys(headers).some((k) => k.toLowerCase() === lower);
}

function redactHeaders(headers: HeaderRow[], secrets: string[]): HeaderRow[] {
  const secret = new Set(secrets.map((s) => s.toLowerCase()));
  return headers.map((h) => {
    const key = h.key.toLowerCase();
    if (key === "authorization" || key === "cookie" || key.includes("secret") || key.includes("api-key") || key.includes("token")) {
      return { ...h, value: "••••" };
    }
    if (secret.has(h.value) && h.value) return { ...h, value: "••••" };
    return h;
  });
}

function redactBody(body: string | undefined, secrets: string[]): string | undefined {
  if (!body) return body;
  let out = body;
  for (const s of secrets) {
    if (s && s.length > 3) out = out.split(s).join("••••");
  }
  return out;
}

export function itemToParsed(item: Item): ParsedRequest {
  return {
    name: item.name,
    method: (item.method ?? "GET") as HttpMethod,
    url: item.url ?? "",
    headers: (item.headers ?? []) as HeaderRow[],
    body: item.body ?? "",
    bodyType: item.bodyType ?? "none",
    extracts: item.kind === "request" ? undefined : undefined,
  };
}

export interface SendOptions {
  sourceItem?: Item | null;
  blockKey?: string;
  attachToId?: string;
  signal?: AbortSignal;
  silent?: boolean;
  batch?: boolean;
}

export async function sendParsed(parsed: ParsedRequest, options: SendOptions | Item | null = null): Promise<HttpResponse | null> {
  const opts: SendOptions =
    options && "id" in options && "kind" in options ? { sourceItem: options, attachToId: options.id } : (options ?? {});
  const store = useScratchpad.getState();
  const sourceItem = opts.sourceItem ?? (opts.attachToId ? store.items.find((i) => i.id === opts.attachToId) : undefined) ?? null;
  const env = store.environments.find((e) => e.id === store.activeEnvironmentId);
  const ctx = contextFromState({ item: sourceItem, environment: env, workspace: store.workspace });
  const resolve = (text: string) => resolveTemplate(text, ctx);

  let url: string;
  try {
    url = resolve(parsed.url);
    if (sourceItem?.auth) url = applyAuthQuery(url, sourceItem.auth, resolve);
    new URL(url);
  } catch {
    const message = `Invalid URL after variables: ${parsed.url}`;
    if (!opts.silent) toast.error(message);
    store.setSendState("idle", message);
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
      errorKind: "variable",
    };
  }

  let headers = headersToRecord(parsed.headers, {});
  for (const [k, v] of Object.entries(headers)) headers[k] = resolve(v);
  headers = applyAuth(headers, sourceItem?.auth, resolve);

  let body = parsed.body ? resolve(parsed.body) : undefined;
  const formFields = sourceItem?.formFields?.map((f) => ({
    ...f,
    key: resolve(f.key),
    value: resolve(f.value),
  }));

  if (parsed.bodyType === "urlencoded" && formFields?.length) {
    body = encodeUrlencoded(formFields);
    if (!hasHeader(headers, "content-type")) headers["Content-Type"] = "application/x-www-form-urlencoded";
  } else if (sourceItem?.bodyType === "urlencoded" && formFields?.length) {
    body = encodeUrlencoded(formFields);
    if (!hasHeader(headers, "content-type")) headers["Content-Type"] = "application/x-www-form-urlencoded";
  }

  if (parsed.bodyType === "json" && body && !hasHeader(headers, "content-type")) {
    headers["Content-Type"] = "application/json";
  }

  const extracts = parsed.extracts?.length ? parsed.extracts : parseExtractDirectives(
    `${parsed.name ? `### ${parsed.name}\n` : ""}${parsed.method} ${parsed.url}\n`,
    opts.blockKey ?? blockKey(parsed, 0),
  );

  const token = ++runToken;
  if (!opts.batch) {
    activeAbort = new AbortController();
  }
  const signal = opts.signal ?? activeAbort?.signal;
  if (!opts.batch) store.setSendState("sending");

  try {
    const response = await executeRequest(
      {
        method: parsed.method,
        url,
        headers,
        body,
        bodyType: sourceItem?.bodyType ?? parsed.bodyType,
        formFields: (sourceItem?.bodyType ?? parsed.bodyType) === "form-data" ? formFields : undefined,
        timeoutMs: sourceItem?.timeoutMs ?? DEFAULT_TIMEOUT_MS,
      },
      signal,
    );

    if (token !== runToken) return response;

    const key = opts.blockKey ?? blockKey(parsed, 0);
    const applied = extracts.length ? applyExtractions(response, extracts) : [];
    if (applied.length && opts.attachToId) {
      for (const a of applied) {
        useScratchpad.getState().setExtractedVar(opts.attachToId, a.key, a.value, a.scope);
      }
    }

    const attachId = opts.attachToId ?? sourceItem?.id ?? null;
    store.setLastResponse(attachId, response);
    if (attachId && key) {
      useScratchpad.getState().setBlockResult(attachId, key, {
        ...response,
        extracted: Object.fromEntries(applied.map((a) => [a.key, a.value])),
      });
    }

    const secrets = [
      ...((env?.variables ?? []).filter((v) => v.secret).map((v) => v.value)),
      ...(sourceItem?.variables ?? []).filter((v) => v.secret).map((v) => v.value),
    ];
    store.recordHistory({
      id: uid("hist"),
      requestId: attachId ?? undefined,
      blockKey: key,
      name: parsed.name || sourceItem?.name || url,
      method: parsed.method,
      url,
      requestHeaders: redactHeaders(parsed.headers, secrets),
      requestBody: redactBody(body, secrets),
      response: { ...response, body: response.body.length > 80_000 ? response.body.slice(0, 80_000) : response.body },
      createdAt: Date.now(),
      environmentId: env?.id,
    });
    store.setSendState(opts.batch ? store.sendState : "idle", response.error ?? null);
    if (!opts.silent) {
      if (response.error) toast.error(response.error);
      else if (response.status >= 400) toast.error(`${parsed.method} ${response.status} ${response.statusText}`.trim());
    }
    return response;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (!opts.batch) store.setSendState("idle", message);
    if (!opts.silent) toast.error(message);
    return null;
  } finally {
    if (token === runToken && !opts.batch) activeAbort = null;
  }
}

export async function sendItem(item: Item) {
  return sendParsed(itemToParsed(item), { sourceItem: item, attachToId: item.id, blockKey: item.name });
}

export function documentHttpBlocks(source: string): { request: ParsedRequest; raw: string; key: string; index: number }[] {
  const blocks = parseMarkdown(source || "");
  const out: { request: ParsedRequest; raw: string; key: string; index: number }[] = [];
  let i = 0;
  for (const block of blocks) {
    if (block.type !== "http") continue;
    const key = blockKey(block.request, i);
    const extracts = parseExtractDirectives(block.raw, key);
    out.push({ request: { ...block.request, name: block.request.name ?? key, extracts }, raw: block.raw, key, index: i });
    i += 1;
  }
  return out;
}

export async function runDocument(item: Item, fromIndex = 0): Promise<void> {
  const blocks = documentHttpBlocks(item.content ?? "");
  if (!blocks.length) {
    toast.error("No executable HTTP blocks in this document.");
    return;
  }
  const store = useScratchpad.getState();
  activeAbort = new AbortController();
  store.setSendState("sending");
  toast.message(`Running ${blocks.length - fromIndex} request${blocks.length - fromIndex === 1 ? "" : "s"}…`);
  for (let i = fromIndex; i < blocks.length; i += 1) {
    if (activeAbort?.signal.aborted) break;
    const fresh = useScratchpad.getState().items.find((x) => x.id === item.id) ?? item;
    const block = blocks[i]!;
    const response = await sendParsed(block.request, {
      sourceItem: fresh,
      attachToId: item.id,
      blockKey: block.key,
      silent: true,
      batch: true,
      signal: activeAbort.signal,
    });
    if (!response) break;
    if (response.aborted || response.errorKind === "aborted") {
      toast.message("Run stopped.");
      break;
    }
    if (response.error && response.errorKind !== "http") {
      toast.error(`${block.request.method} ${block.key}: ${response.error}`);
      break;
    }
  }
  useScratchpad.getState().setSendState("idle");
  activeAbort = null;
}

export { upsertVar };
