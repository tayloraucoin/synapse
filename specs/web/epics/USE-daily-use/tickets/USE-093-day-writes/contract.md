---
size: small
objective: "Copy from, Clear the day and Reset to usual write a whole day's blocks at once to Postgres, each in one transaction with one Undo"
slice_type: "multi-table day writes; risks a copy that half lands, a reset that deletes a usual block, and an undo that cannot put a cleared day back"
non_negotiables:
  - "Each of the four runs in one transaction inside ctx.rls.execute(): all of it lands or none does."
  - "Reset to usual deletes only that date's own rows (its block_changes, skipped slots, dated items, dated blocks, dated bounds); the usual week is never touched."
  - "Clear writes skips and archives as the fixture does; no repeating block's rule is edited."
  - "Each returns one undo token through services/undo (USE-92) that puts the whole day back."
devs_call: "Validator names for the four inputs; whether copy reuses the block writes' plans."
cites:
  - "specs/web/epics/USE-daily-use/ux/interactions/copy-from/index.md"
  - "C-USE-copy-from-1"
truth_files: "none: behaviour is the ledger's; only the data source changes"
qa: Q1
reviewers: []
focus: []
operator_review: false
planned_paths:
  - "packages/api/src/services/planner/"
  - "packages/api/src/routers/planner.ts"
  - "packages/validators/src/planner.ts"
  - "apps/web/lib/data/live/planner.ts"
depends_on:
  - "USE-92"
out_of_scope:
  - "The single-block writes and undo itself: USE-92"
criteria:
  - id: C1
    statement: "copyDay from a built day to another clears the target first and copies the source's blocks, items and changes for that date, as the fixture does, and its undo restores the target as it was"
    evidence: test
    command: "yarn test"
  - id: C2
    statement: "copyBlock copies one block and its items to a date at a new start"
    evidence: test
    command: "yarn test"
  - id: C3
    statement: "resetDay deletes that date's own rows and nothing of the usual week; clearDay skips the date's repeating blocks and archives its dated ones"
    evidence: test
    command: "yarn test"
  - id: C4
    statement: "A failure part way through any of the four leaves no row changed"
    evidence: test
    command: "yarn test"
  - id: C5
    statement: "The web app and the API type-check"
    evidence: check
    command: "yarn check-types"
id: USE-93
---

# Contract — day-writes

## Build notes

The fixture's `copyDay`, `copyBlock`, `clearDay` and `resetDay` (`lib/fixtures/planner/index.ts`) become `planner.copyDay`, `copyBlock`, `clearDay` and `resetDay`. None has a validator yet: add `copyDayInput` (`{ from: DayRef, to: DayRef }`), `copyBlockInput` (`{ blockId, from, to, startsAt }`), `dayRefInput` and `resetDayInput` (`{ date }`).

- **Decisions that apply:**
  - Data contract: This week differs from the usual week only by `block_changes` and dated rows. Reset to usual deletes the row; Copy from writes rows.
  - Copy from (`ux/interactions/copy-from/`): one day takes another built day's blocks; replacing a built day asks first (the UI's), and Undo puts it back.
- **Tables:**
  - `copyDay` and `copyBlock`: `blocks`, `block_items`, `block_changes`.
  - `clearDay`: `blocks` (archive dated, change or skip repeating), `block_changes`, that date's `block_items`.
  - `resetDay`: delete that date's `block_changes`, skipped `slots`, dated `block_items`, dated `blocks` and dated `day_bounds`.
- **Per path:** `services/planner/day-writes.ts` holds the four as pure plans, plus one `apply` running a plan in a transaction; `day-writes.test.ts` holds C1 to C4. Test C4 by making apply throw on the plan's last step and asserting nothing was applied: rows in memory, the transaction a function.
- **Gotchas:**
  - Copying a repeating block onto a date writes a dated block (`on_date`), never a second rule.
  - A copied work block copies no work slots: sessions are placed, never copied (the fixture copies none).
- **Model:** Opus 5.5 at medium. A smaller model runs four separate writes and leaves a half-copied day on a refusal.
