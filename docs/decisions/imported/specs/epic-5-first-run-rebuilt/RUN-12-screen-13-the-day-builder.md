# RUN-12 — Screen 13, the day builder: nine sub-screens, the three named lists, the review at 96px/h, `DayPlanCard`, *Build another day*; Settings → Your days; the block editor's template list with *used by*

**Epic:** RUN — The first run rebuilt (UX v1.2) · **Phase 4** · Size: L
**Slice type:** The centre of the version — one client component with nine screens that composes a day from the parts, writing through the day-plans service as it goes. The risk class is *scarcity copy* (a shortfall sentence where the room line belongs), *a copied template* (a list built here that duplicates *Getting ready A* instead of referencing it), and *a builder that is a form* (nine screens of fields instead of nine screens of one thing each).
**Vigil:** none. **Vesper review:** 13e's room line and budget grammar; 13i's strip (no gutter labels, no overlap); the collapse on *Save Day A*; the card's summary line. **Mason review:** every write goes through `dayPlan.*` and `template.*`; nothing here materialises.

**Status:** Complete — 2026-09-16 (batch 7; the signed-in walk is unverified from the build thread — Vesper's screen review and Mason's write audit are the gate; see `DEVIATIONS.md`)

> **Vesper — screen review.** Build *Day A* end to end at 375px on an account with two work-day types, four steps, nine ranked habits (two with versions), two workouts (one with travel), two fixtures, three wind-down habits. Confirm: 13a preselects the *Always* and *Sometimes* weekdays and moving Thursday from a second plan reports one line; 13b lists the types with glyphs and the four times as value + Change; 13c places each workout with the three chips and shows *+15 there · +15 back, beside it*; 13d starts all-on in screen 7's order with the name field *Getting ready A* and the sticky total; 13e's first line is the room stated as room and the budget line never changes colour, over reads *… runs to 9:12*; 13g preselects the matched fixtures; 13h shows the two placed rows and lights out fixed; 13i has no gutter labels and nothing overlaps; the card's summary reads as §4.13 writes it. Say *doesn't fit* nowhere.

---

## Outcome

Screen 13 is where the twelve screens of parts become a day. On first arrival the builder opens at 13a with *Day A* named and its weekdays preselected; nine short screens follow — name and days, shape and times, training, getting ready, the morning routine against the room, breaks, the evening's fixtures, wind-down, and a review as a time-blocked strip — each writing as it goes through the day-plans service, with the three lists saved as named templates (*Getting ready A*, *Morning routine A*, *Wind-down A*) that a second day can reuse rather than rebuild. Saving lands on **Your days**: a card per plan with a one-line summary, a disclosure to its lists, *Edit · Duplicate · Delete*, and *Build another day*. The same list lives under Settings → Your day → Your days, and the block editor's template list now says which days use a template. After this ships, **RUN-13 has plans to lay the week out from.** Screen 14 and completion stay RUN-13's; until then screen 13's *Continue* completes first run as RUN-8's placeholder did (the ruling below).

## Why / intent

