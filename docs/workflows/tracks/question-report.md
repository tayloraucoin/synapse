---
title: "Track: question or report"
description: "Read when the output is an answer or a document and not a change to the product: a quick question about the code or the practice, or a formal report for a named audience."
layer: workflows
status: draft
thread: PR-19
role: Usher
date: 2026-10-05
last_reviewed: 2026-10-05
supersedes:
load_when: on request
---

# Question or report: asking the oracle

> **In one line:** sometimes the answer is two sentences and sometimes it is a document someone will act on. The builder finds out which before any work is done, so a quick question never gets a ten-page reply and a report never gets a shrug.

## When it applies

Nothing in the product changes. Someone wants to know something: how a feature works, what a change would cost, where time went, what the options are. If the work is examining the product for problems, that is an [audit](audit.md).

## Stages

| Form             | Stages                                                                                                                    |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------- |
| **Quick answer** | Answer. Usually the fast lane: the builder's own thread answers it and stops.                                             |
| **Report**       | Scope (agree the question, the audience and the shape), Gather (the repo, and research threads for outside facts), Write. |

## Cast and QA

The role that owns the subject: Mason for architecture, Tally for numbers, Compass for product choices, Scribe for how the practice works, and so on. Q0. A report that will drive a decision that is hard to undo can be given a second reader: ask for it as a focus ("have Crucible argue against the recommendation").

## The builder's own questions for this track

1. A quick answer, or a formal report?
2. What will you do with the answer? The decision it feeds sets the depth.
3. Who is the reader: you, a developer, a non-technical teammate, a client? This sets the vocabulary and how much is explained.
4. For a report, the shape: a recommendation with reasons; a comparison of options; an explanation of how something works; a status account. And the length you want.
5. Does it need facts from outside the repo? If yes, the research rule in the builder decides whether that is a lookup or a research thread.
6. Where should a report end up? **Printed in the thread** (default); **saved in the repo** at `specs/<app>/reports/<date>-<slug>.md`, only when others will be pointed to it; **a shared document** when a connector for one is available.

## Rules for the answer

- Lead with the answer, then the reasons.
- Say what was checked and what was not. An unverified claim is labelled.
- A recommendation names what it would cost to be wrong.
- Estimates of time and cost are labelled as estimates.

## What gets written

Nothing, unless the operator chose to save the report.
