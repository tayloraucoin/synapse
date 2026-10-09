---
title: Readout (template) — what moved, and what this scale can't tell us
description: Fill in cool-down for what shipped this cycle, and at the close of every variant window; answers two questions in order and stops when nothing moved.
layer: measurement
status: adopted
thread: "03"
role: Tally
date: 2026-10-01
last_reviewed: 2026-10-01
supersedes:
load_when: metrics
---

# Readout — [FILL: cycle N or variant key], [FILL: YYYY-MM-DD]

> **Who fills:** Tally drafts; the shaper interprets and decides.
> **When:** one per cycle, in cool-down (charter §11a), plus one at the close of each variant window. No weekly readout (CF-44).
> **Lives at:** `docs/metrics/readouts/YYYY-MM-DD-<slug>.md` in the product repo, or appended to the running readout log. Delete this instruction block when you fill it.
> **What the critic checks:** nothing. Tally's own tests apply: every number carries its count, denominator, segment and interval; inconclusive is recorded as inconclusive, never as "trending positive".
> **If nothing moved, say so in two lines and stop.**

## 1. What moved?

| Metric (ID vN) | Count / denominator | Segment  | Interval             | Explained by (replay, quote) |
| -------------- | ------------------- | -------- | -------------------- | ---------------------------- |
| `[FILL]`       | `[FILL]`            | `[FILL]` | `[FILL: Wilson 95%]` | `[FILL — or "unexplained"]`  |

- **Guardrails:** `[FILL: each guardrail, read against its breach level]`.
- **Against the pre-registered rule:** `[FILL: ship / kill / iterate / inconclusive, quoting the rule from the package]`.

## 2. What can't this scale tell us?

Two to four lines, each paired with the cheapest way to find out (another window, more units, a new event, a ride-along).

- `[FILL]` — cheapest way to find out: `[FILL]`.

## Quarterly line (first readout of each quarter)

- Experiment thresholds rechecked (`variant-testing.md` §8): `[FILL: which of the four hold, with numbers]`.
