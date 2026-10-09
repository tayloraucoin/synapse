# DAY-12 — The week, the frame and the evening: screen 5 with hue strips, the orient frame's callouts, the pick's *Free time* section and the Today row, the day header's two rows, the quote after the journal, Settings' new screens

**Epic:** DAY — The first run built day-first (UX v1.3) · **Phase 4** · Size: L
**Slice type:** The surfaces around the builder — one setup screen, the orient frame, the quick-pick, the Today list, the day header sheet, the journal's close, and Settings → Your day. The risk class is *the frame gaining chrome* (a callout that reads as a card), *the evening inferred* (a pooled block filled without a tap), *a header row on the wrong day*, and *the quote keyed to the entry*.
**Vigil:** **Induce on the local tier:** a *Usually* Saturday and a *Rarely* Sunday with two complete plans; a Monday set from the plan with the evening pooled through the Day Review; *Choose when you're there* on Monday evening; a quote-day journal close with the bank on and off. State each day's header rows and the activity block's state at each step.

**Status:** Complete (2026-09-25)

> **Vesper — frame review.** The orient frame with two callouts under the dots at 375px: paper, no card shadow, the callouts read as things to open and not as content; the frame is still one read and one button; nothing else moved. The Today tab's *Choose when you're there* row is one tap to one list; the pick's *Free time* section has nothing preselected but *Decide later*. Screen 5's strips are pictures under the summary line, never the only carrier.

---

## Outcome

The day the builder made is met everywhere it should be: screen 5 shows each weekday's plan with a thin hued strip of its blocks under the summary line; the orient frame shows the person's links as callouts beneath the reading; under *Build each morning* the pick asks about free time with *Decide later* as the default; under *Set from the plan* the Today tab's free-time section reads *Choose when you're there* and opens the pool; the day header offers *Not working today* on a *Usually* day and *Working today · as Day A* on a *Rarely* day; the journal's close shows the morning's quote on quote-days; Settings → Your day has every v1.3 row with its screen. After this ships, **the v1.3 first run and its morning and evening are whole; DAY-13 retires what they replaced.**

## Why / intent

- **v1.3 §4.5, §13 #36** — screen 5's `WeekHueStrip` per row from the plan's blocks (a plan's preview through `buildPreview` at the list level — the summary's segments; DAY-11's `preview.ts` exports a `segmentsOf(plan, parts)`); *Unstructured* rows show none; the mode question unchanged.
- **v1.3 R53, §5.2 (1b)** — the callouts: *"Beneath the carousel's dots, the person's links as callouts … several stack with 8px between. Absent when there are none. Tapping opens the link in a new tab and writes nothing."* `OrientView` gains `links: LinkView[]` (RUN-4's read model, DAY-5's `link.list` joined in `readOrient`).
- **v1.3 §5.3, §3.16, TD-26** — the pick's **Free time** section under *Build each morning*: the pool as `SelectRow`s, nothing preselected, *Decide later* as a preselected ghost row; choosing calls `day.chooseFromPool` after `confirm` (or as part of the confirm — dev's call, one write path); *Set from the plan* leaves the block pooled; the Today tab's activity `BlockSection` in `pooled` state renders *Choose when you're there* and a `PickerList` sheet of the pool (multi) that calls `day.chooseFromPool`.
- **v1.3 R49, §3.9, §6** — the day header sheet: *Not working today* visible on a `usually` day with a work block; *Working today · as Day A* on a `rarely` day without one, listing `day.listWorkPlans` (DAY-5) instead of work-day types, applying the plan's template id.
- **v1.3 R54, §7.2** — the journal's closing screen shows `quote` from DAY-6's `readJournalClose` in Newsreader, quotation marks, attribution caption, under *A quote*.
- **v1.3 §4.6** — Settings → Your day's remaining rows: *First thing* (`first-thing`: passages + links + the quote + the three lines — B8's component embedded), *Free-time activities* (`free-time`: B15a + B15b embedded), *Each morning* (`each-morning`: the mode question from screen 5, embedded), *Closing the day* re-pointed to the journal settings with the two times read-only (DAY-10's ruling), *After work* and *Evenings* (the block editor rows, already DAY-8's); `YourDayScreen` gains the three keys and their titles.
- **Ground truth (consumed):** RUN-13 (`step-14-week.tsx` → DAY-8's `step-5-week.tsx`; the header's rows; the pick expanded under *build*), RUN-9 (`orient-frame.tsx`, `use-orient-frame.ts`), DYN-14 (`quick-pick/sections.tsx`, `use-quick-pick.ts`), DYN-15 (`day-list/block-section.tsx`'s pooled branch), DYN-17 (`day-header-sheet.tsx`), DYN-18 (`journal-screen.tsx`), DAY-5, DAY-6, DAY-7 (`LinkCallout`, `BrandGlyph`, `WeekHueStrip`), DAY-10 (`components/links/`, `journal-settings.tsx`), DAY-11 (`preview.ts`).
- **What this slice is NOT (binding):** any materialisation (DAY-6); a change to the frame's carousel, *Last night*, or the three lines; hues on `/today` or the Schedule (never); choosing the evening at the journal (open #38); deleting anything (DAY-13).

**Rulings this slice makes (labelled, logged):**

- **The pick's *Free time* section is filled through `confirmDay`'s existing input** — `confirmInput` gains `freeTime?: { habitIds: string[] } | "later"`; `confirmDay` calls DAY-6's `chooseFromPool` internals after the set when ids are given, so the morning is one write (TD-17's one confirm path). The Today row calls `day.chooseFromPool` directly. Logged.
- **`readOrient` joins active links** in cycle-independent order (`sort_order`); the frame renders `LinkCallout`s from `initial.links` between the dots and *Last night*. Logged.
- **The header's *Working today* lists plans, labelled *as {name}*** (`COPY.workingTodayAs(name)`), with the plan's glyph; a single plan applies at once as today; the `WorkTypeSheet` becomes a `PickerList` of plans. The row's visibility: `rarely` and no work block. *Not working today* visibility: (`usually` or `rarely`) and a work block. Logged.
- **Screen 5's strips are computed client-side from the plan's parts** through `segmentsOf` — the same `buildPreview` walk, reduced to `{ kind, minutes }[]` including `sleep`; the seven rows read `dayPlan.list` plus the templates' totals (already fetched for the summary); no new procedure. Logged.
- **`each-morning` under Settings mounts screen 5's two `LargeTargetRow`s alone** with a *Save* that writes `morning_mode` (no completion, no week pre-fill). Logged.
- **`first-thing` under Settings mounts B8's component embedded**; `before-the-day` redirects to it (DAY-13 removes the key). Logged.

