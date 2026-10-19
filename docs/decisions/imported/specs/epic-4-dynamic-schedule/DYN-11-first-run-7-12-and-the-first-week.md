# DYN-11 — First run 7–12: before work with *one of*, the landscape, training, closing the day, focuses, the fit; the first week pre-filled

**Epic:** DYN — Dynamic schedule (UX v1.1) · **Phase 1** · Size: L
**Slice type:** The second half of the sequence — six screens, three of them lists of a block's members, one a rotation, one the evening, and the one computed screen. The risk class is *a fit number on the landscape screen* (§4.8's rule: "Show a fit number" is the one thing it must never do) and *a first week that has to be authored* (§4.13's promise that the week build's first job is reading).
**Vigil:** none. **Vesper review:** each screen against §4.7–§4.12 verbatim; the landscape shows no minutes total anywhere; the fit screen states a number and judges nothing; two primaries are not on screen 12.

**Status:** Complete (2026-09-13 — authored and built in one thread, with DYN-12; screens 7–12 at `/setup/{7–12}`, the transitional ready deleted; `components/landscape-chooser/` replaces `starter-set/`; `template.fit` is the fit's arithmetic; `completeFirstRun` writes the mode and pre-fills the week; the four root commands pass; the browser walk is blocked at sign-in — logged in `DEVIATIONS.md`)

**Owner:** Reeve (spec) → dev (build) · **Reviewer:** Vesper (the six screens by eye), Mason (the fit's arithmetic against `computeBudget`, `week.prefill` against DYN-5 AC 1)

## Outcome

`/setup/7…12` per UX v1.1 §4.7–§4.12 verbatim. **Screen 7** is the prep list: six offers as unchecked `CheckboxField`s in a chooser band (*Breakfast · Coffee · Shower · Walk · Transit · Walk the dog*), each tick a `ListRow` with a `MinutesStepper` at its default length; *Add something else*; *Make it one of two* in a row's overflow opening the inline second row (*or… cook it · 30 min*); the sticky footer *Adds up to 45 min · work by 9:00 · up at 7:00 · 72 min left for the routine* from `computeBudget`. **Screen 8** is the landscape: **Recommended · All · Selected (n)** word tabs over `STARTER_LIBRARY.morning` with a `SearchField` on *All*, `Stepper17` + `MinutesStepper` per row on *Selected*, *Add your own* opening the habit sheet, **no fit number anywhere**, primary *Continue · 9 habits*. **Screen 9** is training: *Yes · Not right now*, then the rotation rows (name, `CountStepper` × a week, `WeekdayChips`, `MinutesStepper`), *Where it fits is decided each morning.* **Screen 10** is closing the day: lights-out and phone-away as value + Change, the one-sentence line `[COPY]`, the journal switch (on) with the six prompts (*Move up · Move down · Edit · Remove*, *Add a prompt*). **Screen 11** is focuses: rows with a `CountStepper` and optional `WeekdayChips`, the ghost *I have days with different hours* opening a small sheet for a second work template. **Screen 12** is the fit: a read-only `ScheduleAxis` from wake to work start with the four bands (*orient · routine (available, lighter) · prep · work*), one sentence (*Your routine adds up to 140 min. 72 fit before prep on a usual day.*), the three overflow-mode rows (daily menu preselected) or *It all fits on a usual day.*, primary **Open today**, ghost **Plan this week first**. Completion writes `overflow_mode`, calls `user.completeFirstRun` — which now pre-fills the current week (`week.prefill`) — and lands on `/today` (the orient frame is DYN-13's route; until it ships, Today). After this ships, **DYN-13 has a completed first run to land after, DYN-12's week build has a pre-filled week to read, and DYN-21 can delete `STARTER_HABITS`.** The v1.0 `components/starter-set/` is deleted here; the library's empty state opens the landscape chooser instead.

## Why / intent

- **§4.7 (Before work)** — *"The prep list with a length each, so the morning's budget can be computed … Ask for a start time [is what it must never do]. Items here only have lengths; the stack is computed backward from work (§3.3) … Priority is not asked here; prep items default to 7 and hard (mandatory)."*
- **§4.8 (The landscape)** — *"Capture everything the person does or wants to do to start the day well, ranked — without asking any of it to fit … [It must never] show a fit number. This screen is the data bank; the fit is screen 12's job. And nothing is ever pre-checked: hospitality, not persuasion."*
- **§4.9 (Training)** — *"The rotation: what, how often, usually when, how long … [It must never] ask for a time. Placement is a morning decision (§3.7)."*
- **§4.10 (Closing the day)** — *"Lights-out, devices-off, and whether a few lines at night are wanted … [It must never] frame devices-off as a rule. It is a time the person set, shown back as such."*
- **§4.11 (Focuses)** — *"The focuses and their weekly counts … unset days mean decide in the morning … Most people never open [the second work template]."*
- **§4.12 (The fit)** — *"Show the computed consequence of everything entered, and let the person choose how the days that don't fit will be handled … [It must never] judge the 140. The number is a fact; the three rows are three honest ways to live with it … Two primaries are not allowed."*
- **§3.10** — *"The block editor's footer and the first run's last screen show the same arithmetic."*
- **§4.13** — *"The first week after first run is pre-filled from typical days and counts, so the week build's first job is reading, not authoring."*
- **§13 #6, #13; W2, W3, W4** — the wake range is informational; the science line is one sentence citing nothing; selection is a single commit — a tick is the selection, the primary always *Continue*, counting.
- **Ground truth (consumed, never rebuilt):** DYN-10's `FactScreen` and the six screens, `StepFrame` at twelve; DYN-8's block editor (its `walkSlots`, `midpoint`, the slot sheet's *one of* shape) and `settingsYourDayBlockRoute`; DYN-4's `template.*`, `habit.createWorkout/createFocus/updateRotation`, `habit.createFromStarterLibrary`, `user.updatePreferences` (`lightsOutTime`, `devicesOffTime`, `journalEnabled`, `journalPrompts`, `overflowMode`); DYN-5's `week.prefill`; DYN-1's `computeBudget`, `STARTER_LIBRARY`, `DEFAULT_JOURNAL_PROMPTS`; DYN-7's `CheckboxField`, `CountStepper`, `WeekdayChips indexing="monday"`, `LargeTargetRow stacked`, `BlockBand`, `ScheduleAxis`.
- **What this slice is NOT (binding):** the orient frame and where *Open today* lands once the day has started (DYN-13 — until then `/today`); the week build's per-block day sheet and the trade (DYN-12); drag handles on the journal prompts (DYN-9's `DragLayer reorder` — *Move up / Move down* here, the same two-step rule); the quick-pick's overflow-mode behaviour (DYN-15); deleting `STARTER_HABITS` (DYN-21).

**Rulings this slice makes (labelled, logged):**

- **Screen 7 is a list, not the strip.** §4.7 draws `ListRow`s with a `MinutesStepper` each and a chooser band; it is the prep template's slots in list form, written through `template.saveSlot` (`priorityOverride` 7, `scheduling` hard, `gapBeforeMin` 0, no pin). The prep template is created on first arrival (`template.create({ kind: "prep" })`) when none exists; the footer is `computeBudget` over the profile's wake and work start, the orient template's total, and the list's total. *One of* is the slot sheet's shape: the second member is a prep habit and a length, saved with `alternatesWith`. Logged.
- **The landscape is a single commit (W4).** Ticks are local state; *Continue · n habits* creates the ticked starters (`habit.createFromStarterLibrary({ blockKind: "morning", titles })`), applies any priority or length the *Selected* tab changed (`habit.update`), then creates the morning template when none exists and writes one slot per selected habit in priority order (highest first) at the chosen length. Habits already in the library with `block_kind = morning` are listed as selected and cannot be un-ticked here (the library archives). No minutes total anywhere on the screen. Logged.
- **Training *Not right now* skips ahead and writes nothing;** *Yes* shows the rows and creates a training template (`template.create({ kind: "training" })`) when none exists so Settings → Your day → Training has something to open. Each row is one `habit.createWorkout` / `updateRotation`; the length is the row's `durationMin`; the priority is the schema's default (6). Logged.
- **Screen 10's prompts are *Move up / Move down*, not drag** (as Block order — DYN-9 adds the handles). The six defaults are `DEFAULT_JOURNAL_PROMPTS`; a removed prompt is absent from `journal_prompts`; a renamed prompt keeps its key. The wind-down template is created when none exists; the journal closer and the *Phone away* pin are the app's, placed from the profile at materialisation (v1.1 §7.1, DYN-5), never rows here. Logged.
- **The second work template stores a name and a start.** The template row has `anchor_time` and no end column; *until* is the profile's `work_end_time` for every work template. The sheet asks name and start only, and says so. Logged.
- **The fit is one query, `template.fit`,** over the profile's wake and work start, the orient and prep templates' totals (`stackBlock`), and the morning habits' lengths (the morning template's slots when it exists, else the habits' midpoints) — the same `computeBudget` the quick-pick and the editor use (§3.10). It returns minutes and clocks; the screen renders and writes nothing until *Open today* / *Plan this week first*. Logged.
- **Completion is one call.** `user.completeFirstRun` gains an optional `overflowMode` and, after marking the row, pre-fills the current week (`prefillWeek`) — the week build's first job is reading (§4.13). Both buttons call it; *Open today* lands on `/today`, *Plan this week first* on `/settings/week`. Logged.
- **`components/starter-set/` is deleted; `components/landscape-chooser/` replaces it** for both first run and the library's empty state (as a sheet there). `STARTER_HABITS` and `habit.createFromStarterSet` stay until DYN-21. Logged.

## Experience & states

### The frame — every screen

`FactScreen` (DYN-10), *n of 12*, *Skip for now* on every screen, *Finish later* in the frame. A screen that writes as it goes (7, 9, 10's prompts, 11) hands `save: null`; a screen that commits on *Continue* (8, 10's fields, 12) hands its write.

### Screen 7 — `/setup/7` (§4.7)

Heading *What has to happen before you can start?*, body *Breakfast, coffee, the walk, the drive. Each with a rough length.* The chooser band: six `CheckboxField`s in a row that wraps, nothing checked; ticking one creates the habit from the starter library (prep) and saves a slot at the default length (breakfast 20, coffee 5, shower 10, walk 15, transit 30, dog 20); un-ticking removes the slot (the habit stays in the library). The list: one `ListRow` per slot with a `MinutesStepper` (5-step, `DURATION_MIN`–`DURATION_MAX`, no clamp) that saves on change; an `EllipsesMenu` with *Make it one of two* · *Remove*. *Make it one of two* opens an inline row under the slot: a `PickerList` of prep habits (+ *New habit*) and a `MinutesStepper`; choosing saves the second member (`alternatesWith`) and the pair reads *one of* with both lengths; *Just this one* removes the other. *Add something else* opens the habit sheet with `blockKind` preset to prep; on save the slot is added at the midpoint. The sticky footer, tabular: *Adds up to {total} min · work by {workStart} · up at {wake} · {available} min left for the routine* — absent when the profile has no work start (screen 3 skipped). States: empty · listing · one-of open · offline (band and steppers disabled, the line).

### Screen 8 — `/setup/8` (§4.8)

Heading *What do you do, or want to do, to start the day well?*, body *Everything. It doesn't have to fit.* `Tabs`: **Recommended · All · Selected (n)**. *Recommended*: `STARTER_LIBRARY.morning` where `recommended`, grouped *Body · Mind* (`GroupHeading`), each a `CheckboxField` with the title and the range muted on the right (*Cold shower · 3–10 min*). *All*: every morning entry with a `SearchField`. *Selected*: every ticked starter and every existing morning habit, each with a `Stepper17` (default the entry's importance) and a `MinutesStepper` (default the midpoint). *Add your own* on every tab opens the habit sheet (`blockKind` morning); the created habit joins *Selected*. Primary *Continue · n habits* (n = ticked + existing); with nothing ticked it reads *Continue* and moves on. Never a minutes total. States: empty · ticking · searching (no matches: *No habits match "…"*) · selected · offline.

