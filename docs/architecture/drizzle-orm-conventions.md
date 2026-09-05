# Drizzle ORM Conventions — Pinned Syntax Anchor

> **Pinned versions (root `package.json`):** `drizzle-orm@0.45.2`, `drizzle-kit@0.31.10`  
> **Never bump** these without updating this doc and re-validating every schema file in `@syn/db`.

This document is the authoritative Drizzle syntax reference for Synapse. AI agents must follow it instead of training-data defaults from other Drizzle versions.

---

## 1. Package layout (`@syn/db`)

- Schema lives in `packages/db/src/schema/` — **one file per table**, grouped in domain folders (`user/`, `relationship/`, `tool/`, `profile/`, `chat-session/`, `agreement/`, `billing/`, `notification/`, `safety/`, `future/`), each barrelled by `index.ts`. Cross-directory `pgEnum`s in root `enums.ts`; Supabase `auth.users` shadow in `auth.ts`.
- Runtime singleton: `src/client.ts` (`DATABASE_URL`, txn pooler `:6543`, `prepare: false`).
- Migrations tooling only: `src/migrate-client.ts` (`DIRECT_DATABASE_URL`, port `:5432`) — **never imported at runtime**.
- RLS bridge: `src/rls.ts` — `createRlsClient(authContext)` from `@syn/types`.
- Migrations output: `packages/db/migrations/` — committed, append-only.
- Supabase platform SQL: `packages/db/supabase/setup/` — triggers, RLS enablement, storage buckets (run after migrations).
- Config: `packages/db/drizzle.config.ts` — uses `DIRECT_DATABASE_URL`, `schemaFilter: ['public']`.

---

## 2. Imports (drizzle-orm@0.45.2)

```ts
// Table / column builders
import {
  pgTable,
  pgEnum,
  uuid,
  text,
  timestamp,
  boolean,
  integer,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

// Relations
import { relations } from "drizzle-orm";

// Query helpers
import { eq, and, or, sql } from "drizzle-orm";

// Runtime client (postgres-js driver)
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

// Migrator (migrate scripts only — not runtime)
import { migrate } from "drizzle-orm/postgres-js/migrator";
```

```ts
// drizzle-kit (dev / CI only)
import { defineConfig } from "drizzle-kit";
```

---

## 3. Enums (colocation rule)

Place each `pgEnum` at the narrowest scope that matches its usage:

| Scope | Location | Example |
| --- | --- | --- |
| One table only | In that table's file, above the table | `onboardingIntentEnum` in `user/users.ts` |
| 2+ tables in one domain folder | `enums.ts` in that folder | `planScopeEnum` in `billing/enums.ts` |
| 2+ domain folders | Root `schema/enums.ts` | `notificationTypeEnum`, `aiTouchpointEnum`, `verticalEnum` |

```ts
import { pgEnum } from "drizzle-orm/pg-core";

export const chatSessionParticipantModeEnum = pgEnum("chat_session_participant_mode", [
  "joint",
  "solo",
]);
```

Use the enum column builder: `chatSessionParticipantModeEnum("participant_mode").notNull()`.

---

## 3b. Import extensions

Relative imports **omit file extensions** — TypeScript resolves `.ts` sources via `moduleResolution: Bundler` (packages/apps) or `NodeNext` (base):

```ts
import { users } from "../user/users";
```

---

## 3c. jsonb shape comments

Every `jsonb` column gets a comment naming the expected interface and its future `@syn/types` home:

```ts
// JSON shape: ReferralUtm — see @syn/types (src/domain/billing.ts)
utm: jsonb("utm"),
```

Scaffold the actual TypeScript interfaces in `@syn/types` separately; the schema comment is the contract.

---

## 4. Tables

- **Table names:** snake_case in Postgres (`couples`, `couple_members`).
- **TS exports:** camelCase table constants (`couples`, `coupleMembers`).
- **Column names:** snake_case in DB via explicit `columnName` when the TS key is camelCase.
- **File layout:** one table (+ its `relations()`) per file, e.g. `schema/relationship/couple-members.ts`.
- **Column order** (blank line between each block):
  1. `id`, `createdAt`, `updatedAt`
  2. non-FK properties, alphabetical by TS key
  3. foreign-key columns (those with `.references()`), alphabetical by TS key
- **Indexes/constraints:** use the **array-return** third argument to `pgTable` (object-return is deprecated since 0.36).

```ts
import { index, pgTable, uuid, timestamp } from "drizzle-orm/pg-core";

export const couples = pgTable(
  "couples",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),

    onboarded: boolean("onboarded").notNull().default(false),
    status: coupleStatusEnum("status").notNull().default("forming"),

    holderUserId: uuid("holder_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
  },
  (table) => [index("couples_holder_user_id_idx").on(table.holderUserId)],
);
```

- Primary keys: `uuid().defaultRandom().primaryKey()` unless a natural key is required.
- Timestamps: `timestamp(..., { withTimezone: true })` — always timezone-aware.
- Foreign keys: `.references(() => otherTable.id, { onDelete: "cascade" })` on the referencing column.
- Cross-file FK imports: use direct relative paths to the target table file (e.g. `../user/users`), never via a domain barrel.

---

## 5. Relations

Define in the **same file** as the parent table. Export from the domain barrel and top-level `schema/index.ts`. **Relation keys must be alphabetical** (same discipline as column ordering).

