import { profile } from "./profile";
import { projects } from "./projects";
import { researchEntries } from "./research";
import { skillGroups } from "./skills";

// Shapes for the constellation map.
export type ConstellationNode = {
  /** Must match the id of an existing <section>, e.g. "projects" -> #projects */
  id: string;
  label: string;
  /** Short preview text shown when the star is hovered, focused, or tapped. */
  summary: string;
  /** Position inside the map as a percentage (0 to 100). Center is 50, 50. */
  x: number;
  y: number;
  /** Which side of the star the label sits on (keeps labels from colliding). */
  labelSide: "top" | "bottom" | "left" | "right";
  tone: "violet" | "cyan";
};

export type ConstellationCenter = {
  title: string;
  summary: string;
  hint: string;
};

// ---- Preview text, built from the real data so it never goes stale ----

const projectCount = projects.length;
const linkedCount = projects.filter((project) => project.repoUrl).length;
const linkedText =
  linkedCount === 0
    ? ""
    : linkedCount === projectCount
      ? ", all with source code on GitHub"
      : `, ${linkedCount} with source code on GitHub`;
const projectsSummary = `${projectCount} selected ${projectCount === 1 ? "project" : "projects"}${linkedText}.`;

const researchSummary = researchEntries.every((entry) => entry.status === "proposal")
  ? "Questions, methods, and findings. Currently a working thesis proposal, with no results claimed yet."
  : "Research questions, methods, and findings.";

const skillsSummary = `Grouped by area: ${skillGroups
  .map((group) => group.category)
  .join(", ")}.`;

const availableContacts = [
  profile.contact.email && "Email",
  profile.contact.github && "GitHub",
  profile.contact.linkedin && "LinkedIn",
  profile.contact.resume && "Résumé",
].filter((item): item is string => Boolean(item));

const contactSummary =
  availableContacts.length === 0
    ? "Contact details are coming soon."
    : availableContacts.length === 4
      ? "Email, GitHub, LinkedIn, and résumé."
      : `Available now: ${availableContacts.join(", ")}. More coming soon.`;

// ---- The map itself. Edit positions here to rearrange the constellation. ----

export const constellationCenter: ConstellationCenter = {
  title: profile.brand,
  summary:
    "An interactive map of this portfolio. Each star leads to a section: projects, research, skills, background, and contact.",
  hint: "Point at, focus, or tap a star to preview a section.",
};

export const constellationNodes: ConstellationNode[] = [
  { id: "projects", label: "Projects", summary: projectsSummary, x: 22, y: 22, labelSide: "top", tone: "violet" },
  { id: "research", label: "Research", summary: researchSummary, x: 78, y: 18, labelSide: "top", tone: "cyan" },
  { id: "skills", label: "Skills", summary: skillsSummary, x: 88, y: 58, labelSide: "left", tone: "violet" },
  { id: "about", label: "About", summary: "Background, education, and what I'm looking for.", x: 60, y: 84, labelSide: "bottom", tone: "cyan" },
  { id: "contact", label: "Contact", summary: contactSummary, x: 14, y: 68, labelSide: "right", tone: "violet" },
];