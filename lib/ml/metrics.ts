// Evaluation logic. Every function here is pure and framework-free, so it can be
// tested directly and cross-checked against the independent Python implementation
// in ml/train_calibration_demo.py.
//
// Definitions (n examples, K classes, p_i the predicted probability vector):
//   confidence_i  = max_k p_ik                      (top-label confidence)
//   predicted_i   = argmax_k p_ik                   (ties: lowest class index)
//   accuracy      = mean( predicted_i == label_i )
//   Brier score   = mean_i sum_k ( p_ik - 1[label_i == k] )^2        (0 best, 2 worst)
//   NLL           = mean_i -log p_i,label_i          (probabilities clipped at 1e-12)
//   ECE           = sum_b (n_b / n) * | accuracy_b - meanConfidence_b |
//                   over M equal-width confidence bins: bin b = [b/M, (b+1)/M),
//                   with 1.0 included in the last bin.

import type { Metrics, ReliabilityBin } from "./types.ts";

const MIN_PROBABILITY = 1e-12;

export function argmax(row: readonly number[]): number {
  let best = 0;
  for (let i = 1; i < row.length; i++) if (row[i] > row[best]) best = i;
  return best;
}

function assertInputs(probs: readonly (readonly number[])[], labels: readonly number[]): void {
  if (probs.length === 0) throw new RangeError("No examples to evaluate.");
  if (probs.length !== labels.length) {
    throw new RangeError(`Got ${probs.length} probability rows but ${labels.length} labels.`);
  }
  const classes = probs[0].length;
  for (let i = 0; i < labels.length; i++) {
    if (probs[i].length !== classes) throw new RangeError(`Row ${i} has a different number of classes.`);
    const label = labels[i];
    if (!Number.isInteger(label) || label < 0 || label >= classes) {
      throw new RangeError(`Label ${label} at position ${i} is outside 0..${classes - 1}.`);
    }
  }
}

function assertBinCount(binCount: number): void {
  if (!Number.isInteger(binCount) || binCount < 1) {
    throw new RangeError(`Bin count must be a positive integer, got ${binCount}.`);
  }
}

/** Index of the equal-width bin that holds a confidence value in [0, 1]. */
export function binIndex(confidence: number, binCount: number): number {
  return Math.min(Math.floor(confidence * binCount), binCount - 1);
}

export function accuracy(probs: readonly (readonly number[])[], labels: readonly number[]): number {
  assertInputs(probs, labels);
  let correct = 0;
  for (let i = 0; i < labels.length; i++) if (argmax(probs[i]) === labels[i]) correct++;
  return correct / labels.length;
}

export function meanConfidence(probs: readonly (readonly number[])[]): number {
  if (probs.length === 0) throw new RangeError("No examples to evaluate.");
  let total = 0;
  for (const row of probs) total += Math.max(...row);
  return total / probs.length;
}

export function brierScore(probs: readonly (readonly number[])[], labels: readonly number[]): number {
  assertInputs(probs, labels);
  let total = 0;
  for (let i = 0; i < labels.length; i++) {
    for (let k = 0; k < probs[i].length; k++) {
      const target = k === labels[i] ? 1 : 0;
      total += (probs[i][k] - target) ** 2;
    }
  }
  return total / labels.length;
}

export function negativeLogLikelihood(
  probs: readonly (readonly number[])[],
  labels: readonly number[],
): number {
  assertInputs(probs, labels);
  let total = 0;
  for (let i = 0; i < labels.length; i++) {
    total += -Math.log(Math.min(Math.max(probs[i][labels[i]], MIN_PROBABILITY), 1));
  }
  return total / labels.length;
}

export function reliabilityBins(
  probs: readonly (readonly number[])[],
  labels: readonly number[],
  binCount: number,
): ReliabilityBin[] {
  assertInputs(probs, labels);
  assertBinCount(binCount);

  const counts = new Array<number>(binCount).fill(0);
  const confidenceSums = new Array<number>(binCount).fill(0);
  const correctCounts = new Array<number>(binCount).fill(0);

  for (let i = 0; i < labels.length; i++) {
    const confidence = Math.max(...probs[i]);
    const b = binIndex(confidence, binCount);
    counts[b]++;
    confidenceSums[b] += confidence;
    if (argmax(probs[i]) === labels[i]) correctCounts[b]++;
  }

  return counts.map((count, b) => {
    const empty = count === 0;
    const meanConf = empty ? null : confidenceSums[b] / count;
    const acc = empty ? null : correctCounts[b] / count;
    return {
      index: b,
      lower: b / binCount,
      upper: (b + 1) / binCount,
      count,
      meanConfidence: meanConf,
      accuracy: acc,
      gap: meanConf === null || acc === null ? null : Math.abs(acc - meanConf),
    };
  });
}

export function expectedCalibrationErrorFromBins(bins: readonly ReliabilityBin[]): number {
  const total = bins.reduce((sum, bin) => sum + bin.count, 0);
  if (total === 0) throw new RangeError("No examples to evaluate.");
  return bins.reduce((sum, bin) => sum + (bin.gap === null ? 0 : (bin.count / total) * bin.gap), 0);
}

export function expectedCalibrationError(
  probs: readonly (readonly number[])[],
  labels: readonly number[],
  binCount: number,
): number {
  return expectedCalibrationErrorFromBins(reliabilityBins(probs, labels, binCount));
}

/** How many examples fall in each equal-width confidence bin (the confidence distribution). */
export function confidenceHistogram(probs: readonly (readonly number[])[], binCount: number): number[] {
  assertBinCount(binCount);
  const counts = new Array<number>(binCount).fill(0);
  for (const row of probs) counts[binIndex(Math.max(...row), binCount)]++;
  return counts;
}

export function computeMetrics(
  probs: readonly (readonly number[])[],
  labels: readonly number[],
  binCount: number,
): Metrics {
  return {
    accuracy: accuracy(probs, labels),
    meanConfidence: meanConfidence(probs),
    ece: expectedCalibrationError(probs, labels, binCount),
    brier: brierScore(probs, labels),
    nll: negativeLogLikelihood(probs, labels),
    bins: binCount,
    count: labels.length,
  };
}
