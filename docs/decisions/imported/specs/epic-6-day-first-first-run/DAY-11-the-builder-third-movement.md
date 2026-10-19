# DAY-11 — The builder, third movement (B13–B17 and Your days): during work, after work, free time's landscape and ranking, this day's pool, the review with hues and what-gives, another day from the last

**Epic:** DAY — The first run built day-first (UX v1.3) · **Phase 4** · Size: L
**Slice type:** The last five builder screens and the list — two new lists (the transition, the pool), a new library, the review with hues, and the duplicate-from-last path. The risk class is *a pool that becomes a to-do list* (activities preselected as items), *a transition anchored wrong in the preview* (disagreeing with DAY-6), *scarcity copy* on the evening line, and *another day that starts empty*.
**Vigil:** none. **Vesper review:** B13's work band above the breaks; B14's strip and the after-work list; B15a's five groups; B16's rows with the mark and the pool line; B17's hued day with the pool band dashed, the sleep bands, the what-gives row; *Build another day* opening B1 pre-filled with the profile screens gone.

**Status:** Complete (2026-09-25)

> **Mason — write audit.** B14 writes a `transition` template and `afterWorkTemplateId`; B16 an `activity` template of structure `pool` and `activityTemplateId`; both through DAY-5's kind checks; `buildPreview` mirrors DAY-6 (the transition after the later of work and after-work training; the activity band pooled); *Build another day* is `dayPlan.duplicate` on the last saved plan and nothing else; nothing materialises.

---

## Outcome

A day is finished the way it happens: breaks and meals inside work over the work band; the after-work hand-off as its own named list; on the first day, what the person likes to do with free time, in five groups, and how much each matters; on every day, the pool this day chooses from; and the day as it stands — hued bands from up to lights out with the free-time band dashed and the sleep bands at both ends, plus the what-gives row to confirm — saved as *Day A*. **Your days** lists the plans, and *Build another day* starts from the last one saved. After this ships, **the builder is whole and DAY-12 can lay out the week and the surfaces around it.** The v1.2 `13x` files are unreferenced and DAY-13 deletes them.

## Why / intent

- **v1.3 §4.4 B13–B17, Your days** — verbatim; quoted in *Experience & states*.
- **v1.3 R48, §3.1, §3.13, TD-25** — B14's after-work list: kind `transition`, *After work A*, flow forward; skipped on *No work*.
- **v1.3 R50, §3.16, §12.4, TD-26** — B15a/b and B16: the activity library in five groups; the ranked card without versions; the pool as an `activity` template of structure `pool`; *"Nothing here is scheduled."*; §13 #34's preselection (matters ≥ 4).
- **v1.3 R47, R67, §4.4 B13, B14, B17, §13 #35** — the strips: B13's work band; B14's evening cut; B17's whole day with hues, the pool band, sleep at both ends.
- **v1.3 §4.4 B17** — the what-gives `ListRow` with *Change* opening B3's three rows inline.
- **v1.3 R68, §4.4 Your days** — *Build another day* duplicates the last saved plan, clears weekdays, opens B1; list screens open on the `PickerList` with the last plan's list chosen (the duplicate already references them, so the picker shows the current selection).
- **v1.3 §4.4 (which screens a later day shows)** — B15 first plan only; B13 and B14 skipped on *No work*.
- **Ground truth (consumed):** RUN-12 (`13f-breaks.tsx`, `13i-review.tsx`, `day-plan-card.tsx`, `your-days.tsx`, `preview.ts`), DAY-9/DAY-10's frame and `visibleScreens`, DAY-6's materialiser (the preview mirrors it), DAY-5's kind-checked FKs and `duplicate`, DAY-7's hued band and `SelectRow leading`, DAY-2's `HabitSetupCard` (for B15b, without versions), the landscape chooser (B15a reuses it with `blockKind: activity`).
- **What this slice is NOT (binding):** the pick's *Free time* section, the Today row, screen 5 (DAY-12); materialisation (DAY-6); N transitions (open #37); choosing the evening the night before (open #38).

**Rulings this slice makes (labelled, logged):**

