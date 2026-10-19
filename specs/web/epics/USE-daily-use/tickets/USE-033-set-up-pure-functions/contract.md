---
id: "USE-33"
size: small
objective: "The set-up area's arithmetic is pure and shared in @syn/utils: where a tapped time or the + puts a new block, how items re-flow around set times and events without splitting, where an event lands and what moves, overlaps and out-of-bounds, a day's strip, which blocks make a usual weekday, which week opens, and how far a usual-week change reaches"
slice_type: "pure functions on wall-clock times; risks a re-flow that splits an item across a band, a pinned item that moves, a tapped slot that runs over the next block, a usual change that reaches a day already begun, and each screen doing this arithmetic its own way"
non_negotiables:
  - "Pure and platform-free: no clock read, no I/O, no Date.now; the caller passes now, the bounds and the records."
  - "Times are \"HH:MM\" wall clock in the user's zone, as USE-6's readDay takes them; an end may be 24:00."
  - "An item is never split: one that would cross a set-time item or an event band moves after it whole."
  - "A usual-week change never reaches a date already begun, and skips a block changed on that date."
  - "Nothing here reads a record shape it does not need: inputs are the fields named in the Build notes."
devs_call: "File split inside planner/ (one file per group is fine); helper names inside a file; the minute arithmetic's form."
cites:
  - "specs/web/epics/USE-daily-use/ux/set-my-days/set-my-days/words-and-access.md"
  - "C-USE-set-my-days-4"
  - "C-USE-set-my-days-5"
  - "D-USE-87"
waiver: "Shared arithmetic with no screen of its own: Set my days (tap a time, out of bounds, overlap, the strips, the reach), Block view (re-flow, overflow) and Add event (the landing line) each call it, and each state file names its rule."
truth_files: "none: no screen changes; the set-up surfaces call these"
qa: Q1
reviewers: []
focus: []
operator_review: false
planned_paths:
  - "packages/utils/src/planner/set-up-times.ts"
  - "packages/utils/src/planner/set-up-times.test.ts"
  - "packages/utils/src/planner/reflow.ts"
  - "packages/utils/src/planner/reflow.test.ts"
  - "packages/utils/src/planner/usual-week.ts"
  - "packages/utils/src/planner/usual-week.test.ts"
  - "packages/utils/src/planner/index.ts"
  - "packages/utils/src/index.ts"
depends_on:
  - "USE-6"
out_of_scope:
  - "Reading or writing records, Undo and the fixture writes: the set-up fixtures ticket"
  - "Make room's engine, when there is no room at all: USE-35"
  - "Tier fit and Next: USE-8's fitInBlock and resolveWorkNext"
criteria:
  - id: C1
    statement: "tappedSlot starts at the hour or half hour tapped and ends at the next block or one hour later, whichever is sooner (17:10 with a block at 17:40 gives 17:00 to 17:40); firstFreeTime is 5 minutes after Up at on an empty day and the last block's end otherwise"
    evidence: test
    command: "yarn test"
  - id: C2
    statement: "reflowItems lays items from the block's start in order, keeps a set-time item and an event band at their times, moves an item that would cross one after it whole, and reports the minutes past the block's end and where free time starts"
    evidence: test
    command: "yarn test"
  - id: C3
    statement: "eventLanding names the block an event's time falls in, or none, and lists each item that moves with its new start (Design review at 11:00 moves Review the Paper handoff to 11:30)"
    evidence: test
    command: "yarn test"
  - id: C4
    statement: "overlaps pairs each two blocks that share time with the shared span and the fix (start at the earlier block's end); boundsEdge marks a block before Up at or after Lights out and nothing else"
    evidence: test
    command: "yarn test"
  - id: C5
    statement: "dayStrip gives Orient's sliver, then each block's and each open gap's share of the day between its bounds, summing to one; a day with no bounds gives none"
    evidence: test
    command: "yarn test"
  - id: C6
    statement: "usualDay keeps the blocks whose weekly rule hits the weekday and leaves monthly and yearly ones out; defaultWeek is usual until Sunday 18:00 and this from then"
    evidence: test
    command: "yarn test"
  - id: C7
    statement: "usualChangeReach names this week's matching date when it has not begun and the block has no change on it; a date begun, or the block changed on it, gives none; isOwnChange is true for a date with a block change, a skipped slot or a dated item"
    evidence: test
    command: "yarn test"
  - id: C8
    statement: "@syn/utils type-checks"
    evidence: check
    command: "yarn check-types"
