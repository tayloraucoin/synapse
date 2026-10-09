# Review — warden on MIG-4

> Written by `yarn review:run warden MIG-4`. Never edit it: check-specs binds it to the hashes below, and Taylor reads it before merge.

- contract_sha256: 93f08587336e270d77e79abeb9f58b5a1dbfb873fe5e6cad8f5b7b93b376a9f2
- criteria_sha256: 73a031451850bb0760b0af902fc9731679f10d0e6aa6c96ed9415ebac2600d4f
- as_built_sha256: d3571fc76137a6101d623aae2fef983876cb0bd546a81c01a217a1733af8fb38
- head: 5cf1f5af6b1de9ac8bfdd4865301475c6afdf310
- runner: claude 2.1.295 (Claude Code) (role docs/roles/engineering/warden-security-privacy-engineer.md; tools Read,Grep,Glob)
- model: claude-fable-5-1
- at: 2026-10-09T21:25:32Z
- run: 1 of warden on MIG-4
- tokens_input: 68
- tokens_cache_read: 535314
- tokens_cache_write: 103954
- tokens_output: 34566
- seconds: 489
- verdict: PASS

## Prompt

Venue: Claude Code, headless, started by `yarn review:run warden MIG-4`. You have Read, Grep, Glob only: you cannot edit or run anything.

You are warden, reviewing ticket MIG-4 in fresh context. You have not seen the builder's conversation and must not ask for it: judge only from the files.

This is the only review pass unless you FAIL it, so list every finding now. A PASS is final for its round: Should-fix and Consider findings become follow-ups the builder fixes without reopening the review, and nothing you hold back is asked for later. Only a Blocking finding earns a second pass.

Read, in this order:
1. The contract: specs/_shared/epics/MIG-migration/tickets/MIG-004-check-migrations/contract.md. Its criteria, non-negotiables, planned paths and out of scope are what was promised, and what you judge the changes against.
2. The results: specs/_shared/epics/MIG-migration/tickets/MIG-004-check-migrations/results.json. Each criterion's run record and evidence file.
3. The as-built: specs/_shared/epics/MIG-migration/tickets/MIG-004-check-migrations/as-built.md. What the builder says shipped, and every deviation. It is a claim to check inside the changed files, not an invitation to read the repo.
4. The evidence:
   - C1 check: specs/_shared/epics/MIG-migration/tickets/MIG-004-check-migrations/evidence/C1.log (sha256 017fdc1feaad)
   - C2 test: specs/_shared/epics/MIG-migration/tickets/MIG-004-check-migrations/evidence/C2.log (sha256 63c09995d6fc)
   - C3 test: specs/_shared/epics/MIG-migration/tickets/MIG-004-check-migrations/evidence/C3.log (sha256 63c09995d6fc)
   - C4 test: specs/_shared/epics/MIG-migration/tickets/MIG-004-check-migrations/evidence/C4.log (sha256 63c09995d6fc)
   - C5 test: specs/_shared/epics/MIG-migration/tickets/MIG-004-check-migrations/evidence/C5.log (sha256 63c09995d6fc)
5. The changed files, this ticket's planned paths against main (other tickets share the branch): docs/developer-guides/migrations.md, package.json, packages/db/migrations/migrations.lock.json, packages/db/package.json, packages/db/scripts/check-migrations.test.ts, packages/db/scripts/check-migrations.ts, packages/db/scripts/fixtures/check-migrations/0000_unguarded.sql. Judge these changes against the criteria and the non-negotiables.
6. The surface the ticket cites: specs/_shared/epics/MIG-migration/rulings.md. Read only the parts the contract names (migrationsDir), not the whole file.

Stay inside the changed files. Follow an import one hop out of a changed file only to confirm a Blocking finding, never to look for one, and never further than that hop.

For each criterion, say whether the evidence and the changed code show it is met. Then list every finding, graded Blocking, Should-fix or Consider, each with a file and line. A Blocking finding means FAIL; a Should-fix or Consider finding never does.

Your last line must be exactly one of:
VERDICT: PASS
VERDICT: FAIL

## Review

I have read the contract, results, as-built, evidence, the seven changed files and the `migrationsDir` row in rulings.md. Review follows.

## Criteria

**C1: met.** C1.log shows exit 0 at HEAD 5cf1f5a: 12 migrations, none act on auth, all recorded. Tests 1 and 2 prove the pass is not vacuous: 0000's DO block is recognised by `isGuardedAuthStub`, the file carries `CREATE SCHEMA IF NOT EXISTS "auth"` and the FK to `auth.users`, and file count equals journal count.

**C2: met.** The fixture carries drizzle-kit's verbatim `CREATE SCHEMA "auth"` and `CREATE TABLE "auth"."users"`. Test 3 pins them to `auth-schema` on statement 1 and `auth-object` on statement 2. Test 4 puts the fixture in 0000's place, test 5 under another name, and both fail, so the rule reads content, not names. Ten loosened guards fail the anchored stub regex (`check-migrations.ts:279`), 37 auth DDL and write forms fail, and the FK, the four `auth.*()` reads and 0007's `storage.objects` EXECUTE stay allowed. The focus item is satisfied.

