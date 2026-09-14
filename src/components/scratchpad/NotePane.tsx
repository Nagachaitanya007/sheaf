import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import type { Item } from "@/lib/scratchpad/types";
import { useScratchpad } from "@/lib/scratchpad/store";
import { InvestigationToolbar, MarkdownDoc } from "./MarkdownDoc";

export function NotePane({ item }: { item: Item }) {
  const updateRequest = useScratchpad((s) => s.updateRequest);
  const [mode, setMode] = useState<"preview" | "edit">("preview");
  const investigation = item.kind === "investigation";
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center gap-0 border-b border-border px-2">
        <button type="button" data-active={mode === "preview"} className="rail-tab" onClick={() => setMode("preview")}>
          Preview
        </button>
        <button type="button" data-active={mode === "edit"} className="rail-tab" onClick={() => setMode("edit")}>
          Edit
        </button>
        {investigation ? (
          <div className="ml-2">
            <InvestigationToolbar item={item} />
          </div>
        ) : (
          <span className="ml-auto text-2xs text-subtle">Markdown · HTTP blocks are executable</span>
        )}
        {investigation && mode === "preview" ? null : investigation ? (
          <span className="ml-auto text-2xs text-subtle">Ctrl/⌘ Shift Enter runs the sequence</span>
        ) : null}
      </div>
      {mode === "edit" ? (
        <Textarea
          className="min-h-0 flex-1 resize-none rounded-none border-0 focus-visible:ring-0"
          value={item.content ?? ""}
          onChange={(e) => updateRequest(item.id, { content: e.target.value })}
        />
      ) : (
        <div className="min-h-0 flex-1 overflow-auto">
          <MarkdownDoc source={item.content ?? ""} item={item} />
        </div>
      )}
    </div>
  );
}
