import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { Item } from "@/lib/scratchpad/types";
import { useScratchpad } from "@/lib/scratchpad/store";
import { MarkdownDoc } from "./MarkdownDoc";

export function NotePane({ item }: { item: Item }) {
  const updateRequest = useScratchpad((s) => s.updateRequest);
  const [mode, setMode] = useState<"preview" | "edit">("preview");
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center gap-1 border-b border-border px-3 py-1.5">
        <Button size="sm" variant={mode === "preview" ? "secondary" : "ghost"} onClick={() => setMode("preview")}>
          Preview
        </Button>
        <Button size="sm" variant={mode === "edit" ? "secondary" : "ghost"} onClick={() => setMode("edit")}>
          Edit
        </Button>
        <span className="ml-auto text-2xs text-subtle">Markdown · HTTP blocks are executable</span>
      </div>
      {mode === "edit" ? (
        <Textarea
          className="min-h-0 flex-1 resize-none rounded-none border-0 focus-visible:ring-0"
          value={item.content ?? ""}
          onChange={(e) => updateRequest(item.id, { content: e.target.value })}
        />
      ) : (
        <div className="min-h-0 flex-1 overflow-auto">
          <MarkdownDoc source={item.content ?? ""} />
        </div>
      )}
    </div>
  );
}
