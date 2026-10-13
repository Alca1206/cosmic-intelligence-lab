import type { Metadata } from "next";
import Projects from "@/components/sections/Projects";
import Universe from "@/components/universe/Universe";
import { projectsGraph } from "@/data/universe";

export const metadata: Metadata = {
  title: "Projects",
  description: "A selection of machine learning and data projects, each with the source code and what it does.",
  alternates: { canonical: "/projects" },
};

export default function ProjectsPage() {
  return <Projects map={<Universe graph={projectsGraph} variant="panel" />} />;
}
