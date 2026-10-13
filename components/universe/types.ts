import type { MutableRefObject } from "react";
import type * as THREE from "three";
import type { StarSpec } from "@/data/universe";
import type { PointerState } from "./glow";

/** Shared between the scene objects: who is hovered, and how to select. */
export type SceneContext = {
  hoveredId: string | null;
  onHover: (id: string | null) => void;
  onSelect: (target: StarSpec) => void;
  /** Lets the camera find where each star is. */
  registry: MutableRefObject<Map<string, THREE.Object3D>>;
  /** Cursor position over the map (kept outside React, because it changes every frame) */
  pointer: MutableRefObject<PointerState>;
  reducedMotion: boolean;
};
