import assert from "node:assert/strict";
import { test } from "node:test";
import { readAppearance } from "./appearance.ts";
import { highlight, highlightHttp, highlightJson } from "./highlight.ts";
import { exportHttpBundle, isPortable, toPortable } from "./import-export.ts";
import { detectImport, importAny, importBruno, importPostman } from "./importers.ts";
import { parseHttpFile, parseSingleRequest, rewriteHttpRaw, serializeHttp } from "./http.ts";
import { appendHttpFence, parseMarkdown, replaceHttpSpan } from "./markdown.ts";
import { countSecrets, payloadHasSecretKeys, stripSecrets } from "./secrets.ts";
import { applySlash, detectSlash, filterSlash, HTTP_SNIPPET, requestCommand } from "./slash.ts";
import { decideSyncPush, looksOffline } from "./sync-core.ts";
import { formatSyncTime } from "./sync-prefs.ts";
import type { PersistSnapshot } from "./types.ts";

test("slash does not activate inside URLs or paths", () => {
  assert.equal(detectSlash("https://api.example.com/v1", 25), null);
  assert.equal(detectSlash("see foo/bar for details", 11), null);
  assert.equal(detectSlash("GET https://x.test/\n", 19), null);
  const mid = "hello /http";
  assert.equal(detectSlash(mid, mid.length), null);
  assert.equal(detectSlash("hello\n/http", "hello\n/http".length)?.query, "http");
  assert.deepEqual(detectSlash("/ht", 3), { from: 0, query: "ht" });
  assert.deepEqual(detectSlash("  /json", 7), { from: 2, query: "json" });
  assert.equal(detectSlash("/http extra", "/http extra".length), null);
});

test("slash menu filters to HTTP Request for /ht", () => {
  const hits = filterSlash("ht");
  assert.equal(hits[0]?.id, "http");
  assert.ok(hits.some((h) => h.id === "http"));
});

test("slash insert HTTP block replaces the /query token", () => {
  const src = "# Auth\n\n/http";
  const hit = detectSlash(src, src.length);
  assert.ok(hit);
  const next = applySlash(src, hit.from, src.length, HTTP_SNIPPET, "```http\nGET ".length);
  assert.match(next.text, /```http\nGET https:\/\/api\.example\.com\//);
  assert.equal(next.text.includes("/http"), false);
  const parsed = parseSingleRequest(HTTP_SNIPPET.replace(/```http\n/, "").replace(/```\n/, ""));
  assert.ok(parsed);
  assert.equal(parsed.method, "GET");
});

test("saved request slash command inserts executable HTTP", () => {
  const cmd = requestCommand("abc", "Login", "POST https://x.test/login\n");
  assert.equal(cmd.kind, "http");
  assert.match(cmd.insert, /```http\nPOST https:\/\/x.test\/login/);
  const hits = filterSlash("log", [cmd]);
  assert.ok(hits.some((h) => h.id === "req:abc"));
});

test("syntax highlighting distinguishes JSON keys, strings, numbers, booleans, null", () => {
  const tokens = highlightJson('{"ok": true, "n": 3, "s": "hi", "z": null}');
  const kinds = Object.fromEntries(tokens.filter((t) => t.text.trim()).map((t) => [t.text, t.kind]));
  assert.equal(kinds['"ok"'], "key");
  assert.equal(kinds['"n"'], "key");
  assert.equal(kinds["true"], "boolean");
  assert.equal(kinds["3"], "number");
  assert.equal(kinds['"hi"'], "string");
  assert.equal(kinds["null"], "null");
  assert.ok(tokens.some((t) => t.kind === "punct"));
});

test("HTTP highlighting marks method, headers, comments, and JSON body", () => {
  const tokens = highlightHttp("### Login\nPOST https://x.test/login\nAuthorization: Bearer {{token}}\n\n{\"a\":1}");
  assert.ok(tokens.some((t) => t.kind === "method" && t.text === "POST"));
  assert.ok(tokens.some((t) => t.kind === "header" && t.text.includes("Authorization")));
  assert.ok(tokens.some((t) => t.kind === "variable" && t.text.includes("token")));
  assert.ok(tokens.some((t) => t.kind === "key"));
  assert.ok(tokens.some((t) => t.kind === "number"));
});

test("JS and Python highlighters mark keywords", () => {
  const js = highlight("const x = await fetch(url);", "typescript");
  assert.ok(js.some((t) => t.kind === "keyword" && t.text === "const"));
  assert.ok(js.some((t) => t.kind === "keyword" && t.text === "await"));
  const py = highlight("def run():\n  return True", "python");
  assert.ok(py.some((t) => t.kind === "keyword" && t.text === "def"));
  assert.ok(py.some((t) => t.kind === "keyword" && t.text === "return"));
});

