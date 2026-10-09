---
title: anti-patterns.md (template) — the product's no-gos and model defaults
description: Fill when a product names a tell or no-go beyond the canon's twenty, or when the team switches models and needs the new model's unprompted defaults recorded.
layer: design
status: adopted
thread: P-B
role: Plumb
date: 2026-10-01
last_reviewed: 2026-10-01
supersedes:
load_when: ui-build, critique
---

# [FILL: product] — anti-patterns.md

> **Who fills:** Plumb, from critic findings, replays and reviews. Never promote one screenshot, one shipped file or one reviewer comment into a rule by itself (ledger WT-41).
> **When:** when the same tell appears twice, or at every model switch for the model-defaults section.
> **Lives at:** `docs/design/anti-patterns.md` in the product repo. Delete this instruction block when you fill it.
> **What the critic checks:** C-R14 checks every entry here by ID, together with the canon's A-01–A-20. Product no-gos default to Should-fix; mark Blocking only for entries that break a binding product promise.
> **Filled example:** `apps/web/docs/design/anti-patterns.md` (Phase 3).
> **Inherits:** `canon.md` §2, A-01–A-20, banned on every product surface. **Do not restate them.** This file is canonical for this product's additions only (CF-02: one place per rule).

## Product no-gos

Name the tell the way people will see it.

| ID    | Tell     | Why it is wrong here | On-system alternative | Enforced by                                 | Severity |
| ----- | -------- | -------------------- | --------------------- | ------------------------------------------- | -------- |
| P-A01 | `[FILL]` | `[FILL]`             | `[FILL]`              | `[FILL: lint, grep, story check, or C-R14]` | `[FILL]` |

## Model defaults

What each model in use reaches for unprompted, observed in this repo (R09 amendment 5). Record your own observations; published per-model lists date quickly. Update this section whenever the team switches or upgrades a model, and re-run the critic calibration then (`docs/index.md`, "Changing the practice").

| Model              | Observed on          | Reaches for unprompted | Counter-instruction that works                      |
| ------------------ | -------------------- | ---------------------- | --------------------------------------------------- |
| `[FILL: model ID]` | `[FILL: YYYY-MM-DD]` | `[FILL]`               | `[FILL: canon or product ID to cite in the prompt]` |

## Changelog

- `[FILL: YYYY-MM-DD]`: `[FILL: entry added or retired, and the finding that prompted it]`.
