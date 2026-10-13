#!/usr/bin/env python3
"""Reproducible training and evaluation for the Confidence Calibration Explorer.

What this script does
---------------------
1. Loads the UCI "Optical Recognition of Handwritten Digits" test set that ships
   with scikit-learn (1,797 images of 8x8 pixels, 10 classes).
2. Splits it (stratified) into train / validation / test.
3. Trains a multinomial logistic regression (softmax regression) on the small
   training split. Weak regularization makes it overconfident on purpose-free
   data: we simply report what it does.
4. Fits ONE number, a temperature T, on the validation split by minimizing
   negative log-likelihood (temperature scaling, Guo et al., 2017).
5. Exports the held-out TEST logits, labels and pixels as JSON. The website
   computes probabilities and metrics from those logits in the browser.
6. Repeats the whole pipeline for several random seeds as a robustness check.
7. Stores reference metrics computed here, independently of the website's
   TypeScript code, so the two implementations can be cross-checked in tests.

Nothing in the output is hand-written: every number comes from the code below.

Usage
-----
    python ml/train_calibration_demo.py            # (re)generate the artifact
    python ml/train_calibration_demo.py --check    # re-run and compare, no writing
    python -m unittest ml.test_metrics             # unit tests for the metrics
"""

from __future__ import annotations

import argparse
import hashlib
import json
import platform
import sys
import warnings
from pathlib import Path

import numpy as np
import scipy
import sklearn
from scipy.optimize import minimize_scalar
from sklearn.datasets import load_digits
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split

# ---------------------------------------------------------------- configuration
ARTIFACT_PATH = Path(__file__).resolve().parent.parent / "public" / "ml" / "calibration-demo.json"
SCHEMA_VERSION = 1
SHIPPED_SEED = 0               # the run exported to the website
ROBUSTNESS_SEEDS = list(range(10))  # seeds 0..9; seed 0 is the shipped run
TRAIN_FRACTION = 0.10          # share of all images used for training
VALIDATION_FRACTION_OF_REST = 0.25  # of what remains after training
LOGREG_C = 1e4                 # inverse regularization strength (weak regularization)
LOGREG_MAX_ITER = 5000
TEMPERATURE_BOUNDS = (0.05, 20.0)
REFERENCE_BINS = 10            # bin count used for the stored reference metrics
LOGIT_DECIMALS = 4
PIXEL_ALPHABET = "0123456789abcdefg"  # pixel intensity 0..16 -> one character


# ---------------------------------------------------------------------- metrics
def softmax(logits: np.ndarray, temperature: float = 1.0) -> np.ndarray:
    """Numerically stable softmax of logits / temperature (row-wise)."""
    z = logits / temperature
    z = z - z.max(axis=1, keepdims=True)
    e = np.exp(z)
    return e / e.sum(axis=1, keepdims=True)


def accuracy(probs: np.ndarray, labels: np.ndarray) -> float:
    return float(np.mean(probs.argmax(axis=1) == labels))


def mean_confidence(probs: np.ndarray) -> float:
    return float(np.mean(probs.max(axis=1)))


def brier_score(probs: np.ndarray, labels: np.ndarray) -> float:
    """Multi-class Brier score: mean over samples of sum_k (p_k - y_k)^2.

    Ranges from 0 (perfect) to 2 (maximally wrong and confident).
    """
    onehot = np.zeros_like(probs)
    onehot[np.arange(len(labels)), labels] = 1.0
    return float(np.mean(np.sum((probs - onehot) ** 2, axis=1)))


def negative_log_likelihood(probs: np.ndarray, labels: np.ndarray) -> float:
    p = np.clip(probs[np.arange(len(labels)), labels], 1e-12, 1.0)
    return float(np.mean(-np.log(p)))


def expected_calibration_error(probs: np.ndarray, labels: np.ndarray, bins: int) -> float:
    """Top-label ECE with equal-width bins.

    Bin k covers [k/bins, (k+1)/bins); the last bin also includes 1.0.
    ECE = sum_k (n_k / n) * | accuracy_k - mean_confidence_k |.
    """
    confidence = probs.max(axis=1)
    correct = (probs.argmax(axis=1) == labels).astype(float)
    index = np.minimum((confidence * bins).astype(int), bins - 1)
    total = 0.0
    for k in range(bins):
        mask = index == k
        if mask.any():
            total += mask.sum() / len(labels) * abs(correct[mask].mean() - confidence[mask].mean())
    return float(total)


