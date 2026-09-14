  const menuExtras = slash && (q.length >= 2 || q.startsWith("req")) ? extras : [];

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex min-w-0 items-center gap-1.5 border-b border-border px-2">
        <button type="button" data-active={mode === "preview"} className="rail-tab" onClick={() => setMode("preview")}>
          Preview
        </button>
        <button type="button" data-active={mode === "edit"} className="rail-tab" onClick={() => setMode("edit")}>
          Edit
        </button>
        {investigation ? (
          <div className="ml-2 flex items-center gap-2">
            <InvestigationToolbar item={item} />
            <IconTip label="Insert HTTP request">
              <button
                type="button"
                className="shrink-0 rounded-md px-2 py-1 text-2xs font-medium text-muted transition-colors hover:bg-elevated hover:text-foreground"
                onClick={() => insertHttpInto(item)}
              >
                Insert HTTP
              </button>
            </IconTip>
            <IconTip label="Insert block">
              <button
                type="button"
                className="shrink-0 rounded-md px-2 py-1 font-mono text-2xs text-muted transition-colors hover:bg-elevated hover:text-foreground"
                aria-label="Insert block"
                onClick={() =>
                  setSlash({
                    from: (item.content ?? "").length,
                    caret: (item.content ?? "").length,
                    query: "",
                    index: 0,
                    preview: mode === "preview",
                  })
                }
              >
                /
              </button>
            </IconTip>
          </div>
        ) : (
          <span className="ml-auto text-2xs text-subtle">Type / for blocks · HTTP is executable</span>
        )}
        {investigation && mode === "preview" ? (
          <span className="ml-2 min-w-0 truncate text-2xs text-subtle">/ inserts blocks · click a request to edit</span>
        ) : investigation ? (
          <span className="ml-2 min-w-0 truncate text-2xs text-subtle">/ inserts blocks · ⌘⇧Enter runs</span>
        ) : null}
      </div>
      {mode === "edit" ? (
        <div className="relative min-h-0 flex-1">
          <Textarea