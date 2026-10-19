# DAY-6 — The day under v1.3: N training blocks keyed by workout, the transition block, the pooled activity block and `chooseFromPool`, fixture travel rows, *Not working today* on a *Usually* day, the quote after the journal

**Epic:** DAY — The first run built day-first (UX v1.3) · **Phase 2** · Size: L
**Slice type:** The materialiser and the day-side services — the one arithmetic's callers gain three more blocks and one more filler. The risk class is *a second training block re-pointed onto the first* (TD-24's match), *a pooled block that materialises its pool as items*, *a transition anchored at the wrong end*, and *a travel row on a fixture that is added to its length*.
**Vigil:** **Induce on the local tier:** a plan with two workouts placed `before_morning` and one `after_work`; a fixture with 20/20 travel; a pool of five; a *Usually* Saturday. Walk: pre-fill the week; set Monday from the plan; leave the evening pooled through the Day Review; *Not working today* on the Saturday. State the `day_blocks` and `day_items` rows for Monday before and after each step.

**Status:** Complete (2026-09-25)

> **Mason — materialiser review.** Read `reconcileBlocks` and `orderBlocks` after the change. Confirm: a training row is matched by the workout item it holds, never by kind alone; two before-the-routine workouts are two blocks ordered by the plan's list; the transition block stacks forward from the later of *until about* and the after-work training's end; the activity block is created `pooled` with `template_id` set and only its fixtures as items; `chooseFromPool` adds items through `addFromLibrary`'s path and flips the block to `set`; a fixture's travel rows share `writeTravelRows` with the workout's; `removeWorkType` accepts a *Usually* day; `readJournalClose` returns the same quote `readOrient` returned for that date. `stackBlock` is untouched (`git diff packages/utils/src/day/stack.ts` is empty).

---

## Outcome

A day materialised from a v1.3 plan is the day the builder drew: one training block per placed workout, each with its travel, in the plan's order; an *After work* block stacked forward from the end of work; a *Free time* block that is pooled — its fixtures pinned, its pool waiting — until the person chooses from it, in the morning's pick or on arrival, through one service; a fixture away from home carries its two travel rows beside it; a *Usually* day can become *Not working today* from the header; the journal's closing screen can show the morning's quote. After this ships, **DAY-11 has a preview to draw and DAY-12 has the pick's section, the Today row and the journal's close to render.** Nothing here renders; nothing here changes `stackBlock`.

## Why / intent

