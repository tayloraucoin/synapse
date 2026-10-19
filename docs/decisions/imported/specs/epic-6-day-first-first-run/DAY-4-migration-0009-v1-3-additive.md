# DAY-4 — Migration `0009_v1_3_additive`: `block_kind += transition`, `link_kind`, `links`, `fixtures` place and travel, `day_plans` two template FKs, `users.same_morning_routine`

**Epic:** DAY — The first run built day-first (UX v1.3) · **Phase 1** · Size: M
**Slice type:** Schema — one additive migration over three live tables plus one new table and one new enum. The risk class is *irreversibility* (an enum value that cannot be removed; a column shape the services then depend on) and *a migration applied where it must not be*.
**Vigil:** none. **Mason migration review:** required before the SQL is committed — TD-25 (`transition`), TD-26 (`activity_template_id`), TD-27 (the four `fixtures` columns), TD-28 (`links`, `link_kind`), TD-30 (the numbering).

**Status:** Complete (2026-09-25)

> **Mason — migration review.** Read the SQL, not the Drizzle. Confirm: `ALTER TYPE block_kind ADD VALUE 'transition'` is in its own statement outside a transaction block as `0004` and `0007` did; `link_kind` is created before `links` references it; `links` carries `ownerPrivateCrudPolicies` and its `user_id` index; the four `fixtures` columns have their checks (`travel_*` 0–180, `location` ≤ 80) and defaults; the two `day_plans` FKs are `ON DELETE SET NULL` with indexes; `users.same_morning_routine` is nullable with no default; nothing is dropped; the journal entry's `when` is after `0008`'s; `SCHEMA_REFERENCE.md` is regenerated with `links.ts` registered in the generator's `GROUPS`; `migrations.md` gains the Epic 6 run note. State which scratch database the migration was verified on.

---

## Outcome

One migration, `0009_v1_3_additive.sql`, gives the schema everything v1.3's services and screens read or write, and removes nothing: `block_kind` gains `transition`; a `link_kind` enum and a `links` table exist (owner-private); `fixtures` gains `location`, `travel_there_min`, `travel_back_min`, `plan_travel`; `day_plans` gains `after_work_template_id` and `activity_template_id`; `users` gains `same_morning_routine`. `SCHEMA_REFERENCE.md` is regenerated. After this ships, **DAY-5 and DAY-6 have columns to write.** The migration is verified on a scratch database and **is not applied to any hosted tier — Taylor runs `0004`–`0009` in order.** The drops are `0010` (DAY-13).

## Why / intent

