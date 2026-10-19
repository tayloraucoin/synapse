---
title: "Stage: Research"
description: "Open when a brief names a knowledge gap that the UX spec cannot proceed without: one question, one note, promoted to the library only when it outlives the epic."
layer: workflows
status: draft
thread: P-J
role: Usher
date: 2026-10-02
last_reviewed: 2026-10-02
supersedes:
load_when: on request
---

# Stage: Research (epic level 2, optional)

## 1. Lead and support

Lead: the role that fits the gap. Alembic (`docs/roles/product-design/alembic-research-synthesizer.md`) for sources; Envoy (`envoy-user-researcher.md`) for users; Chancery (`docs/roles/trust-legal-compliance/chancery-regulatory-counsel.md`) for legal; Sage (`docs/roles/science-clinical/sage-behavioral-scientist.md`) for behaviour; Loom (`docs/roles/engineering/loom-ai-systems-architect.md`) for AI. One lead per note.

## 2. Venue

A general Claude thread with web research when the sources are on the web; Claude Code when the sources are in the repo or the product repos. The prompt says which.

## 3. Loads

| File                                                                                      | Reason                                    |
| ----------------------------------------------------------------------------------------- | ----------------------------------------- |
| `docs/workflows/templates/research-note.template.md`                                      | What this stage writes                    |
| The brief's "Knowledge gaps" entry for this question                                      | The question, exactly as asked            |
| The sources the gap names, and `docs/references/README.md` for anything already distilled | Do not re-research what the library holds |
| `docs/research/` files, labelled `[research: <why>]`                                      | Allowed here (A11)                        |

No interview: the question is fixed by the brief. If it is ambiguous, ask once, then answer the most useful reading and say so.

## 4. Evidence rules

Primary sources over comparisons; every price, availability or capability claim dated; each claim labelled verified, secondary or judgment; not found marked, never filled. At most one verbatim quote under fifteen words per source.

## 5. Writes

`research/<topic>.md` in the work's own folder (an epic's `specs/<app>/epics/<EPIC>-<slug>/`, an exploration's `specs/<app>/explorations/<slug>/`; the research block names the exact directory and filename) from the template: the question, the answer in one paragraph, the evidence table, what was not found, and "Promote to library: yes/no, why". A note that outlives the epic goes through `docs/references/_meta/`'s procedure, never by copy.

## 6. Gate

The note answers its question, or says plainly what was not found. The Frame lead reads it; no sign-off needed.

## 7. Handoff

Print nothing new. The prompt that asked for this research lists the note under its loads; tell the person to save the result at the path the research block named, and which prompt to open next.
