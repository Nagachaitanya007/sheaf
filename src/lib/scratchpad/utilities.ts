import type { UtilityId } from "./types";

export interface UtilityMeta {
  id: UtilityId;
  name: string;
  group: "JSON" | "Encode" | "Time" | "Text" | "Crypto" | "Generate";
  hint: string;
}

export const UTILITIES: UtilityMeta[] = [
  { id: "json-format", name: "JSON formatter", group: "JSON", hint: "Pretty-print JSON" },
  { id: "json-minify", name: "JSON minifier", group: "JSON", hint: "Compact JSON" },
  { id: "json-validate", name: "JSON validator", group: "JSON", hint: "Check JSON syntax" },
  { id: "json-tree", name: "JSON tree", group: "JSON", hint: "Inspect structure" },
  { id: "json-diff", name: "JSON diff", group: "JSON", hint: "Compare two payloads" },
  { id: "json-csv", name: "JSON → CSV", group: "JSON", hint: "Flatten arrays" },
  { id: "csv-json", name: "CSV → JSON", group: "JSON", hint: "Parse CSV tables" },
  { id: "base64-encode", name: "Base64 encode", group: "Encode", hint: "UTF-8 → Base64" },
  { id: "base64-decode", name: "Base64 decode", group: "Encode", hint: "Base64 → UTF-8" },
  { id: "url-encode", name: "URL encode", group: "Encode", hint: "Percent-encode" },
  { id: "url-decode", name: "URL decode", group: "Encode", hint: "Percent-decode" },
  { id: "html-entities", name: "HTML entities", group: "Encode", hint: "Escape / unescape" },
  { id: "jwt", name: "JWT inspector", group: "Encode", hint: "Decode header + payload" },
  { id: "url-parse", name: "URL parser", group: "Encode", hint: "Break apart a URL" },
  { id: "unicode", name: "Unicode inspector", group: "Text", hint: "Code points + UTF-8" },
  { id: "regex", name: "Regex tester", group: "Text", hint: "Match and capture" },
  { id: "epoch", name: "Epoch converter", group: "Time", hint: "Unix ↔ datetime" },
  { id: "hash", name: "Hash generator", group: "Crypto", hint: "SHA-1 / 256 / 512" },
  { id: "uuid", name: "UUID generator", group: "Generate", hint: "v4 identifiers" },
  { id: "lorem", name: "Sample generator", group: "Generate", hint: "Lorem, JSON, HTTP" },
];

