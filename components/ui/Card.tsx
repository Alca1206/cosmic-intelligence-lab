import type { ReactNode } from "react";

// The one card style used everywhere, so every card looks related.
export default function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-lg border border-line bg-surface p-6 ${className}`}>
      {children}
    </div>
  );
}