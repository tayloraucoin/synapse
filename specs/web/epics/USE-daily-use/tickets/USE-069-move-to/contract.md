---
id: "USE-69"
size: small
objective: "Move to… moves one item off its place today, each row naming its consequence before the tap: a plain item to later today, another day or a picked day (a month, with a day lacking its kind sending it to that day's to-dos); a work item to a later Work block, tomorrow's Work, a picked day or back to the pool, keeping its tier; the move closes with a toast naming where it went and Undo; on fixtures"
slice_type: "a move step with consequences; risks a move that changes the usual week, a Linear write on a move, a consequence measured at the bottom of a range or said in red, and Undo restoring the wrong place"
non_negotiables:
  - "Every row names its consequence before the tap; one tap moves, closes and offers Undo (C-USE-move-to-1)."
  - "The usual week is never changed by a move (C-USE-move-to-3)."
  - "A work item keeps its tier; nothing is written to Linear (C-USE-move-to-2)."
  - "Fit is USE-8's fitInBlock at the top of every range; the consequence is words and lengths, never red."
  - "A step inside the Item sheet with back on the left; from Now's work menu its own sheet with × (D-USE-57)."
  - "Only @syn/ui components and preset tokens."
devs_call: "File split under components/planner/move-to/; the month grid (@syn/ui's calendar parts); the toast's words for undrawn targets (the state file's assumed forms)."
cites:
  - "specs/web/epics/USE-daily-use/ux/interactions/move-to/index.md"
  - "specs/web/epics/USE-daily-use/ux/interactions/move-to/states/plain-item.md"
  - "specs/web/epics/USE-daily-use/ux/interactions/move-to/states/linear-work-item.md"
  - "specs/web/epics/USE-daily-use/ux/interactions/move-to/states/work-move-to.md"
  - "specs/web/epics/USE-daily-use/ux/interactions/move-to/states/pick-a-day.md"
  - "specs/web/epics/USE-daily-use/ux/interactions/move-to/states/no-block-of-its-kind.md"
  - "specs/web/epics/USE-daily-use/ux/interactions/move-to/states/moved-undo.md"
  - "C-USE-move-to-1"
  - "C-USE-move-to-2"
  - "C-USE-move-to-3"
  - "C-USE-move-to-plain-item-1"
  - "C-USE-move-to-linear-work-item-1"
  - "C-USE-move-to-work-move-to-1"
  - "C-USE-move-to-work-move-to-2"
  - "C-USE-move-to-work-move-to-3"
  - "C-USE-move-to-pick-a-day-1"
  - "C-USE-move-to-pick-a-day-2"
  - "C-USE-move-to-no-block-of-its-kind-1"
  - "C-USE-move-to-moved-undo-1"
  - "C-USE-move-to-moved-undo-2"
  - "D-USE-37"
  - "D-USE-57"
  - "D-USE-60"
waiver: "Move to and Pick a day: the index holds the rules and each drawn step (plain item, Linear work item, from the work menu, pick a day, no block of its kind, moved with Undo) its own criteria."
truth_files: "none: promotion carries interactions/move-to/"
qa: Q1
reviewers:
  - assay
focus:
  - "plain item, Linear work item, work move to, pick a day, no block of its kind and moved with Undo at 402 against their captures (assay)"
operator_review: false
planned_paths:
  - "apps/web/components/planner/move-to/"
  - "apps/web/components/planner/item-sheet/"
  - "apps/web/lib/data/use-move-to.ts"
  - "apps/web/lib/data/move-to.test.ts"
  - "apps/web/lib/fixtures/"
  - "specs/web/epics/USE-daily-use/tickets/USE-069-move-to/evidence/"
depends_on:
  - "USE-4"
  - "USE-7"
  - "USE-8"
  - "USE-10"
  - "USE-14"
  - "USE-55"
  - "USE-64"
