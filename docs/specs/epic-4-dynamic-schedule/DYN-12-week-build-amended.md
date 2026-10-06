# DYN-12 — The week build amended: per-block day sheet, the shape toggle, the pre-filled week, the training swap confirm

**Epic:** DYN — Dynamic schedule (UX v1.1) · **Phase 1** · Size: M
**Slice type:** An existing canvas (WK-01/WK-02) re-pointed at the block read model. The risk class is *two vocabularies on one screen* — a v1.0 "template" picker beside v1.1's blocks — and *a second materialiser* (a sheet that reconciles a day itself rather than sending the assignment).
**Vigil:** none. **Vesper review:** the day row's one line against §4.13; the day sheet is a row per block kind present; the trade is one confirm line with two answers.

**Status:** Complete (2026-09-13 — authored and built in one thread, with DYN-11; the row line, the per-block `DaySheet` with the shape toggle, the focus and workout rows, *Plan from your defaults*, and `week.tradeWorkouts` with the confirm; the four root commands pass; the browser walk is blocked at sign-in — logged in `DEVIATIONS.md`)

**Owner:** Reeve (spec) → dev (build) · **Reviewer:** Vesper (the row line and the sheet by eye), Mason (`tradeWorkouts` against `confirmDay`'s trade path; `assignBlocks` never rebuilds a touched block)

## Outcome

WK-01's seven rows each read UX v1.1 §4.13's one line — *Structured · Menu · Viewpoint · Push · Stand-up 9:30* — from `week.get`'s `DayPlanView` (DYN-5): the shape, the morning (a routine's name, *Menu*, or *one of A/B*), the focus (or *decide in the morning*), the workout, the fixtures; a *sometimes* work day with no plan shows the shape as *?*. Tapping a day opens the amended `DaySheet`: the shape toggle at the top (*Structured · Unstructured*), then a row per block kind the day has, each a `PickerList` of that kind's templates with target status (*Morning A · 1 of 2 this week*; the morning also offers *Menu — decide in the morning*), a *Focus* row (the focuses with what is left of their counts), a *Training* row (today's workout, with *Swap with…*), and *Add a one-off* at the bottom with the one-off rows. Every change is one `week.assignBlocks` with the day's full assignment — the materialiser reconciles (DYN-5), the sheet never does. A confirmed day's blocks are read-only; its one-offs are not. *Swap with…* lists the other days of the week; choosing one asks *Trade with Tuesday's pull?* — **Trade** · **Cancel** (R25) — and `week.tradeWorkouts` writes both days' workout items. An unplanned week offers **Plan from your defaults** (`week.prefill`) beside *Copy last week*. After this ships, **DYN-15 has a planned week to render *Set in the morning* from, and DYN-13's post-completion landing has a week behind it.** The v1.0 template picker, the *Day starts at* field and the *Remove template* footer are replaced, not kept.

## Why / intent

