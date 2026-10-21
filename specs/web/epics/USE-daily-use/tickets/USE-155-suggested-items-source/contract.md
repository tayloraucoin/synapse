---
id: USE-155
size: small
objective: "One pure list of suggested items per block, made of items used before in that kind and then the starter seed remapped to the seven kinds, read by both Swap and Block view"
slice_type: "pure functions and a constant; the risk is Swap's list drifting from Block view's, or a seed row showing twice"
non_negotiables:
  - "Pure and structural: @syn/utils takes structural types and never imports @syn/validators or @syn/types."
  - "STARTER_LIBRARY's rows keep their titles, glyphs and ranges; the remap reuses them and adds no new copy."
  - "Used before comes first, one per title (case-insensitive), with its last length and icon; transitions, meals and items already in the block are left out."
  - "A seed row whose title is already used before shows once, in Used before."
  - "Work and To-dos have no suggestions; nothing is stored, and no table is added."
  - "Swap reads the same used-before function, so its rows do not change."
devs_call: "the function and constant names; how 'last length' picks among equal dates"
cites:
  - "specs/web/epics/USE-daily-use/ux/day/block-view/suggested.md"
  - "C-USE-block-view-suggested-2"
  - "C-USE-block-view-suggested-3"
truth_files: "none: the epic's own ux/ ledger carries it (day/block-view/suggested.md, dev-notes/suggested-items.md, D-USE-135 to 138); it promotes to specs/web/ux/ with USE"
qa: Q1
reviewers: []
focus: []
operator_review: false
planned_paths:
  - "packages/constants/src/starter-library.ts"
  - "packages/constants/src/index.ts"
  - "packages/utils/src/planner/suggested-items.ts"
  - "packages/utils/src/planner/suggested-items.test.ts"
  - "packages/utils/src/planner/index.ts"
  - "apps/web/lib/data/use-item-sheet.ts"
depends_on: []
out_of_scope:
  - "Any UI: the list under the add row is USE-156"
  - "A library table, a dismissed list, or any schema change"
  - "Training focuses (D-USE-87 stays Body fitness only)"
criteria:
  - id: C1
    statement: "For a kind with items in other blocks, the list is those items first (one per title, last length and icon, none already in this block, no transitions or meals), then the kind's seed without repeats"
    evidence: test
    command: "yarn test"
  - id: C2
    statement: "Every one of the seven kinds maps as the dev note says: Wellness morning (recommended first) then prep; Training Run, Swim, Yoga, Mobility, Climb, Ride; Life activity; Break break; Evening wind_down then Cook, Dinner, Chores; Work and To-dos empty"
    evidence: test
    command: "yarn test"
  - id: C3
    statement: "Swap's library on the item-sheet fixtures lists the same rows it listed before the change"
    evidence: test
    command: "yarn test"
---

# Contract — USE-155 suggested-items-source

## Build notes

Item 1 of Taylor's 2026-10-20 notes, the source half: what Block view's suggestion list holds. The boards are the six `block-view / … / 402 / light` frames at x 6748 to 9158, y 3780 on "USE — set up", with "Dev note · Suggested items" at x 9640. Taylor passed them on 2026-10-20.

- **Approach:** add a seed constant keyed by `NEW_BLOCK_KINDS`, built by picking rows out of `STARTER_LIBRARY` by kind and title. Lift `libraryOf` out of `use-item-sheet.ts` into a pure `usedBefore(records, kind, inBlock)` in `@syn/utils/planner`, extended with each item's last length and icon. Then `suggestedItems({ usedBefore, seed })` returns `{ usedBefore: Row[], seed: Row[] }` with the duplicates removed. Swap calls `usedBefore`, so its result stays as it is.
- **Decisions that apply:** D-USE-135: "Editing Block view lists suggested items under the add row for every set-items kind (Wellness, Training, Life, Break, Evening) … "Used before" comes first, then "Suggested for <kind>" … Work and To-dos get no list." D-USE-136: ""Used before" is derived on read: every item in any block of the same kind, one per name, with its last length; transitions, meals and anything already in this block are left out. This is what Swap's library reads today. The seed comes after it: `STARTER_LIBRARY` remapped to the seven kinds … Nothing new is stored."
- **The remap:** Wellness ← `morning` (the `recommended` rows first, then the rest), then `prep`. Training ← Run, Swim, Yoga and Mobility from `morning`, and Climb and Ride from `activity`. Life ← `activity`. Break ← `break`. Evening ← `wind_down` (its `placed` rows offered as plain rows), then Cook, Dinner and Chores from `transition`. Work and To-dos ← `[]`. A seed row's length is its `rangeMin`.
- **Interfaces:** a new constant (the builder names it, for example `SUGGESTED_SEED: Record<NewBlockKind, ReadonlyArray<StarterLibraryEntry>>`), and `usedBefore` and `suggestedItems` in `@syn/utils`.
- **Per path:** `starter-library.ts`: the remap constant. `constants/index.ts`: its export. `suggested-items.ts` and its test: the pure functions. `planner/index.ts`: the barrel. `use-item-sheet.ts`: `libraryOf` replaced by `usedBefore`.
- **Gotchas:** `@syn/constants` cannot import `@syn/types`; spell the `NewBlockKind` union from `NEW_BLOCK_KINDS` in `block-kinds.ts`. Titles repeat across kinds (Walk, Stretch, Meditate), so dedupe inside one kind only. Today `libraryOf` keeps the first item it sees per title; the last length needs an ordering by the date the item was last used, or by `updatedAt`.
- **Model:** any.
