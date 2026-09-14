import { FileSearch, FileText, X } from "lucide-react";
import { Badge, methodTone } from "@/components/ui/badge";
import { IconTip } from "@/components/ui/icon-tip";
import { Button } from "@/components/ui/button";
import { useScratchpad } from "@/lib/scratchpad/store";
import { cn } from "@/lib/utils";
import { NotePane } from "./NotePane";
import { RequestPane } from "./RequestPane";

export function CenterWorkspace() {
  const items = useScratchpad((s) => s.items);
  const openTabIds = useScratchpad((s) => s.openTabIds);
  const activeItemId = useScratchpad((s) => s.activeItemId);
  const selectItem = useScratchpad((s) => s.selectItem);
  const closeTab = useScratchpad((s) => s.closeTab);
  const addItem = useScratchpad((s) => s.addItem);
  const dirty = useScratchpad((s) => s.dirty);
  const tabs = openTabIds.map((id) => items.find((i) => i.id === id)).filter(Boolean);
  const active = items.find((i) => i.id === activeItemId);

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden bg-background">
      <div className="flex h-9 shrink-0 items-center overflow-x-auto border-b border-border">
        {tabs.length === 0 ? (
          <p className="px-3 text-xs text-muted">No open tabs</p>
        ) : (
          tabs.map((tab) =>
            tab ? (
              <button
                key={tab.id}
                type="button"
                onClick={() => selectItem(tab.id)}
                className={cn(
                  "group relative flex h-full items-center gap-1.5 border-r border-border px-2.5 text-xs",
                  tab.id === activeItemId ? "bg-background text-foreground" : "text-muted hover:text-foreground",