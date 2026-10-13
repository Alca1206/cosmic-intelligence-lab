import type { ReactNode } from "react";

// A template (unlike a layout) is re-created on every navigation, so each page
// gets the same short "arrive from space" fade. Reduced-motion users get none
// (see the prefers-reduced-motion rule in globals.css).
export default function Template({ children }: { children: ReactNode }) {
  return <div className="animate-page-in">{children}</div>;
}
