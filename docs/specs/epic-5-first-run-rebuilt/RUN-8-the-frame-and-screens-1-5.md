# RUN-8 — The frame and screens 1–5: the sticky action row, fourteen steps, the archetype glyphs, four-value selects with the disclosure, *Same shape?* and work-day type cards, fixture kinds, one wake time

**Epic:** RUN — The first run rebuilt (UX v1.2) · **Phase 3** · Size: L
**Slice type:** A sequence — the frame's rules made real once, then five screens rebuilt to them. The risk class is *a dead end* (a step that 404s after renumbering; a `Continue` with nowhere to go) and *persuasion* (a preselected *what gives*; a fixture kind pre-chosen).
**Vigil:** none. **Vesper review:** each screen against v1.2 §4.1–§4.5 verbatim; the frame rules on every screen; nothing pre-selected that v1.2 does not pre-select.

**Status:** Not started

> **Vesper — screen review.** Walk `/setup/1` to `/setup/5` on a fresh account at 375px. Confirm: the action row stays pinned while the fixture list scrolls; the four archetype cards carry their glyphs and the three grey ones fade glyph and text together; screen 2's selects show four values and the disclosure opens four lines; screen 3 preselects *Yes, near enough* and, on *No*, a card appends and collapses on Done to *Remote · 9:00–17:30 · work waits*; screen 4's *Add one* is a left-aligned full-width secondary button and the sheet's kind chips are none-selected; screen 5 has one field and no *earliest*; every *Change* has a *Done*; the frame reads *n of 14*. Leave at 3, reopen, land on 3.

---

## Outcome

The first run is fourteen screens long and every screen obeys the frame rules: the primary and *Skip for now* are pinned above the safe area at every scroll position; a pre-filled field opens on *Change* and closes on *Done*; empty states sit left-aligned in the flow with a full-width secondary add button; lists append; a sheet never asks which block. Screens 1–5 are rebuilt to v1.2: the archetype cards carry their glyphs; work days are four-value selects with a collapsed explainer and Sat/Sun default *Never*; screen 3 asks *Do your work days all look the same?* and, on *No*, collects work-day type cards with their own hours, kind and glyph, ensuring one work template exists either way; screen 4's fixture sheet has kind chips that set a glyph and a default block; screen 5 asks one wake time. Steps 6–14 render their existing screens (6–12 shifted by the renumbering; 13 and 14 as transitional placeholders that complete first run, so the sequence never dead-ends). After this ships, **RUN-9, RUN-10, RUN-11 fill screens 6, 7–9, 10–12 in the same sequence, and RUN-12/13 replace the two placeholders.** The same five screens mount `embedded` under Settings → Your day.

## Why / intent

