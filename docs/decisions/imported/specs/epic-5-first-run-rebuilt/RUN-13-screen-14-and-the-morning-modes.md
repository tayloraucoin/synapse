# RUN-13 — Screen 14 and the morning modes: the week rows and the question, completion from plans, the week build's *Plan* row, the pick expanded under *build*, *Set from the plan* on the frame, *Working today* on a *Rarely* day, travel rows on Today and the Schedule

**Epic:** RUN — The first run rebuilt (UX v1.2) · **Phase 4** · Size: L
**Slice type:** The last first-run screen and the four day-side surfaces that read what the epic built. The risk class is *detection* (a day set without the tap), *a form every morning* (the pick expanded under the wrong mode), and *a dead end* (a plan-less day under *set_from_plan* with nowhere to go).
**Vigil:** the *Sometimes* dialog on the frame's primary; a plan-less weekday under `set_from_plan`; travel rows dropped alone on Today; *Working today* then *Not working after all*.

**Status:** Complete — 2026-09-16 (batch 8; the Vigil paths and the signed-in walk are unverified from the build thread — Vigil and Vesper are the gate; see `DEVIATIONS.md`)

> **Vigil — induce.** On a *Sometimes* Saturday with a plan: tap *Start the morning* → the dialog; *Not today* sets unstructured; *Working* sets from the plan. On a weekday with no plan under `set_from_plan`: the tap lands on the pick, not a blank list. On a *Rarely* day: *Working today* → the work block appears; *Not working after all* → it goes. On Today: *Not today* on *← Home* leaves the workout; *Not today* on the workout takes both ends. Under `build_each_morning`: the pick opens with every section expanded and the plan's choices preselected. State which ran.

---

## Outcome

First run ends on **Your week**: seven rows, each weekday's plan or *Unstructured* or *Off*, tap to change, *Edit Day A* to return to the builder, then one question — *Set from the plan* (preselected) or *Build each morning* — and **Open today** / **Plan this week first**, which write the mode, complete first run, and pre-fill the week from the plans. From then on the morning reads the mode: under *Set from the plan*, *Start the morning* sets the day (the label carries the anchor when hard; a *Sometimes* day asks in a two-row dialog first) and the Today tab beneath is the list with the confirm-yesterday panel at its top until resolved; under *Build each morning*, the quick-pick opens expanded with the plan's choices preselected. The week build's day sheet gains a *Plan* row; a *Rarely* day's header sheet offers *Working today*; the Today tab and the Schedule render a workout's travel rows — three rows, one band with two thin ends — and the item sheet can change a version. `step-12-fit.tsx` is gone. After this ships, **the first run is whole and the epic's launch-blocking set is built; RUN-15 can clean up.**

## Why / intent

