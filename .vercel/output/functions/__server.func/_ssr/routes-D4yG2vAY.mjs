import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { c as require_jsx_runtime, r as Slot } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { _ as ChevronRight, a as Search, c as PanelRight, d as Folder, f as FolderTree, g as Ellipsis, h as FileCode2, i as Send, l as History, m as FileText, o as Plus, p as FolderOpen, r as Trash2, s as Play, t as X, u as Globe } from "../_libs/lucide-react.mjs";
import { a as executeRequest, c as parseSingleRequest, d as toCurl, f as now, h as STORAGE_KEY, i as encodeUrlencoded, l as prettyBody, m as HTTP_METHODS, n as contentTypeOf, o as headersToRecord, p as uid, r as emptyHeaders, s as interpolate, u as serializeHttp } from "./router-RRkSSgBx.mjs";
import { n as nn, r as qt, t as Qt } from "../_libs/react-resizable-panels.mjs";
import { n as toast, t as Toaster } from "../_libs/sonner.mjs";
import { n as clsx, t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
import { a as DialogOverlay$1, i as DialogDescription$1, n as DialogClose, o as DialogPortal$1, r as DialogContent$1, s as DialogTitle$1, t as Dialog$1 } from "../_libs/@radix-ui/react-dialog+[...].mjs";
import { a as Separator2, i as Root2, n as Item2, o as Trigger, r as Portal2, t as Content2 } from "../_libs/@radix-ui/react-dropdown-menu+[...].mjs";
import { t as Provider } from "../_libs/radix-ui__react-tooltip.mjs";
import { t as create } from "../_libs/zustand.mjs";
import { i as Trigger$1, n as List, r as Root2$1, t as Content } from "../_libs/radix-ui__react-tabs.mjs";
import { t as _e } from "../_libs/cmdk.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-D4yG2vAY.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
function formatBytes(bytes) {
	if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
	const units = [
		"B",
		"KB",
		"MB",
		"GB"
	];
	const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
	const value = bytes / 1024 ** i;
	return `${value < 10 && i > 0 ? value.toFixed(1) : Math.round(value)} ${units[i]}`;
}
function formatDuration(ms) {
	if (!Number.isFinite(ms) || ms < 0) return "—";
	if (ms < 1e3) return `${Math.round(ms)} ms`;
	return `${(ms / 1e3).toFixed(2)} s`;
}
function formatRelative(ts) {
	const delta = Date.now() - ts;
	const sec = Math.round(delta / 1e3);
	if (sec < 10) return "just now";
	if (sec < 60) return `${sec}s ago`;
	const min = Math.round(sec / 60);
	if (min < 60) return `${min}m ago`;
	const hr = Math.round(min / 60);
	if (hr < 24) return `${hr}h ago`;
	const day = Math.round(hr / 24);
	if (day < 7) return `${day}d ago`;
	return new Date(ts).toLocaleDateString();
}
function isMac() {
	if (typeof navigator === "undefined") return false;
	return /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
}
function downloadText(filename, contents, mime = "text/plain") {
	const blob = new Blob([contents], { type: mime });
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = filename;
	document.body.appendChild(a);
	a.click();
	a.remove();
	URL.revokeObjectURL(url);
}
async function copyText(text) {
	try {
		await navigator.clipboard.writeText(text);
		return true;
	} catch {
		try {
			const el = document.createElement("textarea");
			el.value = text;
			el.style.position = "fixed";
			el.style.left = "-9999px";
			document.body.appendChild(el);
			el.select();
			const ok = document.execCommand("copy");
			el.remove();
			return ok;
		} catch {
			return false;
		}
	}
}
var buttonVariants = cva("inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-md text-sm font-medium transition-[background-color,color,box-shadow,transform,opacity] duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-40 active:not-disabled:scale-[0.96] [&_svg]:size-3.5 [&_svg]:shrink-0", {
	variants: {
		variant: {
			default: "bg-primary text-primary-foreground hover:bg-primary/90",
			secondary: "bg-elevated text-foreground shadow-[var(--shadow-border)] hover:bg-elevated/80",
			ghost: "text-muted hover:bg-elevated hover:text-foreground",
			danger: "bg-danger text-danger-foreground hover:bg-danger/90",
			send: "bg-accent text-accent-foreground hover:bg-accent/90 font-semibold"
		},
		size: {
			default: "h-8 px-3",
			sm: "h-7 px-2 text-xs",
			lg: "h-10 px-4",
			icon: "size-8",
			"icon-sm": "size-7"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
});
var Button = import_react.forwardRef(({ className, variant, size, asChild, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		className: cn(buttonVariants({
			variant,
			size,
			className
		})),
		ref,
		...props
	});
});
Button.displayName = "Button";
var TooltipProvider = Provider;
function parentPath(item, items) {
	const path = [];
	let current = item.parentId;
	const byId = new Map(items.map((i) => [i.id, i]));
	const guard = /* @__PURE__ */ new Set();
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
function toPortable(snapshot) {
	return {
		format: "developer-scratchpad/v1",
		exportedAt: (/* @__PURE__ */ new Date()).toISOString(),
		workspace: { name: snapshot.workspace.name },
		collections: snapshot.collections.slice().sort((a, b) => a.order - b.order).map((c) => ({
			name: c.name,
			description: c.description,
			order: c.order,
			items: snapshot.items.filter((i) => i.collectionId === c.id).sort((a, b) => a.order - b.order).map((i) => ({
				name: i.name,
				kind: i.kind,
				parentPath: parentPath(i, snapshot.items),
				order: i.order,
				tags: i.tags,
				method: i.method,
				url: i.url,
				headers: i.headers?.map(({ key, value, enabled }) => ({
					key,
					value,
					enabled
				})),
				bodyType: i.bodyType,
				body: i.body,
				formFields: i.formFields?.map(({ key, value, enabled }) => ({
					key,
					value,
					enabled
				})),
				content: i.content
			}))
		})),
		environments: snapshot.environments.map((e) => ({
			name: e.name,
			variables: e.variables.map(({ key, value, secret }) => ({
				key,
				value,
				secret
			}))
		}))
	};
}
function exportHttpBundle(snapshot) {
	const parts = [
		`# ${snapshot.workspace.name}`,
		`# Exported ${(/* @__PURE__ */ new Date()).toISOString()}`,
		""
	];
	for (const item of snapshot.items.filter((i) => i.kind === "request")) parts.push(serializeHttp({
		name: item.name,
		method: item.method ?? "GET",
		url: item.url ?? "",
		headers: item.headers,
		body: item.body
	}), "");
	return parts.join("\n");
}
function isPortable(value) {
	if (!value || typeof value !== "object") return false;
	return value.format === "developer-scratchpad/v1";
}
function header(key, value) {
	return {
		id: uid("h"),
		key,
		value,
		enabled: true
	};
}
function v(key, value, secret = false) {
	return {
		id: uid("v"),
		key,
		value,
		secret
	};
}
function request(partial) {
	const t = now();
	return {
		kind: "request",
		tags: partial.tags ?? [],
		createdAt: t,
		updatedAt: t,
		headers: partial.headers ?? emptyHeaders(),
		bodyType: partial.bodyType ?? "none",
		body: partial.body ?? "",
		...partial
	};
}
function note(partial) {
	const t = now();
	return {
		kind: "note",
		tags: partial.tags ?? ["docs"],
		createdAt: t,
		updatedAt: t,
		content: partial.content ?? "",
		...partial
	};
}
function folder(partial) {
	const t = now();
	return {
		kind: "folder",
		tags: partial.tags ?? [],
		createdAt: t,
		updatedAt: t,
		...partial
	};
}
function createSeed() {
	const t = now();
	const workspace = {
		id: uid("ws"),
		name: "Personal",
		createdAt: t,
		updatedAt: t
	};
	const collection = {
		id: uid("col"),
		workspaceId: workspace.id,
		name: "API Investigation",
		description: "Login flow, users, and notes for a sample public API.",
		order: 0,
		createdAt: t,
		updatedAt: t
	};
	const auth = folder({
		id: uid("fld"),
		collectionId: collection.id,
		parentId: null,
		name: "Authentication",
		order: 0
	});
	const users = folder({
		id: uid("fld"),
		collectionId: collection.id,
		parentId: null,
		name: "Users",
		order: 1
	});
	const posts = folder({
		id: uid("fld"),
		collectionId: collection.id,
		parentId: null,
		name: "Posts",
		order: 2
	});
	const notesFolder = folder({
		id: uid("fld"),
		collectionId: collection.id,
		parentId: null,
		name: "Notes",
		order: 3
	});
	const login = request({
		id: uid("req"),
		collectionId: collection.id,
		parentId: auth.id,
		name: "Login",
		order: 0,
		method: "POST",
		url: "{{baseUrl}}/auth/login",
		tags: ["auth"],
		bodyType: "json",
		headers: [
			header("Content-Type", "application/json"),
			header("Accept", "application/json"),
			{
				id: uid("h"),
				key: "",
				value: "",
				enabled: true
			}
		],
		body: `{
  "username": "{{email}}",
  "password": "{{password}}"
}`
	});
	const me = request({
		id: uid("req"),
		collectionId: collection.id,
		parentId: auth.id,
		name: "Current user",
		order: 1,
		method: "GET",
		url: "{{baseUrl}}/auth/me",
		tags: ["auth"],
		headers: [header("Authorization", "Bearer {{token}}"), header("Accept", "application/json")]
	});
	const refresh = request({
		id: uid("req"),
		collectionId: collection.id,
		parentId: auth.id,
		name: "Refresh token",
		order: 2,
		method: "POST",
		url: "{{baseUrl}}/auth/refresh",
		tags: ["auth"],
		bodyType: "json",
		headers: [header("Content-Type", "application/json"), header("Authorization", "Bearer {{token}}")],
		body: `{
  "refreshToken": "{{refreshToken}}"
}`
	});
	const getUsers = request({
		id: uid("req"),
		collectionId: collection.id,
		parentId: users.id,
		name: "List users",
		order: 0,
		method: "GET",
		url: "{{baseUrl}}/users?limit=10",
		tags: ["users"],
		headers: [header("Accept", "application/json")]
	});
	const getUser = request({
		id: uid("req"),
		collectionId: collection.id,
		parentId: users.id,
		name: "Get user",
		order: 1,
		method: "GET",
		url: "{{baseUrl}}/users/{{userId}}",
		tags: ["users"],
		headers: [header("Accept", "application/json")]
	});
	const updateUser = request({
		id: uid("req"),
		collectionId: collection.id,
		parentId: users.id,
		name: "Update user",
		order: 2,
		method: "PUT",
		url: "{{baseUrl}}/users/{{userId}}",
		tags: ["users"],
		bodyType: "json",
		headers: [header("Content-Type", "application/json"), header("Accept", "application/json")],
		body: `{
  "lastName": "Scratchpad"
}`
	});
	const listPosts = request({
		id: uid("req"),
		collectionId: collection.id,
		parentId: posts.id,
		name: "List posts",
		order: 0,
		method: "GET",
		url: "{{baseUrl}}/posts?limit=5",
		tags: ["posts"],
		headers: [header("Accept", "application/json")]
	});
	const createPost = request({
		id: uid("req"),
		collectionId: collection.id,
		parentId: posts.id,
		name: "Create post",
		order: 1,
		method: "POST",
		url: "{{baseUrl}}/posts/add",
		tags: ["posts"],
		bodyType: "json",
		headers: [header("Content-Type", "application/json")],
		body: `{
  "title": "Notes from the scratchpad",
  "userId": {{userId}}
}`
	});
	const echo = request({
		id: uid("req"),
		collectionId: collection.id,
		parentId: posts.id,
		name: "HTTP echo",
		order: 2,
		method: "GET",
		url: "https://httpbin.org/get?from=scratchpad",
		tags: ["debug"],
		headers: [header("Accept", "application/json"), header("X-Scratchpad", "1")]
	});
	const gettingStarted = note({
		id: uid("note"),
		collectionId: collection.id,
		parentId: notesFolder.id,
		name: "Getting started",
		order: 0,
		content: `# Developer Scratchpad

A local-first workbench for requests, notes, and data. Nothing here leaves this browser unless you run an HTTP call.

## 30-second tour

1. Open a request in the tree — **List users** is a good first send.
2. Press **Ctrl/⌘ Enter** to execute.
3. Inspect status, headers, and JSON on the right.
4. Open **Utilities** for format / JWT / Base64 / regex without leaving the page.

## Environments

Variables like \`{{baseUrl}}\` resolve from the environment in the title bar.

| Environment | baseUrl |
| --- | --- |
| Development | \`https://dummyjson.com\` |
| Local | \`https://jsonplaceholder.typicode.com\` |

Switch to **Development**, then run Login. DummyJSON accepts:

- username: \`emilys\`
- password: \`emilyspass\`

Copy \`accessToken\` from the response into the \`token\` variable if you want to call **Current user**.

## Keyboard

- **Ctrl/⌘ K** command palette
- **Ctrl/⌘ P** quick open
- **Ctrl/⌘ Shift F** search everything
- **Ctrl/⌘ Enter** send the active request
- **Ctrl/⌘ N** new request
- **?** shortcuts

Data lives in IndexedDB on this device. Export the workspace anytime from the command palette.
`
	});
	const authNote = note({
		id: uid("note"),
		collectionId: collection.id,
		parentId: notesFolder.id,
		name: "Auth investigation",
		order: 1,
		tags: ["auth", "docs"],
		content: `# Auth investigation

The authentication endpoint appears to be a straightforward JSON login. DummyJSON issues a JWT we can drop into \`{{token}}\`.

## Login

POST {{baseUrl}}/auth/login
Content-Type: application/json
Accept: application/json

{
  "username": "{{email}}",
  "password": "{{password}}"
}

## Session

After a successful login, subsequent calls use a bearer token.

GET {{baseUrl}}/auth/me
Authorization: Bearer {{token}}
Accept: application/json

## Notes

- Tokens are stored only in the local environment — they are never logged.
- If a request fails CORS in the browser, Scratchpad retries through a same-origin proxy. Private/loopback hosts stay blocked on the proxy on purpose.
- Checklist for a new API:
  - [ ] Capture login request
  - [ ] Store token as a secret variable
  - [ ] Hit a protected resource
  - [ ] Document error shapes in this note
`
	});
	const jsonNote = note({
		id: uid("note"),
		collectionId: collection.id,
		parentId: notesFolder.id,
		name: "Payload playground",
		order: 2,
		content: `# Payload playground

Use the utility drawer (right pane → Utilities, or **Ctrl/⌘ Shift U**) on any of this.

\`\`\`json
{
  "users": [
    { "id": 1, "name": "Ada", "email": "ada@example.com" },
    { "id": 2, "name": "Grace", "email": "grace@example.com" }
  ],
  "ok": true
}
\`\`\`

HTTP echo against a public endpoint:

\`\`\`http
GET https://jsonplaceholder.typicode.com/users/1
Accept: application/json
\`\`\`
`
	});
	const environments = [
		{
			id: uid("env"),
			workspaceId: workspace.id,
			name: "Development",
			createdAt: t,
			updatedAt: t,
			variables: [
				v("baseUrl", "https://dummyjson.com"),
				v("email", "emilys"),
				v("password", "emilyspass", true),
				v("token", ""),
				v("refreshToken", ""),
				v("userId", "1")
			]
		},
		{
			id: uid("env"),
			workspaceId: workspace.id,
			name: "Local",
			createdAt: t,
			updatedAt: t,
			variables: [
				v("baseUrl", "https://jsonplaceholder.typicode.com"),
				v("email", "dev@local.test"),
				v("password", "password", true),
				v("token", "local-token", true),
				v("refreshToken", ""),
				v("userId", "1")
			]
		},
		{
			id: uid("env"),
			workspaceId: workspace.id,
			name: "Staging",
			createdAt: t,
			updatedAt: t,
			variables: [
				v("baseUrl", "https://dummyjson.com"),
				v("email", "emilys"),
				v("password", "emilyspass", true),
				v("token", ""),
				v("userId", "1")
			]
		},
		{
			id: uid("env"),
			workspaceId: workspace.id,
			name: "Production",
			createdAt: t,
			updatedAt: t,
			variables: [
				v("baseUrl", "https://jsonplaceholder.typicode.com"),
				v("email", ""),
				v("password", "", true),
				v("token", "", true),
				v("userId", "1")
			]
		}
	];
	return {
		version: 1,
		workspace,
		collections: [collection],
		items: [
			auth,
			users,
			posts,
			notesFolder,
			login,
			me,
			refresh,
			getUsers,
			getUser,
			updateUser,
			listPosts,
			createPost,
			echo,
			gettingStarted,
			authNote,
			jsonNote
		],
		environments,
		history: [],
		activeWorkspaceId: workspace.id,
		activeEnvironmentId: environments[0].id,
		activeItemId: gettingStarted.id,
		openTabIds: [
			gettingStarted.id,
			login.id,
			getUsers.id
		],
		collapsedIds: [],
		activeUtility: null
	};
}
var DB_NAME = "developer-scratchpad";
var STORE = "kv";
function fromLocal() {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return null;
		const parsed = JSON.parse(raw);
		return parsed?.version === 1 ? parsed : null;
	} catch {
		return null;
	}
}
function toLocal(snapshot) {
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
	} catch {}
}
function openDb() {
	return new Promise((resolve, reject) => {
		const req = indexedDB.open(DB_NAME, 1);
		req.onupgradeneeded = () => {
			const db = req.result;
			if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
		};
		req.onsuccess = () => resolve(req.result);
		req.onerror = () => reject(req.error ?? /* @__PURE__ */ new Error("idb open failed"));
	});
}
function withTimeout(promise, ms) {
	return new Promise((resolve, reject) => {
		const timer = setTimeout(() => reject(/* @__PURE__ */ new Error("timeout")), ms);
		promise.then((value) => {
			clearTimeout(timer);
			resolve(value);
		}, (err) => {
			clearTimeout(timer);
			reject(err);
		});
	});
}
function loadSnapshotSync() {
	if (typeof localStorage === "undefined") return null;
	return fromLocal();
}
async function saveSnapshot(snapshot) {
	toLocal(snapshot);
	if (typeof indexedDB === "undefined") return;
	try {
		const db = await withTimeout(openDb(), 800);
		await withTimeout(new Promise((resolve, reject) => {
			const tx = db.transaction(STORE, "readwrite");
			tx.objectStore(STORE).put(snapshot, STORAGE_KEY);
			tx.oncomplete = () => resolve();
			tx.onerror = () => reject(tx.error ?? /* @__PURE__ */ new Error("idb write failed"));
		}), 800);
		db.close();
	} catch {}
}
var persistTimer = null;
function applySnapshot(snap) {
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
		dirty: false
	};
}
var useScratchpad = create((set, get) => ({
	hydrated: false,
	workspace: {
		id: "pending",
		name: "Personal",
		createdAt: 0,
		updatedAt: 0
	},
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
	hydrate: async () => {
		try {
			const existing = loadSnapshotSync();
			set({
				...applySnapshot(existing ?? createSeed()),
				hydrated: true
			});
			if (!existing) get().persistSoon();
		} catch {
			set({
				...applySnapshot(createSeed()),
				hydrated: true
			});
		}
	},
	persistSoon: () => {
		set({ dirty: true });
		if (persistTimer) clearTimeout(persistTimer);
		persistTimer = setTimeout(() => {
			saveSnapshot(get().snapshot());
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
			activeUtility: s.activeUtility
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
	setSearchQuery: (searchQuery) => set({
		searchQuery,
		sidebarView: "search"
	}),
	setUtility: (activeUtility) => set({
		activeUtility,
		rightTab: "utility"
	}),
	selectItem: (id) => {
		if (!id) {
			set({ activeItemId: null });
			return;
		}
		const { openTabIds } = get();
		set({
			activeItemId: id,
			openTabIds: openTabIds.includes(id) ? openTabIds : [...openTabIds, id].slice(-12),
			mobilePane: "editor"
		});
		get().persistSoon();
	},
	closeTab: (id) => {
		const { openTabIds, activeItemId } = get();
		const next = openTabIds.filter((t) => t !== id);
		set({
			openTabIds: next,
			activeItemId: activeItemId === id ? next[next.length - 1] ?? null : activeItemId
		});
		get().persistSoon();
	},
	toggleCollapsed: (id) => {
		const { collapsedIds } = get();
		set({ collapsedIds: collapsedIds.includes(id) ? collapsedIds.filter((x) => x !== id) : [...collapsedIds, id] });
		get().persistSoon();
	},
	setEnvironment: (id) => {
		set({ activeEnvironmentId: id });
		get().persistSoon();
	},
	updateWorkspaceName: (name) => {
		set({ workspace: {
			...get().workspace,
			name,
			updatedAt: now()
		} });
		get().persistSoon();
	},
	addCollection: () => {
		const { workspace, collections } = get();
		const t = now();
		const col = {
			id: uid("col"),
			workspaceId: workspace.id,
			name: "New collection",
			description: "",
			order: collections.length,
			createdAt: t,
			updatedAt: t
		};
		set({ collections: [...collections, col] });
		get().persistSoon();
	},
	renameCollection: (id, name) => {
		set({ collections: get().collections.map((c) => c.id === id ? {
			...c,
			name,
			updatedAt: now()
		} : c) });
		get().persistSoon();
	},
	deleteCollection: (id) => {
		const { items, collections, activeItemId, openTabIds } = get();
		const removed = new Set(items.filter((i) => i.collectionId === id).map((i) => i.id));
		set({
			collections: collections.filter((c) => c.id !== id),
			items: items.filter((i) => i.collectionId !== id),
			openTabIds: openTabIds.filter((t) => !removed.has(t)),
			activeItemId: activeItemId && removed.has(activeItemId) ? null : activeItemId
		});
		get().persistSoon();
	},
	addItem: (kind, parentId, collectionId) => {
		const { collections, items } = get();
		const colId = collectionId ?? collections[0]?.id;
		if (!colId) return "";
		const t = now();
		const siblings = items.filter((i) => i.collectionId === colId && i.parentId === parentId);
		const base = {
			id: uid(kind === "note" ? "note" : kind === "folder" ? "fld" : "req"),
			collectionId: colId,
			parentId,
			kind,
			name: kind === "note" ? "Untitled note" : kind === "folder" ? "New folder" : "New request",
			order: siblings.length,
			tags: [],
			createdAt: t,
			updatedAt: t
		};
		if (kind === "request") {
			base.method = "GET";
			base.url = "{{baseUrl}}/";
			base.headers = emptyHeaders();
			base.bodyType = "none";
			base.body = "";
		}
		if (kind === "note") base.content = "# Untitled\n\n";
		set({
			items: [...items, base],
			activeItemId: kind === "folder" ? get().activeItemId : base.id
		});
		if (kind !== "folder") {
			const tabs = get().openTabIds;
			set({
				openTabIds: tabs.includes(base.id) ? tabs : [...tabs, base.id],
				mobilePane: "editor"
			});
		}
		get().persistSoon();
		return base.id;
	},
	duplicateItem: (id) => {
		const item = get().items.find((i) => i.id === id);
		if (!item) return null;
		const copy = {
			...item,
			id: uid(item.kind === "note" ? "note" : item.kind === "folder" ? "fld" : "req"),
			name: `${item.name} copy`,
			order: item.order + 1,
			createdAt: now(),
			updatedAt: now(),
			headers: item.headers?.map((h) => ({
				...h,
				id: uid("h")
			})),
			formFields: item.formFields?.map((f) => ({
				...f,
				id: uid("f")
			}))
		};
		set({ items: [...get().items, copy] });
		get().selectItem(copy.id);
		get().persistSoon();
		return copy.id;
	},
	renameItem: (id, name) => {
		set({ items: get().items.map((i) => i.id === id ? {
			...i,
			name,
			updatedAt: now()
		} : i) });
		get().persistSoon();
	},
	deleteItem: (id) => {
		const { items, openTabIds, activeItemId } = get();
		const remove = /* @__PURE__ */ new Set();
		const walk = (pid) => {
			remove.add(pid);
			items.filter((i) => i.parentId === pid).forEach((c) => walk(c.id));
		};
		walk(id);
		const nextItems = items.filter((i) => !remove.has(i.id));
		const nextTabs = openTabIds.filter((t) => !remove.has(t));
		set({
			items: nextItems,
			openTabIds: nextTabs,
			activeItemId: activeItemId && remove.has(activeItemId) ? nextTabs[nextTabs.length - 1] ?? null : activeItemId
		});
		get().persistSoon();
	},
	moveItem: (id, parentId, collectionId) => {
		set({ items: get().items.map((i) => i.id === id ? {
			...i,
			parentId,
			collectionId,
			updatedAt: now()
		} : i) });
		get().persistSoon();
	},
	updateRequest: (id, patch) => {
		set({ items: get().items.map((i) => i.id === id ? {
			...i,
			...patch,
			updatedAt: now()
		} : i) });
		get().persistSoon();
	},
	upsertHeader: (itemId, header) => {
		set({ items: get().items.map((i) => {
			if (i.id !== itemId) return i;
			const headers = i.headers ?? [];
			return {
				...i,
				headers: headers.some((h) => h.id === header.id) ? headers.map((h) => h.id === header.id ? header : h) : [...headers, header],
				updatedAt: now()
			};
		}) });
		get().persistSoon();
	},
	addHeaderRow: (itemId) => {
		set({ items: get().items.map((i) => i.id === itemId ? {
			...i,
			headers: [...i.headers ?? [], {
				id: uid("h"),
				key: "",
				value: "",
				enabled: true
			}],
			updatedAt: now()
		} : i) });
		get().persistSoon();
	},
	removeHeaderRow: (itemId, headerId) => {
		set({ items: get().items.map((i) => i.id === itemId ? {
			...i,
			headers: (i.headers ?? []).filter((h) => h.id !== headerId),
			updatedAt: now()
		} : i) });
		get().persistSoon();
	},
	updateEnvVar: (envId, variable) => {
		set({ environments: get().environments.map((e) => e.id === envId ? {
			...e,
			variables: e.variables.map((v) => v.id === variable.id ? variable : v),
			updatedAt: now()
		} : e) });
		get().persistSoon();
	},
	addEnvVar: (envId) => {
		set({ environments: get().environments.map((e) => e.id === envId ? {
			...e,
			variables: [...e.variables, {
				id: uid("v"),
				key: "",
				value: ""
			}],
			updatedAt: now()
		} : e) });
		get().persistSoon();
	},
	removeEnvVar: (envId, varId) => {
		set({ environments: get().environments.map((e) => e.id === envId ? {
			...e,
			variables: e.variables.filter((v) => v.id !== varId),
			updatedAt: now()
		} : e) });
		get().persistSoon();
	},
	addEnvironment: (name) => {
		const t = now();
		const env = {
			id: uid("env"),
			workspaceId: get().workspace.id,
			name,
			variables: [{
				id: uid("v"),
				key: "baseUrl",
				value: "https://"
			}],
			createdAt: t,
			updatedAt: t
		};
		set({
			environments: [...get().environments, env],
			activeEnvironmentId: env.id
		});
		get().persistSoon();
	},
	renameEnvironment: (id, name) => {
		set({ environments: get().environments.map((e) => e.id === id ? {
			...e,
			name,
			updatedAt: now()
		} : e) });
		get().persistSoon();
	},
	recordHistory: (entry) => {
		set({ history: [entry, ...get().history].slice(0, 80) });
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
	setLastResponse: (lastResponseItemId, lastResponse) => set({
		lastResponseItemId,
		lastResponse,
		rightTab: "response",
		mobilePane: "inspect"
	}),
	setSendState: (sendState, sendError = null) => set({
		sendState,
		sendError
	}),
	setCompare: (slot, id) => {
		const next = [...get().compareIds];
		next[slot] = id;
		set({ compareIds: next });
	},
	importPortable: (data) => {
		const t = now();
		const workspace = {
			...get().workspace,
			name: data.workspace.name || get().workspace.name,
			updatedAt: t
		};
		const collections = [];
		const items = [];
		data.collections.forEach((c, ci) => {
			const col = {
				id: uid("col"),
				workspaceId: workspace.id,
				name: c.name,
				description: c.description ?? "",
				order: c.order ?? ci,
				createdAt: t,
				updatedAt: t
			};
			collections.push(col);
			const pathMap = /* @__PURE__ */ new Map();
			const sorted = c.items.slice().sort((a, b) => a.parentPath.length - b.parentPath.length || a.order - b.order);
			for (const it of sorted) {
				const parentKey = it.parentPath.join("/");
				const parentId = parentKey ? pathMap.get(parentKey) ?? null : null;
				const id = uid(it.kind === "note" ? "note" : it.kind === "folder" ? "fld" : "req");
				if (it.kind === "folder") pathMap.set([...it.parentPath, it.name].join("/"), id);
				items.push({
					id,
					collectionId: col.id,
					parentId,
					kind: it.kind,
					name: it.name,
					order: it.order,
					tags: it.tags ?? [],
					method: it.method,
					url: it.url,
					headers: it.headers?.map((h) => ({
						...h,
						id: uid("h")
					})),
					bodyType: it.bodyType,
					body: it.body,
					formFields: it.formFields?.map((f) => ({
						...f,
						id: uid("f")
					})),
					content: it.content,
					createdAt: t,
					updatedAt: t
				});
			}
		});
		const environments = data.environments.map((e) => ({
			id: uid("env"),
			workspaceId: workspace.id,
			name: e.name,
			variables: e.variables.map((v) => ({
				...v,
				id: uid("v")
			})),
			createdAt: t,
			updatedAt: t
		}));
		set({
			workspace,
			collections,
			items,
			environments,
			activeEnvironmentId: environments[0]?.id ?? null,
			activeItemId: items.find((i) => i.kind !== "folder")?.id ?? null,
			openTabIds: items.filter((i) => i.kind !== "folder").slice(0, 3).map((i) => i.id),
			history: []
		});
		get().persistSoon();
	},
	resetToSeed: () => {
		set({
			...applySnapshot(createSeed()),
			hydrated: true
		});
		get().persistSoon();
	}
}));
function activeEnv() {
	const { environments, activeEnvironmentId } = useScratchpad.getState();
	return environments.find((e) => e.id === activeEnvironmentId);
}
function envVars() {
	const env = activeEnv();
	const out = {};
	for (const v of env?.variables ?? []) if (v.key.trim()) out[v.key.trim()] = v.value;
	return out;
}
async function sendParsed(parsed, sourceItem) {
	const store = useScratchpad.getState();
	if (store.sendState === "sending") return;
	store.setSendState("sending");
	const vars = envVars();
	const url = interpolate(parsed.url, vars);
	const headers = headersToRecord(parsed.headers, vars);
	let body = parsed.body ? interpolate(parsed.body, vars) : void 0;
	if (sourceItem?.bodyType === "urlencoded" && sourceItem.formFields?.length) {
		body = interpolate(encodeUrlencoded(sourceItem.formFields), vars);
		if (!headers["Content-Type"] && !headers["content-type"]) headers["Content-Type"] = "application/x-www-form-urlencoded";
	} else if (sourceItem?.bodyType === "form-data" && sourceItem.formFields?.length) {
		const fd = new URLSearchParams();
		for (const f of sourceItem.formFields) if (f.enabled && f.key) fd.append(interpolate(f.key, vars), interpolate(f.value, vars));
		body = fd.toString();
		headers["Content-Type"] = "application/x-www-form-urlencoded";
	}
	if (parsed.bodyType === "json" && body && !headers["Content-Type"] && !headers["content-type"]) headers["Content-Type"] = "application/json";
	try {
		const response = await executeRequest({
			method: parsed.method,
			url,
			headers,
			body
		});
		store.setLastResponse(sourceItem?.id ?? null, response);
		store.recordHistory({
			id: uid("hist"),
			requestId: sourceItem?.id,
			name: parsed.name || sourceItem?.name || url,
			method: parsed.method,
			url,
			requestHeaders: parsed.headers,
			requestBody: body,
			response,
			createdAt: Date.now()
		});
		store.setSendState("idle", response.error ?? null);
		if (response.error) toast.error(response.error);
		else toast.success(`${parsed.method} ${response.status} ${response.statusText || ""}`.trim());
	} catch (err) {
		const message = err instanceof Error ? err.message : String(err);
		store.setSendState("idle", message);
		toast.error(message);
	}
}
function itemToParsed(item) {
	return {
		name: item.name,
		method: item.method ?? "GET",
		url: item.url ?? "",
		headers: item.headers ?? [],
		body: item.body ?? "",
		bodyType: item.bodyType ?? "none"
	};
}
async function sendItem(item) {
	await sendParsed(itemToParsed(item), item);
}
var badgeVariants = cva("inline-flex items-center rounded-sm px-1.5 py-0.5 text-2xs font-semibold uppercase tracking-wide tabular-nums", {
	variants: { tone: {
		get: "bg-method-get/15 text-method-get",
		post: "bg-method-post/15 text-method-post",
		put: "bg-method-put/15 text-method-put",
		patch: "bg-method-patch/15 text-method-patch",
		delete: "bg-method-delete/15 text-method-delete",
		muted: "bg-elevated text-muted",
		success: "bg-success/15 text-success",
		warn: "bg-warn/15 text-warn",
		danger: "bg-danger/15 text-danger",
		info: "bg-info/15 text-info"
	} },
	defaultVariants: { tone: "muted" }
});
function Badge({ className, tone, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn(badgeVariants({ tone }), className),
		...props
	});
}
function methodTone(method) {
	const m = method.toLowerCase();
	if (m === "get") return "get";
	if (m === "post") return "post";
	if (m === "put") return "put";
	if (m === "patch") return "patch";
	if (m === "delete") return "delete";
	return "muted";
}
var Textarea = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
	ref,
	className: cn("flex min-h-24 w-full rounded-md border border-border bg-inset px-3 py-2 text-sm text-foreground placeholder:text-subtle", "font-mono leading-relaxed transition-[border-color,box-shadow] duration-150 ease-out", "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", "disabled:cursor-not-allowed disabled:opacity-40", className),
	...props
}));
Textarea.displayName = "Textarea";
var METHOD_LINE = /^(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)\s+\S+/i;
function parseMarkdown(source) {
	const lines = source.replace(/\r\n/g, "\n").split("\n");
	const blocks = [];
	let i = 0;
	const peek = () => lines[i] ?? "";
	while (i < lines.length) {
		const line = peek();
		if (line.trim() === "") {
			i += 1;
			continue;
		}
		if (/^```/.test(line)) {
			const lang = line.replace(/^```/, "").trim().toLowerCase();
			i += 1;
			const buf = [];
			while (i < lines.length && !/^```/.test(peek())) {
				buf.push(peek());
				i += 1;
			}
			if (i < lines.length) i += 1;
			const code = buf.join("\n");
			if (lang === "http" || lang === "rest") {
				const request = parseSingleRequest(code);
				if (request) {
					blocks.push({
						type: "http",
						request,
						raw: code
					});
					continue;
				}
			}
			blocks.push({
				type: "code",
				lang,
				code
			});
			continue;
		}
		if (METHOD_LINE.test(line.trim())) {
			const buf = [];
			while (i < lines.length) {
				const l = peek();
				if (/^#{1,6}\s/.test(l) || /^```/.test(l)) break;
				if (buf.length > 0 && METHOD_LINE.test(l.trim()) && buf[buf.length - 1]?.trim() === "") break;
				buf.push(l);
				i += 1;
				if (buf.length > 1 && l.trim() === "" && peek() && !/^[{\["']/.test(peek().trim()) && !HEADERISH(peek()) && !METHOD_LINE.test(peek().trim())) break;
			}
			const raw = buf.join("\n").trimEnd();
			const request = parseSingleRequest(raw);
			if (request) {
				blocks.push({
					type: "http",
					request,
					raw
				});
				continue;
			}
			blocks.push({
				type: "paragraph",
				text: raw
			});
			continue;
		}
		const heading = line.match(/^(#{1,6})\s+(.*)$/);
		if (heading) {
			blocks.push({
				type: "heading",
				level: heading[1].length,
				text: heading[2] ?? ""
			});
			i += 1;
			continue;
		}
		if (/^(-{3,}|\*{3,}|_{3,})\s*$/.test(line.trim())) {
			blocks.push({ type: "hr" });
			i += 1;
			continue;
		}
		if (/^>\s?/.test(line)) {
			const buf = [];
			while (i < lines.length && /^>\s?/.test(peek())) {
				buf.push(peek().replace(/^>\s?/, ""));
				i += 1;
			}
			blocks.push({
				type: "quote",
				text: buf.join("\n")
			});
			continue;
		}
		if (/^\|.+\|/.test(line) && /^\|?\s*:?-{3,}/.test(lines[i + 1] ?? "")) {
			const split = (row) => row.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((c) => c.trim());
			const headers = split(line);
			i += 2;
			const rows = [];
			while (i < lines.length && /^\|.+\|/.test(peek())) {
				rows.push(split(peek()));
				i += 1;
			}
			blocks.push({
				type: "table",
				headers,
				rows
			});
			continue;
		}
		if (/^\s*([-*+]|\d+\.)\s+/.test(line)) {
			const ordered = /^\s*\d+\.\s+/.test(line);
			const items = [];
			while (i < lines.length && /^\s*([-*+]|\d+\.)\s+/.test(peek())) {
				let text = peek().replace(/^\s*([-*+]|\d+\.)\s+/, "");
				let checked;
				const box = text.match(/^\[( |x|X)\]\s+(.*)$/);
				if (box) {
					checked = box[1] !== " ";
					text = box[2] ?? "";
				}
				items.push({
					text,
					checked
				});
				i += 1;
			}
			blocks.push({
				type: "list",
				ordered,
				items
			});
			continue;
		}
		const buf = [line];
		i += 1;
		while (i < lines.length) {
			const l = peek();
			if (l.trim() === "") break;
			if (/^#{1,6}\s/.test(l) || /^```/.test(l) || METHOD_LINE.test(l.trim()) || /^\s*([-*+]|\d+\.)\s+/.test(l) || /^>\s?/.test(l)) break;
			buf.push(l);
			i += 1;
		}
		blocks.push({
			type: "paragraph",
			text: buf.join("\n")
		});
	}
	return blocks;
}
function HEADERISH(line) {
	return /^[A-Za-z0-9!#$%&'*+.^_`|~-]+\s*:/.test(line);
}
function inlineToHtml(text) {
	return escapeHtml(text).replace(/`([^`]+)`/g, "<code class=\"md-code\">$1</code>").replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>").replace(/(^|[^\*])\*([^*\n]+)\*(?!\*)/g, "$1<em>$2</em>").replace(/\[([^\]]+)\]\((https?:[^)\s]+)\)/g, "<a href=\"$2\" target=\"_blank\" rel=\"noreferrer\">$1</a>").replace(/!\[([^\]]*)\]\((https?:[^)\s]+)\)/g, "<img alt=\"$1\" src=\"$2\" />");
}
function escapeHtml(text) {
	return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function HttpCard({ request, raw }) {
	const sending = useScratchpad((s) => s.sendState === "sending");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "my-3 overflow-hidden rounded-lg border border-border bg-inset",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-2 border-b border-border px-3 py-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					tone: methodTone(request.method),
					children: request.method
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
					className: "min-w-0 flex-1 truncate font-mono text-xs text-foreground",
					children: request.url
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					size: "sm",
					variant: "send",
					disabled: sending,
					onClick: () => void sendParsed(request),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-3" }), "Run"]
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
			className: "overflow-auto px-3 py-2 font-mono text-xs leading-relaxed text-muted",
			children: raw
		})]
	});
}
function MarkdownDoc({ source, className }) {
	const blocks = parseMarkdown(source || "");
	if (!blocks.length) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "px-6 py-10 text-sm text-muted",
		children: "Empty note. Switch to Edit to write Markdown."
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("article", {
		className: cn("px-4 py-4 text-sm leading-relaxed text-foreground sm:px-6 sm:py-5", className),
		children: blocks.map((block, i) => {
			if (block.type === "heading") {
				const Tag = `h${Math.min(block.level, 4)}`;
				const sizes = [
					"text-xl font-semibold tracking-tight sm:text-2xl",
					"text-lg font-semibold",
					"text-base font-medium",
					"text-sm font-medium"
				];
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tag, {
					className: cn("mb-2 mt-5 text-balance first:mt-0", sizes[block.level - 1] ?? sizes[3]),
					dangerouslySetInnerHTML: { __html: inlineToHtml(block.text) }
				}, i);
			}
			if (block.type === "paragraph") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mb-3 text-pretty text-muted",
				dangerouslySetInnerHTML: { __html: inlineToHtml(block.text) }
			}, i);
			if (block.type === "quote") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("blockquote", {
				className: "mb-3 border-l-2 border-accent/50 pl-3 text-muted",
				dangerouslySetInnerHTML: { __html: inlineToHtml(block.text) }
			}, i);
			if (block.type === "hr") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("hr", { className: "my-5 border-border" }, i);
			if (block.type === "list") {
				const List = block.ordered ? "ol" : "ul";
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(List, {
					className: cn("mb-3 space-y-1 pl-5 text-muted", block.ordered ? "list-decimal" : "list-disc"),
					children: block.items.map((item, j) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "text-pretty",
						children: [item.checked != null ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "mr-2 inline-flex size-3.5 items-center justify-center rounded-sm border border-border text-2xs",
							children: item.checked ? "✓" : ""
						}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { dangerouslySetInnerHTML: { __html: inlineToHtml(item.text) } })]
					}, j))
				}, i);
			}
			if (block.type === "table") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mb-4 overflow-auto rounded-md border border-border",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
					className: "w-full text-left text-xs",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
						className: "bg-elevated text-foreground",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: block.headers.map((h, j) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-2.5 py-1.5 font-medium",
							children: h
						}, j)) })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: block.rows.map((row, r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", {
						className: "border-t border-border",
						children: row.map((cell, c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-2.5 py-1.5 text-muted",
							dangerouslySetInnerHTML: { __html: inlineToHtml(cell) }
						}, c))
					}, r)) })]
				})
			}, i);
			if (block.type === "code") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
				className: "mb-4 overflow-auto rounded-md border border-border bg-inset px-3 py-2 font-mono text-xs leading-relaxed text-foreground",
				children: block.code
			}, i);
			if (block.type === "http") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HttpCard, {
				request: block.request,
				raw: block.raw
			}, i);
			return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", { children: escapeHtml(JSON.stringify(block)) }, i);
		})
	});
}
function NotePane({ item }) {
	const updateRequest = useScratchpad((s) => s.updateRequest);
	const [mode, setMode] = (0, import_react.useState)("preview");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-full min-h-0 flex-col",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-1 border-b border-border px-3 py-1.5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					variant: mode === "preview" ? "secondary" : "ghost",
					onClick: () => setMode("preview"),
					children: "Preview"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					variant: mode === "edit" ? "secondary" : "ghost",
					onClick: () => setMode("edit"),
					children: "Edit"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "ml-auto text-2xs text-subtle",
					children: "Markdown · HTTP blocks are executable"
				})
			]
		}), mode === "edit" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
			className: "min-h-0 flex-1 resize-none rounded-none border-0 focus-visible:ring-0",
			value: item.content ?? "",
			onChange: (e) => updateRequest(item.id, { content: e.target.value })
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "min-h-0 flex-1 overflow-auto",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MarkdownDoc, { source: item.content ?? "" })
		})]
	});
}
var Input = import_react.forwardRef(({ className, type, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
	type,
	ref,
	className: cn("flex h-8 w-full rounded-md border border-border bg-inset px-2.5 text-sm text-foreground placeholder:text-subtle", "transition-[border-color,box-shadow] duration-150 ease-out", "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", "disabled:cursor-not-allowed disabled:opacity-40", className),
	...props
}));
Input.displayName = "Input";
var Tabs = Root2$1;
function TabsList({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(List, {
		className: cn("inline-flex h-8 items-center gap-0.5 rounded-md bg-inset p-0.5", className),
		...props
	});
}
function TabsTrigger({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trigger$1, {
		className: cn("inline-flex h-7 items-center justify-center rounded-sm px-2.5 text-xs font-medium text-muted", "transition-colors duration-150 data-[state=active]:bg-elevated data-[state=active]:text-foreground", className),
		...props
	});
}
function TabsContent({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Content, {
		className: cn("outline-none", className),
		...props
	});
}
function RequestPane({ item }) {
	const updateRequest = useScratchpad((s) => s.updateRequest);
	const addHeaderRow = useScratchpad((s) => s.addHeaderRow);
	const upsertHeader = useScratchpad((s) => s.upsertHeader);
	const removeHeaderRow = useScratchpad((s) => s.removeHeaderRow);
	const sending = useScratchpad((s) => s.sendState === "sending");
	const [tab, setTab] = (0, import_react.useState)("headers");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-full min-h-0 flex-col",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex flex-col gap-2 border-b border-border p-3",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
						value: item.method ?? "GET",
						onChange: (e) => updateRequest(item.id, { method: e.target.value }),
						className: "h-9 w-[108px] rounded-md border border-border bg-elevated px-2 font-mono text-xs font-semibold",
						children: HTTP_METHODS.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: m }, m))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: item.url ?? "",
						onChange: (e) => updateRequest(item.id, { url: e.target.value }),
						placeholder: "https://api.example.com or {{baseUrl}}/path",
						className: "h-9 flex-1 font-mono",
						onKeyDown: (e) => {
							if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
								e.preventDefault();
								sendItem(item);
							}
						}
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "send",
						className: "h-9 px-4",
						disabled: sending,
						onClick: () => void sendItem(item),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-3.5" }), sending ? "Sending" : "Send"]
					})
				]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
			value: tab,
			onValueChange: setTab,
			className: "flex min-h-0 flex-1 flex-col",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "border-b border-border px-3 py-1.5",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
							value: "headers",
							children: "Headers"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
							value: "body",
							children: "Body"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
							value: "raw",
							children: "Raw HTTP"
						})
					] })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsContent, {
					value: "headers",
					className: "min-h-0 flex-1 overflow-auto p-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid grid-cols-[20px_1fr_1fr_28px] gap-1.5",
						children: (item.headers ?? []).map((h) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "contents",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									className: "flex size-8 items-center justify-center",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "checkbox",
										checked: h.enabled,
										onChange: (e) => upsertHeader(item.id, {
											...h,
											enabled: e.target.checked
										})
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: h.key,
									placeholder: "Header",
									className: "font-mono",
									onChange: (e) => upsertHeader(item.id, {
										...h,
										key: e.target.value
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: h.value,
									placeholder: "Value",
									className: "font-mono",
									onChange: (e) => upsertHeader(item.id, {
										...h,
										value: e.target.value
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "icon-sm",
									variant: "ghost",
									onClick: () => removeHeaderRow(item.id, h.id),
									children: "×"
								})
							]
						}, h.id))
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "ghost",
						className: "mt-2",
						onClick: () => addHeaderRow(item.id),
						children: "Add header"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsContent, {
					value: "body",
					className: "flex min-h-0 flex-1 flex-col p-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mb-2 flex flex-wrap gap-1",
						children: [
							"none",
							"json",
							"raw",
							"urlencoded",
							"form-data"
						].map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: item.bodyType === t ? "secondary" : "ghost",
							onClick: () => updateRequest(item.id, { bodyType: t }),
							children: t
						}, t))
					}), item.bodyType === "none" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted",
						children: "This request has no body."
					}) : item.bodyType === "urlencoded" || item.bodyType === "form-data" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FormFields, { item }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
						className: "min-h-0 flex-1",
						value: item.body ?? "",
						onChange: (e) => updateRequest(item.id, { body: e.target.value }),
						placeholder: item.bodyType === "json" ? "{ \"ok\": true }" : "raw body"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsContent, {
					value: "raw",
					className: "min-h-0 flex-1 overflow-auto p-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
						className: "rounded-md border border-border bg-inset p-3 font-mono text-xs leading-relaxed",
						children: serializeHttp({
							name: item.name,
							method: item.method ?? "GET",
							url: item.url ?? "",
							headers: item.headers,
							body: item.body
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "secondary",
						className: "mt-2",
						onClick: async () => {
							const ok = await copyText(toCurl({
								method: item.method ?? "GET",
								url: item.url ?? "",
								headers: item.headers,
								body: item.body
							}));
							toast[ok ? "success" : "error"](ok ? "Copied curl" : "Copy failed");
						},
						children: "Copy as curl"
					})]
				})
			]
		})]
	});
}
function FormFields({ item }) {
	const updateRequest = useScratchpad((s) => s.updateRequest);
	const fields = item.formFields ?? [];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-1.5",
		children: [fields.map((f, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid grid-cols-[1fr_1fr_28px] gap-1.5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: f.key,
					placeholder: "key",
					onChange: (e) => {
						const next = fields.map((x, idx) => idx === i ? {
							...x,
							key: e.target.value
						} : x);
						updateRequest(item.id, { formFields: next });
					}
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: f.value,
					placeholder: "value",
					onChange: (e) => {
						const next = fields.map((x, idx) => idx === i ? {
							...x,
							value: e.target.value
						} : x);
						updateRequest(item.id, { formFields: next });
					}
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "icon-sm",
					variant: "ghost",
					onClick: () => updateRequest(item.id, { formFields: fields.filter((_, idx) => idx !== i) }),
					children: "×"
				})
			]
		}, f.id)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			size: "sm",
			variant: "ghost",
			onClick: () => updateRequest(item.id, { formFields: [...fields, {
				id: crypto.randomUUID(),
				key: "",
				value: "",
				enabled: true
			}] }),
			children: "Add field"
		})]
	});
}
function CenterWorkspace() {
	const items = useScratchpad((s) => s.items);
	const openTabIds = useScratchpad((s) => s.openTabIds);
	const activeItemId = useScratchpad((s) => s.activeItemId);
	const selectItem = useScratchpad((s) => s.selectItem);
	const closeTab = useScratchpad((s) => s.closeTab);
	const addItem = useScratchpad((s) => s.addItem);
	const tabs = openTabIds.map((id) => items.find((i) => i.id === id)).filter(Boolean);
	const active = items.find((i) => i.id === activeItemId);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-full min-h-0 flex-col bg-background",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex h-9 shrink-0 items-center overflow-x-auto border-b border-border",
			children: tabs.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "px-3 text-xs text-muted",
				children: "No open tabs"
			}) : tabs.map((tab) => tab ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				onClick: () => selectItem(tab.id),
				className: cn("group flex h-full items-center gap-1.5 border-r border-border px-2.5 text-xs", tab.id === activeItemId ? "bg-elevated text-foreground" : "text-muted hover:text-foreground"),
				children: [
					tab.kind === "request" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						tone: methodTone(tab.method ?? "GET"),
						className: "min-w-9 justify-center px-1 text-2xs",
						children: tab.method ?? "GET"
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "size-3" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "max-w-36 truncate",
						children: tab.name
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						role: "button",
						tabIndex: 0,
						className: "rounded-sm p-0.5 text-subtle hover:bg-inset hover:text-foreground",
						onClick: (e) => {
							e.stopPropagation();
							closeTab(tab.id);
						},
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-3" })
					})
				]
			}, tab.id) : null)
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "min-h-0 flex-1",
			children: !active || active.kind === "folder" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyEditor, {
				onNewRequest: () => addItem("request", null),
				onNewNote: () => addItem("note", null)
			}) : active.kind === "request" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RequestPane, { item: active }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NotePane, { item: active })
		})]
	});
}
function EmptyEditor({ onNewRequest, onNewNote }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-full flex-col items-center justify-center gap-3 px-8 text-center",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-lg font-semibold tracking-tight",
				children: "Scratch something"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "max-w-sm text-sm text-muted",
				children: "Open a request from the tree, or start a note with executable HTTP blocks. Everything stays on this device."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: onNewRequest,
					className: "rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground",
					children: "New request"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: onNewNote,
					className: "rounded-md bg-elevated px-3 py-2 text-sm font-medium text-foreground shadow-[var(--shadow-border)]",
					children: "New note"
				})]
			})
		]
	});
}
var UTILITIES = [
	{
		id: "json-format",
		name: "JSON formatter",
		group: "JSON",
		hint: "Pretty-print JSON"
	},
	{
		id: "json-minify",
		name: "JSON minifier",
		group: "JSON",
		hint: "Compact JSON"
	},
	{
		id: "json-validate",
		name: "JSON validator",
		group: "JSON",
		hint: "Check JSON syntax"
	},
	{
		id: "json-tree",
		name: "JSON tree",
		group: "JSON",
		hint: "Inspect structure"
	},
	{
		id: "json-diff",
		name: "JSON diff",
		group: "JSON",
		hint: "Compare two payloads"
	},
	{
		id: "json-csv",
		name: "JSON → CSV",
		group: "JSON",
		hint: "Flatten arrays"
	},
	{
		id: "csv-json",
		name: "CSV → JSON",
		group: "JSON",
		hint: "Parse CSV tables"
	},
	{
		id: "base64-encode",
		name: "Base64 encode",
		group: "Encode",
		hint: "UTF-8 → Base64"
	},
	{
		id: "base64-decode",
		name: "Base64 decode",
		group: "Encode",
		hint: "Base64 → UTF-8"
	},
	{
		id: "url-encode",
		name: "URL encode",
		group: "Encode",
		hint: "Percent-encode"
	},
	{
		id: "url-decode",
		name: "URL decode",
		group: "Encode",
		hint: "Percent-decode"
	},
	{
		id: "html-entities",
		name: "HTML entities",
		group: "Encode",
		hint: "Escape / unescape"
	},
	{
		id: "jwt",
		name: "JWT inspector",
		group: "Encode",
		hint: "Decode header + payload"
	},
	{
		id: "url-parse",
		name: "URL parser",
		group: "Encode",
		hint: "Break apart a URL"
	},
	{
		id: "unicode",
		name: "Unicode inspector",
		group: "Text",
		hint: "Code points + UTF-8"
	},
	{
		id: "regex",
		name: "Regex tester",
		group: "Text",
		hint: "Match and capture"
	},
	{
		id: "epoch",
		name: "Epoch converter",
		group: "Time",
		hint: "Unix ↔ datetime"
	},
	{
		id: "hash",
		name: "Hash generator",
		group: "Crypto",
		hint: "SHA-1 / 256 / 512"
	},
	{
		id: "uuid",
		name: "UUID generator",
		group: "Generate",
		hint: "v4 identifiers"
	},
	{
		id: "lorem",
		name: "Sample generator",
		group: "Generate",
		hint: "Lorem, JSON, HTTP"
	}
];
function prettyJson(input) {
	try {
		return {
			ok: true,
			value: JSON.stringify(JSON.parse(input), null, 2)
		};
	} catch (err) {
		return {
			ok: false,
			error: err instanceof Error ? err.message : String(err)
		};
	}
}
function minifyJson(input) {
	try {
		return {
			ok: true,
			value: JSON.stringify(JSON.parse(input))
		};
	} catch (err) {
		return {
			ok: false,
			error: err instanceof Error ? err.message : String(err)
		};
	}
}
function validateJson(input) {
	try {
		JSON.parse(input);
		return { ok: true };
	} catch (err) {
		return {
			ok: false,
			error: err instanceof Error ? err.message : String(err)
		};
	}
}
function flatten(value, prefix = "", row = {}) {
	if (value && typeof value === "object" && !Array.isArray(value)) {
		for (const [k, v] of Object.entries(value)) flatten(v, prefix ? `${prefix}.${k}` : k, row);
		return row;
	}
	if (Array.isArray(value)) {
		row[prefix || "_"] = JSON.stringify(value);
		return row;
	}
	row[prefix || "_"] = value;
	return row;
}
function jsonToCsv(input) {
	try {
		const parsed = JSON.parse(input);
		const flat = (Array.isArray(parsed) ? parsed : [parsed]).map((r) => flatten(r));
		const keys = Array.from(new Set(flat.flatMap((r) => Object.keys(r))));
		const esc = (v) => {
			const s = v == null ? "" : String(v);
			return /[",\n]/.test(s) ? `"${s.replace(/"/g, "\"\"")}"` : s;
		};
		return {
			ok: true,
			value: [keys.join(","), ...flat.map((r) => keys.map((k) => esc(r[k])).join(","))].join("\n")
		};
	} catch (err) {
		return {
			ok: false,
			error: err instanceof Error ? err.message : String(err)
		};
	}
}
function csvToJson(input) {
	try {
		const lines = input.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n").filter((l) => l.length);
		if (!lines.length) return {
			ok: true,
			value: "[]"
		};
		const parseLine = (line) => {
			const cells = [];
			let cur = "";
			let inQuotes = false;
			for (let i = 0; i < line.length; i += 1) {
				const ch = line[i];
				if (inQuotes) {
					if (ch === "\"" && line[i + 1] === "\"") {
						cur += "\"";
						i += 1;
					} else if (ch === "\"") inQuotes = false;
					else cur += ch;
				} else if (ch === "\"") inQuotes = true;
				else if (ch === ",") {
					cells.push(cur);
					cur = "";
				} else cur += ch;
			}
			cells.push(cur);
			return cells;
		};
		const header = parseLine(lines[0]);
		const rows = lines.slice(1).map((line) => {
			const cells = parseLine(line);
			const obj = {};
			header.forEach((h, i) => {
				obj[h] = cells[i] ?? "";
			});
			return obj;
		});
		return {
			ok: true,
			value: JSON.stringify(rows, null, 2)
		};
	} catch (err) {
		return {
			ok: false,
			error: err instanceof Error ? err.message : String(err)
		};
	}
}
function bytesToBase64(text) {
	const bytes = new TextEncoder().encode(text);
	let bin = "";
	bytes.forEach((b) => {
		bin += String.fromCharCode(b);
	});
	return btoa(bin);
}
function base64ToBytes(b64) {
	const cleaned = b64.replace(/\s+/g, "");
	const bin = atob(cleaned);
	const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
	return new TextDecoder().decode(bytes);
}
function b64urlDecode(input) {
	const pad = input.replace(/-/g, "+").replace(/_/g, "/");
	return base64ToBytes(pad + "=".repeat((4 - pad.length % 4) % 4));
}
function inspectJwt(token) {
	const parts = token.trim().split(".");
	if (parts.length < 2) return {
		ok: false,
		error: "JWT must have at least two segments",
		raw: {
			header: "",
			payload: "",
			signature: ""
		}
	};
	try {
		const headerStr = b64urlDecode(parts[0]);
		const payloadStr = b64urlDecode(parts[1]);
		return {
			ok: true,
			header: JSON.parse(headerStr),
			payload: JSON.parse(payloadStr),
			raw: {
				header: headerStr,
				payload: payloadStr,
				signature: parts[2] ?? ""
			}
		};
	} catch (err) {
		return {
			ok: false,
			error: err instanceof Error ? err.message : String(err),
			raw: {
				header: "",
				payload: "",
				signature: parts[2] ?? ""
			}
		};
	}
}
function parseUrlParts(input) {
	try {
		const u = new URL(input);
		const params = {};
		u.searchParams.forEach((v, k) => {
			params[k] = v;
		});
		return {
			href: u.href,
			protocol: u.protocol,
			username: u.username,
			password: u.password ? "••••" : "",
			host: u.host,
			hostname: u.hostname,
			port: u.port,
			pathname: u.pathname,
			search: u.search,
			hash: u.hash,
			origin: u.origin,
			query: JSON.stringify(params, null, 2)
		};
	} catch (err) {
		return { error: err instanceof Error ? err.message : String(err) };
	}
}
function encodeHtml(input) {
	return input.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function decodeHtml(input) {
	return input.replace(/* @__PURE__ */ new RegExp("&lt;", "g"), "<").replace(/* @__PURE__ */ new RegExp("&gt;", "g"), ">").replace(/* @__PURE__ */ new RegExp("&quot;", "g"), "\"").replace(/* @__PURE__ */ new RegExp("&#39;", "g"), "'").replace(/* @__PURE__ */ new RegExp("&amp;", "g"), "&");
}
function inspectUnicode(input) {
	const out = [];
	for (const ch of input) {
		const cp = ch.codePointAt(0) ?? 0;
		const bytes = new TextEncoder().encode(ch);
		out.push({
			char: ch,
			hex: "U+" + cp.toString(16).toUpperCase().padStart(4, "0"),
			dec: cp,
			utf8: Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join(" ")
		});
	}
	return out;
}
async function digest(algo, text) {
	const buf = await crypto.subtle.digest(algo, new TextEncoder().encode(text));
	return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}
function epochToParts(value) {
	const trimmed = value.trim();
	if (!trimmed) {
		const d = /* @__PURE__ */ new Date();
		return {
			date: d.toString(),
			iso: d.toISOString(),
			unix: Math.floor(d.getTime() / 1e3),
			unixMs: d.getTime()
		};
	}
	let ms;
	if (/^-?\d+$/.test(trimmed)) {
		const n = Number(trimmed);
		ms = Math.abs(n) < 0xe8d4a51000 ? n * 1e3 : n;
	} else ms = Date.parse(trimmed);
	if (!Number.isFinite(ms)) return { error: "Could not parse as unix timestamp or date" };
	const d = new Date(ms);
	return {
		date: d.toString(),
		iso: d.toISOString(),
		unix: Math.floor(d.getTime() / 1e3),
		unixMs: d.getTime()
	};
}
function testRegex(pattern, flags, text) {
	try {
		const re = new RegExp(pattern, flags);
		const matches = [];
		if (flags.includes("g")) {
			let m;
			const clone = new RegExp(pattern, flags);
			while (m = clone.exec(text)) {
				matches.push({
					index: m.index,
					text: m[0],
					groups: m.slice(1)
				});
				if (m[0] === "") clone.lastIndex += 1;
				if (matches.length > 200) break;
			}
		} else {
			const m = text.match(re);
			if (m && m.index != null) matches.push({
				index: m.index,
				text: m[0],
				groups: m.slice(1)
			});
		}
		return {
			ok: true,
			matches,
			flags: re.flags
		};
	} catch (err) {
		return {
			ok: false,
			error: err instanceof Error ? err.message : String(err)
		};
	}
}
function jsonDiff(aText, bText) {
	try {
		return {
			ok: true,
			lines: lineDiff(JSON.stringify(JSON.parse(aText), null, 2).split("\n"), JSON.stringify(JSON.parse(bText), null, 2).split("\n"))
		};
	} catch (err) {
		return {
			ok: false,
			error: err instanceof Error ? err.message : String(err)
		};
	}
}
function lineDiff(a, b) {
	const n = a.length;
	const m = b.length;
	if (n + m > 2e3) {
		const out = [];
		const len = Math.max(n, m);
		for (let i = 0; i < len; i += 1) if (a[i] === b[i]) out.push({
			type: "same",
			text: a[i] ?? ""
		});
		else {
			if (i < n) out.push({
				type: "del",
				text: a[i]
			});
			if (i < m) out.push({
				type: "add",
				text: b[i]
			});
		}
		return out;
	}
	const dp = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0));
	for (let i = n - 1; i >= 0; i -= 1) for (let j = m - 1; j >= 0; j -= 1) dp[i][j] = a[i] === b[j] ? (dp[i + 1][j + 1] ?? 0) + 1 : Math.max(dp[i + 1][j] ?? 0, dp[i][j + 1] ?? 0);
	const out = [];
	let i = 0;
	let j = 0;
	while (i < n && j < m) if (a[i] === b[j]) {
		out.push({
			type: "same",
			text: a[i]
		});
		i += 1;
		j += 1;
	} else if ((dp[i + 1][j] ?? 0) >= (dp[i][j + 1] ?? 0)) {
		out.push({
			type: "del",
			text: a[i]
		});
		i += 1;
	} else {
		out.push({
			type: "add",
			text: b[j]
		});
		j += 1;
	}
	while (i < n) {
		out.push({
			type: "del",
			text: a[i]
		});
		i += 1;
	}
	while (j < m) {
		out.push({
			type: "add",
			text: b[j]
		});
		j += 1;
	}
	return out;
}
var SAMPLE = {
	lorem: "Scratch quickly. A developer workbench is most useful when the distance from thought to request is one keystroke. Keep notes next to the call, inspect the payload, transform it, and move on.",
	json: `{
  "id": 1,
  "email": "dev@local.test",
  "roles": ["reader", "editor"],
  "profile": { "name": "Ada", "timezone": "UTC" }
}`,
	http: `POST {{baseUrl}}/auth/login
Content-Type: application/json
Accept: application/json

{
  "username": "{{email}}",
  "password": "{{password}}"
}`,
	csv: `id,name,email
1,Ada Lovelace,ada@example.com
2,Grace Hopper,grace@example.com`
};
function CommandPalette() {
	const open = useScratchpad((s) => s.commandOpen);
	const setOpen = useScratchpad((s) => s.setCommandOpen);
	const items = useScratchpad((s) => s.items);
	const selectItem = useScratchpad((s) => s.selectItem);
	const addItem = useScratchpad((s) => s.addItem);
	const addCollection = useScratchpad((s) => s.addCollection);
	const setUtility = useScratchpad((s) => s.setUtility);
	const setSidebarView = useScratchpad((s) => s.setSidebarView);
	const setEnvEditorOpen = useScratchpad((s) => s.setEnvEditorOpen);
	const setShortcutsOpen = useScratchpad((s) => s.setShortcutsOpen);
	const activeItemId = useScratchpad((s) => s.activeItemId);
	const lastResponse = useScratchpad((s) => s.lastResponse);
	(0, import_react.useEffect)(() => {
		const onKey = (e) => {
			if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
				e.preventDefault();
				setOpen(!open);
			}
			if (e.key === "Escape" && open) {
				e.preventDefault();
				setOpen(false);
			}
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [open, setOpen]);
	const files = (0, import_react.useMemo)(() => items.filter((i) => i.kind === "request" || i.kind === "note"), [items]);
	if (!open) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-0 z-50 flex items-start justify-center bg-overlay px-3 pt-[12vh]",
		onClick: () => setOpen(false),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(_e, {
			label: "Command palette",
			className: "w-full max-w-xl overflow-hidden rounded-xl border border-border bg-surface shadow-[var(--shadow-pop)]",
			onClick: (e) => e.stopPropagation(),
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(_e.Input, {
				autoFocus: true,
				placeholder: "Search commands and files…",
				className: "h-11 w-full border-b border-border bg-transparent px-4 text-sm outline-none placeholder:text-subtle"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(_e.List, {
				className: "max-h-80 overflow-auto p-1",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(_e.Empty, {
						className: "px-3 py-6 text-center text-sm text-muted",
						children: "No results."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(_e.Group, {
						heading: "Go",
						className: "px-1 py-1 text-2xs font-medium uppercase tracking-wider text-subtle",
						children: files.map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(_e.Item, {
							value: `${f.kind} ${f.name} ${f.url ?? ""}`,
							onSelect: () => {
								selectItem(f.id);
								setOpen(false);
							},
							className: "flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm data-[selected=true]:bg-elevated",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-muted",
								children: f.kind === "request" ? f.method : "MD"
							}), f.name]
						}, f.id))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(_e.Group, {
						heading: "Create",
						className: "px-1 py-1 text-2xs font-medium uppercase tracking-wider text-subtle",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Item, {
								onSelect: () => {
									addItem("request", null);
									setOpen(false);
								},
								children: "New request"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Item, {
								onSelect: () => {
									addItem("note", null);
									setOpen(false);
								},
								children: "New note"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Item, {
								onSelect: () => {
									addItem("folder", null);
									setOpen(false);
								},
								children: "New folder"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Item, {
								onSelect: () => {
									addCollection();
									setOpen(false);
								},
								children: "New collection"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(_e.Group, {
						heading: "Run",
						className: "px-1 py-1 text-2xs font-medium uppercase tracking-wider text-subtle",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Item, {
								onSelect: () => {
									const item = items.find((i) => i.id === activeItemId);
									if (item?.kind === "request") sendItem(item);
									setOpen(false);
								},
								children: "Send active request"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Item, {
								onSelect: () => {
									setSidebarView("history");
									setOpen(false);
								},
								children: "Open history"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Item, {
								onSelect: () => {
									setSidebarView("search");
									setOpen(false);
								},
								children: "Search workspace"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Item, {
								onSelect: () => {
									setEnvEditorOpen(true);
									setOpen(false);
								},
								children: "Edit environments"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Item, {
								onSelect: () => {
									setShortcutsOpen(true);
									setOpen(false);
								},
								children: "Keyboard shortcuts"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(_e.Group, {
						heading: "Utilities",
						className: "px-1 py-1 text-2xs font-medium uppercase tracking-wider text-subtle",
						children: UTILITIES.map((u) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Item, {
							onSelect: () => {
								setUtility(u.id);
								setOpen(false);
							},
							children: u.name
						}, u.id))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(_e.Group, {
						heading: "Import / export",
						className: "px-1 py-1 text-2xs font-medium uppercase tracking-wider text-subtle",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Item, {
								onSelect: () => {
									const snap = useScratchpad.getState().snapshot();
									downloadText("scratchpad-workspace.json", JSON.stringify(toPortable(snap), null, 2), "application/json");
									toast.success("Workspace exported");
									setOpen(false);
								},
								children: "Export workspace JSON"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Item, {
								onSelect: () => {
									downloadText("scratchpad.http", exportHttpBundle(useScratchpad.getState().snapshot()), "text/plain");
									toast.success("HTTP file exported");
									setOpen(false);
								},
								children: "Export HTTP file"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Item, {
								onSelect: () => {
									const item = items.find((i) => i.id === activeItemId);
									if (item?.kind === "note") {
										downloadText(`${item.name.replace(/\s+/g, "-")}.md`, item.content ?? "", "text/markdown");
										toast.success("Markdown exported");
									} else toast.error("Open a note first");
									setOpen(false);
								},
								children: "Export active note as Markdown"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Item, {
								onSelect: () => {
									if (!lastResponse) toast.error("No response to export");
									else {
										downloadText("response.json", lastResponse.body, "application/json");
										toast.success("Response exported");
									}
									setOpen(false);
								},
								children: "Export response JSON"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Item, {
								onSelect: () => {
									const input = document.createElement("input");
									input.type = "file";
									input.accept = "application/json";
									input.onchange = async () => {
										const file = input.files?.[0];
										if (!file) return;
										try {
											const data = JSON.parse(await file.text());
											if (!isPortable(data)) throw new Error("Not a scratchpad workspace");
											useScratchpad.getState().importPortable(data);
											toast.success("Workspace imported");
										} catch (err) {
											toast.error(err instanceof Error ? err.message : "Import failed");
										}
									};
									input.click();
									setOpen(false);
								},
								children: "Import workspace JSON"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Item, {
								onSelect: () => {
									if (window.confirm("Reset this workspace to the sample data? Your local data will be replaced.")) {
										useScratchpad.getState().resetToSeed();
										toast.success("Restored sample workspace");
									}
									setOpen(false);
								},
								children: "Restore sample workspace"
							})
						]
					})
				]
			})]
		})
	});
}
function Item({ children, onSelect }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(_e.Item, {
		onSelect,
		className: "flex cursor-pointer items-center rounded-md px-2 py-1.5 text-sm data-[selected=true]:bg-elevated",
		children
	});
}
var Dialog = Dialog$1;
var DialogPortal = DialogPortal$1;
function DialogOverlay({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay$1, {
		className: cn("fixed inset-0 z-50 bg-overlay data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0", className),
		...props
	});
}
function DialogContent({ className, children, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogPortal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent$1, {
		className: cn("fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-surface p-4 shadow-[var(--shadow-pop)]", "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0", className),
		...props,
		children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogClose, {
			className: "absolute right-3 top-3 rounded-md p-1 text-muted hover:bg-elevated hover:text-foreground",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "sr-only",
				children: "Close"
			})]
		})]
	})] });
}
function DialogTitle({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle$1, {
		className: cn("text-base font-semibold tracking-tight", className),
		...props
	});
}
function DialogDescription({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription$1, {
		className: cn("text-sm text-muted", className),
		...props
	});
}
function EnvEditor() {
	const open = useScratchpad((s) => s.envEditorOpen);
	const setOpen = useScratchpad((s) => s.setEnvEditorOpen);
	const environments = useScratchpad((s) => s.environments);
	const activeEnvironmentId = useScratchpad((s) => s.activeEnvironmentId);
	const setEnvironment = useScratchpad((s) => s.setEnvironment);
	const updateEnvVar = useScratchpad((s) => s.updateEnvVar);
	const addEnvVar = useScratchpad((s) => s.addEnvVar);
	const removeEnvVar = useScratchpad((s) => s.removeEnvVar);
	const addEnvironment = useScratchpad((s) => s.addEnvironment);
	const renameEnvironment = useScratchpad((s) => s.renameEnvironment);
	const env = environments.find((e) => e.id === activeEnvironmentId) ?? environments[0];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange: setOpen,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "max-h-[80vh] overflow-auto",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Environments" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogDescription, { children: [
					"Variables such as ",
					"{{baseUrl}}",
					" and ",
					"{{token}}",
					" resolve from the active environment. Secret values stay in this browser."
				] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 flex flex-wrap gap-1",
					children: [environments.map((e) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: e.id === env?.id ? "secondary" : "ghost",
						onClick: () => setEnvironment(e.id),
						children: e.name
					}, e.id)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "ghost",
						onClick: () => {
							const name = window.prompt("Environment name", "New env");
							if (name) addEnvironment(name);
						},
						children: "Add"
					})]
				}),
				env ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 flex flex-col gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: env.name,
							onChange: (e) => renameEnvironment(env.id, e.target.value),
							className: "max-w-xs"
						}),
						env.variables.map((v) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-[1fr_1fr_28px] gap-1.5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: v.key,
									placeholder: "key",
									className: "font-mono",
									onChange: (e) => updateEnvVar(env.id, {
										...v,
										key: e.target.value
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: v.value,
									placeholder: "value",
									type: v.secret ? "password" : "text",
									className: "font-mono",
									onChange: (e) => updateEnvVar(env.id, {
										...v,
										value: e.target.value
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "icon-sm",
									variant: "ghost",
									onClick: () => removeEnvVar(env.id, v.id),
									children: "×"
								})
							]
						}, v.id)),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "ghost",
							onClick: () => addEnvVar(env.id),
							children: "Add variable"
						})
					]
				}) : null
			]
		})
	});
}
var PREVIEW_LIMIT = 80;
var ARRAY_PAGE = 50;
function preview(value) {
	if (value === null) return "null";
	if (typeof value === "string") return JSON.stringify(value.length > PREVIEW_LIMIT ? value.slice(0, PREVIEW_LIMIT) + "…" : value);
	if (typeof value === "number" || typeof value === "boolean") return String(value);
	if (Array.isArray(value)) return `Array(${value.length})`;
	if (typeof value === "object") return `{${Object.keys(value).length}}`;
	return String(value);
}
function tone(value) {
	if (value === null) return "text-subtle";
	if (typeof value === "string") return "text-success";
	if (typeof value === "number") return "text-info";
	if (typeof value === "boolean") return "text-warn";
	return "text-muted";
}
function Node({ name, value, depth }) {
	const isExpandable = value !== null && typeof value === "object";
	const [open, setOpen] = (0, import_react.useState)(depth < 2);
	const [shown, setShown] = (0, import_react.useState)(ARRAY_PAGE);
	if (!isExpandable) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex gap-2 py-px font-mono text-xs leading-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-accent",
				children: name
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-subtle",
				children: ":"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: cn("break-all", tone(value)),
				children: preview(value)
			})
		]
	});
	const entries = Array.isArray(value) ? value.map((v, i) => [String(i), v]) : Object.entries(value);
	const visible = entries.slice(0, shown);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		onClick: () => setOpen((v) => !v),
		className: "flex w-full items-center gap-1 rounded-sm py-px text-left font-mono text-xs leading-5 hover:bg-elevated",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: cn("size-3 text-subtle transition-transform duration-150", open && "rotate-90") }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-accent",
				children: name
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-subtle",
				children: preview(value)
			})
		]
	}), open ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "ml-2 border-l border-border pl-3",
		children: [visible.map(([k, v]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Node, {
			name: k,
			value: v,
			depth: depth + 1
		}, k)), entries.length > shown ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			type: "button",
			className: "mt-1 text-xs text-accent hover:underline",
			onClick: () => setShown((s) => s + ARRAY_PAGE),
			children: [
				"Show ",
				Math.min(ARRAY_PAGE, entries.length - shown),
				" more"
			]
		}) : null]
	}) : null] });
}
function JsonTree({ raw, className }) {
	const parsed = (0, import_react.useMemo)(() => {
		try {
			return {
				ok: true,
				value: JSON.parse(raw)
			};
		} catch (err) {
			return {
				ok: false,
				error: err instanceof Error ? err.message : String(err)
			};
		}
	}, [raw]);
	if (!raw.trim()) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "px-3 py-6 text-sm text-muted",
		children: "No JSON to inspect."
	});
	if (!parsed.ok) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "px-3 py-4 font-mono text-xs text-danger",
		children: parsed.error
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("px-2 py-2", className),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Node, {
			name: "root",
			value: parsed.value,
			depth: 0
		})
	});
}
function statusTone(status) {
	if (status >= 200 && status < 300) return "success";
	if (status >= 300 && status < 400) return "info";
	if (status >= 400 && status < 500) return "warn";
	if (status >= 500) return "danger";
	return "muted";
}
function ResponseView({ response }) {
	const [tab, setTab] = (0, import_react.useState)("pretty");
	const ct = response ? contentTypeOf(response.headers) : "";
	const pretty = (0, import_react.useMemo)(() => response ? prettyBody(response.body, ct) : "", [response, ct]);
	const isHtml = ct.includes("html");
	const isJson = ct.includes("json") || (response ? prettyBodyLooksJson(response.body) : false);
	if (!response) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-full flex-col items-center justify-center gap-2 px-6 text-center",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm font-medium text-foreground",
			children: "No response yet"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "max-w-xs text-xs text-muted",
			children: "Send a request with Ctrl/⌘ Enter. Status, headers, cookies, and JSON land here."
		})]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-full flex-col",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center gap-2 border-b border-border px-3 py-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						tone: response.error ? "danger" : statusTone(response.status),
						children: response.error ? "ERR" : response.status || "—"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs text-muted",
						children: response.statusText
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "tabular-nums text-xs text-muted",
						children: formatDuration(response.timeMs)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "tabular-nums text-xs text-muted",
						children: formatBytes(response.size)
					}),
					response.fromProxy ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						tone: "muted",
						children: "proxy"
					}) : null,
					response.truncated ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						tone: "warn",
						children: "truncated"
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "ml-auto flex gap-1",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "ghost",
							onClick: async () => {
								const ok = await copyText(isJson ? pretty : response.body);
								toast[ok ? "success" : "error"](ok ? "Copied response" : "Copy failed");
							},
							children: "Copy"
						})
					})
				]
			}),
			response.error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "border-b border-border px-3 py-2 text-xs text-danger",
				children: response.error
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
				value: tab,
				onValueChange: (v) => setTab(v),
				className: "flex min-h-0 flex-1 flex-col",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "border-b border-border px-2 py-1",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
							value: "pretty",
							children: "Pretty"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
							value: "raw",
							children: "Raw"
						}),
						isJson ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
							value: "tree",
							children: "Tree"
						}) : null,
						isHtml ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
							value: "html",
							children: "HTML"
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
							value: "headers",
							children: "Headers"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
							value: "cookies",
							children: "Cookies"
						})
					] })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-h-0 flex-1 overflow-auto",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
							value: "pretty",
							className: "h-full",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
								className: "whitespace-pre-wrap break-all px-3 py-2 font-mono text-xs leading-relaxed text-foreground",
								children: pretty || "Empty body"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
							value: "raw",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
								className: "whitespace-pre-wrap break-all px-3 py-2 font-mono text-xs leading-relaxed text-muted",
								children: response.body || "Empty body"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
							value: "tree",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(JsonTree, { raw: response.body })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
							value: "html",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("iframe", {
								title: "HTML response",
								sandbox: "",
								className: "h-[480px] w-full bg-primary",
								srcDoc: response.body
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
							value: "headers",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("table", {
								className: "w-full text-left text-xs",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: Object.entries(response.headers).map(([k, v]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
									className: "border-b border-border",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "w-[38%] px-3 py-1.5 font-mono text-accent",
										children: k
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "break-all px-3 py-1.5 font-mono text-foreground",
										children: v
									})]
								}, k)) })
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
							value: "cookies",
							children: response.cookies.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "px-3 py-6 text-xs text-muted",
								children: "No Set-Cookie headers."
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
								className: "divide-y divide-border",
								children: response.cookies.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									className: "px-3 py-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "font-mono text-xs text-accent",
										children: c.name
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "break-all font-mono text-xs text-muted",
										children: c.value
									})]
								}, c.name))
							})
						})
					]
				})]
			})
		]
	});
}
function prettyBodyLooksJson(body) {
	const t = body.trim();
	return t.startsWith("{") && t.endsWith("}") || t.startsWith("[") && t.endsWith("]");
}
function UtilityPanel() {
	const active = useScratchpad((s) => s.activeUtility) ?? "json-format";
	const setUtility = useScratchpad((s) => s.setUtility);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-full min-h-0 flex-col",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "border-b border-border px-2 py-2",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
				value: active,
				onChange: (e) => setUtility(e.target.value),
				className: "h-8 w-full rounded-md border border-border bg-inset px-2 text-sm text-foreground",
				children: UTILITIES.map((u) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
					value: u.id,
					children: [
						u.group,
						" · ",
						u.name
					]
				}, u.id))
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "min-h-0 flex-1 overflow-auto p-3",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UtilityBody, { id: active })
		})]
	});
}
function CopyOut({ value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
		size: "sm",
		variant: "secondary",
		onClick: async () => {
			const ok = await copyText(value);
			toast[ok ? "success" : "error"](ok ? "Copied" : "Copy failed");
		},
		children: "Copy"
	});
}
function IoBox({ label, value, onChange, result, onRun, runLabel = "Run", rows = 8 }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-2",
		children: [
			label ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs font-medium text-muted",
				children: label
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
				rows,
				value,
				onChange: (e) => onChange(e.target.value)
			}),
			onRun ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					variant: "send",
					onClick: onRun,
					children: runLabel
				}), result ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CopyOut, { value: result }) : null]
			}) : null,
			result != null ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
				className: "max-h-72 overflow-auto rounded-md border border-border bg-inset p-2 font-mono text-xs leading-relaxed text-foreground",
				children: result || "—"
			}) : null
		]
	});
}
function UtilityBody({ id }) {
	const [a, setA] = (0, import_react.useState)("");
	const [b, setB] = (0, import_react.useState)("");
	const [out, setOut] = (0, import_react.useState)("");
	const [flags, setFlags] = (0, import_react.useState)("g");
	const [hashAlgo, setHashAlgo] = (0, import_react.useState)("SHA-256");
	const [uuids, setUuids] = (0, import_react.useState)([]);
	if (id === "json-format") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IoBox, {
		label: "JSON",
		value: a,
		onChange: setA,
		result: out,
		onRun: () => {
			const r = prettyJson(a);
			setOut(r.ok ? r.value : r.error);
		},
		runLabel: "Format"
	});
	if (id === "json-minify") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IoBox, {
		value: a,
		onChange: setA,
		result: out,
		onRun: () => {
			const r = minifyJson(a);
			setOut(r.ok ? r.value : r.error);
		},
		runLabel: "Minify"
	});
	if (id === "json-validate") {
		const r = a.trim() ? validateJson(a) : null;
		return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
				rows: 10,
				value: a,
				onChange: (e) => setA(e.target.value),
				placeholder: "{ }"
			}), r ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: r.ok ? "text-sm text-success" : "text-sm text-danger",
				children: r.ok ? "Valid JSON" : r.error
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted",
				children: "Paste JSON to validate."
			})]
		});
	}
	if (id === "json-tree") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
			rows: 6,
			value: a,
			onChange: (e) => setA(e.target.value),
			placeholder: "{ }"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "rounded-md border border-border",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(JsonTree, { raw: a })
		})]
	});
	if (id === "json-diff") {
		const diff = a.trim() && b.trim() ? jsonDiff(a, b) : null;
		return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col gap-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
					rows: 5,
					value: a,
					onChange: (e) => setA(e.target.value),
					placeholder: "Left JSON"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
					rows: 5,
					value: b,
					onChange: (e) => setB(e.target.value),
					placeholder: "Right JSON"
				}),
				diff && !diff.ok ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-danger",
					children: diff.error
				}) : null,
				diff && diff.ok ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
					className: "max-h-80 overflow-auto rounded-md border border-border bg-inset p-2 font-mono text-xs",
					children: diff.lines.map((l, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: l.type === "add" ? "bg-success/15 text-success" : l.type === "del" ? "bg-danger/15 text-danger" : "text-muted",
						children: [
							l.type === "add" ? "+" : l.type === "del" ? "−" : " ",
							" ",
							l.text
						]
					}, i))
				}) : null
			]
		});
	}
	if (id === "json-csv") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IoBox, {
		value: a,
		onChange: setA,
		result: out,
		onRun: () => {
			const r = jsonToCsv(a);
			setOut(r.ok ? r.value : r.error);
		},
		runLabel: "To CSV"
	});
	if (id === "csv-json") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IoBox, {
		value: a,
		onChange: setA,
		result: out,
		onRun: () => {
			const r = csvToJson(a);
			setOut(r.ok ? r.value : r.error);
		},
		runLabel: "To JSON"
	});
	if (id === "base64-encode") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IoBox, {
		value: a,
		onChange: setA,
		result: out,
		onRun: () => {
			try {
				setOut(bytesToBase64(a));
			} catch (e) {
				setOut(e instanceof Error ? e.message : String(e));
			}
		}
	});
	if (id === "base64-decode") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IoBox, {
		value: a,
		onChange: setA,
		result: out,
		onRun: () => {
			try {
				setOut(base64ToBytes(a));
			} catch (e) {
				setOut(e instanceof Error ? e.message : String(e));
			}
		}
	});
	if (id === "url-encode") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IoBox, {
		value: a,
		onChange: setA,
		result: out,
		onRun: () => setOut(encodeURIComponent(a))
	});
	if (id === "url-decode") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IoBox, {
		value: a,
		onChange: setA,
		result: out,
		onRun: () => {
			try {
				setOut(decodeURIComponent(a));
			} catch (e) {
				setOut(e instanceof Error ? e.message : String(e));
			}
		}
	});
	if (id === "html-entities") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-2",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
				rows: 6,
				value: a,
				onChange: (e) => setA(e.target.value)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "secondary",
						onClick: () => setOut(encodeHtml(a)),
						children: "Encode"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "secondary",
						onClick: () => setOut(decodeHtml(a)),
						children: "Decode"
					}),
					out ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CopyOut, { value: out }) : null
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
				className: "max-h-56 overflow-auto rounded-md border border-border bg-inset p-2 font-mono text-xs",
				children: out
			})
		]
	});
	if (id === "jwt") {
		const info = a.trim() ? inspectJwt(a) : null;
		return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col gap-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
					rows: 4,
					value: a,
					onChange: (e) => setA(e.target.value),
					placeholder: "eyJhbGciOi..."
				}),
				info && !info.ok ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-danger",
					children: info.error
				}) : null,
				info?.ok ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted",
						children: "Header"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
						className: "overflow-auto rounded-md border border-border bg-inset p-2 font-mono text-xs",
						children: JSON.stringify(info.header, null, 2)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted",
						children: "Payload"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
						className: "overflow-auto rounded-md border border-border bg-inset p-2 font-mono text-xs",
						children: JSON.stringify(info.payload, null, 2)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-2xs text-subtle",
						children: "Signature is not verified. Secret keys never leave this browser."
					})
				] }) : null
			]
		});
	}
	if (id === "url-parse") {
		const parsed = a.trim() ? parseUrlParts(a) : null;
		return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col gap-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: a,
					onChange: (e) => setA(e.target.value),
					placeholder: "https://api.example.com/v1?x=1"
				}),
				parsed && "error" in parsed ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-danger",
					children: parsed.error
				}) : null,
				parsed && !("error" in parsed) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dl", {
					className: "space-y-1 font-mono text-xs",
					children: Object.entries(parsed).map(([k, v]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-[88px_1fr] gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
							className: "text-subtle",
							children: k
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
							className: "break-all text-foreground",
							children: v
						})]
					}, k))
				}) : null
			]
		});
	}
	if (id === "unicode") {
		const rows = inspectUnicode(a).slice(0, 200);
		return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				value: a,
				onChange: (e) => setA(e.target.value),
				placeholder: "Paste characters"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
				className: "w-full text-left text-xs",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
					className: "text-muted",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "py-1",
							children: "Char"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Hex" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Dec" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "UTF-8" })
					] })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", {
					className: "font-mono",
					children: rows.map((r, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						className: "border-t border-border",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "py-1",
								children: r.char
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: r.hex }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: r.dec }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: r.utf8 })
						]
					}, i))
				})]
			})]
		});
	}
	if (id === "regex") {
		const result = a ? testRegex(a, flags, b) : null;
		return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col gap-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: a,
						onChange: (e) => setA(e.target.value),
						placeholder: "pattern",
						className: "font-mono"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: flags,
						onChange: (e) => setFlags(e.target.value),
						className: "w-20 font-mono"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
					rows: 6,
					value: b,
					onChange: (e) => setB(e.target.value),
					placeholder: "test string"
				}),
				result && !result.ok ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-danger",
					children: result.error
				}) : null,
				result && result.ok ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "text-xs",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mb-1 text-muted",
						children: [
							result.matches.length,
							" match",
							result.matches.length === 1 ? "" : "es"
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "space-y-1 font-mono",
						children: result.matches.map((m, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "rounded-sm bg-elevated px-2 py-1",
							children: [
								"@",
								m.index,
								" ",
								JSON.stringify(m.text),
								m.groups.length ? ` groups=${JSON.stringify(m.groups)}` : ""
							]
						}, i))
					})]
				}) : null
			]
		});
	}
	if (id === "epoch") {
		const parts = epochToParts(a);
		return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col gap-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: a,
					onChange: (e) => setA(e.target.value),
					placeholder: "1710000000 or ISO date"
				}),
				"error" in parts ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-danger",
					children: parts.error
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
					className: "space-y-1 font-mono text-xs",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: ["unix ", parts.unix] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: ["ms ", parts.unixMs] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: parts.iso }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-muted",
							children: parts.date
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					variant: "secondary",
					onClick: () => setA(String(Math.floor(Date.now() / 1e3))),
					children: "Now"
				})
			]
		});
	}
	if (id === "hash") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-2",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
				rows: 5,
				value: a,
				onChange: (e) => setA(e.target.value)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
					value: hashAlgo,
					onChange: (e) => setHashAlgo(e.target.value),
					className: "h-8 rounded-md border border-border bg-inset px-2 text-xs",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "SHA-1" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "SHA-256" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "SHA-512" })
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					variant: "send",
					onClick: async () => {
						setOut(await digest(hashAlgo, a));
					},
					children: "Hash"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
				className: "break-all rounded-md border border-border bg-inset p-2 font-mono text-xs",
				children: out
			})
		]
	});
	if (id === "uuid") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-2",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				size: "sm",
				variant: "send",
				onClick: () => {
					const next = crypto.randomUUID();
					setOut(next);
					setUuids((prev) => [next, ...prev].slice(0, 8));
				},
				children: "Generate"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
				className: "rounded-md border border-border bg-inset p-2 font-mono text-xs",
				children: out || "Click generate"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "space-y-1 font-mono text-xs text-muted",
				children: uuids.map((x) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: x }, x))
			})
		]
	});
	if (id === "lorem") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-2",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				size: "sm",
				variant: "secondary",
				onClick: () => setOut(SAMPLE.lorem),
				children: "Paragraph"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				size: "sm",
				variant: "secondary",
				onClick: () => setOut(SAMPLE.json),
				children: "JSON"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				size: "sm",
				variant: "secondary",
				onClick: () => setOut(SAMPLE.http),
				children: "HTTP"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				size: "sm",
				variant: "secondary",
				onClick: () => setOut(SAMPLE.csv),
				children: "CSV"
			}),
			out ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CopyOut, { value: out }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
				className: "overflow-auto rounded-md border border-border bg-inset p-2 font-mono text-xs",
				children: out
			})] }) : null
		]
	});
	return null;
}
function RightDrawer() {
	const tab = useScratchpad((s) => s.rightTab);
	const setTab = useScratchpad((s) => s.setRightTab);
	const lastResponse = useScratchpad((s) => s.lastResponse);
	const items = useScratchpad((s) => s.items);
	const activeItemId = useScratchpad((s) => s.activeItemId);
	const environments = useScratchpad((s) => s.environments);
	const activeEnvironmentId = useScratchpad((s) => s.activeEnvironmentId);
	const history = useScratchpad((s) => s.history);
	const item = items.find((i) => i.id === activeItemId);
	const env = environments.find((e) => e.id === activeEnvironmentId);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-full min-h-0 flex-col bg-surface",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex gap-1 border-b border-border p-2",
			children: [
				"response",
				"utility",
				"meta"
			].map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: () => setTab(t),
				className: `h-8 flex-1 rounded-md text-xs font-medium capitalize ${tab === t ? "bg-elevated text-foreground" : "text-muted hover:text-foreground"}`,
				children: t === "response" ? "Inspector" : t === "utility" ? "Utilities" : "Meta"
			}, t))
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "min-h-0 flex-1",
			children: [
				tab === "response" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponseView, { response: lastResponse }) : null,
				tab === "utility" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UtilityPanel, {}) : null,
				tab === "meta" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetaPane, {
					itemName: item?.name,
					itemKind: item?.kind,
					envName: env?.name,
					history
				}) : null
			]
		})]
	});
}
function MetaPane({ itemName, itemKind, envName, history }) {
	const compareIds = useScratchpad((s) => s.compareIds);
	const setCompare = useScratchpad((s) => s.setCompare);
	const a = history.find((h) => h.id === compareIds[0]);
	const b = history.find((h) => h.id === compareIds[1]);
	const diff = (0, import_react.useMemo)(() => {
		if (!a || !b) return null;
		const pa = prettyBody(a.response.body, contentTypeOf(a.response.headers));
		const pb = prettyBody(b.response.body, contentTypeOf(b.response.headers));
		return lineDiff(pa.split("\n"), pb.split("\n"));
	}, [a, b]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "h-full overflow-auto p-3 text-sm",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-2xs font-medium uppercase tracking-wider text-subtle",
				children: "Active"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-foreground",
				children: itemName ?? "Nothing selected"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-xs text-muted",
				children: [
					itemKind ?? "—",
					" · env ",
					envName ?? "none"
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 text-2xs font-medium uppercase tracking-wider text-subtle",
				children: "Storage"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-xs leading-relaxed text-muted",
				children: "Workspace data is stored in IndexedDB in this browser. Requests you send go to the destination API (or a same-origin proxy when CORS blocks the browser). Tokens are not logged."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-5 text-2xs font-medium uppercase tracking-wider text-subtle",
				children: "Compare responses"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-2 grid grid-cols-2 gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
					value: compareIds[0] ?? "",
					onChange: (e) => setCompare(0, e.target.value || null),
					className: "h-8 rounded-md border border-border bg-inset px-2 text-xs",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: "",
						children: "Left"
					}), history.slice(0, 20).map((h) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
						value: h.id,
						children: [
							h.method,
							" ",
							h.response.status,
							" ",
							h.name
						]
					}, h.id))]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
					value: compareIds[1] ?? "",
					onChange: (e) => setCompare(1, e.target.value || null),
					className: "h-8 rounded-md border border-border bg-inset px-2 text-xs",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: "",
						children: "Right"
					}), history.slice(0, 20).map((h) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
						value: h.id,
						children: [
							h.method,
							" ",
							h.response.status,
							" ",
							h.name
						]
					}, h.id))]
				})]
			}),
			diff ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
				className: "mt-3 max-h-80 overflow-auto rounded-md border border-border bg-inset p-2 font-mono text-2xs",
				children: diff.map((l, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: l.type === "add" ? "text-success" : l.type === "del" ? "text-danger" : "text-muted",
					children: [
						l.type === "add" ? "+" : l.type === "del" ? "−" : " ",
						" ",
						l.text
					]
				}, i))
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-xs text-muted",
				children: "Pick two history entries."
			}),
			history[0] ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
					tone: "muted",
					children: ["Last ", history[0].response.status]
				})
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-6",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					variant: "ghost",
					onClick: () => useScratchpad.getState().setShortcutsOpen(true),
					children: "Keyboard shortcuts"
				})
			})
		]
	});
}
function Kbd({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("kbd", {
		className: cn("inline-flex h-5 min-w-5 items-center justify-center rounded-sm border border-border bg-elevated px-1 font-mono text-2xs text-muted", className),
		...props
	});
}
var ROWS = [
	["Command palette", "K"],
	["Quick open", "P"],
	["Search workspace", "Shift F"],
	["Send request", "Enter"],
	["New request", "N"],
	["New note", "Shift N"],
	["Utilities", "Shift U"],
	["Toggle preview / edit", "E"]
];
function ShortcutsDialog() {
	const open = useScratchpad((s) => s.shortcutsOpen);
	const setOpen = useScratchpad((s) => s.setShortcutsOpen);
	const mod = isMac() ? "⌘" : "Ctrl";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange: setOpen,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Keyboard shortcuts" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Everything important is a keystroke away." }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
				className: "mt-3 divide-y divide-border",
				children: [ROWS.map(([label, key]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex items-center justify-between py-2 text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: label }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "flex items-center gap-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kbd, { children: mod }), key.split(" ").map((k) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kbd, { children: k }, k))]
					})]
				}, label)), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex items-center justify-between py-2 text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Shortcuts" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kbd, { children: "?" })]
				})]
			})
		] })
	});
}
var DropdownMenu = Root2;
var DropdownMenuTrigger = Trigger;
function DropdownMenuContent({ className, sideOffset = 6, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Portal2, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Content2, {
		sideOffset,
		className: cn("z-50 min-w-40 overflow-hidden rounded-lg border border-border bg-surface p-1 shadow-[var(--shadow-pop)]", className),
		...props
	}) });
}
function DropdownMenuItem({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Item2, {
		className: cn("flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm text-foreground outline-none data-[highlighted]:bg-elevated", className),
		...props
	});
}
function DropdownMenuSeparator({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Separator2, {
		className: cn("-mx-1 my-1 h-px bg-border", className),
		...props
	});
}
function hay(parts) {
	return parts.filter(Boolean).join(" \n ").toLowerCase();
}
function snippetAround(text, q, size = 90) {
	const idx = text.toLowerCase().indexOf(q);
	if (idx < 0) return text.slice(0, size);
	const start = Math.max(0, idx - 24);
	const end = Math.min(text.length, idx + q.length + size - 24);
	return `${start > 0 ? "…" : ""}${text.slice(start, end)}${end < text.length ? "…" : ""}`;
}
function searchWorkspace(query, collections, items, history) {
	const q = query.trim().toLowerCase();
	if (!q) return [];
	const hits = [];
	for (const c of collections) if (hay([c.name, c.description]).includes(q)) hits.push({
		id: `col-${c.id}`,
		kind: "collection",
		title: c.name,
		snippet: c.description || "Collection",
		collectionId: c.id
	});
	for (const item of items) {
		if (!hay([
			item.name,
			item.kind,
			item.url,
			item.method,
			item.body,
			item.content,
			item.tags.join(" "),
			...(item.headers ?? []).map((h) => `${h.key} ${h.value}`)
		]).includes(q)) continue;
		const source = item.content || item.body || item.url || item.kind;
		hits.push({
			id: item.id,
			kind: item.kind === "note" ? "note" : item.kind === "folder" ? "folder" : "request",
			title: item.kind === "request" ? `${item.method ?? "GET"}  ${item.name}` : item.name,
			snippet: snippetAround(source, q),
			itemId: item.id,
			collectionId: item.collectionId
		});
	}
	for (const h of history) {
		if (!hay([
			h.name,
			h.method,
			h.url,
			h.response.body,
			String(h.response.status)
		]).includes(q)) continue;
		hits.push({
			id: `hist-${h.id}`,
			kind: "history",
			title: `${h.method} ${h.name}`,
			snippet: snippetAround(`${h.response.status} ${h.url}\n${h.response.body}`, q),
			historyId: h.id,
			itemId: h.requestId
		});
	}
	return hits.slice(0, 80);
}
function Sidebar() {
	const view = useScratchpad((s) => s.sidebarView);
	const setView = useScratchpad((s) => s.setSidebarView);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-full min-h-0 flex-col bg-surface",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-1 border-b border-border p-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SideTab, {
						active: view === "workspace",
						onClick: () => setView("workspace"),
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Folder, { className: "size-3.5" }),
						label: "Workspace"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SideTab, {
						active: view === "history",
						onClick: () => setView("history"),
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(History, { className: "size-3.5" }),
						label: "History"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SideTab, {
						active: view === "search",
						onClick: () => setView("search"),
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "size-3.5" }),
						label: "Search"
					})
				]
			}),
			view === "workspace" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WorkspaceTree, {}) : null,
			view === "history" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HistoryList, {}) : null,
			view === "search" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchList, {}) : null
		]
	});
}
function SideTab({ active, onClick, icon, label }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		onClick,
		className: cn("flex h-8 flex-1 items-center justify-center gap-1 rounded-md text-xs font-medium", active ? "bg-elevated text-foreground" : "text-muted hover:text-foreground"),
		children: [icon, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "hidden sm:inline",
			children: label
		})]
	});
}
function WorkspaceTree() {
	const collections = useScratchpad((s) => s.collections);
	const items = useScratchpad((s) => s.items);
	const addCollection = useScratchpad((s) => s.addCollection);
	const addItem = useScratchpad((s) => s.addItem);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-0 flex-1 flex-col",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between px-3 py-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-2xs font-medium uppercase tracking-wider text-subtle",
				children: "Collections"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
				asChild: true,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "icon-sm",
					variant: "ghost",
					"aria-label": "Add",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-3.5" })
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuContent, {
				align: "end",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuItem, {
						onSelect: () => addItem("request", null),
						children: "New request"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuItem, {
						onSelect: () => addItem("note", null),
						children: "New note"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuItem, {
						onSelect: () => addItem("folder", null),
						children: "New folder"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuSeparator, {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuItem, {
						onSelect: () => addCollection(),
						children: "New collection"
					})
				]
			})] })]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "min-h-0 flex-1 overflow-auto px-1 pb-4",
			children: collections.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CollectionNode, {
				id: c.id,
				name: c.name,
				items
			}, c.id))
		})]
	});
}
function CollectionNode({ id, name, items }) {
	const collapsedIds = useScratchpad((s) => s.collapsedIds);
	const toggle = useScratchpad((s) => s.toggleCollapsed);
	const renameCollection = useScratchpad((s) => s.renameCollection);
	const deleteCollection = useScratchpad((s) => s.deleteCollection);
	const addItem = useScratchpad((s) => s.addItem);
	const open = !collapsedIds.includes(id);
	const roots = items.filter((i) => i.collectionId === id && !i.parentId).sort((a, b) => a.order - b.order);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mb-1",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "group flex items-center gap-0.5 rounded-md px-1 hover:bg-elevated",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				className: "flex min-w-0 flex-1 items-center gap-1 py-1.5 text-left",
				onClick: () => toggle(id),
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: cn("size-3.5 text-subtle transition-transform", open && "rotate-90") }),
					open ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FolderOpen, { className: "size-3.5 text-accent" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Folder, { className: "size-3.5 text-accent" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "truncate text-sm font-medium",
						children: name
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RowMenu, {
				onRename: () => {
					const next = window.prompt("Collection name", name);
					if (next) renameCollection(id, next);
				},
				onDelete: () => deleteCollection(id),
				extras: [
					{
						label: "New request",
						run: () => addItem("request", null, id)
					},
					{
						label: "New note",
						run: () => addItem("note", null, id)
					},
					{
						label: "New folder",
						run: () => addItem("folder", null, id)
					}
				]
			})]
		}), open ? roots.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ItemNode, {
			item,
			items,
			depth: 1
		}, item.id)) : null]
	});
}
function ItemNode({ item, items, depth }) {
	const activeItemId = useScratchpad((s) => s.activeItemId);
	const collapsedIds = useScratchpad((s) => s.collapsedIds);
	const toggle = useScratchpad((s) => s.toggleCollapsed);
	const selectItem = useScratchpad((s) => s.selectItem);
	const renameItem = useScratchpad((s) => s.renameItem);
	const deleteItem = useScratchpad((s) => s.deleteItem);
	const duplicateItem = useScratchpad((s) => s.duplicateItem);
	const addItem = useScratchpad((s) => s.addItem);
	const children = items.filter((i) => i.parentId === item.id).sort((a, b) => a.order - b.order);
	const open = !collapsedIds.includes(item.id);
	const active = activeItemId === item.id;
	if (item.kind === "folder") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "group flex items-center rounded-md hover:bg-elevated",
		style: { paddingLeft: 8 + depth * 12 },
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			type: "button",
			className: "flex min-w-0 flex-1 items-center gap-1 py-1 text-left",
			onClick: () => toggle(item.id),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: cn("size-3 text-subtle transition-transform", open && "rotate-90") }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Folder, { className: "size-3.5 text-muted" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "truncate text-sm",
					children: item.name
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RowMenu, {
			onRename: () => {
				const next = window.prompt("Folder name", item.name);
				if (next) renameItem(item.id, next);
			},
			onDelete: () => deleteItem(item.id),
			extras: [{
				label: "New request",
				run: () => addItem("request", item.id, item.collectionId)
			}, {
				label: "New note",
				run: () => addItem("note", item.id, item.collectionId)
			}]
		})]
	}), open ? children.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ItemNode, {
		item: c,
		items,
		depth: depth + 1
	}, c.id)) : null] });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("group flex items-center rounded-md", active ? "bg-elevated" : "hover:bg-elevated"),
		style: { paddingLeft: 8 + depth * 12 },
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			type: "button",
			className: "flex min-w-0 flex-1 items-center gap-1.5 py-1 text-left",
			onClick: () => selectItem(item.id),
			children: [item.kind === "request" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
				tone: methodTone(item.method ?? "GET"),
				className: "min-w-11 justify-center px-1",
				children: item.method ?? "GET"
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "size-3.5 text-muted" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "truncate text-sm",
				children: item.name
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RowMenu, {
			onRename: () => {
				const next = window.prompt("Name", item.name);
				if (next) renameItem(item.id, next);
			},
			onDelete: () => deleteItem(item.id),
			extras: [{
				label: "Duplicate",
				run: () => duplicateItem(item.id)
			}]
		})]
	});
}
function RowMenu({ onRename, onDelete, extras = [] }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
		asChild: true,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			className: "mr-1 hidden size-7 items-center justify-center rounded-md text-subtle hover:text-foreground group-hover:flex",
			"aria-label": "Item menu",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ellipsis, { className: "size-3.5" })
		})
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuContent, {
		align: "end",
		children: [
			extras.map((e) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuItem, {
				onSelect: e.run,
				children: e.label
			}, e.label)),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuItem, {
				onSelect: onRename,
				children: "Rename"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuSeparator, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
				onSelect: onDelete,
				className: "text-danger",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-3.5" }), " Delete"]
			})
		]
	})] });
}
function HistoryList() {
	const history = useScratchpad((s) => s.history);
	const selectItem = useScratchpad((s) => s.selectItem);
	const deleteHistory = useScratchpad((s) => s.deleteHistory);
	const clearHistory = useScratchpad((s) => s.clearHistory);
	const setLastResponse = useScratchpad((s) => s.setLastResponse);
	const items = useScratchpad((s) => s.items);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-0 flex-1 flex-col",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between px-3 py-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-2xs font-medium uppercase tracking-wider text-subtle",
				children: "Request history"
			}), history.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				size: "sm",
				variant: "ghost",
				onClick: () => clearHistory(),
				children: "Clear"
			}) : null]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "min-h-0 flex-1 overflow-auto px-1 pb-3",
			children: history.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "px-3 py-8 text-center text-xs text-muted",
				children: "Executed requests appear here."
			}) : history.map((h) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				className: "mb-0.5 flex w-full items-start gap-2 rounded-md px-2 py-1.5 text-left hover:bg-elevated",
				onClick: () => {
					setLastResponse(h.requestId ?? null, h.response);
					if (h.requestId && items.some((i) => i.id === h.requestId)) selectItem(h.requestId);
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						tone: methodTone(h.method),
						className: "mt-0.5 min-w-11 justify-center px-1",
						children: h.method
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "min-w-0 flex-1",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "block truncate text-sm",
								children: h.name
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "block truncate font-mono text-2xs text-subtle",
								children: h.url
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-2xs text-muted",
								children: [
									h.response.status || "ERR",
									" · ",
									formatRelative(h.createdAt)
								]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						role: "button",
						tabIndex: 0,
						className: "rounded-md p-1 text-subtle hover:text-danger",
						onClick: (e) => {
							e.stopPropagation();
							deleteHistory(h.id);
						},
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-3" })
					})
				]
			}, h.id))
		})]
	});
}
function SearchList() {
	const query = useScratchpad((s) => s.searchQuery);
	const setQuery = useScratchpad((s) => s.setSearchQuery);
	const collections = useScratchpad((s) => s.collections);
	const items = useScratchpad((s) => s.items);
	const history = useScratchpad((s) => s.history);
	const selectItem = useScratchpad((s) => s.selectItem);
	const setLastResponse = useScratchpad((s) => s.setLastResponse);
	const hits = (0, import_react.useMemo)(() => searchWorkspace(query, collections, items, history), [
		query,
		collections,
		items,
		history
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-0 flex-1 flex-col",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "p-2",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				value: query,
				onChange: (e) => setQuery(e.target.value),
				placeholder: "Search notes, requests, responses",
				autoFocus: true
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "min-h-0 flex-1 overflow-auto px-1 pb-3",
			children: [query && hits.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "px-3 py-8 text-center text-xs text-muted",
				children: "No matches."
			}) : null, hits.map((hit) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				className: "mb-0.5 flex w-full flex-col items-start rounded-md px-2 py-1.5 text-left hover:bg-elevated",
				onClick: () => {
					if (hit.kind === "history") {
						const h = history.find((x) => x.id === hit.historyId);
						if (h) setLastResponse(h.requestId ?? null, h.response);
					}
					if (hit.itemId) selectItem(hit.itemId);
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "flex items-center gap-1.5 text-sm",
					children: [hit.kind === "request" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Globe, { className: "size-3 text-muted" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "size-3 text-muted" }), hit.title]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "line-clamp-2 font-mono text-2xs text-subtle",
					children: hit.snippet
				})]
			}, hit.id))]
		})]
	});
}
function AppShell() {
	const hydrated = useScratchpad((s) => s.hydrated);
	const hydrate = useScratchpad((s) => s.hydrate);
	(0, import_react.useEffect)(() => {
		hydrate();
		const failsafe = window.setTimeout(() => {
			if (!useScratchpad.getState().hydrated) useScratchpad.getState().hydrate();
		}, 50);
		return () => window.clearTimeout(failsafe);
	}, [hydrate]);
	if (!hydrated) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShellFrame, {});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipProvider, {
		delayDuration: 250,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex h-dvh flex-col bg-background text-foreground",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleBar, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "min-h-0 flex-1",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DesktopPanes, {})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MobileDock, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBar, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommandPalette, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EnvEditor, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShortcutsDialog, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster, {
					theme: "dark",
					position: "bottom-right",
					richColors: false
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Keybindings, {})
			]
		})
	});
}
function ShellFrame() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-dvh flex-col bg-background text-foreground",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
			className: "flex h-11 items-center gap-3 border-b border-border px-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "flex size-6 items-center justify-center rounded-md border border-border text-accent",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileCode2, { className: "size-3.5" })
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-sm font-semibold tracking-tight",
				children: "Developer Scratchpad"
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid min-h-0 flex-1 grid-cols-1 md:grid-cols-[220px_1fr_280px]",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "hidden border-r border-border bg-surface md:block" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex items-center justify-center text-sm text-muted",
					children: "Loading workspace…"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "hidden border-l border-border bg-surface md:block" })
			]
		})]
	});
}
function TitleBar() {
	const workspace = useScratchpad((s) => s.workspace);
	const environments = useScratchpad((s) => s.environments);
	const activeEnvironmentId = useScratchpad((s) => s.activeEnvironmentId);
	const setEnvironment = useScratchpad((s) => s.setEnvironment);
	const setCommandOpen = useScratchpad((s) => s.setCommandOpen);
	const setEnvEditorOpen = useScratchpad((s) => s.setEnvEditorOpen);
	const sendState = useScratchpad((s) => s.sendState);
	const items = useScratchpad((s) => s.items);
	const activeItemId = useScratchpad((s) => s.activeItemId);
	const item = items.find((i) => i.id === activeItemId);
	const mod = isMac() ? "⌘" : "Ctrl";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
		className: "flex h-11 shrink-0 items-center gap-2 border-b border-border px-2 sm:px-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "flex size-6 items-center justify-center rounded-md border border-border text-accent",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileCode2, { className: "size-3.5" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "truncate text-sm font-semibold tracking-tight",
					children: "Developer Scratchpad"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "hidden truncate text-2xs text-subtle sm:block",
					children: [workspace.name, " · stored locally"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "ml-auto flex items-center gap-1.5 sm:gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
						value: activeEnvironmentId ?? "",
						onChange: (e) => setEnvironment(e.target.value),
						className: "h-8 max-w-[140px] rounded-md border border-border bg-elevated px-2 text-xs",
						"aria-label": "Environment",
						children: environments.map((e) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: e.id,
							children: e.name
						}, e.id))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "ghost",
						className: "hidden sm:inline-flex",
						onClick: () => setEnvEditorOpen(true),
						children: "Vars"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						variant: "secondary",
						className: "hidden md:inline-flex",
						onClick: () => setCommandOpen(true),
						children: [mod, "K"]
					}),
					item?.kind === "request" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "send",
						disabled: sendState === "sending",
						onClick: () => void sendItem(item),
						className: "sm:hidden",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, { className: "size-3.5" })
					}) : null
				]
			})
		]
	});
}
function DesktopPanes() {
	const mobilePane = useScratchpad((s) => s.mobilePane);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "hidden h-full md:block",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(qt, {
			orientation: "horizontal",
			className: "h-full",
			defaultLayout: {
				sidebar: 22,
				center: 48,
				right: 30
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Qt, {
					id: "sidebar",
					minSize: "14%",
					className: "min-w-0",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sidebar, {})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(nn, { className: "w-1 bg-border hover:bg-accent/40 data-active:bg-accent/60" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Qt, {
					id: "center",
					minSize: "30%",
					className: "min-w-0",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CenterWorkspace, {})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(nn, { className: "w-1 bg-border hover:bg-accent/40 data-active:bg-accent/60" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Qt, {
					id: "right",
					minSize: "20%",
					className: "min-w-0",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RightDrawer, {})
				})
			]
		})
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "h-full md:hidden",
		children: [
			mobilePane === "explorer" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sidebar, {}) : null,
			mobilePane === "editor" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CenterWorkspace, {}) : null,
			mobilePane === "inspect" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RightDrawer, {}) : null
		]
	})] });
}
function MobileDock() {
	const pane = useScratchpad((s) => s.mobilePane);
	const setPane = useScratchpad((s) => s.setMobilePane);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
		className: "flex h-12 shrink-0 border-t border-border bg-surface md:hidden",
		children: [
			{
				id: "explorer",
				label: "Workspace",
				icon: FolderTree
			},
			{
				id: "editor",
				label: "Editor",
				icon: FileCode2
			},
			{
				id: "inspect",
				label: "Inspect",
				icon: PanelRight
			}
		].map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			type: "button",
			onClick: () => setPane(t.id),
			className: `flex flex-1 flex-col items-center justify-center gap-0.5 text-2xs ${pane === t.id ? "text-foreground" : "text-muted"}`,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(t.icon, { className: "size-4" }), t.label]
		}, t.id))
	});
}
function StatusBar() {
	const items = useScratchpad((s) => s.items);
	const history = useScratchpad((s) => s.history);
	const dirty = useScratchpad((s) => s.dirty);
	const env = useScratchpad((s) => s.environments.find((e) => e.id === s.activeEnvironmentId));
	const sendState = useScratchpad((s) => s.sendState);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("footer", {
		className: "hidden h-7 shrink-0 items-center gap-3 border-t border-border bg-surface px-3 text-2xs text-muted md:flex",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: dirty ? "Saving…" : "Saved locally" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-border-strong",
				children: "·"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [items.filter((i) => i.kind === "request").length, " requests"] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [history.length, " history"] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "ml-auto",
				children: env?.name ?? "no env"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: sendState === "sending" ? "Sending" : "Ready" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-subtle",
				children: "? shortcuts"
			})
		]
	});
}
function Keybindings() {
	const setCommandOpen = useScratchpad((s) => s.setCommandOpen);
	const setSearchOpen = useScratchpad((s) => s.setSearchOpen);
	const setShortcutsOpen = useScratchpad((s) => s.setShortcutsOpen);
	const setUtility = useScratchpad((s) => s.setUtility);
	const addItem = useScratchpad((s) => s.addItem);
	const items = useScratchpad((s) => s.items);
	const activeItemId = useScratchpad((s) => s.activeItemId);
	const commandOpen = useScratchpad((s) => s.commandOpen);
	(0, import_react.useEffect)(() => {
		const onKey = (e) => {
			const target = e.target;
			const typing = target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "SELECT" || target.isContentEditable);
			const mod = e.metaKey || e.ctrlKey;
			if (mod && e.key.toLowerCase() === "p") {
				e.preventDefault();
				setCommandOpen(true);
				return;
			}
			if (mod && e.shiftKey && e.key.toLowerCase() === "f") {
				e.preventDefault();
				setSearchOpen(true);
				return;
			}
			if (mod && e.shiftKey && e.key.toLowerCase() === "u") {
				e.preventDefault();
				setUtility("json-format");
				return;
			}
			if (mod && e.key === "Enter") {
				const item = items.find((i) => i.id === activeItemId);
				if (item?.kind === "request") {
					e.preventDefault();
					sendItem(item);
				}
				return;
			}
			if (mod && e.key.toLowerCase() === "n") {
				e.preventDefault();
				addItem(e.shiftKey ? "note" : "request", null);
				return;
			}
			if (!typing && !commandOpen && (e.key === "?" || e.shiftKey && e.key === "/")) {
				e.preventDefault();
				setShortcutsOpen(true);
			}
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [
		addItem,
		activeItemId,
		commandOpen,
		items,
		setCommandOpen,
		setSearchOpen,
		setShortcutsOpen,
		setUtility
	]);
	return null;
}
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, {});
}
//#endregion
export { Home as component };