def all_metrics(probs: np.ndarray, labels: np.ndarray, bins: int = REFERENCE_BINS) -> dict:
    return {
        "accuracy": accuracy(probs, labels),
        "meanConfidence": mean_confidence(probs),
        "ece": expected_calibration_error(probs, labels, bins),
        "brier": brier_score(probs, labels),
        "nll": negative_log_likelihood(probs, labels),
    }


# --------------------------------------------------------------------- pipeline
def fit_temperature(val_logits: np.ndarray, val_labels: np.ndarray) -> float:
    """Temperature that minimizes validation NLL (searched on log-temperature)."""
    lo, hi = np.log(TEMPERATURE_BOUNDS[0]), np.log(TEMPERATURE_BOUNDS[1])
    result = minimize_scalar(
        lambda log_t: negative_log_likelihood(softmax(val_logits, float(np.exp(log_t))), val_labels),
        bounds=(lo, hi),
        method="bounded",
    )
    temperature = float(np.exp(result.x))
    if not (TEMPERATURE_BOUNDS[0] * 1.01 < temperature < TEMPERATURE_BOUNDS[1] / 1.01):
        warnings.warn(f"Fitted temperature {temperature:.3f} is at the search bound.")
    return temperature


def run_pipeline(seed: int) -> dict:
    """Split, train, fit temperature, and return everything needed downstream."""
    digits = load_digits()
    features = digits.data / 16.0  # pixel intensities 0..16 -> 0..1
    labels = digits.target
    indices = np.arange(len(labels))

    train_x, rest_x, train_y, rest_y, train_i, rest_i = train_test_split(
        features, labels, indices, train_size=TRAIN_FRACTION, stratify=labels, random_state=seed
    )
    val_x, test_x, val_y, test_y, val_i, test_i = train_test_split(
        rest_x, rest_y, rest_i, train_size=VALIDATION_FRACTION_OF_REST, stratify=rest_y, random_state=seed
    )

    model = LogisticRegression(C=LOGREG_C, max_iter=LOGREG_MAX_ITER)
    with warnings.catch_warnings():
        warnings.simplefilter("ignore")  # convergence chatter is not informative here
        model.fit(train_x, train_y)

    val_logits = model.decision_function(val_x)
    test_logits = np.round(model.decision_function(test_x), LOGIT_DECIMALS)

    # Safety check: the logits we export must reproduce the model's own probabilities.
    assert np.allclose(softmax(model.decision_function(test_x)), model.predict_proba(test_x), atol=1e-8), (
        "decision_function logits do not match predict_proba; the exported logits would be wrong"
    )

    temperature = fit_temperature(val_logits, val_y)
    return {
        "seed": seed,
        "temperature": temperature,
        "train_size": len(train_y),
        "val_size": len(val_y),
        "test_size": len(test_y),
        "test_logits": test_logits,
        "test_labels": test_y,
        "test_source_index": test_i,
        "test_pixels": digits.data[test_i].astype(int),
        "raw": all_metrics(softmax(test_logits), test_y),
        "calibrated": all_metrics(softmax(test_logits, temperature), test_y),
    }


def encode_pixels(row: np.ndarray) -> str:
    return "".join(PIXEL_ALPHABET[int(v)] for v in row)


def summarize(values: list[float]) -> dict:
    arr = np.asarray(values, dtype=float)
    return {"mean": float(arr.mean()), "std": float(arr.std(ddof=0)), "min": float(arr.min()), "max": float(arr.max())}


