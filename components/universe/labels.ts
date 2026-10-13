import { allStars, type StarSpec, type UniverseGraph } from "@/data/universe";

// Text labels drawn over the 3D scene. They are plain HTML (crisp, selectable,
// screen-reader friendly) and are moved to follow their stars.
export type LabelSpec = {
  id: string;
  text: string;
  /** How far above the star (in scene units) the label sits */
  lift: number;
  kind: StarSpec["kind"];
};

const shorten = (text: string) => (text.length > 26 ? `${text.slice(0, 25).trimEnd()}…` : text);

export function labelsFor(graph: UniverseGraph): LabelSpec[] {
  return allStars(graph).map((s) => ({
    id: s.id,
    text: shorten(s.label),
    lift: s.size + 0.55,
    kind: s.kind,
  }));
}
