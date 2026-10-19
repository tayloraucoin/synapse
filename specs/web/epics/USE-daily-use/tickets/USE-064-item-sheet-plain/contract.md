---
id: "USE-64"
size: small
objective: "Tapping a plain item opens the Item sheet (?sheet=item&id=): the scope line, the icon tile opening the icon picker as a step, Length, At a set time with its Time row, Notes, the footer line, ··· with Move to…, Not today and Make it Monday's usual, and Swap with the library of the item's kind, every change saving as made for today only, on fixtures"
slice_type: "a sheet that edits in place; risks a Save button, a change that reaches the usual week, the icon picker opened as a second sheet, Swap listing other kinds, and focus not returning to the opener"
non_negotiables:
  - "No Save button: each change saves as made, for today only; the usual week is unchanged unless Make it Monday's usual is chosen (C-USE-item-sheet-1)."
  - "The icon picker is USE-11's IconPickerStep, a step inside this sheet with back on the left, never a second sheet."
  - "× and Escape close to the screen beneath and return focus to the row that opened it (C-USE-item-sheet-5)."
  - "Every ?state= of states/ named here renders through ?sheet=item&id=&state= (C-USE-item-sheet-6, canon C-P08)."
  - "Only @syn/ui components and preset tokens; a visible Notes label, never a placeholder as label (A-16)."
  - "Reads and writes through lib/data hooks; nothing here imports lib/fixtures or tRPC."
devs_call: "File split under components/planner/item-sheet/; how the sheet finds its item (the open day's records by slot or block item id); the stepper's steps; the toast for Make it Monday's usual."
cites:
  - "specs/web/epics/USE-daily-use/ux/day/item-sheet/index.md"
  - "specs/web/epics/USE-daily-use/ux/day/item-sheet/words-and-access.md"
  - "specs/web/epics/USE-daily-use/ux/day/item-sheet/states/default.md"
  - "specs/web/epics/USE-daily-use/ux/day/item-sheet/states/at-a-set-time.md"
  - "specs/web/epics/USE-daily-use/ux/day/item-sheet/states/more-open.md"
  - "specs/web/epics/USE-daily-use/ux/day/item-sheet/states/swap.md"
  - "specs/web/epics/USE-daily-use/ux/day/item-sheet/states/swap-empty.md"
  - "specs/web/epics/USE-daily-use/ux/day/item-sheet/states/loading.md"
  - "specs/web/epics/USE-daily-use/ux/day/item-sheet/states/offline.md"
  - "C-USE-item-sheet-1"
  - "C-USE-item-sheet-2"
  - "C-USE-item-sheet-5"
  - "C-USE-item-sheet-6"
  - "C-USE-item-sheet-default-1"
  - "C-USE-item-sheet-default-2"
  - "C-USE-item-sheet-at-a-set-time-1"
  - "C-USE-item-sheet-at-a-set-time-2"
  - "C-USE-item-sheet-more-open-1"
  - "C-USE-item-sheet-more-open-2"
  - "C-USE-item-sheet-swap-1"
  - "C-USE-item-sheet-swap-2"
  - "C-USE-item-sheet-swap-empty-1"
  - "C-USE-item-sheet-loading-1"
  - "C-USE-item-sheet-offline-1"
  - "D-USE-12"
  - "D-USE-24"
  - "D-USE-60"
  - "D-USE-103"
waiver: "The Item sheet for a plain item: the index holds the frame and each drawn state (default, at a set time, ··· open, swap, swap empty, loading, offline) its own criteria; one sheet."
truth_files: "none: promotion carries day/item-sheet/"
qa: Q1
reviewers:
  - assay
focus:
  - "default, ··· open, at a set time, swap and swap empty at 402, and the right panel at 1440 (assay)"
operator_review: false
planned_paths:
  - "apps/web/components/planner/item-sheet/"
  - "apps/web/lib/data/use-item-sheet.ts"
  - "apps/web/lib/data/item-sheet.test.ts"
  - "apps/web/lib/fixtures/"
  - "apps/web/lib/routes.ts"
  - "specs/web/epics/USE-daily-use/tickets/USE-064-item-sheet-plain/evidence/"
depends_on:
  - "USE-4"
  - "USE-7"
  - "USE-10"
  - "USE-11"
  - "USE-55"
out_of_scope:
  - "The work item's fields: USE-65; Linear: USE-66 and USE-68; sessions, sub-issues, the firing panel: USE-67"
  - "Move to…'s step and Pick a day: USE-69; this ticket opens it"
  - "Not today's one-tap move on Now: the Now thread; here it is the same write, for today only"
  - "Add one (the add sheet preset to the kind): the add ticket"
  - "Where the library is stored once wired: the wiring (wave 3); here it is read from the fixtures"
