import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SignedIn, SignedOut, UserButton } from "@/lib/auth/gates";
import { GROK_PROVIDERS, authEnabled, signIn } from "@/lib/auth/client";
import { useCurrentUser, useCurrentUserState } from "@/lib/auth/use-current-user";
import { toPortable } from "@/lib/scratchpad/import-export";
import { isPortable, useScratchpad } from "@/lib/scratchpad/store";
import { stripSecrets } from "@/lib/scratchpad/secrets";
import { formatSyncTime, readSyncPrefs, writeSyncPrefs, type SyncPrefs } from "@/lib/scratchpad/sync-prefs";
import { pullCloudWorkspace, pushCloudWorkspace } from "@/lib/scratchpad/sync.fn";

export function SyncDialog() {
  const open = useScratchpad((s) => s.syncOpen);
  const setOpen = useScratchpad((s) => s.setSyncOpen);
  const user = useCurrentUser();
  const { isPending } = useCurrentUserState();
  const syncIntent = useScratchpad((s) => s.syncIntent);
  const [prefs, setPrefs] = useState<SyncPrefs>(() => readSyncPrefs());
  const [busy, setBusy] = useState(false);
  const [conflict, setConflict] = useState<{ local: string; cloud: string; cloudRevision: number } | null>(null);

  useEffect(() => {
    if (open) setPrefs(readSyncPrefs());
  }, [open]);

  useEffect(() => {
    if (!open || !syncIntent || isPending) return;
    useScratchpad.getState().setSyncIntent(false);
    if (!user) return;
    void syncNow("auto");
    // Intent is a one-shot flag; syncNow reads latest dialog state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, syncIntent, isPending, user]);

  function persist(next: SyncPrefs) {
    setPrefs(next);
    writeSyncPrefs(next);
    useScratchpad.getState().setSyncTick();
  }

  async function syncNow(force: "local" | "cloud" | "auto" = "auto") {
    if (!authEnabled) {
      toast.error("Sign-in is not available in this build");
      return;
    }
    if (!user) {
      toast.error("Sign in to sync");
      return;
    }
    setBusy(true);
    try {
      const snap = useScratchpad.getState().snapshot();
      const local = JSON.stringify(stripSecrets(toPortable(snap)));
      const current = readSyncPrefs();
      if (force === "cloud") {
        const row = await pullCloudWorkspace();
        if (!row) throw new Error("Nothing in the cloud yet");
        applyCloud(row.payload, row.revision);
        persist({ ...current, enabled: true, revision: row.revision, lastSyncedAt: Date.now(), lastError: null });
        toast.success("Kept cloud version");
        setConflict(null);
        return;
      }
      if (force === "local") {
        const row = await pullCloudWorkspace();
        const result = await pushCloudWorkspace({
          data: { payload: local, revision: row?.revision ?? current.revision, force: true },
        });
        if (result.status === "ok") {
          persist({ ...current, enabled: true, revision: result.revision, lastSyncedAt: Date.now(), lastError: null });
          toast.success("Kept local version");
          setConflict(null);
        }
        return;
      }
      const result = await pushCloudWorkspace({ data: { payload: local, revision: current.revision } });
      if (result.status === "conflict") {
        setConflict({ local, cloud: result.server.payload, cloudRevision: result.server.revision });
        persist({ ...current, enabled: true, lastError: "conflict" });
        return;
      }
      persist({ ...current, enabled: true, revision: result.revision, lastSyncedAt: Date.now(), lastError: null });
      toast.success("Synced");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Sync failed";
      persist({ ...readSyncPrefs(), lastError: message });
      if (message === "Unauthorized") toast.error("Sign in to enable sync");
      else toast.error(message);
    } finally {
      setBusy(false);
    }
  }

  function applyCloud(payload: string, revision: number) {
    const parsed = JSON.parse(payload) as unknown;
    if (!isPortable(parsed)) throw new Error("Cloud payload was not a Sheaf workspace");
    useScratchpad.getState().importPortable(parsed);
    writeSyncPrefs({ ...readSyncPrefs(), enabled: true, revision, lastSyncedAt: Date.now(), lastError: null });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogTitle>Sync</DialogTitle>
        <DialogDescription>
          Your workspace is stored locally by default. Enable sync only if you want access across devices. API tokens and secret variables stay on this device.
        </DialogDescription>
        <div className="mt-4 space-y-3">
          <p className="font-mono text-xs text-muted">{prefs.enabled ? formatSyncTime(prefs.lastSyncedAt) : "Local only"}</p>
          {prefs.lastError && prefs.lastError !== "conflict" ? <p className="text-xs text-danger">{prefs.lastError}</p> : null}
          <SignedOut>
            {authEnabled ? (
              <div className="space-y-2">
                {GROK_PROVIDERS.filter((p) => p.idp === "google").map((p) => (
                  <Button key={p.providerId} variant="send" className="w-full" onClick={() => signIn(p.providerId, { callbackURL: "/" })}>
                    Continue with {p.label}
                  </Button>
                ))}
                <p className="text-2xs text-subtle">No account is required to use Sheaf.</p>
              </div>
            ) : (
              <p className="text-sm text-muted">Cloud sync is not configured in this preview.</p>
            )}
          </SignedOut>
          <SignedIn>
            <UserButton />
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="send" disabled={busy} onClick={() => void syncNow("auto")}>
                {busy ? "Syncing…" : "Sync now"}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => persist({ ...prefs, enabled: !prefs.enabled })}
              >
                {prefs.enabled ? "Disable sync" : "Enable sync"}
              </Button>
            </div>
          </SignedIn>
          {conflict ? (
            <div className="rounded-md border border-border p-3">
              <p className="text-sm font-medium">Cloud has a newer copy</p>
              <p className="mt-1 text-xs text-muted">Choose which version to keep. This will not merge automatically.</p>
              <div className="mt-2 flex gap-2">
                <Button size="sm" variant="secondary" onClick={() => void syncNow("local")}>
                  Keep local
                </Button>
                <Button size="sm" variant="ghost" onClick={() => void syncNow("cloud")}>
                  Keep cloud
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
