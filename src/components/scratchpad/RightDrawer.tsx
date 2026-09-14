import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useScratchpad } from "@/lib/scratchpad/store";
import { formatDiff, structuralDiff } from "@/lib/scratchpad/jsondiff";
import { parseJsonSafe } from "@/lib/scratchpad/jsonpath";
import { contextFromState, inspectVars, maskSecret } from "@/lib/scratchpad/variables";
import { prettyBody, contentTypeOf } from "@/lib/scratchpad/http";
import { copyText } from "@/lib/utils";
import { ResponseView } from "./ResponseView";
import { UtilityPanel } from "./UtilityPanel";
import { toast } from "sonner";

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
        {(["response", "utility", "vars", "meta"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`h-8 flex-1 rounded-md text-xs font-medium capitalize ${
              tab === t ? "bg-elevated text-foreground" : "text-muted hover:text-foreground"
            }`}
          >
            {t === "response" ? "Inspector" : t === "utility" ? "Utilities" : t === "vars" ? "Vars" : "Meta"}
          </button>
        ))}
      </div>
      <div className="min-h-0 flex-1">
        {tab === "response" ? <ResponseView response={lastResponse} /> : null}
        {tab === "utility" ? <UtilityPanel /> : null}
        {tab === "vars" ? <VarsPane /> : null}
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
    const ja = parseJsonSafe(a.response.body);
    const jb = parseJsonSafe(b.response.body);
    if (ja !== undefined && jb !== undefined) return formatDiff(structuralDiff(ja, jb));
    const pa = prettyBody(a.response.body, contentTypeOf(a.response.headers));
    const pb = prettyBody(b.response.body, contentTypeOf(b.response.headers));
    return formatDiff(structuralDiff(pa, pb));
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
        <div>
          <pre className="mt-3 max-h-80 overflow-auto rounded-md border border-border bg-inset p-2 font-mono text-2xs text-foreground">
            {diff}
          </pre>
          <Button
            size="sm"
            variant="ghost"
            className="mt-1"
            onClick={async () => {
              const ok = await copyText(diff);
              toast[ok ? "success" : "error"](ok ? "Copied diff" : "Copy failed");
            }}
          >
            Copy diff
          </Button>
        </div>
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

function VarsPane() {
  const items = useScratchpad((s) => s.items);
  const activeItemId = useScratchpad((s) => s.activeItemId);
  const environments = useScratchpad((s) => s.environments);
  const activeEnvironmentId = useScratchpad((s) => s.activeEnvironmentId);
  const workspace = useScratchpad((s) => s.workspace);
  const setExtractedVar = useScratchpad((s) => s.setExtractedVar);
  const item = items.find((i) => i.id === activeItemId);
  const env = environments.find((e) => e.id === activeEnvironmentId);
  const rows = inspectVars(contextFromState({ item, environment: env, workspace }));
  const [key, setKey] = useState("");
  const [value, setValue] = useState("");
  return (
    <div className="h-full overflow-auto p-3">
      <p className="text-2xs font-medium uppercase tracking-wider text-subtle">Resolution order</p>
      <p className="mt-1 text-xs text-muted">
        Request → Investigation → Environment → Global. Then named block fields like {"{{Login.accessToken}}"}.
      </p>
      <ul className="mt-3 divide-y divide-border">
        {rows.length === 0 ? <li className="py-6 text-xs text-muted">No variables in scope.</li> : null}
        {rows.map((row) => (
          <li key={`${row.scope}-${row.key}`} className="flex items-baseline justify-between gap-2 py-1.5">
            <div className="min-w-0">
              <p className="font-mono text-xs text-accent">
                {"{{"}
                {row.key}
                {"}}"}
              </p>
              <p className="truncate font-mono text-2xs text-muted">{maskSecret(row.value, row.secret)}</p>
            </div>
            <span className="shrink-0 text-2xs text-subtle">{row.scope}</span>
          </li>
        ))}
      </ul>
      {item ? (
        <div className="mt-4 space-y-2">
          <p className="text-2xs font-medium uppercase tracking-wider text-subtle">Add investigation var</p>
          <Input value={key} placeholder="token" className="font-mono" onChange={(e) => setKey(e.target.value)} />
          <Input value={value} placeholder="value" className="font-mono" onChange={(e) => setValue(e.target.value)} />
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              if (!key.trim()) return;
              setExtractedVar(item.id, key.trim(), value, "investigation");
              setKey("");
              setValue("");
            }}
          >
            Save
          </Button>
        </div>
      ) : null}
    </div>
  );
}
