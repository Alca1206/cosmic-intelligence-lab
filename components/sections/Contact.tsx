import { ArrowUpRight, Briefcase, Clock, Code, FileText, Mail } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Section from "@/components/ui/Section";
import Card from "@/components/ui/Card";
import { profile } from "@/data/profile";
import type { Profile } from "@/data/types";

type ContactKey = keyof Profile["contact"];

// How each contact value is labeled and turned into a link.
// The VALUES live in data/profile.ts; this file only decides how to show them.
const items: {
  key: ContactKey;
  label: string;
  icon: LucideIcon;
  text: (value: string) => string;
  href: (value: string) => string;
}[] = [
  { key: "email", label: "Email", icon: Mail, text: (v) => v, href: (v) => `mailto:${v}` },
  {
    key: "github",
    label: "GitHub",
    icon: Code,
    text: (v) => v.replace(/^https?:\/\//, ""),
    href: (v) => v,
  },
  {
    key: "linkedin",
    label: "LinkedIn",
    icon: Briefcase,
    text: (v) => v.replace(/^https?:\/\//, ""),
    href: (v) => v,
  },
  { key: "resume", label: "Résumé", icon: FileText, text: () => "View résumé", href: (v) => v },
];

export default function Contact() {
  return (
    <Section
      id="contact"
      title="Contact"
      description="The best ways to reach me. Anything not available yet is marked as coming soon."
    >
      <ul className="grid gap-6 sm:grid-cols-2">
        {items.map(({ key, label, icon: Icon, text, href }) => {
          const value = profile.contact[key];
          const isExternal = value !== null && value.startsWith("http");

          return (
            <li key={key}>
              <Card className="h-full">
                <div className="flex items-center gap-2 text-sm font-medium text-ink">
                  <Icon size={18} aria-hidden="true" />
                  {label}
                </div>

                {value ? (
                  <a
                    href={href(value)}
                    className="mt-3 inline-flex items-center gap-1.5 break-all text-ink-muted hover:text-cyan"
                    {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  >
                    {text(value)}
                    {isExternal && <ArrowUpRight size={16} aria-hidden="true" />}
                    <span className="sr-only">
                      {" "}
                      ({label}
                      {isExternal ? ", opens in a new tab" : ""})
                    </span>
                  </a>
                ) : (
                  <p className="mt-3 inline-flex items-center gap-1.5 text-ink-muted">
                    <Clock size={16} aria-hidden="true" />
                    <span className="italic">Coming soon</span>
                  </p>
                )}
              </Card>
            </li>
          );
        })}
      </ul>
    </Section>
  );
}