import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { _ as useRouter, f as createRouter, g as createRootRoute, h as createFileRoute, l as Scripts, m as lazyRouteComponent, p as Outlet, u as HeadContent } from "../_libs/@tanstack/react-router+[...].mjs";
import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { n as TriangleAlert } from "../_libs/lucide-react.mjs";
import { a as union, i as string, n as number, r as object, t as literal } from "../_libs/zod.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/router-RRkSSgBx.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var __defProp = Object.defineProperty;
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
var FALLBACK_MESSAGE = "An unexpected error occurred. Try reloading the page.";
function errorMessage(error) {
	if (error instanceof Error && error.message) return error.message;
	if (typeof error === "string" && error) return error;
	return FALLBACK_MESSAGE;
}
function AppErrorComponent({ error }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-red-500",
				"aria-hidden": "true",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, {
					className: "size-10",
					strokeWidth: 2
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-lg font-semibold",
				children: "Something went wrong"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "max-w-md text-sm break-words text-zinc-500 dark:text-zinc-400",
				children: errorMessage(error)
			})
		]
	});
}
/**
* App-wide client provider mounted once near the root (in `src/routes/__root.tsx`):
*
*   <AuthProvider><Outlet /></AuthProvider>
*
* Better Auth's React client (`@/lib/auth/client`) needs NO context provider —
* its `useSession()` works standalone — so this is a passthrough today. It's
* kept as the single, stable mount point for any future client-side providers
* (e.g. a toast or theme provider) without churning the root shell.
*/
function AuthProvider({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children });
}
var CONNECTOR_TOKEN_READY_EVENT = "grok:connector-token-ready";
function isGrokEmbedderOrigin(origin) {
	try {
		const url = new URL(origin);
		if (url.protocol !== "https:" && url.protocol !== "http:") return false;
		const host = url.hostname.toLowerCase();
		if (host === "grok.com" || host.endsWith(".grok.com")) return true;
		if (host === "localhost" || host === "127.0.0.1" || host === "[::1]") return true;
		return false;
	} catch {
		return false;
	}
}
function isSandboxPreviewGuestHost(hostname) {
	const host = hostname.toLowerCase();
	return host === "grok-sandbox.com" || host.endsWith(".grok-sandbox.com");
}
function isRemintPreviewPair(guestHost, parentHost) {
	const guest = guestHost.toLowerCase();
	const parent = parentHost.toLowerCase();
	const i = guest.indexOf(".preview.");
	if (i <= 0) return false;
	const label = guest.slice(0, i);
	const rest = guest.slice(i + 9);
	if (label.includes(".") || !rest.includes(".")) return false;
	return parent === rest || parent === `grok.${rest}`;
}
function resolveParentEmbedderOrigin(parentIsSelf, referrer, ancestorOrigin, guestHostname = "") {
	if (parentIsSelf) return null;
	for (const candidate of [referrer, ancestorOrigin ?? ""].filter(Boolean)) try {
		const url = new URL(candidate.includes("://") ? candidate : `https://${candidate}`);
		if (url.protocol !== "https:" && url.protocol !== "http:") continue;
		if (isGrokEmbedderOrigin(url.origin)) return url.origin;
		if (isSandboxPreviewGuestHost(guestHostname) || isRemintPreviewPair(guestHostname, url.hostname)) return url.origin;
	} catch {}
	return null;
}
/**
* Guest side of the grok-web ↔ sandbox preview postMessage bridge.
*
* Activates only when this page is framed by an allowlisted Grok embedder.
* Top-level runs (download/export, local `npm run dev`, deployed sites) noop.
*/
var PREVIEW_BRIDGE_CHANNEL = "grok-preview-bridge";
var EnvelopeSchema = object({
	channel: literal(PREVIEW_BRIDGE_CHANNEL),
	version: number().int().positive(),
	type: string().min(1)
});
var HelloSchema = EnvelopeSchema.extend({ type: literal("hello") });
var NavigateSchema = EnvelopeSchema.extend({
	type: literal("navigate"),
	path: string().min(1)
});
var HistorySchema = EnvelopeSchema.extend({
	type: literal("history"),
	delta: union([literal(-1), literal(1)])
});
var ConnectorTokenReadySchema = EnvelopeSchema.extend({ type: literal("connector-token-ready") });
function isSafeBridgePath(path) {
	if (!path.startsWith("/") || path.startsWith("//") || path.includes("\\")) return false;
	try {
		return new URL(path, "https://preview.invalid").origin === "https://preview.invalid";
	} catch {
		return false;
	}
}
/**
* Origin of the Grok embedder framing this page, or null when the page runs
* top-level (download/export, local `npm run dev`, deployed sites) or under a
* non-Grok parent. Client-only; null during SSR.
*/
function resolveCurrentEmbedderOrigin() {
	if (typeof window === "undefined") return null;
	const ancestorOrigin = typeof location.ancestorOrigins !== "undefined" && location.ancestorOrigins.length > 0 ? location.ancestorOrigins[0] : null;
	return resolveParentEmbedderOrigin(window.parent === window, document.referrer, ancestorOrigin, window.location.hostname);
}
/**
* Install host↔guest messaging. Returns a dispose function.
* Noops (returns a no-op dispose) when not embedded under a Grok parent.
*/
function installPreviewHostBridge(options = {}) {
	const parentOrigin = resolveCurrentEmbedderOrigin();
	if (parentOrigin === null) return () => {};
	const ROOT_STATE_KEY = "__grokPreviewBridgeRoot";
	const originalPushState = window.history.pushState.bind(window.history);
	const originalReplaceState = window.history.replaceState.bind(window.history);
	const isAtHistoryRoot = () => {
		const state = window.history.state;
		return Boolean(state && typeof state === "object" && state[ROOT_STATE_KEY] === true);
	};
	try {
		const current = window.history.state;
		if (!(current !== null && typeof current === "object" && Object.prototype.hasOwnProperty.call(current, ROOT_STATE_KEY))) {
			const isRoot = window.history.length <= 1;
			originalReplaceState(current && typeof current === "object" ? {
				...current,
				[ROOT_STATE_KEY]: isRoot
			} : { [ROOT_STATE_KEY]: isRoot }, "", window.location.href);
		}
	} catch {}
	const post = (message) => {
		window.parent.postMessage(message, parentOrigin);
	};
	const reportLocation = () => {
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "location",
			path: window.location.pathname || "/",
			search: window.location.search,
			hash: window.location.hash
		});
	};
	const reportRoutes = () => {
		const paths = options.getRoutePaths?.() ?? [];
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "routes",
			paths
		});
	};
	const defaultNavigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		try {
			const url = new URL(path, window.location.origin);
			if (url.origin !== window.location.origin) return;
			const next = `${url.pathname}${url.search}${url.hash}`;
			window.history.pushState(window.history.state, "", next);
			window.dispatchEvent(new PopStateEvent("popstate", { state: window.history.state }));
		} catch {}
	};
	const navigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		if (options.navigate) {
			options.navigate(path);
			return;
		}
		defaultNavigate(path);
	};
	const announce = () => {
		reportLocation();
		reportRoutes();
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "ready"
		});
	};
	const onHello = (data) => {
		if (!HelloSchema.safeParse(data).success) return;
		announce();
	};
	const onNavigate = (data) => {
		const parsed = NavigateSchema.safeParse(data);
		if (!parsed.success) return;
		navigate(parsed.data.path);
		queueMicrotask(reportLocation);
	};
	const onHistory = (data) => {
		const parsed = HistorySchema.safeParse(data);
		if (!parsed.success) return;
		if (parsed.data.delta === -1 && isAtHistoryRoot()) return;
		window.history.go(parsed.data.delta);
	};
	const onConnectorTokenReady = (data) => {
		if (!ConnectorTokenReadySchema.safeParse(data).success) return;
		window.dispatchEvent(new Event(CONNECTOR_TOKEN_READY_EVENT));
	};
	const hostMessageHandlers = /* @__PURE__ */ new Map([
		["hello", onHello],
		["navigate", onNavigate],
		["history", onHistory],
		["connector-token-ready", onConnectorTokenReady]
	]);
	const onMessage = (event) => {
		if (event.source !== window.parent) return;
		if (event.origin !== parentOrigin) return;
		const envelope = EnvelopeSchema.safeParse(event.data);
		if (!envelope.success || envelope.data.version !== 1) return;
		hostMessageHandlers.get(envelope.data.type)?.(event.data);
	};
	const onPopState = () => {
		reportLocation();
	};
	const onHashChange = () => {
		reportLocation();
	};
	window.history.pushState = (data, unused, url) => {
		const next = data && typeof data === "object" ? {
			...data,
			[ROOT_STATE_KEY]: false
		} : data;
		originalPushState(next, unused, url);
		reportLocation();
	};
	window.history.replaceState = (data, unused, url) => {
		const next = isAtHistoryRoot() ? {
			...data && typeof data === "object" ? data : {},
			[ROOT_STATE_KEY]: true
		} : data;
		originalReplaceState(next, unused, url);
		reportLocation();
	};
	window.addEventListener("message", onMessage);
	window.addEventListener("popstate", onPopState);
	window.addEventListener("hashchange", onHashChange);
	announce();
	return () => {
		window.removeEventListener("message", onMessage);
		window.removeEventListener("popstate", onPopState);
		window.removeEventListener("hashchange", onHashChange);
		window.history.pushState = originalPushState;
		window.history.replaceState = originalReplaceState;
	};
}
/** Collect static path patterns from a TanStack route tree (best-effort). */
function collectRoutePathsFromTree(routeTree) {
	const paths = /* @__PURE__ */ new Set();
	const walk = (node) => {
		if (!node || typeof node !== "object") return;
		const record = node;
		const full = typeof record.fullPath === "string" ? record.fullPath : typeof record.path === "string" ? record.path : null;
		if (full !== null && full !== "") paths.add(full.startsWith("/") ? full : `/${full}`);
		else if (full === "") paths.add("/");
		const children = record.children;
		if (Array.isArray(children)) for (const child of children) walk(child);
		else if (children && typeof children === "object") for (const child of Object.values(children)) walk(child);
	};
	walk(routeTree);
	return [...paths];
}
/**
* Mount once in `__root.tsx` so the Grok preview chrome can drive navigation
* (and later receive registered routes). Noops when the app is not embedded.
*/
function PreviewHostBridge() {
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		return installPreviewHostBridge({
			navigate: (path) => {
				router.history.push(path);
			},
			getRoutePaths: () => collectRoutePathsFromTree(router.routeTree)
		});
	}, [router]);
	return null;
}
var styles_default = "/assets/styles-ykVBotNz.css";
var APP_NAME = "Developer Scratchpad";
var Route$2 = createRootRoute({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{ title: APP_NAME },
			{
				name: "theme-color",
				content: "#0c0d10"
			},
			{
				name: "description",
				content: "Local-first developer workbench for HTTP, Markdown notes, JSON, and utilities."
			}
		],
		links: [
			{
				rel: "icon",
				type: "image/svg+xml",
				href: "/favicon.svg"
			},
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "manifest",
				href: "/__grok/manifest.webmanifest"
			},
			{
				rel: "apple-touch-icon",
				href: "/__grok/icon-180.png"
			}
		]
	}),
	component: () => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "en",
		className: "dark antialiased",
		suppressHydrationWarning: true,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", {
			className: "bg-background text-foreground",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PreviewHostBridge, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}) }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})
			]
		})]
	})
});
var $$splitComponentImporter = () => import("./routes-D4yG2vAY.mjs");
var Route$1 = createFileRoute("/")({ component: lazyRouteComponent($$splitComponentImporter, "component") });
var HTTP_METHODS = [
	"GET",
	"POST",
	"PUT",
	"PATCH",
	"DELETE",
	"HEAD",
	"OPTIONS"
];
var STORAGE_KEY = "developer-scratchpad/v1";
var MAX_RESPONSE_CHARS = 4e5;
function uid(prefix = "id") {
	if (typeof crypto !== "undefined" && "randomUUID" in crypto) return `${prefix}_${crypto.randomUUID().slice(0, 8)}`;
	return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}
