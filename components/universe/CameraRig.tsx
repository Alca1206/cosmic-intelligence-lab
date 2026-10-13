"use client";

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { SceneContext } from "./types";

type Props = {
  registry: SceneContext["registry"];
  pointer: SceneContext["pointer"];
  /** id of the star to fly to, or null for the resting view */
  flyToId: string | null;
  onArrive: () => void;
  reducedMotion: boolean;
  /** How far the camera sits from the middle of the map */
  distance: number;
  /** Shift the scene toward the right-hand side (used when text sits on the left). */
  offsetRight: boolean;
};

const FLIGHT_SECONDS = 1.1;
const MAX_YAW = 0.2; // radians the sky may turn left/right as the cursor moves
const MAX_PITCH = 0.12;
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

// Camera control without OrbitControls: the view tilts slightly with the cursor
// (parallax) and drifts on its own when there is no cursor. It never needs to be
// "reset", because every frame it simply eases toward where it should be. That also
// means coming back to the page after a flight zooms smoothly back out.
export default function CameraRig({ registry, pointer, flyToId, onArrive, reducedMotion, distance, offsetRight }: Props) {
  const { camera, size } = useThree();
  const look = useRef(new THREE.Vector3());
  const flight = useRef<{ t: number; fromPos: THREE.Vector3; fromLook: THREE.Vector3; done: boolean } | null>(null);

  useEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    if (offsetRight) cam.setViewOffset(size.width, size.height, -size.width * 0.2, 0, size.width, size.height);
    else cam.clearViewOffset();
    cam.updateProjectionMatrix();
  }, [camera, size, offsetRight]);

  useFrame((state, delta) => {
    if (flyToId) {
      if (!flight.current) {
        flight.current = { t: 0, fromPos: camera.position.clone(), fromLook: look.current.clone(), done: false };
      }
      const f = flight.current;
      if (f.done) return;
      const object = registry.current.get(flyToId);
      if (!object) return;
      f.t = Math.min(f.t + delta / FLIGHT_SECONDS, 1);
      const k = ease(f.t);
      const target = new THREE.Vector3();
      object.getWorldPosition(target);
      // Stop a short distance in front of the star, on the side the camera started from.
      const stop = target.clone().add(f.fromPos.clone().sub(target).normalize().multiplyScalar(2.4));
      camera.position.lerpVectors(f.fromPos, stop, k);
      look.current.lerpVectors(f.fromLook, target, k);
      camera.lookAt(look.current);
      if (f.t >= 1) {
        f.done = true;
        onArrive();
      }
      return;
    }
    flight.current = null;

    // Resting view with parallax. With reduced motion the sky stays still.
    const t = state.clock.elapsedTime;
    const p = pointer.current;
    let yaw = 0;
    let pitch = 0;
    if (!reducedMotion) {
      yaw = p.inside ? p.x * MAX_YAW : Math.sin(t * 0.18) * 0.07;
      pitch = p.inside ? p.y * MAX_PITCH : Math.cos(t * 0.13) * 0.035;
    }
    const desired = new THREE.Vector3(
      Math.sin(yaw) * Math.cos(pitch),
      Math.sin(pitch),
      Math.cos(yaw) * Math.cos(pitch),
    ).multiplyScalar(distance);
    const k = reducedMotion ? 1 : 1 - Math.pow(0.001, delta); // frame-rate independent easing
    camera.position.lerp(desired, k * 0.9);
    look.current.lerp(new THREE.Vector3(0, 0, 0), k * 0.9);
    camera.lookAt(look.current);
  });

  return null;
}
