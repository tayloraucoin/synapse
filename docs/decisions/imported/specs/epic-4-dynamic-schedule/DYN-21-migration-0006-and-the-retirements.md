# DYN-21 — Migration `0006` and the retirements

**Epic:** DYN — Dynamic schedule (UX v1.1) · **Phase 1** · Size: M
**Slice type:** Cleanup — a one-way door that removes the old model. The risk class is *removing something still imported* (`yarn lint:boundaries` and `yarn check-types` are the proof it did not happen) and *dropping before backfill* (the migration backfills, then asserts, then drops).
**Vigil:** none. **Mason migration review:** the SQL backfill's transcription of `untouched.ts`, the assertion, the drops; Taylor applies.

**Status:** Complete (2026-09-13 — authored from the handoff and built in one thread; `0006_retire_v1_model.sql` generated then hand-amended with the SQL backfill, the assertion and the `anchor_time` null; the v1.0 services, routers, utils, constants, composites, sheets and routes deleted; `SCHEMA_REFERENCE.md` and the directory map regenerated; the four root commands and the Storybook build pass; **not applied to any tier — Taylor runs 0004 → 0005 → 0006**)

**Owner:** Reeve (spec) → dev (build) · **Reviewer:** Mason (the migration), Vesper (nothing visible changes)

## Outcome

