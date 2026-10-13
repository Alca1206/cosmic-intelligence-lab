import type { ReactNode } from "react";

export default function Tag({ children }: { children: ReactNode }) {
  return (
    <span className="inline-block rounded-md border border-line bg-space px-2.5 py-1 text-sm text-ink-muted">
      {children}
    </span>
  );
}