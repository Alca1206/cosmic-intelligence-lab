# ML pipeline (offline)

`train_calibration_demo.py` trains the model, fits the temperature, and writes
`public/ml/calibration-demo.json`, the only file the website reads.
The website never runs Python.

```bash
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r ml/requirements.txt
python ml/train_calibration_demo.py            # regenerate the artifact
python ml/train_calibration_demo.py --check    # re-run and compare with the committed file
python -m unittest ml.test_metrics             # metric tests on hand-checkable examples
```

Output is deterministic for the same library versions (versions are recorded in the artifact).