- **B13 is 13f with the strip above** (`buildPreview` filtered to the work block, 96px/h, hued) and the widened starters from DAY-3's break library; a *No work* plan skips it. Logged.
- **B14 is a list screen (`useListScreen` with `kind: "transition"`, `fk: "afterWorkTemplateId"`, default name *After work {letter}*)** with the eight starters inline as B5, the strip cut from *until about* to *lights out* above (the transition as an open band when empty), and the ghost *Nothing after work* (writes `afterWorkTemplateId: null` and moves on; a template created on arrival is discarded through `template.discardIfEmpty`). Logged.
- **B15a reuses `LandscapeChooser` with `blockKind: "activity"`** and the five groups from `group`; *Recommended* under *Move · Rest* (the eight marked); **Add your own** → the habit sheet in *activity* mode (*A free-time activity*: glyph, name, range). B15b reuses `HabitSetupCard` with a `versions={false}` prop (DAY-2's card gains it) — the seven squares and *Usually takes* only. Logged.
- **B16 is a list screen with `kind: "activity"`, `fk: "activityTemplateId"`, default name *Evenings {letter}*, and the template created with `structure: "pool"`**; the rows are the ranked activities as `SelectRow`s (mark leading, *usually 30* detail) by rank; a tick appends a slot with `role: "pool"` (the existing pool role) at the activity's usual length; the body line is the evening room (*2 h 15 between after work and wind-down.*) computed from the preview; the muted line *The evening chooses from these. Nothing here is scheduled.* Preselection: activities with `life_priority ≥ 4` on a new pool (§13 #34). Logged.
- **`preview.ts` gains the transition and the pooled activity band**: the transition stacks forward from `max(workEnd, afterWorkTraining.endMin)` with the list's slots; the activity band spans from the transition's end (or work's, or the routine's on *No work*) to the wind-down's start, carries the evening fixtures as pins, and is flagged `pooled` with the label *Free time · 5 to choose from*; sleep is drawn as two `SleepBand`s (before *up at* is not drawn — the axis starts at wake; the band after lights out to the axis end is `Sleep · 22:45 to 7:00`, one band `[DEFAULT]`). Logged.
- **B17's what-gives row** reads the plan's work template's `anchor_direction` and *Change* reveals B3's three `LargeTargetRow`s inline beneath the row, writing `dayPlan.update({ work: {...} })` with the new direction; hidden on *No work*. Logged.
- **`YourDays`' *Build another day*** calls `dayPlan.duplicate` on the plan with the highest `sort_order` in state `complete` (the last saved), then opens the copy at `b01`; with no complete plan it creates an empty one (today's path). `DayPlanCard`'s summary gains the after-work and free-time lists in its disclosure (*After work A · 40 min*, *Evenings A · 5 to choose from*). Logged.
- **`day-builder.tsx`'s temporary `13x` table is removed**; every screen is a `b` file. Logged.

## Experience & states

### B13 — During work
Heading *Anything during work?* Body *A break, a meal, ten minutes away from the desk.* The work band (hued, 96px/h) with its fixtures and any midday training; then *Nothing yet.* + **Add a break**, the eight starters as `SelectRow`s + **Something else**; a selected row reveals **When** (*Midday · At a time* + `TimeField`). Primary *Next*; ghost *Skip for now*. Skipped on *No work*.

### B14 — After work
Heading *After work.* Body *The hand-off between work and the evening — the drive, the cooking, dinner.* The strip from *until about* to *lights out* (transition open, free time open, wind-down in place, after-work training if any). `ListHeader` (`PickerList` when others exist; name *After work A*). New empty list: the eight starters; then *In order* with the `SortableList` and steppers. Sticky *After work A · 40 min · 17:30 to 18:10.* Primary *Next · 40 min*; ghost *Nothing after work*. Skipped on *No work*.

### B15a — Free time, the landscape *(first plan only)*
Heading *What do you like to do with free time?* Body *A menu for the evening, so the default isn't the default.* `Tabs` **Recommended · All**; Recommended under *Move · Rest*; All with the `SearchField` under *Move · Make · Connect · Rest · Tend* (+ *Your own*). **Add your own**. Primary *Next · 7 activities*; ghost *Skip for now*.

### B15b — Free time, ranked *(first plan only)*
Heading *How much does each one matter?* Body *For the nights you have to choose.* `HabitSetupCard`s without versions; in place; `CardSummary` with the mark. Primary *Next*.

### B16 — Free time on this day
Heading *Free time on this day.* Body *2 h 15 between after work and wind-down.* (or *The evening, after 17:30.* / *The day, after the routine.*). `ListHeader` (`PickerList` *Evenings A · 7 to choose from* · **New pool**; the name). The ranked activities as `SelectRow`s (mark · glyph · title · *usually 30*), matters ≥ 4 preselected on a new pool, draggable. The muted line. Primary *Next · 5 to choose from*.

### B17 — Day A, as it stands
Heading *Day A, as it stands.* The `ScheduleAxis` at 96px/h from *up at* to *lights out* + the sleep band: hued `BlockBand`s with names and spans inside; every item a `ScheduleBlock`; each workout its own band with travel ends; fixtures pinned with travel ends; the free-time band pooled (dashed, plum wash) labelled *Free time · 5 to choose from*; slack in the gutter; sleep labelled. Beneath: the `ListRow` **When the morning runs long** · *Work waits* · *Change* (inline rows on tap). Tap a band → its screen; tap an item → the slot sheet. Primary **Save Day A** (`dayPlan.complete`); ghost *Back*.

