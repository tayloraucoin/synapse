# As-built — MIG-4

## Shipped against the contract

- C1: `yarn check-migrations` passes on `packages/db/migrations` as committed: 12 migrations, none act on the auth schema, all recorded and unchanged. 0000's DO block is recognised as the guarded stub, and a test asserts it is the statement recognised (the pass is not vacuous).
- C2: `scripts/fixtures/check-migrations/0000_unguarded.sql` is 0000 with the guard replaced by what `drizzle-kit generate` (0.31.10) emits today against `src/schema`, captured into the scratchpad, verbatim: `CREATE SCHEMA "auth"` fails `auth-schema` and `CREATE TABLE "auth"."users"` fails `auth-object`, in 0000's place and under another file's name. Ten loosened guards fail (an ELSE, an extra statement, another schema or table in the condition, IF EXISTS, `OR true`, a CHECK, a bare CREATE SCHEMA, a nested dollar body), and so do 37 kinds of auth DDL or write.
- C3: an edited (one byte included), removed, renamed or re-timestamped recorded migration fails `append-only`. A new migration fails until `--record`, which appends only and refuses while anything recorded changed or the new file touches auth.
- C4: `verify` runs `yarn test:migrations && yarn check-migrations` straight after `yarn build`. A test reads the root `package.json` to prove it.
- C5 (added with `contract:add` after Vigil's pre-flight): a `.sql` with no journal entry, or a journal entry with no file, fails `journal`.

## Deviations

- [ASSUMPTION] Append-only is held by a lock, `packages/db/migrations/migrations.lock.json` (journal entry and sha256 per migration), not by git history. A git base passes edits to migrations that exist only on a branch, and Taylor applies migrations from branches. The lock was recorded from the committed 0000 to 0011, which makes today's files the baseline.
- The lock moved from `packages/db/` into the migrations folder after Vigil's pre-flight (finding 6), so the `**/migrations/**` Mason glob reaches it without a `toolkit.json` row. drizzle-kit `generate` ("No schema changes") and `check` ("Everything's fine") were run against a scratch copy holding the lock.
- [ASSUMPTION] The guarded stub is allowed in any migration, not only the first: it is matched by content, and its body can only no-op or abort on a database where `auth.users` exists. Narrower than the toolkit's model, which fails `create schema if not exists auth` and would fail 0000.
- The toolkit's model misses `CREATE SCHEMA "auth"` (its `"auth"\b` never matches before a space), which is exactly the statement drizzle-kit emits. Here the quoted form is matched explicitly. The model's `auth.uid()` allowance is narrowed to `uid`, `role`, `jwt` and `email`, and `REFERENCES` to `auth.users`.
- Added beyond the model: a dollar-quote and comment aware splitter that fails closed on anything unterminated, and rules for session settings (`search_path`, `set_config`, `SET ROLE`, `SESSION AUTHORIZATION`), `U&` escapes and dynamic `EXECUTE`.
- [ASSUMPTION] Dynamic `EXECUTE` fails closed after Warden's review. A new migration may not run it at all, and only SQL whose sha256 the lock already records keeps it (0007's storage policies, which pass `format` a plpgsql variable). Warden's proposed control, literal arguments only, would have failed 0007 and still passed `format('%s%s', 'au', 'th')`. Dynamic SQL goes in `packages/db/supabase/setup`.
- `--record` refuses a missing lock (Warden). A `--init` was tried and dropped: with no lock nothing is frozen, so it stops at 0007. A lost lock is restored from git.
- Review fixes, Mason: recording stops at the first refused entry; `CREATE SCHEMA AUTHORIZATION auth` and any `search_path` write fail; the C1 count follows the journal; the guide drops the two ad-hoc checks the tool supersedes and its advice to use a bare `CREATE SCHEMA IF NOT EXISTS "auth"`; the lock's `about` and the guide agree that only the last entry may be removed. Warden: the stub's columns are a name, a type and at most NOT NULL and PRIMARY KEY; tests remove their temp copies; the guide's stale hand-authored examples are corrected.
- Planned paths grew: the test, the fixture, the lock, `packages/db/package.json` (the scripts run there, as in the toolkit), and `docs/developer-guides/migrations.md` (a section on the check and `--record`). The prompt's writes named only the script, its fixtures, the root `package.json` and the contract.
- The pre-flight ran after the code was on disk (Vigil's note 13): `contract:init` refused a Q3 epic ticket without a pre-flight line, and the build had already started.
- Vigil's note 12: the cite now names `rulings.md` and its `migrationsDir` row. The toolkit path sits in the Build notes, outside the repo.

## Not verified

- Dynamic SQL in recorded migrations is held only by the heuristic (concatenation, escapes, catalogue reads, naming auth) and by the review it already had. The human reading the SQL before `db:migrate` stays the door.
- Whether the migration role on Supabase could assume a role whose `search_path` is `auth` (Warden's consider) was not checked; `SET ROLE` fails regardless.
- Nothing was applied to any database, local included.

## Next

The first ticket that writes a migration runs `yarn check-migrations --record` and commits the lock with it. The local database is asked of Taylor in the closing report, with the recommendation to keep the bare local Postgres and 0000's stub (SETUP.md Option C). Nothing in MIG-4 waits on the answer.
