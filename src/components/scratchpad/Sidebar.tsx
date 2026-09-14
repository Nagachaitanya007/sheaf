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
import { useEffect, useMemo, useRef, useState } from "react";
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
import { IconTip } from "@/components/ui/icon-tip";
import { searchWorkspace } from "@/lib/scratchpad/search";
import { useScratchpad } from "@/lib/scratchpad/store";
import type { Item, ItemKind } from "@/lib/scratchpad/types";
import { cn, formatRelative } from "@/lib/utils";
import { NameDialog } from "./NameDialog";

export function Sidebar() {
  const view = useScratchpad((s) => s.sidebarView);
  const setView = useScratchpad((s) => s.setSidebarView);
  const [density, setDensity] = useState<"wide" | "medium" | "narrow" | "compact">("wide");
  const [hoverExpand, setHoverExpand] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sidebarRef.current;
    if (!el) return;
    const update = (width: number) => {
      setDensity(width >= 220 ? "wide" : width >= 170 ? "medium" : width >= 125 ? "narrow" : "compact");
    };
    update(el.getBoundingClientRect().width);
    const observer = new ResizeObserver(([entry]) => update(entry.contentRect.width));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={sidebarRef}
      data-density={density}
      className={cn(
        "relative flex h-full min-h-0 min-w-0 flex-col overflow-hidden bg-surface",
        hoverExpand && density !== "wide" && "z-30 overflow-visible shadow-xl",
      )}
      onMouseEnter={() => density !== "wide" && setHoverExpand(true)}
      onMouseLeave={() => setHoverExpand(false)}
    >
      <div className="shrink-0 px-2 pt-2 pb-1">
        <div className="flex items-center gap-0.5 rounded-lg bg-inset p-0.5">
          <SideTab active={view === "workspace"} onClick={() => setView("workspace")} icon={<Folder className="size-3.5" />} label="Workspace" />
          <SideTab active={view === "history"} onClick={() => setView("history")} icon={<History className="size-3.5" />} label="History" />
          <SideTab active={view === "search"} onClick={() => setView("search")} icon={<Search className="size-3.5" />} label="Search" />
        </div>
      </div>
      {view === "workspace" ? <WorkspaceTree /> : null}
      {view === "history" ? <HistoryList /> : null}
      {view === "search" ? <SearchList /> : null}
      <SidebarAdaptiveStyles />
      {hoverExpand && density !== "wide" ? (
        <div className="pointer-events-none absolute inset-y-0 left-0 z-[-1] w-[240px] bg-surface shadow-[8px_0_24px_rgba(0,0,0,0.08)]" />
      ) : null}
    </div>
  );
}

function MethodBadge({ method }: { method: string }) {
  const label = method.toUpperCase();
  const compact = label === "DELETE" ? "D" : label.slice(0, 1);
  return (
    <span
      className="method-badge shrink-0"
      data-method={label}
      title={label}
      aria-label={label}
    >
      <span className="method-full">{label}</span>
      <span className="method-compact">{compact}</span>
    </span>
  );
}

function NameLabel({ name, className }: { name: string; className?: string }) {
  return (
    <span
      className={cn(
        "sidebar-name min-w-0 flex-1",
        className,
      )}
      title={name}
    >
      <span className="sidebar-name-text">{name}</span>
    </span>
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
    <IconTip label={label}>
      <button
        type="button"
        onClick={onClick}
        data-active={active}
        aria-label={label}
        title={label}
        className="flex min-w-0 flex-1 items-center justify-center rounded-md px-2 py-1.5 text-muted transition-colors hover:bg-elevated hover:text-foreground data-[active=true]:bg-inset data-[active=true]:text-foreground"
      >
        {icon}
      </button>
    </IconTip>
  );
}

