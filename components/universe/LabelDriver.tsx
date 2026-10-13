"use client";

import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { LabelSpec } from "./labels";
import type { SceneContext } from "./types";

const world = new THREE.Vector3();

// Runs inside the 3D scene: every frame, works out where each object appears on
// screen and moves its HTML label there. It never creates or removes DOM nodes.
export default function LabelDriver({
  registry,
  labelEls,
  labels,
}: {
  labels: LabelSpec[];
  registry: SceneContext["registry"];
  labelEls: React.MutableRefObject<Map<string, HTMLElement>>;
}) {
  useFrame((state) => {
    const { camera, size } = state;
    for (const spec of labels) {
      const el = labelEls.current.get(spec.id);
      const object = registry.current.get(spec.id);
      if (!el || !object) continue;
      object.getWorldPosition(world);
      world.y += spec.lift;
      world.project(camera);
      const behind = world.z > 1;
      const x = (world.x * 0.5 + 0.5) * size.width;
      const y = (-world.y * 0.5 + 0.5) * size.height;
      el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) translate(-50%, -100%)`;
      el.style.visibility = behind ? "hidden" : "visible";
    }
  });
  return null;
}