- **§4.13** — *"A day row shows its **shape** (structured / unstructured), its **morning** (a routine name, or menu, or one of A/B), its **focus** (or decide in the morning), its **workout** (from typical days), and its fixtures — as one line of muted text: Menu · Viewpoint · Push · Stand-up 9:30. Tapping a day opens the `DaySheet`, amended: a row per block kind present, each a `PickerList` of that kind's templates with target status (Morning A · 1 of 2 this week), plus the shape toggle at the top and Add a one-off at the bottom. The first week after first run is pre-filled … Applying materialises the structured parts immediately (fixtures, pins, assigned routines) and leaves pooled parts to the pick … Training swap in the week build: dragging Push from Monday onto Tuesday shows one confirm line — Trade with Tuesday's pull? — **Trade** · **Cancel** (R25)."*
- **§3.9** — *"Sometimes work days (Saturday) are a pool of two shapes; the pick asks Working today? first."*
- **§3.8** — *"A day picks one template and one focus (R5) … a day can be pooled (decide in the morning)."*
- **v1 §4.5 stands** — seven rows, the targets line, *Copy last week*, the one small *most behind* marker, never a sort.
- **Ground truth (consumed, never rebuilt):** DYN-5's `week.get` (`DayPlanView` with `shape`, `morningLabel`, `focusLabel`, `workoutLabel`, `fixtureLabels`, `confirmed`, `planned`), `week.assignBlocks`, `week.prefill`, `week.dayPreview` (`DayView.blocks`, `shape`), `materializeDay`'s reconcile rules, `confirmDay`'s trade path (`ensureTrainingBlock`, the workout item); DYN-4's `template.list({ kind })` with `usedThisWeek`/`weeklyTarget`, `habit.list({ types })`; DYN-8's `settingsYourDayBlockRoute`; DYN-7's `PickerList`, `SegmentedControl`, `ConfirmDialog`; the existing `OneOffSheet`.
- **What this slice is NOT (binding):** the Today tab's *Set in the morning* rendering (DYN-15 — this sheet's copy says it); drag between day rows (DYN-9's `DragLayer` — *Swap with…* is the tap fallback and ships first, §13 #4); the quick-pick's *Working today?* (DYN-15); a per-day work-hours override (the work template carries the start; a day's own `work_start_time` is the pick's, DYN-15).

**Rulings this slice makes (labelled, logged):**

- **The sheet sends the whole assignment, every time.** `week.assignBlocks({ date, blocks, shape, focusHabitId })` with `blocks` built from `dayPreview.blocks` (kind → `templateId`, or `"pool"` for a pooled block) plus the one change; a kind with no template sends `null`. The materialiser keeps what is touched (DYN-5); the sheet holds no reconcile logic. Logged.
- **The shape toggle re-assigns.** *Unstructured* sends orient and wind-down only; *Structured* sends the profile's default plan for the date (`week.defaultPlan({ date })`, a read of DYN-5's `defaultPlanFor`) so the day gets the same blocks the pre-fill would have given it. Logged.
- **The morning row offers the kind's templates and *Menu*.** *Menu* is `"pool"`. The target status reads `usedThisWeek` of `weeklyTarget` from `template.list({ kind })`; the *most behind* marker stays on one row. Logged.
- **The focus row reads counts from the week.** `habit.list({ types: ["deep_work"] })` for the rows; *n of m this week* counts the week's days whose `focusLabel` is the focus; *Decide in the morning* clears `focusHabitId` (null). Logged.
- **The trade is a service, `tradeWorkouts(date, withDate)`,** the week build's half of R25: refuses when either day is confirmed (`CONFLICT`, *Tuesday is already set.*), ensures a training block on both days (`ensureTrainingBlock`, exported from `confirmDay`), reads each day's workout (its untouched workout item, else the rotation's typical one for that weekday), and writes them swapped as workout items — the same rows `confirmDay`'s trade writes, so the quick-pick's *Monday's is pull — still?* reads them. A day with no workout on either side is *Nothing to trade.* Logged.
- **A confirmed day's sheet is read-only for blocks and the shape; one-offs stay editable** (cross-cutting §8.1's record rule, applied to *set*). Logged.
- **`Copy last week` keeps copying; *Plan from your defaults* is `week.prefill`,** offered when the week has no planned day, and always in the overflow beside *Copy last week* when it has. Logged.
- **The *Day starts at* field is gone from the sheet.** The day's wake is the profile's until the morning sets it (DYN-13's wake moment); a per-day anchor in the week build was v1.0's single-template model. `week.changeAnchor` stays for the morning. Logged.

## Experience & states

### The rows — `components/week-build/week-canvas.tsx`

Seven `ListRow`s as before. The meta is one muted line: `[shape] · [morning] · [focus] · [workout] · [fixture…]`, omitting what is null — *Structured · Menu · Viewpoint · Push · Stand-up 9:30*; an unstructured day reads *Unstructured · Stand-up 9:30*; a *sometimes* work day with no plan reads *? · …*; nothing planned reads *Nothing planned*. The accessible name is the same facts as one sentence. The targets line and *Copy last week* stay; **Plan from your defaults** appears when `status === "unplanned"`. The header, the week switch and the embedded form are untouched.

### The sheet — `components/week-build/day-sheet.tsx`

Title *Tuesday 2026-09-15*, subtitle *Today* when live, *Set* when confirmed. Top: `SegmentedControl` **Structured · Unstructured** (disabled when confirmed or past). Then, in block order, one section per kind the day has (`dayPreview.blocks`): a `Text` row-title with the kind's word, and a `PickerList` (inline) of `template.list({ kind })` — title, meta *3 items · 45 min · 1 of 2 this week*, the *most behind* marker — with the current one selected; the morning's list has *Menu — decide in the morning* first; *New* opens `settingsYourDayBlockRoute(kind)`. A structured work day adds **Focus**: a `PickerList` of the focuses with *n of m this week* and *Decide in the morning* as none; and **Training**: the workout's title (or *None on this day*) with a ghost *Swap with…* that opens a `PickerList` of the other six days (their workout titles as meta); choosing one opens the `ConfirmDialog` *Trade with Tuesday's pull?* — **Trade** · **Cancel**. Bottom: **One-offs** as before (rows + *Add a one-off*). Footer: **Done**. The *This day* collapsible stays, reading the blocks' items in order; a pooled block reads *Set in the morning*. States: loading · structured · unstructured · confirmed (read-only blocks, the tag *Set*) · past (read-only blocks, *Past day*) · trading · offline.

**Failure / edge states:** the trade against a confirmed day → the `CONFLICT` sentence in the dialog, nothing written · neither day has a workout → *Nothing to trade.* · a template archived while selected → shown named as archived, not re-pickable (SET-6's rule, kept) · a kind with no templates → the row offers *New* only · `assignBlocks` on a past day → refused by the sheet (read-only), never sent · offline → the toggle and pickers disabled, the line shown.

## Non-negotiables (this slice)

- **One line per day row, muted, no numbers about the day** (a clock and a count of fixtures are times, not scores).
- **The sheet never reconciles.** Every write is `assignBlocks` with the full list, or `tradeWorkouts`.
- **The trade has two answers and one sentence.**
- **A set day is a record:** its blocks and shape do not change from here.
- **The *most behind* marker is one dot on one row, never a sort.**
- **No new `@syn/ui` component.**

## Data & AI

**Schema changes: none.**

**Tables:** `days` (update — `shape`, `work_focus_habit_id`) · `day_blocks` (insert, update, delete via the materialiser) · `day_items` (insert, update — the workout items; the materialiser's rows).

**Placement:** `apps/web/components/week-build/{week-canvas,day-sheet,copy}.tsx` amended; `packages/api/src/services/day/trade-workouts.ts` (new), `services/day/confirm-day.ts` (`ensureTrainingBlock`, `typicalWorkoutFor`, the item helpers exported), `services/day/prefill-week.ts` (`defaultPlanFor` read through a procedure), `routers/week.ts` (`tradeWorkouts`, `defaultPlan`), `packages/validators/src/week.ts` (`tradeWorkoutsInput`, `defaultPlanInput`), `services/day/get-day.ts` (`DayView.focusHabitId`). Rule 3 (services own rules), rule 9 (app-local composition).

**tRPC / validators:** `week.tradeWorkouts({ date, withDate })` → `{ traded: boolean }`, `CONFLICT` with a sentence · `week.defaultPlan({ date })` → `{ shape, blocks, focusHabitId }` · existing: `week.get`, `week.dayPreview`, `week.assignBlocks`, `week.prefill`, `week.copyLastWeek`, `template.list({ kind })`, `habit.list({ types })`.

**AI notes:** **None.**

**Instrumentation:** none.

## Accessibility

- The day row's accessible name is the line as a sentence (*Tuesday 15 Sept, structured, menu, Viewpoint, Push, Stand-up 9:30*).
- The shape toggle is a labelled radio group; disabled with the reason in the sheet's subtitle (*Set*).
- Each block section is a heading (`h3`) over its picker; the picker's rows carry the target status in the label.
- *Swap with…* is a button that reveals a labelled list; the confirm dialog traps focus and returns it to *Swap with…*.
- The read-only *This day* list is not interactive and says so by having no buttons.

## Acceptance criteria (observable — local tier; `yarn web:dev`)

1. After DYN-11's completion, `/settings/week` shows seven rows; Monday reads *Structured · Menu · Viewpoint · Push · Stand-up 9:30* (with those inputs), Sunday *Unstructured*, an unplanned Saturday on a *sometimes* account *?*. *(Vesper.)*
2. Tapping Monday opens the sheet with *Structured* selected, a *Morning* row with *Menu* selected and *Morning A · 0 of 2 this week* beneath, *Before work*, *Work*, *Closing the day* rows, a *Focus* row with *Viewpoint · 1 of 2 this week* selected, a *Training* row reading *Push*, and *One-offs*. *(Vesper.)*
3. Choosing *Morning A* writes `day_blocks.template_id` for the morning block and materialises its items; the row line reads *Morning A*; choosing *Menu* returns it to pooled with no items. *(Mason.)*
4. *Unstructured* leaves orient and wind-down blocks only; *Structured* restores the default plan's blocks; touched items on a kept block survive both. *(Mason.)*
5. *Swap with…* → *Tuesday* → *Trade with Tuesday's pull?* → **Trade** writes Monday's workout item as *pull* and Tuesday's as *push*; both rows update; the quick-pick on Monday would read *pull*. Against a confirmed Tuesday the dialog shows *Tuesday is already set.* and writes nothing. *(Mason.)*
6. A confirmed day's sheet shows *Set*, the toggle and pickers disabled, *Add a one-off* enabled. *(Vesper.)*
7. An unplanned week shows *Plan from your defaults*; tapping it fills the seven days per DYN-5 AC 1 and the button goes. *(Vesper.)*
8. `grep -n "Day starts at\|removeTemplate\|applyTemplate" apps/web/components/week-build/day-sheet.tsx` returns nothing.
9. Offline: the toggle, pickers and *Swap with…* disabled with the line; *Add a one-off* disabled.
10. `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` pass (four separate commands).

## Likely-relevant technical notes (ADVISORY — dev decides)

- `dayPreview.blocks` is the sheet's source of truth for which kinds exist and which template each has; `DayBlockView.state === "pooled"` maps to `"pool"`.
- `tradeWorkouts` mirrors the tail of `resolveTraining` in `confirm-day.ts`: `ensureTrainingBlock` for both dates, then `habitItem(workout, …)` written or updated on each side. The typical-workout fallback is `typicalWorkoutFor(tx, userId, date)`.
- `defaultPlan` is `defaultPlanFor(tx, userId, profile, date, weekDates(weekKeyOf(date)))` behind a query; the sheet uses it only for the *Structured* toggle.
- Keep `OneOffSheet` and the one-off rows exactly as they are.

## Dev's call

Whether *Plan from your defaults* also appears in a planned week's overflow (yes, as a ghost beside *Copy last week*) · the word for a pooled morning in the row (*Menu*, DYN-5's `MENU_LABEL`) · whether the trade list shows all six other days or only those with a workout (all six; days without one read *nothing planned* and are disabled).

## Out of scope

- **Drag between rows** — DYN-9.
- **The Today tab's *Set in the morning*** — DYN-15.
- **The quick-pick's *Working today?*** — DYN-15.
- **`copyLastWeek` semantics** — unchanged; a replacement by pre-fill is the *Plan from your defaults* button.

## Depends on

- **DYN-5** — `week.get`'s line fields, `assignBlocks`, `prefill`, `defaultPlanFor`, the trade path. Complete in `PROGRESS.md`.
- **DYN-7** — `PickerList` marker, `SegmentedControl`. Complete in `PROGRESS.md`.

## Recommended execution

**Sonnet** (the handoff's call); built by Opus in Taylor's batch 7.

---

### Kickoff (paste into the session)

> Build **DYN-12 — The week build amended** (attached spec). Model: **Sonnet**. **One line per row; the sheet never reconciles; the trade has one sentence and two answers; a set day is a record.**
> Attach/read first, in order: this spec · v1.1 §4.13, §3.8, §3.9, R25 · `apps/web/AGENTS.md` · root `AGENTS.md` · `docs/specs/README.md` § Placement rules · DYN-5 (`week-view.ts`, `materialize-day.ts`, `prefill-week.ts`, `confirm-day.ts`) · the existing `components/week-build/` · this track's `DEVIATIONS.md` + `TECHNICAL-DECISIONS.md`.
> Walk the week and the sheet in the browser on a pre-filled week. Close in three places; log departures in `DEVIATIONS.md`. Run `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` as separate commands.
