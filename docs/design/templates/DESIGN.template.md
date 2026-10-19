---
title: DESIGN.md (template) — the product's design law
description: Fill when a product starts its design layer, or amend when a product rule changes; the product's own principles, type, color, density, voice and motion deltas on top of the canon.
layer: design
status: adopted
thread: P-B
role: Plumb
date: 2026-10-01
last_reviewed: 2026-10-01
supersedes:
load_when: ui-build, critique, spec
---

# [FILL: product] — DESIGN.md

> **Who fills:** Plumb (design director) with the founder for anything touching brand identity; Gloss (content designer) owns the Voice section.
> **When:** before the first UI build in a product repo; amended only through the changelog at the bottom, never by exception in a PR.
> **Lives at:** `docs/design/DESIGN.md` in the product repo. Delete this instruction block when you fill it.
> **What the critic checks:** every principle below is scored by the rubric line named in its "Enforced by" field, alongside `canon-rubric.md` C-R01–C-R15.
> **Filled example:** `apps/web/docs/design/DESIGN.md` (the demo app; written in Phase 3).
> **Inherits:** `docs/design/canon.md` v0.2 — principles C-P01–C-P12, anti-patterns A-01–A-20 — and the rubric C-R01–C-R15 in `canon-rubric.md`. **Do not restate a canon line.** Cite its ID, and write only what this product tightens or adds. A line here may tighten the canon; loosening one needs an amendment to the canon.
> **Budget:** the whole product layer (this file plus tokens, components, anti-patterns, states) gets about 1,700 tokens (`docs/index.md`). If this file passes about 600, it is documenting the product instead of governing it.

## The product in one sentence

`[FILL]` — who it is for and the job it does. The swap test applies: if this sentence fits any product in the category, rewrite it.

## Principles (product deltas only)

Write each principle in this form. Two to five is typical; zero is allowed when the canon is enough.

### D-P01 — `[FILL: the principle, as a claim that rules something out]`

- **Principle.** `[FILL]`
- **Example.** `[FILL: one real screen or story in this product that does it]`
- **Counter-example.** `[FILL: one that doesn't — a real or plausible screen in this product]`
- **Tightens:** `[FILL: canon ID, or "new"]`
- **Enforced by:** `[FILL: lint rule, story check, or rubric line ID — if nothing can catch a violation, rewrite the principle]`

## Type

- **Typeface:** `[FILL: token name]` — `[FILL: the one-line reason]` (C-P06; A-01 bans the unexamined default, not any one face).
- **Text styles:** `[FILL: the capped list of named styles, by token]` (C-P01: at most four per screen).
- **Tabular minimum:** `[FILL: px]` `[PROPOSED — canon CF-38 default is 12px, pending sign-off with the accessibility auditor]`.

## Color

- **Neutral temperature:** `[FILL: warm / cool / neutral, and why]` (C-P06; A-06).
- **Accent role:** `[FILL: what the accent marks in this product, and what it never marks]` (C-P05).
- **Status colors:** `[FILL: the statuses this product shows, each with its second signal (text, icon or shape)]`.

## Density, per surface

| Surface  | Density                                   | Why                                       |
| -------- | ----------------------------------------- | ----------------------------------------- |
| `[FILL]` | `[FILL: compact / default / comfortable]` | `[FILL: the user's task on this surface]` |

## Voice

Owned by the content designer. Values only; the strings live in the product.

- **Case:** `[FILL: sentence case / title case]` (tk-ui-code-lint reads this).
- **Register:** `[FILL: two or three words, each with a phrase that is in register and one that is not]`.
- **Glossary:** `docs/product/glossary.md` (canonical nouns).

## Motion (deltas over C-P11)

- `[FILL: product-specific motion rules, or "none — C-P11 and tk-motion apply as written"]`
- High-stress paths in this product: `[FILL: the flows where only opacity is allowed]`.

## Changelog

- `[FILL: YYYY-MM-DD]`: v0.1 — `[FILL: what was adopted, and the counter-example each amendment retired]`.
