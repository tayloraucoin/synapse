# DYN-2 — Migration `0004`: block templates, stacked slots, block kinds and rotations on habits, the offset backfill

**Epic:** DYN — Dynamic schedule (UX v1.1) · **Phase 0** · Size: L
**Slice type:** Schema — a one-way door with a backfill. The risk class is *a silently wrong backfill*: a template whose derived starts no longer match the offsets it had, discovered when a person's Monday morning is laid out five minutes off from the one they built.
**Vigil:** none. **Mason review:** the whole migration, and AC 6–9 (the backfill's equivalence proof).

**Status:** Not started

> **Mason — migration review.** This slice authors `0004`: eleven columns across three tables, one enum extension, one column made nullable, a check constraint, and a data backfill that turns absolute offsets into gaps. Review that the backfill is expressed once in SQL inside the migration (not in a script someone has to remember to run), that it reproduces every well-formed template's starts exactly (AC 7), that it logs rather than guesses for malformed ones (AC 8), that nothing is dropped (TD-9 — `offset_*` survive until `0006`), and that `_journal.json` has the entry. **Stop before any hosted tier** (root `AGENTS.md`); Taylor applies it.

---

## Outcome

The plan-side tables can hold v1.1's model. `templates` rows have a `kind`, a `flow`, and a `structure`; `anchor_time` is nullable and means "an explicit override" (TD-1). `template_slots` rows have a `gap_before_min`, an optional `pinned_at`, a `role`, an `alternates_group` with an `alternates_default` flag, and a `sort_order` that is the stack order (TD-4); their old `offset_start_min` / `offset_end_min` are still present, still populated, and no longer the source of truth. `habits` rows have a `block_kind`, a `weekly_target`, and `typical_days` (TD-3), and `item_type` accepts `workout`. Every existing template on the local tier lays out exactly as it did, now from gaps. `SCHEMA_REFERENCE.md` is regenerated. After this ships, **DYN-3 can add `day_blocks` referencing `templates.kind`, and DYN-4 can write services against the new columns.** No day-side table changes (DYN-3); no service reads the new columns yet (DYN-4); nothing is dropped (DYN-21).

## Why / intent

- **v1.1 §11.3** — `habits.block_kind` (nullable = anywhere), `weekly_target` 1–7 nullable, `typical_days` smallint[] nullable, Mon = 0; `item_type` gains `workout`; a focus is `deep_work`. "Declined: a separate `workouts` table and a `focuses` table."
- **v1.1 §11.4** — `templates.kind` not null (backfill `morning`); `flow` default `forward`; `structure` default `stack`; `anchor_time` **kept, now nullable**; `weekly_target`, `typical_days`, `name`, `archived_at` unchanged.
- **v1.1 §11.5** — `gap_before_min` 0–240 not null default 0; `pinned_at` time nullable, mutually exclusive with a non-zero gap (`CHECK (pinned_at IS NULL OR gap_before_min = 0)`); `role` enum default `stack`; `alternates_group` text nullable + `alternates_default` boolean; `sort_order` becomes the stack order; `offset_*` dropped **after backfill** (DYN-21). The backfill rule, verbatim: "order slots by `offset_start_min`; set `sort_order` to that order; set `gap_before_min = this.offset_start − (prev.offset_start + prev.duration)`, floored at 0; slots that overlapped their predecessor without a multitask group get gap 0 and a warning logged to the migration output for a human to look at."
- **v1.1 §11.12** — "two migrations that touch live tables … a human reviews both; neither runs against a hosted database without Taylor."
- **TD-1, TD-3, TD-4, TD-9** — the shape and the split.
- **`drizzle-orm-conventions.md`** — the only permitted syntax; column order; colocated enums per §3 (an enum used by one table lives in that table's file; `BlockKind` will be used by `templates`, `habits`, `fixtures`, `day_blocks`, `notification_prefs` across three directories → root `enums.ts`).
- **`packages/db/AGENTS.md`** — journal entry or nothing applies; `0000` is hand-guarded; regenerate the reference.
- **Ground truth:** `packages/db/src/schema/{enums,enum-values}.ts`; `schema/plan/{templates,template-slots}.ts`; `schema/library/habits.ts`; `migrations/meta/_journal.json` at `0003`; `packages/db/supabase/setup/*.sql` (untouched here — no trigger changes on the plan side).
- **DYN-1 (Complete required)** — `BlockKind`, `BlockFlow`, `BlockStructure`, `SlotRole`, the widened `ItemType`. The enums here are `enumValues<Union>()` over those; AC 1 of DYN-1 is the sentinel this ticket clears.
- **What this slice is NOT (binding):** it does not touch `days`, `day_items`, `users`, `shifts`, `notification_prefs`, or any trigger (DYN-3). It does not drop a column or an enum value. It does not change a service, a validator, or a view mapper beyond what compiles (AC 4).

**Rulings this slice makes (labelled, logged):**

- **`kind` is backfilled to `morning` for every existing template.** Every v1.0 template was a whole day anchored at wake; as a morning block it lays out identically. A person who built a "Workday" template in v1.0 sees it under Morning until they move it — honest, and DYN-8's editor lets them re-kind it. Logged.
- **`anchor_time` is left populated on existing rows** even though the new meaning is "override". DYN-5's materialiser treats a morning template's `anchor_time` as ignored (the profile's wake is the anchor); DYN-21 nulls it for non-work kinds. Nulling now would be a data change inside a schema migration for no reader that needs it. Logged.
- **The backfill runs inside `0004` as SQL**, using a window function over `(template_id ORDER BY offset_start_min, sort_order)`; overlaps without a shared `multitask_group` get gap 0 and a `RAISE NOTICE` per row with the template id and both slot ids. Unscheduled slots (`offset_start_min IS NULL`) keep `time_mode = unscheduled`, get `gap_before_min = 0`, and sort after every fixed slot in their original `sort_order`. Window slots keep `offset_end_min` for now; their `gap_before_min` is computed from `offset_start_min` like a fixed slot. Logged.
- **`alternates_default` is a boolean on the slot, not a group-level row**, with the invariant "exactly one true per group" enforced by DYN-4's service (a partial unique index `(template_id, alternates_group) WHERE alternates_default` enforces at most one; the service enforces at least one). Logged.
- **`weekly_target` and `typical_days` on `habits` reuse the names and the checks `templates` already has**, so the validators and the week build's "used n of m" read one shape. Logged.

## Behavior & states

**No surface.** Described by the schema after the migration and by the backfill's effect on seeded data.

### `packages/db/src/schema/enums.ts` (root — three directories use it)

```ts
export const blockKindEnum = pgEnum("block_kind", enumValues<BlockKind>()(["orient","morning","training","prep","work","break","activity","wind_down"]));
export const itemTypeEnum = pgEnum("item_type", enumValues<ItemType>()(["habit","task_appointment","deep_work","workout"]));
```

`block_flow`, `block_structure`, `slot_role` are used by one directory (`plan/`) → `schema/plan/enums.ts` (new file, per the colocation rule):

```ts
export const blockFlowEnum = pgEnum("block_flow", enumValues<BlockFlow>()(["forward","backward"]));
export const blockStructureEnum = pgEnum("block_structure", enumValues<BlockStructure>()(["stack","opener_pool_closer"]));
export const slotRoleEnum = pgEnum("slot_role", enumValues<SlotRole>()(["stack","opener","pool","closer"]));
```

### `schema/plan/templates.ts`

| Column | Change |
|---|---|
| `anchorTime: time("anchor_time")` | `.notNull().default("07:00")` → nullable, no default. Header comment rewritten: "An explicit override, meaningful for work templates with their own hours (v1.1 R5). Every other kind anchors from the profile at materialisation (v1.1 §3.1)." |
| `flow: blockFlowEnum("flow")` | **add**, `.notNull().default("forward")` |
| `kind: blockKindEnum("kind")` | **add**, `.notNull()` — the migration adds it nullable, backfills `morning`, then sets `NOT NULL` |
| `structure: blockStructureEnum("structure")` | **add**, `.notNull().default("stack")` |
| index | **add** `templates_user_id_kind_idx (user_id, kind)` |

Alphabetical column order per the conventions; the file header gains a paragraph on TD-1.

### `schema/plan/template-slots.ts`

| Column | Change |
|---|---|
| `alternatesDefault: boolean("alternates_default")` | **add**, `.notNull().default(false)` |
| `alternatesGroup: text("alternates_group")` | **add**, nullable |
| `gapBeforeMin: smallint("gap_before_min")` | **add**, `.notNull().default(0)`, `CHECK BETWEEN 0 AND 240` |
| `offsetEndMin`, `offsetStartMin` | **keep**; header comment: "DEPRECATED since `0004` (v1.1 §11.5, TD-4): derived from `gap_before_min` + `sort_order` by `stackBlock`. Populated by the backfill; not written by any service after DYN-4; dropped in `0006`." |
| `pinnedAt: time("pinned_at")` | **add**, nullable, `CHECK (pinned_at IS NULL OR gap_before_min = 0)` |
| `role: slotRoleEnum("role")` | **add**, `.notNull().default("stack")` |
| `sortOrder` | comment change only: "the stack order within the template (v1.1 §11.5); inside a multitask bracket, members share a position and this is the tie-break" |
| index | **add** partial unique `template_slots_alternates_default_idx ON (template_id, alternates_group) WHERE alternates_default AND alternates_group IS NOT NULL` |

### `schema/library/habits.ts`

| Column | Change |
|---|---|
| `blockKind: blockKindEnum("block_kind")` | **add**, nullable — "the block this habit lives in by default; null = anywhere (v1.1 §11.3)" |
| `typicalDays: smallint("typical_days").array()` | **add**, nullable, same `<@ ARRAY[0..6]` check as `templates` |
| `weeklyTarget: smallint("weekly_target")` | **add**, nullable, `CHECK IS NULL OR BETWEEN 1 AND 7` |
| index | **add** `habits_user_id_block_kind_idx (user_id, block_kind)` |

### The migration `0004_<name>.sql` (drizzle-generated, then hand-amended for the backfill and the two-step NOT NULL)

Order: (1) `ALTER TYPE item_type ADD VALUE 'workout'` (its own statement; Postgres cannot add an enum value inside a transaction that also uses it — Drizzle's `--> statement-breakpoint` handles this; verify) · (2) create the three plan enums and `block_kind` · (3) `templates` add columns (`kind` nullable) · (4) `UPDATE templates SET kind = 'morning' WHERE kind IS NULL` · (5) `ALTER templates ALTER kind SET NOT NULL`, `ALTER anchor_time DROP NOT NULL`, `DROP DEFAULT` · (6) `template_slots` add columns and checks · (7) **the backfill** as one `UPDATE … FROM (SELECT … window …)` · (8) the `RAISE NOTICE` block for overlaps (a `DO $$ … $$` that selects and notices) · (9) `habits` add columns, checks, index · (10) indexes.

`meta/_journal.json` gains `idx: 4`; `meta/0004_snapshot.json` is generated.

**States (exhaustive):** a fresh local database after `0000…0004` · an existing local database with seeded v1.0 templates migrated forward · `SCHEMA_REFERENCE.md` regenerated.

**Failure / edge states:** a template with two fixed slots at one offset and no shared `multitask_group` (should not exist — `saveSlot` refuses it — but reachable by SQL): gap 0, `RAISE NOTICE`, and the row is left for a human · a slot with `offset_start_min < 0` as the first slot (TP-02's "up to two hours before"): `sort_order 0`, `gap_before_min 0`; its earlier-than-anchor position is *lost* as a gap and preserved only in the deprecated column — **flagged:** v1.1 has no before-wake slot concept (orient is the first block); log the count of such rows in the migration output and in `DEVIATIONS.md` so DYN-8 can show them at the top of the stack `[REVISIT: if any real user has one]` · a window slot: `gap_before_min` from its start, `offset_end_min` retained; DYN-4's validator keeps `window` legal inside a stack (the window's span is `[start, start + (end − start)]` and `stackBlock` treats it as a fixed-length item of `end − start`).

## Non-negotiables (this slice)

- **Nothing is dropped.** `offset_start_min`, `offset_end_min`, `anchor_time`'s data, every enum value — all survive until `0006` (TD-9).
- **The backfill lives in the migration**, expressed once as SQL, idempotent (`WHERE gap_before_min = 0 AND sort_order …` guards are not enough — use a marker: run only where `offset_start_min IS NOT NULL` and the row's `updated_at < the migration's start`; simplest is to run once and rely on the journal, which is what migrations are).
- **Well-formed templates lay out identically** (AC 7). The proof is part of the ticket.
- **Enum spelling is `@syn/types`'** through `enumValues<Union>()`. DYN-1's sentinel clears here and nowhere else.
- **Drizzle syntax per `drizzle-orm-conventions.md`**, column order alphabetical, relations and policies colocated, row types exported from the barrel.
- **Stop before any hosted tier.** Local only; the closing report says so.

## Data & AI

**Schema changes: described above** — migration `0004`, journalled; a human applies to hosted tiers.

**Tables:** `templates` (alter, backfill) · `template_slots` (alter, backfill) · `habits` (alter) · enums `item_type` (extend), `block_kind`, `block_flow`, `block_structure`, `slot_role` (create).

**Placement:** `packages/db/src/schema/enums.ts` (root, `block_kind`, `item_type`); `packages/db/src/schema/plan/enums.ts` (new: `block_flow`, `block_structure`, `slot_role`); `packages/db/src/schema/plan/{templates,template-slots}.ts`; `packages/db/src/schema/library/habits.ts`; `packages/db/migrations/0004_*.sql` + `meta/`; `packages/db/SCHEMA_REFERENCE.md` (regenerated); `packages/db/src/index.ts` (re-export the new enums' types if the barrel does so for others — match the pattern). Rule 1; Mason's call.

**tRPC / validators:** none — DYN-4. **The existing `saveSlot` service and `slotFormSchema` continue to write `offset_start_min`** and ignore the new columns until DYN-4 replaces them; they compile unchanged because every new column is nullable or defaulted.

**AI notes:** **None.**

**Instrumentation:** none.

## Accessibility

**None — no surface in this slice.**

## Acceptance criteria (observable — local tier; a fresh database and a seeded v1.0 database, both)

1. `yarn db:generate` (or the hand-authored equivalent) produces `0004_*.sql` with the statements in the order above, `meta/_journal.json` has `idx: 4`, and `yarn db:migrate` on a **fresh local** database applies `0000…0004` cleanly. *(Mason.)*
2. The `@syn/db` sentinel from DYN-1 AC 1 is gone: `yarn check-types` passes workspace-wide.
3. `\d templates` shows `kind block_kind NOT NULL`, `flow block_flow NOT NULL DEFAULT 'forward'`, `structure block_structure NOT NULL DEFAULT 'stack'`, `anchor_time time NULL` (no default); `\d template_slots` shows `gap_before_min smallint NOT NULL DEFAULT 0`, `pinned_at time NULL`, `role slot_role NOT NULL DEFAULT 'stack'`, `alternates_group text NULL`, `alternates_default boolean NOT NULL DEFAULT false`, both checks, the partial unique index; `\d habits` shows `block_kind block_kind NULL`, `weekly_target smallint NULL`, `typical_days smallint[] NULL`, both checks; `SELECT unnest(enum_range(NULL::item_type))` includes `workout`. *(Mason.)*
4. Every existing service, router, validator, and view mapper compiles without a source change other than the neutral defaults DYN-1 AC 2 named; `yarn build` passes.
5. On a database seeded with v1.0's *Morning* template (`yarn db:seed` on local **before** migrating, then migrate): every template has `kind = 'morning'`; `anchor_time` is unchanged on every row.
6. **Backfill — sort order.** For every template, `sort_order` after migration equals the rank of `offset_start_min` (ties broken by the old `sort_order`), and unscheduled slots come last. *(Mason.)*
7. **Backfill — equivalence.** For every template with no overlapping fixed slots, walking the slots with `stackBlock({ items: slots.map(s => ({ durationMin, gapBeforeMin, pinnedAtMin: null, … })), flow: "forward", anchorMin: 0 })` reproduces `offset_start_min` for every fixed slot exactly. Run this as a throwaway script under `$TMPDIR` against the seeded database; paste the count of templates checked and `0 mismatches`. *(Mason.)*
8. **Backfill — overlap.** Insert by SQL two fixed slots at the same offset with no `multitask_group` into a throwaway template, run the migration on that database: both get `gap_before_min = 0`, a `NOTICE` names the template and both slots, and neither row is otherwise changed. *(Mason.)*
9. **Backfill — multitask.** Two slots sharing a `multitask_group` and an offset: the second's `gap_before_min = 0` and the pair keeps adjacent `sort_order`; the slot after the bracket has its gap computed from the bracket's **longest** member's end. *(Mason.)*
10. **Backfill — before-wake slot.** A slot with `offset_start_min = −30` as the first slot: `sort_order 0`, `gap_before_min 0`, and the migration output counts it; the count is recorded in `DEVIATIONS.md` with the `[REVISIT]` note.
11. `yarn db:schema-reference` regenerates `SCHEMA_REFERENCE.md`; its §1 overview and the three tables' sections reflect the columns; the reference is committed.
12. As user B, `SELECT` on A's templates returns nothing (policies untouched by the alter — verify one probe). *(Mason.)*
13. The closing report states: local only; `0004` not applied to any hosted tier; the before-wake count from AC 10.
14. `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` pass (four separate commands).

## Likely-relevant technical notes (ADVISORY — dev decides)

- Drizzle-kit generates the DDL; the backfill and the `DO $$` notice block are hand-appended after the generated statements with `--> statement-breakpoint` separators, and the snapshot is regenerated so `0005` diffs cleanly. Read `0002_*.sql` and `0003_*.sql` for the house style of a hand-amended migration.
- The window query: `ROW_NUMBER() OVER (PARTITION BY template_id ORDER BY (offset_start_min IS NULL), offset_start_min, sort_order)` for the new `sort_order`; `LAG(offset_start_min + duration_min) OVER (…)` for the previous end; gap = `GREATEST(0, offset_start_min − prev_end)`. For a multitask bracket, compute `prev_end` as `MAX(offset_start_min + duration_min)` over the previous *position*, which is a second window keyed on `(template_id, offset_start_min)` — or simpler: compute per position first (`DISTINCT ON (template_id, offset_start_min)` with the max end), then join.
- `ALTER TYPE … ADD VALUE` cannot run inside the same transaction that later uses the value; Drizzle puts each statement behind a breakpoint, and `db:migrate` runs them one by one, so it works — verify on the fresh database (AC 1) before trusting it.
- Keep the `RAISE NOTICE` text greppable: `0004 overlap: template=<id> slots=<a>,<b>` and `0004 before-wake: template=<id> slot=<id>`.

## Dev's call

Whether the backfill is one `UPDATE … FROM` or two (positions, then gaps) · the migration's generated name · whether `plan/enums.ts` also re-exports through `schema/plan/index.ts` (match `day/`'s pattern).

## Out of scope

- **`users`, `fixtures`, `day_blocks`, `days`, `day_items`, `shifts`, `journal_entries`, `notification_prefs`, the trigger** — DYN-3 (`0005`).
- **Dropping `offset_*`, nulling `anchor_time` for non-work kinds, dropping `wake_anchor_habit_id`** — DYN-21 (`0006`).
- **`saveSlot`'s new position rule, the validators, the routers** — DYN-4.
- **The seed's new shape** (block templates per kind for the smoke account) — DYN-5, once the materialiser reads them.
- **Applying to a hosted tier** — Taylor, by hand, after review.

## Depends on

- **DYN-1** — the unions the enums are checked against; `stackBlock` for AC 7. Complete in `PROGRESS.md`.

## Recommended execution

**Opus.** The backfill is the ticket: window functions over positions with multitask brackets, an enum extension that must sit outside a transaction, and an equivalence proof against the arithmetic. A cheaper model writes the additive DDL correctly and a backfill that computes gaps from each slot's own predecessor row rather than its predecessor *position*, which is right for every template without a bracket and five minutes wrong for every template with one — and passes the smoke account, which has none.

---

### Kickoff (paste into the session)

> Build **DYN-2 — Migration `0004`: block templates, stacked slots, habits' block kinds and rotations, the offset backfill** (attached spec). Model: **Opus**. **Nothing dropped; the backfill lives in the migration, once, as SQL; well-formed templates lay out identically (prove it); enum spelling is `@syn/types`'; local tier only.**
> Attach/read first, in order: this spec · v1.1 §11.3, §11.4, §11.5, §11.12 · `docs/specs/epic-4-dynamic-schedule/README.md` § Canonical paths · this track's `TECHNICAL-DECISIONS.md` TD-1, TD-3, TD-4, TD-9 · `docs/architecture/drizzle-orm-conventions.md` (the only syntax) · `docs/ai-guides/db-and-rls-authoring.md` · `packages/db/AGENTS.md` · root `AGENTS.md` § Hard guardrails · `packages/db/src/schema/{enums,enum-values}.ts`, `schema/plan/{templates,template-slots}.ts`, `schema/library/habits.ts` · `packages/db/migrations/0002_*.sql`, `0003_*.sql` (house style for hand-amended migrations) · DYN-1 (`stackBlock`, for AC 7) · `packages/db/SCHEMA_REFERENCE.md` · `DEVIATIONS.md` + `TECHNICAL-DECISIONS.md` (this track's, Epic 1's, the infrastructure track's).
> Author `0004`, journal it, apply on a fresh local database and on a seeded v1.0 local database, run the equivalence probe (AC 7), regenerate `SCHEMA_REFERENCE.md`, **stop before any hosted tier**. Close in three places; record the before-wake count in `DEVIATIONS.md`. Run `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` as separate commands.
