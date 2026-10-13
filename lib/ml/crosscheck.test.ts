// Compares the TypeScript metrics with the numbers the independent Python
// implementation wrote into the artifact (its `reference` block).
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { validateCalibrationDataset } from "./dataset.ts";
import { computeMetrics } from "./metrics.ts";
import { softmaxAll } from "./softmax.ts";

const data = validateCalibrationDataset(JSON.parse(readFileSync("public/ml/calibration-demo.json", "utf8")));
const { logits, labels } = data.test;
const T = data.meta.calibration.fittedTemperature;
const bins = data.reference.bins;

function compare(temperature: number, expected: typeof data.reference.raw) {
  const m = computeMetrics(softmaxAll(logits, temperature), labels, bins);
  for (const key of ["accuracy", "meanConfidence", "ece", "brier", "nll"] as const) {
    assert.ok(Math.abs(m[key] - expected[key]) < 1e-9, `${key}: ts=${m[key]} py=${expected[key]}`);
  }
}

test("TS metrics match Python at T = 1 (raw)", () => compare(1, data.reference.raw));
test("TS metrics match Python at the fitted temperature", () => compare(T, data.reference.calibrated));

test("accuracy does not depend on temperature", () => {
  const base = computeMetrics(softmaxAll(logits, 1), labels, 10).accuracy;
  for (const t of [0.1, 0.5, 2, 7, 20]) {
    assert.equal(computeMetrics(softmaxAll(logits, t), labels, 10).accuracy, base);
  }
});

test("fitted temperature improves ECE and NLL on the shipped split", () => {
  const raw = computeMetrics(softmaxAll(logits, 1), labels, bins);
  const cal = computeMetrics(softmaxAll(logits, T), labels, bins);
  assert.ok(cal.nll < raw.nll);
  assert.ok(cal.ece < raw.ece);
});
