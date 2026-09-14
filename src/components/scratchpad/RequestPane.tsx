import { Play, Square } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { IconTip } from "@/components/ui/icon-tip";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { HTTP_METHODS, type AuthType, type BodyType, type HttpMethod, type Item } from "@/lib/scratchpad/types";
import { cancelSend, sendItem } from "@/lib/scratchpad/send";
import { serializeHttp, toCurl } from "@/lib/scratchpad/http";
import { useScratchpad } from "@/lib/scratchpad/store";
import { copyText } from "@/lib/utils";
import { toast } from "sonner";
import { CodeBlock } from "./CodeBlock";

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
          <Select
            value={item.method ?? "GET"}
            onValueChange={(value) => updateRequest(item.id, { method: value as HttpMethod })}
          >
            <SelectTrigger className="h-9 w-[108px] font-mono text-xs font-semibold" aria-label="Request method">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {HTTP_METHODS.map((m) => (
                <SelectItem key={m} value={m}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
            variant={sending ? "ghost" : "send"}
            className="h-9 px-4"
            onClick={() => (sending ? cancelSend() : void sendItem(item))}
          >
            {sending ? <Square className="size-3.5" /> : <Play className="size-3.5" />}
            {sending ? "Cancel" : "Send"}
          </Button>
        </div>
      </div>
      <Tabs value={tab} onValueChange={setTab} className="flex min-h-0 flex-1 flex-col">
        <div className="border-b border-border px-3 py-1.5">
          <TabsList>
            <TabsTrigger value="headers">Headers</TabsTrigger>
            <TabsTrigger value="auth">Auth</TabsTrigger>
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
                <IconTip label="Remove header">
                  <Button size="icon-sm" variant="ghost" aria-label="Remove header" onClick={() => removeHeaderRow(item.id, h.id)}>
                    ×
                  </Button>
                </IconTip>
              </div>
            ))}
          </div>
          <Button size="sm" variant="ghost" className="mt-2" onClick={() => addHeaderRow(item.id)}>
            Add header
          </Button>
        </TabsContent>
        <TabsContent value="auth" className="min-h-0 flex-1 overflow-auto p-3">
          <AuthEditor item={item} />
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
          <div className="rounded-lg border border-border bg-inset p-3">
            <CodeBlock
              lang="http"
              code={serializeHttp({
                name: item.name,
                method: item.method ?? "GET",
                url: item.url ?? "",
                headers: item.headers,
                body: item.body,
              })}
            />
          </div>
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
                  bodyType: item.bodyType,
                  formFields: item.formFields,
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

function AuthEditor({ item }: { item: Item }) {
  const setAuth = useScratchpad((s) => s.setAuth);
  const updateRequest = useScratchpad((s) => s.updateRequest);
  const auth = item.auth ?? { type: "none" as AuthType };
  return (
    <div className="flex max-w-lg flex-col gap-3">
      <p className="text-xs text-muted">
        Applied at send time. Generated headers are not stored in the header table. Secrets are masked in history — this is not encryption.
      </p>
      <div className="flex flex-wrap gap-1">
        {(["none", "bearer", "basic", "apikey"] as AuthType[]).map((t) => (
          <Button key={t} size="sm" variant={auth.type === t ? "secondary" : "ghost"} onClick={() => setAuth(item.id, { ...auth, type: t })}>
            {t}
          </Button>
        ))}
      </div>
      {auth.type === "bearer" ? (
        <Input
          className="font-mono"
          placeholder="{{token}} or a bearer value"
          value={auth.token ?? ""}
          onChange={(e) => setAuth(item.id, { ...auth, token: e.target.value })}
        />
      ) : null}
      {auth.type === "basic" ? (
        <div className="grid grid-cols-2 gap-2">
          <Input placeholder="username" value={auth.username ?? ""} onChange={(e) => setAuth(item.id, { ...auth, username: e.target.value })} />
          <Input
            placeholder="password"
            type="password"
            value={auth.password ?? ""}
            onChange={(e) => setAuth(item.id, { ...auth, password: e.target.value })}
          />
        </div>
      ) : null}
      {auth.type === "apikey" ? (
        <div className="grid grid-cols-[1fr_1fr_auto] gap-2">
          <Input placeholder="Header or query name" value={auth.key ?? ""} onChange={(e) => setAuth(item.id, { ...auth, key: e.target.value })} />
          <Input placeholder="{{apiKey}}" className="font-mono" value={auth.value ?? ""} onChange={(e) => setAuth(item.id, { ...auth, value: e.target.value })} />
          <Select
            value={auth.in ?? "header"}
            onValueChange={(value) => setAuth(item.id, { ...auth, in: value as "header" | "query" })}
          >
            <SelectTrigger className="h-8 w-28" aria-label="API key location">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="header">Header</SelectItem>
              <SelectItem value="query">Query</SelectItem>
            </SelectContent>
          </Select>
        </div>
      ) : null}
      <label className="flex items-center gap-2 text-xs text-muted">
        Timeout (ms)
        <Input
          className="h-8 w-28"
          type="number"
          min={1000}
          value={item.timeoutMs ?? 30000}
          onChange={(e) => updateRequest(item.id, { timeoutMs: Number(e.target.value) || 30000 })}
        />
      </label>
    </div>
  );
}