### Your days
As RUN-12 with the two-line card, the five lists in the disclosure, and **Build another day** from the last saved plan. Primary *Continue · 2 days* → screen 5.

**States (exhaustive):** as DAY-9's plus *no-work (B13, B14 skipped)* · *pool-empty* · *review-with-pool* · *duplicate-from-last*. **Failure / edge states:** B14's *Nothing after work* after a tick → the list is emptied and the FK nulled (no orphan template: `discardIfEmpty`) · B16 with zero ranked activities (B15 skipped) → *Nothing to choose from yet.* `[COPY]` + a link back to B15 on the first plan; on a later plan, the picker of existing pools or *New pool* with the line · B17 on *No work* → no work band, no transition, the free-time band from the routine's end · `complete` refused (`needs_*`) → the line as RUN-12 · the last saved plan is deleted before *Build another day* → falls back to an empty plan.

## Non-negotiables (this slice)

- **The pool is a pool: nothing in it is scheduled, and the review draws it dashed.**
- **The preview mirrors DAY-6's materialiser; where they disagree the service is right.**
- **The room is stated as room on the evening line; *Free time* is never a miss anywhere in copy.**
- **Nothing materialises.**
- **Another day starts from the last; references, not copies.**
- **Every string in `copy.ts`; no glyph in `copy.ts`.**

## Data & AI

**Schema changes: none.**

**Tables:** `day_plans` (read, write) · `templates`, `template_slots` (read, write — `transition` and `activity`/`pool`) · `habits` (read, write — activities) · `fixtures` (read) · `users` (read).

**Placement:** `apps/web/components/day-builder/screens/{b13-during-work.tsx (from 13f), b14-after-work.tsx, b15a-free-time-landscape.tsx, b15b-free-time-ranked.tsx, b16-free-time-pool.tsx, b17-review.tsx (from 13i)}`; `apps/web/components/day-builder/{preview.ts, day-builder.tsx, use-day-builder.ts, use-list-screen.ts, day-plan-card.tsx, your-days.tsx, copy.ts, sleep-band.tsx (moved from blocks-primer to a shared home — `@syn/ui` if both use it: promote to `composed/display/sleep-band/` with a story)}`; `apps/web/components/landscape-chooser/*` (the `activity` mode); `apps/web/app/(setup)/_components/habit-setup-card.tsx` (`versions` prop). Rule 9.

**tRPC / validators:** `dayPlan.update/complete/duplicate/list`; `template.create ({ kind: "transition" } / { kind: "activity", structure: "pool" }) / saveSlot / moveSlot / removeSlot / discardIfEmpty / update / list`; `habit.list / createFromStarterLibrary / patch / archive`; `fixture.list`; `user.me`.

**AI notes:** **None.**

## Accessibility

- The strips' bands are buttons *{block}, {span}, edit*; the pooled band's name includes *to choose from*.
- B16's rows read *title, matters 5, usually 30, pressed*.
- B17's what-gives row is a button *When the morning runs long, Work waits, change*; the inline rows a `radiogroup`.
- *Build another day* announces *Day B, from Day A* `[COPY]` as a polite status when the copy opens.

## Acceptance criteria (observable — local tier, 375px; continue from B13 on the first plan; then *Build another day*; paste both plans and the two new templates)