### Screen 9 — `/setup/9` (§4.9)

Heading *Do you train?* Two stacked `LargeTargetRow`s: **Yes** · **Not right now**. *Not right now* → `goTo(10)` with nothing written. *Yes* → the list: **Add a workout** (an `Input` for the name, then the row); each `ListRow` with the name, a `CountStepper` (*× 2 a week*, 1–7), `WeekdayChips` (Monday-first) and a `MinutesStepper` (default 60); each change saves (`createWorkout` on the first save, `updateRotation` after). Under the list, muted: *Where it fits is decided each morning.* Primary *Continue · n workouts*. States: unanswered · yes, empty · listing · offline.

### Screen 10 — `/setup/10` (§4.10)

Heading *How does the day end?* `TimeField` **Lights out** · *22:45* disclosed; `TimeField` **Phone away** · *22:15* disclosed with the muted line *Half an hour before lights out is a common choice.* `[COPY — one sentence, cites nothing]`. `Switch` **A few lines at night**, on; beneath it the prompts as rows (label, `EllipsesMenu`: *Move up · Move down · Edit · Remove*) and *Add a prompt* (an inline `Input`); the muted line *Around 10 minutes, before the phone goes away.* *Continue* writes `lightsOutTime`, `devicesOffTime`, `journalEnabled`, `journalPrompts`; the validator's phone-before-lights rule is the sentence. States: default · editing a prompt · switch off (the list hides) · offline.

