# DAY-2 — The fix batch, the screens: the workout card that never remounts, *Usual days* kept, created order for setup lists, the ranked screen in place with the matters cell, the `Select` on screen 2, the focus card's alignment, the passage card centred, `loading.tsx` and pending primaries

**Epic:** DAY — The first run built day-first (UX v1.3) · **Phase 0** · Size: M
**Slice type:** Defect fixes and small amendments across the v1.2 first-run screens, composed from DAY-1's composites. The risk class is *a fix that moves the defect* (a card that no longer remounts but loses its queued write), *a sort that changes the library's order too*, and *a loading state that hides the data it waits for*.
**Vigil:** **Induce the remount.** Throttle the network to Slow 3G; on screen 10 add a workout, type a name, tab out, and pick *Gym or studio* before the create returns; confirm the card stays open, *Usual days* keeps its chips, and exactly one `habits` row exists. Repeat on screen 12 with a focus. State the throttle used and the row counts.

**Status:** Complete (2026-09-25)

> **Mason — write audit.** `SetupCards` keeps the draft card mounted across its first write: the card's `habit` prop updates from null to the created row on the same instance; nothing re-keys. `listHabits` gains an `order` option; the library's default order (`compareForLibrary`) is unchanged for every caller that does not pass it. The new `loading.tsx` renders no data and reads no cookie.

---

## Outcome

The v1.2 first run stops misbehaving in the eight places Taylor found, without waiting for the restructure: a workout or focus card stays open through its first write and *Usual days* keeps what was chosen; workouts and focuses list in the order they were created; the ranked screen's cards collapse where they are, to two lines with the matters cell, and the page does not jump; screen 2's five selects are the anchored `Select` primitive with an `InfoDisclosure` beneath; the four setup cards collapse to two lines; the focus card's glyph aligns with its input; a saved passage's handle, title and menu sit on one line; every `/setup/*` transition shows the frame's skeleton and the primary shows pending while the next screen loads. After this ships, **the build Taylor tests during the restructure is the fixed one.** The restructure itself (five screens, the builder's movements) is DAY-8…DAY-11.

## Why / intent

- **T10.1, T10.2 (v1.3 §10.2 `WorkoutSetupCard` "never remounts on its first write")** — the cause: `SetupCards` in `apps/web/app/(setup)/_components/step-10-training.tsx` renders a draft card keyed `draft-N`; when `onCreated` fires and the row lands in `rows`, the `useEffect` drops the draft and the row's card mounts with `initiallyOpen={habit === null}` (false), collapsing it; the remounted card rebuilds its draft from the server row, where `typicalDays: []` reads as *Flexible*. The fix keeps one card instance per draft for the life of the screen.
- **T10.3 (v1.3 R65)** — *"Workouts and every setup list read in created order."* `listHabits` sorts by category then title (`compareForLibrary`); setup asks for `order: "created"`.
- **T9.2 (v1.3 R58)** — *"Cards keep their order. Done collapses in place; focus stays where the card was."* The cause: `step-9-ranked.tsx` renders `[...open, ...done]` and `HabitSetupCard` moves focus to its *Edit* after collapsing, so the sunk card's *Edit* at the bottom is where the page scrolls.
- **T9.3 (v1.3 R59)** — the collapsed ranked card: *"glyph · the matters cell · title · Edit; beneath, the caption usually 12 min · quick 5"*.
- **T3.3 (v1.3 R57)** — every setup card's collapsed state is `CardSummary`.
- **T2.1, T2.3 (v1.3 §4.3)** — the `Select` primitive; the `InfoDisclosure` with the four v1.2 lines (the fifth, *Usually*, arrives with DAY-8 — this ticket keeps four values).
- **T9.1 (v1.3 R62)** — the cards stop passing `step`.
- **T12.1** — `FocusSetupCard`'s header is `items-end` and the first card's helper line pushes the input up; align the glyph slot to the input's box, not the header's bottom.
- **T6.1** — `PassageCard` is `items-start`; centre the handle, thumbnail and menu on the first line.
- **T10.4, T13.1 (v1.3 R63)** — `app/(setup)/setup/[step]/page.tsx` is a Server Component awaiting `api.user.me()` and, on some steps, a list; there is no `loading.tsx`; `StepFrame`'s primary calls `router.replace` with no pending state.
- **T13.2** — the `SearchField` padding is DAY-1's; the landscape chooser only needs to pick it up.
- **Ground truth (consumed):** RUN-8 (screens 1–5, `FactScreen`, `StepFrame`, `useStepNavigation`), RUN-10 (`step-9-ranked.tsx`, `habit-setup-card.tsx`, `landscape-chooser/`), RUN-11 (`step-10-training.tsx` with `SetupCards`, `workout-setup-card.tsx`, `focus-setup-card.tsx`, `step-12-focuses.tsx`), RUN-9 (`passages/passage-card.tsx`), RUN-8's `work-day-type-card.tsx`; `packages/api/src/services/library/list-habits.ts`; DAY-1's composites.
- **What this slice is NOT (binding):** the five-screen sequence, the primer, *Usually* (DAY-8); anything inside `components/day-builder/` beyond what `loading.tsx` covers (DAY-9…); a change to the library's default order; a change to `SelectRow`.

