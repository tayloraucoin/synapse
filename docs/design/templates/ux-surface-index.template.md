---
title: "ux surface index (template) — a surface's base in the ledger of the boards"
description: "Fill at a UX handoff from Paper, one per surface, as <area>/<surface>/index.md: the job, entry and exit, layout top to bottom, the primary action, words, access, criteria, the Platforms section and the interactions opened here; each state gets its own file beside it."
layer: design
status: draft
thread:
role: Vesper
date: 2026-10-12
last_reviewed: 2026-10-12
supersedes:
load_when: spec, ui-build
---

# [FILL: surface] — [FILL: area]

> **Who fills:** Vesper; Gloss writes the strings; Threshold writes the access section.
> **When:** the UX handoff pass from Paper (`docs/workflows/stages/ux.md` §4, the ledger of the boards). Every state is its own file in `states/` (`ux-state.template.md`); a flow that crosses surfaces is in `ux/interactions/` (`ux-interaction.template.md`).
> **Lives at:** `specs/<app>/epics/<EPIC>-<slug>/ux/<area>/<surface>/index.md`, with `target: specs/<app>/ux/<area>/<surface>/index.md`. Never beside a flat `<area>/<surface>.md`.
> **What the check enforces:** `check-specs` caps it at 2,000 tokens; past that, move detail into `states/` and `interactions/`, never trim it. **The detail test:** a fresh thread could build the surface from this file, its states and the interactions it names, without asking a question. Delete this block when you fill it.

```yaml
target: specs/<app>/ux/<area>/<surface>/index.md
status: draft
promoted:
design:
  file: # the Paper file, by name and ID
  pages: [] # every page that draws this surface
  rows: [] # "<page> · <row label>", each row holding its boards
  locked: # date
```

## Job

What the person is doing here and what done looks like for them. [FILL]

## Entry and exit

Every way in (from which surface, by which control) and every way out. [FILL]

## Layout, top to bottom

Each region in order, the `@syn/ui` component that draws it, and what it holds; the state files describe only what differs. An element drawn on the canvas that is not a house primitive is named with its Plumb proposal, never as a lookalike. [FILL]

## Primary action

The one action, and where it sits at each width. [FILL]

## States

One row per file in `states/`; the file holds what shows and the boards.

| State  | File                   | Widths drawn | One line |
| ------ | ---------------------- | ------------ | -------- |
| [FILL] | `states/<state>.md`    | 402, 1728    |          |

## Platforms

Each width the boards draw (phone, desk), what changes between them, and what exists at one width only, each with its D-line. A width not drawn: what it does, or `[NEEDS DECISION]`. [FILL]

## Interactions opened here

Each flow or shared overlay that starts on this surface, linked to its file in `ux/interactions/`. [FILL]

## Words

Every string that is the same in every state, by Gloss; state-only strings sit in the state file. [FILL]

## Access

Keyboard path and focus order; the accessible name of every control; what is announced on change; reduced motion. [FILL]

## Instrumentation

Events this surface fires and what must never be in their payloads. [FILL]

## Criteria

| ID                   | When   | Then | Evidence |
| -------------------- | ------ | ---- | -------- |
| C-[EPIC]-[surface]-1 | [FILL] |      | capture  |

## Decisions and open items

`D-<EPIC>-n` references; `[NEEDS DECISION]` with defaults; `[NEEDS DECISION — BLOCKING]` only when a ticket could not start.
