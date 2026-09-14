import { FileText, X } from "lucide-react";
import { Badge, methodTone } from "@/components/ui/badge";
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
  const tabs = openTabIds.map((id) => items.find((i) => i.id === id)).filter(Boolean);
  const active = items.find((i) => i.id === activeItemId);

  return (
    <div className="flex h-full min-h-0 flex-col bg-background">
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
                  "group flex h-full items-center gap-1.5 border-r border-border px-2.5 text-xs",
                  tab.id === activeItemId ? "bg-elevated text-foreground" : "text-muted hover:text-foreground",
                )}
              >
                {tab.kind === "request" ? (
                  <Badge tone={methodTone(tab.method ?? "GET")} className="min-w-9 justify-center px-1 text-2xs">
                    {tab.method ?? "GET"}
                  </Badge>
                ) : (
                  <FileText className="size-3" />
                )}
                <span className="max-w-36 truncate">{tab.name}</span>
                <span
                  role="button"
                  tabIndex={0}
                  className="rounded-sm p-0.5 text-subtle hover:bg-inset hover:text-foreground"
                  onClick={(e) => {
                    e.stopPropagation();
                    closeTab(tab.id);
                  }}
                >
                  <X className="size-3" />
                </span>
              </button>
            ) : null,
          )
        )}
      </div>
      <div className="min-h-0 flex-1">
        {!active || active.kind === "folder" ? (
          <EmptyEditor onNewRequest={() => addItem("request", null)} onNewNote={() => addItem("note", null)} />
        ) : active.kind === "request" ? (
          <RequestPane item={active} />
        ) : (
          <NotePane item={active} />
        )}
      </div>
    </div>
  );
}

function EmptyEditor({ onNewRequest, onNewNote }: { onNewRequest: () => void; onNewNote: () => void }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 px-8 text-center">
      <p className="text-lg font-semibold tracking-tight">Scratch something</p>
      <p className="max-w-sm text-sm text-muted">
        Open a request from the tree, or start a note with executable HTTP blocks. Everything stays on this device.
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onNewRequest}
          className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground"
        >
          New request
        </button>
        <button
          type="button"
          onClick={onNewNote}
          className="rounded-md bg-elevated px-3 py-2 text-sm font-medium text-foreground shadow-[var(--shadow-border)]"
        >
          New note
        </button>
      </div>
    </div>
  );
}
