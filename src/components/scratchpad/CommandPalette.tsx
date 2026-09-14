import { Command } from "cmdk";
import { useEffect, useMemo, type ReactNode } from "react";
import { toast } from "sonner";
import { exportHttpBundle, toPortable } from "@/lib/scratchpad/import-export";
import { isPortable, useScratchpad } from "@/lib/scratchpad/store";
import { UTILITIES } from "@/lib/scratchpad/utilities";
import { cancelSend, runDocument, sendItem } from "@/lib/scratchpad/send";
import { downloadText } from "@/lib/utils";

export function CommandPalette() {
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

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-overlay px-3 pt-[12vh]" onClick={() => setOpen(false)}>
      <Command
        label="Command palette"
        className="w-full max-w-xl overflow-hidden rounded-xl border border-border bg-surface shadow-[var(--shadow-pop)]"
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
                className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm data-[selected=true]:bg-elevated"
              >
                <span className="text-muted">{f.kind === "request" ? f.method : f.kind === "investigation" ? "INV" : "MD"}</span>
                {f.name}
              </Command.Item>
            ))}
          </Command.Group>
          <Command.Group heading="Create" className="px-1 py-1 text-2xs font-medium uppercase tracking-wider text-subtle">
            <Item onSelect={() => { addItem("investigation", null); setOpen(false); }}>New investigation</Item>
            <Item onSelect={() => { addItem("request", null); setOpen(false); }}>New request</Item>
            <Item onSelect={() => { addItem("note", null); setOpen(false); }}>New note</Item>
            <Item onSelect={() => { addItem("folder", null); setOpen(false); }}>New folder</Item>
            <Item onSelect={() => { addCollection(); setOpen(false); }}>New collection</Item>
          </Command.Group>
          <Command.Group heading="Run" className="px-1 py-1 text-2xs font-medium uppercase tracking-wider text-subtle">
            <Item
              onSelect={() => {
                const item = items.find((i) => i.id === activeItemId);
                if (item?.kind === "request") void sendItem(item);
                setOpen(false);
              }}
            >
              Run request
            </Item>
            <Item
              onSelect={() => {
                const item = items.find((i) => i.id === activeItemId);
                if (item && (item.kind === "investigation" || item.kind === "note")) void runDocument(item);
                setOpen(false);
              }}
            >
              Run investigation
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
              Toggle focus mode
            </Item>
            <Item onSelect={() => { useScratchpad.getState().setSidebarHidden(!useScratchpad.getState().sidebarHidden); setOpen(false); }}>
              Toggle navigator
            </Item>
            <Item onSelect={() => { useScratchpad.getState().setInspectorHidden(!useScratchpad.getState().inspectorHidden); setOpen(false); }}>
              Toggle inspector
            </Item>
            <Item onSelect={() => { setSidebarView("history"); setOpen(false); }}>Open history</Item>
            <Item onSelect={() => { setSidebarView("search"); setOpen(false); }}>Search workspace</Item>
            <Item onSelect={() => { setEnvEditorOpen(true); setOpen(false); }}>Switch environment / vars</Item>
            <Item onSelect={() => { setShortcutsOpen(true); setOpen(false); }}>Keyboard shortcuts</Item>
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
                const snap = useScratchpad.getState().snapshot();
                downloadText("sheaf-workspace.json", JSON.stringify(toPortable(snap), null, 2), "application/json");
                toast.success("Workspace exported");
                setOpen(false);
              }}
            >
              Export workspace JSON
            </Item>
            <Item
              onSelect={() => {
                const snap = useScratchpad.getState().snapshot();
                downloadText("sheaf.http", exportHttpBundle(snap), "text/plain");
                toast.success("HTTP file exported");
                setOpen(false);
              }}
            >
              Export HTTP file
            </Item>
            <Item
              onSelect={() => {
                const item = items.find((i) => i.id === activeItemId);
                if (item?.kind === "note") {
                  downloadText(`${item.name.replace(/\s+/g, "-")}.md`, item.content ?? "", "text/markdown");
                  toast.success("Markdown exported");
                } else toast.error("Open a note first");
                setOpen(false);
              }}
            >
              Export active note as Markdown
            </Item>
            <Item
              onSelect={() => {
                if (!lastResponse) {
                  toast.error("No response to export");
                } else {
                  downloadText("response.json", lastResponse.body, "application/json");
                  toast.success("Response exported");
                }
                setOpen(false);
              }}
            >
              Export response JSON
            </Item>
            <Item
              onSelect={() => {
                const input = document.createElement("input");
                input.type = "file";
                input.accept = "application/json";
                input.onchange = async () => {
                  const file = input.files?.[0];
                  if (!file) return;
                  try {
                    const data = JSON.parse(await file.text()) as unknown;
                    if (!isPortable(data)) throw new Error("Not a Sheaf workspace");
                    useScratchpad.getState().importPortable(data);
                    toast.success("Workspace imported");
                  } catch (err) {
                    toast.error(err instanceof Error ? err.message : "Import failed");
                  }
                };
                input.click();
                setOpen(false);
              }}
            >
              Import workspace JSON
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
      className="flex cursor-pointer items-center rounded-md px-2 py-1.5 text-sm data-[selected=true]:bg-elevated"
    >
      {children}
    </Command.Item>
  );
}
