# RUN-3 — Plan services: work-day types, fixture kinds and icons, habit versions and workout details, `usedBy` on templates, the profile widened

**Epic:** RUN — The first run rebuilt (UX v1.2) · **Phase 1** · Size: L
**Slice type:** Services and validators over the plan side — the write path every setup screen will call one fact at a time. The risk class is *a fat resolver* (a screen-shaped procedure that bundles facts) and *a rule in two seams* (the work-column rule on `templates` enforced in the sheet but not the service).
**Vigil:** none. **Mason review:** the `kind = work` invariant lives in the service and the validator; `habit.update` refuses workout columns on a non-workout; no procedure takes a whole screen.

**Status:** Complete (2026-09-16 — built in batch 2 with RUN-4; `template.ensureWork`, the four work columns on `create`/`update`/`list`/`get`/`duplicate` with `NotWorkTemplateError` → `BAD_REQUEST`, `usedBy` in one query over `day_plans`, the profile adopting the first type's values when empty; `fixture.save` writing the kind's glyph and block; `HABIT_SUMMARY_COLUMNS` as the one habit select; `habit.createStep`, `habit.patch`, `habit.patchWorkout` (strict, one fact each, `HabitRuleError`), `createWorkout` taking details and a glyph, `createFromStarterLibrary` writing the seed's glyph and returning ids; `user.updatePreferences` accepting the six new columns alone and IGNORING the three retired ones; `effectiveEveningTimes` as the one derivation; pure probes pasted; the four commands pass. **The database-backed criteria (1–9) are unverified — no tier was touched, by Taylor's instruction** — see `DEVIATIONS.md`)

> **Mason — seam review.** Every new procedure validates, scopes, calls a service, returns. Confirm `template.update` refuses `workEndTime` / `locationKind` / `anchorDirection` / `icon` on a non-work template with a typed error; `habit.update` refuses `versions` with duplicate keys and `travelThereMin` on a habit; `template.list` returns `usedBy` without an N+1; the profile update accepts each new column alone.

---

## Outcome

The plan side can hold everything v1.2's screens 1–12 write, one fact per call: a work template can carry its own end, kind, anchor direction and glyph, and `template.ensureWork` guarantees one exists (silently, from the profile) so a plan always has a type to pick; a fixture carries a kind and a glyph, defaulted from the kind; a habit carries up to three versions and, for a workout, a type, a location and two travel lengths with a *plan for the travel* switch; a template's list row says which day plans use it; and `user.updatePreferences` accepts `morningMode`, `quotesOptIn`, the two new orient switches, and the journal reminder pair — each alone, so a screen can write on every change. After this ships, **RUN-5 has types and habits with versions and travel to compose, and RUN-8/10/11 have a write per control.** No day-side behaviour changes here (RUN-6); no passage or quote (RUN-4).

## Why / intent

