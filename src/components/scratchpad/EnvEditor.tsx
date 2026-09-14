import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useScratchpad } from "@/lib/scratchpad/store";

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
  const env = environments.find((e) => e.id === activeEnvironmentId) ?? environments[0];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-h-[80vh] overflow-auto">
        <DialogTitle>Environments</DialogTitle>
        <DialogDescription>
          Variables such as {"{{baseUrl}}"} and {"{{token}}"} resolve from the active environment. Secret values stay in this browser.
        </DialogDescription>
        <div className="mt-3 flex flex-wrap gap-1">
          {environments.map((e) => (
            <Button
              key={e.id}
              size="sm"
              variant={e.id === env?.id ? "secondary" : "ghost"}
              onClick={() => setEnvironment(e.id)}
            >
              {e.name}
            </Button>
          ))}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              const name = window.prompt("Environment name", "New env");
              if (name) addEnvironment(name);
            }}
          >
            Add
          </Button>
        </div>
        {env ? (
          <div className="mt-4 flex flex-col gap-2">
            <Input
              value={env.name}
              onChange={(e) => renameEnvironment(env.id, e.target.value)}
              className="max-w-xs"
            />
            {env.variables.map((v) => (
              <div key={v.id} className="grid grid-cols-[1fr_1fr_28px] gap-1.5">
                <Input
                  value={v.key}
                  placeholder="key"
                  className="font-mono"
                  onChange={(e) => updateEnvVar(env.id, { ...v, key: e.target.value })}
                />
                <Input
                  value={v.value}
                  placeholder="value"
                  type={v.secret ? "password" : "text"}
                  className="font-mono"
                  onChange={(e) => updateEnvVar(env.id, { ...v, value: e.target.value })}
                />
                <Button size="icon-sm" variant="ghost" onClick={() => removeEnvVar(env.id, v.id)}>
                  ×
                </Button>
              </div>
            ))}
            <Button size="sm" variant="ghost" onClick={() => addEnvVar(env.id)}>
              Add variable
            </Button>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
