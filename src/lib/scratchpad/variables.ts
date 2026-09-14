import { lookupBlockField } from "./extract.ts";
import type { BlockResult, Environment, Item, Variable, Workspace } from "./types.ts";

export type VarScope = "request" | "investigation" | "environment" | "global" | "extracted";

export interface ResolvedVar {
  key: string;
  value: string;
  secret?: boolean;
  scope: VarScope;
}

export interface ResolveContext {
  request?: Variable[];
  investigation?: Variable[];
  environment?: Variable[];
  global?: Variable[];
  blockResults?: BlockResult[];
}

const SCOPE_ORDER: VarScope[] = ["request", "investigation", "environment", "global"];

export function varsToRecord(list: Variable[] | undefined): Record<string, string> {
  const out: Record<string, string> = {};
  for (const v of list ?? []) {
    const key = v.key.trim();
    if (key) out[key] = v.value;
  }
  return out;
}

export function mergeVars(ctx: ResolveContext): Record<string, string> {
  const out: Record<string, string> = {};
  for (const scope of [...SCOPE_ORDER].reverse()) {
    const list =
      scope === "request"
        ? ctx.request
        : scope === "investigation"
          ? ctx.investigation
          : scope === "environment"
            ? ctx.environment
            : ctx.global;
    Object.assign(out, varsToRecord(list));
  }
  return out;
}

export function inspectVars(ctx: ResolveContext): ResolvedVar[] {
  const seen = new Set<string>();
  const out: ResolvedVar[] = [];
  for (const scope of SCOPE_ORDER) {
    const list =
      scope === "request"
        ? ctx.request
        : scope === "investigation"
          ? ctx.investigation
          : scope === "environment"
            ? ctx.environment
            : ctx.global;
    for (const v of list ?? []) {
      const key = v.key.trim();
      if (!key || seen.has(key)) continue;
      seen.add(key);
      out.push({ key, value: v.value, secret: v.secret, scope });
    }
  }
  return out;
}

export function resolveTemplate(text: string, ctx: ResolveContext): string {
  const table = mergeVars(ctx);
  return text.replace(/\{\{\s*([A-Za-z0-9_.-]+)\s*\}\}/g, (match, key: string) => {
    if (Object.prototype.hasOwnProperty.call(table, key)) return table[key] ?? "";
    const fromBlock = lookupBlockField(ctx.blockResults ?? [], key);
    if (fromBlock != null) return fromBlock;
    return match;
  });
}

export function contextFromState(input: {
  item?: Item | null;
  environment?: Environment | null;
  workspace?: Workspace | null;
}): ResolveContext {
  return {
    request: input.item?.kind === "request" ? input.item.variables : undefined,
    investigation: input.item?.kind === "investigation" || input.item?.kind === "note" ? input.item.variables : undefined,
    environment: input.environment?.variables,
    global: input.workspace?.variables,
    blockResults: input.item?.blockResults,
  };
}

export function upsertVar(list: Variable[] | undefined, key: string, value: string, secret = false): Variable[] {
  const next = [...(list ?? [])];
  const idx = next.findIndex((v) => v.key === key);
  if (idx >= 0) {
    next[idx] = { ...next[idx]!, value, secret: secret || next[idx]!.secret };
    return next;
  }
  return [...next, { id: `v_${key}_${Math.random().toString(36).slice(2, 6)}`, key, value, secret }];
}

export function maskSecret(value: string, secret?: boolean): string {
  if (!secret || !value) return value;
  if (value.length <= 4) return "••••";
  return `${value.slice(0, 2)}••••${value.slice(-2)}`;
}
