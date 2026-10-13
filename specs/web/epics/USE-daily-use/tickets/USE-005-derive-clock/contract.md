---
id: "USE-5"
size: small
objective: "One pure deriveClock turns a day's slot events into each slot's work time, firing time, done and Step away hold, the same on every device and the server, with the event-time check the router calls"
slice_type: "pure logic over an append-only event log; risks a wrong time when taps arrive out of order, twice or from two devices, firing counted as work, two work spans open in one Work block, and a span left running past the day's close"
non_negotiables:
  - "Pure and platform-free: no Date.now(), no I/O, no React; the caller passes every instant."
  - "Total: any list of events, in any order, with duplicates, yields one valid clock and never throws."
  - "Order is at, then received_at, then client_event_id; never array order."
  - "Inside a Work block at most one work span is open; firing never counts as work."
  - "Nothing is written: the day's close is derived (C11)."
  - "@syn/utils never imports @syn/validators; input types are structural, kinds from @syn/types."
  - "No new dependency: the generator is seeded, in the test file."
devs_call: "Internal state shape; the PRNG; how many generated runs (at least 500 per invariant); helper names inside the file."
cites:
  - "specs/web/epics/USE-daily-use/ux/dev-notes/timers-across-devices.md"
  - "D-USE-43"
  - "D-USE-44"
  - "D-USE-46"
  - "D-USE-48"
truth_files: "none: no behaviour ships; Today's data hook reads this in wave 2"
qa: Q1
reviewers: []
focus: []
operator_review: false
planned_paths:
  - "packages/utils/src/planner/clock.ts"
  - "packages/utils/src/planner/clock.test.ts"
  - "packages/utils/src/planner/event-time.ts"
  - "packages/utils/src/planner/event-time.test.ts"
  - "packages/utils/src/planner/index.ts"
  - "packages/utils/src/index.ts"
depends_on:
  - "USE-3"
out_of_scope:
  - "useWorkClock, the one-second tick: the hooks ticket (wave 2)"
  - "Formatting \"Took 1 h 10 · fired 32 min\" and the countdown: the running card's ticket"
  - "Writing events, Resume all's writes and the router's refusal: the slots and clock wiring (wave 3)"
  - "Next, fit and session counts: their own pure-function tickets"
criteria:
  - id: C1
    statement: "Work time sums the spans opened by started or resumed and closed by paused, prompt_sent, done or day_closed; firing runs from prompt_sent to brought_back, done or day_closed; brought_back never opens a work span"
    evidence: test
    command: "yarn test"
  - id: C2
    statement: "Inside a Work block, a started or resumed closes any other open work span at its own at; outside one, several slots run at once"
    evidence: test
    command: "yarn test"
  - id: C3
    statement: "Over seeded generated days, the same events shuffled, duplicated and split across two devices give the same clock, never two open work spans in one Work block, and never firing time inside work time"
    evidence: test
    command: "yarn test"
  - id: C4
    statement: "A done wins over a later paused; undone clears done without reopening a span; a repeated client_event_id is ignored, so a replay changes nothing"
    evidence: test
    command: "yarn test"
  - id: C5
    statement: "Pauses that share a step_away_id read as one hold naming exactly those slots; resumed events with that id release it; firing keeps counting through it"
    evidence: test
    command: "yarn test"
  - id: C6
    statement: "A span still open at the day window's end stops counting there, and an event outside the window changes nothing"
    evidence: test
    command: "yarn test"
  - id: C7
    statement: "checkEventTime passes an at inside its slot's day window and no more than two minutes past the server's now, refuses the rest with its reason, and passes a replay received hours later"
    evidence: test
    command: "yarn test"
  - id: C8
    statement: "@syn/utils and its importers type-check"
    evidence: check
    command: "yarn check-types"
---

# Contract — derive-clock

## Build notes

Wave 1, after USE-3, parallel to USE-6. The README's contract-first rule: fixtures run through this function, so firing, Step away and Done truly work before any table is read.

- **Approach:** dedupe by `clientEventId` (keep the earliest `receivedAt`), drop events outside the window, sort, then fold each slot through its states: idle, running, paused, firing, done.
- **Decisions that apply:**
  - D-USE-44: two clocks per item. Work time runs only while the item is in Taylor's hands (Start, Pause, Resume). Firing runs from Prompt sent until the mark is pressed again. Prompt sent pauses work time by itself, and bringing an item back does not restart it.
  - D-USE-43: many items can fire at once, and one is in Taylor's hands at a time.
  - D-USE-27: outside a Work block, several items can run at once.
  - D-USE-46: Step away pauses every running work timer; firing keeps counting. Resume all resumes exactly what Step away paused, and a card's own Pause is not tagged.
  - D-USE-48: Done records "Took <work> · fired <firing>".
  - C11 (calls.md): timers left on stop at the day's close, derived, with nothing written.
- **The fold, per event kind:**
  - Anything after `done` is ignored, except `undone`.
  - `started` or `resumed` opens a work span unless one is open. It also ends a firing span, and on a work slot it closes every other work slot's open span at the same `at`.
  - `paused` closes the open span. With a `stepAwayId`, the slot is held by that id until a span opens again.
  - `prompt_sent` closes the work span and opens firing.
  - `brought_back` closes firing.
  - `done` closes both and sets `doneAt`.
  - `day_closed` closes both.
  - Anything else is a no-op.
- **Interfaces** (`planner/clock.ts`):
  - `ClockEvent { slotId; kind: SlotEventKind; at: string; receivedAt: string; clientEventId: string; stepAwayId: string | null }`.
  - `deriveClock(events, { dayWindow: { start: Date; end: Date }, workSlotIds: ReadonlySet<string> }): DayClock`.
  - `DayClock { slots: Map<string, SlotClock>; stepAway: { id; at: Date; slotIds: string[] } | null }`, where `stepAway` is the latest hold with a slot still held.
  - `SlotClock { state; work: Span[]; firing: Span[]; doneAt: Date | null; heldBy: string | null }`; `Span { start: Date; end: Date | null }`.
  - `clockAt(slot, now, dayEnd): { workMs; firingMs; running; firing }`. An open span counts to the earlier of `now` and `dayEnd`; at or past `dayEnd` nothing runs.
  - `planner/event-time.ts`: `checkEventTime({ at, dayWindow, serverNow }): { ok: true } | { ok: false; reason: "before-day" | "after-day" | "ahead-of-now" }`, and `EVENT_AHEAD_LIMIT_MS = 120_000`. The window is `[start, end)`.
- **Per path:**
  - `clock.test.ts`: one `describe` per criterion from C1 to C6, named after it. C3 is a seeded mulberry32 generator, and a failing seed is printed.
  - `event-time.test.ts`: C7.
  - `planner/index.ts`: the barrel for this folder. `src/index.ts` re-exports it.
- **Gotchas:**
  - `dayWindow` is `day/boundaries.ts`'s, which opens at `day_close_time`, not midnight. Reuse it in tests; never build windows by hand.
  - USE-6 adds to the same two barrels in parallel. Append; never reorder.
  - `SlotEventKind` comes from USE-2's union in `@syn/types`. Never retype the eight kinds.
  - Parse each `at` once; compare numbers, not strings.
- **Model:** Opus 5.5 at medium. A smaller model sorts by arrival, counts firing as work, or skips the generator.
