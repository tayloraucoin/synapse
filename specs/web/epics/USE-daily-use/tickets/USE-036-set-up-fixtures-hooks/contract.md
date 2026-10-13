---
id: "USE-36"
size: medium
objective: "Set my days, the New block sheet, Block view and the add sheets read and write through data hooks on fixtures: the usual week and this week with their bounds, block, item, change, event and bounds writes with Undo, Copy from, Reset to usual and Clear, a usual change's reach, and offline as D-USE-82 splits it"
slice_type: "a data seam extended with an in-memory fake of the planner routers; risks a fake that accepts what the router will refuse, a This week edit that leaks into the usual week, an Undo that restores less than it took, offline writes that land out of order, and surfaces that compute reach or re-flow themselves"
non_negotiables:
  - "Every write parses its @syn/validators input (USE-3 and the 0013 ticket's shapes) and refuses with the schema's words; no shape is invented here."
  - "A Usual week write changes the block for every week; a This week write changes that date only, through block_changes, skipped slots or dated items; never the reverse."
  - "Every write returns an Undo that restores exactly what it changed, blocks and items."
  - "Reach, re-flow, tapped slots, overlaps and bounds come from the set-up pure functions; no hook re-derives them."
  - "Server data stays in TanStack Query over the fixture server (USE-7's seam); no Zustand store, no Context."
  - "Offline (D-USE-82): the day's own writes are refused; block and item writes queue and land in order when back."
devs_call: "Method names past the ones below; file split inside lib/fixtures/planner/; how the undo snapshot is kept; the queue's form."
cites:
  - "specs/web/epics/USE-daily-use/ux/set-my-days/set-my-days/words-and-access.md"
  - "C-USE-set-my-days-3"
  - "C-USE-set-my-days-4"
  - "C-USE-set-my-days-5"
  - "D-USE-87"
waiver: "The data seam under four set-up surfaces: Set my days (this file), Copy from (interactions/copy-from/index.md), Block view (day/block-view/index.md) and the add sheets. Each surface ticket draws its states on these hooks."
truth_files: "none: no behaviour ships; the set-up surfaces render on this"
qa: Q1
reviewers: []
focus: []
operator_review: false
planned_paths:
  - "apps/web/lib/fixtures/planner/"
  - "apps/web/lib/fixtures/scenarios/"
  - "apps/web/lib/data/use-week.ts"
  - "apps/web/lib/data/use-set-up-day.ts"
  - "apps/web/lib/data/use-block-view.ts"
  - "apps/web/lib/data/use-planner-writes.ts"
  - "apps/web/lib/data/use-connection.ts"
depends_on:
  - "USE-7"
  - "USE-14"
  - "USE-33"
out_of_scope:
  - "Every screen and its ?state= names past the base set-up scenarios: each surface ticket"
  - "Swapping each hook to tRPC: the blocks-and-days wiring (wave 3)"
  - "Google's events: the Google Calendar ticket"
  - "Real offline persistence (IndexedDB): its own ticket (C4); here the queue is in memory"
criteria:
  - id: C1
    statement: "Every record in the set-up scenarios (set-up-usual, set-up-this-week, set-up-first-day) parses with its record schema, and set-up-usual reads back as usual-week.md's seven rows"
    evidence: test
    command: "yarn test"
  - id: C2
    statement: "A Usual week edit changes that weekday in every week and returns this week's date it reaches (none for a date begun, and a block changed on that date keeps its own); a This week edit changes that date only and the usual week reads the same after"
    evidence: test
    command: "yarn test"
  - id: C3
    statement: "copyDay onto an empty day copies blocks, times, kinds and items but not the bounds, with Work blocks as time only; onto a built day it replaces; clearDay empties it; resetDay removes the date's own changes; each Undo puts the day back exactly"
    evidence: test
    command: "yarn test"
  - id: C4
    statement: "Removing a set item for one date writes a skipped slot and the usual item stays; adding one for one date writes a dated item; the day read leaves out the skipped and shows the dated item on its date only"
    evidence: test
    command: "yarn test"
  - id: C5
    statement: "Every write refuses what its input schema refuses, with the schema's message (\"Name needed\", \"Ends after it starts.\", \"Lights out comes after Up at.\")"
    evidence: test
    command: "yarn test"
  - id: C6
    statement: "In an offline scenario the day's own writes (bounds, new block, copy, reset, clear) are refused as offline; block and item writes queue and, back online, land in the order made"
    evidence: test
    command: "yarn test"
  - id: C7
    statement: "The web app type-checks"
    evidence: check
    command: "yarn check-types"
