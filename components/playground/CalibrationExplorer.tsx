"use client";

import { useMemo, useState } from "react";
import ReliabilityDiagram from "./ReliabilityDiagram";
import ConfidenceHistogram from "./ConfidenceHistogram";
import MetricsPanel from "./MetricsPanel";
import ExampleExplorer from "./ExampleExplorer";
import { explainer, metricDefinitions } from "@/data/playground";
import { computeMetrics, confidenceHistogram, reliabilityBins } from "@/lib/ml/metrics";
import { predictAll } from "@/lib/ml/predictions";
import { softmaxAll } from "@/lib/ml/softmax";
import {
  MAX_TEMPERATURE, MIN_TEMPERATURE, SLIDER_STEPS, parseTemperature, sliderToTemperature, temperatureToSlider,
} from "@/lib/ml/temperature";
import type { CalibrationDataset } from "@/lib/ml/types";

const BIN_CHOICES = [5, 10, 15, 20];
const fmtT = (t: number) => (Math.round(t * 100) / 100).toString();

export default function CalibrationExplorer({ data }: { data: CalibrationDataset }) {
  const fittedT = data.meta.calibration.fittedTemperature;
  const { logits, labels, pixels, sourceIndex } = data.test;

  const [temperature, setTemperature] = useState(1);
  const [text, setText] = useState("1");
  const [error, setError] = useState<string | null>(null);
  const [binCount, setBinCount] = useState(10);

  const set = (t: number) => {
    setTemperature(t);
    setText(fmtT(t));
    setError(null);
  };

  // Everything below is recomputed live in the browser from the stored logits.
  const computed = useMemo(() => {
    const probs = softmaxAll(logits, temperature);
    return {
      probs,
      current: computeMetrics(probs, labels, binCount),
      raw: computeMetrics(softmaxAll(logits, 1), labels, binCount),
      fitted: computeMetrics(softmaxAll(logits, fittedT), labels, binCount),
      bins: reliabilityBins(probs, labels, binCount),
      histogram: confidenceHistogram(probs, binCount),
      predictions: predictAll(logits, labels, temperature),
    };
  }, [logits, labels, temperature, binCount, fittedT]);

  const { current } = computed;
  const gap = current.meanConfidence - current.accuracy;
  const verdict =
    Math.abs(gap) < 0.01
      ? "Confidence matches accuracy closely: the model is well calibrated overall."
      : gap > 0
        ? `Over-confident: it claims ${(current.meanConfidence * 100).toFixed(1)}% on average but is right ${(current.accuracy * 100).toFixed(1)}% of the time.`
        : `Under-confident: it claims only ${(current.meanConfidence * 100).toFixed(1)}% on average but is right ${(current.accuracy * 100).toFixed(1)}% of the time.`;

  const label = `temperature ${fmtT(temperature)}`;
  const m = data.meta;
  const rb = data.robustness;

  return (
    <div className="space-y-10">
      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <div className="space-y-4 text-ink-muted">
          <p><strong className="text-ink">Model. </strong>{explainer.model}</p>
          <p><strong className="text-ink">Dataset. </strong>{explainer.dataset}</p>
          <p><strong className="text-ink">Inputs. </strong>{explainer.inputs}</p>
          <p><strong className="text-ink">Outputs. </strong>{explainer.outputs}</p>
        </div>
        <div className="rounded-lg border border-cyan/40 bg-space p-4 text-sm text-ink-muted">
          <p className="font-medium text-ink">What is real, and what is computed live</p>
          <ul className="mt-2 list-disc space-y-1.5 pl-5">
            <li>
              The model was trained <strong className="text-ink">offline</strong> with {m.model.library}
              ; it is not retrained in your browser.
            </li>
            <li>
              The {labels.length.toLocaleString()} outputs shown are its stored predictions on images it never saw during
              training or tuning (<strong className="text-ink">precomputed</strong>, from the file{" "}
              <code>/ml/calibration-demo.json</code>).
            </li>
            <li>
              Temperature scaling, probabilities, every chart and every metric are{" "}
              <strong className="text-ink">computed live</strong> in your browser.
            </li>
            <li>
              Split: {m.split.train} train / {m.split.validation} validation (used to fit T) / {m.split.test} test.
              Seed {m.split.seed}. Real data, not synthetic.
            </li>
          </ul>
        </div>
      </div>

      <div className="rounded-lg border border-line bg-surface p-5 md:p-6">
        <h3 className="font-display text-xl font-semibold">1. Change the model&apos;s confidence</h3>
        <p className="mt-2 max-w-2xl text-ink-muted">
          Temperature T divides the model&apos;s raw scores before they become probabilities. T above 1 makes it less
          sure, below 1 more sure. The fitted value, T = {fmtT(fittedT)}, was chosen on the validation images only.
        </p>

        <div className="mt-5 grid gap-5 md:grid-cols-[1fr_auto_auto] md:items-end">
          <div>
            <label htmlFor="temp-slider" className="text-sm font-medium">
              Temperature (log scale)
            </label>
            <input
              id="temp-slider"
              type="range"
              min={0}
              max={SLIDER_STEPS}
              step={1}
              value={temperatureToSlider(temperature)}
              onChange={(e) => set(sliderToTemperature(Number(e.target.value)))}
              aria-valuetext={`Temperature ${fmtT(temperature)}`}
              className="mt-2 block w-full accent-violet"
            />
            <div className="mt-1 flex justify-between text-xs text-ink-muted" aria-hidden="true">
              <span>{MIN_TEMPERATURE}</span>
              <span>{MAX_TEMPERATURE}</span>
            </div>
          </div>
          <div>
            <label htmlFor="temp-input" className="text-sm font-medium">Exact value</label>
            <input
              id="temp-input"
              type="text"
              inputMode="decimal"
              value={text}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? "temp-error" : undefined}
              onChange={(e) => {
                setText(e.target.value);
                const parsed = parseTemperature(e.target.value);
                if (parsed.ok) {
                  setTemperature(parsed.value);
                  setError(null);
                } else {
                  setError(parsed.message);
                }
              }}
              onBlur={() => {
                if (error) set(temperature);
              }}
              className="mt-2 block w-28 rounded-md border border-line bg-space px-3 py-2 text-ink aria-[invalid=true]:border-violet"
            />
          </div>
          <div>
            <label htmlFor="bin-count" className="text-sm font-medium">Bins</label>
            <select
              id="bin-count"
              value={binCount}
              onChange={(e) => setBinCount(Number(e.target.value))}
              className="mt-2 block rounded-md border border-line bg-space px-3 py-2 text-ink"
            >
              {BIN_CHOICES.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
        </div>

        <p id="temp-error" role="alert" className="mt-2 min-h-5 text-sm text-violet">
          {error ? `${error} Showing the last valid value (${fmtT(temperature)}).` : ""}
        </p>

        <div className="mt-2 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => set(1)}
            className="rounded-md border border-line px-3 py-1.5 text-sm hover:border-cyan hover:text-cyan"
          >
            Original model (T = 1)
          </button>
          <button
            type="button"
            onClick={() => set(fittedT)}
            className="rounded-md border border-line px-3 py-1.5 text-sm hover:border-cyan hover:text-cyan"
          >
            Fitted (T = {fmtT(fittedT)})
          </button>
          <button
            type="button"
            onClick={() => set(0.5)}
            className="rounded-md border border-line px-3 py-1.5 text-sm hover:border-cyan hover:text-cyan"
          >
            Sharper (T = 0.5)
          </button>
        </div>

        <p className="mt-4 text-ink" aria-live="polite">{verdict}</p>
      </div>

      <div>
        <h3 className="font-display text-xl font-semibold">2. Metrics</h3>
        <div className="mt-4 rounded-lg border border-line bg-surface p-5 md:p-6">
          <MetricsPanel
            raw={computed.raw}
            current={computed.current}
            fitted={computed.fitted}
            temperature={temperature}
            fittedTemperature={fittedT}
          />
        </div>
      </div>

      <div>
        <h3 className="font-display text-xl font-semibold">3. Reliability and confidence</h3>
        <div className="mt-4 grid gap-6 md:grid-cols-2">
          <div className="rounded-lg border border-line bg-surface p-5">
            <h4 className="mb-3 font-medium">Reliability diagram</h4>
            <ReliabilityDiagram bins={computed.bins} label={label} />
          </div>
          <div className="rounded-lg border border-line bg-surface p-5">
            <h4 className="mb-3 font-medium">Confidence distribution</h4>
            <ConfidenceHistogram
              counts={computed.histogram}
              meanConfidence={current.meanConfidence}
              accuracy={current.accuracy}
              label={label}
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-display text-xl font-semibold">4. Inspect individual predictions</h3>
        <p className="mt-2 max-w-2xl text-ink-muted">
          Each thumbnail is a real held-out image, labelled true → predicted. Move the temperature above and watch
          these confidences change while the predicted digits stay the same.
        </p>
        <div className="mt-4 rounded-lg border border-line bg-surface p-5 md:p-6">
          <ExampleExplorer predictions={computed.predictions} pixels={pixels} sourceIndex={sourceIndex} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <h3 className="font-display text-xl font-semibold">Metric definitions</h3>
          <div className="mt-4 space-y-2">
            {metricDefinitions.map((d) => (
              <details key={d.name} className="rounded-md border border-line bg-surface px-4 py-3">
                <summary className="cursor-pointer font-medium">{d.name}</summary>
                <p className="mt-2 text-sm text-ink-muted">{d.text}</p>
              </details>
            ))}
          </div>
        </div>
        <div>
          <h3 className="font-display text-xl font-semibold">Limitations and robustness</h3>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-ink-muted">
            {explainer.limitations.map((l) => (
              <li key={l}>{l}</li>
            ))}
          </ul>
          <p className="mt-4 rounded-md border border-line bg-surface p-4 text-sm text-ink-muted">
            <strong className="text-ink">Is this one lucky split? </strong>
            The same pipeline was run offline with {rb.seeds.length} different random splits. Mean ECE (
            {rb.bins} bins) went from {(rb.rawEce.mean * 100).toFixed(1)}% to {(rb.calibratedEce.mean * 100).toFixed(1)}%,
            and calibration lowered it in {rb.seedsWhereCalibrationLoweredEce} of {rb.seeds.length} runs. Mean accuracy
            was {(rb.accuracy.mean * 100).toFixed(1)}% (range {(rb.accuracy.min * 100).toFixed(1)}–
            {(rb.accuracy.max * 100).toFixed(1)}%). The page shows seed {m.split.seed}.
          </p>
        </div>
      </div>
    </div>
  );
}
