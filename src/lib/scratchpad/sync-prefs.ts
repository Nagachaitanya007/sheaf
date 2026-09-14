export type SyncStatus = "local" | "idle" | "syncing" | "pending" | "offline" | "error" | "conflict";

export interface SyncPrefs {
  enabled: boolean;
  revision: number;
  lastSyncedAt: number | null;
  lastError: string | null;
}

const KEY = "sheaf/sync/v1";

export function readSyncPrefs(): SyncPrefs {
  if (typeof localStorage === "undefined") {
    return { enabled: false, revision: 0, lastSyncedAt: null, lastError: null };
  }
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { enabled: false, revision: 0, lastSyncedAt: null, lastError: null };
    const parsed = JSON.parse(raw) as SyncPrefs;
    return {
      enabled: Boolean(parsed.enabled),
      revision: Number(parsed.revision) || 0,
      lastSyncedAt: parsed.lastSyncedAt ?? null,
      lastError: parsed.lastError ?? null,
    };
  } catch {
    return { enabled: false, revision: 0, lastSyncedAt: null, lastError: null };
  }
}

export function writeSyncPrefs(prefs: SyncPrefs): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(prefs));
  } catch {
    /* ignore */
  }
}

export function formatSyncTime(ts: number | null): string {
  if (!ts) return "Never synced";
  const delta = Date.now() - ts;
  if (delta < 20_000) return "Synced just now";
  if (delta < 60_000) return "Synced less than a minute ago";
  if (delta < 3_600_000) return `Synced ${Math.round(delta / 60_000)}m ago`;
  return `Synced ${new Date(ts).toLocaleString()}`;
}
