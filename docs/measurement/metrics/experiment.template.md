---
title: Experiment plan (template) — the pre-registered rule
description: Fill before a flag flips for a variant, flagged trial or controlled experiment; the success, kill and stopping rules written before any data exists.
layer: measurement
status: adopted
thread: "03"
role: Tally
date: 2026-10-01
last_reviewed: 2026-10-01
supersedes:
load_when: metrics, spec
---

# Experiment plan — [FILL: flag key]

> **Who fills:** Tally drafts the measurement fields; the shaper writes the hypothesis and signs the rules.
> **When:** before any code for the variant, and dated before the flag flips. A rule written after the data is not pre-registered.
> **Lives at:** the package's Instrumentation section links this file at `specs/<feature>/experiment.md`. Delete this instruction block when you fill it.
> **What the critic checks:** nothing. The procedure is [`variant-testing.md`](../../runbooks/variant-testing.md); this file is the form it asks for.

## Plausibility (runbook §8)

- `[FILL: "flagged trial" / "controlled experiment"]` — units expected in the window: `[FILL]`; per-arm N needed at an MDE of `[FILL: ≤50%]`: `[FILL]` (`N per arm = 16 × variance / d²`).

## Pre-registered rule

> **Hypothesis:** `[FILL: change]` moves `[FILL: METRIC-ID vN]` without raising `[FILL: guardrail]`.
> **Cohort and window:** `[FILL: named accounts or cohort]`, whole weeks, `[FILL: start]` to `[FILL: end]`.
> **Comparison:** `[FILL: within each account against its own prior period / randomized arms]`. With no prior data, this run sets the baseline and cannot be graded a win.
> **Ship if all hold:** `[FILL]`.
> **Kill immediately if:** `[FILL: the one event that proves harm]`; `[FILL]`.
> **Otherwise:** iterate.

## Stopping rule (controlled experiments only)

- `[FILL: fixed horizon on DATE / frequentist with sequential testing]`. Bayesian is not a license to peek.
- The SRM indicator fires: stop and fix the wiring before reading anything.

## Confounders named in advance

- `[FILL: learning effect, unit size, model or algorithm version mid-window, facilitated sessions, day-of-week mix]`.

## What this scale can't tell us

- `[FILL: two to four lines, written now, so the readout cannot overclaim later]`.
