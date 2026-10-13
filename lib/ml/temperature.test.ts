import { test } from "node:test";
import assert from "node:assert/strict";
import {
  MAX_TEMPERATURE, MIN_TEMPERATURE, SLIDER_STEPS, parseTemperature, sliderToTemperature, temperatureToSlider,
} from "./temperature.ts";

test("slider endpoints map to the temperature limits", () => {
  assert.equal(sliderToTemperature(0), MIN_TEMPERATURE);
  assert.ok(Math.abs(sliderToTemperature(SLIDER_STEPS) - MAX_TEMPERATURE) < 1e-12);
});

test("slider is logarithmic: the midpoint is the geometric mean", () => {
  assert.ok(Math.abs(sliderToTemperature(SLIDER_STEPS / 2) - Math.sqrt(MIN_TEMPERATURE * MAX_TEMPERATURE)) < 1e-12);
});

test("slider round-trips", () => {
  for (const pos of [0, 137, 500, 912, 1000]) {
    assert.equal(temperatureToSlider(sliderToTemperature(pos)), pos);
  }
});

test("parseTemperature accepts valid numbers and rejects bad input", () => {
  assert.deepEqual(parseTemperature(" 2.5 "), { ok: true, value: 2.5 });
  for (const bad of ["", "abc", "0", "-1", "0.1", "9", "NaN", "Infinity"]) {
    assert.equal(parseTemperature(bad).ok, false, bad);
  }
});
