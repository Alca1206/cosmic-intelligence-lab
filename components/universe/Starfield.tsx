"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { makeDotTexture } from "./glow";

const COUNT = 1800;
const BAND_COUNT = 2600;

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

  // The Milky Way: a dense, faint band of tiny stars (sharp points, no haze).
  const band = useMemo(() => {
    const rand = seeded(7);
    const gauss = () => (rand() + rand() + rand() + rand() - 2) / 0.58;
    const positions = new Float32Array(BAND_COUNT * 3);
    const colors = new Float32Array(BAND_COUNT * 3);
    const tint = [new THREE.Color("#cfdcff"), new THREE.Color("#f3f5fa"), new THREE.Color("#ffe3c0")];
    for (let i = 0; i < BAND_COUNT; i++) {
      const r = 60 + rand() * 40;
      const along = (rand() * 2 - 1) * 0.95;
      const lat = gauss() * 0.11;
      positions[i * 3] = r * Math.sin(along);
      positions[i * 3 + 1] = r * lat;
      positions[i * 3 + 2] = -r * Math.cos(along);
      const c = tint[Math.floor(rand() * 10) < 6 ? 0 : Math.floor(rand() * 3)];
      const dim = (0.3 + rand() * rand() * 1.1) * Math.max(0.25, 1 - Math.abs(lat) * 5);
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
      <group rotation={[0, 0, -0.42]}>
        <points geometry={band}>
          <pointsMaterial map={dot} size={0.24} sizeAttenuation vertexColors transparent opacity={1} depthWrite={false} />
        </points>
      </group>
      <points geometry={geometry}>
        <pointsMaterial map={dot} size={0.34} sizeAttenuation vertexColors transparent opacity={0.9} depthWrite={false} />
      </points>
    </group>
  );
}
