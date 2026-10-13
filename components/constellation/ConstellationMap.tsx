"use client"; // uses state for hover / focus / selection

import { useState } from "react";
import type { MouseEvent } from "react";
import { ArrowRight } from "lucide-react";
import type { ConstellationCenter, ConstellationNode } from "@/data/constellation";

type ConstellationMapProps = {
  center: ConstellationCenter;
  nodes: ConstellationNode[];
};

// Where the label sits relative to its star (full class names so Tailwind finds them).
const labelPosition = {
  top: "bottom-full left-1/2 -translate-x-1/2 -mb-1",
  bottom: "top-full left-1/2 -translate-x-1/2 -mt-1",
  left: "right-full top-1/2 -translate-y-1/2 -mr-1",
  right: "left-full top-1/2 -translate-y-1/2 -ml-1",
} as const;

const toneClasses = {
  violet: "bg-violet shadow-[0_0_16px_3px_var(--color-violet)]",
  cyan: "bg-cyan shadow-[0_0_16px_3px_var(--color-cyan)]",
} as const;

export default function ConstellationMap({ center, nodes }: ConstellationMapProps) {
  // Two kinds of attention:
  //  - highlighted: the star under the pointer or with keyboard focus (temporary)
  //  - selected: the star the visitor tapped or clicked (stays until changed)
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const activeId = highlightedId ?? selectedId;
  const active = nodes.find((node) => node.id === activeId) ?? null;

  // Mouse and keyboard: the link just works. Touch has no hover, so the first
  // tap only previews the section; tapping the same star again goes there.
  const handleNodeClick = (event: MouseEvent<HTMLAnchorElement>, id: string) => {
    const pointerType = (event.nativeEvent as PointerEvent).pointerType;
    if (pointerType === "touch" && selectedId !== id) {
      event.preventDefault();
    }
    setSelectedId(id);
  };

  return (
    <div className="@container mx-auto w-full max-w-[34rem] lg:max-w-[max(22rem,min(34rem,calc(100svh_-_20rem)))]">
      {/* The map. Hidden when the space is too narrow; the plain list below takes over. */}
      <div className="relative aspect-square w-full @max-[20rem]:hidden">
        {/* Decorative lines. They never receive clicks; the stars are real links. */}
        <svg
          aria-hidden="true"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="pointer-events-none absolute inset-0 h-full w-full"
        >
          <circle
            cx="50"
            cy="50"
            r="34"
            className="fill-none stroke-ink-muted/15"
            strokeWidth="1"
            strokeDasharray="3 6"
            vectorEffect="non-scaling-stroke"
          />
          {nodes.map((node, index) => {
            const next = nodes[(index + 1) % nodes.length];
            return (
              <line
                key={`edge-${node.id}`}
                x1={node.x}
                y1={node.y}
                x2={next.x}
                y2={next.y}
                className="stroke-ink-muted/25"
                strokeWidth="1"
                vectorEffect="non-scaling-stroke"
              />
            );
          })}
          {nodes.map((node) => (
            <line
              key={`spoke-${node.id}`}
              x1="50"
              y1="50"
              x2={node.x}
              y2={node.y}
              className={`transition-colors duration-300 ${
                activeId === node.id ? "stroke-cyan/80" : "stroke-ink-muted/20"
              }`}
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </svg>

        {/* Soft glow behind the central star */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 h-2/5 w-2/5 -translate-x-1/2 -translate-y-1/2 animate-star-pulse rounded-full"
          style={{
            background:
              "radial-gradient(circle, color-mix(in srgb, var(--color-violet) 30%, transparent), transparent 65%)",
          }}
        />

        {/* Central star: resets the map to the introduction */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <button
            type="button"
            onClick={() => setSelectedId(null)}
            aria-label={`${center.title}: introduction`}
            className="relative flex h-14 w-14 items-center justify-center rounded-full"
          >
            <span
              aria-hidden="true"
              className="block h-4 w-4 rounded-full bg-ink shadow-[0_0_22px_6px_var(--color-violet)]"
            />
            <span
              aria-hidden="true"
              className="absolute h-9 w-9 rounded-full border border-violet/50"
            />
            <span className="absolute top-full -mt-1 hidden w-28 text-center text-xs leading-tight text-ink-muted @min-[24rem]:block">
              {center.title}
            </span>
          </button>
        </div>

        {/* The five stars. Each is a real link to an existing section. */}
        {nodes.map((node, index) => {
          const isActive = activeId === node.id;
          const isSelected = selectedId === node.id;
          return (
            <div
              key={node.id}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${node.x}%`, top: `${node.y}%` }}
            >
              <a
                href={`#${node.id}`}
                aria-describedby={`${node.id}-summary`}
                aria-current={isSelected ? "true" : undefined}
                onClick={(event) => handleNodeClick(event, node.id)}
                onPointerEnter={() => setHighlightedId(node.id)}
                onPointerLeave={() => setHighlightedId(null)}
                onFocus={() => setHighlightedId(node.id)}
                onBlur={() => setHighlightedId(null)}
                className="relative flex h-11 w-11 animate-node-drift items-center justify-center rounded-full"
                style={{ animationDelay: `${index * -1.4}s` }}
              >
                <span
                  aria-hidden="true"
                  className={`block rounded-full transition-all duration-300 ${
                    isActive ? `h-4 w-4 ${toneClasses[node.tone]}` : "h-2.5 w-2.5 bg-ink-muted"
                  }`}
                />
                {isSelected && (
                  <span
                    aria-hidden="true"
                    className="absolute h-8 w-8 rounded-full border border-ink/70"
                  />
                )}
                <span
                  className={`absolute whitespace-nowrap rounded bg-space/70 px-1.5 py-0.5 text-sm font-medium transition-colors ${labelPosition[node.labelSide]} ${
                    isActive ? "text-ink" : "text-ink-muted"
                  }`}
                >
                  {node.label}
                </span>
              </a>
              <span id={`${node.id}-summary`} className="sr-only">
                {node.summary}
              </span>
            </div>
          );
        })}
      </div>

      {/* Plain list: shown only when the map would be too cramped to use comfortably */}
      <ul aria-label="Portfolio sections" className="hidden gap-2 @max-[20rem]:grid">
        {nodes.map((node) => (
          <li key={node.id}>
            <a
              href={`#${node.id}`}
              className="flex min-h-11 items-center justify-between rounded-md border border-line bg-surface px-4 text-ink hover:border-cyan"
            >
              {node.label}
              <ArrowRight size={16} aria-hidden="true" />
            </a>
          </li>
        ))}
      </ul>

      {/* Preview panel: shows the introduction, or the active star's summary */}
            <div className="mt-4 min-h-[10.5rem] rounded-lg border border-line bg-surface p-5">
        <h3 className="font-display text-lg font-semibold">
          {active ? active.label : center.title}
        </h3>
        <p className="mt-2 text-ink-muted">{active ? active.summary : center.summary}</p>
        {active ? (
          <a
            href={`#${active.id}`}
            className="mt-4 inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-cyan hover:text-ink"
          >
            Go to {active.label}
            <ArrowRight size={16} aria-hidden="true" />
          </a>
        ) : (
          <p className="mt-4 text-sm text-ink-muted">{center.hint}</p>
        )}
      </div>
    </div>
  );
}