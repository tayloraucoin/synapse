---
title: "as-built.md (template): what shipped, written at close"
description: "Fill when a ticket's criteria are proven and before its reviewers run: what shipped against the contract, every deviation with its reason, and what is not verified."
layer: engineering
status: draft
thread: P-J
role: Scribe
date: 2026-10-02
last_reviewed: 2026-10-02
supersedes:
load_when: on request
---

# As-built — [FILL: id]

> **Who fills:** the builder, at close (`tk-batch`), never a reviewer. Written at Q2 and Q3, or when something deviated.
> **When:** after `yarn contract:run` and `yarn contract:record` have proven every non-review criterion, and before any review: reviewers read it. Keep it short: a line per criterion, not an account of the work.
> **Lives at:** `as-built.md` in the ticket's folder, beside `contract.md` and `results.json`. Keep the four headings exactly; delete this instruction block and the `[FILL]` markers.
> **What the check enforces:** `check-specs`: the four sections; every `manual` criterion named under Not verified. A ticket with a migration adds `## Migrations` with `applied:` (`n/a`, `pending` or a date; `pending` shows as "code complete, migration pending", never done). A ticket that deletes, skips or weakens a test adds `## Test changes`; on a one-off that requires `review:vigil`. Once merged the file is immutable except the `applied:` value.
> **Filled example:** `specs/web/one-offs/` (P-C).

## Shipped against the contract

`[FILL: one line per criterion id: what shipped that meets it]`

## Deviations

`[FILL: each departure from the contract and each [ASSUMPTION], with why; or "none"]`

## Not verified

`[FILL: each manual criterion by id, and anything no criterion proves; or "none"]`

## Next

`[FILL: one human line: what should happen next]`
