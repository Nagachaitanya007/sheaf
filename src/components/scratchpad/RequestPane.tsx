import { Play } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { HTTP_METHODS, type BodyType, type HttpMethod, type Item } from "@/lib/scratchpad/types";
import { sendItem } from "@/lib/scratchpad/send";
import { serializeHttp, toCurl } from "@/lib/scratchpad/http";
import { useScratchpad } from "@/lib/scratchpad/store";
import { copyText } from "@/lib/utils";
import { toast } from "sonner";

export function RequestPane({ item }: { item: Item }) {
  const updateRequest = useScratchpad((s) => s.updateRequest);
  const addHeaderRow = useScratchpad((s) => s.addHeaderRow);
  const upsertHeader = useScratchpad((s) => s.upsertHeader);
  const removeHeaderRow = useScratchpad((s) => s.removeHeaderRow);
  const sending = useScratchpad((s) => s.sendState === "sending");
  const [tab, setTab] = useState("headers");

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex flex-col gap-2 border-b border-border p-3">
        <div className="flex gap-2">
          <select
            value={item.method ?? "GET"}
            onChange={(e) => updateRequest(item.id, { method: e.target.value as HttpMethod })}
            className="h-9 w-[108px] rounded-md border border-border bg-elevated px-2 font-mono text-xs font-semibold"
          >
            {HTTP_METHODS.map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
          <Input
            value={item.url ?? ""}
            onChange={(e) => updateRequest(item.id, { url: e.target.value })}
            placeholder="https://api.example.com or {{baseUrl}}/path"
            className="h-9 flex-1 font-mono"
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                e.preventDefault();
                void sendItem(item);
              }
            }}
          />
          <Button
            variant="send"
            className="h-9 px-4"
            disabled={sending}
            onClick={() => void sendItem(item)}
          >
            <Play className="size-3.5" />
            {sending ? "Sending" : "Send"}
          </Button>
        </div>
      </div>
      <Tabs value={tab} onValueChange={setTab} className="flex min-h-0 flex-1 flex-col">
        <div className="border-b border-border px-3 py-1.5">
          <TabsList>
            <TabsTrigger value="headers">Headers</TabsTrigger>
            <TabsTrigger value="body">Body</TabsTrigger>
            <TabsTrigger value="raw">Raw HTTP</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="headers" className="min-h-0 flex-1 overflow-auto p-3">
          <div className="grid grid-cols-[20px_1fr_1fr_28px] gap-1.5">
            {(item.headers ?? []).map((h) => (
              <div key={h.id} className="contents">
                <label className="flex size-8 items-center justify-center">
                  <input
                    type="checkbox"
                    checked={h.enabled}
                    onChange={(e) => upsertHeader(item.id, { ...h, enabled: e.target.checked })}
                  />
                </label>
                <Input
                  value={h.key}
                  placeholder="Header"
                  className="font-mono"
                  onChange={(e) => upsertHeader(item.id, { ...h, key: e.target.value })}
                />
                <Input
                  value={h.value}
                  placeholder="Value"
                  className="font-mono"
                  onChange={(e) => upsertHeader(item.id, { ...h, value: e.target.value })}
                />
                <Button size="icon-sm" variant="ghost" onClick={() => removeHeaderRow(item.id, h.id)}>
                  ×
                </Button>
              </div>
            ))}
          </div>
          <Button size="sm" variant="ghost" className="mt-2" onClick={() => addHeaderRow(item.id)}>
            Add header
          </Button>
        </TabsContent>
        <TabsContent value="body" className="flex min-h-0 flex-1 flex-col p-3">
          <div className="mb-2 flex flex-wrap gap-1">
            {(["none", "json", "raw", "urlencoded", "form-data"] as BodyType[]).map((t) => (
              <Button
                key={t}
                size="sm"
                variant={item.bodyType === t ? "secondary" : "ghost"}
                onClick={() => updateRequest(item.id, { bodyType: t })}
              >
                {t}
              </Button>
            ))}
          </div>
          {item.bodyType === "none" ? (
            <p className="text-sm text-muted">This request has no body.</p>
          ) : item.bodyType === "urlencoded" || item.bodyType === "form-data" ? (
            <FormFields item={item} />
          ) : (
            <Textarea
              className="min-h-0 flex-1"
              value={item.body ?? ""}
              onChange={(e) => updateRequest(item.id, { body: e.target.value })}
              placeholder={item.bodyType === "json" ? '{ "ok": true }' : "raw body"}
            />
          )}
        </TabsContent>
        <TabsContent value="raw" className="min-h-0 flex-1 overflow-auto p-3">
          <pre className="rounded-md border border-border bg-inset p-3 font-mono text-xs leading-relaxed">
            {serializeHttp({
              name: item.name,
              method: item.method ?? "GET",
              url: item.url ?? "",
              headers: item.headers,
              body: item.body,
            })}
          </pre>
          <Button
            size="sm"
            variant="secondary"
            className="mt-2"
            onClick={async () => {
              const ok = await copyText(
                toCurl({
                  method: item.method ?? "GET",
                  url: item.url ?? "",
                  headers: item.headers,
                  body: item.body,
                }),
              );
              toast[ok ? "success" : "error"](ok ? "Copied curl" : "Copy failed");
            }}
          >
            Copy as curl
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function FormFields({ item }: { item: Item }) {
  const updateRequest = useScratchpad((s) => s.updateRequest);
  const fields = item.formFields ?? [];
  return (
    <div className="flex flex-col gap-1.5">
      {fields.map((f, i) => (
        <div key={f.id} className="grid grid-cols-[1fr_1fr_28px] gap-1.5">
          <Input
            value={f.key}
            placeholder="key"
            onChange={(e) => {
              const next = fields.map((x, idx) => (idx === i ? { ...x, key: e.target.value } : x));
              updateRequest(item.id, { formFields: next });
            }}
          />
          <Input
            value={f.value}
            placeholder="value"
            onChange={(e) => {
              const next = fields.map((x, idx) => (idx === i ? { ...x, value: e.target.value } : x));
              updateRequest(item.id, { formFields: next });
            }}
          />
          <Button
            size="icon-sm"
            variant="ghost"
            onClick={() => updateRequest(item.id, { formFields: fields.filter((_, idx) => idx !== i) })}
          >
            ×
          </Button>
        </div>
      ))}
      <Button
        size="sm"
        variant="ghost"
        onClick={() =>
          updateRequest(item.id, {
            formFields: [...fields, { id: crypto.randomUUID(), key: "", value: "", enabled: true }],
          })
        }
      >
        Add field
      </Button>
    </div>
  );
}
