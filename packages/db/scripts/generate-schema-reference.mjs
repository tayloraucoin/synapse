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
      "The shadow `users` table mirrors `auth.users` (Supabase Auth is the source of truth for identity). Its row is created by the `handle_new_user()` trigger, never by the app. `user_avatars` is the optional account photo, keyed by `user_id` because there is exactly one per person.",
    files: ["auth.ts", "enums.ts", "user/users.ts", "user/user-avatars.ts"],
  },
  {
    title: "GROUP 2 — LIBRARY",
    intro:
      "What a person keeps: the habits they might do, the categories those group into, and the reasons a miss can be attributed to. Nothing here is ever hard-deleted except a category, which unassigns.",
    files: [
      "library/categories.ts",
      "library/habits.ts",
      "library/reasons.ts",
    ],
  },
  {
    title: "GROUP 3 — PLAN",
    intro:
      "The shapes a day can take. A template holds slots at offsets from its anchor; a day is one date in the person's stored zone, snapshotting the time rules it was created under. There is no `week_plans` table — week status is derived from the week's days.",
    files: ["plan/templates.ts", "plan/template-slots.ts", "plan/days.ts"],
  },
  {
    title: "GROUP 4 — DAY",
    intro:
      "The record. `day_items` is the row the execution tabs render, snapshotting its habit's title, icon, unit, axes and preflight note so a past day reads as it was lived. Timer sessions, misses and shifts are what happened to it.",
    files: [
      "day/day-items.ts",
      "day/timer-sessions.ts",
      "day/shifts.ts",
      "day/misses.ts",
    ],
  },
  {
    title: "GROUP 5 — NOTIFICATIONS",
    intro:
      "Web Push subscription endpoints — one row per browser that agreed to reminders — and one preference row per reminder kind the person has an opinion about. A missing preference row means the catalogue default (`NOTIFICATION_CATALOGUE` in `@syn/constants`).",
    files: [
      "notification/web-push-subscriptions.ts",
      "notification/notification-prefs.ts",
    ],
  },
  {
    title: "GROUP 6 — SYSTEM",
    intro:
      "Bookkeeping a person creates but does not browse: a request to export everything, and a message sent from About. `feedback_messages` is the one table in this schema that is not owner-private — insert-only for its author, readable by nobody through the app.",
    files: ["system/data-exports.ts", "system/feedback-messages.ts"],
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

**Group 1 — Auth & Users.** \`users\` is the shadow of \`auth.users\` — its primary key **is** the foreign key, and the row is created by the \`handle_new_user()\` trigger, never by the app. It carries every account scalar: timezone, day-close and review-reminder times, theme, display name, the usual wake time, the week-build reminder's day and time, the first-run resume point, the deferred-settings pending pair, and \`wake_anchor_habit_id\`. \`user_avatars\` is the optional photo, keyed by \`user_id\` — one per person, no surrogate id. Deleting the auth user cascades through this row to everything.

**Group 2 — Library.** What a person keeps, independent of any day. \`habits\` is the reusable definition (type, title, icon, the duration range, the 1–7 life priority, the quantity unit, the reflection axes); \`categories\` group them for reporting only, never for a mechanic; \`reasons\` is the per-person, editable set a miss is attributed from, seeded from \`DEFAULT_REASONS\`. Habits, templates and reasons archive; only a category is deleted, and it unassigns.

**Group 3 — Plan.** \`templates\` is a named day plan whose \`template_slots\` sit at **offsets** from an anchor, which is what lets one template be applied at 06:00 or 08:00 and what makes shift-forward cheap. \`days\` is one calendar date in the person's stored zone; it snapshots \`timezone\` and \`day_close_time\` so a later settings change cannot re-key or re-window a past day.

**Group 4 — Day.** The record, and the part of the schema that is deliberately append-and-annotate. \`day_items\` snapshots \`title\`, \`icon\`, \`quantity_unit\`, \`reflection_axes\` and \`notes_preflight\` at materialisation; \`original_scheduled_start\` is immutable once set, enforced by a trigger. \`timer_sessions\` record time (a manual entry is marked as one), \`misses\` record how one undone item was attributed, \`shifts\` record a whole-day move.

**Group 5 — Notifications.** \`web_push_subscriptions\` holds one row per browser that agreed to reminders (endpoint + p256dh + auth, plus platform and revocation); the scheduler reads it. \`notification_prefs\` holds one row per kind the person has an opinion about — a missing row means the §8.2 default.

**Group 6 — System.** \`data_exports\` tracks a request to export everything (preparing → ready → expired, with the object path and a 24-hour expiry). \`feedback_messages\` is the About message: insert-only for its author, no authenticated read, and it holds only the message plus the two optional context fields the switch controls.

**Deliberately not here** (official spec §3.11): no streak, no score cache — the number is computed on read — no social graph, and no coach output table. There is also no \`week_plans\` table: a week's status is derived from its days. And no \`habits.is_wake_anchor\`: "at most one per user" is a fact about the person, so \`users.wake_anchor_habit_id\` is its one home.`;
}

