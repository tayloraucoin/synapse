# DAY-5 — Plan services: the plan-owned work template, the two new lists on a plan, links CRUD, fixtures' place and travel, *Usually* in the profile and the pre-fill, `same_morning_routine`, created order, *Working today* by plan

**Epic:** DAY — The first run built day-first (UX v1.3) · **Phase 2** · Size: L
**Slice type:** Services and routers over the `0009` model — the plan side. The risk class is *ownership drift* (a work template that outlives its plan, or one plan's work renamed by another), *a plan that references a list of the wrong kind*, and *a link kind chosen by the client*.
**Vigil:** none. **Mason review:** TD-23's ownership rule at every entry point (`createDayPlan`, `updateDayPlan` name and work fields, `duplicateDayPlan`, `deleteDayPlan`); the kind checks on the two new template FKs; `deriveLinkKind` called server-side only.

**Status:** Complete (2026-09-25)

> **Mason — service review.** Read `day-plans.ts` end to end after the change. Confirm: a plan's work template is created only by `ensureWorkFor` and only from a plan write; `updateDayPlan({ name })` renames the template; `deleteDayPlan` archives it (never deletes — a `days.work_template_id` may point at it); `duplicateDayPlan` creates a **new** work template with the source's four values (a plan owns its work; two plans never share one); `after_work_template_id` accepts only kind `transition` and `activity_template_id` only kind `activity` with structure `pool`; `listWorkPlans` returns complete plans with work, by plan name, for the header sheet; the profile's anchors are written only when null and only by the first complete plan; links' `kind` is never read from input. State the probes you ran.

---

## Outcome

The plan side speaks v1.3: a day plan owns its work (`ensureWorkFor` creates and names the template; renames, duplicates and deletes follow the plan), carries an after-work list and an evening pool, and the first complete plan's times and anchors become the profile's defaults when the profile has none; fixtures save a place and travel; links have a full CRUD with the kind derived from the host; the profile accepts *Usually* and `same_morning_routine`; setup lists can ask for created order; *Working today* offers plans by name. After this ships, **DAY-6 has plans with the two new references to materialise, and DAY-8…DAY-12 have every procedure they call.** Nothing here touches `days`, `day_blocks` or `day_items` (DAY-6); nothing here renders.

## Why / intent

- **v1.3 R46, §3.8, TD-23** — the plan-owned work template: *"created with the plan, named after it, archived with it; the profile's anchors are the first plan's."* *Working today · as Day A* (§3.8) lists plans, not types.
- **v1.3 §3.13, §11.2, TD-25, TD-26** — `after_work_template_id` (kind `transition`, flow `forward`), `activity_template_id` (kind `activity`, structure `pool`); the view's `afterWork` and `evenings` refs; `usedBy` covers both.
- **v1.3 R51, §3.14, §11.3, TD-27** — `saveFixture` writes `location`, `travel_there_min`, `travel_back_min`, `plan_travel`; `toFixtureView` exposes them as `location` and `travel`.
- **v1.3 R53, §3.17, §11.4, TD-28** — `link.list / save / archive / restore / reorder`, mirroring `passage.*`; `kind` from `deriveLinkKind`; the `spotify:` scheme rewritten to `https://open.spotify.com/…` before storing.
- **v1.3 R49, §3.9, §13 #43** — `usually` accepted by `updatePreferences`; `prefillWeek` and `defaultPlanFor` treat `usually` as `always` for structure (planned as work, never asked); `quick-pick.ts`'s `sometimes` branch is untouched; the *Not working today* row is DAY-12's, reading `usually` from `workDays`.
- **v1.3 R61, §11.1** — `same_morning_routine` on `updatePreferences` and `user.me`.
- **v1.3 R64, §4.4 B2, B3** — on `completeDayPlan` of the **first** complete plan, write `usual_wake_time`, `lights_out_time`, `devices_off_time`, `work_start_time`, `work_end_time`, `anchor_direction` to the profile where each is null, from the plan's own values (or its work template's).
- **v1.3 R65** — DAY-2 added `order: "created"` to `habit.list`; this ticket adds the same option to `template.list` (`order: "created"`), which the builder's pickers use.
- **v1.3 R68** — `duplicateDayPlan` already copies references and clears weekdays (RUN-5); it now also copies `after_work_template_id` and `activity_template_id` by reference and creates the new work template (TD-23).
- **Ground truth (consumed):** RUN-3 (`ensureWorkTemplates`, `updateTemplate` with `workDayType`, `usedBy`), RUN-5 (`day-plans.ts`: `createDayPlan`, `updateDayPlan` with `moved`, `completeDayPlan`'s four rules, `duplicateDayPlan`, `deleteDayPlan`, `plannedDayFor`, `resolvePlanAnchors`), RUN-4 (`passages.ts` as the CRUD pattern), RUN-3's `fixtures.ts`, `services/user/preferences.ts`, DAY-3's validators and `deriveLinkKind`, DAY-4's columns.
- **What this slice is NOT (binding):** materialisation, `chooseFromPool`, travel rows, `removeWorkType` on a *Usually* day, the quote after the journal (DAY-6); any component; the retirement of `ensureWorkTemplates` (DAY-13, if unreferenced after DAY-8 re-points Settings).

**Rulings this slice makes (labelled, logged):**

- **`ensureWorkFor(tx, userId, planId, fields)`** in `services/plan/day-plans.ts`: when the plan has no `work_template_id`, creates a `templates` row (`kind: work`, `flow: forward`, `name: plan.name`, `anchor_time`, `work_end_time`, `location_kind`, `anchor_direction`, `icon` from the kind's default glyph) and writes the FK; when it has one, patches the four columns. `updateDayPlan`'s patch gains `work?: { kind, workStart, workEnd, direction } | null` — the object routes to `ensureWorkFor`; `null` sets `work_template_id = null` and archives the template it pointed at. The plan's `workStartTime` / `workEndTime` columns stay as overrides of the template's (TD-21's resolution order is unchanged: plan → template → profile), and the builder writes the template's hours through `work`, leaving the plan's two columns null unless B17's review later overrides them. Logged.
- **`updateDayPlan({ name })` renames the work template; `deleteDayPlan` archives it; `duplicateDayPlan` creates a new one** with the source's values and the copy's name. Logged.
- **`listWorkPlans(rls, userId)`** returns `{ planId, name, icon, templateId, startClock, endClock }[]` for complete plans with a work template, in `sort_order`; `day.applyWorkType` keeps taking a `templateId` (the header passes the plan's). Logged.
- **The two new FKs are kind-checked in `updateDayPlan`**: `afterWorkTemplateId` must reference an unarchived template of kind `transition`; `activityTemplateId` one of kind `activity` and structure `pool`; otherwise `DayPlanRuleError("wrong_kind")`. `createTemplate` accepts `kind: transition` (flow `forward`) and `kind: activity` with `structure: pool`. Logged.
- **The profile's defaults are written once, by the first plan to complete** — `completeDayPlan` checks each of the six columns for null and writes the plan's resolved value; a later plan never overwrites. `[DEFAULT — R64]` Logged.
- **`usually` structures like `always` everywhere the mode is read for structure** (`prefill-week.ts`'s `workModeFor` callers, `week-view.ts`); nothing asks; only the header sheet distinguishes it (DAY-12). Logged.
- **Links: the `spotify:` URI is normalised to its `https://open.spotify.com/{type}/{id}` form on save**, so one stored shape serves the callout; `kind` is derived after normalisation. No request is made to any host. Logged.
- **`template.list` gains `order?: "name" | "created"`** (default the existing order); the builder's `PickerList`s pass `"created"`. Logged.

## Behaviour & states

**No surface.** The observable state is the procedures' behaviour on the local tier, exercised through a script or the tRPC panel:

- `dayPlan.update({ id, patch: { work: { kind: "remote", workStart: "09:00", workEnd: "17:30", direction: "work_waits" } } })` on a plan with no template → a `templates` row of kind `work` named after the plan, the FK set; the same call again → the row patched, no second row; `{ work: null }` → FK null, the row archived.
- `dayPlan.update({ id, patch: { name: "Office day" } })` → the template's name follows.
- `dayPlan.duplicate({ id })` → the copy has its own work template with the source's four values; `after_work_template_id` and `activity_template_id` are the same ids as the source's; weekdays empty; state draft.
- `dayPlan.delete({ id })` → the plan gone, its work template archived, the five list templates untouched.
- `dayPlan.complete({ id })` on the first complete plan with the profile's six columns null → the six written; on a second plan → untouched.
- `dayPlan.update({ patch: { afterWorkTemplateId: <a morning template> } })` → refused with `wrong_kind`.
- `fixture.save({ …, location: "The clinic", travelThereMin: 20, travelBackMin: 20, planTravel: true })` → stored; `fixture.list` shows `travel.planned` true.
- `link.save({ title: "Focus", url: "spotify:playlist:abc" })` → stored as `https://open.spotify.com/playlist/abc`, `kind: spotify`; `link.save({ title: "Notes", url: "https://example.com/x" })` → `kind: other`; `http://` refused by the validator.
- `user.updatePreferences({ workDays: { "5": "usually" }, sameMorningRoutine: true })` → stored; `user.me` returns both.
- `day.listWorkPlans()` → the complete plans with work, by name.
- `template.list({ kind: "prep", order: "created" })` → created order.

**States (exhaustive):** per procedure — ok · refused (`wrong_kind`, `not_found`, the validator's) · rls-denied. **Failure / edge states:** a plan whose work template was archived by a template-side action (the block editor never lists work templates for archive — confirm; if it can, `ensureWorkFor` recreates) · `duplicateDayPlan` on a plan with no work → the copy has none · the first complete plan is a *No work* plan → the profile's wake, lights out and phone away are written; the three work columns stay null.

## Non-negotiables (this slice)

- **A plan's work template is created, renamed, duplicated and archived only through the plan's own writes.**
- **A template FK on a plan is kind-checked; a plan never points at a list of the wrong kind.**
- **`kind` on a link is derived server-side and never read from input; no host is contacted.**
- **The profile's six defaults are written once, only where null, only by a complete plan.**
- **Every read and write through `ctx.rls.execute()`.**
- **Nothing here touches `days`, `day_blocks`, `day_items`.**

## Data & AI

**Schema changes: none** (DAY-4's columns consumed).

**Tables:** `day_plans` (read, write) · `templates` (read, write — the work template's create/patch/archive; `transition` and `activity` kinds created) · `fixtures` (write — four columns) · `links` (read, write) · `users` (write — `work_days`, `same_morning_routine`, the six defaults) · `habits` (read).

**Placement:** `packages/api/src/services/plan/day-plans.ts` (`ensureWorkFor`, `listWorkPlans`, the kind checks, the defaults-on-complete, duplicate/delete amendments); `services/plan/templates.ts` (`createTemplate` for the two kinds; `listTemplates` order); `services/plan/fixtures.ts` (the four fields; `toFixtureView`); `services/library/links.ts` (new — the CRUD, mirroring `passages.ts`); `services/user/preferences.ts` (`usually`, `sameMorningRoutine`); `services/day/prefill-week.ts`, `services/day/week-view.ts` (`usually` structures as `always`); `packages/api/src/routers/{day-plan.ts (the `work` patch), template.ts (order), fixture.ts, link.ts (new; registered in root.ts), user.ts, day.ts (`listWorkPlans`)}`; `packages/validators/src/{day-plan.ts (the `work` object on the patch), link.ts (DAY-3's), template.ts (order)}`; `packages/types/src/domain/view.ts` (`WorkPlanView`, `LinkView` from DAY-3). Rules 3, 4, 5, 7.

**tRPC / validators:** `dayPlan.update` (patch += `work`, `afterWorkTemplateId`, `activityTemplateId`); `dayPlan.duplicate`, `dayPlan.delete`, `dayPlan.complete` (behaviour); `template.create` (two kinds), `template.list` (order); `fixture.save` (four fields); `link.list / save / archive / restore / reorder` (new); `user.updatePreferences` (`workDays` with `usually`, `sameMorningRoutine`); `day.listWorkPlans` (new).

**AI notes:** **None.**

## Accessibility

**None — no surface in this slice.**

## Acceptance criteria (observable — local tier, a script or the tRPC panel; paste the rows)

1. `dayPlan.update` with `work` on a plan without a template creates one `templates` row (`kind = work`, `name = plan.name`, the four columns as sent, `icon` the kind's glyph) and sets `work_template_id`; a second call patches the same row; `work: null` nulls the FK and sets `archived_at` on the row. *(Mason.)*
2. Renaming the plan renames the template; `dayPlan.delete` archives it and leaves the list templates; `dayPlan.duplicate` yields a copy with a **new** work template (different id, same four values, the copy's name), the same `after_work_template_id` and `activity_template_id`, empty weekdays, `draft`.
3. `dayPlan.update({ afterWorkTemplateId })` with a `morning` template is refused `wrong_kind`; with a `transition` template it is stored; `activityTemplateId` with a `stack`-structured activity template is refused; with a `pool` one stored; `template.list` shows `usedBy` for both.
4. `dayPlan.complete` on the first complete plan writes the six profile columns where null (paste `users` before and after); a second plan's complete changes none of them.
5. `fixture.save` stores the four fields; `fixture.list` returns `location` and `travel { thereMin, backMin, planned }`; a fixture saved without them reads `null, 0, 0, true`.
6. `link.save` normalises `spotify:playlist:abc` to `https://open.spotify.com/playlist/abc` with `kind = spotify`; an `https://example.com/…` link stores `kind = other`; `http://` is refused; `link.list` returns sort order; `archive` / `restore` / `reorder` behave as `passage.*`; as user B, user A's links are invisible.
7. `user.updatePreferences({ workDays: { …, "5": "usually" } })` stores it; `week.prefill` for a week with Saturday `usually` creates a structured Saturday with a work block; `quickPick` on that Saturday has `shape: null` (not asked).
8. `user.updatePreferences({ sameMorningRoutine: false })` stores and `user.me` returns it; `null` is accepted.
9. `day.listWorkPlans` lists complete plans with work by plan name and excludes drafts and *No work* plans.
10. `template.list({ kind: "prep", order: "created" })` returns created order; without `order` the existing order.
11. `grep -rn "kind:" packages/api/src/services/library/links.ts` shows `kind` assigned only from `deriveLinkKind`; `grep -rn "fetch(" packages/api/src/services/library/links.ts` returns nothing.
12. `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` pass (four separate commands).

## Likely-relevant technical notes (ADVISORY — dev decides)

- `ensureWorkTemplates` (RUN-3) ensures a profile-level template for the *Yes* path; keep it until DAY-8 re-points screen 3's callers, then DAY-13 removes it if nothing imports it.
- `completeDayPlan`'s existing four rules (`needs_days`, `needs_wake`, `needs_lights_out`, `needs_work`) stand; the defaults write runs after they pass, inside the same transaction.
- `duplicateDayPlan` currently copies the seven references; add the two new FKs to its column list and replace the `work_template_id` copy with `ensureWorkFor` on the copy.
- `links.ts` can be `passages.ts` with the columns swapped; keep the same `sort_order` compaction on reorder.
- The `spotify:` normalisation: `spotify:{type}:{id}` → `https://open.spotify.com/{type}/{id}`; anything else with the `spotify:` scheme is refused by the validator's `refine`.

## Dev's call

Whether `work` on the patch is an object or four flat fields (object recommended — one write, one ensure) · the `WorkPlanView` shape beyond the six fields named · whether `listTemplates`' `order` is a param or a second procedure.

## Out of scope

- **Materialising the transition, the pool, N training blocks, fixture travel rows; `chooseFromPool`; *Not working today* on a *Usually* day; the quote after the journal** — DAY-6.
- **Any screen** — DAY-8…DAY-12.
- **Removing `ensureWorkTemplates`, `WorkDayTypeCards`, Settings → Work-day types** — DAY-13.

## Depends on

- **DAY-4** — the columns and the table. Complete in `PROGRESS.md`.

## Recommended execution

**Opus.** Ownership rules across five entry points where a missed one leaves an orphan template or two plans sharing one; the kind checks and the once-only defaults are the edge cases. A cheaper model gets the happy path and lets `duplicate` share the work template.

---

### Kickoff (paste into the session)

> Build **DAY-5 — Plan services** (attached spec). Model: **Opus**. **A plan owns its work template through the plan's writes alone; a template FK is kind-checked; a link's kind is derived and nothing is fetched; the profile's defaults are written once.**
> Attach/read first, in order: this spec · v1.3 §3.8, §3.9, §3.13, §3.14, §3.17, §11, R46, R49, R51, R53, R61, R64, R65, R68 · root `AGENTS.md` · `docs/specs/README.md` § Placement rules · `docs/ai-guides/trpc-foundation-patterns.md` · RUN-3, RUN-4, RUN-5 (Epic 5 — the services this amends; reuse, don't fork) · DAY-3, DAY-4 · `packages/db/SCHEMA_REFERENCE.md` (plan, library, user) · this track's `DEVIATIONS.md` + `TECHNICAL-DECISIONS.md` (TD-23, TD-25…TD-28) · Epic 5's `TECHNICAL-DECISIONS.md` (TD-10, TD-14, TD-19, TD-21).
> Paste the `templates` and `day_plans` rows for criteria 1–4. Close in three places; log departures in `DEVIATIONS.md`. Run `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` as separate commands.
