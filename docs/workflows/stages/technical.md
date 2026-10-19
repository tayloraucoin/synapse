---
title: "Stage: Technical"
description: "Open at an epic's technical level, after the UX files are approved, to decide placement, the data contract and the one-way doors, and to route the calls that need ratifying."
layer: workflows
status: draft
thread: P-J
role: Usher
date: 2026-10-02
last_reviewed: 2026-10-02
supersedes:
load_when: on request
---

# Stage: Technical (epic level 4)

## 1. Lead and support

Lead: Mason (`docs/roles/engineering/mason-cto-principal-dev.md`). Support, as the spec calls for: Warden (`warden-security-privacy-engineer.md`) for auth or personal data; Loom (`loom-ai-systems-architect.md`) for an AI feature; Tally for instrumentation; Quartermaster (`quartermaster-stack-migration-engineer.md`) for any new dependency.

## 2. Venue

Claude Code, on `agent/<EPIC>`.

## 3. Loads

| File                                               | Reason                                      |
| -------------------------------------------------- | ------------------------------------------- |
| The approved `ux/` files                           | What is being built                         |
| `docs/engineering/codebase-conventions.md`         | Placement and the package graph             |
| `docs/engineering/tech-stack.md`                   | What exists and what is deliberately absent |
| `toolkit.json` reviewer rows                       | Which paths are one-way doors               |
| `docs/engineering/templates/technical.template.md` | What this stage writes                      |

No interview. Mason decides placement and data shape inside the law and routes what needs ratifying; a question to you is a routed call with a recommendation attached.

## 4. Shaping, time-boxed

Ninety minutes, or the cycle charter's limit. Answer "is this possible in this appetite?", never "is it possible?". Every rabbit hole is patched in a sentence or declared out of bounds. The builder's veto, "not possible in this appetite", sends the epic back to Frame, never into tickets on optimism.

## 5. Writes

`specs/<app>/epics/<EPIC>-<slug>/technical.md` (or `technical/` when over 2,000 tokens). It holds only what every ticket shares; detail that belongs to one ticket is written into that ticket's Build notes at the Tickets stage, so a build thread never pays to read another ticket's detail. Contents: placement by consumer; the data contract; the one-way doors touched, each with its record or its ratification due; calls routed to you, each with a recommendation; the test shape per risk (Touchstone's rule: the risk's shape picks the test type).

## 6. Gate

You ratify the routed calls, on the record. An unratified one-way door blocks the Tickets stage.

## 7. Handoff

Print the Tickets prompt (from `stages/tickets.md`) and say: open a new thread with it. Print only; save no prompt file.
