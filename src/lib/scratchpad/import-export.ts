import { serializeHttp } from "./http";
import type { Collection, Environment, Item, PersistSnapshot, Workspace } from "./types";

export interface PortableWorkspace {
  format: "sheaf/v1" | "developer-scratchpad/v1";
  exportedAt: string;
  workspace: Pick<Workspace, "name">;
  collections: Array<
    Pick<Collection, "name" | "description" | "order"> & {
      items: PortableItem[];
    }
  >;
  environments: Array<Pick<Environment, "name"> & { variables: { key: string; value: string; secret?: boolean }[] }>;
}

interface PortableItem {
  name: string;
  kind: Item["kind"];
  parentPath: string[];
  order: number;
  tags: string[];
  method?: Item["method"];
  url?: string;
  headers?: { key: string; value: string; enabled: boolean }[];
  bodyType?: Item["bodyType"];
  body?: string;
  formFields?: { key: string; value: string; enabled: boolean }[];
  content?: string;
}

function parentPath(item: Item, items: Item[]): string[] {
  const path: string[] = [];
  let current = item.parentId;
  const byId = new Map(items.map((i) => [i.id, i]));
  const guard = new Set<string>();
  while (current) {
    if (guard.has(current)) break;
    guard.add(current);
    const parent = byId.get(current);
    if (!parent) break;
    path.unshift(parent.name);
    current = parent.parentId;
  }
  return path;
}

export function toPortable(snapshot: PersistSnapshot): PortableWorkspace {
  return {
    format: "sheaf/v1",
    exportedAt: new Date().toISOString(),
    workspace: { name: snapshot.workspace.name },
    collections: snapshot.collections
      .slice()
      .sort((a, b) => a.order - b.order)
      .map((c) => ({
        name: c.name,
        description: c.description,
        order: c.order,
        items: snapshot.items
          .filter((i) => i.collectionId === c.id)
          .sort((a, b) => a.order - b.order)
          .map((i) => ({
            name: i.name,
            kind: i.kind,
            parentPath: parentPath(i, snapshot.items),
            order: i.order,
            tags: i.tags,
            method: i.method,
            url: i.url,
            headers: i.headers?.map(({ key, value, enabled }) => ({ key, value, enabled })),
            bodyType: i.bodyType,
            body: i.body,
            formFields: i.formFields?.map(({ key, value, enabled }) => ({ key, value, enabled })),
            content: i.content,
          })),
      })),
    environments: snapshot.environments.map((e) => ({
      name: e.name,
      variables: e.variables.map(({ key, value, secret }) => ({ key, value, secret })),
    })),
  };
}

export function exportHttpBundle(snapshot: PersistSnapshot): string {
  const parts: string[] = [`# ${snapshot.workspace.name}`, `# Exported ${new Date().toISOString()}`, ""];
  for (const item of snapshot.items.filter((i) => i.kind === "request")) {
    parts.push(
      serializeHttp({
        name: item.name,
        method: item.method ?? "GET",
        url: item.url ?? "",
        headers: item.headers,
        body: item.body,
      }),
      "",
    );
  }
  return parts.join("\n");
}

export function isPortable(value: unknown): value is PortableWorkspace {
  if (!value || typeof value !== "object") return false;
  const v = value as { format?: unknown };
  return v.format === "sheaf/v1" || v.format === "developer-scratchpad/v1";
}
