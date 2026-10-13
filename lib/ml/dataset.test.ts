import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { DatasetError, decodePixels, validateCalibrationDataset } from "./dataset.ts";

const real = JSON.parse(readFileSync("public/ml/calibration-demo.json", "utf8"));
const clone = () => structuredClone(real);

test("the shipped artifact passes validation", () => {
  const d = validateCalibrationDataset(real);
  assert.equal(d.test.labels.length, d.test.logits.length);
});

test("decodePixels maps characters to 0..16", () => {
  const px = decodePixels("0g" + "5".repeat(62));
  assert.equal(px.length, 64);
  assert.equal(px[0], 0);
  assert.equal(px[1], 16);
  assert.throws(() => decodePixels("abc"), DatasetError);
});

test("malformed data is rejected with kind 'invalid'", () => {
  const cases: Record<string, (d: ReturnType<typeof clone>) => void> = {
    "wrong schema": (d) => { d.schemaVersion = 2; },
    "label out of range": (d) => { d.test.labels[0] = 99; },
    "missing logits": (d) => { d.test.logits.pop(); },
    "NaN logit": (d) => { d.test.logits[0][0] = null; },
    "short logit row": (d) => { d.test.logits[0] = d.test.logits[0].slice(1); },
    "bad pixel string": (d) => { d.test.pixels[0] = "zz"; },
  };
  for (const [name, mutate] of Object.entries(cases)) {
    const d = clone();
    mutate(d);
    assert.throws(() => validateCalibrationDataset(d), (e: unknown) => e instanceof DatasetError && e.kind === "invalid", name);
  }
  assert.throws(() => validateCalibrationDataset(null), DatasetError);
  assert.throws(() => validateCalibrationDataset("nope"), DatasetError);
});
