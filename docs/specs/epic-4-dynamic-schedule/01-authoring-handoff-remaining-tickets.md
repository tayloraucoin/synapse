# Authoring handoff — DYN-7 … DYN-21

**What this is:** the dense form of the fifteen tickets not yet written at full quality (spec-system guide §7.4: "compress into a dense handoff file rather than degrading the last ticket"). Each entry carries what a later authoring thread needs to write the full ticket without re-deriving it: the outcome, the v1.1 sections it ships, the components and paths, the rulings already made, the acceptance edges that must become numbered criteria, the dependencies, and the model. **A builder does not build from this file.** Reeve (with Mason for the paths, Vesper for anything the screen walk-through leaves open) expands each batch into `DYN-n-<slug>.md` per `_templates/slice-spec.md`, then updates `PROGRESS.md`'s status column from "(handoff)" to "Not started".

**Authoring batches** (from `00-build-order.md`): 3 · DYN-7 — 4 · DYN-8, DYN-9, DYN-12 — 5 · DYN-10, DYN-11 — 6 · DYN-13, DYN-14 — 7 · DYN-15, DYN-16, DYN-17 — 8 · DYN-18, DYN-19 — 9 · DYN-20, DYN-21.

**Standing for every ticket below:** the v1.1 walk-through is quoted, not paraphrased, in *Experience & states*; copy is v1.1's verbatim in a `copy.ts`, everything else `[COPY — needs Vesper sign-off]`; compact layout first, wide derived per the walk-through's last line; the state matrix from v1.1 §10.1–10.2 for every composite used; every route added gets its builder in `lib/routes.ts` and its row in `apps/web/AGENTS.md`; the kickoff attach-list ends with this track's `DEVIATIONS.md` + `TECHNICAL-DECISIONS.md`; verification is the four commands.

---

## Batch 3

### DYN-7 — `@syn/ui` for v1.1: the composites every screen ticket composes

> **Expanded 2026-09-13** into `DYN-7-ui-composites-for-v1-1.md` and built in the same thread (batch 5). The `[NEEDS VALUE AT BUILD]` below resolved: `StepFrame` lived in `apps/web/app/(setup)/_components/step-frame.tsx`; the presentational frame moved to `@syn/ui` and the app keeps a binding wrapper. Kept here as the record of the dense form.

**Size:** L. **Slice type:** Storybook-first component work — no route, no data. Risk class: *a fork of the design system* (a second row component, a second sheet). **Vesper review:** every story in both themes, reduced-motion, 200% text; the drag layer's states; the serif surfaces.

