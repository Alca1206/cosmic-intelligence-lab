import type { ReactNode } from "react";

type SectionProps = {
  /** Must match the anchor used in navigation, e.g. "projects" -> #projects */
  id: string;
  title: string;
  description?: ReactNode;
  children: ReactNode;
};

// Every content section shares the same width, spacing, and heading style.
export default function Section({ id, title, description, children }: SectionProps) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className="container-page py-20 md:py-28"
    >
      <h2 id={`${id}-title`} className="text-h2 font-semibold">
        {title}
      </h2>
      {description && (
        <p className="mt-4 max-w-2xl text-lead text-ink-muted">{description}</p>
      )}
      <div className="mt-12">{children}</div>
    </section>
  );
}