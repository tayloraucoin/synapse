#!/usr/bin/env node
/* global console */
/**
 * Regenerate packages/db/SCHEMA_REFERENCE.md from live Drizzle schema sources.
 *
 * Usage: node scripts/generate-schema-reference.mjs
 *        yarn db:schema-reference  (from packages/db)
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PKG_ROOT = join(__dirname, "..");
const SCHEMA_ROOT = join(PKG_ROOT, "src", "schema");
const OUT_PATH = join(PKG_ROOT, "SCHEMA_REFERENCE.md");

const GROUPS = [
  {
    title: "GROUP 1 — AUTH & USERS",
    intro:
      "The shadow `users` table mirrors `auth.users` (Supabase Auth is the source of truth for identity). Its row is created by the `handle_new_user()` trigger, never by the app.",
    files: ["auth.ts", "enums.ts", "user/users.ts"],
  },
  {
    title: "GROUP 2 — NOTIFICATIONS",
    intro:
      "Web Push subscription endpoints — one row per browser that agreed to reminders. Read by the scheduler; owner-private.",
    files: ["notification/web-push-subscriptions.ts"],
  },
];

function readSchemaFile(relPath) {
  const abs = join(SCHEMA_ROOT, relPath);
  return readFileSync(abs, "utf8");
}

function extractTableNames(source) {
  const names = [];
  const re = /pgTable\(\s*["']([^"']+)["']/g;
  let m;
  while ((m = re.exec(source)) !== null) names.push(m[1]);
  return names;
}

function extractAuthTableName(source) {
  const m = source.match(/authSchema\.table\(\s*["']([^"']+)["']/);
  return m ? `auth.${m[1]}` : null;
}

function extractFilePurpose(source, relPath) {
  const block = source.match(/^\/\*\*([\s\S]*?)\*\//);
  if (!block) return relPath;
  return block[1]
    .split("\n")
    .map((l) => l.replace(/^\s*\*\s?/, "").trim())
    .filter(Boolean)
    .join(" ");
}

function extractTablePurpose(source, tableName) {
  const marker = new RegExp(
    `/\\*[\\s\\S]*?\\* ${tableName.replace(/_/g, "[ _]")}[\\s\\S]*?\\*/`,
    "i",
  );
  const m = source.match(marker);
  if (m) {
    return m[0]
      .replace(/^\/\*\*?\s*/, "")
      .replace(/\s*\*\/$/, "")
      .split("\n")
      .map((l) => l.replace(/^\s*\*\s?/, "").trim())
      .filter(Boolean)
      .join(" ");
  }
  return extractFilePurpose(source, tableName);
}

function collectAllTables() {
  const tables = [];
  for (const group of GROUPS) {
    for (const rel of group.files) {
      const src = readSchemaFile(rel);
      for (const name of extractTableNames(src)) {
        tables.push({ name, file: rel, group: group.title });
      }
      const authName = extractAuthTableName(src);
      if (authName) tables.push({ name: authName, file: rel, group: group.title });
    }
  }
  return tables;
}

function collectEnums() {
  const enums = [];
  function walk(dir) {
    for (const entry of readdirSync(dir)) {
      const p = join(dir, entry);
      if (statSync(p).isDirectory()) {
        if (entry === "rls") continue;
        walk(p);
        continue;
      }
      if (!entry.endsWith(".ts") || entry === "index.ts") continue;
      const src = readFileSync(p, "utf8");
      const re = /pgEnum\(\s*["']([^"']+)["']/g;
      let m;
      while ((m = re.exec(src)) !== null) {
        enums.push({
          name: m[1],
          file: relative(SCHEMA_ROOT, p),
        });
      }
    }
  }
  walk(SCHEMA_ROOT);
  return enums;
}

function buildEntityOverview(tables) {
  const publicCount = tables.filter((t) => !t.name.startsWith("auth.")).length;
  return `## 1. ENTITY OVERVIEW