out_of_scope:
  - "The one-tap moves, Block complete's Later and Now's Not today (C-USE-move-to-4, -5): the Now and Block complete tickets"
  - "Opening it from the work menu: USE-70"
criteria:
  - id: C1
    statement: "Each target's move changes only that slot's block, date or (back to the pool) removes it, keeps a work item's tier, writes no Linear outbox row and no block item; Undo leaves the records as before"
    evidence: test
    command: "yarn test"
  - id: C2
    statement: "At 402 Move to on a plain item shows Later today and Another day rows, each with its consequence (\"Goes after … · fits, n min free\", or \"Runs to <time>, n min past its end\"), then Pick a day; on a Linear work item, later Work blocks, tomorrow, Pick a day and Back to the pool with \"Off every day until it's slotted again\""
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-069-move-to/evidence/plain-and-linear-402.png"
  - id: C3
    statement: "At 402 from the work menu the sheet has × and no back link, naming the tier: \"Stays in <Tier> · fits, n min free\""
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-069-move-to/evidence/work-move-to-402.png"
  - id: C4
    statement: "At 402 Pick a day shows the month with past days faded, today ringed and set days dotted with the legend; a tapped day names where it lands and the room left, and the button reads \"Move to <weekday>\"; a day with no block of its kind shows the dashed edge and its line"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-069-move-to/evidence/pick-a-day-402.png"
  - id: C5
    statement: "At 402 after a move the row is gone and the toast reads \"Moved to Work, 13:00\" with Undo"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-069-move-to/evidence/moved-undo-402.png"
  - id: C6
    statement: "The web app type-checks"
    evidence: check
    command: "yarn check-types"
  - id: C7
    statement: "The web app lints clean"
    evidence: check
    command: "yarn lint"
---

# Contract — move-to

## Build notes

Wave 2, after USE-64. Match `ux/interactions/move-to/captures/` (six frames).

- **Decisions that apply:**
  - D-USE-37: Pick a day: a month, days already set marked quietly ("Already set for that day"), the consequence line; a day with no block of its kind keeps the item in that day's to-dos: "<Weekday> <d> <Month>, no <kind>"; "That day follows the usual <Weekday>. It waits in the day's to-dos, to place on review."
  - D-USE-60 (2): the Item sheet gains the Move to step and Pick a day. For today only: "Undo is offered after. Monday's usual is unchanged."
  - D-USE-57: from the phone's work menu, Move to another day opens the sheet with Today's later Work block, tomorrow's Work, Pick a day and Back to the pool, each with its consequence; the tier is named; × or the scrim closes with nothing moved.
  - Words: "Move to"; "Later today"; "Another day"; "Tomorrow, <block> <start>"; "Goes after <item> · fits, <n> min free"; "Runs to <time>, <n> min past its end"; "<Weekday> <d> <Month> · at the end of <block>"; "Stays in <Tier> · fits, even at the top of its range"; "Back to the pool"; "Off every day until it's slotted again"; "Pick a day"; "Move to <weekday>"; toast "Moved to <block>, <start>" with Undo.
  - D-USE-39, D-USE-65: at the desk the sheet is the right panel, opened from the right-click menu.
- **Interfaces:** `MoveToStep { itemRef; from: "sheet" | "menu"; onDone }`, `PickADay`; `useMoveTo(itemRef)` returning the targets with their consequences (fit from `fitInBlock`, the later blocks from `readDay`) and `move(target)` through `writeSlots` / `removeSlots`.
- **Per path:** `move-to.test.ts` holds C1. Scenarios `move-plain`, `move-linear`, `move-work`, `move-pick-a-day`, `move-no-kind`, `move-undo`.
- **Gotchas:**
  - Moving a set item writes its slot on the target date and a `skipped` slot for today (USE-14's column), so the usual day keeps it.
  - No limit on how far ahead a day can be picked [ASSUMPTION, as the index].
- **Model:** Opus 5.5 at medium. A smaller model edits the usual week, or writes the move to Linear.
