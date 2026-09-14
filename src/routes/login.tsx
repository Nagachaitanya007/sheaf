import { createFileRoute, Link } from "@tanstack/react-router";
import { GROK_PROVIDERS, authEnabled, signIn } from "@/lib/auth/client";
import { BrandMark } from "@/components/scratchpad/BrandMark";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/login")({ component: Login });

function Login() {
  return (
    <main className="grid min-h-dvh place-items-center bg-background p-6 text-foreground">
      <div className="w-full max-w-sm space-y-4 rounded-lg border border-border bg-surface p-5">
        <div className="flex items-center gap-2 text-accent">
          <BrandMark className="size-4" />
          <span className="text-sm font-semibold text-foreground">Sheaf</span>
        </div>
        <h1 className="font-serif text-xl font-semibold tracking-tight">Enable sync</h1>
        <p className="text-sm leading-relaxed text-muted">
          Your workspace stays on this device by default. Sign in only if you want the same investigations on another device. Secrets stay local.
        </p>
        {authEnabled ? (
          GROK_PROVIDERS.filter((p) => p.idp === "google" || p.idp === "twitter").map((p) => (
            <Button
              key={p.providerId}
              variant={p.idp === "google" ? "send" : "secondary"}
              className="w-full"
              onClick={() => signIn(p.providerId, { callbackURL: "/" })}
            >
              Continue with {p.label}
            </Button>
          ))
        ) : (
          <p className="text-sm text-muted">Sign-in is disabled in this build.</p>
        )}
        <Link to="/" className="block text-center text-xs text-muted hover:text-foreground">
          Continue locally without an account
        </Link>
      </div>
    </main>
  );
}
