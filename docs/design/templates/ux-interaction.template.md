---
title: "ux interaction (template) — a flow that crosses surfaces, or an overlay opened from several"
description: "Fill at a UX handoff from Paper, one per flow, as ux/interactions/<flow>.md (or <flow>/index.md with states/): where it starts, each step in order with the board that draws it, the rules it keeps, the dev note it carries, and the surfaces it passes through."
layer: design
status: draft
thread:
role: Vesper
date: 2026-10-12
last_reviewed: 2026-10-12
supersedes:
load_when: spec, ui-build
---

# [FILL: the flow]

> **Who fills:** Vesper; Gloss for the words.
> **When:** the UX handoff pass from Paper (`docs/workflows/stages/ux.md` §4). A flow belongs here when it crosses surfaces (Move to, a hand-off) or is an overlay opened from several (an icon picker, an Add sheet). A flow drawn as several states of its own becomes `ux/interactions/<flow>/index.md` with `states/<step>.md` (`ux-state.template.md`).
> **Lives at:** `specs/<app>/epics/<EPIC>-<slug>/ux/interactions/<flow>.md`, with `target:` mirroring the path.
> **What the check enforces:** `check-specs` caps it at 2,000 tokens; `boards:` is required, empty when the flow carries no artboard of its own and only cites the states it passes through; `dev_note:` names the canvas dev note it carries, which the coverage index lists as `dev note` carried by this file. Delete this block when you fill it.

```yaml
target: specs/<app>/ux/interactions/<flow>.md
status: draft
promoted:
boards: [] # artboards this file carries (same shape as a state's)
dev_note: "" # "Dev note · …", when this flow carries one
rulings: []
```

## Where it starts

Each surface and control that opens it, linked to that surface's `index.md`. [FILL]

## Steps

In order. Each step: what the person does, what the app does, and the board that draws it, quoted, with the file that carries it.

| #   | The person | The app | Board (carried by) |
| --- | ---------- | ------- | ------------------ |
| 1   | [FILL]     |         |                    |

## Rules

What always holds across the flow: undo, what is saved when, what happens offline, what never happens. [FILL]

## The dev note

The canvas dev note, in full, when this flow carries one. [FILL]

## Rulings

Per D-line, what it decided for this flow, in a sentence. [FILL]

## Criteria

| ID                    | When   | Then | Evidence |
| --------------------- | ------ | ---- | -------- |
| C-[EPIC]-[flow]-1     | [FILL] |      |          |
