# DYN-10 — First run 1–6: the shape of the week, work days, work start and what gives, standing commitments, wake, before the day

**Epic:** DYN — Dynamic schedule (UX v1.1) · **Phase 1** · Size: L
**Slice type:** A sequence — six screens, each capturing one fact and showing at most one consequence. The risk class is *persuasion* (a pre-checked offer, an explanation on the greyed cards, a default that leans) and *a dead end* (a gate on a skippable screen, a *Continue* that leads nowhere while screens 7–12 do not exist yet).
**Vigil:** none. **Vesper review:** each screen against §4.1–§4.6 verbatim; nothing pre-checked that v1.1 does not pre-check; the one gate is screen 3's.

**Status:** Complete (2026-09-13 — authored and built in one thread; screens 1–6 at `/setup/{1–6}` with the transitional ready at `/setup/7`; the six screens also mount `embedded` under Settings → Your day (DYN-8); the four root commands pass; the browser walk stops at sign-in because credentials are never entered, so the screens are verified by types, lint and build, not by eye — logged in `DEVIATIONS.md`)

> **Vesper — screen review.** Walk `/setup/1` to `/setup/6` on a fresh account and confirm: the three grey cards do nothing on tap and carry no toast; Mon–Fri · Sat · Sun default as §4.2; screen 3's primary is disabled until a *what gives* row is chosen and nothing is preselected; screen 4's *Skip for now* writes nothing; *Add an earliest* is hidden until tapped; the passage field is serif; every pre-filled field is value + Change; the frame reads *n of 12*. Leave at 4, reopen, land on 4.

---

## Outcome

A new account walks six screens that capture the facts the block model lays days out from: the shape of the week (one live archetype, preselected), which days have a work block, the work anchor and its hardness, the standing fixtures, the wake, and what the first screen of every morning shows. Every screen after the first is skippable; every pre-filled field shows its value with *Change*; nothing is pre-checked that the person did not choose; the frame counts to twelve. The same six screens are reachable frame-less under Settings → Your day (DYN-8 lists them). After this ships, **DYN-11 has screens 7–12 to write into the same sequence, and the profile a day is laid out from (DYN-5) can be filled without a probe.** Screens 7–12 are DYN-11's; until they exist the sequence ends after screen 6 at a transitional *ready* screen that completes first run, so no one is left on a step that does not render.

## Why / intent

