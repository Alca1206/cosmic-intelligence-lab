// Shapes of our content. If a data file doesn't match, TypeScript tells you.

import type { ProjectCategory } from "./categories.ts";

/** The text on a project's own page. Optional: a project without it just links to GitHub. */
export type ProjectDetail = {
  /** One or two sentences at the top of the page. */
  overview: string;
  /** What it does / how it works. One short line each. */
  highlights: string[];
  /** Caveats and honest limits, e.g. "Results coming soon". */
  notes: string[];
};

export type Project = {
  /** URL name: lowercase words joined by dashes. Becomes /projects/<slug>. */
  slug: string;
  title: string;
  /** Shown on the project card and the map. Only state what the repository supports. */
  summary: string;
  tags: string[];
  /** null = no repository yet. Never put a made-up URL here. */
  repoUrl: string | null;
  /** Honest labeling of where the project stands. */
  status: "placeholder" | "in-progress" | "complete";
  /** Groups projects by colour on the star map (see data/categories.ts). */
  category: ProjectCategory;
  /** Give the project its own page by adding this. Leave it out for a card only. */
  detail?: ProjectDetail;
};

export type SkillGroup = {
  category: string;
  skills: string[];
};

export type ResearchEntry = {
  title: string;
  status: "proposal" | "in-progress" | "published";
  /** Section name -> text. null means "coming soon". */
  sections: {
    researchQuestion: string | null;
    methodology: string | null;
    experiments: string | null;
    results: string | null;
    papers: string | null;
  };
};

export type Profile = {
  name: string;
  brand: string;
  role: string;
  focusAreas: string[];
  heroHeadline: { first: string; second: string };
  heroText: string;
  about: {
    paragraphs: string[];
    /** Placeholder rows to fill in later (university, degree, etc.). */
    facts: { label: string; value: string }[];
  };
  contact: {
    /** null = not set yet, so the UI can show "coming soon". */
    email: string | null;
    github: string | null;
    linkedin: string | null;
    resume: string | null;
  };
};