- **v1.2 §4.13** — the whole section, verbatim, is this ticket's behaviour spec; the walk-throughs of 13a–13i are quoted in *Experience & states* by screen. *"Judge the routine. Show a percentage. Leave a weekday claimed by two plans. Copy a template when it can reference one"* — never.
- **v1.2 §3.10** — the room, worded as room: *72 min for the routine · 45 chosen*; over: *84 chosen · 72 for the routine · runs to 9:12*, muted, no colour (R7). **§12.3** — never *doesn't fit*, *too much*, *over budget*, *cut*.
- **v1.2 §3.13, R31, TD-10** — the parts; references, not copies; *used by*.
- **v1.2 §13 #18, #19, #20, #28** — the four defaults: *Before work* sits before the routine; the first plan preselects *Always* and *Sometimes* weekdays; getting ready starts all-on in screen 7's order and the routine preselects by rank down to the room; the wide layout derives.
- **v1.2 §4.16** — Settings → Your day → **Your days**; the block-kind rows' template lists say *used by*.
- **v1.2 §10.2** — `DayBuilder` (draft · complete · reused-list · saving · failed · offline), `DayPlanCard` (collapsed · expanded).
- **v1.1 §3.11, §3.3** — the strip is the block editor's grammar at `pxPerHour` 96; `stackBlock` / `computeBudget` are the arithmetic (DYN-1).
- **S12.1** — the strip's labels never in the gutter at this height (RUN-7's `labelPlacement="inside"`).
- **Ground truth (consumed):** RUN-5's `dayPlan.*`, `template.*` (+ `usedBy`, `ensureWork`, `list`), `template.saveSlot` / `moveSlot` / `removeSlot`, `habit.list`, `fixture.list`; DYN-8's `components/block-editor/*` (the strip, `block-strip.tsx`, `editor-footer.tsx`, the template list under `settings/your-day/block/[kind]`), DYN-1's `computeBudget`, `stackBlock`, RUN-7's `SelectRow(List)`, `SortableList`, `PickerList`, `BudgetLine`, `QuickChipRow`, `LargeTargetRow leading`, `TimeField`, `Card`, `ScheduleAxis` + `BlockBand inside` + `ScheduleBlock`, `EmojiSlot`, RUN-8's frame and the placeholder `step-13-days.tsx`, RUN-10/11's habits with versions, workouts with travel, wind-down habits, fixtures with kinds.
- **What this slice is NOT (binding):** screen 14, the mode question, completion's move, the week build's *Plan* row, *Set from the plan* (RUN-13); any materialisation or `day_blocks` write (RUN-5's `prefillWeek`, called by RUN-13's completion); drag on the strip (13i is read-only; tap-to-edit only); the block editor's own screens (DYN-8/9 stand).

**Rulings this slice makes (labelled, logged):**

