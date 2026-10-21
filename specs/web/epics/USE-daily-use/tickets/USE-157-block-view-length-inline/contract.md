---
id: USE-157
size: small
objective: "In Block view's editing mode, tapping an item's length opens a stepper in place, and the total and every later time move as it changes"
slice_type: "an inline control on an existing row; the risk is the stepper saving on every step or the times not re-flowing"
non_negotiables:
  - "@syn/ui components and preset.css tokens only (canon §2); − and + are at least 44 px targets."
  - "Steps of 5 min, or 1 min below 5; the value can be typed; it never goes below 1."
  - "Return or a tap elsewhere saves once; Escape puts the value back."
  - "The span total and every later rail time follow the value live, before the save."
  - "It is a spinbutton named '<name> length', its value text '<n> minutes'."
  - "Grips, reorder and the Item sheet are unchanged."
devs_call: "whether the stepper is a @syn/ui part or local to block-view; how a typed value is committed"
cites:
  - "specs/web/epics/USE-daily-use/ux/day/block-view/suggested.md"
  - "C-USE-block-view-suggested-5"
truth_files: "none: the epic's own ux/ ledger carries it (day/block-view/states/suggested-length.md, D-USE-138); it promotes to specs/web/ux/ with USE"
qa: Q1
reviewers:
  - assay
focus: []
operator_review: false
planned_paths:
  - "apps/web/components/planner/block-view/length-stepper.tsx"
  - "apps/web/components/planner/block-view/kind-rows.tsx"
  - "apps/web/components/planner/block-view/copy.ts"
  - "apps/web/lib/data/block-edit.ts"
  - "apps/web/lib/data/block-edit.test.ts"
  - "apps/web/lib/data/use-block-edit-writes.ts"
  - "apps/web/lib/fixtures/scenarios/block-view-editing.ts"
  - "specs/web/epics/USE-daily-use/tickets/USE-157-block-view-length-inline/evidence/"
depends_on:
  - USE-156
out_of_scope:
  - "Length on Block view from the day (today only)"
  - "A checklist with no times: it shows no length to tap"
  - "Changing the Item sheet's length field"
criteria:
  - id: C1
    statement: "Stepping a length moves the total and every later rail time at once, and Return saves one length write"
    evidence: test
    command: "yarn workspace web test"
  - id: C2
    statement: "?state=suggested-length at 402 matches its board: Meditate open on the surface fill, the hint 'Steps of 5 min, or type one.', the stepper at '15 min', the total '18 of 60 min'"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-157-block-view-length-inline/evidence/"
---

# Contract — USE-157 block-view-length-inline

## Build notes

Item 1 of Taylor's 2026-10-20 notes ("per-item length inline"), drawn as `block-view / wellness, a length inline / 402 / light` ("USE — set up", x 7712, y 3780). Taylor passed it on 2026-10-20.

- **Approach:** the trailing length on an editing row becomes a button. Pressing it swaps the length and the grip for `LengthStepper` (−, the value, +, outlined, 36 px high) and gives the row the `--color-surface` fill with the hint under its name. A draft length goes into the same derivation the total and the rail times use, and it is written once on commit through the existing item length write.
- **Decisions that apply:** D-USE-138: "A row's length is edited in place. A tap on the length opens a stepper (−, the value, +) in 5 min steps, or 1 min below 5, and the value can be typed. The total and every later time move as it changes. Return or a tap elsewhere saves it. Reorder is unchanged: grips, the ink drop line, and Move up and Move down in the ··· (D-USE-17)."
- **Words:** "Steps of 5 min, or type one."; the value "<n> min".
- **Interfaces:** the `?state=suggested-length` key on `/days/block/{id}`, which is `suggested-added` with Meditate at 15 min, open.
- **Per path:** `length-stepper.tsx`: the control. `kind-rows.tsx`: the length as a button and the open row. `copy.ts`: the hint. `block-edit.ts` and its test: a draft length in the derivation. `use-block-edit-writes.ts`: the length write. `block-view-editing.ts`: the scenario. `evidence/`: the capture.
- **Gotchas:** a set-time row ("At 7:10") keeps its time; only the rows after it re-flow (C-USE-block-view-kind-1). One row is open at a time. The step below 5 is 1, so 5 − 1 = 4.
- **Model:** any.
