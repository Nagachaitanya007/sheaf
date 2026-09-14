import { appendHttpFence, countHttpBlocks } from "./markdown";
import { HTTP_RAW } from "./slash";
import { useScratchpad } from "./store";
import type { Item } from "./types";

export function insertHttpInto(item: Item, raw = HTTP_RAW) {
  const content = appendHttpFence(item.content ?? "", raw);
  const state = useScratchpad.getState();
  state.updateRequest(item.id, { content });
  state.setFocusHttpIndex(Math.max(0, countHttpBlocks(content) - 1));
  state.setDocMode("preview");
  return content;
}
