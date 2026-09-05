# `@syn/db` — package-local rules

**Read the root [`AGENTS.md`](../../AGENTS.md) first**, then
[`SETUP.md`](SETUP.md) — it explains who owns `auth.users`, which is the thing
that causes headaches.

## The rule that outranks everything here

**An agent never runs `db:migrate`, `db:push`, `db:seed`, `db:setup`, or the
reset script against a hosted tier.** It authors the SQL and stops; a human
reads it and applies it. Migrations are one-way doors, and the review is the
door.

Three guards back that up: the reset script refuses any tier but `local`,
`DATABASE_ENVIRONMENT` defaults to `local`, and `.claude/settings.json` denies
the destructive commands outright.

## Before writing schema

Read [`../../docs/architecture/drizzle-orm-conventions.md`](../../docs/architecture/drizzle-orm-conventions.md)
— it is the **only** Drizzle syntax permitted, pinned against stale
agent-emitted forms — and
[`../../docs/ai-guides/db-and-rls-authoring.md`](../../docs/ai-guides/db-and-rls-authoring.md)
for the checklist.

## Rules

- **Supabase owns `auth`, `storage`, `realtime`, `vault`.** `drizzle.config.ts`
  pins `schemaFilter: ["public"]`. `src/schema/auth.ts` is a reference-only
  mirror so foreign keys resolve in TypeScript; never add a column to it, never
  write to it from the app.
- **RLS is deny-by-default and owner-private.** Use
  `ownerPrivateCrudPolicies` unless the table is a shipped catalogue or system
  bookkeeping. **There is no admin-read policy and no factory that would make
  one.**
- **Every user-scoped query goes through `createRlsClient(...).execute()`.**
  The exported `db` connects as the table owner and bypasses every policy; it
  exists for the bridge itself and for system paths.
- **Migrations are append-only** and committed with `meta/`. Every hand-authored
  migration needs a `_journal.json` entry, or `db:migrate` reports success and
  applies nothing.
- **`0000` is hand-edited** to guard the `auth` schema. `drizzle-kit generate`
  reintroduces the unguarded form every time the first migration is
  regenerated — re-apply it, and re-check.
- **[`SCHEMA_REFERENCE.md`](SCHEMA_REFERENCE.md) is generated** by
  `yarn db:schema-reference`. Never hand-edited; regenerate after a schema
  change.
