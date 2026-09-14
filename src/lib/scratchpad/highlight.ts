export type TokenKind =
  | "plain"
  | "comment"
  | "string"
  | "number"
  | "keyword"
  | "key"
  | "method"
  | "url"
  | "header"
  | "variable"
  | "punct"
  | "boolean"
  | "null";

export interface HighlightToken {
  kind: TokenKind;
  text: string;
}

const JS_KW =
  /^(abstract|async|await|break|case|catch|class|const|continue|debugger|default|delete|do|else|enum|export|extends|false|finally|for|from|function|if|implements|import|in|instanceof|interface|let|new|null|of|return|static|super|switch|this|throw|true|try|type|typeof|undefined|var|void|while|with|yield)$/;
const PY_KW =
  /^(and|as|assert|async|await|break|class|continue|def|del|elif|else|except|False|finally|for|from|global|if|import|in|is|lambda|None|nonlocal|not|or|pass|raise|return|True|try|while|with|yield)$/;
const SQL_KW =
  /^(add|all|alter|and|as|asc|between|by|case|create|delete|desc|distinct|drop|else|end|exists|from|group|having|in|insert|into|is|join|left|like|limit|not|null|on|or|order|outer|right|select|set|table|then|union|update|values|when|where)$/i;
const SH_KW = /^(case|do|done|elif|else|esac|export|fi|for|function|if|in|return|then|until|while)$/;

function push(out: HighlightToken[], kind: TokenKind, text: string) {
  if (!text) return;
  const last = out[out.length - 1];
  if (last && last.kind === kind) last.text += text;
  else out.push({ kind, text });
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function tokensToHtml(tokens: HighlightToken[]): string {
  return tokens
    .map((t) => `<span class="tok tok-${t.kind}">${escapeHtml(t.text)}</span>`)
    .join("");
}

export function highlight(code: string, lang = ""): HighlightToken[] {
  const l = lang.toLowerCase().split(/[\s+]/)[0] ?? "";
  if (l === "json") return highlightJson(code);
  if (l === "http" || l === "rest") return highlightHttp(code);
  if (l === "html" || l === "xml") return highlightMarkup(code);
  if (l === "css") return highlightCss(code);
  if (l === "sql") return highlightWords(code, SQL_KW);
  if (l === "bash" || l === "sh" || l === "shell" || l === "zsh") return highlightWords(code, SH_KW, "#");
  if (l === "py" || l === "python") return highlightWords(code, PY_KW, "#");
  if (l === "js" || l === "javascript" || l === "ts" || l === "typescript" || l === "jsx" || l === "tsx") {
    return highlightWords(code, JS_KW, "//");
  }
  if (l === "md" || l === "markdown") return highlightMarkdown(code);
  return highlightPlainWithVars(code);
}

export function highlightToHtml(code: string, lang = ""): string {
  if (code.length > 160_000) {
    return `<span class="tok tok-plain">${escapeHtml(code.slice(0, 160_000))}\n…</span>`;
  }
  return tokensToHtml(highlight(code, lang));
}

function highlightPlainWithVars(code: string): HighlightToken[] {
  const out: HighlightToken[] = [];
  const re = /(\{\{[^}]+\}\}|\/\/[^\n]*|#[^\n]*)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(code))) {
    push(out, "plain", code.slice(last, m.index));
    const chunk = m[0] ?? "";
    if (chunk.startsWith("{{")) push(out, "variable", chunk);
    else push(out, "comment", chunk);
    last = m.index + chunk.length;
  }
  push(out, "plain", code.slice(last));
  return out;
}

