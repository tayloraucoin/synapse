---
title: "contract.md (template): the unit of work"
description: "Fill when any change starts, one-off or epic ticket: the testable criteria with their evidence types, the planned paths and the one surface it cites. yarn contract:init writes it from this file."
layer: engineering
status: draft
thread: P-J
role: Lorimer
date: 2026-10-02
last_reviewed: 2026-10-02
supersedes:
load_when: on request
---

# Contract — [FILL: id] [FILL: slug]

> **Who fills:** the builder for a one-off; Reeve, with Mason, for an epic ticket at the Tickets stage. `contract:init` computes `id`; never type it. `qa`, `reviewers` and `focus` are what the operator confirmed.
> **When:** before any code. Run `yarn contract:init <APP | app | EPIC> <slug>` once to get this file in its folder, fill it, then run the same command again: it freezes the criteria and writes every result at FAIL, on the operator's branch. An epic's Tickets stage adds `--draft` and starts nothing.
> **Lives at:** `specs/<app>/one-offs/<APP>-<n>-<slug>/contract.md`, or `specs/<app>/epics/<EPIC>-<slug>/tickets/<EPIC>-<n>-<slug>/contract.md`. The fields below become the file's frontmatter; delete this instruction block.
> **What the check enforces:** `check-specs`, against `docs/engineering/schemas/contract.schema.json`: every field present; at most 2,500 tokens and seven non-negotiables (split the ticket otherwise); at most one surface file in `cites` without a `waiver`; every `test` and `check` command a `package.json` script run through `yarn`; at Q3, a `review:<role>` criterion for each reviewer; no `docs/research/` path; the criteria unchanged since init (add one with `yarn contract:add`). `contract:init` refuses a cited file that is not `status: approved` or holds `[NEEDS DECISION — BLOCKING]`, a dependency whose own criteria are not all PASS, and a Q3 epic ticket without its pre-flight PASS.
> **QA level (PR-19, `docs/workflows/qa-levels.md`):** the operator's choice, never computed. Q1: the builder runs the criteria. Q2: plus one reviewer in the thread. Q3 (money, auth, schema, personal data, agent permissions): proofs that are checked for staleness before a merge, and a kept review per reviewer. `contract:init` flags once a planned path that reaches a critical path below Q3. After the start: `yarn contract:qa <id> <Q0 | Q1 | Q2 | Q3> [--reviewers <role,role>]`.
> **Manual criteria (PR-16):** the builder checks whatever a tool can reach itself. What only a person can check is handed over with `--verdict deferred`, listed under Operator checks in `specs/_status.md`, and never holds the ticket. `operator_review: true` adds such a criterion for Taylor's own look; Taylor can also ask for it in the thread.
> **Never a criterion:** `yarn verify`. It runs once at batch close; a criterion proves this ticket's own work.
> **Evidence types:** `test` for logic, data, money and auth (a `command`; its runner must report at least one passing test, so name tests after their criterion; a name pattern appended to a script whose last word is a file glob does not filter); `check` for lint, types, boundaries and tokens (a `command`); `capture` for UI, through `?state=` (a `path`); `manual` for a human check (a `reason`; reported as not verified). UI criteria default to `capture`.
> **Filled example:** `specs/web/one-offs/` and `specs/web/epics/` (P-C builds the demo through this loop).

## Fields

```yaml
id: "[FILL: computed by contract:init]"
size: small # small: under half a day, the default; medium: half a day to two days; large: split it
objective: "[FILL: one line: what changes for whom]"
slice_type: "[FILL: what kind of work this is, and the class of failure it risks]"
non_negotiables:
  - "[FILL: at most seven, one line each]"
devs_call: "[FILL: what the builder decides freely]"
cites:
  - "[FILL: the one surface file, as specs/<app>/ux/<area>/<surface>.md]"
  - "[FILL: decision and criterion IDs from it, as D-OB2-1 or OB2-W3]"
truth_files: "none: [FILL: why no living UX file changes]" # or a list of specs/<app>/ux/ paths edited in this PR
qa: Q1 # Q1, Q2 or Q3, as the operator confirmed (docs/workflows/qa-levels.md)
reviewers: [] # who reviews, as the operator confirmed; role names, as in vigil or warden
focus: [] # named parts to examine more closely, as in "the webhook handler: every event type handled (warden)"
operator_review: false # true when Taylor wants to look it over himself, as for a new surface in the browser; the ticket still closes
planned_paths:
  - "[FILL: repo paths or globs this ticket will change]"
depends_on: [] # work-ids that must be built first (their own criteria PASS)
out_of_scope:
  - "[FILL: what this ticket will not do]"
criteria:
  - id: C1
    statement: "[FILL: what is true when this is done, observable by a user or caller]"
    evidence: test
    command: "[FILL: yarn <script>; a package.json script that runs this criterion's test]"
  - id: C2
    statement: "[FILL]"
    evidence: check
    command: "[FILL: yarn <script>]"
```

## Build notes

`[FILL: what to build, so the builder and a person reading over its shoulder need no other file. Edit this section at any time: only the criteria are frozen.]`

- **Approach:** `[FILL: the shape of the solution in a few lines]`
- **Decisions that apply:** `[FILL: each decision this ticket builds on, by ID, with its text copied from the cited file; the cited file stays the source when a decision spans tickets]`
- **Interfaces:** `[FILL: the exports, routes, tables or commands this ticket adds or changes, by name]`
- **Per path:** `[FILL: one line per planned path: what it will hold]`
- **Gotchas:** `[FILL: what a builder would get wrong without being told; or "none"]`
- **Model:** `[FILL: the model to build with, and what goes wrong when choosing down]`