### Screen 11 — `/setup/11` (§4.11)

Heading *What kinds of work day do you have?*, body *One is fine.* **Add a focus** (an `Input`, then the row); each `ListRow` with the name, a `CountStepper` (*× 2 a week*) and `WeekdayChips` (optional; none = *decide in the morning*, said under the chips). Each change saves (`createFocus` / `updateRotation`, `durationMin` null). The ghost row **I have days with different hours** opens a `ResponsiveSheet`: name, start (`TimeField`), the line *Until about is the same for every work day.* → `template.create({ kind: "work" })` + `template.update({ name, anchorTime })`; the row then reads the second template's name. Primary *Continue · n focuses*. States: empty · listing · second template · offline.

### Screen 12 — `/setup/12` (§4.12)

Heading *Here's the room you have.* The strip: a `ScheduleAxis` (64 px/h) from the wake hour to the work-start hour with four `BlockBand`s — *orient* (its total), *routine* (the available span, `pooled` for the lighter fill), *prep* (its total), and a hairline at work start labelled *work 9:00* — from `template.fit`. Under it, body: *Your routine adds up to {routine} min. {available} fit before prep on a usual day.* When `routine > available`: three stacked `LargeTargetRow`s — **A daily menu** *See the list each morning, tap what fits.* · **Different routines on different days** *Morning A, Morning B, with counts.* · **Cut the lowest automatically** *The list, ranked; the budget cuts from the bottom.* — daily menu preselected; else the one line *It all fits on a usual day.* and no rows. Primary **Open today**, ghost **Plan this week first**; both write `overflow_mode` (daily menu when it fits), call `completeFirstRun`, and land (`/today` · `/settings/week`). No *Skip for now* on this screen: it is the end. States: fits · over budget · no work start (the strip is absent; the line reads *Set a work start to see the room.* `[COPY]`) · completing · offline.

