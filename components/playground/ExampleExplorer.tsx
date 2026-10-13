"use client";

import { useState } from "react";
import DigitImage from "./DigitImage";
import { filterPredictions, topClasses, type ExampleFilter } from "@/lib/ml/predictions";
import type { Prediction } from "@/lib/ml/types";

const FILTERS: { id: ExampleFilter; label: string; empty: string }[] = [
  { id: "all", label: "All", empty: "There are no examples." },
  { id: "incorrect", label: "Wrong", empty: "The model got none of these wrong." },
  {
    id: "confident-incorrect",
    label: "Confidently wrong (≥90%)",
    empty: "At this temperature no wrong prediction reaches 90% confidence.",
  },
  { id: "uncertain", label: "Uncertain (<60%)", empty: "At this temperature no prediction is below 60% confidence." },
];

const PAGE = 24;
const pct = (v: number) => `${(v * 100).toFixed(1)}%`;

type Props = { predictions: Prediction[]; pixels: string[]; sourceIndex: number[] };

export default function ExampleExplorer({ predictions, pixels, sourceIndex }: Props) {
  const [filter, setFilter] = useState<ExampleFilter>("incorrect");
  const [selected, setSelected] = useState(0);
  const [shown, setShown] = useState(PAGE);

  const list = filterPredictions(predictions, filter);
  const visible = list.slice(0, shown);
  const active = list.find((p) => p.index === selected) ?? list[0] ?? null;
  const spec = FILTERS.find((f) => f.id === filter)!;

  return (
    <div>
      <div role="group" aria-label="Which examples to show" className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            aria-pressed={filter === f.id}
            onClick={() => {
              setFilter(f.id);
              setShown(PAGE);
            }}
            className={`rounded-md border px-3 py-1.5 text-sm transition-colors ${
              filter === f.id ? "border-cyan text-cyan" : "border-line text-ink-muted hover:border-cyan hover:text-ink"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <p className="mt-3 text-sm text-ink-muted" aria-live="polite">
        {list.length.toLocaleString()} of {predictions.length.toLocaleString()} held-out images match.
      </p>

      {list.length === 0 || !active ? (
        <p className="mt-4 rounded-md border border-dashed border-line p-4 text-ink-muted">{spec.empty}</p>
      ) : (
        <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_18rem]">
          <div>
            <ul className="grid grid-cols-[repeat(auto-fill,minmax(4.25rem,1fr))] gap-2">
              {visible.map((p) => (
                <li key={p.index}>
                  <button
                    type="button"
                    aria-pressed={p.index === active.index}
                    aria-label={`Example ${p.index + 1}: true digit ${p.label}, predicted ${p.predicted} with ${pct(p.confidence)} confidence`}
                    onClick={() => setSelected(p.index)}
                    className={`block w-full rounded-md border p-1.5 text-center transition-colors ${
                      p.index === active.index ? "border-cyan" : "border-line hover:border-ink-muted"
                    }`}
                  >
                    <DigitImage pixels={pixels[p.index]} className="mx-auto w-full" />
                    <span className={`mt-1 block text-xs ${p.correct ? "text-ink-muted" : "text-violet"}`}>
                      {p.label} → {p.predicted}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
            {visible.length < list.length && (
              <button
                type="button"
                onClick={() => setShown((n) => n + PAGE)}
                className="mt-3 rounded-md border border-line px-3 py-1.5 text-sm text-ink hover:border-cyan hover:text-cyan"
              >
                Show more ({list.length - visible.length} left)
              </button>
            )}
          </div>

          <div className="rounded-lg border border-line bg-space p-4" aria-live="polite">
            <DigitImage pixels={pixels[active.index]} className="mx-auto w-40" />
            <p className="mt-3 text-sm">
              <span className="text-ink-muted">True digit </span>
              <strong>{active.label}</strong>
              <span className="text-ink-muted"> · predicted </span>
              <strong className={active.correct ? "text-cyan" : "text-violet"}>{active.predicted}</strong>
              <span className="text-ink-muted"> · {active.correct ? "correct" : "wrong"}</span>
            </p>
            <p className="mt-1 text-xs text-ink-muted">
              Test example {active.index + 1} (scikit-learn digits image #{sourceIndex[active.index]})
            </p>
            <ol className="mt-3 space-y-1.5" aria-label="Three most likely digits">
              {topClasses(active.probs, 3).map(({ cls, prob }) => (
                <li key={cls} className="flex items-center gap-2 text-sm">
                  <span className="w-4 tabular-nums">{cls}</span>
                  <span className="h-2 flex-1 overflow-hidden rounded bg-line" aria-hidden="true">
                    <span className="block h-full bg-violet" style={{ width: `${prob * 100}%` }} />
                  </span>
                  <span className="w-14 text-right tabular-nums">{pct(prob)}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}
