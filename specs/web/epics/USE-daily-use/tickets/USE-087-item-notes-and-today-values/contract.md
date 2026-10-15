---
size: medium
objective: "A plain item's Notes and its today-only time and icon are stored as rows, not kept on the device or written as a dated copy of the item"
slice_type: "a schema addition under RLS; risks a migration run unreviewed, a column readable across users, and USE-64's copies left behind"
non_negotiables:
  - "Migrations are append-only under packages/db/migrations/; Taylor reviews the SQL before it runs on any hosted database."
  - "Every new column stays owner-private through the table's existing policies; nothing runs on the singleton db."
  - "Notes and Linear's description stay one value (D-USE-36)."
devs_call: "Which of the two shapes in the Build notes, once Taylor picks; the column names; how USE-64's fixture copies migrate."
cites:
  - "specs/web/epics/USE-daily-use/ux/day/item-sheet/words-and-access.md"
  - "C-USE-item-sheet-1"
  - "D-USE-60"
truth_files: "none: promotion carries day/item-sheet/"
qa: Q3
reviewers: []
focus: []
operator_review: false
planned_paths:
  - "packages/db/migrations/"
  - "packages/db/src/schema/"
  - "packages/validators/src/planner.ts"
  - "apps/web/lib/data/use-item-sheet.ts"
  - "apps/web/lib/fixtures/"
depends_on:
  - "USE-64"
out_of_scope:
  - "Linear's description sync: the Linear tickets"
  - "Running the migration anywhere hosted: Taylor's"
criteria:
  - id: C1
    statement: "Notes typed on a plain item are read back from the record on a reload, for that date only"
    evidence: test
    command: "yarn test"
  - id: C2
    statement: "A today-only time or icon is stored for the date and the usual item is unchanged, with no dated copy written"
    evidence: test
    command: "yarn test"
  - id: C3
    statement: "The web app type-checks"
    evidence: check
    command: "yarn check-types"
id: USE-87
---

# Contract — item-notes-and-today-values

## Build notes

Found building USE-64. The schema has no place for a plain item's Notes (`block_items` has no `notes`), and a slot carries only the date's `length_min`. USE-64 therefore keeps Notes on the device per date [ASSUMPTION], and writes a today-only time, icon or swap as the date's own copy of the item (`on_date`) with the set item skipped on the date; Make it Monday's usual finds the set item behind a copy by its place, since no column links them.

- **Approach, one of (Taylor's call):** (a) `block_items.notes`, plus `slots.at_time` and `slots.icon` as the date's own values, so no copy is needed and Swap alone writes a copy; or (b) `block_items.notes` plus `block_items.replaces_item_id` on a date's copy, keeping USE-64's copies and naming what each stands in for.
- **Interfaces:** the columns; `slotUpdateInput` / `placeSlotInput` or `blockItemInput` gain them; `useItemSheet`'s notes store and `copyOrigin` go.
- **Gotchas:** the fixture records parse through the validators, so a column must reach `@syn/validators` before the fixtures can hold it.
- **Model:** Opus 5.5 at medium.
