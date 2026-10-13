"use client"; // uses <canvas>, timers, and browser media queries

import { useEffect, useRef } from "react";

type Star = {
  x: number;
  y: number;
  radius: number;
  baseAlpha: number; // brightness
  twinkleSpeed: number;
  twinklePhase: number;
  drift: number; // slow upward movement, px per ms
};

type Node = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string; // "r,g,b"
};

const STAR_RGB = "243,245,250";
const NODE_COLORS = ["155,140,255", "85,214,232"]; // violet, cyan
const LINK_DISTANCE = 170; // nodes closer than this get a line
const FRAME_INTERVAL = 1000 / 30; // motion is slow, so 30fps is plenty

export default function CosmicBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    // Very weak devices get a still sky instead of an animated one.
    const lowPower =
      typeof navigator.hardwareConcurrency === "number" &&
      navigator.hardwareConcurrency <= 2;

    let width = 0;
    let height = 0;
    let stars: Star[] = [];
    let nodes: Node[] = [];
    let frameId = 0;
    let lastTime = 0;

    // Create stars and nodes sized for the current screen.
    const setup = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2); // cap for sharpness vs. cost
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const small = width < 640;
      const starCount = Math.min(Math.round((width * height) / 9000), small ? 70 : 140);
      const nodeCount = small ? 8 : 14;

      stars = Array.from({ length: starCount }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: 0.4 + Math.random() * 1.1,
        baseAlpha: 0.25 + Math.random() * 0.6,
        twinkleSpeed: 0.0004 + Math.random() * 0.0008,
        twinklePhase: Math.random() * Math.PI * 2,
        drift: 0.002 + Math.random() * 0.004,
      }));

      nodes = Array.from({ length: nodeCount }, (_, i) => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.012,
        vy: (Math.random() - 0.5) * 0.012,
        color: NODE_COLORS[i % NODE_COLORS.length],
      }));
    };

    // Move everything a tiny bit. dt = milliseconds since the last frame.
    const update = (dt: number) => {
      for (const star of stars) {
        star.y -= star.drift * dt;
        if (star.y < -2) star.y = height + 2;
      }
      for (const node of nodes) {
        node.x += node.vx * dt;
        node.y += node.vy * dt;
        if (node.x < -20) node.x = width + 20;
        if (node.x > width + 20) node.x = -20;
        if (node.y < -20) node.y = height + 20;
        if (node.y > height + 20) node.y = -20;
      }
    };

    const draw = (time: number, animated: boolean) => {
      ctx.clearRect(0, 0, width, height);

      for (const star of stars) {
        const twinkle = animated
          ? 0.5 + 0.5 * Math.sin(time * star.twinkleSpeed + star.twinklePhase)
          : 0.75;
        const alpha = star.baseAlpha * (0.6 + 0.4 * twinkle);
        ctx.fillStyle = `rgba(${STAR_RGB},${alpha})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      // Faint lines between nearby nodes: the "constellation / network" idea.
      ctx.lineWidth = 1;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const distance = Math.hypot(dx, dy);
          if (distance < LINK_DISTANCE) {
            const alpha = (1 - distance / LINK_DISTANCE) * 0.22;
            ctx.strokeStyle = `rgba(155,140,255,${alpha})`;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      for (const node of nodes) {
        ctx.fillStyle = `rgba(${node.color},0.7)`;
        ctx.beginPath();
        ctx.arc(node.x, node.y, 1.8, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const loop = (time: number) => {
      frameId = requestAnimationFrame(loop);
      if (time - lastTime < FRAME_INTERVAL) return; // skip frames to save CPU
      const dt = lastTime === 0 ? 0 : Math.min(time - lastTime, 100);
      lastTime = time;
      update(dt);
      draw(time, true);
    };

    const start = () => {
      if (frameId === 0) {
        lastTime = 0;
        frameId = requestAnimationFrame(loop);
      }
    };

    const stop = () => {
      cancelAnimationFrame(frameId);
      frameId = 0;
    };

    // Either animate, or paint one still frame (reduced motion / weak device).
    const applyMotionPreference = () => {
      if (motionQuery.matches || lowPower) {
        stop();
        draw(0, false);
      } else {
        start();
      }
    };

    // Phones fire "resize" when the address bar hides while scrolling.
    // Ignore small height-only changes so the stars don't reshuffle.
    const onResize = () => {
      const widthChanged = window.innerWidth !== width;
      const heightChangedALot = Math.abs(window.innerHeight - height) > 150;
      if (!widthChanged && !heightChangedALot) return;
      setup();
      if (frameId === 0) draw(0, false);
    };

    setup();
    applyMotionPreference();
    motionQuery.addEventListener("change", applyMotionPreference);
    window.addEventListener("resize", onResize);

    return () => {
      stop();
      motionQuery.removeEventListener("change", applyMotionPreference);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    // Decorative only: hidden from screen readers and can never intercept clicks.
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0">
      {/* Soft atmospheric glow, built from our color tokens */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(55rem 38rem at 12% 0%, rgba(110, 96, 220, 0.10), transparent 65%),
            radial-gradient(50rem 36rem at 92% 100%, rgba(60, 120, 210, 0.08), transparent 65%),
            radial-gradient(34rem 24rem at 100% 8%, rgba(170, 60, 140, 0.05), transparent 70%),
            radial-gradient(30rem 22rem at 0% 100%, rgba(190, 120, 60, 0.035), transparent 70%)`,
        }}
      />
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
    </div>
  );
}