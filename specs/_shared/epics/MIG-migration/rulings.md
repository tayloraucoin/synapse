# Rulings: migrating synapse to the practice

- Date: 2026-10-08 to 2026-10-09
- Report: `assess.md` beside this file, synapse at `f2bfeb1`, total 14 of 34, near
- Toolkit: `/Users/taylor/lighthouse/product-engineering-mastery` at `62d344b` (origin/feature/conventions-setup)
- Procedure: the toolkit's `docs/runbooks/migrate/README.md`, `verify.md`, `layer-3.md`
- Ruled by: Taylor, in the question tool; consulted: Lorimer (settings, hooks), Mason (budget, verify, CI)

## Round 0

| #   | Ruling                                                                                                                                                                                                |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 01  | Target `/Users/taylor/lighthouse/synapse`; toolkit checkout above, copies from its newest commit `62d344b` (the prompt named `c7b3c2d`; the checkout had moved 58 commits and both are on the remote) |
| 02  | Protected branch `main`, equal to `origin/main` at `f2bfeb1`, holding the fork point (the walk's `feature/workflow` is superseded by its merge into `main`)                                           |
| 03  | Migration branch `feature/pem-migration`, created by Taylor at `f2bfeb1`                                                                                                                              |

## Round 1

| #   | Ruling                                                                                                             |
| --- | ------------------------------------------------------------------------------------------------------------------ |
| 11  | Prefix `SYN`; the migration epic is `MIG-migration`                                                                |
| 12  | One app: `web` at `apps/web`, prefix `WEB`, `designLayer: null`; `apps/mobile` is a seam (README only), not an app |
| 13  | Tier `overlay`                                                                                                     |
| 14  | `branchPattern` `agent/{id}`; `migrationsDir` `packages/db/migrations`                                             |
| 15  | Time box: one working day for layers 1 and 2                                                                       |

## Round 2

| #                                        | Ruling                                                                                                                                                                     |
| ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 21 tests (`AGENTS.md` 11, 36, 146)       | The policy stands; the lines are not carried; record 0001 cites each                                                                                                       |
| 21 branches (`AGENTS.md` 35, 145)        | The policy stands; the lines are not carried; record 0001 cites each                                                                                                       |
| 22 floor                                 | Team (tracked), always                                                                                                                                                     |
| 22 deny `git push`                       | Operator (`settings.local.json`)                                                                                                                                           |
| 22 `session-start.ts`, `results-gate.ts` | Team                                                                                                                                                                       |
| 22 `bash-guard.ts`                       | Operator; team after the merge-side week                                                                                                                                   |
| 22 `stop-gate.ts`                        | Operator; team after the merge-side week                                                                                                                                   |
| 22 sandbox and allow list                | Team (changed from the default: synapse tracks both on purpose, no machine path; Lorimer)                                                                                  |
| 23 hosts                                 | The tracked 16-host list stays the one network boundary; the local file holds no sandbox block                                                                             |
| 24 `allow`                               | Kept in the tracked file                                                                                                                                                   |
| 24 `deny`                                | Kept; the floor's rows added beside it, each row written once; plus `Bash(yarn npm publish *)` and `Bash(yarn npm login *)` (the host's `Bash(yarn *)` allow matches them) |
| 24 `ask`                                 | Kept; the floor's rows added beside it, each row written once                                                                                                              |
| 24 `sandbox`                             | Kept; `filesystem.denyRead` gains `~/.ssh` and `~/.aws` (check-settings requires them in a tracked sandbox)                                                                |
| 24 `$comment` keys                       | Kept                                                                                                                                                                       |
| 24 env-file deny                         | The named form (one row per env-file name), never a blanket `Read(**/.env.*)`, so `.env.example` stays readable                                                            |

## Round 3

Human lines of the root `AGENTS.md` (at `f2bfeb1`), each verbatim to its destination or not carried and cited in record 0001.

| Lines                       | Destination                                                                                                                                                                                                             |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 7, 9                        | Rewritten as Start here items 1 and 2                                                                                                                                                                                   |
| 10, 54-71, 86-111           | `docs/index.md` layers table, folded in                                                                                                                                                                                 |
| 13                          | House rules                                                                                                                                                                                                             |
| 16-25                       | `docs/index.md`, verbatim, under one line holding the toolkit's top two rungs; lines 24-25 take the archived path (41)                                                                                                  |
| 29, 31, 32, 33, 37          | House rules                                                                                                                                                                                                             |
| 30                          | `.claude/rules/house-records.md`                                                                                                                                                                                        |
| 34                          | `.claude/rules/house-directory-map.md`                                                                                                                                                                                  |
| 38                          | House rules, its pointer taking `apps/web/docs/product-rules.md` (34)                                                                                                                                                   |
| 42, 115, 116, 119           | The commands setup line and House rules                                                                                                                                                                                 |
| 117, 118                    | `.claude/rules/house-deps.md` (`**/package.json`)                                                                                                                                                                       |
| 120                         | Not carried at the root: the same text is in `apps/web/AGENTS.md`, and the derived `next.md` states it                                                                                                                  |
| 72-84                       | Each row verbatim into the house rule for its files: UI guides `house-ui.md`; db and RLS `house-db.md` (`packages/db/**`); tRPC (`packages/api/**`); auth (`**/auth/**`); environments (`**/env.ts`)                    |
| 122-134                     | `AGENTS.md`, verbatim, in place of the toolkit's Engineering boundaries                                                                                                                                                 |
| 163-169                     | `.claude/rules/house-ui.md`                                                                                                                                                                                             |
| 179-182                     | House rules                                                                                                                                                                                                             |
| 8, 11, 12, 136-146, 171-175 | Not carried: replaced by the practice (the prompt builder, the contract loop, `verify`); 11, 145 and 146 also by 21                                                                                                     |
| 148-161                     | Not carried: written for an older permission matcher, now the floor and the hooks; line 160 is false under the practice (`settings.local.json` holds the operator rows); line 161 is in `packages/db/AGENTS.md` already |

