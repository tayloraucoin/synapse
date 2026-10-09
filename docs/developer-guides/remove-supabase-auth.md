# Remove Supabase Auth

Synapse's removal runbook for the auth module: what `@syn/auth` owns, what to delete and edit, and how `yarn check-stack` proves it gone. `toolkit.json`'s `stack.auth` entry names this file; fitted from the toolkit's `docs/runbooks/remove/supabase-auth.md` (MIG-7), and kept here rather than in the toolkit's byte-for-byte `docs/runbooks/` folder.

**Related docs:** [authentication.md](./authentication.md) · [rls.md](./rls.md)

> **Module:** `@syn/auth`, the one owner of the `@supabase/*` SDKs (`RESTRICTED_EXTERNAL` in `packages/config/eslint/boundaries.js`): the server, browser and admin client factories, the session refresh `apps/web/proxy.ts` calls, the session helpers, and the bridge from a signed-in person to the `AuthContext` the RLS client runs as. Its lists are the `auth` entry in `toolkit.json`'s `stack` block.
> **The one exception:** `packages/db/scripts/seed-users.ts` calls the GoTrue admin API from `@syn/db`; it goes with the module.

Synapse has no second identity source, so removing this module means building one first. Every RLS policy reads the user id the RLS client sets from the `AuthContext` this module returns; until a new source returns one, every user-scoped query is refused.

## Files to delete

- `packages/auth/`, the whole package.
- `apps/web/proxy.ts`: it does nothing but refresh the session.
- `apps/web/lib/clients/supabase/`: the browser client.
- `apps/web/lib/auth/`: the request context, the verified-email gate, the redirect and error helpers.
- `apps/web/app/auth/` (the callback and confirm routes), `apps/web/app/(auth)/` and `apps/web/app/(auth-pending)/` (the sign-in, sign-up, forgot, invite, reset and verify screens), and `apps/web/app/logout/`.
- `packages/db/scripts/seed-users.ts`, with the `db:seed-users` script in `packages/db/package.json` and in the root `package.json`.

## Files to edit

- Every other file that imports `@syn/auth` (`git grep -l "@syn/auth" -- apps packages` lists them): the tRPC route and server caller, the asset route, the entry resolver, and the `@syn/api` services that call the admin client.
- `packages/api/src/context.ts`: take the person and the `AuthContext` from the new source; keep every user-scoped query on `ctx.rls.execute()`.
- `apps/web/next.config.ts`: `buildSupabaseEnvForNextConfig` and `@syn/auth` in `transpilePackages`.
- `apps/web/package.json` and `packages/api/package.json`: `@syn/auth`. `packages/db/package.json`: `@supabase/supabase-js`.
- `packages/config/eslint/boundaries.js`: `workspacePackage("auth", "auth")`, the `auth` key and every `"auth"` in `PACKAGE_IMPORTS` and `APP_IMPORTS`, the `@supabase/*` entry in `RESTRICTED_EXTERNAL`, and its entry in `RESTRICTED_EXTERNAL_EXCEPTIONS`. Remove `auth` from the layer-order comment.
- `packages/config/eslint/process-env.js`: the exemption for `lib/clients/supabase/client.ts`.
- `toolkit.json`: the reviewer rows for `packages/db/scripts/seed-users.ts`, `apps/*/lib/clients/supabase/**` and the `@supabase/*` imports rows.
- `apps/web/AGENTS.md`, `docs/architecture/codebase-conventions.md` and `docs/developer-guides/authentication.md`: the lines that name the module.

## Variables

From `.env.example` and `turbo.json`, each with its `_STAGING` form: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SUPABASE_COOKIE_DOMAIN`, `SUPABASE_SERVICE_ROLE_KEY` and `SUPABASE_SECRET_KEY`. The pooler connection URLs are the database's and stay.

## Dependencies

`@syn/auth`, `@supabase/ssr` and `@supabase/supabase-js`. After deleting the folders, run `yarn install` so `yarn.lock` drops them.

## Vendor-side steps (the operator's)

1. In the Supabase dashboard, for each tier's project: under Authentication, delete the redirect URLs this app added and turn off the sign-in providers.
2. Delete the `NEXT_PUBLIC_SUPABASE_*`, `SUPABASE_SERVICE_ROLE_KEY*` and `SUPABASE_SECRET_KEY*` values from the hosting provider, and rotate the service-role key if it was ever shared.

## Verify

1. In `toolkit.json`, set `"removed": true` on the `auth` entry of the `stack` block.
2. `yarn check-stack` exits 0: no listed file, variable or dependency of the module is left.
3. `yarn check-refs` names the deleted paths this runbook still lists; add each to `tooling/refs-pending.json` as `"<deleted path>": "removed by docs/developer-guides/remove-supabase-auth.md"`.
4. `yarn verify` exits 0.
