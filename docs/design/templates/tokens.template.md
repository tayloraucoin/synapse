---
title: tokens.md (template) — the token role table
description: Fill when a product defines or changes a design token; holds each token's role and reason, while the values themselves live in code.
layer: design
status: adopted
thread: P-B
role: Plumb
date: 2026-10-01
last_reviewed: 2026-10-01
supersedes:
load_when: ui-build, critique
---

# [FILL: product] — tokens.md

> **Who fills:** Plumb rules on every token (accept with its name and scale position, reject with the existing token that already serves, or defer with the evidence that would change the answer). The builder writes the value into code.
> **When:** before the first component is styled; afterwards only through a token ruling recorded in the changelog below.
> **Lives at:** `docs/design/tokens.md` in the product repo. **Canonical values live in code** (`packages/config/tailwind/preset.css` in this monorepo pattern); this file holds roles and reasons, never a second copy of a value that could drift. Delete this instruction block when you fill it.
> **What the critic checks:** C-R08 (tokens only), C-R04 (type sizes and floors), C-R06 (spacing steps), C-R07 (elevation), C-R09 (color roles and contrast). The token lint (`@pem/config/eslint/tokens`) rejects raw values before the critic ever sees them.
> **Filled example:** `apps/web/docs/design/tokens.md` (Phase 3).
> **Inherits:** C-P06 (everything visual is a token) and the motion values in `tk-motion` `references/values.md`. List only this product's choices.

## Color

One role per token (C-P05). Ramps are OKLCH; every surface pair is defined in every theme.

| Token    | Role (the one meaning) | Light / dark pair | Contrast on its surfaces               |
| -------- | ---------------------- | ----------------- | -------------------------------------- |
| `[FILL]` | `[FILL]`               | `[FILL]`          | `[FILL: ratio, passes 4.5:1 for text]` |

- **Neutral ramp temperature:** `[FILL]`, stated once (C-P06; A-06).
- **Accent:** `[FILL: token]`, at roughly 10 percent of a surface or less.

## Type

| Text style token | Use                                                | Size / line height / weight |
| ---------------- | -------------------------------------------------- | --------------------------- |
| `[FILL]`         | `[FILL: reading text / heading / label / tabular]` | `[FILL]`                    |

- **Font token:** `[FILL]` — `[FILL: reason]`.
- **Reading text floor:** 16px (C-P01). **Tabular minimum:** `[FILL]` (see `DESIGN.md`).

## Spacing

- **Allowed steps:** `[FILL: the list; everything else is off-system]` (C-P04).
- **Rule:** space between groups is always greater than space within a group.
- **Widths:** prose max `[FILL: about 65–75ch]`; form max `[FILL]`.

## Radius

| Tier                             | Token    | Used by                   |
| -------------------------------- | -------- | ------------------------- |
| `[FILL: small / medium / large]` | `[FILL]` | `[FILL: component tiers]` |

## Elevation

Closed scale (C-P06). Nothing casts a shadow outside its level; in dark themes elevation is expressed by lighter surfaces.

| Level   | Token    | Used by  |
| ------- | -------- | -------- |
| resting | `[FILL]` | `[FILL]` |
| raised  | `[FILL]` | `[FILL]` |
| overlay | `[FILL]` | `[FILL]` |
| modal   | `[FILL]` | `[FILL]` |

## Motion

- `[FILL: "values.md as written" / the deltas, each with its reason]`. Durations stay at 300ms or less (C-P11).

## Changelog

- `[FILL: YYYY-MM-DD]`: `[FILL: token ruling — accepted, rejected or deferred, with the citation]`.