**Rulings this slice makes (labelled, logged):**

- **A setup card never remounts on its first write.** `SetupCards` renders every card — rows and drafts — from one ordered list of `{ key, habit | null }` entries where a draft's `key` is its draft id for the screen's lifetime; when the draft's row lands, the entry's `habit` becomes the row and its `key` stays. `WorkoutSetupCard` and `FocusSetupCard` treat a `habit` prop changing from `null` to a row as *the create landed*: `idRef` is already set by `onCreated`; the draft state is not rebuilt. Rows the list did not create are keyed by `habit.id`. The same shape in `WorkDayTypeCards` (`work-day-type-card.tsx`'s list), which has the same bug. Logged.
- **`typicalDays` is sent as `null` only when *Flexible* is on; an empty array is never sent** — a fresh card with no days and *Flexible* off sends `typicalDays: []` today and the service reads it as flexible. The card sends `null` for flexible and the chosen days otherwise; with no days chosen and flexible off it sends nothing for that field on create (the service's default) and the card's `flexible` state is what the person set, not what the server inferred. Logged.
- **`listHabits` gains `order?: "library" | "created"`** (default `"library"`, the existing `compareForLibrary`); `"created"` sorts by `created_at` ascending. The habit router's `list` input gains the same. Screens 10 and 12 (and Settings → Training / Focuses, which mount them embedded) pass `"created"`; the library and every other caller are unchanged. Logged.
- **The ranked screen renders cards in slot order and never partitions** — `collapsed` becomes a `Set` the card reads for `initiallyOpen` only; the list is `cards` as fetched. `HabitSetupCard`'s *Done* moves focus to its own *Edit* (now in place), and the window does not scroll because nothing moved. Logged.
- **`loading.tsx` at `app/(setup)/setup/[step]/loading.tsx` renders `StepFrameSkeleton`**; it cannot know the step, so it renders the skeleton without a caption number (the caption slot shows a skeleton block). `StepFrame`'s primary wraps the navigation in `React.useTransition` and passes `busy={isPending}` to the button, so the tap shows pending until the new route renders. `Skip for now` and *Finish later* do the same. Logged.
- **Screen 2's `Select`** — the `select` primitive's `SelectField` with `options` from `COPY.workDayModes`, `aria-label` the weekday, width `w-40`, height `--target`; the `NativeSelect` import leaves screen 2. Logged.

## Experience & states

### Screen 2 (v1.2 §4.2 with T2.1, T2.3)
Seven `ListRow`s with a `SelectField` each; the menu opens anchored beneath its trigger; the `InfoDisclosure` beneath the list with the four lines from `COPY.workDayModeLines`. Everything else as RUN-8.

### Screen 3 (v1.2 §4.3) and every `LargeTargetRow`
The selection grammar arrives from DAY-1 with no screen change; confirm the *Yes / No* radio and the *what gives* rows read as choices beside the primary.

### Screens 9 (v1.2 §4.9 with R57–R59, R62)
Cards in slot order. Open card: as RUN-10, the `MinutesStepper`s with no `step`. *Done*: the card collapses **in place** to `CardSummary` — `leading` = `EmojiSlot` + `PriorityMark(matters)`; `title` = the habit's title; `caption` = *usually 12 min* · *quick 5* (the versions after it); `action` = *Edit* — and focus lands on *Edit*. *Edit* reopens in place. The summary copy: `COPY.rankedCaption(usually, versions)` replaces `rankedSummary`; *matters n* leaves the text (the mark carries it).

### Screens 10 and 12 (v1.2 §4.10, §4.12 with T10.1–T10.3, T12.1, R57)
Cards in created order. A new card appends, opens, and **stays open through its first write**; *Usual days* keeps its chips; *Done* collapses in place to `CardSummary` — the glyph, the name, *Edit*; caption *2 a week · Mon Thu · 60 min · gym +15/+15* (the existing `workoutSummary` parts after the name, joined) / *2 a week · flexible*. The focus card's glyph slot aligns to the input's vertical centre.

### Screen 3's type cards (R57)
`WorkDayTypeCard` collapsed: `CardSummary` — glyph, the name, *Edit*; caption *9:00–17:30 · work waits*.

### Screen 6's passage cards (T6.1)
`PassageCard`: the handle, the thumbnail and the menu vertically centred on the title's line (`items-center` on the row; the text column keeps its own stack).

### Every `/setup/*` transition (R63)
Tapping *Continue*, *Skip for now*, *Back* or *Finish later*: the tapped button shows pending; the route's `loading.tsx` renders `StepFrameSkeleton` until the page's data is there; then the screen. Screens 7–10 and 12, whose lists fetch on the client, keep their `SkeletonRow`s inside the frame as today.

**States (exhaustive):** per screen as RUN-8…RUN-11 wrote them, plus: *card: draft-open · created-open (same instance) · collapsed-in-place*; *route: pending · skeleton · rendered*. **Failure / edge states:** the create rejects → the card stays open with the line and `idRef` null; a second write queued behind a rejected create runs as a create again (RUN-11's chain already does this); `loading.tsx` shown for a 404 step → Next renders `not-found` after; the ranked screen with zero cards → *Nothing to rank yet.* as today.

## Non-negotiables (this slice)

- **A card never remounts on its first write; exactly one row per card.**
- **The library's order is unchanged for every caller that does not ask for created order.**
- **Nothing sinks, nothing scrolls on Done.**
- **Every route transition in `(setup)` shows the skeleton; no blank.**
- **The `NativeSelect` leaves screen 2; the `Select` menu is anchored.**
- **No new strings outside `copy.ts`; no glyph in `copy.ts`.**

## Data & AI

**Schema changes: none.**

**Tables:** `habits` (read — the order option; write — the create's `typicalDays` shape).

**Placement:** `apps/web/app/(setup)/_components/{step-2-work-days.tsx, step-9-ranked.tsx, habit-setup-card.tsx, step-10-training.tsx (SetupCards), workout-setup-card.tsx, focus-setup-card.tsx, work-day-type-card.tsx, step-3-work-shape.tsx (WorkDayTypeCards), step-frame.tsx, copy.ts}`; `apps/web/app/(setup)/setup/[step]/loading.tsx` (new); `apps/web/components/passages/passage-card.tsx`; `packages/api/src/services/library/list-habits.ts` + `packages/validators/src/habit.ts` (`listHabitsInput.order`) + `packages/api/src/routers/habit.ts`. Rules 3, 4, 7, 9, 11.

**tRPC / validators:** `habit.list` gains `order`; no new procedure.

**AI notes:** **None.**

## Accessibility

- The `SelectField` announces its value and the four options; arrow keys move; Escape closes; the trigger is 44px.
- The collapsed card's accessible name is *title, matters n, usually 12 min*.
- Pending primaries keep their label and gain `aria-busy`; the skeleton's `aria-busy` region is the frame.
- The passage card's handle keeps its 44px target after centring.

## Acceptance criteria (observable — local tier, 375px, Slow 3G for 1–3)

1. Screen 10, Slow 3G: *Add a workout* → type *Push* → tab out → pick *Gym or studio* before the create returns: the card stays open; *Usual days* still shows *Flexible* off and no chips; when the create returns the card is the same DOM node (`data-draft` attribute unchanged); `SELECT count(*) FROM habits WHERE title = 'Push'` is 1. *(Vigil.)*
2. The same on screen 12 with a focus named *Viewpoint*: one row, the card open.
3. Screen 3's *No* path: add a type, pick *Remote*, tap *Done*: the card collapses in place; a second *Add a work-day type* appends beneath it; the first card's DOM node is unchanged.
4. Screen 10 with three workouts created *Push*, *Pull*, *Legs* in that order lists them in that order; `habit.list({ types: ["workout"] })` without `order` still returns library order (category, then title). *(Mason.)*
5. Screen 9 with four cards: tap *Done* on the second; it collapses in place to two lines with the `PriorityMark` beside the glyph and the caption *usually 12 min*; the third card is still third; `window.scrollY` is unchanged; focus is on the collapsed card's *Edit*.
6. Screen 9's *Usually takes*: *+* from 12 gives 13; clearing shows *0* placeholder; blur commits 1 (`DURATION_MIN`) and writes once.
7. Screen 2: each row's control is the `Select` primitive; opening Wednesday's shows the four options anchored under the trigger; choosing *Rarely* writes `work_days` at once; the disclosure beneath is an `InfoDisclosure` with the four lines.
8. Screen 12's open card: the glyph slot's vertical centre equals the input's vertical centre (within 2px) on the first card with the helper line.
9. Screen 6 with two passages: each card's handle, thumbnail and menu are vertically centred on the title line (within 2px).
10. From screen 4, tap *Continue* with the network throttled: the button shows pending; the route renders `StepFrameSkeleton` (an element with `aria-busy="true"` inside `main#main`); then screen 5 renders. Same for *Back*, *Skip for now*, *Finish later*.
11. `grep -rn "NativeSelect" apps/web/app/(setup)` returns nothing; `grep -rn "step={5}" apps/web` returns nothing.
12. `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` pass (four separate commands).

## Likely-relevant technical notes (ADVISORY — dev decides)

- `SetupCards`: replace `drafts: number[]` + `createdByDraft` with `entries: { key: string; habit: HabitSummaryView | null; draft: boolean }[]`, reconciled from `rows` by `habit.id` and from `onCreated` by draft key; the effect that "lands" a draft becomes a `useMemo` that maps ids to rows. Give the card `data-draft={key}` for the acceptance check.
- `WorkoutSetupCard`: `draftFrom(habit)` runs once in `useState`'s initialiser; a later `habit` prop is ignored by design, so the create landing does not reset `draft`. Keep it that way; only `idRef` matters.
- `listHabits`: sort after mapping — `order === "created" ? views.sort(byCreatedAt) : views.sort(compareForLibrary)`; `HABIT_SUMMARY_COLUMNS` already includes `createdAt` or add it to the select.
- `useTransition` around `router.replace` in `useStepNavigation`; expose `pending` and let `StepFrame` pass it to the primary; the `StepFrameView` already takes `busy`.
- `loading.tsx` in a `[step]` segment renders for every step; Next 16 shows it on client navigations too (`router.replace` included).

## Dev's call

The `data-draft` attribute's name · whether `CardSummary`'s caption for a workout reuses `workoutSummary` split at the first ` · ` or a new `workoutCaption` · the transition's pending state on the back arrow (a subtle opacity is enough).

## Out of scope

- **The fifth work-day value, the primer, the five-step sequence** — DAY-8.
- **Anything inside `components/day-builder/`** — DAY-9…DAY-11 (its own skeletons land there).
- **`SelectRow` with a leading `PriorityMark`** — DAY-7 (B11 and B16 need it; screen 9's collapsed card uses `CardSummary` here).
- **The library's default order** — unchanged by rule.

## Depends on

- **DAY-1** — the grammar, `InfoDisclosure`, `PriorityMark`, `CardSummary`, the steppers, `StepFrameSkeleton`. Complete in `PROGRESS.md`.

## Recommended execution

**Opus.** The remount fix touches a promise chain and a reconciliation effect where the obvious patch (key by habit id once created) reintroduces the remount; a cheaper model ships the visible fix and a duplicate row under throttling.

---

### Kickoff (paste into the session)

> Build **DAY-2 — The fix batch, the screens** (attached spec). Model: **Opus**. **A card never remounts on its first write; nothing sinks on Done; every transition shows the skeleton; the library's order is untouched.**
> Attach/read first, in order: this spec · v1.3 R57–R59, R62, R63, R65, §4.3 · the walkthrough T2.1, T2.3, T6.1, T9.1–T9.3, T10.1–T10.4, T12.1, T13.1 · `apps/web/AGENTS.md` · root `AGENTS.md` · `docs/specs/README.md` § Placement rules · DAY-1 (the composites) · RUN-8, RUN-10, RUN-11, RUN-9 (Epic 5 — the screens this fixes; reuse, don't fork) · this track's `DEVIATIONS.md` + `TECHNICAL-DECISIONS.md` · Epic 5's `DEVIATIONS.md` + `TECHNICAL-DECISIONS.md` (TD-18).
> Induce the remount under Slow 3G and paste the row count. Close in three places; log departures in `DEVIATIONS.md`. Run `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` as separate commands.
