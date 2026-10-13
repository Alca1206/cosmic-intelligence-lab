// Shapes of our content. If a data file doesn't match, TypeScript tells you.

export type Project = {
  slug: string;
  title: string;
  summary: string;
  tags: string[];
  /** null = no repository yet. Never put a made-up URL here. */
  repoUrl: string | null;
  /** null = no detail page yet. Later this becomes e.g. "/projects/stargaze-weather-bot". */
  detailPath: string | null;
  /** Honest labeling of where the project stands. */
  status: "placeholder" | "in-progress" | "complete";
  /** Groups projects by colour on the star map. */
  category: "Deep Learning" | "Data Engineering" | "LLM Apps";
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