**Failure / edge states:** screen 7 with no work start → the footer is absent, the list works · a starter title already in the library → `createFromStarterLibrary` makes a second row (the service does not de-duplicate; the band shows *Added* for a title already present and does not offer it) · the landscape with 20 ticks → 20 habits and 20 slots, no warning · screen 9 *Yes* then *Not right now* → the rows stay (nothing is deleted by a choice) · a prompt label of spaces → the validator refuses · the second work template's sheet with an empty name → *Give it a name.* · `completeFirstRun` on a week already planned → `prefill` skips those days (DYN-5) · *Open today* twice → idempotent · offline → every primary disabled with the line.

## Non-negotiables (this slice)

- **No fit number on screen 8.** No total, no *of 72*, no colour on a count.
- **Nothing pre-checked** on 7, 8 or 9; the daily menu is the one preselection and it is §4.12's.
- **Screen 7 never asks for a time; screen 9 never asks for a time.**
- **Screen 12 has one primary.** *Plan this week first* is ghost.
- **The science line is one sentence and cites nothing.**
- **The fit is `computeBudget`** — no second arithmetic in the app.
- **No new `@syn/ui` component.** The screens compose existing ones; the landscape chooser and the work-template sheet are app-local.
- **Every write through existing procedures** plus the two additions named below (`template.fit`, `completeFirstRun`'s `overflowMode`).

## Data & AI

**Schema changes: none.**

**Tables:** `users` (update — `lights_out_time`, `devices_off_time`, `journal_enabled`, `journal_prompts`, `overflow_mode`, `first_run_*`) · `habits` (insert — starters, workouts, focuses; update — rotation, priority, range) · `templates` (insert — prep, morning, training, wind-down, a second work) · `template_slots` (insert, update, delete) · `days`, `day_blocks`, `day_items` (insert — the pre-filled week).

**Placement:** `apps/web/app/(setup)/_components/{step-7-before-work,step-8-landscape,step-9-training,step-10-closing,step-11-focuses,step-12-fit}.tsx` (`step-7-ready.tsx` deleted), `_components/copy.ts` (screens 7–12), `[step]/page.tsx` (1–12; `SETUP_LAST_BUILT_STEP` removed); `apps/web/components/landscape-chooser/{landscape-chooser.tsx,copy.ts,index.ts}` (`components/starter-set/` deleted; `settings/habits/_components/library.tsx` opens the chooser in a sheet); `packages/api/src/services/plan/fit.ts` + `template.fit`; `packages/api/src/services/user/complete-first-run.ts` (`overflowMode`, `prefillWeek`); `packages/validators/src/user.ts` (`completeFirstRunInput`); `apps/web/AGENTS.md` (the `/setup` row). Rule 9 (app-local composition), rule 2 (composites from `@syn/ui`), rule 7 (one Zod home).

**tRPC / validators:** `template.fit` (query, no input → `{ wakeClock, workStartClock, orientMin, prepMin, availableMin, routineMin, fits }`) · `user.completeFirstRun({ overflowMode? })` · existing: `template.list/create/update/get/saveSlot/removeSlot`, `habit.list/create/update/createWorkout/createFocus/updateRotation/createFromStarterLibrary`, `user.updatePreferences`, `user.me`, `week.prefill` (called by the service).

**AI notes:** **None.**

**Instrumentation:** none.

## Accessibility

- The chooser band's checkboxes are labelled by their titles; the range on a landscape row is part of the label (*Cold shower, 3 to 10 minutes*).
- The `Tabs` are word tabs with `aria-selected`; *Selected (n)* announces its count.
- The rotation rows' steppers are labelled with the workout's name (*Push, times a week*).
- *Move up / Move down* on a prompt are buttons named with the prompt; a removed prompt announces nothing (the list is the record).
- The fit strip is `aria-hidden` with the sentence as the accessible summary; the three rows are a radio group labelled by the sentence.
- 200% text: the chooser band wraps; the tabs stay on one row or scroll; nothing at 375px scrolls sideways.

## Acceptance criteria (observable — local tier, a fresh account past screen 6; `yarn web:dev`)

1. `/setup/7` shows six unchecked offers and *Nothing yet*; ticking *Breakfast* and *Coffee* lists two rows at 20 and 5 with the footer *Adds up to 25 min · work by 9:00 · up at 7:00 · 92 min left for the routine* (orient 3); *Make it one of two* on breakfast, choosing *Cook* at 30, reads *one of* and the footer uses the default (20). *(Vesper.)*
2. `/setup/8` shows *Recommended · All · Selected (0)* with nothing checked and no minutes total anywhere; ticking nine across two tabs reads *Selected (9)* and *Continue · 9 habits*; *Selected* shows a `Stepper17` and a `MinutesStepper` per row; *Continue* writes nine `habits` rows with `block_kind = morning` and a morning template with nine slots in priority order. *(Vesper.)*
3. `/setup/9` *Not right now* writes nothing and lands on 10; *Yes* → *Add a workout* → *Push · × 2 · Mon Thu · 60* writes a `habits` row `type = workout`, `weekly_target = 2`, `typical_days = [0, 3]`, `duration_min_min = 60`; the muted line reads *Where it fits is decided each morning.*; no time is asked. *(Vesper.)*
4. `/setup/10` shows *22:45* and *22:15* as value + Change, the one-sentence line, the switch on and six prompts; *Move down* on the first reorders; *Remove* on one leaves five; *Continue* writes both clocks, `journal_enabled = true`, `journal_prompts` with five in the new order. *(Vesper.)*
5. `/setup/11` *Add a focus* → *Viewpoint · × 2* with no days writes `type = deep_work`, `weekly_target = 2`, `typical_days = null`; the row says *decide in the morning*; the ghost row's sheet creates a second work template named *Office* at *8:30*. *(Vesper.)*
6. `/setup/12` on Taylor's inputs (wake 7:00, work 9:00, orient 3, prep 45, routine 140) shows the strip and *Your routine adds up to 140 min. 72 fit before prep on a usual day.*, three rows with *A daily menu* preselected, one primary; with a 40-min routine the rows are absent and the line reads *It all fits on a usual day.* *(Vesper.)*
7. *Open today* writes `overflow_mode = daily_menu`, `first_run_completed_at`, `first_run_step = null`, pre-fills the current week (seven `days` rows with blocks per DYN-5 AC 1: work days structured with orient · morning (pooled) · prep · work · wind-down, the workout on its typical days, Sunday unstructured) and lands on `/today`; *Plan this week first* lands on `/settings/week` with the same week. *(Mason.)*
8. `template.fit`'s `availableMin` equals `computeBudget({ wakeMin, workStartMin, orientMin, prepTotalMin })` for the same rows, and equals the block editor's footer slack for an empty morning template. *(Mason.)*
9. `grep -rn "min total\|of 72\|fits" apps/web/app/\(setup\)/_components/step-8-landscape.tsx` returns nothing; the science line matches `/^[^.]*\.$/` and contains no digit citation.
10. `/settings/habits` on an empty library offers the landscape chooser; `components/starter-set/` does not exist; `STARTER_HABITS` still does.
11. Offline: every primary disabled with the line; the band's checkboxes disabled.
12. `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` pass (four separate commands).

## Likely-relevant technical notes (ADVISORY — dev decides)

- Screen 7 can reuse `walkSlots` from `components/block-editor` for the list's total (the default member of a one-of counts once); the footer's arithmetic is `computeBudget` from `@syn/utils` with the orient template's `totalMin` from `template.list({ kind: "orient" })`.
- The landscape's local state is `Map<title, { priority, durationMin }>` for starters and `Map<id, …>` for existing habits; the commit runs `createFromStarterLibrary`, then `habit.list({ blockKind: "morning" })` to find the ids, then `habit.update` for the changed rows, then the slots.
- `template.fit` reads through `readDayProfile` and `defaultTemplateFor` (DYN-5) so its orient and prep totals are the materialiser's.
- `completeFirstRun`'s week key is `weekKeyOf(todayKey)` from `resolveTodayFor` — the person's zone, not the server's.
- The second work template's sheet is a `ResponsiveSheet` with two fields; `FixtureSheet` is the shape to copy, not to reuse.

## Dev's call

Whether the chooser band on screen 7 is one row of `CheckboxField`s or a `QuickChipRow` (the document says checkboxes) · whether the landscape's *Body · Mind* grouping is a field on the entry or a list in the screen (a list in the screen — `STARTER_LIBRARY` has no group field; logged) · the exact wording of the *Until about* line on the second-template sheet.

## Out of scope

- **The orient frame and the post-completion landing once the day has started** — DYN-13.
- **The week build's amended day sheet and the trade** — DYN-12.
- **Drag handles on prompts** — DYN-9.
- **The quick-pick's reading of `overflow_mode`** — DYN-15.
- **Deleting `STARTER_HABITS` and `createFromStarterSet`** — DYN-21.

## Depends on

- **DYN-10** — `FactScreen`, the frame at twelve, `firstRunStep` 1–12. Complete in `PROGRESS.md`.
- **DYN-8** — the block editor's walk and *one of* shape, `settingsYourDayBlockRoute`. Complete in `PROGRESS.md`.
- **DYN-5** — `week.prefill`, `readDayProfile`, `defaultTemplateFor`. Complete in `PROGRESS.md`.

## Recommended execution

**Opus.** Six screens with three different write shapes and one computed screen whose only rule is not to editorialise; a cheaper model puts a minutes total on the landscape or a second primary on the fit.

---

### Kickoff (paste into the session)

> Build **DYN-11 — First run 7–12 and the first week** (attached spec). Model: **Opus**. **No fit number on screen 8; nothing pre-checked; no time asked on 7 or 9; one primary on 12; the science line is one sentence; the fit is `computeBudget`.**
> Attach/read first, in order: this spec · v1.1 §4.7–§4.12, §3.10, §4.13, §12.4, §13 #6/#13, W2–W4 · `apps/web/AGENTS.md` · root `AGENTS.md` · `docs/specs/README.md` § Placement rules · DYN-10 (`FactScreen`) · DYN-8 (`components/block-editor/`) · DYN-5 (`prefill-week.ts`, `materialize-day.ts`) · DYN-1 (`budget.ts`, `starter-library.ts`) · this track's `DEVIATIONS.md` + `TECHNICAL-DECISIONS.md`.
> Walk the six screens in the browser on an account past screen 6. Close in three places; log departures in `DEVIATIONS.md`. Run `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` as separate commands.
