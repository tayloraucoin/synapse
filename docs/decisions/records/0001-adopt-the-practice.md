---
title: "0001 — Synapse adopts the practice as an overlay, in place, with its history and its own rules kept"
description: Read before changing the spine, the settings, the verify chain or the archive, or before asking why a line from the old AGENTS.md is or is not carried. Holds every ruling of the migration, each line not carried, where each record went, the settings rows ruled operator, and the drafted gaps.
layer: decisions
status: ruling
thread: "MIG"
role: Usher
date: 2026-10-09
last_reviewed: 2026-10-09
supersedes:
load_when:
---

# 0001 — Synapse adopts the practice as an overlay, in place, with its history and its own rules kept

## Context and problem

Synapse (a Yarn 4 and Turborepo monorepo, one product app, `@syn/*` packages) had its own spine: a 182-line `AGENTS.md`, three nested `AGENTS.md`, a tracked `.claude/settings.json` with an allow list and a sandbox, specs in `docs/specs/` with nine track folders and their logs, and CI chaining four checks. It was assessed near (14 of 34, `specs/_shared/epics/MIG-migration/assess.md`, at `f2bfeb1`). The constraint: move the way of working in one day without a rewrite, keep every body and its history, and keep the always-on context inside 4,000 tokens.

- Toolkit: `git@github.com:tayloraucoin/product-engineering-mastery.git` at `62d344b` (branch `feature/conventions-setup`, pushed). The prompt named `c7b3c2d`; the checkout had moved 58 commits and Taylor chose the newest (rulings 01).
- Procedure: the toolkit's `docs/runbooks/migrate/README.md`, `verify.md`, `layer-3.md`, on branch `feature/pem-migration` from `main` at `f2bfeb1`.
- Ruled by Taylor in the question tool, 2026-10-08 and 2026-10-09; Lorimer consulted on the settings and hooks, Mason on the budget, verify and CI.

## Considered options

1. Adopt in place as an overlay, carrying the host's own rules verbatim and archiving what the practice replaces.
2. A fresh duplicate of the toolkit with Synapse's code moved in (the new-project track): loses the history and the team's rules.
3. Adopt only the tooling and leave the spine and records as they were: two spines, and agents read neither fully.

## Decision

Chosen: option 1, because the near path's rulings (below; full text in `specs/_shared/epics/MIG-migration/rulings.md`) keep every body byte for byte and every check green, and the enforced checks (`yarn verify`, `yarn budget`) pass with them.

### The rulings

| #     | Ruling                                                                                                                                                                                                                                                                                                         |
| ----- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 01-03 | Target and toolkit as above; protected branch `main` (= `origin/main`, `f2bfeb1`); migration branch `feature/pem-migration`                                                                                                                                                                                    |
| 11-15 | Prefix `SYN`; app `web` at `apps/web` (`WEB`), `apps/mobile` a seam; tier `overlay`; `agent/{id}`; `packages/db/migrations`; one working day                                                                                                                                                                   |
| 21    | Both policies stand (tests, branches); lines 11, 35, 36, 145, 146 not carried                                                                                                                                                                                                                                  |
| 22    | Floor team; push deny operator; session-start and results-gate team; bash-guard and stop-gate operator (team after the merge-side week); sandbox and allow list team                                                                                                                                           |
| 23    | The tracked 16-host list is the one network boundary                                                                                                                                                                                                                                                           |
| 24    | Every host block kept; floor rows added once; plus deny `yarn npm publish *` and `yarn npm login *`; `denyRead` `~/.ssh`, `~/.aws`; named env-file denies                                                                                                                                                      |
| 31-34 | The human-line table (below); the token cap binds unchanged at 4,000; brief "add a streak count to Today" (passed); `apps/web/AGENTS.md` split to `apps/web/docs/product-rules.md`                                                                                                                             |
| 41    | Taylor's archive rule: what the practice replaces goes to `docs/decisions/imported/`; `docs/specs` archived whole; `docs/ux` stays until promoted; guides and the generated map stay                                                                                                                           |
| 42    | Taylor: the practice's roles override the host's; `docs/roles` archived whole; Synapse's own conventions govern its code                                                                                                                                                                                       |
| 43    | The records moves ran in the time box, after Stop 2                                                                                                                                                                                                                                                            |
| 51-54 | verify = lint, lint:boundaries, check-types, smoke test, build, then the toolkit's nine checks; Turbo tasks and `yarn verify` run unsandboxed with Taylor's yes; CI runs `yarn verify` at `fetch-depth: 0`; freezes last commit of the day (none needed); Taylor runs the push, the first CI run and the merge |

### Lines of the old `AGENTS.md` not carried, and why

- 8, 12, 136-146, 171-175 (read order, Done means, the Build-slice workflow, Briefing): replaced by the practice (the prompt builder, the contract loop, `verify`).
- 11, 35, 36, 145, 146: overruled in 21; 11 also replaced by `yarn verify`.
- 148-161 (Shell command conventions): written for an older permission matcher, now the floor and the hooks; 160 calls `settings.local.json` disposable scratch, false now that it holds the operator rows; 161 is in `packages/db/AGENTS.md` already.
- 120 (the Next 16 warning): the same text is in `apps/web/AGENTS.md` and `.claude/rules/next.md`.
- 179-180: carried as the toolkit's own "Keeping instructions in sync" line, because 179 says the root `CLAUDE.md` must stay a one-line pointer, which the derived `CLAUDE.md` is not. [ASSUMPTION: the substance of 180 is the toolkit line's second half.]
- No vendor-owned block: Next's agent-rules generator is off (`agentRules: false`).

### Where the carried lines went

