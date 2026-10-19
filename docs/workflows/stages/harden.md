---
title: "Stage: Harden"
description: "Open when the operator says harden for a built ticket or one-off, even days later: the three beats Build, Seen, Harden, and the one pass that runs every proof and review once, on code that has stopped moving."
layer: workflows
status: draft
thread: PR-21
role: Usher
date: 2026-10-07
last_reviewed: 2026-10-07
supersedes:
load_when: on request
---

# Stage: Harden (after a build, on the operator's word)

Shared by the epic and one-off tracks. A ticket is built, seen, then hardened; the QA level the operator confirmed still sets what hardening runs ([`../qa-levels.md`](../qa-levels.md)).

## 1. When it applies

Any built ticket, or a one-off with a contract, once the operator says "harden <ids>". There is no deadline: a ticket can wait days between Build and Harden. A one-off with no contract hardens only if the operator asks; its prompt is then the brief.

## 2. The three beats

In this order, per ticket, in the wave order the Tickets gate printed:

| Beat       | Who                   | What happens                                                                                                                                                                                                                                                                                                       | Ends with                                   |
| ---------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------- |
| **Build**  | One thread per ticket | The build pass ([`build.md`](build.md) §4), on the model the ticket row names: the code, the ticket's own tests and the affected workspace's suite, `check-types`, the UX truth updated, Assay in thread on UI tickets from the thread's own screenshots. No ledger, no captures, no as-built, no headless review. | Five lines and the dev-server links         |
| **Seen**   | The operator          | Walks the running surface and every `?state=`; gathers any stakeholder's approval; asks for changes by saying "fix" in the build thread, or by a follow-up ticket                                                                                                                                                  | The operator says "harden <ids>"            |
| **Harden** | One thread per ticket | §4 below, on Opus 5.5, in the same order                                                                                                                                                                                                                                                                           | The closing report; the epic's last says so |

Nobody waits on a review to start the next build. A ticket that depends on another starts once that one is built.

## 3. Venue

Claude Code, on the branch the operator has checked out, one ticket per thread, never a batch. Lead: none; the thread is the hardener. Reeve (`docs/roles/operations-strategy/reeve-project-manager.md`) owns the order.

## 4. What hardening runs

Once each, on code the operator has seen:

1. `yarn contract:run <id>`, and `yarn contract:record` for capture and manual criteria.
2. The captures, once.
3. The as-built the level asks for.
4. One review per seat at the ticket's level: Q2 one subagent run; Q3 `yarn review:run <role> <id>` per confirmed seat. Warden and Mason sit only on the one-way-door paths `technical.md` names. A PASS is final ([`../qa-levels.md`](../qa-levels.md)).
5. Fix what the review returns, then prove once more.
6. The epic's last hardening thread names itself the close and runs `yarn verify`, `yarn check-specs --strict` and `yarn truth:promote <EPIC>`; a one-off's hardening is its own close and runs `yarn verify`. Then the operator merges.

## 5. Loads

| File                               | Reason                                        |
| ---------------------------------- | --------------------------------------------- |
| `contract.md`                      | The criteria, the level, the seats, the focus |
| The one surface file it cites      | What the captures must show                   |
| `technical.md`, for an epic ticket | The door paths that call Warden and Mason     |
| The build thread's five lines      | What was built; never handed to a reviewer    |

## 6. What it loses

- Nothing is proven or merge-ready until the operator says harden.
- Findings arrive once, late, in one pass per seat.
- CI stays red for the epic unless the branch is cleared first.

## 7. When this stage is wrong

- More than one hardening FAIL in an epic on tickets the operator marked seen: the build pass gets the ticket's own capture back.
- A hardening review that returns a Blocking on code the operator approved as seen: deferral is kept for UI-only tickets, and the rest are reviewed in the build pass again.

## 8. Gate and handoff

The ticket's level holds: its criteria pass, its seats are recorded at Q3. The closing report as in [`build.md`](build.md) §7; the epic's last hardening thread says on its first line that the epic is closed and ready to merge.
