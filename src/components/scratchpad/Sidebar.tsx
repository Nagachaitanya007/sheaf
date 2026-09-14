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
    <div className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden bg-surface">
      <div className="flex items-center border-b border-border px-1">
        <SideTab active={view === "workspace"} onClick={() => setView("workspace")} icon={<Folder className="size-3.5" />} label="Workspace" />
        <SideTab active={view === "history"} onClick={() => setView("history")} icon={<History className="size-3.5" />} label="History" />
        <SideTab active={view === "search"} onClick={() => setView("search")} icon={<Search className="size-3.5" />} label="Search" />
      </div>
      {view === "workspace" ? <WorkspaceTree /> : null}
      {view === "history" ? <HistoryList /> : null}
      {view === "search" ? <SearchList /> : null}