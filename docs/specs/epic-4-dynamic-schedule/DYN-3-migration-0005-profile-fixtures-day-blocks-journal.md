# DYN-3 — Migration `0005`: the profile, fixtures, `day_blocks`, the day-side columns, the journal, per-block notification prefs, the trigger amendment

**Epic:** DYN — Dynamic schedule (UX v1.1) · **Phase 0** · Size: L
**Slice type:** Schema — a one-way door with a trigger change on the record's one immutable column. The risk class is *a rewritten record*: a trigger amendment that lets `original_scheduled_start` change twice, or a `day_blocks` cascade that deletes items a person has touched.
**Vigil:** none. **Mason review:** the whole migration; AC 8–10 (the trigger's exact transitions); AC 11 (cascade semantics).

**Status:** Not started

> **Mason — migration review.** `0005` adds two tables (`fixtures`, `day_blocks`, `journal_entries` — three), sixteen profile columns, eight day-side columns, three enum values, a nullable `block_kind` on `notification_prefs` with a re-keyed unique index, and amends `day_items_original_start_immutable` to permit exactly one `NULL → value` transition (TD-5). Review the trigger function as SQL (AC 8–10 are the transitions), review every `ON DELETE` (AC 11), review that `day_items.day_block_id` is nullable now and only now, and that the setup file matches the migration so a fresh database and a migrated one agree. **Stop before any hosted tier.**

---

## Outcome

The day-side tables can hold v1.1's record. `users` carries the profile v1.1 §11.2 lists — the schedule shape, work days, work start and end, anchor direction, the wake range, lights-out and devices-off, the overflow mode, the orient settings, the journal prompts, the block order. `fixtures` exists. `day_blocks` exists as the load-bearing row per block per day (TD-2), with its own immutable `original_scheduled_start`. `days` knows its shape, its confirmation, today's anchor and its hardness, the focus, the morning's two lines. `day_items` knows its block, its pin, its gap, its alternates, a `fixture` origin, and a `not_confirmed` state. `shifts` knows its kind and what it shortened. `journal_entries` exists. `notification_prefs` can hold an `item_start` preference per block. The immutability trigger permits `NULL → value` once and refuses everything else. `SCHEMA_REFERENCE.md` and the setup SQL are regenerated to match. After this ships, **DYN-4 has every column its services write, and DYN-5's materialiser has `day_blocks` to write into.** Nothing is dropped (DYN-21); no service reads the new columns yet (DYN-4, DYN-5).

## Why / intent

- **v1.1 §11.2** — the `users` additions, column by column, with `data_sources` explicitly *not* added; `wake_anchor_habit_id` **stays as a column and stops being written** (dropped in `0006`).
- **v1.1 §11.6** — `fixtures`; **§11.7** — `days` additions and `day_blocks` in full, "unique on `(day_id, kind, sort_order)`; two work blocks exist when training splits work"; `days.template_id` stops being written (dropped in `0006`); **§11.8** — `day_items` additions and "the change is *when* [`original_scheduled_start`] is written … the trigger allows the null → value transition once and refuses every later write"; **§11.9** — `shifts.kind`, `shortened_item_ids`; **§11.10** — `journal_entries.answers` jsonb keyed by prompt key; **§9.3** — per-block `item_start` toggles.
- **v1.1 R11, R16, R23, R27** and **TD-2, TD-5, TD-7, TD-8, TD-9.**
- **Cross-cutting §8.1** — record integrity per type; `day_blocks` joins the list as annotated-never-rewritten.
- **Ground truth:** `schema/user/users.ts` (the pending pair, `usual_wake_time`, `wake_anchor_habit_id` with its `AnyPgColumn` cycle note — the same annotation will be needed for `days.work_focus_habit_id`); `schema/plan/days.ts`; `schema/day/{day-items,shifts}.ts`; `schema/notification/notification-prefs.ts` (read its unique index before re-keying it); `packages/db/supabase/setup/02_apply_triggers_rls.sql` (the trigger function's current body); `01_init_functions.sql`.
- **DYN-2 (Complete required)** — `block_kind` enum, `templates.kind`, `BlockKind` in the barrel.
- **What this slice is NOT (binding):** no drops; no writes of business data (the only data statements are defaults and the `block_order` backfill from `DEFAULT_BLOCK_ORDER`); no service change beyond compiling; no seed change (DYN-5).

**Rulings this slice makes (labelled, logged):**

- **`day_items.day_block_id` is nullable in `0005` and made `NOT NULL` in `0006`** after DYN-5 has backfilled every existing item into a `morning` block on its day. A migration that adds a `NOT NULL` FK to a populated table needs a backfill that only the materialiser's rules can write correctly; that is DYN-5's job, not SQL's. Logged.
- **`day_blocks.original_scheduled_start` gets the same trigger as `day_items`'** — one function, two triggers (`day_blocks_original_start_immutable`). A block-level ghost (band drag) needs the same promise. Logged.
- **The trigger function is replaced, not patched:** `CREATE OR REPLACE FUNCTION public.original_start_immutable()` with the two-branch body, referenced by both triggers; the migration carries the function and the setup file is updated to the identical text. Logged.
- **`journal_prompts` is backfilled from `DEFAULT_JOURNAL_PROMPTS` for every existing user** as a JSON literal in the migration (the six rows, keys and labels), so no reader has to treat null as "use defaults". New users get it from the column default (the same literal). Logged — and flagged: the literal duplicates `@syn/constants` once, in a migration, which is history; the constant is the living copy.
- **`notification_prefs` unique index becomes `(user_id, kind, block_kind) NULLS NOT DISTINCT`**, so one `item_start` row per block and one row for every other kind with `block_kind NULL`. Logged.
- **`shifts.delta_min` check widens to `BETWEEN 0 AND 600`** — a `refit` holds the anchor and has `delta_min = 0`. Logged.
- **`days.work_focus_habit_id` uses the `AnyPgColumn` annotation** for the same cycle reason `users.wake_anchor_habit_id` documents. Logged.

## Behavior & states

**No surface.** Described by the schema and the trigger's transitions.

### `schema/user/users.ts` — additions (alphabetical, per the conventions)

| Column | Type | Default / check |
|---|---|---|
| `anchorDirection` | `anchorDirectionEnum("anchor_direction")` (user/enums.ts) | nullable |
| `blockOrder` | `jsonb("block_order").$type<BlockKind[]>()` | not null, default the six-kind literal |
| `devicesOffTime` | `time("devices_off_time")` | nullable |
| `earliestWakeTime` | `time("earliest_wake_time")` | nullable |
| `journalEnabled` | `boolean("journal_enabled")` | not null default true |
| `journalPrompts` | `jsonb("journal_prompts").$type<JournalPrompt[]>()` | not null, default the six-prompt literal; backfilled |
| `lightsOutTime` | `time("lights_out_time")` | nullable |
| `orientAskGratitude` | `boolean("orient_ask_gratitude")` | not null default true |
| `orientPassage` | `text("orient_passage")` | nullable, `CHECK length ≤ 2000` |
| `orientShowLastNight` | `boolean("orient_show_last_night")` | not null default true |
| `overflowMode` | `overflowModeEnum("overflow_mode")` | not null default `daily_menu` |
| `scheduleShape` | `scheduleShapeEnum("schedule_shape")` | nullable |
| `workDays` | `jsonb("work_days").$type<WorkDays>()` | nullable |
| `workEndTime` | `time("work_end_time")` | nullable |
| `workStartTime` | `time("work_start_time")` | nullable |
| `wakeAnchorHabitId` | unchanged | header comment: "DEPRECATED since `0005` (v1.1 R11): not written after DYN-13; dropped in `0006`." |

New `schema/user/enums.ts`: `anchor_direction`, `overflow_mode`, `schedule_shape` (one directory each → colocated there; `user/` has two tables so the directory file is right).

### `schema/plan/fixtures.ts` — new (TD-8)

`id`, `createdAt`, `updatedAt`, `archivedAt` · `atTime time not null` · `blockKind blockKindEnum not null default 'activity'` · `durationMin smallint not null CHECK 1–480` · `scheduling schedulingEnum not null default 'hard'` · `title text not null CHECK 1–60` · `weekdays smallint[] not null CHECK <@ 0..6 AND cardinality ≥ 1` · `habitId → habits set null` · `userId → users cascade`. Indexes: `(user_id, archived_at)`, `(user_id)`. Policies: `ownerPrivateCrudPolicies`. Relations: user, habit.

### `schema/plan/day-blocks.ts` — new (TD-2)

`id`, `createdAt`, `updatedAt` · `kind blockKindEnum not null` · `originalScheduledStart timestamptz` (nullable; trigger) · `placement trainingPlacementEnum` (plan/enums.ts) nullable · `scheduledEnd timestamptz` nullable · `scheduledStart timestamptz` nullable · `sortOrder smallint not null default 0` · `state dayBlockStateEnum not null default 'planned'` (plan/enums.ts) · `templateNameSnapshot text` nullable · `dayId → days cascade` · `templateId → templates set null` · `userId → users cascade`. Unique `(day_id, kind, sort_order)`; index `(day_id, sort_order)`, `(user_id)`, `(template_id)`. Policies owner-private. Relations: day, template, user, items (`many(dayItems)`).

### `schema/plan/days.ts` — additions

`anchorIsHard boolean` nullable · `confirmedAt timestamptz` nullable · `intention text` nullable `CHECK ≤ 140` · `morningGratitude text` nullable `CHECK ≤ 280` · `shape dayShapeEnum not null default 'structured'` (plan/enums.ts) · `workFocusHabitId uuid → habits set null` (`AnyPgColumn`) · `workStartTime time` nullable · `wokeAtSource` enum **gains `orient`** (`ALTER TYPE woke_at_source ADD VALUE 'orient'`). `templateId` header: "DEPRECATED since `0005` (TD-1): not written after DYN-5; dropped in `0006`." Index `(user_id, confirmed_at)`.

### `schema/day/day-items.ts` — additions

`alternatesChosen boolean` nullable · `alternatesId uuid` nullable · `dayBlockId uuid → day_blocks cascade` **nullable** (this migration only) · `gapBeforeMin smallint not null default 0 CHECK 0–240` · `pinned boolean not null default false` · `completion_state` **gains `not_confirmed`** · `item_origin` **gains `fixture`**. Index `(day_block_id, sort_order)`, `(alternates_id)`.

### `schema/day/shifts.ts` — additions

`kind shiftKindEnum("kind") not null default 'shift'` (day/enums.ts or colocated — one table → the file) · `shortenedItemIds uuid[]` not null default `'{}'` · `delta_min` check → `BETWEEN 0 AND 600`.

### `schema/day/journal-entries.ts` — new (TD-7)

`id`, `createdAt`, `updatedAt` · `answers jsonb $type<Record<string,string>> not null default '{}'` · `dayId → days cascade` **unique** · `userId → users cascade`. Index `(user_id, created_at)`. Policies owner-private. Relations: day, user.

### `schema/notification/notification-prefs.ts` — change

`blockKind blockKindEnum("block_kind")` nullable; the unique index re-keyed to `(user_id, kind, block_kind) NULLS NOT DISTINCT`; `notification_kind` enum **gains** `block_start`, `fixture_start`, `devices_off`.

### The trigger (TD-5) — in `0005` and in `supabase/setup/02_apply_triggers_rls.sql`

```sql
CREATE OR REPLACE FUNCTION public.original_start_immutable() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF OLD.original_scheduled_start IS NULL THEN
    RETURN NEW;                                   -- the one permitted transition: NULL → value (or NULL → NULL)
  END IF;
  IF NEW.original_scheduled_start IS DISTINCT FROM OLD.original_scheduled_start THEN
    RAISE EXCEPTION 'original_scheduled_start is immutable once set' USING ERRCODE = 'check_violation';
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS day_items_original_start_immutable ON public.day_items;
CREATE TRIGGER day_items_original_start_immutable BEFORE UPDATE ON public.day_items FOR EACH ROW EXECUTE FUNCTION public.original_start_immutable();
CREATE TRIGGER day_blocks_original_start_immutable BEFORE UPDATE ON public.day_blocks FOR EACH ROW EXECUTE FUNCTION public.original_start_immutable();
```

(The existing function's name may differ — read `02_apply_triggers_rls.sql` and keep its name if it is already generic; otherwise create the generic one and point both triggers at it. Record which in `DEVIATIONS.md`.)

**States (exhaustive):** fresh local after `0000…0005` · migrated local from `0004` · setup SQL re-run on a fresh database yields the same function body (AC 12).

**Failure / edge states:** an existing `day_items` row with `original_scheduled_start` set: unchanged, still immutable (AC 9) · an existing row with it null (none should exist in v1.0 — verify; AC 10 creates one by SQL) · a `day_blocks` delete cascading to `day_items` — **only the materialiser deletes blocks, and only untouched ones (DYN-5)**; the cascade is the honest default because an item without a block is not renderable, and DYN-5's rule is what keeps touched items from ever being under a deleted block · `days.work_focus_habit_id` when the focus habit is archived: `set null` on delete only; archive leaves it (the snapshot is the item's title, per cross-cutting §8.3).

## Non-negotiables (this slice)

- **The trigger permits exactly one transition: `NULL → value`.** `value → other value`, `value → NULL` are refused. Both tables.
- **Nothing is dropped.** `wake_anchor_habit_id`, `days.template_id`, every enum value — survive until `0006`.
- **`day_items.day_block_id` is nullable here.** `NOT NULL` is `0006`'s, after DYN-5's backfill.
- **The setup file and the migration carry the same function text.** A fresh database and a migrated one must agree.
- **Every new table is owner-private with the standard policies and its own `user_id`.** No exception, no admin read.
- **Drizzle syntax per `drizzle-orm-conventions.md`; enum spelling via `enumValues<Union>()`.**
- **Local tier only; stop before any hosted tier.**

## Data & AI

**Schema changes: described above** — migration `0005`, journalled; a human applies to hosted tiers.

**Tables:** `users` (alter, backfill `journal_prompts`, `block_order` via default) · `fixtures` (create) · `day_blocks` (create) · `days` (alter) · `day_items` (alter) · `shifts` (alter) · `journal_entries` (create) · `notification_prefs` (alter, re-index) · enums `woke_at_source`, `completion_state`, `item_origin`, `notification_kind` (extend); `anchor_direction`, `overflow_mode`, `schedule_shape`, `day_shape`, `day_block_state`, `training_placement`, `shift_kind` (create).

**Placement:** `packages/db/src/schema/user/{users,enums}.ts`; `schema/plan/{fixtures,day-blocks,days,enums,index}.ts`; `schema/day/{day-items,shifts,journal-entries,index}.ts`; `schema/notification/notification-prefs.ts`; `schema/enums.ts` only if a new enum crosses directories (`training_placement` is plan-only; `shift_kind` day-only; `day_shape`/`day_block_state` plan-only); `migrations/0005_*.sql` + `meta/`; `supabase/setup/02_apply_triggers_rls.sql`; `packages/db/src/index.ts` (row types for the three new tables); `SCHEMA_REFERENCE.md`. Rule 1; Mason's call. `@syn/types` gains nothing (DYN-1 spelled everything; `TrainingPlacement`, `DayBlockState`, `ShiftKind`, `DayShape` exist).

**tRPC / validators:** none — DYN-4.

**AI notes:** **None.**

**Instrumentation:** none.

## Accessibility

**None — no surface in this slice.**

## Acceptance criteria (observable — local tier; fresh and migrated databases; SQL probes for the trigger)

1. `0005_*.sql` applies cleanly after `0004` on a fresh local database and on a database migrated through `0004`; `_journal.json` has `idx: 5`; the snapshot is generated. *(Mason.)*
2. `\d users` shows the sixteen columns with the stated types and defaults; `SELECT journal_prompts FROM users` returns the six-prompt array for every pre-existing user and for a newly inserted one; `block_order` is the six-kind array. *(Mason.)*
3. `\d fixtures`, `\d day_blocks`, `\d journal_entries` match the sections above, including the unique constraints and the `ON DELETE` actions; `\d days`, `\d day_items`, `\d shifts`, `\d notification_prefs` show the additions; the four extended enums list their new values.
4. RLS: as user B, `INSERT INTO fixtures … user_id = A` is refused; `SELECT` on A's `day_blocks` and `journal_entries` returns nothing; `INSERT` with own `user_id` succeeds. *(Mason.)*
5. `notification_prefs`: two rows `(A, item_start, 'morning')` and `(A, item_start, 'prep')` both insert; a third `(A, item_start, 'morning')` is refused; `(A, review_reminder, NULL)` twice is refused (NULLS NOT DISTINCT). *(Mason.)*
6. `shifts`: `delta_min = 0` inserts with `kind = 'refit'`; `−1` is refused; `601` is refused.
7. `days.work_focus_habit_id` references `habits` and the file compiles with the `AnyPgColumn` annotation (no TS7022).
8. **Trigger — permitted.** `INSERT day_items (…, original_scheduled_start NULL)`; `UPDATE … SET original_scheduled_start = '2026-09-14T14:00Z'` succeeds. *(Mason.)*
9. **Trigger — refused.** On that row, `UPDATE … SET original_scheduled_start = '2026-09-14T15:00Z'` raises `check_violation`; `UPDATE … SET original_scheduled_start = NULL` raises; an `UPDATE` of `scheduled_start` alone succeeds. A pre-existing v1.0 row with a value behaves the same. *(Mason.)*
10. **Trigger — `day_blocks`.** The same three probes on a `day_blocks` row. *(Mason.)*
11. **Cascade.** Delete a `day_blocks` row by SQL: its `day_items` rows are gone; delete a `days` row: its blocks, items, and journal entry are gone; delete a habit referenced by `fixtures.habit_id` / `days.work_focus_habit_id`: the references become null and the rows stay. *(Mason.)*
12. Reset a fresh local database with the setup scripts (`yarn db:setup` or the documented local path — **local only**) and compare `pg_get_functiondef('public.original_start_immutable'::regproc)` to the migrated database's: identical.
13. `yarn db:schema-reference` regenerated and committed; every service, router, and mapper compiles unchanged; `yarn build` passes.
14. The closing report states: local only; `0005` not applied to any hosted tier; which trigger-function name was kept.
15. `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` pass (four separate commands).

## Likely-relevant technical notes (ADVISORY — dev decides)

- Four `ALTER TYPE … ADD VALUE` statements each need their own breakpoint; put them first.
- The `journal_prompts` default: `DEFAULT '[{"key":"day_went","label":"How the day went"},…]'::jsonb` — the six from DYN-1's constant, copied once into the migration as history. The `UPDATE users SET journal_prompts = DEFAULT WHERE journal_prompts IS NULL` is unnecessary if the column is added with the default and `NOT NULL` in one statement (Postgres fills it); verify and drop the backfill statement if so.
- `NULLS NOT DISTINCT` needs Postgres 15+; Supabase local is on 15+ — verify with `SELECT version()` and record it.
- Read `notification_prefs`'s current unique index name before dropping it; USE-8's `ON CONFLICT` targets it by columns, not name, but confirm.
- For the `day_items` partial index on `alternates_id`, a plain index is fine — the column is mostly null and Postgres handles that.

## Dev's call

Enum file placement inside the colocation rule where a value is used by exactly one directory · the migration's generated name · whether `day_blocks.items` relation is declared here or when DYN-5 first reads it (declare it here; it is free).

## Out of scope

- **Backfilling existing `day_items` into `day_blocks`** — DYN-5 (the materialiser's rules decide which block an item belongs to; SQL cannot).
- **Making `day_block_id NOT NULL`, dropping `template_id`, `wake_anchor_habit_id`, `offset_*`** — DYN-21 (`0006`).
- **Reading or writing any new column from a service** — DYN-4, DYN-5, DYN-6.
- **The seed** — DYN-5.
- **Applying to a hosted tier** — Taylor.

## Depends on

- **DYN-2** — `block_kind`, `templates.kind`, the migration chain at `0004`. Complete in `PROGRESS.md`.

## Recommended execution

**Opus.** The trigger amendment is the one place this epic could quietly break the product's central promise, and the cascade and unique-index semantics each have a case that passes the happy path and fails a real one (a `NULLS DISTINCT` index lets two review-reminder rows exist; a `set null` where `cascade` belonged orphans items). A cheaper model writes sixteen correct columns and a trigger that permits `NULL → value` *and* `value → value`, because the second branch reads as "changed, so allow".

---

### Kickoff (paste into the session)

> Build **DYN-3 — Migration `0005`** (attached spec). Model: **Opus**. **The trigger permits exactly one transition, `NULL → value`, on both tables; nothing is dropped; `day_block_id` is nullable here; the setup file and the migration carry the same function; local tier only.**
> Attach/read first, in order: this spec · v1.1 §11.2, §11.6–§11.10, §9.3, R11, R16, R23, R27 · this track's `TECHNICAL-DECISIONS.md` TD-2, TD-5, TD-7, TD-8, TD-9 · `docs/architecture/drizzle-orm-conventions.md` · `docs/ai-guides/db-and-rls-authoring.md` · `packages/db/AGENTS.md` · root `AGENTS.md` § Hard guardrails · `packages/db/src/schema/user/users.ts` (the `AnyPgColumn` note), `schema/plan/days.ts`, `schema/day/{day-items,shifts}.ts`, `schema/notification/notification-prefs.ts` · `packages/db/supabase/setup/{01_init_functions,02_apply_triggers_rls}.sql` · `packages/db/migrations/0004_*.sql` (DYN-2's style) · `packages/db/SCHEMA_REFERENCE.md` · `DEVIATIONS.md` + `TECHNICAL-DECISIONS.md` (this track's, Epic 1's, Epic 2's, the infrastructure track's).
> Author `0005`, journal it, apply on fresh and migrated local databases, run the trigger and cascade probes by SQL (AC 8–11), update the setup file to the same function text, regenerate `SCHEMA_REFERENCE.md`, **stop before any hosted tier**. Close in three places. Run `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` as separate commands.
