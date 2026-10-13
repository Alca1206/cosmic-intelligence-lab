"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { proximity } from "./glow";
import type { SceneContext } from "./types";
import { allStars, type UniverseGraph } from "@/data/universe";

const vertexShader = /* glsl */ `
  attribute float aSize;
  attribute float aGlow;
  attribute float aPhase;
  attribute vec3 aColor;
  uniform float uPx;
  uniform float uTime;
  varying float vGlow;
  varying float vTwinkle;
  varying float vPx;
  varying vec3 vColor;
  void main() {
    vGlow = aGlow;
    vColor = aColor;
    // Only some stars twinkle, each at its own pace; the rest shine steadily.
    float speed = 0.7 + fract(aPhase * 3.1) * 1.9;
    float depth = fract(aPhase * 7.7) > 0.68 ? 0.3 : 0.05;
    vTwinkle = 1.0 - depth + depth * sin(uTime * speed + aPhase);
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = max(aSize * (1.0 + aGlow * 0.5) * uPx / -mv.z * 1.7, 3.0);
    vPx = gl_PointSize;
    gl_Position = projectionMatrix * mv;
  }
`;

const fragmentShader = /* glsl */ `
  varying float vGlow;
  varying float vTwinkle;
  varying float vPx;
  varying vec3 vColor;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    // A small sharp core (about one pixel) with a faint halo around it.
    float coreR = clamp(1.0 / vPx, 0.05, 0.4);
    float core = smoothstep(coreR * 1.6, 0.0, d);
    float halo = pow(max(0.0, 1.0 - d * 2.0), 3.0) * 0.3;
    float alpha = (core + halo) * (0.7 + 0.5 * vGlow) * vTwinkle;
    vec3 color = mix(vColor, vec3(1.0), core * 0.55 + vGlow * 0.5);
    gl_FragColor = vec4(color, alpha);
  }
`;

// Star colours by temperature: mostly white and blue-white, a few pale yellow and orange.
const TEMPERATURES: { color: THREE.Color; weight: number }[] = [
  { color: new THREE.Color("#a9c4ff"), weight: 3 },
  { color: new THREE.Color("#d7e3ff"), weight: 4 },
  { color: new THREE.Color("#f6f4ff"), weight: 4 },
  { color: new THREE.Color("#ffe6bd"), weight: 1.4 },
  { color: new THREE.Color("#ffbf8a"), weight: 0.7 },
];

function temperature(i: number): THREE.Color {
  const total = TEMPERATURES.reduce((a, t) => a + t.weight, 0);
  let x = ((Math.sin(i * 12.9898) * 43758.5453) % 1 + 1) % 1 * total;
  for (const t of TEMPERATURES) {
    x -= t.weight;
    if (x <= 0) return t.color;
  }
  return TEMPERATURES[0].color;
}

// The decorative sky: small stars, the lines between every star, and faint nebula
// patches. Stars and lines near the cursor brighten.
export default function SkyField({ graph, ctx }: { graph: UniverseGraph; ctx: SceneContext }) {
  const stars = useMemo(() => allStars(graph), [graph]);

  const pointsRef = useRef<THREE.Points>(null);
  const linesRef = useRef<THREE.LineSegments>(null);
  const glowValues = useRef<Float32Array | null>(null);

  const { points, lines, endpoints } = useMemo(() => {
    const decor = graph.decor;
    const positions = new Float32Array(decor.length * 3);
    const sizes = new Float32Array(decor.length);
    const phases = new Float32Array(decor.length);
    const tints = new Float32Array(decor.length * 3);
    decor.forEach((s, i) => {
      positions.set(s.position, i * 3);
      sizes[i] = s.size;
      phases[i] = (i * 2.399) % 6.283;
      const t = temperature(i);
      tints.set([t.r, t.g, t.b], i * 3);
    });
    const pg = new THREE.BufferGeometry();
    pg.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    pg.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
    pg.setAttribute("aColor", new THREE.BufferAttribute(tints, 3));
    pg.setAttribute("aPhase", new THREE.BufferAttribute(phases, 1));
    pg.setAttribute("aGlow", new THREE.BufferAttribute(new Float32Array(decor.length), 1));
    const u = { uPx: { value: 800 }, uTime: { value: 0 } };
    const mat = new THREE.ShaderMaterial({
      uniforms: u,
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    // Index every star (real first, then decorative) so lines can be coloured per end.
    const all = [...stars.map((s) => s.position), ...decor.map((s) => s.position)];
    const index = new Map<string, number>([...stars.map((s) => s.id), ...decor.map((s) => s.id)].map((id, i) => [id, i]));
    const ends: [number, number][] = [];
    const linePositions: number[] = [];
    for (const [a, b] of graph.edges) {
      const ia = index.get(a);
      const ib = index.get(b);
      if (ia === undefined || ib === undefined) continue;
      ends.push([ia, ib]);
      linePositions.push(...all[ia], ...all[ib]);
    }
    const lg = new THREE.BufferGeometry();
    lg.setAttribute("position", new THREE.BufferAttribute(new Float32Array(linePositions), 3));
    lg.setAttribute("color", new THREE.BufferAttribute(new Float32Array(ends.length * 6), 3));
    const lm = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    return {
      points: new THREE.Points(pg, mat),
      lines: new THREE.LineSegments(lg, lm),
      endpoints: { ends, all },
    };
  }, [graph, stars]);

  useFrame((state) => {
    const pts = pointsRef.current;
    const lns = linesRef.current;
    if (!pts || !lns) return;
    const { camera, size, gl, clock } = state;
    const aspect = size.width / size.height;
    const material = pts.material as THREE.ShaderMaterial;
    material.uniforms.uPx.value = size.height * gl.getPixelRatio() * 1.18;
    material.uniforms.uTime.value = ctx.reducedMotion ? 0 : clock.elapsedTime;

    const { all, ends } = endpoints;
    if (!glowValues.current || glowValues.current.length !== all.length) glowValues.current = new Float32Array(all.length);
    const glows = glowValues.current;
    for (let i = 0; i < all.length; i++) glows[i] = proximity(all[i], camera, aspect, ctx.pointer.current);

    const aGlow = pts.geometry.getAttribute("aGlow") as THREE.BufferAttribute;
    for (let i = 0; i < graph.decor.length; i++) aGlow.setX(i, glows[stars.length + i]);
    aGlow.needsUpdate = true;

    const colors = lns.geometry.getAttribute("color") as THREE.BufferAttribute;
    for (let e = 0; e < ends.length; e++) {
      const g = Math.max(glows[ends[e][0]], glows[ends[e][1]]);
      const k = 0.16 + g * 0.6; // brightness doubles as opacity (additive blending)
      for (let end = 0; end < 2; end++) colors.setXYZ(e * 2 + end, 0.5 * k, 0.65 * k, 1.0 * k);
    }
    colors.needsUpdate = true;
  });

  return (
    <group>
      <primitive ref={linesRef} object={lines} />
      <primitive ref={pointsRef} object={points} />
    </group>
  );
}
