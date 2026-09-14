import { useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { exportHttpBundle, exportSubset, toPortable } from "@/lib/scratchpad/import-export";
import { importAny } from "@/lib/scratchpad/importers";
import { countSecrets, stripSecrets } from "@/lib/scratchpad/secrets";
import { isPortable, useScratchpad } from "@/lib/scratchpad/store";
import { serializeHttp, toCurl } from "@/lib/scratchpad/http";
import { copyText, downloadText } from "@/lib/utils";

export function ImportExportDialog() {
  const open = useScratchpad((s) => s.importExportOpen);
  const setOpen = useScratchpad((s) => s.setImportExportOpen);
  const items = useScratchpad((s) => s.items);
  const activeItemId = useScratchpad((s) => s.activeItemId);
  const item = items.find((i) => i.id === activeItemId);
  const [warn, setWarn] = useState("");

  function workspace(strip: boolean) {
    const snap = useScratchpad.getState().snapshot();
    let portable = toPortable(snap);
    const secrets = countSecrets(portable);
    if (strip) portable = stripSecrets(portable);
    else if (secrets) setWarn(`This export includes ${secrets} secret field(s). Prefer exporting without secrets.`);
    downloadText("sheaf-workspace.json", JSON.stringify(portable, null, 2), "application/json");
    toast.success(strip ? "Workspace exported without secrets" : "Workspace exported");
  }

  function importFile() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json,.http,.rest,.bru,application/json,text/plain";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const result = importAny(text, file.name);
        if (result.portable) {
          if (!isPortable(result.portable)) throw new Error("Not a Sheaf workspace");
          useScratchpad.getState().importPortable(result.portable);
          toast.success(`Imported ${result.name}`);
        }
        setOpen(false);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Import failed");
      }
    };
    input.click();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogTitle>Import / export</DialogTitle>
        <DialogDescription>
          Take your work with you. Secrets are optional on export and never required for local use.
        </DialogDescription>
        {warn ? <p className="mt-2 text-xs text-warn">{warn}</p> : null}
        <div className="mt-4 grid gap-2">
          <p className="text-2xs font-medium uppercase tracking-[0.14em] text-subtle">Workspace</p>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="secondary" onClick={() => workspace(true)}>
              Export JSON (no secrets)
            </Button>
            <Button size="sm" variant="ghost" onClick={() => workspace(false)}>
              Export JSON (include secrets)
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                downloadText("sheaf.http", exportHttpBundle(useScratchpad.getState().snapshot()), "text/plain");
                toast.success("HTTP bundle exported");
              }}
            >
              Export .http
            </Button>
            <Button size="sm" variant="send" onClick={importFile}>
              Import file
            </Button>
          </div>
          <p className="text-2xs font-medium uppercase tracking-[0.14em] text-subtle">Current document</p>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="secondary"
              disabled={item?.kind !== "investigation" && item?.kind !== "note"}
              onClick={() => {
                if (!item || (item.kind !== "investigation" && item.kind !== "note")) return;
                downloadText(`${slug(item.name)}.md`, item.content ?? "", "text/markdown");
                toast.success("Markdown exported");
              }}
            >
              Investigation .md
            </Button>
            <Button
              size="sm"
              variant="ghost"
              disabled={item?.kind !== "investigation" && item?.kind !== "note"}
              onClick={() => {
                if (!item) return;
                const snap = useScratchpad.getState().snapshot();
                const one = exportSubset(snap, [item.id]);
                downloadText(`${slug(item.name)}.json`, JSON.stringify(one, null, 2), "application/json");
                toast.success("Investigation JSON exported");
              }}
            >
              Investigation JSON
            </Button>
            <Button
              size="sm"
              variant="ghost"
              disabled={item?.kind !== "request"}
              onClick={() => {
                if (!item || item.kind !== "request") return;
                downloadText(
                  `${slug(item.name)}.http`,
                  serializeHttp({
                    name: item.name,
                    method: item.method ?? "GET",
                    url: item.url ?? "",
                    headers: item.headers,
                    body: item.body,
                  }),
                  "text/plain",
                );
                toast.success(".http exported");
              }}
            >
              Request .http
            </Button>
            <Button
              size="sm"
              variant="ghost"
              disabled={item?.kind !== "request"}
              onClick={async () => {
                if (!item || item.kind !== "request") return;
                const ok = await copyText(
                  toCurl({
                    method: item.method ?? "GET",
                    url: item.url ?? "",
                    headers: item.headers,
                    body: item.body,
                    bodyType: item.bodyType,
                  }),
                );
                toast[ok ? "success" : "error"](ok ? "Copied curl" : "Copy failed");
              }}
            >
              Copy curl
            </Button>
          </div>
          <p className="text-2xs text-muted">Supported import: Sheaf JSON, .http, Postman Collection v2, Bruno .bru.</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function slug(name: string) {
  return name.replace(/\s+/g, "-").replace(/[^\w.-]+/g, "") || "sheaf";
}