- **v1.3 R52, §3.15, TD-24** — *"The materialiser writes one training block per placed workout, keyed by workout, so two before-the-routine workouts are two bands, in order."* Lifts RUN-5's one-per-day (Epic 5 `DEVIATIONS.md`, 2026-09-16 · RUN-5).
- **v1.3 R48, §3.1, §11.6, TD-25** — the transition block: *"after the work block (or the after-work training) the transition block stacks forward from that end."*
- **v1.3 R50, §3.16, §11.6, TD-26** — *"the activity block is created pooled from the plan's `activity_template_id` with its fixtures pinned … the pick's Free time section fills it"*; `chooseFromPool`.
- **v1.3 R51, §3.14, §11.6, TD-27** — *"a fixture with planned travel writes its two travel rows around its pinned item."*
- **v1.3 R49, §3.9** — *Not working today* on a *Usually* day is `removeWorkType`, which today refuses unless the weekday is `rarely`-shaped? — it does not check the mode (the header hides the row); confirm and widen nothing but the header (DAY-12). `applyWorkType` on a *Rarely* day takes the plan's template id (DAY-5's `listWorkPlans`).
- **v1.3 R54, §7.2** — the quote after the journal: the same `readQuoteForDate` and `cycleIndex` the frame uses (RUN-4), exposed on the journal's close read model when `quotes_opt_in` and the date is a quote-day.
- **v1.3 §8** — a pooled block left pooled counts nothing in the Day Review; the resolver already ignores blocks with no items — confirm, and add a criterion.
- **Ground truth (consumed):** RUN-5 (`prefillWeek`, `placeWorkoutOnDay` at line ~288, `plannedDayFor`), RUN-6 (`writeWorkoutRows`, `applyWorkType` / `removeWorkType`, travel in `layOutDay` and the Schedule's band grouping), DYN-5 (`materializeInTx`, `reconcileBlocks`, `orderBlocks`, `defaultTemplateFor`, the fixture pin path), DYN-14 (`confirmDay`, `saveMorning`'s `andSetDay`), `add-from-library.ts`, `orient.ts` (`readQuoteForDate`, `cycleIndex`), `journal.ts`, `review` services (the resolver), DAY-4's columns, DAY-5's `plannedDayFor` reading the two new FKs.
- **What this slice is NOT (binding):** any component (DAY-11, DAY-12); the header's row visibility (DAY-12); the pick's section UI (DAY-12); a change to `stackBlock`; N transitions (open #37); choosing the evening the night before (open #38).

**Rulings this slice makes (labelled, logged):**

- **`DesiredBlock` gains `key: string`** — `training:<habitId>` for a placed workout, the kind otherwise; `reconcileBlocks` matches a desired training block to an existing one whose items include a `workout` row with that `habit_id`, then falls back to an existing training block with no workout item (a pooled or emptied one), then creates. Non-training kinds match by kind as today. `orderBlocks` sorts training blocks with the same placement by the plan's list index carried on the desired block. Logged.
- **`prefillWeek` and `confirmDay` (`andSetDay`) place every `plan.training` entry**, calling `writeWorkoutRows` per block; `placeWorkoutOnDay` takes the list. The pick's own workout choice (one, from the rotation, under *Build each morning*) is unchanged and lands on the first training block or creates one. Logged.
- **The transition block** is a `DesiredBlock` of kind `transition` with the plan's `after_work_template_id`, created only when the plan has one and the day has work (a *No work* plan's transition is not materialised — B14 is skipped there); `layOutDay` anchors it forward from `max(work.scheduledEnd, afterWorkTraining.scheduledEnd)`; `block_order` (`users.block_order`) gains `transition` after `work` for existing accounts through a read-time default (`DEFAULT_BLOCK_ORDER` is the fallback when the stored order lacks a kind — confirm the existing behaviour and rely on it; no migration). Logged.
- **The activity block is materialised `pooled`** when the plan has an `activity_template_id`: `template_id` set, `state = pooled`, items = the day's evening fixtures (pins) only; `layOutDay` gives a pooled block its span from the transition's end (or work's) to the wind-down's start, so the evening room line can be read. A plan without a pool materialises the activity block as today (fixtures only, `planned`). Logged.
- **`chooseFromPool(rls, userId, { date, habitIds })`** in `services/day/choose-from-pool.ts`: refuses a closed day and a habit not in the block's pool template; adds each chosen habit as an item in the activity block in rank order through the `addFromLibrary` internals (extract its per-habit insert into a shared `insertHabitItem(tx, …)` rather than calling the exported function in a loop); sets the block `set`; re-lays the block. Calling it again adds more; it never removes (removal is *Not today* on the item). Logged.
- **`writeTravelRows(tx, userId, dayId, blockId, parent: { id, title, lifePriority, location }, travel: { thereMin, backMin })`** extracted from `writeWorkoutRows`, called by it and by the fixture pin path when `fixtures.plan_travel` and a length is positive; the fixture's rows read `→ {location or the fixture's title}` and `← Home`; untouched-only updates as today. Logged.
- **`readJournalClose(rls, userId, date)`** returns `{ quote: QuoteView | null }` — `readQuoteForDate` when `quotes_opt_in` and `cycleIndex` lands on the quote slot for that date (the same arithmetic as `readOrient`, extracted to one helper `quoteSlotFor(tx, userId, date)` so the two cannot disagree). `journal.close`'s existing read model gains the field. Logged.
- **`removeWorkType` accepts any day with a work block**; the mode gate is the header's (it shows the row for `usually` and `rarely` only). A *Usually* day un-worked reverts to the profile's anchors as a *Rarely* one does (TD-19). Logged.

## Behaviour & states

**No surface.** The observable state is the local tier after each step of the Vigil walk:

- **Pre-fill** a week from a plan with `training = [{A, before_morning}, {B, before_morning}, {C, after_work}]`, an after-work list, a pool: Monday has blocks `orient · training(A) · training(B) · morning · prep · work · training(C) · transition · activity(pooled) · wind_down` in that order; A and B each with their travel rows; `activity` has `template_id` = the pool, `state = pooled`, and only the evening fixtures as items; `transition` has the list's steps stacked from the later of work's end and C's end.
- **Set Monday from the plan**: the training blocks and their items are `set`; the activity block stays `pooled`.
- **`day.chooseFromPool({ date, habitIds: [x, y] })`**: two items in the activity block in rank order, block `set`, laid out after the transition; a third call adds a third; a habit outside the pool is refused `not_in_pool`.
- **A fixture with 20/20 travel** on Monday: three rows in its block — `→ The clinic · 20`, the fixture (pinned), `← Home · 20` — the fixture's `duration_min` unchanged; each travel row droppable alone (*Not today* on `← Home` leaves the other two).
- **The Day Review** on a Monday whose evening stayed pooled: the activity block contributes nothing to the number; the fixtures inside it count as pins do.
- **A *Usually* Saturday**: pre-filled as work; `removeWorkType` leaves the work block `not_today`, its items `not_assigned`, the day's anchors null; `applyWorkType` with a plan's template id brings it back.
- **`journal.close` on a quote-day with the bank on**: `quote` is the same row `day.orient` returned that morning; on a passage-day, `null`; with the bank off, `null`.

**States (exhaustive):** per block — planned · pooled · set · not_today; per training block — matched-by-item · matched-empty · created; per travel row — untouched (rewritten) · touched (kept). **Failure / edge states:** two entries for the same workout on one plan → the second is ignored with a logged warning (the validator refuses duplicates in DAY-3's `dayPlanTrainingSchema` refine — add it there if missing) · a pool template archived → the activity block materialises `planned` with fixtures only · `chooseFromPool` on a closed day → `closed` · the after-work training placed but the transition list empty → the transition block is not created · a *No work* plan → no transition, the activity block spans from the routine's end.

## Non-negotiables (this slice)

- **`stackBlock` is unchanged.** Every new block is more items in the same walk.
- **A training block is matched by its workout, never by kind alone.**
- **A pooled block holds no pool items until a tap; nothing infers the evening.**
- **Travel is never added to a length — a workout's or a fixture's.**
- **The quote after the journal is the morning's quote; nothing about the entry chooses it.**
- **The record is annotated, never rewritten**: touched rows and blocks keep their state through every re-lay.
- **Every read and write through `ctx.rls.execute()`.**

## Data & AI

**Schema changes: none** (DAY-4's columns consumed).

**Tables:** `days`, `day_blocks`, `day_items` (read, write) · `day_plans`, `templates`, `template_slots`, `habits`, `fixtures` (read) · `quotes` (read, the catalogue policy) · `users` (read).

**Placement:** `packages/api/src/services/day/materialize-day.ts` (`DesiredBlock.key`, `reconcileBlocks`, `orderBlocks`, the transition and pooled activity blocks, the fixture travel call); `services/day/lay-out-day.ts` (the transition's anchor; the pooled activity span); `services/day/prefill-week.ts` and `services/day/confirm-day.ts` (every `training` entry); `services/day/habit-item.ts` (`writeTravelRows` extracted); `services/day/choose-from-pool.ts` (new) + `add-from-library.ts` (the shared insert); `services/day/apply-work-type.ts` (the mode gate removed if present); `services/day/orient.ts` (`quoteSlotFor` extracted) + `services/day/journal.ts` (`readJournalClose`); `packages/api/src/routers/day.ts` (`chooseFromPool`) + `journal.ts` (the close read); `packages/validators/src/day.ts` (`chooseFromPoolInput`). Rules 3, 4, 6.

**tRPC / validators:** `day.chooseFromPool({ date, habitIds })` (new); `journal.close` / the journal read model (+ `quote`); `week.prefill`, `day.confirm`, `day.saveMorning`, `day.applyWorkType`, `day.removeWorkType` (behaviour).

**AI notes:** **None.**

## Accessibility

**None — no surface in this slice.**

## Acceptance criteria (observable — local tier; the Vigil walk; paste the rows)

1. `week.prefill` from the three-workout plan writes three `training` blocks on Monday, ordered `A, B` before the morning block and `C` after work, each holding its workout item and, where planned, its two travel rows with `parent_item_id`; a second `prefill` (or any re-lay) leaves the three ids unchanged and creates no fourth. *(Vigil, Mason.)*
2. Removing workout B from the plan and re-laying: B's untouched block and rows are deleted; A and C are untouched; a touched B block (an item marked done) stays and loses its link.
3. The `transition` block exists on Monday with `template_id` = the after-work list, laid out from the later of work's end and C's end; on a plan with no after-work list, no transition block; on a *No work* plan, none.
4. The `activity` block has `state = pooled`, `template_id` = the pool, and only the evening fixtures as items; `day.chooseFromPool` with two pool habits adds two items in rank order and sets the block `set`; a habit not in the pool is refused `not_in_pool`; a closed day is refused `closed`.
5. `day.saveMorning` with `andSetDay` (Set from the plan) sets every block but leaves the activity block `pooled`; the Day Review for that day, with the evening left pooled, counts the fixtures and nothing else from the activity block (paste the resolver's line).
6. A fixture with `plan_travel` and 20/20 materialises three rows around its pin in its block with `origin = travel` on the ends; the fixture's `duration_min` is unchanged; *Not today* on `← Home` leaves the other two; a fixture with `plan_travel = false` materialises alone.
7. A *Usually* Saturday pre-fills as work (`shape = structured`, a work block); `day.removeWorkType` leaves the work block `not_today`, its items `not_assigned`, and nulls the day's four anchor columns; `day.applyWorkType` with a plan's template id restores it.
8. `journal.close` (the read model) on a quote-day with the bank on returns the quote `day.orient` returned for that date; on a passage-day or with the bank off, `null`.
9. `git diff --stat packages/utils/src/day/stack.ts` is empty.
10. `grep -rn "training\[0\]" packages/api/src` returns nothing.
11. `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` pass (four separate commands).

## Likely-relevant technical notes (ADVISORY — dev decides)

- `reconcileBlocks` walks `desired` in order and finds the first `remaining` row by kind; make the finder a function of the desired block (`matcher(want)`) so training uses the item match and everything else the kind match; keep the two-pass renumber.
- `orderBlocks` already ranks by placement with a bias; add a tiebreak on `desired.index` for training rows and carry the index on the block row during materialisation only.
- The pooled activity block's span in `layOutDay`: v1.1 §11.7 says a pooled block "holds no items until the pick"; give it a span from the previous block's end to the wind-down's start so the builder's evening line and the Today row have numbers; the Schedule's `BlockBand pooled` already draws the dashed edge.
- `chooseFromPool` reads the pool through `getTemplate` (RUN-3) for the member ids and their `life_priority` order.
- `writeTravelRows`' `parent` argument is what differs between a workout (`location` → *Gym*) and a fixture (`location` text or the title); everything else is shared.
- `quoteSlotFor`: `readOrient` computes `cycleIndex(passages + (quote ? 1 : 0), date, CYCLE_EPOCH)` and the quote is the last slot; extract exactly that.

## Dev's call

The name of the shared insert extracted from `addFromLibrary` · whether `chooseFromPool` is one procedure or `add` + `set` · the warning path for a duplicate training entry.

## Out of scope

- **Every component** — the pick's section, the Today row, the header's rows, the journal's close screen, the builder's preview (DAY-11, DAY-12).
- **N transitions** — open item #37.
- **Choosing the evening at the journal** — open item #38.
- **The plan side** — DAY-5.

## Depends on

- **DAY-4** — the columns. Complete in `PROGRESS.md`. (DAY-5's `plannedDayFor` reading the two new FKs is consumed if Complete; if DAY-5 is still building in the same batch, this ticket reads the FKs directly from the plan row — the batch order is DAY-5 then DAY-6.)

## Recommended execution

**Opus.** The keyed reconcile inside the untouched-block rule, a pooled block that must stay empty, and a shared travel writer — three places where a plausible implementation corrupts a lived day on the first re-lay. A cheaper model matches training by kind and merges two workouts into one block.

---

### Kickoff (paste into the session)

> Build **DAY-6 — The day under v1.3** (attached spec). Model: **Opus**. **A training block is matched by its workout; a pooled block stays empty until a tap; travel is never in a length; the quote after the journal is the morning's; `stackBlock` is untouched.**
> Attach/read first, in order: this spec · v1.3 §3.1, §3.14–§3.16, §6, §7.2, §8, §11.6, R48, R50–R52, R54 · root `AGENTS.md` · `docs/specs/README.md` § Placement rules · DYN-5, DYN-14 (Epic 4 — the materialiser and `confirmDay`; reuse, don't fork) · RUN-5, RUN-6, RUN-4 (Epic 5 — `prefillWeek`, `writeWorkoutRows`, `applyWorkType`, `readOrient`) · DAY-4, DAY-5 · `packages/db/SCHEMA_REFERENCE.md` (day, plan) · this track's `DEVIATIONS.md` + `TECHNICAL-DECISIONS.md` (TD-24…TD-27) · Epic 5's `TECHNICAL-DECISIONS.md` (TD-12, TD-17, TD-19, TD-21) · Epic 4's (TD-2, TD-4, TD-5).
> Run the Vigil walk and paste the block and item rows at each step. Close in three places; log departures in `DEVIATIONS.md`. Run `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` as separate commands.
