import { User } from "lucide-react";
import Section from "@/components/ui/Section";
import { profile } from "@/data/profile";

export default function About() {
  const { name, role, about } = profile;

  return (
    <Section id="about" title="About">
      <div className="grid gap-10 lg:grid-cols-[16rem_1fr] lg:gap-16">
        {/* Photo slot. To add a real photo later, put the image in /public and
            replace this div with <Image src="/me.jpg" alt="Portrait of ..." ... /> */}
        <div className="mx-auto w-full max-w-xs lg:mx-0">
          <div className="flex aspect-[4/5] flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-line bg-surface text-ink-muted">
            <User size={40} aria-hidden="true" />
            <span className="text-sm">Profile photo placeholder</span>
          </div>
        </div>

        <div>
          <h3 className="font-display text-2xl font-semibold">{name}</h3>
          <p className="mt-1 text-ink-muted">{role}</p>

          <div className="mt-6 max-w-2xl space-y-4 text-ink-muted">
            {about.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          <dl className="mt-10 grid max-w-2xl gap-x-8 gap-y-5 border-t border-line pt-8 sm:grid-cols-2">
            {about.facts.map((fact) => (
              <div key={fact.label}>
                <dt className="text-sm font-medium text-ink">{fact.label}</dt>
                <dd className="mt-1 text-ink-muted">{fact.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </Section>
  );
}