// Shapes of the exported calibration artifact (public/ml/calibration-demo.json).
// The file is produced by ml/train_calibration_demo.py; see ml/README.md.

export type MetricSet = {
  accuracy: number;
  meanConfidence: number;
  ece: number;
  brier: number;
  nll: number;
};

export type Summary = { mean: number; std: number; min: number; max: number };

export type DatasetMeta = {
  generatedBy: string;
  dataset: {
    name: string;
    source: string;
    loader: string;
    samples: number;
    features: number;
    classes: number;
    inputDescription: string;
    sha256: string;
    synthetic: boolean;
  };
  model: {
    type: string;
    library: string;
    hyperparameters: Record<string, string | number>;
  };
  split: { seed: number; strategy: string; train: number; validation: number; test: number };
  calibration: {
    method: string;
    reference: string;
    fitObjective: string;
    fittedTemperature: number;
    searchBounds: [number, number];
  };
  environment: { python: string; numpy: string; scipy: string; scikitLearn: string };
};

export type CalibrationDataset = {
  schemaVersion: 1;
  meta: DatasetMeta;
  test: {
    /** Index of each example in sklearn's digits dataset, for traceability. */
    sourceIndex: number[];
    labels: number[];
    /** Raw model outputs (before softmax), one row of 10 numbers per example. */
    logits: number[][];
    /** 64 characters per image, "0".."g" for pixel intensity 0..16. */
    pixels: string[];
  };
  reference: { note: string; bins: number; raw: MetricSet; calibrated: MetricSet };
  robustness: {
    note: string;
    seeds: number[];
    bins: number;
    fittedTemperature: Summary;
    rawEce: Summary;
    calibratedEce: Summary;
    accuracy: Summary;
    seedsWhereCalibrationLoweredEce: number;
  };
};

export type Prediction = {
  /** Position in the test set (0-based). */
  index: number;
  label: number;
  predicted: number;
  confidence: number;
  correct: boolean;
  probs: number[];
};

export type ReliabilityBin = {
  index: number;
  lower: number;
  upper: number;
  count: number;
  /** null when the bin is empty. */
  meanConfidence: number | null;
  accuracy: number | null;
  gap: number | null;
};

export type Metrics = MetricSet & { bins: number; count: number };