**${publicCount} tables** in \`public\`, plus a reference-only mirror of Supabase's \`auth.users\`. Grouped by domain.

**Group 1 — Auth & Users.** \`users\` is the shadow of \`auth.users\` — its primary key **is** the foreign key, and the row is created by the \`handle_new_user()\` trigger, never by the app. It carries the Phase-1 account scalars: timezone, day-close and review-reminder times, theme, display name, the first-run resume point, and \`wake_anchor_habit_id\` (no FK yet — \`habits\` does not exist). Deleting the auth user cascades this row away, which is how account deletion removes everything.

**Group 2 — Notifications.** \`web_push_subscriptions\` holds one row per browser that agreed to reminders (endpoint + p256dh + auth, plus platform and revocation). The scheduler reads it; the owner is the only person who can read or revoke it.

**Not here yet.** Every domain table — habits, categories, templates, template slots, week plans, days, day items, misses, shifts, reasons, timer sessions — belongs to the feature epics' tech spec and is built on the patterns in \`src/schema/rls/\`.`;
}

function buildRelationshipSummary() {
  return `## 2. ENTITY RELATIONSHIP SUMMARY

**The one central entity.** \`users\`. Synapse is single-player: there is no couple, no team, no shared row. Every table the feature epics add will hang off this one, and every one of them will be owner-private.

**One-to-many.** \`users\` → \`web_push_subscriptions\`.

**Identity.** \`public.users.id\` = \`auth.users.id\`. One identity, two schemas, no drift, no join key to get wrong.

**Deletion.** \`auth.admin.deleteUser\` → cascade through \`public.users\` → everything. \`web_push_subscriptions.user_id\` is \`ON DELETE set null\` rather than cascade, so a revoked endpoint can still be reaped by endpoint after the account is gone.

\`\`\`
                       auth.users            (Supabase Auth owns this)
                            │  handle_new_user() trigger
                            ▼
                       public.users
                            │
                            └──< web_push_subscriptions
\`\`\``;
}

function buildEnumSection(enums) {
  const byDomain = {
    "User": ["theme_preference"],
    "Notifications": ["device_platform"],
  };

  const enumSet = new Set(enums.map((e) => e.name));
  const bullets = Object.entries(byDomain)
    .map(([domain, names]) => {
      const present = names.filter((n) => enumSet.has(n));
      if (!present.length) return null;
      return `- **${domain}:** ${present.map((n) => `\`${n}\``).join(", ")}.`;
    })
    .filter(Boolean)
    .join("\n");

  const enumFiles = ["enums.ts", "user/users.ts", "notification/web-push-subscriptions.ts"];

  const code = enumFiles
    .map((rel) => `// packages/db/src/schema/${rel}\n${readSchemaFile(rel).trim()}`)
    .join("\n\n");

  return `## 3. ENUMS

${bullets}

Colocation rule (drizzle-orm-conventions §4): an enum used by one table lives in that table's file; by two tables in one directory, in that directory's \`enums.ts\`; by two directories, in the root \`enums.ts\`. Both enums below are one-table, so both live beside their table.

The domain enums the feature epics add (item type, time mode, scheduling, assignment state, completion state, miss tier, item origin) must keep the spelling of the schema unions in \`@syn/types\` — that is what stops a value read from a row and a value chosen by a component from drifting apart.

\`\`\`ts
${code}
\`\`\``;
}

