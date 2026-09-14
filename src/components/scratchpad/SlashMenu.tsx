import { useEffect, useMemo, useRef, type CSSProperties } from "react";
import { Code2, FileCode2, Heading, Minus, Quote, Table2, Type } from "lucide-react";
import { filterSlash, type SlashCommand } from "@/lib/scratchpad/slash";
import { cn } from "@/lib/utils";

const ICONS: Record<string, typeof Type> = {
  http: FileCode2,
  request: FileCode2,
  heading: Heading,
  text: Type,
  code: Code2,
  json: Code2,
  table: Table2,
  quote: Quote,
  callout: Quote,
  divider: Minus,
};

export function SlashMenu({
  query,
  extras = [],
  index,
  onIndex,
  onPick,
  style,
}: {
  query: string;
  extras?: SlashCommand[];
  index: number;
  onIndex: (i: number) => void;
  onPick: (cmd: SlashCommand) => void;
  style?: CSSProperties;
}) {
  const matches = useMemo(() => filterSlash(query, extras), [query, extras]);
  const listRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = listRef.current?.querySelector("[data-active='true']");
    el?.scrollIntoView({ block: "nearest" });
    const box = listRef.current;
    if (!box) return;
    const r = box.getBoundingClientRect();
    let dx = 0;
    let dy = 0;
    if (r.right > window.innerWidth - 8) dx = window.innerWidth - 8 - r.right;
    if (r.bottom > window.innerHeight - 8) dy = window.innerHeight - 8 - r.bottom;
    if (r.left < 8) dx += 8 - r.left;
    if (r.top < 8) dy += 8 - r.top;
    box.style.transform = dx || dy ? `translate(${dx}px, ${dy}px)` : "";
  }, [index, query]);

  if (!matches.length) {
    return (
      <div
        role="listbox"
        aria-label="Insert block"
        className="z-50 w-72 rounded-md border border-border bg-elevated p-2 text-xs text-muted shadow-[var(--shadow-pop)]"
        style={style}
      >
        No matching commands
      </div>
    );
  }

  return (
    <div
      ref={listRef}
      role="listbox"
      aria-label="Insert block"
      className="z-50 max-h-72 w-72 overflow-auto rounded-lg border border-border bg-elevated p-1 shadow-[var(--shadow-pop)]"
      style={style}
    >
      {matches.map((cmd, i) => {
        const Icon = cmd.id.startsWith("req:") ? FileCode2 : (ICONS[cmd.id] ?? Type);
        return (
          <button
            key={cmd.id}
            type="button"
            role="option"
            aria-selected={i === index}
            data-active={i === index}
            className={cn(
              "flex w-full items-start gap-2 rounded-sm px-2 py-1.5 text-left",
              i === index ? "bg-inset" : "hover:bg-inset/70",
            )}
            onMouseEnter={() => onIndex(i)}
            onMouseDown={(e) => {
              e.preventDefault();
              onPick(cmd);
            }}
          >
            <Icon className="mt-0.5 size-3.5 shrink-0 text-accent" />
            <span className="min-w-0">
              <span className="block text-sm text-foreground">{cmd.label}</span>
              <span className="block text-2xs text-muted">{cmd.hint}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function slashMatches(query: string, extras: SlashCommand[] = []) {
  return filterSlash(query, extras);
}
