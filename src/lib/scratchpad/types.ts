export const HTTP_METHODS = [
  "GET",
  "POST",
  "PUT",
  "PATCH",
  "DELETE",
  "HEAD",
  "OPTIONS",
] as const;

export type HttpMethod = (typeof HTTP_METHODS)[number];

export const BODY_TYPES = ["none", "json", "form-data", "urlencoded", "raw"] as const;
export type BodyType = (typeof BODY_TYPES)[number];

export type ItemKind = "folder" | "request" | "note" | "investigation";

export type SidebarView = "workspace" | "history" | "search";
export type MobilePane = "explorer" | "editor" | "inspect";
export type RightTab = "response" | "utility" | "meta" | "vars";
export type ResponseView = "pretty" | "raw" | "headers" | "cookies" | "tree" | "html" | "diff";

export type AuthType = "none" | "bearer" | "basic" | "apikey";
export type ExtractionScope = "investigation" | "environment" | "request";

export interface HeaderRow {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
  generated?: boolean;
}

export interface FormField {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
  fileName?: string;
}

export interface Variable {
  id: string;
  key: string;
  value: string;
  secret?: boolean;
}

export interface Workspace {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  variables?: Variable[];
}

export interface Collection {
  id: string;
  workspaceId: string;
  name: string;
  description: string;
  order: number;
  createdAt: number;
  updatedAt: number;
}

export interface RequestAuth {
  type: AuthType;
  token?: string;
  username?: string;
  password?: string;
  key?: string;
  value?: string;
  in?: "header" | "query";
}

export interface Extraction {
  as: string;
  path: string;
  scope: ExtractionScope;
  blockKey: string;
}

export interface BlockResult {
  blockKey: string;
  response: HttpResponse;
  extracted?: Record<string, string>;
  ranAt: number;
}

export interface Item {
  id: string;
  collectionId: string;
  parentId: string | null;
  kind: ItemKind;
  name: string;
  order: number;
  tags: string[];
  method?: HttpMethod;
  url?: string;
  headers?: HeaderRow[];
  bodyType?: BodyType;
  body?: string;
  formFields?: FormField[];
  content?: string;
  auth?: RequestAuth;
  timeoutMs?: number;
  variables?: Variable[];
  blockResults?: BlockResult[];
  createdAt: number;
  updatedAt: number;
}

export interface Environment {
  id: string;
  workspaceId: string;
  name: string;
  variables: Variable[];
  createdAt: number;
  updatedAt: number;
}

export interface CookieInfo {
  name: string;
  value: string;
  raw: string;
}

export type Transport = "direct" | "proxy";

export interface HttpResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  cookies: CookieInfo[];
  body: string;
  truncated: boolean;
  truncatedOf?: number;
  timeMs: number;
  size: number;
  error?: string;
  errorKind?: ErrorKind;
  fromProxy?: boolean;
  transport?: Transport;
  aborted?: boolean;
}

export type ErrorKind =
  | "timeout"
  | "aborted"
  | "cors"
  | "dns"
  | "offline"
  | "blocked"
  | "http"
  | "parse"
  | "variable"
  | "network"
  | "unknown";

export interface HistoryEntry {
  id: string;
  requestId?: string;
  blockKey?: string;
  name: string;
  method: HttpMethod;
  url: string;
  requestHeaders: HeaderRow[];
  requestBody?: string;
  response: HttpResponse;
  createdAt: number;
  environmentId?: string;
}

export interface ParsedRequest {
  name?: string;
  method: HttpMethod;
  url: string;
  headers: HeaderRow[];
  body: string;
  bodyType: BodyType;
  extracts?: Extraction[];
}

export const UTILITY_IDS = [
  "json-format",
  "json-minify",
  "json-validate",
  "json-tree",
  "json-diff",
  "json-csv",
  "csv-json",
  "base64-encode",
  "base64-decode",
  "url-encode",
  "url-decode",
  "jwt",
  "epoch",
  "uuid",
  "regex",
  "hash",
  "url-parse",
  "html-entities",
  "unicode",
  "lorem",
] as const;

export type UtilityId = (typeof UTILITY_IDS)[number];

export interface UiPrefs {
  focusMode?: boolean;
  sidebarHidden?: boolean;
  inspectorHidden?: boolean;
  sidebarSize?: number;
  inspectorSize?: number;
}

export interface PersistSnapshot {
  version: 1;
  workspace: Workspace;
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
  ui?: UiPrefs;
}

export const STORAGE_KEY = "sheaf/v1";
export const LEGACY_STORAGE_KEY = "developer-scratchpad/v1";
export const PREFS_KEY = "sheaf/prefs/v1";
export const MAX_HISTORY = 80;
export const MAX_RESPONSE_CHARS = 400_000;
export const MAX_DISPLAY_CHARS = 120_000;
export const DEFAULT_TIMEOUT_MS = 30_000;