export function highlightJson(code: string): HighlightToken[] {
  const out: HighlightToken[] = [];
  let i = 0;
  const n = code.length;
  while (i < n) {
    const ch = code[i] ?? "";
    if (ch === '"' ) {
      const start = i;
      i += 1;
      while (i < n) {
        if (code[i] === "\\" ) {
          i += 2;
          continue;
        }
        if (code[i] === '"') {
          i += 1;
          break;
        }
        i += 1;
      }
      const str = code.slice(start, i);
      let j = i;
      while (j < n && /\s/.test(code[j] ?? "")) j += 1;
      if (code[j] === ":") push(out, "key", str);
      else push(out, "string", str);
      continue;
    }
    if (ch === "/" && code[i + 1] === "/") {
      const end = code.indexOf("\n", i);
      const stop = end === -1 ? n : end;
      push(out, "comment", code.slice(i, stop));
      i = stop;
      continue;
    }
    if ("{}[]:,".includes(ch)) {
      push(out, "punct", ch);
      i += 1;
      continue;
    }
    if (/\d/.test(ch) || (ch === "-" && /\d/.test(code[i + 1] ?? ""))) {
      const start = i;
      i += 1;
      while (i < n && /[\d.eE+-]/.test(code[i] ?? "")) i += 1;
      push(out, "number", code.slice(start, i));
      continue;
    }
    if (/[A-Za-z]/.test(ch)) {
      const start = i;
      while (i < n && /[A-Za-z]/.test(code[i] ?? "")) i += 1;
      const word = code.slice(start, i);
      if (word === "true" || word === "false") push(out, "boolean", word);
      else if (word === "null") push(out, "null", word);
      else push(out, "plain", word);
      continue;
    }
    push(out, "plain", ch);
    i += 1;
  }
  return out;
}

const METHOD_RE = /^(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)\b/i;

export function highlightHttp(code: string): HighlightToken[] {
  const out: HighlightToken[] = [];
  const lines = code.split("\n");
  let inBody = false;
  let sawBlank = false;
  for (let li = 0; li < lines.length; li += 1) {
    const line = lines[li] ?? "";
    const eol = li < lines.length - 1 ? "\n" : "";
    const trim = line.trim();
    if (!inBody && (trim.startsWith("#") || trim.startsWith("//"))) {
      push(out, "comment", line + eol);
      continue;
    }
    if (!inBody && !sawBlank && METHOD_RE.test(trim)) {
      const m = line.match(/^(\s*)(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)(\s+)(\S+)(.*)$/i);
      if (m) {
        push(out, "plain", m[1] ?? "");
        push(out, "method", m[2] ?? "");
        push(out, "plain", m[3] ?? "");
        highlightUrl(out, m[4] ?? "");
        highlightPlainWithVarsInto(out, m[5] ?? "");
        push(out, "plain", eol);
        continue;
      }
    }
    if (!inBody && trim === "") {
      sawBlank = true;
      inBody = true;
      push(out, "plain", line + eol);
      continue;
    }
    if (!inBody) {
      const hm = line.match(/^(\s*)([^:]+\s*):(\s*)(.*)$/);
      if (hm) {
        push(out, "plain", hm[1] ?? "");
        push(out, "header", hm[2] ?? "");
        push(out, "punct", ":");
        push(out, "plain", hm[3] ?? "");
        highlightPlainWithVarsInto(out, hm[4] ?? "");
        push(out, "plain", eol);
        continue;
      }
    }
    if (inBody) {
      const rest = lines.slice(li).join("\n");
      if (looksJson(rest)) {
        for (const t of highlightJson(rest)) out.push(t);
        return out;
      }
      highlightPlainWithVarsInto(out, rest);
      return out;
    }
    highlightPlainWithVarsInto(out, line);
    push(out, "plain", eol);
  }
  return out;
}

function looksJson(text: string): boolean {
  const t = text.trim();
  return (t.startsWith("{") && t.endsWith("}")) || (t.startsWith("[") && t.endsWith("]"));
}

function highlightUrl(out: HighlightToken[], url: string) {
  highlightPlainWithVarsInto(out, url);
  const last = out[out.length - 1];
  if (last && last.kind === "plain") last.kind = "url";
}

function highlightPlainWithVarsInto(out: HighlightToken[], text: string) {
  for (const t of highlightPlainWithVars(text)) push(out, t.kind, t.text);
}

