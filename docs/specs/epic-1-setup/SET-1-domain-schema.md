# SET-1 — Domain schema: every §3 table in one migration, the seeds, and the runtime constants

**Epic:** SET — Setup (the root of every track) · **Phase 0** · Size: L
**Slice type:** Schema and contract — no UI, no procedure beyond what the seed needs. One-way door: the migration is reviewed by a human and applied once. The risk class is *a column shape every later ticket inherits wrong*.
**Vigil:** none — but **Mason migration review is mandatory** before the SQL is handed over.

**Status:** Not started

> **Mason — migration review.** This slice proposes the complete official-spec §3 schema as thirteen tables and one `ALTER` on `users`. Read the emitted SQL against the column list below before Taylor applies it. Six calls are stated with their reasoning and logged in `TECHNICAL-DECISIONS.md` already: no `week_plans`; no `habits.is_wake_anchor`; no `shifts.cut_item_ids`; denormalised `user_id` everywhere; the pending-pair on `users`; snapshots on `days` and `day_items`. Counter-propose there, not in the ticket.

---

## Outcome

After this ships, the database can hold everything a person will ever record in Synapse: a library of habits with categories, a set of reasons with their tiers, templates and their slots, days and the items on them, timer sessions, misses, shifts, notification preferences, an avatar, an export request. Every table is owner-private and every column named in `SCHEMA_REFERENCE.md` is the column the next twenty-six tickets will type. The dev seed produces a smoke-test account with the starter set and the default reasons so the next ticket can be verified against real rows. **No screen changes.** No procedure beyond `user.me` exists yet; the routers arrive with the tickets that own each domain. Nothing is migrated on staging or production by this ticket — a human does that.

## Why / intent

- **Official spec §3 (v2 data model)** — the field list is the authority; §3.11 forbids a score cache, a streak, a social graph, and a coach table. §0.3 R4: "The schema in §3 is shaped for all of it from day one." That is why this is one migration and not three.
- **Official spec §3.7** — `title` and `icon` are snapshotted on the instance; `original_scheduled_start` never changes after materialisation; off-schedule is derived, never stored.
- **Cross-cutting §8** — records are annotated, never rewritten; the only deletes are a one-off item, a timer session, a category, and the account. The `onDelete` semantics below encode that.
- **Cross-cutting §7.1, §7.3** — a Day is keyed by its calendar date in the person's *stored* zone and runs from `day_close_time` to `day_close_time`; times are shown in the day's zone, never the device's. That is why `days` snapshots both.
- **INF-5 (`SCHEMA_REFERENCE.md` §1, §9)** — `users` is a trigger-written shadow row; `wake_anchor_habit_id` awaits its foreign key here; `notification_prefs` and `avatar` are satellite tables. Consumed, never rebuilt.
- **Ground truth:** `packages/db/src/schema/rls/{helpers,standard-policies}.ts`, `src/rls.ts`, `migrations/0000_*`, `supabase/setup/*.sql`, `scripts/generate-schema-reference.mjs`, `src/seed/index.ts` exist and are the patterns to extend.
- **What this slice is NOT (binding):** no router, no service beyond the seed, no view mapper, no validator. A builder who "just adds the habit router while here" has broken the one-ticket rule and made SET-4's contract before Vesper's screen decisions reached it.

**Rulings this slice makes (labelled, logged):**

