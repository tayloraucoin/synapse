---
id: "USE-14"
size: small
objective: "The set-up area's three facts 0012 cannot hold get storage, one additive migration 0013 and their zod shapes: a day's Up at and Lights out (per weekday, or one date), an event's tag, notes, colour, client and repeat, and a set item changed for one date only"
slice_type: "schema and migration, a one-way door; risks a table without owner-private RLS, a bounds row that is both a weekday and a date, an event that is neither dated nor repeating, a DROP or a NOT NULL tightened on 0012's tables, and validators that accept what the CHECKs refuse"
non_negotiables:
  - "0013 makes additions only, plus dropping NOT NULL on day_events.on_date. No 0012 file, policy or migration changes; no DROP, no RENAME."
  - "day_bounds is owner-private through ownerPrivateCrudPolicies, like every 0012 table."
  - "No agent runs a migration on any database. Taylor reads 0013 and runs it on staging after 0012."
  - "Each new enum's values are spelled once in @syn/constants and built through enumValues<Union>(), as USE-2 does."
  - "Every CHECK 0013 adds is refused by its validator in the UX's words."
  - "No service, router or UI reads the new columns in this ticket."
devs_call: "Index names; whether the two exactly-one checks share a helper; the test's SQL parsing (extend USE-2's or a sibling file); comments."
cites:
  - "specs/web/epics/USE-daily-use/ux/set-my-days/set-my-days/index.md"
  - "specs/web/epics/USE-daily-use/ux/set-my-days/set-my-days/words-and-access.md"
  - "specs/web/epics/USE-daily-use/ux/interactions/add-event.md"
  - "D-USE-31"
  - "D-USE-33"
  - "D-USE-42"
  - "D-USE-102"
  - "C-USE-set-my-days-4"
  - "C-USE-set-my-days-5"
waiver: "Schema for three surfaces' records: Set my days' bounds (this index), the Add event forms (interactions/add-event.md and set-my-days/states/add-event.md) and a block's one-date changes (set-my-days/states/day-own-change.md, day/block-view/states/removed-undo.md). One migration, so one ticket."
truth_files: "none: no behaviour changes; the columns are unread until the set-up fixtures ticket and wave 3"
qa: Q3
reviewers:
  - mason
  - warden
focus:
  - "day_bounds' owner-private policies and the static RLS test (warden, Q3)"
  - "0013's SQL: additions only, the one relaxed NOT NULL, each CHECK mirrored by a validator (mason, Q3)"
operator_review: false
planned_paths:
  - "packages/types/src/domain/"
  - "packages/constants/src/"
  - "packages/db/src/schema/enums.ts"
  - "packages/db/src/schema/index.ts"
  - "packages/db/src/schema/planner/"
  - "packages/db/migrations/0013_use_set_up.sql"
  - "packages/db/migrations/meta/"
  - "packages/db/migrations/migrations.lock.json"
  - "packages/db/SCHEMA_REFERENCE.md"
  - "packages/validators/src/planner.ts"
  - "packages/validators/src/use-records.test.ts"
  - "tests/use-rls.test.ts"
depends_on:
  - "USE-2"
  - "USE-3"
out_of_scope:
  - "The fixture server's writes and hooks over these shapes: the set-up fixtures ticket"
  - "Services, routers and the swap of each hook to tRPC: wave 3"
  - "Google's events: the Google Calendar ticket's migration"
  - "Applying the migration anywhere"