---

# Contract — set-up-fixtures-hooks

## Build notes

After USE-7, the 0013 schema ticket (USE-14) and the set-up pure functions (USE-33). Wave 3 swaps each hook's `queryFn` and `mutationFn` for tRPC and rewrites nothing above them.

- **Decisions that apply:**
  - C-USE-set-my-days-3: edits save as made; "Saved" shows; there is no Save button.
  - C-USE-set-my-days-4 and 5, the reach and the date-only rule, as in the set-up pure functions' notes.
  - D-USE-32: Copy from on an empty day copies at once; on a day with blocks it replaces; Undo restores the day. Up at and Lights out stay the day's own [ASSUMPTION]. D-USE-87: Work blocks copy as time only; the slotted work stays on its own day.
  - D-USE-33: a block changed for one date reads "This day only"; Reset to usual removes the date's own changes.
  - D-USE-82: offline, the day's own controls (Up at, Lights out, the ···, the +) are read-only; a block opened from it edits offline (D-USE-67) and syncs when back.
  - D-USE-81: a new item typed in a block is 5 minutes, after the last.
- **Interfaces:**
  - `lib/fixtures/planner/`: `readWeek(week: "usual" | WeekKey)` returns seven days of bounds, blocks, changes, items, slots, events, work items and to-dos, as records; writes `writeBounds`, `createBlock`, `createTransition`, `editBlock`, `writeBlockChange`, `writeBlockItem`, `editBlockItem`, `removeBlockItem({ id, date? })`, `reorderItems({ blockId, ids, date? })`, `placeSlot`, `removeSlot`, `writeDayEvent`, `copyDay({ from, to })`, `clearDay`, `resetDay`, `undo(token)`. Each takes its validators input, returns `{ undo, reach? }`.
  - `useWeek(week)`, `useSetUpDay({ week, day })` (its occurrences through `readDay`, then `dayStrip`, `boundsEdge`, `overlaps` and `isOwnChange`, in `select`), `useBlockView({ blockId, date | weekday })`, `usePlannerWrites()` (mutations; `saveStatus: "idle" | "saving" | "saved" | "failed"` and `retry()`), `useConnection()` (the scenario's offline flag, else `use-online`).
  - Scenarios: `set-up-usual` (usual-week.md's week, Saturday's Errands and Thursday's Dinner with friends as drawn), `set-up-this-week` (12 to 18 Oct as the-week.md: Monday slotted, Thursday's dentist, Fri 16 and Sat 17 not set, Sunday's checklist), `set-up-first-day` (nothing set), and an `offline` mode beside USE-7's `ready`, `loading` and `error`.
- **Per path:** `lib/fixtures/planner/planner.test.ts` holds C2 to C6, one `describe` per criterion; the scenarios' test gains C1.
- **Gotchas:**
  - The fixture `now` is Sunday 11 October, 21:10, so Monday 12 has not begun and This week is the default.
  - Parse every scenario record through its schema, as USE-7 does.
  - Other threads add scenarios and fixture domains at the same time: add files, append to registries, never rewrite another domain's.
  - Placeholder names stay bracketed as the boards mark them.
- **Model:** Opus 5.5 at medium. A smaller model stores the day as built rows, lets This week write the usual block, or computes reach in the hook.
