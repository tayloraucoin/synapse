---
title: "Stage: UX spec"
description: "Open at an epic's UX level, to turn the brief into surface files a fresh thread could build without asking a question: every state, access, criteria with IDs, mirroring the living truth; in two passes, intent then handoff, when the Design stage settles the surface in Paper between them."
layer: workflows
status: draft
thread: P-J
role: Usher
date: 2026-10-02
last_reviewed: 2026-10-08
supersedes:
load_when: on request
---

# Stage: UX spec (epic level 3)

## 1. Lead and support

Lead: Vesper (`docs/roles/product-design/vesper-ux-ui-designer.md`). Support: Gloss (`gloss-content-designer.md`) for every word in the product; Threshold (`threshold-accessibility-auditor.md`) for the access section of each surface; Turner (`docs/roles/engineering/turner-design-engineer.md`) only when a primitive would have to change.

## 2. Venue

Claude Code, on `agent/<EPIC>`.

## 3. Loads

| File                                                                         | Reason                                                    |
| ---------------------------------------------------------------------------- | --------------------------------------------------------- |
| `docs/design/canon.md`                                                       | The floor; A-01 to A-20 are banned by ID                  |
| The product's design file (`apps/web/docs/design/DESIGN.md` in the demo)     | The brand's deltas on the floor                           |
| At most three files through `docs/references/README.md`                      | The laws the surfaces lean on                             |
| `docs/design/templates/ux-overview.template.md` and `ux-surface.template.md` | What this stage writes                                    |
| `docs/design/templates/states.template.md`, `components.template.md`         | The state matrix and the component vocabulary             |
| `specs/<app>/ux/<area>/`                                                     | The truth each proposal mirrors                           |
| The epic's `brief.md` and `research/*.md`                                    | The problem and the facts                                 |
| The locked `captures/` and the `design:` block, in the handoff pass          | What was settled on the canvas ([`design.md`](design.md)) |
| A `docs/research/` file, labelled `[research: <why>]`                        | Only when nothing distilled covers it (A11)               |

**Interview protocol, where this stage interviews.** It overrides the role's default intake behaviour (at most one clarifying question). Ask every question the output needs, in numbered rounds; give each a recommended default so the answer can be "3: keep"; invent nothing silently; leave anything open under `[NEEDS DECISION]`, or `[NEEDS DECISION — BLOCKING]` when a ticket could not start without it.

## 4. Interview rounds, in one pass or two

Every empty slot in the surface template is a question, taken surface by surface: the job of the surface; its entry and exit; each state (empty, loading, error, partial, offline, success, and the product's own); the words on it; the keyboard path and the announced names; the criteria, each with an ID (`C-<EPIC>-<surface>-<n>`); and any decision, logged as `D-<EPIC>-<n>` in the overview.

**One pass** when the builder did not choose the Design stage: every slot, as above.

**Two passes** when it did ([`design.md`](design.md)), because a designer does not know what they like until they see it, and a canvas is bad at discovering what the spec is good at: the states that are not the happy path.

- **The intent pass, before the canvas.** The overview in full (frame, routes and flow order, navigation, decision log). Per surface, only what the canvas needs and cannot find: the job, entry and exit, the states by key with one line each on what shows, the primary action, the open decisions. Layout, words, access, instrumentation and criteria stay `[FILL]`. Files stay `status: draft`. Gate: the operator says "to the canvas". Handoff: print the Design stage prompt.
- **The handoff pass, after lock, in a fresh thread.** It reads the intent files, the locked captures and the Paper file cold, and fills the rest from what was settled: layout and components, the words (Gloss), access (Threshold), instrumentation, criteria, and the state table with an artboard per row. It is a diff, not a transcription. Paper wins on how it looks, the intent pass wins on what it does, the operator breaks ties, and every change is a `D-<EPIC>-n` line:

| The diff shows                                                  | Rule                                                                                            |
| --------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| A state in the intent pass with no artboard                     | Ask: reopen the canvas for it, or mark it `N/A` with the reason                                 |
| An element or step on the canvas the intent pass never named    | Ask, then log the decision                                                                      |
| Words changed on the canvas                                     | The canvas is the new intent; Gloss finishes them                                               |
| An element not on the Paper kit's components page               | The Plumb proposal logged at lock; the surface file names it under Layout, never as a lookalike |
| A behaviour the canvas implies that the intent pass contradicts | The intent holds unless the operator rules; `[NEEDS DECISION]` until they do                    |

The handoff pass asks only what the diff cannot settle, in one round.

## 5. Writes

Under `specs/<app>/epics/<EPIC>-<slug>/ux/`, mirroring the truth paths: `<area>/overview.md` (frame, routes, decision log) and one `<area>/<surface>.md` per surface, at most 2,000 tokens each, split if bigger. Each file's frontmatter carries `target:` (its truth path), `status: draft`, and `promoted:` empty (A8).

## 6. Gate

You approve, and each file is set to `status: approved` (the intent pass has its own gate, "to the canvas", and stays `draft`). The detail test: a fresh thread could build any one surface file without asking a question. A `[NEEDS DECISION — BLOCKING]` left in a file stops every ticket that cites it (`contract:init` refuses, A6).

## 7. Handoff

Print the Technical prompt (from `stages/technical.md`) and say: open a new thread with it. Print only; save no prompt file. On the product-spec track this stage hands off to that track's Handoff stage instead. The intent pass prints the Design stage prompt instead ([`design.md`](design.md)).
