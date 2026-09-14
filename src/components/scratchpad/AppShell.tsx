import { FileCode2, FolderTree, PanelRight, Send } from "lucide-react";
import { useEffect } from "react";
import { Group, Panel, Separator as ResizeHandle } from "react-resizable-panels";
import { Toaster } from "sonner";
import { Button } from "@/components/ui/button";
import { TooltipProvider } from "@/components/ui/tooltip";
import { sendItem } from "@/lib/scratchpad/send";
import { useScratchpad } from "@/lib/scratchpad/store";
import { isMac } from "@/lib/utils";
import { BrandMark } from "./BrandMark";
import { CenterWorkspace } from "./CenterWorkspace";
import { CommandPalette } from "./CommandPalette";
import { EnvEditor } from "./EnvEditor";
import { RightDrawer } from "./RightDrawer";
import { ShortcutsDialog } from "./ShortcutsDialog";
import { Sidebar } from "./Sidebar";

export function AppShell() {
  const hydrated = useScratchpad((s) => s.hydrated);
  const hydrate = useScratchpad((s) => s.hydrate);
  useEffect(() => {
    void hydrate();
    const failsafe = window.setTimeout(() => {
      if (!useScratchpad.getState().hydrated) {
        void useScratchpad.getState().hydrate();
      }
    }, 50);
    return () => window.clearTimeout(failsafe);
  }, [hydrate]);

  if (!hydrated) return <ShellFrame />;
  return (
    <TooltipProvider delayDuration={250}>
      <div className="flex h-dvh flex-col bg-background text-foreground">
        <TitleBar />
        <div className="min-h-0 flex-1">
          <DesktopPanes />
        </div>
        <MobileDock />
        <StatusBar />
        <CommandPalette />
        <EnvEditor />
        <ShortcutsDialog />
        <Toaster theme="dark" position="bottom-right" richColors={false} />
        <Keybindings />
      </div>
    </TooltipProvider>
  );
}

function ShellFrame() {
  return (
    <div className="flex h-dvh flex-col bg-background text-foreground">
      <header className="flex h-11 items-center gap-3 border-b border-border px-3">
        <span className="flex size-6 items-center justify-center rounded-md border border-border text-accent">
          <BrandMark className="size-3.5" />
        </span>
        <span className="text-sm font-semibold tracking-tight">Sheaf</span>
      </header>
      <div className="grid min-h-0 flex-1 grid-cols-1 md:grid-cols-[220px_1fr_280px]">
        <div className="hidden border-r border-border bg-surface md:block" />
        <div className="flex items-center justify-center text-sm text-muted">Loading workspace…</div>
        <div className="hidden border-l border-border bg-surface md:block" />
      </div>
    </div>
  );
}

function TitleBar() {
  const workspace = useScratchpad((s) => s.workspace);
  const environments = useScratchpad((s) => s.environments);
  const activeEnvironmentId = useScratchpad((s) => s.activeEnvironmentId);
  const setEnvironment = useScratchpad((s) => s.setEnvironment);
  const setCommandOpen = useScratchpad((s) => s.setCommandOpen);
  const setEnvEditorOpen = useScratchpad((s) => s.setEnvEditorOpen);
  const sendState = useScratchpad((s) => s.sendState);
  const items = useScratchpad((s) => s.items);
  const activeItemId = useScratchpad((s) => s.activeItemId);
  const item = items.find((i) => i.id === activeItemId);
  const mod = isMac() ? "⌘" : "Ctrl";

  return (
    <header className="flex h-11 shrink-0 items-center gap-2 border-b border-border px-2 sm:px-3">
      <span className="flex size-6 items-center justify-center rounded-md border border-border text-accent">
        <BrandMark className="size-3.5" />
      </span>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold tracking-tight">Sheaf</p>
        <p className="hidden truncate text-2xs text-subtle sm:block">{workspace.name} · stored locally</p>
      </div>
      <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
        <select
          value={activeEnvironmentId ?? ""}
          onChange={(e) => setEnvironment(e.target.value)}
          className="h-8 max-w-[140px] rounded-md border border-border bg-elevated px-2 text-xs"
          aria-label="Environment"
        >
          {environments.map((e) => (
            <option key={e.id} value={e.id}>
              {e.name}
            </option>
          ))}
        </select>
        <Button size="sm" variant="ghost" className="hidden sm:inline-flex" onClick={() => setEnvEditorOpen(true)}>
          Vars
        </Button>
        <Button
          size="sm"
          variant="secondary"
          className="hidden md:inline-flex"
          onClick={() => setCommandOpen(true)}
        >
          {mod}K
        </Button>
        {item?.kind === "request" ? (
          <Button
            size="sm"
            variant="send"
            disabled={sendState === "sending"}
            onClick={() => void sendItem(item)}
            className="sm:hidden"
          >
            <Send className="size-3.5" />
          </Button>
        ) : null}
      </div>
    </header>
  );
}

