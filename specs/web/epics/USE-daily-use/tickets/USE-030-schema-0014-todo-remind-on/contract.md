---
id: "USE-30"
size: small
objective: "A to-do's reminder can name its day while the to-do keeps none: todos gains remind_on through one additive migration, 0014_use_todo_remind_on, after USE-14's 0013, and the validators take it"
slice_type: "schema and migration, a one-way door; risks editing 0012 or USE-14's 0013 instead of adding after them, a NOT NULL on a table that may hold rows, and validators that drift from the SQL"
non_negotiables:
  - "0014 adds one column, todos.remind_on, a nullable date, and nothing else. No other table, column, policy or migration file changes; 0012 and 0013 are never edited."
  - "No agent runs a migration on any database. Taylor reads 0014 and runs it on staging after 0012 and 0013."
  - "todoRecord and todoInput gain remindOn with the same nullability; nothing else in @syn/validators changes."
  - "No service, router or UI reads the new columns in this ticket."
devs_call: "Comment wording; where the new fields sit in each zod object; the test's SQL parsing."
cites:
  - "specs/web/epics/USE-daily-use/ux/day/todo-sheet/states/reminder-on.md"
  - "D-USE-37"
  - "D-USE-69"
  - "C-USE-todo-sheet-reminder-on-1"
truth_files: "none: no behaviour changes; the column is unread until USE-28 on fixtures and wave 3"
qa: Q3
reviewers:
  - mason
focus:
  - "0014's SQL: one nullable column, nothing else (mason, Q3)"
operator_review: false
planned_paths:
  - "packages/db/src/schema/planner/"
  - "packages/db/migrations/0014_use_todo_remind_on.sql"
  - "packages/db/migrations/meta/"
  - "packages/db/migrations/migrations.lock.json"
  - "packages/db/SCHEMA_REFERENCE.md"
  - "packages/validators/src/todo.ts"
  - "packages/validators/src/use-records.test.ts"
  - "tests/use-0014.test.ts"
depends_on:
  - "USE-2"
  - "USE-3"
  - "USE-14"
out_of_scope:
  - "slots.skipped (Not today on a set item): USE-14's 0013 already adds it"
  - "Arming a reminder on remind_on: the to-dos-and-reminders wiring (wave 3)"
  - "The To-do sheet's day select: USE-28"
  - "Applying the migration anywhere"
criteria:
  - id: C1
    statement: "0014 adds todos.remind_on as a nullable date and holds nothing else: no DROP, no RENAME, no other ALTER, no policy"
    evidence: test
    command: "yarn test:root"
  - id: C2
    statement: "0014 is recorded in the migrations lock after 0013, and the recorded hashes of 0012 and 0013 are unchanged"
    evidence: check
    command: "yarn check-migrations"
  - id: C3
    statement: "todoRecord and todoInput take remindOn as a date key or null and refuse a bad date; a record without the field is refused"
    evidence: test
    command: "yarn test"
  - id: C4
    statement: "Every workspace type-checks"
    evidence: check
    command: "yarn check-types"
  - id: C5
    statement: "Taylor has read 0014 and applied it on staging after 0012 and 0013"
    evidence: manual
    reason: "only Taylor runs migrations; the builder defers it"
---

# Contract — schema-0014-todo-remind-on

## Build notes

The Tickets gate's one blocker (thread 5, 2026-10-13): two drawn states need fields 0012 lacks. Taylor chose a new migration over amending 0012. USE-14 (thread 6, the set-up area) already adds `slots.skipped` in 0013, which covers Now's Not today on a set item, so this ticket adds only the reminder's day, after it.

- **Approach:** add `remindOn` (`remind_on`, `date`, nullable) to the `todos` table in `packages/db/src/schema/planner/`; run `yarn db:generate` once USE-14's 0013 is in, name the file `0014_use_todo_remind_on`, read it, then `yarn check-migrations --record` and `yarn db:schema-reference`; add `remindOn: dateKeySchema.nullable()` to `todoRecord` and `remindOn: dateKeySchema.nullish()` to `todoInput`.
- **Decisions that apply:**
  - D-USE-37, To-do sheet › reminder on: a to-do with no day reminds on the day picked here, and stays in the tray with no day. `remind_on` is that day; `remind_at` stays the time.
  - D-USE-69: the At row's day select reads "Today", "Tomorrow", then "Pick a day…".
  - Product rule: a notification never reports a miss. A to-do checked before `remind_on` + `remind_at` is never reminded (the scheduler's, wave 3).
- **Interfaces:** `todos.remindOn` from `@syn/db`; `TodoRecord.remindOn`, `TodoInput.remindOn` from `@syn/validators`.
- **Per path:** `tests/use-0014.test.ts` reads `0014_use_todo_remind_on.sql` as text, one test named after C1; `use-records.test.ts` gains C3's cases beside USE-3's.
- **Gotchas:**
  - Build after USE-14 lands, so drizzle-kit numbers this 0014 and its snapshot follows 0013's. If USE-14 has not landed, stop and say so; never generate a second 0013.
  - Fixtures parse through `todoRecord`: once `remindOn` is required there, every fixture to-do needs `remindOn: null`. Add it in the fixtures' to-do builder if USE-7 has landed.
  - drizzle-kit may re-emit the `auth` stub; `check-migrations` fails it (`packages/db/AGENTS.md`).
- **Model:** Opus 5.5 at medium. A smaller model edits 0013 in place or hand-writes the SQL.