def build_artifact() -> dict:
    digits = load_digits()
    runs = [run_pipeline(seed) for seed in ROBUSTNESS_SEEDS]
    shipped = next(run for run in runs if run["seed"] == SHIPPED_SEED)

    dataset_hash = hashlib.sha256(digits.data.astype(np.float64).tobytes() + digits.target.astype(np.int64).tobytes())

    return {
        "schemaVersion": SCHEMA_VERSION,
        "meta": {
            "generatedBy": "ml/train_calibration_demo.py",
            "dataset": {
                "name": "Optical Recognition of Handwritten Digits (UCI), test set as bundled with scikit-learn",
                "source": "https://archive.ics.uci.edu/dataset/80/optical+recognition+of+handwritten+digits",
                "loader": "sklearn.datasets.load_digits()",
                "samples": int(len(digits.target)),
                "features": int(digits.data.shape[1]),
                "classes": 10,
                "inputDescription": "8x8 grayscale images of handwritten digits, pixel intensity 0 to 16",
                "sha256": dataset_hash.hexdigest(),
                "synthetic": False,
            },
            "model": {
                "type": "Multinomial logistic regression (softmax regression, a single-layer neural network)",
                "library": f"scikit-learn {sklearn.__version__}",
                "hyperparameters": {"C": LOGREG_C, "maxIter": LOGREG_MAX_ITER, "inputScaling": "pixel / 16"},
            },
            "split": {
                "seed": SHIPPED_SEED,
                "strategy": "stratified random split of the 1,797 images",
                "train": shipped["train_size"],
                "validation": shipped["val_size"],
                "test": shipped["test_size"],
            },
            "calibration": {
                "method": "Temperature scaling",
                "reference": "Guo et al. (2017), On Calibration of Modern Neural Networks",
                "fitObjective": "negative log-likelihood on the validation split",
                "fittedTemperature": shipped["temperature"],
                "searchBounds": list(TEMPERATURE_BOUNDS),
            },
            "environment": {
                "python": platform.python_version(),
                "numpy": np.__version__,
                "scipy": scipy.__version__,
                "scikitLearn": sklearn.__version__,
            },
        },
        "test": {
            "sourceIndex": shipped["test_source_index"].astype(int).tolist(),
            "labels": shipped["test_labels"].astype(int).tolist(),
            "logits": shipped["test_logits"].tolist(),
            "pixels": [encode_pixels(row) for row in shipped["test_pixels"]],
        },
        "reference": {
            "note": "Computed by ml/train_calibration_demo.py (NumPy) for cross-checking the website's TypeScript metrics.",
            "bins": REFERENCE_BINS,
            "raw": shipped["raw"],
            "calibrated": shipped["calibrated"],
        },
        "robustness": {
            "note": "The same pipeline repeated with different random splits. Seed 0 is the run shown on the website.",
            "seeds": ROBUSTNESS_SEEDS,
            "bins": REFERENCE_BINS,
            "fittedTemperature": summarize([r["temperature"] for r in runs]),
            "rawEce": summarize([r["raw"]["ece"] for r in runs]),
            "calibratedEce": summarize([r["calibrated"]["ece"] for r in runs]),
            "accuracy": summarize([r["raw"]["accuracy"] for r in runs]),
            "seedsWhereCalibrationLoweredEce": int(sum(r["calibrated"]["ece"] < r["raw"]["ece"] for r in runs)),
        },
    }


def check_against(path: Path, fresh: dict, tolerance: float = 1e-3) -> list[str]:
    """Compare a freshly generated artifact with the committed one."""
    committed = json.loads(path.read_text(encoding="utf-8"))
    problems: list[str] = []
    for key in ("labels", "sourceIndex", "pixels"):
        if committed["test"][key] != fresh["test"][key]:
            problems.append(f"test.{key} differs")
    a, b = np.asarray(committed["test"]["logits"]), np.asarray(fresh["test"]["logits"])
    if a.shape != b.shape or float(np.max(np.abs(a - b))) > tolerance:
        problems.append("test.logits differ by more than the tolerance")
    t_old, t_new = committed["meta"]["calibration"]["fittedTemperature"], fresh["meta"]["calibration"]["fittedTemperature"]
    if abs(t_old - t_new) > 1e-2:
        problems.append(f"fitted temperature differs ({t_old:.4f} vs {t_new:.4f})")
    return problems


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--check", action="store_true", help="re-run and compare with the committed artifact; do not write")
    parser.add_argument("--out", type=Path, default=ARTIFACT_PATH, help="artifact path (default: public/ml/calibration-demo.json)")
    args = parser.parse_args()

    artifact = build_artifact()

    if args.check:
        problems = check_against(args.out, artifact)
        if problems:
            print("MISMATCH with the committed artifact:")
            for p in problems:
                print("  -", p)
            return 1
        print("OK: the committed artifact is reproduced by this script.")
        return 0

    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(json.dumps(artifact, separators=(",", ":")), encoding="utf-8")
    ref = artifact["reference"]
    print(f"Wrote {args.out} ({args.out.stat().st_size / 1024:.0f} KB)")
    print(f"  test examples : {artifact['meta']['split']['test']}")
    print(f"  fitted T      : {artifact['meta']['calibration']['fittedTemperature']:.3f}")
    print(f"  accuracy      : {ref['raw']['accuracy']:.4f}")
    print(f"  ECE (10 bins) : raw {ref['raw']['ece']:.4f} -> calibrated {ref['calibrated']['ece']:.4f}")
    rb = artifact["robustness"]
    print(f"  10 seeds      : ECE {rb['rawEce']['mean']:.4f} -> {rb['calibratedEce']['mean']:.4f}; "
          f"calibration lowered ECE in {rb['seedsWhereCalibrationLoweredEce']}/10 runs")
    return 0


if __name__ == "__main__":
    sys.exit(main())
