"use client";

import { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import CameraRig from "./CameraRig";
import LabelDriver from "./LabelDriver";
import SkyField from "./SkyField";
import StarNode from "./StarNode";
import Starfield from "./Starfield";
import type { SceneContext } from "./types";
import { allStars, type UniverseGraph } from "@/data/universe";
import type { LabelSpec } from "./labels";

type Props = {
  graph: UniverseGraph;
  labels: LabelSpec[];
  ctx: SceneContext;
  flyToId: string | null;
  onArrive: () => void;
  /** "always" while visible and motion is OK, "demand" for reduced motion, "never" off-screen */
  frameloop: "always" | "demand" | "never";
  offsetRight: boolean;
  /** Phones and small tablets: pull the camera back so everything fits. */
  narrow: boolean;
  labelEls: React.MutableRefObject<Map<string, HTMLElement>>;
};

export default function UniverseScene({ graph, labels, ctx, flyToId, onArrive, frameloop, offsetRight, narrow, labelEls }: Props) {
  const stars = useMemo(() => allStars(graph), [graph]);
  const distance = graph.distance * (narrow ? 1.3 : 1);

  return (
    <Canvas
      frameloop={frameloop}
      dpr={[1, 1.75]}
      camera={{ position: [0, 0, distance], fov: 46, near: 0.1, far: 400 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      aria-hidden="true"
    >
      <Starfield reducedMotion={ctx.reducedMotion} />
      <SkyField graph={graph} ctx={ctx} />
      {stars.map((s) => (
        <StarNode key={s.id} spec={s} ctx={ctx} />
      ))}
      <LabelDriver registry={ctx.registry} labelEls={labelEls} labels={labels} />
      <CameraRig
        registry={ctx.registry}
        pointer={ctx.pointer}
        flyToId={flyToId}
        onArrive={onArrive}
        reducedMotion={ctx.reducedMotion}
        distance={distance}
        offsetRight={offsetRight}
      />
    </Canvas>
  );
}
