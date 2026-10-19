# FLO-2 — The `workflow/` schema domain and migration `0011_workflow`: six tables, one enum, the two partial unique indexes, owner-private policies, row types, the schema reference

**Epic:** FLO — Workflow · **Phase 1** · Size: M
**Slice type:** Schema and one additive migration — a one-way door. The risk class is *a table without all four owner policies*, *a foreign key whose on-delete quietly deletes a person's tasks*, and *a migration applied where an agent may not apply one*.

**Status:** Complete (2026-10-03)

> **Mason — migration review; a human reads the SQL.** Before FLO-3 starts, read `0011_workflow.sql` and confirm: six `CREATE TABLE`s and nothing that alters an existing table; every table has `user_id uuid NOT NULL` referencing `users(id)` `ON DELETE CASCADE`; `workflow_tasks.column_id` is `ON DELETE RESTRICT`, `group_id` is `ON DELETE SET NULL`, `view_id` is `ON DELETE CASCADE`; the two partial unique indexes exist on `workflow_columns (view_id)`; each table has exactly four policies (`_select`, `_insert`, `_update`, `_delete`) to `authenticated` and row-level security enabled; the journal has the `0011_workflow` tag with `when` after `0010`'s. State that the migration was applied to the local tier only, or to none.

---

## Outcome

The database can hold a person's Workflow: groups, views, each view's columns, tasks, saved templates, and the groups pinned first for a given day — every row private to its owner by policy, every table cascading away with the account. `packages/db` exports the tables and their row types, and `SCHEMA_REFERENCE.md` describes them. **Nothing reads or writes these tables yet (FLO-3), and the migration is applied to no hosted tier by this ticket or any other.**

## Why / intent

