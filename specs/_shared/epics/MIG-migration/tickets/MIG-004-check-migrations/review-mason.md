# Review — mason on MIG-4

> Written by `yarn review:run mason MIG-4`. Never edit it: check-specs binds it to the hashes below, and Taylor reads it before merge.

- contract_sha256: 93f08587336e270d77e79abeb9f58b5a1dbfb873fe5e6cad8f5b7b93b376a9f2
- criteria_sha256: 73a031451850bb0760b0af902fc9731679f10d0e6aa6c96ed9415ebac2600d4f
- as_built_sha256: d3571fc76137a6101d623aae2fef983876cb0bd546a81c01a217a1733af8fb38
- head: 019231682b36c15f6c973141cee1acf106477123
- runner: claude 2.1.295 (Claude Code) (role docs/roles/engineering/mason-cto-principal-dev.md; tools Read,Grep,Glob)
- model: claude-fable-5-1
- at: 2026-10-09T21:20:14Z
- run: 1 of mason on MIG-4
- tokens_input: 98
- tokens_cache_read: 427906
- tokens_cache_write: 181171
- tokens_output: 17642
- seconds: 229.6
- verdict: PASS

## Prompt

Venue: Claude Code, headless, started by `yarn review:run mason MIG-4`. You have Read, Grep, Glob only: you cannot edit or run anything.

You are mason, reviewing ticket MIG-4 in fresh context. You have not seen the builder's conversation and must not ask for it: judge only from the files.

This is the only review pass unless you FAIL it, so list every finding now. A PASS is final for its round: Should-fix and Consider findings become follow-ups the builder fixes without reopening the review, and nothing you hold back is asked for later. Only a Blocking finding earns a second pass.

Read, in this order:
1. The contract: specs/_shared/epics/MIG-migration/tickets/MIG-004-check-migrations/contract.md. Its criteria, non-negotiables, planned paths and out of scope are what was promised, and what you judge the changes against.
2. The results: specs/_shared/epics/MIG-migration/tickets/MIG-004-check-migrations/results.json. Each criterion's run record and evidence file.
3. The as-built: specs/_shared/epics/MIG-migration/tickets/MIG-004-check-migrations/as-built.md. What the builder says shipped, and every deviation. It is a claim to check inside the changed files, not an invitation to read the repo.
4. The evidence:
   - C1 check: specs/_shared/epics/MIG-migration/tickets/MIG-004-check-migrations/evidence/C1.log (sha256 344eb47972e1)
   - C2 test: specs/_shared/epics/MIG-migration/tickets/MIG-004-check-migrations/evidence/C2.log (sha256 855d27a3149e)
   - C3 test: specs/_shared/epics/MIG-migration/tickets/MIG-004-check-migrations/evidence/C3.log (sha256 855d27a3149e)
   - C4 test: specs/_shared/epics/MIG-migration/tickets/MIG-004-check-migrations/evidence/C4.log (sha256 855d27a3149e)
   - C5 test: specs/_shared/epics/MIG-migration/tickets/MIG-004-check-migrations/evidence/C5.log (sha256 855d27a3149e)
5. The changed files, this ticket's planned paths against main (other tickets share the branch): docs/developer-guides/migrations.md, package.json, packages/db/migrations/migrations.lock.json, packages/db/package.json, packages/db/scripts/check-migrations.test.ts, packages/db/scripts/check-migrations.ts, packages/db/scripts/fixtures/check-migrations/0000_unguarded.sql. Judge these changes against the criteria and the non-negotiables.
6. The surface the ticket cites: specs/_shared/epics/MIG-migration/rulings.md. Read only the parts the contract names (migrationsDir), not the whole file.

Stay inside the changed files. Follow an import one hop out of a changed file only to confirm a Blocking finding, never to look for one, and never further than that hop.

For each criterion, say whether the evidence and the changed code show it is met. Then list every finding, graded Blocking, Should-fix or Consider, each with a file and line. A Blocking finding means FAIL; a Should-fix or Consider finding never does.

