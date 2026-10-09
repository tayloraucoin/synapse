---
title: states.md (template) — the required state matrix
description: Fill when a surface or component is added, so every reachable state is designed, backed by a story, and capturable by the critic through ?state=.
layer: design
status: adopted
thread: P-B
role: Vesper
date: 2026-10-01
last_reviewed: 2026-10-01
supersedes:
load_when: ui-build, critique, spec
---

# [FILL: product] — states.md

> **Who fills:** Vesper (screen designer) per surface; the accessibility auditor adds the access criteria for each state; Gloss writes the strings.
> **When:** in shaping, before the package goes to the table (the package's States table copies its rows from here).
> **Lives at:** `docs/design/states.md` in the product repo. Delete this instruction block when you fill it.
> **What the critic checks:** C-R10. Every row below must be reachable by its `?state=` key and captured at 390, 834 and 1440, light and dark. A state the critic cannot capture is UNVERIFIED, never passed (C-R01). A missing state or invisible focus is Blocking.
> **Filled example:** `apps/web/docs/design/states.md` (Phase 3; the demo makes every state reachable by URL).
> **Inherits:** C-P07 (interactive states) and C-P08 (every reachable state designed). The base set is empty, loading, error, partial, offline, success; add product states, never drop base ones (mark a base state N/A with the reason instead).
> **Keyed per surface and per component** (R14 §5): a surface row covers the screen; a component row covers a component wherever it appears.

## Surfaces

| Surface         | State   | `?state=` | What shows                                      | First action offered | Controls hidden                              | Story    |
| --------------- | ------- | --------- | ----------------------------------------------- | -------------------- | -------------------------------------------- | -------- |
| `[FILL: route]` | empty   | `empty`   | `[FILL: what will be here, in one sentence]`    | `[FILL]`             | `[FILL: controls that would act on nothing]` | `[FILL]` |
| `[FILL]`        | loading | `loading` | `[FILL: skeleton of the final layout]`          | —                    | `[FILL]`                                     | `[FILL]` |
| `[FILL]`        | error   | `error`   | `[FILL: what failed and how to fix it]`         | `[FILL]`             | `[FILL]`                                     | `[FILL]` |
| `[FILL]`        | partial | `partial` | `[FILL]`                                        | `[FILL]`             | `[FILL]`                                     | `[FILL]` |
| `[FILL]`        | offline | `offline` | `[FILL]`                                        | `[FILL]`             | `[FILL]`                                     | `[FILL]` |
| `[FILL]`        | success | `success` | `[FILL: the outcome, in the action's own verb]` | `[FILL]`             | —                                            | `[FILL]` |

## Components

| Component | Rest     | Hover    | Focus                                | Active   | Selected                                        | Disabled | Error    | Story    |
| --------- | -------- | -------- | ------------------------------------ | -------- | ----------------------------------------------- | -------- | -------- | -------- |
| `[FILL]`  | `[FILL]` | `[FILL]` | `[FILL: ring token, always visible]` | `[FILL]` | `[FILL: whole-element treatment plus a marker]` | `[FILL]` | `[FILL]` | `[FILL]` |

## Loading thresholds

`[FILL: "per tk-motion catalog" / product thresholds]` — the motion catalog's defaults are show nothing for 200ms, then a skeleton held at least 400ms `[INFERRED in thread 07; validate on real latency]`.

## Changelog

- `[FILL: YYYY-MM-DD]`: `[FILL]`.
