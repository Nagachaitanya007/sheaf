import { useMemo, useState } from "react";
import { Copy, Check } from "lucide-react";
import { highlightToHtml } from "@/lib/scratchpad/highlight";
import { copyText, cn } from "@/lib/utils";
import { IconTip } from "@/components/ui/icon-tip";
import { Button } from "@/components/ui/button";

export function CodeBlock({
  code,
  lang = "",
  className,
  copyable = true,
}: {
  code: string;
  lang?: string;
  className?: string;
  copyable?: boolean;
}) {
  const html = useMemo(() => highlightToHtml(code, lang), [code, lang]);
  const [copied, setCopied] = useState(false);
  return (
    <div className="group relative">
      {copyable ? (
        <div className="absolute right-1 top-1 z-10 opacity-0 group-hover:opacity-100 focus-within:opacity-100">
          <IconTip label="Copy">
            <Button
              size="icon-sm"
              variant="ghost"
              aria-label="Copy"
              onClick={async () => {
                const ok = await copyText(code);
                if (ok) {
                  setCopied(true);
                  window.setTimeout(() => setCopied(false), 1200);
                }
              }}
            >
              {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
            </Button>
          </IconTip>
        </div>
      ) : null}
      <pre
        className={cn("code-hl overflow-auto font-mono text-xs leading-relaxed", className)}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