- **v1.2 §4.14** — verbatim: heading *Your usual week.*; seven `ListRow`s (*Day A · 7:00 → 22:45 · 🏋️ Upper body* / *Unstructured* / *Off*, muted); tap → a `PickerList` sheet of plans + *Unstructured*, *Edit Day A* at its foot → 13i; the question as two `LargeTargetRow`s — **Set from the plan** (*Each morning opens on the plan for that day. Change anything from the day's menu.*, preselected) · **Build each morning** (*After the orient screen, choose what fits today. The plan is the starting point.*); primary **Open today**, ghost **Plan this week first**; *"Stores `users.morning_mode`; marks `first_run_completed_at`; pre-fills the current week from the plans … Open today lands on the orient frame if the day hasn't started, else on the Today tab"*; *"Show a number about the week. Ask anything already answered"* — never.
- **v1.2 §5.2 (4), §5.3, R37, TD-17** — *"Under Set from the plan (R37) this sets the day — the primary's label carries the anchor when it is hard: *Start the morning · work 9:00* — and the Today tab beneath is the list"*; the `ConfirmYesterdayPanel` at the top of the list until resolved; the *Sometimes* day: *"the label reads *Start the morning · working today?* and tapping it shows a two-row `Dialog` (**Working** · **Not today**) before the day sets"*; under *Build each morning* the pick *"with its sections expanded by default … and the plan's choices preselected"*.
- **v1.2 §4.15** — the `DaySheet`'s **Plan** row; the day row's line reads the plan first.
- **v1.2 §3.9, R40, TD-19** — *Working today* on a *Rarely* day; the reverse.
- **v1.2 §3.7, §6, TD-12** — travel rows on Today as `ItemRow`s with an arrow glyph and the destination; the Schedule *"shows the three as one band with two thin ends"*.
- **v1.2 §3.5, §6.3** — the item sheet's version control (a two-or-three-segment control at the top, like *one of*); the pick's version tabs.
- **v1.2 §3.10** — `overflow_mode` leaves first run; stays in Settings → Your day → Morning.
- **v1.1 §2.3** — confirmed, never detected; **§13 #27** — the tap.
- **Ground truth (consumed):** RUN-5's `dayPlan.list`, `week.prefill` (plans first), `day.saveMorning({ andSetDay, workingToday })`, `user.completeFirstRun({ morningMode })`; RUN-6's travel rows in `DayView`, `item.editToday({ versionKey })`, `day.applyWorkType` / `removeWorkType`; RUN-9's frame; RUN-12's builder and cards; DYN-12's `components/week-build/{day-sheet,week-canvas}.tsx`; DYN-14's `components/quick-pick/*` (`sections.tsx`, `summary-row.tsx`, `use-quick-pick.ts`); DYN-15's `components/day-list/*`, `day-header-sheet/*`, `item-sheet/*`, `confirm-yesterday/*`; DYN-16's `schedule-canvas/{layout,schedule-canvas}.ts(x)`; RUN-8's placeholder `step-13-days` (its completion) and the absence of 14; `lib/entry/resolve-entry.ts` (where *Open today* lands).
- **What this slice is NOT (binding):** the builder (RUN-12); any service (RUN-5/6 — consumed); the cleanup (RUN-15); drag on travel rows beyond what `DragLayer` already does for any item (they are items); a change to R18 or to the frame's other parts.

**Rulings this slice makes (labelled, logged):**

- **`step-14-week.tsx` owns completion**; `step-13-days.tsx`'s *Continue · n days* navigates to 14; the placeholder completion in 13 is removed; `step-12-fit.tsx` and its `copy.ts` entries (`fitSentence`, `modes`, `overflowQuestion`, the band labels) are deleted. `overflow_mode` is untouched in the schema and Settings. Logged.
- **The week rows read `dayPlan.list` and `users.work_days`**: a weekday with a complete plan → the plan; a *Never* / *Rarely* weekday with no plan → *Off*; anything else without a plan → *Unstructured*. Changing a row writes `dayPlan.update({ weekdays })` on the chosen plan (moving the day) or clears it from its plan for *Unstructured*. Logged.
- **`Open today` and `Plan this week first` both call `completeFirstRun({ morningMode })`**; then `resolveEntry` decides: `/orient` when today has no `woke_at`, else `/today`; *Plan this week first* → `/settings/week`. Logged.
- **The frame's primary under `set_from_plan`**: `useOrientFrame` reads `morningMode` and today's `anchorIsHard` / `workStartTime` from `day.orient` (RUN-4 widened it; add `todayAnchor` if absent — `[NEEDS VALUE AT BUILD: read `OrientView`]`); the label *Start the morning · work 9:00* when hard; on a *Sometimes* day *Start the morning · working today?* and the two-row `Dialog` before `saveMorning({ andSetDay: true, workingToday })`; the response's `set: false, reason: "no_plan"` → navigate to `/today`, which shows the pick (the fallback the service promised). Logged.
- **The Today list under `set_from_plan` shows `ConfirmYesterdayPanel` as its first section** (collapsible, the same component DYN-14/18 use) while yesterday has unconfirmed wind-down items; resolving it or opening the Day Review removes it. Logged.
- **The quick-pick under `build_each_morning` mounts with `defaultExpanded: true`** on every section; nothing else changes (v1.1 §5.3 stands). Under `set_from_plan` the pick still renders when `/today` is reached unconfirmed (the fallback) — with sections collapsed as v1.1. Logged.
- **The day header sheet gains *Working today* / *Not working after all*** on a day whose profile weekday is *Rarely* (or *Never*? — **Rarely only**, R40) and which has no / has a work block; *Working today* opens a `PickerList` of work-day types when more than one, else applies the one. Logged.
- **Travel rows on Today**: `ItemRow` with the arrow glyph (RUN-6's icon), the title *→ Gym* / *← Home*, checkbox, sheet; on the Schedule `layout.ts` groups items by `parentItemId` into one band with the workout's fill and the two ends at reduced height; drag on an end moves that end only (they are items; `DragLayer` needs nothing new). Logged.
- **The item sheet's version control**: for an item whose habit has versions, a `SegmentedControl` of the version labels at the top (like the *one of* control), writing `item.editToday({ versionKey })`; the habit-day sheet's *Takes* shows the resolved minutes and, when hand-set, clears the version (RUN-6's rule). The pick's routine rows show version tabs under the title writing the pick's local choice. Logged.

## Experience & states

### Screen 14 — `/setup/14` (§4.14)

Heading *Your usual week.* Seven `ListRow`s Monday-first: weekday left; right, muted, the plan's `EmojiSlot` + name + summary, or *Unstructured*, or *Off*. Tap → a `ResponsiveSheet` with a `PickerList` of plans (glyph, name, days) + *Unstructured* + *Edit {plan}* at the foot (→ `/setup/13` with the builder at 13i for that plan). The question: two `LargeTargetRow`s, *Set from the plan* preselected. Primary **Open today**, ghost **Plan this week first**. **States:** default · sheet · saving · completing · offline (primaries disabled).

### The orient frame — the primary (§5.2)

`set_from_plan`: label per the ruling; tap → `saveMorning({ …fields, andSetDay: true })` → slide up to `/today` (the list) or, on `no_plan`, to `/today` (the pick). *Sometimes*: the dialog first. `build_each_morning`: as DYN-13 → the pick expanded. **States:** set-mode-hard · set-mode-soft · set-mode-sometimes (dialog) · build-mode · setting (primary busy, label kept) · no-plan-fallback · offline (the fields save locally; the primary disabled with the line under `set_from_plan` because the set needs the network; under `build` it works as DYN-13).

### Today (§5.3, §6)

Under `set_from_plan` on a set day: the list with `ConfirmYesterdayPanel` first while pending. Travel rows as ruled. The header sheet's *Working today* / *Not working after all* on a *Rarely* day. The item sheet's version control. **States:** as DYN-15 plus with-last-night · travel-rows · rarely-working · rarely-not-working.

### The quick-pick (§5.3)

`build_each_morning`: every section expanded, the plan's choices preselected; version tabs on routine rows. Otherwise as DYN-14.

### The Schedule (§6.5)

The travel band: one `BlockBand`-like fill spanning the three items with the two ends drawn at half height and the arrow glyph; each end is its own `ScheduleBlock` for drag and the sheet.

### The week build (§4.15)

The day row's line: *Day A · Viewpoint · Push · Stand-up 9:30*; `DaySheet` gains a **Plan** `PickerList` row at the top (plans + *Unstructured*); picking writes the day's blocks from the plan through `week.applyPlan({ date, planId })` — **a new procedure in this ticket** that calls RUN-5's per-day pre-fill for one date (the same code `prefillWeek` runs per weekday, exposed for one day; Mason: it lives in `services/day/prefill-week.ts` as `applyPlanToDay`). Logged.

**Failure / edge states:** `saveMorning` succeeds on the fields and fails on the set → the frame shows *Couldn't set the day. The words are saved.* `[COPY]` and stays; `week.applyPlan` on a confirmed day → refused `already_set` with the line; a plan deleted between 14's render and the tap → the row re-reads and shows *Unstructured*; a *Rarely* day already working via a plan → the row reads *Not working after all*; a travel end dragged past the workout → `stackBlock` re-stacks as any item (the order is the person's now; no rule stops it — logged as `[OPEN]` for Vesper: should an end be allowed to cross its workout? Default: allowed, it is just an item).

## Non-negotiables (this slice)

- **The tap sets the day.** Nothing in `resolveEntry`, a job, or an effect calls `andSetDay`.
- **A *Sometimes* day is asked in the dialog**, never inferred.
- **A plan-less day never dead-ends** — the pick is the fallback.
- **No number about the week** on screen 14; no question already answered.
- **Travel never in the workout's length** anywhere it renders.
- **Under `build_each_morning` the pick is v1.1's pick, expanded** — nothing else changes about it.
- **No glyph in `copy.ts`.**

## Data & AI

**Schema changes: none.**

**Tables:** `users` (update — `morning_mode`, first run) · `day_plans` (read, write — weekdays) · `days`, `day_blocks`, `day_items` (write through `prefillWeek` / `applyPlanToDay` / `saveMorning` / `applyWorkType` / `editToday` only).

**Placement:** `app/(setup)/_components/step-14-week.tsx` (new), `step-13-days.tsx` (completion removed), `step-12-fit.tsx` (deleted), `copy.ts` (14; the fit entries removed); `components/orient-frame/*` (the primary, the dialog); `components/day-list/*` (the panel at the top; travel rows); `components/day-header-sheet/*` (+ the two rows); `components/item-sheet/*`, `components/habit-day-sheet/*` (the version control); `components/quick-pick/*` (`defaultExpanded`; version tabs); `components/schedule-canvas/layout.ts`, `schedule-canvas.tsx` (the travel band); `components/week-build/{day-sheet,week-canvas}.tsx` (the *Plan* row, the line); `packages/api/src/services/day/prefill-week.ts` (`applyPlanToDay`), `routers/week.ts` (`applyPlan`); `lib/entry/resolve-entry.ts` (14; landing); `lib/routes.ts`; `apps/web/AGENTS.md`. Rule 9; rule 3 for the one procedure.

**tRPC / validators:** `user.completeFirstRun({ morningMode })`, `dayPlan.list/update`, `day.saveMorning`, `day.orient`, `day.applyWorkType/removeWorkType`, `item.editToday`, `week.applyPlan` (new; `applyPlanInput { date, planId | null }` in `@syn/validators`).

**AI notes:** **None.**

## Accessibility

- The seven rows are buttons labelled *{Weekday}, {plan or Unstructured or Off}, change*; the sheet's `PickerList` is a radio group.
- The mode question is a radio group labelled by its rows' titles; each row's body is its description.
- The frame's dialog has two labelled buttons and traps focus; its title is *Working today?*; the primary's label change is announced by the button's own text.
- Travel rows read *→ Gym, 15 minutes* — the arrow glyph is `aria-hidden` and the title carries *to* / *from* in the accessible name `[COPY]`.
- The version control is a `radiogroup` labelled *Version*.
- *Working today* in the header sheet is an `ActionRowSheet` row like the others.

## Acceptance criteria (observable — local tier, 375px; the account from RUN-12 with Day A on Mon–Fri and a *Sometimes* Saturday plan)

1. `/setup/14` shows Monday–Friday as *Day A · 7:00 → 22:45 · 🏋️ Upper body*, Saturday *Day A*, Sunday *Off*; tapping Sunday and picking *Day A* moves it (`day_plans.weekdays` gains 6); picking *Unstructured* on Friday removes 4; *Edit Day A* lands on 13i. No number about the week appears. *(Vesper.)*
2. *Set from the plan* is preselected; **Open today** writes `morning_mode = set_from_plan`, `first_run_completed_at`, pre-fills the week (Monday's `day_blocks` as RUN-5's criterion 6) and lands on `/orient` (no `woke_at` today) — or `/today` when the day has started; **Plan this week first** lands on `/settings/week`. `/setup/12` is focuses; `grep -rn "step-12-fit\|fitSentence\|overflowQuestion" apps/web` returns nothing.
3. On the frame under `set_from_plan` with a hard anchor: the primary reads *Start the morning · work 9:00*; tapping it sets the day (one `confirmed_at`), slides to `/today` showing the list; with a pending *Last night*, the panel is the first section and disappears when resolved. *(Vigil.)*
4. On the *Sometimes* Saturday: the primary reads *Start the morning · working today?*; the dialog shows **Working · Not today**; *Not today* sets an unstructured day; *Working* sets from the plan; dismissing sets nothing. *(Vigil.)*
5. On a weekday with no plan under `set_from_plan`: the tap saves the words, receives `no_plan`, and lands on `/today` with the pick (collapsed); nothing was set. *(Vigil.)*
6. With `morning_mode = build_each_morning`: the frame's primary reads *Start the morning*; the pick opens with every section expanded and the plan's routine, training placement and focus preselected; version tabs on a routine row change the length and the `BudgetLine`; *Set the day* works as DYN-14.
7. On a *Rarely* Sunday: the header sheet shows *Working today*; tapping it (one type) creates the work block and the fixtures, the header reads *Remote · 9:00*; *Not working after all* removes it; on a Monday the rows are absent. *(Vigil.)*
8. Today with the workout placed and travel planned: three rows *→ Gym · 15* · *🏋️ Upper body · 60* · *← Home · 15*; *Not today* on *← Home* leaves the other two; *Not today* on the workout takes both ends; the Schedule draws one band with two half-height ends; dragging *← Home* by 10 min moves only it. *(Vigil.)*
9. The item sheet on a habit with versions shows *Usual · Quick · Full*; picking *Quick* writes `version_key quick`, `duration_min 5`, re-flows; the habit-day sheet's *Takes* set to 12 clears the version.
10. The week build: Monday's row reads *Day A · Viewpoint · Push · Stand-up 9:30*; the `DaySheet`'s *Plan* row shows *Day A*; picking *Unstructured* on Wednesday re-materialises it as orient + wind-down + fixtures; picking *Day A* again restores the blocks; on a confirmed day the row is disabled with the line.
11. `apps/web/AGENTS.md` lists `/setup/{1–14}` and describes 13 and 14; `resolveEntry` clamps to 14.
12. Offline: screen 14's primaries disabled; the frame's primary disabled under `set_from_plan` with the line, enabled under `build` as before.
13. `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` pass (four separate commands).

## Likely-relevant technical notes (ADVISORY — dev decides)

- `use-orient-frame.ts`'s submit already calls `saveMorning` then navigates; branch on `morningMode` and on the response's `set`.
- `sections.tsx` in the quick-pick has each section's collapsed state; `defaultExpanded` is one prop threaded from `use-quick-pick.ts` reading `user.me`.
- `layout.ts` in the Schedule computes block geometry per item; group by `parentItemId` before drawing and give the group one background rect.
- `applyPlanToDay(tx, userId, date, planId)` is the body of `prefillWeek`'s per-weekday branch; extract it in RUN-5's file and have `prefillWeek` call it — the procedure is thin.
- The week row's line: RUN-5's `DayPlanSummaryView` has the parts; the week view already carries focus, workout and fixtures.

## Dev's call

The dialog's exact copy beyond the two verbs · the arrow glyph's accessible wording `[COPY]` · whether the travel band is drawn in `layout.ts` or in `schedule-canvas.tsx` from the grouped items · the `[OPEN]` on an end crossing its workout (default: allowed).

## Out of scope

- **The builder** — RUN-12. **The services** — RUN-5, RUN-6.
- **Cleanup: `range-input`, `rotation-rows`, the three columns** — RUN-15.
- **The admin surface** — RUN-14.
- **Any change to Adjust, Do now, the journal, Review** beyond travel rows being items.

## Depends on

- **RUN-12** — plans exist and the builder is reachable from 14. Complete in `PROGRESS.md`.
- **RUN-6** — travel rows in `DayView`, `editToday({ versionKey })`, `applyWorkType`. Complete in `PROGRESS.md`.
- **RUN-9** — the frame as rebuilt. Complete in `PROGRESS.md`.

## Recommended execution

**Opus.** The one screen that completes first run, the tap that sets a day, a dialog that must be asked and never inferred, and four surfaces reading new rows; a cheaper model auto-sets on frame open "for convenience," or expands the pick under both modes.

---

### Kickoff (paste into the session)

> Build **RUN-13 — Screen 14 and the morning modes** (attached spec). Model: **Opus**. **The tap sets the day; a Sometimes day is asked; a plan-less day falls back to the pick; no number about the week; travel never in the length; the pick under build is v1.1's pick, expanded.**
> Attach/read first, in order: this spec · v1.2 §3.5, §3.7, §3.9, §3.10, §4.14, §4.15, §5.2, §5.3, §6, §13 #27 · v1.1 §2.3, §5.3, §6.1–§6.5 · `apps/web/AGENTS.md` · root `AGENTS.md` · `docs/specs/README.md` § Placement rules · DYN-13 (`orient-frame/`), DYN-14 (`quick-pick/`), DYN-15 (`day-list/`, `day-header-sheet/`, `item-sheet/`, `habit-day-sheet/`), DYN-16 (`schedule-canvas/`), DYN-12 (`week-build/`) — reuse, don't fork · RUN-5 · RUN-6 · RUN-9 · RUN-12 · this track's `DEVIATIONS.md` + `TECHNICAL-DECISIONS.md` (TD-12, TD-17, TD-19) · Epic 4's `TECHNICAL-DECISIONS.md` (TD-5).
> Induce every Vigil path and state which ran; say what you could not walk. Close in three places; log departures in `DEVIATIONS.md`. Run `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` as separate commands.
