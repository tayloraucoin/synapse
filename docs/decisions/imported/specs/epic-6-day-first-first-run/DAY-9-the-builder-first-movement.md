# DAY-9 — The builder, first movement (B1–B7): name and days with the helper, up and lights out, work on this day, training with the cards and N placements, getting ready with the starters inline, fixed on this day with place and travel, so far; *Back* on the action row; the builder's skeletons

**Epic:** DAY — The first run built day-first (UX v1.3) · **Phase 4** · Size: L
**Slice type:** The day builder rebuilt front to back — its screen order, its frame, and the first seven screens, each one thing. The risk class is *a builder that is a form* (seven screens of fields), *the type noun leaking back* (a screen that says *type* or asks which weekdays share hours), *a workout card that remounts* (DAY-2's rule broken in a new home), and *a preview that disagrees with the service*.
**Vigil:** none. **Vesper review:** B1–B7 at 375px on a fresh account: the helper line on B1; B2's three times and the awake line; B3's two rows, the kind chips with nothing preselected, the notice line, the spans; B4's cards above the placement rows, two workouts with the same placement showing handles; B5's starters vanishing into the list as they are ticked; B6's *Away* caption on a matched fixture; B7's strip cut at work's end with the open morning band. Say *type* nowhere.

**Status:** Complete (2026-09-25)

> **Mason — write audit.** Every write goes through `dayPlan.update` (with DAY-5's `work` object), `habit.*`, `template.*`, `fixture.*`; nothing materialises; the preview is `buildPreview` (RUN-12's) extended, never a service; `BUILDER_SCREENS` is the one order and the profile-screen skips read `plan.sortOrder === 0` (the first plan) and `same_morning_routine`, never a client flag.

---

## Outcome

Screen 4's builder opens on B1 and walks a person through the first half of a day in the order a day happens: name and days with the first-plan helper; when it starts and ends; work on this day — the plan's own kind, hours and what-gives, or no work; training — the rotation's cards and, beneath them, which workouts go on this day and where, several allowed; getting ready — the starters ticked straight into a named list; what is fixed on this day, with a place and travel; and the day so far, drawn as hued bands to the end of work. *Back* sits on the action row on every builder screen; every screen shows its own skeleton while its data is out. After this ships, **DAY-10 continues the same order from B8.** B8–B17 keep v1.2's `13e`–`13i` files behind them until DAY-10 and DAY-11 replace them; the review (13i) stays reachable so a day can still be saved.

## Why / intent

- **v1.3 §4.4 (the builder's frame, which screens a later day shows), B1–B7** — verbatim, each screen's walk-through is quoted in *Experience & states*.
- **v1.3 R46, §3.8** — B3 is the plan's own work; DAY-5's `work` patch; *"Say type nowhere. Ask which weekdays share these hours nowhere. Preselect a kind nowhere."*
- **v1.3 R52, §3.15** — B4's several placements; DAY-6 materialises them; the order inside a placement is the list's.
- **v1.3 R51, §3.14** — B6's *Away* caption and the sheet's fields (DAY-7).
- **v1.3 R64** — B2's three times per plan; the profile's are DAY-5's on the first complete.
- **v1.3 R67** — B7's strip: *"the review's, cut at work's end; the same client preview through `stackBlock`, never a service."*
- **v1.3 §4 (the frame)** — *"every screen inside the builder shows Back as ghost text on the action row's left beside the header arrow"*; R63's per-screen skeletons.
- **v1.3 §13 #32, #33** — B3's preselection rule and the last plan's what-gives on a later plan.
- **Ground truth (consumed):** RUN-12 (`components/day-builder/*` — `use-day-builder.ts`, `use-list-screen.ts`, `list-header.tsx`, `slot-rows.tsx`, `preview.ts`, `builder-frame.tsx`, `day-builder.tsx`, the nine `13x` screens), RUN-10 (`use-prep-steps.ts`'s tick-writes-two-things pattern for B5's starters), RUN-11 (`WorkoutSetupCard`, `SetupCards` as fixed in DAY-2), RUN-8 (`WorkDayTypeCard`'s fields — the kind chips, the two `TimeField`s, the what-gives radio — reused as B3's body), DAY-1/DAY-2/DAY-7's composites, DAY-5's procedures, DAY-6's N-block materialiser (the preview must mirror it).
- **What this slice is NOT (binding):** B8–B17 (DAY-10, DAY-11); the pool, the transition (DAY-11); any Settings screen (DAY-12); deleting `13x` files that B8–B17 still use (DAY-11 replaces them; DAY-13 deletes leftovers).

**Rulings this slice makes (labelled, logged):**

- **`BUILDER_SCREENS` becomes the v1.3 list in one edit**: `["b01","b02","b03","b04","b05","b06","b07","b08","b09","b10","b11","b12","b13","b14","b15","b16","b17"]`, with a `visibleScreens(plan, profile, workouts)` function that drops `b04` when there are no workouts **and** the plan is not the first (the first plan shows B4 for the cards), drops `b08`, `b09`, `b10`, `b15` when `plan.sortOrder > 0` (a later plan), drops `b11` when `same_morning_routine === true` and the plan is not the first, drops `b13` and `b14` on a *No work* plan; the caption's total is the visible count. Screens not yet built (`b08`…`b17` in this ticket) map to v1.2's `13e`…`13i` components by a temporary table in `day-builder.tsx` that DAY-10 and DAY-11 shrink to nothing. Logged.
- **The files are `screens/b01-name-days.tsx` … `b07-so-far.tsx`**, each exporting one `Screen…` component taking `{ api, disabled }` (+ `onTotal` where a sticky line needs it), as RUN-12's do; `13a`–`13d` and `13g` are renamed with `git mv` where the screen survives (13a → b01, 13b → b02 + b03 split, 13c → b04, 13d → b05, 13g → b06). Logged.
- **B3 writes `dayPlan.update({ work: {...} })`** per field through DAY-5's object — a kind pick, a time's Done, a what-gives tap each send the full current four; `work: null` on *No work*; the plan's own `workStartTime` / `workEndTime` columns are not written here (B17's *Change* may, later). Logged.
- **B3's preselection (§13 #32)** — computed once on arrival from the plan's weekdays and the profile's `work_days`: all *Always/Usually* → *Work*; all *Never* → *No work*; mixed or none → nothing, *Next* disabled until chosen. A later plan's what-gives preselects the previous plan's (`sortOrder − 1`) direction (§13 #33). Logged.
- **B4 reuses `SetupCards` + `WorkoutSetupCard` (DAY-2's fixed ones) above `SelectRowList`** — the cards create and patch `habits`; the rows write `dayPlan.update({ training })` as 13c did, now for N; two rows with the same placement render a `SortableHandle` and reorder within that placement by rewriting `training`'s order. The *Yes / Not right now* radio shows only on the first plan with no workouts; *Not right now* writes nothing and moves on. Logged.
- **B5's starters are a `SelectRowList` above the list only while the list is new and empty**; a tick creates the step (`habit.createFromStarterLibrary({ blockKind: "prep", titles })`) and its slot (`template.saveSlot` at the midpoint, priority 7, hard) through RUN-10's per-row queue, and the row disappears from the starters and appears in the list; once the list has one row the starters collapse behind **Add a step** (the step sheet, which lists the remaining starters as its first section `[DEFAULT]`). Logged.
- **B6 is 13g with the `FixtureSheet`'s new fields (DAY-7) and a second caption line on rows with planned travel** (`+20 there · +20 back`). Logged.
- **B7 renders `buildPreview` cut at `workEnd`** (or at the last placed block on *No work*), with `BlockBand hue` and a pooled-style open band for the morning routine labelled *Morning routine · not built yet* `[COPY]` when `plan.morning === null`; `preview.ts` is extended for N training blocks (one block per entry, in order) so B7 and B17 mirror DAY-6. Logged.
- **`BuilderFrame` gains `skip`-slot *Back*** — the `StepFrame`'s skip slot carries *Back* (ghost, left) on every builder screen; a screen with its own ghost (B4's *Not on this day*, B6's *Skip for now*) shows both, *Back* first. Logged.
- **Each screen renders a skeleton of its own rows while `api.loading`** — `SkeletonRow`s in the count the screen expects (three), inside the frame, never a blank; `LoadingText` leaves the builder. Logged.

## Experience & states

**The frame.** The outer *4 of 5*; the caption *Day A · 3 of 17* (the visible count); heading and body per screen; the action row: *Back* (ghost, left), the screen's own ghost where it has one, the primary (*Next*, or the counted form); the header arrow does the same as *Back*. Focus moves to the heading on every screen change (RUN-12's).

### B1 — Name and days
Heading *Build a day.* Body *Most people have two or three. Give it a name and say which days it's for.* On the first plan, the muted line *If your days differ, start with the first work day of the week — the rest can start from this one.* `Input` **Name** with the emoji picker leading (13a's); `WeekdayChips` (multi) with the *Always · Usually · Sometimes* preselection on the first plan (RUN-5's create already writes it; DAY-5 widened it to *Usually*); a chip held by another plan as 13a. Writes per change. Primary *Next*.

### B2 — Up and lights out
Heading *Day A — when it starts and ends.* Three `TimeField`s value + Change + Done — **Up at**, **Lights out**, **Phone away** (following lights out − 60 until touched; the line *An hour before lights out is a common choice.*); under them, tabular, *15 h 45 awake.* Writes `wakeTime`, `lightsOutTime`, `devicesOffTime` when touched (null = the profile's, as 13b). Primary *Next*.

### B3 — Work on this day
Heading *Work on this day?* `LargeTargetRow`s **Work** · **No work on this day** (§13 #32). On *Work*: **Kind** `ChipPicker` (the four, nothing preselected; picking sets the work block's glyph, never a name); **Working by** · **Until about** `TimeField`s (9:00 / 17:30, or the previous plan's); the heading *When your morning runs long, what gives?* over the three rows (nothing preselected on the first plan; §13 #33 after); the muted line *Work is a block of time here. What happens inside it lives in your work tools.*; tabular *2 h before work · 5 h 15 after.* Primary *Next*, disabled until *Work* has a what-gives or *No work* is chosen. Writes `dayPlan.update({ work })` / `{ work: null }`.

### B4 — Training
Heading *Train on this day?* First plan, no workouts: **Yes** · **Not right now** first; on *Yes*, `SetupCards` of `WorkoutSetupCard`s (created order, collapsed to two lines on Done, **Add a workout**). Then `GroupHeading` **On this day** and one `SelectRow` per workout (glyph, name, length); selected reveals **When** (`QuickChipRow` *Before work · Midday · After work*), the *Before the routine · After it* segment on *Before work*, the travel caption; same-placement rows get a handle. Foot *Nothing is fixed. The morning can still swap or skip it.* Primary *Next*; ghost *Not on this day*. Writes `training` per change. A later plan: the cards collapsed above, the rows preselected from the duplicate's `training`.

### B5 — Getting ready
Heading *Getting ready.* Body *What has to happen before work on this day, in order.* `ListHeader` (the `PickerList` when other lists exist; the name field). On a new, empty list: the ten starters as `SelectRow`s with ranges; a tick moves the row into the list. `GroupHeading` **In order** over the `SortableList` of slot rows (handle · glyph · title · `MinutesStepper` by one · menu *One of two · Leave out on this day*); left-out steps under a hairline as *Not on this day* + *Include*; **Add a step**. Sticky *Getting ready A · 45 min · 8:15 to 9:00* (on *No work*: *Getting going A · 45 min* `[COPY]`). Primary *Next · 45 min*.

### B6 — Fixed on this day
Heading *Anything fixed on this day?* Body *A stand-up, an appointment, a class. Things with a set time.* Matched fixtures as `SelectRow`s preselected — glyph · title · *Tue · 9:30 · 20 min* · a caption line *+20 there · +20 back* when travel is planned; **Other days** beneath; **Add one** → the `FixtureSheet` (DAY-7's fields). Un-select → `excludedFixtureIds`; select from *Other days* → the confirm then `fixture.save` with the plan's days. Empty: *Nothing yet.* + **Add one**. Primary *Next*; ghost *Skip for now*.

### B7 — So far
Heading *Day A, so far.* Body *Up to the end of work. Tap a block to change it.* The `ScheduleAxis` at 96px/h from *up at* to *until about* (or the last placed block's end) with `BlockBand hue` per block so far, the morning band open when no routine exists, fixtures pinned in work, training bands per workout with travel ends, slack in the gutter. Tap a band → its screen (`onGo`). Primary *Next*.

**States (exhaustive):** the builder — b01…b07 · skeleton (per screen) · draft · saving (row pulse) · failed (revert + line) · offline (read-only) · first-plan · later-plan (duplicate-prefilled). **Failure / edge states:** B3 with no work templates possible (none — the plan makes its own) · B4 on a later plan with no workouts anywhere → skipped · B5's list template archived → *This list was removed — start a new one?* · B6 with no fixtures → the empty state · B7 on a *No work* plan → the strip to the last placed block, the morning open · two plans race for a weekday → *Thursday is Day A's.*

## Non-negotiables (this slice)

- **Say *type* nowhere; ask which weekdays share hours nowhere; preselect a kind nowhere.**
- **A workout card never remounts on its first write** (DAY-2's rule, in its new home).
- **Nothing here materialises; the preview is `buildPreview`.**
- **Every screen is one thing; every screen writes as it goes; *Next* navigates.**
- **The room is stated as room; hues on B7 only among these screens.**
- **Every string in `copy.ts`; no glyph in `copy.ts`.**

## Data & AI

**Schema changes: none.**

**Tables:** `day_plans` (read, write) · `templates`, `template_slots` (read, write — the work template through DAY-5; the prep list) · `habits` (read, write — workouts, steps) · `fixtures` (read, write) · `users` (read).

**Placement:** `apps/web/components/day-builder/{use-day-builder.ts (BUILDER_SCREENS, visibleScreens), day-builder.tsx (the switch, the temporary 13x table), builder-frame.tsx (Back), copy.ts, preview.ts (N training blocks, the cut), screens/b01-name-days.tsx, b02-times.tsx, b03-work.tsx, b04-training.tsx, b05-getting-ready.tsx, b06-fixed.tsx, b07-so-far.tsx}`; `apps/web/app/(setup)/_components/work-day-type-card.tsx` (its fields extracted into `b03-work.tsx`; the card and `WorkDayTypeCards` stay for Settings until DAY-13). Rule 9.

**tRPC / validators:** `dayPlan.update` (DAY-5's `work`, `training`, times, `weekdays`, `excludedFixtureIds`), `dayPlan.get/list`; `template.create/get/saveSlot/moveSlot/removeSlot/update/list`; `habit.list (order: created) / createWorkout / patchWorkout / createFromStarterLibrary / createStep / archive`; `fixture.list / save`; `user.me`.

**AI notes:** **None.**

## Accessibility

- The caption is `aria-live="polite"`; focus to the heading per screen; *Back* and the header arrow share the label *Back*.
- B3's kind chips are a `radiogroup`; the what-gives rows a `radiogroup`; the two `LargeTargetRow`s a `radiogroup`.
- B4's same-placement handles are *Reorder {title}* with Alt+↑/↓; the placement chips a `radiogroup` per row.
- B5's starters are `button[aria-pressed]`; the list's handles as 13d.
- B7's bands are buttons *{block}, {span}, edit*; the hue is never the only carrier (the in-band label).
- Skeletons carry `aria-busy` on the screen's region.

## Acceptance criteria (observable — local tier, 375px; a fresh account through screens 1–3, then the builder; paste the plan row after B3 and after B4)

1. On arrival the caption reads *Day A · 1 of 17*; `BUILDER_SCREENS` lists seventeen keys; `visibleScreens` returns seventeen for the first plan (B4 is always shown on the first plan, for the cards), twelve for a later plan with `same_morning_routine = false`, eleven with `true`, and one fewer on a later plan with no workouts; a pasted probe shows the five cases. *(Mason.)*
2. B1 shows the helper line on the first plan and not on a duplicate; the chips preselect *Always/Usually/Sometimes* weekdays.
3. B2's three fields write the plan's three columns only when touched; *Phone away* follows *Lights out* − 60 until touched; the awake line is tabular.
4. B3: *Work* preselected on an all-*Always* plan; picking *Remote*, *Work waits* creates one `templates` row of kind `work` named *Day A* with `location_kind = remote`, `anchor_direction = work_waits`, 09:00–17:30, and sets the FK (paste the row); *No work* nulls the FK and archives it; `grep -rn "type" apps/web/components/day-builder/copy.ts` finds no user-facing *type* string. *(Vesper.)*
5. B4 under Slow 3G: add *Push*, type, blur, pick *Gym or studio* — the card stays open, one row; select *Push* and *Pull* both *Before work*: `training` is `[{Push, before_morning}, {Pull, before_morning}]`; drag *Pull* above *Push* → the order flips in the column; a third with *After work* → `after_work` appended.
6. B5 on a new list: the ten starters show; ticking *Breakfast* creates the habit (if absent) and a slot at 20 with priority 7 and moves the row under *In order*; once one row exists the starters are behind **Add a step**; the sticky reads *Getting ready A · 20 min · 8:40 to 9:00*.
7. B6 preselects a Thursday fixture on a plan with Thursday and shows *+20 there · +20 back* when its travel is planned; un-selecting writes `excludedFixtureIds`; **Add one** opens the sheet with *Where*.
8. B7 draws hued bands from *up at* to *until about* — orient, the two training bands in order with travel ends, the open morning band labelled *Morning routine · not built yet*, getting ready, work with the fixture pinned — and no band after work; tapping the training band opens B4.
9. Every builder screen shows *Back* on the action row; tapping it on B1 returns to *Your days*; on B4 it opens B3 with focus on the heading.
10. With the network throttled, each screen shows three `SkeletonRow`s inside the frame until its data is there; `grep -rn "LoadingText" apps/web/components/day-builder` returns nothing.
11. `SELECT count(*) FROM day_blocks` before and after the whole walk are equal (nothing materialises).
12. `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` pass (four separate commands); `yarn directory-map` run.

## Likely-relevant technical notes (ADVISORY — dev decides)

- `visibleScreens` is pure; keep it in `use-day-builder.ts` beside `BUILDER_SCREENS` and test it with a pasted probe (first plan / later plan / no workouts / same routine / no work).
- B3's body is `WorkDayTypeCard`'s form minus the name and the Done — extract a `WorkFields` component from it that both use until DAY-13 retires the card.
- `preview.ts`: `training(placement)` returns habits; make it return `[{ habit, index }]` in `plan.trainingPlan` order and push one `workoutBlock` per entry; the cut for B7 is a filter on `blocks` by `startMin < workEnd` plus the work block itself.
- The morning's open band on B7: a `BlockBand` with `pooled` and `hue` and `name` from copy; no items.
- B5's starters: `use-prep-steps.ts` (RUN-10) is the tick logic against the profile's prep template; lift it to take a `templateId` so B5 uses the plan's list — do not fork it.

## Dev's call

Whether B4's same-placement reorder is a `SortableList` per placement group or a single list with placement headers · the `[COPY]` lines named · whether B7's cut includes an after-work training block placed *after work* (no — it is after work).

## Out of scope

- **B8–B17** — DAY-10, DAY-11.
- **The transition, the pool, the review's what-gives row, another day from the last** — DAY-11.
- **Settings** — DAY-12.
- **Deleting `work-day-type-card.tsx`'s list and the leftover `13x` files** — DAY-13.

## Depends on

- **DAY-8** — screen 4 as the builder's home, the frame's step number. Complete in `PROGRESS.md`.
- **DAY-5** — the `work` patch, created order, `usually`. Complete in `PROGRESS.md`.

## Recommended execution

**Opus.** Seven screens that must each be one thing, a plan-owned work step that must never say *type*, an N-workout row list with in-placement ordering, and a preview that must mirror DAY-6's materialiser; a cheaper model builds a form, reintroduces the remount, or draws one training band for two workouts.

---

### Kickoff (paste into the session)

> Build **DAY-9 — The builder, first movement (B1–B7)** (attached spec). Model: **Opus**. **Say *type* nowhere; every screen is one thing and writes as it goes; a card never remounts; nothing materialises; hues on B7 only.**
> Attach/read first, in order: this spec · v1.3 §4 (the frame), §4.4 B1–B7, §3.8, §3.14, §3.15, §13 #32, #33, R46, R51, R52, R64, R67 · `apps/web/AGENTS.md` · root `AGENTS.md` · `docs/specs/README.md` § Placement rules · RUN-12 (Epic 5 — `components/day-builder/`; reuse, don't fork) · RUN-10 (`use-prep-steps.ts`), RUN-11 (`WorkoutSetupCard`), RUN-8 (`WorkDayTypeCard`) · DAY-2, DAY-5, DAY-6, DAY-7, DAY-8 · this track's `DEVIATIONS.md` + `TECHNICAL-DECISIONS.md` (TD-23, TD-24, TD-27) · Epic 5's `TECHNICAL-DECISIONS.md` (TD-10, TD-18, TD-21).
> Walk B1–B7 at 375px on a fresh account; paste the `day_plans` and work `templates` rows. Close in three places; log departures in `DEVIATIONS.md`. Run `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` as separate commands, then `yarn directory-map`.