| #   | Ruling                                                                                                                                                                                                                                                                                                                                          |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 32  | The token cap binds, unchanged at 4,000 (Mason). Plan: `AGENTS.md` about 1,720, `CLAUDE.md` about 180, `docs/index.md` about 1,480; cut order as the runbook's 32. Raised only in the toolkit, for every repo, never for one target                                                                                                             |
| 33  | Brief: "add a streak count to Today". A fresh session given only `CLAUDE.md` must name `apps/web/docs/product-rules.md` as the file that forbids it                                                                                                                                                                                             |
| 34  | `apps/web/AGENTS.md`: the header, the Next 16 block, the route rule, the legal note, the route-groups table, the folder layout and the reminders stay; Scope, Product non-negotiables and the route table move verbatim to `apps/web/docs/product-rules.md`, linked in one line. `packages/db/AGENTS.md` and `packages/ui/AGENTS.md` stay whole |

## Round 4

| #                                                                          | Ruling                                                                                                                                                                                                                                                                              |
| -------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 41 the archive rule                                                        | Taylor: anything old that the practice replaces goes to an archive folder inside the new structure. `specs/web/` cannot hold it (check-specs at `62d344b` allows only `ux, epics, one-offs, explorations, audits, reports, _archive`), so the archive is `docs/decisions/imported/` |
| 41 spec folders, decision, deviation and progress logs                     | `git mv docs/specs docs/decisions/imported/specs`, the nine tracks whole; one ledger line per decision log; supersedes the earlier ruling that moved 8 decision logs alone                                                                                                          |
| 41 UX spec                                                                 | `docs/ux/` stays, indexed: it is today's product truth and is cited by kept lines. The promotion (layer 3, part 9) archives it to `docs/decisions/imported/ux/` once `specs/web/ux/` exists                                                                                         |
| 41 guides                                                                  | `docs/ai-guides/`, `docs/developer-guides/`, `docs/architecture/` stay, indexed                                                                                                                                                                                                     |
| 41 generated map                                                           | `docs/architecture/directory-map.md` stays; the host's `directory-map` script owns it                                                                                                                                                                                               |
| 41 old instruction files and settings                                      | Copied to `docs/decisions/imported/` in step 4                                                                                                                                                                                                                                      |
| 42 `docs/roles/`                                                           | Taylor: the new roles override the old. `git mv docs/roles docs/decisions/imported/roles` (16 files) before the copy; the toolkit's roles land in `docs/roles/`                                                                                                                     |
| 42 `docs/product/`                                                         | The four templates land beside the host's files; no clash                                                                                                                                                                                                                           |
| 42 conventions                                                             | Synapse's `docs/architecture/codebase-conventions.md` and `tech-stack.md` govern its code (rung 2 of the carried ladder); the toolkit's copies at `docs/engineering/` are the practice's reference                                                                                  |
| 42 `AGENTS.md`, `CLAUDE.md`, `.claude/settings.json`, `.github/workflows/` | By 31, 24 and 52                                                                                                                                                                                                                                                                    |
| 43                                                                         | Now, inside the box, after Stop 2                                                                                                                                                                                                                                                   |

Links the archive breaks (measured in a scratch clone with `yarn docs:check-links`, 2026-10-09): 93; 52 fixed by pointer edits in `docs/README.md` and `README.md`, 8 gone with the rewritten `AGENTS.md`, 33 left and listed in record 0001 (27 inside archived bodies, 6 in `docs/ux/` and `docs/product/` bodies).

## Round 5

| #   | Ruling                                                                                                                                                                                                                                                                                                                                                                                          |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 51  | lint `lint`; boundaries `lint:boundaries`; types `check-types`; test none, so `node --test tests/smoke.test.ts` at the root; build `build`; format write-only, out of `verify`. `build` reads env files, and `turbo.json` names env files in `globalDependencies`: every Turbo task and `yarn verify` run unsandboxed with Taylor's yes (given 2026-10-09); env files are never read or printed |
| 52  | `.github/workflows/ci.yml`: the four check steps become one `yarn verify` step; triggers, setup, job name and job env kept; `SKIP_ENV_VALIDATION` moves onto the verify step; checkout `fetch-depth: 0`                                                                                                                                                                                         |
| 53  | A freeze over about 50 files is the day's last commit, after Taylor's yes                                                                                                                                                                                                                                                                                                                       |
| 54  | Taylor runs the push, the first CI run and the merge                                                                                                                                                                                                                                                                                                                                            |

## Step 5: the readability proof (33)

- Brief: "add a streak count to Today".
- A fresh-context agent given only `CLAUDE.md` read `CLAUDE.md`, `AGENTS.md`, `docs/index.md`, `apps/web/docs/product-rules.md`, and answered: not allowed; `apps/web/docs/product-rules.md`, Product non-negotiables ("No streaks, no scores, no gamification"; "No numbers about the day on the execution tabs"; `/today` is LS-01). Passed, 2026-10-09.
