export function BrandMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <path
        d="M16 5.5 L10 26.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.1"
        strokeLinecap="round"
        opacity="0.72"
      />
      <path
        d="M16 5.5 L22 26.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.1"
        strokeLinecap="round"
        opacity="0.72"
      />
      <path d="M16 5 L16 27" fill="none" stroke="currentColor" strokeWidth="2.35" strokeLinecap="round" />
      <path
        d="M9.5 15.4 C13.2 13.4 18.8 13.4 22.5 15.4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
      />
      <path
        d="M10 17.6 C13.4 19.4 18.6 19.4 22 17.6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}
