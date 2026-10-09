---
title: Failure-mode catalog (template)
description: Fill after error analysis on real or realistic traces of an AI surface; one binary failure mode per row, each with a pass and a fail example, before any judge prompt is written.
layer: measurement
status: adopted
thread: "14"
role: Tally
date: 2026-10-01
last_reviewed: 2026-10-01
supersedes:
load_when: evals
---

# Failure modes — [FILL: surface name]

> **Who fills:** Tally, from error analysis; Assay checks that each mode is binary and observable.
> **When:** after reading at least 100 real or realistic traces (labeled synthetic if synthetic). Error analysis is the most important activity in evals; generic "hallucination" or Likert scores are not failure modes.
> **Lives at:** `evals/<surface>/failure-modes.md` in the product repo. Delete this instruction block when you fill it.
> **What the critic checks:** nothing. Each mode gets its own judge ([`judge.template.md`](judge.template.md)).
> **Starting set for any surface that cites sources** (thread 14, Primer 16, generalized): an unsupported claim; a citation to the wrong span; a correct claim with no source; a refusal when an answer exists; a numeric mismatch with the source. Keep the ones the traces show; add what they reveal.

| ID    | Failure mode (binary) | Pass example | Fail example | Frequency in traces | Judge                      |
| ----- | --------------------- | ------------ | ------------ | ------------------- | -------------------------- |
| FM-01 | `[FILL]`              | `[FILL]`     | `[FILL]`     | `[FILL: n of N]`    | `[FILL: judges/<mode>.md]` |

## Trace sample

- `[FILL: how many traces, where from, date range, what was excluded]`.
