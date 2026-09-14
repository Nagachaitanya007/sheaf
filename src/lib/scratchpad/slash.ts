export interface SlashCommand {
  id: string;
  label: string;
  hint: string;
  keywords: string[];
  kind: "snippet" | "http" | "request";
  insert: string;
  caretOffset?: number;
}

export const HTTP_SNIPPET = "```http\nGET https://api.example.com/\nAccept: application/json\n\n```\n";
export const HTTP_RAW = "GET https://api.example.com/\nAccept: application/json\n";

export const SLASH_COMMANDS: SlashCommand[] = [
  {
    id: "http",
    label: "HTTP Request",
    hint: "Executable request block",
    keywords: ["http", "request", "api", "get", "post", "fetch"],
    kind: "http",
    insert: HTTP_SNIPPET,
    caretOffset: "```http\nGET ".length,
  },
  {
    id: "request",
    label: "Existing request",
    hint: "Insert a saved request as an HTTP block",
    keywords: ["request", "saved", "collection"],
    kind: "request",
    insert: "",
  },
  {
    id: "heading",
    label: "Heading",
    hint: "Section title",
    keywords: ["heading", "h1", "h2", "title"],
    kind: "snippet",
    insert: "## ",
    caretOffset: 3,
  },
  {
    id: "text",
    label: "Text",
    hint: "Paragraph",
    keywords: ["text", "paragraph", "note"],
    kind: "snippet",
    insert: "",
    caretOffset: 0,
  },
  {
    id: "code",
    label: "Code",
    hint: "Fenced code block",
    keywords: ["code", "javascript", "json"],
    kind: "snippet",
    insert: "```\n\n```\n",
    caretOffset: 4,
  },
  {
    id: "json",
    label: "JSON",
    hint: "JSON code block",
    keywords: ["json", "object"],
    kind: "snippet",
    insert: "```json\n{\n  \n}\n```\n",
    caretOffset: "```json\n{\n  ".length,
  },
  {
    id: "table",
    label: "Table",
    hint: "Markdown table",
    keywords: ["table", "grid"],
    kind: "snippet",
    insert: "| Column | Value |\n| --- | --- |\n|  |  |\n",
    caretOffset: 2,
  },
  {
    id: "quote",
    label: "Quote",
    hint: "Block quote",
    keywords: ["quote", "callout"],
    kind: "snippet",
    insert: "> ",
    caretOffset: 2,
  },
  {
    id: "callout",
    label: "Callout",
    hint: "Observation / note",
    keywords: ["callout", "note", "observation"],
    kind: "snippet",
    insert: "> **Note:** ",
    caretOffset: "> **Note:** ".length,
  },
  {
    id: "divider",
    label: "Divider",
    hint: "Horizontal rule",
    keywords: ["divider", "hr", "rule"],
    kind: "snippet",
    insert: "\n---\n\n",
    caretOffset: 7,
  },
];

export function detectSlash(value: string, caret: number): { from: number; query: string } | null {
  if (caret < 0 || caret > value.length) return null;
  const lineStart = value.lastIndexOf("\n", caret - 1) + 1;
  const prefix = value.slice(lineStart, caret);
  const match = prefix.match(/^(\s*)\/([^\s]*)$/);
  if (!match) return null;
  return { from: lineStart + match[1].length, query: match[2] ?? "" };
}

export function filterSlash(query: string, extras: SlashCommand[] = []): SlashCommand[] {
  const q = query.trim().toLowerCase();
  const pool = [...SLASH_COMMANDS, ...extras];
  if (!q) return pool;
  return pool.filter((cmd) => {
    if (cmd.id.startsWith(q) || cmd.label.toLowerCase().includes(q)) return true;
    return cmd.keywords.some((k) => k.startsWith(q) || k.includes(q));
  });
}

export function applySlash(
  value: string,
  from: number,
  caret: number,
  insert: string,
  caretOffset = insert.length,
): { text: string; caret: number } {
  const before = value.slice(0, from);
  const after = value.slice(caret);
  const text = before + insert + after;
  return { text, caret: from + caretOffset };
}

export function requestCommand(id: string, name: string, block: string): SlashCommand {
  return {
    id: `req:${id}`,
    label: name,
    hint: "Saved request",
    keywords: ["request", name.toLowerCase()],
    kind: "http",
    insert: `\`\`\`http\n${block.trimEnd()}\n\`\`\`\n`,
    caretOffset: 0,
  };
}
