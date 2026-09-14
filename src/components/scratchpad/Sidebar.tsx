import type { ReactNode } from "react";
import {
  ChevronRight,
  FileSearch,
  FileText,
  Folder,
  FolderOpen,
  Globe,
  History,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Badge, methodTone } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { searchWorkspace } from "@/lib/scratchpad/search";
import { useScratchpad } from "@/lib/scratchpad/store";
import type { Item } from "@/lib/scratchpad/types";
import { cn, formatRelative } from "@/lib/utils";

export function Sidebar() {
  const view = useScratchpad((s) => s.sidebarView);
  const setView = useScratchpad((s) => s.setSidebarView);
  return (
    <div className="flex h-full min-h-0 flex-col bg-surface">
      <div className="flex items-center border-b border-border px-1">
        <SideTab active={view === "workspace"} onClick={() => setView("workspace")} icon={<Folder className="size-3.5" />} label="Workspace" />
        <SideTab active={view === "history"} onClick={() => setView("history")} icon={<History className="size-3.5" />} label="History" />
        <SideTab active={view === "search"} onClick={() => setView("search")} icon={<Search className="size-3.5" />} label="Search" />
      </div>
      {view === "workspace" ? <WorkspaceTree /> : null}
      {view === "history" ? <HistoryList /> : null}
      {view === "search" ? <SearchList /> : null}
    </div>
  );
}

function SideTab({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: ReactNode;
  label: string;
}) {
  return (
    <button type="button" onClick={onClick} data-active={active} className="rail-tab flex-1">
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

function WorkspaceTree() {
  const collections = useScratchpad((s) => s.collections);
  const items = useScratchpad((s) => s.items);
  const addCollection = useScratchpad((s) => s.addCollection);
  const addItem = useScratchpad((s) => s.addItem);
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center justify-between px-3 py-2">
        <p className="text-2xs font-medium uppercase tracking-[0.14em] text-subtle">Index</p>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon-sm" variant="ghost" aria-label="Add">
              <Plus className="size-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => addItem("investigation", null)}>New investigation</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => addItem("request", null)}>New request</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => addItem("note", null)}>New note</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => addItem("folder", null)}>New folder</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => addCollection()}>New collection</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="min-h-0 flex-1 overflow-auto px-1 pb-4">
        {collections.map((c) => (
          <CollectionNode key={c.id} id={c.id} name={c.name} items={items} />
        ))}
      </div>
    </div>
  );
}

function CollectionNode({ id, name, items }: { id: string; name: string; items: Item[] }) {
  const collapsedIds = useScratchpad((s) => s.collapsedIds);
  const toggle = useScratchpad((s) => s.toggleCollapsed);
  const renameCollection = useScratchpad((s) => s.renameCollection);
  const deleteCollection = useScratchpad((s) => s.deleteCollection);
  const addItem = useScratchpad((s) => s.addItem);
  const open = !collapsedIds.includes(id);
  const roots = items.filter((i) => i.collectionId === id && !i.parentId).sort((a, b) => a.order - b.order);
  return (
    <div className="mb-1">
      <div className="group flex items-center gap-0.5 px-1 hover:bg-elevated">
        <button type="button" className="flex min-w-0 flex-1 items-center gap-1 py-1.5 text-left" onClick={() => toggle(id)}>
          <ChevronRight className={cn("size-3.5 text-subtle transition-transform", open && "rotate-90")} />
          {open ? <FolderOpen className="size-3.5 text-muted" /> : <Folder className="size-3.5 text-muted" />}
          <span className="truncate text-sm font-medium">{name}</span>
        </button>
        <RowMenu
          onRename={() => {
            const next = window.prompt("Collection name", name);
            if (next) renameCollection(id, next);
          }}
          onDelete={() => deleteCollection(id)}
          extras={[
            { label: "New investigation", run: () => addItem("investigation", null, id) },
            { label: "New request", run: () => addItem("request", null, id) },
            { label: "New note", run: () => addItem("note", null, id) },
          ]}
        />
      </div>
      {open
        ? roots.map((item) => <ItemNode key={item.id} item={item} items={items} depth={1} />)
        : null}
    </div>
  );
}

function ItemNode({ item, items, depth }: { item: Item; items: Item[]; depth: number }) {
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

  if (item.kind === "folder") {
    return (
      <div>
        <div
          className="group flex items-center hover:bg-elevated"
          style={{ paddingLeft: 8 + depth * 12 }}
        >
          <button type="button" className="flex min-w-0 flex-1 items-center gap-1 py-1 text-left" onClick={() => toggle(item.id)}>
            <ChevronRight className={cn("size-3 text-subtle transition-transform", open && "rotate-90")} />
            <Folder className="size-3.5 text-muted" />
            <span className="truncate text-sm">{item.name}</span>
          </button>
          <RowMenu
            onRename={() => {
              const next = window.prompt("Folder name", item.name);
              if (next) renameItem(item.id, next);
            }}
            onDelete={() => deleteItem(item.id)}
            extras={[
              { label: "New investigation", run: () => addItem("investigation", item.id, item.collectionId) },
              { label: "New request", run: () => addItem("request", item.id, item.collectionId) },
              { label: "New note", run: () => addItem("note", item.id, item.collectionId) },
            ]}
          />
        </div>
        {open ? children.map((c) => <ItemNode key={c.id} item={c} items={items} depth={depth + 1} />) : null}
      </div>
    );
  }

  return (
    <div
      className={cn("nav-row group flex items-center", !active && "hover:bg-elevated")}
      data-active={active}
      style={{ paddingLeft: 8 + depth * 12 }}
    >
      <button
        type="button"
        className="flex min-w-0 flex-1 items-center gap-1.5 py-1 text-left"
        onClick={() => selectItem(item.id)}
      >
        {item.kind === "request" ? (
          <Badge tone={methodTone(item.method ?? "GET")} className="min-w-11 justify-center px-1">
            {item.method ?? "GET"}
          </Badge>
        ) : item.kind === "investigation" ? (
          <FileSearch className="size-3.5 text-accent" />
        ) : (
          <FileText className="size-3.5 text-muted" />
        )}
        <span className="truncate text-sm">{item.name}</span>
      </button>
      <RowMenu
        onRename={() => {
          const next = window.prompt("Name", item.name);
          if (next) renameItem(item.id, next);
        }}
        onDelete={() => deleteItem(item.id)}
        extras={[{ label: "Duplicate", run: () => duplicateItem(item.id) }]}
      />
    </div>
  );
}

function RowMenu({
  onRename,
  onDelete,
  extras = [],
}: {
  onRename: () => void;
  onDelete: () => void;
  extras?: { label: string; run: () => void }[];
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="mr-1 hidden size-7 items-center justify-center rounded-sm text-subtle hover:text-foreground group-hover:flex"
          aria-label="Item menu"
        >
          <MoreHorizontal className="size-3.5" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {extras.map((e) => (
          <DropdownMenuItem key={e.label} onSelect={e.run}>
            {e.label}
          </DropdownMenuItem>
        ))}
        <DropdownMenuItem onSelect={onRename}>Rename</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={onDelete} className="text-danger">
          <Trash2 className="size-3.5" /> Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function HistoryList() {
  const history = useScratchpad((s) => s.history);
  const selectItem = useScratchpad((s) => s.selectItem);
  const deleteHistory = useScratchpad((s) => s.deleteHistory);
  const clearHistory = useScratchpad((s) => s.clearHistory);
  const setLastResponse = useScratchpad((s) => s.setLastResponse);
  const items = useScratchpad((s) => s.items);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center justify-between px-3 py-2">
        <p className="text-2xs font-medium uppercase tracking-[0.14em] text-subtle">Request history</p>
        {history.length ? (
          <Button size="sm" variant="ghost" onClick={() => clearHistory()}>
            Clear
          </Button>
        ) : null}
      </div>
      <div className="min-h-0 flex-1 overflow-auto px-1 pb-3">
        {history.length === 0 ? (
          <p className="px-3 py-8 text-center text-xs text-muted">Executed requests appear here.</p>
        ) : (
          history.map((h) => (
            <button
              key={h.id}
              type="button"
              className="mb-0.5 flex w-full items-start gap-2 px-2 py-1.5 text-left hover:bg-elevated"
              onClick={() => {
                setLastResponse(h.requestId ?? null, h.response);
                if (h.requestId && items.some((i) => i.id === h.requestId)) selectItem(h.requestId);
              }}
            >
              <Badge tone={methodTone(h.method)} className="mt-0.5 min-w-11 justify-center px-1">
                {h.method}
              </Badge>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm">{h.name}</span>
                <span className="block truncate font-mono text-2xs text-subtle">{h.url}</span>
                <span className="font-mono text-2xs text-muted">
                  {h.response.status || "ERR"} · {formatRelative(h.createdAt)}
                </span>
              </span>
              <span
                role="button"
                tabIndex={0}
                className="rounded-sm p-1 text-subtle hover:text-danger"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteHistory(h.id);
                }}
              >
                <Trash2 className="size-3" />
              </span>
            </button>
          ))
        )}
      </div>
    </div>
  );
}

