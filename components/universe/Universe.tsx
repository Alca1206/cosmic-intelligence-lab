"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import type * as THREE from "three";
import { allStars, type StarSpec, type UniverseGraph } from "@/data/universe";
import { labelsFor, type LabelSpec } from "./labels";
import type { SceneContext } from "./types";
import type { PointerState } from "./glow";

// three.js only loads in the browser, and only when this component is shown.
const UniverseScene = dynamic(() => import("./UniverseScene"), { ssr: false });

function useMedia(query: string): boolean | null {
  return useSyncExternalStore(
    (notify) => {
      const mq = window.matchMedia(query);
      mq.addEventListener("change", notify);
      return () => mq.removeEventListener("change", notify);
    },
    () => window.matchMedia(query).matches,
    () => null,
  );
}

let webglCache: boolean | null = null;
function webglSupported(): boolean {
  if (webglCache === null) {
    try {
      const canvas = document.createElement("canvas");
      webglCache = Boolean(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
    } catch {
      webglCache = false;
    }
  }
  return webglCache;
}

function labelClass(spec: LabelSpec, hovered: boolean, narrow: boolean): string {
  // On small screens labels would collide, so only key ones show (the list names everything).
  if (narrow && !hovered && spec.kind === "node") return "opacity-0";
  const tone = hovered ? "text-ink" : spec.kind === "node" ? "text-ink-muted" : "text-ink";
  const weight = spec.kind === "node" ? "text-xs" : "font-display text-sm font-medium";
  return `${weight} ${tone} transition-colors [text-shadow:0_1px_6px_#080b14,0_0_12px_#080b14]`;
}

type Props = {
  graph: UniverseGraph;
  /** "hero": fills the home page behind the text. "panel": a framed map inside a page. */
  variant?: "hero" | "panel";
};

export default function Universe({ graph, variant = "hero" }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const reduced = useMedia("(prefers-reduced-motion: reduce)");
  const wide = useMedia("(min-width: 1024px)");
  const webgl = useSyncExternalStore(
    () => () => {},
    webglSupported,
    () => null,
  );
  const hero = variant === "hero";
  const coarse = useMedia("(pointer: coarse)");

  const registry = useRef<Map<string, THREE.Object3D>>(new Map());
  const labelEls = useRef<Map<string, HTMLElement>>(new Map());
  const pointer = useRef<PointerState>({ x: 0, y: 0, inside: false });
  const pathRef = useRef(pathname);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [flyToId, setFlyToId] = useState<string | null>(null);
  const [leaving, setLeaving] = useState(false);
  // Where the visitor clicked, and where they are going. Used once, on arrival.
  const [pending, setPending] = useState<{ href: string; from: string } | null>(null);
  const [visible, setVisible] = useState(true);

  const stars = useMemo(() => allStars(graph), [graph]);
  const labels = useMemo(() => labelsFor(graph), [graph]);
  // The list: every outer star, plus the hub when it leads somewhere new (About me).
  const listItems = useMemo(
    () => (graph.hub.href === "/about" ? [...graph.nodes, { ...graph.hub, label: "About me" }] : graph.nodes),
    [graph],
  );

  const observe = useCallback((el: HTMLDivElement | null) => {
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.05 });
    io.observe(el);
  }, []);

  useEffect(() => {
    pathRef.current = pathname;
  }, [pathname]);

  // Next.js keeps the previous page alive (hidden) so Back is instant. Whenever the
  // address changes, forget any flight in progress, so coming back shows a fresh map.
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setFlyToId(null);
    setLeaving(false);
    setHoveredId(null);
    setPending(null);
  }

  // Fade out, then change page. Skipped if the visitor has already gone somewhere else.
  const go = useCallback(
    (href: string, from: string) => {
      setLeaving(true);
      window.setTimeout(() => {
        if (pathRef.current === from) router.push(href);
      }, 280);
    },
    [router],
  );

  const onSelect = useCallback(
    (target: StarSpec) => {
      if (flyToId) return;
      if (reduced || !registry.current.has(target.id)) {
        go(target.href, pathname);
        return;
      }
      setPending({ href: target.href, from: pathname });
      setHoveredId(target.id);
      setFlyToId(target.id);
    },
    [flyToId, reduced, go, pathname],
  );

  const onArrive = useCallback(() => {
    // Only continue if we are still on the page where the click happened.
    if (pending && pathRef.current === pending.from) go(pending.href, pending.from);
    setPending(null);
  }, [pending, go]);

  const ctx: SceneContext = {
    hoveredId,
    onHover: setHoveredId,
    onSelect,
    registry,
    pointer,
    reducedMotion: Boolean(reduced),
  };

  const hovered = stars.find((s) => s.id === hoveredId) ?? null;
  const frameloop = !visible ? "never" : reduced ? "demand" : "always";
  const hint = hovered ? (
    <>
      <strong className="text-ink">{hovered.label}</strong> · {hovered.summary}
    </>
  ) : webgl ? (
    (coarse ? "Tap a bright star to fly there." : "Move your mouse over the sky. Click a bright star to fly there.")
  ) : (
    "Choose a destination."
  );

  const linkClass = (id: string) =>
    `block rounded-md border px-2.5 py-1 text-xs transition-colors ${
      hoveredId === id
        ? "border-cyan bg-space text-ink"
        : "border-line bg-space/70 text-ink-muted hover:border-cyan hover:text-ink"
    }`;

  const listLink = (s: StarSpec, className: string, children: React.ReactNode) => (
    <Link
      href={s.href}
      onClick={(e) => {
        e.preventDefault();
        onSelect(s);
      }}
      onMouseEnter={() => setHoveredId(s.id)}
      onMouseLeave={() => setHoveredId(null)}
      onFocus={() => setHoveredId(s.id)}
      onBlur={() => setHoveredId(null)}
      className={className}
    >
      {children}
    </Link>
  );

  return (
    <div ref={observe} className={`relative flex w-full flex-col ${hero ? "lg:h-full" : ""}`}>
      {webgl ? (
        <div
          className={
            hero
              ? "relative h-[26rem] w-full sm:h-[32rem] lg:absolute lg:inset-0 lg:h-auto"
              : "relative h-[24rem] w-full overflow-hidden rounded-lg border border-line bg-space/40 sm:h-[30rem]"
          }
          style={{ cursor: hoveredId ? "pointer" : "default", touchAction: "pan-y" }}
          onPointerMove={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            pointer.current = {
              x: ((e.clientX - r.left) / r.width) * 2 - 1,
              y: -(((e.clientY - r.top) / r.height) * 2 - 1),
              inside: true,
            };
          }}
          onPointerLeave={() => {
            pointer.current = { ...pointer.current, inside: false };
          }}
        >
          <UniverseScene
            graph={graph}
            labels={labels}
            ctx={ctx}
            flyToId={flyToId}
            onArrive={onArrive}
            frameloop={frameloop}
            offsetRight={hero && Boolean(wide)}
            narrow={!wide}
            labelEls={labelEls}
          />
          {/* Labels follow their stars; positions are set every frame by LabelDriver */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
            {labels.map((spec) => (
              <span
                key={spec.id}
                ref={(el) => {
                  if (el) labelEls.current.set(spec.id, el);
                  else labelEls.current.delete(spec.id);
                }}
                className={`invisible absolute left-0 top-0 whitespace-nowrap ${labelClass(spec, hoveredId === spec.id, !wide)}`}
              >
                {spec.text}
              </span>
            ))}
          </div>
        </div>
      ) : webgl === false ? (
        <p className="px-6 py-6 text-center text-sm text-ink-muted">
          Your browser can&apos;t show the 3D map, so here are the same destinations as links.
        </p>
      ) : null}

      {hero ? (
        <div className="relative flex flex-col items-center gap-2 px-4 pb-8 pt-2 lg:pointer-events-none lg:absolute lg:inset-x-0 lg:bottom-3 lg:items-end lg:px-8 lg:pb-0">
          <p className="text-center text-xs text-ink-muted lg:text-right" aria-live="polite">
            {hint}
          </p>
          <nav aria-label="Destinations" className="pointer-events-auto">
            <ul className="flex max-w-3xl flex-wrap justify-center gap-1.5 lg:justify-end">
              {listItems.map((s) => (
                <li key={s.id}>{listLink(s, linkClass(s.id), s.label)}</li>
              ))}
            </ul>
          </nav>
        </div>
      ) : (
        <div className="mt-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {graph.back && (
              <Link
                href={graph.back.href}
                className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink"
              >
                <ArrowLeft size={16} aria-hidden="true" />
                {graph.back.label}
              </Link>
            )}
            {graph.legend && (
              <ul aria-label="Colour key" className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-muted">
                {graph.legend.map((l) => (
                  <li key={l.label} className="flex items-center gap-1.5">
                    <span className="size-2.5 rounded-full" style={{ background: l.color }} aria-hidden="true" />
                    {l.label}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <p className="mt-3 text-sm text-ink-muted" aria-live="polite">
            {hint}
          </p>
        </div>
      )}

      {/* Fades to the page colour just before the route changes */}
      <div
        aria-hidden="true"
        className={`pointer-events-none fixed inset-0 z-[60] bg-space transition-opacity duration-300 ${
          leaving ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
}
