  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { IconTip } from "@/components/ui/icon-tip";
import { searchWorkspace } from "@/lib/scratchpad/search";
import { useScratchpad } from "@/lib/scratchpad/store";
import type { Item, ItemKind } from "@/lib/scratchpad/types";
import { cn, formatRelative } from "@/lib/utils";
import { NameDialog } from "./NameDialog";

export function Sidebar() {
  const view = useScratchpad((s) => s.sidebarView);
  const setView = useScratchpad((s) => s.setSidebarView);
  const [density, setDensity] = useState<"wide" | "medium" | "narrow" | "compact">("wide");
  const [hoverExpand, setHoverExpand] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sidebarRef.current;
    if (!el) return;
    const update = (width: number) => {
      setDensity(width >= 220 ? "wide" : width >= 170 ? "medium" : width >= 125 ? "narrow" : "compact");
    };
    update(el.getBoundingClientRect().width);
    const observer = new ResizeObserver(([entry]) => update(entry.contentRect.width));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={sidebarRef}
      data-density={density}
      style={{ width: hoverExpand && density !== "wide" ? 240 : undefined }}
      className={cn(
        "relative flex h-full min-h-0 min-w-0 flex-col overflow-hidden bg-surface transition-[width] duration-200 ease-out",
        hoverExpand && density !== "wide" && "z-30 overflow-visible shadow-xl",
      )}
      onMouseEnter={() => density !== "wide" && setHoverExpand(true)}
      onMouseLeave={() => setHoverExpand(false)}
    >
      <div className="shrink-0 px-2 pt-2 pb-1">
        <div className="flex items-center gap-0.5 rounded-lg bg-inset p-0.5">
          <SideTab active={view === "workspace"} onClick={() => setView("workspace")} icon={<Folder className="size-3.5" />} label="Workspace" />
          <SideTab active={view === "history"} onClick={() => setView("history")} icon={<History className="size-3.5" />} label="History" />
          <SideTab active={view === "search"} onClick={() => setView("search")} icon={<Search className="size-3.5" />} label="Search" />
        </div>
      </div>
      {view === "workspace" ? <WorkspaceTree /> : null}
      {view === "history" ? <HistoryList /> : null}
      {view === "search" ? <SearchList /> : null}
      <SidebarAdaptiveStyles />
      {hoverExpand && density !== "wide" ? (
        <div className="pointer-events-none absolute inset-y-0 left-0 z-[-1] w-full bg-surface" />
      ) : null}
    </div>
  );
}

function MethodBadge({ method }: { method: string }) {
  const label = method.toUpperCase();
  const compact = label === "DELETE" ? "D" : label.slice(0, 1);
  return (
    <span
      className="method-badge shrink-0"
      data-method={label}
      title={label}
      aria-label={label}
    >
      <span className="method-full">{label}</span>
      <span className="method-compact">{compact}</span>
    </span>
  );
}

function NameLabel({ name, className }: { name: string; className?: string }) {
  return (
    <span
      className={cn(