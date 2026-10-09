# As-built — MIG-7

## Shipped against the contract

- C1: `@supabase/*` joins `RESTRICTED_EXTERNAL` in `packages/config/eslint/boundaries.js` with `auth` as its only owner. `RESTRICTED_EXTERNAL_EXCEPTIONS` names one file, `packages/db/scripts/seed-users.ts`, and its override drops only that module's restriction. The test finds no other importer, and a value, type or `@supabase/ssr` import in seven probe paths across `apps/web`, `@syn/api`, `@syn/db` and `@syn/utils` is a `lint:boundaries` error.
- C2: six glob rows in `toolkit.json`, a mason and a warden for each of `packages/db/scripts/seed-users.ts`, `apps/*/lib/clients/supabase/**` and `packages/api/src/context.ts`. Every importer in `packages/auth/` was already reached by `**/auth/**`.
- C3: `stack.auth` in `toolkit.json` (files, env, dependencies, boundaries, runbook). `tooling/check-stack.ts` is the toolkit's at `62d344b`, byte for byte (`cmp` clean), and `yarn check-stack` runs in verify after `check-refs`, as in the toolkit. The test also runs it on a tree with `packages/auth` gone and sees it fail.
- C4: `yarn lint:boundaries` is green over the repo.
- C5: walked without signing in (the sign-in screen, the proxy refresh on every request, the guarded redirect, an invalid session cookie, the browser chunks). The signed-in walk is Taylor's: `evidence/C5-walk.md`.
- C6: `@syn/auth/browser` (`src/browser.ts`) reaches only `./context`'s types and `@supabase/ssr`, and `apps/web/lib/clients/supabase/client.ts` imports it rather than the barrel.
- The importers: `client.ts` keeps its literal `NEXT_PUBLIC_*` reads and hands them to `createBrowserClientFromCredentials`. `packages/api/src/context.ts` and the two `apps/web/lib/auth/` files take `AuthClient` and `AuthUser` from `@syn/auth`. `seed-users.ts` is the named exception, and its header says so.

## Deviations

- The code was in the tree before the Tickets gate's pre-flight. The first run read the unfilled contract, and the second FAILed MIG-7 for want of a criterion on the browser entry. C6 and the wider C5 came from that FAIL; the third run passed.
- [ASSUMPTION] MIG-15 is not in `depends_on`, although its own note asks for it. MIG-7 touches none of `cookies.ts`'s reads, and adding an unbuilt ticket would hold this one. The order written in the contract is MIG-7, then MIG-15 and MIG-19, which add MIG-7 to their own `depends_on` when they start.
- The runbook the stack entry names is `docs/developer-guides/remove-supabase-auth.md`, not the toolkit's `docs/runbooks/remove/` path. That folder is copied from the toolkit byte for byte (`.prettierignore`), and `validateStack` needs a file that exists.
- `@supabase/ssr` and `@supabase/supabase-js` left `apps/web/package.json`, and `@supabase/supabase-js` left `packages/api/package.json`: nothing there imports them now. `yarn.lock` lost the three workspace lines.
- `docs/developer-guides/authentication.md` gained the new exports and the hard rule. The guide's older stale sections (the marketing paths) are left as they were.
- [ASSUMPTION] The seam is the import. Method calls on the client the module returns (`supabase.auth.signInWithPassword` in the auth forms) stay where they are.

## Not verified

- C5, the signed-in walk (sign in, reload, the return after token expiry, sign out, the unverified account), is deferred to Taylor. Signing in sends the seeded password to the hosted staging Supabase project, which the builder does not do.
- The invalid-cookie walk left the bad `sb-` cookie set, and the settings page logs a `TRPCError: UNAUTHORIZED` before its redirect. Both happen with no cookie as well, on paths this ticket does not change at runtime.

## Next

Taylor walks C5's five steps; then MIG-15 and MIG-19 start with MIG-7 in their `depends_on`.
