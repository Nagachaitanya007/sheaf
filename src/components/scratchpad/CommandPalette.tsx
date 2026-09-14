import { Command } from "cmdk";
import { useEffect, useMemo, type ReactNode } from "react";
import { toast } from "sonner";
import { serializeHttp } from "@/lib/scratchpad/http";
import { UTILITIES } from "@/lib/scratchpad/utilities";
import { cancelSend, runDocument, sendItem } from "@/lib/scratchpad/send";
import { insertHttpInto } from "@/lib/scratchpad/insert-http";
import { useScratchpad } from "@/lib/scratchpad/store";

export function CommandPalette({ onToggleAppearance }: { onToggleAppearance?: () => void }) {
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

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
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

  const files = useMemo(
    () => items.filter((i) => i.kind === "request" || i.kind === "note" || i.kind === "investigation"),
    [items],
  );
  const requests = useMemo(() => items.filter((i) => i.kind === "request"), [items]);

  if (!open) return null;

  function requireDoc(): (typeof items)[number] | null {
    const item = items.find((i) => i.id === activeItemId);
    if (item && (item.kind === "investigation" || item.kind === "note")) return item;
    toast.error("Open an investigation first");
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-overlay px-3 pt-[12vh]" onClick={() => setOpen(false)}>
      <Command
        label="Command palette"
        className="w-full max-w-xl overflow-hidden rounded-lg border border-border-strong bg-elevated shadow-[var(--shadow-pop)]"
        onClick={(e) => e.stopPropagation()}
      >
        <Command.Input
          autoFocus
          placeholder="Search Sheaf…"
          className="h-11 w-full border-b border-border bg-transparent px-4 text-sm outline-none placeholder:text-subtle"
        />
        <Command.List className="max-h-80 overflow-auto p-1">
          <Command.Empty className="px-3 py-6 text-center text-sm text-muted">No results.</Command.Empty>
          <Command.Group heading="Go" className="px-1 py-1 text-2xs font-medium uppercase tracking-wider text-subtle">
            {files.map((f) => (
              <Command.Item
                key={f.id}
                value={`${f.kind} ${f.name} ${f.url ?? ""}`}
                onSelect={() => {
                  selectItem(f.id);
                  setOpen(false);
                }}
                className="cmdk-item flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm"
              >
                <span className="font-mono text-2xs uppercase text-muted">
                  {f.kind === "request" ? f.method : f.kind === "investigation" ? "INV" : "MD"}
                </span>
                {f.name}
              </Command.Item>
            ))}
          </Command.Group>
          <Command.Group heading="Create" className="px-1 py-1 text-2xs font-medium uppercase tracking-wider text-subtle">
            <Item onSelect={() => { addItem("investigation", null); setOpen(false); }}>New Investigation</Item>
            <Item onSelect={() => { addItem("request", null); setOpen(false); }}>New Request</Item>
            <Item onSelect={() => { addItem("note", null); setOpen(false); }}>New Note</Item>
            <Item onSelect={() => { addItem("folder", null); setOpen(false); }}>New folder</Item>
            <Item onSelect={() => { addCollection(); setOpen(false); }}>New collection</Item>
            <Item
              onSelect={() => {
                const item = requireDoc();
                if (item) insertHttpInto(item);
                setOpen(false);
              }}
            >
              Insert HTTP Block
            </Item>
            {requests.map((req) => (
              <Item
                key={`ins-${req.id}`}
                onSelect={() => {
                  const item = requireDoc();
                  if (!item) {
                    setOpen(false);
                    return;
                  }
                  const block = serializeHttp({
                    name: req.name,
                    method: req.method ?? "GET",
                    url: req.url ?? "",
                    headers: req.headers,
                    body: req.body,
                  });
                  insertHttpInto(item, block);
                  toast.success(`Inserted ${req.name}`);
                  setOpen(false);
                }}
              >
                Insert Existing Request · {req.name}
              </Item>
            ))}
            {requests.length === 0 ? (
              <Item
                onSelect={() => {
                  const item = requireDoc();
                  if (item) {
                    insertHttpInto(item);
                    toast.success("Inserted HTTP block");
                  }
                  setOpen(false);
                }}
              >
                Insert Existing Request
              </Item>
            ) : null}
          </Command.Group>
          <Command.Group heading="Run" className="px-1 py-1 text-2xs font-medium uppercase tracking-wider text-subtle">
            <Item
              onSelect={() => {
                const item = items.find((i) => i.id === activeItemId);
                if (item?.kind === "request") void sendItem(item);
                setOpen(false);
              }}
            >
              Run Request
            </Item>
            <Item
              onSelect={() => {
                const item = items.find((i) => i.id === activeItemId);
                if (item && (item.kind === "investigation" || item.kind === "note")) void runDocument(item);
                setOpen(false);
              }}
            >
              Run Investigation
            </Item>
            <Item
              onSelect={() => {
                cancelSend();
                setOpen(false);
              }}
            >
              Cancel running request
            </Item>
            <Item onSelect={() => { useScratchpad.getState().setFocusMode(!useScratchpad.getState().focusMode); setOpen(false); }}>
              Focus Mode
            </Item>
            <Item onSelect={() => { useScratchpad.getState().setSidebarHidden(!useScratchpad.getState().sidebarHidden); setOpen(false); }}>
              Toggle Sidebar
            </Item>
            <Item onSelect={() => { useScratchpad.getState().setInspectorHidden(!useScratchpad.getState().inspectorHidden); setOpen(false); }}>
              Toggle Inspector
            </Item>
            <Item
              onSelect={() => {
                onToggleAppearance?.();
                setOpen(false);
              }}
            >
              Toggle Theme
            </Item>
            <Item onSelect={() => { setSidebarView("history"); setOpen(false); }}>Open history</Item>
            <Item onSelect={() => { setSidebarView("search"); setOpen(false); }}>Search workspace</Item>
            <Item onSelect={() => { setEnvEditorOpen(true); setOpen(false); }}>Switch environment / vars</Item>
            <Item onSelect={() => { setShortcutsOpen(true); setOpen(false); }}>Keyboard shortcuts</Item>
            <Item
              onSelect={() => {
                const itemId = useScratchpad.getState().activeItemId;
                if (!itemId || !lastResponse) toast.error("Run a request first");
                else {
                  useScratchpad.getState().setExtractedVar(itemId, "value", lastResponse.body.slice(0, 200), "investigation");
                  toast.success("Extracted body snippet as {{value}} — use the JSON tree for a field");
                }
                setOpen(false);
              }}
            >
              Extract Variable
            </Item>
            <Item
              onSelect={() => {
                useScratchpad.getState().setRightTab("meta");
                setOpen(false);
              }}
            >
              Compare Responses
            </Item>
            <Item
              onSelect={() => {
                setUtility("json-format", useScratchpad.getState().lastResponse?.body);
                setOpen(false);
              }}
            >
              Open JSON Utility
            </Item>
            <Item
              onSelect={() => {
                setUtility("jwt", useScratchpad.getState().lastResponse?.body);
                setOpen(false);
              }}
            >
              Open JWT Inspector
            </Item>
          </Command.Group>
          <Command.Group heading="Utilities" className="px-1 py-1 text-2xs font-medium uppercase tracking-wider text-subtle">
            {UTILITIES.map((u) => (
              <Item
                key={u.id}
                onSelect={() => {
                  setUtility(u.id);
                  setOpen(false);
                }}
              >
                {u.name}
              </Item>
            ))}
          </Command.Group>
          <Command.Group heading="Import / export" className="px-1 py-1 text-2xs font-medium uppercase tracking-wider text-subtle">
            <Item
              onSelect={() => {
                useScratchpad.getState().setImportExportOpen(true);
                setOpen(false);
              }}
            >
              Import
            </Item>
            <Item
              onSelect={() => {
                useScratchpad.getState().setImportExportOpen(true);
                setOpen(false);
              }}
            >
              Export
            </Item>
            <Item
              onSelect={() => {
                useScratchpad.getState().setSyncOpen(true);
                setOpen(false);
              }}
            >
              Enable Sync
            </Item>
            <Item
              onSelect={() => {
                useScratchpad.getState().setSyncIntent(true);
                useScratchpad.getState().setSyncOpen(true);
                setOpen(false);
              }}
            >
              Sync Now
            </Item>
            <Item
              onSelect={() => {
                if (window.confirm("Reset this workspace to the sample data? Your local data will be replaced.")) {
                  useScratchpad.getState().resetToSeed();
                  toast.success("Restored sample workspace");
                }
                setOpen(false);
              }}
            >
              Restore sample workspace
            </Item>
          </Command.Group>
        </Command.List>
      </Command>
    </div>
  );
}

function Item({ children, onSelect }: { children: ReactNode; onSelect: () => void }) {
  return (
    <Command.Item
      onSelect={onSelect}
      className="cmdk-item flex cursor-pointer items-center rounded-sm px-2 py-1.5 text-sm"
    >
      {children}
    </Command.Item>
  );
}
