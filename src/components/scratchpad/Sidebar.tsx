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
import { IconTip } from "@/components/ui/icon-tip";
import { searchWorkspace } from "@/lib/scratchpad/search";
import { useScratchpad } from "@/lib/scratchpad/store";
import type { Item, ItemKind } from "@/lib/scratchpad/types";
import { cn, formatRelative } from "@/lib/utils";
import { NameDialog } from "./NameDialog";

export function Sidebar() {
  const view = useScratchpad((s) => s.sidebarView);
  const setView = useScratchpad((s) => s.setSidebarView);
  return (
    <div className="sidebar-rail relative flex h-full min-h-0 flex-col overflow-visible bg-surface">
      <div className="sidebar-surface flex min-h-0 flex-1 flex-col border-r border-border bg-surface">
      <div className="sidebar-tabs flex items-center border-b border-border px-1">
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
    <button
      type="button"
      onClick={onClick}
      data-active={active}
      className="rail-tab flex-1 min-w-0"
      aria-label={label}
      title={label}
    >
      {icon}
      <span className="rail-tab-label truncate">{label}</span>
    </button>
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
          <span className="sidebar-name-text truncate text-sm font-medium" title={name}>{name}</span>
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
            <span className="sidebar-name-text truncate text-sm" title={item.name}>{item.name}</span>
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
          <Badge tone={methodTone(item.method ?? "GET")} className="min-w-11 justify-center px-1">
            <span className="method-full">{item.method ?? "GET"}</span>
            <span className="method-compact">{(item.method ?? "GET").slice(0, 1)}</span>
          </Badge>
        ) : item.kind === "investigation" ? (
          <FileSearch className="size-3.5 text-accent" />
        ) : (
          <FileText className="size-3.5 text-muted" />
        )}
        <span className="sidebar-name-text truncate text-sm" title={item.name}>{item.name}</span>
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
            className="mr-1 flex size-7 shrink-0 items-center justify-center rounded-md text-subtle hover:text-foreground opacity-100 md:opacity-0 md:group-hover:opacity-100 md:data-[state=open]:opacity-100 md:focus-visible:opacity-100"
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