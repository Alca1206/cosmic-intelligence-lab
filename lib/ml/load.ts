// Fetches and validates the artifact. Kept separate from dataset.ts so the pure
// validation code can run in Node tests without a network.

import { DatasetError, validateCalibrationDataset } from "./dataset.ts";
import type { CalibrationDataset } from "./types.ts";

export async function loadCalibrationDataset(url: string, signal?: AbortSignal): Promise<CalibrationDataset> {
  let response: Response;
  try {
    response = await fetch(url, { signal });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    throw new DatasetError("network", "The data file could not be downloaded. Check your connection and try again.");
  }
  if (!response.ok) {
    throw new DatasetError("http", `The data file could not be loaded (server answered ${response.status}).`);
  }

  let json: unknown;
  try {
    json = await response.json();
  } catch {
    throw new DatasetError("parse", "The data file is not valid JSON.");
  }
  return validateCalibrationDataset(json);
}
