"""Unit tests for the Python metric implementations, on small hand-checkable cases.

Run from the project root:  python -m unittest ml.test_metrics -v
"""

import math
import unittest

import numpy as np

from ml.train_calibration_demo import (
    accuracy,
    brier_score,
    expected_calibration_error,
    negative_log_likelihood,
    softmax,
)


class SoftmaxTests(unittest.TestCase):
    def test_rows_sum_to_one(self):
        p = softmax(np.array([[1.0, 2.0, 3.0], [0.0, 0.0, 0.0]]))
        np.testing.assert_allclose(p.sum(axis=1), [1.0, 1.0])

    def test_equal_logits_are_uniform(self):
        np.testing.assert_allclose(softmax(np.zeros((1, 4))), [[0.25] * 4])

    def test_temperature_changes_confidence_not_argmax(self):
        logits = np.array([[3.0, 1.0, 0.0]])
        hot, cold = softmax(logits, 4.0), softmax(logits, 0.5)
        self.assertEqual(hot.argmax(), cold.argmax())
        self.assertLess(hot.max(), cold.max())

    def test_stable_for_huge_logits(self):
        p = softmax(np.array([[1000.0, 0.0]]))
        self.assertTrue(np.isfinite(p).all())
        self.assertAlmostEqual(p[0, 0], 1.0)


class MetricTests(unittest.TestCase):
    def test_perfect_confident_predictions(self):
        probs, labels = np.array([[1.0, 0.0], [0.0, 1.0]]), np.array([0, 1])
        self.assertEqual(accuracy(probs, labels), 1.0)
        self.assertAlmostEqual(brier_score(probs, labels), 0.0)
        self.assertAlmostEqual(expected_calibration_error(probs, labels, 10), 0.0)

    def test_confidently_wrong_brier_is_two(self):
        probs, labels = np.array([[1.0, 0.0]]), np.array([1])
        self.assertAlmostEqual(brier_score(probs, labels), 2.0)

    def test_uniform_brier_binary(self):
        probs, labels = np.array([[0.5, 0.5]]), np.array([0])
        self.assertAlmostEqual(brier_score(probs, labels), 0.5)

    def test_nll_of_uniform_is_log_k(self):
        probs, labels = np.full((3, 4), 0.25), np.array([0, 1, 2])
        self.assertAlmostEqual(negative_log_likelihood(probs, labels), math.log(4))

    def test_ece_overconfident_known_value(self):
        # Four predictions at confidence 0.9, only two correct: |0.5 - 0.9| = 0.4.
        probs = np.array([[0.9, 0.1]] * 4)
        labels = np.array([0, 0, 1, 1])
        self.assertAlmostEqual(expected_calibration_error(probs, labels, 10), 0.4)

    def test_ece_is_zero_when_confidence_matches_accuracy(self):
        # Ten predictions at confidence 0.8, exactly eight correct.
        probs = np.array([[0.8, 0.2]] * 10)
        labels = np.array([0] * 8 + [1] * 2)
        self.assertAlmostEqual(expected_calibration_error(probs, labels, 10), 0.0)

    def test_ece_weights_bins_by_size(self):
        # Bin A (conf 0.9, 2 of 4 correct, gap 0.4, weight 4/6); bin B (conf 0.6, 2 of 2 correct, gap 0.4, weight 2/6).
        probs = np.array([[0.9, 0.1]] * 4 + [[0.6, 0.4]] * 2)
        labels = np.array([0, 0, 1, 1, 0, 0])
        self.assertAlmostEqual(expected_calibration_error(probs, labels, 10), 0.4)

    def test_confidence_of_exactly_one_lands_in_last_bin(self):
        probs, labels = np.array([[1.0, 0.0]]), np.array([0])
        self.assertAlmostEqual(expected_calibration_error(probs, labels, 5), 0.0)


if __name__ == "__main__":
    unittest.main()