Migration `0006`: the v1.0 backfill in SQL (every day with items and no block gets one `morning` block, its items under it — DYN-5's rules transcribed), an assertion that no day with items is block-less, then the drops — `template_slots.offset_start_min/offset_end_min` (+ their check), `days.template_id` (+ index, FK), `users.wake_anchor_habit_id` (+ index, FK) — and `templates.anchor_time` nulled for every kind but `work`. Code retirements: `apply-shift.ts`, `apply-trim.ts`, `shift-fit.ts`, `backfill-blocks.ts`, `starter-set.ts`, the `shift` router and `day.previewTrim/applyTrim/backfillBlocks`, `habit.createFromStarterSet`; `utils/day/{day-parts,shift-fit,trim}.ts`; `STARTER_HABITS`, `TEMPLATE_OFFSET_MIN`; `DayPartHeader`, `StarterSetChooser`; `DayView.parts/templateName/wakeAnchorItemId`, `HabitSummaryView.isWakeAnchor`, `ReviewDayView.wakeAnchorItemId`; `components/{shift-sheet,trim-sheet}/`, `/settings/templates*` and their builders; the wake-anchor form field, tag and settings row; every v1.0 `days.template_id` reader re-pointed at `day_blocks`. `WokeAtSource`'s `anchor` stays (historical rows). `SCHEMA_REFERENCE.md`, the directory map, the route table, and the deprecation comments updated.

## Why / intent

- **§11.12, §0.4, R11, R20, §12.2** — the retirements the document names; the words that leave with them.
- **Ground truth (consumed, never rebuilt):** DYN-2/DYN-3's deprecation notes; DYN-5's `backfillBlocks` and `untouched.ts` (transcribed to SQL); DYN-6's undo decision (b); every later ticket's "removed in DYN-21" marker.
- **What this slice is NOT (binding):** any visible change; any new table or column (`shifts.undo_snapshot` does not exist — (b) stood); applying the migration to a tier.

**Rulings this slice makes (labelled, logged):**

- **`0006` carries the v1.0 backfill in SQL and runs it before the drops.** DYN-5's `backfillBlocks` read `days.template_id`, the column this migration removes, so once DYN-21's code is deployed the service cannot run; the backfill lives where the drop lives. The service and `day.backfillBlocks` are retired. Logged in `TECHNICAL-DECISIONS.md`.
- **`day_items.day_block_id` stays nullable.** The handoff's `SET NOT NULL` predates DYN-15's `DayView.unblocked`: a one-off and an unstructured day's add have no block by design. The assertion is "no day with items has no block", which the backfill guarantees. Logged.
- **`undo-shift.ts` becomes `undo-eligibility.ts`** (`UndoRefusedError`, `shiftUndoEligibility`) — Adjust's undo reads the same three refusals; v1.0's `undoShift` reversal leaves. `DayChangedError` moves into `adjust-day.ts`. Logged.
- **SC-02's record sheet re-points at `adjust.canUndo` / `adjust.undo`** — the same input, over any `shifts` row. Logged.
- **Template usage counts read `day_blocks`** (`listTemplates.usedThisWeek`, `getTemplate.appliedDays`, `mostUsedTemplate`, the week review's `templates`, settings' `plannedDays`): one distinct day per template. Logged.
- **The landing's example day groups by block** (morning · work · activity) under `BlockHeader`, not by v1.0's day parts. Logged.
- **`HabitUsage` rows gain `kind`** so the habit detail's template link reaches the block editor. Logged.

## Experience & states

Nothing visible changes. The habit detail's template rows read *{n} min · priority p* and link to the block editor; the wake-up habit row is gone from Settings → Day and the *wake-up* tag from the library; the landing's three sections carry block headers.

**Failure / edge states:** `0006` on a database where a day with items got no block → the assertion raises and nothing applies · `0006` run twice → the backfill skips every day (each has a block) and the drops have already happened (drizzle does not re-run a migration) · a v1.0 `shifts` row → the record sheet's undo still asks `adjust.canUndo`.

## Non-negotiables (this slice)

- **Nothing is removed that any file still imports.**
- **The migration backfills before it asserts, and asserts before it drops.**
- **`day_block_id` stays nullable.**
- **The migration is authored and stopped; a human applies it.**

## Data & AI

**Schema changes:** `0006_retire_v1_model.sql` — the backfill `DO` block; drop `template_slots_offset_start_min_check`, `users_wake_anchor_habit_id_habits_id_fk`, `days_template_id_templates_id_fk`, `users_wake_anchor_habit_id_idx`, `days_template_id_idx`, `users.wake_anchor_habit_id`, `template_slots.offset_end_min`, `template_slots.offset_start_min`, `days.template_id`; `UPDATE templates SET anchor_time = NULL WHERE kind <> 'work'`. Journal entry `idx 6`, snapshot `0006_snapshot.json`.

**Tables:** `day_blocks` (insert — the backfill), `day_items` (update — the backfill), `templates` (update), the three tables with drops.

**Placement:** `packages/db/migrations/0006_retire_v1_model.sql` + `meta/`; `packages/db/src/schema/{plan/template-slots,plan/days,user/users,library/habits,day/day-items}.ts`; every retired file above; `packages/api/src/services/day/{adjust-day,undo-eligibility,get-day,week-view,one-off,materialize-day,apply-template-changes,quick-pick}.ts`; `services/{library,plan,review,shell}/*`; `routers/{day,habit,adjust,root}.ts`; `packages/{utils,constants,types,validators}/src`; `packages/ui/src/{index.ts,composed/__fixtures__}`; `apps/web/{lib/routes.ts,AGENTS.md}`, the landing, the habits settings, the day settings, the day list header, the day header sheet, the one-off sheet, the record sheet. Rule 3, rule 9.

**tRPC / validators:** removed `shift.*`, `day.previewTrim`, `day.applyTrim`, `day.backfillBlocks`, `habit.createFromStarterSet`, `createFromStarterSetInput`, `habitFormSchema.isWakeAnchor`.

## Acceptance criteria (observable — a scratch database for the migration; the repo for the rest)

1. `0006` on a database with a v1.0 day (items, no block) creates one `morning` block under it and moves the items; on a database where a day with items cannot be reached it raises and applies nothing. *(Mason.)*
2. After `0006`, `template_slots` has no offset columns, `days` no `template_id`, `users` no `wake_anchor_habit_id`; every non-work template's `anchor_time` is null. *(Mason.)*
3. `grep -rn "offsetStartMin\|dayPartOf\|computeShiftFit\|STARTER_HABITS\|wakeAnchor" packages/*/src apps/web/{app,components,lib}` returns nothing. *(Mason.)*
4. Every route in `apps/web/AGENTS.md` has a builder in `lib/routes.ts` and every builder a row. *(Mason.)*
5. `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` and the Storybook build pass; `yarn directory-map` and `yarn db:schema-reference` regenerated.

## Likely-relevant technical notes (ADVISORY — dev decides)

- `drizzle-kit generate` emits the drops and the snapshot; the backfill and the `UPDATE` are hand-added around them, as `0005` was amended.
- The backfill's "touched" is `untouched.ts`'s six conditions negated; `is_past` compares `days.date` to today in `days.timezone`.

## Dev's call

Whether the record sheet keeps its own copy for *Undo this shift* (it does — in `schedule-canvas/copy.ts`) · the landing's three block kinds.

## Out of scope

- **Applying `0006` to any tier** — Taylor, per `docs/developer-guides/migrations.md`.
- **Dropping `woke_at_source`'s `anchor`** — historical rows carry it.

## Depends on

- **DYN-9, DYN-16, DYN-17, DYN-19, DYN-20** — the last readers of what this removes. Complete in `PROGRESS.md`.
