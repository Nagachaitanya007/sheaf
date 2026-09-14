import { create } from "zustand";
import { isPortable, toPortable, type PortableWorkspace } from "./import-export";
import { emptyHeaders, interpolate, parseHttpFile, parseSingleRequest } from "./http";
import { now, uid } from "./ids";
import { createSeed, rebrandSnapshot } from "./seed";
import { loadSnapshotSync, saveSnapshot } from "./storage";
import type {
  BodyType,
  Collection,
  Environment,
  ExtractionScope,
  HeaderRow,
  HistoryEntry,
  HttpMethod,
  HttpResponse,
  Item,
  ItemKind,
  MobilePane,
  PersistSnapshot,
  RightTab,
  SidebarView,
  UiPrefs,
  UtilityId,
  Variable,
} from "./types";
import { MAX_HISTORY } from "./types";
import { upsertVar } from "./variables";

export type SendState = "idle" | "sending";

export interface ScratchpadState {
  hydrated: boolean;
  workspace: PersistSnapshot["workspace"];
  collections: Collection[];
  items: Item[];
  environments: Environment[];
  history: HistoryEntry[];
  activeWorkspaceId: string;
  activeEnvironmentId: string | null;
  activeItemId: string | null;
  openTabIds: string[];
  collapsedIds: string[];
  activeUtility: UtilityId | null;
  sidebarView: SidebarView;
  rightTab: RightTab;
  mobilePane: MobilePane;
  commandOpen: boolean;
  searchOpen: boolean;
  shortcutsOpen: boolean;
  envEditorOpen: boolean;
  searchQuery: string;
  lastResponse: HttpResponse | null;
  lastResponseItemId: string | null;
  sendState: SendState;
  sendError: string | null;
  compareIds: [string | null, string | null];
  dirty: boolean;
  focusMode: boolean;
  sidebarHidden: boolean;
  inspectorHidden: boolean;
  online: boolean;
  closedTabIds: string[];
}

interface Actions {
  hydrate: () => Promise<void>;
  persistSoon: () => void;
  setSidebarView: (view: SidebarView) => void;
  setRightTab: (tab: RightTab) => void;
  setMobilePane: (pane: MobilePane) => void;
  setCommandOpen: (open: boolean) => void;
  setSearchOpen: (open: boolean) => void;
  setShortcutsOpen: (open: boolean) => void;
  setEnvEditorOpen: (open: boolean) => void;
  setSearchQuery: (q: string) => void;
  setUtility: (id: UtilityId | null) => void;
  selectItem: (id: string | null) => void;
  closeTab: (id: string) => void;
  toggleCollapsed: (id: string) => void;
  setEnvironment: (id: string) => void;
  updateWorkspaceName: (name: string) => void;
  addCollection: () => void;
  renameCollection: (id: string, name: string) => void;
  deleteCollection: (id: string) => void;
  addItem: (kind: ItemKind, parentId: string | null, collectionId?: string) => string;
  duplicateItem: (id: string) => string | null;
  renameItem: (id: string, name: string) => void;
  deleteItem: (id: string) => void;
  moveItem: (id: string, parentId: string | null, collectionId: string) => void;
  updateRequest: (
    id: string,
    patch: Partial<Pick<Item, "method" | "url" | "headers" | "bodyType" | "body" | "formFields" | "content" | "tags" | "auth" | "timeoutMs" | "variables">>,
  ) => void;
  upsertHeader: (itemId: string, header: HeaderRow) => void;
  addHeaderRow: (itemId: string) => void;
  removeHeaderRow: (itemId: string, headerId: string) => void;
  updateEnvVar: (envId: string, variable: Variable) => void;
  addEnvVar: (envId: string) => void;
  removeEnvVar: (envId: string, varId: string) => void;
  addEnvironment: (name: string) => void;
  renameEnvironment: (id: string, name: string) => void;
  recordHistory: (entry: HistoryEntry) => void;
  deleteHistory: (id: string) => void;
  clearHistory: () => void;
  setLastResponse: (itemId: string | null, response: HttpResponse | null) => void;
  setSendState: (state: SendState, error?: string | null) => void;
  setCompare: (slot: 0 | 1, id: string | null) => void;
  setBlockResult: (itemId: string, blockKey: string, response: HttpResponse & { extracted?: Record<string, string> }) => void;
  setExtractedVar: (itemId: string, key: string, value: string, scope: ExtractionScope) => void;
  setItemVariables: (itemId: string, variables: Variable[]) => void;
  setAuth: (itemId: string, auth: Item["auth"]) => void;
  setFocusMode: (on: boolean) => void;
  setSidebarHidden: (on: boolean) => void;
  setInspectorHidden: (on: boolean) => void;
  setOnline: (on: boolean) => void;
  reopenClosedTab: () => void;
  importPortable: (data: PortableWorkspace) => void;
  resetToSeed: () => void;
  snapshot: () => PersistSnapshot;
}

