---
title: components.md (template) — which component for which job
description: Fill when a product's component inventory is set or a new primitive is proposed; maps each job to its component and variant, and names the forbidden patterns.
layer: design
status: adopted
thread: P-B
role: Plumb
date: 2026-10-01
last_reviewed: 2026-10-01
supersedes:
load_when: ui-build, critique
---

# [FILL: product] — components.md

> **Who fills:** Plumb owns the inventory and rules on every new primitive; Vesper (screen designer) proposes entries from real screens.
> **When:** before convergence on the first feature; then whenever a package asks for a component the inventory lacks.
> **Lives at:** `docs/design/components.md` in the product repo. Delete this instruction block when you fill it.
> **What the critic checks:** C-R03 (one primary action), C-R05 (labels and structure), C-R07 (separation and nesting), C-R11 (numbers). A screen that uses a component outside its job here is a Should-fix finding citing this file.
> **Filled example:** `apps/web/docs/design/components.md` (Phase 3).
> **Inherits:** the `shadcn` skill's composition rules (`docs/design/skills.md`) — do not restate them; delete any line here that duplicates one. C-P02, C-P03, C-P10.

## Inventory

One row per job, not per component. A component with two jobs gets two rows.

| Job                                             | Component (`@pem/ui/…`) | Variant use                           | Story                |
| ----------------------------------------------- | ----------------------- | ------------------------------------- | -------------------- |
| `[FILL: e.g. the one primary action in a view]` | `[FILL]`                | `[FILL: which variant, and when not]` | `[FILL: story path]` |

## Forbidden patterns

| Pattern  | Why      | Use instead |
| -------- | -------- | ----------- |
| `[FILL]` | `[FILL]` | `[FILL]`    |

## Domain components

Components this product needs that no library supplies (the agent-readability gap thread 04 named). Each needs a story before any feature uses it.

| Component | Job      | Story    | Status                               |
| --------- | -------- | -------- | ------------------------------------ |
| `[FILL]`  | `[FILL]` | `[FILL]` | `[FILL: proposed / built / retired]` |

## Proposing a new primitive

1. The package names the job and the existing component that almost serves.
2. Plumb rules: accept (name and place in the inventory), reject (the existing component that serves), or defer (the evidence that would change the answer).
3. Accepted primitives ship with a story per state before a feature imports them.

## Changelog

- `[FILL: YYYY-MM-DD]`: `[FILL: entry added, retired or ruled, with the reason]`.
