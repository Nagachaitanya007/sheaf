export type DiffKind = "added" | "removed" | "changed" | "type";

export interface DiffEntry {
  path: string;
  kind: DiffKind;
  left?: unknown;
  right?: unknown;
}

function typeOf(value: unknown): string {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  return typeof value;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function childPath(base: string, key: string | number): string {
  if (typeof key === "number") return `${base}[${key}]`;
  if (/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) return `${base}.${key}`;
  return `${base}[${JSON.stringify(key)}]`;
}

export function structuralDiff(left: unknown, right: unknown, path = "$"): DiffEntry[] {
  const out: DiffEntry[] = [];
  walk(left, right, path, out);
  return out;
}

function walk(left: unknown, right: unknown, path: string, out: DiffEntry[]): void {
  if (Object.is(left, right)) return;
  const lt = typeOf(left);
  const rt = typeOf(right);
  if (lt !== rt) {
    if (left === undefined) {
      out.push({ path, kind: "added", right });
      return;
    }
    if (right === undefined) {
      out.push({ path, kind: "removed", left });
      return;
    }
    out.push({ path, kind: "type", left, right });
    return;
  }
  if (lt !== "object" && lt !== "array") {
    out.push({ path, kind: "changed", left, right });
    return;
  }
  if (Array.isArray(left) && Array.isArray(right)) {
    const n = Math.max(left.length, right.length);
    for (let i = 0; i < n; i += 1) {
      if (i >= left.length) out.push({ path: childPath(path, i), kind: "added", right: right[i] });
      else if (i >= right.length) out.push({ path: childPath(path, i), kind: "removed", left: left[i] });
      else walk(left[i], right[i], childPath(path, i), out);
    }
    return;
  }
  if (isPlainObject(left) && isPlainObject(right)) {
    const keys = new Set([...Object.keys(left), ...Object.keys(right)]);
    for (const key of Array.from(keys).sort()) {
      const l = left[key];
      const r = right[key];
      if (!(key in left)) out.push({ path: childPath(path, key), kind: "added", right: r });
      else if (!(key in right)) out.push({ path: childPath(path, key), kind: "removed", left: l });
      else walk(l, r, childPath(path, key), out);
    }
  }
}

export function formatDiff(entries: DiffEntry[]): string {
  if (!entries.length) return "No differences.";
  return entries
    .map((e) => {
      if (e.kind === "added") return `${e.path}\n  added  ${preview(e.right)}`;
      if (e.kind === "removed") return `${e.path}\n  removed  ${preview(e.left)}`;
      if (e.kind === "type") return `${e.path}\n  ${preview(e.left)} → ${preview(e.right)}  (type)`;
      return `${e.path}\n  ${preview(e.left)} → ${preview(e.right)}`;
    })
    .join("\n\n");
}

function preview(value: unknown): string {
  if (typeof value === "string") return JSON.stringify(value);
  if (value === undefined) return "undefined";
  try {
    const s = JSON.stringify(value);
    return s.length > 120 ? s.slice(0, 117) + "…" : s;
  } catch {
    return String(value);
  }
}
