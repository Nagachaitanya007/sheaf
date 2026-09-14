import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { Textarea } from "@/components/ui/textarea";
import { IconTip } from "@/components/ui/icon-tip";
import type { Item } from "@/lib/scratchpad/types";
import { serializeHttp } from "@/lib/scratchpad/http";
import { appendHttpFence, countHttpBlocks } from "@/lib/scratchpad/markdown";
import { applySlash, detectSlash, requestCommand, type SlashCommand } from "@/lib/scratchpad/slash";
import { insertHttpInto } from "@/lib/scratchpad/insert-http";
import { useScratchpad } from "@/lib/scratchpad/store";
import { SlashMenu, slashMatches } from "./SlashMenu";
import { InvestigationToolbar, MarkdownDoc } from "./MarkdownDoc";

export function NotePane({ item }: { item: Item }) {
  const updateRequest = useScratchpad((s) => s.updateRequest);
  const items = useScratchpad((s) => s.items);
  const mode = useScratchpad((s) => s.docMode);
  const setMode = useScratchpad((s) => s.setDocMode);
  const [slash, setSlash] = useState<{ from: number; caret: number; query: string; index: number; preview?: boolean } | null>(null);
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

  const pick = useCallback(
    (cmd: SlashCommand) => {
      if (!slash) return;
      if (cmd.kind === "request" && !cmd.insert) {
        setSlash({ ...slash, query: slash.query || "req", index: 0 });
        return;
      }
      if (slash.preview) {
        const content = appendAtEnd(item.content ?? "", cmd.insert);
        updateRequest(item.id, { content });
        setSlash(null);
        if (cmd.kind === "http") {
          useScratchpad.getState().setFocusHttpIndex(Math.max(0, countHttpBlocks(content) - 1));
          setMode("preview");
        } else {
          setMode("edit");
        }
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
    },
    [slash, item.content, item.id, updateRequest, setMode],
  );

  useEffect(() => {
    if (mode !== "preview") return;
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (slash?.preview) {
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
        if (e.key === "Enter" || e.key === "Tab") {
          e.preventDefault();
          if (matches[slash.index]) pick(matches[slash.index]!);
          return;
        }
        if (e.key === "Backspace") {
          e.preventDefault();
          setSlash((s) => (s ? { ...s, query: s.query.slice(0, -1), index: 0 } : s));
          return;
        }
        if (e.key.length === 1 && !e.metaKey && !e.ctrlKey && e.key !== "/") {
          e.preventDefault();
          setSlash((s) => (s ? { ...s, query: s.query + e.key, index: 0 } : s));
          return;
        }
      }
      if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (target && target.closest("input, textarea, select, [contenteditable='true']")) return;
      e.preventDefault();
      setSlash({ from: (item.content ?? "").length, caret: (item.content ?? "").length, query: "", index: 0, preview: true });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mode, item.content, slash, extras, item.id, pick]);

  useEffect(() => {
    if (!slash?.preview) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null;
      if (t?.closest("[aria-label='Insert block']")) return;
      setSlash(null);
    };
    window.addEventListener("mousedown", onDown);
    return () => window.removeEventListener("mousedown", onDown);
  }, [slash?.preview]);

  function onChange(value: string, caret: number) {
    updateRequest(item.id, { content: value });
    const hit = detectSlash(value, caret);
    setSlash(hit ? { from: hit.from, caret, query: hit.query, index: 0 } : null);
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
      <div className="flex min-h-10 min-w-0 items-center gap-1.5 border-b border-border bg-surface px-2">
        <button type="button" data-active={mode === "preview"} className="rail-tab shrink-0" onClick={() => setMode("preview")}>
          Preview
        </button>
        <button type="button" data-active={mode === "edit"} className="rail-tab shrink-0" onClick={() => setMode("edit")}>
          Edit
        </button>
        {investigation ? (
          <div className="flex min-w-0 items-center gap-1.5 rounded-lg bg-inset p-0.5">
            <InvestigationToolbar item={item} />
            <IconTip label="Insert HTTP request">
              <button
                type="button"
                className="shrink-0 rounded-md px-2 py-1 text-2xs font-medium text-muted transition-colors hover:bg-elevated hover:text-foreground"
                onClick={() => insertHttpInto(item)}
              >
                Insert HTTP
              </button>
            </IconTip>
            <IconTip label="Insert block">
              <button
                type="button"
                className="size-7 shrink-0 rounded-md font-mono text-xs text-muted transition-colors hover:bg-elevated hover:text-foreground"
                aria-label="Insert block"
                onClick={() =>
                  setSlash({
                    from: (item.content ?? "").length,
                    caret: (item.content ?? "").length,
                    query: "",
                    index: 0,
                    preview: mode === "preview",
                  })
                }
              >
                /
              </button>
            </IconTip>
          </div>
        ) : (
          <span className="ml-auto text-2xs text-subtle">Type / for blocks · HTTP is executable</span>
        )}
        {investigation && mode === "preview" ? (
          <span className="ml-auto hidden min-w-0 truncate text-2xs text-subtle sm:block">Click a request to edit · / for blocks</span>
        ) : investigation ? (
          <span className="ml-auto hidden min-w-0 truncate text-2xs text-subtle sm:block">/ for blocks · ⌘⇧Enter runs</span>
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
          {slash && !slash.preview ? (
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
        <div className="relative min-h-0 flex-1 overflow-auto">
          <MarkdownDoc
            source={item.content ?? ""}
            item={item}
            onInsertHttp={() => insertHttpInto(item)}
          />
          {slash?.preview ? (
            <SlashMenu
              query={slash.query}
              extras={menuExtras}
              index={slash.index}
              onIndex={(i) => setSlash((s) => (s ? { ...s, index: i } : s))}
              onPick={pick}
              style={{ position: "absolute", left: 24, top: 24 }}
            />
          ) : null}
        </div>
      )}
    </div>
  );
}

function appendAtEnd(source: string, insert: string): string {
  if (!source.trim()) return insert;
  if (insert.startsWith("```http")) return appendHttpFence(source, insert.replace(/^```http\n/, "").replace(/\n```\n?$/, ""));
  return source.replace(/\s*$/, "") + (insert.startsWith("\n") ? insert : `\n\n${insert}`);
}

function caretMenuStyle(el: HTMLTextAreaElement | null, caret: number): CSSProperties {
  if (!el) return { position: "absolute", left: 16, bottom: 16 };
  const style = window.getComputedStyle(el);
  const lineHeight = Number.parseFloat(style.lineHeight) || 20;
  const paddingTop = Number.parseFloat(style.paddingTop) || 0;
  const paddingLeft = Number.parseFloat(style.paddingLeft) || 0;
  const lines = el.value.slice(0, caret).split("\n");
  const col = lines[lines.length - 1]?.length ?? 0;
  const row = lines.length - 1;
  const top = paddingTop + row * lineHeight - el.scrollTop + lineHeight + 6;
  const left = Math.min(paddingLeft + col * 7.4, Math.max(8, el.clientWidth - 296));
  return {
    position: "absolute",
    top: Math.min(Math.max(top, 8), Math.max(8, el.clientHeight - 88)),
    left: Math.max(8, left),
  };
}