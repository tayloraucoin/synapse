# Row-level security (RLS)

Auth context (`AuthContext`, session refresh, `buildAuthContext`) is documented in [authentication.md](./authentication.md).

## How enforcement works

1. **RLS enabled** on all `public` tables (deny-by-default) via `supabase/setup/02_apply_triggers_rls.sql` and `pgPolicy` in schema.
2. **Per-request bridge** — `createRlsClient()` in `packages/db/src/rls.ts` runs inside a transaction:
   - `set_config('app.user_id', …)`
   - `set_config('app.user_role', …)`
   - `SET LOCAL role authenticated` (or `service_role` for system paths)
3. **Policies** — `pgPolicy()` on each table, granted to `authenticated`, reading `current_setting('app.user_id')` and `current_setting('app.user_role')`.

The `postgres.<ref>` pooler user owns tables and would bypass RLS without `SET LOCAL role authenticated`.

## App user roles

Stored on `public.users.role`:

| Role | Meaning |
|------|---------|
| `guest` | Default authenticated user |
| `admin` | Marketing admin, elevated read |
| `super_admin` | Full escalation (use sparingly) |

`AuthContext` passes the role into `createRlsClient`. Service/webhook paths use `buildServiceRoleAuthContext()` → `SET LOCAL role service_role` (bypasses RLS).

## Policy patterns

Defined in `packages/db/src/schema/rls/standard-policies.ts` and applied per table:

| Pattern | Tables |
|---------|--------|
| Owner-only | `profiles`, `user_preferences`, `notifications`, … |
| Couple-scoped | `couples`, `agreements`, `chat_sessions`, … |
| Self-write, couple-read | `*_approvals` tables |
| Read-only catalog | `tools`, `subscription_plans`, `crisis_resources`, … |
| Service-role only | `safety_flags`, `billing_events` |
| Holder-scoped | `subscriptions` |

See `packages/db/SCHEMA_REFERENCE.md` §6 for the full per-table intent.

## Authoring new policies

1. Pick a builder from `standard-policies.ts` or add a custom `pgPolicy` in the table file.
2. `yarn db:generate` → review SQL → `yarn db:migrate`.
3. Test via `rls.execute()` in a tRPC `protectedProcedure` path — not the singleton `db` export.

## Admin verification

`apps/web` admin routes check `users.role IN ('admin', 'super_admin')` via `verify-admin.ts`.
