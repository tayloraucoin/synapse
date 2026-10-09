---
title: Glossary (template) — canonical nouns
description: Fill when a product names an object users see, or when two names for one thing appear in copy, code or events; one name per object, everywhere.
layer: product
status: adopted
thread: P-B
role: Gloss
date: 2026-10-01
last_reviewed: 2026-10-01
supersedes:
load_when: spec, copy
---

# [FILL: product] glossary

> **Who fills:** Gloss (content designer) owns it; Compass proposes product nouns; Tally checks event and metric names against it.
> **When:** before the first package names a user-facing object, then whenever a review finds a second name for one thing.
> **Lives at:** `docs/product/glossary.md` in the product repo. Delete this instruction block when you fill it.
> **What the critic checks:** C-R05 flags an action label that isn't the outcome verb; a string that uses a "never" term from this file is a Should-fix finding citing the term.
> **Cap:** about 60 lines. Past that, split per surface or per product line (Toolkit Map §5, displacement).

| Term     | Means                                              | Never call it                          | In code and events                  | Owner    |
| -------- | -------------------------------------------------- | -------------------------------------- | ----------------------------------- | -------- |
| `[FILL]` | `[FILL: one sentence a new user would understand]` | `[FILL: the synonyms that are banned]` | `[FILL: identifier, if it differs]` | `[FILL]` |

## Rules

- One name per object, in the UI, the code and the event names.
- The UI uses the term exactly; plurals and possessives follow normal English.
- A rename is a changelog entry and a sweep of strings, code and events in the same change (event renames follow `docs/measurement/metrics/events.template.md` versioning).

## Changelog

- `[FILL: YYYY-MM-DD]`: `[FILL]`.
