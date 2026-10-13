// The constellation mark, drawn for generated images (link preview, Apple icon).
// Colors are written out because generated images can't read our CSS variables.
export default function LogoMark({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <g stroke="#3a4668" strokeWidth="1.5" strokeLinecap="round">
        <path d="M6 22 L13 10 L22 15 L26 6" />
        <path d="M13 10 L16 26 L22 15" />
      </g>
      <circle cx="6" cy="22" r="2.2" fill="#a1a9bc" />
      <circle cx="13" cy="10" r="2.8" fill="#9b8cff" />
      <circle cx="22" cy="15" r="2.4" fill="#55d6e8" />
      <circle cx="26" cy="6" r="1.8" fill="#a1a9bc" />
      <circle cx="16" cy="26" r="2" fill="#a1a9bc" />
    </svg>
  );
}