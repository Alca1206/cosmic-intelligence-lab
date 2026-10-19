// Builds the decorative part of a star map: many small stars joined by short chains
// of lines, like a drawn constellation. Pure and seeded, so the sky is identical on
// every visit and easy to test. Nothing here carries meaning; it is atmosphere.

export type Vec3 = [number, number, number];

export type DecorStar = { id: string; position: Vec3; size: number };

export type SkyOptions = {
  /** Positions of the real (clickable) stars; decoration keeps away from them. */
  anchors: { id: string; position: Vec3 }[];
  count: number;
  seed: number;
  bounds: { x: [number, number]; y: [number, number]; z: [number, number] };
  /** Minimum gap between any two stars */
  minGap: number;
  /** Keep only this share of stars left of `x`, so text over the map stays readable */
  thinLeft?: { x: number; keep: number };
  /** Lines only join stars closer than this */
  maxLink: number;
};

export type Sky = { stars: DecorStar[]; edges: [string, string][] };

export function seededRandom(seed: number): () => number {
  let s = Math.max(1, Math.floor(seed)) % 2147483647;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export function distance(a: Vec3, b: Vec3): number {
  return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
}

export function buildSky(opts: SkyOptions): Sky {
  const rand = seededRandom(opts.seed);
  const { bounds, minGap } = opts;
  const pick = (range: [number, number]) => range[0] + rand() * (range[1] - range[0]);

  const placed: { id: string; position: Vec3 }[] = [...opts.anchors];
  const stars: DecorStar[] = [];
  let attempts = 0;
  while (stars.length < opts.count && attempts < opts.count * 60) {
    attempts++;
    const position: Vec3 = [pick(bounds.x), pick(bounds.y), pick(bounds.z)];
    if (opts.thinLeft && position[0] < opts.thinLeft.x && rand() > opts.thinLeft.keep) continue;
    if (placed.some((p) => distance(p.position, position) < minGap)) continue;
    const star = { id: `sky-${stars.length}`, position, size: 0.1 + rand() * rand() * 0.22 };
    stars.push(star);
    placed.push(star);
  }

  // Join each star to its nearest neighbours: one or two for faint stars, more for real
  // ones, so the real stars sit on chains. No self-links, no duplicates.
  const anchorIds = new Set(opts.anchors.map((a) => a.id));
  const edges: [string, string][] = [];
  const seen = new Set<string>();
  const neighbours = new Map<string, Set<string>>();
  const link = (a: string, b: string) => {
    const key = a < b ? `${a}|${b}` : `${b}|${a}`;
    if (a === b || seen.has(key)) return;
    // Real constellations are chains and branches, so skip a line that would close a triangle.
    const na = neighbours.get(a);
    const nb = neighbours.get(b);
    if (na && nb && [...na].some((n) => nb.has(n))) return;
    seen.add(key);
    edges.push([a, b]);
    (neighbours.get(a) ?? neighbours.set(a, new Set()).get(a)!).add(b);
    (neighbours.get(b) ?? neighbours.set(b, new Set()).get(b)!).add(a);
  };
  for (const star of placed) {
    const nearest = placed
      .filter((p) => p.id !== star.id)
      .map((p) => ({ id: p.id, d: distance(p.position, star.position) }))
      .sort((a, b) => a.d - b.d);
    const want = anchorIds.has(star.id) ? 2 + (rand() < 0.5 ? 1 : 0) : rand() < 0.45 ? 2 : 1;
    for (let i = 0; i < want && i < nearest.length; i++) {
      if (nearest[i].d <= opts.maxLink) link(star.id, nearest[i].id);
    }
  }
  return { stars, edges };
}

/**
 * Scatter n stars irregularly (no ring, no grid), at least `gap` apart. Seeded, so stable.
 * If they don't all fit, the gap is shrunk a little and the search continues, so adding
 * another project never breaks the map.
 */
export function scatter(n: number, seed: number, bounds: { x: [number, number]; y: [number, number]; z: [number, number] }, gap: number, avoid: Vec3[] = []): Vec3[] {
  const rand = seededRandom(seed);
  const pick = (r: [number, number]) => r[0] + rand() * (r[1] - r[0]);
  const out: Vec3[] = [];
  let minGap = gap;
  while (out.length < n) {
    for (let tries = 0; out.length < n && tries < 1500; tries++) {
      const p: Vec3 = [pick(bounds.x), pick(bounds.y), pick(bounds.z)];
      if ([...out, ...avoid].every((q) => distance(p, q) >= minGap)) out.push(p);
    }
    minGap *= 0.92;
  }
  return out;
}
