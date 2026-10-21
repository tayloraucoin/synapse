---
id: USE-156
size: medium
objective: "Editing a block in Set my days shows the suggested items under its add row and a running total against the block's span, and a tap adds an item at the end"
slice_type: "UI on fixtures in Block view's editing mode; the risk is a tap writing anything other than the add row's one item, or the total going out of step with the rows"
non_negotiables:
  - "@syn/ui components and preset.css tokens only; no raw colour, size or duration (canon §2)."
  - "PickerRow lanes are fixed: a 36 px icon tile in the kind's chip tint, the name, the length, and a 44 px target holding a 28 px round +; 'Add one' last."
  - "A tap adds one block item at the end with the row's title, icon and length, through the add row's write; no toast; the row leaves the list."
  - "Colour is never alone: the track always carries its words; past the span it fills in ink with 'Runs <n> min past <end>', never red."
  - "A new block opens with the list showing and the keyboard down; Work and To-dos show no list."
  - "No second person; times and lengths are the only numbers."
  - "Every state below has its ?state= key (C-P08)."
devs_call: "component names and files; whether the span total is a @syn/ui part or local to block-view; the row's exit motion, within the duration tokens"
cites:
  - "specs/web/epics/USE-daily-use/ux/day/block-view/suggested.md"
  - "C-USE-block-view-suggested-1"
  - "C-USE-block-view-suggested-4"
  - "C-USE-block-view-suggested-6"
truth_files: "none: the epic's own ux/ ledger carries it (day/block-view/suggested.md and its six states, D-USE-135 to 137); it promotes to specs/web/ux/ with USE"
qa: Q1
reviewers:
  - assay
focus: []
operator_review: false
planned_paths:
  - "apps/web/components/planner/block-view/suggested-list.tsx"
  - "apps/web/components/planner/block-view/span-total.tsx"
  - "apps/web/components/planner/block-view/block-view-column.tsx"
  - "apps/web/components/planner/block-view/copy.ts"
  - "apps/web/components/planner/block-view/index.ts"
  - "apps/web/app/(shell)/days/block/[id]/_components/days-block-screen.tsx"
  - "apps/web/lib/data/block-edit.ts"
  - "apps/web/lib/data/block-edit.test.ts"
  - "apps/web/lib/data/use-block-edit-writes.ts"
  - "apps/web/lib/fixtures/scenarios/block-view-editing.ts"
  - "specs/web/epics/USE-daily-use/tickets/USE-156-block-view-suggested-list/evidence/"
depends_on:
  - USE-155
out_of_scope:
  - "The length stepper (USE-157)"
  - "Block view from the day (today only): the list is for editing in Set my days"
  - "'Add one' beyond opening the existing add path preset to the kind"
  - "Wiring to the hosted database; fixtures only, as the rest of the epic's UI"
criteria:
  - id: C1
    statement: "A tap on a suggestion adds one block item at the block's end with that title, icon and length; it leaves the list, and the total and free words move"
    evidence: test
    command: "yarn workspace web test"
  - id: C2
    statement: "?state=suggested-new, suggested-added, suggested-reorder, suggested-past-span and suggested-first-of-kind at 402 match their boards: the total line, the add row, the Used before and Suggested groups, and Add one"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-156-block-view-suggested-list/evidence/"
  - id: C3
    statement: "Past the span the track fills in ink and reads 'Runs <n> min past <end>', and a + still adds"
    evidence: test
    command: "yarn workspace web test"
---

# Contract — USE-156 block-view-suggested-list

## Build notes

Item 1 of Taylor's 2026-10-20 notes, the screen half, drawn as `block-view / wellness, new, suggested`, `wellness, three added`, `wellness, reordering`, `wellness, past its span` and `evening, first of its kind` (all `/ 402 / light`, "USE — set up", y 3780, x 6748 to 9158). Taylor passed them on 2026-10-20.

- **Approach:** `blockEdits` (`lib/data/block-edit.ts`) gains the suggestion list from USE-155's `suggestedItems` and a span total `{ plannedMin, spanMin, freeMin, overMin }`. `SpanTotal` sits under the `BlockHeader` in editing mode. `SuggestedList` renders after `EditingAddRow` in place of the "Free until" region, for set-items kinds only. A tap calls the add row's existing write with the title, icon and length filled in. A new block from Set my days no longer opens the add row on mount (`autoOpen` stays for the From-the-day empty state).
- **Decisions that apply:** D-USE-135: "The rows use the Swap board's library pattern: an icon tile in the kind's tint, the name, the length, a + on each row, and "Add one" last. "Used before" comes first, then "Suggested for <kind>". A tap adds the item at the end of the block with its length; the item leaves the list, and there is no toast. A new block opens with the list showing and the keyboard down." D-USE-137: "The running total sits under the block's header while editing: "<n> of <span> min" and "<m> min free", over a 4 px track filled in the kind's colour. Past the span, the track fills in ink and the trailing words read "Runs <n> min past <end>", in ink and never red … With nothing in the block it reads "Nothing in <block> yet"."
- **Words:** "Used before"; "Suggested for <kind>"; "Add one"; "<n> of <span> min"; "<m> min free"; "Nothing in <block> yet"; "Runs <n> min past <end>"; "Hold a grip to move one. Times follow the order."
- **Access:** each + is a button named "Add <name>, <length>", and focus moves to the next + after a tap. Each group is a list named by its heading. The total is a `meter` named "<block> planned".
- **Interfaces:** five `?state=` keys on `/days/block/{id}`: `suggested-new` (a new Thursday Wellness, 7:05 to 8:05), `suggested-added`, `suggested-reorder`, `suggested-past-span` and `suggested-first-of-kind` (a new Tuesday Evening, 21:00 to 22:30).
- **Per path:** `suggested-list.tsx`: the groups and rows. `span-total.tsx`: the line and the track. `block-view-column.tsx`: the list after the add row. `copy.ts`: the words. `index.ts`: the exports. `days-block-screen.tsx`: the total under the header. `block-edit.ts` and its test: the derived list and total. `use-block-edit-writes.ts`: an add carrying icon and length. `block-view-editing.ts`: the five scenarios. `evidence/`: captures.
- **Gotchas:** the list is per kind, not per block: a Wellness on Thursday lists Monday's Wellness items. The scenarios need a block of the kind elsewhere in the week for "Used before", and none for the first Evening. The "Free until" region goes away when the list shows. Emoji tiles render through `ItemIcon`, not raw text.
- **Model:** a strong model; a weaker one tends to drop the fixed lanes or add a toast.
