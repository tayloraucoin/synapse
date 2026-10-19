---
title: "ux boards (template) — the coverage index of one Paper page"
description: "Fill at a UX handoff from Paper, one per page, as ux/boards/<page>.md: every artboard on the page by its exact name, with its position, a status and the spec file that carries it, so that every board being represented in the spec is checkable."
layer: design
status: draft
thread:
role: Vesper
date: 2026-10-12
last_reviewed: 2026-10-12
supersedes:
load_when: spec
---

# [FILL: the Paper page]

> **Who fills:** the UX handoff pass (`docs/workflows/stages/ux.md` §4), after mapping the page row by row (row labels first, then each row's artboards by their `top`; a whole-page query stops at 200 nodes).
> **Lives at:** `specs/<app>/epics/<EPIC>-<slug>/ux/boards/<page>.md`, split by row into `ux/boards/<page>/<row>.md` past the cap. No `target:`: it records the Paper file at handoff and is never promoted.
> **What the check enforces:** `check-specs` caps it at 4,000 tokens and reads the table. Every status is one of the nine below. A `specced` or `dev note` row names a carrier that lists the artboard (`boards:` or `dev_note:`), and every artboard a carrier lists is here. A `specced` name reads `<surface> / <state> / <width> / <scheme>`. A `not picked` row cites a D-line; a `superseded` row names its ruling and the carrier of its replacement. Delete this block when you fill it.

```yaml
page: "" # the Paper page, by name
page_id: "" # e.g. p-6-0
file: "" # the Paper file ID
mapped: # date the page was mapped
status: draft
```

**Statuses:** `specced` (a state or flow step; carried by its spec file) · `not picked` (a variation; the D-line that chose another) · `superseded` (replaced by a later frame; the ruling, and the carrier of the replacement) · `archived` (an archive row or a direction kept for the record) · `note` (a note artboard or notes strip; carried by the file of the frame it sits under, or `—` for a strip) · `dev note` (carried in full by an interaction or a `dev-notes/` file) · `row label` · `progress` · `safe to delete`.

## [FILL: row label]

| Artboard | x   | y   | Status | Carried by | Ruling |
| -------- | --- | --- | ------ | ---------- | ------ |
| `[FILL]` |     |     |        |            |        |
