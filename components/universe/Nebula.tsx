"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { makeSkyNebulae } from "./nebula";

// Two big, faint nebula images far behind the stars. Because they sit at different
// depths, they slide by at different speeds as the camera moves: that is the parallax.
export default function Nebula() {
  const { near, far } = useMemo(() => {
    const canvases = makeSkyNebulae();
    const texture = (c: HTMLCanvasElement) => {
      const t = new THREE.CanvasTexture(c);
      t.colorSpace = THREE.SRGBColorSpace;
      return t;
    };
    return { near: texture(canvases.near), far: texture(canvases.far) };
  }, []);

  return (
    <group>
      <mesh position={[1, 0, -50]} renderOrder={-2}>
        <planeGeometry args={[200, 112]} />
        <meshBasicMaterial map={far} transparent opacity={0.55} depthWrite={false} toneMapped={false} />
      </mesh>
      <mesh position={[1, 0, -28]} renderOrder={-1}>
        <planeGeometry args={[130, 73]} />
        <meshBasicMaterial map={near} transparent opacity={0.4} depthWrite={false} toneMapped={false} />
      </mesh>
    </group>
  );
}
