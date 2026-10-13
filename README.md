# Cosmic Intelligence Lab

Portfolio site built with Next.js (App Router), TypeScript and Tailwind.

```bash
npm install
npm run dev        # http://localhost:3000
npm run lint
npm test           # Node's built-in test runner (Node 22.18+)
npm run build
```

---

## Site structure

Each section is its own page (a folder in `app/`): `/` (the 3D universe), `/projects`, `/projects/[slug]`,
`/research`, `/playground`, `/skills`, `/about`, `/contact`. The menu is `data/navigation.ts`.

## 3D star maps (home and projects)

Built with three.js through React Three Fiber (`components/universe/`). The home page is a constellation with
you (About) at the centre and a star each for Projects, ML Playground, Research, Skills and Contact. The Projects
page holds a second constellation with one star per project, coloured by category, plus the project cards below.
The maps are defined in `data/universe.ts` and built from the same data as the rest of the site, so adding a
project to `data/projects.ts` adds a star. The scene loads only in the browser, pauses off-screen, turns off motion
for `prefers-reduced-motion`, and a list of links beside each map works without WebGL or a mouse.

---

## ML Playground: Confidence Calibration Explorer

An interactive section (`#playground`) showing whether a model's confidence can be trusted, and how
**temperature scaling** (Guo et al., 2017) changes it.

### How it works

| Part | Where | Runs |
|---|---|---|
| Training, temperature fitting, held-out predictions | `ml/train_calibration_demo.py` | offline, Python |
| Stored result (logits, labels, images, reference metrics) | `public/ml/calibration-demo.json` | static file |
| Softmax/temperature, metrics, filtering | `lib/ml/*.ts` | live in the browser |
| Interface | `components/playground/*`, copy in `data/playground.ts` | browser |

**Precomputed vs live:** the model is trained once, offline. The 1,214 held-out predictions are stored
as raw logits. Probabilities, accuracy, ECE, Brier, NLL and charts are recomputed in the browser whenever
you move a control. Nothing is retrained in the browser.

### Data provenance

UCI "Optical Recognition of Handwritten Digits" test set, bundled with scikit-learn
(`sklearn.datasets.load_digits`): 1,797 real 8×8 images, 10 classes. Not synthetic.
Stratified split, seed 0: 179 train / 404 validation / 1,214 test. Only 10% is used for training so the
model is realistically imperfect. Dataset SHA-256 and library versions are in the artifact's `meta`.

### Model and calibration

Multinomial logistic regression (softmax regression), `C=1e4`. Temperature T is fitted by minimising NLL on
the validation set only, never on the test set. A small MLP was tried first and was already well calibrated,
so it made a poor demo; softmax regression was chosen because it shows measurable over-confidence.

### Evaluation (`lib/ml/metrics.ts`, mirrored independently in Python)

- **Accuracy**: share of argmax predictions that are correct (unchanged by T).
- **ECE**: top-label, equal-width bins (choose 5/10/15/20); weighted mean of |accuracy − confidence| per bin; a confidence of 1.0 goes in the last bin.
- **Brier**: mean over images of Σ_k (p_k − y_k)², range 0 to 2.
- **NLL**: mean −ln p(true class), clipped at 1e-12.

Shipped split (10 bins): accuracy 90.6%, ECE 0.0645 → 0.0131, Brier 0.1521 → 0.1353, NLL 0.5034 → 0.2917
(T = 2.85). Across 10 random seeds, calibration lowered ECE in 10 of 10 runs.

### Regenerating the data

See `ml/README.md` (Python venv, `pip install -r ml/requirements.txt`, `python ml/train_calibration_demo.py --check`).

### Limitations

Digits are an easy, small-image task; one fixed held-out set; ECE depends on binning; temperature scaling only
fixes average over-confidence; educational demo, not a production or clinical model.
