function SideTab({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: ReactNode;
  label: string;
}) {
  return (
    <button type="button" onClick={onClick} data-active={active} className="rail-tab min-w-0 flex-1 overflow-hidden">
      {icon}
      <span className="hidden min-w-0 truncate sm:inline">{label}</span>
    </button>
  );
}
