"use client";

import { useMemo, useRef } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import { makeStarTexture, proximity } from "./glow";
import type { SceneContext } from "./types";
import type { StarSpec } from "@/data/universe";

// One real (clickable) star: a bright core, a soft glow, and an invisible larger
// sphere that makes it easy to hit with a mouse or finger.
export default function StarNode({ spec, ctx }: { spec: StarSpec; ctx: SceneContext }) {
  const group = useRef<THREE.Group>(null);
  const halo = useRef<THREE.SpriteMaterial>(null);
  const hovered = ctx.hoveredId === spec.id;
  const glow = useMemo(() => makeStarTexture(), []);
  const phase = useMemo(() => spec.position[0] * 1.7 + spec.position[1], [spec.position]);
  const glowScale = spec.kind === "hub" ? 6.2 : spec.kind === "featured" ? 5.6 : 4.8;
  const tint = useMemo(() => new THREE.Color(spec.color).lerp(new THREE.Color("#ffffff"), 0.55), [spec.color]);

  useFrame((state) => {
    if (!group.current) return;
    const near = proximity(spec.position, state.camera, state.size.width / state.size.height, ctx.pointer.current);
    const pulse = ctx.reducedMotion ? 1 : 1 + Math.sin(state.clock.elapsedTime * 1.5 + phase) * 0.07;
    const s = (hovered ? 1.3 : 1 + near * 0.18) * pulse;
    group.current.scale.lerp(new THREE.Vector3(s, s, s), 0.18);
    if (halo.current) halo.current.opacity = Math.min(1, (hovered ? 1 : 0.85) + near * 0.2);
  });

  const stop = (e: ThreeEvent<PointerEvent | MouseEvent>) => e.stopPropagation();

  return (
    <group
      ref={(node) => {
        group.current = node;
        const map = ctx.registry.current;
        if (node) map.set(spec.id, node);
        else map.delete(spec.id);
      }}
      position={spec.position}
    >
      <sprite scale={[glowScale * spec.size * 2, glowScale * spec.size * 2, 1]}>
        <spriteMaterial
          ref={halo}
          map={glow}
          color={spec.color}
          transparent
          opacity={0.6}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </sprite>
      <mesh>
        <sphereGeometry args={[spec.size * 0.3, 20, 20]} />
        <meshBasicMaterial color={tint} />
      </mesh>
      <mesh
        visible={false}
        onPointerOver={(e) => {
          stop(e);
          ctx.onHover(spec.id);
        }}
        onPointerOut={() => ctx.onHover(null)}
        onClick={(e) => {
          stop(e);
          ctx.onSelect(spec);
        }}
      >
        <sphereGeometry args={[Math.max(spec.size * 2.4, 0.9), 12, 12]} />
      </mesh>
    </group>
  );
}
