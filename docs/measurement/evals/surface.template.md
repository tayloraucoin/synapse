---
title: Eval surface card (template)
description: Fill when a product ships an AI surface that makes claims to users; states what the surface promises, its pass bar, owner and last run, before any judge is written.
layer: measurement
status: adopted
thread: "14"
role: Tally
date: 2026-10-01
last_reviewed: 2026-10-01
supersedes:
load_when: evals
---

# Eval surface — [FILL: surface name]

> **Who fills:** Compass names the surface that matters most; Tally owns measurement; Assay owns rubric grading; engineering owns the harness.
> **When:** before the surface ships to a real user, and before any judge or case is written (failure modes come from traces, not from imagination).
> **Lives at:** `evals/<surface>/README.md` in the product repo; cases are `evals/<surface>/cases.jsonl`, not markdown. Delete this instruction block when you fill it.
> **What the critic checks:** nothing; evals grade model output, the critic grades pixels. The CI gate blocks a release when the pass bar fails.
> **The toolkit ships no filled eval:** the demo app has no AI surface (CF-10). Thread P-I generalizes the method.

| Field                         | Value                                                                                    |
| ----------------------------- | ---------------------------------------------------------------------------------------- |
| What the surface claims to do | `[FILL: the promise a user relies on, in one sentence]`                                  |
| Grading split                 | Answer correctness and source correctness graded separately `[FILL: how each is judged]` |
| Capability vs regression      | `[FILL: which cases measure progress, which guard what already works]`                   |
| Pass bar                      | `[FILL: per judge, e.g. ≥ N% pass on the test set]`                                      |
| Failure modes                 | [`failure-modes.md`](failure-modes.template.md) — `[FILL: count]` binary modes           |
| Judges                        | `[FILL: one per failure mode, each validated against human labels]`                      |
| Owner                         | `[FILL]`                                                                                 |
| Cost per run                  | `[FILL]`                                                                                 |
| Last run                      | `[FILL: YYYY-MM-DD, result, commit]`                                                     |

## Changelog

- `[FILL: YYYY-MM-DD]`: `[FILL: case additions, judge revisions, bar changes — a moved goalpost is recorded here]`.
