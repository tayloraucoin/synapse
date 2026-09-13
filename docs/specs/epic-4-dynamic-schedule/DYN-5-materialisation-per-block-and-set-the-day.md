# DYN-5 — Materialisation per block and *Set the day*: `materializeDay` rewritten, `confirmDay`, the day read model by block, the week view by block, the seed

**Epic:** DYN — Dynamic schedule (UX v1.1) · **Phase 1** · Size: L
**Slice type:** The write path that turns plans into records, rebuilt around blocks; and the new moment at which the record begins. The risk class is *a rewritten record* (a re-materialisation that replaces a touched block or item) and *a record that begins too early* (an `original_scheduled_start` written on a pooled day before the person set it).
**Vigil:** none. **Mason review:** the keep rules (AC 5–8), the trigger transition (AC 9–10), the backfill of existing items into blocks (AC 12).

**Status:** Not started

> **Mason — materialiser and confirm review.** Five callers converge on `materializeDay` (apply a template to a block, change a day's shape, remove a block's template, re-apply after a template edit, the week's pre-fill) and one new service, `confirmDay`, resolves every pooled part and writes `original_scheduled_start` for the first time. Review that "untouched" is still one predicate (`isUntouchedItem`, extended to blocks as `isUntouchedBlock`), that the walk is `stackBlock` and nothing else, that pooled blocks materialise **no items** before confirm, that fixtures and pins on structured days keep v1.0's write-at-build behaviour, that `confirmDay` is idempotent (a second call on a confirmed day is a no-op returning the day), and that the one-time backfill of v1.0 items into a `morning` block on their day is reversible in reasoning if not in SQL.

---

## Outcome

A week can be built from blocks and a day can be set. Applying block templates to a day creates `day_blocks` in the person's block order and materialises every *decided* item at absolute times in the day's zone — fixtures, pins, assigned routines, prep with its default alternate — while leaving pooled blocks empty with `state = pooled`. In the morning, `confirmDay` takes the pick's choices (the routine's ticked items or variant, each alternate's chosen member, the workout and its placement, the focus, today's anchor hardness, the shape), lays every block out with `stackBlock` in its flow direction from `woke_at`, work start, and lights-out, writes `scheduled_*` and `original_scheduled_start`, splits the work block around an *inside work* placement, marks the day confirmed, and returns the day. The day read model returns blocks with their items; the week view returns each day's shape, morning, focus, workout, and fixtures in one line. Every existing v1.0 day is backfilled into one `morning` block so the Today tab has something to section. After this ships, **the quick-pick (DYN-14) has a service to call, the Today tab (DYN-15) has blocks to render, and DYN-6 has rows to adjust.** No Adjust, *Do now*, or moves (DYN-6); no screens; notifications enqueue here only as a call into USE-8's existing `fan-out` for fixtures (block pushes are DYN-20).

## Why / intent

- **v1.1 §11.11** — the two phases, verbatim: week build (`state: planned`, blocks created, decided items materialised, pooled blocks empty, fixtures as pins) and *Set the day* (`confirmed_at`: resolve pools, alternates, placement, focus; walk each block in its flow direction — forward from `woke_at` for morning; backward from `work_start_time` for prep; backward from `lights_out_time` for wind-down; training and break at their placement; write times; write `original_scheduled_start` where null; enqueue notifications). "The reconcile-not-rebuild rule from the existing service still holds."
- **v1.1 §3.3** — after the pick everything flows forward from wake; slack lands before the anchor; prep's backward flow is budget arithmetic. **§3.7** — *inside work* splits the work container; an unplaced workout is refused unless *not today* → `not_assigned`. **§3.9** — unstructured = orient + wind-down + fixtures; *Working today?* on *sometimes* days. **§4.13** — the week build's line per day; the first week pre-filled from typical days and counts; applying materialises the structured parts immediately. **§5.1** — `woke_at` stamped by the orient frame (DYN-13 calls `day.setWakeTime` with `source: orient`; this ticket makes the service accept it). **§5.3** — what the pick sends. **§7.1** — devices-off as a pin, the journal as the closer ending at devices-off, items after devices-off get `confirm-later`. **§7.3** — `not_confirmed` on Set for unticked items from yesterday. **§10.1** — the new states derive here.
- **v1.1 R6, R13, R14, R16, R23** and **TD-2, TD-5, TD-8.**
- **Cross-cutting §7.1–7.3** — absolute times via `wallClockToInstant` in the day's snapshotted zone; **§8.1** — record integrity.
- **Ground truth (consumed):** `services/day/{materialize-day,untouched,week-view,get-day,today,one-off,copy-week,apply-template-changes}.ts`; `routers/{week,day}.ts`; USE-1's `wallClockToInstant`, `resolveDayKey`, `deriveItemState`; SET-6's keep rules; DYN-4's templates, fixtures, habits with rotations; DYN-1's `stackBlock`, `fitToBudget`; DYN-3's tables.
- **What this slice is NOT (binding):** no Adjust, no `doNow`, no drag writes, no habit-day edits (DYN-6); no UI; no block-boundary notification jobs (DYN-20 — this ticket calls the existing N1 fan-out for fixtures only and leaves a `TODO(DYN-20)` at the enqueue point that is a named function call, not a comment); no removal of `days.template_id` reads (DYN-21).