const snapshot = (): PersistSnapshot => ({
  version: 1,
  workspace: { id: "w", name: "Lab", createdAt: 1, updatedAt: 1 },
  collections: [{ id: "c", workspaceId: "w", name: "API", description: "", order: 0, createdAt: 1, updatedAt: 1 }],
  items: [
    {
      id: "req1",
      collectionId: "c",
      parentId: null,
      kind: "request",
      name: "Login",
      order: 0,
      tags: [],
      createdAt: 1,
      updatedAt: 1,
      method: "POST",
      url: "{{baseUrl}}/login",
      headers: [{ id: "h1", key: "Authorization", value: "Bearer secret-token", enabled: true }],
      body: '{"password":"hunter2"}',
      bodyType: "json",
      auth: { type: "bearer", token: "secret-token" },
    },
    {
      id: "inv1",
      collectionId: "c",
      parentId: null,
      kind: "investigation",
      name: "Auth probe",
      order: 1,
      tags: ["investigation"],
      createdAt: 1,
      updatedAt: 1,
      content: "# Auth\n\n```http\nGET {{baseUrl}}/me\nAuthorization: Bearer abc\n```\n",
      variables: [{ id: "v1", key: "token", value: "abc", secret: true }],
    },
  ],
  environments: [
    {
      id: "e",
      workspaceId: "w",
      name: "Local",
      variables: [
        { id: "v", key: "baseUrl", value: "https://x.test" },
        { id: "s", key: "apiKey", value: "sk-live", secret: true },
        { id: "p", key: "password", value: "nope", secret: true },
      ],
      createdAt: 1,
      updatedAt: 1,
    },
  ],
  history: [],
  activeWorkspaceId: "w",
  activeEnvironmentId: "e",
  activeItemId: "inv1",
  openTabIds: ["inv1"],
  collapsedIds: [],
  activeUtility: null,
});

test("workspace serialization round-trips investigations and requests", () => {
  const portable = toPortable(snapshot());
  assert.equal(isPortable(portable), true);
  assert.equal(portable.format, "sheaf/v1");
  assert.ok(portable.collections[0]?.items.some((i) => i.kind === "investigation" && i.content?.includes("```http")));
  assert.ok(portable.collections[0]?.items.some((i) => i.kind === "request" && i.method === "POST"));
});

test("secrets are counted and stripped from export and sync payloads", () => {
  const portable = toPortable(snapshot());
  assert.ok(countSecrets(portable) >= 3);
  const clean = stripSecrets(portable);
  assert.equal(countSecrets(clean), 0);
  const json = JSON.stringify(clean);
  assert.equal(payloadHasSecretKeys(json), false);
  assert.doesNotMatch(json, /sk-live/);
  assert.doesNotMatch(json, /secret-token/);
  assert.doesNotMatch(json, /hunter2/);
  assert.match(json, /baseUrl/);
  assert.match(json, /\[redacted\]/);
});

test(".http parse and import", () => {
  const src = `### One\nGET https://example.com/a\nAccept: application/json\n\n### Two\nPOST https://example.com/b\nContent-Type: application/json\n\n{"ok":true}\n`;
  const parsed = parseHttpFile(src);
  assert.equal(parsed.length, 2);
  assert.equal(parsed[0]?.method, "GET");
  assert.equal(parsed[1]?.method, "POST");
  assert.equal(detectImport(src, "api.http"), "http");
  const imported = importAny(src, "api.http");
  assert.equal(imported.kind, "http");
  assert.equal(imported.portable?.collections[0]?.items.length, 2);
  const snap = snapshot();
  const bundle = exportHttpBundle(snap);
  assert.match(bundle, /POST \{\{baseUrl\}\}\/login/);
});

