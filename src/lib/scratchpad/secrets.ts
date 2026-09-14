import type { PortableWorkspace } from "./import-export.ts";

const SECRET_KEY = /(token|secret|password|passwd|apikey|api[_-]?key|authorization|auth|bearer|private[_-]?key|accessToken|refreshToken)/i;
const SECRET_HEADER = /^(authorization|x-api-key|api-key|proxy-authorization)$/i;
const SECRET_LINE = /^(authorization|x-api-key|api-key|proxy-authorization)\s*:.*$/gim;
const JSON_SECRET_FIELD =
  /("(?:token|secret|password|passwd|api[_-]?key|authorization|accessToken|refreshToken)"\s*:\s*)("(?:\\.|[^"\\])*")/gi;

export function looksSecretKey(key: string): boolean {
  return SECRET_KEY.test(key);
}

export function redactSecretLines(text: string): string {
  return text.replace(SECRET_LINE, (line) => {
    const key = line.split(":")[0] ?? "Authorization";
    return `${key}: [redacted]`;
  });
}

export function redactJsonSecretFields(text: string): string {
  return text.replace(JSON_SECRET_FIELD, (full, prefix: string, value: string) => {
    if (/\[redacted\]/i.test(value)) return full;
    return `${prefix}"[redacted]"`;
  });
}

export function countSecrets(portable: PortableWorkspace): number {
  let n = 0;
  for (const env of portable.environments) {
    for (const v of env.variables) {
      if (v.secret || looksSecretKey(v.key)) n += 1;
    }
  }
  for (const col of portable.collections) {
    for (const item of col.items) {
      for (const v of item.variables ?? []) {
        if (v.secret || looksSecretKey(v.key)) n += 1;
      }
      if (item.auth && item.auth.type !== "none") n += 1;
      for (const h of item.headers ?? []) {
        if (SECRET_HEADER.test(h.key) || looksSecretKey(h.key)) n += 1;
      }
      const blob = `${item.content ?? ""}\n${item.body ?? ""}`;
      const secretLines = blob.match(SECRET_LINE) ?? [];
      SECRET_LINE.lastIndex = 0;
      n += secretLines.filter((line) => !/\[redacted\]/i.test(line)).length;
      const jsonSecrets = blob.match(JSON_SECRET_FIELD) ?? [];
      JSON_SECRET_FIELD.lastIndex = 0;
      n += jsonSecrets.filter((line) => !/\[redacted\]/i.test(line)).length;
    }
  }
  return n;
}

export function stripSecrets(portable: PortableWorkspace): PortableWorkspace {
  return {
    ...portable,
    environments: portable.environments.map((env) => ({
      ...env,
      variables: env.variables
        .filter((v) => !v.secret && !looksSecretKey(v.key))
        .map((v) => ({ ...v })),
    })),
    collections: portable.collections.map((col) => ({
      ...col,
      items: col.items.map((item) => ({
        ...item,
        auth: undefined,
        content: item.content ? redactJsonSecretFields(redactSecretLines(item.content)) : item.content,
        body: item.body ? redactJsonSecretFields(item.body) : item.body,
        variables: (item.variables ?? []).filter((v) => !v.secret && !looksSecretKey(v.key)),
        headers: (item.headers ?? []).filter((h) => !SECRET_HEADER.test(h.key) && !looksSecretKey(h.key)),
      })),
    })),
  };
}

export function payloadHasSecretKeys(payload: string): boolean {
  try {
    const parsed = JSON.parse(payload) as PortableWorkspace;
    return countSecrets(parsed) > 0;
  } catch {
    return /"(authorization|password|secret|api[_-]?key)"\s*:/i.test(payload);
  }
}
