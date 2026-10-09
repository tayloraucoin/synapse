---
title: "Track: migrate"
description: "Read when an existing repo with history is being brought under the practice in place: the builder asks the three questions the assessment needs, then hands the work to the migrate runbook, which interviews from the assess report and walks layer 1."
layer: workflows
status: draft
thread: "MIG"
role: Usher
date: 2026-10-07
last_reviewed: 2026-10-07
supersedes:
load_when: on request
---

# Migrate: bringing a repo that already exists under the practice

> **In one line:** a repo with a history, a team and its own checks moves the way it works all at once, in one day, on one branch, without a rewrite. The builder asks where the repo is and which branch it protects, then prints a prompt that runs the migrate runbook. The runbook's interview is the real one: it starts from the assess report, not from the operator's memory.

## When it applies

A repo already exists and keeps its history, and the operator wants it to work the practice's way: the agent spine, workflows, roles, specs, `toolkit.json`, a verify command over the repo's own checks, and the reviewer map. The sibling track, [new project](new-project.md), assumes a fresh duplicate of the toolkit; this one assumes a target that was never a duplicate.

It is not this track when the repo is a fresh start (new project), when only one convention is wanted (a one-off in that repo), or when the stack is not JavaScript past layer 1 (layer 1 runs; layers 2 and 3 become one named gap each).

## Stages

| Stage        | What happens                                                                                                                                                                   |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1. Open      | The builder asks the three questions below and prints the prompt                                                                                                               |
| 2. Assess    | One thread runs the preconditions and the read-only assessment from a toolkit checkout; the report is the interview's opening document                                         |
| 3. Interview | The same thread asks the runbook's rounds from the report: prefixes, conflicts, human lines, records, the verify inputs. Every ruling lands in one table the operator confirms |
| 4. Layer 1   | The same thread walks the manifest: commit 1, copy, derive, the human lines, the records moves, the gap tickets, record 0001, the end check                                    |
| 5. Layer 2   | The same thread maps the repo's own checks into one `verify` command, freezing what fails at base; CI is wired where it exists                                                 |
| 6. Hand over | The thread prints the migration branch's name and the follow-on prompts. The operator pushes, merges, and opens layer 3 part by part from the drafted gap tickets              |

The steps live in [`../../runbooks/migrate/README.md`](../../runbooks/migrate/README.md). The runbook hands layer 2 and layer 3 to its own files beside it. Layer 3 never runs in the migration thread: each part is a drafted ticket under the target's migration epic, started when the operator says.

## Cast and QA

Lead: Usher, for the run's order and its stops. Support: Lorimer for the harness and the settings rulings, Mason for the verify mapping and the gap plans, Crucible when the path is far. Q1 in the target, with `yarn verify:fast` after each step once it exists and `yarn verify` at the end of layer 2. The procedure itself was reviewed at Q2 in the toolkit; a real run's proof is the end check and the operator's first CI run.

## The builder's own questions for this track

Three questions, asked once by the builder in place of its Round D. The runbook's round 0 reads them from the prompt and never asks them again:

| #   | Question                                                    | Options                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | Sets                                                                           |
| --- | ----------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| M1  | Where is the target, and where is a toolkit checkout?       | Ask. Two absolute paths. The toolkit checkout is where `yarn migrate:assess` runs from, and the commit the record names.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | The assess command's arguments; the record's toolkit commit                    |
| M2  | Which branch does merged work live on in this repo?         | The branch recent work merges into (Recommended only when it already contains the commit the migration branch is cut from, named from the repo's recent merges when the dump shows them). A branch that does not is stale however recent its merges: the pushed work branch is Recommended instead, named as the protected branch (nothing is deployed or fast-forwarded for a docs migration). The branch deployed from is never Recommended: the operator may first fast-forward it to the work and push it, in their own hands, knowing that on a deploy branch this deploys. Never the default branch by assumption: a stale `main` is the risk the preconditions exist for. | `protectedBranch` in `toolkit.json`; the `--protected` argument to every check |
| M3  | What is the migration branch called, and does it exist yet? | The repo's own branch convention applied to this work (Recommended; the operator creates it from M2's branch before the run). `agent/<prefix>` only when the repo has no convention.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | The branch the run commits on; the name the run prints at its end              |

The builder's standing rounds apply with these defaults: Round C's branch question is answered by M3 (the operator creates the branch; the thread never does); no ticket in the toolkit (the target's migration epic holds the run's records); involvement "check in at gates", with one stop after the interview's answer table and one before the records moves. Pace "balanced"; the deepest model available, because the interview is design work.

## What the builder prints

- The migrate prompt, with M1 to M3 written in as instructions, the venue (a Claude Code session opened in the target, with the toolkit checkout's path in the prompt), and a line that the interview starts from the assess report and is the runbook's to run.
- The forecast, as estimates: one working day for layers 1 and 2 on the near path; the records step and the conflict round add time on the middle path; the far path adds the single-app rulings and leaves CI as a hosted gap.

The migration thread prints the follow-on prompts itself, from the runbook's layer-3 file, when the run ends.

## What gets written

In the target, on the migration branch: `toolkit.json`, the derived spine and path rules, the copied practice docs, skills and tooling, the settings from the rulings, the specs root with the migration epic (`assess.md`, `rulings.md`, the drafted gap tickets), the imported records, record 0001 (`records/0001-adopt-the-practice.md` under the target's `docs/decisions/`), and the `verify` scripts. One commit per step, each opening with the repo's own prefix. Never a push, a merge or a touch of the protected branch: the operator merges.

In the toolkit: nothing. A stop the run finds in the runbook is a finding for the runbook's own ticket, not an edit made mid-run.
