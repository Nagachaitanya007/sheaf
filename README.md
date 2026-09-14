# Sheaf

**Write it. Run it. Keep it.**

Sheaf is a local-first developer investigation workbench. Notes, executable HTTP, response inspection, variable extraction, and utilities live in one document — not a separate API catalog and a separate notebook.

It is not a Postman clone. Postman is built around managing and collaborating on API collections. Sheaf is built around **figuring out what is happening**.

## Core workflow

WRITE → EXPERIMENT → RUN → INSPECT → TRANSFORM → OBSERVE → RUN AGAIN → CONCLUDE

Open an **Investigation**, write Markdown, drop in HTTP blocks, run them, extract `$.accessToken` into `{{token}}`, call the next endpoint, compare responses, and keep the conclusion in the same file.

## How it differs from Postman

| Sheaf | Typical API client |
| --- | --- |
| Investigation document is the workspace | Collection of requests is the workspace |
| Executable Markdown (`.http` blocks) | Request editor only |
| Request chaining via JSONPath + named blocks | Manual copy between requests |
| Utilities next to the response | Separate tools |
| Local-first, no account | Cloud workspace by default |

## Local-first / privacy

- Workspace data stays in this browser (IndexedDB, with a small localStorage cache).
- Nothing is uploaded unless **you** send an HTTP request or export a file.
- The optional same-origin **proxy** exists only to work around CORS. It is for local development. It refuses loopback, private, link-local, and cloud-metadata destinations, and re-validates every redirect.
- The `secret` flag on variables **masks values in the UI and history**. It is not encryption. A future desktop build can use OS credential storage.

## Keyboard

- `Ctrl/⌘ K` command palette
- `Ctrl/⌘ P` quick open
- `Ctrl/⌘ Enter` send request
- `Ctrl/⌘ Shift Enter` run investigation sequence
- `Ctrl/⌘ Shift F` search
- `?` shortcuts

## HTTP blocks

Fenced `http` (or unfenced method lines) are executable:

```http
### Login
POST {{baseUrl}}/auth/login
Content-Type: application/json
# @extract token=$.accessToken

{
  "username": "{{email}}",
  "password": "{{password}}"
}
```

Later blocks can use `{{token}}` or `{{Login.accessToken}}`.

Variable precedence: **request → investigation → environment → global**.

## Architecture

- UI: TanStack Start + React, three resizable panes
- State: Zustand
- Persistence: IndexedDB + localStorage fallback
- HTTP: browser `fetch`, CORS fallback through `/api/proxy`
- Markdown: custom parser (HTTP blocks, wiki links `[[Login]]`, sanitized inline HTML)

## Data you own

Export/import JSON (`sheaf/v1`), `.http` bundles, Markdown, curl, and response JSON from the command palette. Imports are untrusted: schema, size, and kinds are validated; Markdown is escaped on render; nothing is executed as JavaScript.

## Security considerations

- Proxy SSRF: hostname + resolved IP checks, no private ranges, metadata IPs, IPv4-mapped IPv6, decimal IPs; redirects are followed manually and re-checked (max 5).
- Markdown XSS: HTML is escaped; links must be `http(s)`.
- Secrets are redacted in history; they still live in local browser storage if you save them as variables.
- Multipart bodies use `FormData` (the browser/runtime sets the boundary). Do not set `Content-Type` yourself for `form-data`.

## Known limitations

- DNS rebinding during an in-flight request is not fully pinned (no custom socket). Redirects and resolved IPs are checked.
- Response bodies are clipped around 400 KB for display/storage; download is offered when truncated.
- Undo for workspace tree operations is native to text fields only.
- Postman / Bruno / OpenAPI import is not implemented (export is open JSON / `.http` / Markdown).
- The proxy is a local CORS helper, not a public multi-tenant proxy.

## Development

```
npm run dev
npm test
npm run typecheck
```

The sample workspace includes **Authentication investigation**: login → extract token → current user → get user.
