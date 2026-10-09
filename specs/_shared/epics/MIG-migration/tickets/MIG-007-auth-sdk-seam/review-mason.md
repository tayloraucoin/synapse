# Review — mason on MIG-7

> Written by `yarn review:run mason MIG-7`. Never edit it: check-specs binds it to the hashes below, and Taylor reads it before merge.

- contract_sha256: 3306af12f9425e00fbeaf95c7e34ec3acd69a13d6d7215cd705edfc311435845
- criteria_sha256: 5236c5e00f71703afc98e3a77653d2c136b889ebd6f531bb3e226d4d8541993b
- as_built_sha256: 5dcd89391703de71a037b348b4957e510a1920ff05289785004060f00dfe1d97
- head: 492020f05e496b60ccd785fbdb0d224f91b60ddc
- runner: claude 2.1.295 (Claude Code) (role docs/roles/engineering/mason-cto-principal-dev.md; tools Read,Grep,Glob)
- model: claude-fable-5-1
- at: 2026-10-09T20:57:14Z
- run: 1 of mason on MIG-7
- tokens_input: 130
- tokens_cache_read: 624966
- tokens_cache_write: 201321
- tokens_output: 11753
- seconds: 170.3
- verdict: PASS

## Prompt

Venue: Claude Code, headless, started by `yarn review:run mason MIG-7`. You have Read, Grep, Glob only: you cannot edit or run anything.

You are mason, reviewing ticket MIG-7 in fresh context. You have not seen the builder's conversation and must not ask for it: judge only from the files.

This is the only review pass unless you FAIL it, so list every finding now. A PASS is final for its round: Should-fix and Consider findings become follow-ups the builder fixes without reopening the review, and nothing you hold back is asked for later. Only a Blocking finding earns a second pass.

Read, in this order:
1. The contract: specs/_shared/epics/MIG-migration/tickets/MIG-007-auth-sdk-seam/contract.md. Its criteria, non-negotiables, planned paths and out of scope are what was promised, and what you judge the changes against.
2. The results: specs/_shared/epics/MIG-migration/tickets/MIG-007-auth-sdk-seam/results.json. Each criterion's run record and evidence file.
3. The as-built: specs/_shared/epics/MIG-migration/tickets/MIG-007-auth-sdk-seam/as-built.md. What the builder says shipped, and every deviation. It is a claim to check inside the changed files, not an invitation to read the repo.
4. The evidence:
   - C1 test: specs/_shared/epics/MIG-migration/tickets/MIG-007-auth-sdk-seam/evidence/C1.log (sha256 f223d6edbd42)
   - C2 test: specs/_shared/epics/MIG-migration/tickets/MIG-007-auth-sdk-seam/evidence/C2.log (sha256 71cc968b5970)
   - C3 test: specs/_shared/epics/MIG-migration/tickets/MIG-007-auth-sdk-seam/evidence/C3.log (sha256 4fc18da1e277)
   - C4 check: specs/_shared/epics/MIG-migration/tickets/MIG-007-auth-sdk-seam/evidence/C4.log (sha256 d05fc1fa0831)
   - C5 manual: specs/_shared/epics/MIG-migration/tickets/MIG-007-auth-sdk-seam/evidence/C5-walk.md (sha256 7fc6b2b600c5)
   - C6 test: specs/_shared/epics/MIG-migration/tickets/MIG-007-auth-sdk-seam/evidence/C6.log (sha256 20ae428110e6)
5. The changed files, this ticket's planned paths against main (other tickets share the branch): apps/web/lib/auth/get-request-context.ts, apps/web/lib/auth/require-verified-email.ts, apps/web/lib/clients/supabase/client.ts, apps/web/package.json, docs/developer-guides/authentication.md, docs/developer-guides/remove-supabase-auth.md, packages/api/package.json, packages/api/src/context.ts, packages/auth/eslint-suppressions.json, packages/auth/package.json, packages/auth/src/browser.ts, packages/auth/src/client.ts, packages/auth/src/context.ts, packages/auth/src/index.ts, packages/config/eslint/boundaries.js, packages/db/scripts/seed-users.ts, scripts/check-auth-seam.test.mjs, tooling/check-stack.ts, toolkit.json. Judge these changes against the criteria and the non-negotiables.

Stay inside the changed files. Follow an import one hop out of a changed file only to confirm a Blocking finding, never to look for one, and never further than that hop.

For each criterion, say whether the evidence and the changed code show it is met. Then list every finding, graded Blocking, Should-fix or Consider, each with a file and line. A Blocking finding means FAIL; a Should-fix or Consider finding never does.