- **TD-33, TD-34** — the names and the shapes. The on-delete semantics are the design: `restrict` on `column_id` is what makes WF-04's *Move its tasks first* a property rather than a promise.
- **TD-34's two partial unique indexes** — W11's *at most one of each role per view*, held by the database.
- **TD-36** — firing is `firing_started_at`; there is no boolean.
- **TD-37** — `workflow_day_pins` is keyed by `(user_id, day_key)`.
- **TD-46** — one additive migration, `0011_workflow`, queued behind `0009` and `0010`.
- **`../README.md` rule 1** — one table per file with its `relations()`; every user-data table carries a denormalised `user_id` and `ownerPrivateCrudPolicies`; there is no other shape.
- **`drizzle-orm-conventions.md`** — the only permitted syntax: column order (`id`, `createdAt`, `updatedAt` · properties alphabetical by TS key · foreign keys alphabetical), array-return extra config, alphabetical relation keys, timezone-aware timestamps, a shape comment on every `jsonb`.
- **Ground truth (consumed):** `packages/db/src/schema/library/reasons.ts` and `links.ts` (the pattern: `sort_order smallint`, `archived_at`, the index on `user_id`); `categoryColorKeyEnum` in `packages/db/src/schema/enums.ts` (a group's hue — reused, not redeclared); `packages/db/src/schema/enum-values.ts` (the parity helper between a `pgEnum` tuple and its `@syn/types` union); `ownerPrivateCrudPolicies` in `schema/rls/standard-policies.ts`.
- **FLO-1** — `WorkflowColumnRole` and `WorkflowTemplateColumn`, which the enum and the jsonb comment name.
- **What this slice is NOT (binding):** a service, a seed of the starter views (TD-41: ensured on first read, FLO-3), a change to any existing table, a `supabase/setup` change, a Realtime publication.

**Rulings this slice makes (labelled, logged):**

- **`workflow_column_role` is declared in `workflow-columns.ts`**, not in a domain `enums.ts` — one table uses it (drizzle-conventions §3). The assessment §4's file list shows an `enums` file; the colocation rule wins. Logged.
- **`workflow_columns.role` is nullable; no third enum value means "none".** Logged.
- **`workflow_tasks` indexes:** `(user_id)`, `(view_id, column_id, group_id, sort_order)` for the board read, `(user_id, archived_at)`. `workflow_columns`: `(view_id, sort_order)`. `workflow_groups`, `workflow_views`: `(user_id, sort_order)`. Logged.
- **`sort_order` carries no unique constraint** — a dense rewrite inside a transaction passes through duplicates, and a deferred constraint is not in the pinned syntax. The service is the only writer (TD-35). Logged.
- **`workflow_day_pins.day_key` is a `date`**, matching `days`' key column; `group_ids` is `jsonb` with the comment `// JSON shape: string[] — group ids, newest pin first`. Logged.

## Behaviour & states

**No surface.** Described by the schema.

| Table | Columns (beyond `id`, `created_at`, `updated_at`, `user_id`) |
|---|---|
| `workflow_groups` | `archived_at` timestamptz null · `collapsed` boolean not null default false · `hue` `category_color_key` not null · `name` text not null · `sort_order` smallint not null |
| `workflow_views` | `archived_at` timestamptz null · `last_opened_at` timestamptz null · `name` text not null · `sort_order` smallint not null |
| `workflow_columns` | `name` text not null · `role` `workflow_column_role` null · `sort_order` smallint not null · **FK** `view_id` → `workflow_views.id` cascade |
| `workflow_tasks` | `archived_at` timestamptz null · `closed_at` timestamptz null · `firing_started_at` timestamptz null · `last_returned_at` timestamptz null · `note` text null · `sort_order` smallint not null · `title` text not null · **FK** `column_id` → `workflow_columns.id` **restrict** · `group_id` → `workflow_groups.id` **set null** (nullable) · `view_id` → `workflow_views.id` cascade |
| `workflow_templates` | `archived_at` timestamptz null · `columns` jsonb not null (`// JSON shape: WorkflowTemplateColumn[] — see @syn/types (src/domain/workflow.ts)`) · `name` text not null |
| `workflow_day_pins` | `day_key` date not null · `group_ids` jsonb not null · unique `(user_id, day_key)` |

Partial unique indexes: `workflow_columns_view_id_active_idx` on `(view_id) WHERE role = 'active'`; `workflow_columns_view_id_done_idx` on `(view_id) WHERE role = 'done'`.

Relations (alphabetical keys): each table → `user`; `workflowViews` → `columns`, `tasks`; `workflowColumns` → `tasks`, `view`; `workflowGroups` → `tasks`; `workflowTasks` → `column`, `group`, `view`.

**States (exhaustive, a task row):** open (`closed_at`, `archived_at` null) · firing (`firing_started_at` set) · closed (`closed_at` set) · archived (`archived_at` set). The schema permits any combination; FLO-3's services keep them coherent.

**Failure / edge states:** `db:generate` blocked or emitting something other than six creates → author the SQL by hand with its journal entry and log it (`db-and-rls-authoring.md` § Hand-authored migration checklist) · the drizzle snapshot for `0010` missing or stale → stop and say so; do not regenerate earlier snapshots.

## Non-negotiables (this slice)

- **Stop before `db:migrate` on any hosted tier.** `db:push` and `db:reset` are not run against staging or production. The local tier only, and say which.
- **Additive only.** `0011` creates; it alters and drops nothing.
- **Every table: `user_id`, its index, and `ownerPrivateCrudPolicies`.** No admin-read policy, no other shape.
- **The pinned Drizzle syntax, to the letter.** No version bump.
- **No hue enum of this epic's own.** `categoryColorKeyEnum` is imported.
- **`0004`–`0010` are not edited.**

## Data & AI

**Schema changes: described above. Human-review the migration.**

**Tables:** the six, created.

**Placement:** `packages/db/src/schema/workflow/{workflow-groups,workflow-views,workflow-columns,workflow-tasks,workflow-templates,workflow-day-pins,index}.ts`; `packages/db/src/schema/index.ts`; `packages/db/src/index.ts` (row type pairs: `WorkflowGroup`/`NewWorkflowGroup`, `WorkflowViewRow`/`NewWorkflowViewRow`, `WorkflowColumn`/`NewWorkflowColumn`, `WorkflowTask`/`NewWorkflowTask`, `WorkflowTemplate`/`NewWorkflowTemplate`, `WorkflowDayPin`/`NewWorkflowDayPin`); `packages/db/migrations/0011_workflow.sql` + `meta/_journal.json` + the snapshot; `packages/db/SCHEMA_REFERENCE.md` (regenerated). Rules 1 and 2; Mason, TD-33, TD-34, TD-46.

**tRPC / validators:** none.

**AI notes:** **None.**

## Accessibility

**None — no surface in this slice.**

## Acceptance criteria (observable — the SQL file, the journal, and the local tier)

1. `packages/db/migrations/0011_workflow.sql` contains six `CREATE TABLE` statements, for exactly the six names above, and no `ALTER TABLE` on, or `DROP` of, a table that existed before it. *(Mason.)*
2. In that SQL every one of the six tables has a `user_id` foreign key to `users` with `ON DELETE cascade`.
3. `workflow_tasks` has `column_id … ON DELETE restrict`, `group_id … ON DELETE set null`, `view_id … ON DELETE cascade`. *(Mason.)*
4. The SQL creates two unique indexes on `workflow_columns ("view_id")` with `WHERE` clauses on `role` for `active` and for `done`.
5. The SQL enables row-level security on all six tables and creates four policies per table, twenty-four in all, each `TO authenticated`.
6. `meta/_journal.json` ends with an entry tagged `0011_workflow` whose `when` is greater than `0010_retirements`'s; the journal entry count equals the `.sql` file count.
7. `packages/db/src/index.ts` exports the six `$inferSelect` / `$inferInsert` pairs; `yarn check-types` passes with a throwaway import of each from `@syn/db` removed afterwards.
8. `SCHEMA_REFERENCE.md` lists the six tables with the columns above.
9. No file under `packages/db/src/schema/workflow/` declares a `pgEnum` other than `workflow_column_role`.
10. On the local tier (state which, or state that none was available): after applying `0011`, inserting a second column with `role = 'active'` for the same view fails on the unique index; deleting a column that a task references fails on the foreign key; deleting the `users` row removes every Workflow row it owned.
11. The ticket's report states, in words, that the migration was **not** applied to staging or production.
12. `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` pass (four separate commands).

## Likely-relevant technical notes (ADVISORY — dev decides)

- `yarn db:generate` wants an interactive terminal and prompts every time by design. If it cannot run, hand-author: the emitted shape of `0009_v1_3_additive.sql` (a table with policies) is the model, and the snapshot is produced by a later successful generate.
- A partial unique index in the pinned syntax: `uniqueIndex("…").on(table.viewId).where(sql\`${table.role} = 'active'\`)`.
- `ownerPrivateCrudPolicies({ prefix: "workflow_tasks", ownerColumn: sql\`${table.userId}\` })` — the prefix is the table name.
- The role enum uses the parity helper in `enum-values.ts` against `WorkflowColumnRole`, as the root enums do against their unions.
- Cross-file foreign keys import the target table by direct relative path, never through a barrel (drizzle-conventions §4).

## Dev's call

Generate versus hand-author (log it if by hand) · index names within the house's `<table>_<columns>_idx` shape · whether the row type for views is `WorkflowViewRow` or another name that avoids the `…View` view-model suffix.

## Out of scope

- **Any read or write** — FLO-3.
- **The starter views as rows** — FLO-3 (`ensureWorkflowDefaults`).
- **The export** — FLO-3.
- **Applying `0011` anywhere hosted** — Taylor, after `0004`–`0010`.
- **A firing history table, a `source` column, a weekly pin rule, a link on a task** — not built (assessment §7).

## Depends on

- **FLO-1** — `WorkflowColumnRole`, `WorkflowTemplateColumn`. Complete in `PROGRESS.md`.

## Recommended execution

**Opus.** A one-way door written in a pinned, pre-1.0 syntax, with on-delete semantics that are the design. A cheaper model emits a valid migration with `cascade` on `column_id`, and the first removed column deletes a person's tasks.

---

### Kickoff (paste into the session)

> Build **FLO-2 — The `workflow/` schema domain and migration `0011_workflow`** (attached spec). Model: **Opus**. **Additive only; every table owner-private; `column_id` restricts; stop before any hosted tier.**
> Attach/read first, in order: this spec · `01-technology-assessment.md` §3 (TD-33, TD-34, TD-36, TD-37, TD-46) · `docs/architecture/drizzle-orm-conventions.md` · `docs/ai-guides/db-and-rls-authoring.md` · `docs/developer-guides/migrations.md` · `packages/db/AGENTS.md` · root `AGENTS.md` · `docs/specs/README.md` § Placement rules 1–2 · `packages/db/src/schema/library/{reasons,links}.ts` and `schema/enums.ts`, `schema/enum-values.ts` (reuse, don't fork) · FLO-1 · `packages/db/SCHEMA_REFERENCE.md` · this track's `README.md`, `DEVIATIONS.md` + `TECHNICAL-DECISIONS.md`.
> Six creates, nothing else. Reuse `categoryColorKeyEnum`. Author, journal, verify on the local tier only, and say in the report that nothing hosted was touched. Close in three places; log departures in `DEVIATIONS.md`. Run `yarn db:schema-reference`, then `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` as separate commands.
