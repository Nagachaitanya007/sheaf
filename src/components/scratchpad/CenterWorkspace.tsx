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
                )}
              >
                {tab.kind === "request" ? (
                  <Badge tone={methodTone(tab.method ?? "GET")} className="min-w-9 justify-center px-1 text-2xs">
                    {tab.method ?? "GET"}
                  </Badge>
                ) : tab.kind === "investigation" ? (
                  <FileSearch className="size-3 text-accent" />
                ) : (
                  <FileText className="size-3" />
                )}
                <span className="max-w-36 truncate">{tab.name}</span>
                {dirty && tab.id === activeItemId ? <span className="size-1.5 rounded-full bg-accent" /> : null}
                <IconTip label="Close">
                  <span
                    role="button"
                    tabIndex={0}
                    aria-label="Close"
                    className="rounded-md p-0.5 text-subtle hover:bg-inset hover:text-foreground"
                    onClick={(e) => {
                      e.stopPropagation();
                      closeTab(tab.id);
                    }}
                  >
                    <X className="size-3" />
                  </span>
                </IconTip>
                {tab.id === activeItemId ? <span className="absolute inset-x-2 bottom-0 h-0.5 bg-accent" /> : null}
              </button>
            ) : null,
          )
        )}
      </div>
      <div className="min-h-0 flex-1">
        {!active || active.kind === "folder" ? (
          <EmptyEditor
            onNewInvestigation={() => addItem("investigation", null)}
            onNewRequest={() => addItem("request", null)}
            onNewNote={() => addItem("note", null)}
          />
        ) : active.kind === "request" ? (
          <RequestPane item={active} />
        ) : (
          <NotePane item={active} />
        )}
      </div>
    </div>
  );
}

function EmptyEditor({
  onNewInvestigation,
  onNewRequest,
  onNewNote,
}: {
  onNewInvestigation: () => void;
  onNewRequest: () => void;
  onNewNote: () => void;
}) {
  return (
    <div className="flex h-full flex-col items-start justify-center gap-4 px-10">
      <div className="max-w-md">
        <p className="font-serif text-2xl font-semibold tracking-tight">Start an investigation</p>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Write what you're trying to understand, then add an HTTP request. Notes, responses, and extractions stay in the same document.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button variant="send" onClick={onNewInvestigation}>
          New investigation
        </Button>
        <Button variant="secondary" onClick={onNewRequest}>
          + HTTP Request
        </Button>
        <Button variant="ghost" onClick={onNewNote}>
          + Markdown
        </Button>
      </div>
    </div>
  );
}