---
size: small
objective: "yarn test passes under load: the two nav-items tests no longer time out while the rest of the suite and other threads keep the machine busy"
slice_type: "test repair only; risks loosening a test to pass it"
non_negotiables:
  - "Every expectation stays as it is; nothing is skipped, retried or loosened (check-test-weakening holds)."
  - "No suite-wide testTimeout raise: the fix is in the two tests or in what nav-items pulls in."
devs_call: "Whether to import nav-items statically at the top of each test file, or to cut what nav-items imports so its first load is cheap."
cites:
  - "apps/web/lib/data/settings-connections.test.ts"
truth_files: "none: no surface changes"
qa: Q1
reviewers: []
focus: []
operator_review: false
planned_paths:
  - "apps/web/lib/data/set-up-view.test.ts"
  - "apps/web/lib/data/settings-connections.test.ts"
  - "apps/web/app/(shell)/_components/nav-items.ts"
depends_on: []
out_of_scope:
  - "Other tests' speed"
  - "The vitest config"
criteria:
  - id: C1
    statement: "yarn test passes with both nav-items tests in it, while the machine's load average is above 10"
    evidence: check
    command: "yarn test"
id: USE-136
---

# Contract — nav-items-tests-under-load

## Build notes

Found by the proof pass (2026-10-18), recording every built USE ticket on `feature/paper-ux`.

- **What fails.** In the full `yarn test`, two tests time out at vitest's 5,000 ms default whenever the load average is above about 10 (the capture threads' dev servers and browsers). Across both passes, 31 ticket runs timed out on `settings-connections.test.ts` › "drops the tabs on both, and Connect Linear's route is Connections" and 20 on `set-up-view.test.ts` › "drops the tabs on Set my days and leaves the rail with nothing current". Run alone, both files pass in about 4 s.
- **Why.** Each test begins with `await import("@/app/(shell)/_components/nav-items")`, and that first transform of the shell's nav module and its imports is what runs past 5 s under load. Every USE ticket whose criteria run `yarn test` records FAIL while it does.
- In fewer runs (seven each), `lib/data/source.test.ts` and `lib/fixtures/planner/repeat-scope.test.ts` timed out too. Check whether they share the cause before closing.
