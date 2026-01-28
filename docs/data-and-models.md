Data and Model Artifacts
========================

This repo keeps large datasets and trained model artifacts out of git.

Local folders (gitignored)
--------------------------

- data/
- artifacts/
- notebooks/

What goes where
---------------

- data/:
  Raw or processed datasets used for training or evaluation.
- artifacts/:
  Serialized models and pipelines (e.g., .pkl files).
- notebooks/:
  Experiment notebooks for training and evaluation.

How to restore locally
----------------------

1) Place datasets in data/
2) Place model artifacts in artifacts/
3) Place notebooks in notebooks/

If you use a remote artifact store later (S3, GCS, HuggingFace, etc.),
document the download commands here.
