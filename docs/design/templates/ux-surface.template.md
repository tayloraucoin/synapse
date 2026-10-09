---
title: "ux surface (template) — one screen, flow step or component, every state, with criteria"
description: "Fill at the UX stage of an epic, one per surface, so a fresh build thread can build the surface without asking a question: layout, every state, the words, the keyboard path, and criteria with IDs a contract cites."
layer: design
status: draft
thread: P-J
role: Vesper
date: 2026-10-02
last_reviewed: 2026-10-08
supersedes:
load_when: spec, ui-build
---

# [FILL: surface] — [FILL: area]

> **Who fills:** Vesper; Gloss writes the strings; Threshold writes the access section.
> **When:** at the UX stage, after the area overview; one file per surface, split when it passes 2,000 tokens.
> **Lives at:** `specs/<app>/epics/<EPIC>-<slug>/ux/<area>/<surface>.md` as a proposal, with `target: specs/<app>/ux/<area>/<surface>.md`; promotion copies it to the target when every citing ticket has merged (A8).
> **What the check enforces:** `check-specs` (J5) caps it at 2,000 tokens, requires the frontmatter keys and at least one criterion ID; a contract cites exactly one surface file (A5); the critic captures every state row at 390, 834 and 1440, light and dark, reduced motion (C-R10), and an uncaptured state is UNVERIFIED (C-R01).
> **The detail test:** a fresh thread could build this without asking a question. **Status:** draft until Plumb signs the shape. Delete this block when you fill it.

```yaml
target: specs/<app>/ux/<area>/<surface>.md
status: draft
promoted:
design: # set at the Design stage's lock (docs/workflows/stages/design.md); absent when no canvas was used
  file: # the Paper file, by name
  page:
  artboards: [] # "<surface> / <state> / <width> / <scheme>", one per captured artboard
  locked: # date
```

> **Two passes when the Design stage is chosen:** the intent pass fills Job, the States rows (key and what shows) and Decisions before the canvas; the handoff pass fills the rest from the locked captures, and the Artboard column names each state's capture.

## Job

What the person is doing here and what done looks like for them. [FILL]

## Layout and components

The primitives from `components.md` this surface composes, and the one thing on it that gets the primary action (canon: one primary action). No new primitive without a proposal to Plumb; one drawn on the canvas is named here with its proposal, never as a lookalike. [FILL]

## States

Every row is reachable by `?state=` and captured. Base set: empty, loading, error, partial, offline, success; add the surface's own, never drop a base one (mark N/A with the reason).

| State | Key     | What shows | What the person can do | Copy | Artboard                                   |
| ----- | ------- | ---------- | ---------------------- | ---- | ------------------------------------------ |
| empty | `empty` | [FILL]     |                        |      | `captures/<surface>/empty-390.png`, or `—` |

## Words

Every string, in the product's voice, by Gloss. [FILL]

## Access

Keyboard path and focus order; the accessible name of every control; what is announced on change; reduced motion. [FILL]

## Instrumentation

Events this surface fires and what must never be in their payloads (`docs/measurement/metrics/events.template.md`). [FILL]

## Criteria

Each is binary and cited by a contract.

| ID                   | When   | Then | Evidence |
| -------------------- | ------ | ---- | -------- |
| C-[EPIC]-[surface]-1 | [FILL] |      | capture  |

## Decisions and open items

References to `D-<EPIC>-n` in the overview; `[NEEDS DECISION]` with defaults; `[NEEDS DECISION — BLOCKING]` only when a ticket could not start.