- **v1.2 §4 (the frame, once; the frame rules, R43)** — quoted in full in RUN-7's contract; here they are the acceptance criteria: sticky action row with 96px bottom padding; *Done* and blur-to-value; *Remove* where revealed; left-aligned empties with a full-width secondary; lists append; scoped sheets; `SelectRow`; cards collapse; every fact writes when entered.
- **§4.1** — *"Four full-width cards … each a `LargeTargetRow` at 72px with a leading emoji at 1.5rem in a 44px slot … The other three … render at `text-text-disabled` including their emoji (at 0.4 opacity …)"*; the four glyphs from `SCHEDULE_SHAPE_ICONS` (RUN-1).
- **§4.2** — *"Seven full-width `ListRow`s, Monday first, each with the weekday on the left and a `Select` on the right (44px high, 160px wide at 375px …): **Always · Sometimes · Rarely · Never**. Mon–Fri preselected *Always*; Sat and Sun *Never*. Beneath the list a `TextDisclosureButton`, collapsed, reading *What does each choice do?* — opening four lines"* (the four lines verbatim in the section). Body: *Most weeks, that is.*
- **§4.3** — *"Heading: *Do your work days all look the same?* Body: *Same hours, same place.* Two `LargeTargetRow`s as a radio: **Yes, near enough** · **No, it depends on the day**. *Yes* preselected `[DEFAULT §13 #26]`."* On *Yes*: v1.1 §4.3's screen (the two `TimeField`s, the *what gives* radio, nothing preselected, primary disabled until chosen) plus `template.ensureWork` on Continue. On *No*: `WorkDayTypeCard`s — kind chips (**🏠 Remote · ☕ Coworking · 🏢 Office or site · 💼 Other**, from `WORK_DAY_KINDS`), name and emoji filled from the kind, *Working by*, *Until about*, the *what gives* radio, **Done** collapsing to *Remote · 9:00–17:30 · work waits*; at least one to continue; *Continue · 2 types*.
- **§4.4** — the left-aligned empty (*Nothing yet.* / **Add one** full-width secondary); `FixtureSheet` with the kind `ChipPicker` first (**🗣️ Meeting · 📌 Appointment · 🎓 Class · 🎟️ Event · 🍽️ Social · 🧺 Chore · 📍 Other**), the kind's glyph in the title field's leading slot opening the picker, the block segment preselected from the kind; rows with the glyph; *Add another* under the list.
- **§4.5, R39** — one `TimeField` **Up at**; body *Most days. Every day can differ.*; the consequence line; *"the earliest-wake field is removed"*.
- **§4.16** — the five screens embedded under Settings → Your day; the list gains **Work-day types**.
- **§12.4** — the glyph lists; **R29** — none in `copy.ts`.
- **TD-14** — `ensureWork` on *Yes*; the profile takes the first type's values on *No* when empty (RUN-3 does this server-side).
- **Ground truth (consumed):** `apps/web/app/(setup)/{layout.tsx,setup/[step]/page.tsx,_components/*}` (DYN-10/11: `step-frame.tsx` wrapper, `fact-screen.tsx`, `useStepNavigation`, the twelve step files, `copy.ts`), `lib/entry/resolve-entry.ts` (`SETUP_STEP_COUNT`, `clampSetupStep`), `lib/routes.ts` (`setupRoute`, `YourDayScreen`, `YOUR_DAY_SCREENS`), `app/(shell)/settings/your-day/*`, `components/fixture-sheet/*`, RUN-7's composites, RUN-3's procedures, RUN-1's seeds and validators, `packages/validators/src/user.ts` (`firstRunStep`).
- **What this slice is NOT (binding):** screens 6 (RUN-9), 7–9 (RUN-10), 10–12 (RUN-11), 13 (RUN-12), 14 (RUN-13); the deletion of `step-12-fit.tsx` (RUN-13 — it becomes the placeholder at 14 until then? No: see the ruling below); Settings → Your day's other new rows.

**Rulings this slice makes (labelled, logged):**

- **The sequence is renumbered once, here, to fourteen.** `SETUP_TOTAL_STEPS = 14`, `SETUP_STEP_COUNT = 14`, `clampSetupStep` to 14, `setupRoute` 1–14, `[step]/page.tsx` routes 1–14 and 404s above; the existing files move: `step-7-before-work` stays 7, `step-8-landscape` stays 8, **`step-9-ranked.tsx` is a placeholder** (heading *Your routine, ranked* and a *Continue* — RUN-10 fills it) `[COPY]`, `step-9-training` → `step-10-training`, `step-10-closing` → `step-11-closing`, `step-11-focuses` → `step-12-focuses`, `step-12-fit` → **`step-13-days.tsx` as a placeholder** that renders the old fit screen's completion (*Open today* / *Plan this week first* calling `completeFirstRun`) under the heading *Your days* so first run still completes; **`step-14-week.tsx` is not created** (RUN-13 creates it and moves completion there). `apps/web/AGENTS.md`'s `/setup/{1–14}` row updated. Logged.
- **Screen 3's two paths are one component with a `sameShape` radio state**; on *Yes*, Continue writes the three profile columns and calls `template.ensureWork`; on *No*, each card writes its own `template.create` / `update` on Done (save as you go), and Continue only navigates. Switching from *No* back to *Yes* leaves the created types in place (they are honest data; Settings → Work-day types lists them). Logged.
- **The `FixtureSheet` opens with no kind selected**; the kind chips are a vocabulary, never a suggestion; picking one fills the glyph and the block segment; the person may change both. Logged.
- **`WorkDayTypeCard` and the kind chips are app-local** (`app/(setup)/_components/work-day-type-card.tsx`), composed from `Card`, `ChipPicker`, `Input`, `EmojiPicker`, `TimeField`, `RadioGroup`; the same file mounts under Settings → Your day → Work-day types. Logged.
- **Every write on screens 2–5 is per control**: a select change writes `workDays` at once; a time field's *Done* writes it; a fixture's sheet save writes the fixture; `Continue` writes nothing of its own except screen 3's *Yes* path (three fields that belong together — the one exception, because *what gives* has no meaning without the anchor). Logged.
- **`earliestWakeTime` is no longer read or written by any screen**; the column stays until `0008`. Logged.