function DesktopPanes() {
  const mobilePane = useScratchpad((s) => s.mobilePane);
  return (
    <>
      <div className="hidden h-full md:block">
        <Group orientation="horizontal" className="h-full" defaultLayout={{ sidebar: 22, center: 48, right: 30 }}>
          <Panel id="sidebar" minSize="14%" className="min-w-0">
            <Sidebar />
          </Panel>
          <ResizeHandle className="w-1 bg-border hover:bg-accent/40 data-active:bg-accent/60" />
          <Panel id="center" minSize="30%" className="min-w-0">
            <CenterWorkspace />
          </Panel>
          <ResizeHandle className="w-1 bg-border hover:bg-accent/40 data-active:bg-accent/60" />
          <Panel id="right" minSize="20%" className="min-w-0">
            <RightDrawer />
          </Panel>
        </Group>
      </div>
      <div className="h-full md:hidden">
        {mobilePane === "explorer" ? <Sidebar /> : null}
        {mobilePane === "editor" ? <CenterWorkspace /> : null}
        {mobilePane === "inspect" ? <RightDrawer /> : null}
      </div>
    </>
  );
}

function MobileDock() {
  const pane = useScratchpad((s) => s.mobilePane);
  const setPane = useScratchpad((s) => s.setMobilePane);
  return (
    <nav className="flex h-12 shrink-0 border-t border-border bg-surface md:hidden">
      {[
        { id: "explorer" as const, label: "Workspace", icon: FolderTree },
        { id: "editor" as const, label: "Editor", icon: FileCode2 },
        { id: "inspect" as const, label: "Inspect", icon: PanelRight },
      ].map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => setPane(t.id)}
          className={`flex flex-1 flex-col items-center justify-center gap-0.5 text-2xs ${
            pane === t.id ? "text-foreground" : "text-muted"
          }`}
        >
          <t.icon className="size-4" />
          {t.label}
        </button>
      ))}
    </nav>
  );
}

function StatusBar() {
  const items = useScratchpad((s) => s.items);
  const history = useScratchpad((s) => s.history);
  const dirty = useScratchpad((s) => s.dirty);
  const env = useScratchpad((s) => s.environments.find((e) => e.id === s.activeEnvironmentId));
  const sendState = useScratchpad((s) => s.sendState);
  return (
    <footer className="hidden h-7 shrink-0 items-center gap-3 border-t border-border bg-surface px-3 text-2xs text-muted md:flex">
      <span>{dirty ? "Saving…" : "Saved locally"}</span>
      <span className="text-border-strong">·</span>
      <span>{items.filter((i) => i.kind === "request").length} requests</span>
      <span>{history.length} history</span>
      <span className="ml-auto">{env?.name ?? "no env"}</span>
      <span>{sendState === "sending" ? "Sending" : "Ready"}</span>
      <span className="text-subtle">? shortcuts</span>
    </footer>
  );
}

function Keybindings() {
  const setCommandOpen = useScratchpad((s) => s.setCommandOpen);
  const setSearchOpen = useScratchpad((s) => s.setSearchOpen);
  const setShortcutsOpen = useScratchpad((s) => s.setShortcutsOpen);
  const setUtility = useScratchpad((s) => s.setUtility);
  const addItem = useScratchpad((s) => s.addItem);
  const items = useScratchpad((s) => s.items);
  const activeItemId = useScratchpad((s) => s.activeItemId);
  const commandOpen = useScratchpad((s) => s.commandOpen);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const typing =
        target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "SELECT" || target.isContentEditable);
      const mod = e.metaKey || e.ctrlKey;

      if (mod && e.key.toLowerCase() === "p") {
        e.preventDefault();
        setCommandOpen(true);
        return;
      }
      if (mod && e.shiftKey && e.key.toLowerCase() === "f") {
        e.preventDefault();
        setSearchOpen(true);
        return;
      }
      if (mod && e.shiftKey && e.key.toLowerCase() === "u") {
        e.preventDefault();
        setUtility("json-format");
        return;
      }
      if (mod && e.key === "Enter") {
        const item = items.find((i) => i.id === activeItemId);
        if (item?.kind === "request") {
          e.preventDefault();
          void sendItem(item);
        }
        return;
      }
      if (mod && e.key.toLowerCase() === "n") {
        e.preventDefault();
        addItem(e.shiftKey ? "note" : "request", null);
        return;
      }
      if (!typing && !commandOpen && (e.key === "?" || (e.shiftKey && e.key === "/"))) {
        e.preventDefault();
        setShortcutsOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [addItem, activeItemId, commandOpen, items, setCommandOpen, setSearchOpen, setShortcutsOpen, setUtility]);

  return null;
}
