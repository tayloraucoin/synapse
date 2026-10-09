---
title: "Track: new project"
description: "Read when the boilerplate is being duplicated for a new product: the builder runs the expanded set-up interview and hands the work to the new-project runbook."
layer: workflows
status: draft
thread: PR-19
role: Usher
date: 2026-10-05
last_reviewed: 2026-10-05
supersedes:
load_when: on request
---

# New project: starting a new save file

> **In one line:** duplicating the boilerplate is its own piece of work with a much longer interview. The builder asks everything the set-up needs, then prints a prompt that runs the new-project runbook, plus separate prompts for the pieces that are too big to share a thread.

## When it applies

A new product is being started from this repo, by an agent, with an operator answering questions. The steps themselves live in `docs/runbooks/new-project/README.md`; this track is how the work is opened.

## Stages

| Stage         | What happens                                                                                           |
| ------------- | ------------------------------------------------------------------------------------------------------ |
| 1. Interview  | The builder asks the set-up questions below, in rounds                                                 |
| 2. Set up     | One thread follows the runbook: rename, remove what is not wanted, add what is, verify after each step |
| 3. Brand      | Its own thread: brand material becomes tokens, typography and the product design files                 |
| 4. UX spec    | Its own thread, through the builder, when no spec exists yet                                           |
| 5. Components | Its own thread, after the UX spec: keep the components the product needs, delete the rest              |

Stages 3 to 5 each have a prompt in the runbook folder. The set-up thread prints the next one when it is time.

## Cast and QA

Lead: Usher. Support: Quartermaster for stack choices, Hearth and Vesper for brand, Turner for components. Q1, with `yarn verify` after every step of the runbook so a broken step is caught where it happened.

## The builder's own questions for this track

The questions live in one place: the interview in `docs/runbooks/new-project/README.md`, rounds A to G. The builder asks them itself, in that order and in those words, in place of its own Round D, so the operator is interviewed once:

| Round | Covers                                                                           |
| ----- | -------------------------------------------------------------------------------- |
| A     | Names: the project, the package scope that replaces `@pem/`, the ticket prefixes |
| B     | Apps: web, docs, a marketing site, mobile                                        |
| C     | The stack, one question per part: keep or remove                                 |
| D     | The local database: hosted only (the default) or local in Docker                 |
| E     | Ownership: who signs decisions, and who sets up accounts and credentials         |
| F     | Brand: whether material exists, and what to attach                               |
| G     | The UX spec: whether one exists                                                  |

The builder's standing rounds still apply, with these defaults: no separate branch question (the new repository is the branch), no ticket, involvement "check in at gates" with one stop after the strip and rename and one before the hand-over.

## What the builder prints

- The set-up prompt, with every answer written in as an instruction, and a line telling the set-up thread that the interview is done and must not be repeated.
- The forecast, as estimates.

The set-up thread prints the follow-on prompts itself when their time comes, from the runbook folder: the branding prompt (`branding.md`), the UX-spec prompt, and the components prompt (`components.md`).

## What gets written

The new repository. In it: a first decision record of the set-up choices, so the next person knows what was removed and why.
