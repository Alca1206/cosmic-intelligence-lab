"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { makeDotTexture } from "./glow";

const COUNT = 1800;

// Deterministic so the sky looks the same on every visit.
function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export default function Starfield({ reducedMotion }: { reducedMotion: boolean }) {
  const group = useRef<THREE.Group>(null);
  const dot = useMemo(() => makeDotTexture(), []);

  const geometry = useMemo(() => {
    const rand = seeded(42);
    const positions = new Float32Array(COUNT * 3);
    const colors = new Float32Array(COUNT * 3);
    const palette = [new THREE.Color("#f3f5fa"), new THREE.Color("#a9c4ff"), new THREE.Color("#ffdcae")];
    for (let i = 0; i < COUNT; i++) {
      const r = 45 + rand() * 60;
      const theta = rand() * Math.PI * 2;
      const phi = Math.acos(2 * rand() - 1);
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.cos(phi);
      positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
      const c = palette[Math.floor(rand() * 10) < 7 ? 0 : 1 + Math.floor(rand() * 2)];
      const dim = 0.25 + rand() * rand() * 0.9;
      colors[i * 3] = c.r * dim;
      colors[i * 3 + 1] = c.g * dim;
      colors[i * 3 + 2] = c.b * dim;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    g.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    return g;
  }, []);

  useFrame((_, delta) => {
    if (group.current && !reducedMotion) group.current.rotation.y += delta * 0.006;
  });

  return (
    <group ref={group}>
      <points geometry={geometry}>
        <pointsMaterial map={dot} size={0.34} sizeAttenuation vertexColors transparent opacity={0.9} depthWrite={false} />
      </points>
    </group>
  );
}
