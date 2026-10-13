---
id: "USE-35"
size: small
objective: "One pure engine finds minutes in a day and decides what gives, for Make room, A later start and a late wake: the day laid out from the wake, room found with no sheet when it can be guessed, the flat slide that leaves set times standing, cuts that take their drives along, and a passed block moved later, each returning today-only changes and their undo"
slice_type: "pure scheduling logic in @syn/utils; risks moving travel, set times or Orient, taking from Urgent, a slide that drops a block or overlaps a set-time item, minutes found that do not add up, and a change that reaches the usual week"
non_negotiables:
  - "Pure and platform-free: no clock, no I/O; every function takes the day and the times and returns a plan."
  - "Never taken or moved: travel, items at a set time, day events, Orient; shown with the reason when asked (D-USE-11)."
  - "Every plan is today only, as changes to that date's blocks and slots, with its exact inverse; the usual week is never touched."
  - "Minutes add up: what a plan takes equals what it says it found, and a slide moves every later block by exactly its minutes."
  - "Urgent work is never taken; Stretch gives first."
devs_call: "Module split inside planner/room/; the plan's change type; the fixture days the tests build."
cites:
  - "specs/web/epics/USE-daily-use/ux/interactions/make-room/index.md"
  - "specs/web/epics/USE-daily-use/ux/interactions/later-start/index.md"
  - "specs/web/epics/USE-daily-use/ux/interactions/later-start/states/slide.md"
  - "specs/web/epics/USE-daily-use/ux/interactions/later-start/states/cut-some.md"
  - "specs/web/epics/USE-daily-use/ux/day/review-the-day/states/late.md"
  - "specs/web/epics/USE-daily-use/ux/day/review-the-day/states/late-passed-open.md"
  - "C-USE-make-room-1"
  - "C-USE-make-room-3"
  - "C-USE-later-start-1"
  - "C-USE-later-start-slide-2"
  - "C-USE-later-start-cut-some-3"
  - "C-USE-review-the-day-late-2"
  - "C-USE-review-the-day-late-passed-open-2"
waiver: "One engine (make-room/index.md: \"One engine with A later start\"); the later-start steps and Review the day's late states hold the rules it computes and draw nothing it renders"
truth_files: "none: logic only; promotion carries interactions/make-room/ and later-start/"
qa: Q1
reviewers: []
focus: []
operator_review: false
planned_paths:
  - "packages/utils/src/planner/room/"
  - "packages/utils/src/planner/index.ts"
  - "packages/utils/src/index.ts"
depends_on:
  - "USE-6"
out_of_scope:
  - "The sheets and the Undo Toaster: the Make room and later-start sheets ticket"
  - "Applying a plan to the fixtures and the passed row: the Review the day edits ticket"
  - "Sliding with priority, shrinking blocks, Lights out refusals and Decide for me: later rounds (the dev notes); Phase 1 is the flat slide plus manual cuts"
criteria:
  - id: C1
    statement: "layoutFromWake folds every block that ends by Orient's end, starts a block under way at Orient's end keeping its end, leaves the rest, and reports minutes late; offerLaterStart is true from 15 minutes past Up at"
    evidence: test
    command: "yarn test"
  - id: C2
    statement: "findRoom answers fits when the block's free minutes cover the addition; otherwise takes gaps first, then one item in the same block (Stretch, Secondary, Primary in a Work block, else the longest), keeping at least half its length; and asks, with every candidate and its reason, when that is not enough"
    evidence: test
    command: "yarn test"
  - id: C3
    statement: "findRoom's candidates show travel, set-time items, day events and Orient as not eligible, never taken, and never offer Urgent work"
    evidence: test
    command: "yarn test"
  - id: C4
    statement: "slideDay moves every block from a time by n minutes keeping its length, leaves a set-time item at its time with its block split around it, and reports the day's new end"
    evidence: test
    command: "yarn test"
  - id: C5
    statement: "cutAndSlide removes the ticked items for today, takes a block's drives when its last other item is cut, and slides by what is still short"
    evidence: test
    command: "yarn test"
  - id: C6
    statement: "moveLater puts a passed block right after Orient and slides the blocks after it by its length"
    evidence: test
    command: "yarn test"
  - id: C7
    statement: "Every plan applied then undone gives back the day it started from"
    evidence: test
    command: "yarn test"
  - id: C8
    statement: "@syn/utils type-checks"
    evidence: check
    command: "yarn check-types"
---

# Contract — room-engine

## Build notes

Wave 2, alongside the first screens. It needs only USE-6. Make room's dev note asks for one engine: "same question: minutes to find, what to take them from". Phase 1 takes the dev notes' simple default: gaps first, then one flexible item, with a sheet only when nothing can be guessed. A later start is the flat slide plus manual cuts.

- **Decisions that apply:**
  - D-USE-11: Make room offers from the block or from other blocks, as a multi-select with the minutes taken from each. Travel and pinned appointments are shown and never eligible. Decide for me is unwired (D-USE-66).
  - D-USE-16: Add goes to Make room only when there is no room.
  - D-USE-72: Do now past a block's end extends the block and slides the day.
  - Late wake (open-1, as drawn): a block under way keeps its end and starts after Orient. Passed blocks fold, and go mode starts at the first block after Orient. The sheet offers itself at about 15 minutes late.
  - Slide: every block keeps its length and moves by the gap. Set-time items stay, and blocks split around them. The slide includes the folded blocks.
  - Cut: "Drive there and home go with the workout"; a cut item is off today only.
  - Move later (D-USE-69): right after Orient at the wake, with the blocks after it sliding by its length.
- **Defaults Reeve took for what the boards leave open** (to settle in use; each is one line to change):
  - "Most flexible" means Stretch, then Secondary, then Primary in a Work block, and the longest untimed item elsewhere.
  - An item gives at most half its length.
  - A slide past Lights out is allowed; the sheet names the new end.
- **Interfaces:** `@syn/utils` `planner/room/`, all taking `readDay`'s occurrences, minutes since the day's open, and Up at:
  - `layoutFromWake(day, { upAt, wokeAt })`
  - `offerLaterStart`
  - `findRoom(day, { blockId, at, minutes }): { kind: "fits" } | { kind: "default"; takes } | { kind: "ask"; candidates }`
  - `slideDay(day, { from, minutes })`
  - `cutAndSlide(day, { cuts, short })`
  - `moveLater(day, { blockId, orientEnd })`

  Each plan is `{ changes: DayChange[]; undo: DayChange[]; summary }`. A `DayChange` is a dated block move (a `block_changes` row), a slot's `length_min`, or a slot off today. `summary` holds the numbers the sheets print: found and needed, cut and short, the next blocks' new starts, and the day's new end.
- **Per path:** one test file per module, with the `describe` blocks named after C1 to C7.
- **Gotchas:**
  - Times are wall-clock minutes in the user's zone. Reuse `readDay`'s window; never construct a `Date` from local strings.
  - "Slot off today" is written through whatever field USE-14 or USE-15 lands. The change type names the intent, and the edits ticket maps it.
- **Model:** Opus 5.5 at medium. A smaller model moves set times, loses minutes across a split, or writes to the usual week.