---

# Contract — set-up-pure-functions

## Build notes

Wave 2's first set-up ticket, parallel to the 0013 schema ticket. Every set-up screen and the fixtures call these, so the rules live once.

- **Decisions that apply:**
  - Tap a time: a tapped block starts at the hour or half hour tapped and runs to the next block or 1 h, whichever is sooner; tapping inside a block opens it. The + starts at the first free time (round 3; 7:05 on an empty day, after Orient).
  - Round 8: reordering re-flows times around pinned items; an event band is pinned at its time, the items after it move to its end, and an item is never split.
  - Overflow: items past the end read "Runs <n> min past <end>.", over a dashed line.
  - Overlap (D-USE-33): both stay; one fix, start at the earlier block's end, keeping the length.
  - Out of bounds (D-USE-32): a block before Up at or after Lights out keeps its place, dashed, never deleted.
  - Strips: segments in kind colours, Orient's ink sliver first, each block's share of the day kept (the 1024 note).
  - D-USE-87: a monthly or yearly block appears in This week on its dates only, never in the usual week.
  - This week is the default from Sunday evening onward [ASSUMPTION, from N2]; evening is read as 18:00.
  - The reach: a usual-week change reaches every day of this week not yet started, except blocks already changed on that date; never a day already begun (N2, note 18). "Begun" is now at or past that date's Up at.
- **Interfaces** (`@syn/utils` planner; `T` is "HH:MM"):
  - `set-up-times.ts`: `tappedSlot({ at: T; blocks: { startsAt: T; endsAt: T }[]; lightsOut: T }): { startsAt: T; endsAt: T }`; `firstFreeTime({ upAt: T; blocks }): T`; `overlaps(blocks: { id; startsAt; endsAt }[]): { a; b; startsAt; endsAt; fixStartsAt: T }[]`; `boundsEdge({ startsAt; endsAt }, { upAt; lightsOut }): "before_up_at" | "after_lights_out" | null`; `dayStrip({ upAt; lightsOut; blocks: { kind; startsAt; endsAt }[] }): { part: "orient" | "open" | string; share: number }[]`.
  - `reflow.ts`: `reflowItems({ startsAt; endsAt; items: { id; lengthMin: number; atTime: T | null }[]; bands: { startsAt; endsAt }[] }): { placed: { id; startsAt: T }[]; overMin: number; freeFrom: T | null }`; `eventLanding({ event: { startsAt; endsAt }; blocks: { id; name; startsAt; endsAt; items }[] }): { inside: { id; name } | null; moves: { id; from: T; to: T }[] }`.
  - `usual-week.ts`: `usualDay<B extends { rrule: string | null }>(blocks: B[], weekday: number): B[]` (through `parseRule`); `defaultWeek(now: Date, timeZone: string): "usual" | "this"`; `usualChangeReach({ weekday; weekDates: string[]; now: Date; timeZone; upAtOn: (dateKey) => T; changedOn: ReadonlySet<string> }): { follows: string | null }`; `isOwnChange({ dateKey; changes; slots; items }): boolean`.
- **Per path:** one test file per source file, each `describe` named after its criterion. Append to `planner/index.ts` and to `src/index.ts`'s planner banner; never reorder.
- **Gotchas:**
  - A null `lengthMin` counts 5 minutes (D-USE-81's new item).
  - A transition is an item with a set time, so it pins like one.
  - Weekday numbering is `RepeatRule.weekdays`' (Monday 0), the same as 0013's `day_bounds.weekday`.
  - Other threads append to `planner/index.ts` at the same time; add lines, never rewrite the file.
- **Model:** Opus 5.5 at medium. A smaller model splits an item across a band, reads the clock inside a function, or lets the reach touch a day already begun.