House rules in `AGENTS.md` (13, 29, 31-33, 37, 38, 115, 119, 181, 182); the precedence ladder (16-25) verbatim in `docs/index.md`; Import boundaries (122-134) in `AGENTS.md`; path rules `house-records.md` (30), `house-directory-map.md` (34), `house-deps.md` (117, 118), `house-ui.md` (163-169 and the UI guide rows), `house-db.md`, `house-api.md`, `house-auth.md`, `house-env.md` (the domain-guide rows). Edits a carried line took, path only: line 38's pointer to `apps/web/docs/product-rules.md`; link targets rebased for the line's new folder (`../../docs/` in the house rules; relative to `docs/` in the ladder); ladder rungs 5-6 to the archive.

### Where each record kind went

| Kind                                                                                  | Where                                             | Indexed in                                                                 |
| ------------------------------------------------------------------------------------- | ------------------------------------------------- | -------------------------------------------------------------------------- |
| Spec folders, decision, deviation and progress logs (nine tracks, 156 files)          | `docs/decisions/imported/specs/` by one `git mv`  | `docs/decisions/imported/README.md`; nine ledger lines (111 dated entries) |
| Host role prompts (16 files)                                                          | `docs/decisions/imported/roles/` by one `git mv`  | the same README                                                            |
| Old instruction files (eight) and the tracked settings                                | `docs/decisions/imported/*-2026-10-09.md`, copies | the same README                                                            |
| UX spec (`docs/ux/`, 14 files)                                                        | stays; cited by the ladder                        | `docs/index.md` layers table                                               |
| Guides, `docs/architecture/` with its generated map, `docs/product/`, `docs/reviews/` | stay                                              | `docs/index.md` layers table                                               |

Pointer lines edited after the moves (path only): `docs/index.md` (2), `docs/README.md` (15), `README.md` (3). `yarn docs:check-links` after the moves (2026-10-09): 118 broken, left as they are (nothing rewritten to satisfy it; MIG-2): 57 in the kept copies of the old instruction files, 26 inside the archived spec bodies, 28 in copied practice docs that link toolkit-only files, 6 in `docs/ux/` and `docs/product/` bodies naming old `docs/specs/` paths, 1 resolved by this record.

### Settings rows ruled operator

In `.claude/settings.local.json` (gitignored), added to Taylor's existing file with its `grep` allow row kept: deny `Bash(git push)` and `Bash(git push *)`; the `bash-guard.ts` PreToolUse hook; the `stop-gate.ts` Stop hook. `yarn doctor` is their guard. A worktree made before this merge holds an older copy of the local file and fails `doctor` until refreshed. `core.hooksPath` is `tooling/git-hooks` (`yarn hooks:install`, run unsandboxed with Taylor's yes).

### Divergences from the toolkit's files, and assumptions

- [ASSUMPTION] Six allow-case commands in `tooling/hooks/fixtures/bash-guard.json` were retargeted from `PJ:`/`DOC-2:` to `SYN:`/`WEB-2:`: the fixture context cannot set prefixes, so the copied file fails in any target. Restore the toolkit's copy when it can (MIG-11).
- `.claude/rules/ts.md`, `ui.md`, `next.md`, `testing.md`, `turbo.md` derived: `@pem` lines made `@syn` or dropped; next.md's "never `app/_components/`" dropped (Synapse places client leaves there, rulings 42); testing.md's capture line says no harness yet; turbo.md names the env hashing.
- `.prettierignore` keeps copied practice files, imported records, `docs/index.md` (as the toolkit does), `apps/web/docs/product-rules.md`, `specs/_status.md`, `README.md` and `docs/README.md` out of the host's format.
- Scripts beyond the runbook's list: `contract:built` and `cost` (their files are copied; `specs.md` names them), `test:tooling` (the copied spec fixtures cite it). `directory-map` keeps the host's command.
- `tooling/fixtures/test-weakening/` copied byte for byte (`check-test-weakening` reads it; the manifest lacks it).
- The manifest's `.claude/skills/shadcn/` entry is skipped: the toolkit has no such skill yet.
- Superseded host docs keep going to `docs/archive/` (House rule 182); what the practice replaced is in `docs/decisions/imported/`.

### Gaps drafted

MIG-1 promote the UX spec; MIG-2 the host's link checker; MIG-3 Turbo's env hashing; MIG-4 check-migrations (part 2, Q3); MIG-5 tests beyond the smoke test (part 3); MIG-6 the env seam (part 5); MIG-7 the Supabase SDK seam (part 6, Q3); MIG-8 `"use client"` placement (part 8); MIG-9 the design layer (part 9); MIG-10 format-all (part 10); MIG-11 day-one leftovers (part 12). Skipped, already met: part 1 (S2 0), part 4 (V1 0), part 7 (V2 0), part 11 (S1 0).

## Consequences

- **Buys:** one `yarn verify` locally and in CI; the practice's work loop, roles, subagents and skills; the floor in every checkout; the old rules where an agent meets them; every record with its history.
- **Costs:** `yarn verify` and `verify:fast` run unsandboxed in an agent session until MIG-3; `docs:check-links` is red until MIG-2; the agent context is at 3,964 of 4,000 tokens, so a new House rule displaces a line. The settings-and-hooks commit touched agent permissions (Q3 by `qa-levels.md`) and ran at Q1 with Lorimer consulted, by Taylor's choice.
- **Forecloses:** the old spec system for new work; new work is specified under `specs/`.

## Revisit trigger

The merge-side week passes (bash-guard and stop-gate to team); `specs/web/ux/` is promoted (MIG-1 archives `docs/ux`); or `yarn budget`'s always-on row fails on a House rule the cut order cannot place.