function buildTableProse(tableName, source, relPath) {
  const purpose = extractTablePurpose(source, tableName) || extractFilePurpose(source, relPath);
  const indexes = [...source.matchAll(/index\(["']([^"']+)["']/g)].map((m) => m[1]);
  const uniqueIndexes = [
    ...source.matchAll(/uniqueIndex\(["']([^"']+)["']/g),
  ].map((m) => m[1]);
  const allIdx = [...new Set([...uniqueIndexes, ...indexes])];

  let rls = "See the inline `pgPolicy` / `ownerPrivateCrudPolicies` declarations in the source above.";
  if (tableName === "safety_flags") {
    rls = "SERVICE ROLE ONLY — neither partner can ever read it.";
  } else if (
    ["onboarding_questions", "subscription_plans", "crisis_resources", "prompt_templates"].includes(
      tableName,
    )
  ) {
    rls = "Read-only catalog for authenticated users; writes via seed/admin/service role.";
  } else if (tableName === "billing_events") {
    rls = "Service-role only (webhook ingestion).";
  } else if (tableName === "interest_submissions") {
    rls = "Anonymous insert for marketing forms; no client read.";
  }

  const idxBlock = allIdx.length
    ? `**INDEXES.**\n${allIdx.map((i) => `- \`${i}\``).join("\n")}`
    : "**INDEXES.** *(see source)*";

  return `#### \`${tableName}\`

**PURPOSE.** ${purpose}

${idxBlock}

**RLS.** ${rls}`;
}

function buildSchemaSection() {
  const parts = [
    `## 4. SCHEMA — TABLE BY TABLE`,
    "",
    "Each group shows the **complete Drizzle source** (tables, relations, indexes, and inline RLS policies — injected from the `.ts` files) followed by per-table PURPOSE / INDEXES / RLS prose.",
    "",
  ];

  for (const group of GROUPS) {
    parts.push(`### ${group.title}`);
    parts.push("");
    parts.push(group.intro);
    parts.push("");

    const codeChunks = [];
    const tableEntries = [];

    for (const rel of group.files) {
      const src = readSchemaFile(rel);
      codeChunks.push(`// packages/db/src/schema/${rel}\n${src.trim()}`);
      for (const tableName of extractTableNames(src)) {
        tableEntries.push({ tableName, source: src, relPath: rel });
      }
      const authName = extractAuthTableName(src);
      if (authName) {
        tableEntries.push({ tableName: authName, source: src, relPath: rel });
      }
    }

    parts.push("```ts");
    parts.push(codeChunks.join("\n\n"));
    parts.push("```");
    parts.push("");

    for (const { tableName, source, relPath } of tableEntries) {
      parts.push(buildTableProse(tableName, source, relPath));
      parts.push("");
    }
  }

  return parts.join("\n");
}

function buildTailSections(publicTableCount) {
  return `## 5. UPDATED_AT TRIGGER

A reusable function sets \`updated_at\` at the database level, so it never depends on app code remembering to:

\`\`\`sql
create or replace function public.update_updated_at_column()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
\`\`\`

\`supabase/setup/02_apply_triggers_rls.sql\` attaches it to every \`public\` base table that has an \`updated_at\` column, in a data-driven loop. A table added by a future migration is picked up the next time \`db:setup\` runs — there is no per-table edit to forget.

---

## 6. RLS NOTES

RLS is **enabled on every \`public\` table** by the same loop, deny-by-default. Policies are declared inline in the Drizzle schema files (\`pgPolicy\`, \`ownerPrivateCrudPolicies\`) and applied by migration.

**The access model has exactly one shape: owner-private.** The row's owner is the only reader and the only writer. There is no admin-read policy on any user-data table and no factory that would create one — \`ownerRowPolicies\`, \`coupleScopedPolicies\`, \`catalogAdminWritePolicies\`, and \`holderScopedPolicies\` were deliberately not carried over from Conscious Connections. This is the code form of the product's promise: *only you can see your data — not the people who built this.*

- **Owner-private CRUD:** \`web_push_subscriptions\`, and every domain table the feature epics add.
- **Owner read/update, trigger insert, cascade delete:** \`users\` — the row is created by \`handle_new_user()\` and removed by cascade from \`auth.admin.deleteUser\`, so authenticated insert and delete are denied outright.
- **Service-role only:** reserved for system bookkeeping (\`serviceRoleOnlyPolicies\`). Nothing uses it yet.
- **Read-only catalogue:** reserved for tables the product ships rather than a person writes (\`catalogReadPolicies\`). Nothing uses it yet.

**Policies are only as good as the path.** Every user-scoped query must go through \`createRlsClient(...).execute()\`, which sets \`app.user_id\` / \`app.user_role\` and issues \`SET LOCAL role authenticated\` inside a transaction. The exported singleton \`db\` connects as the table owner and bypasses RLS entirely; it exists for the bridge itself and for system paths.

---

## 7. SUPABASE STORAGE BUCKETS

All three are **private**. Objects are served through signed URLs; a public bucket would be a URL anyone could guess their way into.

| Bucket | Purpose | Public | Path convention | Limits |
|---|---|---|---|---|
| \`avatars\` | Account photo (official spec §9.8) | No | \`avatars/{user_id}/{uuid}.{ext}\` | ≤5 MB; jpeg/png/webp |
| \`icons\` | Custom habit icons (§3.3, §9.9) | No | \`icons/{user_id}/{uuid}.{ext}\` | ≤5 MB; jpeg/png/webp |
| \`exports\` | Data-export bundles (§7.6) | No | \`exports/{user_id}/{request_id}.zip\` | ≤100 MB; json/zip |

The first path segment is the owner id, which is what the storage RLS policies match on.

---

## 8. SEED DATA SHAPE

\`yarn db:seed\` refuses to run with \`NODE_ENV=production\` and currently seeds nothing — there are no domain tables. The Epic 1 track adds the starter habits and the default reason set (official spec §3.10) as seed functions.

\`yarn db:seed-users\` creates a smoke-test account through \`auth.admin.createUser\`, which fires \`handle_new_user()\` and produces the shadow row. Its address is a \`.test\` domain on purpose: it cannot resolve, so a stray verification email goes nowhere.

---

## 9. SCHEMA DECISIONS LOG

- **\`public.users\` is a shadow, not a copy.** Its PK *is* the FK to \`auth.users(id)\`. One identity, two schemas, no join key to get wrong, and cascade deletion that actually removes everything.
- **The shadow row is written by a trigger, not by the app.** Signups go through Supabase Auth, often client-side, so there is no reliable server hook. The database guarantees the row exists before any FK needs it.
- **\`wake_anchor_habit_id\` has no foreign key yet.** \`habits\` does not exist; the feature tech spec's first migration adds \`REFERENCES habits(id) ON DELETE SET NULL\`.
- **\`web_push_subscriptions.user_id\` is \`ON DELETE set null\`, not cascade.** A revoked endpoint stays reapable by endpoint after the account is gone, instead of vanishing with the push service never told.
- **\`notification_prefs\` and \`avatar\` (official spec §3.1) are not columns here.** Both are lists rather than scalars, so both are satellite tables the feature epics define.
- **The tier defaults to \`local\`.** Conscious Connections defaults to \`production\`; Synapse does not, because a shell with nothing set must not be able to reach the production database. See TECHNICAL-DECISIONS.

---

## 10. OPEN QUESTIONS & FLAGGED DECISIONS

- **${publicTableCount} tables is the whole foundation.** Every domain table is out of scope here by design; they arrive with the feature epics' tech spec, built on the patterns in \`src/schema/rls/\`.
- **No Realtime publication.** Phase 2's offline/sync work decides whether any table is subscribed. If one is, its policies must use the dual-context helpers in \`rls/helpers.ts\` — a policy written against \`app.user_id\` alone denies every row to every subscriber, silently.
- **Storage object policies are not in this package.** The buckets are declared here; the object-level RLS lands with the first ticket that uploads a file.`;
}