- **v1.2 §3.8, R32, TD-14** — a work-day type is a work template with `work_end_time`, `location_kind`, `anchor_direction`, `icon`; the profile's three columns are the defaults; on screen 3's *Yes* path the one work template is created silently.
- **v1.2 §3.6, R42** — a fixture's kind is a label and an icon, defaulted from the kind, overridable; nothing in materialisation reads it.
- **v1.2 §3.5, R34, TD-11** — versions on `habits`; the first is the default; the validator holds the shape.
- **v1.2 §3.7, R35, TD-12** — workout type, location, `travel_there_min`, `travel_back_min`, `plan_travel` on the habit; the travel is never added to `duration_*`.
- **v1.2 §3.13, §4.16** — *"the block editor's template list says used by Day A, Day B"* — `usedBy` on `TemplateSummaryView` (read from `day_plans`' three FKs; the table exists after RUN-2 even before RUN-5 writes it).
- **v1.2 §11.1** — the profile columns.
- **v1.2 §2 guardrail 5** — save as you go: every procedure here accepts one fact; none requires the others.
- **Ground truth (consumed):** `services/plan/{templates,fixtures,save-slot,to-view,anchors}.ts`, `services/library/*` (habit create/update, `createWorkout`, `updateRotation`, `createFromStarterLibrary`), `services/user/preferences.ts`, `routers/{template,fixture,habit,user}.ts`, RUN-1's validators and seeds, RUN-2's columns.
- **What this slice is NOT (binding):** the day-plans service (RUN-5); anything that materialises a day (RUN-6); passages and quotes (RUN-4); any screen.

**Rulings this slice makes (labelled, logged):**

- **`template.ensureWork()` is a new procedure**: returns the person's work templates; when none exist it creates one named *Work* `[COPY]` with `anchor_time = users.work_start_time`, `work_end_time = users.work_end_time`, `anchor_direction = users.anchor_direction`, `location_kind null`, and returns it. Idempotent. Screen 3's *Yes* path and the builder's 13b both call it. Logged.
- **When a work template is created or updated on the *No* path and the profile's `work_start_time` is null, the profile takes the first type's values** (`work_start_time`, `work_end_time`, `anchor_direction`) — the defaults every other screen reads. When the profile already has values, they are left alone. Logged.
- **`createFromStarterLibrary` writes the seed's `icon`** and `createWorkout` writes the type's glyph when the input carries no icon; `fixture.save` writes the kind's glyph when the input carries none. Logged.
- **`habit.update` with `versions` re-validates `duration_min_min ≤ default version ≤ duration_min_max`? No — R21: the range is a default, never a clamp.** Versions are unbounded by the range; only `DURATION_MIN…MAX` binds. Logged.
- **`usedBy` is `{ id, name }[]` of day plans referencing the template through any of the three FKs**, computed in `template.list` with one query grouped by template id. Empty until RUN-5 writes plans. Logged.

## Behaviour & states

**No surface.** Described by the procedures:

- `template.ensureWork` (above); `template.update` accepts the four work columns (refused on other kinds with `NOT_WORK_TEMPLATE`); `template.list` returns `usedBy`, `workEndTime`, `locationKind`, `anchorDirection`, `icon` on each row; `template.create({ kind: "work", … })` accepts the four.
- `fixture.save` accepts `kind`, `icon`; `fixture.list` returns them.
- `habit.update` accepts `versions`, and for `type = workout`: `workoutType`, `location`, `travelThereMin`, `travelBackMin`, `planTravel`; `habit.createWorkout` accepts the same; `habit.list` / `habit.get` return them and `HabitSummaryView` carries `versions`, `workoutType`, `location`, `travel: { there, back, planned }`.
- `habit.createFromStarterLibrary` writes `icon` from the seed; a new `habit.createStep({ title, icon?, rangeMin, rangeMax })` creates a prep habit (`block_kind: prep`, `life_priority 7`, `scheduling hard`) — the step sheet's one call (v1.2 R33) — or `habit.create` with the block fixed, dev's call which, but the validator forbids a priority on a step.
- `user.updatePreferences` accepts `morningMode`, `quotesOptIn`, `orientAskIntention`, `orientAskVisualisation`, `journalReminderEnabled`, `journalReminderTime`; `user.me` returns them. `earliestWakeTime`, `orientPassage`, `orientShowLastNight` are **removed from the input schema** (they stop being written; the columns stay until `0008`).
- Derived defaults: when `devicesOffTime` is written and `journalReminderTime` is null, the service leaves it null — the *derived* default (phone away − 60) is computed on read in `user.me` as `journalReminderTimeEffective`, so a person who never touched it always tracks phone away (v1.2 §4.11: *"changing lights out moves phone away with it until phone away has been touched"* — the same rule, one level down). Likewise `devicesOffTime` null → effective lights out − 60. Logged.

**States (exhaustive):** each procedure's success · refused (typed error) · unauthenticated. **Failure / edge states:** `ensureWork` called twice concurrently → the second finds the first (a unique partial index on `(user_id, kind) WHERE kind = 'work' AND archived_at IS NULL AND name = 'Work'` is *not* added — the service reads-then-creates inside one `ctx.rls.execute` transaction; a duplicate *Work* is harmless and archivable) · `habit.update` versions on a habit with slots → nothing changes on existing days; `version_key` is per item (RUN-6) · a fixture `kind` change never touches materialised pins.

## Non-negotiables (this slice)

- **Thin resolvers.** Validate, scope, call, return.
- **One fact per call.** No procedure requires a second field to accept the first.
- **The work-column rule is enforced in the service**, not only the validator.
- **Range is a default, never a clamp** (R21) — versions and *usually* are bounded by `DURATION_MIN…MAX` only.
- **Travel is never added to a duration.**
- **Every query through `ctx.rls.execute()`.**

## Data & AI

**Schema changes: none** (RUN-2's columns).

**Tables:** `templates` (read, write) · `fixtures` (read, write) · `habits` (read, write) · `users` (read, write — the profile columns) · `day_plans` (read — `usedBy`).

**Placement:** `packages/api/src/services/plan/templates.ts` (+ `ensureWork`, the work columns, `usedBy`), `services/plan/fixtures.ts` (+ kind, icon), `services/library/*` (+ versions, workout details, `createStep`), `services/user/preferences.ts` (+ the columns, the effective-time read), `services/plan/to-view.ts` (the view additions); `routers/{template,fixture,habit,user}.ts`; `packages/validators/src/{template,fixture,habit,user}.ts` (RUN-1 defined the schemas; this ticket wires them). Rule 3 (services), rule 7.

**tRPC / validators:** `template.ensureWork` (new), `template.update`/`create`/`list` (widened), `fixture.save`/`list` (widened), `habit.update`/`createWorkout`/`list`/`get` (widened), `habit.createStep` (new) , `user.updatePreferences`/`me` (widened; three inputs removed). Zod in `@syn/validators`.

**AI notes:** **None.**

## Accessibility

**None — no surface in this slice.**

## Acceptance criteria (observable — local tier with `0007` applied; probes through the server caller)

1. `template.ensureWork` on a fresh account with `work_start_time 09:00` creates one work template (`anchor_time 09:00`, `work_end_time 17:30`, `anchor_direction` = the profile's) and returns it; a second call returns the same row and creates nothing.
2. `template.create({ kind: "work", name: "Remote", locationKind: "remote", anchorTime: "09:00", workEndTime: "17:00", anchorDirection: "work_waits" })` on an account whose profile has no `work_start_time` sets the profile's three columns to those values; on an account with values, the profile is unchanged.
3. `template.update({ id: <morning template>, workEndTime: "17:00" })` is refused with `NOT_WORK_TEMPLATE`; the same on a work template succeeds.
4. `fixture.save({ title: "Stand-up", kind: "meeting", weekdays: [1], atTime: "09:30", durationMin: 20 })` stores `kind = meeting`, `icon = 🗣️`, `block_kind = work` (the kind's default); passing `blockKind: "activity"` overrides the block and keeps the kind.
5. `habit.update({ id, versions: [{ key: "quick", label: "Quick", minutes: 5 }, { key: "full", label: "Full", minutes: 30 }] })` succeeds; four versions, a duplicate key, or `minutes: 0` are refused; `minutes: 90` on a habit with range 10–20 succeeds (no clamp).
6. `habit.createWorkout({ title: "Upper body", workoutType: "upper_body", location: "gym", travelThereMin: 15, travelBackMin: 15, planTravel: true, weeklyTarget: 2, typicalDays: [0, 3], durationMin: 60 })` stores all of it with `icon = 🏋️` (from the type) and `duration_min_min/max` untouched by the travel; `habit.update({ id: <a morning habit>, travelThereMin: 10 })` is refused.
7. `habit.createStep({ title: "Breakfast", rangeMin: 10, rangeMax: 30 })` creates `block_kind = prep`, `life_priority = 7`, `scheduling = hard`, `icon = 📌` (the default); `createFromStarterLibrary({ blockKind: "prep", titles: ["Breakfast"] })` creates it with `icon = 🍳`.
8. `template.list` returns `usedBy: []` for every row (no plans yet); after inserting a `day_plans` row by SQL pointing `prep_template_id` at a template, that row's `usedBy` is `[{ id, name }]`, in one query (the log shows no per-row query).
9. `user.updatePreferences({ morningMode: "build_each_morning" })` alone succeeds; `{ quotesOptIn: true }` alone; `{ journalReminderTime: "20:45" }` alone; `{ earliestWakeTime: "06:30" }` is refused as an unknown key; `user.me` returns `journalReminderTimeEffective = "20:45"` when set and `devices_off − 60` when null, and `devicesOffTimeEffective = lights_out − 60` when `devices_off_time` is null.
10. `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` pass (four separate commands).

## Likely-relevant technical notes (ADVISORY — dev decides)

- DYN-4's `templates.ts` already branches on `kind` for the anchor; add the four columns to the same `TemplateSummaryView` mapper in `to-view.ts`.
- `usedBy`: one `select template_id, id, name from day_plans` unnested over the three FK columns, grouped in code.
- The effective-time reads are two lines in `preferences.ts`'s `toProfileView`; `clockToMinutes` / `minutesToClock` exist in `@syn/utils`.
- `createStep` can be `habit.create` with a server-set `blockKind: "prep"` and `lifePriority: 7`; a separate procedure keeps the step sheet's input free of a priority field, which is why it is named.

## Dev's call

`createStep` as its own procedure or a mode on `habit.create` · the typed error names · whether `HabitSummaryView.travel` is an object or three fields.

## Out of scope

- **Day plans, `week.prefill` from plans, `andSetDay`** — RUN-5.
- **Travel rows, version resolution on items, `applyWorkType`, the reminder job** — RUN-6.
- **Passages, quotes, the upload kind** — RUN-4.
- **Any screen** — RUN-8…RUN-11.

## Depends on

- **RUN-2** — the columns and tables. Complete in `PROGRESS.md`.

## Recommended execution

**Sonnet.** Widening precedented services against a precise column list; the one invariant (the work-column rule) is stated twice. Choosing down to Composer risks a screen-shaped procedure that bundles facts, which S8.4 was.

---

### Kickoff (paste into the session)

> Build **RUN-3 — Plan services** (attached spec). Model: **Sonnet**. **One fact per call; thin resolvers; the work-column rule in the service; range never clamps; travel never adds to a duration.**
> Attach/read first, in order: this spec · v1.2 §3.5–§3.8, §11.1–§11.3 · `docs/ai-guides/trpc-foundation-patterns.md` · root `AGENTS.md` · `docs/specs/README.md` § Placement rules · DYN-4 (`templates.ts`, `fixtures.ts`, the habit services — reuse, don't fork) · RUN-1 (the validators) · RUN-2 (the columns) · `packages/db/SCHEMA_REFERENCE.md` (templates, fixtures, habits, users, day_plans) · this track's `DEVIATIONS.md` + `TECHNICAL-DECISIONS.md` (TD-11, TD-12, TD-14) · Epic 4's `TECHNICAL-DECISIONS.md` (TD-1, TD-3).
> Probe every criterion through the server caller and paste the results. Close in three places; log departures in `DEVIATIONS.md`. Run `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` as separate commands.