function highlightWords(code: string, keywords: RegExp, lineComment: "#" | "//" = "//"): HighlightToken[] {
  const out: HighlightToken[] = [];
  let i = 0;
  const n = code.length;
  while (i < n) {
    const ch = code[i] ?? "";
    if (lineComment === "//" && ch === "/" && code[i + 1] === "/") {
      const end = code.indexOf("\n", i);
      const stop = end === -1 ? n : end;
      push(out, "comment", code.slice(i, stop));
      i = stop;
      continue;
    }
    if (lineComment === "//" && ch === "/" && code[i + 1] === "*") {
      const end = code.indexOf("*/", i + 2);
      const stop = end === -1 ? n : end + 2;
      push(out, "comment", code.slice(i, stop));
      i = stop;
      continue;
    }
    if (lineComment === "#" && ch === "#") {
      const end = code.indexOf("\n", i);
      const stop = end === -1 ? n : end;
      push(out, "comment", code.slice(i, stop));
      i = stop;
      continue;
    }
    if (ch === "'" || ch === '"' || ch === "`") {
      const quote = ch;
      const start = i;
      i += 1;
      while (i < n) {
        if (code[i] === "\\") {
          i += 2;
          continue;
        }
        if (code[i] === quote) {
          i += 1;
          break;
        }
        i += 1;
      }
      push(out, "string", code.slice(start, i));
      continue;
    }
    if (ch === "{" && code[i + 1] === "{") {
      const end = code.indexOf("}}", i);
      const stop = end === -1 ? n : end + 2;
      push(out, "variable", code.slice(i, stop));
      i = stop;
      continue;
    }
    if (/\d/.test(ch)) {
      const start = i;
      while (i < n && /[\d.xXa-fA-F]/.test(code[i] ?? "")) i += 1;
      push(out, "number", code.slice(start, i));
      continue;
    }
    if (/[A-Za-z_$]/.test(ch)) {
      const start = i;
      while (i < n && /[A-Za-z0-9_$]/.test(code[i] ?? "")) i += 1;
      const word = code.slice(start, i);
      if (keywords.test(word)) push(out, "keyword", word);
      else if (word === "true" || word === "false") push(out, "boolean", word);
      else if (word === "null" || word === "None" || word === "undefined") push(out, "null", word);
      else push(out, "plain", word);
      continue;
    }
    if ("{}[]():;,.<>+-*/%=&|!?".includes(ch)) {
      push(out, "punct", ch);
      i += 1;
      continue;
    }
    push(out, "plain", ch);
    i += 1;
  }
  return out;
}

function highlightMarkup(code: string): HighlightToken[] {
  const out: HighlightToken[] = [];
  const re = /(<!--[\s\S]*?-->)|(<!DOCTYPE[\s\S]*?>)|(<\/?[A-Za-z][^>]*>)|(\{\{[^}]+\}\})/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(code))) {
    push(out, "plain", code.slice(last, m.index));
    const chunk = m[0] ?? "";
    if (chunk.startsWith("<!--") || chunk.startsWith("<!")) push(out, "comment", chunk);
    else if (chunk.startsWith("{{")) push(out, "variable", chunk);
    else push(out, "keyword", chunk);
    last = m.index + chunk.length;
  }
  push(out, "plain", code.slice(last));
  return out;
}

function highlightCss(code: string): HighlightToken[] {
  return highlightWords(code, /^(and|not|only|from|to|var|rgb|rgba|hsl|url)$/i, "//");
}

function highlightMarkdown(code: string): HighlightToken[] {
  const out: HighlightToken[] = [];
  for (const [i, line] of code.split("\n").entries()) {
    const eol = i < code.split("\n").length - 1 ? "\n" : "";
    if (/^#{1,6}\s/.test(line)) {
      push(out, "keyword", line + eol);
      continue;
    }
    if (/^\s*>/.test(line) || /^\s*[-*]\s/.test(line)) {
      push(out, "comment", line.slice(0, 2));
      highlightPlainWithVarsInto(out, line.slice(2) + eol);
      continue;
    }
    highlightPlainWithVarsInto(out, line + eol);
  }
  return out;
}
