---
size: medium
objective: "Start, Pause, Prompt sent, Bring back, Done and Step away write real slot events, and slots are placed, moved and done in Postgres, so a timer started on the phone reads the same at the desk"
slice_type: "the append-only clock's write path; risks a replayed tap counted twice, an event accepted outside its day, an update or delete reaching slot_events, and devices disagreeing on order"
non_negotiables:
  - "slot_events is insert-only: no service updates or deletes a row, and a duplicate client_event_id is a no-op (ON CONFLICT DO NOTHING), never an error."
  - "The server refuses an event whose at falls outside its slot's day window or is more than two minutes past the server's now, with checkEventTime's reason; a replay keeps its own at."
  - "A batch (Step away's pauses) lands in one transaction: all or none."
  - "The clock is derived, never stored: no column holds a running total."
  - "Every query runs inside ctx.rls.execute()."
devs_call: "Procedure names under clock and slots; whether writeSlots stays one procedure taking either input or splits in two."
cites:
  - "specs/web/epics/USE-daily-use/ux/interactions/firing.md"
  - "C-USE-firing-1"
  - "D-USE-44"
  - "D-USE-46"
truth_files: "none: behaviour is the ledger's; only the data source changes"
qa: Q1
reviewers: []
focus: []
operator_review: false
planned_paths:
  - "packages/api/src/services/clock/"
  - "packages/api/src/services/planner/"
  - "packages/api/src/routers/clock.ts"
  - "packages/api/src/routers/planner.ts"
  - "packages/api/src/root.ts"
  - "packages/validators/src/planner.ts"
  - "apps/web/lib/data/live/"
depends_on:
  - "USE-92"
out_of_scope:
  - "Work-specific slot writes (place, move, spread, tier): USE-99"
  - "Offline taps and their replay after a reload: USE-106"
  - "The day's close is derived (C11); nothing is written for it"
criteria:
  - id: C1
    statement: "clock.writeEvents inserts each event once; sending the same batch again returns the stored rows and inserts nothing"
    evidence: test
    command: "yarn test"
  - id: C2
    statement: "An event at outside its slot's day window, or more than two minutes past now, is refused with checkEventTime's reason; one replayed hours later with its own in-window at is accepted"
    evidence: test
    command: "yarn test"
  - id: C3
    statement: "A batch with one refused event writes none of the batch"
    evidence: test
    command: "yarn test"
  - id: C4
    statement: "No service under services/clock contains an update or delete on slot_events"
    evidence: test
    command: "yarn test"
  - id: C5
    statement: "placeSlot, removeSlot and writeSlots write and refuse as the fixture does, and return an undo token through services/undo"
    evidence: test
    command: "yarn test"
  - id: C6
    statement: "Started on the phone, a work timer reads running at the desk within 15 seconds, and Prompt sent there shows firing on the phone"
    evidence: manual
    reason: "two devices on Taylor's staging account; recorded as an operator check"
  - id: C7
    statement: "The web app and the API type-check"
    evidence: check
    command: "yarn check-types"
id: USE-94
---

# Contract — slots-and-clock

## Build notes

The fixture's `writeSlotEvents(inputs)` becomes `clock.writeEvents`. `placeSlot`, `removeSlot` and `writeSlots` become `planner.placeSlot`, `planner.removeSlot` and `planner.writeSlot`.

- **Decisions that apply:**
  - D-USE-44: two clocks per item. Prompt sent pauses work time by itself. Bringing back never restarts it.
  - D-USE-46: Step away writes one `paused` per running item, all sharing one `step_away_id`. Resume all resumes exactly those.
  - C-USE-firing-1: every way to fire writes one `prompt_sent`.
  - Data contract: devices resolve conflicts by event time, never by arrival. `deriveClock` sorts by `at`, then `received_at`.
- **Approach:**
  - `services/clock/write-events.ts`:
    1. Parse each input with `slotEventInput`.
    2. Read each slot's date and block through rls, and build its day window with `day/boundaries.ts` and `users.day_close_time`.
    3. Run `checkEventTime({ at, window, now })`, the same function the fixture runs. Any refusal refuses the batch.
    4. Insert all rows with `received_at = now()` and `ON CONFLICT (user_id, client_event_id) DO NOTHING`.
    5. Return the rows for the batch's ids: the inserted ones plus those already there.
  - Slot writes are plans plus apply, as in USE-92, with `recordUndo`. The unique `(work_item_id, on_date)` refusal maps to the fixture's `SlotWriteRefusal`.
- **Per path:**
  - `write-events.test.ts`: C1 to C3, against an in-memory store that honours the unique key.
  - `append-only.test.ts`: C4, reading the files as text.
  - `services/planner/write-slots.ts` and its test: C5.
- **Gotchas:**
  - `now` is the server's. The two-minute allowance is for clock skew; do not widen it.
  - The unique key is per user, so it is `(user_id, client_event_id)`. Check USE-2's index name before writing the conflict target.
  - Return the rows sorted by `at`, then `received_at`, so a hook's optimistic merge is stable.
- **Model:** Opus 5.5 at medium. A smaller model upserts events or stores a running total.