- **v1.3 §11.1** — `users.same_morning_routine boolean null` (R61).
- **v1.3 §11.2, TD-25, TD-26** — `day_plans.after_work_template_id uuid null → templates(id) on delete set null`; `day_plans.activity_template_id uuid null → templates(id) on delete set null`; indexes on both.
- **v1.3 §11.3, TD-27** — `fixtures.location text null` (check `length ≤ 80`), `travel_there_min smallint not null default 0`, `travel_back_min smallint not null default 0` (checks 0–180, the same as `habits`'), `plan_travel boolean not null default true`.
- **v1.3 §11.4, TD-28** — `link_kind` enum (`spotify · other`); `links`: standard `id`, `user_id → users(id) on delete cascade`, `created_at`, `updated_at`, `archived_at timestamptz null`, `title text not null` (check 1–80), `url text not null` (check ≤ 2048), `kind link_kind not null default 'other'`, `sort_order smallint not null default 0`; index `(user_id, sort_order)`, `(user_id, archived_at)`; `ownerPrivateCrudPolicies`.
- **v1.3 §11.5, TD-25** — `ALTER TYPE block_kind ADD VALUE 'transition'`; `templates`, `habits`, `fixtures`, `day_blocks`, `notification_prefs` gain nothing else.
- **TD-30** — this is `0009`; RUN-15's drops move to `0010` (DAY-13); Epic 5's `DEVIATIONS.md` carries the renumbering line (written by the authoring, not this ticket).
- **Ground truth (consumed):** `0007_v1_2_additive.sql` and `0008_day_anchors_and_exclusions.sql` (the `ADD VALUE` handling, the policy blocks, the idempotence style); `packages/db/src/schema/{plan/fixtures.ts, plan/day-plans.ts, user/users.ts, library/passages.ts (the shape `links.ts` mirrors), enums.ts (DAY-3's `linkKindEnum`)}`; `standard-policies.ts`; `drizzle-orm-conventions.md`; `db-and-rls-authoring.md`'s checklist; `scripts/generate-schema-reference.mjs`'s `GROUPS`.
- **What this slice is NOT (binding):** any drop (DAY-13); any service (DAY-5, DAY-6); any seed row; applying the migration to a hosted tier; a `passages`-style bucket (links carry no file).

**Rulings this slice makes (labelled, logged):**

- **`links` sits in `packages/db/src/schema/library/links.ts`** beside `passages.ts` — both are the person's reading-and-opening material for the orient frame; the `library` domain is where owner-private content lists live. Logged.
- **`links.kind` has a default of `other`** so a row inserted without the derived kind is still valid; the service always writes the derived value (DAY-5). Logged.
- **No unique constraint on `links.url`** — a person may save the same playlist twice under two names; the list is theirs. Logged.
- **`fixtures.location` is nullable with no default** — *Here* is null; *Away* with no place typed is also null (the travel columns say *away*). Logged.

## Behaviour & states

**No surface.** The observable state is the schema after `db:migrate` on a scratch database: the enum value exists (`SELECT unnest(enum_range(NULL::block_kind))` lists nine); `links` exists with its policies (an authenticated role reads only its own rows; an insert with another `user_id` is refused); the fixture and plan columns exist with their defaults; `SCHEMA_REFERENCE.md` documents every new column with its purpose line.

**States (exhaustive):** authored · journalled · verified on scratch · **not applied to any tier**. **Failure / edge states:** `0004`–`0008` not yet applied on the scratch database → apply them first, in order, and say so; the `ADD VALUE` inside a transaction → Postgres refuses; split it as the earlier migrations did.

## Non-negotiables (this slice)

- **Additive only.** No drop, no rename, no type change on an existing column.
- **Never edit `0004`–`0008`.**
- **`links` carries `ownerPrivateCrudPolicies`; every user-scoped column is `user_id`-scoped.**
- **The `ADD VALUE` is its own statement outside a transaction.**
- **Stop before `db:migrate` on any hosted tier.**

## Data & AI

**Schema changes: described** — one enum value, one new enum, one new table, seven columns.

**Tables:** `links` (new) · `fixtures` (four columns) · `day_plans` (two FKs) · `users` (one column) · `templates`, `habits`, `day_blocks`, `notification_prefs` (the enum widens under them; no column).

**Placement:** `packages/db/src/schema/library/links.ts` (new) + `library/index.ts`; `packages/db/src/schema/plan/{fixtures.ts, day-plans.ts}`; `packages/db/src/schema/user/users.ts`; `packages/db/src/schema/enums.ts` (DAY-3's `linkKindEnum`; the `blockKindEnum` tuple already has `transition`); `packages/db/src/index.ts` (row types `Link`, `NewLink`); `packages/db/migrations/0009_v1_3_additive.sql` + `meta/0009_snapshot.json` + `meta/_journal.json`; `packages/db/SCHEMA_REFERENCE.md` (regenerated) + `scripts/generate-schema-reference.mjs` (`GROUPS` += `links.ts`); `docs/developer-guides/migrations.md` (the Epic 6 note). Rules 1, 2.

**tRPC / validators:** none.

**AI notes:** **None.**

## Accessibility

**None — no surface in this slice.**

## Acceptance criteria (observable — a scratch local database with `0004`–`0008` applied first)

1. `yarn db:generate` (or the hand-authored SQL with a journal entry) produces `0009_v1_3_additive.sql`; the journal's idx 9 has a `when` after idx 8's. *(Mason.)*
2. After `db:migrate` on the scratch database: `SELECT unnest(enum_range(NULL::block_kind))` returns nine values including `transition`; `SELECT unnest(enum_range(NULL::link_kind))` returns `spotify`, `other`.
3. `\d links` shows the columns, checks, indexes and the three policies; as an authenticated user A, `INSERT INTO links (user_id, title, url) VALUES (<B>, …)` is refused and a select returns only A's rows.
4. `\d fixtures` shows `location`, `travel_there_min`, `travel_back_min`, `plan_travel` with their defaults and checks; an existing fixture row reads `0, 0, true, null`.
5. `\d day_plans` shows the two FKs with `ON DELETE SET NULL` and their indexes; archiving a referenced template (soft) leaves the FK; deleting the row (a scratch-only test) nulls it.
6. `users.same_morning_routine` is nullable and null on every existing row.
7. `SCHEMA_REFERENCE.md` documents `links` and the seven columns with purpose lines; `yarn db:schema-reference` is idempotent (a second run changes nothing).
8. No hosted tier was touched — the report says so in one line.
9. `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` pass (four separate commands).

## Likely-relevant technical notes (ADVISORY — dev decides)

- `drizzle-kit generate` writes the `ADD VALUE` inside the migration's statement list; check `0007` for how the breakpoint (`--> statement-breakpoint`) keeps it outside a transaction and mirror it.
- The `links.ts` file's header comment is the SCHEMA_REFERENCE purpose line — write it to say what a link is (TD-28), that the kind is derived, and that nothing fetches.
- `migrations.md`'s Epic 5 note says `0007` follows `0004`–`0006`; add the Epic 6 note in the same shape.

## Dev's call

Generated then hand-amended, or hand-authored (both are precedented — say which) · the index names.

## Out of scope

- **The drops** — DAY-13 (`0010_retirements`, carrying RUN-15's three columns).
- **Any write to the new columns** — DAY-5, DAY-6.
- **A seed of activity habits** — none; the starter library is a chooser, never rows.

## Depends on

- **DAY-3** — the unions and the enum tuple. Complete in `PROGRESS.md`.

## Recommended execution

**Opus.** A one-way door: an enum value and a table shape the next eight tickets depend on, verified on a scratch database with the `ADD VALUE` handled exactly. A cheaper model puts the `ADD VALUE` in a transaction or forgets a policy, and the mistake is permanent on the first hosted apply.

---

### Kickoff (paste into the session)

> Build **DAY-4 — Migration `0009_v1_3_additive`** (attached spec). Model: **Opus**. **Additive only; the `ADD VALUE` outside a transaction; `links` owner-private; verified on a scratch database; never applied to a hosted tier.**
> Attach/read first, in order: this spec · v1.3 §11 · `packages/db/AGENTS.md` · root `AGENTS.md` · `docs/architecture/drizzle-orm-conventions.md` · `docs/ai-guides/db-and-rls-authoring.md` · `docs/developer-guides/migrations.md` · RUN-2 and RUN-5 (Epic 5 — `0007` and `0008`; the pattern to mirror) · DAY-3 · `packages/db/SCHEMA_REFERENCE.md` (plan, library, user) · this track's `DEVIATIONS.md` + `TECHNICAL-DECISIONS.md` (TD-25…TD-28, TD-30) · Epic 5's `TECHNICAL-DECISIONS.md` (TD-10, TD-12, TD-14, TD-21).
> Paste `\d links` and the enum listing. Close in three places; log departures in `DEVIATIONS.md`. Run `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` as separate commands, then `yarn db:schema-reference`.
