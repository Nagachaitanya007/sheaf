import { jsonPath, jsonPathToString, parseJsonSafe } from "./jsonpath.ts";
import type { Extraction, HttpResponse, ParsedRequest } from "./types.ts";

const EXTRACT_RE = /^#\s*@extract\s+([A-Za-z_][A-Za-z0-9_.-]*)\s*=\s*(\S+)(?:\s+scope=(investigation|environment|request))?/gim;

export function slugName(value: string): string {
  return value.trim().replace(/\s+/g, "-");
}

export function blockKey(request: ParsedRequest, index: number): string {
  if (request.name?.trim()) return slugName(request.name);
  return `${request.method}-${index}`;
}

export function parseExtractDirectives(raw: string, block: string): Extraction[] {
  const out: Extraction[] = [];
  const re = new RegExp(EXTRACT_RE.source, "gim");
  let m: RegExpExecArray | null;
  while ((m = re.exec(raw))) {
    out.push({
      as: m[1]!,
      path: m[2]!,
      scope: (m[3] as Extraction["scope"]) ?? "investigation",
      blockKey: block,
    });
  }
  return out;
}

export function applyExtractions(
  response: HttpResponse,
  extractions: Extraction[],
): { key: string; value: string; scope: Extraction["scope"]; path: string }[] {
  const json = parseJsonSafe(response.body);
  if (json === undefined) return [];
  const applied: { key: string; value: string; scope: Extraction["scope"]; path: string }[] = [];
  for (const rule of extractions) {
    try {
      const value = jsonPath(json, rule.path);
      if (value === undefined) continue;
      applied.push({ key: rule.as, value: jsonPathToString(value), scope: rule.scope, path: rule.path });
    } catch {
      /* skip bad path */
    }
  }
  return applied;
}

export function lookupBlockField(
  results: { blockKey: string; response: HttpResponse }[],
  expression: string,
): string | undefined {
  const dot = expression.indexOf(".");
  if (dot <= 0) return undefined;
  const name = expression.slice(0, dot);
  const path = expression.slice(dot + 1);
  const hit = results.find((r) => r.blockKey.toLowerCase() === name.toLowerCase());
  if (!hit) return undefined;
  const json = parseJsonSafe(hit.response.body);
  if (json === undefined) return undefined;
  try {
    const value = jsonPath(json, path.startsWith("$") ? path : `$.${path}`);
    if (value === undefined) return undefined;
    return jsonPathToString(value);
  } catch {
    return undefined;
  }
}
