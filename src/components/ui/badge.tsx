import type { HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-sm px-1.5 py-0.5 text-2xs font-semibold uppercase tracking-wide tabular-nums",
  {
    variants: {
      tone: {
        get: "bg-method-get/15 text-method-get",
        post: "bg-method-post/15 text-method-post",
        put: "bg-method-put/15 text-method-put",
        patch: "bg-method-patch/15 text-method-patch",
        delete: "bg-method-delete/15 text-method-delete",
        muted: "bg-elevated text-muted",
        success: "bg-success/15 text-success",
        warn: "bg-warn/15 text-warn",
        danger: "bg-danger/15 text-danger",
        info: "bg-info/15 text-info",
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