function now() {
	return Date.now();
}
var METHOD_RE = new RegExp(`^(${HTTP_METHODS.join("|")})\\s+(\\S+)(?:\\s+HTTP/\\d(?:\\.\\d)?)?\\s*$`, "i");
var HEADER_RE = /^([A-Za-z0-9!#$%&'*+.^_`|~-]+)\s*:\s*(.*)$/;
function emptyHeaders() {
	return [{
		id: uid("h"),
		key: "",
		value: "",
		enabled: true
	}, {
		id: uid("h"),
		key: "",
		value: "",
		enabled: true
	}];
}
function interpolate(text, vars) {
	return text.replace(/\{\{\s*([A-Za-z0-9_.-]+)\s*\}\}/g, (match, key) => {
		if (Object.prototype.hasOwnProperty.call(vars, key)) return vars[key] ?? "";
		return match;
	});
}
function parseSingleRequest(source) {
	const lines = source.replace(/\r\n/g, "\n").split("\n");
	let i = 0;
	while (i < lines.length && (lines[i]?.trim() === "" || lines[i]?.trim().startsWith("#") || lines[i]?.trim().startsWith("//"))) i += 1;
	if (i >= lines.length) return null;
	let name;
	const nameLine = lines[i] ?? "";
	if (nameLine.trim().startsWith("#") && !METHOD_RE.test(nameLine.trim())) {
		name = nameLine.replace(/^#+\s*/, "").trim() || void 0;
		i += 1;
		while (i < lines.length && lines[i]?.trim() === "") i += 1;
	}
	const match = (lines[i]?.trim() ?? "").match(METHOD_RE);
	if (!match) return null;
	i += 1;
	const method = match[1].toUpperCase();
	const url = match[2];
	const headers = [];
	while (i < lines.length) {
		const line = lines[i] ?? "";
		if (line.trim() === "") {
			i += 1;
			break;
		}
		if (line.trim().startsWith("#") || line.trim().startsWith("//")) {
			i += 1;
			continue;
		}
		const hm = line.match(HEADER_RE);
		if (!hm) break;
		headers.push({
			id: uid("h"),
			key: hm[1],
			value: hm[2] ?? "",
			enabled: true
		});
		i += 1;
	}
	const body = lines.slice(i).join("\n").replace(/\n+$/, "");
	return {
		name,
		method,
		url,
		headers: headers.length ? headers : emptyHeaders(),
		body,
		bodyType: inferBodyType(headers, body)
	};
}
function inferBodyType(headers, body) {
	if (!body.trim()) return "none";
	const ct = headers.find((h) => h.enabled && h.key.toLowerCase() === "content-type")?.value.toLowerCase() ?? "";
	if (ct.includes("application/json") || looksLikeJson(body)) return "json";
	if (ct.includes("application/x-www-form-urlencoded")) return "urlencoded";
	if (ct.includes("multipart/form-data")) return "form-data";
	return "raw";
}
function looksLikeJson(text) {
	const t = text.trim();
	return t.startsWith("{") && t.endsWith("}") || t.startsWith("[") && t.endsWith("]");
}
function serializeHttp(req) {
	const lines = [];
	if (req.name) lines.push(`### ${req.name}`, "");
	lines.push(`${req.method} ${req.url}`);
	for (const h of req.headers ?? []) {
		if (!h.enabled || !h.key.trim()) continue;
		lines.push(`${h.key}: ${h.value}`);
	}
	if (req.body?.trim()) lines.push("", req.body.trimEnd());
	return lines.join("\n") + "\n";
}
function toCurl(req) {
	const parts = [`curl -X ${req.method}`];
	parts.push(`'${req.url.replace(/'/g, `'\\''`)}'`);
	for (const h of req.headers ?? []) {
		if (!h.enabled || !h.key.trim()) continue;
		parts.push(`-H '${h.key}: ${h.value.replace(/'/g, `'\\''`)}'`);
	}
	if (req.body?.trim() && req.method !== "GET" && req.method !== "HEAD") parts.push(`--data-raw '${req.body.replace(/'/g, `'\\''`)}'`);
	return parts.join(" \\\n  ");
}
function headersToRecord(headers, vars) {
	const out = {};
	for (const h of headers) {
		if (!h.enabled || !h.key.trim()) continue;
		out[interpolate(h.key, vars)] = interpolate(h.value, vars);
	}
	return out;
}
function parseSetCookie(headerValue) {
	const first = headerValue.split(";")[0] ?? headerValue;
	const eq = first.indexOf("=");
	if (eq === -1) return {
		name: first.trim(),
		value: "",
		raw: headerValue
	};
	return {
		name: first.slice(0, eq).trim(),
		value: first.slice(eq + 1).trim(),
		raw: headerValue
	};
}
function prettyBody(body, contentType) {
	if (!body) return "";
	if (contentType.includes("json") || looksLikeJson(body)) try {
		return JSON.stringify(JSON.parse(body), null, 2);
	} catch {
		return body;
	}
	return body;
}
function contentTypeOf(headers) {
	const key = Object.keys(headers).find((k) => k.toLowerCase() === "content-type");
	return key ? headers[key] ?? "" : "";
}
function headersFromResponse(res) {
	const headers = {};
	res.headers.forEach((value, key) => {
		headers[key] = value;
	});
	return headers;
}
function cookiesFromHeaders(headers) {
	const cookies = [];
	for (const [k, v] of Object.entries(headers)) {
		if (k.toLowerCase() !== "set-cookie") continue;
		for (const part of v.split(/,(?=[^ ;]+=)/)) cookies.push(parseSetCookie(part.trim()));
	}
	return cookies;
}
function clipBody(body) {
	const size = new TextEncoder().encode(body).length;
	if (body.length > 4e5) return {
		body: body.slice(0, MAX_RESPONSE_CHARS),
		truncated: true,
		size
	};
	return {
		body,
		truncated: false,
		size
	};
}
async function executeDirect(input, signal) {
	const started = performance.now();
	const init = {
		method: input.method,
		headers: input.headers,
		signal
	};
	if (input.body && input.method !== "GET" && input.method !== "HEAD") init.body = input.body;
	const res = await fetch(input.url, init);
	const raw = await res.text();
	const headers = headersFromResponse(res);
	const clipped = clipBody(raw);
	return {
		status: res.status,
		statusText: res.statusText,
		headers,
		cookies: cookiesFromHeaders(headers),
		timeMs: performance.now() - started,
		fromProxy: false,
		...clipped
	};
}
async function executeViaProxy(input, signal) {
	const started = performance.now();
	const res = await fetch("/api/proxy", {
		method: "POST",
		headers: { "content-type": "application/json" },
		body: JSON.stringify(input),
		signal
	});
	const data = await res.json();
	if (!res.ok && data.error) return {
		status: data.status || res.status,
		statusText: data.statusText || res.statusText,
		headers: data.headers ?? {},
		cookies: data.cookies ?? [],
		body: data.body ?? "",
		truncated: false,
		timeMs: data.timeMs ?? performance.now() - started,
		size: data.size ?? 0,
		error: data.error,
		fromProxy: true
	};
	return {
		...data,
		timeMs: data.timeMs ?? performance.now() - started,
		fromProxy: true
	};
}
async function executeRequest(input, signal) {
	try {
		return await executeDirect(input, signal);
	} catch (err) {
		const message = err instanceof Error ? err.message : String(err);
		if (!(message.includes("Failed to fetch") || message.includes("NetworkError") || message.includes("CORS") || message.includes("Load failed"))) return {
			status: 0,
			statusText: "",
			headers: {},
			cookies: [],
			body: "",
			truncated: false,
			timeMs: 0,
			size: 0,
			error: message
		};
		try {
			return await executeViaProxy(input, signal);
		} catch (proxyErr) {
			return {
				status: 0,
				statusText: "",
				headers: {},
				cookies: [],
				body: "",
				truncated: false,
				timeMs: 0,
				size: 0,
				error: `${message}. Proxy fallback failed: ${proxyErr instanceof Error ? proxyErr.message : String(proxyErr)}`
			};
		}
	}
}
function encodeUrlencoded(fields) {
	const params = new URLSearchParams();
	for (const f of fields) if (f.enabled && f.key) params.append(f.key, f.value);
	return params.toString();
}
var BLOCKED_HOSTS = /* @__PURE__ */ new Set([
	"localhost",
	"127.0.0.1",
	"0.0.0.0",
	"::1",
	"metadata.google.internal",
	"metadata.goog"
]);
function isPrivateHostname(hostname) {
	const host = hostname.toLowerCase().replace(/^\[|\]$/g, "");
	if (BLOCKED_HOSTS.has(host)) return true;
	if (host.endsWith(".localhost")) return true;
	if (host === "169.254.169.254") return true;
	if (/^10\.\d+\.\d+\.\d+$/.test(host)) return true;
	if (/^192\.168\.\d+\.\d+$/.test(host)) return true;
	if (/^172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+$/.test(host)) return true;
	if (host.startsWith("fe80:") || host.startsWith("fc") || host.startsWith("fd")) return true;
	return false;
}
function json(data, status = 200) {
	return new Response(JSON.stringify(data), {
		status,
		headers: { "content-type": "application/json; charset=utf-8" }
	});
}
var Route = createFileRoute("/api/proxy")({ server: { handlers: { POST: async ({ request }) => {
	let payload;
	try {
		payload = await request.json();
	} catch {
		return json({ error: "Invalid JSON body" }, 400);
	}
	const method = String(payload.method ?? "GET").toUpperCase();
	if (!HTTP_METHODS.includes(method)) return json({ error: "Unsupported HTTP method" }, 400);
	const urlStr = String(payload.url ?? "").trim();
	let parsed;
	try {
		parsed = new URL(urlStr);
	} catch {
		return json({ error: "Invalid URL" }, 400);
	}
	if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return json({ error: "Only http and https URLs are allowed" }, 400);
	if (isPrivateHostname(parsed.hostname)) return json({ error: "Private and loopback hosts are blocked from the proxy. Public APIs still work. Local servers need CORS." }, 400);
	const headers = new Headers();
	const incoming = payload.headers ?? {};
	for (const [key, value] of Object.entries(incoming)) {
		const lower = key.toLowerCase();
		if (!key.trim()) continue;
		if (lower === "host" || lower === "content-length" || lower === "connection") continue;
		headers.set(key, value);
	}
	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), 3e4);
	const started = Date.now();
	try {
		const init = {
			method,
			headers,
			redirect: "follow",
			signal: controller.signal
		};
		if (payload.body && method !== "GET" && method !== "HEAD") init.body = payload.body;
		const res = await fetch(parsed.toString(), init);
		const buf = new Uint8Array(await res.arrayBuffer());
		const size = buf.byteLength;
		let truncated = false;
		let slice = buf;
		if (size > 4e5) {
			slice = buf.slice(0, MAX_RESPONSE_CHARS);
			truncated = true;
		}
		const body = new TextDecoder("utf-8", { fatal: false }).decode(slice);
		const outHeaders = {};
		const cookies = [];
		res.headers.forEach((value, key) => {
			outHeaders[key] = value;
			if (key.toLowerCase() === "set-cookie") cookies.push(parseSetCookie(value));
		});
		return json({
			status: res.status,
			statusText: res.statusText,
			headers: outHeaders,
			cookies,
			body,
			truncated,
			timeMs: Date.now() - started,
			size,
			fromProxy: true
		});
	} catch (err) {
		const message = err instanceof Error ? err.message : String(err);
		return json({
			status: 0,
			statusText: "",
			headers: {},
			cookies: [],
			body: "",
			truncated: false,
			timeMs: Date.now() - started,
			size: 0,
			error: message === "The operation was aborted." ? "Request timed out after 30s" : message,
			fromProxy: true
		}, 200);
	} finally {
		clearTimeout(timer);
	}
} } } });
var rootRouteChildren = {
	IndexRoute: Route$1.update({
		id: "/",
		path: "/",
		getParentRoute: () => Route$2
	}),
	ApiProxyRoute: Route.update({
		id: "/api/proxy",
		path: "/api/proxy",
		getParentRoute: () => Route$2
	})
};
var routeTree = Route$2._addFileChildren(rootRouteChildren)._addFileTypes();
var router_exports = /* @__PURE__ */ __exportAll({ getRouter: () => getRouter });
function getRouter() {
	return createRouter({
		routeTree,
		defaultErrorComponent: AppErrorComponent
	});
}
//#endregion
export { executeRequest as a, parseSingleRequest as c, toCurl as d, now as f, STORAGE_KEY as h, encodeUrlencoded as i, prettyBody as l, HTTP_METHODS as m, contentTypeOf as n, headersToRecord as o, uid as p, emptyHeaders as r, interpolate as s, router_exports as t, serializeHttp as u };
