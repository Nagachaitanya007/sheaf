import { createFileRoute } from "@tanstack/react-router";
import { HTTP_METHODS, MAX_RESPONSE_CHARS, type HttpMethod } from "@/lib/scratchpad/types";
import { parseSetCookie } from "@/lib/scratchpad/http";

type ProxyBody = {
  method?: string;
  url?: string;
  headers?: Record<string, string>;
  body?: string;
};

const BLOCKED_HOSTS = new Set([
  "localhost",
  "127.0.0.1",
  "0.0.0.0",
  "::1",
  "metadata.google.internal",
  "metadata.goog",
]);

function isPrivateHostname(hostname: string): boolean {
  const host = hostname.toLowerCase().replace(/^\[|\]$/g, "");
  if (BLOCKED_HOSTS.has(host)) return true;
  if (host.endsWith(".localhost")) return true;
  if (host === "169.254.169.254") return true;
  if (/^10\.\d+\.\d+\.\d+$/.test(host)) return true;
  if (/^192\.168\.\d+\.\d+$/.test(host)) return true;
  if (/^172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+$/.test(host)) return true;
  if (host.startsWith("fe80:") || host.startsWith("fc") || host.startsWith("fd")) return true;
  return false;
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

export const Route = createFileRoute("/api/proxy")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let payload: ProxyBody;
        try {
          payload = (await request.json()) as ProxyBody;
        } catch {
          return json({ error: "Invalid JSON body" }, 400);
        }

        const method = String(payload.method ?? "GET").toUpperCase();
        if (!(HTTP_METHODS as readonly string[]).includes(method)) {
          return json({ error: "Unsupported HTTP method" }, 400);
        }

        const urlStr = String(payload.url ?? "").trim();
        let parsed: URL;
        try {
          parsed = new URL(urlStr);
        } catch {
          return json({ error: "Invalid URL" }, 400);
        }
        if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
          return json({ error: "Only http and https URLs are allowed" }, 400);
        }
        if (isPrivateHostname(parsed.hostname)) {
          return json(
            {
              error:
                "Private and loopback hosts are blocked from the proxy. Public APIs still work. Local servers need CORS.",
            },
            400,
          );
        }

        const headers = new Headers();
        const incoming = payload.headers ?? {};
        for (const [key, value] of Object.entries(incoming)) {
          const lower = key.toLowerCase();
          if (!key.trim()) continue;
          if (lower === "host" || lower === "content-length" || lower === "connection") continue;
          headers.set(key, value);
        }

        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 30_000);
        const started = Date.now();
        try {
          const init: RequestInit = {
            method,
            headers,
            redirect: "follow",
            signal: controller.signal,
          };
          if (payload.body && method !== "GET" && method !== "HEAD") {
            init.body = payload.body;
          }
          const res = await fetch(parsed.toString(), init);
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
            if (key.toLowerCase() === "set-cookie") {
              cookies.push(parseSetCookie(value));
            }
          });
          return json({
            status: res.status,
            statusText: res.statusText,
            headers: outHeaders,
            cookies,
            body,
            truncated,
            timeMs: Date.now() - started,
            size,
            fromProxy: true,
          });
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
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
              error: message === "The operation was aborted." ? "Request timed out after 30s" : message,
              fromProxy: true,
            },
            200,
          );
        } finally {
          clearTimeout(timer);
        }
      },
    },
  },
});

export type { HttpMethod };
