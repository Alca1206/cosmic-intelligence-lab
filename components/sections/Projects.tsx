import Section from "@/components/ui/Section";
import ProjectCard from "@/components/ui/ProjectCard";
import { projects } from "@/data/projects";
import type { ReactNode } from "react";

export default function Projects({ map }: { map?: ReactNode }) {
  return (
    <Section
      id="projects"
      title="Selected Projects"
      description="A selection of my work, with source code on GitHub. Detailed write-ups are coming soon."
    >
      {map && <div className="mb-12">{map}</div>}
      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <li key={project.slug}>
            <ProjectCard project={project} />
          </li>
        ))}
      </ul>
    </Section>
  );
}