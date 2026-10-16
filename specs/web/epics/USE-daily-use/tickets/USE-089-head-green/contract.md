---
size: small
objective: "HEAD passes yarn verify's code checks again, so every later USE ticket starts green and its own failures are its own"
slice_type: "a repair of five reds wave 2 left at HEAD 5f9af04; risks fixing a check by weakening it (a suppression, a widened test) instead of fixing the code"
non_negotiables:
  - "No eslint-disable, @ts-expect-error, suppression entry or test change makes a red go away; the code is fixed."
  - "lib/data/imports.test.ts is unchanged: the import moves, not the rule."
  - "RegionRetry stays presentational: detail is a prop, no domain words in @syn/ui."
  - "A spec file over its cap is split, never trimmed: every line stays."
devs_call: "Where SetUpScenarioStart's type lives under lib/data; how each exhaustive-deps site is fixed (stable callback, a ref, or the dependency added); how the two over-cap state files split (by width, or by row)."
cites:
  - "specs/web/epics/USE-daily-use/ux/day/review-the-day/states/error.md"
  - "C-USE-review-the-day-error-1"
truth_files: "none: no behaviour changes; RegionRetry's detail line is already drawn and already passed by its callers"
qa: Q1
reviewers: []
focus: []
operator_review: false
planned_paths:
  - "packages/ui/src/composed/feedback/region-retry/"
  - "apps/web/docs/design/components.md"
  - "apps/web/app/(shell)/days/_components/copy-from.tsx"
  - "apps/web/lib/data/"
  - "apps/web/lib/fixtures/scenarios/set-up.ts"
  - "apps/web/components/planner/item-sheet/work-item-sheet.tsx"
  - "apps/web/components/work/pool-sheet/place-sheet.tsx"
  - "specs/web/epics/USE-daily-use/ux/interactions/ready-go/"
  - "specs/web/epics/USE-daily-use/ux/work/today/states/"
  - "specs/_status.md"
depends_on: []
out_of_scope:
  - "check-specs' A8 and A10 errors on ux/boards/ and ux/narrative/: MIG-23 restores the ledger and narrative kinds"
  - "Review the day's other system states: USE-34 (it now finds detail already there)"
criteria:
  - id: C1
    statement: "RegionRetry draws an optional muted detail line under its label, and its story shows it; day-view and the Block view's failed state type-check passing it"
    evidence: check
    command: "yarn check-types"
  - id: C2
    statement: "No file outside lib/data, lib/fixtures and app/(dev) imports lib/fixtures, with copy-from reading its scenario type through lib/data"
    evidence: test
    command: "yarn test"
  - id: C3
    statement: "yarn lint passes with no warning, use-planner-writes' effect included"
    evidence: check
    command: "yarn lint"
  - id: C4
    statement: "yarn lint:boundaries passes: no live file disables a rule the boundaries config does not load"
    evidence: check
    command: "yarn lint:boundaries"
  - id: C5
    statement: "ready-go/index.md and today/states/opened-day.md are each split under the 2,000-token cap with every line kept, and their links resolve"
    evidence: check
    command: "yarn docs:check-links"
id: USE-89
---

# Contract — head-green

## Build notes

Build first: every wave 2 and wave 3 thread starts from HEAD and must not inherit these. Measured in a clean worktree of `5f9af04` on 2026-10-16.

- **The reds, exactly:**
  1. `check-types`: `day-view.tsx:730` and `today-block-screen.tsx:330` pass `detail` to `RegionRetry`, which has no such prop. USE-34 planned it ("the detail line joins when RegionRetry's detail lands", `schedule-screen.tsx:144`); it lands here instead, and `schedule-screen.tsx` may pass its own.
  2. `lib/data/imports.test.ts` C6: `app/(shell)/days/_components/copy-from.tsx` imports `type SetUpScenarioStart` from `@/lib/fixtures/scenarios/set-up`. Move the type (or a twin) under `lib/data/` and import it from there; the fixtures import it back.
  3. `yarn lint` (web, max 0 warnings): `lib/data/use-planner-writes.ts:236`, `react-hooks/exhaustive-deps`, missing `invalidate`.
  4. `yarn lint:boundaries`: "Definition for rule 'react-hooks/exhaustive-deps' was not found" at `components/planner/item-sheet/work-item-sheet.tsx:260`, `components/work/pool-sheet/place-sheet.tsx:106`, `lib/data/use-place.ts:335`. The boundaries config does not load react-hooks, so an `eslint-disable` naming it is an error there. Fix the dependencies and drop the comments; do not add the plugin to the boundaries config.
  5. check-specs A10: `ux/interactions/ready-go/index.md` (about 2,015 tokens) and `ux/work/today/states/opened-day.md` (about 2,174). Split a state by width, an index by row (the ledger convention), keeping every line.
- **RegionRetry:** `detail?: string`, rendered under the label in the same muted tone at the small size; the row keeps `role="status"`. Add the variant to its story and one line to `apps/web/docs/design/components.md`.
- **Gotchas:** run `yarn status` and commit `specs/_status.md` (check-specs warns it is stale). The shared tree was synced to HEAD on 2026-10-16; commit with a pathspec.
- **Model:** Opus 5.5 at medium. A smaller model adds a disable comment or edits the test.
