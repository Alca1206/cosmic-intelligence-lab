import { test } from "node:test";
import assert from "node:assert/strict";
import { filterPredictions, predictAll, topClasses } from "./predictions.ts";

const logits = [[5, 0, 0], [0.2, 0.1, 0], [0, 4, 0]];
const labels = [0, 1, 0]; // #0 right+confident, #1 wrong+uncertain, #2 wrong+confident

test("predictAll gives predicted class, confidence and correctness", () => {
  const p = predictAll(logits, labels, 1);
  assert.deepEqual(p.map((x) => x.predicted), [0, 0, 1]);
  assert.deepEqual(p.map((x) => x.correct), [true, false, false]);
  assert.ok(p[0].confidence > 0.98);
});

test("filters select the right examples", () => {
  const p = predictAll(logits, labels, 1);
  assert.equal(filterPredictions(p, "all").length, 3);
  assert.deepEqual(filterPredictions(p, "incorrect").map((x) => x.index), [1, 2]);
  assert.deepEqual(filterPredictions(p, "confident-incorrect").map((x) => x.index), [2]);
  assert.deepEqual(filterPredictions(p, "uncertain").map((x) => x.index), [1]);
});

test("a filter can legitimately be empty", () => {
  const p = predictAll([[9, 0]], [0], 1);
  assert.equal(filterPredictions(p, "incorrect").length, 0);
});

test("topClasses sorts descending and breaks ties by class index", () => {
  assert.deepEqual(topClasses([0.1, 0.5, 0.4], 2), [{ cls: 1, prob: 0.5 }, { cls: 2, prob: 0.4 }]);
  assert.deepEqual(topClasses([0.5, 0.5], 1), [{ cls: 0, prob: 0.5 }]);
});
