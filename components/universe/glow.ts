import * as THREE from "three";

/** A soft round glow (white centre fading to transparent), tinted by the material colour. */
export function makeGlowTexture(size = 128): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.25, "rgba(255,255,255,0.45)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(canvas);
}

/**
 * A star as seen through a telescope: a tiny sharp core, a soft halo, and a thin
 * four-point diffraction spike. Tinted by the material colour.
 */
export function makeStarTexture(size = 256): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const c = size / 2;
  const halo = ctx.createRadialGradient(c, c, 0, c, c, c);
  halo.addColorStop(0, "rgba(255,255,255,1)");
  halo.addColorStop(0.035, "rgba(255,255,255,0.95)");
  halo.addColorStop(0.07, "rgba(255,255,255,0.3)");
  halo.addColorStop(0.18, "rgba(255,255,255,0.04)");
  halo.addColorStop(0.4, "rgba(255,255,255,0)");
  halo.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = halo;
  ctx.fillRect(0, 0, size, size);

  ctx.globalCompositeOperation = "lighter";
  for (const [sx, sy] of [
    [1, 0.014],
    [0.014, 1],
  ]) {
    ctx.save();
    ctx.translate(c, c);
    ctx.scale(sx, sy);
    const spike = ctx.createRadialGradient(0, 0, 0, 0, 0, c);
    spike.addColorStop(0, "rgba(255,255,255,0.9)");
    spike.addColorStop(0.35, "rgba(255,255,255,0.28)");
    spike.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = spike;
    ctx.fillRect(-c, -c, size, size);
    ctx.restore();
  }
  return new THREE.CanvasTexture(canvas);
}

/** A tiny round dot with a soft edge, for the distant star field. */
export function makeDotTexture(size = 32): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.3, "rgba(255,255,255,0.7)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(canvas);
}

const v = new THREE.Vector3();

/** Where the cursor is, in screen space, as -1..1 (like WebGL clip space). */
export type PointerState = { x: number; y: number; inside: boolean };

/**
 * How strongly the cursor is "near" a point in the scene: 1 right under it, 0 beyond
 * about a third of the screen height. Used to brighten nearby stars and lines.
 */
export function proximity(
  position: readonly [number, number, number],
  camera: THREE.Camera,
  aspect: number,
  pointer: PointerState,
): number {
  if (!pointer.inside) return 0;
  v.set(position[0], position[1], position[2]).project(camera);
  if (v.z > 1) return 0;
  const d = Math.hypot((v.x - pointer.x) * aspect, v.y - pointer.y);
  return Math.max(0, 1 - d / 0.38);
}
