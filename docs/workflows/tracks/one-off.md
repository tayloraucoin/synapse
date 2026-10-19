---
title: "Track: the one-off"
description: "Read when a piece of work is one buildable change with a known outcome, or when teaching someone the day-to-day loop: brain dump, one build thread, a short report."
layer: workflows
status: draft
thread: PR-19
role: Usher
date: 2026-10-05
last_reviewed: 2026-10-07
supersedes:
load_when: on request
---

# The one-off: a side quest

> **In one line:** brain dump into the builder, paste its prompt into a new thread, and that thread builds the change, proves it at the level you chose, and ends on a short report.

New to the terms? See [`../glossary.md`](../glossary.md). The big picture is in [`../README.md`](../README.md).

## When it applies

- It fits in one build thread.
- You know what "done" looks like.

That is all. It does not need an existing UX file: when the change alters how the app behaves, the same thread updates the living UX file for that area, or writes it if none exists yet. If the work turns out to need several tickets, a new surface with open design questions, or an unsettled problem, the builder routes it to an [epic](epic.md).

Example: "The records table needs a filter by status."

## Stages

[Build](../stages/build.md), then [Harden](../stages/harden.md) when you say so; optional at Q1 with no ticket.

## Cast and QA

No lead role: the thread is the builder. Default Q1. The builder recommends Q2 or Q3 from what the change touches ([`../qa-levels.md`](../qa-levels.md)), and you confirm the level, the reviewers and any part that needs a deeper look.

## The builder's own questions for this track

1. A formal ticket and contract, or none? Recommend a ticket at Q2 and Q3, and whenever the change should leave a record; none for a small change at Q1.
2. Does this change how the app behaves for a user? If yes, the prompt names the living UX file to update or create.
3. Is there anything it must not touch?

## The moves

| Move              | You                                         | The thread                                                                                                                                            |
| ----------------- | ------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| **1. Brain dump** | Describe the work to the builder; answer it | Prints the prompt and what to expect                                                                                                                  |
| **2. Build**      | Open a new thread, paste the prompt         | Builds it; see _The build move_, below                                                                                                                |
| **3. Seen**       | Walk what it built; say "fix", or "harden"  | Fixes what you ask for in the same thread                                                                                                             |
| **4. Harden**     | Say "harden <id>" when you are happy        | A new thread runs the criteria, the review your level calls for, and `yarn verify`, once; reports in six lines at most. Optional at Q1 with no ticket |
| **5. Ship**       | Push and merge when you are ready           | Nothing: agents never push                                                                                                                            |

### The build move

- **With a ticket:** drafts the contract and starts it. **Without:** works from the prompt.
- Builds; runs its tests and its workspace's suite; updates the UX truth file.
- Ends on five lines and the links.

## What gets written

| With a ticket (`specs/<app>/one-offs/<APP-n>-<slug>/`)                    | Without a ticket                                     |
| ------------------------------------------------------------------------- | ---------------------------------------------------- |
| `contract.md`; an as-built at Q2 and Q3, or at Q1 when something deviated | The code, and the UX truth file if behaviour changed |
| `results.json`; at Q3 also the review files                               | The closing report in the thread is the record       |

## What stops the thread, and the right move

| Blocked                    | Why                                 | Right move                                   |
| -------------------------- | ----------------------------------- | -------------------------------------------- |
| npm, npx, pnpm             | One package manager                 | yarn                                         |
| `git push`                 | Only a person pushes                | Commit; the report says the branch is ready  |
| A commit without a work id | History reads as a list of outcomes | `WEB-41: <outcome>`, or the app prefix alone |
| Hand-editing a Q3 result   | The builder never grades itself     | The proof commands write it                  |

## Explain it back

> "I describe the change, answer the builder's questions once, and paste its prompt into a new thread. That thread builds it on my branch, updates the UX file if behaviour changed, and gives me links to look at. When I like what I see I say harden, and a new thread proves it as carefully as I asked and tells me in a few lines what is done and what needs me."