function main() {
  const tables = collectAllTables();
  const publicTableCount = tables.filter((t) => !t.name.startsWith("auth.")).length;
  const enums = collectEnums();

  const doc = [
    `# Synapse — Database Schema Reference`,
    ``,
    `**Product:** Synapse — a private habit and day planner (Phase 1)`,
    `**Stack:** Turborepo · Next.js · TypeScript · DrizzleORM · PostgreSQL · Supabase`,
    `**Package:** \`@syn/db\` (\`packages/db\`)`,
    `**Status:** Generated reference synced to \`packages/db/src/schema/\`. The Drizzle code in §4 is injected verbatim from the \`.ts\` files.`,
    ``,
    `> **Conventions (enforced everywhere):** UUID PKs via \`defaultRandom()\`; \`created_at\` + \`updated_at\` TIMESTAMPTZ on every table; snake_case columns; snake_case plural tables; \`pgEnum\` for status/type/state; explicit FKs with \`onDelete\`; \`auth.users\` is the auth source (never store passwords). Every user-data table is **owner-private**: the person is the only reader and the only writer, and there is no admin-read policy anywhere in this schema.`,
    ``,
    `---`,
    ``,
    buildEntityOverview(tables),
    ``,
    `---`,
    ``,
    buildRelationshipSummary(),
    ``,
    `---`,
    ``,
    buildEnumSection(enums),
    ``,
    `---`,
    ``,
    buildSchemaSection(),
    ``,
    `---`,
    ``,
    buildTailSections(publicTableCount),
    ``,
  ].join("\n");

  writeFileSync(OUT_PATH, doc, "utf8");
  console.log(`Wrote ${OUT_PATH}`);
  console.log(`  ${publicTableCount} public tables, ${enums.length} enums`);
}

main();