function WorkspaceTree() {
  const collections = useScratchpad((s) => s.collections);
  const items = useScratchpad((s) => s.items);
  const addCollection = useScratchpad((s) => s.addCollection);
  const addItem = useScratchpad((s) => s.addItem);
  const renameCollection = useScratchpad((s) => s.renameCollection);
  const renameItem = useScratchpad((s) => s.renameItem);
  const [rename, setRename] = useState<
    | { type: "collection"; id: string; name: string }
    | { type: "item"; id: string; name: string; kind: ItemKind }
    | null
  >(null);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center justify-between px-3 py-2">
        <p className="text-2xs font-medium uppercase tracking-[0.14em] text-subtle">Index</p>
        <DropdownMenu>
          <IconTip label="Add">
            <DropdownMenuTrigger asChild>
              <Button size="icon-sm" variant="ghost" aria-label="Add">
                <Plus className="size-3.5" />
              </Button>
            </DropdownMenuTrigger>
          </IconTip>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => addItem("investigation", null)}>New investigation</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => addItem("request", null)}>New request</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => addItem("note", null)}>New note</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => addItem("folder", null)}>New folder</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => addCollection()}>New collection</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => useScratchpad.getState().setImportExportOpen(true)}>Import / export</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => useScratchpad.getState().setSyncOpen(true)}>Sync</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="min-h-0 flex-1 overflow-auto px-1 pb-4">
        {collections.map((c) => (
          <CollectionNode
            key={c.id}
            id={c.id}
            name={c.name}
            items={items}
            onRename={() => setRename({ type: "collection", id: c.id, name: c.name })}
            onRenameItem={(item) => setRename({ type: "item", id: item.id, name: item.name, kind: item.kind })}
          />
        ))}
      </div>
      <NameDialog
        open={Boolean(rename)}
        title={
          rename?.type === "collection"
            ? "Rename collection"
            : rename?.kind === "folder"
              ? "Rename folder"
              : rename?.kind === "request"
                ? "Rename request"
                : rename?.kind === "investigation"
                  ? "Rename investigation"
                  : "Rename note"
        }
        initial={rename?.name ?? ""}
        submitLabel="Rename"
        existing={
          rename?.type === "collection"
            ? collections.filter((c) => c.id !== rename.id).map((c) => c.name)
            : rename
              ? (() => {
                  const target = items.find((i) => i.id === rename.id);
                  return target
                    ? items
                        .filter(
                          (i) =>
                            i.id !== target.id &&
                            i.collectionId === target.collectionId &&
                            i.parentId === target.parentId,
                        )
                        .map((i) => i.name)
                    : [];
                })()
              : []
        }
        onOpenChange={(next) => {
          if (!next) setRename(null);
        }}
        onSubmit={(name) => {
          if (!rename) return;
          if (rename.type === "collection") renameCollection(rename.id, name);
          else renameItem(rename.id, name);
        }}
      />
    </div>
  );
}

function CollectionNode({
  id,
  name,
  items,
  onRename,
  onRenameItem,
}: {
  id: string;
  name: string;
  items: Item[];
  onRename: () => void;
  onRenameItem: (item: Item) => void;
}) {
  const collapsedIds = useScratchpad((s) => s.collapsedIds);
  const toggle = useScratchpad((s) => s.toggleCollapsed);
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
          <NameLabel name={name} className="text-sm font-medium" />
        </button>
        <RowMenu
          onRename={onRename}
          onDelete={() => deleteCollection(id)}
          extras={[
            { label: "New investigation", run: () => addItem("investigation", null, id) },
            { label: "New request", run: () => addItem("request", null, id) },
            { label: "New note", run: () => addItem("note", null, id) },
          ]}
        />
      </div>
      {open
        ? roots.map((item) => <ItemNode key={item.id} item={item} items={items} depth={1} onRenameItem={onRenameItem} />)
        : null}
    </div>
  );
}

