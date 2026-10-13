"use client";

import { useEffect, useRef, useState } from "react";
import Section from "@/components/ui/Section";
import CalibrationExplorer from "./CalibrationExplorer";
import { playgroundIntro } from "@/data/playground";
import { loadCalibrationDataset } from "@/lib/ml/load";
import { DatasetError } from "@/lib/ml/dataset";
import type { CalibrationDataset } from "@/lib/ml/types";

const DATA_URL = "/ml/calibration-demo.json";

type Result = { data: CalibrationDataset } | { error: string } | null;

function describe(err: unknown): string {
  if (err instanceof DatasetError) {
    switch (err.kind) {
      case "network": return "The model output file could not be downloaded. Check your connection.";
      case "http": return `The model output file could not be loaded (${err.message}).`;
      case "parse": return "The model output file is not valid JSON.";
      case "invalid": return `The model output file failed validation: ${err.message}`;
    }
  }
  return "Something unexpected went wrong while loading the demo.";
}

// The data file (about 180 KB) is only fetched when the section is close to the
// screen, so it does not slow down the rest of the page.
export default function Playground() {
  const anchor = useRef<HTMLDivElement>(null);
  const [requested, setRequested] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<Result>(null);

  useEffect(() => {
    const el = anchor.current;
    if (!el || requested) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setRequested(true);
          io.disconnect();
        }
      },
      { rootMargin: "600px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [requested]);

  useEffect(() => {
    if (!requested) return;
    const controller = new AbortController();
    loadCalibrationDataset(DATA_URL, controller.signal)
      .then((data) => setResult({ data }))
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        setResult({ error: describe(err) });
      });
    return () => controller.abort();
  }, [requested, attempt]);

  return (
    <Section id="playground" title="ML Playground" description={playgroundIntro}>
      <div ref={anchor}>
        {result && "data" in result ? (
          <CalibrationExplorer data={result.data} />
        ) : result && "error" in result ? (
          <div role="alert" className="rounded-lg border border-violet/60 bg-surface p-6">
            <p className="font-medium">The playground could not start.</p>
            <p className="mt-2 text-ink-muted">{result.error}</p>
            <button
              type="button"
              onClick={() => {
                setResult(null);
                setAttempt((n) => n + 1);
              }}
              className="mt-4 rounded-md bg-violet px-4 py-2 text-sm font-medium text-space hover:bg-cyan"
            >
              Try again
            </button>
          </div>
        ) : (
          <div role="status" className="rounded-lg border border-line bg-surface p-6 text-ink-muted">
            <span className="inline-block size-3 animate-pulse rounded-full bg-cyan align-middle" aria-hidden="true" />{" "}
            <span className="ml-2 align-middle">
              {requested ? "Loading the model's held-out predictions…" : "The demo loads when you scroll here."}
            </span>
          </div>
        )}
      </div>
    </Section>
  );
}
