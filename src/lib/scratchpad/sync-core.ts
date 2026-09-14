export type SyncPushDecision =
  | { action: "insert"; next: number }
  | { action: "update"; next: number }
  | { action: "conflict" };

export function decideSyncPush(
  localRevision: number,
  serverRevision: number | null,
  force = false,
): SyncPushDecision {
  const local = Number(localRevision) || 0;
  if (serverRevision == null) {
    return { action: "insert", next: Math.max(local, 0) + 1 };
  }
  const server = Number(serverRevision) || 0;
  if (!force && local < server) return { action: "conflict" };
  return { action: "update", next: Math.max(server, local) + 1 };
}

export function looksOffline(online: boolean, error: string | null): boolean {
  if (!online) return true;
  return Boolean(error && /network|fetch|offline/i.test(error));
}
