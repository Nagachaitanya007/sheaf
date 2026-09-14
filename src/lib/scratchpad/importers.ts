import { parseHttpFile, parseSingleRequest, serializeHttp } from "./http.ts";
import { isPortable, type PortableWorkspace } from "./import-export.ts";
import type { HttpMethod, ItemKind } from "./types.ts";
import { HTTP_METHODS } from "./types.ts";

export type ImportKind = "sheaf-json" | "http" | "postman" | "bruno";

export interface ImportResult {
  kind: ImportKind;
  portable?: PortableWorkspace;
  requests?: ReturnType<typeof parseHttpFile>;
  name: string;
}

export function detectImport(text: string, filename = ""): ImportKind | null {
  const lower = filename.toLowerCase();
  if (lower.endsWith(".http") || lower.endsWith(".rest")) return "http";
  if (lower.endsWith(".bru")) return "bruno";
  const trimmed = text.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    try {
      const json = JSON.parse(trimmed) as Record<string, unknown>;
      if (isPortable(json)) return "sheaf-json";
      if (json.info && (json.item || json.requests)) return "postman";
    } catch {
      /* fall through */
    }
  }
  if (/^meta\s*\{/m.test(text) && /\b(get|post|put|patch|delete|head)\s*\{/m.test(text)) return "bruno";
  if (/^(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)\s+\S+/m.test(text) || /^\s*###/m.test(text)) return "http";
  return null;
}

export function importAny(text: string, filename = ""): ImportResult {
  const kind = detectImport(text, filename);
  if (!kind) throw new Error("Unrecognized file. Use Sheaf JSON, a .http file, Postman Collection v2, or a Bruno .bru file.");
  if (kind === "sheaf-json") {
    const json = JSON.parse(text) as unknown;
    if (!isPortable(json)) throw new Error("Not a Sheaf workspace");
    return { kind, portable: json, name: json.workspace.name };
  }
  if (kind === "http") {
    const requests = parseHttpFile(text);
    if (!requests.length) throw new Error("No HTTP requests found");
    return { kind, requests, portable: requestsToPortable(requests, filename || "Imported HTTP"), name: "Imported HTTP" };
  }
  if (kind === "postman") {
    const portable = importPostman(JSON.parse(text) as unknown);
    return { kind, portable, name: portable.workspace.name };
  }
  const requests = importBruno(text);
  if (!requests.length) throw new Error("No Bruno requests found");
  return { kind, requests, portable: requestsToPortable(requests, filename || "Bruno"), name: "Bruno import" };
}

function requestsToPortable(requests: ReturnType<typeof parseHttpFile>, name: string): PortableWorkspace {
  return {
    format: "sheaf/v1",
    exportedAt: new Date().toISOString(),
    workspace: { name },
    collections: [
      {
        name,
        description: "Imported requests",
        order: 0,
        items: requests.map((r, i) => ({
          name: r.name || `${r.method} ${r.url}`.slice(0, 80),
          kind: "request" as ItemKind,
          parentPath: [],
          order: i,
          tags: [],
          method: r.method,
          url: r.url,
          headers: r.headers.map(({ key, value, enabled }) => ({ key, value, enabled })),
          bodyType: r.bodyType,
          body: r.body,
        })),
      },
    ],
    environments: [],
  };
}

function isMethod(value: string): value is HttpMethod {
  return (HTTP_METHODS as readonly string[]).includes(value.toUpperCase());
}

export function importPostman(raw: unknown): PortableWorkspace {
  if (!raw || typeof raw !== "object") throw new Error("Invalid Postman collection");
  const root = raw as {
    info?: { name?: string; schema?: string };
    item?: unknown[];
    variable?: { key?: string; value?: string }[];
  };
  const name = root.info?.name || "Postman collection";
  const items: PortableWorkspace["collections"][0]["items"] = [];

  function walk(nodes: unknown[] | undefined, path: string[]) {
    for (const node of nodes ?? []) {
      if (!node || typeof node !== "object") continue;
      const n = node as { name?: string; item?: unknown[]; request?: unknown };
      if (Array.isArray(n.item)) {
        walk(n.item, [...path, n.name || "Folder"]);
        continue;
      }
      const req = n.request;
      if (!req) continue;
      const parsed = postmanRequest(n.name || "Request", req);
      if (!parsed) continue;
      items.push({
        ...parsed,
        parentPath: path,
        order: items.length,
        tags: ["postman"],
      });
    }
  }

  walk(root.item, []);
  if (!items.length) throw new Error("No Postman requests found");

  return {
    format: "sheaf/v1",
    exportedAt: new Date().toISOString(),
    workspace: { name },
    collections: [{ name, description: "Imported from Postman", order: 0, items }],
    environments: root.variable
      ? [
          {
            name: "Postman",
            variables: (root.variable ?? [])
              .filter((v) => v.key)
              .map((v) => ({ key: String(v.key), value: String(v.value ?? "") })),
          },
        ]
      : [],
  };
}

function postmanRequest(name: string, request: unknown): PortableWorkspace["collections"][0]["items"][0] | null {
  if (typeof request === "string") {
    const parsed = parseSingleRequest(`GET ${request}`);
    if (!parsed) return null;
    return {
      name,
      kind: "request",
      parentPath: [],
      order: 0,
      tags: [],
      method: parsed.method,
      url: parsed.url,
    };
  }
  if (!request || typeof request !== "object") return null;
  const r = request as {
    method?: string;
    url?: string | { raw?: string };
    header?: { key?: string; value?: string; disabled?: boolean }[];
    body?: { mode?: string; raw?: string; urlencoded?: { key?: string; value?: string }[] };
  };
  const method = (r.method || "GET").toUpperCase();
  if (!isMethod(method)) return null;
  const url = typeof r.url === "string" ? r.url : r.url?.raw || "";
  const headers = (r.header ?? [])
    .filter((h) => h.key)
    .map((h) => ({ key: String(h.key), value: String(h.value ?? ""), enabled: !h.disabled }));
  let body = "";
  let bodyType: "json" | "raw" | "urlencoded" | "none" = "none";
  if (r.body?.mode === "raw" && r.body.raw) {
    body = r.body.raw;
    bodyType = body.trim().startsWith("{") ? "json" : "raw";
  } else if (r.body?.mode === "urlencoded") {
    body = (r.body.urlencoded ?? []).map((p) => `${p.key}=${p.value ?? ""}`).join("&");
    bodyType = "urlencoded";
  }
  return {
    name,
    kind: "request",
    parentPath: [],
    order: 0,
    tags: [],
    method,
    url,
    headers,
    body,
    bodyType,
  };
}

export function importBruno(source: string): ReturnType<typeof parseHttpFile> {
  const blocks = source.split(/^\s*meta\s*\{/m).filter(Boolean);
  const requests: ReturnType<typeof parseHttpFile> = [];
  for (const block of blocks) {
    const name = block.match(/name:\s*(.+)/)?.[1]?.trim();
    const methodMatch = block.match(/\b(get|post|put|patch|delete|head|options)\s*\{/i);
    if (!methodMatch) continue;
    const method = methodMatch[1]!.toUpperCase() as HttpMethod;
    const section = sliceSection(block, methodMatch[1]!);
    const url = section.match(/url:\s*(.+)/)?.[1]?.trim() || "";
    if (!url) continue;
    const headersBlock = sliceSection(block, "headers");
    const headers = (headersBlock.match(/^[ \t]*([A-Za-z0-9-]+):\s*(.+)$/gm) ?? []).map((line) => {
      const [k, ...rest] = line.split(":");
      return { key: (k ?? "").trim(), value: rest.join(":").trim(), enabled: true };
    });
    let body = "";
    const jsonBody = sliceSection(block, "body:json") || sliceSection(block, "body");
    if (jsonBody) body = jsonBody.replace(/^\s*body(?::json)?\s*\{/, "").replace(/\}\s*$/, "").trim();
    const http = serializeHttp({ name, method, url, headers: headers.map((h, i) => ({ id: `h${i}`, ...h })), body });
    const parsed = parseSingleRequest(http);
    if (parsed) requests.push(parsed);
  }
  return requests;
}

function sliceSection(source: string, name: string): string {
  const re = new RegExp(`${name}\\s*\\{`, "i");
  const m = re.exec(source);
  if (!m || m.index == null) return "";
  let depth = 0;
  for (let i = m.index; i < source.length; i += 1) {
    if (source[i] === "{") depth += 1;
    if (source[i] === "}") {
      depth -= 1;
      if (depth === 0) return source.slice(m.index, i + 1);
    }
  }
  return "";
}
