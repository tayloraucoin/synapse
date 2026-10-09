# Migrations

## Making schema changes

1. Edit files under `packages/db/src/schema/` (one file per table).
2. For RLS changes, update `pgPolicy` definitions colocated in the table file (see [rls.md](./rls.md)).
3. From repo root:

```bash
yarn db:generate   # Review emitted SQL in packages/db/migrations/
yarn db:migrate    # Apply against DATABASE_ENVIRONMENT target
yarn db:setup      # Re-apply platform SQL if needed (idempotent)
```

4. Commit `migrations/*.sql` and `migrations/meta/` together.

## Hand-authored migrations (when `db:generate` is blocked)

Sometimes a migration is written by hand (complex re-keys, snapshot collisions, human-reviewed DDL). Examples: `0008_web_push_subscriptions.sql`, `0013`–`0017` (ONB slices). **A `.sql` file alone is not enough** — Drizzle only runs migrations listed in `migrations/meta/_journal.json`.

**Required steps for every hand-authored migration:**

1. Add `packages/db/migrations/NNNN_descriptive_name.sql` (use `--> statement-breakpoint` between statements if multiple).
2. **Register it in `migrations/meta/_journal.json`** — append an entry with the next `idx`, matching `tag` (filename without `.sql`), `version: "7"`, `breakpoints: true`, and a `when` timestamp **strictly greater** than the previous entry (see [Journal timestamp ordering](#journal-timestamp-ordering-meta_journaljson) below).
3. Log the deviation in the relevant slice `DEVIATIONS.md` (include migration id + “human review before `db:migrate`”).
4. Run `yarn db:migrate` against the intended target and confirm the migration appears in `drizzle.__drizzle_migrations` on that database.

**Symptoms when the journal entry is missing:** `yarn db:migrate` reports success immediately; no new SQL runs; runtime errors like `column "…" does not exist` (pgCode `42703`); `db:seed` fails on the same missing columns.

**Prevention — journal vs SQL file parity:** run `yarn check-migrations` (below) before committing migration work or after any hand-authored SQL. It fails on a `.sql` file with no journal entry and on an entry with no file.


`drizzle-kit` reads `packages/db/.env`. Confirm `DATABASE_ENVIRONMENT` before migrating:

```bash
cd packages/db && grep DATABASE_ENVIRONMENT .env
```

Never run destructive migrations against production without explicit approval.

## The migration check (`yarn check-migrations`, in `yarn verify`)

`packages/db/scripts/check-migrations.ts` runs after `yarn build` in `yarn verify` and fails on two things (MIG-4):

- **A statement that acts on the `auth` schema**, in any migration, whatever its file name. Allowed: a foreign key to `auth.users`, and calls to `auth.uid()`, `auth.role()`, `auth.jwt()` and `auth.email()`. The one exception is `0000`'s guarded stub, matched exactly; the unguarded `CREATE SCHEMA "auth"` that `drizzle-kit generate` re-emits fails. Put anything else for `auth` in `packages/db/supabase/setup`.
- **A break of the append-only rule.** `packages/db/migrations/migrations.lock.json` records each migration's journal entry and the sha256 of its SQL. A recorded migration that is edited, removed, renamed or given a new `when` fails, and so does one not yet recorded, a `.sql` file with no journal entry, or an entry with no file.

After `yarn db:generate` (or a hand-authored migration), once the SQL is final, run `yarn check-migrations --record` and commit the lock with the migration. Recording only appends. It refuses while anything recorded has changed or while the new file touches `auth`. To amend the last migration while no tier has applied it, remove its entry, the lock's last, in the same commit, where the reviewer of the SQL sees it, then record again. Removing an earlier entry shifts every entry after it and fails. Never remove the entry of a migration a tier has applied: write a new migration.

## Supabase coexistence gotchas

- `schemaFilter: ['public']` in `drizzle.config.ts` — never migrate `auth`, `storage`, etc.
- `drizzle-kit generate` re-emits `CREATE SCHEMA "auth"` and a stub `auth.users` when the first migration is regenerated from scratch. Re-apply `0000`'s guarded DO block (`packages/db/AGENTS.md`) in their place. `yarn check-migrations` fails the bare statements, `CREATE SCHEMA IF NOT EXISTS "auth"` alone included.
- After migrations, run `yarn db:setup` for triggers, RLS enablement loop, and storage buckets.

## RLS policy migrations

Policies are defined in TypeScript via `pgPolicy()` and emitted by `yarn db:generate`. After applying migration `0002_user_roles`, run `yarn db:generate` in an **interactive terminal** to emit the RLS policy migration (drizzle-kit prompts on column renames).

## Reverting changes

| Situation | Action |
|-----------|--------|
| **Local dev** | `yarn db:reset` — drops `public`, re-migrates, setup, seed |
| **Unapplied generated migration** | `drizzle-kit drop` in `packages/db` |
| **Applied to shared env (staging/prod)** | Forward-fix with a new migration (append-only) |
| **High-risk rollback** | Optional hand-written `migrations/down/<tag>.down.sql`, applied manually via `psql` |

Drizzle has no built-in down migrations. Never edit a migration that has been applied to a shared environment.

## Journal timestamp ordering (`meta/_journal.json`)

Drizzle decides **which** migrations exist from `_journal.json`, then decides **which are pending** from `when` timestamps vs `drizzle.__drizzle_migrations.created_at` on the target DB. Two silent-failure modes:

| Failure mode | Cause | Symptom |
|--------------|-------|---------|
| **Missing journal entry** | `.sql` committed without a matching `_journal.json` entry | Migrate succeeds instantly; SQL never runs; columns missing |
| **Bad `when` ordering** | New entry's `when` ≤ last applied `created_at` on target | Migrate succeeds; that migration skipped; columns missing |


If `0003`/`0004` were hand-edited with placeholder timestamps like `1782000000001` and a later `db:generate` produces `0005` with a real (smaller) `when` (e.g. `1781895997280`), `yarn db:migrate` will report success but **silently skip** `0005` because its timestamp sorts before the last applied row.

**Symptoms:** migrate succeeds; new columns missing; `column does not exist` at runtime.

**Fix:** bump the skipped entry's `when` in `migrations/meta/_journal.json` above the max `created_at` in `drizzle.__drizzle_migrations`, then re-run `yarn db:migrate`.

**Prevention:**

- Do not hand-edit `when` in the journal unless you know the ordering implications.
- After `db:generate`, run `yarn check-migrations`: it fails when an entry's `when` is not after the one before it. Confirm by hand that the new `when` is greater than `max(created_at)` on shared databases; no file shows that.
- Bumping the `when` of a recorded entry fails the check. For the last, unapplied entry, remove its lock entry and record again, as in [the migration check](#the-migration-check-yarn-check-migrations-in-yarn-verify).

## All pending migrations share ONE transaction

**`db:migrate` does not wrap each file in its own transaction — it wraps the entire pending batch in a single transaction.** From `drizzle-orm/pg-core/dialect.js`:

```js
await session.transaction(async (tx) => {
  for await (const migration of migrations) {      // every pending file
    if (!lastDbMigration || Number(lastDbMigration.created_at) < migration.folderMillis) {
      for (const stmt of migration.sql) await tx.execute(sql.raw(stmt));
      await tx.execute(sql`insert into ...__drizzle_migrations ...`);
    }
  }
});
```

Splitting statements across two files therefore does **not** put them in two transactions. It only does so if the files are applied in two separate `db:migrate` **runs**.

This matters for any statement Postgres forbids from sharing a transaction with its dependency. The one that has bitten this repo:

| Statement | Constraint |
|-----------|-----------|
| `ALTER TYPE … ADD VALUE` | The new label cannot be **used** (inserted, cast, compared) until the transaction that added it has committed — `unsafe use of new value "x" of enum type "y"` |

**Symptom:** `db:migrate` prints the two benign `NOTICE` lines (`schema "drizzle" already exists`, `relation "__drizzle_migrations" already exists` — these are normal on every re-run and are *never* the failure), then fails. The whole batch rolls back, so **nothing** is applied, not even the migrations before the offending one.

**Procedure — applying an enum-add plus its first use (two passes):**

1. Temporarily remove the *consuming* migration's entry from `migrations/meta/_journal.json`, leaving the `.sql` file on disk. Drizzle enumerates files from the journal, so this hides it without deleting anything.
2. Run `yarn db:migrate` — the enum-add applies and **commits**.
3. Restore the journal entry exactly as it was (`git diff migrations/meta/_journal.json` must come back empty).
4. Run `yarn db:migrate` again — the consuming migration is now alone in its transaction and the label is already committed.

Do this on **every** tier independently. A tier that is already caught up past the enum-add is unaffected; a tier where both are still pending will fail until it gets the two-pass treatment.

**Prevention:** when authoring an `ALTER TYPE … ADD VALUE` and its first use, say so in the migration header — the split alone does not solve it, and a comment claiming otherwise sends the next person down the wrong path.

## Epic 4 (UX v1.1): `0004`, `0005`, `0006` — the order per tier

Authored by DYN-2, DYN-3 and DYN-21; `0004` and `0005` were verified on scratch databases, `0006` was authored and reviewed by eye (no database was available to the thread); Taylor applies them to each Supabase tier (session pooler, `db:migrate`), and runs `0006` on a scratch copy first.

1. **`0004` and `0005` may run in one `db:migrate`.** `0004` adds five enum values (`workout`, `orient`, `not_confirmed`, `fixture`, the three notification kinds) and **neither file uses one of them**, so the one-transaction rule above does not bite. `0004`'s backfill emits `NOTICE` lines — `0004 overlap:` for v1.0 slots that overlapped and are now sequenced, `0004 before-wake:` for slots that started before the anchor — and a final `0004 backfill: overlaps=n before-wake=n`. Read them; they name rows a person may want to look at in the block editor. Zero of each is the expected result for the smoke account.
2. **After `0005`, re-run the platform setup** (`01_init_functions.sql`, `02_apply_triggers_rls.sql`): it arms the immutability trigger on `day_blocks` (the migration also does, so a database migrated without setup still has it) and enables RLS on the three new tables (the migration also does).
3. **`0006` last, on its own** (DYN-21) — and it carries the v1.0 backfill itself, in SQL, before its drops: every day that has items and no block gets ONE `morning` block (`template_id` and the name from the day's v1.0 template, `set` for a past, closed or touched day with the block's `original_scheduled_start` at its first item's start, `planned` otherwise) and every item on the day is put under it. Idempotent — a day with any block is skipped. It emits one `NOTICE`, `0006 backfill: days=n items=n`, then **asserts** that no day with items is block-less and raises (applying nothing) otherwise. Then it drops `template_slots.offset_*`, `days.template_id` and `users.wake_anchor_habit_id`, and nulls `templates.anchor_time` for every kind but `work`. `day_items.day_block_id` stays nullable — a one-off and an unstructured day's add have no block. DYN-5's `day.backfillBlocks` procedure is gone (it read the column `0006` drops); nothing reads the dropped columns after DYN-21 and `yarn check-types` is the proof.
4. **The reversal of the backfill**, should it ever be needed, is two statements in this order: null the items' `day_block_id` for the blocks it wrote (the only `morning` blocks on days that had no block before), then delete those blocks — deleting first would cascade the items away. The drops themselves are one-way.

## Epic 5 (UX v1.2): `0007`, `0008`, then `0009` — after `0004`–`0006`

Authored by RUN-2 (`0007`), RUN-5 (`0008`) and RUN-15 (`0009`, the drops); reviewed by eye — no database was available to the thread, by Taylor's instruction — and applied by Taylor after `0004`–`0006` on each tier.

0. **`0008` is additive too** (RUN-5, TD-21): four columns on `days` — `work_end_time`, `lights_out_time`, `devices_off_time` (nullable; null = the profile's) and `excluded_fixture_ids` (empty = nothing excluded) — so a day snapshots what its plan decided and a re-lay never reverts an evening or brings an excluded fixture back. It may run in the same `db:migrate` as `0007`.

1. **`0007` is additive and may run in the same `db:migrate` as `0004`–`0006`**, or alone after them. It creates five enums and adds two values (`item_origin.travel`, `notification_kind.journal_reminder`); **nothing in `0007` uses either new value**, so the one-transaction rule does not bite. It creates `passages`, `day_plans` (owner-private) and `quotes` (a catalogue: select for authenticated, writes denied), and adds columns to `users`, `habits`, `fixtures`, `templates`, `days`, `day_items`. Two hand-appended blocks: the **`orient_passage` backfill** (one `passages` row per non-blank `users.orient_passage`; the column is left for `0008`) and the **`passages` storage bucket** with its restrictive object policies (skipped with a `NOTICE` on vanilla Postgres, as the setup file does).
2. **After `0007`, re-run `03_storage_buckets.sql`** (or the whole platform setup): it carries the same `passages` bucket, so a fresh database and a migrated one agree; the migration created it already, and the setup upsert is idempotent.
3. **`0009` (RUN-15) drops** `users.earliest_wake_time`, `orient_passage`, `orient_show_last_night` — only once every screen that wrote them has shipped (RUN-8, RUN-9) and `yarn check-types` proves nothing reads them. Last, on its own.
4. **The reversal of `0007`'s backfill** is `DELETE FROM passages WHERE sort_order = 0 AND title IS NULL AND images = '[]' AND tags = '{}'` restricted to rows whose `body_md` equals the user's `orient_passage` — the column is still there until `0009`, which is the point of leaving it.

## Epic 6 (UX v1.3): `0009`, then `0010` — after `0004`–`0008`

**Renumbered (TD-30):** RUN-15's drops, which item 3 above calls `0009`, are now **`0010_retirements`** (DAY-13). `0009` is Epic 6's additive migration. Authored by DAY-4 (`0009`) and DAY-13 (`0010`), generated by `drizzle-kit generate` and reviewed by eye. By Taylor's instruction, no agent applies either one to any database, local included. Taylor applies them after `0004`–`0008`, in order, on each tier.

1. **`0009_v1_3_additive` is additive and may run in the same `db:migrate` as `0004`–`0008`**, or alone after them. It adds one enum value, `block_kind.transition`, placed `BEFORE 'activity'`, and **nothing in `0009` uses it**, so the one-transaction rule does not bite. The first write of `transition` is a day plan's after-work block, materialised by the app (DAY-6), never by a migration. It creates the `link_kind` enum and the `links` table: owner-private (the four standard policies) and indexed on `(user_id, sort_order)`, `(user_id, archived_at)` and `(user_id)`. It adds `fixtures.location` (≤ 80, null), `travel_there_min` and `travel_back_min` (0–180, default 0) and `plan_travel` (default true), so existing rows read `null, 0, 0, true`; `day_plans.after_work_template_id` and `activity_template_id` (both `ON DELETE SET NULL`, indexed, null on every plan); and `users.same_morning_routine` (nullable, no default — not yet asked).
2. **After `0009`, re-run `02_apply_triggers_rls.sql`** (or the whole platform setup). Its loops give `links` the `set_updated_at` trigger and re-assert RLS on every public table; the migration already enables RLS on `links`, but no migration creates the trigger. The same holds for `passages` and `day_plans` if `0007` ran without a setup re-run.
3. **`0010_retirements` (DAY-13) drops** RUN-15's three `users` columns (`earliest_wake_time`, `orient_passage`, `orient_show_last_night`) and `users_orient_passage_check`, the length check on the second of them. It drops nothing else and has no backfill: `0007` already copied every passage into `passages`. Every reader and writer is gone from `packages/` and `apps/`, and `yarn check-types` passes against the schema without them. Run it last, on its own, after `0009`. Once it has run, the reversal of `0007`'s backfill (item 4 above) is no longer possible, because the column it compares against is gone.

## Epic 7 (Workflow): `0011` — after `0004`–`0010`

Authored by FLO-2 with `drizzle-kit generate` (TD-46). No agent applied it to the local tier or any hosted one. It was applied on its own to a throwaway Postgres 15 cluster, with stand-ins for `users` and `category_color_key`, to check its constraints. Taylor applies it after `0010`, on each tier.

1. **`0011_workflow` is purely additive and may run in the same `db:migrate` as `0004`–`0010`**, or alone after them. It creates one enum, `workflow_column_role` (`active`, `done`), and six owner-private tables: `workflow_views`, `workflow_columns`, `workflow_groups`, `workflow_tasks`, `workflow_templates`, `workflow_day_pins`. It alters no existing table and reuses `category_color_key` for a group's hue. Every `user_id` cascades. `workflow_tasks.column_id` is `ON DELETE RESTRICT`, so a column holding tasks cannot be deleted until they are moved. `group_id` is `SET NULL`, which puts the task in the lane *No group*. Two partial unique indexes hold *at most one active and one done column per view*.
2. **After `0011`, re-run `02_apply_triggers_rls.sql`** (or the whole platform setup). Its loop gives the six tables the `set_updated_at` trigger; the migration enables RLS itself, but no migration creates the trigger.
3. **Nothing is seeded.** A person's two starter views (*Working*, *Queue*) are made on their first board read (TD-41, FLO-3).