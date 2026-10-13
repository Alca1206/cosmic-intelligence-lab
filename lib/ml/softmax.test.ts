import { test } from "node:test";
import assert from "node:assert/strict";
import { softmax } from "./softmax.ts";

const close = (a: number, b: number, tol = 1e-12) => assert.ok(Math.abs(a - b) < tol, `${a} !~ ${b}`);

test("softmax sums to 1 and is uniform for equal logits", () => {
  const p = softmax([3, 3, 3, 3]);
  close(p.reduce((a, b) => a + b, 0), 1);
  p.forEach((v) => close(v, 0.25));
});

test("softmax matches a hand-computed value", () => {
  // softmax([0, ln 3]) = [1/4, 3/4]
  const p = softmax([0, Math.log(3)]);
  close(p[0], 0.25);
  close(p[1], 0.75);
});

test("softmax is stable for huge logits", () => {
  const p = softmax([1000, 0, -1000]);
  close(p[0], 1);
  assert.ok(p.every(Number.isFinite));
});

test("temperature > 1 lowers confidence, < 1 raises it, argmax is unchanged", () => {
  const z = [2, 1, 0, -1];
  const at = (t: number) => softmax(z, t);
  assert.ok(Math.max(...at(2)) < Math.max(...at(1)));
  assert.ok(Math.max(...at(0.5)) > Math.max(...at(1)));
  for (const t of [0.1, 0.5, 1, 3, 20]) assert.equal(at(t).indexOf(Math.max(...at(t))), 0);
});

test("very large temperature approaches uniform", () => {
  softmax([5, 0, -5], 1e6).forEach((v) => close(v, 1 / 3, 1e-4));
});

test("invalid temperature and empty input are rejected", () => {
  for (const t of [0, -1, NaN, Infinity]) assert.throws(() => softmax([1, 2], t), RangeError);
  assert.throws(() => softmax([]), RangeError);
});
