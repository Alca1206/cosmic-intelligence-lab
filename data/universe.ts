import { profile } from "./profile";
import { projects } from "./projects";
import { researchEntries } from "./research";
import { skillGroups } from "./skills";
import { buildSky, distance, seededRandom, type DecorStar } from "@/lib/sky";

// The star maps. Each map ("graph") has a hub star in the middle and stars
// around it. Everything is built from the real data files, so adding a project
// to data/projects.ts adds a star automatically.

export type Vec3 = [number, number, number];

export type StarSpec = {
  id: string;
  label: string;
  /** One line shown on hover and in the list */
  summary: string;
  href: string;
  position: Vec3;
  /** Star radius. Bigger = more important. */
  size: number;
  color: string;
  kind: "hub" | "featured" | "node";
};

export type UniverseGraph = {
  id: string;
  hub: StarSpec;
  nodes: StarSpec[];
  /** Small decorative stars. They carry no meaning and cannot be clicked. */
  decor: DecorStar[];
  /** Pairs of star ids (real or decorative) joined by a line */
  edges: [string, string][];
  legend?: { label: string; color: string }[];
  /** Shown as a "back" link when this map is not the top level */
  back?: { href: string; label: string };
  /** How far the camera sits from the middle */
  distance: number;
};

const VIOLET = "#a9bcff"; // a pale periwinkle: reads as blue-white on the dark sky
const CYAN = "#55d6e8";
const PINK = "#ff9ecb";
const WHITE = "#f3f5fa";

/** Scatter n stars irregularly (no ring, no grid), at least `gap` apart. Seeded, so stable. */
function scatter(n: number, seed: number, bounds: { x: [number, number]; y: [number, number]; z: [number, number] }, gap: number, avoid: Vec3[] = []): Vec3[] {
  const rand = seededRandom(seed);
  const pick = (r: [number, number]) => r[0] + rand() * (r[1] - r[0]);
  const out: Vec3[] = [];
  for (let tries = 0; out.length < n && tries < 4000; tries++) {
    const p: Vec3 = [pick(bounds.x), pick(bounds.y), pick(bounds.z)];
    if ([...out, ...avoid].every((q) => distance(p, q) >= gap)) out.push(p);
  }
  return out;
}

// ---------- Home ----------

const researchSummary = researchEntries.every((e) => e.status === "proposal")
  ? "Working thesis proposal. No findings claimed yet."
  : "Research questions, methods and findings.";

const homeSpecs: Omit<StarSpec, "position">[] = [
  { id: "projects", label: "Projects", summary: `${projects.length} projects, with source code on GitHub.`, href: "/projects", size: 0.34, color: VIOLET, kind: "node" },
  { id: "playground", label: "ML Playground", summary: "A live calibration experiment you can interact with.", href: "/playground", size: 0.46, color: CYAN, kind: "featured" },
  { id: "research", label: "Research", summary: researchSummary, href: "/research", size: 0.3, color: VIOLET, kind: "node" },
  { id: "skills", label: "Skills", summary: `${skillGroups.map((g) => g.category).join(", ")}.`, href: "/skills", size: 0.3, color: VIOLET, kind: "node" },
  { id: "contact", label: "Contact", summary: "How to reach me.", href: "/contact", size: 0.3, color: VIOLET, kind: "node" },
];

// Placed by hand: an irregular constellation, not a ring. You are the brightest star,
// slightly off-centre, with the Playground and Projects close by.
const homePositions: Record<string, Vec3> = {
  me: [0.4, -0.5, 0.5],
  playground: [3.6, 3.6, 1.0],
  projects: [4.6, -3.4, -0.5],
  research: [-2.4, 2.9, -1.0],
  skills: [-1.8, -4.3, 0.6],
  contact: [6.6, 0.6, -1.4],
};

const homeHub: StarSpec = {
  id: "me",
  label: profile.name,
  summary: "About me: background and what I'm looking for.",
  href: "/about",
  position: homePositions.me,
  size: 0.6,
  color: WHITE,
  kind: "hub",
};
const homeNodes: StarSpec[] = homeSpecs.map((s) => ({ ...s, position: homePositions[s.id] }));
const homeSky = buildSky({
  anchors: [homeHub, ...homeNodes].map((s) => ({ id: s.id, position: s.position })),
  count: 130,
  seed: 11,
  bounds: { x: [-9, 11], y: [-6.5, 6.5], z: [-3, 2] },
  minGap: 0.9,
  thinLeft: { x: -3, keep: 0.3 },
  maxLink: 3.4,
});

export const homeGraph: UniverseGraph = {
  id: "home",
  distance: 21,
  hub: homeHub,
  nodes: homeNodes,
  decor: homeSky.stars,
  edges: homeSky.edges,
};

// ---------- Projects ----------

const categoryColor: Record<string, string> = {
  "Deep Learning": VIOLET,
  "Data Engineering": CYAN,
  "LLM Apps": PINK,
};

const statusText = { complete: "Complete", "in-progress": "In progress", placeholder: "Placeholder" } as const;

const projectHub: StarSpec = {
  id: "projects-hub",
  label: "Projects",
  summary: "Back to the home map.",
  href: "/",
  position: [-0.6, -0.2, 0.3],
  size: 0.5,
  color: WHITE,
  kind: "hub",
};
const projectPositions = scatter(
  projects.length,
  23,
  { x: [-6.5, 6.5], y: [-3.6, 3.6], z: [-1.2, 1.2] },
  4.3,
  [projectHub.position],
).sort((a, b) => a[0] - b[0]);
const projectNodes: StarSpec[] = projects.map((p, i) => ({
  id: `project-${p.slug}`,
  label: p.title,
  summary: `${p.category} · ${statusText[p.status]} · ${p.tags.slice(0, 3).join(", ")}`,
  href: `/projects/${p.slug}`,
  position: projectPositions[i],
  size: 0.32,
  color: categoryColor[p.category],
  kind: "node" as const,
}));
const projectSky = buildSky({
  anchors: [projectHub, ...projectNodes].map((s) => ({ id: s.id, position: s.position })),
  count: 80,
  seed: 31,
  bounds: { x: [-8, 8], y: [-5, 5], z: [-3, 2] },
  minGap: 1,
  maxLink: 3.2,
});

export const projectsGraph: UniverseGraph = {
  id: "projects",
  distance: 14,
  back: { href: "/", label: "Back to the home map" },
  hub: projectHub,
  nodes: projectNodes,
  decor: projectSky.stars,
  edges: projectSky.edges,
  legend: Object.entries(categoryColor)
    .filter(([name]) => projects.some((p) => p.category === name))
    .map(([label, color]) => ({ label, color })),
};

export function allStars(graph: UniverseGraph): StarSpec[] {
  return [graph.hub, ...graph.nodes];
}
