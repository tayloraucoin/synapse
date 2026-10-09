---
title: "Stage: Build"
description: "Open for a build thread, one ticket per thread, with or without a formal ticket: the build pass proves the ticket in its own workspace and ends on five lines and the links; proofs, captures and reviews wait for the hardening pass."
layer: workflows
status: draft
thread: PR-19
role: Usher
date: 2026-10-05
last_reviewed: 2026-10-08
supersedes:
load_when: on request
---

# Stage: Build (a ticket, or work with no ticket)

Shared by the epic, one-off, bug and product-spec tracks. For an epic ticket and a one-off with a contract this is the first of three beats, Build, Seen, Harden ([`harden.md`](harden.md)).

## 1. Lead and support

No lead role: the thread is the builder, and the work loop in `AGENTS.md` governs it. The QA level the operator confirmed sets everything else ([`../qa-levels.md`](../qa-levels.md)):

| Level | Proof                                                     | Review                                                              | Written down                                 |
| ----- | --------------------------------------------------------- | ------------------------------------------------------------------- | -------------------------------------------- |
| Q0    | The stop check                                            | None                                                                | Nothing                                      |
| Q1    | The builder runs the criteria; `yarn verify` at the close | None                                                                | An as-built only when something deviated     |
| Q2    | Same as Q1                                                | One reviewer in fresh context; findings return in the thread        | A short as-built                             |
| Q3    | Recorded proofs, frozen at close                          | The confirmed specialists, each in fresh context; review files kept | The contract, the as-built, the review files |

Which of it runs in the build pass and which in hardening is the phase table in `qa-levels.md`. A `focus` line in the contract or the prompt raises one named part to a higher level without raising the rest. The operator can raise or lower a level at any time by saying so.

## 2. Venue

Claude Code, on the branch the operator has checked out, unless the prompt says "on its own branch" ([`../branches.md`](../branches.md)), on the model the ticket row or the prompt names, with the effort pinned at thread start. **One ticket per thread, never a batch.** Say "build STK-5", or paste a prompt for work with no ticket; tickets in the same wave run in parallel threads. Also:

- Close a thread past 200k tokens of context after a break instead of resuming it; the ticket folder is the hand-off.
- Give a sub-task expected to pass about 50 calls (a dry run, a cold rehearsal, a long review) its own thread from a builder prompt, never a subagent of a build.

## 3. Loads

| File                                                           | Reason                                                                                                                                                         |
| -------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `contract.md`, or the printed prompt                           | The brief: what to build, the criteria, the level, the focus                                                                                                   |
| The one surface file it cites                                  | What the surface must do in every state                                                                                                                        |
| Its `captures/` and `design:` block, when the Design stage ran | The picture to adapt into tokens and `@pem/ui`; exact values through the Paper MCP when the file is open, never read off the image; reference, never authority |
| `technical.md`, for an epic ticket                             | Only what every ticket in the epic shares                                                                                                                      |
| Path rules, as files are touched                               | `ui.md`, `ts.md`, `testing.md`, `next.md`, `specs.md` on their globs                                                                                           |
| Never a `docs/research/` file                                  | Research is distilled before a build starts                                                                                                                    |

How often the thread stops follows the involvement the operator chose. **Autonomous:** a question the brief cannot answer becomes an `[ASSUMPTION]` in the report or the as-built. **Check in at gates:** the thread stops with its plan and file list before building, and with what it built before closing. **Decide together:** each meaningful choice is put to the operator with a recommendation. In every mode, what only a person can do goes to the operator in one message.

## 4. The loop

The build pass, for the one ticket:

1. **Start.** `yarn status` once. With a ticket: `yarn contract:init <APP | EPIC> <slug>`. Without one: restate the criteria from the prompt in the thread.
2. **Build,** one commit per outcome, labelled with the work id. Work that changes behaviour updates the living UX file in the same change, or writes it when none exists.
3. **Prove in scope.** The ticket's own tests, the affected workspace's suite and `check-types`. Never `yarn verify`, the whole `yarn test`, or `check-specs` mid-ticket; the stop check covers the rest. Give up on one failure only after three different fixes, and say what was tried.
4. **No review** (the phase table in `qa-levels.md`). Warden only the first time a door path in `technical.md` is built.
5. **Close.** `yarn status` once, then five lines: what was built, what was assumed, what to look at, the dev-server links for each surface and `?state=`, what is left for hardening.

No ledger, no captures, no as-built, no headless review: those run once, in the hardening pass, when the operator says "harden" ([`harden.md`](harden.md)). A one-off at Q1 with no contract ends here; at Q2 or Q3 it hardens like a ticket.

## 5. What does not happen

- A commit to a shared file never reopens another ticket. Only a Q3 ticket's proofs are recorded, and they are checked for staleness once, before a merge.
- Evidence logs are not committed.
- No prompt file, no per-ticket kickoff file, no review file below Q3.

## 6. Gate

The ticket's tests, the affected workspace's suite and `check-types` green. The operator walks what was built; merge readiness is the hardening pass's gate ([`harden.md`](harden.md)).

## 7. Handoff

The build pass ends on its five lines and links (§4). A thread with no hardening to follow ends on the closing report, six lines at most: `Done`, `Not done`, `Needs you` (a decision with a recommendation, or an action only a person can take; never a command to run), `To look at when you like` (operator checks and drafted follow-ups), `What went wrong`. When everything closed it is one line.