Your last line must be exactly one of:
VERDICT: PASS
VERDICT: FAIL

## Review

Review of MIG-4 against its contract, results, evidence and the seven changed files. Verdict first: the work is clean on every non-negotiable, and nothing blocks.

**Criteria**

- **C1, met.** The C1 log shows exit 0 on the committed folder. Test 2 proves the pass is not vacuous: 0000's DO block is the statement `isGuardedAuthStub` accepts, and the FK to `auth.users` is present.
- **C2, met.** Tests 3 to 8. The fixture at `packages/db/scripts/fixtures/check-migrations/0000_unguarded.sql:5-9` carries the regenerated form; it fails `auth-schema` and `auth-object` in 0000's place and under another name. Ten loosened guards and 37 auth statements fail; the FK and the four reads pass.
- **C3, met.** Tests 10 to 13. Edit, one-byte edit, removal, rename and journal `when` each fail `append-only`. A new migration fails until `--record`; recording appends and refuses after an edit or on auth.
- **C4, met.** `package.json:69` runs `yarn build && yarn test:migrations && yarn check-migrations`; test 15 reads it.
- **C5, met.** Tests 13 and 14 cover a `.sql` with no entry and an entry with no file, recorded or not.

**Non-negotiables.** All six hold in the code. The auth rules run per statement over every `.sql` file, and the stub exception is anchored `^DO…$` on content at `check-migrations.ts:267-277`, so no name is ever consulted. The script imports only `node:fs`, `node:crypto`, `node:path` and `node:url`; tests mutate temp copies only. I could not run git, so "no existing migration, journal entry or Drizzle file name changes" rests on the planned paths and on C1 passing against the committed lock, which is consistent. Results were run at 9010684 and HEAD is 0192316; `check-specs --strict` is the staleness gate, not this review.

**Findings**

Should-fix:

1. **`--record` can corrupt the lock's positional invariant.** `packages/db/scripts/check-migrations.ts:472-493`. With two unrecorded entries where the earlier one touches auth, the earlier is refused and the later is appended at the refused one's position. The next run then reports the later file as reordered and never flags the earlier as unrecorded. Stop at the first refused fresh entry instead of continuing.
2. **`CREATE SCHEMA AUTHORIZATION auth` is not caught.** `check-migrations.ts:198-203`. The `auth-schema` regex expects the name right after `schema`, and `authorization` fails the `auth` boundary. Add an `authorization\s+${AUTH}` alternative.
3. **The guide advises a form the new check rejects.** `docs/developer-guides/migrations.md:70` says to use `CREATE SCHEMA IF NOT EXISTS "auth"` when regenerating. That bare statement fails `auth-schema`; only the guarded DO block passes. Point it at 0000's stub.
4. **Two ad-hoc checks the tool now supersedes stay in the guide.** `migrations.md:30-47` (journal parity) and `migrations.md:108-118` (`when` ordering) are both covered by the `journal` rule. Replace each with "run `yarn check-migrations`"; the docs rule says nothing lives in two places.
5. **The count of migrations is hardcoded.** `packages/db/scripts/check-migrations.test.ts:67` asserts 12 files. The first ticket that adds a migration must edit this ticket's test. Compare to the journal's entry count instead.

Consider:

6. **Lock wording versus the escape hatch.** The lock's `about` at `migrations.lock.json:2` says never edit an entry; `migrations.md:65` tells a reviewer to remove one for an unapplied migration. Align them, and say "the last entry", since removing a middle entry shifts every later position.
7. **`search_path` set without the literal.** `check-migrations.ts:239-242` needs `auth` in the same statement; `set_config('search_path', 'au'||'th', false)` passes. A migration has no reason to set `search_path` at all, so flagging any `search_path` write would close it.
8. **U+FFFF as a literal character** at `check-migrations.ts:55` and `:161`. Write `\uFFFF` so the class is readable.
9. **`existsSync(dir)` is tested twice** in `runCheck`, `check-migrations.ts:518-535`. Test once, return early.

VERDICT: PASS
