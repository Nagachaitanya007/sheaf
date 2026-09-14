import { Check, Copy, Download, MoreHorizontal, Play, Plus, Square } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { IconTip } from "@/components/ui/icon-tip";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { applyExtractions, blockKey, parseExtractDirectives } from "@/lib/scratchpad/extract";
import { rewriteHttpRaw, toCurl } from "@/lib/scratchpad/http";
import { escapeHtml, inlineToHtml, parseMarkdown, replaceHttpSpan } from "@/lib/scratchpad/markdown";
import { documentHttpBlocks, runDocument, sendParsed, cancelSend } from "@/lib/scratchpad/send";
import { useScratchpad } from "@/lib/scratchpad/store";
import { HTTP_METHODS, type BlockResult, type HeaderRow, type HttpMethod, type HttpResponse, type Item, type ParsedRequest } from "@/lib/scratchpad/types";
import { cn, copyText, downloadText, formatBytes, formatDuration } from "@/lib/utils";
import { CodeBlock } from "./CodeBlock";
import { ResponseView } from "./ResponseView";

export function MarkdownDoc({
  source,
  item,
  className,
  onInsertHttp,
}: {
  source: string;
  item?: Item;
  className?: string;
  onInsertHttp?: () => void;
}) {
  const blocks = useMemo(() => parseMarkdown(source || ""), [source]);
  const selectItem = useScratchpad((s) => s.selectItem);
  const items = useScratchpad((s) => s.items);
  const updateRequest = useScratchpad((s) => s.updateRequest);

  if (!blocks.length) {
    return (
      <div className="px-8 py-12">
        <p className="font-serif text-xl font-semibold tracking-tight">Write what you're trying to understand.</p>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-muted">
          Markdown, executable HTTP, and observations live in the same document. Press{" "}
          <code className="md-code">/</code> to insert a block, or add a request below.
        </p>
        {onInsertHttp ? (
          <Button size="sm" variant="send" className="mt-4" onClick={onInsertHttp}>
            Insert HTTP request
          </Button>
        ) : null}
      </div>
    );
  }

  let httpIndex = 0;
  return (
    <article
      className={cn("md-doc px-4 py-5 text-foreground sm:px-8 sm:py-6", className)}
      onClick={(e) => {
        const target = (e.target as HTMLElement).closest("[data-wiki]") as HTMLElement | null;
        if (!target) return;
        const name = target.getAttribute("data-wiki");
        if (!name) return;
        const hit = items.find((i) => i.name.toLowerCase() === name.toLowerCase());
        if (hit) selectItem(hit.id);
        else toast.error(`No item named “${name}”`);
      }}
    >
      {blocks.map((block, i) => {
        if (block.type === "heading") {
          const Tag = (`h${Math.min(block.level, 4)}` as unknown) as "h1";
          const sizes = [
            "text-xl font-semibold tracking-tight sm:text-2xl",
            "text-lg font-semibold",
            "text-base font-medium",
            "text-sm font-medium",
          ];
          return (
            <Tag
              key={i}
              className={cn("mb-2 mt-5 text-balance first:mt-0", sizes[block.level - 1] ?? sizes[3])}
              dangerouslySetInnerHTML={{ __html: inlineToHtml(block.text) }}
            />
          );
        }
        if (block.type === "paragraph") {
          return (
            <p
              key={i}
              className="mb-3 text-pretty"
              dangerouslySetInnerHTML={{ __html: inlineToHtml(block.text) }}
            />
          );
        }
        if (block.type === "quote") {
          return (
            <blockquote
              key={i}
              className="mb-3 border-l-2 border-accent/50 pl-3 text-muted"
              dangerouslySetInnerHTML={{ __html: inlineToHtml(block.text) }}
            />
          );
        }
        if (block.type === "hr") return <hr key={i} className="my-5 border-border" />;
        if (block.type === "list") {
          const List = block.ordered ? "ol" : "ul";
          return (
            <List key={i} className={cn("mb-3 space-y-1 pl-5", block.ordered ? "list-decimal" : "list-disc")}>
              {block.items.map((it, j) => (
                <li key={j} className="text-pretty">
                  {it.checked != null ? (
                    <span className="mr-2 inline-flex size-3.5 items-center justify-center rounded-sm border border-border text-2xs">
                      {it.checked ? "✓" : ""}
                    </span>
                  ) : null}
                  <span dangerouslySetInnerHTML={{ __html: inlineToHtml(it.text) }} />
                </li>
              ))}
            </List>
          );
        }
        if (block.type === "table") {
          return (
            <div key={i} className="mb-4 overflow-auto rounded-lg border border-border">
              <table className="w-full text-left text-xs">
                <thead className="bg-elevated text-foreground">
                  <tr>
                    {block.headers.map((h, j) => (
                      <th key={j} className="px-2.5 py-1.5 font-medium">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {block.rows.map((row, r) => (
                    <tr key={r} className="border-t border-border">
                      {row.map((cell, c) => (
                        <td key={c} className="px-2.5 py-1.5 text-muted" dangerouslySetInnerHTML={{ __html: inlineToHtml(cell) }} />
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }
        if (block.type === "code") {
          return (
            <div key={i} className="mb-4 overflow-auto rounded-lg border border-border bg-inset px-3 py-2">
              <CodeBlock code={block.code} lang={block.lang} />
            </div>
          );
        }
        if (block.type === "http") {
          const index = httpIndex;
          httpIndex += 1;
          const key = blockKey(block.request, index);
          const result = item?.blockResults?.find((b) => b.blockKey === key);
          return (
            <HttpCard
              key={`http-${index}`}
              item={item}
              request={block.request}
              raw={block.raw}
              start={block.start}
              end={block.end}
              blockKey={key}
              index={index}
              result={result}
              onRewrite={(nextRaw) => {
                if (!item) return;
                updateRequest(item.id, { content: replaceHttpSpan(item.content ?? "", block.start, block.end, nextRaw) });
              }}
            />
          );
        }
        return <pre key={i}>{escapeHtml(JSON.stringify(block))}</pre>;
      })}
    </article>
  );
}

function HttpCard({
  item,
  request,
  raw,
  start,
  end,
  blockKey: key,
  index,
  result,
  onRewrite,
}: {
  item?: Item;
  request: ParsedRequest;
  raw: string;
  start: number;
  end: number;
  blockKey: string;
  index: number;
  result?: BlockResult;
  onRewrite: (nextRaw: string) => void;
}) {
  void start;
  void end;
  const sending = useScratchpad((s) => s.sendState === "sending");
  const addItem = useScratchpad((s) => s.addItem);
  const updateRequest = useScratchpad((s) => s.updateRequest);
  const setExtractedVar = useScratchpad((s) => s.setExtractedVar);
  const setUtility = useScratchpad((s) => s.setUtility);
  const focusHttpIndex = useScratchpad((s) => s.focusHttpIndex);
  const [open, setOpen] = useState(true);
  const [details, setDetails] = useState(false);
  const [path, setPath] = useState("$.accessToken");
  const [showSource, setShowSource] = useState(false);
  const urlRef = useRef<HTMLInputElement>(null);
  const urlFocused = useRef(false);
  const [urlDraft, setUrlDraft] = useState(request.url);
  const extracts = parseExtractDirectives(raw, key);
  const parsedRequest = { ...request, extracts, name: request.name ?? key };
  const liveHeaders = request.headers;

  useEffect(() => {
    if (!urlFocused.current) setUrlDraft(request.url);
  }, [request.url]);

  useEffect(() => {
    if (focusHttpIndex !== index) return;
    urlRef.current?.focus();
    urlRef.current?.select();
    setDetails(true);
    useScratchpad.getState().setFocusHttpIndex(null);
  }, [focusHttpIndex, index]);

  function patch(next: Partial<{ method: HttpMethod; url: string; headers: HeaderRow[]; body: string }>) {
    onRewrite(rewriteHttpRaw(raw, next));
  }

  return (
    <div className="http-block">
      <div className="flex flex-col gap-2 px-3 py-2 sm:flex-row sm:items-center">
        <Select
          value={request.method}
          onValueChange={(value) => patch({ method: value as HttpMethod })}
        >
          <SelectTrigger className="h-8 w-[108px] font-mono text-xs font-semibold" aria-label="Request method">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {HTTP_METHODS.map((m) => (
              <SelectItem key={m} value={m}>
                {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          ref={urlRef}
          value={urlDraft}
          onFocus={() => {
            urlFocused.current = true;
          }}
          onBlur={() => {
            urlFocused.current = false;
            if (urlDraft !== request.url) patch({ url: urlDraft });
          }}
          onChange={(e) => {
            setUrlDraft(e.target.value);
            patch({ url: e.target.value });
          }}
          placeholder="https://api.example.com or {{baseUrl}}/path"
          className="h-8 min-w-0 flex-1 font-mono text-xs"
          aria-label="Request URL"
        />
        {result ? (
          <Badge tone={result.response.error ? "danger" : result.response.status >= 400 ? "warn" : "success"}>
            {result.response.error ? result.response.errorKind ?? "ERR" : result.response.status}
          </Badge>
        ) : null}
        {sending ? (
          <Button size="sm" variant="ghost" onClick={() => cancelSend()}>
            <Square className="size-3" />
            Cancel
          </Button>
        ) : (
          <IconTip label="Run request">
            <Button
              size="sm"
              variant="send"
              aria-label="Run request"
              onClick={() => void sendParsed(parsedRequest, { sourceItem: item, attachToId: item?.id, blockKey: key })}
            >
              <Play className="size-3" />
              Run
            </Button>
          </IconTip>
        )}
        <DropdownMenu>
          <IconTip label="More actions">
            <DropdownMenuTrigger asChild>
              <Button size="icon-sm" variant="ghost" aria-label="More actions">
                <MoreHorizontal className="size-3.5" />
              </Button>
            </DropdownMenuTrigger>
          </IconTip>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => setDetails((v) => !v)}>
              {details ? "Hide headers & body" : "Edit headers & body"}
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setShowSource((v) => !v)}>
              {showSource ? "Hide source" : "Show source"}
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => {
                if (item) void runDocument(item, index);
              }}
            >
              Run from here
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={async () => {
                const ok = await copyText(toCurl({ method: request.method, url: request.url, headers: request.headers, body: request.body }));
                toast[ok ? "success" : "error"](ok ? "Copied curl" : "Copy failed");
              }}
            >
              <Copy className="size-3.5" /> Copy curl
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => {
                const id = addItem("request", item?.parentId ?? null, item?.collectionId);
                if (!id) return;
                updateRequest(id, {
                  method: request.method,
                  url: request.url,
                  headers: request.headers,
                  body: request.body,
                  bodyType: request.bodyType,
                });
                toast.success("Saved as request");
              }}
            >
              <Plus className="size-3.5" /> Save as request
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {details ? (
        <div className="space-y-2 border-t border-border px-3 py-2">
          {liveHeaders.map((h, hi) => (
            <div key={hi} className="grid grid-cols-[1fr_1fr_28px] gap-1.5">
              <Input
                value={h.key}
                placeholder="Header"
                className="h-7 font-mono text-2xs"
                aria-label="Header name"
                onChange={(e) => {
                  const headers = request.headers.map((row, idx) => (idx === hi ? { ...row, key: e.target.value } : row));
                  patch({ headers });
                }}
              />
              <Input
                value={h.value}
                placeholder="Value"
                className="h-7 font-mono text-2xs"
                aria-label="Header value"
                onChange={(e) => {
                  const headers = request.headers.map((row, idx) => (idx === hi ? { ...row, value: e.target.value } : row));
                  patch({ headers });
                }}
              />
              <IconTip label="Remove header">
                <Button
                  size="icon-sm"
                  variant="ghost"
                  aria-label="Remove header"
                  onClick={() => patch({ headers: request.headers.filter((_, idx) => idx !== hi) })}
                >
                  ×
                </Button>
              </IconTip>
            </div>
          ))}
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() =>
                patch({
                  headers: [...request.headers, { id: `h${request.headers.length}`, key: "", value: "", enabled: true }],
                })
              }
            >
              Add header
            </Button>
          </div>
          <Textarea
            value={request.body}
            onChange={(e) => patch({ body: e.target.value })}
            placeholder="Request body (JSON, text…)"
            className="min-h-20 font-mono text-xs"
            aria-label="Request body"
          />
        </div>
      ) : null}
      {showSource ? (
        <div className="overflow-auto border-t border-border px-3 py-2">
          <CodeBlock code={raw} lang="http" />
        </div>
      ) : !details ? (
        <div className="overflow-auto border-t border-border px-3 py-2">
          <CodeBlock code={raw} lang="http" copyable={false} />
        </div>
      ) : null}
      {result ? (
        <div className="border-t border-border">
          <button
            type="button"
            className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-2xs text-muted hover:text-foreground"
            onClick={() => setOpen((v) => !v)}
          >
            <span>
              {result.response.error
                ? result.response.error
                : `${result.response.status} ${result.response.statusText} · ${formatDuration(result.response.timeMs)} · ${formatBytes(result.response.size)}`}
            </span>
            {result.response.transport === "proxy" ? <Badge tone="muted">proxy</Badge> : null}
            {result.response.truncated ? <Badge tone="warn">truncated</Badge> : null}
            <span className="ml-auto">{open ? "Hide" : "Show"}</span>
          </button>
          {open ? (
            <div className="max-h-[420px] overflow-auto border-t border-border">
              <ResponseView response={result.response} compact />
              {item ? (
                <ExtractBar
                  item={item}
                  blockKey={key}
                  response={result.response}
                  path={path}
                  setPath={setPath}
                  onExtract={(p) => {
                    const applied = applyExtractions(result.response, [{ as: "token", path: p, scope: "investigation", blockKey: key }]);
                    const name = p.split(".").pop()?.replace(/[^\w]/g, "") || "value";
                    const value = applied[0]?.value;
                    if (value == null) {
                      const retry = applyExtractions(result.response, [{ as: name, path: p, scope: "investigation", blockKey: key }]);
                      if (!retry[0]) {
                        toast.error("Nothing at that path");
                        return;
                      }
                      setExtractedVar(item.id, name, retry[0].value, "investigation");
                      toast.success(`{{${name}}} ← ${retry[0].value.slice(0, 48)}`);
                      return;
                    }
                    setExtractedVar(item.id, name === "token" && p.includes("accessToken") ? "token" : name, value, "investigation");
                    toast.success(`Extracted ${name}`);
                  }}
                  onUtility={() => setUtility("json-format", result.response.body)}
                />
              ) : null}
              {result.extracted && Object.keys(result.extracted).length ? (
                <p className="px-3 py-2 text-2xs text-success">
                  Extracted {Object.entries(result.extracted).map(([k, v]) => `${k}=${v.slice(0, 24)}`).join(" · ")}
                </p>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function ExtractBar({
  item,
  response,
  path,
  setPath,
  onExtract,
  onUtility,
}: {
  item: Item;
  blockKey: string;
  response: HttpResponse;
  path: string;
  setPath: (v: string) => void;
  onExtract: (path: string) => void;
  onUtility: () => void;
}) {
  void item;
  return (
    <div className="flex flex-wrap items-center gap-2 border-t border-border px-3 py-2">
      <span className="text-2xs text-subtle">Extract</span>
      <Input value={path} onChange={(e) => setPath(e.target.value)} className="h-7 w-44 font-mono text-2xs" />
      <Button size="sm" variant="secondary" onClick={() => onExtract(path)}>
        <Check className="size-3" />
        As variable
      </Button>
      <Button size="sm" variant="ghost" onClick={onUtility}>
        Open in JSON
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={async () => {
          const ok = await copyText(response.body);
          toast[ok ? "success" : "error"](ok ? "Copied response" : "Copy failed");
        }}
      >
        Copy
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => {
          downloadText("response.json", response.body, "application/json");
        }}
      >
        <Download className="size-3" />
        Download
      </Button>
    </div>
  );
}

export function InvestigationToolbar({ item }: { item: Item }) {
  const sending = useScratchpad((s) => s.sendState === "sending");
  const blocks = documentHttpBlocks(item.content ?? "");
  return (
    <div className="flex items-center gap-2">
      {sending ? (
        <Button size="sm" variant="ghost" onClick={() => cancelSend()}>
          <Square className="size-3" />
          Stop
        </Button>
      ) : (
        <Button size="sm" variant="send" onClick={() => void runDocument(item)} disabled={!blocks.length}>
          <Play className="size-3" />
          Run sequence
        </Button>
      )}
      <span className="text-2xs text-subtle">{blocks.length} HTTP blocks</span>
    </div>
  );
}
