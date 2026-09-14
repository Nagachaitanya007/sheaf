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

export type ItemKind = "folder" | "request" | "note";

export type SidebarView = "workspace" | "history" | "search";
export type MobilePane = "explorer" | "editor" | "inspect";
export type RightTab = "response" | "utility" | "meta";
export type ResponseView = "pretty" | "raw" | "headers" | "cookies" | "tree" | "html";

export interface HeaderRow {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
}

export interface FormField {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
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

export interface HttpResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  cookies: CookieInfo[];
  body: string;
  truncated: boolean;
  timeMs: number;
  size: number;
  error?: string;
  fromProxy?: boolean;
}

export interface HistoryEntry {
  id: string;
  requestId?: string;
  name: string;
  method: HttpMethod;
  url: string;
  requestHeaders: HeaderRow[];
  requestBody?: string;
  response: HttpResponse;
  createdAt: number;
}

export interface ParsedRequest {
  name?: string;
  method: HttpMethod;
  url: string;
  headers: HeaderRow[];
  body: string;
  bodyType: BodyType;
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
}

export const STORAGE_KEY = "sheaf/v1";
export const LEGACY_STORAGE_KEY = "developer-scratchpad/v1";
export const MAX_HISTORY = 80;
export const MAX_RESPONSE_CHARS = 400_000;
export const MAX_DISPLAY_CHARS = 120_000;
