---
id: MIG-5
size: medium # small: under half a day, the default; medium: half a day to two days; large: split it
objective: "Synapse has a chosen test runner and real tests arrive with each feature ticket"
slice_type: "test infrastructure; risks a runner choice made by drift"
non_negotiables:
  - "One runner for workspace code, ruled in the ledger with its reason; node:test stays only where code runs on bare Node (root tests/, tooling/, scripts/)."
  - "yarn test reaches the workspace suites through Turbo, and a workspace suite with zero test files fails it."
  - "No workspace takes a test script before it has a test; no passWithNoTests anywhere."
  - "No coverage threshold before a measurement; no hosted service."
  - "Vitest is pinned exactly and added with yarn, never npm or pnpm."
  - "Tests use synthetic data only."
devs_call: "Which workspace gets the first tests and which helpers they cover; the root script names; whether the smoke test is folded in or kept."
cites:
  - "MIG-migration rulings, layer 3 part 3"
  - "ledger: MIG-5 (the runner ruling)"
truth_files: "none: test tooling only; the app's behaviour does not change" # or a list of specs/<app>/ux/ paths edited in this PR
qa: Q1 # Q1, Q2 or Q3, as the operator confirmed (docs/workflows/qa-levels.md)
reviewers: []
focus: [] # named parts to examine more closely, as in "the webhook handler: every event type handled (warden)"
operator_review: false # true when Taylor wants to look it over himself, as for a new surface in the browser; the ticket still closes
planned_paths:
  - "package.json"
  - "yarn.lock"
  - "turbo.json"
  - "tests/"
  - "packages/utils/package.json"
  - "packages/utils/src/string.test.ts"
  - "packages/utils/src/number.test.ts"
  - "docs/decisions/ledger.md"
  - "docs/decisions/changelog.md"
  - "docs/architecture/tech-stack.md"
depends_on: [] # work-ids that must be built first (their own criteria PASS)
out_of_scope:
  - "Coverage thresholds before there is coverage to measure (drafted as MIG-14)"
  - "Patch coverage, which needs a hosted service"
  - "Tests for workspaces other than @syn/utils; each arrives with its feature ticket"
criteria:
  - id: C1
    statement: "yarn test runs the workspace suites through Turbo, then the root tests, and exits 0 with the @syn/utils suite and the smoke test passing"
    evidence: test
    command: "yarn test"
  - id: C2
    statement: "Every workspace test script is vitest run without passWithNoTests, the root test script goes through Turbo, and a workspace suite with no test files exits non-zero"
    evidence: test
    command: "yarn test:root"
  - id: C3
    statement: "The @syn/utils string and number helpers behave as their doc comments say, on synthetic input"
    evidence: test
    command: "yarn workspace @syn/utils test"
  - id: C4
    statement: "@syn/utils typechecks with its test files included"
    evidence: check
    command: "yarn workspace @syn/utils check-types"
  - id: C5
    statement: "@syn/utils lints clean with its test files included"
    evidence: check
    command: "yarn workspace @syn/utils lint"
---

# Contract — MIG-5 tests-beyond-smoke

## Build notes

Drafted by the migration (rulings.md, record 0001) on 2026-10-09; the criteria are written when the ticket starts.

- **Layer:** 3, part 3.
- **What did not cross:** tests. Layer 2 left one smoke test (tests/smoke.test.ts on node:test, the verify chain's test step); turbo.json defines a test task that no workspace has a script for.
- **Plan:** The runner question first, as its own decision (node:test today; Vitest is the usual choice for a Next and React workspace repo): a decision record, then the runner in the workspaces that need it, wired so yarn test runs it and never passes on zero tests. Then tests arrive with each feature ticket under the contract loop. Coverage thresholds once measured, rounded down, auto-updated only downward-safe. Operator: patch coverage needs a hosted service.
- **Conflict risk:** low per ticket; the thresholds commit touches CI. Trigger: the third feature ticket with tests, or Taylor's call.
- **Estimate:** a day for the runner and the first real tests; thresholds an hour once measured. Estimates.

## Rulings this slice makes

- **Runner (judgment, not measurement):** Vitest 5.0.3 for workspace code; node:test for the root `tests/`, `tooling/` and `scripts/`. Reason: workspace source imports extensionless relative paths and `@syn/*` TypeScript entry points that node:test cannot load without a loader, and the React workspaces will need a DOM. One ledger line and a changelog entry; no record, because the reason fits in one line.
- [ASSUMPTION: the dependency row goes in `docs/architecture/tech-stack.md`, Synapse's own stack table; `docs/engineering/tech-stack.md` describes the toolkit's `@pem/*` stack.]
- [ASSUMPTION: the smoke test is kept, not folded in: `test:root` runs `tests/*.test.ts` on node:test after Turbo.]
- [ASSUMPTION: turbo.json's `test` task is unchanged (`cache: false`); workspace packages ship source, so the task needs no `^build`.]