function ItemNode({
  item,
  items,
  depth,
  onRenameItem,
}: {
  item: Item;
  items: Item[];
  depth: number;
  onRenameItem: (item: Item) => void;
}) {
  const activeItemId = useScratchpad((s) => s.activeItemId);
  const collapsedIds = useScratchpad((s) => s.collapsedIds);
  const toggle = useScratchpad((s) => s.toggleCollapsed);
  const selectItem = useScratchpad((s) => s.selectItem);
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
            <NameLabel name={item.name} className="text-sm" />
          </button>
          <RowMenu
            onRename={() => onRenameItem(item)}
            onDelete={() => deleteItem(item.id)}
            extras={[
              { label: "New investigation", run: () => addItem("investigation", item.id, item.collectionId) },
              { label: "New request", run: () => addItem("request", item.id, item.collectionId) },
              { label: "New note", run: () => addItem("note", item.id, item.collectionId) },
            ]}
          />
        </div>
        {open ? children.map((c) => <ItemNode key={c.id} item={c} items={items} depth={depth + 1} onRenameItem={onRenameItem} />) : null}
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
          <MethodBadge method={item.method ?? "GET"} />
        ) : item.kind === "investigation" ? (
          <FileSearch className="size-3.5 text-accent" />
        ) : (
          <FileText className="size-3.5 text-muted" />
        )}
        <NameLabel name={item.name} className="text-sm" />
      </button>
      <RowMenu
        onRename={() => onRenameItem(item)}
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
      <IconTip label="More actions">
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="sidebar-row-action mr-1 flex size-7 shrink-0 items-center justify-center rounded-md text-subtle opacity-100 hover:text-foreground md:opacity-0 md:group-hover:opacity-100 md:data-[state=open]:opacity-100 md:focus-visible:opacity-100"
            aria-label="More actions"
          >
            <MoreHorizontal className="size-3.5" />
          </button>
        </DropdownMenuTrigger>
      </IconTip>
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

function SidebarAdaptiveStyles() {
  return (
    <style>{`
      [data-density="wide"] .method-compact,
      [data-density="medium"] .method-compact { display: none; }

      [data-density="narrow"] .method-full,
      [data-density="compact"] .method-full { display: none; }

      [data-density="narrow"] .method-badge,
      [data-density="compact"] .method-badge {
        width: 24px;
        height: 22px;
        padding: 0;
        border-radius: 7px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: 10px;
      }

      [data-density="compact"] .method-badge {
        width: 22px;
        height: 22px;
        border-radius: 6px;
      }

      [data-density="medium"] .sidebar-row-action {
        opacity: 0;
      }

      [data-density="narrow"] .sidebar-name-text,
      [data-density="compact"] .sidebar-name-text {
        display: block;
        overflow: hidden;
        white-space: nowrap;
        mask-image: linear-gradient(to right, #000 calc(100% - 20px), transparent 100%);
        -webkit-mask-image: linear-gradient(to right, #000 calc(100% - 20px), transparent 100%);
      }

      [data-density="compact"] .sidebar-name-text {
        mask-image: linear-gradient(to right, #000 calc(100% - 14px), transparent 100%);
        -webkit-mask-image: linear-gradient(to right, #000 calc(100% - 14px), transparent 100%);
      }

      [data-density="narrow"] .nav-row,
      [data-density="compact"] .nav-row {
        padding-top: 3px;
        padding-bottom: 3px;
      }

      [data-density="narrow"] .nav-row > button,
      [data-density="compact"] .nav-row > button {
        gap: 5px;
      }

      [data-density="compact"] .nav-row > button > svg:not(.size-3\.5) {
        display: none;
      }

      [data-density="narrow"] .group > button > svg.size-3\.5 {
        display: none;
      }

      [data-density="narrow"] .group > button,
      [data-density="compact"] .group > button {
        gap: 4px;
      }

      [data-density="compact"] .group > button > svg.size-3\.5 {
        display: none;
      }

      [data-density="compact"] .sidebar-name {
        display: none;
      }
    `}</style>
  );
}

export function useSidebarFilterState() {
  return useState("");
}