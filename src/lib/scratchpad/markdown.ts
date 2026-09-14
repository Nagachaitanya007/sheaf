import { parseSingleRequest } from "./http.ts";
import type { ParsedRequest } from "./types.ts";

export type MdBlock =
  | { type: "heading"; level: number; text: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; ordered: boolean; items: { text: string; checked?: boolean }[] }
  | { type: "code"; lang: string; code: string }
  | { type: "http"; request: ParsedRequest; raw: string; start: number; end: number }
  | { type: "table"; headers: string[]; rows: string[][] }
  | { type: "quote"; text: string }
  | { type: "hr" };

const METHOD_LINE = /^(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)\s+\S+/i;

export function parseMarkdown(source: string): MdBlock[] {
  const sourceNorm = source.replace(/\r\n/g, "\n");
  const lines = sourceNorm.split("\n");
  const starts: number[] = [];
  {
    let p = 0;
    for (let li = 0; li < lines.length; li += 1) {
      starts.push(p);
      p += lines[li]!.length + (li < lines.length - 1 ? 1 : 0);
    }
  }
  const spanEnd = (toLineExclusive: number) =>
    toLineExclusive < lines.length ? (starts[toLineExclusive] ?? sourceNorm.length) : sourceNorm.length;

  const blocks: MdBlock[] = [];
  let i = 0;

  const peek = () => lines[i] ?? "";
  const restIsBlank = (from: number) => {
    for (let k = from; k < lines.length; k += 1) {
      if (lines[k]?.trim()) return false;
    }
    return true;
  };

  while (i < lines.length) {
    const line = peek();

    if (line.trim() === "") {
      i += 1;
      continue;
    }

    if (/^```/.test(line)) {
      const openLine = i;
      const lang = line.replace(/^```/, "").trim().toLowerCase();
      i += 1;
      const buf: string[] = [];
      while (i < lines.length && !/^```/.test(peek())) {
        buf.push(peek());
        i += 1;
      }
      if (i < lines.length) i += 1;
      const code = buf.join("\n");
      const start = starts[openLine] ?? 0;
      const end = spanEnd(i);
      if (lang === "http" || lang === "rest") {
        const request = parseSingleRequest(code);
        if (request) {
          blocks.push({ type: "http", request, raw: code, start, end });
          continue;
        }
      }
      blocks.push({ type: "code", lang, code });
      continue;
    }

    if (METHOD_LINE.test(line.trim())) {
      const openLine = i;
      const buf: string[] = [];
      while (i < lines.length) {
        const l = peek();
        if (/^#{1,6}\s/.test(l) || /^```/.test(l)) break;
        if (buf.length > 0 && METHOD_LINE.test(l.trim()) && buf[buf.length - 1]?.trim() === "") break;
        buf.push(l);
        i += 1;
        if (buf.length > 1 && l.trim() === "" && peek() && !/^[{["']/.test(peek().trim()) && !HEADERISH(peek()) && !METHOD_LINE.test(peek().trim())) {
          break;
        }
      }
      const raw = buf.join("\n").trimEnd();
      const request = parseSingleRequest(raw);
      const start = starts[openLine] ?? 0;
      const end = spanEnd(i);
      if (request) {
        blocks.push({ type: "http", request, raw, start, end });
        continue;
      }
      blocks.push({ type: "paragraph", text: raw });
      continue;
    }

    const heading = line.match(/^(#{1,6})\s+(.*)$/);
    if (heading) {
      blocks.push({ type: "heading", level: heading[1]!.length, text: heading[2] ?? "" });
      i += 1;
      continue;
    }

    if (/^(-{3,}|\*{3,}|_{3,})\s*$/.test(line.trim())) {
      blocks.push({ type: "hr" });
      i += 1;
      continue;
    }

    if (/^>\s?/.test(line)) {
      const buf: string[] = [];
      while (i < lines.length && /^>\s?/.test(peek())) {
        buf.push(peek().replace(/^>\s?/, ""));
        i += 1;
      }
      blocks.push({ type: "quote", text: buf.join("\n") });
      continue;
    }

    if (/^\|.+\|/.test(line) && /^\|?\s*:?-{3,}/.test(lines[i + 1] ?? "")) {
      const split = (row: string) =>
        row
          .trim()
          .replace(/^\|/, "")
          .replace(/\|$/, "")
          .split("|")
          .map((c) => c.trim());
      const headers = split(line);
      i += 2;
      const rows: string[][] = [];
      while (i < lines.length && /^\|.+\|/.test(peek())) {
        rows.push(split(peek()));
        i += 1;
      }
      blocks.push({ type: "table", headers, rows });
      continue;
    }

    if (/^\s*([-*+]|\d+\.)\s+/.test(line)) {
      const ordered = /^\s*\d+\.\s+/.test(line);
      const items: { text: string; checked?: boolean }[] = [];
      while (i < lines.length && /^\s*([-*+]|\d+\.)\s+/.test(peek())) {
        let text = peek().replace(/^\s*([-*+]|\d+\.)\s+/, "");
        let checked: boolean | undefined;
        const box = text.match(/^\[( |x|X)\]\s+(.*)$/);
        if (box) {
          checked = box[1] !== " ";
          text = box[2] ?? "";
        }
        items.push({ text, checked });
        i += 1;
      }
      blocks.push({ type: "list", ordered, items });
      continue;
    }

    const buf: string[] = [line];
    i += 1;
    while (i < lines.length) {
      const l = peek();
      if (l.trim() === "") break;
      if (/^#{1,6}\s/.test(l) || /^```/.test(l) || METHOD_LINE.test(l.trim()) || /^\s*([-*+]|\d+\.)\s+/.test(l) || /^>\s?/.test(l)) break;
      buf.push(l);
      i += 1;
    }
    void restIsBlank;
    blocks.push({ type: "paragraph", text: buf.join("\n") });
  }

  return blocks;
}

function HEADERISH(line: string): boolean {
  return /^[A-Za-z0-9!#$%&'*+.^_`|~-]+\s*:/.test(line);
}

export function replaceHttpSpan(source: string, start: number, end: number, nextRaw: string): string {
  const norm = source.replace(/\r\n/g, "\n");
  const block = "```http\n" + nextRaw.replace(/^\n+|\n+$/g, "") + "\n```";
  const before = norm.slice(0, start);
  const after = norm.slice(end);
  const left = before.length === 0 || before.endsWith("\n") ? before : `${before}\n`;
  const right = after.length === 0 || after.startsWith("\n") ? after : `\n${after}`;
  return left + block + right;
}

export function appendHttpFence(source: string, raw = "GET https://api.example.com/\nAccept: application/json\n"): string {
  const fence = "```http\n" + raw.replace(/^\n+|\n+$/g, "") + "\n```\n";
  if (!source.trim()) return fence;
  return source.replace(/\s*$/, "") + "\n\n" + fence;
}

export function countHttpBlocks(source: string): number {
  return parseMarkdown(source).filter((b) => b.type === "http").length;
}

export function inlineToHtml(text: string): string {
  const escaped = escapeHtml(text);
  return escaped
    .replace(/`([^`]+)`/g, '<code class="md-code">$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g, "$1<em>$2</em>")
    .replace(/\[([^\]]+)\]\((https?:[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>')
    .replace(/!\[([^\]]*)\]\((https?:[^)\s]+)\)/g, '<img alt="$1" src="$2" />')
    .replace(
      /\[\[([^\]]+)\]\]/g,
      '<button type="button" class="wiki-link" data-wiki="$1">$1</button>',
    );
}

export function escapeHtml(text: string): string {
  const amp = "\u0026";
  return text
    .replace(/&/g, amp + "amp;")
    .replace(/</g, amp + "lt;")
    .replace(/>/g, amp + "gt;");
}