- **One migration, `0001`, carrying every table below.** Logged (`TECHNICAL-DECISIONS.md`).
- **`week_plans` is derived.** Logged.
- **The wake anchor has one home: `users.wake_anchor_habit_id`**, which gains `REFERENCES habits(id) ON DELETE SET NULL` here. Logged.
- **Cut items are normalised through `misses.shift_id`.** Logged.
- **Every table carries `user_id` and `ownerPrivateCrudPolicies`.** Logged.
- **`days` snapshots `timezone` and `day_close_time`; `day_items` snapshots `title`, `icon`, `quantity_unit`, `reflection_axes`, `notes_preflight`.** A past day renders as it was lived even after the habit or the settings change (cross-cutting §8.1, §8.3). Logged.
- **`users` gains the pending-pair columns and four scalar settings** (`usual_wake_time`, `week_build_reminder_weekday`, `week_build_reminder_time`, `reminder_prompt_answered_at`). Official §3.1 does not list them; Epic 1 FR-01/ST-08, ST-07 (N6's day-and-time), and §8.3 ("*Not now* is remembered") require a home for each. Logged.
- **`data_exports` and `feedback_messages` are created here, empty, with their policies**, so SET-10 and SYS-3 are code against an existing schema rather than migration tickets. `feedback_messages` is the one non-owner-private table: insert-only for the author, no authenticated read. `[PROVISIONAL — Taylor: confirm that feedback may be read by the builder; the trust line says "Nothing from your list is included", which this table honours by holding only the message, the screen path, and the app version.]` Logged.
- **Reason rows are per user, seeded lazily by the first service that reads them (SET-9), never by trigger.** The dev seed inserts them for the smoke account. The defaults are data in `@syn/constants` (`DEFAULT_REASONS`), which is the one home the seed and the service both read. Logged.
- **Numeric bounds are `CHECK` constraints only where the UX document states a hard bound** (priority 1–7, duration 1–480, weekly target 0–7, delta 5–600, capacity 5–1440); everything else is validated in `@syn/validators`. A check the schema enforces is a check the validator must also state in the person's words. Logged.

## Behavior & states

**No surface.** Described by the schema.

### Enums

Root `packages/db/src/schema/enums.ts` (shared across two or more directories — the colocation rule):

| Enum | Values | Used by |
|---|---|---|
| `item_type` | `habit` · `task_appointment` · `deep_work` | `habits`, `day_items` |
| `time_mode` | `fixed_time` · `window` · `unscheduled` | `template_slots`, `day_items` |
| `scheduling` | `hard` · `soft` | `template_slots`, `day_items` |
| `miss_tier` | `circumstance` · `scoping` · `chose_not_to` | `reasons`, `misses`, `shifts` |
| `category_color_key` | `leaf` · `sky` · `clay` · `rose` · `amber` · `slate` · `plum` · `moss` | `categories` (and the `IconValue.colorKey` jsonb comment) |

Colocated (one table): `assignment_state` (`assigned` · `not_assigned` · `cut_by_shift`), `completion_state` (`upcoming` · `active` · `done` · `missed` · `carried` · `pending_review`), `item_origin` (`template` · `one_off` · `carried` · `calendar_import`) in `day-items.ts`; `miss_resolved_by` (`day_review` · `shift`) in `misses.ts`; `timer_session_source` (`timer` · `manual`) in `timer-sessions.ts`; `day_close_reason` (`manual` · `auto`) and `woke_at_source` (`anchor` · `manual`) in `days.ts`; `notification_kind` (`item_start` · `window_open` · `window_closing` · `review_reminder` · `pending_review` · `week_build` · `week_ready` · `timer_running` · `calendar_item`) in `notification-prefs.ts`; `export_status` (`preparing` · `ready` · `expired` · `failed`) in `data-exports.ts`.

**Spelling is `@syn/types`' schema unions, exactly** (`packages/types/src/domain/domain.ts`). `notification_kind` and `export_status` have no union there yet; add `NotificationKind` and `ExportStatus` to `domain.ts` and the barrel in this ticket, below the existing divider, with the same comment style.

### Tables

Column order per `drizzle-orm-conventions.md` §4: `id`, `createdAt`, `updatedAt`, then non-FK columns alphabetical by TS key, then FK columns alphabetical. Every table below has `id uuid defaultRandom PK`, `created_at`, `updated_at` unless stated. Every table has `user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE` (the shadow row cascades from `auth.users`, so account deletion removes everything — INF-5), an index on `user_id`, and `...ownerPrivateCrudPolicies({ prefix, ownerColumn: sql\`${table.userId}\` })`.

**`library/categories.ts` — `categories`**

| Column | Type | Notes |
|---|---|---|
| `color_key` | `category_color_key` NOT NULL | official §3.2, §9.3 |
| `name` | text NOT NULL | 1–24 (Epic 1 §9); `UNIQUE (user_id, name)` |

**`library/habits.ts` — `habits`**

| Column | Type | Notes |
|---|---|---|
| `archived_at` | timestamptz null | never hard-deleted (§3.3) |
| `default_notes_preflight` | text null | ≤ 280 |
| `duration_max_min` | smallint null | 1–480 `CHECK`; required for `habit`/`deep_work` — enforced by the validator, not the schema, because a `task_appointment` may omit it |
| `duration_min_min` | smallint null | as above; `CHECK (duration_min_min <= duration_max_min)` when both present |
| `icon` | jsonb NOT NULL | `IconValue` — `{ kind: "emoji", value }` · `{ kind: "curated", value, colorKey: category_color_key \| null }` · `{ kind: "image", value: storagePath }`; default the curated neutral dot `{ kind: "curated", value: "dot", colorKey: null }` (LB-02) |
| `life_priority` | smallint NOT NULL | 1–7 `CHECK` (7 highest, R7) |
| `quantity_unit` | text null | ≤ 16 |
| `reflection_axes` | jsonb NOT NULL default `'[]'` | `string[]`, ≤ 2 labels of ≤ 24 |
| `title` | text NOT NULL | 1–60 |
| `type` | `item_type` NOT NULL | |
| `category_id` | uuid null → `categories(id)` ON DELETE SET NULL | CT-01 delete unassigns |

Indexes: `(user_id, archived_at)`, `(category_id)`.

**`library/reasons.ts` — `reasons`**

| Column | Type | Notes |
|---|---|---|
| `archived_at` | timestamptz null | ST-06 archive |
| `built_in` | boolean NOT NULL default false | the `default` mark in ST-06 |
| `key` | text NOT NULL | `UNIQUE (user_id, key)`; built-ins use official §3.10's keys; user reasons get a slug of the label with a suffix on collision |
| `label` | text NOT NULL | 1–40 |
| `sort_order` | smallint NOT NULL | |
| `structural` | boolean NOT NULL default false | `chose_not_to` and `other`: tier locked, never archivable (ST-06) |
| `tier` | `miss_tier` NOT NULL | |

**`plan/templates.ts` — `templates`**

| Column | Type | Notes |
|---|---|---|
| `anchor_time` | time NOT NULL default `07:00` | §3.4 |
| `archived_at` | timestamptz null | |
| `name` | text NOT NULL | 1–40 |
| `typical_days` | smallint[] null | Mon = 0 … Sun = 6, matching `TemplateSummaryView.typicalDays` |
| `weekly_target` | smallint null | 1–7 `CHECK`; TP-02's *none* is null, never 0 |

Index: `(user_id, archived_at)`.

**`plan/template-slots.ts` — `template_slots`**

| Column | Type | Notes |
|---|---|---|
| `duration_min` | smallint NOT NULL | 1–480 |
| `multitask_group` | text null | a local id within the template (§3.5); two slots sharing `offset_start_min` must share it — enforced by the service (SET-5), because a partial unique index cannot express "unless grouped" |
| `offset_end_min` | integer null | windows only |
| `offset_start_min` | integer null | null when `unscheduled`; `CHECK (offset_start_min >= -120)` (TP-02 rule) |
| `priority_override` | smallint null | 1–7 |
| `scheduling` | `scheduling` NOT NULL | |
| `sort_order` | smallint NOT NULL | order within a shared start; otherwise time order |
| `time_mode` | `time_mode` NOT NULL | |
| `habit_id` | uuid NOT NULL → `habits(id)` ON DELETE CASCADE | habits never hard-delete; archive removes slots by service (LB-01) |
| `template_id` | uuid NOT NULL → `templates(id)` ON DELETE CASCADE | |

Index: `(template_id, sort_order)`.

**`plan/days.ts` — `days`**

| Column | Type | Notes |
|---|---|---|
| `anchor_time` | time NOT NULL | the applied start (§3.6) |
| `capacity_min` | smallint null | 5–1440; set only by a trim (§3.6) |
| `close_reason` | `day_close_reason` null | |
| `closed_at` | timestamptz null | |
| `date` | date NOT NULL | the day key; `UNIQUE (user_id, date)` |
| `day_close_time` | time NOT NULL | snapshot of the rule this day was created under |
| `review_edited_at` | timestamptz null | cross-cutting §8.1 |
| `reviewed_at` | timestamptz null | set by *Finish review* |
| `timezone` | text NOT NULL | snapshot of `users.timezone` at creation |
| `woke_at` | timestamptz null | R5 |
| `woke_at_source` | `woke_at_source` null | DH-02 |
| `template_id` | uuid null → `templates(id)` ON DELETE SET NULL | "a day with no template is an empty day" |

Indexes: `(user_id, date)` unique, `(user_id, closed_at)`.

**`day/day-items.ts` — `day_items`**

| Column | Type | Notes |
|---|---|---|
| `assignment_state` | `assignment_state` NOT NULL default `assigned` | |
| `calendar_event_id` | text null | Phase-2 seam; nothing writes it |
| `completion_state` | `completion_state` NOT NULL default `upcoming` | |
| `deferred_at` | timestamptz null | IT-01 *Not today*; per-day, cleared by done or undo |
| `done_at` | timestamptz null | |
| `duration_min` | smallint null | |
| `icon` | jsonb NOT NULL | snapshot |
| `multitask_id` | uuid null | one id per group per day; assigned at materialisation |
| `notes_preflight` | text null | snapshot |
| `notes_reflection` | text null | ≤ 500 (IT-01) |
| `origin` | `item_origin` NOT NULL | |
| `original_scheduled_start` | timestamptz null | never updated after insert — enforce with a trigger in `supabase/setup/02_apply_triggers_rls.sql` that raises on change `[Mason call: a trigger, because "never changes" is a promise the record makes, not the service]` |
| `priority` | smallint NOT NULL | resolved (§6.6), 1–7 |
| `quantity_unit` | text null | snapshot |
| `quantity_value` | numeric(10,2) null | |
| `reflection_axes` | jsonb NOT NULL default `'[]'` | snapshot |
| `reflection_ratings` | jsonb NOT NULL default `'{}'` | `Record<axis, 1–7>` |
| `scheduled_end` | timestamptz null | |
| `scheduled_start` | timestamptz null | recomputed on shift and late start |
| `scheduling` | `scheduling` NOT NULL | |
| `sort_order` | smallint NOT NULL default 0 | tie-break inside a minute |
| `time_mode` | `time_mode` NOT NULL | |
| `title` | text NOT NULL | snapshot |
| `type` | `item_type` NOT NULL | snapshot of the habit's type; `task_appointment` for a bare title |
| `carried_from_item_id` | uuid null → `day_items(id)` ON DELETE SET NULL | `origin = carried` |
| `day_id` | uuid NOT NULL → `days(id)` ON DELETE CASCADE | |
| `habit_id` | uuid null → `habits(id)` ON DELETE SET NULL | null for *Just a title* |
| `template_slot_id` | uuid null → `template_slots(id)` ON DELETE SET NULL | what TP-04 re-materialisation matches on |

Indexes: `(day_id, scheduled_start)`, `(user_id, completion_state)`, `(habit_id)`.

**`day/timer-sessions.ts` — `timer_sessions`**

| Column | Type | Notes |
|---|---|---|
| `ended_at` | timestamptz null | null while running |
| `source` | `timer_session_source` NOT NULL | |
| `started_at` | timestamptz NOT NULL | |
| `day_item_id` | uuid NOT NULL → `day_items(id)` ON DELETE CASCADE | |

Index: `(day_item_id, started_at)`. `CHECK (ended_at IS NULL OR ended_at > started_at)`.

**`day/misses.ts` — `misses`**

| Column | Type | Notes |
|---|---|---|
| `note` | text null | ≤ 280 (DR-03) |
| `reason_key` | text null | a `reasons.key`; text, not FK, so a later-archived reason keeps its record (cross-cutting §8.1) |
| `reason_text` | text null | ≤ 80, *Other* |
| `resolved_by` | `miss_resolved_by` NOT NULL | |
| `tier` | `miss_tier` NOT NULL | |
| `day_item_id` | uuid NOT NULL UNIQUE → `day_items(id)` ON DELETE CASCADE | one miss per item; a change updates the row |
| `shift_id` | uuid null → `shifts(id)` ON DELETE SET NULL | set when inherited; kept when later changed in the Day Review, so DR-05's *Changed from the shift's reason* is `shift_id IS NOT NULL AND resolved_by = 'day_review'` |
| `traded_up_item_id` | uuid null → `day_items(id)` ON DELETE SET NULL | R2 |

**`day/shifts.ts` — `shifts`**

| Column | Type | Notes |
|---|---|---|
| `at` | timestamptz NOT NULL | |
| `delta_min` | smallint NOT NULL | 5–600 `CHECK` |
| `reason_key` | text null | |
| `reason_text` | text null | ≤ 80 |
| `tier` | `miss_tier` NOT NULL | |
| `day_id` | uuid NOT NULL → `days(id)` ON DELETE CASCADE | |

Index: `(day_id, at)`.

**`notification/notification-prefs.ts` — `notification_prefs`**

| Column | Type | Notes |
|---|---|---|
| `enabled` | boolean NOT NULL | |
| `kind` | `notification_kind` NOT NULL | `UNIQUE (user_id, kind)`; a missing row means the catalogue default |

**`user/user-avatars.ts` — `user_avatars`** — `user_id` is the primary key (one per person; no `id`):

| Column | Type | Notes |
|---|---|---|
| `byte_size` | integer NOT NULL | |
| `content_type` | text NOT NULL | jpeg/png/webp |
| `storage_path` | text NOT NULL | `avatars/{user_id}/{uuid}.jpg` |

**`system/data-exports.ts` — `data_exports`**

| Column | Type | Notes |
|---|---|---|
| `byte_size` | integer null | |
| `error` | text null | never shown; ST-10 shows its own sentence |
| `expires_at` | timestamptz null | 24 h after ready |
| `status` | `export_status` NOT NULL default `preparing` | |
| `storage_path` | text null | `exports/{user_id}/{id}.zip` |

**`system/feedback-messages.ts` — `feedback_messages`** — the one non-owner-private table (SY-01):

| Column | Type | Notes |
|---|---|---|
| `app_version` | text null | included only when the switch is on |
| `message` | text NOT NULL | 1–1000 |
| `screen_path` | text null | as above |
| `user_id` | uuid null → `users(id)` ON DELETE SET NULL | the author; kept nullable so a deleted account's message survives as anonymous |

Policies, inline (no factory fits and none is added): `insert` for `authenticatedRole` with `withCheck: isOwner(user_id)`; `select`, `update`, `delete` for `authenticatedRole` `denyAuthenticated`. The service role reads through the dashboard or a system path.

**`users` — `ALTER`** (edit `user/users.ts`; drizzle-kit emits the diff):

| Column | Type | Notes |
|---|---|---|
| `wake_anchor_habit_id` | gains `REFERENCES habits(id) ON DELETE SET NULL` | INF-5's promise |
| `usual_wake_time` | time NOT NULL default `07:00` | FR-01, ST-08 |
| `week_build_reminder_weekday` | smallint NOT NULL default 6 | Mon = 0; N6 default Sunday |
| `week_build_reminder_time` | time NOT NULL default `18:00` | N6 |
| `reminder_prompt_answered_at` | timestamptz null | official §8.3, Epic 1 §8.7 |
| `pending_timezone` | text null | pending-pair |
| `pending_timezone_from` | date null | |
| `pending_day_close_time` | time null | |
| `pending_day_close_time_from` | date null | |

`usersRelations` gains `many(habits)`, `many(categories)`, `many(reasons)`, `many(templates)`, `many(days)`, `one(userAvatars)`.

### Triggers and setup SQL

- `set_updated_at` is attached to every new table by the existing data-driven loop in `supabase/setup/02_apply_triggers_rls.sql`; verify it picks them up.
- New in that file: `day_items_original_start_immutable` — `BEFORE UPDATE` raising `original_scheduled_start is immutable` when `OLD.original_scheduled_start IS NOT NULL AND NEW.original_scheduled_start IS DISTINCT FROM OLD.original_scheduled_start`.
- RLS is enabled on every `public` table by the existing loop; policies come from the migration.

### Seeds and constants

`@syn/constants` gains, each in its own file and exported from the barrel:

- `starter-habits.ts` — `STARTER_HABITS`: the ten rows of Epic 1 FR-02 verbatim (title · rangeMin · rangeMax · importance · `wakeAnchor` on the first), type `habit`, no category. The *labels* are product copy the person sees in a chooser; they are data (the person confirms them by saving), which is why they may live here — note this in the file.
- `default-reasons.ts` — `DEFAULT_REASONS`: official §3.10's seven rows (key, label, tier, `structural` for `chose_not_to` and `other`, `sortOrder`).
- `notification-catalogue.ts` — `NOTIFICATION_CATALOGUE`: the nine kinds with `defaultEnabled` and `phase` (1 or 2) from official §8.2. No copy (titles and bodies are USE-8's, in its payload builder).
- `limits.ts` gains `TEMPLATE_OFFSET_MIN = -120`, `REASON_TEXT_MAX = 80`, `MISS_NOTE_MAX = 280`, `FEEDBACK_MESSAGE_MAX = 1000`, `WEEKLY_TARGET_MIN = 1`. (`OTHER_REASON_MAX` already exists at 80 — reuse it instead of `REASON_TEXT_MAX`; delete this line's duplicate if so.)

`packages/db/src/seed/`: `seed-library.ts` (`seedStarterLibrary(db, userId)` — the ten habits, two categories *Health* (leaf) and *Deep work* (sky) with the first four habits in *Health*), `seed-reasons.ts` (`seedDefaultReasons(db, userId)` — idempotent `ON CONFLICT (user_id, key) DO NOTHING`), `seed-template.ts` (one template *Morning* at 07:00 with the first five starter habits as fixed slots stacked from offset 0, durations at the range midpoint), wired into `index.ts` for the `db:seed-users` smoke account. The seed uses the singleton `db` (it is a system path) and is the **only** place the starter library is written as rows — the app creates them through SET-4's procedure.

## Non-negotiables (this slice)

- **Owner-private on every table but `feedback_messages`.** No admin read, no factory that would make one.
- **`user_id` on every table, cascading from `users`.** Account deletion removes everything by cascade alone.
- **Enum spelling is `@syn/types`'.** A value the DB stores and a value a component chooses must be the same string.
- **`0000` stays hand-guarded.** Regenerating must not reintroduce the unguarded `auth` schema form (`packages/db/AGENTS.md`).
- **Journal entry, or the migration is a no-op.** `meta/_journal.json` gets `0001`'s tag with `when` greater than `0000`'s.
- **Never `db:migrate` a hosted tier.** Verify on `synapse_inf5` (or a fresh local database); stop; hand the SQL to Taylor.

## Data & AI

**Schema changes: described above** — thirteen new tables, one `ALTER`, five root enums, nine colocated enums, one trigger. **Human-review migration.** Log any column that shipped differently in `DEVIATIONS.md`.

**Tables:** all of the above (create). `users` (alter). `web_push_subscriptions` (untouched).

**Placement:** `packages/db/src/schema/{library,plan,day,notification,system,user}/` per `../README.md` § Placement rule 1; domain `index.ts` barrels and `schema/index.ts` re-exports in dependency order (`enums` → `user` → `library` → `plan` → `day` → `notification` → `system`); row types in `packages/db/src/index.ts` per rule 2 (`Category`, `NewCategory`, `Habit`, …, one pair per table). Constants per rule 8. Seeds under `packages/db/src/seed/`.

**tRPC / validators:** none — no procedure, no read, no write in this slice. (The validators for each domain arrive with the ticket that owns its screen, so the error copy is written next to the field that shows it.)

**AI notes:** **None.**

## Accessibility

**None — no surface in this slice.**

## Acceptance criteria (observable — against a local Postgres 15 with the `authenticated` / `service_role` roles from `SETUP.md` §4)

1. `yarn db:generate` emits `migrations/0001_<name>.sql` creating exactly the thirteen tables, the fourteen enums, the `users` alter, the indexes, and every `pgPolicy` above; `meta/_journal.json` has its entry with a `when` greater than `0000`'s; `0000` still carries its hand guard (diff against `git show HEAD:packages/db/migrations/0000_brave_quicksilver.sql` is empty). *(Mason.)*
2. Applying `0001` then `db:setup` on a fresh local database succeeds; `SELECT relrowsecurity FROM pg_class WHERE relname IN (…all thirteen…)` is `true` for every one; `set_updated_at` exists on every one; `day_items_original_start_immutable` exists.
3. As user A (through `createRlsClient(A)`): insert a category, a habit in it, a reason, a template, a slot, a day, a day item, a timer session, a shift, a miss, a notification pref, an avatar row, an export row. Every insert succeeds. As user B: `SELECT` on each table returns zero rows; `UPDATE` of A's habit affects zero rows; an insert with `user_id = A` is rejected by the `withCheck`.
4. `feedback_messages`: as A, insert succeeds with `user_id = A`; insert with `user_id = B` is rejected; `SELECT` as A returns zero rows; the singleton `db` (owner) reads the row.
5. `UPDATE day_items SET original_scheduled_start = now()` on a row whose value is set raises `original_scheduled_start is immutable`; setting it on a row where it is null succeeds.
6. Deleting the `auth.users` stub row for A removes A's rows from every table in one cascade (count each table before and after); B's rows are untouched.
7. `yarn db:schema-reference` regenerates `SCHEMA_REFERENCE.md` with every table under its group, and §1 no longer says "2 tables"; the generator's `GROUPS` table names the six domains.
8. `yarn db:seed-users` then `yarn db:seed` gives the smoke account ten habits, two categories, seven reasons (with `structural = true` on exactly `chose_not_to` and `other`), and one template with five slots; running `db:seed` again changes no row counts (idempotent).
9. `packages/types/src/domain/domain.ts` exports `NotificationKind` and `ExportStatus`; `packages/db/src/index.ts` exports a row-type pair per new table; `@syn/constants` exports `STARTER_HABITS`, `DEFAULT_REASONS`, `NOTIFICATION_CATALOGUE`.
10. `git status` shows no change under `packages/db/migrations/0000_*` and the deny rule in `.claude/settings.json` is untouched.
11. `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` pass (four separate commands).

## Likely-relevant technical notes (ADVISORY — dev decides)

- `drizzle-kit generate` needs an interactive terminal for the `users` column additions; if it prompts about renames, there are none — every change is an add.
- `smallint[]` for `typical_days`: `smallint("typical_days").array()`; jsonb columns get the shape comment the conventions §3c require.
- The `CHECK` constraints go in the array-return third argument with `check()` from `drizzle-orm/pg-core`; name them `<table>_<column>_check`.
- `misses.shift_id → shifts` and `shifts.day_id → days` create an import order `days → shifts → misses`; `day_items ← misses.day_item_id` and `misses.traded_up_item_id → day_items` are fine in one file with two `references`.
- The seed's template slots: offsets 0, 2, 10, 30, 60 with the midpoint durations of the first five starter habits, all `fixed_time`, `soft`, except the wake-up habit which is `hard` (it is the anchor).
- `original_scheduled_start` immutability as a trigger rather than an application rule is the same reasoning INF-5 used for `handle_new_user`: the database guarantees what the app must never do.

## Dev's call

The migration's filename slug · whether `reflection_ratings` is `jsonb` or two columns per axis (recommend `jsonb`, axes are ≤ 2 and the axis set is a snapshot) · the exact index set beyond those named · whether `typical_days` gets a `CHECK` on element range (recommend yes, `0..6`) · the seed's category assignment beyond the two named.

## Out of scope

- **Any router, service, view mapper, or validator** — SET-4 onward, per domain.
- **Storage object policies** for the three buckets — SET-3, the first ticket that uploads.
- **The materialiser** (slots → items) — SET-6.
- **Lazy per-user reason seeding in the app** — SET-9's service.
- **Applying the migration to staging or production** — Taylor, after review.
- **A `weeks` table** — not needed; derived. Revisit trigger logged.

## Depends on

- **No slice dependencies.** INF-5 (`@syn/db`) and INF-2 (`@syn/types`, `@syn/constants`) are Complete in `../infrastructure/PROGRESS.md`.

## Recommended execution

**Opus.** The value is entirely in the column shapes and their `onDelete` semantics, which every later ticket inherits and which a migration cannot cheaply take back. A cheaper model emits a plausible schema with `cascade` where `set null` was needed, and the first account deletion or category delete does the wrong thing silently.

---

### Kickoff (paste into the session)

> Build **SET-1 — Domain schema: every §3 table in one migration, the seeds, and the runtime constants** (attached spec). Model: **Opus**. **Every table owner-private with its own `user_id`; snapshots on days and items; one migration, journalled, verified locally, never applied to a hosted tier by you.**
> Attach/read first, in order: this spec · official spec §3 (whole), §8.2 (the catalogue), §9.3 (the hues) · Epic 1 FR-02 (the starter set) · cross-cutting §7.1, §7.3, §8 · `packages/db/AGENTS.md` · `docs/architecture/drizzle-orm-conventions.md` · `docs/ai-guides/db-and-rls-authoring.md` · `packages/db/SCHEMA_REFERENCE.md` (as it is now) · `packages/db/src/schema/user/users.ts` and `notification/web-push-subscriptions.ts` (the patterns) · `packages/types/src/domain/domain.ts` · `docs/specs/README.md` § Placement rules · this track's `DEVIATIONS.md` + `TECHNICAL-DECISIONS.md` · `docs/specs/infrastructure/DEVIATIONS.md` (INF-5 lines).
> Keep every enum spelling identical to `@syn/types`. Add nothing the column list does not name without a `DEVIATIONS.md` line. Regenerate `SCHEMA_REFERENCE.md`. Stop before any hosted migrate and hand the SQL over. Close in three places. Run `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` as separate commands.
