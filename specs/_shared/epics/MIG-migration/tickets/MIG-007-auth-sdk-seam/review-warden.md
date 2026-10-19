# Review — warden on MIG-7

> Written by `yarn review:run warden MIG-7`. Never edit it: check-specs binds it to the hashes below, and Taylor reads it before merge.

- contract_sha256: 3306af12f9425e00fbeaf95c7e34ec3acd69a13d6d7215cd705edfc311435845
- criteria_sha256: 5236c5e00f71703afc98e3a77653d2c136b889ebd6f531bb3e226d4d8541993b
- as_built_sha256: 5dcd89391703de71a037b348b4957e510a1920ff05289785004060f00dfe1d97
- head: 7588ddf3a2609bbfedd05135d0693a072bef21ac
- runner: claude 2.1.295 (Claude Code) (role docs/roles/engineering/warden-security-privacy-engineer.md; tools Read,Grep,Glob)
- model: claude-fable-5-1
- at: 2026-10-09T21:00:14Z
- run: 1 of warden on MIG-7
- tokens_input: 98
- tokens_cache_read: 582096
- tokens_cache_write: 85201
- tokens_output: 11971
- seconds: 159.8
- verdict: PASS

## Prompt

Venue: Claude Code, headless, started by `yarn review:run warden MIG-7`. You have Read, Grep, Glob only: you cannot edit or run anything.

You are warden, reviewing ticket MIG-7 in fresh context. You have not seen the builder's conversation and must not ask for it: judge only from the files.

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

# Warden review — MIG-7 auth-sdk-seam

Fresh context, files only. The adversary cast for this ticket: a future builder (human or agent) who reaches for the vendor SDK somewhere unreviewed; a browser bundle that pulls a server module; a removal that leaves a service-role path behind. The insider-with-credentials cases don't change here, since no auth flow's logic moved, only its imports.

## Criteria

**C1 — met.** `boundaries.js:161` restricts `@supabase/*` to the `auth` zone, and `boundaries.js:178-187` names `seed-users.ts` as the only exception, applied as a per-file override that swaps in the rule set with just that one restriction dropped (`boundaries.js:317-322`). The test lints 21 probe cases (7 paths × value, type, ssr import) and sees exactly one error each; it also confirms the exception still trips on an upward `@syn/auth` import. My own repo grep agrees: outside `packages/auth/src/` the only real importer is `seed-users.ts` (the test file holds probe strings, not imports).

**C2 — met.** `toolkit.json:164-199` adds six glob rows, a mason and a warden each for the seeder, `apps/*/lib/clients/supabase/**` and `packages/api/src/context.ts`. The `packages/auth/src/` importers sit under `**/auth/**` for both roles. The test asserts coverage with `matchesGlob` over the live importer list plus the three assessed files.

**C3 — met.** `toolkit.json:201-226` carries `stack.auth` with files, env, dependencies, boundaries, runbook. The test checks the verify chain contains `check-stack`, runs it clean on the repo, and runs it on a fixture tree with `packages/auth` gone and sees the expected failure. The byte-for-byte claim against the toolkit at `62d344b` is the builder's (`cmp` clean per the as-built); I had no toolkit copy inside the review's file set to compare, so I record it as claimed, not re-verified.

**C4 — met.** Exit 0, empty output, at the proving head.

**C5 — partly met, remainder deferred to Taylor per the practice.** The builder walked the signed-out paths: sign-in renders, proxy refresh runs per request, guarded route redirects, an invalid `sb-` cookie lands on sign-in with no visible error, and the browser chunks carry no `@syn/auth` server module and no secret. The signed-in half (sign in, reload, return after expiry, sign out, unverified → `/verify`) is not walked by anyone yet. The risk this leaves open is small: the only runtime change on that path is `client.ts:47` handing the same three values to `browser.ts:33`, which makes the same `createBrowserClient(url, anonKey, {cookieOptions})` call. The invalid-cookie leftover the builder notes (cookie stays set, `UNAUTHORIZED` logged server-side before the redirect) is pre-existing and on paths this ticket does not touch.

**C6 — met.** `browser.ts` imports `@supabase/ssr` and a type from `./context`; `context.ts` imports vendor types and `@syn/types`. Neither reads `process.env`. The test walks the relative import graph, pins the reachable set to those two files, allows only vendor and `@syn/types` externals, and checks `client.ts` imports `@syn/auth/browser` and not the barrel (`check-auth-seam.test.mjs:186-215`). The barrel still re-exports `admin` and `middleware` (`index.ts:33,40`), so that last assertion is the one that matters, and it's there.

## Non-negotiables

- **No RLS or migration change, no new admin read:** no migration or policy file is in the change set; `context.ts` and `get-request-context.ts` still build a `guest` context and an RLS client. Holds.
- **No user-scoped query through singleton `db`:** the two `db` uses (`packages/api/src/context.ts:52`, `get-request-context.ts:40`) are the pre-existing local `auth.users` stub write, unchanged. Holds.
- **No secret in the browser path:** `client.ts` reads only `NEXT_PUBLIC_*` literals; `browser.ts` reads nothing. Holds.
- **Behaviour unchanged:** holds as far as walked; see C5.
- **Exception named once, reached by both roles:** `boundaries.js:184` and `toolkit.json:164-175`. Holds.
- **check-stack byte-for-byte, no boundaries suppression:** no suppression file touches `boundaries/dependencies`; `packages/auth/eslint-suppressions.json` carries three `no-restricted-properties` entries for `cookies.ts`'s env reads, a repo-wide per-package pattern and explicitly MIG-15's scope. Byte-for-byte as claimed.

## Findings

**Should-fix**

1. `docs/developer-guides/authentication.md:347` and `:108-119`. The pitfalls row still tells a client-component author to "use `client.ts`", which `packages/auth/src/client.ts:12-18` says throws in the browser; the right answer is now `@syn/auth/browser`. A few lines up, the `AuthContext` section still says roles come from `public.users.role` with `admin` and `super_admin`, which contradicts `context.ts:5-10` and the house rule that no admin read exists. This guide loads on every auth change through `house-auth.md`, so a stale admin-role sentence is a path to someone building one. Both lines sit in sections this ticket edited, not in the marketing sections the as-built set aside.

**Consider**

2. `toolkit.json:203-212`. `stack.auth.files` does not list `packages/db/scripts/seed-users.ts`, although the runbook says the exception "goes with the module" (`remove-supabase-auth.md:8,19`). Marked removed, check-stack would catch the seeder only indirectly through `@supabase/supabase-js` in `packages/db/package.json`. Adding the file makes the removal check cover the one service-role caller outside the module.

3. `packages/config/eslint/boundaries.js:283`. `**/*.d.ts` is ignored, so a vendor type import in a declaration file passes lint. The C1 test's tracked-file scan is the backstop, provided `readImportedModules` reads `.d.ts`. Worth one probe in the test if it doesn't.

4. `packages/db/scripts/seed-users.ts:24`. A committed password for an account that, on the `local` tier, is created in the hosted staging auth project, and which C5 asks Taylor to type into that project. Pre-existing and outside this ticket's scope (the file's reads are MIG-18's), noted so the env move there can carry the password with it.

No Blocking finding. The three importers are each wrapped or named, the browser entry is provably free of server modules, and every control sits in lint or a test rather than in a comment.

VERDICT: PASS
