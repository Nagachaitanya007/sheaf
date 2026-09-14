import type { Collection, HistoryEntry, Item } from "./types";

export interface SearchHit {
  id: string;
  kind: "request" | "note" | "folder" | "collection" | "history";
  title: string;
  snippet: string;
  itemId?: string;
  collectionId?: string;
  historyId?: string;
}

function hay(parts: Array<string | undefined | null>): string {
  return parts.filter(Boolean).join(" \n ").toLowerCase();
}

function snippetAround(text: string, q: string, size = 90): string {
  const lower = text.toLowerCase();
  const idx = lower.indexOf(q);
  if (idx < 0) return text.slice(0, size);
  const start = Math.max(0, idx - 24);
  const end = Math.min(text.length, idx + q.length + size - 24);
  return `${start > 0 ? "…" : ""}${text.slice(start, end)}${end < text.length ? "…" : ""}`;
}

export function searchWorkspace(
  query: string,
  collections: Collection[],
  items: Item[],
  history: HistoryEntry[],
): SearchHit[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const hits: SearchHit[] = [];

  for (const c of collections) {
    if (hay([c.name, c.description]).includes(q)) {
      hits.push({
        id: `col-${c.id}`,
        kind: "collection",
        title: c.name,
        snippet: c.description || "Collection",
        collectionId: c.id,
      });
    }
  }

  for (const item of items) {
    const blob = hay([
      item.name,
      item.kind,
      item.url,
      item.method,
      item.body,
      item.content,
      item.tags.join(" "),
      ...(item.headers ?? []).map((h) => `${h.key} ${h.value}`),
    ]);
    if (!blob.includes(q)) continue;
    const source = item.content || item.body || item.url || item.kind;
    hits.push({
      id: item.id,
      kind: item.kind === "note" ? "note" : item.kind === "folder" ? "folder" : "request",
      title: item.kind === "request" ? `${item.method ?? "GET"}  ${item.name}` : item.name,
      snippet: snippetAround(source, q),
      itemId: item.id,
      collectionId: item.collectionId,
    });
  }

  for (const h of history) {
    const blob = hay([h.name, h.method, h.url, h.response.body, String(h.response.status)]);
    if (!blob.includes(q)) continue;
    hits.push({
      id: `hist-${h.id}`,
      kind: "history",
      title: `${h.method} ${h.name}`,
      snippet: snippetAround(`${h.response.status} ${h.url}\n${h.response.body}`, q),
      historyId: h.id,
      itemId: h.requestId,
    });
  }

  return hits.slice(0, 80);
}
