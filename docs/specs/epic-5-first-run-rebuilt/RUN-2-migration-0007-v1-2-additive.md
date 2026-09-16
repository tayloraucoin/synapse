# RUN-2 — Migration `0007`: the additive columns, `passages`, `quotes`, `day_plans`, `days.work_template_id`, the `passages` bucket, and the `orient_passage` backfill

**Epic:** RUN — The first run rebuilt (UX v1.2) · **Phase 0** · Size: L
**Slice type:** Schema — one additive migration over five live tables plus three new ones and a bucket. The risk class is *irreversibility* (a column shape that the services then depend on; an enum value that cannot be removed) and *a backfill that loses a person's passage*.
**Vigil:** none. **Mason migration review:** required before the SQL is committed — TD-10 (`day_plans` shape), TD-11 (`versions` jsonb, `version_key`), TD-12 (`parent_item_id` cascade), TD-13 (`quotes` under `catalogReadPolicies`), TD-14 (the four `templates` columns), TD-15 (the bucket), TD-19 (`days.work_template_id`).

**Status:** Not started

> **Mason — migration review.** Read the SQL, not the Drizzle. Confirm: every enum `ADD VALUE` is in its own statement outside a transaction block where Postgres requires it (as `0004` did); `day_items.parent_item_id` is `ON DELETE CASCADE` and self-referencing; `passages` and `day_plans` carry `ownerPrivateCrudPolicies`; `quotes` carries `catalogReadPolicies` and no write path; the `orient_passage` backfill inserts one row per non-null passage with `sort_order 0` and does **not** null the source column (`0008` drops it); the `passages` bucket is added to `03_storage_buckets.sql` *and* the migration so a fresh local database agrees with a migrated one; the journal entry's `when` is after `0006`'s. State which scratch database the migration was verified on.

---

## Outcome

One migration, `0007_v1_2_additive.sql`, gives the schema everything v1.2's services and screens read or write, and removes nothing: `users` gains `morning_mode`, `quotes_opt_in`, `orient_ask_intention`, `orient_ask_visualisation`, `journal_reminder_enabled`, `journal_reminder_time`; `days` gains `visualisation` and `work_template_id`; `habits` gains `versions`, `workout_type`, `location`, `travel_there_min`, `travel_back_min`, `plan_travel`; `templates` gains `work_end_time`, `location_kind`, `anchor_direction`, `icon`; `fixtures` gains `kind` and `icon`; `day_items` gains `version_key` and `parent_item_id`, and `item_origin` gains `travel`; `notification_kind` gains `journal_reminder`; three tables are new — `passages` (owner-private), `quotes` (a catalogue), `day_plans` (owner-private) — and a `passages` storage bucket exists with the icons' policies. Every existing `orient_passage` becomes one passage row. `SCHEMA_REFERENCE.md` is regenerated. After this ships, **RUN-3…RUN-6 have columns to write and RUN-7's stories have shapes to render.** The migration is verified on a scratch database and **is not applied to any hosted tier — Taylor runs `0004`–`0007` in order.** The drops are `0008` (RUN-15).

## Why / intent