let persistTimer: ReturnType<typeof setTimeout> | null = null;

function applySnapshot(snap: PersistSnapshot): Partial<ScratchpadState> {
  return {
    workspace: snap.workspace,
    collections: snap.collections,
    items: snap.items,
    environments: snap.environments,
    history: snap.history,
    activeWorkspaceId: snap.activeWorkspaceId,
    activeEnvironmentId: snap.activeEnvironmentId,
    activeItemId: snap.activeItemId,
    openTabIds: snap.openTabIds,
    collapsedIds: snap.collapsedIds,
    activeUtility: snap.activeUtility,
    lastResponse: null,
    lastResponseItemId: null,
    dirty: false,
    focusMode: snap.ui?.focusMode ?? false,
    sidebarHidden: snap.ui?.sidebarHidden ?? false,
    inspectorHidden: snap.ui?.inspectorHidden ?? false,
  };
}

export const useScratchpad = create<ScratchpadState & Actions>((set, get) => ({
  hydrated: false,
  workspace: { id: "pending", name: "Personal", createdAt: 0, updatedAt: 0 },
  collections: [],
  items: [],
  environments: [],
  history: [],
  activeWorkspaceId: "pending",
  activeEnvironmentId: null,
  activeItemId: null,
  openTabIds: [],
  collapsedIds: [],
  activeUtility: null,
  sidebarView: "workspace",
  rightTab: "response",
  mobilePane: "editor",
  commandOpen: false,
  searchOpen: false,
  shortcutsOpen: false,
  envEditorOpen: false,
  searchQuery: "",
  lastResponse: null,
  lastResponseItemId: null,
  sendState: "idle",
  sendError: null,
  compareIds: [null, null],
  dirty: false,
  focusMode: false,
  sidebarHidden: false,
  inspectorHidden: false,
  online: typeof navigator === "undefined" ? true : navigator.onLine,
  closedTabIds: [],

  hydrate: async () => {
    try {
      const existing = loadSnapshotSync();
      const snap = rebrandSnapshot(existing ?? createSeed());
      set({ ...applySnapshot(snap), hydrated: true });
      get().persistSoon();
    } catch {
      set({ ...applySnapshot(createSeed()), hydrated: true });
    }
  },

  persistSoon: () => {
    set({ dirty: true });
    if (persistTimer) clearTimeout(persistTimer);
    persistTimer = setTimeout(() => {
      const snap = get().snapshot();
      void saveSnapshot(snap);
      set({ dirty: false });
    }, 280);
  },

  snapshot: () => {
    const s = get();
    return {
      version: 1,
      workspace: s.workspace,
      collections: s.collections,
      items: s.items,
      environments: s.environments,
      history: s.history,
      activeWorkspaceId: s.activeWorkspaceId,
      activeEnvironmentId: s.activeEnvironmentId,
      activeItemId: s.activeItemId,
      openTabIds: s.openTabIds,
      collapsedIds: s.collapsedIds,
      activeUtility: s.activeUtility,
      ui: {
        focusMode: s.focusMode,
        sidebarHidden: s.sidebarHidden,
        inspectorHidden: s.inspectorHidden,
      },
    };
  },

  setSidebarView: (sidebarView) => set({ sidebarView }),
  setRightTab: (rightTab) => set({ rightTab }),
  setMobilePane: (mobilePane) => set({ mobilePane }),
  setCommandOpen: (commandOpen) => set({ commandOpen }),
  setSearchOpen: (searchOpen) => {
    set({ searchOpen });
    if (searchOpen) set({ sidebarView: "search" });
  },
  setShortcutsOpen: (shortcutsOpen) => set({ shortcutsOpen }),
  setEnvEditorOpen: (envEditorOpen) => set({ envEditorOpen }),
  setSearchQuery: (searchQuery) => set({ searchQuery, sidebarView: "search" }),
  setUtility: (activeUtility) => set({ activeUtility, rightTab: "utility" }),

  selectItem: (id) => {
    if (!id) {
      set({ activeItemId: null });
      return;
    }
    const { openTabIds } = get();
    const nextTabs = openTabIds.includes(id) ? openTabIds : [...openTabIds, id].slice(-12);
    set({ activeItemId: id, openTabIds: nextTabs, mobilePane: "editor" });
    get().persistSoon();
  },

  closeTab: (id) => {
    const { openTabIds, activeItemId, closedTabIds } = get();
    const next = openTabIds.filter((t) => t !== id);
    const nextActive = activeItemId === id ? (next[next.length - 1] ?? null) : activeItemId;
    set({ openTabIds: next, activeItemId: nextActive, closedTabIds: [id, ...closedTabIds].slice(0, 20) });
    get().persistSoon();
  },

  toggleCollapsed: (id) => {
    const { collapsedIds } = get();
    const next = collapsedIds.includes(id) ? collapsedIds.filter((x) => x !== id) : [...collapsedIds, id];
    set({ collapsedIds: next });
    get().persistSoon();
  },

  setEnvironment: (id) => {
    set({ activeEnvironmentId: id });
    get().persistSoon();
  },

  updateWorkspaceName: (name) => {
    set({ workspace: { ...get().workspace, name, updatedAt: now() } });
    get().persistSoon();
  },

  addCollection: () => {
    const { workspace, collections } = get();
    const t = now();
    const col: Collection = {
      id: uid("col"),
      workspaceId: workspace.id,
      name: "New collection",
      description: "",
      order: collections.length,
      createdAt: t,
      updatedAt: t,
    };
    set({ collections: [...collections, col] });
    get().persistSoon();
  },

  renameCollection: (id, name) => {
    set({
      collections: get().collections.map((c) => (c.id === id ? { ...c, name, updatedAt: now() } : c)),
    });
    get().persistSoon();
  },

  deleteCollection: (id) => {
    const { items, collections, activeItemId, openTabIds } = get();
    const removed = new Set(items.filter((i) => i.collectionId === id).map((i) => i.id));
    set({
      collections: collections.filter((c) => c.id !== id),
      items: items.filter((i) => i.collectionId !== id),
      openTabIds: openTabIds.filter((t) => !removed.has(t)),
      activeItemId: activeItemId && removed.has(activeItemId) ? null : activeItemId,
    });
    get().persistSoon();
  },

  addItem: (kind, parentId, collectionId) => {
    const { collections, items } = get();
    const colId = collectionId ?? collections[0]?.id;
    if (!colId) return "";
    const t = now();
    const siblings = items.filter((i) => i.collectionId === colId && i.parentId === parentId);
    const kindPrefix = kind === "note" || kind === "investigation" ? (kind === "investigation" ? "inv" : "note") : kind === "folder" ? "fld" : "req";
    const base: Item = {
      id: uid(kindPrefix),
      collectionId: colId,
      parentId,
      kind,
      name:
        kind === "investigation"
          ? "New investigation"
          : kind === "note"
            ? "Untitled note"
            : kind === "folder"
              ? "New folder"
              : "New request",
      order: siblings.length,
      tags: [],
      createdAt: t,
      updatedAt: t,
    };
    if (kind === "request") {
      base.method = "GET";
      base.url = "{{baseUrl}}/";
      base.headers = emptyHeaders();
      base.bodyType = "none";
      base.body = "";
      base.auth = { type: "none" };
    }
    if (kind === "note") {
      base.content = "# Untitled\n\n";
    }
    if (kind === "investigation") {
      base.content =
        "# New investigation\n\nWrite what you're trying to understand.\n\n```http\n### Request\nGET {{baseUrl}}/\nAccept: application/json\n```\n";
      base.variables = [];
      base.tags = ["investigation"];
    }
    set({ items: [...items, base], activeItemId: kind === "folder" ? get().activeItemId : base.id });
    if (kind !== "folder") {
      const tabs = get().openTabIds;
      set({ openTabIds: tabs.includes(base.id) ? tabs : [...tabs, base.id], mobilePane: "editor" });
    }
    get().persistSoon();
    return base.id;
  },

  duplicateItem: (id) => {
    const item = get().items.find((i) => i.id === id);
    if (!item) return null;
    const copy: Item = {
      ...item,
      id: uid(item.kind === "note" ? "note" : item.kind === "investigation" ? "inv" : item.kind === "folder" ? "fld" : "req"),
      name: `${item.name} copy`,
      order: item.order + 1,
      createdAt: now(),
      updatedAt: now(),
      headers: item.headers?.map((h) => ({ ...h, id: uid("h") })),
      formFields: item.formFields?.map((f) => ({ ...f, id: uid("f") })),
    };
    set({ items: [...get().items, copy] });
    get().selectItem(copy.id);
    get().persistSoon();
    return copy.id;
  },

  renameItem: (id, name) => {
    set({
      items: get().items.map((i) => (i.id === id ? { ...i, name, updatedAt: now() } : i)),
    });
    get().persistSoon();
  },

  deleteItem: (id) => {
    const { items, openTabIds, activeItemId } = get();
    const remove = new Set<string>();
    const walk = (pid: string) => {
      remove.add(pid);
      items.filter((i) => i.parentId === pid).forEach((c) => walk(c.id));
    };
    walk(id);
    const nextItems = items.filter((i) => !remove.has(i.id));
    const nextTabs = openTabIds.filter((t) => !remove.has(t));
    set({
      items: nextItems,
      openTabIds: nextTabs,
      activeItemId: activeItemId && remove.has(activeItemId) ? (nextTabs[nextTabs.length - 1] ?? null) : activeItemId,
    });
    get().persistSoon();
  },

  moveItem: (id, parentId, collectionId) => {
    set({
      items: get().items.map((i) =>
        i.id === id ? { ...i, parentId, collectionId, updatedAt: now() } : i,
      ),
    });
    get().persistSoon();
  },

  updateRequest: (id, patch) => {
    set({
      items: get().items.map((i) => (i.id === id ? { ...i, ...patch, updatedAt: now() } : i)),
    });
    get().persistSoon();
  },

  upsertHeader: (itemId, header) => {
    set({
      items: get().items.map((i) => {
        if (i.id !== itemId) return i;
        const headers = i.headers ?? [];
        return {
          ...i,
          headers: headers.some((h) => h.id === header.id)
            ? headers.map((h) => (h.id === header.id ? header : h))
            : [...headers, header],
          updatedAt: now(),
        };
      }),
    });
    get().persistSoon();
  },

  addHeaderRow: (itemId) => {
    set({
      items: get().items.map((i) =>
        i.id === itemId
          ? {
              ...i,
              headers: [...(i.headers ?? []), { id: uid("h"), key: "", value: "", enabled: true }],
              updatedAt: now(),
            }
          : i,
      ),
    });
    get().persistSoon();
  },

  removeHeaderRow: (itemId, headerId) => {
    set({
      items: get().items.map((i) =>
        i.id === itemId
          ? { ...i, headers: (i.headers ?? []).filter((h) => h.id !== headerId), updatedAt: now() }
          : i,
      ),
    });
    get().persistSoon();
  },

  updateEnvVar: (envId, variable) => {
    set({
      environments: get().environments.map((e) =>
        e.id === envId
          ? {
              ...e,
              variables: e.variables.map((v) => (v.id === variable.id ? variable : v)),
              updatedAt: now(),
            }
          : e,
      ),
    });
    get().persistSoon();
  },

  addEnvVar: (envId) => {
    set({
      environments: get().environments.map((e) =>
        e.id === envId
          ? { ...e, variables: [...e.variables, { id: uid("v"), key: "", value: "" }], updatedAt: now() }
          : e,
      ),
    });
    get().persistSoon();
  },

  removeEnvVar: (envId, varId) => {
    set({
      environments: get().environments.map((e) =>
        e.id === envId ? { ...e, variables: e.variables.filter((v) => v.id !== varId), updatedAt: now() } : e,
      ),
    });
    get().persistSoon();
  },

  addEnvironment: (name) => {
    const t = now();
    const env: Environment = {
      id: uid("env"),
      workspaceId: get().workspace.id,
      name,
      variables: [{ id: uid("v"), key: "baseUrl", value: "https://" }],
      createdAt: t,
      updatedAt: t,
    };
    set({ environments: [...get().environments, env], activeEnvironmentId: env.id });
    get().persistSoon();
  },

  renameEnvironment: (id, name) => {
    set({
      environments: get().environments.map((e) => (e.id === id ? { ...e, name, updatedAt: now() } : e)),
    });
    get().persistSoon();
  },

  recordHistory: (entry) => {
    set({ history: [entry, ...get().history].slice(0, MAX_HISTORY) });
    get().persistSoon();
  },

  deleteHistory: (id) => {
    set({ history: get().history.filter((h) => h.id !== id) });
    get().persistSoon();
  },

  clearHistory: () => {
    set({ history: [] });
    get().persistSoon();
  },

  setLastResponse: (lastResponseItemId, lastResponse) => set({ lastResponseItemId, lastResponse, rightTab: "response", mobilePane: "inspect" }),
  setSendState: (sendState, sendError = null) => set({ sendState, sendError }),
  setCompare: (slot, id) => {
    const next = [...get().compareIds] as [string | null, string | null];
    next[slot] = id;
    set({ compareIds: next });
  },

  setBlockResult: (itemId, key, response) => {
    set({
      items: get().items.map((i) => {
        if (i.id !== itemId) return i;
        const rest = (i.blockResults ?? []).filter((b) => b.blockKey !== key);
        const next = [{ blockKey: key, response, extracted: response.extracted, ranAt: Date.now() }, ...rest].slice(0, 40);
        return { ...i, blockResults: next, updatedAt: now() };
      }),
    });
    get().persistSoon();
  },

  setExtractedVar: (itemId, key, value, scope) => {
    if (scope === "environment") {
      const envId = get().activeEnvironmentId;
      if (!envId) return;
      set({
        environments: get().environments.map((e) =>
          e.id === envId ? { ...e, variables: upsertVar(e.variables, key, value), updatedAt: now() } : e,
        ),
      });
    } else if (scope === "request" || scope === "investigation") {
      set({
        items: get().items.map((i) =>
          i.id === itemId ? { ...i, variables: upsertVar(i.variables, key, value), updatedAt: now() } : i,
        ),
      });
    }
    get().persistSoon();
  },

  setItemVariables: (itemId, variables) => {
    set({
      items: get().items.map((i) => (i.id === itemId ? { ...i, variables, updatedAt: now() } : i)),
    });
    get().persistSoon();
  },

  setAuth: (itemId, auth) => {
    set({
      items: get().items.map((i) => (i.id === itemId ? { ...i, auth, updatedAt: now() } : i)),
    });
    get().persistSoon();
  },

  setFocusMode: (focusMode) => {
    set({
      focusMode,
      sidebarHidden: focusMode ? true : get().sidebarHidden,
      inspectorHidden: focusMode ? true : get().inspectorHidden,
    });
    get().persistSoon();
  },
  setSidebarHidden: (sidebarHidden) => {
    set({ sidebarHidden, focusMode: sidebarHidden && get().inspectorHidden });
    get().persistSoon();
  },
  setInspectorHidden: (inspectorHidden) => {
    set({ inspectorHidden, focusMode: inspectorHidden && get().sidebarHidden });
    get().persistSoon();
  },
  setOnline: (online) => set({ online }),
  reopenClosedTab: () => {
    const id = get().closedTabIds[0];
    if (!id) return;
    set({ closedTabIds: get().closedTabIds.slice(1) });
    get().selectItem(id);
  },

  importPortable: (data) => {
    const t = now();
    const workspace = { ...get().workspace, name: data.workspace.name || get().workspace.name, updatedAt: t };
    const collections: Collection[] = [];
    const items: Item[] = [];
    data.collections.forEach((c, ci) => {
      const col: Collection = {
        id: uid("col"),
        workspaceId: workspace.id,
        name: c.name,
        description: c.description ?? "",
        order: c.order ?? ci,
        createdAt: t,
        updatedAt: t,
      };
      collections.push(col);
      const pathMap = new Map<string, string>();
      const sorted = c.items.slice().sort((a, b) => a.parentPath.length - b.parentPath.length || a.order - b.order);
      for (const it of sorted) {
        const parentKey = it.parentPath.join("/");
        const parentId = parentKey ? (pathMap.get(parentKey) ?? null) : null;
        if (!["folder", "request", "note", "investigation"].includes(it.kind)) continue;
        if (items.length >= 2000) break;
        const id = uid(it.kind === "note" ? "note" : it.kind === "investigation" ? "inv" : it.kind === "folder" ? "fld" : "req");
        if (it.kind === "folder") pathMap.set([...it.parentPath, it.name].join("/"), id);
        items.push({
          id,
          collectionId: col.id,
          parentId,
          kind: it.kind,
          name: String(it.name ?? "Untitled").slice(0, 200),
          order: it.order,
          tags: (it.tags ?? []).slice(0, 24).map((t) => String(t).slice(0, 40)),
          method: it.method,
          url: it.url,
          headers: it.headers?.map((h) => ({ ...h, id: uid("h") })),
          bodyType: it.bodyType,
          body: it.body,
          formFields: it.formFields?.map((f) => ({ ...f, id: uid("f") })),
          content: typeof it.content === "string" ? it.content.slice(0, 500_000) : undefined,
          auth: it.auth,
          variables: it.variables?.map((v) => ({ ...v, id: uid("v") })),
          createdAt: t,
          updatedAt: t,
        });
      }
    });
    const environments: Environment[] = data.environments.map((e) => ({
      id: uid("env"),
      workspaceId: workspace.id,
      name: e.name,
      variables: e.variables.map((v) => ({ ...v, id: uid("v") })),
      createdAt: t,
      updatedAt: t,
    }));
    set({
      workspace,
      collections,
      items,
      environments,
      activeEnvironmentId: environments[0]?.id ?? null,
      activeItemId: items.find((i) => i.kind !== "folder")?.id ?? null,
      openTabIds: items.filter((i) => i.kind !== "folder").slice(0, 3).map((i) => i.id),
      history: [],
    });
    get().persistSoon();
  },

  resetToSeed: () => {
    const snap = createSeed();
    set({ ...applySnapshot(snap), hydrated: true });
    get().persistSoon();
  },
}));

export function activeItem(): Item | undefined {
  const { items, activeItemId } = useScratchpad.getState();
  return items.find((i) => i.id === activeItemId);
}

export function activeEnv(): Environment | undefined {
  const { environments, activeEnvironmentId } = useScratchpad.getState();
  return environments.find((e) => e.id === activeEnvironmentId);
}

export function envVars(): Record<string, string> {
  const env = activeEnv();
  const out: Record<string, string> = {};
  for (const v of env?.variables ?? []) {
    if (v.key.trim()) out[v.key.trim()] = v.value;
  }
  return out;
}

export function resolvedUrl(url: string): string {
  return interpolate(url, envVars());
}

export { isPortable, parseHttpFile, parseSingleRequest, toPortable };
export type { BodyType, HttpMethod, PortableWorkspace };