Your last line must be exactly one of:
VERDICT: PASS
VERDICT: FAIL

## Review

The toolkit checkout is outside the paths I may read, so the byte-for-byte claim on `tooling/check-stack.ts` stays the builder's claim, checked functionally by the C3 tests but not by me. Everything else I could confirm in the changed files.

## Review: MIG-7 auth-sdk-seam

**Verdict up top: PASS.** The seam is placed where the contract said, the restriction is mechanical, the exception is one scoped rule reconfiguration rather than a suppression, and the browser entry reaches nothing server-side. Two paperwork defects and three doc items follow.

### Criteria

- **C1, met.** `@supabase/*` joins `RESTRICTED_EXTERNAL` with `auth` as owner (`packages/config/eslint/boundaries.js:161`); the one exception is a per-file rule rebuild with that module exempted and every other rule intact (`boundaries.js:178-187, 317-322`). A repo grep finds the vendor imported only in `packages/auth/src/*` and `packages/db/scripts/seed-users.ts`; the two `tooling/lib` hits are string patterns, not imports. The test probes seven paths with value, type and `@supabase/ssr` imports and sees one error each.
- **C2, met.** Six new glob rows in `toolkit.json:164-199` cover the seeder, `apps/*/lib/clients/supabase/**` and `packages/api/src/context.ts` for both roles; `packages/auth/**` was already under `**/auth/**` for both.
- **C3, met functionally.** `stack.auth` is complete (`toolkit.json:201-226`), `check-stack` sits in verify after `check-refs` (`package.json:69`), and the test runs it green and fails it on a fixture with the package gone. Byte-for-byte against the toolkit is the as-built's `cmp` claim; I could not read the toolkit checkout.
- **C4, met.** Exit 0; eslint prints nothing on success.
- **C5, partly deferred.** The signed-out half was walked (sign-in renders, proxy refresh runs, guard redirects, invalid cookie lands on sign-in). The signed-in steps are recorded deferred to Taylor per the practice. The code supports "behaviour unchanged": the three call sites changed in types only, and `createBrowserClientFromCredentials` passes the same two arguments and the same `cookieOptions.domain` the old direct call did.
- **C6, met.** `browser.ts` imports `@supabase/ssr` and type-only `./context`; `context.ts` imports type-only vendor and `@syn/types`; neither reads `process.env`. `apps/web/lib/clients/supabase/client.ts:1-4` takes `@syn/auth/browser`, not the barrel.

### Non-negotiables

No changed file touches RLS or migrations. The singleton `db` appears only for the pre-existing local `auth.users` stub in `context.ts:52` and `get-request-context.ts:40`, unchanged. The browser path carries only `NEXT_PUBLIC_*` literals, read where they were. The exception is named once in the boundaries config. No boundaries error is suppressed.

### Findings

**Should-fix**

1. **The per-criterion filter is inert.** `contract.md:48, 52, 56, 68` run `yarn test:auth-seam --test-name-pattern Cn`, but `package.json:17` is `node --test <file>`, so yarn appends the flag after the file and node hands it to the script. Every evidence log shows all eight tests. The proofs are still true, but a Q3 ledger should not record a command that does not do what it says. Drop the flag from the four commands, or move it into a script that puts it before the file.
2. **Root `package.json` changed outside planned_paths and is missing from the as-built.** It gained `test:auth-seam`, `check-stack`, and the verify chain entry (`package.json:17, 55, 69`). `as-built.md:18` names `yarn.lock` but not this file. Add the line.

**Consider**

3. **`authentication.md` contradicts itself in the section this ticket edited.** Line 37 calls `createBrowserClient()` "server-side only in practice"; line 55 calls `client.ts` "browser only; never import from server code". Line 347's pitfall still says "use `client.ts`" where the answer is now the app client over `@syn/auth/browser`. The file map at lines 372-383 lists `apps/web/` twice with marketing paths; the as-built acknowledges the older stale sections.
4. **`createBrowserClient` is a browser factory that must not run in a browser.** `packages/auth/src/client.ts:8-23` says so in its own doc block, and `index.ts:34` still exports it. Once MIG-19 rewires the app's literal reads, this export has no caller and should go; until then the name misleads the next agent.
5. **`authentication.md:50` and `remove-supabase-auth.md:8` both narrate the exception.** Fine as prose, but when the seeder's reads move in MIG-18 both lines and the `seed-users.ts:5-8` header need the same edit; one of them could point at the other.

VERDICT: PASS
