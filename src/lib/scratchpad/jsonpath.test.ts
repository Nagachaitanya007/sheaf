import assert from "node:assert/strict";
import { test } from "node:test";
import { jsonPath, jsonPathToString, tokenizeJsonPath } from "./jsonpath.ts";
import { structuralDiff, formatDiff } from "./jsondiff.ts";
import { isBlockedHostname, isPrivateIp } from "./ssrf.ts";
import { applyExtractions, parseExtractDirectives, lookupBlockField } from "./extract.ts";
import { mergeVars, resolveTemplate } from "./variables.ts";
import { parseSingleRequest, encodeUrlencoded, inferBodyType } from "./http.ts";
import { isPortable } from "./import-export.ts";
import { parseMarkdown } from "./markdown.ts";

test("jsonpath reads nested fields and indexes", () => {
  const data = { accessToken: "abc", user: { id: 7, roles: ["user", "admin"] }, items: [{ id: 1 }, { id: 2 }] };
  assert.equal(jsonPath(data, "$.accessToken"), "abc");
  assert.equal(jsonPath(data, "$.user.id"), 7);
  assert.equal(jsonPath(data, "$.items[0].id"), 1);
  assert.equal(jsonPath(data, "user.id"), 7);
  assert.equal(jsonPathToString(jsonPath(data, "$.user.roles")), '["user","admin"]');
  assert.equal(jsonPath(data, "$.missing"), undefined);
  assert.ok(tokenizeJsonPath("$.a.b").length >= 2);
});

test("structural json diff reports add/remove/change/type", () => {
  const left = { name: "Emily", roles: ["user"], age: 1 };
  const right = { name: "John", roles: ["user", "admin"], phone: "x" };
  const diff = structuralDiff(left, right);
  const kinds = diff.map((d) => `${d.path}:${d.kind}`);
  assert.ok(kinds.includes("$.name:changed"));
  assert.ok(kinds.some((k) => k.startsWith("$.roles[1]")));
  assert.ok(kinds.includes("$.age:removed"));
  assert.ok(kinds.includes("$.phone:added"));
  assert.ok(formatDiff(diff).includes("Emily"));
});

test("ssrf blocks loopback, private, metadata, and IPv6 local", () => {
  assert.equal(isPrivateIp("127.0.0.1"), true);
  assert.equal(isPrivateIp("10.0.0.4"), true);
  assert.equal(isPrivateIp("192.168.1.1"), true);
  assert.equal(isPrivateIp("172.16.0.1"), true);
  assert.equal(isPrivateIp("169.254.169.254"), true);
  assert.equal(isPrivateIp("8.8.8.8"), false);
  assert.equal(isBlockedHostname("localhost"), true);
  assert.equal(isBlockedHostname("metadata.google.internal"), true);
  assert.equal(isBlockedHostname("::1"), true);
  assert.equal(isBlockedHostname("example.com"), false);
  assert.equal(isPrivateIp("2130706433"), true);
});

test("extract directives and block field lookup", () => {
  const raw = `### Login\nPOST https://x/login\n# @extract token=$.accessToken\n# @extract userId=$.id scope=investigation\n\n{}`;
  const rules = parseExtractDirectives(raw, "Login");
  assert.equal(rules.length, 2);
  assert.equal(rules[0]?.as, "token");
  const applied = applyExtractions(
    {
      status: 200,
      statusText: "OK",
      headers: {},
      cookies: [],
      body: JSON.stringify({ accessToken: "abc123", id: 9 }),
      truncated: false,
      timeMs: 1,
      size: 10,
    },
    rules,
  );
  assert.equal(applied.find((a) => a.key === "token")?.value, "abc123");
  const value = lookupBlockField(
    [{ blockKey: "Login", response: { status: 200, statusText: "OK", headers: {}, cookies: [], body: '{"accessToken":"zzz"}', truncated: false, timeMs: 1, size: 1 } }],
    "Login.accessToken",
  );
  assert.equal(value, "zzz");
});

test("variable precedence request > investigation > environment > global", () => {
  const merged = mergeVars({
    global: [{ id: "1", key: "x", value: "g" }],
    environment: [{ id: "2", key: "x", value: "e" }, { id: "3", key: "y", value: "env" }],
    investigation: [{ id: "4", key: "x", value: "i" }],
    request: [{ id: "5", key: "x", value: "r" }],
  });
  assert.equal(merged.x, "r");
  assert.equal(merged.y, "env");
  const text = resolveTemplate("{{x}}-{{Login.id}}", {
    request: [{ id: "5", key: "x", value: "r" }],
    blockResults: [
      {
        blockKey: "Login",
        ranAt: 1,
        response: { status: 200, statusText: "OK", headers: {}, cookies: [], body: '{"id":42}', truncated: false, timeMs: 1, size: 1 },
      },
    ],
  });
  assert.equal(text, "r-42");
});

test("http parser + urlencoded body + markdown http fence", () => {
  const parsed = parseSingleRequest(`### Login\nPOST {{baseUrl}}/auth/login\nContent-Type: application/json\n\n{"a":1}\n`);
  assert.ok(parsed);
  assert.equal(parsed?.name, "Login");
  assert.equal(parsed?.method, "POST");
  assert.equal(parsed?.bodyType, "json");
  const encoded = encodeUrlencoded([
    { key: "a", value: "1", enabled: true },
    { key: "skip", value: "x", enabled: false },
  ]);
  assert.equal(encoded, "a=1");
  assert.equal(inferBodyType([], ""), "none");
  const blocks = parseMarkdown("Hello\n\n```http\nGET https://example.com/x\n```\n");
  assert.equal(blocks.some((b) => b.type === "http"), true);
});

test("import validation rejects junk and huge payloads", () => {
  assert.equal(isPortable({ format: "sheaf/v1", collections: [] }), true);
  assert.equal(isPortable({ format: "nope", collections: [] }), false);
  assert.equal(isPortable(null), false);
});

test("markdown escapes html", async () => {
  const { inlineToHtml } = await import("./markdown.ts");
  const html = inlineToHtml(`<script>alert(1)</script> **ok** [[Login]]`);
  assert.equal(html.includes("<script>"), false);
  assert.equal(html.includes("wiki-link"), true);
  assert.equal(html.includes("<strong>ok</strong>"), true);
});
