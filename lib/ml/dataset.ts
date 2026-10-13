// Runtime validation of the exported artifact. The file is loaded over the network,
// so its shape is checked rather than trusted. Errors say exactly what is wrong.

import type { CalibrationDataset } from "./types.ts";

export class DatasetError extends Error {
  readonly kind: "network" | "http" | "parse" | "invalid";
  constructor(kind: DatasetError["kind"], message: string) {
    super(message);
    this.name = "DatasetError";
    this.kind = kind;
  }
}

export const PIXEL_ALPHABET = "0123456789abcdefg";
export const IMAGE_SIDE = 8;
export const PIXEL_COUNT = IMAGE_SIDE * IMAGE_SIDE;
export const MAX_PIXEL = 16;

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function fail(message: string): never {
  throw new DatasetError("invalid", message);
}

export function decodePixels(encoded: string): number[] {
  if (encoded.length !== PIXEL_COUNT) fail(`Image has ${encoded.length} pixels, expected ${PIXEL_COUNT}.`);
  const values: number[] = [];
  for (const ch of encoded) {
    const v = PIXEL_ALPHABET.indexOf(ch);
    if (v < 0) fail(`Image contains an invalid pixel character "${ch}".`);
    values.push(v);
  }
  return values;
}

/** Checks the structure of parsed JSON and returns it typed. Throws DatasetError. */
export function validateCalibrationDataset(raw: unknown): CalibrationDataset {
  if (!isObject(raw)) fail("The data file is not a JSON object.");
  if (raw.schemaVersion !== 1) fail(`Unsupported schema version: ${String(raw.schemaVersion)}.`);
  if (!isObject(raw.meta)) fail("The data file has no metadata.");
  if (!isObject(raw.test)) fail("The data file has no test section.");

  const { labels, logits, pixels, sourceIndex } = raw.test;
  if (!Array.isArray(labels) || !Array.isArray(logits) || !Array.isArray(pixels) || !Array.isArray(sourceIndex)) {
    fail("The test section is missing labels, logits, pixels, or sourceIndex.");
  }
  const n = labels.length;
  if (n === 0) fail("The test set is empty.");
  if (logits.length !== n || pixels.length !== n || sourceIndex.length !== n) {
    fail("Labels, logits, pixels, and sourceIndex have different lengths.");
  }

  const classes = isObject(raw.meta.dataset) ? raw.meta.dataset.classes : undefined;
  if (typeof classes !== "number" || !Number.isInteger(classes) || classes < 2) {
    fail("The metadata does not state a valid number of classes.");
  }

  for (let i = 0; i < n; i++) {
    const label = labels[i];
    if (!Number.isInteger(label) || label < 0 || label >= classes) {
      fail(`Label ${String(label)} at example ${i} is outside 0..${classes - 1}.`);
    }
    const row = logits[i];
    if (!Array.isArray(row) || row.length !== classes || !row.every((v) => typeof v === "number" && Number.isFinite(v))) {
      fail(`Logits at example ${i} must be ${classes} finite numbers.`);
    }
    const pixelString = pixels[i];
    if (typeof pixelString !== "string") fail(`Pixels at example ${i} are not a string.`);
    decodePixels(pixelString);
  }

  const calibration = raw.meta.calibration;
  const temperature = isObject(calibration) ? calibration.fittedTemperature : undefined;
  if (typeof temperature !== "number" || !Number.isFinite(temperature) || temperature <= 0) {
    fail("The fitted temperature is missing or not a positive number.");
  }
  if (!isObject(raw.reference) || !isObject(raw.robustness)) fail("The data file has no reference or robustness section.");

  return raw as unknown as CalibrationDataset;
}
