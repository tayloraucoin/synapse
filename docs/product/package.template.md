---
title: Package (template) — the shaped bet
description: Fill after "Frame go" to make a framed problem buildable; the package goes to the betting table and is what builders, the critic and the measurement owner work from.
layer: product
status: draft
thread: "05"
role: Compass
date: 2026-10-01
last_reviewed: 2026-10-01
supersedes:
load_when: spec, ui-build, critique
---

# Package — [FILL: feature name]

> **Who fills:** the shaper; a builder in the technical shaping session; Tally for the instrumentation section; the design director for constraint exceptions.
> **When:** after "Frame go", posted at least 24 hours before the table.
> **Lives at:** `specs/<feature>/package.md`.
> **What the critic checks:** the critic scores the build against the States, Expected action, Job lines and Verification sections.
> **Rule:** a package with an empty field does not go to the table.

## Solution (one page)

- **Breadboard:** `[FILL]` — places, affordances, and the connections between them. No styling.
- **Fat-marker sketch:** `[FILL]` — link or image, broad strokes only, leaving the builders room to design.

## Expected action

- `[FILL]` — at each decision point, the one action the user is expected to take. The critic checks it against "one primary action" (C-P02).

## Constraints

- Design system only: `docs/design/canon.md` plus the product's design layer. No raw values, no new primitive without a justification here.
- `[FILL: product-critical constraint]` — the product's own binding promise (for example: every computed figure shows its source).

## Rabbit holes

| Risk     | How it was resolved (spike, prototype, or decision) | Evidence                                                                             |
| -------- | --------------------------------------------------- | ------------------------------------------------------------------------------------ |
| `[FILL]` | `[FILL]`                                            | `[FILL: prototype branch or decision record; prototypes are evidence, never merged]` |

## Non-goals

- `[FILL]` — use cases and cases this bet will not cover.

## States

| Surface  | States (from `states.md`)                                       | Reachable by |
| -------- | --------------------------------------------------------------- | ------------ |
| `[FILL]` | empty, loading, error, partial, offline, success, plus `[FILL]` | `?state=`    |

## References

- `[FILL]` — 3 to 6 annotated references in `refs/`: the one thing to take from each and the one thing to ignore.

## Job lines (media and motion)

- `[FILL]` — one line per image or motion: the job it does (C-P11, C-P12). No line, no asset.

## Acceptance criteria

- `[FILL]` — testable criteria in EARS form ("When …, the system shall …").

## Verification

- **Rubric additions:** `[FILL]` — lines beyond the canon this feature needs.
- **Domain edge cases** for the day-7 pass: `[FILL]`.

## Instrumentation

| Event (ID from `events.md`) | Trigger  | Properties | Feeds                  |
| --------------------------- | -------- | ---------- | ---------------------- |
| `[FILL]`                    | `[FILL]` | `[FILL]`   | metric ID or guardrail |

- **Flag:** `[FILL: key]`; exposure event `[FILL]`.
- **Pre-registered rule:** see `docs/runbooks/variant-testing.md` §5.
