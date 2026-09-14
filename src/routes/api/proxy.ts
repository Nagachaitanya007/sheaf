import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import { createFileRoute } from "@tanstack/react-router";
import { HTTP_METHODS, MAX_RESPONSE_CHARS, type HttpMethod } from "@/lib/scratchpad/types";
import { parseSetCookie } from "@/lib/scratchpad/http";
import { blockedReason, isBlockedHostname, isPrivateIp, normalizeHostname } from "@/lib/scratchpad/ssrf";

type ProxyBody = {
  method?: string;
  url?: string;
  headers?: Record<string, string>;
  body?: string;
  bodyType?: string;
  formFields?: { key: string; value: string; enabled?: boolean }[];
  timeoutMs?: number;
};

const MAX_REDIRECTS = 5;
const MAX_TIMEOUT = 60_000;

async function assertPublicUrl(urlStr: string): Promise<URL> {
  let parsed: URL;
  try {
    parsed = new URL(urlStr);
  } catch {
    throw new Error("Invalid URL");
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("Only http and https URLs are allowed");
  }
  const host = normalizeHostname(parsed.hostname);
  if (isBlockedHostname(host)) {
    throw new Error(blockedReason(host));
  }
  if (isIP(host)) {
    if (isPrivateIp(host)) throw new Error(blockedReason(host));
    return parsed;
  }
  let records: { address: string; family: number }[] = [];
  try {
    records = await lookup(host, { all: true });
  } catch {
    throw new Error(`DNS lookup failed for ${host}`);
  }
  if (!records.length) throw new Error(`DNS lookup failed for ${host}`);
  for (const rec of records) {
    if (isPrivateIp(rec.address)) throw new Error(blockedReason(host, rec.address));
  }
  return parsed;
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

function buildHeaders(incoming: Record<string, string>, bodyType?: string): Headers {
  const headers = new Headers();
  for (const [key, value] of Object.entries(incoming)) {
    const lower = key.toLowerCase();
    if (!key.trim()) continue;
    if (lower === "host" || lower === "content-length" || lower === "connection" || lower === "transfer-encoding") continue;
    if (bodyType === "form-data" && lower === "content-type") continue;
    headers.set(key, value);
  }
  return headers;
}

function buildBody(payload: ProxyBody, method: string): BodyInit | undefined {
  if (method === "GET" || method === "HEAD") return undefined;
  if (payload.bodyType === "form-data") {
    const fd = new FormData();
    for (const f of payload.formFields ?? []) {
      if (f.enabled === false || !f.key) continue;
      fd.append(f.key, f.value);
    }
    return fd;
  }
  return payload.body || undefined;
}

export const Route = createFileRoute("/api/proxy")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let payload: ProxyBody;
        try {
          payload = (await request.json()) as ProxyBody;
        } catch {
          return json({ error: "Invalid JSON body", errorKind: "parse" }, 400);
        }

        const method = String(payload.method ?? "GET").toUpperCase();
        if (!(HTTP_METHODS as readonly string[]).includes(method)) {
          return json({ error: "Unsupported HTTP method", errorKind: "parse" }, 400);
        }

        let current: URL;
        try {
          current = await assertPublicUrl(String(payload.url ?? "").trim());
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          return json({ error: message, errorKind: /DNS/i.test(message) ? "dns" : "blocked", status: 0 }, 400);
        }

        const timeoutMs = Math.min(Math.max(Number(payload.timeoutMs) || 30_000, 1_000), MAX_TIMEOUT);
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeoutMs);
        const started = Date.now();

        try {
          let res: Response | null = null;
          for (let hop = 0; hop <= MAX_REDIRECTS; hop += 1) {
            const headers = buildHeaders(payload.headers ?? {}, payload.bodyType);
            const init: RequestInit = {
              method: hop === 0 ? method : method === "POST" || method === "PUT" || method === "PATCH" ? "GET" : method,
              headers,
              redirect: "manual",
              signal: controller.signal,
            };
            if (hop === 0) init.body = buildBody(payload, method);
            res = await fetch(current.toString(), init);
            const loc = res.headers.get("location");
            if (res.status >= 300 && res.status < 400 && loc) {
              let next: URL;
              try {
                next = new URL(loc, current);
              } catch {
                throw new Error(`Invalid redirect location: ${loc}`);
              }
              current = await assertPublicUrl(next.toString());
              continue;
            }
            break;
          }
          if (!res) throw new Error("Empty proxy response");

          const buf = new Uint8Array(await res.arrayBuffer());
          const size = buf.byteLength;
          let truncated = false;
          let slice = buf;
          if (size > MAX_RESPONSE_CHARS) {
            slice = buf.slice(0, MAX_RESPONSE_CHARS);
            truncated = true;
          }
          const body = new TextDecoder("utf-8", { fatal: false }).decode(slice);
          const outHeaders: Record<string, string> = {};
          const cookies: { name: string; value: string; raw: string }[] = [];
          res.headers.forEach((value, key) => {
            outHeaders[key] = value;
            if (key.toLowerCase() === "set-cookie") cookies.push(parseSetCookie(value));
          });
          return json({
            status: res.status,
            statusText: res.statusText,
            headers: outHeaders,
            cookies,
            body,
            truncated,
            truncatedOf: truncated ? size : undefined,
            timeMs: Date.now() - started,
            size,
            fromProxy: true,
            transport: "proxy",
          });
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          const timedOut = controller.signal.aborted && Date.now() - started >= timeoutMs - 20;
          const blocked = /Blocked destination|Only http|Invalid URL|Invalid redirect/i.test(message);
          return json(
            {
              status: 0,
              statusText: "",
              headers: {},
              cookies: [],
              body: "",
              truncated: false,
              timeMs: Date.now() - started,
              size: 0,
              error: timedOut ? `Request timed out after ${Math.round(timeoutMs / 1000)}s` : message,
              errorKind: timedOut ? "timeout" : blocked ? "blocked" : /DNS/i.test(message) ? "dns" : "network",
              fromProxy: true,
              transport: "proxy",
            },
            blocked ? 400 : 200,
          );
        } finally {
          clearTimeout(timer);
        }
      },
    },
  },
});

export type { HttpMethod };
