import { ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";

const PREVIEW_LIMIT = 80;
const ARRAY_PAGE = 50;

function preview(value: unknown): string {
  if (value === null) return "null";
  if (typeof value === "string") return JSON.stringify(value.length > PREVIEW_LIMIT ? value.slice(0, PREVIEW_LIMIT) + "…" : value);
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) return `Array(${value.length})`;
  if (typeof value === "object") return `{${Object.keys(value as object).length}}`;
  return String(value);
}

function tone(value: unknown): string {
  if (value === null) return "text-subtle";
  if (typeof value === "string") return "text-success";
  if (typeof value === "number") return "text-info";
  if (typeof value === "boolean") return "text-warn";
  return "text-muted";
}

function Node({
  name,
  value,
  depth,
}: {
  name: string;
  value: unknown;
  depth: number;
}) {
  const isExpandable = value !== null && typeof value === "object";
  const [open, setOpen] = useState(depth < 2);
  const [shown, setShown] = useState(ARRAY_PAGE);

  if (!isExpandable) {
    return (
      <div className="flex gap-2 py-px font-mono text-xs leading-5">
        <span className="text-accent">{name}</span>
        <span className="text-subtle">:</span>
        <span className={cn("break-all", tone(value))}>{preview(value)}</span>
      </div>
    );
  }

  const entries = Array.isArray(value)
    ? value.map((v, i) => [String(i), v] as const)
    : Object.entries(value as Record<string, unknown>);
  const visible = entries.slice(0, shown);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-1 rounded-sm py-px text-left font-mono text-xs leading-5 hover:bg-elevated"
      >
        <ChevronRight className={cn("size-3 text-subtle transition-transform duration-150", open && "rotate-90")} />
        <span className="text-accent">{name}</span>
        <span className="text-subtle">{preview(value)}</span>
      </button>
      {open ? (
        <div className="ml-2 border-l border-border pl-3">
          {visible.map(([k, v]) => (
            <Node key={k} name={k} value={v} depth={depth + 1} />
          ))}
          {entries.length > shown ? (
            <button
              type="button"
              className="mt-1 text-xs text-accent hover:underline"
              onClick={() => setShown((s) => s + ARRAY_PAGE)}
            >
              Show {Math.min(ARRAY_PAGE, entries.length - shown)} more
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export function JsonTree({ raw, className }: { raw: string; className?: string }) {
  const parsed = useMemo(() => {
    try {
      return { ok: true as const, value: JSON.parse(raw) as unknown };
    } catch (err) {
      return { ok: false as const, error: err instanceof Error ? err.message : String(err) };
    }
  }, [raw]);

  if (!raw.trim()) {
    return <p className="px-3 py-6 text-sm text-muted">No JSON to inspect.</p>;
  }
  if (!parsed.ok) {
    return <p className="px-3 py-4 font-mono text-xs text-danger">{parsed.error}</p>;
  }
  return (
    <div className={cn("px-2 py-2", className)}>
      <Node name="root" value={parsed.value} depth={0} />
    </div>
  );
}
