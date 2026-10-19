---
title: "ux state (template) — one state of a surface, paired with every artboard that draws it"
description: "Fill at a UX handoff from Paper, one per state, as <area>/<surface>/states/<state>.md: the artboards at every width with their page, position, note and capture, what shows top to bottom, the board's note in full, the rulings and the variations not picked."
layer: design
status: draft
thread:
role: Vesper
date: 2026-10-12
last_reviewed: 2026-10-12
supersedes:
load_when: spec, ui-build
---

# [FILL: surface] — [FILL: state]

> **Who fills:** Vesper; Gloss for the words.
> **When:** the UX handoff pass from Paper (`docs/workflows/stages/ux.md` §4). One file per state, whatever the number of widths: a `boards:` entry per artboard. Split by width (`states/<state>/<width>.md`) only past the cap.
> **Lives at:** `specs/<app>/epics/<EPIC>-<slug>/ux/<area>/<surface>/states/<state>.md`, with `target:` mirroring the path; the surface's `index.md` sits above it.
> **What the check enforces:** `check-specs` caps it at 2,000 tokens; `boards:` is required (each entry with `name:` and `page:`), or `boards: []` with `not_drawn:`; every artboard listed is in the coverage index (`ux/boards/`) as `specced` and carried by this file, and no other file claims it. Delete this block when you fill it.

```yaml
target: specs/<app>/ux/<area>/<surface>/states/<state>.md
status: draft
promoted:
boards: # one entry per artboard that draws this state, phone and desk
  - name: "<surface> / <state> / <width> / <scheme>" # exactly as in Paper
    page: "" # the Paper page, by name
    at: [0, 0] # x, y on the page
    note: "" # "Note · …" artboard, or "Notes · … @ x <n>" for a strip
    capture: specs/<app>/epics/<EPIC>-<slug>/ux/<area>/<surface>/captures/<state>-<width>.png
not_picked: # variations drawn for this state and not chosen
  - name: ""
    ruled: D-<EPIC>-n
rulings: [] # the D-lines that ruled this state
# not_drawn: "the reason", when boards: is []
```

## What shows, top to bottom

From the surface's layout, only what this state changes; a subsection per width where they differ. [FILL]

## What the person can do

Each control live in this state and where it goes. [FILL]

## Words

The strings only this state shows. [FILL]

## The notes on the boards

Each artboard's note, in full, under its artboard name. [FILL]

## Rulings

Per D-line, what it decided for this state, in a sentence; the full line stays in the decision log. Then each variation not picked and why. [FILL]

## Widths

Drawn at: [FILL]. Not drawn at: [FILL: what that width does, with its D-line, or `[NEEDS DECISION]`].

## Criteria

| ID                         | When   | Then | Evidence |
| -------------------------- | ------ | ---- | -------- |
| C-[EPIC]-[surface]-[state]-1 | [FILL] |      | capture  |
