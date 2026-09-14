import { parseSingleRequest } from "./http";
import type { ParsedRequest } from "./types";

export type MdBlock =
  | { type: "heading"; level: number; text: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; ordered: boolean; items: { text: string; checked?: boolean }[] }
  | { type: "code"; lang: string; code: string }
  | { type: "http"; request: ParsedRequest; raw: string }
  | { type: "table"; headers: string[]; rows: string[][] }
  | { type: "quote"; text: string }
  | { type: "hr" };

const METHOD_LINE = /^(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)\s+\S+/i;

export function parseMarkdown(source: string): MdBlock[] {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
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
      const lang = line.replace(/^```/, "").trim().toLowerCase();
      i += 1;
      const buf: string[] = [];
      while (i < lines.length && !/^```/.test(peek())) {
        buf.push(peek());
        i += 1;
      }
      if (i < lines.length) i += 1;
      const code = buf.join("\n");
      if (lang === "http" || lang === "rest") {
        const request = parseSingleRequest(code);
        if (request) {
          blocks.push({ type: "http", request, raw: code });
          continue;
        }
      }
      blocks.push({ type: "code", lang, code });
      continue;
    }

    if (METHOD_LINE.test(line.trim())) {
      const buf: string[] = [];
      while (i < lines.length) {
        const l = peek();
        if (/^#{1,6}\s/.test(l) || /^```/.test(l)) break;
        if (buf.length > 0 && METHOD_LINE.test(l.trim()) && buf[buf.length - 1]?.trim() === "") break;
        buf.push(l);
        i += 1;
        if (buf.length > 1 && l.trim() === "" && peek() && !/^[{\["']/.test(peek().trim()) && !HEADERISH(peek()) && !METHOD_LINE.test(peek().trim())) {
          break;
        }
      }
      const raw = buf.join("\n").trimEnd();
      const request = parseSingleRequest(raw);
      if (request) {
        blocks.push({ type: "http", request, raw });
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

export function inlineToHtml(text: string): string {
  const escaped = escapeHtml(text);
  return escaped
    .replace(/`([^`]+)`/g, '<code class="md-code">$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[^\*])\*([^*\n]+)\*(?!\*)/g, "$1<em>$2</em>")
    .replace(/\[([^\]]+)\]\((https?:[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>')
    .replace(/!\[([^\]]*)\]\((https?:[^)\s]+)\)/g, '<img alt="$1" src="$2" />');
}

export function escapeHtml(text: string): string {
  const amp = "\u0026";
  return text
    .replace(/&/g, amp + "amp;")
    .replace(/</g, amp + "lt;")
    .replace(/>/g, amp + "gt;");
}