function buildRelationshipSummary() {
  return `## 2. ENTITY RELATIONSHIP SUMMARY

**The one central entity.** \`users\`. Synapse is single-player: there is no couple, no team, no shared row. **Every table hangs directly off this one** and carries its own denormalised \`user_id\`, so every policy is the same three lines and every table is greppable for its owner — no policy ever subqueries another RLS-guarded table.

**One-to-many from \`users\`.** \`categories\`, \`habits\`, \`reasons\`, \`templates\`, \`template_slots\`, \`days\`, \`day_items\`, \`timer_sessions\`, \`shifts\`, \`misses\`, \`notification_prefs\`, \`web_push_subscriptions\`, \`data_exports\`, \`feedback_messages\`. **One-to-one:** \`user_avatars\`.

**The ownership chains** (each child also carries \`user_id\` directly): \`categories\` → \`habits\` → \`template_slots\` → \`day_items\`; \`templates\` → \`template_slots\` and \`templates\` → \`days\` → \`day_items\` → { \`timer_sessions\`, \`misses\` }; \`days\` → \`shifts\` → \`misses\`.

**Two references that are not ownership.** \`users.wake_anchor_habit_id\` → \`habits\` (the anchor's one home, \`set null\`), and \`day_items.carried_from_item_id\` / \`misses.traded_up_item_id\` → \`day_items\` (both \`set null\` — a record points at another record without owning it).

**Identity.** \`public.users.id\` = \`auth.users.id\`. One identity, two schemas, no drift, no join key to get wrong.

**Deletion.** \`auth.admin.deleteUser\` → cascade through \`public.users\` → everything, by cascade alone. The exceptions are deliberate: \`web_push_subscriptions.user_id\` is \`set null\` so a revoked endpoint stays reapable after the account is gone, and \`feedback_messages.user_id\` is \`set null\` so a message survives as anonymous.

\`\`\`
                       auth.users            (Supabase Auth owns this)
                            │  handle_new_user() trigger
                            ▼
                       public.users ─────────< user_avatars (1:1)
                            │
       ┌────────────────────┼────────────────────┬──────────────────┐
       │                    │                    │                  │
   categories           templates             reasons        notification_prefs
       │                 │      │                              web_push_subscriptions
       ▼                 ▼      ▼                                data_exports
    habits ──────< template_slots  days                        feedback_messages
       │                 │          │  │
       └────────┬────────┘          │  └──< shifts
                ▼                   │           │
            day_items <─────────────┘           │
              │   │                             │
              │   └──< misses >─────────────────┘
              └──< timer_sessions
\`\`\``;
}