**Outcome.** Every reusable piece v1.1 names exists in `@syn/ui` with a story before any screen uses it: `BlockHeader` (replaces `DayPartHeader` — v1.1 §6.1: kind, name, computed span in muted tabular text, `split` variant), `BlockBand` (§6.5: a `bg-surface` band behind items with the kind's name in the gutter; children absolutely positioned; `draggable` header), `GapBand` (§3.11: the thin empty band between stacked items with `+{n}` in the gutter; `resizable`), `BudgetLine` (§5.3: two tabular numbers and a middle dot, `state: BudgetState` with **no colour change**, `aria-live="polite"` debounced 500 ms), `DragLayer` (§6.5, §10.4: long-press 300 ms lift, 5-min snap, re-stack preview, drop, refused, confirming; pointer and touch; keyboard Alt/Shift arrows; announces lift and drop), `ConfirmYesterdayRows` (§7.3: `CheckboxField` rows, none pre-ticked, labelled *{title}, last night, not confirmed*), `StepFrame` widened (`total` any integer, `Skip for now` ghost beside the primary), `Textarea variant="serif"` (autogrow, one row start — the orient frame and the journal), `ScheduleBlock` props `draggable`, `resizable`, `pinned` (anchor glyph, does not lift), `container` (work), `ItemRow` variants `container` (nested children, no checkbox, title = focus) and `pinned`, plus `confirm-later` (no checkbox, caption) and `not-confirmed` visuals, `StateWord` kinds `confirm-later · opener · closer · pinned`, `SlotRow` reading the widened `SlotView` (gap, pin, role captions, one-of tabs), `QuickChipRow` with a `selected` prop for placements, `SegmentedControl` stacking under its label when three segments would wrap (W5), `LargeTargetRow` `disabled` with a trailing caption (the greyed archetypes), `WeekdayChips` multi-select (fixtures), `HabitStrip` with the *not confirmed* square. Fixtures in `composed/__fixtures__/view-models.ts` gain block-shaped days.

**v1.1 §:** §3.11, §5.2, §5.3, §6.1, §6.5, §7.2, §7.3, §10.1–10.4, §12.2. **Handoff v2 §5.6–5.8** for the existing contracts being extended.

**Placement:** `packages/ui/src/composed/display/{block-header,block-band,gap-band,budget-line}/`, `composed/control/{drag-layer,confirm-yesterday-rows}/`, extensions in place for `schedule-block`, `item-row`, `slot-row`, `state-word`, `quick-chip-row`, `segmented-control`, `large-target-row`, `weekday-chips`, `habit-strip`, `primitives/control/textarea`, `composed/layout/step-frame` (exists as `StepFrame`? — verify; the handoff names it, the tree shows `screen-frame`; **[NEEDS VALUE AT BUILD]** whether `StepFrame` lives in `apps/web/app/(setup)/_components/step-frame.tsx` today — the directory listing says it does; DYN-7 moves it to `@syn/ui` **only if** DYN-10 will be its second consumer — it will (Settings → Your day reuses the screens) — so move it, with a deviation line). Rule: root `AGENTS.md` § UI, Storybook-first.

**Rulings to carry:** `DayPartHeader` is not deleted here (DYN-21); `BlockHeader` is added beside it. The drag layer owns no data — it emits `{ id, toMin }` and `{ blockId, deltaMin }`; refusal and confirmation are the caller's (DYN-16). `BudgetLine` never changes colour (v1.1 §5.3, §10.2). No new tokens (§10.3). The serif `Textarea` is the only serif control in the library.

**Acceptance edges:** every new composite has a story per state in §10.2; `DragLayer` story exercises lift/drop/refused/confirming by keyboard alone; `BudgetLine` under/exact/over render identically except the numbers; `ItemRow container` nests two `ItemRow`s with a shallow indent and no checkbox on the container; `BlockHeader split` renders *Work · 9:00–11:00*; text at 200% keeps every target ≥ 44 px; `yarn ui:storybook` builds; `yarn ui:build`, `yarn ui:lint`, `yarn ui:typecheck` pass.

**Depends on:** DYN-1 (the unions and view models). **Model:** Opus — the drag layer's keyboard parity and the row variants' state matrix are where a cheaper model ships a visual that looks right and announces nothing.

---

## Batch 4

### DYN-8 — The block editor, step one, and Settings → Your day

> **Expanded 2026-09-13** into `DYN-8-block-editor-step-one-and-your-day.md` and built in the same thread (batch 6, with DYN-10). `components/template-editor/` is deleted; `components/block-editor/` replaces it; `/settings/templates*` redirect. Kept here as the record of the dense form.

**Size:** L. **Slice type:** the planning canvas rebuilt around blocks, with tap fallbacks for every gesture DYN-9 adds later. Risk class: *a form* (the editor turning into fields) and *a fork* (two editors coexisting).

**Outcome.** `components/block-editor/` replaces `components/template-editor/` as the one editing surface for any block template: a `ScheduleAxis` strip at 96 px/hour with `ScheduleBlock`s whose height is duration, `GapBand`s between them, pins with the anchor glyph, opener/closer captions, the pool band, one-of groups as one block with two tabs; the sticky footer *7:03 – 8:15 · 72 min · 0 min slack* from `stackBlock` (client-side, over the same `SlotView`s); *Add* opening the library filtered to the block's kind (tap to add at the range midpoint); the slot sheet amended (gap stepper, pin time, role, *one of* with the second member, *Move up / Move down* in the overflow — the fallbacks §13 #4 names); the same-position `InlineQuestionRow` with three answers. **Settings → Your day** (`/settings/your-day`) lists the twelve first-run screens without the frame (v1.1 §4.14); block-kind rows open `/settings/your-day/{kind}` (the template list for that kind above the editor when more than one exists); **Block order** is a sortable list. **The library** (§4.15): grouped by block then category; the habit sheet loses the type segment, gains the block chip row, hides the category picker until one exists (W7). `settingsTemplatesRoute()` and `settingsTemplateRoute(id)` redirect to Your day.

**v1.1 §:** §3.11 (the walk-through, verbatim), §4.14, §4.15, §13 #4, #8; W5–W9.

**Placement:** `apps/web/components/block-editor/{block-editor.tsx,use-block-editor.ts,slot-sheet.tsx,copy.ts,index.ts}`; `apps/web/app/(shell)/settings/your-day/page.tsx`, `your-day/[kind]/page.tsx`, `your-day/order/…`; `components/habit-sheet/` amended; `lib/routes.ts` + `apps/web/AGENTS.md` rows; the old `template-editor/` folder deleted **in this ticket** (its only consumers are the routes this ticket redirects; leaving it is the fork). Rule 9.

**Rulings to carry:** the footer arithmetic is `stackBlock` on the client over `SlotView`s (no fetch per edit); the range is a faint band while adjusting, never a clamp (R21); a pin never moves; drag/resize/seam-drag are DYN-9 — this ticket ships up/down and the gap stepper and is complete without them (§14 obituary 2).

**Acceptance edges:** open Taylor's prep template → backward layout ending at 9:00; add breakfast's second member via *one of* → the group shows two tabs and the footer uses the default; pin *call Mum 8:00* in the morning → the stack flows around it and an overrun reads *runs 8 min past …* muted; move up across the pin → the pin stays; the same-position question offers three answers; a duration of 90 on a 10–30 habit saves; Your day lists twelve rows; `/settings/templates` redirects; the habit sheet has no type control; a category-less library shows no category picker; offline → read-only with the line.

**Depends on:** DYN-4, DYN-7. **Model:** Opus.

### DYN-9 — The block editor, step two: drag to reorder, resize, seam-drag gaps, keyboard equivalents

**Size:** M. **Slice type:** gesture layer over a working editor. **Does not gate.** Risk class: *a drag that moves a pin* or *a resize that clamps*.

**Outcome.** On the block editor's strip: long-press lifts a block and dragging reorders it with the stack re-flowing under it; dragging a block's bottom edge changes its duration in 5-minute steps with the minutes live in the gutter and the range as a faint band; dragging the seam between two blocks opens a gap; keyboard: Alt+↑/↓ reorders, Shift+↑/↓ resizes, `g` then digits sets a gap; a `[OPEN]` fallback *+ gap* row in the slot sheet stays (§13 #8). Haptics where available. Reduced motion: positions jump.

**v1.1 §:** §3.11 (gestures, keyboard, motion), §10.4. **Placement:** `components/block-editor/` (wires DYN-7's `DragLayer` and `GapBand resizable`). **Rulings:** pins do not lift; resize never clamps; every gesture writes through `template.saveSlot`/`moveSlot` (no new procedure). **Edges:** drag across a pin; resize below the range floor (allowed); seam-drag to 240 (the max) and beyond (refused at the bound); keyboard-only completes every gesture; reduced-motion story. **Depends on:** DYN-8. **Model:** Sonnet — the mechanism is pinned by DYN-7's layer; the risk is wiring, not reasoning. State the failure mode: a cheaper pass leaves a keyboard path unwired.

### DYN-12 — The week build amended: per-block day sheet, the shape toggle, the pre-filled week, the training swap confirm

> **Expanded 2026-09-13** into `DYN-12-week-build-amended.md` and built in the same thread (batch 7, with DYN-11). `week.tradeWorkouts` and `week.defaultPlan` are the two additions; *Plan from your defaults* sits beside *Copy last week* rather than replacing it. Kept here as the record of the dense form.

**Size:** M. **Slice type:** an existing canvas re-pointed at the block read model. Risk class: *two vocabularies on one screen*.

**Outcome.** WK-01's day rows read v1.1 §4.13's one line — *Menu · Viewpoint · Push · Stand-up 9:30* — with the shape; the `DaySheet` becomes a row per block kind present, each a `PickerList` of that kind's templates with target status, the shape toggle at the top, *Add a one-off* at the bottom; the first week after first run is pre-filled (`week.prefill`) so the build's first job is reading; dragging *Push* from Monday onto Tuesday (compact: a *Swap with…* row in the day sheet's training row) shows *Trade with Tuesday's pull?* — **Trade** · **Cancel** (R25). `copyLastWeek` uses `prefill` for the replacement.

**v1.1 §:** §4.13, R25. **Placement:** `components/week-build/` amended; `week.assignBlocks`, `week.prefill`, `day.confirm`'s trade path (DYN-5). **Rulings:** applying a block template materialises immediately for decided parts; pooled parts show *Set in the morning* on a future day's Today tab (DYN-15 renders; this ticket's preview says it). **Edges:** a *sometimes* Saturday shows the shape as a question mark; a confirmed day's sheet is read-only for templates; the trade against a confirmed day → the `CONFLICT` sentence. **Depends on:** DYN-5, DYN-7. **Model:** Sonnet.

---

## Batch 5

### DYN-10 — First run 1–6: the shape of the week, work days, work start and what gives, standing commitments, wake, before the day

> **Expanded 2026-09-13** into `DYN-10-first-run-1-6.md` and built in the same thread (batch 6, with DYN-8). The v1.0 steps are deleted; `/setup/7` is a transitional ready screen until DYN-11; the six screens also mount `embedded` under Settings → Your day. Kept here as the record of the dense form.

**Size:** L. **Slice type:** a sequence, six screens, each capturing one fact. Risk class: *persuasion* (a pre-checked offer, an explanation on the greyed cards) and *a dead end* (a gate on a skippable screen).

**Outcome.** `/setup/1…6` per v1.1 §4.1–§4.6 verbatim: four `LargeTargetRow` archetype cards, one live and preselected, three disabled with *not yet*; seven work-day rows with the three-segment control (defaults Mon–Fri always, Sat sometimes, Sun never — §13 #7); work start and *until about* as value + Change, and the three-row radio *When your morning runs long, what gives?* with nothing preselected and the primary disabled until chosen (the one gated screen); the fixtures list with the `FixtureSheet` (title, `WeekdayChips` multi, at, for, *In work · In the evening*); wake with the *Add an earliest* reveal and the first computed line *7:00 to 9:00 · 2 h before work*; before the day with the serif passage `Textarea` and two switches defaulting on. `StepFrame` reads *n of 12*; `resolveEntry` clamps to 12; `setupRoute(step)` 1–12; `firstRunStep` widened. Pre-filled fields are value + Change (W1). Nothing pre-checked. The same six screens are reachable under Settings → Your day (DYN-8 lists them; this ticket makes them frame-less when `embedded`).

**v1.1 §:** §4 preamble, §4.1–§4.6, §13 #5, #7, #12; W1. **Placement:** `apps/web/app/(setup)/_components/step-{1..6}-*.tsx` replaced (the old 1–5 deleted here — FR-01/02 become DYN-10's 5 and DYN-11's 8; FR-03/04 are gone, the block editor and the week build replace them; FR-05 becomes screen 12); `components/fixture-sheet/`; `lib/entry/resolve-entry.ts`; `lib/routes.ts`; `apps/web/AGENTS.md`. Writes through `user.updatePreferences`, `fixture.save`.

**Rulings to carry:** the archetype cards' names are placeholders written around real people later (P2-16) — `[COPY]`; the grey cards do nothing on tap and show no toast; screen 3 is the only gated screen; the work-day segments stack under the day name rather than wrap (W5); the science line under devices-off is screen 10's, not here.

**Acceptance edges:** tapping a grey card does nothing; screen 3's primary disabled until a row is chosen; screen 4's skip is one tap and writes nothing; the *Add an earliest* field is hidden until tapped; the passage field is serif; `firstRunStep` resumes at 4 after leaving at 4; offline → primaries disabled with the line; 200% text keeps three segments on one row or stacks them.

**Depends on:** DYN-7, DYN-4. **Model:** Opus — six screens of state and gating with a persuasion guardrail on each; a cheaper model pre-selects a *what gives* answer to make the primary enabled.

### DYN-11 — First run 7–12: before work with *one of*, the landscape, training, closing the day, focuses, the fit; the first week pre-filled

> **Expanded 2026-09-13** into `DYN-11-first-run-7-12-and-the-first-week.md` and built in the same thread (batch 7, with DYN-12). `template.fit` is the fit's arithmetic; `completeFirstRun({ overflowMode })` pre-fills the week; `components/starter-set/` is deleted for `landscape-chooser/`; *Open today* lands on `/today` until DYN-13. Kept here as the record of the dense form.

**Size:** L. **Slice type:** the second half of the sequence, three of whose screens are the block editor embedded, and the one computed screen. Risk class: *a fit number on the landscape screen* (§4.8's rule) and *a first week that has to be authored* (§4.13's promise).

**Outcome.** `/setup/7…12` per v1.1 §4.7–§4.12 verbatim: the prep list with the six offers as unchecked `CheckboxField`s, a `MinutesStepper` per row, *Make it one of two* in the overflow opening the inline second row, and the sticky footer *Adds up to 45 min · work by 9:00 · up at 7:00 · 72 min left for the routine* (`computeBudget`); the landscape with **Recommended · All · Selected (n)** tabs over `STARTER_LIBRARY.morning` and a `SearchField`, `Stepper17` + `MinutesStepper` on the Selected tab, *Add your own* → the short habit sheet, **no fit number**, primary *Continue · 9 habits*; training with *Yes · Not right now* and the rotation rows (`CountStepper`, `WeekdayChips`, `MinutesStepper`); closing the day with lights-out and phone-away as value + Change, the one-sentence science line `[COPY]`, the journal switch and the sortable six prompts; focuses with `CountStepper` and optional days and the ghost *I have days with different hours*; the fit: a read-only `ScheduleAxis` from 7:00 to 9:00 with the four blocks, one sentence, the three overflow-mode rows (daily menu preselected) or *It all fits on a usual day.*, primary **Open today**, ghost **Plan this week first**. Completion calls `user.completeFirstRun`, `week.prefill(current)`, and lands per §4.12 (the orient frame if the day hasn't started — DYN-13's route; until DYN-13 ships, `/today`).

**v1.1 §:** §4.7–§4.12, §3.10, §12.4, §13 #6, #13; W2, W3, W4. **Placement:** `app/(setup)/_components/step-{7..12}-*.tsx`; the landscape as `components/landscape-chooser/` (it replaces `starter-set/`, which is deleted here — its `STARTER_HABITS` reader has no other consumer after this; `STARTER_HABITS` itself stays until DYN-21); screens 7, 9, 10 compose `BlockEditor embedded` or its list form; `user.completeFirstRun` amended to call `week.prefill`.

**Rulings to carry:** selection is a single commit (W4): a tick is the selection, the primary always *Continue*, counting; the Selected tab is where priority and length live; prep items default to priority 7 and hard; the fit screen never judges the 140; `overflow_mode` is written here; two primaries are not allowed on screen 12.

**Acceptance edges:** the landscape shows no minutes total anywhere; ticking 20 items and continuing works with no warning; the fit screen's sentence and rows appear only when the landscape exceeds the budget; *Plan this week first* lands on the pre-filled week; *Open today* lands on the orient route (or `/today` pre-DYN-13 — state which); `week.prefill` results match DYN-5 AC 1; the science line is one sentence with no citation; a journal prompt removed on screen 10 is absent from `journal_prompts`.

**Depends on:** DYN-10, DYN-8, DYN-5. **Model:** Opus.

---

## Batch 6

### DYN-13 — The orient frame and the wake moment

**Size:** M. **Slice type:** the waking state's one screen and the entry rule that puts it first. Risk class: *the app's voice on the frame* (any chrome sentence about the person) and *a wake stamped on the wrong day*.

**Outcome.** `/orient` (`orientRoute()`), rendered by `resolveEntry` before any tab whenever today's `woke_at` is null and the day is not closed (§5.1); opening it calls `day.setWakeTime({ source: "orient" })`. The frame per §5.2 verbatim: no header, no tab bar, no time; the *Last night* caption and date; the three journal lines in Newsreader with their prompts as `figcaption`s (*make happen tomorrow* re-tensed to today — the one transformation); the passage under *Every morning* when both exist or alone when no entry; *Nothing to read yet. Tonight's journal shows up here tomorrow.* on the first morning; the optional serif line *Grateful for, this morning* and *Today's intention*, autosaving to `days.morning_gratitude` / `intention`; one primary **Start the morning** → `/today`. The R18 line per its four rules (second consecutive skip only; ≤ once per seven days; no adjective, no question mark; off with the gratitude switch), computed by a pure `shouldShowSkipLine(history)` in `@syn/utils` from the last seven days' `morning_gratitude` nulls. The wake-anchor path is retired: `wake-anchor-switch` removed from the habit sheet, `users.wake_anchor_habit_id` no longer written, `DayView.wakeAnchorItemId` ignored by the List (column and field removed in DYN-21).

**v1.1 §:** §5.1, §5.2, §2 amendment 2, R11, R18, §13 #9. **Placement:** `app/(shell)/orient/page.tsx` (inside the shell's auth gate but rendering without the tab bar — a `PageFrame` variant `bare`), `components/orient-frame/{orient-frame.tsx,use-orient-frame.ts,copy.ts}`, `packages/utils/src/day/skip-line.ts`, `lib/entry/resolve-entry.ts`, `lib/routes.ts`, `apps/web/AGENTS.md`.

**Rulings to carry:** the frame is never shown twice for one day; if the app is first opened at 14:00 the frame still shows and stamps 14:00 (the pick's budget is then zero — honest); the frame is bare paper — no `StatusLine`, no pending-review line (those wait for `/today`); the person's words are the only second person; the chrome strings are exactly §5.2's; Sage's note is quoted in the ticket's *Why*.

**Acceptance edges:** cold open at 7:10 with `woke_at` null → `/orient`, `woke_at = 7:10, source = orient`; back does nothing; *Start the morning* with both fields empty writes nothing and lands on `/today`; a second open the same day → `/today`; a first morning shows the *Nothing to read yet* line, never blank paper; the journal lines are `blockquote`s with `figcaption`s; the R18 line appears on the second consecutive empty gratitude at the moment of tapping and not on the third; with `orient_ask_gratitude = false` neither the field nor the line exists; the habit sheet has no wake-anchor switch; a day auto-closed before the frame was opened → the next day's frame.

**Depends on:** DYN-5, DYN-7. **Model:** Opus — the entry rule interacts with day boundaries and auto-close, and the R18 line's four rules are a place a cheaper model writes a nudge.

### DYN-14 — The quick-pick and *Set the day*

**Size:** L. **Slice type:** the Today tab's unconfirmed state — the second screen of the waking state. Risk class: *a form every morning* (Crucible's first finding) and *a blank open*.

**Outcome.** When `day.confirmedAt` is null, `/today` renders `QuickPick` inside the shell per §5.3 verbatim: the `DayHeader` with *Not set yet*; sections **collapsed to one summary row each** with *Change* (Routine · 6 things · 68 min / Breakfast · meal-prepped / Push · after the routine / Focus · Viewpoint), expanding on tap; the **Last night** section first when `lastNight` is non-empty (`ConfirmYesterdayRows`); **Working today?** first on a *sometimes* day; the routine section as the daily menu (`CheckboxField`s pre-ticked to the budget, the sticky `BudgetLine` *68 chosen · 72 available*, *Shorten to fit* calling `day.previewFit`) or the variants `PickerList` with counts; prep's one-of segments; training's *Still · Swap* with the trade line and the placement `QuickChipRow` with *Not today* last; work's focus picker and, under *depends*, **Work waits · Routine gets cut**; fixtures read-only under *Already in place*; pinned primary **Set the day** (label carries the hard anchor: *Set the day · work 9:00*), ghost **Unstructured today**. Over budget → the `Dialog` *11 min over.* / **Set anyway** · **Adjust** (R7); an unplaced workout → primary *Choose a time for push*, disabled. *Set the day* calls `day.confirm` and the sections settle into the list (DYN-15's list; until then, USE-2's list renders the confirmed day's items from `blocks` flattened — state the transition).

**v1.1 §:** §5.3, §5.4, §3.9, §3.10, §7.3 (the section), R6, R7, R13, R14, R25, §13 #1. **Placement:** `components/quick-pick/{quick-pick.tsx,use-quick-pick.ts,sections/*.tsx,copy.ts}`; `app/(shell)/today/page.tsx` branches on `confirmedAt`; `day.quickPick`, `day.confirm`, `day.previewFit`.

**Rulings to carry:** nothing is live until confirmed; fixtures cannot be removed here; the budget line never changes colour; the over-budget dialog is the whole notice; *Unstructured today* is one tap; on a morning where nothing is different it is one tap; offline → the choices queue locally and *Set the day* is disabled with the standard line (Phase 1: block writes).

**Acceptance edges:** Monday opens with four collapsed rows and *Set the day · work 9:00*; one tap sets the day and the header reads *Monday 14 Sept · Viewpoint · Work 9:00*; expanding Routine and ticking one more turns the line to *83 chosen · 72 available* with no colour; *Set the day* then shows the dialog; *Set anyway* confirms; *Adjust* returns with *Shorten to fit* highlighted and applying it re-ticks to the floors; choosing meal-prepped changes the line's second number live; *Swap* → Legs shows *Trades with Tuesday's legs*; placement unset → the primary reads *Choose a time for push*, disabled; *Not today* enables it; a *sometimes* Saturday asks *Working today?* first and *No* collapses to the unstructured shape; *Last night* rows unticked become *not confirmed* on Set; a soft anchor reads *~9:11* in the dialog; at 200% the rows stack.

**Depends on:** DYN-13, DYN-6. **Model:** Opus.

---

## Batch 7

### DYN-15 — Today by block: the tab, the day header and its sheet, the item sheet's additions, the habit-day sheet

**Size:** L. **Slice type:** the execution tab re-sectioned and its two sheets extended. Risk class: *a number on the tab* and *configuration reachable from the tab beyond the one designed exception*.

**Outcome.** `/today` (confirmed) and `/day/{date}` per §6.1 verbatim: `DayHeader` with the focus and the anchor as a plain time (*Viewpoint · Work 9:00*, *~9:00* when soft, R17) and *Woke 7:12* when it differs; `BlockHeader` sections in block order with computed spans; `ItemRow`s as v1 §5.2 with the pin glyph and the chosen one-of title; the work block as a `container` row with nested fixtures, split into two rows around training; the now dot; the not-assigned expander; **Day Complete**. Day parts are no longer rendered (R20). The day header sheet (§6.2): **Adjust the day · Set wake time · Add from the library · Edit today · Add a one-off** (the row set per day state; *Add from the library* first on an unstructured day; *Adjust the day* opens DYN-17's sheet — until it ships, the row is absent, state which). The item sheet (§6.3): **Do now** in the footer with the one-line overflow sentence and *Do now anyway* / *Adjust instead*; **Edit today's** ghost in the header → the `HabitDaySheet` (§6.4: *Takes* with the range as muted text, *At* stack/clock, *Priority today*, *Leave out today*, *Changes the day, not the habit.* with *Also change the habit*); the one-of segment for alternates members; *Not today* exactly as v1. `Add from the library` opens the library filtered to the day's block kinds and adds a habit-day item into the block the person picks.

**v1.1 §:** §6.1–§6.4, §7.1 (the wind-down rows' `confirm-later` caption and the devices-off hairline row render here; the journal row opens DYN-18's screen — until then, nothing), §10.1, R17, R20, R21, §13 #1. **Placement:** `components/day-list/` amended (block sections, container row, header); `components/day-header-sheet/` amended; `components/item-sheet/` amended; `components/habit-day-sheet/` new; `app/(shell)/today/page.tsx`, `day/[date]/page.tsx`.

**Rulings to carry:** no count, percentage, countdown, or red; the tab reaches configuration only through the day header sheet's rows and the item sheet's *Edit today's*, which edit the day never the library; `deriveItemState` is the only state source; the container row has no checkbox and is never scored; `parts` is no longer read (DYN-21 removes it).

**Acceptance edges:** Monday confirmed shows five `BlockHeader`s in order with spans; the work row nests the stand-up on Tuesday; *inside work* shows two work rows around Push; the header reads the plain time; *Do now* on breath work at 7:50 moves and starts it and slides the rest; *Do now* overflow shows the one line and both buttons; *Edit today's* saves 90 min on a 10–30 habit; *Leave out today* moves it to the expander with *Bring back*; the one-of segment re-flows prep; *Not today* still collapses to the block's bottom and the review still asks; the wind-down rows after 22:15 have no checkbox and carry the caption; the devices-off row is a hairline with the glyph; an unstructured day shows header, orient, wind-down, fixtures, and the two actions; a closed day is record mode with no *Do now*; keyboard per cross-cutting §3.2 still works across block sections.

**Depends on:** DYN-14. **Model:** Opus.

### DYN-16 — The Schedule, editable

**Size:** L. **Slice type:** direct manipulation on the time axis. **Does not gate.** Risk class: *a slip of the thumb moving a fixture* and *a drag with no keyboard path*. **Vesper review:** the lifted state, the re-stack preview, the refused line, the move mode.

**Outcome.** `/today/schedule` and `/day/{date}/schedule` per §6.5 verbatim: `BlockBand`s behind items with the kind in the gutter; the work band splitting around training; slack bands labelled in the gutter; `DragLayer` wired — long-press lifts an item, 5-min snap, the displaced re-stack beneath, drop writes `item.move`; a band-header drag writes `day.moveBlock`, and on the **morning** band opens Adjust instead (DYN-17's sheet with `entry: band-drag` — until it ships, the plain move, state which); bottom-edge drag writes `item.editToday({ durationMin })`; a pin or fixture does not lift and instead a `ConfirmDialog` *Move Dentist to 3:15?* — **Move** · **Cancel** → `item.move({ confirmed: true })`; a refused drop returns the block with the one-line `StatusLine` *Fixed things don't move by drag*; **Edit today** from the day header sheet enters an explicit move mode (tap to lift, tap to drop) for people who cannot long-press; keyboard: Alt+↑/↓, Shift+↑/↓, `m` then a time; announcements on lift/drop; record mode: no drag layer; plan mode: drag allowed, no ghosts, no now line.

**v1.1 §:** §6.5, §10.1 (lifted, refused, slack), §10.4, R22, R23. **Placement:** `components/schedule-canvas/` amended (`layout.ts` gains bands and slack); `components/day-header-sheet/` (*Edit today* row → move mode). **Rulings:** the service refuses pins regardless (DYN-6); the UI's dialog is the second guard; dropping on an occupied time inserts, never multitasks; the ghost appears only after the original time passes; the morning band drag goes to Adjust because moving the morning is a decision with a reason.

**Acceptance edges:** drag read to 8:07 → 8:05, the rest re-stacked, no overlap, no ghost until 8:07 passes, then a ghost; drag the stand-up → the dialog; *Cancel* leaves it; *Move* moves it with the glyph; drag the morning band → the Adjust sheet (or the plain move pre-DYN-17); resize below the floor → allowed; keyboard-only completes a move and a resize; move mode by two taps; reduced-motion: no scale; 150% text → 30-min hairlines (v1 §11) still hold with bands; record mode has no drag.

**Depends on:** DYN-15, DYN-6. **Model:** Opus — the drag layer's semantics against pins and the two modes.

### DYN-17 — Adjust: the one sheet for slept in, ran long, something came up

**Size:** L. **Slice type:** the day's one reasoned mutation, replacing two v1.0 sheets. Risk class: *detection* (an offer that infers lateness from taps) and *a scored word in the sheet* (*late*, *behind*, *counts half* — the tier's words live in Review only). **Vigil:** the doesn't-fit-even-cut path, the stale-apply `CONFLICT`, the 10 s undo, the band-drag entry.

**Outcome.** `components/adjust-sheet/` per §6.6 verbatim: `ResponsiveSheet size="tall"` with four steps expanding beneath each other — **What happened** (`QuickChipRow` of the reason set, preselected by entry: *Slept in* from the late-wake offer, *Ran long* from the header row, *Something came up* from a one-off's sheet), **What gives** (`LargeTargetRow`s ordered by anchor direction; *Start work later* skips step 3), **How** (*Shorten everything* · *Cut some* · *Choose what stays* with `CheckboxField`s and the `BudgetLine`), **The proposal** (the compact list with new lengths and times, *Not assigned today* with *Keep instead*, the one sentence *Fits. Work at 9:00.* / *Work moves to 9:40.*, primary **Set · 2 not assigned** / **Set · work 9:40**, secondary **Cancel**); the 10 s undo toast. Entries: the day header sheet's row; the Schedule's morning band drag (`entry: band-drag` with the delta preset as *Start work later* when soft); a one-off's sheet; and the **late-wake offer** — one dismissable `StatusLine` *Up later than planned · Adjust the morning* shown once when the orient frame opened more than `LATE_WAKE_OFFER_MIN` after the wake target **and** the day was set the night before with a hard anchor (§6.6 — never on an unset day, because the pick already reflects the wake). The shift and trim sheets' entries are removed from the day header sheet here; the components are deleted in DYN-21.

**v1.1 §:** §6.6, §2.3, R4, R7, R8, R12, §13 #1. **Placement:** `components/adjust-sheet/{adjust-sheet.tsx,use-adjust.ts,steps/*.tsx,copy.ts}`; `components/day-header-sheet/`; `components/page-frame/shell-status-line.tsx` (the `late-wake-offer` variant); `adjust.preview/apply/undo` (DYN-6).

**Rulings to carry:** the reason chip's tier travels but its words (*counts half*) never appear in the sheet; the scope sentence names *the morning* / *the evening*; *doesn't-fit-even-cut* reads *Nothing soft is left to cut. Work runs to 9:20 on this plan.* and **Set is allowed**; pins and fixtures are reported, never moved (*Stand-up 9:30 stays; the walk doesn't fit before it*); the offer never repeats that day and never appears on an unset day.

**Acceptance edges:** every entry preselects its reason; a hard anchor shows only *Keep work at 9:00*; *Start work later* skips step 3 and the proposal says *Work moves to 9:40*; *Shorten everything* reaches the floors then cuts; *Keep instead* swaps the next-lowest; the stale case shows *Couldn't adjust. Nothing changed — try again.* and a fresh preview; undo within 10 s restores cuts and slides (durations per DYN-6's provisional default and the toast says so); the late-wake offer appears once at 7:45 on a hard-anchor day set last night, not on an unset day, not twice; the sheet contains none of the never-said words (§12.3 — grep the `copy.ts`); offline → disabled with the line.

**Depends on:** DYN-15, DYN-6. **Model:** Opus.

---

## Batch 8

### DYN-18 — The evening: the wind-down section, the journal, confirm-yesterday in the review, Settings → Closing the day

**Size:** L. **Slice type:** the winding-down state's surfaces — the lowest-willpower hour. Risk class: *a nag* (any pressure on an empty journal) and *a fabricated record* (a pre-ticked confirm). **Sage's lens** is quoted in the ticket.

**Outcome.** The journal screen at `/day/{date}/journal` (`journalRoute(date)`) per §7.2 verbatim: back and the date, paper, six prompts as captions over serif autogrow `Textarea`s, `SaveStatus` *saved* in caption size, no finish button, no timer, no count; the wind-down row *Journal* ticks itself when any field has text; read-only for past days from Review. The wind-down section on Today per §7.1 (rows after devices-off with the *confirm in the morning* caption — DYN-15 renders them; this ticket wires the journal row and the push landing). The confirm-yesterday panel as the first section of the Day Review when unconfirmed items exist (§7.3; `ConfirmYesterdayRows`; writes through `review.decide`'s new `confirm` kind or `day.confirm`'s `lastNight` — one path, DYN-5's). **Settings → Closing the day** (the first-run screen 10, frame-less, under Your day — DYN-8 lists it; this ticket makes the prompt editor live there too). The wind-down starter library through `habit.createFromStarterLibrary`.

**v1.1 §:** §7.1–§7.3, §12.3, R15, R16, §13 #3. **Placement:** `app/(shell)/day/[date]/journal/page.tsx`; `components/journal/{journal-screen.tsx,use-journal.ts,copy.ts}`; `components/confirm-yesterday-panel/` (shared with DYN-14's section — one component, `QuickPick` and `DayReview` both import); `components/review-day/` amended; `lib/routes.ts`; `apps/web/AGENTS.md`.

**Rulings to carry:** an empty journal night is nothing, not pending; no push for the journal; the prompts are the person's (editable) and the app supplies no starter phrase; the panel is never pre-ticked and never asks a reason; *not confirmed* is excluded and visible.

**Acceptance edges:** typing in one field saves it alone (a second device's other field survives — the jsonb merge); leaving mid-line keeps the text; the wind-down *Journal* row is done when any field has text and undone when all are cleared; the review's panel appears only with unconfirmed items and disappears after; unticked → `not_confirmed` and the review header's plain words include them; a past day's journal is read-only serif; the R18 line's source data (`morning_gratitude`) is untouched by this ticket; offline → local save with the line.

**Depends on:** DYN-15, DYN-14. **Model:** Opus.

### DYN-19 — Review amended

**Size:** M. **Slice type:** existing review surfaces re-pointed at blocks and the journal. Risk class: *synthesis* (a summary over the journal) and *a scored container*.

**Outcome.** Day Review per §8.1: undone items grouped under `BlockHeader`s; the confirm-yesterday panel first (DYN-18); *3 moved* in the header's words and *planned 7:20 · done 7:52* per moved panel; *shortened* as a line on items Adjust shortened (`shifts.shortened_item_ids`); the work block as one unscored line; the intention in serif under the date (§13 #10). Week Review per §8.2: the counts line as information (*Morning A 2 of 2 · Menu 3 · Viewpoint 2 of 2 · … · 2 not confirmed*); **time by block** (a stacked bar in the neutral scale with minutes beside each segment) above **time by category** (kept, R10); **Reflections** in serif listing *Grateful for today* and *Looking forward to* verbatim, dated, no synthesis, empty state *Nothing written this week.*; the strip's *not confirmed* square. Export adds `day_blocks.csv`, `fixtures.csv`, `journal_entries.csv` and the new columns to the JSON.

**v1.1 §:** §8.1, §8.2, §10.3, R10, R16, §13 #10; v1 §7.3–7.4 stand. **Placement:** `components/review-day/`, `components/review-week/` amended; `services/review/{get-review-day,get-review-week}.ts`; `packages/utils/src/review/strip.ts` (the state); `services/user/build-export.ts`. **Rulings:** the resolver is untouched — `not_confirmed` is excluded like `not_assigned`; the container is never scored; Reflections is verbatim, chronological, in the person's words. **Edges:** a day with a split work block shows one work line; a refit's cuts show *Change* like a shift's; the block bar's segments carry minutes as text; a week with no journal shows the empty line; the strip announces *Tuesday, not confirmed*; the export zip contains the three new files. **Depends on:** DYN-18. **Model:** Sonnet — the mechanisms are settled; the risk is coverage.

---

## Batch 9

### DYN-20 — Notifications revised

**Size:** M. **Slice type:** the scheduler's catalogue and timing. Risk class: *a push before the pick* and *payload privacy*. **Vigil:** enqueue-at-pick (no N1a/N1b before `confirmed_at`), grouping, quiet after Day Complete, payload text per §8.1.

**Outcome.** Per §9: `block_start` (N1a, on) at each block's `scheduled_start` after the pick — prep, training when placed, work (the anchor), break, activity's first fixture, wind-down — in the person's words (*Before work · 8:15*, *Work · 9:00*, *Wind-down · 22:00*); `item_start` (N1b) opt-in **per block** (`notification_prefs.block_kind`) via a group of toggles under *Every item in…*; `fixture_start` (N1c, on) enqueued at week build; `devices_off` (N1d, off) *Phone away · 22:15*; no wake push, no orient push, no journal push. `enqueueBlockPushes` (DYN-5's stub) filled; the four v1.0 jobs re-pointed; `notify.ts` gains the three jobs; `build-payload.ts` gains the three sentences; ST-07 renders the new rows and the per-block group. N4–N8 unchanged.

**v1.1 §:** §9.1–§9.3, R19; v1 §8.1, §8.3, §8.5, §8.6 stand. **Placement:** `services/notifications/{block-pushes,build-payload,fan-out,list-prefs}.ts`, `services/jobs/notify.ts`, `run-scheduled-jobs.ts`; `components/…/notifications-screen.tsx`; `NOTIFICATION_CATALOGUE` (DYN-1). **Rulings:** nothing enqueues for a block before `confirmed_at`; fixtures enqueue at build; exactly-once stays a unique constraint; every sentence is a time the person set. **Edges:** an unconfirmed day at 9:00 fires only a fixture's push; confirming at 7:03 enqueues prep/work/wind-down for today only; *Not today* on training enqueues nothing for it; `item_start` on for *prep* only fires for prep items; devices-off off by default; quiet after Day Complete holds; grouping collapses same-minute block and item pushes into one; payloads contain no miss, count, or second person. **Depends on:** DYN-14, DYN-18. **Model:** Opus — a privacy surface with a timing rule.

### DYN-21 — Migration `0006` and the retirements

**Size:** M. **Slice type:** cleanup — a one-way door that removes the old model. Risk class: *removing something still imported* and *dropping before backfill*. **Mason migration review.**

**Outcome.** Migration `0006`: drop `template_slots.offset_start_min/offset_end_min`, `days.template_id`, `users.wake_anchor_habit_id` (and its index); `day_items.day_block_id SET NOT NULL` (after verifying `backfillBlocks` left none null — the migration asserts with a `DO` block that raises if any remain); null `templates.anchor_time` for non-work kinds; `shifts.undo_snapshot jsonb` **if** DYN-6's `[NEEDS DECISION]` resolved to (a), and Adjust's undo then restores durations. Code retirements: `apply-shift.ts`, `apply-trim.ts`, `shift-fit.ts`, `undo-shift.ts`, the `shift` router, `utils/day/{shift-fit,trim,day-parts}.ts`, `DayPartHeader`, `DayView.parts`, `DayView.wakeAnchorItemId`, `HabitSummaryView.isWakeAnchor`, `STARTER_HABITS` and `starter-set.ts`, `components/{shift-sheet,trim-sheet,starter-set}/`, `settingsTemplatesRoute`/`settingsTemplateRoute` and their redirects (the routes are removed; `apps/web/AGENTS.md` rows removed), `SameStartError` remnants, the `TEMPLATE_OFFSET_MIN` constant, `WokeAtSource` `anchor` (kept in the enum — historical rows carry it; only the writer is gone), the deprecated comments from DYN-2/3. `SCHEMA_REFERENCE.md`, the directory map, the route table, and `docs/ux/README.md`'s v1 line regenerated/updated.

**v1.1 §:** §11.12, §0.4, R11, R20, §12.2 (retired words). **Placement:** `packages/db/migrations/0006_*.sql` + `meta/`; every file named above. **Rulings:** nothing is removed that any file still imports (`yarn lint:boundaries` and `yarn check-types` are the proof); the migration asserts the backfill before the `NOT NULL`; **stop before any hosted tier**; Taylor runs `backfillBlocks` on hosted tiers **before** `0006` — the ticket's kickoff says so and `docs/developer-guides/migrations.md` carries the order. **Edges:** `0006` on a database with one null `day_block_id` raises and applies nothing; after `0006`, `grep -rn "offsetStartMin\|dayPartOf\|computeShiftFit\|STARTER_HABITS\|wakeAnchor" packages apps` returns nothing; every route in `apps/web/AGENTS.md` has a builder and every builder a row; the four commands pass; `yarn directory-map` and `yarn db:schema-reference` regenerated. **Depends on:** DYN-9, DYN-16, DYN-17, DYN-19, DYN-20. **Model:** Opus — the migration's assertion and the retirement's completeness are the whole ticket; a cheaper model drops the column and leaves a reader.

---

## What the next authoring thread needs

1. This file, `README.md`, `00-build-order.md`, `TECHNICAL-DECISIONS.md` (TD-1…9), and the six full tickets (for shape and for the service names each screen calls).
2. v1.1 in full — every screen ticket quotes its walk-through.
3. The `[NEEDS DECISION]` from DYN-6 (Adjust's undo of durations) resolved by Taylor or Mason before batch 7 is written; the provisional default (b) is in force until then.
4. `[NEEDS VALUE AT BUILD]` in DYN-7: where `StepFrame` lives today — read the tree, don't assume.
5. Three tickets per thread; DYN-7 alone; split permission granted in advance for batch 7 (DYN-15 alone, then DYN-16 + DYN-17).
