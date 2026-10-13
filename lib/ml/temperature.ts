// Helpers for the temperature control: a logarithmic slider (equal distances
// mean equal ratios, which suits a scale factor) and validated typed input.

export const MIN_TEMPERATURE = 0.25;
export const MAX_TEMPERATURE = 8;
export const SLIDER_STEPS = 1000;

const RATIO = MAX_TEMPERATURE / MIN_TEMPERATURE;

export function sliderToTemperature(position: number): number {
  const p = Math.min(Math.max(position, 0), SLIDER_STEPS) / SLIDER_STEPS;
  return MIN_TEMPERATURE * RATIO ** p;
}

export function temperatureToSlider(temperature: number): number {
  const t = Math.min(Math.max(temperature, MIN_TEMPERATURE), MAX_TEMPERATURE);
  return Math.round((Math.log(t / MIN_TEMPERATURE) / Math.log(RATIO)) * SLIDER_STEPS);
}

export type ParsedTemperature = { ok: true; value: number } | { ok: false; message: string };

export function parseTemperature(text: string): ParsedTemperature {
  const trimmed = text.trim();
  if (trimmed === "") return { ok: false, message: "Enter a temperature." };
  const value = Number(trimmed);
  if (!Number.isFinite(value)) return { ok: false, message: "Temperature must be a number." };
  if (value < MIN_TEMPERATURE || value > MAX_TEMPERATURE) {
    return { ok: false, message: `Choose a value from ${MIN_TEMPERATURE} to ${MAX_TEMPERATURE}.` };
  }
  return { ok: true, value };
}
