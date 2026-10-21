---
id: USE-142
size: medium
objective: "Every TimeField opens the house's 24-hour picker: New block Starts, the block view's Set a time, the add-event sheet and popover, the item sheet, the to-do reminder and the checklist editor; the field reads a compact \"7:05\" and stays typeable"
slice_type: "a shared control rebuilt under seven surfaces; risks a caller whose value or label no longer fits, and a keyboard dead end"
non_negotiables:
  - "TimePicker moves into TimeField (packages/ui/src/composed/control/time-field/); no surface keeps the browser's native time input."
  - "The field shows the time as \"7:05\" (24-hour, no leading zero), typeable; \"630\" reads 6:30, any minute kept."
  - "The picker keeps USE-141's listboxes, keys, Done and Escape; focus returns to the clock."
  - "No new dependency; only preset tokens; a story before the surfaces use it."
devs_call: "Whether BoundsField becomes a TimeField variant or keeps its own shell around the shared input; the default is that it keeps its shell."
cites:
  - "specs/web/epics/USE-daily-use/ux/set-my-days/set-my-days/states/time-picker.md"
  - "specs/web/epics/USE-daily-use/ux/set-my-days/new-block-sheet/index.md"
  - "C-USE-set-my-days-time-picker-1"
  - "D-USE-39"
truth_files: "none: the epic's own ux/ ledger is amended in the same commit (set-my-days/set-my-days/states/time-picker.md); it promotes to specs/web/ux/ with USE"
waiver: "One control or rule seen from two ledger files of the same surface family; one change owns both."
qa: Q1
reviewers:
  - assay
focus:
  - "the field at 402 in New block's Starts row: compact, the clock its own 44 px target (assay)"
operator_review: false
planned_paths:
  - "packages/ui/src/composed/control/time-field/**"
  - "packages/ui/src/composed/control/time-picker/**"
  - "packages/utils/src/time-picker.ts"
  - "packages/utils/src/time-picker.test.ts"
  - "apps/web/app/(shell)/days/_components/day-parts.tsx"
  - "apps/web/app/(shell)/days/_components/time-picker.test.tsx"
  - "apps/web/app/(shell)/today/review/_components/checklist-editor.tsx"
  - "apps/web/app/(shell)/days/block/[id]/_components/days-block-screen.tsx"
  - "apps/web/components/planner/todo-sheet/reminder-row.tsx"
  - "apps/web/components/planner/new-block-sheet/new-block-sheet.tsx"
  - "apps/web/components/planner/item-sheet/plain-item-fields.tsx"
  - "apps/web/components/planner/add-event/add-event-sheet.tsx"
  - "apps/web/components/planner/add-event/event-popover.tsx"
  - "packages/ui/src/composed/control/notification-row/notification-row.tsx"
  - "specs/web/epics/USE-daily-use/ux/set-my-days/set-my-days/states/time-picker.md"
depends_on: []
out_of_scope:
  - "The legacy app's TimeField callers (apps/web/_legacy), which take the new field as they are"
criteria:
  - id: C1
    statement: "TimeField renders a text field reading \"7:05\" and the clock trigger, never an input of type time; a typed \"630\" commits 06:30"
    evidence: test
    command: "yarn workspace web test"
  - id: C2
    statement: "?state=new-block-wellness at 402 shows Starts as the compact field with its clock, as the board draws it"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-142-time-field-house-picker/evidence/"
---

# Contract — USE-142 time-field-house-picker

## Build notes

Fix 1 of Taylor's review of 2026-10-19.

- **Approach:** TimeField becomes the shared shell: a label above, a bordered 44 px box holding a typeable text input (`parseTypedClock` on blur or Enter) and USE-141's `TimePicker` trigger at its end, helper or error below. The picker previews into the field and Done commits through `onChange`. `disclosed` keeps value + Change; Change opens the picker. TimePicker stays its own export for BoundsField; TimeField composes it.
- **Interfaces:** `TimeFieldProps` gains `name?: string` (the picker's spoken name when `label` is a node); `onChange` now fires on a commit, not on each keystroke.
- **Gotchas:** `label` is a ReactNode at five callers (sr-only spans), so the trigger's name needs the string; `min`/`max` stay as a caller's check.
- **Model:** Opus 5.5.