## Experience & states

### Screen 5 — Your week (v1.3 §4.5)
DAY-8's `Step5Week` with, under each planned row's summary line, a `WeekHueStrip` (12px) of the plan's blocks in order with sleep at the end; *Unstructured* / *Off* rows without. The picker, the mode question and the two primaries unchanged.

### The orient frame (v1.3 §5.2)
After the dots: the `LinkCallout`s (8px apart); then *Last night*; the lines; the primary. No links → nothing rendered, no gap.

### The quick-pick under *Build each morning* (v1.3 §5.3)
A new section **Free time** after the fixtures, shown when the day's activity block is pooled: the pool's activities as `SelectRow`s (glyph, title, *usually 30*), nothing preselected, and a ghost row **Decide later** preselected; choosing one or more un-selects *Decide later*; *Set the day* sends `freeTime`. Under *Set from the plan* the section does not exist.

### The Today tab (v1.3 §6)
The activity `BlockSection` in `pooled` state: the row **Choose when you're there** (ghost, full width) under the block's pinned fixtures; tapping opens a `PickerList` sheet (multi, the pool's activities with their lengths, *Add* as the primary) that calls `day.chooseFromPool` and closes; the chosen become ordinary items. An *After work* section renders its items as any block's.

### The day header sheet (v1.3 §6, §3.9)
`usually` + work → **Not working today**; `rarely` + no work → **Working today** → a `PickerList` of plans (*Day A · Remote · 9:00–17:30*) or one applied at once. A `rarely` day after *Working today* shows **Not working today**.

### The journal's close (v1.3 §7.2)
After the last prompt, when `quote` is non-null: *A quote* (caption), the quote in Newsreader in quotation marks, the attribution as a caption; then the existing close. Otherwise unchanged.

### Settings → Your day (v1.3 §4.6)
The rows in order with every screen reachable: *First thing* → `first-thing`; *Free-time activities* → `free-time`; *Each morning* → `each-morning`; *Closing the day* → the journal settings with the two times read-only and the line *Each day sets its own — change them under Your days.*; `before-the-day` → redirects to `first-thing`.

**States (exhaustive):** screen 5 — planned rows with strips · unstructured · off; the frame — with callouts · without; the pick — free-time section · none (set mode, or no pool); Today — pooled row · chosen · no pool; the header — usually/working · usually/not-working · rarely/no-work · rarely/working; the journal close — quote · none. **Failure / edge states:** `chooseFromPool` refused `closed` → the sheet's line; a plan deleted after the week was built → the strip is absent, the row's summary stays (the day's blocks are its own); `Working today` with no complete plan → the row hidden; links offline → the callouts still render (they are in the read model) and open (a link needs no app connection).

## Non-negotiables (this slice)

- **The frame gains callouts and nothing else; they open in a new tab and write nothing.**
- **The evening is chosen, never inferred; *Decide later* is the pick's default.**
- **The header's rows appear only on the days §3.9 names.**
- **The quote after the journal is the morning's; nothing about the entry chooses it.**
- **No hue on `/today` or the Schedule; the strips live on screen 5 only.**
- **Every read and write through `ctx.rls.execute()`; every string in `copy.ts`.**

## Data & AI

**Schema changes: none.**

**Tables:** `links` (read) · `day_plans`, `templates` (read) · `days`, `day_blocks`, `day_items` (read, write — through `confirmDay`, `chooseFromPool`, `applyWorkType`, `removeWorkType`) · `users` (write — `morning_mode` under Settings) · `quotes` (read).

**Placement:** `apps/web/app/(setup)/_components/step-5-week.tsx`; `apps/web/components/orient-frame/{orient-frame.tsx, use-orient-frame.ts, copy.ts}` + `packages/api/src/services/day/orient.ts` (`links` on `OrientView`); `apps/web/components/quick-pick/{sections.tsx (FreeTimeSection), use-quick-pick.ts, copy.ts}` + `packages/api/src/services/day/{quick-pick.ts (the section's read), confirm-day.ts (freeTime)}` + `packages/validators/src/confirm.ts`; `apps/web/components/day-list/{block-section.tsx, copy.ts}` + a `pool-sheet.tsx` beside it; `apps/web/components/day-header-sheet/{day-header-sheet.tsx, copy.ts}` (plans instead of types); `apps/web/components/journal/{journal-screen.tsx, use-journal.ts, copy.ts}`; `apps/web/components/day-builder/preview.ts` (`segmentsOf`); `apps/web/app/(shell)/settings/your-day/{_components/your-day-list.tsx, _components/copy.ts, [screen]/page.tsx, [screen]/_components/your-day-screen.tsx}`; `apps/web/lib/routes.ts` (`YourDayScreen` += `first-thing`, `free-time`, `each-morning`); `apps/web/AGENTS.md`. Rules 3, 4, 9, 11.

**tRPC / validators:** `day.orient` (+ `links`), `day.confirm` (+ `freeTime`), `day.chooseFromPool` (DAY-6's), `day.listWorkPlans` (DAY-5's), `day.applyWorkType / removeWorkType`, `journal.*` (+ `quote`), `dayPlan.list`, `template.list`, `user.updatePreferences` (`morningMode`).

**AI notes:** **None.**

## Accessibility

- The callouts as DAY-7: *{title}, opens in a new tab*; they sit in the frame's reading column and are reachable by Tab after the dots.
- The pick's *Free time* section: the rows `button[aria-pressed]`; *Decide later* announces as pressed by default.
- The Today row is a button *Choose when you're there*; the sheet traps focus and its primary reads *Add 2*.
- The header rows keep their existing labels; *Working today* → the `PickerList` sheet is labelled *Working today*.
- The journal's quote is a `blockquote` with `figcaption`; announced in flow, no live region.
- Screen 5's strips are `aria-hidden`; the row's name is the weekday, the plan, the summary.

## Acceptance criteria (observable — local tier, 375px; the Vigil walk; paste the rows)

1. Screen 5 shows a hued strip under Monday's summary whose segments are the plan's blocks in order ending in a sleep segment; a *Never* Sunday with no plan shows *Off* and no strip; `grep -rn "WeekHueStrip\|bg-block-" apps/web/components/day-list apps/web/components/schedule-canvas` returns nothing. *(Vesper.)*
2. `/orient` with two links renders two `LinkCallout`s under the dots — the Spotify one with the mark and host, the other with the link glyph; tapping opens a new tab; `days` is unchanged by the tap; with no links, nothing renders between the dots and *Last night*.
3. Under *Build each morning*, the pick on a Monday with a pool shows **Free time** with the pool's rows unselected and *Decide later* pressed; *Set the day* with two chosen writes two items into the activity block and sets it `set`; with *Decide later* the block stays `pooled`. *(Vigil.)*
4. Under *Set from the plan*, *Start the morning* leaves the activity block `pooled`; `/today`'s free-time section shows the fixtures and **Choose when you're there**; the sheet lists the pool; *Add* with one chosen writes one item and the row disappears; the Day Review that night, with the evening left pooled on another day, counts nothing from the block. *(Vigil.)*
5. The header on a *Usually* Saturday (work block present) shows **Not working today** and not *Working today*; tapping it leaves the work block `not_today`; on a *Rarely* Sunday with no work block it shows **Working today** → the plans by name; choosing *Day A* applies its work template and the row flips. *(Vigil.)*
6. The journal's close on a quote-day with the bank on shows the morning's quote (same `quotes.id` as `/orient` that morning) under *A quote*; with the bank off, or on a passage-day, nothing. *(Vigil.)*
7. Settings → Your day lists v1.3 §4.6's rows in order; *First thing* opens B8's screen with passages, links, the quote and the lines; *Free-time activities* opens B15a/b; *Each morning* writes `morning_mode` on *Save* and pre-fills nothing; *Closing the day* shows the two times read-only with the line; `/settings/your-day/before-the-day` redirects to `first-thing`.
8. `apps/web/AGENTS.md` lists the three new screen keys and marks `before-the-day` as redirecting until DAY-13.
9. `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` pass (four separate commands); `yarn directory-map` run.

## Likely-relevant technical notes (ADVISORY — dev decides)

- `readOrient` already selects the passages and the quote in one transaction; add `readActiveLinks(tx, userId)` from DAY-5's `links.ts` beside `readActivePassages`.
- `use-quick-pick.ts` holds the sections' local state; add `freeTime: string[] | "later"` and send it on confirm; `quick-pick.ts`'s read model gains `freeTime: { pool: HabitSummaryView[] } | null` when the day's activity block is pooled (or the plan implies one).
- `block-section.tsx` line ~105 is the pooled branch (*decide in the morning*); the activity kind's pooled copy differs (*Choose when you're there*) — key the copy by kind.
- The header's `WorkTypeSheet` (RUN-13) lists work templates; swap its data source for `day.listWorkPlans` and its row label for the plan's name; keep the single-plan fast path.
- `journal-screen.tsx`'s close is after the last prompt (`allAnswered`); render the quote above the existing close block.

## Dev's call

Whether `freeTime` rides on `confirm` (recommended) or is a second call after it · the strip's data path (client `segmentsOf` vs a field on `DayPlanSummaryView`; client recommended — no new procedure) · the pool sheet's primary label.

## Out of scope

- **Materialisation and `chooseFromPool`'s internals** — DAY-6.
- **Choosing the evening at the journal** — open #38.
- **Retiring `before-the-day`, `WorkTypeSheet`'s type path, the v1.2 step files** — DAY-13.

## Depends on

- **DAY-11** — complete plans with pools and transitions; `preview.ts`. Complete in `PROGRESS.md`.
- **DAY-6** — `chooseFromPool`, the pooled block, `readJournalClose`, the header's services. Complete in `PROGRESS.md`.

## Recommended execution

**Opus.** Five surfaces, two of them the product's worst-moment paths (the frame, the Today tab), where the failure modes are inference (an evening filled without a tap) and chrome (a callout that becomes a card); the Vigil walk crosses two morning modes and three header states. A cheaper model preselects the pool or shows *Working today* on the wrong day.

---

### Kickoff (paste into the session)

> Build **DAY-12 — The week, the frame and the evening** (attached spec). Model: **Opus**. **The frame gains callouts and nothing else; the evening is chosen, never inferred; the header's rows only on the days §3.9 names; the quote is the morning's; no hue on the execution tabs.**
> Attach/read first, in order: this spec · v1.3 §3.9, §3.16, §4.5, §4.6, §5.2, §5.3, §6, §7.2, §13 #36, R49, R50, R53, R54 · `apps/web/AGENTS.md` (§ Product non-negotiables first) · root `AGENTS.md` · `docs/specs/README.md` § Placement rules · RUN-13, RUN-9 (Epic 5 — the week screen, the header, the frame; reuse, don't fork) · DYN-14, DYN-15, DYN-17, DYN-18 (Epic 4 — the pick, the list, the header, the journal) · DAY-5, DAY-6, DAY-7, DAY-10, DAY-11 · this track's `DEVIATIONS.md` + `TECHNICAL-DECISIONS.md` (TD-23, TD-26, TD-28, TD-29) · Epic 5's `TECHNICAL-DECISIONS.md` (TD-17, TD-19).
> Run the Vigil walk; paste the header rows and the activity block's state at each step. Close in three places; log departures in `DEVIATIONS.md`. Run `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` as separate commands, then `yarn directory-map`.
