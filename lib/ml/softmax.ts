// Model logic: turning raw model outputs (logits) into probabilities.
//
// Temperature scaling divides the logits by a single number T before softmax:
//   p_k = exp(z_k / T) / sum_j exp(z_j / T)
// T > 1 flattens the distribution (less confident), T < 1 sharpens it (more
// confident), and T = 1 leaves the model unchanged. The predicted class never
// changes, so accuracy is identical for every T.

export function assertValidTemperature(temperature: number): void {
  if (!Number.isFinite(temperature) || temperature <= 0) {
    throw new RangeError(`Temperature must be a positive finite number, got ${temperature}.`);
  }
}

/** Numerically stable softmax of logits / temperature. */
export function softmax(logits: readonly number[], temperature = 1): number[] {
  assertValidTemperature(temperature);
  if (logits.length === 0) throw new RangeError("Cannot take softmax of an empty vector.");

  let max = -Infinity;
  for (const z of logits) max = Math.max(max, z / temperature);

  const exps = logits.map((z) => Math.exp(z / temperature - max));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map((e) => e / sum);
}

export function softmaxAll(rows: readonly (readonly number[])[], temperature = 1): number[][] {
  assertValidTemperature(temperature);
  return rows.map((row) => softmax(row, temperature));
}
