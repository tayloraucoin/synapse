---
title: "Stage: Frame"
description: "Open at an epic's first level, to turn a brain dump into a brief: the problem, who has it, the appetite, what is out, and the knowledge gaps."
layer: workflows
status: draft
thread: P-J
role: Usher
date: 2026-10-02
last_reviewed: 2026-10-02
supersedes:
load_when: on request
---

# Stage: Frame (epic level 1)

## 1. Lead and support

Lead: Compass (`docs/roles/product-design/compass-product-strategist.md`). Support, by function: Tribune (`tribune-customer-advocate.md`) for the customer's voice; Tally (`tally-metrics-analyst.md`) when success is a number.

## 2. Venue

Claude Code, in the repo, on the operator's branch. First move: `yarn spec:init <app> <EPIC> <slug>` creates the epic folder. The prompt you were given is not saved: prompts are printed, never filed. A feature exploration or a product spec runs this stage too; its track file says which rounds to skip.

## 3. Loads

| File                                                                | Reason                                                   |
| ------------------------------------------------------------------- | -------------------------------------------------------- |
| `docs/product/brief.template.md`                                    | What this stage writes                                   |
| `specs/<app>/ux/<area>/overview.md` and the surfaces the dump names | The truth being changed; its absence is itself a finding |
| Any earlier epic on the same area (`specs/<app>/epics/*`)           | What was tried and what it decided                       |
| At most two `docs/research/` files, labelled `[research: <why>]`    | Only when nothing distilled covers the topic (A11)       |

**Interview protocol, where this stage interviews.** It overrides the role's default intake behaviour (at most one clarifying question). Ask every question the output needs, in numbered rounds; give each a recommended default so the answer can be "3: keep"; invent nothing silently; leave anything open under `[NEEDS DECISION]`, or `[NEEDS DECISION — BLOCKING]` when a ticket could not start without it.

## 4. Interview rounds

1. Who has the problem, and what do they do today instead? Default: the user the truth files describe.
2. Why now? What changed? Default: the reason in the dump.
3. The appetite: how much time is this worth, in days? Default: the smallest that could ship a first beat.
4. What does success look like, and how would we know? Default: one metric from `docs/measurement/metrics/definitions.template.md`'s shape, or "a qualitative bar" named plainly.
5. What is out of scope? Default: everything the dump did not name.
6. What do we not know that the UX spec would need? Default: the gaps the builder listed.

## 5. Writes

`specs/<app>/epics/<EPIC>-<slug>/brief.md`, from `docs/product/brief.template.md`, with a "Knowledge gaps" list (one question each) and the appetite stated as a number.

## 6. Gate

You. Say go, or send it back with the round number to revisit.

## 7. Handoff

For each knowledge gap, apply the builder's rule (`prompt-builder.md` §5): look it up here, or print a research block for its own thread (from `stages/research.md`). Then print the UX prompt (from `stages/ux.md`) and say: run the research threads first if there are any, then open a new thread with the UX prompt. Print only; save no prompt file.
