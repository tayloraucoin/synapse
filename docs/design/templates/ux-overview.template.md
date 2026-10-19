---
title: "ux overview (template) — one area of the app: frame, routes, decision log"
description: "Fill at the UX stage of an epic, one per area the epic touches, mirroring specs/<app>/ux/<area>/overview.md; it frames the area, lists its routes and surfaces, and logs every decision with an ID."
layer: design
status: draft
thread: P-J
role: Vesper
date: 2026-10-02
last_reviewed: 2026-10-08
supersedes:
load_when: spec
---

# [FILL: area] — overview

> **Who fills:** Vesper, at the UX stage (`docs/workflows/stages/ux.md`), interviewing Taylor in numbered rounds.
> **When:** before any surface file in the area; one overview per area.
> **Lives at:** `specs/<app>/epics/<EPIC>-<slug>/ux/<area>/overview.md` as a proposal, with `target: specs/<app>/ux/<area>/overview.md`; promotion copies it to the target (A8).
> **What the check enforces:** `check-specs` (J5) caps it at 1,500 tokens, requires `target`, `status` (`draft` or `approved`) and `promoted` in the frontmatter, and refuses a ticket that cites it while it holds `[NEEDS DECISION — BLOCKING]`.
> **Filled example:** the demo's first epic (P-C). **Status:** draft until Plumb signs the shape (held list). Delete this block when you fill it.

```yaml
target: specs/<app>/ux/<area>/overview.md
status: draft
promoted:
```

## Frame

Who uses this area, for what job, and in what state they arrive. One paragraph. [FILL]

## Routes and surfaces

| Route  | Surface file   | Entry from | Exit to |
| ------ | -------------- | ---------- | ------- |
| [FILL] | `<surface>.md` |            |         |

## Navigation and shell

What the shell shows here and what is hidden; where this area sits in the product's navigation (`_global/navigation.md`). [FILL]

## Design

Only when the Design stage was chosen: the Paper file and page the operator named, and the lock date. [FILL, or delete]

## Decision log

| ID         | Decision | Why | Date |
| ---------- | -------- | --- | ---- |
| D-[EPIC]-1 | [FILL]   |     |      |

## Open

`[NEEDS DECISION]` items, each with the recommended default. A `[NEEDS DECISION — BLOCKING]` stops every ticket that cites this area.
