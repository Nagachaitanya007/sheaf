import { useEffect, useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { nameError, normalizeName } from "@/lib/scratchpad/names";

export function NameDialog({
  open,
  title,
  description,
  initial,
  submitLabel,
  existing = [],
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  title: string;
  description?: string;
  initial: string;
  submitLabel: string;
  existing?: string[];
  onOpenChange: (open: boolean) => void;
  onSubmit: (name: string) => void;
}) {
  const [value, setValue] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setValue(initial);
    setError(null);
    const id = window.requestAnimationFrame(() => {
      ref.current?.focus();
      ref.current?.select();
    });
    return () => window.cancelAnimationFrame(id);
  }, [open, initial]);

  function submit(e?: FormEvent) {
    e?.preventDefault();
    const err = nameError(value, existing);
    if (err) {
      setError(err);
      return;
    }
    onSubmit(normalizeName(value));
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription className={description ? undefined : "sr-only"}>{description ?? title}</DialogDescription>
        <form className="mt-3 flex flex-col gap-3" onSubmit={submit}>
          <Input
            ref={ref}
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setError(null);
            }}
            aria-label="Name"
            aria-invalid={Boolean(error)}
            autoComplete="off"
          />
          {error ? <p className="text-xs text-danger">{error}</p> : null}
          <div className="flex justify-end gap-2">
            <Button type="button" size="sm" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" variant="send">
              {submitLabel}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
