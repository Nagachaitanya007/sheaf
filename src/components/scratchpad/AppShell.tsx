import { FileCode2, FolderTree, Maximize2, Moon, MoreHorizontal, PanelLeft, PanelRight, Send, Square, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { Group, Panel, Separator as ResizeHandle } from "react-resizable-panels";
import { Toaster } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { IconTip } from "@/components/ui/icon-tip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TooltipProvider } from "@/components/ui/tooltip";
import { applyAppearance, readAppearance, toggleAppearance, type Appearance } from "@/lib/scratchpad/appearance";
import { cancelSend, runDocument, sendItem } from "@/lib/scratchpad/send";
import { formatSyncTime, readSyncPrefs } from "@/lib/scratchpad/sync-prefs";
import { useScratchpad } from "@/lib/scratchpad/store";
import { isMac } from "@/lib/utils";
import { BrandMark } from "./BrandMark";
import { CenterWorkspace } from "./CenterWorkspace";
import { CommandPalette } from "./CommandPalette";
import { EnvEditor } from "./EnvEditor";
import { ImportExportDialog } from "./ImportExportDialog";
import { RightDrawer } from "./RightDrawer";
import { ShortcutsDialog } from "./ShortcutsDialog";
import { Sidebar } from "./Sidebar";
import { SyncDialog } from "./SyncDialog";

export function AppShell() {
  const hydrated = useScratchpad((s) => s.hydrated);
  const hydrate = useScratchpad((s) => s.hydrate);
  const [appearance, setAppearance] = useState<Appearance>("light");

  useEffect(() => {
    const next = readAppearance();
    setAppearance(next);
    applyAppearance(next);
  }, []);

  useEffect(() => {
    void hydrate();
    const failsafe = window.setTimeout(() => {
      if (!useScratchpad.getState().hydrated) {
        void useScratchpad.getState().hydrate();
      }
    }, 50);
    const onOnline = () => useScratchpad.getState().setOnline(true);
    const onOffline = () => useScratchpad.getState().setOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.clearTimeout(failsafe);
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, [hydrate]);

  const cycleAppearance = () => setAppearance((current) => toggleAppearance(current));

  if (!hydrated) return <ShellFrame />;
  return (
    <TooltipProvider delayDuration={250}>
      <div className="flex h-dvh flex-col bg-background text-foreground">
        <TitleBar appearance={appearance} onToggleAppearance={cycleAppearance} />
        <div className="min-h-0 min-w-0 flex-1 overflow-hidden">
          <DesktopPanes />
        </div>
        <MobileDock />
        <StatusBar />
        <CommandPalette onToggleAppearance={cycleAppearance} />
        <EnvEditor />
        <ShortcutsDialog />
        <ImportExportDialog />
        <SyncDialog />
        <Toaster theme={appearance} position="bottom-right" richColors={false} />
        <Keybindings />
      </div>
    </TooltipProvider>
  );
}

function ShellFrame() {
  return (
    <div className="flex h-dvh flex-col bg-background text-foreground">
      <header className="flex h-11 items-center gap-3 border-b border-border px-3">
        <span className="flex size-6 items-center justify-center text-accent">
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

function TitleBar({
  appearance,
  onToggleAppearance,
}: {
  appearance: Appearance;
  onToggleAppearance: () => void;
}) {
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
      <span className="flex size-6 items-center justify-center text-accent">
        <BrandMark className="size-3.5" />
      </span>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold tracking-tight">Sheaf</p>
        <p className="hidden truncate text-2xs text-subtle sm:block">{workspace.name} · stored locally</p>
      </div>
      <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
        <Select value={activeEnvironmentId ?? ""} onValueChange={(id) => setEnvironment(id)}>
          <SelectTrigger className="h-8 max-w-[148px]" aria-label="Environment">
            <SelectValue placeholder="Environment" />
          </SelectTrigger>
          <SelectContent>
            {environments.map((e) => (
              <SelectItem key={e.id} value={e.id}>
                {e.name}
              </SelectItem>
            ))}