- **v1.2 §11.1–§11.6** — the columns and tables, as needs; TD-10…TD-15 and TD-19 give them their shape.
- **TD-10** — `day_plans`: `name text`, `icon jsonb null`, `weekdays smallint[] not null`, `work_template_id uuid → templates set null`, `wake_time · work_start_time · work_end_time · lights_out_time · devices_off_time time null`, `prep_template_id · morning_template_id · wind_down_template_id uuid → templates set null`, `training jsonb not null default '[]'`, `breaks jsonb not null default '[]'`, `excluded_fixture_ids uuid[] not null default '{}'`, `sort_order smallint not null default 0`, `state day_plan_state not null default 'draft'`, standard `id/user_id/created_at/updated_at`. Index on `(user_id, sort_order)`.
- **TD-11** — `habits.versions jsonb null` (typed `HabitVersion[]`); `day_items.version_key text null`.
- **TD-12** — `day_items.parent_item_id uuid null references day_items(id) on delete cascade`; index on `parent_item_id`; `item_origin` += `travel`.
- **TD-13** — `quotes`: `id`, `created_at`, `updated_at`, `published_at timestamptz null`, `text text not null` (≤ 400 by check), `attribution text not null` (≤ 120), `source text null`, `tags text[] not null default '{}'`; `catalogReadPolicies("quotes")`; **no `user_id`**. Seeded with zero rows in this migration (the bank is Taylor's to fill by a later data migration or RUN-14).
- **TD-14** — `templates.work_end_time time null`, `location_kind work_day_kind null`, `anchor_direction anchor_direction null` (the enum exists on `users`), `icon jsonb null`.
- **TD-15** — `passages`: standard columns + `archived_at`, `title text null` (≤ 80), `body_md text not null` (≤ 8000), `images jsonb not null default '[]'` (bucket-qualified paths), `tags text[] not null default '{}'`, `sort_order smallint not null default 0`; `ownerPrivateCrudPolicies`; index `(user_id, sort_order)`. The `passages` bucket: private, same size and mime limits as `icons`, owner-segment policies copied from `icons`.
- **TD-19** — `days.work_template_id uuid null → templates set null`.
- **v1.2 §11.1** — `users.morning_mode morning_mode not null default 'set_from_plan'`; `quotes_opt_in boolean not null default false`; `orient_ask_intention`, `orient_ask_visualisation boolean not null default true`; `journal_reminder_enabled boolean not null default true`; `journal_reminder_time time null`; `days.visualisation text null` (≤ 280). `fixtures.kind fixture_kind not null default 'other'`; `fixtures.icon jsonb not null default` the *other* kind's glyph as `IconValue`. `habits.workout_type text null`, `location workout_location null`, `travel_there_min smallint not null default 0`, `travel_back_min smallint not null default 0` (checks 0–180), `plan_travel boolean not null default true`.
- **Backfill** — `INSERT INTO passages (user_id, body_md, sort_order) SELECT id, orient_passage, 0 FROM users WHERE orient_passage IS NOT NULL AND btrim(orient_passage) <> ''`. The source column is left as is; `0008` drops it. The Markdown of a plain textarea is the text itself.
- **Ground truth (consumed):** `0004`–`0006`'s SQL and journal entries (the `ADD VALUE` handling, the policy blocks, the `DO $$` idempotence style); `packages/db/src/schema/{plan,library,day,user}/`; `standard-policies.ts`; `03_storage_buckets.sql`; `drizzle-orm-conventions.md`; `db-and-rls-authoring.md`'s checklist.
- **What this slice is NOT (binding):** any drop (RUN-15); any service (RUN-3…); any seed of quote rows beyond an empty table; any change to the trigger; applying the migration to a hosted tier.

**Rulings this slice makes (labelled, logged):**

- **`quotes` has no `user_id` and no owner** — it is the first table under `catalogReadPolicies`; the factory's comment is left as is until RUN-14 ships (TD-13). Logged.
- **`fixtures.icon` is `not null` with a default** so `ItemIcon` never branches on null for a fixture; the default is the *other* kind's glyph. Logged.
- **`habits.workout_type` is text, not an enum** — the curated list lives in `@syn/constants` and grows without a migration (TD-11's reasoning applied to a label). Logged.
- **The `passages` bucket's policies are the icons' policies verbatim** with the bucket id swapped; the read route's allow-list is RUN-4's. Logged.
- **`days.work_template_id` is written by nothing in this ticket**; RUN-5 (the week build) and RUN-6 (`applyWorkType`) write it. Logged.

## Behaviour & states

**No surface.** The observable state is the schema after `db:migrate` on a scratch database: the columns and tables above exist with their defaults; `SELECT count(*) FROM passages` equals the count of users with a non-blank `orient_passage`; `SELECT * FROM quotes` returns zero rows for an authenticated role and the insert is refused; a `day_items` row with `parent_item_id` disappears when its parent is deleted; `SCHEMA_REFERENCE.md` documents every new column with its purpose line.

**States (exhaustive):** authored · journalled · verified on scratch · **not applied to any tier**. **Failure / edge states:** `0004`–`0006` not yet applied on the scratch database → apply them first, in order, and say so; a user with two non-blank passages cannot occur (one column); a `templates` row of kind `work` with `anchor_time null` → `work_start_time` on the plan falls back to the profile (RUN-5's concern, noted here).

## Non-negotiables (this slice)

- **Additive only.** No drop, no rename, no type change on an existing column.
- **Never edit `0004`–`0006`.**
- **Every new user-scoped table carries `ownerPrivateCrudPolicies`; `quotes` carries `catalogReadPolicies` and nothing writes it from the app.**
- **The backfill never nulls or rewrites `orient_passage`.**
- **A fresh local database and a migrated one agree** — the schema files, the setup SQL and the migration all change together.
- **Stop before `db:migrate` on any hosted tier.**

## Data & AI

**Schema changes: described** (above). Human-review migration; `DEVIATIONS.md` line for any departure.

**Tables:** `users`, `days`, `habits`, `templates`, `fixtures`, `day_items` (alter) · `passages`, `quotes`, `day_plans` (create) · `storage.buckets` / `storage.objects` policies (the `passages` bucket).

**Placement:** `packages/db/migrations/0007_v1_2_additive.sql` + `meta/_journal.json` + snapshot; `packages/db/src/schema/user/users.ts`, `plan/{days,templates,fixtures}.ts`, `library/habits.ts`, `day/day-items.ts`, new `plan/day-plans.ts`, new `library/passages.ts` (or `system/`? — no: a passage is the person's, so `library/`), new `system/quotes.ts` (app content), `plan/enums.ts` / `enums.ts` for the new `pgEnum`s (RUN-1 typed them); `packages/db/supabase/setup/03_storage_buckets.sql`; `packages/db/SCHEMA_REFERENCE.md` (generated); `packages/constants/src/storage-buckets.ts` (`ASSET_BUCKET_BY_KIND.passage`, `READABLE_ASSET_BUCKETS`). Rule 4 (data layer).

**tRPC / validators:** none — no procedure in this slice.

**AI notes:** **None.**

## Accessibility

**None — no surface in this slice.**

## Acceptance criteria (observable — on a scratch database with `0000`–`0006` applied first)

1. `yarn db:migrate` against the scratch tier applies `0007` once; a second run applies nothing; `drizzle.__drizzle_migrations` has the row.
2. Every column and table in *Outcome* exists with the stated type, nullability and default (`\d users`, `\d day_plans`, etc. pasted); `item_origin` and `notification_kind` list the new values; the three new enums exist.
3. A user with `orient_passage = 'a few lines'` has exactly one `passages` row with `body_md = 'a few lines'`, `sort_order 0`; a user with `orient_passage = '   '` has none; `users.orient_passage` is unchanged.
4. Under the authenticated role with `app.user_id` set to user A: `SELECT` on `quotes` returns rows (none yet); `INSERT INTO quotes` is refused; `SELECT` on B's `passages` and `day_plans` returns nothing; A's own rows read and write.
5. Deleting a `day_items` row deletes its `parent_item_id` children; `templates` with `kind = morning` accept null in the four work columns; a `day_plans` row with `weekdays = '{0,1}'` and all FKs null inserts.
6. The `passages` bucket exists on a Supabase-hosted scratch database (or the `03_storage_buckets.sql` block skips with the notice on vanilla Postgres, as `icons` does) with the owner-segment policies; `READABLE_ASSET_BUCKETS` includes it.
7. `yarn db:schema-reference` regenerates `SCHEMA_REFERENCE.md` with a purpose paragraph for `passages`, `quotes`, `day_plans` and a line per new column; `yarn docs:check-links` passes.
8. `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` pass (four separate commands); `yarn db:generate` produces no drift after the hand-authored SQL (or the SQL is generated and hand-reviewed — say which).

## Likely-relevant technical notes (ADVISORY — dev decides)

- `0004` shows how the `ADD VALUE` statements were placed; Postgres refuses `ALTER TYPE … ADD VALUE` inside the same transaction as its use — keep them at the top.
- The `fixtures.icon` default is a jsonb literal; write it once in SQL and once in Drizzle's `.default()`; the `IconValue` shape is `{ "kind": "emoji", "value": "📍" }`.
- `day_plans.training` and `breaks` are `$type<DayPlanTraining[]>()` / `$type<DayPlanBreak[]>()` jsonbs (RUN-1's types); document the JSON shape in the column comment as `day_items.icon` does.
- `quotes` belongs in `schema/system/` beside `feedback-messages.ts` — app content, not a person's.
- The journal entry's `tag` is the filename without `.sql`; `when` strictly greater than `0006`'s.

## Dev's call

The exact SQL layout (generated then edited, or hand-authored) · check-constraint names · whether `day_plans` gets a partial unique index on `(user_id, sort_order)` or only the plain index.

## Out of scope

- **The drops** (`earliest_wake_time`, `orient_passage`, `orient_show_last_night`) — RUN-15, `0008`.
- **Quote rows** — RUN-14 or a later data migration by Taylor.
- **The read route's bucket allow-list and the upload kind** — RUN-4.
- **Any write to the new columns** — RUN-3…RUN-6.

## Depends on

- **RUN-1** — the unions, the `pgEnum` tuples, `HabitVersion`, the plan jsonb types, the limits. Complete in `PROGRESS.md`.

## Recommended execution

**Opus.** One migration over five live tables with a self-referencing cascade, a catalogue policy, a backfill, and a bucket; a cheaper model gets the enum ordering wrong, nulls the source column in the backfill, or gives `quotes` an owner.

---

### Kickoff (paste into the session)

> Build **RUN-2 — Migration `0007`** (attached spec). Model: **Opus**. **Additive only; never edit `0004`–`0006`; `quotes` has no owner and no app write path; the backfill copies and never nulls; stop before any hosted tier.**
> Attach/read first, in order: this spec · v1.2 §11 · `docs/architecture/drizzle-orm-conventions.md` · `docs/ai-guides/db-and-rls-authoring.md` · `packages/db/AGENTS.md` · root `AGENTS.md` · DYN-2 and DYN-3 (the migration shape — reuse, don't fork) · `packages/db/migrations/0004…0006` · `packages/db/src/schema/rls/standard-policies.ts` · `packages/db/supabase/setup/03_storage_buckets.sql` · `packages/db/SCHEMA_REFERENCE.md` · this track's `DEVIATIONS.md` + `TECHNICAL-DECISIONS.md` (TD-10…TD-15, TD-19) · Epic 4's `TECHNICAL-DECISIONS.md` (TD-1…TD-5).
> Author the SQL and the journal entry, verify on a scratch database with `0004`–`0006` applied first, regenerate `SCHEMA_REFERENCE.md`, and stop. Close in three places; log departures in `DEVIATIONS.md`. Run `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` as separate commands.
