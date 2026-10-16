---
size: medium
objective: "Today, the Week, Set my days and Review the day read Taylor's real blocks, items, slots, to-dos, events and day records from Postgres, through one day read and one week read"
slice_type: "the planner's read path; risks a day assembled differently on the server than the fixtures assemble it, a read outside RLS, and a slow day from one query per block"
non_negotiables:
  - "Every query runs inside ctx.rls.execute(); the singleton db is never imported in a service."
  - "The day is read, not built: rules are expanded and block_changes applied on read; nothing is written by a read (data contract)."
  - "The router's output parses with the same @syn/validators record schemas the fixtures parse with."
  - "No old table is read; users is read only for timezone, usual wake, day_close_time and clients_enabled."
  - "The fixtures stay the ?state= source; no surface file changes."
devs_call: "The service split under services/planner/; whether the day read is one query per table or a few joins; the output schema's name."
cites:
  - "specs/web/epics/USE-daily-use/ux/dev-notes/blocks-and-todos-model.md"
  - "D-USE-31"
  - "D-USE-74"
  - "D-USE-80"
truth_files: "none: the surfaces' behaviour is the ledger's; only the data source changes"
qa: Q1
reviewers: []
focus: []
operator_review: false
planned_paths:
  - "packages/api/src/services/planner/"
  - "packages/api/src/routers/planner.ts"
  - "packages/api/src/root.ts"
  - "packages/validators/src/planner.ts"
  - "apps/web/lib/data/live/planner.ts"
  - "apps/web/lib/data/today-records.ts"
  - "apps/web/lib/data/week-records.ts"
depends_on:
  - "USE-90"
out_of_scope:
  - "Every planner write: USE-92 and USE-93"
  - "Google events inside the day and the week: USE-103 adds them to these reads"
  - "The pool's read: USE-98"
criteria:
  - id: C1
    statement: "planner.today returns the date's records (blocks, block changes, block items, slots, work items, clients, to-dos, day events, slot events, day record, zone, window), and its output parses with the day-read schema"
    evidence: test
    command: "yarn test"
  - id: C2
    statement: "A repeating block moved on one date by a block_change reads at its new times on that date and its usual times on the next; a skipped date reads without it"
    evidence: test
    command: "yarn test"
  - id: C3
    statement: "planner.week returns the seven days' records for a week ref, with day_bounds by weekday and by date, and parses with the week-read schema"
    evidence: test
    command: "yarn test"
  - id: C4
    statement: "No service under services/planner imports the singleton db; every read is inside ctx.rls.execute"
    evidence: test
    command: "yarn test"
  - id: C5
    statement: "With no ?state=, /today, /week and /days render the signed-in account's own day and week"
    evidence: manual
    reason: "only staging holds Taylor's rows, and no test reads staging; Taylor walks it once the migrations are applied"
  - id: C6
    statement: "The web app and the API type-check"
    evidence: check
    command: "yarn check-types"
id: USE-91
---

# Contract — day-and-week-reads

## Build notes

The first domain swap. The fixture server's `readToday(dateKey)`, `readWeek(week)` and `readSetUpColumn()` become `planner.today`, `planner.week` and nothing: the set-up column's gate is just the week query's own loading state.

- **Decisions that apply:**
  - D-USE-31: a work block follows the same pattern as Block, To-do, Slot and Event.
  - D-USE-74: an undone slot whose block has ended reads as returned, so its to-do is back in the pool with no job.
  - D-USE-80: one RFC 5545 rule per repeating block.
  - Data contract: a set item's slot is written on first touch, never ahead of time, so the read joins whatever slots exist.
- **Approach:**
  - `services/planner/read-day.ts`: `readDayRecords(rls, dateKey)` selects the rows the date needs.
    - Blocks whose rule can fall on the date, or whose `on_date` is the date, and their `block_changes` for it; `block_items` of those blocks.
    - `slots` and `slot_events` for the date; the `work_items` and `clients` those slots name; `todos` dated to the date, or in the pool with a rule.
    - `day_events` and the `day_records` row for the date; the `users` row's zone, wake and close time.
  - It returns records, never occurrences. `readDay`, `deriveClock`, fit and Next stay in the hooks' `select`, exactly as on fixtures (USE-7).
  - `services/planner/read-week.ts`: the same over seven dates, plus `day_bounds`.
  - `routers/planner.ts`: `today` (input `{ dateKey }`) and `week` (input `WeekRef`), both `protectedProcedure`.
  - `live/planner.ts`: `readToday`, `readWeek`, and `readSetUpColumn` as a resolved promise. Mark `planner-read` live.
- **Interfaces:**
  - `@syn/validators/planner`: `dayReadOutput`, `weekReadOutput`, composed of the existing record schemas.
  - `lib/data/today-records.ts` and `week-records.ts` derive their types from those schemas (`z.infer`), so fixture and router cannot drift.
- **Per path:** `services/planner/read-day.test.ts` (C1, C2) and `read-week.test.ts` (C3) run the pure assembly over in-memory rows. Split the select (RLS) from the assembly (pure), so the assembly is testable without a database. C4 reads the files as text.
- **Gotchas:**
  - Narrowing blocks by rule in SQL is not possible. Select the account's live blocks (`archived_at is null`) and expand in TypeScript with `packages/utils/src/planner/rrule.ts`. It is one person's dozen blocks.
  - Block times are wall-clock in `users.timezone`, resolved per date with `day/boundaries.ts` (DST).
  - The day opens at `day_close_time` (03:00 by default), not midnight, as `deriveClock`'s window does.
- **Model:** Opus 5.5 at medium. A smaller model computes occurrences on the server and returns a second shape.
