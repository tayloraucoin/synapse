---
id: "USE-26"
size: small
objective: 'Each item left on the close card gains Do now beside Later and Leave, with its consequence in words before the tap: "Fits by 7:55" when it fits, "Training would start 8:05" when it would run past the end; Do now reopens the block on Now with that item lifted and, past the end, extends the block and slides the rest of today by the overrun, on fixtures'
slice_type: "a consequence preview and a day-wide write; risks a line that disagrees with what the tap does, a slide that changes the usual week or moves a pinned event, a slide computed from the item alone instead of the items above it, and red in a consequence"
non_negotiables:
  - "The line and the tap come from the same pure functions in @syn/utils, so what the line says is what happens."
  - "Each consequence counts the items above it as done now too; doing one recomputes the others."
  - "Past the end, the block's end and every later block today move by the overrun as dated block changes; each block keeps its length; the usual week and day events never move."
  - "If it fits before the end nothing else moves."
  - "Consequences are words and times, never red, never a count."
  - "Only @syn/ui components and preset tokens; Do now is the emphasised outline (ink border), Later and Leave hairline."
devs_call: "The consequence line's layout under the item; how the slide's block changes merge with ones already on the date."
cites:
  - "specs/web/epics/USE-daily-use/ux/day/block-complete/states/not-done-do-now.md"
  - "specs/web/epics/USE-daily-use/ux/day/now/words-and-access.md"
  - "C-USE-block-complete-not-done-do-now-1"
  - "C-USE-block-complete-not-done-do-now-2"
  - "C-USE-block-complete-not-done-do-now-3"
  - "C-USE-block-complete-not-done-do-now-4"
  - "C-USE-now-7"
waiver: "Block complete's do-now state, and Now's criterion for the screen Do now returns to; one action across the two."
truth_files: "none: an epic proposal; promotion carries day/block-complete/"
qa: Q1
reviewers:
  - assay
focus:
  - "the do-now card at 402, and the slide: lines match the write, events never move (assay)"
operator_review: false
planned_paths:
  - "apps/web/components/planner/"
  - "apps/web/app/(shell)/today/_components/"
  - "apps/web/lib/data/"
  - "apps/web/lib/fixtures/"
  - "packages/utils/src/planner/do-now.ts"
  - "packages/utils/src/planner/do-now.test.ts"
  - "packages/utils/src/planner/index.ts"
  - "specs/web/epics/USE-daily-use/tickets/USE-026-block-complete-do-now/evidence/"
depends_on:
  - "USE-4"
  - "USE-6"
  - "USE-7"
  - "USE-10"
  - "USE-25"
out_of_scope:
  - "Splitting blocks around set-time items, Lights out, and taking minutes from other items (Make room's sheet): A later start's and Make room's tickets, which extend slideAfter"
  - "Undo for a slide: not drawn; Make room's ticket"
criteria:
  - id: C1
    statement: 'At 7:45 with the disclosure open: Meditate · 10 min with "Fits by 7:55", Cold bath · 10 min with "Training would start 8:05", each with Do now (ink border), Later and Leave'
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-026-block-complete-do-now/evidence/not-done-do-now-402.png"
  - id: C2
    statement: "doNowLines gives each left item its line counting the items above it, and slideAfter for a 5-minute overrun moves Wellness's end and every later block today by 5 minutes as dated block changes, each keeping its length, with day events untouched"
    evidence: test
    command: "yarn test"
  - id: C3
    statement: "Do now on Meditate at 7:45 puts Wellness in focus with Meditate current and writes no block change; Do now on Cold bath after it writes the slide, and Now then reads Training as 8:05 to 9:02"
    evidence: test
    command: "yarn test"
  - id: C4
    statement: "The next Monday's read is unchanged by the slide"
    evidence: test
    command: "yarn test"
  - id: C5
    statement: "The web app and @syn/utils type-check"
    evidence: check
    command: "yarn check-types"
  - id: C6
    statement: "The web app lints clean"
    evidence: check
    command: "yarn lint"
---

# Contract — block-complete-do-now

## Build notes

After USE-25, on its `NotDoneList`. Capture to match: `ux/day/block-complete/captures/not-done-do-now-402.png`; Paper `01M49AX02VV4SSBKNCN6NRTS6Y`, "USE — daily use", row "Block complete" (the feedback round's frame).

- **Decisions that apply:**
  - D-USE-30: items left not done can be gone back to, Do now beside Later and Leave, with the consequence shown.
  - D-USE-72: Do now reopens the block on Now with that item lifted as the current card. If it fits before the block's end nothing else moves. Past the end the block extends and the day slides, on Make room's engine; no separate extend flow.
  - A later start's Phase 1 default is the flat slide: every block keeps its length and moves by the gap. Splitting around set-time items is that ticket's.
  - [ASSUMPTION, as drawn] each consequence counts the items above it as done now: Meditate alone ends 7:55; Cold bath after it ends 8:05, so Training would start 8:05.
  - Words: "<item> · <length>", "Fits by <time>", "<Block> would start <time>", "Do now", "Later", "Leave".
- **Interfaces:**
  - `@syn/utils` `planner/do-now.ts`: `doNowLines({ block; left: { id; lengthMin }[]; next: { name; start } | null; now }): { id; fitsBy: Date } | { id; nextStartsAt: Date }`, and `slideAfter({ blocks; fromBlockId; overrunMin; dateKey }): BlockChangeInput[]` (USE-3's `blockChangeInput`), merging with a change already on the date.
  - `useBlockClose` (USE-25) gains `doNow(item)`: focus the block, make the item current, and write `slideAfter`'s changes when the line said "would start".
  - The fixture server gains `writeBlockChanges(blockChangeInput[])`; `readDay` (USE-6) applies them.
  - Scenario: `not-done-do-now` (Wellness closed at 7:45 with Meditate and Cold bath left).
- **Per path:** `do-now.test.ts` holds C2; `lib/data/do-now.test.ts` holds C3 and C4 against the fixture server and `readDay`.
- **Gotchas:**
  - Repeating blocks move for the date only through `block_changes`; never edit a block's own times.
  - Breakfast is a meal block and slides like any block; a day event (a meeting) is pinned and never moves.
  - Overrun is whole minutes from the item's planned end to the block's end.
- **Model:** Opus 5.5 at medium. A smaller model shows a line the tap does not honour or moves the usual week.