function SearchList() {
  const query = useScratchpad((s) => s.searchQuery);
  const setQuery = useScratchpad((s) => s.setSearchQuery);
  const collections = useScratchpad((s) => s.collections);
  const items = useScratchpad((s) => s.items);
  const history = useScratchpad((s) => s.history);
  const selectItem = useScratchpad((s) => s.selectItem);
  const setLastResponse = useScratchpad((s) => s.setLastResponse);
  const hits = useMemo(
    () => searchWorkspace(query, collections, items, history),
    [query, collections, items, history],
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="p-2">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search investigations, notes, requests"
          autoFocus
        />
      </div>
      <div className="min-h-0 flex-1 overflow-auto px-1 pb-3">
        {query && hits.length === 0 ? (
          <p className="px-3 py-8 text-center text-xs text-muted">No matches.</p>
        ) : null}
        {hits.map((hit) => (
          <button
            key={hit.id}
            type="button"
            className="mb-0.5 flex w-full flex-col items-start px-2 py-1.5 text-left hover:bg-elevated"
            onClick={() => {
              if (hit.kind === "history") {
                const h = history.find((x) => x.id === hit.historyId);
                if (h) setLastResponse(h.requestId ?? null, h.response);
              }
              if (hit.itemId) selectItem(hit.itemId);
            }}
          >
            <span className="flex items-center gap-1.5 text-sm">
              {hit.kind === "request" ? (
                <Globe className="size-3 text-muted" />
              ) : hit.kind === "investigation" ? (
                <FileSearch className="size-3 text-accent" />
              ) : (
                <FileText className="size-3 text-muted" />
              )}
              {hit.title}
            </span>
            <span className="line-clamp-2 font-mono text-2xs text-subtle">{hit.snippet}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function useSidebarFilterState() {
  return useState("");
}
