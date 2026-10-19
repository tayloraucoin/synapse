---
title: "Operator notes"
description: "Open when filing what the operator said in a session, or when a brief, narrative or spec needs to trace a line back to the operator's own words: the convention, where the notes live, and how they are amended."
layer: product
status: draft
thread: SYN
role: Alembic
date: 2026-10-09
last_reviewed: 2026-10-09
supersedes:
load_when: spec, discovery
---

# Operator notes

**What this is.** The operator's own words from a session, filed so that later work can be traced back to what was actually said. A walkthrough, a review, a brain dump, a refinement round: anything spoken or written by the operator that will feed a brief, a narrative, a spec or a ruling.

**Start with.** The blank [`../operator-notes.template.md`](../operator-notes.template.md). One file per session, named `<YYYY-MM-DD>-<slug>.md`, in this folder.

## The convention

1. **In the order spoken.** Numbered bullets, in the order the operator said them, under topic headings added as each topic arose. Never re-sorted by importance or by surface; a later file (a feedback table, a narrative) does that and cites the line.
2. **Their words.** The operator's exact wording, in quotation marks, wherever possible. Cleaned of fillers, false starts and repetition, never a raw transcript. A cut inside a quote shows as `…`.
3. **Nothing added.** A line that is not their words is marked `(paraphrase)`. Anything the thread inferred (what "later" meant, which screen was meant) is marked `[ASSUMPTION: …]`, so the operator can confirm or strike it. No solution, ruling or severity is written here; those belong to the file the notes feed.
4. **Dated, and amended, never rewritten.** The header carries the session date. A later round (a refinement, a correction the operator makes) is a dated block under "Amendments" that names the line it changes. Earlier lines stay as they were said.
5. **Names what it fed.** The header's **Fed** line lists every file that used these notes, by path, added as each one does. A file that uses the notes cites them back by file and line number.

## Why

A summary drifts toward what sounded reasonable, and drops the caveat that carried the weight. Notes kept in the operator's words and order let a narrative, a spec or a fidelity check ask "was this actually said?" and get an answer. The discipline is Alembic's: atoms before themes, verbatim is verbatim, paraphrase is labelled ([`../../roles/product-design/alembic-research-synthesizer.md`](../../roles/product-design/alembic-research-synthesizer.md)).

## Before this folder

The earlier walkthrough-feedback files in [`../`](../) (for example [`2026-09-24-first-run-walkthrough-feedback-v1.2.md`](../2026-09-24-first-run-walkthrough-feedback-v1.2.md)) mix the operator's notes with rulings, severity and where each lands. They stay where they are. From now on, the notes are filed here first, and a feedback file of that kind cites them.
