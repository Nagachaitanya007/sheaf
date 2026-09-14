export function normalizeName(name: string): string {
  return name.replace(/\s+/g, " ").trim();
}

export function nameError(name: string, existing: string[] = []): string | null {
  const n = normalizeName(name);
  if (!n) return "Name is required";
  const clash = existing.some((e) => e.toLowerCase() === n.toLowerCase());
  if (clash) return "That name is already in use";
  return null;
}

export function secretInputType(secret: boolean, revealed: boolean): "password" | "text" {
  return secret && !revealed ? "password" : "text";
}
