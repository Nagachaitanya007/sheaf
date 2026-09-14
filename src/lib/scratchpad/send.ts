import { toast } from "sonner";
import {
  encodeUrlencoded,
  executeRequest,
  headersToRecord,
  interpolate,
} from "./http";
import { uid } from "./ids";
import { envVars, useScratchpad } from "./store";
import type { HeaderRow, HttpMethod, Item, ParsedRequest } from "./types";

export async function sendParsed(parsed: ParsedRequest, sourceItem?: Item | null) {
  const store = useScratchpad.getState();
  if (store.sendState === "sending") return;
  store.setSendState("sending");
  const vars = envVars();
  const url = interpolate(parsed.url, vars);
  const headers = headersToRecord(parsed.headers, vars);
  let body = parsed.body ? interpolate(parsed.body, vars) : undefined;

  if (sourceItem?.bodyType === "urlencoded" && sourceItem.formFields?.length) {
    body = interpolate(encodeUrlencoded(sourceItem.formFields), vars);
    if (!headers["Content-Type"] && !headers["content-type"]) {
      headers["Content-Type"] = "application/x-www-form-urlencoded";
    }
  } else if (sourceItem?.bodyType === "form-data" && sourceItem.formFields?.length) {
    const fd = new URLSearchParams();
    for (const f of sourceItem.formFields) {
      if (f.enabled && f.key) fd.append(interpolate(f.key, vars), interpolate(f.value, vars));
    }
    body = fd.toString();
    headers["Content-Type"] = "application/x-www-form-urlencoded";
  }

  if (parsed.bodyType === "json" && body && !headers["Content-Type"] && !headers["content-type"]) {
    headers["Content-Type"] = "application/json";
  }

  try {
    const response = await executeRequest({
      method: parsed.method,
      url,
      headers,
      body,
    });
    store.setLastResponse(sourceItem?.id ?? null, response);
    store.recordHistory({
      id: uid("hist"),
      requestId: sourceItem?.id,
      name: parsed.name || sourceItem?.name || url,
      method: parsed.method,
      url,
      requestHeaders: parsed.headers,
      requestBody: body,
      response,
      createdAt: Date.now(),
    });
    store.setSendState("idle", response.error ?? null);
    if (response.error) toast.error(response.error);
    else toast.success(`${parsed.method} ${response.status} ${response.statusText || ""}`.trim());
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    store.setSendState("idle", message);
    toast.error(message);
  }
}

export function itemToParsed(item: Item): ParsedRequest {
  return {
    name: item.name,
    method: (item.method ?? "GET") as HttpMethod,
    url: item.url ?? "",
    headers: (item.headers ?? []) as HeaderRow[],
    body: item.body ?? "",
    bodyType: item.bodyType ?? "none",
  };
}

export async function sendItem(item: Item) {
  await sendParsed(itemToParsed(item), item);
}