criteria:
  - id: C1
    statement: "Length set to 15 on Meditate writes the slot's lengthMin for that date only; At a set time on with 7:20 writes atTime for today; Make it Monday's usual writes the block item; each can be undone"
    evidence: test
    command: "yarn test"
  - id: C2
    statement: "At 402 the default shows ×, Swap and ···, \"Wellness, 7:05 to 8:00 · today only\", the icon tile and \"Meditate\", Length \"− 10 min +\", At a set time with \"Off: follows Start the cold bath, at 7:12\", Notes (optional) and the footer line, no primary"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-064-item-sheet-plain/evidence/default-402.png"
  - id: C3
    statement: "At 402 ··· shows \"Meditate, today only\", Move to…, Not today, a rule and Make it Monday's usual; at a set time shows \"Stays at its time; the items around it move\" and the Time row with \"Ends 7:30\""
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-064-item-sheet-plain/evidence/more-and-time-402.png"
  - id: C4
    statement: "At 402 Swap on \"Workout: gym\" lists only workouts with icon, \"35 min · starts 8:10\", \"Ends 8:55\" and the current one checked, then + Add one; with no other workout, no search and \"Nothing else of this kind yet.\""
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-064-item-sheet-plain/evidence/swap-402.png"
  - id: C5
    statement: "At 402 the icon tile opens the icon picker as a step with \"‹ Meditate\" on the left, and back returns to the sheet"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-064-item-sheet-plain/evidence/icon-step-402.png"
  - id: C6
    statement: "At 1440 the sheet is ResponsiveSheet's right panel at --sheet-w with every field as at 402"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-064-item-sheet-plain/evidence/default-1440.png"
  - id: C7
    statement: "The web app type-checks"
    evidence: check
    command: "yarn check-types"
  - id: C8
    statement: "The web app lints clean"
    evidence: check
    command: "yarn lint"
---

# Contract — item-sheet-plain

## Build notes

Wave 2. The sheet's frame is shared: USE-65 to USE-68 add the work item's parts to it. Captures at `?sheet=item&id=<id>&state=<state>` over the screen that opened it; match `ux/day/item-sheet/captures/` default, more-open, at-a-set-time, swap and swap-empty.

- **Decisions that apply:**
  - Index › Layout: `ResponsiveSheet` with a grabber; header × left, "Swap" (outlined pill, plain items only, D-USE-24) and ··· right; the scope line "<Block>, <start> to <end> · today only"; the title row (the 44 px icon tile in the kind's tint, then the name); fields on hairlines; the footer "Changes save as they're made, for today. Monday's usual is unchanged." (the weekday is the day's own).
  - D-USE-60: every change saves as made, for today only; the sheet as drawn. D-USE-103: at the desk the right panel at `--sheet-w`.
  - At a set time: off, "Off: follows <previous item>, at <time>"; on, a 56 px Time row with a `TimeField` and "Ends <time>"; the item stays at its time and the items around it move.
  - ···: "<name>, today only", Move to…, Not today, a rule, Make it Monday's usual (Undo offered).
  - D-USE-12: Swap rows lead with the icon, then "<n> min · starts <time>", then "Ends <time>" (where the block ends with that pick), in fixed columns, the current one checked. One tap replaces it for today, closes, offers Undo; the drives stay (D-USE-60 (1)). "Search <kind, plural>"; with only the current item, no search, "Nothing else of this kind yet.", "Workouts added here stay in the library for any day." and "+ Add one".
  - Loading is N/A: fields render from the item on screen. Offline: every field saves on the device (D-USE-64).
  - Access: on open, focus moves to the item's name (a heading); Tab runs ×, Swap, ···, the icon tile, the fields, the footer. Names: "Close"; "More for <name>"; "Icon, <emoji or icon name>. Change"; "Shorter", "Longer", read as "10 minutes". Reduced motion: the sheet fades in place.
- **Interfaces:** `ItemSheet` (the shell: route, focus return, steps) with `PlainItemFields`, `SwapStep`; `useItemSheet(id)` over the planner hooks, writing through `writeSlots` (a set item's slot on first touch) and `writeBlockItem`. `itemSheetRoute(id, state?)` in `routes.ts`.
- **Per path:** `item-sheet.test.ts` holds C1. Scenarios `item-default`, `item-more-open`, `item-at-a-set-time`, `item-swap`, `item-swap-empty`.
- **Gotchas:**
  - The library has no table yet. Here it is every block item in a block of the same kind, one per title [ASSUMPTION: the four workouts drawn are the weekdays' Training items]; where it lives once wired is for the wiring.
  - A set item's slot does not exist until first touch: the first edit places it with `placeSlotInput`, later edits update it.
- **Model:** Opus 5.5 at medium. A smaller model adds a Save button, writes the length to the usual week, or opens the picker as a second sheet.
