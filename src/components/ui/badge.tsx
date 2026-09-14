import type { HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-sm px-1.5 py-0.5 font-mono text-2xs font-semibold uppercase tracking-wide tabular-nums",
  {
    variants: {
      tone: {
        get: "bg-method-get/12 text-method-get",
        post: "bg-method-post/12 text-method-post",
        put: "bg-method-put/12 text-method-put",
        patch: "bg-method-patch/12 text-method-patch",
        delete: "bg-method-delete/12 text-method-delete",
        muted: "bg-elevated text-muted",
        success: "bg-success/12 text-success",
        warn: "bg-warn/12 text-warn",
        danger: "bg-danger/12 text-danger",
        info: "bg-info/12 text-info",
      },
    },
    defaultVariants: { tone: "muted" },
  },
);

export function Badge({
  className,
  tone,
  ...props
}: HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}

export function methodTone(method: string) {
  const m = method.toLowerCase();
  if (m === "get") return "get" as const;
  if (m === "post") return "post" as const;
  if (m === "put") return "put" as const;
  if (m === "patch") return "patch" as const;
  if (m === "delete") return "delete" as const;
  return "muted" as const;
}
