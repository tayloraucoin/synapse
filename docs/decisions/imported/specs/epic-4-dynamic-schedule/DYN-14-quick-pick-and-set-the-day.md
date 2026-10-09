# DYN-14 — The quick-pick and *Set the day*

**Epic:** DYN — Dynamic schedule (UX v1.1) · **Phase 1** · Size: L
**Slice type:** The Today tab's unconfirmed state — the second screen of the waking state. The risk class is *a form every morning* (Crucible's first finding: the sections must be collapsed to one summary row each, so the common morning is one tap) and *a blank open* (a section that renders with no default answered).
**Vigil:** none. **Vesper review:** the collapsed rows against §5.3's four examples; the budget line never changes colour; the over-budget dialog is the whole notice; *Unstructured today* is one tap.

**Status:** Complete (2026-09-13 — authored and built in one thread, with DYN-13; `components/quick-pick/` with its six sections and `use-quick-pick.ts`, the Today page branching on `confirmedAt`, `ConfirmYesterdayPanel` as its own folder; the four root commands pass; the browser walk is blocked at sign-in — logged in `DEVIATIONS.md`)

**Owner:** Reeve (spec) → dev (build) · **Reviewer:** Vesper (the sections by eye), Mason (`day.confirm`'s inputs from each section; the budget line against `day.previewFit`)

## Outcome

When today's `confirmedAt` is null, `/today` renders `QuickPick` inside the shell, per §5.3 verbatim: the `DayHeader` reading the date and *Not set yet*; **every section collapsed to one summary row** with *Change* as ghost text (*Routine · 6 things · 68 min* · *Breakfast · meal-prepped* · *Push · after the routine* · *Focus · Viewpoint*), opening only when tapped; **Last night** first when yesterday has unconfirmed wind-down items (`ConfirmYesterdayPanel`, nothing pre-ticked); **Working today?** first on a *sometimes* day; the routine as the daily menu (`CheckboxField`s pre-ticked to the budget, the sticky `BudgetLine` *68 chosen · 72 available*, *Shorten to fit* through `day.previewFit`) or the variants `PickerList` with counts; prep's one-of segments; training's *Still · Swap* with the trade line and the placement `QuickChipRow` with *Not today* last; work's focus picker and, under *depends*, **Work waits · Routine gets cut**; fixtures read-only under *Already in place*; pinned primary **Set the day** (*Set the day · work 9:00* when the anchor is hard), ghost **Unstructured today**. Over budget on *Set the day* → the dialog *11 min over.* / **Set anyway** · **Adjust** (R7); an unplaced workout → the primary reads *Choose a time for push* and is disabled. *Set the day* calls `day.confirm` and the page re-renders as the list — USE-2's list over the confirmed day (it reads `parts`, which `getDay` still populates) until DYN-15 renders by block. After this ships, **DYN-15 has a confirmed day to render, DYN-17's Adjust has a set day to re-lay, and DYN-20 has the moment its pushes enqueue.**

## Why / intent

- **§5.3** — *"Confirm today with the defaults already in place, swapping only what's different about today — three taps, then the list … Every section is collapsed to one summary row … a section opens only when tapped. So the common morning is a glance down four rows and one tap on Set the day … [It must never] open blank. Ask a question that was already answered on Sunday. Refuse to set the day (except an unplaced workout, §3.7, which is one chip away). Show a percentage. Use the word late."*
- **R6, R7** — the unconfirmed Today tab is the quick-pick, not a modal; over budget is a dialog with two answers, never a refusal.
- **R13, R14, R25** — the one-of segments, *Still · Swap*, the trade line.
- **§7.3** — *Last night* is the first section, none pre-ticked; unticked items become *not confirmed* on Set.
- **§3.9, §3.10** — *Working today?* on a *sometimes* day; the overflow mode decides the routine section's shape.
- **§13 #1** — only Adjust carries a reason; the pick carries none.
- **Ground truth (consumed, never rebuilt):** DYN-5's `day.quickPick` (`QuickPickView`, every section already answered), `day.confirm` (`confirmDayInput`, every field optional), the refusals (`workout_unplaced`, `trade_day_set`); DYN-6's `day.previewFit`; DYN-7's `BudgetLine`, `QuickChipRow`, `CheckboxField`, `PickerList`, `SegmentedControl`, `DayHeader`, `ConfirmDialog`; DYN-13's frame before it; the existing `DayList`/`DayListHeader` for the confirmed state.
- **What this slice is NOT (binding):** the Today tab by block and the post-pick header line *Monday 14 Sept · Viewpoint · Work 9:00* (DYN-15); Adjust proper (DYN-17 — *Adjust* here returns to the list with *Shorten to fit* highlighted); the pushes (DYN-20); offline queuing of choices (Phase 1 blocks writes: *Set the day* is disabled offline with the standard line); the 200 ms settle into the list (a swap).

**Rulings this slice makes (labelled, logged):**

- **Every section is a summary row until tapped.** One `ListRow` per section: the summary on the left, *Change* as ghost text on the right; tapping toggles the section open. The summary is computed from the section's current answer (*Routine · 6 things · 68 min*, *Breakfast · meal-prepped*, *Push · after the routine*, *Focus · Viewpoint*, *Working today? · Yes*). A section with nothing to ask (§5.3: a locked routine, one focus, no training) is not rendered. Logged.
- **The budget line is live from the pick's own arithmetic.** `chosenMin` is the sum of the ticked items' lengths (after any *Shorten to fit*); `availableMin` is the section's, adjusted live by the prep choice: choosing a shorter one-of member adds the difference (§5.3: *68 chosen · 92 available*). No colour states. Logged.
- ***Shorten to fit*** calls `day.previewFit({ date, habitIds: ticked, durations, mode: "shorten_then_cut" })` and applies `keep` as the new lengths and un-ticks `cut`; the line updates. It is a ghost row under the list, highlighted (`aria-current`) when *Adjust* returned the person to it. Logged.
- **The over-budget dialog is `ConfirmDialog`** — *11 min over.* / *Everything you ticked is on the list. The routine runs to 9:11 on this plan.* (*~9:11* with a soft anchor) — **Set anyway** · **Adjust**. Logged.
- **`confirmDayInput` carries only what the person changed,** plus the menu's ticks and lengths (the service cannot know the ticked set) and the training answer when the section exists (the placement is required unless *Not today*); *Unstructured today* is `{ date, shape: "unstructured" }`; a *sometimes* day's *No* is `{ workingToday: false }`. Logged.
- **`ConfirmYesterdayPanel` is a feature folder** (`components/confirm-yesterday/`) because the Day Review (DYN-19) mounts the same rows; here its ticks ride in `lastNight.doneItemIds`. Logged.
- **The primary's disabled state is the unplaced workout's only**: with a training section, a workout, and no placement chosen and not *Not today*, the label reads *Choose a time for {workout}*; nothing else disables it (except offline). Logged.
- **The confirmed state is the existing list.** `today/page.tsx` reads `day.get` on the server and branches: `confirmedAt === null` → `QuickPick` (client, `initialData`); else `DayList` as today. Logged.

## Experience & states

### `/today`, unconfirmed — `components/quick-pick/`

`DayHeader` with the date and *Not set yet* as its second line (no `onOpen`). Then the sections, in this order, each a summary row that opens: **Last night** (only when non-empty; open by default because it is a question with no default), **Working today?** (only on a *sometimes* day; *Yes · No* as a `SegmentedControl`; *No* hides every structured section), **Routine** (daily menu: `CheckboxField` rows with the length on the right, the highest-priority pre-ticked to the budget, the sticky `BudgetLine`, the ghost *Shorten to fit*; variants: a `PickerList` with *Morning A · 1 of 2 left*; `auto_trim`: the section is absent — the routine is locked), **Before work** (one `SegmentedControl` per one-of — *Meal-prepped 10 · Cook it 30*), **Training** (*Monday's is push* · **Still · Swap**; *Swap* reveals the rotation's other workouts as a `PickerList` with *Legs · 1 of 1 left*; choosing shows *Trades with Tuesday's legs*; **When** as a `QuickChipRow` — *Before the routine · After the routine · Inside work · After work · Not today* — the last placement preselected), **Work** (*Focus* as a `PickerList` with the week's assignment preselected; under *depends*, **Work waits · Routine gets cut**), and **Already in place** (fixtures, read-only, no summary row). Pinned: **Set the day** (*Set the day · work 9:00* when hard), ghost **Unstructured today**. States: unconfirmed · setting · over (the dialog) · workout-unplaced · offline · fixtures-only (an unstructured day: the header, the fixtures, and the two primaries the list already has — **Add from the library** and **Add a one-off** are DYN-15's; here *Set the day* alone).

**Failure / edge states:** `day.confirm` refuses *workout_unplaced* → the primary was already disabled; the sentence shows if it arrives · *trade_day_set* → the sentence under the training section · a *closed* day → the sentence and the primary disabled · `previewFit` fails → the line keeps its numbers and the ghost row shows the error line · no work start on the profile → `availableMin` 0, the line reads *68 chosen · 0 available*, no colour, no refusal · nothing on the account (no templates, no habits) → the header, *Already in place* empty, *Set the day* alone.

## Non-negotiables (this slice)

- **Nothing is live until confirmed.** No write before *Set the day* except `previewFit` (a read).
- **Fixtures cannot be removed here.**
- **The budget line never changes colour.**
- **The over-budget dialog is the whole notice.** No toast, no second line.
- ***Unstructured today* is one tap; a morning where nothing is different is one tap.**
- **No percentage; never *late*.**
- **No new `@syn/ui` component.**

## Data & AI

**Schema changes: none.**

**Tables:** none directly — `day.confirm` writes `days`, `day_blocks`, `day_items` (DYN-5).

**Placement:** `apps/web/components/quick-pick/{quick-pick.tsx,use-quick-pick.ts,summary-row.tsx,sections/{last-night,working-today,routine,before-work,training,work,fixtures}.tsx,copy.ts,index.ts}`; `apps/web/components/confirm-yesterday/{confirm-yesterday-panel.tsx,copy.ts,index.ts}`; `app/(shell)/today/page.tsx` (the branch); `app/(shell)/today/_components/today-screen.tsx` (the client switch after confirm). Rule 9 (app-local composition), rule 2 (composites from `@syn/ui`).

**tRPC / validators:** existing — `day.quickPick`, `day.confirm`, `day.previewFit`, `day.get`.

**AI notes:** **None.**

**Instrumentation:** none.

## Accessibility

- Each summary row is a button with `aria-expanded`; the section it opens is labelled by the row.
- The budget line is `aria-live="polite"` (DYN-7's debounce).
- The menu's checkboxes are labelled with the title and the length (*Meditate, 15 minutes*).
- The placement chips are a radio-like group with `aria-pressed`; *Not today* is last.
- The dialog traps focus; *Set anyway* is the default action; *Adjust* returns focus to *Shorten to fit*.
- 200% text: the summary rows wrap to two lines; the segments stack.

## Acceptance criteria (observable — local tier, a pre-filled Monday; `yarn web:dev`)

1. `/today` on an unconfirmed Monday shows the header *Monday 14 Sept · Not set yet*, four collapsed rows (*Routine · n things · m min*, *Breakfast · meal-prepped*, *Push · after the routine*, *Focus · Viewpoint*), *Already in place · Stand-up 9:30*, and *Set the day · work 9:00*. *(Vesper.)*
2. One tap on *Set the day* confirms: `days.confirmed_at` set, the morning block's items materialised from the ticks, the training block placed, `original_scheduled_start` written; the page shows the list. *(Mason.)*
3. Expanding Routine and ticking one more turns the line to *83 chosen · 72 available* with no colour change; *Set the day* shows *11 min over.* / **Set anyway · Adjust**; *Set anyway* confirms; *Adjust* returns with *Shorten to fit* highlighted; applying it re-ticks to the floors and the line reads at or under 72. *(Vesper, Mason.)*
4. Choosing *Meal-prepped 10* over *Cook it 30* turns the line's second number to 92, live. *(Vesper.)*
5. *Swap* → *Legs* shows *Trades with Tuesday's legs*; with no placement the primary reads *Choose a time for legs* and is disabled; *Not today* enables it. *(Vesper.)*
6. A *sometimes* Saturday shows *Working today?* first; *No* collapses to the unstructured shape and *Set the day* writes `shape = unstructured`. *(Mason.)*
7. With unconfirmed wind-down items from last night, the *Last night* section is first with none ticked; ticking one and setting the day writes `done`; the unticked become `not_confirmed`. *(Mason.)*
8. *Unstructured today* sets the day with orient and wind-down only, in one tap. *(Mason.)*
9. Offline: *Set the day* disabled with the standard line; nothing writes.
10. `grep -rn "late\b\|%" apps/web/components/quick-pick/copy.ts` returns nothing.
11. `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` pass (four separate commands).

## Likely-relevant technical notes (ADVISORY — dev decides)

- `QuickPickView.routine.menu.items[].ticked` is the pre-tick; the section's state starts from it and diverges locally.
- The live *available* adjustment for a one-of choice is `availableMin + (defaultMember.durationMin − chosenMember.durationMin)` summed over groups — the same subtraction `computeBudget` would make on the prep total.
- `day.confirm`'s `routine.menuHabitIds` is the ticked set in tick order; `menuDurations` only for lengths *Shorten to fit* changed.
- The dialog's *runs to 9:11* is `anchor.clock` plus `chosenMin − availableMin` minutes — `formatClockFromMinutes(clockToMinutes(anchor) + over)`.

## Dev's call

Whether the *Last night* section starts open (yes — it has no default) · the summary row's exact separator (the middle dot) · whether *Already in place* is a section or a caption (a caption over rows; no summary row).

## Out of scope

- **The Today tab by block, the post-pick header, *Add from the library* / *Add a one-off* on an unstructured day** — DYN-15.
- **Adjust** — DYN-17.
- **Pushes** — DYN-20.
- **Offline choice queuing** — Phase 2.

## Depends on

- **DYN-13** — the frame before the pick. Complete in `PROGRESS.md`.
- **DYN-6** — `day.previewFit`. Complete in `PROGRESS.md`.

## Recommended execution

**Opus.** Six sections with different answer shapes feeding one write; a cheaper model renders them expanded and makes a form.

---

### Kickoff (paste into the session)

> Build **DYN-14 — The quick-pick and Set the day** (attached spec). Model: **Opus**. **Every section collapsed to one row; nothing live until confirmed; the budget line never changes colour; the dialog is the whole notice; one tap on an ordinary morning.**
> Attach/read first, in order: this spec · v1.1 §5.3, §5.4, §3.9, §3.10, §7.3, R6, R7, R13, R14, R25 · `apps/web/AGENTS.md` · root `AGENTS.md` · DYN-5 (`quick-pick.ts`, `confirm-day.ts`, `confirm.ts`) · DYN-6 (`preview-fit.ts`) · DYN-7 (`BudgetLine`, `QuickChipRow`) · this track's `DEVIATIONS.md` + `TECHNICAL-DECISIONS.md`.
> Walk the pick in the browser on a pre-filled Monday. Close in three places; log departures in `DEVIATIONS.md`. Run `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` as separate commands.
