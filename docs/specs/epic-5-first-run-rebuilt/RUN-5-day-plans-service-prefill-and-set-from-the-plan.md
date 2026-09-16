# RUN-5 — Day plans: the service, the weekday invariant, duplicate and delete, `week.prefill` reading plans first, and *Set from the plan* through `saveMorning`

**Epic:** RUN — The first run rebuilt (UX v1.2) · **Phase 1** · Size: L
**Slice type:** The composition service and the two places it is read — the week build and the morning. The risk class is *a second materialiser* (a plan applied by code that is not `prefillWeek` / `confirmDay`) and *detection* (a day set without a tap).
**Vigil:** none. **Mason review:** TD-10's weekday invariant (one plan per weekday, service-enforced); TD-17's confirm path (`saveMorning` → the pick's default resolution → `confirmDay`, one transaction, no fork).

**Status:** Not started

> **Mason — seam review.** Confirm: `prefillWeek` reads a weekday's plan first and falls through to today's typical-days logic only for what the plan leaves pooled; `saveMorning({ andSetDay: true })` calls the same `confirmDay` the pick calls, with an input built by the same resolver `getQuickPick` uses, inside one `ctx.rls.execute`; a weekday claimed by two plans is refused on write; no plan is copied into a template.

---

## Outcome

A person's day plans exist as a service: create a draft, update it one part at a time as the builder's nine screens write, assign weekdays (a weekday belongs to at most one plan — reassigning moves it and says so), duplicate a plan into *Day B* by reference (the same three templates, a new row), delete a plan without touching a template, and list them with each part's name and length resolved. The week build reads a weekday's plan before anything else, so after first run the week is the plans; and under `morning_mode = set_from_plan`, the orient frame's *Start the morning* can set the day in the same call that saves the morning's lines, using exactly the defaults the quick-pick would have preselected. After this ships, **RUN-12's builder has a service to write through and RUN-13's week screen and orient frame have a day to set.** Travel rows and version resolution inside the materialised day are RUN-6's; the screens are RUN-12/13's.

## Why / intent

- **v1.2 §3.13, R31, TD-10** — the plan's parts; *"a plan is a row of references and times, not a copy of anything"*; *"deleting a plan deletes references, never templates"*; *"a weekday belongs to at most one plan"*.
- **v1.2 §4.13** — each builder screen writes as it goes; a draft plan shows *unfinished*; *Duplicate* is how Day B usually starts; 13a: *"a chip already held by another plan … moves with one line — Thursday moves from Day A."*
- **v1.2 §4.15** — *"Pre-fill after first run comes from the plans by weekday, then typical days and counts for anything the plan leaves pooled."*
- **v1.2 §5.3, R37, TD-17** — *Set from the plan*: the tap sets the day from the plan; the pick is skipped; a *Sometimes* day is asked on the primary; a plan-less day falls back to the pick.
- **v1.1 §2.3** — confirmed, never detected.
- **TD-5** — `original_scheduled_start` is written in `confirmDay`; this ticket adds no second writer.
- **Ground truth (consumed):** `services/day/prefill-week.ts` (`defaultPlanFor`, `prefillWeek`, and its **existing `DayPlan` type, which is the *computed* plan for a weekday — rename it `WeekdayDefaults` so the noun is free**), `services/day/quick-pick.ts` (`getQuickPick` and its default resolution), `services/day/confirm-day.ts` (`confirmDay`, `ConfirmContext`), `services/day/orient.ts` (`saveMorning`), `services/user/complete-first-run.ts`, `services/plan/templates.ts` (RUN-3's `ensureWork`, `usedBy`), `routers/{week,day,user}.ts`, RUN-1's `dayPlanFormSchema` / `dayPlanPatchSchema`, RUN-2's `day_plans`.
- **What this slice is NOT (binding):** the builder UI (RUN-12); the week screen and the frame's primary (RUN-13); travel rows, `version_key` resolution, `applyWorkType` (RUN-6); any change to `stackBlock` or `materializeDay`'s reconcile rule.

**Rulings this slice makes (labelled, logged):**

- **`dayPlan.create` makes a draft with the next name** (*Day A*, *Day B*, … *Day Z*, then *Day AA*) and, on the first plan, preselects every *Always* and *Sometimes* weekday (`[DEFAULT §13 #19]`); later plans start with no weekdays. Logged.
- **`dayPlan.update` is a patch**: any subset of the parts; `weekdays` in the patch is validated against every other plan's and, when a weekday is taken, the response carries `moved: [{ weekday, fromPlanId, fromPlanName }]` after the move — the service moves it (one write, both rows) so the builder's line *Thursday moves from Day A.* is a report, not a question. Logged.
- **`dayPlan.complete` flips `state` to `complete`** and requires: ≥ 1 weekday, a wake and a lights-out (own or the profile's), and either a work template or `noWork: true`. The three template FKs may be null (a plan with no routine is honest). Logged.
- **`dayPlan.duplicate` copies the row with the same FKs**, `state: draft`, no weekdays, name *Day B*. Templates are not duplicated — `usedBy` on each will now list both. Logged.
- **`dayPlan.delete` hard-deletes the row** (it is composition, not record; nothing on a day points at a plan — `day_blocks.template_id` points at templates). Logged.
- **`prefillWeek` reads `day_plans` first**: for each weekday with a complete plan, the day's blocks come from the plan (block order from the profile; the three templates assigned; the work block from `work_template_id` with `days.work_template_id` written — TD-19; the four times as the day's anchors; training as placed blocks with `placement`; breaks as pinned or floating items inside work; fixtures by weekday minus `excluded_fixture_ids`); then `defaultPlanFor` fills only what is still pooled (a *Flexible* focus, a *Sometimes* day's shape). A weekday with no plan behaves as today. Logged.
- **`saveMorning` gains `andSetDay?: boolean`** (TD-17): when true and the day is unconfirmed, the service builds the confirm input from the pick's resolver (the plan's choices are already the day's blocks after pre-fill; the resolver's defaults are therefore the plan's), and calls `confirmDay` in the same transaction; the response carries `set: true | false` and, when false, `reason: "no_plan" | "sometimes_unanswered" | "already_set"`. `workingToday` is accepted as an input for the *Sometimes* dialog's answer; when the day is *Sometimes* and it is absent, `set: false, reason: "sometimes_unanswered"` and nothing is set. Logged.
- **`user.completeFirstRun` accepts an optional `morningMode`** (default `set_from_plan`; replacing `overflowMode`, which is now a Settings-only preference) and pre-fills from plans. Optional because RUN-12's screen 13 completes first run without asking the mode until RUN-13 moves completion to screen 14. Logged.

## Behaviour & states

**No surface.** The procedures: `dayPlan.list` → `DayPlanSummaryView[]` (id, name, icon, weekdays, state, the one-line summary's parts resolved: work type name and hours, wake, lights out, workouts with placement, the three list names and lengths); `dayPlan.get({ id })` → `DayPlanView`; `dayPlan.create`; `dayPlan.update({ id, …patch })`; `dayPlan.complete({ id })`; `dayPlan.duplicate({ id })`; `dayPlan.delete({ id })`; `week.prefill` (plans first); `day.saveMorning({ date, gratitude, intention, visualisation, andSetDay?, workingToday? })`; `user.completeFirstRun({ morningMode })`.

**States (exhaustive):** a plan — draft · complete; a weekday — unclaimed · claimed by one plan; a morning save — saved · saved-and-set · saved-not-set (three reasons). **Failure / edge states:** `update` with a weekday already in the same plan → no-op · `complete` without a wake or lights-out and a profile without them → refused with the missing fact named · `prefillWeek` with a plan whose `prep_template_id` points at an archived template → the block is created empty and pooled, and a warning is logged (never a throw) · `andSetDay` on a closed day → `set: false, reason: "already_set"` (closed is set) · `andSetDay` on a day whose training block has no placement (no plan) → the pick's rule stands: `set: false, reason: "no_plan"` and the frame lands on the pick.

## Non-negotiables (this slice)

- **One plan per weekday**, enforced on every write.
- **A plan copies nothing.** Templates are referenced; `duplicate` duplicates references.
- **One materialiser, one confirm.** `prefillWeek` and `confirmDay` are amended; nothing new writes `day_blocks` or `day_items`.
- **The tap confirms.** `andSetDay` runs only from `saveMorning`; nothing in the entry tree or a job calls it.
- **A *Sometimes* day is asked, never inferred.**
- **Every query through `ctx.rls.execute()`.**

## Data & AI

**Schema changes: none.**

**Tables:** `day_plans` (read, write) · `templates` (read) · `habits` (read) · `fixtures` (read) · `users` (read, write — `morning_mode` via `completeFirstRun`) · `days`, `day_blocks`, `day_items` (write through `prefillWeek` / `confirmDay` only).

**Placement:** `packages/api/src/services/plan/day-plans.ts` (new: the CRUD, the weekday invariant, `toDayPlanView`), `services/day/prefill-week.ts` (plans first; `DayPlan` → `WeekdayDefaults`), `services/day/orient.ts` (`saveMorning` + `andSetDay`), `services/day/quick-pick.ts` (expose the default resolver as a function `resolvePickDefaults` for `saveMorning` to call — no second resolver), `services/user/complete-first-run.ts`; `routers/day-plan.ts` (new), `routers/{week,day,user}.ts`, `root.ts`; `packages/validators/src/day-plan.ts` (RUN-1), `day.ts` (`saveMorningInput` + `andSetDay`, `workingToday`), `user.ts`. Rule 3.

**tRPC / validators:** `dayPlan.list/get/create/update/complete/duplicate/delete` (new) · `week.prefill` · `day.saveMorning` (widened) · `user.completeFirstRun` (widened; `overflowMode` removed from its input).

**AI notes:** **None.**

## Accessibility

**None — no surface in this slice.**

## Acceptance criteria (observable — local tier; probes through the server caller against a seeded account with a work template, a prep, a morning and a wind-down template, two workouts, two fixtures)

1. `dayPlan.create` on a fresh account returns *Day A*, `state: draft`, `weekdays` = every *Always* and *Sometimes* weekday from `work_days`; a second `create` returns *Day B* with no weekdays.
2. `dayPlan.update({ id: B, weekdays: [3] })` when Thursday is A's moves it: A no longer has 3, B has it, the response has `moved: [{ weekday: 3, fromPlanId: A, fromPlanName: "Day A" }]`.
3. `dayPlan.update({ id: A, prepTemplateId: P, morningTemplateId: M, windDownTemplateId: W, workTemplateId: T, training: [{ habitId: push, placement: "before_morning" }], breaks: [{ habitId: walk, at: "midday" }], excludedFixtureIds: [f2] })` succeeds one part at a time (seven separate calls); `template.list` now shows `usedBy: [{ id: A, name: "Day A" }]` on P, M and W.
4. `dayPlan.complete({ id: A })` succeeds; on a plan with no weekdays it is refused naming *days*; on a plan with no work template and `noWork` unset it is refused naming *work*.
5. `dayPlan.duplicate({ id: A })` returns *Day B* (or the next letter) with the same seven references, `state: draft`, no weekdays; `dayPlan.delete({ id: B })` removes the row and every template still exists.
6. `week.prefill` on a week where Monday is A's: Monday's `day_blocks` are (in the profile's block order) orient · morning (template M) · training (push, `placement before_morning`) · prep (P) · work (T, `days.work_template_id = T`, `work_start_time` / `work_end_time` from T) · break (walk, midday) · activity (fixture f1 only — f2 excluded) · wind-down (W); Sunday (no plan, *Never*) is as before. *(Mason.)*
7. `day.saveMorning({ date: today, gratitude: "x", andSetDay: true })` on Monday (unconfirmed, pre-filled from A) sets the day: `days.confirmed_at` set, every item's `original_scheduled_start` written once, the response `set: true`; a second call returns `set: false, reason: "already_set"` and changes nothing. *(Mason.)*
8. On a *Sometimes* Saturday with a plan: `saveMorning({ andSetDay: true })` without `workingToday` → `set: false, reason: "sometimes_unanswered"`, nothing set; with `workingToday: false` → set as unstructured; with `true` → set structured from the plan.
9. On a weekday with no plan: `saveMorning({ andSetDay: true })` → `set: false, reason: "no_plan"`; the day is untouched and `day.quickPick` still returns the pick.
10. `user.completeFirstRun({ morningMode: "set_from_plan" })` writes `morning_mode`, marks first run, and pre-fills the current week from plans (criterion 6's shape); `overflowMode` in the input is refused as unknown.
11. `grep -rn "DayPlan\b" packages/api/src/services/day/prefill-week.ts` finds only the renamed `WeekdayDefaults` (or the new view type); no two types share the name.
12. `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` pass (four separate commands).

## Likely-relevant technical notes (ADVISORY — dev decides)

- `getQuickPick` already computes "what would be preselected" for every section; lift that into `resolvePickDefaults(tx, userId, date)` returning a `ConfirmDayInput`, and have both `getQuickPick` and `saveMorning` call it. That is the whole of TD-17.
- The one-line summary's parts (`DayPlanSummaryView`) are what `DayPlanCard` and the week screen render; resolve names and lengths server-side once (`stackBlock` over each template's slots for the lengths — `services/plan/fit.ts` already does this for the fit).
- The weekday move is two updates in one transaction; return the moved list from the same transaction's reads.
- `days.work_template_id` is written here for planned work days; RUN-6's `applyWorkType` writes it for *Rarely*.

## Dev's call

The next-name generator's exact sequence beyond *Z* · whether `dayPlan.list` embeds the resolved lengths or a second `dayPlan.summary` query does · the shape of `moved`.

## Out of scope

- **The builder's nine screens, `DayPlanCard`, Settings → Your days** — RUN-12.
- **Screen 14, the week build's *Plan* row, the frame's primary label, the pick's expanded mode** — RUN-13.
- **Travel rows, `version_key`, `applyWorkType`** — RUN-6.
- **`overflow_mode` in Settings → Your day → Morning** — already there (DYN-8); RUN-13 removes it from first run only.

## Depends on

- **RUN-3** — `ensureWork`, `usedBy`, the widened profile, workout details. Complete in `PROGRESS.md`.

## Recommended execution

**Opus.** The weekday invariant and the confirm path are the two places a cheaper model forks: a second resolver for *Set from the plan*, or a plan applied by copying slots into a day. Both are TD-4's sin one level up.

---

### Kickoff (paste into the session)

> Build **RUN-5 — Day plans** (attached spec). Model: **Opus**. **One plan per weekday; a plan copies nothing; one materialiser and one confirm; the tap sets the day and nothing else does; a Sometimes day is asked.**
> Attach/read first, in order: this spec · v1.2 §3.13, §4.13 (13a–13i, the writes), §4.15, §5.3, §11.5, §11.7 · v1.1 §2.3, §11.11 · root `AGENTS.md` · `docs/specs/README.md` § Placement rules · DYN-5 (`prefill-week.ts`, `confirm-day.ts` — reuse, don't fork) · DYN-14 (`quick-pick.ts`) · DYN-13 (`orient.ts`) · DYN-11 (`complete-first-run.ts`) · RUN-3 · `packages/db/SCHEMA_REFERENCE.md` (day_plans, days, day_blocks, templates) · this track's `DEVIATIONS.md` + `TECHNICAL-DECISIONS.md` (TD-10, TD-17, TD-19) · Epic 4's `TECHNICAL-DECISIONS.md` (TD-2, TD-4, TD-5).
> Probe criteria 6–9 through the server caller and paste the `day_blocks` rows. Close in three places; log departures in `DEVIATIONS.md`. Run `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` as separate commands.