## Experience & states

### The frame — every screen (`StepFrame`, RUN-7)

*n of 14*; *Finish later* ghost top-right; back on every step but the first; the action row pinned (`stickyActions`); *Skip for now* ghost on screens 2–14 where allowed; focus to the heading on every step; offline: primaries disabled with the standard line. Every transition writes `first_run_step`.

### Screen 1 — `/setup/1` (§4.1)

As DYN-10, with `leading` glyphs from `SCHEDULE_SHAPE_ICONS` through `EmojiSlot size="card"`; the three disabled rows fade glyph and text. *Continue* writes `scheduleShape`. **States:** default · saving · offline.

### Screen 2 — `/setup/2` (§4.2)

Heading *Which days do you work?*, body *Most weeks, that is.* Seven `ListRow`s with a `Select` (44px, 160px) — *Always · Sometimes · Rarely · Never* — Mon–Fri *Always*, Sat and Sun *Never* from `users.work_days` or the default. `TextDisclosureButton` *What does each choice do?* → the four lines. A select change writes `workDays` immediately (optimistic; revert with one line on failure). *Continue* navigates. **States:** default · disclosure open · saving (row) · failed (row reverts) · offline.

### Screen 3 — `/setup/3` (§4.3)

Heading *Do your work days all look the same?*, body *Same hours, same place.* Radio: **Yes, near enough** (preselected) · **No, it depends on the day**.
*Yes:* `TimeField` *Working by* (9:00, value + Change + Done), *Until about* (17:30), the body-weight heading *When your morning runs long, what gives?*, the three-row radio, nothing preselected, primary disabled until chosen; *Continue* writes the three and calls `template.ensureWork`.
*No:* the cards; empty: *Nothing yet.* + **Add a work-day type** (full-width secondary); a new card appends and opens: kind chips (none selected) → name + glyph filled on pick; *Working by*; *Until about*; the *what gives* radio; **Done** writes the template and collapses to the summary with *Edit*; primary disabled until one card is Done; *Continue · 2 types*.
**States:** yes-gated · yes-ungated · no-empty · no-card-open · no-card-collapsed · saving · offline.

### Screen 4 — `/setup/4` (§4.4)

Heading and body as v1.1. Empty: *Nothing yet.* left-aligned muted; **Add one** full-width secondary in the flow. `FixtureSheet`: kind `ChipPicker` (none selected) · title `Input` with the glyph in its leading slot (tap → `EmojiPicker`) · `WeekdayChips` · `TimeField` *At* · `MinutesStepper` *For* · `SegmentedControl` *In work · In the evening* preselected from the kind. Saved rows: `ListRow` with `leading` glyph — *🗣️ Stand-up · Tue · 9:30 · 20 min* — `EllipsesMenu` (*Edit · Remove*); **Add another** under the list. *Continue* / *Skip for now* write nothing. **States:** empty · listing · sheet open · saving · offline.

### Screen 5 — `/setup/5` (§4.5)

Heading *When would you like to be up?*, body *Most days. Every day can differ.* One `TimeField` **Up at** (7:00; Change → Done writes `usualWakeTime`). The consequence line *7:00 to 9:00 · 2 h before work* (or *… on a remote day* when the first type has a kind). No earliest. **States:** default · open · saving · offline.

### Screens 6–14 (this ticket's placeholders)

6, 7, 8 render as today; 9 and 13 render the placeholders ruled above; 10, 11, 12 render the moved files unchanged; 14 404s (RUN-13). Step 13's placeholder completes first run as `step-12-fit` did (`completeFirstRun`, then Today).

### Embedded (Settings → Your day)

Screens 1–5 with `embedded: true` as DYN-10; **Work-day types** added to `YOUR_DAY_SCREENS` and the list, mounting screen 3's *No* path's cards without the radio.

