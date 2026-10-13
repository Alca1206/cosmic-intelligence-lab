import { Clock } from "lucide-react";
import Section from "@/components/ui/Section";
import Card from "@/components/ui/Card";
import { researchEntries } from "@/data/research";
import type { ResearchEntry } from "@/data/types";

const statusLabel: Record<ResearchEntry["status"], string> = {
  proposal: "Working thesis proposal",
  "in-progress": "In progress",
  published: "Published",
};

const fields: { key: keyof ResearchEntry["sections"]; label: string }[] = [
  { key: "researchQuestion", label: "Research question" },
  { key: "methodology", label: "Methodology" },
  { key: "experiments", label: "Experiments" },
  { key: "results", label: "Results" },
  { key: "papers", label: "Relevant papers" },
];

export default function Research() {
  return (
    <Section
      id="research"
      title="Research Observatory"
      description="This space will grow into a home for research questions, experimental methods, model evaluation, and technical findings. Nothing below is a completed result yet."
    >
      <div className="flex flex-col gap-6">
        {researchEntries.map((entry) => (
          <Card key={entry.title} className="md:p-8">
            <p className="w-fit rounded border border-dashed border-line px-2 py-0.5 text-xs text-ink-muted">
              {statusLabel[entry.status]}
            </p>
            <h3 className="mt-4 max-w-3xl font-display text-xl font-semibold sm:text-2xl">
              {entry.title}
            </h3>
            <p className="mt-3 max-w-2xl text-ink-muted">
              This is a working title for a thesis proposal. It is not a
              publication, and no findings are claimed.
            </p>

            <dl className="mt-8 grid gap-x-8 gap-y-6 border-t border-line pt-8 sm:grid-cols-2">
              {fields.map(({ key, label }) => {
                const value = entry.sections[key];
                return (
                  <div key={key}>
                    <dt className="text-sm font-medium text-ink">{label}</dt>
                    <dd className="mt-1 text-ink-muted">
                      {value ?? (
                        <span className="inline-flex items-center gap-1.5 italic">
                          <Clock size={16} aria-hidden="true" />
                          Coming soon
                        </span>
                      )}
                    </dd>
                  </div>
                );
              })}
            </dl>
          </Card>
        ))}
      </div>
    </Section>
  );
}