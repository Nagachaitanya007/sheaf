import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useScratchpad } from "@/lib/scratchpad/store";
import { lineDiff } from "@/lib/scratchpad/utilities";
import { prettyBody, contentTypeOf } from "@/lib/scratchpad/http";
import { ResponseView } from "./ResponseView";
import { UtilityPanel } from "./UtilityPanel";

export function RightDrawer() {
  const tab = useScratchpad((s) => s.rightTab);
  const setTab = useScratchpad((s) => s.setRightTab);
  const lastResponse = useScratchpad((s) => s.lastResponse);
  const items = useScratchpad((s) => s.items);
  const activeItemId = useScratchpad((s) => s.activeItemId);
  const environments = useScratchpad((s) => s.environments);
  const activeEnvironmentId = useScratchpad((s) => s.activeEnvironmentId);
  const history = useScratchpad((s) => s.history);
  const item = items.find((i) => i.id === activeItemId);
  const env = environments.find((e) => e.id === activeEnvironmentId);

  return (
    <div className="flex h-full min-h-0 flex-col bg-surface">
      <div className="flex gap-1 border-b border-border p-2">
        {(["response", "utility", "meta"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`h-8 flex-1 rounded-md text-xs font-medium capitalize ${
              tab === t ? "bg-elevated text-foreground" : "text-muted hover:text-foreground"
            }`}
          >
            {t === "response" ? "Inspector" : t === "utility" ? "Utilities" : "Meta"}
          </button>
        ))}
      </div>
      <div className="min-h-0 flex-1">
        {tab === "response" ? <ResponseView response={lastResponse} /> : null}
        {tab === "utility" ? <UtilityPanel /> : null}
        {tab === "meta" ? (
          <MetaPane
            itemName={item?.name}
            itemKind={item?.kind}
            envName={env?.name}
            history={history}
          />
        ) : null}
      </div>
    </div>
  );
}

function MetaPane({
  itemName,
  itemKind,
  envName,
  history,
}: {
  itemName?: string;
  itemKind?: string;
  envName?: string;
  history: { id: string; name: string; method: string; response: { status: number; body: string; headers: Record<string, string> } }[];
}) {
  const compareIds = useScratchpad((s) => s.compareIds);
  const setCompare = useScratchpad((s) => s.setCompare);
  const a = history.find((h) => h.id === compareIds[0]);
  const b = history.find((h) => h.id === compareIds[1]);
  const diff = useMemo(() => {
    if (!a || !b) return null;
    const pa = prettyBody(a.response.body, contentTypeOf(a.response.headers));
    const pb = prettyBody(b.response.body, contentTypeOf(b.response.headers));
    return lineDiff(pa.split("\n"), pb.split("\n"));
  }, [a, b]);

  return (
    <div className="h-full overflow-auto p-3 text-sm">
      <p className="text-2xs font-medium uppercase tracking-wider text-subtle">Active</p>
      <p className="mt-1 text-foreground">{itemName ?? "Nothing selected"}</p>
      <p className="text-xs text-muted">
        {itemKind ?? "—"} · env {envName ?? "none"}
      </p>
      <p className="mt-4 text-2xs font-medium uppercase tracking-wider text-subtle">Storage</p>
      <p className="mt-1 text-xs leading-relaxed text-muted">
        Workspace data is stored in IndexedDB in this browser. Requests you send go to the destination API (or a same-origin
        proxy when CORS blocks the browser). Tokens are not logged.
      </p>
      <p className="mt-5 text-2xs font-medium uppercase tracking-wider text-subtle">Compare responses</p>
      <div className="mt-2 grid grid-cols-2 gap-2">
        <select
          value={compareIds[0] ?? ""}
          onChange={(e) => setCompare(0, e.target.value || null)}
          className="h-8 rounded-md border border-border bg-inset px-2 text-xs"
        >
          <option value="">Left</option>
          {history.slice(0, 20).map((h) => (
            <option key={h.id} value={h.id}>
              {h.method} {h.response.status} {h.name}
            </option>
          ))}
        </select>
        <select
          value={compareIds[1] ?? ""}
          onChange={(e) => setCompare(1, e.target.value || null)}
          className="h-8 rounded-md border border-border bg-inset px-2 text-xs"
        >
          <option value="">Right</option>
          {history.slice(0, 20).map((h) => (
            <option key={h.id} value={h.id}>
              {h.method} {h.response.status} {h.name}
            </option>
          ))}
        </select>
      </div>
      {diff ? (
        <pre className="mt-3 max-h-80 overflow-auto rounded-md border border-border bg-inset p-2 font-mono text-2xs">
          {diff.map((l, i) => (
            <div
              key={i}
              className={
                l.type === "add" ? "text-success" : l.type === "del" ? "text-danger" : "text-muted"
              }
            >
              {l.type === "add" ? "+" : l.type === "del" ? "−" : " "} {l.text}
            </div>
          ))}
        </pre>
      ) : (
        <p className="mt-2 text-xs text-muted">Pick two history entries.</p>
      )}
      {history[0] ? (
        <div className="mt-4">
          <Badge tone="muted">Last {history[0].response.status}</Badge>
        </div>
      ) : null}
      <div className="mt-6">
        <Button size="sm" variant="ghost" onClick={() => useScratchpad.getState().setShortcutsOpen(true)}>
          Keyboard shortcuts
        </Button>
      </div>
    </div>
  );
}
