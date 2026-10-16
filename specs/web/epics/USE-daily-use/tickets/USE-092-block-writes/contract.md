---
size: medium
objective: "Set my days, the New block sheet, the Block view and Review the day's edits write blocks, block changes, set items, day bounds and events to Postgres, each with the Undo the toast already offers"
slice_type: "the planner's write path and the shared undo token; risks a repeat-scope edit that rewrites the wrong dates, an undo that restores another user's row, and a multi-row write left half done"
non_negotiables:
  - "Every write runs inside ctx.rls.execute(), and a write that touches several rows runs in one transaction."
  - "Every input is a @syn/validators schema; the three writes with none (splitBlock, removeBlockItem, reorderItems) get one here."
  - "Editing 'this date', 'this and following' or 'all' changes exactly the dates the fixture changes (USE-47's scope rules)."
  - "Undo puts back exactly what the write changed, under the same RLS, and refuses a token whose rows are not the caller's."
  - "The undo token is signed (HMAC-SHA256, key UNDO_TOKEN_KEY through the API's env.ts); a token whose signature fails is refused before any row is read."
  - "The hooks' write results keep their shape: { undo, id?, reach? }."
devs_call: "The undo token's encoding (base64url JSON is fine); the service split; whether reorder writes sort_order by gaps or renumbers."
cites:
  - "specs/web/epics/USE-daily-use/ux/dev-notes/blocks-and-todos-model.md"
  - "D-USE-80"
  - "D-USE-35"
truth_files: "none: behaviour is the ledger's; only the data source changes"
qa: Q1
reviewers: []
focus: []
operator_review: false
planned_paths:
  - "packages/api/src/services/planner/"
  - "packages/api/src/services/undo/"
  - "packages/api/src/env.ts"
  - ".env.example"
  - "packages/api/src/routers/planner.ts"
  - "packages/validators/src/planner.ts"
  - "apps/web/lib/data/live/planner.ts"
depends_on:
  - "USE-91"
  - "MIG-17"
out_of_scope:
  - "Copy from, Clear and Reset to usual: USE-93"
  - "Slots and slot events: USE-94"
  - "To-dos: USE-95"
criteria:
  - id: C1
    statement: "createBlock, editBlock, createTransition, writeBlockChange, writeBlockItem, editBlockItem, writeBounds and writeDayEvent write the row the fixture writes, and refuse what the fixture refuses with the same reason"
    evidence: test
    command: "yarn test"
  - id: C2
    statement: "Editing a repeating block 'this and following' from a date ends the old rule the day before and starts a new block on that date, in one transaction; 'this date' writes one block_change; 'all' edits the block"
    evidence: test
    command: "yarn test"
  - id: C3
    statement: "removeBlockItem with a date skips that date's slot and leaves the set item; without one it removes the item; reorderItems writes sort_order for the date or for the usual block as asked"
    evidence: test
    command: "yarn test"
  - id: C4
    statement: "planner.undo with a write's token restores every row that write changed and removes every row it added; a token naming a row the caller does not own changes nothing and is refused"
    evidence: test
    command: "yarn test"
  - id: C5
    statement: "The web app and the API type-check"
    evidence: check
    command: "yarn check-types"
id: USE-92
---

# Contract — block-writes

## Build notes

The fixture's `PlannerServer` writes, apart from the day-level four (USE-93) and the slot writes (USE-94), become `planner.*` mutations.

- **Decisions that apply:**
  - D-USE-80: Repeats keeps one RFC 5545 rule. A skipped date is a `block_changes` row, never an EXDATE.
  - D-USE-35, through USE-47: the scope question, This date, This and following or All, decides which dates change.
  - Data contract: a block change is skipped, or has both new times. Reset to usual deletes the row.
- **Methods to routers:**

  | Fixture method                     | Procedure                                  | Validator                      |
  | ---------------------------------- | ------------------------------------------ | ------------------------------ |
  | `writeBounds`                      | `planner.writeBounds`                      | `dayBoundsInput`               |
  | `createBlock(input, scope?)`       | `planner.createBlock`                      | `newBlockInput` + `writeScope` |
  | `createTransition`                 | `planner.createTransition`                 | `newTransitionInput`           |
  | `editBlock`                        | `planner.editBlock`                        | `editBlockInput`               |
  | `splitBlock`                       | `planner.splitBlock`                       | new `splitBlockInput`          |
  | `writeBlockChange`                 | `planner.writeBlockChange`                 | `blockChangeInput`             |
  | `writeBlockItem` / `editBlockItem` | `planner.writeBlockItem` / `editBlockItem` | existing                       |
  | `removeBlockItem`                  | `planner.removeBlockItem`                  | new `removeBlockItemInput`     |
  | `reorderItems`                     | `planner.reorderItems`                     | new `reorderItemsInput`        |
  | `writeDayEvent`                    | `planner.writeDayEvent`                    | `dayEventInput` + `id?`        |
  | `undo(token)`                      | `planner.undo`                             | new `undoInput`                |

- **The undo token** (decided at the gate; no table):
  - `services/undo/` gives `recordUndo(changes)`, called inside each write's transaction. `changes` lists `{ table, op: "insert" | "update" | "delete", before? }`.
  - The token is that list, encoded and signed with HMAC-SHA256 under `UNDO_TOKEN_KEY` (Node `crypto`, no dependency), so a client cannot forge one past the validators (Vigil, 2026-10-16). Taylor sets the key in Vercel.
  - `undo(token)` parses it with a zod schema per table (only the planner, work and to-do tables are allowed), then inside `ctx.rls.execute` in one transaction: deletes inserted rows, restores updated rows to `before`, re-inserts deleted rows.
  - RLS makes another user's row invisible, so the update or insert fails and the whole undo is refused.
  - USE-93, 94, 95, 98 and 99 call the same `recordUndo`.
- **Per path:**
  - `services/planner/write-blocks.ts`, `write-items.ts`, `write-bounds.ts`.
  - `services/undo/undo.ts` with `undo.test.ts` (C4).
  - Tests C1 to C3 run each service's pure plan (what to write) over in-memory rows. Shape every service as plan (pure) then apply (rls): the plan is what the tests read.
- **Gotchas:**
  - The fixture's `splitInto` moves dependents (items, changes after the date) to the new block; match it.
  - `createTransition` writes a `block_items` row (in a block) or a `blocks` row of kind `transition` (between blocks), per USE-2.
  - A child row's parent is read through `ctx.rls`, so a parent of another user's is invisible; insert fails rather than crossing users (USE-2's noted decision).
  - Write the planner's refusal reasons through `refuse()` from USE-90 so the hooks keep their words.
- **Model:** Opus 5.5 at medium. A smaller model writes undo as 'delete what I inserted' only, and an edit's undo is lost.