- **v1.1 §4 (the frame, once)** — *"Every screen sits in `StepFrame`: a caption top-left (*3 of 12*), *Finish later* top-right as ghost text, the heading at 1.375rem, at most one paragraph of body under it, the content, and the primary button pinned above the safe area with *Skip for now* as ghost text beside it where skipping is allowed. … Pre-filled fields show **value + Change** and open their control only on demand (W1). Selection is a single commit: a tick is the selection, and the primary always reads *Continue*."*
- **§4.1 Screen 1** — *"Heading: *Which is closest?* Four full-width cards, stacked, each a `LargeTargetRow` at 72px … Only the third is live: **I set my own structure, and it changes** — *Work starts around a time, not at one. Mornings bend.* The other three … render at `text-text-disabled` with a caption *not yet* on the right, not tappable, no explanation. The live card is preselected, so *Continue* is one tap."* Stores `users.schedule_shape`. *"Tapping a grey card does nothing; there is no toast, because a toast would be an apology."*
- **§4.2 Screen 2** — *"Heading: *Which days do you work?* Body: *Tap a day to change it.* Seven full-width rows, Monday first, each a `ListRow` with the weekday on the left and a three-way `SegmentedControl` on the right: **Always · Sometimes · Never**. Mon–Fri preselected *Always*, Sat *Sometimes*, Sun *Never* … One line under the list, muted: *Sometimes means the morning asks.*"* Stores `users.work_days`. W5: the control stacks under the day name rather than wrapping.
- **§4.3 Screen 3** — *"Heading: *When do you like to be working by?* A `TimeField` showing *9:00* as value + Change … Under it, smaller: *Until about* with *17:30* as value + Change (R24). Then a second heading in body weight: *When your morning runs long, what gives?* Three `LargeTargetRow`s as a radio group: **Work waits** — *I start when the routine is done.* · **The routine gets cut** — *Work starts when it starts.* · **Depends on the day** — *Ask me in the morning.* Nothing preselected; the primary is disabled until one is chosen."* Stores `work_start_time`, `work_end_time`, `anchor_direction`.
- **§4.4 Screen 4** — *"Heading: *Anything that happens every week at a set time?* Body: *A stand-up, a class, dinner on Thursdays.* An empty state in two lines: *Nothing yet.* / **Add one**. Adding opens the `FixtureSheet` (bottom sheet): title `Input` (autofocus), weekday `WeekdayChips` (multi-select …), `TimeField` at, `MinutesStepper` for, and a `SegmentedControl` **In work · In the evening** that decides the block. Saved fixtures list as `ListRow`s: *Stand-up · Tue · 9:30 · 20 min*. Primary: *Continue* (or *Skip for now* as the ghost; skipping is one tap)."* *"Suggest fixtures"* is the thing it must never do. Writes `fixtures`.
- **§4.5 Screen 5** — *"Heading: *When would you like to be up?* One `TimeField`, *7:00* as value + Change. A ghost text row beneath: *Add an earliest* — tapping reveals a second `TimeField` (*6:30*) … Under the field, the first computed consequence in the flow, muted, tabular: *7:00 to 9:00 · 2 h before work.*"* Stores `usual_wake_time`, `earliest_wake_time`. Never *alarm*.
- **§4.6 Screen 6** — *"Heading: *What do you want to read before the day starts?* Body: *Your own words, a passage, or both. It stays private.* A `Textarea` labelled *A passage* (optional; placeholder … *A few lines you want to see every morning.*), 6 rows, serif … a `Switch` row: **Show what I wrote the night before** — on by default, with one muted line: *From the evening journal, if you write one.* Then a second `Switch`: **Ask one line of gratitude in the morning** — on by default. Primary: *Continue*; *Skip for now* as ghost."* Stores `orient_passage`, `orient_show_last_night`, `orient_ask_gratitude`. Never a quote bank.
- **§4.14** — the six screens under Settings → Your day, *"without the frame"*.
- **§13 #5, #7, #12** — work end asked at first run (17:30 placeholder); the work-day defaults are Taylor's week; the archetype names are placeholders (P2-16) `[COPY]`.
- **W1** — value + Change for every pre-filled field.
- **Ground truth (consumed):** the v1.0 sequence (`apps/web/app/(setup)/`: `layout.tsx`, `[step]/page.tsx`, `_components/{step-1-day,step-2-habits,step-3-template,step-4-week,step-5-ready,step-frame,copy}.tsx`), `lib/entry/resolve-entry.ts`, `lib/routes.ts` (`setupRoute`), DYN-7's `StepFrame`, `LargeTargetRow` (stacked, disabled), `SegmentedControl` (stacked), `WeekdayChips` (`indexing="monday"`), `Textarea variant="serif"`, DYN-4's `user.updatePreferences` (the profile columns), `fixture.{list,save,archive}`, `fixtureFormSchema`; USE's `TimeField`, `MinutesStepper`, `ListRow`, `EllipsesMenu`, `EmptyState`, `Switch`.
- **What this slice is NOT (binding):** screens 7–12 (DYN-11 — the prep list, the landscape, training, closing the day, focuses, the fit; and the first week pre-filled); the Settings → Your day list and routes (DYN-8 — this ticket makes the six screens `embedded`-capable, DYN-8 mounts them); the science line under devices-off (screen 10's, not here); the wake-anchor habit (retired by DYN-13).

**Rulings this slice makes (labelled, logged):**

- **Steps 7–12 do not exist yet, so *Continue* on screen 6 lands on a transitional ready screen at `/setup/7`** that says the plan is set up as far as the first run goes today, completes first run (`firstRunCompletedAt`, `firstRunStep = null`) and opens Today — the v1.0 `step-5-ready` behaviour re-homed. DYN-11 replaces it with screens 7–12 and moves the completion to screen 12. A sequence that ends on a step that does not render is the dead end the ticket names. Logged.
- **The five v1.0 steps are deleted in this ticket** (FR-01 → screen 5; FR-02 → DYN-11's screen 8; FR-03/04 → the block editor and the week build; FR-05 → the transitional ready). Their `SETUP_COPY` entries that no screen reads go with them. Logged.
- **`firstRunStep` is widened to 12** (`updatePreferencesInput`), `resolveEntry` clamps to 12, `setupRoute(step)` accepts 1–12, and `[step]/page.tsx` 404s above 12. Logged.
- **Each screen is a component with an `embedded` prop:** in the sequence it renders inside `StepFrame` and writes on *Continue*; embedded (Settings → Your day, DYN-8) it renders without the frame, with a *Save* primary, and writes the same fields. One component per fact, two frames. Logged.
- **Screen 1's live card is preselected and the three grey cards are `disabled` options** of one `LargeTargetRow layout="stacked"` (DYN-7): `aria-disabled`, out of the tab order, caption *not yet*, no handler. Logged.
- **Screen 3 is the only gated screen**: the primary is disabled until `anchor_direction` is chosen; the two time fields carry 9:00 and 17:30 as placeholders shown as value + Change, and are written even if untouched (the placeholder is the person's answer by not changing it, as the spec says of 9:00). Logged.
- **Screen 4 lists fixtures from `fixture.list`** and writes each through `fixture.save` as the sheet closes; *Skip for now* and *Continue* write nothing of their own. The `FixtureSheet` is a feature folder (`components/fixture-sheet/`) because DYN-8's Your day and DYN-12's week build open it too. Logged.
- **Screen 5's consequence line** reads `work_start_time` from the profile (screen 3's answer, or its 9:00 placeholder if screen 3 was skipped) and says *7:00 to 9:00 · 2 h before work*; with no work start it says nothing. Logged.
- **Nothing is pre-checked, nothing suggests.** The two switches on screen 6 default on because both produce the person's own content (Sage, §4.6); no other default is a choice. Logged.

## Experience & states

### The frame — every screen

`StepFrame` (`@syn/ui`, DYN-7) bound by the app's wrapper: *n of 12*, *Finish later* ghost top-right, back on every step but the first, the primary pinned, *Skip for now* ghost beside it on screens 2–6. Focus moves to the heading on every step. Offline: the primaries disabled with the standard line. Every transition writes `first_run_step` through `useStepNavigation` (kept from v1.0).

### Screen 1 — `/setup/1` (§4.1)

Heading *Which is closest?*. `LargeTargetRow layout="stacked"` with four options: `consistent_shifts` (*My shifts are the same every week*, disabled, *not yet*), `varying_shifts` (*My shifts change week to week*, disabled, *not yet*), `own_structure_dynamic` (*I set my own structure, and it changes* — *Work starts around a time, not at one. Mornings bend.*), `fluid` (*My days are fluid*, disabled, *not yet*). The live one preselected from `users.schedule_shape` or by default. *Continue* writes `scheduleShape`. No skip (the first screen is not skippable, §4 preamble). No explanation of what an archetype does. **States:** default · saving · offline.

### Screen 2 — `/setup/2` (§4.2)

Heading *Which days do you work?*, body *Tap a day to change it.* Seven `ListRow`s Monday-first, each with a three-segment `SegmentedControl` (*Always · Sometimes · Never*, `stacked="auto"`), preset Mon–Fri always · Sat sometimes · Sun never from `users.work_days` or the default. Under the list, muted: *Sometimes means the morning asks.* *Continue* writes `workDays`; *Skip for now* writes nothing. **States:** default · saving · offline.

### Screen 3 — `/setup/3` (§4.3)

Heading *When do you like to be working by?*. `TimeField` *9:00* as value + Change; under it, smaller, *Until about* *17:30* as value + Change. Body-weight heading *When your morning runs long, what gives?* and a stacked `LargeTargetRow` radio: `work_waits` (*Work waits* — *I start when the routine is done.*), `routine_cut` (*The routine gets cut* — *Work starts when it starts.*), `depends` (*Depends on the day* — *Ask me in the morning.*). Nothing preselected unless `users.anchor_direction` is set. **The primary is disabled until one is chosen.** *Continue* writes `workStartTime`, `workEndTime`, `anchorDirection`. *Skip for now* writes nothing. **States:** ungated (a row chosen) · gated · saving · offline.

### Screen 4 — `/setup/4` (§4.4)

Heading *Anything that happens every week at a set time?*, body *A stand-up, a class, dinner on Thursdays.* Empty: *Nothing yet.* / **Add one**. `FixtureSheet` (feature folder; `ResponsiveSheet`): title `Input` autofocus, `WeekdayChips indexing="monday"`, `TimeField` *At*, `MinutesStepper` *For*, `SegmentedControl` *In work · In the evening* (→ `blockKind` work | activity); saves through `fixture.save`. Saved fixtures as `ListRow`s *Stand-up · Tue · 9:30 · 20 min* with an `EllipsesMenu` (*Edit · Remove* → `fixture.archive`). *Continue* and *Skip for now* write nothing. **States:** empty · listing · sheet open · saving · offline. Never a suggestion.

### Screen 5 — `/setup/5` (§4.5)

Heading *When would you like to be up?*. `TimeField` *7:00* as value + Change (from `users.usual_wake_time`). Ghost row *Add an earliest* → reveals a second `TimeField` (*6:30*, from `earliest_wake_time` if set — then shown, not hidden). Under the field, muted tabular: *7:00 to 9:00 · 2 h before work* (computed from the profile's `work_start_time`; absent when none). *Continue* writes `usualWakeTime`, `earliestWakeTime`; *Skip for now* writes nothing. Never *alarm*. **States:** default · earliest revealed · saving · offline.

### Screen 6 — `/setup/6` (§4.6)

Heading *What do you want to read before the day starts?*, body *Your own words, a passage, or both. It stays private.* `Textarea variant="serif"` labelled *A passage*, placeholder *A few lines you want to see every morning.*, six rows, `ORIENT_PASSAGE_MAX`. `Switch` **Show what I wrote the night before** (on; muted line *From the evening journal, if you write one.*), `Switch` **Ask one line of gratitude in the morning** (on). *Continue* writes `orientPassage` (null when blank), `orientShowLastNight`, `orientAskGratitude`; *Skip for now* writes nothing. **States:** default · saving · offline.

### The transitional ready — `/setup/7` (this ticket only)

Heading *That's the start.* Body: *The rest of the setup — your routine, training, the evening — is next. For now, the day is ready with what you've said.* `[COPY — needs Vesper sign-off; deleted by DYN-11]`. Primary *Open today* → `firstRunCompletedAt = now`, `firstRunStep = null`, Today. No skip, no back to the sequence's exit.

### Embedded (Settings → Your day)

Each screen component with `embedded: true`: no frame, the same content, a primary *Save* that writes the same fields and calls `onSaved`; DYN-8 mounts them under `/settings/your-day/…` inside the shell's page frame.

**States (exhaustive):** per screen above; the sequence — step 1–7 · resumed at `first_run_step` · finished later (exit to Today with the setup status line, SYS-1) · offline.

**Failure / edge states:** a write fails → `HelperText` error on the frame, the step does not advance (v1.0's rule) · `first_run_step` above 12 in the row → `resolveEntry` clamps to 12; above 7 today → `[step]/page.tsx` renders the ready screen for 7 and 404s 8–12 until DYN-11 · screen 3 skipped then screen 5 opened → the consequence line reads the profile, `work_start_time` is null, and the line is absent (the placeholder is shown on screen 3, never written by a skip). Logged. · a fixture titled with only spaces → the validator's *Give it a title.* · `earliest_wake_time` later than `usual_wake_time` → the validator refuses (`updatePreferencesInput` gains the rule: earliest ≤ usual, message *Earliest comes before usual.* `[COPY]`).

## Non-negotiables (this slice)

- **Nothing pre-checked that the person did not choose** (§4.8's rule, applied to every screen): the live archetype and the work-day defaults are v1.1's stated defaults; screen 3's radio has none.
- **The grey cards do nothing.** No toast, no explanation, no handler.
- **Screen 3 is the only gate.** Every other primary is one tap.
- **Value + Change on every pre-filled field** (W1).
- **No suggestion of fixtures; no quote bank** (§4.4, §4.6).
- **The sequence never dead-ends:** screen 6's *Continue* has somewhere to go.
- **No new `@syn/ui` component** beyond `FixtureSheet` composed from existing ones; the sheet is app-local (a feature folder).
- **Every write through `user.updatePreferences` and `fixture.*`;** no new procedure.

## Data & AI

**Schema changes: none.**

**Tables:** `users` (update — the profile columns) · `fixtures` (insert, update, archive).

**Placement:** `apps/web/app/(setup)/_components/{step-1-shape,step-2-work-days,step-3-work-start,step-4-commitments,step-5-wake,step-6-before-the-day,step-7-ready}.tsx` (the old five deleted), `_components/copy.ts` rewritten, `[step]/page.tsx` routing 1–7; `apps/web/components/fixture-sheet/{fixture-sheet.tsx,use-fixture-sheet.ts,copy.ts,index.ts}`; `lib/entry/resolve-entry.ts` (clamp 12); `lib/routes.ts` (`setupRoute` 1–12); `apps/web/AGENTS.md` (the `/setup/{1–12}` row); `packages/validators/src/user.ts` (`firstRunStep` ≤ 12; the earliest ≤ usual refine). Rule 9 (app-local composition), rule 7 (one Zod home).

**tRPC / validators:** `user.updatePreferences` (widened `firstRunStep`; the new refine), `fixture.list`, `fixture.save`, `fixture.archive`; `user.me` for the current values.

**AI notes:** **None.**

**Instrumentation:** none.

## Accessibility

- The grey archetype cards are `aria-disabled` and out of the tab order; the caption *not yet* is read with the card.
- Screen 3's disabled primary carries no explanation — the unanswered radio group is the explanation, and the group is labelled *When your morning runs long, what gives?*.
- Every `TimeField` value + Change is a button labelled *Change {field}*; the control appears in place and takes focus.
- The `FixtureSheet` traps focus, autofocuses the title, and returns focus to *Add one* on close.
- *Add an earliest* is a button that reveals a labelled field and moves focus into it.
- The serif `Textarea` is labelled by its caption; the two switches are labelled by their rows.
- 200% text: the seven segment controls stack (W5); nothing scrolls sideways at 375px.

## Acceptance criteria (observable — local tier, a fresh account; `yarn web:dev`)

1. `/setup/1` shows four stacked cards, the third live and preselected, the other three `text-text-disabled` with *not yet*, not tabbable; tapping a grey card changes nothing and shows no toast; *Continue* writes `schedule_shape = own_structure_dynamic` and lands on `/setup/2`. *(Vesper.)*
2. `/setup/2` shows Mon–Fri *Always*, Sat *Sometimes*, Sun *Never*, the muted line; changing Wednesday to *Sometimes* and *Continue* writes `work_days` with `"2": "sometimes"`; at 200% text the three segments stack under the day name with no horizontal scroll. *(Vesper.)*
3. `/setup/3` shows *9:00* and *17:30* as value + Change; the primary is disabled until a *what gives* row is chosen; choosing *Depends on the day* and *Continue* writes `work_start_time = 09:00`, `work_end_time = 17:30`, `anchor_direction = depends`; nothing was preselected on a fresh account. *(Vesper.)*
4. `/setup/4` shows *Nothing yet.* / **Add one**; the sheet saves *Stand-up · Tue · 9:30 · 20 min · In work* as a `fixtures` row with `weekdays = [1]`, `block_kind = work`; the row lists; *Remove* archives it; *Skip for now* on an empty screen writes nothing and lands on `/setup/5`. *(Vesper.)*
5. `/setup/5` shows *7:00* as value + Change and the line *7:00 to 9:00 · 2 h before work*; *Add an earliest* is hidden until tapped and reveals *6:30*; *Continue* writes `usual_wake_time`, `earliest_wake_time`; an earliest after the usual is refused with the sentence.
6. `/setup/6` shows the serif passage field, the two switches on; *Continue* with a passage writes `orient_passage` and both flags; *Skip for now* writes nothing. *(Vesper.)*
7. `/setup/7` (transitional) completes first run and opens Today; `first_run_completed_at` is set, `first_run_step` is null.
8. Leaving at `/setup/4` via *Finish later* and reopening the app lands on `/setup/4` (`resolveEntry`); a row with `first_run_step = 12` lands on `/setup/12`, which renders a 404 until DYN-11.
9. Each screen component renders with `embedded` and no frame in a Storybook-free check: the DYN-8 page mounts it (verified there; here, the prop exists and type-checks).
10. Offline (DevTools): every primary is disabled with the standard line; nothing writes.
11. `grep -rn "alarm" apps/web/app/\(setup\)` returns nothing; no screen's copy contains *late*, *behind*, or a question mark outside the headings v1.1 writes as questions.
12. `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` pass (four separate commands).

## Likely-relevant technical notes (ADVISORY — dev decides)

- Read `step-1-day.tsx` for the value + Change pattern already shipped for the timezone (W1's v1.0 patch) and reuse its shape for every `TimeField`.
- Keep `useStepNavigation`; the new steps call it exactly as the old ones did. The order of writes: the screen's `updatePreferences`, then `goTo(next)`.
- The consequence line on screen 5: `clockToMinutes(workStart) − clockToMinutes(wake)` → *2 h*, *1 h 30*, *45 min* — a small formatter in the screen's file, not `@syn/utils`, unless DYN-11's fit screen needs the same (it will: lift it then).
- `FixtureSheet`'s form is `fixtureFormSchema` through `useSynapseForm`; the *In work · In the evening* segment maps to `blockKind: "work" | "activity"`.
- The transitional ready screen is `step-5-ready.tsx` renamed and re-worded; delete it in DYN-11 rather than keeping two.

## Dev's call

The exact duration formatter · whether the ready screen's copy names DYN-11 (no — it names *the rest of the setup*) · whether screen 4's list re-fetches or updates from the mutation's return (return is enough).

## Out of scope

- **Screens 7–12 and first-run completion on screen 12** — DYN-11.
- **Settings → Your day routes and list** — DYN-8.
- **The week pre-fill on completion** — DYN-11 (`week.prefill`).
- **The wake-anchor retirement** — DYN-13.

## Depends on

- **DYN-7** — `StepFrame`, `LargeTargetRow` stacked/disabled, `SegmentedControl` stacked, `WeekdayChips` Monday indexing, `Textarea` serif. Complete in `PROGRESS.md`.
- **DYN-4** — `user.updatePreferences`' profile columns, `fixture.*`, `fixtureFormSchema`. Complete in `PROGRESS.md`.

## Recommended execution

**Opus.** Six screens of state and gating with a persuasion guardrail on each; a cheaper model pre-selects a *what gives* answer to make the primary enabled, or adds a toast to the grey cards to explain them.

---

### Kickoff (paste into the session)

> Build **DYN-10 — First run 1–6** (attached spec). Model: **Opus**. **Nothing pre-checked the person did not choose; the grey cards do nothing; screen 3 is the only gate; value + Change on every pre-filled field; the sequence never dead-ends.**
> Attach/read first, in order: this spec · v1.1 §4 (the frame), §4.1–§4.6, §4.14, §13 #5/#7/#12, W1, W5 · `apps/web/AGENTS.md` · root `AGENTS.md` · `docs/specs/README.md` § Placement rules · the v1.0 sequence under `apps/web/app/(setup)/` (reuse `useStepNavigation` and the value + Change pattern; delete the five steps) · DYN-7 (`StepFrame`, the row and control extensions) · DYN-4 (`updatePreferencesInput`, `fixture.*`) · this track's `DEVIATIONS.md` + `TECHNICAL-DECISIONS.md` · `docs/specs/infrastructure/DEVIATIONS.md`.
> Walk the six screens in the browser on a fresh account. Close in three places; log departures in `DEVIATIONS.md`. Run `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` as separate commands.
