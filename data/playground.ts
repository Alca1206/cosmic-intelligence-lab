// All the words shown in the ML Playground live here, so they are easy to edit.

export const playgroundIntro =
  "A small, real machine-learning experiment you can poke at. It asks one question: when a model says it is 97% sure, is it right 97% of the time?";

export const explainer = {
  model:
    "A softmax-regression classifier (a single-layer neural network) that reads an 8×8 grayscale image of a handwritten digit and scores each of the digits 0–9.",
  dataset:
    "The UCI Optical Recognition of Handwritten Digits test set (1,797 images, bundled with scikit-learn). It is real data, not synthetic. Only 10% is used for training, to make the model realistically imperfect.",
  inputs:
    "The 64 pixel values of each image. You do not upload anything: you choose a temperature, a bin count and which examples to inspect.",
  outputs:
    "For every held-out image: the predicted digit, a confidence (the highest probability), and the full probability for all 10 digits.",
  limitations: [
    "Digits are an easy task on tiny images. The point is the calibration method, not the accuracy.",
    "Calibration was measured on one fixed held-out set of 1,214 images. Numbers shift with another split (see the 10-seed summary).",
    "Temperature scaling fixes average over-confidence. It cannot fix a model that is wrong, and it does not tell you why.",
    "ECE depends on the number of bins, and the bins at high confidence hold most of the data.",
    "This is an educational demo, not a clinical or production model.",
  ],
};

export const metricDefinitions = [
  {
    name: "Accuracy",
    text: "Fraction of images where the highest-probability digit is the true digit. Temperature never changes which digit is highest, so accuracy never moves.",
  },
  {
    name: "Mean confidence",
    text: "The average of each image's highest probability. Compare it with accuracy: if confidence is higher than accuracy, the model is over-confident.",
  },
  {
    name: "Expected calibration error (ECE)",
    text: "Predictions are grouped into equal-width confidence bins. For each bin, take the gap between its accuracy and its average confidence, then average the gaps weighted by how many predictions each bin holds. 0 is perfect; lower is better. This is the top-label ECE with equal-width bins. A confidence of exactly 1.0 goes in the last bin.",
  },
  {
    name: "Brier score",
    text: "Mean squared difference between the 10 predicted probabilities and the true answer (1 for the true digit, 0 for the others). It ranges from 0 (perfect) to 2 (certain and wrong). Lower is better.",
  },
  {
    name: "Negative log-likelihood (NLL)",
    text: "Average of −ln(probability given to the true digit), with probabilities clipped at 1e-12. It punishes confident mistakes very hard. This is the quantity the temperature was fitted to minimise.",
  },
  {
    name: "Binning choice",
    text: "You can pick 5, 10, 15 or 20 bins. Few bins hide detail; many bins leave the low-confidence bins nearly empty and noisy (empty bins are left out). Ten is the common default.",
  },
];

export const digitNames = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
