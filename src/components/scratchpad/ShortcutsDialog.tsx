import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Kbd } from "@/components/ui/kbd";
import { useScratchpad } from "@/lib/scratchpad/store";
import { isMac } from "@/lib/utils";

const ROWS = [
  ["Command palette", "K"],
  ["Quick open", "P"],
  ["Search workspace", "Shift F"],
  ["Send request", "Enter"],
  ["New request", "N"],
  ["New note", "Shift N"],
  ["Utilities", "Shift U"],
  ["Toggle preview / edit", "E"],
];

export function ShortcutsDialog() {
  const open = useScratchpad((s) => s.shortcutsOpen);
  const setOpen = useScratchpad((s) => s.setShortcutsOpen);
  const mod = isMac() ? "⌘" : "Ctrl";
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogTitle>Keyboard shortcuts</DialogTitle>
        <DialogDescription>Everything important is a keystroke away.</DialogDescription>
        <ul className="mt-3 divide-y divide-border">
          {ROWS.map(([label, key]) => (
            <li key={label} className="flex items-center justify-between py-2 text-sm">
              <span>{label}</span>
              <span className="flex items-center gap-1">
                <Kbd>{mod}</Kbd>
                {key.split(" ").map((k) => (
                  <Kbd key={k}>{k}</Kbd>
                ))}
              </span>
            </li>
          ))}
          <li className="flex items-center justify-between py-2 text-sm">
            <span>Shortcuts</span>
            <Kbd>?</Kbd>
          </li>
        </ul>
      </DialogContent>
    </Dialog>
  );
}
