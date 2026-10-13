// A tiny constellation: five connected nodes, drawn as inline SVG.
// aria-hidden because the brand name sits right next to it as real text.
export default function Logo({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      width="28"
      height="28"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <g stroke="var(--color-line)" strokeWidth="1.5" strokeLinecap="round">
        <path d="M6 22 L13 10 L22 15 L26 6" />
        <path d="M13 10 L16 26 L22 15" />
      </g>
      <circle cx="6" cy="22" r="2.2" fill="var(--color-ink-muted)" />
      <circle cx="13" cy="10" r="2.8" fill="var(--color-violet)" />
      <circle cx="22" cy="15" r="2.4" fill="var(--color-cyan)" />
      <circle cx="26" cy="6" r="1.8" fill="var(--color-ink-muted)" />
      <circle cx="16" cy="26" r="2" fill="var(--color-ink-muted)" />
    </svg>
  );
}