function buildEnumSection(enums) {
  const byDomain = {
    "Shared (root `enums.ts`)": [
      "item_type",
      "time_mode",
      "scheduling",
      "miss_tier",
      "category_color_key",
    ],
    "User": ["theme_preference"],
    "Plan": ["day_close_reason", "woke_at_source"],
    "Day": [
      "assignment_state",
      "completion_state",
      "item_origin",
      "timer_session_source",
      "miss_resolved_by",
    ],
    "Notifications": ["device_platform", "notification_kind"],
    "System": ["export_status"],
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

  const enumFiles = ["enum-values.ts", "enums.ts"];

  const code = enumFiles
    .map((rel) => `// packages/db/src/schema/${rel}\n${readSchemaFile(rel).trim()}`)
    .join("\n\n");

  return `## 3. ENUMS

${bullets}

Colocation rule (drizzle-orm-conventions §3): an enum used by one table lives in that table's file; by two tables in one directory, in that directory's \`enums.ts\`; by two directories, in the root \`enums.ts\`. The five shared enums are below; the rest live beside their table, and their source appears with that table in §4.

**Spelling is enforced, not reviewed.** Every enum's values are checked against the matching schema union in \`@syn/types\` by \`enumValues<Union>()\`: a typo fails the type-check, and so does an omission. That is what stops a value read from a row and a value chosen by a component from drifting apart.

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

  // Synapse has exactly three shapes. Anything not named here is the default,
  // which is owner-private CRUD — and that is the answer for all but two tables.
  let rls =
    "Owner-private CRUD (`ownerPrivateCrudPolicies`) — the person is the only reader and the only writer. See the inline declarations in the source above.";
  if (tableName === "auth.users") {
    rls = "Supabase Auth owns this table; it is mirrored here for FK resolution only and is never migrated.";
  } else if (tableName === "users") {
    rls =
      "Owner read and update. Insert and delete are denied to the authenticated role outright: `handle_new_user()` inserts, and deletion cascades from `auth.admin.deleteUser`.";
  } else if (tableName === "feedback_messages") {
    rls =
      "**The one table that is not owner-private.** Insert-only for the author (`WITH CHECK` the row's `user_id` is the caller's); select, update and delete are denied to the authenticated role. Nobody reads it through the app.";
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

### The other trigger: \`day_items_original_start_immutable\`

Official spec §3.7 says \`original_scheduled_start\` "never changes after materialisation" — it is where the ghost renders, and it is the half of the plan-versus-actual distinction that a late start or a shift must not erase. Setting it from \`NULL\` is materialisation writing it once; changing it afterwards raises:

\`\`\`
ERROR:  original_scheduled_start is immutable
\`\`\`

It is a trigger rather than a service rule for the same reason \`handle_new_user()\` is: four write paths update this table (the materialiser, the shift, a late start, TP-04 re-materialisation), and a rule enforced in four services holds until someone adds a fifth.

---

## 6. RLS NOTES

RLS is **enabled on every \`public\` table** by the same loop, deny-by-default. Policies are declared inline in the Drizzle schema files (\`pgPolicy\`, \`ownerPrivateCrudPolicies\`) and applied by migration.

**The access model has exactly one shape: owner-private.** The row's owner is the only reader and the only writer. There is no admin-read policy on any user-data table and no factory that would create one — \`ownerRowPolicies\`, \`coupleScopedPolicies\`, \`catalogAdminWritePolicies\`, and \`holderScopedPolicies\` were deliberately not carried over from Conscious Connections. This is the code form of the product's promise: *only you can see your data — not the people who built this.*

- **Owner-private CRUD:** every table but the two below — \`user_avatars\`, \`categories\`, \`habits\`, \`reasons\`, \`templates\`, \`template_slots\`, \`days\`, \`day_items\`, \`timer_sessions\`, \`shifts\`, \`misses\`, \`web_push_subscriptions\`, \`notification_prefs\`, \`data_exports\`.
- **Owner read/update, trigger insert, cascade delete:** \`users\` — the row is created by \`handle_new_user()\` and removed by cascade from \`auth.admin.deleteUser\`, so authenticated insert and delete are denied outright.
- **Insert-only for the author:** \`feedback_messages\` — the one table that is not owner-private. A person can send a message and cannot read anyone's, including their own; the builder reads it out of band through the service role. The trust line stays true because the row holds only the message and the two context fields the switch controls.
- **Service-role only:** reserved for system bookkeeping (\`serviceRoleOnlyPolicies\`). Nothing uses it yet.
- **Read-only catalogue:** reserved for tables the product ships rather than a person writes (\`catalogReadPolicies\`). Nothing uses it yet.

**Every table carries its own \`user_id\`, denormalised.** \`template_slots\`, \`day_items\`, \`timer_sessions\` and \`misses\` could each derive an owner through a parent, and none of them does: a policy that subqueries another RLS-guarded table re-evaluates that table's policy per row, and is the shape that silently breaks under Realtime later. A direct column keeps every policy three lines and every table greppable for its owner. The invariant the services owe in return: write the PARENT's \`user_id\`, never the caller's claim.

**Policies are only as good as the path.** Every user-scoped query must go through \`createRlsClient(...).execute()\`, which sets \`app.user_id\` / \`app.user_role\` and issues \`SET LOCAL role authenticated\` inside a transaction. The exported singleton \`db\` connects as the table owner and bypasses RLS entirely; it exists for the bridge itself and for system paths.

---

## 7. SUPABASE STORAGE BUCKETS

All three are **private**; a public bucket would be a URL anyone who has seen it could fetch forever. Declared, with their object policies, in \`supabase/setup/03_storage_buckets.sql\`.

| Bucket | Purpose | Public | Path convention | Limits |
|---|---|---|---|---|
| \`avatars\` | Account photo (official spec §9.8) | No | \`avatars/{user_id}/{uuid}.{ext}\` | ≤5 MB; jpeg/png/webp |
| \`icons\` | Custom habit icons (§3.3, §9.9) | No | \`icons/{user_id}/{uuid}.{ext}\` | ≤5 MB; jpeg/png/webp |
| \`exports\` | Data-export bundles (§7.6) | No | \`exports/{user_id}/{request_id}.zip\` | ≤100 MB; json/zip |

**A stored path is bucket-qualified** — \`icons/{user_id}/{uuid}.jpg\` is what \`habits.icon\` and \`user_avatars.storage_path\` hold, so one string fully identifies an object. Supabase's own key is the same path without the bucket segment; \`@syn/constants\` owns that grammar (\`buildAssetPath\`, \`parseAssetPath\`, \`toStorageKey\`) and is the only place the two forms are converted.

**The owner segment is what authorization matches on.** The server builds every path from the session's user id — a client never names one.

**How objects move (SET-3).** Writes go to a signed upload URL minted by \`asset.createUploadUrl\` at a server-chosen path. Reads of icons and avatars go through the session-gated route \`/api/assets/{bucket}/{user_id}/{file}\`, which checks the session, compares the owner segment, and streams with the service role — a foreign path answers **404, never 403**, so a probe learns nothing. Exports are the exception: a 24-hour signed URL, because the download opens in the system browser with no session cookie.

**Object policies deny everything to \`authenticated\`, and they are \`RESTRICTIVE\`.** Neither rail uses the storage client with a person's JWT, so there is nothing legitimate to permit. Restrictive rather than permissive matters: permissive policies are OR'd, so a permissive "deny" would be silently overridden by the first grant someone adds later; restrictive policies are AND'd and hold regardless. The service role bypasses RLS, which is why both rails still work.

---

## 8. SEED DATA SHAPE

\`yarn db:seed-users\` creates a smoke-test account through \`auth.admin.createUser\`, which fires \`handle_new_user()\` and produces the shadow row. Its address is a \`.test\` domain on purpose: it cannot resolve, so a stray verification email goes nowhere.

\`yarn db:seed\` refuses to run with \`NODE_ENV=production\`, finds that account by email, and gives it a working library:

| Function | Writes | Idempotent by |
|---|---|---|
| \`seedStarterLibrary\` | 2 categories (*Health* leaf, *Deep work* sky) and the 10 habits of Epic 1 FR-02, the first four in *Health*; sets \`users.wake_anchor_habit_id\` to the first | "already has habits → do nothing" |
| \`seedDefaultReasons\` | the 7 rows of official spec §3.10, \`built_in\`, with \`structural\` on \`chose_not_to\` and \`other\` | \`ON CONFLICT (user_id, key) DO NOTHING\` |
| \`seedMorningTemplate\` | one template *Morning* at 07:00 with the first five habits as \`fixed_time\` slots at offsets 0/2/10/30/60, durations at each range's midpoint, the wake-up slot \`hard\` | "already has a template → do nothing" |

Re-running the seed prints zeros across the board, which means idempotent rather than broken. **This is the only place the starter set is written as rows** — a real person gets the same \`STARTER_HABITS\` offered by SET-4's chooser and each one becomes a library entry only when they add it. The seed uses the singleton \`db\`, which bypasses RLS: correct for a system path with no session, and correct nowhere in the app.

---

## 9. SCHEMA DECISIONS LOG

- **\`public.users\` is a shadow, not a copy.** Its PK *is* the FK to \`auth.users(id)\`. One identity, two schemas, no join key to get wrong, and cascade deletion that actually removes everything.
- **The shadow row is written by a trigger, not by the app.** Signups go through Supabase Auth, often client-side, so there is no reliable server hook. The database guarantees the row exists before any FK needs it.
- **The whole of official spec §3 landed in one migration** (\`0001\`, SET-1), because §0.3 R4 says the schema is shaped for every phase from day one. Columns that Epic 2 and Epic 3 fill sit empty until then; that is cheaper than three one-way doors.
- **\`wake_anchor_habit_id\` is the wake anchor's one home,** with \`REFERENCES habits(id) ON DELETE SET NULL\`. Official §3.3's \`habits.is_wake_anchor\` is not a column: "at most one per user" is a fact about the person, and one column enforces it structurally where two would need syncing.
- **No \`week_plans\` table.** Official §3.6 lists one whose only content is a status derivable from the week's days. \`WeekPlanStatus\` is computed by the week read model.
- **No \`shifts.cut_item_ids[]\`.** A cut item is a \`day_items\` row with \`assignment_state = cut_by_shift\` plus a \`misses\` row pointing at the shift, so changing one attribution in the Day Review edits one row and the shift's own record stays untouched.
- **\`days\` snapshots \`timezone\` and \`day_close_time\`; \`day_items\` snapshots \`title\`, \`icon\`, \`quantity_unit\`, \`reflection_axes\` and \`notes_preflight\`.** A past day renders as it was lived even after the habit or the settings change.
- **Deferred settings use a pending pair on \`users\`.** A zone switch and a day-close change take effect from tomorrow, so writing them straight to the live column would reclassify "now" the moment they were saved.
- **\`web_push_subscriptions.user_id\` and \`feedback_messages.user_id\` are \`ON DELETE set null\`, not cascade.** A revoked endpoint stays reapable after the account is gone; a feedback message survives as anonymous. Every other table cascades, which is how account deletion removes everything by cascade alone.
- **\`notification_prefs\` and \`avatar\` (official spec §3.1) are satellite tables, not columns.** Both are lists rather than scalars.
- **The tier defaults to \`local\`.** Conscious Connections defaults to \`production\`; Synapse does not, because a shell with nothing set must not be able to reach the production database. See TECHNICAL-DECISIONS.

---

## 10. OPEN QUESTIONS & FLAGGED DECISIONS

- **${publicTableCount} tables is the whole Phase-1 model.** A later ticket that needs a column adds it as a normal migration with a logged deviation, not as a second domain migration by default.
- **\`feedback_messages\` readability is \`[PROVISIONAL — Taylor]\`.** The table is insert-only for its author and is read by the builder out of band. Confirm that is what you want; the row deliberately holds nothing from a person's list.
- **\`day_items.calendar_event_id\` is a Phase-2 seam.** The column exists so calendar import (official spec §4.7) is not a migration; nothing in Phase 1 writes it.
- **\`template_slots.multitask_group\` is enforced in the service, not the schema.** "Two slots sharing a start offset must share a group" cannot be a partial unique index, because the rule is *unless grouped*. SET-5 owns it, in the words TP-02 shows.
- **No Realtime publication.** Phase 2's offline/sync work decides whether any table is subscribed. If one is, its policies must use the dual-context helpers in \`rls/helpers.ts\` — a policy written against \`app.user_id\` alone denies every row to every subscriber, silently.
- **Storage object policies are not in this package.** The buckets are declared here; the object-level RLS lands with the first ticket that uploads a file (SET-3).`;
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