**Rulings this slice makes (labelled, logged):**

- **`materializeDay` becomes `materializeDay(rls, userId, { date, blocks: BlockAssignment[] | "keep", shape?, anchorTime? })`** where a `BlockAssignment` is `{ kind, templateId | null | "pool", sortOrder }`; the four v1.0 callers map onto it (`applyTemplate` → one assignment; `removeTemplate` → `templateId: null`; `changeDayAnchor` → `anchorTime`; `applyTemplateChanges` → `"keep"` for every day the template is on). One function, six callers. Logged.
- **`isUntouchedBlock(block)`** = every item in it is untouched **and** the block has no `original_scheduled_start` set by a confirm. A confirmed block is touched by definition; re-applying a template edit to a confirmed day updates untouched *items* and never re-lays the block. Logged.
- **Pooled blocks own no items until confirm.** `state = pooled` with `template_id = null`; the pick shows the pool from the templates/habits, not from rows. Logged.
- **`confirmDay` is a single transaction and idempotent.** It refuses (`CONFLICT`) if the day is closed; it is a no-op returning the day if already confirmed; it refuses (`BAD_REQUEST` *Choose a time for {workout}.* `[COPY]`) if a workout is neither placed nor `notToday`. Logged.
- **The work block is one `day_blocks` row unless split.** *Inside work* creates a second work block (`sort_order` after the training block) and the training block sits between; both work blocks share `template_id` and `template_name_snapshot`; the first ends at the training start and the second starts at its end. Logged.
- **Devices-off is a pinned item** materialised into the wind-down block from `users.devices_off_time` with `origin = template`, `pinned = true`, `type = task_appointment`, title *Phone away* `[COPY]`, no checkbox semantics (the item is never marked done — the row is the marker; the read model flags it `isMarker` by title? **No** — by a `habit_id = null AND pinned AND type = task_appointment AND origin = template` rule is fragile; instead **the wind-down template carries a slot with `role = closer` and `habit_id = null`?** Slots require a habit. **Ruling:** `day_items` gains no column; the marker is a `day_items` row whose `habit_id` points at a system habit *Phone away* created per user at first run with `block_kind = wind_down`, `type = task_appointment`, and the read model treats any wind-down item whose `pinned_at` equals `devices_off_time` as the marker. `[PROVISIONAL — Mason; the cleanest alternative is a `marker boolean` column, deferred to avoid a fourth migration; revisit in DYN-21 if the rule reads as fragile.]` Logged.
- **Items after devices-off derive `confirm-later`** in `deriveItemState` when `scheduled_start ≥ the day's devices-off instant` and the item is in the wind-down block; on the next confirm, unticked ones become `not_confirmed`. Logged.
- **The v1.0 backfill runs once, as a service (`backfillBlocks`), invoked by the migration-era script `yarn db:seed`? No** — by a one-off procedure `day.backfillBlocks` callable by the smoke account **and** documented for Taylor to run on hosted tiers by hand after `0005`: for every `days` row with items and no blocks, create one `morning` block with `template_id = days.template_id`, `state = set` if the day is past or has any touched item else `planned`, `original_scheduled_start = min(item.original_scheduled_start)`, and set every item's `day_block_id`. Logged; recorded in `DEVIATIONS.md` as the one data migration that is not SQL.
- **The seed is re-shaped**: the smoke account gets Taylor's day per v1.1 §3.1 — profile times, a prep template (breakfast one-of, walk), a morning routine (opener·pool·closer), a wind-down routine, three workouts, four focuses, one fixture, `overflow_mode = daily_menu`. Logged.

## Behavior & states

**No surface.** Described by the services and the row states.

### Phase 1 — `materializeDay` (week build)

Given `{ date, blocks | "keep", shape?, anchorTime? }`:

1. Upsert `days` (as SET-6; snapshots on insert only); set `shape` if given; `anchor_time` stays the wake anchor (`users.usual_wake_time` unless `anchorTime`); `work_start_time` from the profile on insert; **`template_id` is no longer written** (left as is).
2. Desired blocks: for `structured` — from the assignment list, or, for `"keep"`, the day's existing blocks; for `unstructured` — `orient` and `wind_down` only. Order by `users.block_order`, then placeable kinds after `morning` by default until placed. Reconcile `day_blocks` by `(kind, sort_order)`: create missing, update untouched (template, snapshot, state), delete untouched blocks whose assignment is gone (their untouched items cascade — touched blocks are never deleted; a removed assignment on a touched block sets `template_id = null` and keeps the rows, as SET-6 did for days).
3. Per block, desired items: `pooled` → none. Otherwise from the template's slots — for `opener_pool_closer`, only `opener` and `closer` roles before confirm; alternates → the default member only, the other member **not created** until confirm (so the pick can choose); plus fixtures whose `weekdays` include this weekday and whose `block_kind` matches, as `origin = fixture, pinned = true, scheduling = hard`; plus, for wind-down, the devices-off marker.
4. Lay out with `stackBlock` per block in its flow from the profile's anchors (wake, work start, lights-out); training/break blocks with no placement get no times (`scheduled_* = null`, state `planned`). Convert minutes to instants with `wallClockToInstant(date, minutes, day.timezone)`.
5. Reconcile items by `template_slot_id` (and by `fixture_id`? — **`day_items` has no `fixture_id`**; match fixtures by `(origin = fixture, habit_id?, title, pinned_at)` → **ruling: add nothing; match on `(day_block_id, origin = fixture, title)`**, documented as the one fuzzy key, `[REVISIT if fixtures gain an id column in 0006]`). Untouched → update; missing → insert with `original_scheduled_start` **set for fixtures and pins on structured days, null otherwise** (TD-5); gone → delete if untouched; touched → leave (anchor change writes the two time columns only, as SET-6).
6. Return `{ dayId, blocks: { inserted, updated, deleted, kept }, items: {…} }`.

### Phase 2 — `confirmDay(rls, userId, input)` (*Set the day*)

Input (`confirmDayInput` in `validators/confirm.ts`): `{ date, shape?, workingToday?, routine: { variantTemplateId? , menuHabitIds?: string[], menuDurations?: Record<habitId, number> }, alternates: Array<{ groupId, chosenSlotId }>, training: { workoutHabitId | null, placement | null, notToday: boolean, tradeWithDate?: string }, focusHabitId?, anchorIsHard?, lastNight: { doneItemIds: string[] } }`.

1. Load the day (`CONFLICT` if closed; return early if `confirmed_at` set). Resolve the shape (`workingToday: false` → unstructured).
2. Resolve each pooled/pool-bearing block: routine variant → materialise its slots into the morning block; menu → create items for the ticked habits in priority order with `menuDurations` or the range midpoint, `origin = template`, `template_slot_id = null`, `template_name_snapshot = "Menu"` `[COPY]`; `auto_trim` → run `fitToBudget(…, "shorten_then_cut")` over the routine's slots against `computeBudget` and create the kept items; alternates → create the chosen member's item (delete the default's untouched row if it was the other); training → create the workout item in the training block, set `placement`, position the block (before/after morning by `sort_order`; inside work → split; after work; in break) or mark `state = not_today`; focus → `days.work_focus_habit_id` and the work block's item (`type = deep_work`, the focus habit) spanning the work block; the trade → the other day's training block gets the swapped workout if that day is not confirmed (else `CONFLICT` *Tuesday is already set.* `[COPY]`).
3. Lay out every block with `stackBlock`, **forward from `woke_at`** (or `anchor_time` if `woke_at` null) for orient then morning then training-before-morning… in `block_order`; prep forward from the morning's end; work from `work_start_time` (today's, or the profile's) — if the morning+prep overrun a **hard** anchor the confirm still succeeds (R7: the number is the feedback) and the read model shows the overrun; a **soft** anchor moves `days.work_start_time` to the prep's end; wind-down backward from `lights_out_time`; activity between work end and wind-down start.
4. Write `scheduled_*` on every item and block; write `original_scheduled_start` where null (the trigger permits once); `days.confirmed_at = now`, `shape`, `anchor_is_hard`, `work_start_time`.
5. Yesterday's `lastNight`: for each wind-down item of the previous day in `confirm-later`, ticked → `done` with `done_at = now` and `origin`-preserving; unticked → `not_confirmed`.
6. Enqueue: call USE-8's fan-out for `fixture_start` (already-enqueued fixtures are idempotent by the delivery key); call `enqueueBlockPushes(dayId)` — **a named stub exported from `services/notifications/block-pushes.ts` that DYN-20 fills** (it must exist and be called so DYN-20 changes one file).
7. Return the `DayView`.

### The read models

- **`getDay`** returns `blocks: DayBlockView[]` (in `sort_order`, each with `items` in time order, `split: true` on both halves of a split work block), plus everything it returned before **except `parts`** (kept populated until DYN-15 stops reading it, then removed in DYN-21 — both shapes coexist for the window, per `README.md` § Canonical paths). Adds `shape`, `confirmedAt`, `anchor: { clock, isHard } | null`, `focusLabel`, `devicesOffAt`, `lastNight: DayItemView[]` (yesterday's `confirm-later` items when today is unconfirmed).
- **`deriveItemState`** (USE-1) gains `not-confirmed`, `confirm-later`, `moved` (upcoming with `scheduled_start ≠ original_scheduled_start`, both non-null), given two new inputs `{ isAfterDevicesOff, pinned }`.
- **`getQuickPick(date)`** → `QuickPickView` (DYN-1's shape): the sections with defaults — menu items pre-ticked to the budget in priority order using `fitToBudget(…, "cut_only")`; last prep choices; today's workout by `typical_days` with remaining counts this week; last placement for this focus (from the most recent confirmed day with the same `work_focus_habit_id`); the week's focus assignment or the remaining counts; fixtures; the anchor.
- **`weekView`** per day: `shape`, `morningLabel` (variant name · *Menu* · *one of A/B*), `focusLabel`, `workoutLabel`, `fixtureLabels[]`, `confirmed`.
- **`prefillWeek(week)`**: for an unplanned week, assign per day from `work_days` (never → unstructured; sometimes → `shape` pool = structured with a `workingToday` question; always → structured), morning per `overflow_mode` (menu → pooled; variants → by `typical_days` and remaining counts; auto_trim → the one routine), training by `typical_days`, focus by `typical_days` else pooled, fixtures by weekday. Called by first run's completion (DYN-11) and by *Copy last week*'s replacement.

**States (exhaustive):** a day — unplanned (no row) · planned-structured with all blocks decided · planned with pooled blocks · unstructured · confirmed · closed. A block — `planned` · `pooled` · `set` · `not_today`, split or not. An item — every `ItemState` including the three new ones.

**Failure / edge states:** confirm on a day with no wake (`woke_at` null) → uses `anchor_time`, and the orient frame's stamp later corrects `woke_at` without re-laying (a wake-time edit re-lays only *unconfirmed* days; on a confirmed day it changes the header line only — `[Mason call: consistent with USE-3's DH-02 rule that wake time edits don't move items]`) · a fixture on a day whose block kind is absent (a `work` fixture on an unstructured Sunday) → materialised into an `activity` block created for it, `[COPY]`-free · a template archived after assignment → block keeps `template_name_snapshot` · two workouts with the same typical day → the first by `sort_order` in the rotation is the default, the other a swap · a *sometimes* day confirmed with `workingToday: true` and no focus → the work block with no item, honest · lights-out before devices-off (validator refuses at write) · DST: every instant via `wallClockToInstant`; a spring-forward gap resolves forward (USE-1) · the backfill on a day with items from two templates (impossible in v1.0 — one `template_id`) → one morning block regardless.

## Non-negotiables (this slice)

- **One materialiser, one confirm, one predicate each.** `isUntouchedItem` unchanged; `isUntouchedBlock` beside it; every write path uses them.
- **A touched item or block is never replaced, deleted, or re-laid** by materialisation or by a template edit.
- **Nothing derived from the pick exists before the pick.** Pooled blocks hold no items; `original_scheduled_start` is null on items of an unconfirmed structured day except fixtures and pins.
- **`original_scheduled_start` is written once**, by confirm or by build for fixtures/pins; the service never includes it in an `UPDATE` set.
- **The walk is `stackBlock`.** No local arithmetic; minutes → instants only through `wallClockToInstant` in the day's zone.
- **Confirm never refuses for being over budget** (R7). It refuses only for a closed day or an unplaced workout.
- **Every read and write through `ctx.rls.execute()`.**

## Data & AI

**Schema changes: none** (DYN-3). One **data** migration performed by a service (`backfillBlocks`), logged in `DEVIATIONS.md` and documented in `docs/developer-guides/migrations.md` as a step Taylor runs after `0005` on hosted tiers.

**Tables:** `days` (upsert, update) · `day_blocks` (insert, update, delete — untouched only) · `day_items` (insert, update, delete — untouched only) · `templates`, `template_slots`, `habits`, `fixtures`, `users` (read) · `timer_sessions`, `misses` (read, for the predicate) · `notification_deliveries` (via USE-8's fan-out only).

**Placement:** `packages/api/src/services/day/{materialize-day,untouched,confirm-day,quick-pick,backfill-blocks,prefill-week,week-view,get-day}.ts` (rule 4); `packages/api/src/services/notifications/block-pushes.ts` (the named stub); `packages/utils/src/day/item-state.ts` (the three new states — rule 6; USE-1's function, extended in place); `packages/validators/src/confirm.ts` + `week.ts` (`assignBlocksInput`, `prefillWeekInput`) (rule 7); `packages/api/src/routers/{day,week}.ts` (`day.confirm`, `day.quickPick`, `day.backfillBlocks`, `week.assignBlocks`, `week.prefill`); `packages/db/src/seed/*` (the smoke account's v1.1 day); `docs/developer-guides/migrations.md` (the backfill step). Mason's call.

**tRPC / validators:** `day.confirm(confirmDayInput)` → `DayView` · `day.quickPick({ date })` → `QuickPickView` · `day.setWakeTime` gains `source: "manual" | "orient"` · `day.backfillBlocks()` (idempotent) · `week.assignBlocks({ date, blocks })` · `week.prefill({ week })` · `week.get` returns the new per-day line · `week.applyTemplate` / `removeTemplate` / `changeAnchor` / `template.applyChanges` re-pointed at the new materialiser signature with their inputs unchanged.

**AI notes:** **None.**

**Instrumentation:** none.

## Accessibility

**None — no surface in this slice.**

## Acceptance criteria (observable — local tier; the re-shaped seed; zone `America/Vancouver`; probes through the server caller)

1. `yarn db:seed` (local) creates the smoke account's v1.1 day: profile times (7:00 · 9:00 · 17:30 · 22:15 · 22:45), templates of kinds prep/morning/wind_down, three workouts, four focuses, one fixture, `overflow_mode = daily_menu`; `week.prefill` for the current week produces Mon–Fri structured with pooled mornings, Sat a `workingToday` question, Sun unstructured; Tuesday carries the stand-up fixture as a pinned item with `original_scheduled_start` set. *(Mason.)*
2. After `prefill`, Monday's `day_blocks` are `orient, morning(pooled), prep, work, wind_down` in that order; the morning block has **no items**; prep has breakfast (the 10-min default) and walk laid out backward to 9:00 (`8:35`, `8:50` Vancouver — verify the UTC instants); wind-down has *Phone away* pinned at 22:15 and the journal ending at 22:15, laid backward from 22:45; every non-fixture, non-pin item has `original_scheduled_start IS NULL`. *(Mason.)*
3. `day.quickPick(Monday)` returns: `routine.menu` with the morning landscape pre-ticked in priority order to the budget (`availableMin` = 120 − orient − 45 = 72 minus nothing else), `prep.alternates` with the 10-min member chosen, `training.todays = Push` with `swaps` listing Legs/Pull and their remaining counts, `placements` all five, `work.focuses` with remaining counts and `assignedId` per prefill, `fixtures` empty on Monday, `anchor = { "9:00", isHard: true }` for `routine_cut`.
4. `day.confirm(Monday, { menuHabitIds: [six], alternates: [cook-it], training: { Push, placement: "before_morning" }, focusHabitId: Viewpoint })` → `confirmed_at` set; blocks in order `orient, training, morning, prep, work, wind_down`; Push at 7:03–8:03; the six menu items from 8:03 in priority order; prep re-laid backward from 9:00 with the 30-min breakfast; the work item spans 9:00–17:30 titled *Viewpoint*; **every item now has `original_scheduled_start`**; `DayView.blocks[i].items` in time order. *(Mason.)*
5. A second `day.confirm` on Monday returns the same `DayView`, changes no row (`updated_at` unchanged on every item). *(Mason.)*
6. Mark one menu item done by SQL, edit the morning template (add a slot), run `template.applyChanges({ scope: "all" })`: the done row and the confirmed block's times are untouched; the new slot is **not** added to Monday (a menu morning has `template_slot_id = null` items; a variant morning would get the untouched addition) — state which case the seed exercises and probe the other with a variant day. *(Mason.)*
7. `week.assignBlocks` removing the prep template from a confirmed Monday: the block keeps its rows with `template_id = null` and its snapshot; nothing deleted; on an unconfirmed Wednesday the same call deletes the untouched prep block and its items. *(Mason.)*
8. Anchor change (`week.changeAnchor(Wednesday, 08:00)`) on an unconfirmed day re-lays orient/morning from 8:00 and leaves prep's backward layout alone; on a confirmed day it changes only `days.anchor_time` and the two time columns of untouched items, never `original_scheduled_start` (no trigger error raised — meaning the service never tried). *(Mason.)*
9. **Trigger transition.** `day.confirm` on a day whose items have null originals writes them (permitted once); a subsequent `week.changeAnchor` does not attempt to write them (AC 8). *(Mason.)*
10. `day.confirm` with `training: { Push, placement: null, notToday: false }` → `BAD_REQUEST` naming the workout; with `notToday: true` → the training block `state = not_today`, no item, no miss.
11. `day.confirm` with `placement: "inside_work"` → two work blocks (`sort_order` n and n+2) around the training block, both `split: true`, the first ending at the workout's start and the second starting at its end; the focus item is split into two items? **No** — one focus item per work block, each spanning its half. *(Mason.)*
12. **Backfill.** On a database with v1.0 seeded days (seed before `0004`, migrate through `0005`, then `day.backfillBlocks()`): every day with items has exactly one `morning` block; every item's `day_block_id` is set; past days' blocks are `state = set` with `original_scheduled_start = min(items)`; running it again changes nothing. *(Mason.)*
13. `day.confirm(Tuesday, { training: { Legs, tradeWithDate: Monday } })` when Monday is confirmed → `CONFLICT` *Monday is already set.*; when Monday is unconfirmed → Monday's training block gets Push and Tuesday's gets Legs, both `state = planned`.
14. `day.confirm(Saturday, { workingToday: false })` → `shape = unstructured`, blocks `orient, wind_down` only, the Saturday fixture (if any) present in an `activity` block.
15. `day.confirm(Monday, { lastNight: { doneItemIds: [Read] } })` on Tuesday morning → Monday's *Read* is `done`, *Stretch* is `not_confirmed`; `deriveItemState` reports `not-confirmed`; the resolver excludes it. *(Mason.)*
16. `getDay(Monday)` before confirm returns `lastNight` empty (Sunday was unstructured with no wind-down items after devices-off? — seed Sunday with one) and `blocks[morning].state = "pooled"`; the deprecated `parts` still populated for the transition window.
17. A wind-down item scheduled after 22:15 derives `confirm-later`; one before it derives normally. *(Mason.)*
18. As user B, `day.confirm` for A's date creates B's own day (never touches A's); `day.quickPick` for A's date returns B's (empty) pick. *(Mason.)*
19. DST: prefill a week containing the spring-forward Sunday; an item whose wall-clock lands in the gap is stored at the first instant after it. *(Mason.)*
20. `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` pass (four separate commands); `yarn db:schema-reference` unchanged (no schema change — verify by diff).

## Likely-relevant technical notes (ADVISORY — dev decides)

- Structure `materializeDay` as: resolve desired blocks → reconcile blocks → per block resolve desired items → lay out (one `stackBlock` per block) → reconcile items. Keep the layout step a pure function of (blocks, items, anchors) so `confirmDay` reuses it verbatim after resolving pools — `layOutDay(blocks, profileAnchors, wokeAtMin)` in `services/day/lay-out-day.ts`, returning minutes; the caller converts.
- The forward chain after confirm: block n+1's anchor is block n's end, except work (its own anchor, hard or soft) and wind-down (backward from lights-out) and activity (from work end). Encode as a per-kind anchor resolver, not a switch inside the loop.
- `fitToBudget(…, "cut_only")` for pre-ticking the menu keeps every duration and ticks from the top of the priority order until the next item would exceed the budget — that is the "pre-ticked down to the budget" of v1.1 §5.3.
- `remaining counts this week` = `weekly_target − count of confirmed days this week with that habit as workout/focus` — one query per pick; cache nothing.
- The backfill service reuses `materializeDay`'s block reconcile with a synthetic assignment; do not write a second block-creation path.

## Dev's call

The exact `DayView` field additions beyond those named (log any) · whether `lay-out-day.ts` is its own file (recommended) · how the seed expresses Taylor's day (a typed fixture is fine) · the fuzzy fixture match key's exact columns (documented in code and `TECHNICAL-DECISIONS.md`).

## Out of scope

- **Adjust, `doNow`, drag writes, habit-day edits, `fitToBudget` exposed as a preview** — DYN-6.
- **Block-boundary pushes** — DYN-20 (this ticket ships the named stub).
- **The quick-pick UI, the Today tab, the week build UI** — DYN-14, DYN-15, DYN-12.
- **Removing `parts`, `days.template_id`, `wakeAnchorItemId` from the read model** — DYN-21.
- **Offline confirm** — Phase 2.

## Depends on

- **DYN-4** — block templates by kind, fixtures, rotations, the journal (for `lastNight`). Complete in `PROGRESS.md`.

## Recommended execution

**Opus.** The keep rules from SET-6 now apply at two levels, the trigger permits one transition that this ticket alone performs, pooled blocks must stay empty until a moment this ticket defines, and the layout chains six anchors in two directions. A cheaper model materialises pooled blocks with their opener and closer "because they're fixed", which writes `original_scheduled_start` before the person set the day and makes every menu morning read as *moved* for the rest of the product's life.

---

### Kickoff (paste into the session)

> Build **DYN-5 — Materialisation per block and *Set the day*** (attached spec). Model: **Opus**. **One materialiser, one confirm, one untouched predicate per level; nothing derived from the pick exists before the pick; `original_scheduled_start` written once — by confirm, or by build for fixtures and pins; the walk is `stackBlock`; confirm never refuses for budget.**
> Attach/read first, in order: this spec · v1.1 §3.3, §3.7, §3.9, §4.13, §5.1, §5.3, §7.1, §7.3, §10.1, §11.11, R6, R13, R14, R16, R23 · this track's `TECHNICAL-DECISIONS.md` TD-2, TD-5, TD-8 · SET-6 (the keep rules — reuse, never re-derive) · USE-1 (`wallClockToInstant`, `deriveItemState`, `daysBefore`) · USE-8 (`fan-out.ts`, `notification_deliveries` — call, don't fork) · `packages/api/src/services/day/{materialize-day,untouched,week-view,get-day,today}.ts` · `routers/{day,week}.ts` · DYN-1 (`stackBlock`, `fitToBudget`, `computeBudget`, `QuickPickView`) · DYN-4 (templates by kind, fixtures, rotations, journal) · `packages/db/SCHEMA_REFERENCE.md` (plan and day groups) · `docs/developer-guides/migrations.md` (add the backfill step) · `DEVIATIONS.md` + `TECHNICAL-DECISIONS.md` (this track's, Epic 1's, Epic 2's).
> Re-shape the seed, run every AC probe including the DST one, run `day.backfillBlocks` on a v1.0-seeded database and paste the counts, leave `enqueueBlockPushes` as a named exported stub for DYN-20. Close in three places. Run `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` as separate commands.