test("Postman Collection v2 import", () => {
  const raw = {
    info: { name: "Demo", schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json" },
    item: [
      {
        name: "List",
        request: {
          method: "GET",
          url: "https://api.example.com/items",
          header: [{ key: "Accept", value: "application/json" }],
        },
      },
    ],
  };
  const portable = importPostman(raw);
  assert.equal(portable.workspace.name, "Demo");
  assert.equal(portable.collections[0]?.items[0]?.method, "GET");
  assert.equal(detectImport(JSON.stringify(raw), "col.json"), "postman");
});

test("Bruno .bru import", () => {
  const bru = `meta {\n  name: Ping\n}\nget {\n  url: https://example.com/ping\n}\nheaders {\n  Accept: application/json\n}\n`;
  assert.equal(detectImport(bru, "ping.bru"), "bruno");
  const reqs = importBruno(bru);
  assert.equal(reqs[0]?.method, "GET");
  assert.equal(reqs[0]?.url, "https://example.com/ping");
});

test("Sheaf JSON import is detected", () => {
  const portable = toPortable(snapshot());
  assert.equal(detectImport(JSON.stringify(portable), "sheaf.json"), "sheaf-json");
  const result = importAny(JSON.stringify(portable), "workspace.json");
  assert.equal(result.kind, "sheaf-json");
  assert.equal(result.portable?.workspace.name, "Lab");
});

test("sync conflict when local revision is behind, force overwrites", () => {
  assert.equal(decideSyncPush(0, null, false).action, "insert");
  assert.equal(decideSyncPush(1, 3, false).action, "conflict");
  assert.equal(decideSyncPush(3, 3, false).action, "update");
  assert.equal(decideSyncPush(1, 3, true).action, "update");
  const forced = decideSyncPush(1, 3, true);
  assert.equal(forced.action, "update");
  if (forced.action === "update") assert.equal(forced.next, 4);
});

test("offline mode is detected from flag and network-ish errors", () => {
  assert.equal(looksOffline(false, null), true);
  assert.equal(looksOffline(true, null), false);
  assert.equal(looksOffline(true, "Failed to fetch"), true);
  assert.equal(looksOffline(true, "conflict"), false);
  assert.match(formatSyncTime(Date.now()), /just now|less than a minute|Synced/);
});

test("theme persistence writes sheaf/appearance", () => {
  const store: Record<string, string> = {};
  const ls = {
    getItem: (k: string) => store[k] ?? null,
    setItem: (k: string, v: string) => {
      store[k] = v;
    },
    removeItem: (k: string) => {
      delete store[k];
    },
    clear: () => {
      for (const k of Object.keys(store)) delete store[k];
    },
    key: () => null,
    length: 0,
  } as unknown as Storage;
  globalThis.localStorage = ls;
  store["sheaf/appearance"] = "dark";
  assert.equal(readAppearance(), "dark");
  store["sheaf/appearance"] = "light";
  assert.equal(readAppearance(), "light");
});

test("serializeHttp round-trip keeps method and url", () => {
  const http = serializeHttp({
    name: "Ping",
    method: "GET",
    url: "https://example.com",
    headers: [{ id: "h", key: "Accept", value: "application/json", enabled: true }],
    body: "",
  });
  const parsed = parseSingleRequest(http);
  assert.equal(parsed?.method, "GET");
  assert.equal(parsed?.url, "https://example.com");
});

test("HTTP URL highlighting marks variables and the rest of the URL", () => {
  const tokens = highlightHttp("GET https://x.test/{{id}}/items");
  assert.ok(tokens.some((t) => t.kind === "url" && t.text.includes("https://x.test/")));
  assert.ok(tokens.some((t) => t.kind === "variable" && t.text.includes("id")));
});

test("SQL, bash, CSS, HTML, and markdown highlighters mark structure", () => {
  const sql = highlight("SELECT * FROM users WHERE id = 1", "sql");
  assert.ok(sql.some((t) => t.kind === "keyword" && t.text.toLowerCase() === "select"));
  const sh = highlight("if true; then echo hi; fi", "bash");
  assert.ok(sh.some((t) => t.kind === "keyword" && t.text === "if"));
  const css = highlight("body { color: red; /* x */ }", "css");
  assert.ok(css.length > 1);
  const html = highlight('<div class="x">hi</div>', "html");
  assert.ok(html.some((t) => t.kind === "keyword"));
  const md = highlight("# Title\n> quote", "markdown");
  assert.ok(md.some((t) => t.kind === "keyword"));
});

test("investigation HTTP block rewrite preserves extract directives", () => {
  const raw = '### Login\nPOST https://x.test/login\nContent-Type: application/json\n# @extract token=$.accessToken\n\n{"a":1}\n';
  const next = rewriteHttpRaw(raw, { url: "https://x.test/auth" });
  assert.match(next, /POST https:\/\/x.test\/auth/);
  assert.match(next, /@extract token=\$\.accessToken/);
});

test("replaceHttpSpan updates the nth fenced request and keeps surrounding markdown", () => {
  const src = "# Auth\n\n```http\nGET https://x.test/a\n```\n\nNotes here.\n";
  const blocks = parseMarkdown(src);
  const http = blocks.find((b) => b.type === "http");
  assert.ok(http && http.type === "http");
  const next = replaceHttpSpan(src, http.start, http.end, "POST https://x.test/b\n");
  assert.match(next, /POST https:\/\/x.test\/b/);
  assert.match(next, /Notes here/);
  assert.equal(parseMarkdown(next).filter((b) => b.type === "http").length, 1);
});

test("appendHttpFence keeps HTTP executable after re-import", () => {
  const next = appendHttpFence("# Probe\n", "GET https://example.com/ping\n");
  const http = parseMarkdown(next).find((b) => b.type === "http");
  assert.ok(http && http.type === "http");
  assert.equal(http.request.method, "GET");
  assert.equal(http.request.url, "https://example.com/ping");
});
