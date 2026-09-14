import { useMemo } from "react";
import { highlightToHtml } from "@/lib/scratchpad/highlight";
import { cn } from "@/lib/utils";

export function CodeBlock({
  code,
  lang = "",
  className,
}: {
  code: string;
  lang?: string;
  className?: string;
}) {
  const html = useMemo(() => highlightToHtml(code, lang), [code, lang]);
  return (
    <pre
      className={cn("code-hl overflow-auto font-mono text-xs leading-relaxed", className)}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
