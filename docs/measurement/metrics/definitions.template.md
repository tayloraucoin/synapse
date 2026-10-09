---
title: Metric definitions (template) — versioned, both series kept
description: Fill when a metric is named in a brief, or when a metric's formula, denominator or window changes; the definition is a public API with a version and a changelog.
layer: measurement
status: adopted
thread: "03"
role: Tally
date: 2026-10-01
last_reviewed: 2026-10-01
supersedes:
load_when: metrics, spec
---

# [FILL: product] metric definitions

> **Who fills:** Tally. Compass names which signal matters; Tally defines how it is measured and how far it can be trusted.
> **When:** before a brief cites the metric (the brief's Metric field takes an ID and version from here), and at every change.
> **Lives at:** `docs/measurement/metrics/definitions.md` in the product repo. Definitions never live in a brief: a brief retires when its feature ships (CF-09). Delete this instruction block when you fill it.
> **What the critic checks:** nothing. A definition change without a changelog entry is meant to fail CI (thread P-G).
> **Versioning:** a definition change bumps the version and keeps both series reported side by side until the old one is retired in the changelog. The trend line never silently changes meaning.

## [FILL: METRIC-ID] — [FILL: name] v[FILL: 0.1]

| Field                                 | Definition                                                                                                        |
| ------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Meaning                               | `[FILL: what it measures, in one sentence a stakeholder can repeat]`                                              |
| Formula (primary)                     | `[FILL: in event IDs from events.md]`                                                                             |
| Companion (always reported alongside) | `[FILL: the number that stops the primary from hiding its losers, e.g. a reach rate beside a median]`             |
| Denominator                           | `[FILL: the units counted, and what is excluded (internal, demo, test accounts)]`                                 |
| Segment                               | `[FILL: the cuts every readout reports]`                                                                          |
| Window                                | `[FILL: and how units still short at the end are counted]`                                                        |
| Direction                             | `[FILL: which way is better, for each number]`                                                                    |
| Version                               | `[FILL: vN, YYYY-MM-DD]`                                                                                          |
| Status                                | `[FILL: proposed — needs sign-off / live / retired]`                                                              |
| Dependency                            | `[FILL: the product behavior or event this cannot be measured without, and the weaker fallback if it is missing]` |

## Guardrails

| Guardrail | Definition (event IDs) | Breach   |
| --------- | ---------------------- | -------- |
| `[FILL]`  | `[FILL]`               | `[FILL]` |

## Changelog

- `[FILL: YYYY-MM-DD]`: `[FILL: METRIC-ID] v[FILL] — what changed, why, and how long both series run`.
