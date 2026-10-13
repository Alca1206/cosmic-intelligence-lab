// Applies the model's stored outputs at a chosen temperature, and filters the
// resulting predictions for the example explorer.

import { argmax } from "./metrics.ts";
import { softmax } from "./softmax.ts";
import type { Prediction } from "./types.ts";

export function predictAll(
  logits: readonly (readonly number[])[],
  labels: readonly number[],
  temperature: number,
): Prediction[] {
  return logits.map((row, index) => {
    const probs = softmax(row, temperature);
    const predicted = argmax(probs);
    return {
      index,
      label: labels[index],
      predicted,
      confidence: probs[predicted],
      correct: predicted === labels[index],
      probs,
    };
  });
}

export type ExampleFilter = "all" | "incorrect" | "confident-incorrect" | "uncertain";

export const CONFIDENT_THRESHOLD = 0.9;
export const UNCERTAIN_THRESHOLD = 0.6;

export function filterPredictions(predictions: readonly Prediction[], filter: ExampleFilter): Prediction[] {
  switch (filter) {
    case "all":
      return [...predictions];
    case "incorrect":
      return predictions.filter((p) => !p.correct);
    case "confident-incorrect":
      return predictions.filter((p) => !p.correct && p.confidence >= CONFIDENT_THRESHOLD);
    case "uncertain":
      return predictions.filter((p) => p.confidence < UNCERTAIN_THRESHOLD);
  }
}

/** The k most probable classes, highest first. Ties keep the lower class index first. */
export function topClasses(probs: readonly number[], k: number): { cls: number; prob: number }[] {
  return probs
    .map((prob, cls) => ({ cls, prob }))
    .sort((a, b) => b.prob - a.prob || a.cls - b.cls)
    .slice(0, k);
}