1. B13 shows the work band with the Tuesday stand-up pinned; adding *Lunch · At a time · 12:30* writes `breaks = [{ habitId, at: "12:30" }]`; on a *No work* plan B13 is absent from the caption's count.
2. B14 creates *After work A* (`kind = transition`, `flow = forward`) and sets `after_work_template_id`; ticking *Cook* and *Dinner* moves them under *In order* with slots; the sticky reads *After work A · 65 min · 17:30 to 18:35*; *Nothing after work* nulls the FK and leaves no empty template (`templates` count unchanged after discard). *(Mason.)*
3. B15a's *All* lists five groups from the activity library; ticking *Chess* creates a habit with `block_kind = activity`; B15b ranks it with no versions row; on a duplicate plan B15a/b are absent.
4. B16 creates *Evenings A* (`kind = activity`, `structure = pool`) and sets `activity_template_id`; activities with matters ≥ 4 are preselected and their slots carry `role = pool`; the body reads *2 h 15 between after work and wind-down.*; the muted line is present; `grep -rn "scheduled\|miss" apps/web/components/day-builder/copy.ts` shows only the *Nothing here is scheduled.* line.
5. B17 draws the whole day hued: orient, two training bands with ends, the routine, getting ready, work with pins, the transition, the free-time band dashed and labelled *Free time · 5 to choose from*, wind-down, and *Sleep · 22:45 to 7:00* at the bottom; the what-gives row reads *Work waits*; *Change* → *Depends on the day* writes the work template's `anchor_direction`; **Save Day A** sets `state = complete`. *(Vesper.)*
6. Your days: the card's disclosure lists five lists with lengths; **Build another day** creates *Day B* as a duplicate of Day A — same `prep/morning/wind_down/after_work/activity` template ids, a new work template, no weekdays — and opens B1 with the caption *Day B · 1 of 11* (or *of 12*); B5 opens with the `PickerList` showing *Getting ready A* chosen.
7. `buildPreview` and DAY-6's materialiser agree: after `week.prefill` from Day A, Monday's block spans (paste `day_blocks`) match B17's bands to the minute for orient, the trainings, the routine, getting ready, work, the transition and wind-down; the activity block is `pooled` in both.
8. `grep -rln "13[a-i]-" apps/web/components/day-builder` returns nothing; `ls apps/web/components/day-builder/screens` lists only `b*` files.
9. `SELECT count(*) FROM day_blocks` unchanged across the builder walk (criterion 7 runs `week.prefill` separately, after).
10. `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` pass (four separate commands); `yarn directory-map` run.

## Likely-relevant technical notes (ADVISORY — dev decides)

- `useListScreen`'s `seed` for B14 is empty (the starters are the seed the person ticks); for B16 it is the ranked activities with `life_priority ≥ 4` at their usual length with `role: "pool"` — check `saveSlot`'s input accepts `role: "pool"` (DYN-4's pool role exists on `template_slots.role`).
- The evening room: `between(transitionEnd ?? workEnd ?? routineEnd, windDownStart)` from the preview's blocks; put it in `preview.ts` beside the slack so B16 and B17 read one number.
- `SleepBand` in `@syn/ui` is a 20-line absolutely-positioned div; promote it with a story rather than importing across feature folders.
- `HabitSetupCard`'s `versions={false}` hides the versions row and the *Add a shorter version* ghost; nothing else changes.
- `DayPlanCard`'s summary already builds from `summaryOf(plan)`; add the two lists to the disclosure only, not the one-line summary.

## Dev's call

Whether B15a and B15b are two entries in `BUILDER_SCREENS` (`b15a`, `b15b`) or one with an internal step (two recommended — the caption counts them) · the `[COPY]` lines named · the pool's minimum length shown (*usually 30*).

## Out of scope

- **The pick's *Free time* section; the Today row; screen 5's strips; Settings' new screens** — DAY-12.
- **Materialisation** — DAY-6.
- **Deleting the v1.2 step files and `13x` leftovers** — DAY-13 (this ticket leaves none in `day-builder/`).

## Depends on

- **DAY-10** — the frame through B12. Complete in `PROGRESS.md`.
- **DAY-6** — the transition and the pool materialised (the preview mirrors it; criterion 7). Complete in `PROGRESS.md`.

## Recommended execution

**Opus.** A pool that must stay a pool, a preview that must match a materialiser it does not call, and a duplicate path that must reference; a cheaper model schedules the evening, draws the transition from work's end when the after-work workout ends later, or copies the lists.

---

### Kickoff (paste into the session)

> Build **DAY-11 — The builder, third movement (B13–B17, Your days)** (attached spec). Model: **Opus**. **The pool is a pool; the preview mirrors DAY-6; the evening is room, never a miss; another day starts from the last by reference; nothing materialises.**
> Attach/read first, in order: this spec · v1.3 §4.4 B13–B17 and Your days, §3.1, §3.13, §3.16, §12.4, §13 #34, #35, R47, R48, R50, R67, R68 · `apps/web/AGENTS.md` · root `AGENTS.md` · `docs/specs/README.md` § Placement rules · RUN-12 (Epic 5 — `13f`, `13i`, the card, the list; reuse, don't fork) · RUN-10 (the landscape chooser, the card) · DAY-3, DAY-5, DAY-6, DAY-7, DAY-9, DAY-10 · this track's `DEVIATIONS.md` + `TECHNICAL-DECISIONS.md` (TD-24…TD-26, TD-29) · Epic 4's `TECHNICAL-DECISIONS.md` (TD-4) · Epic 5's (TD-10).
> Walk B13–B17, save, build another day; then `week.prefill` and compare the blocks to the review; paste both. Close in three places; log departures in `DEVIATIONS.md`. Run `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` as separate commands, then `yarn directory-map`.
