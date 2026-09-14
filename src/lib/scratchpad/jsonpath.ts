export type JsonPathToken =
  | { type: "root" }
  | { type: "key"; key: string }
  | { type: "index"; index: number };

export class JsonPathError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "JsonPathError";
  }
}

export function tokenizeJsonPath(path: string): JsonPathToken[] {
  const raw = path.trim();
  if (!raw) throw new JsonPathError("Empty JSONPath");
  const tokens: JsonPathToken[] = [];
  let i = 0;
  if (raw[0] === "$") {
    tokens.push({ type: "root" });
    i = 1;
  } else {
    tokens.push({ type: "root" });
  }

  while (i < raw.length) {
    const ch = raw[i]!;
    if (ch === ".") {
      i += 1;
      if (raw[i] === ".") throw new JsonPathError("Recursive descent (..) is not supported");
      if (i >= raw.length) throw new JsonPathError("Dangling '.' in JSONPath");
      if (raw[i] === "[") continue;
      const start = i;
      while (i < raw.length && /[A-Za-z0-9_$-]/.test(raw[i]!)) i += 1;
      if (i === start) throw new JsonPathError(`Unexpected '${raw[i]}' in JSONPath`);
      tokens.push({ type: "key", key: raw.slice(start, i) });
      continue;
    }
    if (ch === "[") {
      i += 1;
      if (raw[i] === "'" || raw[i] === '"') {
        const quote = raw[i]!;
        i += 1;
        let key = "";
        while (i < raw.length && raw[i] !== quote) {
          if (raw[i] === "\\") {
            key += raw[i + 1] ?? "";
            i += 2;
            continue;
          }
          key += raw[i];
          i += 1;
        }
        if (raw[i] !== quote) throw new JsonPathError("Unterminated quoted key");
        i += 1;
        if (raw[i] !== "]") throw new JsonPathError("Expected ] after quoted key");
        i += 1;
        tokens.push({ type: "key", key });
        continue;
      }
      const start = i;
      if (raw[i] === "-") i += 1;
      while (i < raw.length && /[0-9]/.test(raw[i]!)) i += 1;
      if (i === start || raw[i] !== "]") throw new JsonPathError("Expected numeric index");
      const index = Number(raw.slice(start, i));
      i += 1;
      tokens.push({ type: "index", index });
      continue;
    }
    if (/[A-Za-z0-9_$-]/.test(ch) && tokens.length === 1) {
      const start = i;
      while (i < raw.length && /[A-Za-z0-9_$-]/.test(raw[i]!)) i += 1;
      tokens.push({ type: "key", key: raw.slice(start, i) });
      continue;
    }
    throw new JsonPathError(`Unexpected '${ch}' in JSONPath`);
  }
  return tokens;
}

export function jsonPath(value: unknown, path: string): unknown {
  const tokens = tokenizeJsonPath(path);
  let cur: unknown = value;
  for (const token of tokens) {
    if (token.type === "root") continue;
    if (cur == null || (typeof cur !== "object" && !Array.isArray(cur))) return undefined;
    if (token.type === "key") {
      if (Array.isArray(cur)) return undefined;
      cur = (cur as Record<string, unknown>)[token.key];
      continue;
    }
    if (!Array.isArray(cur)) return undefined;
    cur = cur[token.index];
  }
  return cur;
}

export function jsonPathToString(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return JSON.stringify(value);
}

export function parseJsonSafe(text: string): unknown | undefined {
  const t = text.trim();
  if (!t) return undefined;
  try {
    return JSON.parse(t) as unknown;
  } catch {
    return undefined;
  }
}
