import { emptyHeaders } from "./http";
import { now, uid } from "./ids";
import type { Collection, Environment, HeaderRow, Item, PersistSnapshot, Variable, Workspace } from "./types";

function header(key: string, value: string): HeaderRow {
  return { id: uid("h"), key, value, enabled: true };
}

function v(key: string, value: string, secret = false): Variable {
  return { id: uid("v"), key, value, secret };
}

function request(partial: Omit<Item, "kind" | "createdAt" | "updatedAt" | "tags"> & { tags?: string[] }): Item {
  const t = now();
  return {
    kind: "request",
    tags: partial.tags ?? [],
    createdAt: t,
    updatedAt: t,
    headers: partial.headers ?? emptyHeaders(),
    bodyType: partial.bodyType ?? "none",
    body: partial.body ?? "",
    ...partial,
  };
}

function note(partial: Omit<Item, "kind" | "createdAt" | "updatedAt" | "tags"> & { tags?: string[] }): Item {
  const t = now();
  return {
    kind: "note",
    tags: partial.tags ?? ["docs"],
    createdAt: t,
    updatedAt: t,
    content: partial.content ?? "",
    ...partial,
  };
}

function folder(partial: Omit<Item, "kind" | "createdAt" | "updatedAt" | "tags" | "content"> & { tags?: string[] }): Item {
  const t = now();
  return {
    kind: "folder",
    tags: partial.tags ?? [],
    createdAt: t,
    updatedAt: t,
    ...partial,
  };
}

export function createSeed(): PersistSnapshot {
  const t = now();
  const workspace: Workspace = {
    id: uid("ws"),
    name: "Personal",
    createdAt: t,
    updatedAt: t,
  };

  const collection: Collection = {
    id: uid("col"),
    workspaceId: workspace.id,
    name: "API Investigation",
    description: "Login flow, users, and notes for a sample public API.",
    order: 0,
    createdAt: t,
    updatedAt: t,
  };

  const auth = folder({
    id: uid("fld"),
    collectionId: collection.id,
    parentId: null,
    name: "Authentication",
    order: 0,
  });
  const users = folder({
    id: uid("fld"),
    collectionId: collection.id,
    parentId: null,
    name: "Users",
    order: 1,
  });
  const posts = folder({
    id: uid("fld"),
    collectionId: collection.id,
    parentId: null,
    name: "Posts",
    order: 2,
  });
  const notesFolder = folder({
    id: uid("fld"),
    collectionId: collection.id,
    parentId: null,
    name: "Notes",
    order: 3,
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
      { id: uid("h"), key: "", value: "", enabled: true },
    ],
    body: `{
  "username": "{{email}}",
  "password": "{{password}}"
}`,
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
    headers: [
      header("Authorization", "Bearer {{token}}"),
      header("Accept", "application/json"),
    ],
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
}`,
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
    headers: [header("Accept", "application/json")],
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
    headers: [header("Accept", "application/json")],
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
  "lastName": "Sheaf"
}`,
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
    headers: [header("Accept", "application/json")],
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
  "title": "Notes from Sheaf",
  "userId": {{userId}}
}`,
  });

  const echo = request({
    id: uid("req"),
    collectionId: collection.id,
    parentId: posts.id,
    name: "HTTP echo",
    order: 2,
    method: "GET",
    url: "https://httpbin.org/get?from=sheaf",
    tags: ["debug"],
    headers: [header("Accept", "application/json"), header("X-Sheaf", "1")],
  });

  const gettingStarted = note({
    id: uid("note"),
    collectionId: collection.id,
    parentId: notesFolder.id,
    name: "Getting started",
    order: 0,
    content: `# Sheaf

A local-first workbench for requests, notes, and data. Nothing here leaves this browser unless you run an HTTP call.

Write it. Run it. Keep it.

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
`,
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
- If a request fails CORS in the browser, Sheaf retries through a same-origin proxy. Private/loopback hosts stay blocked on the proxy on purpose.
- Checklist for a new API:
  - [ ] Capture login request
  - [ ] Store token as a secret variable
  - [ ] Hit a protected resource
  - [ ] Document error shapes in this note
`,
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
`,
  });

  const environments: Environment[] = [
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
        v("userId", "1"),
      ],
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
        v("userId", "1"),
      ],
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
        v("userId", "1"),
      ],
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
        v("userId", "1"),
      ],
    },
  ];

  const items = [
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
    jsonNote,
  ];

  return {
    version: 1,
    workspace,
    collections: [collection],
    items,
    environments,
    history: [],
    activeWorkspaceId: workspace.id,
    activeEnvironmentId: environments[0]!.id,
    activeItemId: gettingStarted.id,
    openTabIds: [gettingStarted.id, login.id, getUsers.id],
    collapsedIds: [],
    activeUtility: null,
  };
}

/** Rewrite leftover sample copy after the product rename. Leaves user notes alone unless they still carry the old sample heading. */
export function rebrandSnapshot(snap: PersistSnapshot): PersistSnapshot {
  return {
    ...snap,
    items: snap.items.map((item) => {
      if (item.kind === "note" && item.content?.includes("Developer Scratchpad")) {
        return {
          ...item,
          content: item.content
            .replaceAll("# Developer Scratchpad", "# Sheaf")
            .replaceAll("Scratchpad retries", "Sheaf retries"),
        };
      }
      if (item.kind === "request" && item.body?.includes('"lastName": "Scratchpad"')) {
        return { ...item, body: item.body.replaceAll('"lastName": "Scratchpad"', '"lastName": "Sheaf"') };
      }
      if (item.kind === "request" && item.url?.includes("from=scratchpad")) {
        return {
          ...item,
          url: item.url.replaceAll("from=scratchpad", "from=sheaf"),
          headers: item.headers?.map((h) => (h.key === "X-Scratchpad" ? { ...h, key: "X-Sheaf" } : h)),
        };
      }
      return item;
    }),
  };
}
