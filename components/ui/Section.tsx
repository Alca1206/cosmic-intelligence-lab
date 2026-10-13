import type { ReactNode } from "react";

type SectionProps = {
  /** Used for the section's anchor and heading id, e.g. "projects" */
  id: string;
  /** 1 on a page of its own, 2 when the section sits inside a longer page. */
  level?: 1 | 2;
  title: string;
  description?: ReactNode;
  children: ReactNode;
};

// Every content section shares the same width, spacing, and heading style.
export default function Section({ id, level = 1, title, description, children }: SectionProps) {
  const Heading = level === 1 ? "h1" : "h2";
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className="container-page py-20 md:py-28"
    >
      <Heading id={`${id}-title`} className="text-h2 font-semibold">
        {title}
      </Heading>
      {description && (
        <p className="mt-4 max-w-2xl text-lead text-ink-muted">{description}</p>
      )}
      <div className="mt-12">{children}</div>
    </section>
  );
}