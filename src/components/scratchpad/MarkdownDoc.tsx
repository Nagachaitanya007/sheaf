import { Play } from "lucide-react";
import { Badge, methodTone } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { escapeHtml, inlineToHtml, parseMarkdown } from "@/lib/scratchpad/markdown";
import { sendParsed } from "@/lib/scratchpad/send";
import { useScratchpad } from "@/lib/scratchpad/store";
import type { ParsedRequest } from "@/lib/scratchpad/types";
import { cn } from "@/lib/utils";

function HttpCard({ request, raw }: { request: ParsedRequest; raw: string }) {
  const sending = useScratchpad((s) => s.sendState === "sending");
  return (
    <div className="my-3 overflow-hidden rounded-lg border border-border bg-inset">
      <div className="flex items-center gap-2 border-b border-border px-3 py-2">
        <Badge tone={methodTone(request.method)}>{request.method}</Badge>
        <code className="min-w-0 flex-1 truncate font-mono text-xs text-foreground">{request.url}</code>
        <Button size="sm" variant="send" disabled={sending} onClick={() => void sendParsed(request)}>
          <Play className="size-3" />
          Run
        </Button>
      </div>
      <pre className="overflow-auto px-3 py-2 font-mono text-xs leading-relaxed text-muted">{raw}</pre>
    </div>
  );
}

export function MarkdownDoc({ source, className }: { source: string; className?: string }) {
  const blocks = parseMarkdown(source || "");
  if (!blocks.length) {
    return <p className="px-6 py-10 text-sm text-muted">Empty note. Switch to Edit to write Markdown.</p>;
  }
  return (
    <article className={cn("px-4 py-4 text-sm leading-relaxed text-foreground sm:px-6 sm:py-5", className)}>
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
              className="mb-3 text-pretty text-muted"
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
            <List key={i} className={cn("mb-3 space-y-1 pl-5 text-muted", block.ordered ? "list-decimal" : "list-disc")}>
              {block.items.map((item, j) => (
                <li key={j} className="text-pretty">
                  {item.checked != null ? (
                    <span className="mr-2 inline-flex size-3.5 items-center justify-center rounded-sm border border-border text-2xs">
                      {item.checked ? "✓" : ""}
                    </span>
                  ) : null}
                  <span dangerouslySetInnerHTML={{ __html: inlineToHtml(item.text) }} />
                </li>
              ))}
            </List>
          );
        }
        if (block.type === "table") {
          return (
            <div key={i} className="mb-4 overflow-auto rounded-md border border-border">
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
            <pre key={i} className="mb-4 overflow-auto rounded-md border border-border bg-inset px-3 py-2 font-mono text-xs leading-relaxed text-foreground">
              {block.code}
            </pre>
          );
        }
        if (block.type === "http") {
          return <HttpCard key={i} request={block.request} raw={block.raw} />;
        }
        return <pre key={i}>{escapeHtml(JSON.stringify(block))}</pre>;
      })}
    </article>
  );
}
