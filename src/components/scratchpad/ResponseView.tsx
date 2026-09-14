import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { contentTypeOf, prettyBody } from "@/lib/scratchpad/http";
import { jsonPathToString } from "@/lib/scratchpad/jsonpath";
import { useScratchpad } from "@/lib/scratchpad/store";
import type { HttpResponse, ResponseView as ResponseViewTab } from "@/lib/scratchpad/types";
import { looksLikeEpoch, looksLikeJwt } from "@/lib/scratchpad/utilities";
import { cn, copyText, formatBytes, formatDuration } from "@/lib/utils";
import { CodeBlock } from "./CodeBlock";
import { JsonTree } from "./JsonTree";
import { toast } from "sonner";

function statusClass(status: number, error?: string) {
  if (error) return "text-danger";
  if (status >= 200 && status < 300) return "text-success";
  if (status >= 400 && status < 500) return "text-warn";
  if (status >= 500) return "text-danger";
  return "text-foreground";
}

export function ResponseView({ response, compact = false }: { response: HttpResponse | null; compact?: boolean }) {
  const [tab, setTab] = useState<ResponseViewTab>("pretty");
  const ct = response ? contentTypeOf(response.headers) : "";
  const pretty = useMemo(() => (response ? prettyBody(response.body, ct) : ""), [response, ct]);
  const isHtml = ct.includes("html");
  const isJson = ct.includes("json") || (response ? prettyBodyLooksJson(response.body) : false);
  const jwt = response && looksLikeJwt(response.body);
  const epoch = response ? looksLikeEpoch(Number(response.body.trim()) || response.body.trim()) : false;

  if (!response) {
    if (compact) return null;
    return (
      <div className="flex h-full flex-col items-start justify-center gap-2 px-6">
        <p className="font-serif text-lg font-semibold tracking-tight">No response yet</p>
        <p className="max-w-xs text-sm leading-relaxed text-muted">
          Send a request with Ctrl/⌘ Enter. Status, headers, cookies, and JSON land here.
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-border px-3 py-2">
        <span className={cn("font-mono text-sm tabular-nums", statusClass(response.status, response.error))}>
          {response.error ? "ERR" : response.status || "—"}
        </span>
        <span className="font-mono text-xs tabular-nums text-muted">{formatDuration(response.timeMs)}</span>
        <span className="font-mono text-xs tabular-nums text-muted">{formatBytes(response.size)}</span>
        <span className="text-xs text-subtle">{response.statusText}</span>
        {response.fromProxy || response.transport === "proxy" ? <Badge tone="muted">proxy</Badge> : null}
        {response.truncated ? (
          <Badge tone="warn">
            Showing {formatBytes(response.body.length)} of {formatBytes(response.truncatedOf ?? response.size)}
          </Badge>
        ) : null}
        <div className="ml-auto flex flex-wrap gap-1">
          {jwt ? (
            <Button size="sm" variant="ghost" onClick={() => useScratchpad.getState().setUtility("jwt")}>
              Inspect JWT
            </Button>
          ) : null}
          {epoch ? (
            <Button size="sm" variant="ghost" onClick={() => useScratchpad.getState().setUtility("epoch")}>
              Epoch converter
            </Button>
          ) : null}
          {isJson ? (
            <Button size="sm" variant="ghost" onClick={() => useScratchpad.getState().setUtility("json-format")}>
              Open in JSON
            </Button>
          ) : null}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              const history = useScratchpad.getState().history;
              if (history[0]) useScratchpad.getState().setCompare(0, history[0].id);
              if (history[1]) useScratchpad.getState().setCompare(1, history[1].id);
              useScratchpad.getState().setRightTab("meta");
            }}
          >
            Compare
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={async () => {
              const ok = await copyText(isJson ? pretty : response.body);
              toast[ok ? "success" : "error"](ok ? "Copied response" : "Copy failed");
            }}
          >
            Copy
          </Button>
        </div>
      </div>
      {response.error ? (
        <p className="border-b border-border px-3 py-2 text-xs text-danger">
          {response.errorKind ? `${labelKind(response.errorKind)} · ` : ""}
          {response.error}
        </p>
      ) : null}
      <Tabs value={tab} onValueChange={(v) => setTab(v as ResponseViewTab)} className="flex min-h-0 flex-1 flex-col">
        <div className="border-b border-border px-2 py-1">
          <TabsList>
            <TabsTrigger value="pretty">Pretty</TabsTrigger>
            <TabsTrigger value="raw">Raw</TabsTrigger>
            {isJson ? <TabsTrigger value="tree">Tree</TabsTrigger> : null}
            {isHtml ? <TabsTrigger value="html">HTML</TabsTrigger> : null}
            <TabsTrigger value="headers">Headers</TabsTrigger>
            <TabsTrigger value="cookies">Cookies</TabsTrigger>
          </TabsList>
        </div>
        <div className="min-h-0 flex-1 overflow-auto">
          <TabsContent value="pretty" className="h-full">
            {isJson ? (
              <div className="px-3 py-2">
                <CodeBlock
                  lang="json"
                  code={pretty.length > 120_000 ? pretty.slice(0, 120_000) + "\n… truncated for display" : pretty || "Empty body"}
                />
              </div>
            ) : (
              <pre className="whitespace-pre-wrap break-all px-3 py-2 font-mono text-xs leading-relaxed text-foreground">
                {pretty.length > 120_000 ? pretty.slice(0, 120_000) + "\n… truncated for display" : pretty || "Empty body"}
              </pre>
            )}
          </TabsContent>
          <TabsContent value="raw">
            <pre className="whitespace-pre-wrap break-all px-3 py-2 font-mono text-xs leading-relaxed text-muted">
              {response.body || "Empty body"}
            </pre>
          </TabsContent>
          <TabsContent value="tree">
            <JsonTree
              raw={response.body}
              onExtract={(path, value) => {
                const itemId = useScratchpad.getState().activeItemId;
                if (!itemId) {
                  toast.error("Open an investigation or request first");
                  return;
                }
                const name = path.split(".").pop()?.replace(/[^\w]/g, "") || "value";
                useScratchpad.getState().setExtractedVar(itemId, name, jsonPathToString(value), "investigation");
                toast.success(`{{${name}}} extracted`);
              }}
            />
          </TabsContent>
          <TabsContent value="html">
            <iframe
              title="HTML response"
              sandbox=""
              className="h-[480px] w-full bg-background"
              srcDoc={response.body}
            />
          </TabsContent>
          <TabsContent value="headers">
            <table className="w-full text-left text-xs">
              <tbody>
                {Object.entries(response.headers).map(([k, v]) => (
                  <tr key={k} className="border-b border-border">
                    <td className="w-[38%] px-3 py-1.5 font-mono text-accent">{k}</td>
                    <td className="break-all px-3 py-1.5 font-mono text-foreground">{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TabsContent>
          <TabsContent value="cookies">
            {response.cookies.length === 0 ? (
              <p className="px-3 py-6 text-xs text-muted">No Set-Cookie headers.</p>
            ) : (
              <ul className="divide-y divide-border">
                {response.cookies.map((c) => (
                  <li key={c.name} className="px-3 py-2">
                    <p className="font-mono text-xs text-accent">{c.name}</p>
                    <p className="break-all font-mono text-xs text-muted">{c.value}</p>
                  </li>
                ))}
              </ul>
            )}
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

function prettyBodyLooksJson(body: string) {
  const t = body.trim();
  return (t.startsWith("{") && t.endsWith("}")) || (t.startsWith("[") && t.endsWith("]"));
}

function labelKind(kind: string): string {
  switch (kind) {
    case "timeout":
      return "Timeout";
    case "aborted":
      return "Cancelled";
    case "cors":
      return "CORS / network";
    case "dns":
      return "DNS";
    case "offline":
      return "Offline";
    case "blocked":
      return "Blocked host";
    case "variable":
      return "Variable";
    default:
      return kind;
  }
}
