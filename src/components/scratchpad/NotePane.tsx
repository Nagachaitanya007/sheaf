import { useMemo, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { Textarea } from "@/components/ui/textarea";
import type { Item } from "@/lib/scratchpad/types";
import { serializeHttp } from "@/lib/scratchpad/http";
import { applySlash, detectSlash, requestCommand, type SlashCommand } from "@/lib/scratchpad/slash";
import { useScratchpad } from "@/lib/scratchpad/store";
import { SlashMenu, slashMatches } from "./SlashMenu";
import { InvestigationToolbar, MarkdownDoc } from "./MarkdownDoc";

export function NotePane({ item }: { item: Item }) {
  const updateRequest = useScratchpad((s) => s.updateRequest);
  const items = useScratchpad((s) => s.items);
  const [mode, setMode] = useState<"preview" | "edit">("preview");
  const [slash, setSlash] = useState<{ from: number; caret: number; query: string; index: number } | null>(null);
  const areaRef = useRef<HTMLTextAreaElement>(null);
  const investigation = item.kind === "investigation";
  const extras = useMemo(
    () =>
      items
        .filter((i) => i.kind === "request")
        .map((i) =>
          requestCommand(
            i.id,
            i.name,
            serializeHttp({
              name: i.name,
              method: i.method ?? "GET",
              url: i.url ?? "",
              headers: i.headers,
              body: i.body,
            }),
          ),
        ),
    [items],
  );

  function onChange(value: string, caret: number) {
    updateRequest(item.id, { content: value });
    const hit = detectSlash(value, caret);
    setSlash(hit ? { from: hit.from, caret, query: hit.query, index: 0 } : null);
  }

  function pick(cmd: SlashCommand) {
    if (!slash) return;
    if (cmd.kind === "request" && !cmd.insert) {
      setSlash({ ...slash, query: slash.query || "req", index: 0 });
      return;
    }
    const next = applySlash(item.content ?? "", slash.from, slash.caret, cmd.insert, cmd.caretOffset);
    updateRequest(item.id, { content: next.text });
    setSlash(null);
    requestAnimationFrame(() => {
      const el = areaRef.current;
      if (!el) return;
      el.focus();
      el.setSelectionRange(next.caret, next.caret);
    });
  }

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (!slash) return;
    const q = slash.query.toLowerCase();
    const extraPool = q.length >= 2 || q.startsWith("req") ? extras : [];
    const matches = slashMatches(slash.query, extraPool);
    if (e.key === "Escape") {
      e.preventDefault();
      setSlash(null);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSlash((s) => (s ? { ...s, index: Math.min(s.index + 1, Math.max(matches.length - 1, 0)) } : s));
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setSlash((s) => (s ? { ...s, index: Math.max(s.index - 1, 0) } : s));
      return;
    }
    if ((e.key === "Enter" || e.key === "Tab") && matches[slash.index]) {
      e.preventDefault();
      pick(matches[slash.index]!);
    }
  }

  const q = slash?.query.toLowerCase() ?? "";
  const menuExtras = slash && (q.length >= 2 || q.startsWith("req")) ? extras : [];

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
          <div className="ml-2 flex items-center gap-2">
            <InvestigationToolbar item={item} />
            <button
              type="button"
              className="text-2xs text-muted hover:text-foreground"
              onClick={() => {
                insertHttpInto(item);
                setMode("edit");
              }}
            >
              Insert HTTP
            </button>
          </div>
        ) : (
          <span className="ml-auto text-2xs text-subtle">Type / for blocks · HTTP is executable</span>
        )}
        {investigation && mode === "preview" ? null : investigation ? (
          <span className="ml-auto text-2xs text-subtle">/ inserts blocks · ⌘⇧Enter runs</span>
        ) : null}
      </div>
      {mode === "edit" ? (
        <div className="relative min-h-0 flex-1">
          <Textarea
            ref={areaRef}
            className="h-full min-h-0 flex-1 resize-none rounded-none border-0 bg-background px-4 py-3 focus-visible:ring-0"
            value={item.content ?? ""}
            placeholder="Write the investigation. Type /http to add a request."
            onChange={(e) => onChange(e.target.value, e.target.selectionStart)}
            onKeyDown={onKeyDown}
            onClick={(e) => onChange((e.target as HTMLTextAreaElement).value, (e.target as HTMLTextAreaElement).selectionStart)}
            onBlur={() => setTimeout(() => setSlash(null), 160)}
          />
          {slash ? (
            <SlashMenu
              query={slash.query}
              extras={menuExtras}
              index={slash.index}
              onIndex={(i) => setSlash((s) => (s ? { ...s, index: i } : s))}
              onPick={pick}
              style={caretMenuStyle(areaRef.current, slash.caret)}
            />
          ) : null}
        </div>
      ) : (
        <div className="min-h-0 flex-1 overflow-auto">
          <MarkdownDoc
            source={item.content ?? ""}
            item={item}
            onInsertHttp={() => {
              insertHttpInto(item);
              setMode("edit");
            }}
          />
        </div>
      )}
    </div>
  );
}

export function insertHttpInto(item: Item) {
  const content = `${item.content ?? ""}${item.content?.endsWith("\n") || !item.content ? "" : "\n"}\n\`\`\`http\nGET https://api.example.com/\n\n\`\`\`\n`;
  useScratchpad.getState().updateRequest(item.id, { content });
}

function caretMenuStyle(el: HTMLTextAreaElement | null, caret: number): CSSProperties {
  if (!el) return { position: "absolute", left: 16, bottom: 16 };
  const style = window.getComputedStyle(el);
  const lineHeight = Number.parseFloat(style.lineHeight) || 20;
  const paddingTop = Number.parseFloat(style.paddingTop) || 0;
  const paddingLeft = Number.parseFloat(style.paddingLeft) || 0;
  const lines = el.value.slice(0, caret).split("\n");
  const row = lines.length - 1;
  const col = lines[lines.length - 1]?.length ?? 0;
  const top = paddingTop + row * lineHeight - el.scrollTop + lineHeight + 6;
  const left = Math.min(paddingLeft + col * 7.4, Math.max(8, el.clientWidth - 296));
  return {
    position: "absolute",
    top: Math.min(Math.max(top, 8), Math.max(8, el.clientHeight - 88)),
    left: Math.max(8, left),
  };
}