- **`components/day-builder/` is a feature folder**: `day-builder.tsx` (the nine-screen client component with its own caption *Day A · 3 of 9* under the frame's *13 of 14*), `screens/{13a-name-days,13b-shape-times,13c-training,13d-getting-ready,13e-morning,13f-breaks,13g-evening,13h-wind-down,13i-review}.tsx`, `day-plan-card.tsx`, `your-days.tsx` (the list), `use-day-builder.ts`, `copy.ts`, `index.ts`. `step-13-days.tsx` mounts `YourDays`, which opens the builder; Settings → Your day → Your days mounts the same `YourDays` embedded. Logged.
- **Each list screen (13d, 13e, 13h) creates its template on arrival when the plan has none for that kind** (`template.create({ kind, name: "Getting ready A" })` — the letter from the plan's name) and writes the FK on the plan at once; choosing an existing list from the `PickerList` writes the FK instead and **does not create**; *New list* creates. A list chosen from another plan is edited in place — the summary says *shared with Day B* `[COPY]` and editing it edits both, by design (§3.13). Logged.
- **13d's slots are written per change** (`saveSlot` on tick and stepper, `moveSlot` on drag, `removeSlot` on *Leave out on this day*) — the getting-ready template's slots are the list; *Leave out* is a slot removal on this list, never a habit change. Steps left out show under a hairline as *Not on this day* with *Include*. Logged.
- **13e's preselection down to the room** is computed once on arrival for a *new* routine (highest rank first, adding while `chosen ≤ room`; a habit whose *usually* would exceed the room is skipped and the next tried — the greedy fill Vesper's *"the highest-ranked are preselected down to the room"* implies); for an *existing* routine the slots are what they are. The room comes from `computeBudget` over the plan's times and the getting-ready template's total; on a *No work* day the line reads *No anchor on this day. The routine runs as long as it runs.* and nothing is preselected by budget — everything is offered, nothing chosen. `[DEFAULT — logged; Vesper's §13 #20]` Logged.
- **Version tabs on 13e's rows write the slot's `duration_min` to that version's minutes** and a `version_key` on the slot? **No** — `template_slots` has no `version_key`. The slot stores the minutes; the item's `version_key` is written at materialisation by matching minutes to a version (RUN-6's resolver takes `versionKey` from the pick; for a plan, RUN-5 resolves by minutes match, falling back to the default). `[ASSUMPTION — reversible: if Mason prefers `template_slots.version_key`, `0008` adds it; the minutes write stands either way.]` Logged.
- **13c writes `dayPlan.update({ training })`** with `{ habitId, placement }` per selected workout; *Before work* maps to `before_morning` (default, §13 #18) or `after_morning` by the sub-segment; *Midday* → `inside_work`; *After work* → `after_work`. Travel is read from the habit and only captioned here. Logged.
- **13g writes `excludedFixtureIds`** for un-selected matches; selecting a fixture from *Other days* adds this plan's weekdays to the fixture through `fixture.save` after a one-line confirm (*Add Thursday to Football?* `[COPY]`). Logged.
- **13h writes the wind-down template's slots per change**, like 13d; the two placed rows and lights out are rendered from the plan's times, never as slots (DYN-18's placement at materialisation stands); a habit dragged below the *Phone away* row is written with `sort_order` after it and renders as *confirm in the morning* (v1.1 §7.1). Logged.
- **13i is read-only**: `ScheduleAxis` at 96px/h with `labelPlacement="inside"`, bands per block from a **client-side preview** built by `stackBlock` over the plan's parts — the one place the builder computes a whole day, through the same function, never a service; tapping a band navigates to its screen; tapping an item opens DYN-8's slot sheet for that template. Logged.
- **`dayPlan.complete` is called on *Save Day A*** (13i's primary); a plan left before 13i stays `draft` and the card reads *Day A · unfinished* with *Continue building*. Logged.
- **Screen 13's *Continue* on the list calls `completeFirstRun` as RUN-8's placeholder did**, without a `morningMode` (RUN-3 removed `overflowMode`; RUN-5 made `morningMode` optional? — **make it optional in RUN-5's input if not already; default `set_from_plan`**), until RUN-13 moves completion to 14. Logged.

## Experience & states

### Your days — `/setup/13` and Settings → Your day → Your days

Heading *Your days.* `[COPY]` Empty on first arrival → the builder opens at 13a directly (no empty state seen). With plans: `DayPlanCard`s in `sort_order`: `Card` with `EmojiSlot` (or blank) · name · the days as small chips · the one-line muted summary (*🏠 Remote · up 7:00 · work 9:00–17:30 · 🏋️ Upper body before the routine · lights out 22:45*) · a chevron that expands to the three lists' names and lengths (*Getting ready A · 45 min*, *shared with Day B* where so) · `EllipsesMenu` (*Edit* → 13i; *Duplicate* → `dayPlan.duplicate` then 13a of the copy; *Delete* → a `Dialog` *Delete Day B? Its lists stay.* `[COPY]` **Delete · Cancel**). Draft cards read *unfinished* with *Continue building*. **Build another day** (full-width secondary). Primary *Continue · n days* (first run) / none (Settings).

### The builder's frame

Inside `StepFrame` (the outer *13 of 14*), a second caption line *Day A · 3 of 9*; back at 13a returns to the list; every screen's primary *Next* (13i: **Save Day A**); no *Skip* except 13c's *Not on this day* and 13f's *Skip for now*.

### 13a — Name and days

*Build a day.* / *Most people have one or two. Give it a name and say which days it's for.* `Input` **Name** prefilled from the plan (the emoji picker in its leading slot, blank by default). `WeekdayChips` (multi); on the first plan the *Always* / *Sometimes* chips preselected (RUN-5's create did this); a chip held by another plan shows that plan's name beneath and, on tap, `dayPlan.update({ weekdays })` moves it with the line *Thursday moves from Day A.* and an inline undo (5 s; undo re-moves it). Writes per change.

### 13b — Shape and times

*Day A — the shape of it.* If work templates exist: `LargeTargetRow`s with glyph and hours (*🏠 Remote · 9:00–17:30*), the first preselected, plus **No work on this day**; picking writes `workTemplateId` (null for no work). Four `TimeField`s value + Change + Done: **Up at** · **Working by** · **Until about** (hidden under *No work*) · **Lights out**, each prefilled from the profile / the type and written to the plan only when touched (null = inherit). Under: *2 h before work · 5 h 15 after.* tabular.

### 13c — Training (only if workouts exist)

*Train on this day?* / *Pick what, then where it goes.* `SelectRow` per workout (glyph, length); selecting reveals **When** `QuickChipRow` **Before work · Midday · After work**; *Before work* adds a `SegmentedControl` **Before the routine · After it** (first preselected). Planned travel caption *+15 there · +15 back, beside it.* Foot: *Nothing is fixed. The morning can still swap or skip it.* Writes `training` per change. Ghost *Not on this day* clears it.

### 13d — Getting ready

*Getting ready.* / *What has to happen before work on this day, in order.* If other getting-ready templates exist: `PickerList` (*Getting ready A · 45 min* · **New list**). The list name `Input` (prefilled). `SortableList` of the template's slots: handle · glyph · title · `MinutesStepper` · `EllipsesMenu` (*One of two · Leave out on this day*); on a new list, seeded from screen 7's prep template's slots in order (all on); left-out steps under a hairline as *Not on this day* + *Include*. **Add a step** (the step sheet; adds to the library and this list). Sticky: *Getting ready A · 45 min · 8:15 to 9:00*. Primary *Next · 45 min*.

### 13e — Morning routine

*The morning routine.* Body tabular: *72 min for the routine on this day — up at 7:00, orient 3, getting ready 45, work by 9:00.* (or the *No anchor* line). `PickerList` for existing routines. Name `Input`. `SelectRowList` of the ranked habits by `life_priority` desc, glyph and *usually* on the right; versions as small tabs under the title (default filled; tapping writes the slot's minutes); selecting writes a slot (appended), un-selecting removes it; preselection per the ruling. Sticky `BudgetLine` *45 chosen · 72 for the routine* / over *84 chosen · 72 for the routine · runs to 9:12* (muted). Ghost **Shorten to fit** (R4 over the ticked set: `day.previewFit`'s pure function from DYN-6 applied to slots — dev's call whether to expose a `template.shortenToFit` or compute client-side with `fitToBudget` from `@syn/utils`). Selected rows reorderable. Primary *Next · 45 min*.

### 13f — During the day

*Anything during the day?* / *A break, a walk, ten minutes away from the desk.* Empty *Nothing yet.* + **Add a break**; the break starters as `SelectRow`s + **Something else**; a selected row reveals **When** `QuickChipRow` **Midday · At a time** (+ `TimeField`). Writes `breaks`. *Skip for now* ghost.

### 13g — The evening

*The evening.* / *What's already in place on these days.* Matched fixtures as `SelectRow`s preselected (glyph · days · time · length); *Other days* beneath, unselected; **Add one** → the `FixtureSheet`. Un-select → `excludedFixtureIds`; select from *Other days* → the confirm then `fixture.save` with the plan's days added.

### 13h — Wind-down

*Winding down.* Body tabular *Lights out 22:45 · phone away 21:45.* `PickerList` for existing. Name `Input`. `SortableList` of the wind-down template's slots (glyph · title · stepper · menu) with the two placed rows rendered in position, muted, unremovable — **✍️ A few lines · 10** and **📵 Phone away · 21:45** — and **🌙 Lights out · 22:45** fixed at the bottom; seeded on a new list from screen 11's wind-down habits (all, at midpoints). Sticky *Wind-down A · starts 21:10*. Primary *Next*.

### 13i — Day A, as it stands

*Day A, as it stands.* The `ScheduleAxis` from *up at* to *lights out* at 96px/h; a `BlockBand` per block with the name and span inside; every item a `ScheduleBlock` with glyph and title; travel rows as thin ends on the workout's band; slack bands labelled in the gutter (*12 min*); fixtures with the anchor glyph. Tap a band → its screen; tap an item → the slot sheet. Primary **Save Day A** → `dayPlan.complete` → Your days. Ghost *Back*.

**States (exhaustive):** the builder — 13a–13i · draft (left early) · complete · reused-list · saving (row pulse) · failed (revert + line) · offline (the builder opens read-only with the standard line; nothing writes); the card — collapsed · expanded · draft · deleting. **Failure / edge states:** two plans claim a weekday by a race → RUN-5 refuses the second write and the chip shows the line *Thursday is Day A's.* `[COPY]` · a template referenced by the plan is archived → 13d/13e/13h show *This list was removed — start a new one?* `[COPY]` with **New list** · the room is negative (getting ready longer than the span) → 13e's line reads *Getting ready runs to 9:12 on this day — the routine has no room before it.* `[COPY]`, nothing preselected, everything offered · no workouts → 13c skipped without a trace · no fixtures → 13g shows only **Add one** · 13i with a *No work* plan → no work band, the morning open-ended.

## Non-negotiables (this slice)

- **The room is stated as room.** Never *doesn't fit*, *too much*, *over budget*, *cut* (outside the `Shorten to fit` row's R4 wording).
- **A plan references; it never copies.** A list picked from another plan is the same template.
- **One weekday, one plan.**
- **Nothing here materialises.** `day_blocks` and `day_items` are untouched; 13i is a client preview through `stackBlock`.
- **Every screen writes as it goes**; *Next* navigates; *Save Day A* completes.
- **Nothing pre-selected except §13's four defaults.**
- **Every stepper optimistic; no glyph in `copy.ts`.**

## Data & AI

**Schema changes: none** (two `[ASSUMPTION]`s above may ask `0008` for `usual_minutes` / `template_slots.version_key`; the builder works without them).

**Tables:** `day_plans` (read, write) · `templates`, `template_slots` (read, write) · `habits` (read; `createStep` from 13d's *Add a step*) · `fixtures` (read, write — 13g) · `users` (read — the profile's times).

**Placement:** `apps/web/components/day-builder/` (new feature folder, as ruled); `app/(setup)/_components/step-13-days.tsx` (mounts `YourDays`); `app/(shell)/settings/your-day/*` (the *Your days* row; `YourDayScreen` += `your-days`); `app/(shell)/settings/your-day/block/[kind]` (the template list rows gain *used by …* from `usedBy`); `lib/routes.ts`; `apps/web/AGENTS.md`. Rule 9.

**tRPC / validators:** `dayPlan.list/get/create/update/complete/duplicate/delete`; `template.list/create/get/saveSlot/moveSlot/removeSlot`; `habit.list/createStep/createFromStarterLibrary` (break starters); `fixture.list/save`; `user.me`; `day.previewFit` (or a pure client fit — dev's call).

**AI notes:** **None.**

## Accessibility

- The builder's second caption is `aria-live="polite"` on screen change; focus moves to each screen's heading.
- Weekday chips held by another plan carry the plan's name in their accessible name (*Thursday, Day A's*).
- 13d/13h handles *Reorder {title}*; Alt+↑/↓; the placed rows are not focusable as handles (they are not sortable) but are readable.
- 13e's `BudgetLine` is `aria-live="polite"` with the 500ms debounce (v1.1 §10.4); version tabs are a `tablist` under the row's title.
- 13i's bands are buttons labelled *{block}, {span}, edit*; items open the sheet; the axis is keyboard-traversable in time order (DYN-8's).
- The card's chevron is `aria-expanded`; the menu's *Delete* confirms in a dialog.
- 200%: the strip switches to the wider gutter per v1.1 §10.4; the summary line wraps.

## Acceptance criteria (observable — local tier, 375px, the seeded account described in the review callout)

1. `/setup/13` on first arrival opens 13a with *Day A* and the *Always* / *Sometimes* chips preselected; the caption reads *13 of 14* and *Day A · 1 of 9*. *(Vesper.)*
2. 13b lists the two types with glyphs, the first preselected; the four times show the profile's / type's values; touching *Up at* → 7:30 writes `wake_time` on the plan and nothing else; the line reads *1 h 30 before work · …*.
3. 13c: selecting *Upper body* and *Before work* writes `training = [{ habitId, placement: "before_morning" }]`; *After it* → `after_morning`; the caption shows *+15 there · +15 back, beside it.*; a second workout with *Midday* adds `inside_work`.
4. 13d on a new list: the name reads *Getting ready A*; a `templates` row of kind prep named so exists with `usedBy` = Day A; all four steps present in screen 7's order; dragging persists `sort_order`; *Leave out on this day* removes the slot and shows the step under *Not on this day*; the sticky reads *Getting ready A · 45 min · 8:15 to 9:00*. Building *Day B* and picking *Getting ready A* from the `PickerList` writes the same `prep_template_id` and creates no template; the card later reads *shared with Day B*. *(Mason.)*
5. 13e: the first line reads *72 min for the routine on this day — up at 7:00, orient 3, getting ready 45, work by 9:00.*; the top-ranked habits are preselected down to 72 with the rest visible below; the `BudgetLine` reads *n chosen · 72 for the routine*; selecting past it reads *… · runs to 9:12* in the same colour; *Shorten to fit* reduces the ticked set per R4; a version tab writes the slot's minutes; `grep -rn "doesn't fit\|too much\|over budget" apps/web/components/day-builder` returns nothing. *(Vesper.)*
6. 13f skipped writes `breaks = []`; adding *Walk · Midday* writes `[{ habitId, at: "midday" }]`.
7. 13g preselects *Football · Thu* (Thursday is in the plan) and lists *Stand-up · Tue* under *Other days* when Tuesday is not; un-selecting Football writes `excludedFixtureIds`; selecting Stand-up confirms and adds the plan's days to the fixture.
8. 13h shows the two placed rows and lights out in position, the three wind-down habits as slots at midpoints; dragging *Read* below *Phone away* persists after it; the sticky reads *Wind-down A · starts …*.
9. 13i draws the day from wake to lights out with band labels inside the bands and no overlapping text; the workout's band has two thin ends; tapping the morning band returns to 13e; **Save Day A** sets `state = complete` and lands on Your days with the card's summary as §4.13 writes it. *(Vesper.)*
10. *Duplicate* creates *Day B* (draft, same seven references, no weekdays) and opens 13a; *Delete* on Day B removes it and every template remains; Settings → Your day → Your days shows the same list; the block editor's template list reads *Getting ready A · used by Day A, Day B*.
11. Leaving at 13e and returning shows *Day A · unfinished* with *Continue building* landing on 13e; *Continue · 1 day* on the list completes first run (until RUN-13).
12. No `day_blocks` or `day_items` row is created by anything in this ticket (row counts before and after the whole walk are equal). *(Mason.)*
13. Offline: the builder renders read-only with the line; nothing writes.
14. `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` pass (four separate commands).

## Likely-relevant technical notes (ADVISORY — dev decides)

- The preview for 13i: `stackBlock` per block over the plan's templates' slots and times, then lay the blocks in `block_order` — `services/plan/fit.ts` already assembles the morning's part of this for `template.fit`; lift its pure core into `@syn/utils` if it is not already there, and call it from the client.
- The block editor's strip (`block-strip.tsx`) at 96px/h is the rendering; give it a `readOnly` prop rather than a second strip.
- `PickerList` (DYN-7) is the existing composite for *Getting ready A · 45 min · New list*.
- `computeBudget` takes wake, work start, the orient minutes and the prep total — the plan's values or the profile's.
- Keep the nine screens as one component with a `screen` state and a `useDayBuilder` hook holding the plan; each screen is a small file that receives the plan and the write callbacks.

## Dev's call

`Shorten to fit` client-side vs `template.shortenToFit` · the version-to-slot write shape (see the assumption) · whether `YourDays` re-fetches after `complete` or updates from the mutation · the `[COPY]` lines named above.

## Out of scope

- **Screen 14, completion's move, the mode question, the week build's *Plan* row** — RUN-13.
- **Materialisation from plans** — RUN-5 (`prefillWeek`), invoked by RUN-13's completion.
- **Drag on 13i** — not in this epic; 13i is tap-to-edit.
- **`usual_minutes` / `template_slots.version_key`** — `0008` (RUN-15) if Mason wants them.

## Depends on

- **RUN-5** — `dayPlan.*`, `usedBy`, the weekday invariant. Complete in `PROGRESS.md`.
- **RUN-10** — steps with lengths and order, ranked habits with versions. Complete in `PROGRESS.md`.
- **RUN-11** — workouts with travel, wind-down habits, focuses. Complete in `PROGRESS.md`.

## Recommended execution

**Opus.** Nine screens that must each be one thing, three reuse-or-create decisions, a greedy fill against the room, a client preview through the one arithmetic, and the scarcity register to refuse on every line; a cheaper model builds a nine-page form, copies *Getting ready A* into *Getting ready B*, or writes *12 min over budget*.

---

### Kickoff (paste into the session)

> Build **RUN-12 — Screen 13, the day builder** (attached spec). Model: **Opus**. **The room is stated as room; a plan references and never copies; one weekday one plan; nothing here materialises; every screen writes as it goes; nothing pre-selected but §13's four defaults.**
> Attach/read first, in order: this spec · v1.2 §3.10, §3.13, §4.13 (all of it), §4.16, §12.3, §13 #18–#20/#28 · v1.1 §3.3, §3.11, §7.1 · `apps/web/AGENTS.md` · root `AGENTS.md` · `docs/specs/README.md` § Placement rules · DYN-8 (`block-editor/`, the strip, the template list — reuse, don't fork) · DYN-1 (`computeBudget`, `stackBlock`) · DYN-6 (`fitToBudget`) · RUN-5 · RUN-7 · RUN-8 · RUN-10 · RUN-11 · this track's `DEVIATIONS.md` + `TECHNICAL-DECISIONS.md` (TD-10, TD-11, TD-18) · Epic 4's `TECHNICAL-DECISIONS.md` (TD-1, TD-4).
> Build Day A end to end at 375px; paste the `day_plans` row and the three templates; say what you could not walk. Close in three places; log departures in `DEVIATIONS.md`. Run `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` as separate commands.