criteria:
  - id: C1
    statement: "day_bounds enables RLS and has select, insert, update and delete policies for authenticated callers, each keyed on the caller owning user_id"
    evidence: test
    command: "yarn test:root"
  - id: C2
    statement: "0013 holds no DROP and no RENAME, creates only day_bounds and event_tag, and alters only by adding columns and checks and by dropping NOT NULL on day_events.on_date"
    evidence: test
    command: "yarn test:root"
  - id: C3
    statement: "0013 holds its CHECKs: a bounds row has exactly one of weekday (0 to 6) and on_date, with lights_out after up_at; an event has exactly one of rrule and on_date; and its unique keys, one bounds row per user per weekday and per date"
    evidence: test
    command: "yarn test:root"
  - id: C4
    statement: "dayBoundsInput, dayEventInput, blockItemInput and placeSlotInput accept the new fields and refuse a bounds row with both or neither, Lights out at or before Up at (\"Lights out comes after Up at.\"), an event with both or neither repeat, and a tag outside Work and Personal"
    evidence: test
    command: "yarn test"
  - id: C5
    statement: "0013 is recorded in the migrations lock and acts on nothing in Supabase's auth schema"
    evidence: check
    command: "yarn check-migrations"
  - id: C6
    statement: "The unions, value lists and enums agree, and every workspace type-checks"
    evidence: check
    command: "yarn check-types"
  - id: C7
    statement: "Taylor has read 0013 and applied it on staging after 0012"
    evidence: manual
    reason: "only Taylor runs migrations (C10); the builder defers it"
  - id: review:mason
    statement: "Mason reviews this ticket in fresh context against its contract and evidence."
    evidence: manual
    reason: "a reviewer's judgment, recorded only by yarn review:run mason <id>"
  - id: review:warden
    statement: "Warden reviews this ticket in fresh context against its contract and evidence."
    evidence: manual
    reason: "a reviewer's judgment, recorded only by yarn review:run warden <id>"
---

# Contract — schema-0013-day-bounds

## Build notes

Found at the Tickets gate (thread 6): 0012 has no place for a day's bounds, the Add event forms' fields, or a set item changed for one date, and every set-up surface needs them. Taylor took the shape below at that gate (2026-10-13), Client and Repeats on events included. USE-2's approach applies unchanged (unions in `@syn/types`, lists in `@syn/constants`, `enumValues` in `@syn/db`, `yarn db:generate`, read every statement, `yarn check-migrations --record`, `yarn db:schema-reference`).

- **Decisions that apply:**
  - N2 / Set my days: each weekday has its own "Up at" and "Lights out"; a This week date can differ ("the day's own controls"). Orient sits at Up at.
  - C-USE-set-my-days-4 and 5: a Usual week edit reaches every week; a This week edit changes that date only.
  - D-USE-33: a block changed for one date reads "This day only"; Reset to usual is the way back.
  - D-USE-42 and D-USE-102: the desk popover has Starts, Ends, Work or Personal, Client and Repeats; the phone sheet has Starts, Length, Colour (plum) and Notes, "this date only". Each form as drawn.
  - D-USE-31: events are plum, pinned inside the block their time falls in.
- **Interfaces:**
  - `day_bounds`: `weekday smallint` (Monday 0, as `RepeatRule.weekdays`) or `on_date date`, `up_at time`, `lights_out time`; unique `(user_id, weekday)` and `(user_id, on_date)`. A date's row wins over its weekday's.
  - `day_events` gains `tag event_tag NOT NULL DEFAULT 'personal'`, `notes text`, `color text`, `client_id uuid` (FK `clients`, on delete set null), `rrule text`; `on_date` becomes nullable, with the exactly-one CHECK.
  - `block_items` gains `on_date date`: an item on one date only; null means every date the block runs.
  - `slots` gains `skipped boolean NOT NULL DEFAULT false`: a set item's slot that leaves it out on that date. Remove for today writes it; a swap is a skip plus a dated item; reorder for one date writes the date's slots' `sort_order`.
  - `@syn/validators`: `dayBoundsRecord`, `dayBoundsInput`, `eventTagSchema`; the new fields on `dayEventRecord`/`dayEventInput`, `blockItemRecord`/`blockItemInput` and `slotRecord`/`placeSlotInput`.
- **Per path:** `planner/day-bounds.ts` beside the 0012 files; the existing planner files gain columns; `tests/use-rls.test.ts` gains a `describe` per criterion for 0013.
- **Gotchas:**
  - `ALTER TYPE … ADD VALUE` is not used: `event_tag` is a new type.
  - The default tag keeps 0012's rows valid when 0013 runs.
  - A dated `block_items` row is read only on its date; `readDay` (USE-6) is not changed here, the set-up fixtures filter it.
- **Model:** Opus 5.5 at medium. A smaller model drops NOT NULL elsewhere, forgets the event one-of check, or edits 0012.