export function prettyJson(input: string): { ok: true; value: string } | { ok: false; error: string } {
  try {
    return { ok: true, value: JSON.stringify(JSON.parse(input), null, 2) };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

export function minifyJson(input: string): { ok: true; value: string } | { ok: false; error: string } {
  try {
    return { ok: true, value: JSON.stringify(JSON.parse(input)) };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

export function validateJson(input: string): { ok: true } | { ok: false; error: string } {
  try {
    JSON.parse(input);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

function flatten(value: unknown, prefix = "", row: Record<string, unknown> = {}): Record<string, unknown> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      flatten(v, prefix ? `${prefix}.${k}` : k, row);
    }
    return row;
  }
  if (Array.isArray(value)) {
    row[prefix || "_"] = JSON.stringify(value);
    return row;
  }
  row[prefix || "_"] = value as unknown;
  return row;
}

export function jsonToCsv(input: string): { ok: true; value: string } | { ok: false; error: string } {
  try {
    const parsed = JSON.parse(input) as unknown;
    const rows = Array.isArray(parsed) ? parsed : [parsed];
    const flat = rows.map((r) => flatten(r));
    const keys = Array.from(new Set(flat.flatMap((r) => Object.keys(r))));
    const esc = (v: unknown) => {
      const s = v == null ? "" : String(v);
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const lines = [keys.join(","), ...flat.map((r) => keys.map((k) => esc(r[k])).join(","))];
    return { ok: true, value: lines.join("\n") };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

export function csvToJson(input: string): { ok: true; value: string } | { ok: false; error: string } {
  try {
    const lines = input.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n").filter((l) => l.length);
    if (!lines.length) return { ok: true, value: "[]" };
    const parseLine = (line: string): string[] => {
      const cells: string[] = [];
      let cur = "";
      let inQuotes = false;
      for (let i = 0; i < line.length; i += 1) {
        const ch = line[i];
        if (inQuotes) {
          if (ch === '"' && line[i + 1] === '"') {
            cur += '"';
            i += 1;
          } else if (ch === '"') {
            inQuotes = false;
          } else {
            cur += ch;
          }
        } else if (ch === '"') {
          inQuotes = true;
        } else if (ch === ",") {
          cells.push(cur);
          cur = "";
        } else {
          cur += ch;
        }
      }
      cells.push(cur);
      return cells;
    };
    const header = parseLine(lines[0]!);
    const rows = lines.slice(1).map((line) => {
      const cells = parseLine(line);
      const obj: Record<string, string> = {};
      header.forEach((h, i) => {
        obj[h] = cells[i] ?? "";
      });
      return obj;
    });
    return { ok: true, value: JSON.stringify(rows, null, 2) };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

export function bytesToBase64(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let bin = "";
  bytes.forEach((b) => {
    bin += String.fromCharCode(b);
  });
  return btoa(bin);
}

export function base64ToBytes(b64: string): string {
  const cleaned = b64.replace(/\s+/g, "");
  const bin = atob(cleaned);
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function b64urlDecode(input: string): string {
  const pad = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = pad + "=".repeat((4 - (pad.length % 4)) % 4);
  return base64ToBytes(padded);
}

export function inspectJwt(token: string): {
  ok: boolean;
  header?: unknown;
  payload?: unknown;
  error?: string;
  raw: { header: string; payload: string; signature: string };
} {
  const parts = token.trim().split(".");
  if (parts.length < 2) return { ok: false, error: "JWT must have at least two segments", raw: { header: "", payload: "", signature: "" } };
  try {
    const headerStr = b64urlDecode(parts[0]!);
    const payloadStr = b64urlDecode(parts[1]!);
    return {
      ok: true,
      header: JSON.parse(headerStr),
      payload: JSON.parse(payloadStr),
      raw: { header: headerStr, payload: payloadStr, signature: parts[2] ?? "" },
    };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
      raw: { header: "", payload: "", signature: parts[2] ?? "" },
    };
  }
}

export function parseUrlParts(input: string): Record<string, string> | { error: string } {
  try {
    const u = new URL(input);
    const params: Record<string, string> = {};
    u.searchParams.forEach((v, k) => {
      params[k] = v;
    });
    return {
      href: u.href,
      protocol: u.protocol,
      username: u.username,
      password: u.password ? "••••" : "",
      host: u.host,
      hostname: u.hostname,
      port: u.port,
      pathname: u.pathname,
      search: u.search,
      hash: u.hash,
      origin: u.origin,
      query: JSON.stringify(params, null, 2),
    };
  } catch (err) {
    return { error: err instanceof Error ? err.message : String(err) };
  }
}

export function encodeHtml(input: string): string {
  const amp = "\u0026";
  return input
    .replace(/&/g, amp + "amp;")
    .replace(/</g, amp + "lt;")
    .replace(/>/g, amp + "gt;")
    .replace(/"/g, amp + "quot;")
    .replace(/'/g, amp + "#39;");
}

export function decodeHtml(input: string): string {
  const amp = "\u0026";
  return input
    .replace(new RegExp(amp + "lt;", "g"), "<")
    .replace(new RegExp(amp + "gt;", "g"), ">")
    .replace(new RegExp(amp + "quot;", "g"), '"')
    .replace(new RegExp(amp + "#39;", "g"), "'")
    .replace(new RegExp(amp + "amp;", "g"), "&");
}

export function inspectUnicode(input: string): { char: string; hex: string; dec: number; utf8: string }[] {
  const out: { char: string; hex: string; dec: number; utf8: string }[] = [];
  for (const ch of input) {
    const cp = ch.codePointAt(0) ?? 0;
    const bytes = new TextEncoder().encode(ch);
    out.push({
      char: ch,
      hex: "U+" + cp.toString(16).toUpperCase().padStart(4, "0"),
      dec: cp,
      utf8: Array.from(bytes)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join(" "),
    });
  }
  return out;
}

export async function digest(algo: "SHA-1" | "SHA-256" | "SHA-512", text: string): Promise<string> {
  const buf = await crypto.subtle.digest(algo, new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function epochToParts(value: string): { date: string; iso: string; unix: number; unixMs: number } | { error: string } {
  const trimmed = value.trim();
  if (!trimmed) {
    const d = new Date();
    return { date: d.toString(), iso: d.toISOString(), unix: Math.floor(d.getTime() / 1000), unixMs: d.getTime() };
  }
  let ms: number;
  if (/^-?\d+$/.test(trimmed)) {
    const n = Number(trimmed);
    ms = Math.abs(n) < 1e12 ? n * 1000 : n;
  } else {
    ms = Date.parse(trimmed);
  }
  if (!Number.isFinite(ms)) return { error: "Could not parse as unix timestamp or date" };
  const d = new Date(ms);
  return { date: d.toString(), iso: d.toISOString(), unix: Math.floor(d.getTime() / 1000), unixMs: d.getTime() };
}

export function testRegex(pattern: string, flags: string, text: string) {
  try {
    const re = new RegExp(pattern, flags);
    const matches: { index: number; text: string; groups: string[] }[] = [];
    if (flags.includes("g")) {
      let m: RegExpExecArray | null;
      const clone = new RegExp(pattern, flags);
      while ((m = clone.exec(text))) {
        matches.push({ index: m.index, text: m[0], groups: m.slice(1) });
        if (m[0] === "") clone.lastIndex += 1;
        if (matches.length > 200) break;
      }
    } else {
      const m = text.match(re);
      if (m && m.index != null) matches.push({ index: m.index, text: m[0], groups: m.slice(1) });
    }
    return { ok: true as const, matches, flags: re.flags };
  } catch (err) {
    return { ok: false as const, error: err instanceof Error ? err.message : String(err) };
  }
}

export function jsonDiff(aText: string, bText: string): { ok: true; lines: DiffLine[] } | { ok: false; error: string } {
  try {
    const a = JSON.stringify(JSON.parse(aText), null, 2).split("\n");
    const b = JSON.stringify(JSON.parse(bText), null, 2).split("\n");
    return { ok: true, lines: lineDiff(a, b) };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

export type DiffLine = { type: "same" | "add" | "del"; text: string };

export function lineDiff(a: string[], b: string[]): DiffLine[] {
  const n = a.length;
  const m = b.length;
  const max = 2000;
  if (n + m > max) {
    const out: DiffLine[] = [];
    const len = Math.max(n, m);
    for (let i = 0; i < len; i += 1) {
      if (a[i] === b[i]) out.push({ type: "same", text: a[i] ?? "" });
      else {
        if (i < n) out.push({ type: "del", text: a[i]! });
        if (i < m) out.push({ type: "add", text: b[i]! });
      }
    }
    return out;
  }
  const dp: number[][] = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i -= 1) {
    for (let j = m - 1; j >= 0; j -= 1) {
      dp[i]![j] = a[i] === b[j] ? (dp[i + 1]![j + 1] ?? 0) + 1 : Math.max(dp[i + 1]![j] ?? 0, dp[i]![j + 1] ?? 0);
    }
  }
  const out: DiffLine[] = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) {
      out.push({ type: "same", text: a[i]! });
      i += 1;
      j += 1;
    } else if ((dp[i + 1]![j] ?? 0) >= (dp[i]![j + 1] ?? 0)) {
      out.push({ type: "del", text: a[i]! });
      i += 1;
    } else {
      out.push({ type: "add", text: b[j]! });
      j += 1;
    }
  }
  while (i < n) {
    out.push({ type: "del", text: a[i]! });
    i += 1;
  }
  while (j < m) {
    out.push({ type: "add", text: b[j]! });
    j += 1;
  }
  return out;
}

export const SAMPLE = {
  lorem:
    "Scratch quickly. A developer workbench is most useful when the distance from thought to request is one keystroke. Keep notes next to the call, inspect the payload, transform it, and move on.",
  json: `{
  "id": 1,
  "email": "dev@local.test",
  "roles": ["reader", "editor"],
  "profile": { "name": "Ada", "timezone": "UTC" }
}`,
  http: `POST {{baseUrl}}/auth/login
Content-Type: application/json
Accept: application/json

{
  "username": "{{email}}",
  "password": "{{password}}"
}`,
  csv: `id,name,email
1,Ada Lovelace,ada@example.com
2,Grace Hopper,grace@example.com`,
};
