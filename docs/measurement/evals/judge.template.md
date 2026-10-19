---
title: Judge prompt (template) — one binary judge per failure mode
description: Fill when a failure mode is catalogued and needs an automated grader; one pass/fail judge, validated against human labels before it gates anything.
layer: measurement
status: adopted
thread: "14"
role: Assay
date: 2026-10-01
last_reviewed: 2026-10-01
supersedes:
load_when: evals
---

# Judge — [FILL: FM-ID] [FILL: failure mode]

> **Who fills:** Assay writes the rubric wording; Tally runs the validation; the product owner labels the examples.
> **When:** after the failure mode is in the catalog with a pass and a fail example.
> **Lives at:** `evals/<surface>/judges/<mode>.md` in the product repo. Delete this instruction block when you fill it.
> **What the critic checks:** nothing. The judge is trusted only after validation: 30 to 50 Pass and 30 to 50 Fail human labels in both the dev and the test set, with true-positive and true-negative rates measured.
> **Binary only.** A judge answers pass or fail for one mode. No scales, no blended scores.

## Judge prompt

```
[FILL: the instruction. Name the one failure mode, what counts as evidence,
and the output: PASS or FAIL, then one line citing the evidence.]
```

## Few-shot examples

- **Pass:** `[FILL]`
- **Fail:** `[FILL]`

## Validation

| Set  | Pass labels     | Fail labels     | True-positive rate | True-negative rate | Date     |
| ---- | --------------- | --------------- | ------------------ | ------------------ | -------- |
| dev  | `[FILL: 30–50]` | `[FILL: 30–50]` | `[FILL]`           | `[FILL]`           | `[FILL]` |
| test | `[FILL: 30–50]` | `[FILL: 30–50]` | `[FILL]`           | `[FILL]`           | `[FILL]` |
