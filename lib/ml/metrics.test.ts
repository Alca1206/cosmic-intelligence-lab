import { test } from "node:test";
import assert from "node:assert/strict";
import {
  accuracy, argmax, binIndex, brierScore, confidenceHistogram, computeMetrics,
  expectedCalibrationError, negativeLogLikelihood, reliabilityBins,
} from "./metrics.ts";

const close = (a: number, b: number, tol = 1e-12) => assert.ok(Math.abs(a - b) < tol, `${a} !~ ${b}`);

test("argmax breaks ties toward the lowest index", () => {
  assert.equal(argmax([0.5, 0.5, 0]), 0);
  assert.equal(argmax([0, 1, 0]), 1);
});

test("binIndex puts 1.0 in the last bin and boundaries in the upper bin", () => {
  assert.equal(binIndex(1, 10), 9);
  assert.equal(binIndex(0.9, 10), 9);
  assert.equal(binIndex(0.5, 10), 5);
  assert.equal(binIndex(0, 10), 0);
});

test("accuracy counts argmax matches", () => {
  const probs = [[0.9, 0.1], [0.2, 0.8], [0.6, 0.4], [0.3, 0.7]];
  close(accuracy(probs, [0, 1, 1, 1]), 0.75);
});

test("Brier: perfect = 0, confidently wrong = 2, uniform over 4 = 0.75", () => {
  close(brierScore([[1, 0, 0]], [0]), 0);
  close(brierScore([[0, 1, 0]], [0]), 2);
  close(brierScore([[0.25, 0.25, 0.25, 0.25]], [2]), 0.75);
});

test("NLL: uniform over 4 = ln 4, certain wrong answer is finite", () => {
  close(negativeLogLikelihood([[0.25, 0.25, 0.25, 0.25]], [1]), Math.log(4));
  assert.ok(Number.isFinite(negativeLogLikelihood([[0, 1]], [0])));
});

test("ECE: perfectly calibrated example is 0", () => {
  // 4 predictions at confidence 0.75, exactly 3 correct.
  const probs = Array.from({ length: 4 }, () => [0.75, 0.25]);
  close(expectedCalibrationError(probs, [0, 0, 0, 1], 10), 0);
});

test("ECE: always 100% confident but 60% accurate = 0.4", () => {
  const probs = Array.from({ length: 5 }, () => [1, 0]);
  close(expectedCalibrationError(probs, [0, 0, 0, 1, 1], 10), 0.4);
});

test("ECE weights bins by their size", () => {
  // 3 examples at conf 1.0 (all correct, gap 0) + 1 at conf 0.9 (wrong, gap 0.9).
  const probs = [[1, 0], [1, 0], [1, 0], [0.9, 0.1]];
  close(expectedCalibrationError(probs, [0, 0, 0, 1], 10), 0.25 * 0.9);
});

test("reliability bins report empty bins as null and counts sum to n", () => {
  const probs = [[0.95, 0.05], [0.55, 0.45]];
  const bins = reliabilityBins(probs, [0, 1], 10);
  assert.equal(bins.reduce((s, b) => s + b.count, 0), 2);
  assert.equal(bins[0].accuracy, null);
  assert.equal(bins[9].count, 1);
  close(bins[5].accuracy ?? -1, 0);
});

test("confidence histogram counts every example once", () => {
  const h = confidenceHistogram([[1, 0], [0.5, 0.5], [0.7, 0.3]], 5);
  assert.deepEqual(h, [0, 0, 1, 1, 1]);
});

test("computeMetrics bundles the pieces", () => {
  const m = computeMetrics([[1, 0], [0, 1]], [0, 1], 10);
  assert.equal(m.accuracy, 1); assert.equal(m.ece, 0); assert.equal(m.brier, 0); assert.equal(m.count, 2);
});

test("invalid inputs throw", () => {
  assert.throws(() => accuracy([], []), RangeError);
  assert.throws(() => accuracy([[1, 0]], [0, 1]), RangeError);
  assert.throws(() => reliabilityBins([[1, 0]], [0], 0), RangeError);
  assert.throws(() => reliabilityBins([[1, 0]], [0], 2.5), RangeError);
});
