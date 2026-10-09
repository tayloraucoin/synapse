---
title: Decisions ledger — every ruling, one line each
description: Read before changing a rule, to find whether a ruling already exists, who made it and where its reason lives. One line per decision.
layer: decisions
status: adopted
date: 2026-10-09
last_reviewed: 2026-10-09
supersedes:
load_when:
---

# Decisions ledger

## Imported decision logs (from before the practice)

One line per log, archived whole with its track on 2026-10-09 (record 0001). Entry-by-entry indexing is a drafted gap.

- infrastructure: [`imported/specs/infrastructure/TECHNICAL-DECISIONS.md`](imported/specs/infrastructure/TECHNICAL-DECISIONS.md), 8 entries, append-only.
- epic-1-setup: [`imported/specs/epic-1-setup/TECHNICAL-DECISIONS.md`](imported/specs/epic-1-setup/TECHNICAL-DECISIONS.md), 13 entries, append-only.
- epic-2-in-use: [`imported/specs/epic-2-in-use/TECHNICAL-DECISIONS.md`](imported/specs/epic-2-in-use/TECHNICAL-DECISIONS.md), 6 entries, append-only.
- epic-3-review: [`imported/specs/epic-3-review/TECHNICAL-DECISIONS.md`](imported/specs/epic-3-review/TECHNICAL-DECISIONS.md), 4 entries, append-only.
- epic-4-dynamic-schedule: [`imported/specs/epic-4-dynamic-schedule/TECHNICAL-DECISIONS.md`](imported/specs/epic-4-dynamic-schedule/TECHNICAL-DECISIONS.md), 35 entries, append-only.
- epic-5-first-run-rebuilt: [`imported/specs/epic-5-first-run-rebuilt/TECHNICAL-DECISIONS.md`](imported/specs/epic-5-first-run-rebuilt/TECHNICAL-DECISIONS.md), 13 entries, append-only.
- epic-6-day-first-first-run: [`imported/specs/epic-6-day-first-first-run/TECHNICAL-DECISIONS.md`](imported/specs/epic-6-day-first-first-run/TECHNICAL-DECISIONS.md), 10 entries, append-only.
- epic-7-workflow: [`imported/specs/epic-7-workflow/TECHNICAL-DECISIONS.md`](imported/specs/epic-7-workflow/TECHNICAL-DECISIONS.md), 15 entries, append-only.
- cross-cutting-system: [`imported/specs/cross-cutting-system/TECHNICAL-DECISIONS.md`](imported/specs/cross-cutting-system/TECHNICAL-DECISIONS.md), 7 entries, append-only.

## Records

- 0001: Synapse adopts the practice as an overlay, in place, with its history and its own rules kept: [`records/0001-adopt-the-practice.md`](records/0001-adopt-the-practice.md). Usher, 2026-10-09.

## Rulings without a record

- MIG-5: the workspace test runner is Vitest 5.0.3, exact, per workspace with tests, run by `yarn test` through Turbo and failing on zero test files; `node:test` stays for the root `tests/`, `tooling/` and `scripts/`. Why: workspace source uses extensionless and `@syn/*` TypeScript imports `node:test` cannot load unaided, and the React workspaces need a DOM. [`changelog.md`](changelog.md), 2026-10-09.