```ts
import { relations } from "drizzle-orm";

export const couplesRelations = relations(couples, ({ many }) => ({
  members: many(coupleMembers),
}));

export const coupleMembersRelations = relations(coupleMembers, ({ one }) => ({
  couple: one(couples, {
    fields: [coupleMembers.coupleId],
    references: [couples.id],
  }),
}));
```

---

## 6. Inferred row types

**`@syn/db` owns row types.** Never duplicate them in `@syn/types`.

```ts
import { couples, type Couple, type NewCouple } from "@syn/db";

// In schema file or index.ts:
export type Couple = typeof couples.$inferSelect;
export type NewCouple = typeof couples.$inferInsert;
```

Export `$inferSelect` / `$inferInsert` aliases from `packages/db/src/index.ts` for every public table.

---

## 7. Runtime client (singleton)

```ts
import { resolveRuntimeDatabaseUrl } from "./connection-env";

const sql = postgres(resolveRuntimeDatabaseUrl(), { prepare: false });
export const db = drizzle(sql, { schema });
```

- URLs resolved from `DATABASE_ENVIRONMENT` + tier vars — see `connection-env.ts`.
- **`prepare: false`** is mandatory over Supabase transaction pooler (`:6543`).

---

## 8. Migrate client (session pooler)

```ts
import { resolveMigrateDatabaseUrl } from "./connection-env";

const sql = postgres(resolveMigrateDatabaseUrl());
export const migrateDb = drizzle(sql, { schema });
```

Uses session pooler URL (`:5432`) via `resolveMigrateDatabaseUrl()`. Never import at runtime.

---

## 9. RLS bridge

`createRlsClient` accepts `AuthContext` from `@syn/types` and sets Postgres session variables inside a transaction:

```ts
await tx.execute(sql`SELECT set_config('app.user_id', ${authContext.userId}, true)`);
await tx.execute(sql`SELECT set_config('app.user_role', ${authContext.role}, true)`);
await tx.execute(sql.raw(`SET LOCAL role ${authContext.role === "service_role" ? "service_role" : "authenticated"}`));
```

RLS **policies** are defined via `pgPolicy()` colocated in schema files (see `schema/rls/`). `drizzle-kit generate` emits `CREATE POLICY` SQL.

---

## 10. drizzle-kit config

```ts
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/schema/index.ts",
  out: "./migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: resolveMigrateDatabaseUrl(),
  },
  schemaFilter: ["public"],
  entities: { roles: { provider: "supabase" } },
  strict: true,
  verbose: true,
});
```

### Commands (from repo root via Turbo)

| Script | Command | When |
| --- | --- | --- |
| `yarn db:generate` | `drizzle-kit generate` | After schema changes — emits SQL to `migrations/` |
| `yarn db:migrate` | `drizzle-kit migrate` | Apply pending migrations to the target DB |
| `yarn db:push` | `drizzle-kit push` | Throwaway schema sync — dev only, not production |
| `yarn db:setup` | Platform SQL (triggers, RLS enable, buckets) | After migrate |
| `yarn db:reset` | Local only: drop public + migrate + setup + seed | Local dev |
| `yarn db:seed-users` | Supabase Admin API test users | Before seed |

**Requires:** tier URLs in `packages/db/.env` per `connection-env.ts`.

---

## 11. Migrations workflow

1. Edit schema files in `src/schema/` (include `pgPolicy` for RLS changes).
2. `yarn db:generate` — review emitted SQL in `migrations/` (use an interactive terminal).
3. Commit `migrations/*.sql` and `migrations/meta/` together.
4. `yarn db:migrate` against the confirmed target.
5. `yarn db:setup` for platform SQL.

**Hand-authored SQL:** if step 2 is skipped, you must still append the migration tag to `migrations/meta/_journal.json` (see `docs/developer-guides/migrations.md` § Hand-authored migrations). Without a journal entry, `db:migrate` will not run the file.

### Reverting

- **Local:** `yarn db:reset`
- **Shared envs:** forward-fix with a new migration (append-only)
- **Unapplied migration:** `drizzle-kit drop`
- Never edit applied migrations on staging/production.

See `docs/developer-guides/migrations.md`.

---

## 12. What does NOT belong in `@syn/db`

| Belongs elsewhere | Examples |
| --- | --- |
| `@syn/api` | Business logic, `isSubscribed`, multi-step orchestration |
| `@syn/validators` | Zod schemas for forms / tRPC I/O |
| `@syn/types` | Domain/UI shapes not derivable from `$inferSelect` |
| Apps | Direct `db` imports in pages/components — use tRPC |

---

## 13. Agent checklist

1. Use syntax from **this doc** and `drizzle-orm@0.45.2` — not older `sqlite`/`mysql` patterns or Prisma habits.
2. One schema file per table, grouped in domain folders; barrel in `schema/index.ts`.
3. Column order: `id`/`createdAt`/`updatedAt` → properties → FKs; array-return `pgTable` extra config; alphabetical `relations()` keys.
4. Enum colocation: inline → domain `enums.ts` → root `enums.ts` (see §3).
5. jsonb columns: comment the expected `@syn/types` shape (see §3c).
6. Relative imports: no file extensions (see §3b).
7. Export row types via `$inferSelect` / `$inferInsert` from `src/index.ts`.
8. Runtime client: singleton, `prepare: false`, pooled URL.
9. Migrations: direct URL, never at runtime; hand-edit first migration for `CREATE SCHEMA IF NOT EXISTS "auth"`.
10. Do not bump Drizzle versions without developer approval.