**C3: met.** Tests 10 to 15 cover an edit, a one-byte edit, a removal, a rename, a bumped `when`, an unrecorded new file, append-only recording, refusal while a recorded file changed, refusal of an auth-touching file, and stop-at-first-refusal. The code matches: the lock is compared positionally against the journal (lines 439 to 473), fresh entries are appended only (lines 475 to 502), and nothing is written while any finding exists.

**C4: met.** Root `package.json:69` runs `yarn test:migrations && yarn check-migrations` straight after `yarn build`. Test 16 asserts the order and the workspace delegation.

**C5: met.** Tests 13 and 14 cover a `.sql` without a journal entry and an entry without a file, both failing `journal`.

**Non-negotiables.** All six hold on the changed files: every statement of every file is read, no file is skipped by name, the stub match is anchored and exact, the lock refuses rewrites, no migration or journal entry is among the changed paths, and the script imports only `node:crypto`, `fs`, `path` and `url`. Tests copy to the OS temp dir and only read the real folder.

## Findings

**Should-fix. `set_config` bypasses the search_path rule.** `check-migrations.ts:247` matches the literal `search_path` only. Adversary: a migration author who wants an unqualified name to resolve into auth. Path: `SELECT set_config('search' || '_path', 'auth', false);` then `DROP TABLE users;` in the same file. No rule fires: no `execute`, no `auth.`, no `search_path` text. Drizzle runs the batch on one connection, so the setting persists into the next statement. Impact: an auth object reached on the tier where the migration role has the privilege, with the check green. Control: fail any statement containing `set_config(` outright, as the file already does for `search_path`. Migrations have no legitimate reason to write a GUC. Verification: add the concatenated form to test 7.

**Should-fix. The dynamic-SQL rule passes string-function obfuscation.** `check-migrations.ts:259-264` triggers on `||`, a backslash, `chr(`, `U&`, catalogue names or a spelled `auth`. `execute format('create table %s.x (id int)', substr('xauthx', 2, 4))`, `reverse('htua')` or `concat('au', 'th')` carry none of those. The as-built records "a name the text never spells" as out of reach, but these spell it in plain string functions. Control: fail closed on any EXECUTE whose arguments are not bare string literals. `execute '<literal>'` and `execute format('<literal>', '<literal>', ...)` stay allowed, which keeps 0007 green. Verification: add the three forms to test 7.

**Should-fix. `--record` on a missing lock writes a fresh baseline.** `check-migrations.ts:436` suppresses the missing-lock finding under `--record`, so deleting `migrations.lock.json` and recording again launders every edit to every migration in one go. The diff shows a rewritten lock, which the migrations-folder reviewer sees, so this is equivalent in exposure to hand-editing a sha256. Still, the guide promises "Recording only appends", and the lock now exists, so the init path has done its one job. Control: make `--record` refuse when the lock is missing, behind an explicit `--init` flag if a re-baseline is ever wanted. Verification: a test that `--record` with the lock removed records nothing and reports `lock`.

**Consider. `SET ROLE` can carry a search_path the text never spells.** A role whose role-level `search_path` is auth makes every unqualified name after `SET ROLE` resolve there. Whether the migration role can assume such a role on Supabase is a fact I cannot confirm from these files. Failing `SET ROLE`, `SET SESSION AUTHORIZATION` and `RESET ROLE` in migrations costs nothing legitimate. `check-migrations.ts:244`.

**Consider. The stub's "plain column list" admits column constraints.** `[^;$'()]` at `check-migrations.ts:279` lets `REFERENCES public.x`, `DEFAULT now()`, `UNIQUE` or `COLLATE` through inside the stub. The body only runs where `auth.users` is absent, so the reach is a bare local Postgres, but the non-negotiable says "plain column list". Tightening to `name type [NOT NULL] [PRIMARY KEY]` would match the wording.

**Consider. Test temp folders are never removed.** `check-migrations.test.ts:45-50` creates a full copy of the migrations folder per test and leaves it in the OS temp dir. No personal data is involved, so this is hygiene only.

**Consider. Stale examples in the guide.** `docs/developer-guides/migrations.md:19` cites `0008_web_push_subscriptions.sql` and `0013`–`0017` as hand-authored examples. Neither exists in this repo. Pre-existing text, but a person following the new check section reads it on the way.

## Residuals I accept as recorded

The lock is a tripwire, not a proof: the SQL reviewer before `db:migrate` remains the door, as `packages/db/AGENTS.md` says. The last-entry amendment path in `migrations.md:48` relies on the human knowing no tier applied it. Both are in the as-built or the guide with an owner.

VERDICT: PASS
