import { LEGACY_STORAGE_KEY, STORAGE_KEY, type PersistSnapshot } from "./types";

const DB_NAME = "sheaf";
const LEGACY_DB_NAME = "developer-scratchpad";
const STORE = "kv";

function fromLocal(): PersistSnapshot | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistSnapshot;
    return parsed?.version === 1 ? parsed : null;
  } catch {
    return null;
  }
}

function toLocal(snapshot: PersistSnapshot): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
    localStorage.removeItem(LEGACY_STORAGE_KEY);
  } catch {
    /* quota */
  }
}

function openNamed(name: string): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(name, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error("idb open failed"));
  });
}

function openDb(): Promise<IDBDatabase> {
  return openNamed(DB_NAME);
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("timeout")), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (err: unknown) => {
        clearTimeout(timer);
        reject(err);
      },
    );
  });
}

export function loadSnapshotSync(): PersistSnapshot | null {
  if (typeof localStorage === "undefined") return null;
  return fromLocal();
}

export async function loadSnapshot(): Promise<PersistSnapshot | null> {
  const local = loadSnapshotSync();
  if (local) return local;
  if (typeof indexedDB === "undefined") return null;
  for (const name of [DB_NAME, LEGACY_DB_NAME]) {
    try {
      const db = await withTimeout(openNamed(name), 400);
      const key = name === DB_NAME ? STORAGE_KEY : LEGACY_STORAGE_KEY;
      const value = await withTimeout(
        new Promise<PersistSnapshot | null>((resolve, reject) => {
          const tx = db.transaction(STORE, "readonly");
          const req = tx.objectStore(STORE).get(key);
          req.onsuccess = () => resolve((req.result as PersistSnapshot | undefined) ?? null);
          req.onerror = () => reject(req.error ?? new Error("idb read failed"));
        }),
        400,
      );
      db.close();
      if (value?.version === 1) return value;
    } catch {
      /* try next */
    }
  }
  return null;
}

export async function saveSnapshot(snapshot: PersistSnapshot): Promise<void> {
  toLocal(snapshot);
  if (typeof indexedDB === "undefined") return;
  try {
    const db = await withTimeout(openDb(), 800);
    await withTimeout(
      new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE, "readwrite");
        tx.objectStore(STORE).put(snapshot, STORAGE_KEY);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error ?? new Error("idb write failed"));
      }),
      800,
    );
    db.close();
  } catch {
    /* localStorage already written */
  }
}

export async function clearSnapshot(): Promise<void> {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(LEGACY_STORAGE_KEY);
  } catch {
    /* ignore */
  }
  try {
    if (typeof indexedDB === "undefined") return;
    const db = await withTimeout(openDb(), 800);
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).delete(STORAGE_KEY);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error ?? new Error("idb delete failed"));
    });
    db.close();
  } catch {
    /* ignore */
  }
}
