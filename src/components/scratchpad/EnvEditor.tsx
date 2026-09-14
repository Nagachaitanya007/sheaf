import { useEffect, useState } from "react";
import type { Environment } from "@/lib/scratchpad/types";
import { Eye, EyeOff, Lock, LockOpen, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IconTip } from "@/components/ui/icon-tip";
import { nameError, normalizeName, secretInputType } from "@/lib/scratchpad/names";
import { useScratchpad } from "@/lib/scratchpad/store";
import { NameDialog } from "./NameDialog";
import { cn } from "@/lib/utils";

export function EnvEditor() {
  const open = useScratchpad((s) => s.envEditorOpen);
  const setOpen = useScratchpad((s) => s.setEnvEditorOpen);
  const environments = useScratchpad((s) => s.environments);
  const activeEnvironmentId = useScratchpad((s) => s.activeEnvironmentId);
  const setEnvironment = useScratchpad((s) => s.setEnvironment);
  const updateEnvVar = useScratchpad((s) => s.updateEnvVar);
  const addEnvVar = useScratchpad((s) => s.addEnvVar);
  const removeEnvVar = useScratchpad((s) => s.removeEnvVar);
  const addEnvironment = useScratchpad((s) => s.addEnvironment);
  const renameEnvironment = useScratchpad((s) => s.renameEnvironment);
  const deleteEnvironment = useScratchpad((s) => s.deleteEnvironment);
  const env = environments.find((e) => e.id === activeEnvironmentId) ?? environments[0];
  const [creating, setCreating] = useState(false);
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [envName, setEnvName] = useState(env?.name ?? "");
  const [envNameError, setEnvNameError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Environment | null>(null);

  useEffect(() => {
    setEnvName(env?.name ?? "");
    setEnvNameError(null);
    setRevealed({});
  }, [env?.id, env?.name]);

  function commitEnvName() {
    if (!env) return;
    const others = environments.filter((e) => e.id !== env.id).map((e) => e.name);
    const err = nameError(envName, others);
    if (err) {
      setEnvNameError(err);
      setEnvName(env.name);
      return;
    }
    renameEnvironment(env.id, normalizeName(envName));
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-h-[82vh] max-w-2xl overflow-auto p-4 sm:p-5">
        <DialogTitle>Environments</DialogTitle>
        <DialogDescription>
          Variables such as {"{{baseUrl}}"} and {"{{token}}"} resolve from the active environment. Secret values stay in this browser.
        </DialogDescription>
        <div className="mt-3 flex items-center gap-1.5 overflow-x-auto rounded-lg border border-border bg-inset p-1">
          {environments.map((environment) => (
            <div
              key={environment.id}
              className={cn(
                "group flex min-w-0 shrink-0 items-center rounded-md border",
                environment.id === env?.id ? "border-accent/40 bg-background" : "border-transparent",
              )}
            >
              <Button
                size="sm"
                variant="ghost"
                className="max-w-40 justify-start px-2.5"
                onClick={() => setEnvironment(environment.id)}
              >
                <span className="truncate" title={environment.name}>{environment.name}</span>
              </Button>
              {environments.length > 1 ? (
                <IconTip label="Delete environment">
                  <Button
                    type="button"
                    size="icon-sm"
                    variant="ghost"
                    className="mr-0.5 shrink-0 text-subtle hover:text-danger"
                    aria-label={"Delete " + environment.name}
                    onClick={() => setDeleteTarget(environment)}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </IconTip>
              ) : null}
            </div>
          ))}
          <Button size="sm" variant="ghost" className="shrink-0 px-2.5" onClick={() => setCreating(true)}>
            + Add
          </Button>
        </div>
        {env ? (
          <div className="mt-4 flex flex-col gap-3">
            <div>
              <label className="mb-1 block text-2xs font-medium uppercase tracking-[0.14em] text-subtle" htmlFor="env-name">
                Environment
              </label>
              <Input
                id="env-name"
                value={envName}
                onChange={(e) => {
                  setEnvName(e.target.value);
                  setEnvNameError(null);
                }}
                onBlur={commitEnvName}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    (e.target as HTMLInputElement).blur();
                  }
                }}
                className="max-w-xs"
                aria-invalid={Boolean(envNameError)}
              />
              {envNameError ? <p className="mt-1 text-xs text-danger">{envNameError}</p> : null}
            </div>
            <div>
              <p className="mb-2 text-2xs font-medium uppercase tracking-[0.14em] text-subtle">Variables</p>
              <div className="mb-1 hidden grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)_auto] gap-1.5 text-2xs text-subtle sm:grid">
                <span>Key</span>
                <span>Value</span>
                <span className="sr-only">Actions</span>
              </div>
              {env.variables.map((v) => {
                const shown = Boolean(revealed[v.id]);
                return (
                  <div key={v.id} className="mb-1.5 grid grid-cols-1 gap-1.5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)_auto]">
                    <Input
                      value={v.key}
                      placeholder="key"
                      className="font-mono"
                      aria-label="Variable key"
                      onChange={(e) => updateEnvVar(env.id, { ...v, key: e.target.value })}
                    />
                    <div className="flex min-w-0 items-center gap-1">
                      <Input
                        value={v.value}
                        placeholder="value"
                        type={secretInputType(Boolean(v.secret), shown)}
                        className="min-w-0 flex-1 font-mono"
                        aria-label={v.secret ? "Secret value" : "Variable value"}
                        onChange={(e) => updateEnvVar(env.id, { ...v, value: e.target.value })}
                      />
                      {v.secret ? (
                        <IconTip label={shown ? "Hide secret" : "Show secret"}>
                          <Button
                            type="button"
                            size="icon-sm"
                            variant="ghost"
                            aria-label={shown ? "Hide secret" : "Show secret"}
                            aria-pressed={shown}
                            onClick={() => setRevealed((prev) => ({ ...prev, [v.id]: !prev[v.id] }))}
                          >
                            {shown ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                          </Button>
                        </IconTip>
                      ) : null}
                    </div>
                    <div className="flex items-center gap-0.5">
                      <IconTip label={v.secret ? "Marked secret" : "Mark as secret"}>
                        <Button
                          type="button"
                          size="icon-sm"
                          variant="ghost"
                          aria-label={v.secret ? "Marked secret" : "Mark as secret"}
                          aria-pressed={Boolean(v.secret)}
                          onClick={() => {
                            updateEnvVar(env.id, { ...v, secret: !v.secret });
                            if (v.secret) setRevealed((prev) => ({ ...prev, [v.id]: false }));
                          }}
                        >
                          {v.secret ? <Lock className="size-3.5" /> : <LockOpen className="size-3.5" />}
                        </Button>
                      </IconTip>
                      <IconTip label="Delete variable">
                        <Button
                          type="button"
                          size="icon-sm"
                          variant="ghost"
                          aria-label="Delete variable"
                          onClick={() => removeEnvVar(env.id, v.id)}
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </IconTip>
                    </div>
                  </div>
                );
              })}
              <Button size="sm" variant="ghost" onClick={() => addEnvVar(env.id)}>
                Add variable
              </Button>
            </div>
          </div>
        ) : null}
      </DialogContent>
      </Dialog>
      <Dialog open={Boolean(deleteTarget)} onOpenChange={(next) => !next && setDeleteTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogTitle>Delete environment?</DialogTitle>
          <DialogDescription>
            This removes {deleteTarget?.name ? <strong>{deleteTarget.name}</strong> : "this environment"} and all of its variables from this browser. This cannot be undone.
          </DialogDescription>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button
              variant="danger"
              onClick={() => {
                if (!deleteTarget) return;
                deleteEnvironment(deleteTarget.id);
                setDeleteTarget(null);
              }}
            >
              Delete environment
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <NameDialog
        open={creating}
        title="Add environment"
        description="The new environment becomes active immediately."
        initial=""
        submitLabel="Create environment"
        existing={environments.map((e) => e.name)}
        onOpenChange={setCreating}
        onSubmit={(name) => addEnvironment(name)}
      />
    </>
  );
}