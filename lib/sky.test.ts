import { test } from "node:test";
import assert from "node:assert/strict";
import { buildSky, distance, type SkyOptions } from "./sky.ts";

const options: SkyOptions = {
  anchors: [
    { id: "a", position: [0, 0, 0] },
    { id: "b", position: [3, 1, 0] },
  ],
  count: 60,
  seed: 5,
  bounds: { x: [-8, 8], y: [-5, 5], z: [-2, 2] },
  minGap: 0.8,
  maxLink: 3,
};

test("the same seed always gives the same sky", () => {
  assert.deepEqual(buildSky(options), buildSky(options));
});

test("a different seed gives a different sky", () => {
  assert.notDeepEqual(buildSky(options).stars, buildSky({ ...options, seed: 6 }).stars);
});

test("stars stay inside the bounds and keep their distance", () => {
  const { stars } = buildSky(options);
  assert.ok(stars.length > 40);
  const all = [...options.anchors.map((a) => a.position), ...stars.map((s) => s.position)];
  for (const s of stars) {
    assert.ok(s.position[0] >= -8 && s.position[0] <= 8);
    assert.ok(s.position[1] >= -5 && s.position[1] <= 5);
  }
  for (let i = 0; i < all.length; i++)
    for (let j = i + 1; j < all.length; j++) assert.ok(distance(all[i], all[j]) >= 0.8 - 1e-9);
});

test("edges join known stars, with no self links, duplicates or long jumps", () => {
  const { stars, edges } = buildSky(options);
  const pos = new Map<string, [number, number, number]>([
    ...options.anchors.map((a) => [a.id, a.position] as const),
    ...stars.map((s) => [s.id, s.position] as const),
  ]);
  const keys = new Set<string>();
  for (const [a, b] of edges) {
    assert.ok(pos.has(a) && pos.has(b) && a !== b);
    assert.ok(distance(pos.get(a)!, pos.get(b)!) <= 3 + 1e-9);
    const k = [a, b].sort().join("|");
    assert.ok(!keys.has(k));
    keys.add(k);
  }
  assert.ok(edges.length > stars.length / 2);
});

test("thinning removes most stars on the left", () => {
  const thin = buildSky({ ...options, thinLeft: { x: -2, keep: 0.1 } }).stars;
  const left = thin.filter((s) => s.position[0] < -2).length;
  const base = buildSky(options).stars.filter((s) => s.position[0] < -2).length;
  assert.ok(left < base);
});

test("lines form chains and branches, never triangles", () => {
  const { edges } = buildSky(options);
  const adj = new Map<string, Set<string>>();
  for (const [a, b] of edges) {
    (adj.get(a) ?? adj.set(a, new Set()).get(a)!).add(b);
    (adj.get(b) ?? adj.set(b, new Set()).get(b)!).add(a);
  }
  for (const [a, b] of edges) {
    const common = [...adj.get(a)!].filter((n) => adj.get(b)!.has(n));
    assert.equal(common.length, 0);
  }
});

test("scatter places every star, even when they cannot all keep the requested gap", async () => {
  const { scatter } = await import("./sky.ts");
  const bounds = { x: [-6.5, 6.5], y: [-3.6, 3.6], z: [-1.2, 1.2] } as const;
  for (const n of [3, 5, 6, 8, 12]) {
    const spots = scatter(n, 23, { x: [...bounds.x], y: [...bounds.y], z: [...bounds.z] }, 4.3, [[-0.6, -0.2, 0.3]]);
    assert.equal(spots.length, n, `n=${n}`);
    for (const p of spots) {
      assert.ok(p[0] >= -6.5 && p[0] <= 6.5 && p[1] >= -3.6 && p[1] <= 3.6, "inside bounds");
    }
    assert.equal(new Set(spots.map((p) => p.join(","))).size, n, "all distinct");
  }
});

test("scatter is deterministic", async () => {
  const { scatter } = await import("./sky.ts");
  const b = { x: [-5, 5] as [number, number], y: [-3, 3] as [number, number], z: [-1, 1] as [number, number] };
  assert.deepEqual(scatter(6, 9, b, 3), scatter(6, 9, b, 3));
});
