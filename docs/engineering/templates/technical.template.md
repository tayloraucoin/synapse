---
title: "technical.md (template) — an epic's placement, data contract and one-way doors"
description: "Fill at the Technical stage of an epic, after the UX files are approved: where the code goes and why, the data contract, the one-way doors with their records, the calls routed to Taylor, and the test shape per risk."
layer: engineering
status: draft
thread: P-J
role: Mason
date: 2026-10-02
last_reviewed: 2026-10-02
supersedes:
load_when:
---

# [FILL: EPIC] — technical notes

> **Who fills:** Mason, at the Technical stage (`docs/workflows/stages/technical.md`), time-boxed to ninety minutes or the cycle charter's limit.
> **When:** after every UX file is `approved`, before any ticket is cut.
> **Lives at:** `specs/<app>/epics/<EPIC>-<slug>/technical.md`, or `technical/` with one file per section when it passes 2,000 tokens.
> **What the check enforces:** `check-specs` (J5) caps `technical.md` at 2,000 tokens; the one-way doors listed here are matched against `toolkit.json`'s reviewer rows by `risk-tier` (J8); an unratified one-way door blocks the Tickets stage. Delete this block when you fill it.

## Appetite verdict

Possible in the brief's appetite: yes, or no with what to cut. [FILL]

## Placement

Decided by one question: who imports this? Exact paths, per `docs/engineering/codebase-conventions.md` §1. [FILL]

| What   | Path | Consumer | Why here |
| ------ | ---- | -------- | -------- |
| [FILL] |      |          |          |

## Data contract

Types, validation at the boundary, where each piece of state lives (URL, server, form, local). [FILL]

## One-way doors

| Door                                                           | Path glob | Record or ratification     | Reviewer |
| -------------------------------------------------------------- | --------- | -------------------------- | -------- |
| [FILL: schema, migration, auth, billing, boundary, public API] |           | REC NNNN or "ratify below" |          |

## Calls routed to Taylor

Each with one recommendation and the cost of being wrong. [FILL]

## Test shape per risk

Per `docs/engineering/test-strategy.md` when it exists (J11); until then Touchstone's rule: pure logic gets unit tests, owned boundaries get integration tests against real infrastructure, journeys get end-to-end, combinatorial risk gets generated inputs, UI gets captures. [FILL]

## Rabbit holes

Each patched in one sentence or declared out of bounds. [FILL]
