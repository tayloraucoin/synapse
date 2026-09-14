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

**Prevention — journal vs SQL file parity:**

```bash
cd packages/db && node -e "
const fs=require('fs');
const j=require('./migrations/meta/_journal.json');
const sql=fs.readdirSync('./migrations').filter(f=>f.endsWith('.sql')).map(f=>f.replace('.sql','')).sort();
const tags=j.entries.map(e=>e.tag).sort();
const missingInJournal=sql.filter(t=>!tags.includes(t));
const orphanJournal=tags.filter(t=>!sql.includes(t));
if(missingInJournal.length) console.error('SQL files NOT in _journal.json:', missingInJournal.join(', '));
if(orphanJournal.length) console.error('Journal entries with NO .sql file:', orphanJournal.join(', '));
if(!missingInJournal.length&&!orphanJournal.length) console.log('OK:', sql.length, 'migrations in sync');
else process.exit(1);
"
```

Run this before committing migration work or after any hand-authored SQL.


`drizzle-kit` reads `packages/db/.env`. Confirm `DATABASE_ENVIRONMENT` before migrating:

```bash
cd packages/db && grep DATABASE_ENVIRONMENT .env
```

Never run destructive migrations against production without explicit approval.

## Supabase coexistence gotchas

- `schemaFilter: ['public']` in `drizzle.config.ts` — never migrate `auth`, `storage`, etc.
- `drizzle-kit generate` may re-emit `CREATE SCHEMA "auth"` — use `CREATE SCHEMA IF NOT EXISTS "auth"` in the first migration if regenerating from scratch.
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
- After `db:generate`, confirm the new entry's `when` is greater than all prior entries (and greater than `max(created_at)` on shared DBs).
- Quick check:

```bash
cd packages/db && node -e "
const j=require('./migrations/meta/_journal.json');
const last=j.entries.at(-1);
const prev=j.entries.at(-2);
if(last.when<=prev.when) console.error('BAD: new when',last.when,'<= prev',prev.when);
else console.log('OK:', last.tag, last.when);
"
```

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