**States (exhaustive):** per screen above; the sequence — steps 1–14 · resumed at `first_run_step` · finished later · offline. **Failure / edge states:** a row with `first_run_step = 12` (a v1.1 account mid-run) → lands on 12, which is now focuses — acceptable and logged (the fit is gone) · a write fails on a select → the select reverts and a `StatusLine` reads *Couldn't save. Try again.* · screen 3 *No* with a card left open (not Done) → *Continue* disabled with no explanation beyond the open card · a fixture kind changed on Edit → the glyph changes only if the person had not chosen one (the sheet tracks `iconTouched`).

## Non-negotiables (this slice)

- **The action row is sticky on every screen.**
- **Nothing pre-selected that v1.2 does not pre-select** — the live archetype, the work-day defaults, *Yes, near enough*; never a *what gives* row, never a fixture kind.
- **Every value + Change has a Done.**
- **Empty states are left-aligned; add buttons are full-width secondary in the flow.**
- **No glyph in `copy.ts`** (R29, lint).
- **Save as you go** — one screen-level exception (screen 3's *Yes* trio), logged.
- **The sequence never dead-ends** — 13 completes until RUN-13 moves completion to 14.

## Data & AI

**Schema changes: none.**

**Tables:** `users` (update — the profile columns) · `templates` (create, update — work) · `fixtures` (create, update, archive).

**Placement:** `apps/web/app/(setup)/_components/{step-1-shape,step-2-work-days,step-3-work-shape,step-4-commitments,step-5-wake}.tsx` (rebuilt; `step-3-work-start` renamed), `work-day-type-card.tsx` (new), `step-9-ranked.tsx` + `step-13-days.tsx` (placeholders), the renamed 10–12 files, `copy.ts` (rewritten for 1–5; `SETUP_TOTAL_STEPS = 14`), `setup/[step]/page.tsx`; `components/fixture-sheet/*` (+ kind chips, glyph); `lib/entry/resolve-entry.ts`; `lib/routes.ts` (`setupRoute` 1–14; `YourDayScreen` += `work-day-types`); `app/(shell)/settings/your-day/*` (the row and mount); `apps/web/AGENTS.md`. Rule 9.

**tRPC / validators:** `user.updatePreferences`, `template.ensureWork`, `template.create` / `update` / `list` (work), `fixture.*`, `user.me`. `firstRunStep` ≤ 14 in `updatePreferencesInput`.

**AI notes:** **None.**

## Accessibility

- The `Select` on screen 2 is the primitive's native-labelled select; its accessible name is the weekday.
- The disclosure is a `button` with `aria-expanded`; the four lines are a list.
- Screen 3's *No* path: each card is a `group` labelled by its name; the kind chips are a radio group; *Done* moves focus to the collapsed summary's *Edit*.
- The fixture sheet's kind chips are a radio group labelled *Kind*; the glyph button in the title's leading slot is labelled *Choose an icon*.
- *Done* on a `TimeField` returns focus to *Change*.
- 200% text: the selects stay 44px and do not wrap their value (the primitive truncates with an ellipsis and the full value is the option list); cards stack their two time fields.

## Acceptance criteria (observable — local tier, a fresh account, 375px; `yarn web:dev`)

1. The frame reads *1 of 14* … *5 of 14*; on screen 4 with six fixtures the action row is pinned and the last row scrolls above it. *(Vesper.)*
2. `/setup/1`: four cards with 🗓️ 🔁 🧭 🌊; the three grey ones fade glyph and text; `Continue` writes `schedule_shape`. *(Vesper.)*
3. `/setup/2`: seven selects, Mon–Fri *Always*, Sat and Sun *Never*; changing Saturday to *Rarely* writes `work_days."5" = "rarely"` within a second without a `Continue`; the disclosure opens the four lines verbatim; at 200% no horizontal scroll. *(Vesper.)*
4. `/setup/3` *Yes*: primary disabled until a *what gives* row; `Continue` writes the three columns and one work template exists (`templates` kind work, count 1); `Continue` again on revisit creates no second template.
5. `/setup/3` *No*: *Add a work-day type* appends a card; picking *Remote* fills the name and 🏠; *Done* creates a work template with `location_kind remote`, `anchor_time`, `work_end_time`, `anchor_direction`; the card collapses to *Remote · 9:00–17:30 · work waits*; a second card appends **below**; `Continue · 2 types` navigates. On an account with no profile work start, the profile now has the first card's values.
6. `/setup/4`: the empty state is left-aligned with a full-width *Add one*; the sheet opens with no kind selected; picking *Meeting* fills 🗣️ and *In work*; saving lists *🗣️ Stand-up · Tue · 9:30 · 20 min*; *Add another* sits under the list; *Remove* archives.
7. `/setup/5`: one field; *Change* opens, *Done* closes and writes; the consequence line reads *7:00 to 9:00 · 2 h before work*; `grep -rn "earliest" apps/web/app/\(setup\)` returns nothing.
8. `/setup/9` and `/setup/13` render their placeholders; `/setup/13`'s *Open today* completes first run; `/setup/14` is a 404; `/setup/10` is training, `/setup/12` focuses.
9. Leaving at 3 via *Finish later* and reopening lands on 3; a row with `first_run_step = 14` clamps to 14 → 404 until RUN-13 (stated in the report).
10. Settings → Your day lists **Work-day types** and mounts the cards embedded; screens 1–5 still mount embedded.
11. Offline: primaries disabled; a select change shows the standard line and does not write.
12. `grep -rn "alarm\|late\|behind" apps/web/app/\(setup\)/_components/copy.ts` returns nothing; `yarn lint` passes the emoji rule on `copy.ts`.
13. `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` pass (four separate commands).

## Likely-relevant technical notes (ADVISORY — dev decides)

- `useStepNavigation` stays; the renumbering is a constant and the file moves — do the moves with `git mv` first, then rebuild 1–5.
- The `Select` primitive (`primitives/control/select`) is Radix-based; the native one is for forms — either is fine at 44px; pick the one whose value renders without wrapping.
- The consequence line's formatter from DYN-10 (`step-5-wake.tsx`) stays; add the type-kind suffix from `template.list`'s first work row.
- `WorkDayTypeCard`'s collapse is local state; the summary line is built from the card's own values, not a re-read.

## Dev's call

Which `Select` primitive · how the placeholder screens are named in the caption (*Your routine, ranked* / *Your days*) `[COPY]` · whether screen 3's *No* cards are one component with a `mode` or two.

## Out of scope

- **Screen 6 and the frame** — RUN-9. **Screens 7–9** — RUN-10. **Screens 10–12** — RUN-11. **Screen 13** — RUN-12. **Screen 14 and completion's move** — RUN-13.
- **Dropping `earliest_wake_time`** — RUN-15.

## Depends on

- **RUN-3** — `ensureWork`, the work columns, fixture kinds, the widened profile. Complete in `PROGRESS.md`.
- **RUN-7** — `StepFrame` sticky, `Card`, `SelectRow`, `TimeField` Done/leading, `LargeTargetRow` leading, `EmojiSlot`, the optimistic contract. Complete in `PROGRESS.md`.

## Recommended execution

**Opus.** A renumbering that can strand a person mid-run, two paths on one screen with different write timings, and a persuasion guardrail on every screen; a cheaper model preselects a *what gives* row to enable the primary or leaves step 13 a 404.

---

### Kickoff (paste into the session)

> Build **RUN-8 — The frame and screens 1–5** (attached spec). Model: **Opus**. **Sticky action row; nothing pre-selected the person did not choose; every Change has a Done; save as you go; the sequence never dead-ends; no glyph in copy.**
> Attach/read first, in order: this spec · v1.2 §4 (the frame and its rules), §4.1–§4.5, §4.16, §12.4, §13 #26 · `apps/web/AGENTS.md` · root `AGENTS.md` · `docs/specs/README.md` § Placement rules · DYN-10 (the sequence, `useStepNavigation`, the value + Change pattern — reuse, don't fork) · RUN-7 (the composites) · RUN-3 (the procedures) · RUN-1 (the seeds) · this track's `DEVIATIONS.md` + `TECHNICAL-DECISIONS.md` (TD-14, TD-18, TD-20) · Epic 4's `DEVIATIONS.md` (DYN-10's lines).
> Walk the five screens at 375px on a fresh account and say what you could not walk. Close in three places; log departures in `DEVIATIONS.md`. Run `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` as separate commands.
