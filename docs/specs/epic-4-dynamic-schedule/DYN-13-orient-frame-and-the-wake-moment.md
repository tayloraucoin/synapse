# DYN-13 — The orient frame and the wake moment

**Epic:** DYN — Dynamic schedule (UX v1.1) · **Phase 1** · Size: M
**Slice type:** The waking state's one screen, and the entry rule that puts it first. The risk class is *the app's voice on the frame* (any chrome sentence about the person; a time, a count, a "day 12") and *a wake stamped on the wrong day* (the frame shown twice, or for a day already closed).
**Vigil:** none. **Vesper review:** the frame against §5.2 verbatim — the strings, the order of the three lines, the one-word tense change, the R18 line's four rules. **Sage's note stands as written in §5.2:** *"a single recall cue of a recent choice is low-reactance for a manipulation-literate audience only because it is rare, factual and about a thing the person set up themselves … If Taylor reads it here and it lands as pressure, delete it and nothing else changes."*

**Status:** Complete (2026-09-13 — authored and built in one thread, with DYN-14; `/orient` behind the shell's gate with the chrome hidden, `day.orient` / `day.saveMorning`, `shouldShowSkipLine` in `@syn/utils`, the entry tree's new first branch, the wake-anchor switch retired; the four root commands pass; the browser walk is blocked at sign-in — logged in `DEVIATIONS.md`)

**Owner:** Reeve (spec) → dev (build) · **Reviewer:** Vesper (the frame by eye), Mason (the entry rule against day boundaries and auto-close; `shouldShowSkipLine`'s four rules)

## Outcome

`/orient` (`orientRoute()`), the first thing shown after the day opens: `resolveEntry` returns it, before any tab, whenever today's `woke_at` is null and the day is not closed (§5.1); opening it stamps `woke_at = now`, `woke_at_source = orient` (R11), once. The frame per §5.2 verbatim: no header, no tab bar, no time; the caption *Last night* and the date; the three journal lines in Newsreader as `blockquote`s with their prompts as `figcaption`s (*What I want to make happen today* — the one transformation, one word); the passage under *Every morning* when both exist, alone when there is no entry; *Nothing to read yet. Tonight's journal shows up here tomorrow.* on the first morning; the optional serif line *Grateful for, this morning* and *Today's intention*, autosaving to `days.morning_gratitude` / `days.intention`; one primary **Start the morning** → `/today`. The R18 line — *Skipped yesterday too.* — on the second consecutive skip only, at most once in seven days, as one fact, off with the gratitude switch, computed by a pure `shouldShowSkipLine` in `@syn/utils`. The wake-anchor path is retired: the switch leaves the habit sheet, `users.wake_anchor_habit_id` is no longer written, a done tick no longer stamps the wake. After this ships, **DYN-14 has the second screen of the morning to follow this one, and DYN-15's Today tab lands after the frame rather than instead of it.**

## Why / intent

- **§5.1** — *"The first time the app is opened after [day close] … and the day has no `woke_at`, the orient frame is shown, full screen, before any tab. Opening it stamps `woke_at = now`, source orient (R11) … If the app is first opened at 14:00, the frame still shows and the pick's morning budget is simply zero; the day starts where it starts, honestly … The frame is never shown twice for one day."*
- **§5.2** — *"Point the mind the way the person wants it pointed before the day gets in — with the person's own words, never the app's … No header, no tab bar, no time … [It must never] speak in the app's voice about the person. Show a time, a count, a streak, a 'day 12'. Show anything red or urgent. Play a sound. Require anything."*
- **R18** — the four rules, and Sage's grade, quoted above.
- **R11, §2 amendment 2** — the wake is the orient frame's; the v1.0 wake-anchor habit is gone.
- **§13 #9** — the R18 line ships with its rules; it is Taylor's to delete.
- **Ground truth (consumed, never rebuilt):** DYN-5's `day.setWakeTime({ source })`, `days.morning_gratitude` / `intention` (0005), `journal.lastNight` and `getJournalEntry`, `ORIENT_READBACK_KEYS`; DYN-10's `orient_passage` / `orient_ask_gratitude` / `orient_show_last_night`; the app's `resolveEntry` and the shell layout's gate; DYN-7's serif `Textarea`.
- **What this slice is NOT (binding):** the quick-pick (DYN-14); the day header's *Set wake time* row (kept as it is); the confirm-yesterday panel — it is not on the frame (§7.3); the column and field removal (`users.wake_anchor_habit_id`, `DayView.wakeAnchorItemId`, `HabitSummaryView.isWakeAnchor`, `isWakeAnchor` on the form — DYN-21); the slide-up motion into the quick-pick beyond a plain navigation.

**Rulings this slice makes (labelled, logged):**

- **The frame is a shell route with the chrome hidden,** not a fourth route group. `/orient` sits under `(shell)` so the auth gate, the session watcher and the theme sync apply once; `AppShell` hides the rail and the tab bar on that path, and the page renders a bare column — no `PageFrame`, no status line, no header (§5.2: "no header, no tab bar"). Logged.
- **The entry rule is `resolveEntry`'s first branch after setup.** `resolveEntry` gains `today: { wokeAt, closed } | null`; when setup is not owed and today has no wake and is not closed, it returns `orientRoute()` regardless of the intended route — the frame comes before any tab (§5.1). `resolveEntryForRequest` reads `day.today` (which now returns `wokeAt`, `closedAt`, `confirmedAt` beside the key) and the shell layout redirects to `/orient` from any shell path that is not `/orient`. Logged.
- **`day.orient` is one read; opening stamps the wake in the same call.** The query ensures the day row, writes `woke_at = now`, `source = orient` only when `woke_at` is null (never twice — a manual correction is not overwritten), and returns the frame's props: the date, last night's three lines by key, the passage, the switch, the current gratitude and intention, and `skippedYesterday`. Logged.
- **`shouldShowSkipLine(skips)`** takes yesterday-first booleans (`morning_gratitude` null per day) and returns true iff yesterday was skipped, the day before was not (second consecutive, never third), and no earlier day in the last seven would itself have shown the line (at most once in seven days). Pure, in `@syn/utils`. Logged.
- **The line appears at the tap and the tap proceeds.** *Start the morning* with the gratitude field empty and `skippedYesterday` true shows the caption for a beat (1.5 s) and then navigates; nothing is written for the line. Logged.
- **Autosave is the field's blur and a debounce,** through `day.saveMorning({ date, gratitude?, intention? })`; the primary writes nothing (both fields are already saved). Logged.
- **The wake-anchor switch is removed from the habit sheet;** the form keeps `isWakeAnchor: false` for the schema until DYN-21; `setDone` no longer stamps `woke_at` from the anchor. Logged.

## Experience & states

### `/orient` — `components/orient-frame/`

Paper, one column at 64ch (720px centred on desktop). `h1` caption *Last night* with the date under it, muted sans. Then, when last night has any of the three answers: for each in order — *make happen tomorrow*, *visualisation*, *looking forward to* — a hairline, the prompt as a `figcaption` (the first re-tensed: *What I want to make happen today*), the answer as a `blockquote` in Newsreader at body size. Then the passage: under the caption *Every morning* when journal lines exist, alone (no caption) when they do not; when neither exists, the one line *Nothing to read yet. Tonight's journal shows up here tomorrow.* Then, when `orient_ask_gratitude`: a one-row serif `Textarea` with the caption *Grateful for, this morning*; and always a second, *Today's intention*. Pinned above the safe area: **Start the morning**. States: with-journal · passage-only · both · nothing-yet · saving (inline spinner on the primary) · skip-line (the caption under the gratitude field reads *Skipped yesterday too.* for that tap) · offline (the fields hold their text; the primary works — the wake is already stamped).

**Failure / edge states:** cold open at 14:00 → the frame, `woke_at = 14:00` · the frame reloaded → no second stamp · a day auto-closed before the frame was opened → the next day's frame (the closed day is skipped by the rule) · `orient_ask_gratitude = false` → no gratitude field and never the line · `orient_show_last_night = false` → the passage alone, as if there were no entry · back does nothing useful (the entry tree returns here) · `day.saveMorning` fails → the field keeps its text and the primary still works.

## Non-negotiables (this slice)

- **No chrome sentence about the person.** The person's words are the only second person on the frame.
- **No time, no count, no streak.** The date is the only figure.
- **Nothing red, nothing urgent, no sound.**
- **The frame never opens onto blank paper.**
- **One stamp per day.**
- **The R18 line: second consecutive skip only; once in seven days; one fact; off with the switch.**
- **No new `@syn/ui` component.**

## Data & AI

**Schema changes: none.**

**Tables:** `days` (update — `woke_at`, `woke_at_source`, `morning_gratitude`, `intention`; insert when the row does not exist yet).

**Placement:** `apps/web/app/(shell)/orient/page.tsx`; `apps/web/components/orient-frame/{orient-frame.tsx,use-orient-frame.ts,copy.ts,index.ts}`; `packages/utils/src/day/skip-line.ts`; `packages/api/src/services/day/orient.ts` + `day.orient`, `day.saveMorning`, `day.today` widened; `packages/validators/src/day.ts` (`saveMorningInput`); `apps/web/lib/entry/{resolve-entry,resolve-entry-for-request}.ts`; `app/(shell)/layout.tsx`, `app/(shell)/_components/{app-shell,shell-providers}.tsx` (the bare path); `lib/routes.ts` (`orientRoute()`); `apps/web/AGENTS.md`; `components/habit-sheet/` (the switch removed); `packages/api/src/services/day/set-done.ts`. Rule 9 (app-local composition), rule 3 (the stamp is the service's).

**tRPC / validators:** `day.orient({ date? })` → `{ date, lastNight, passage, askGratitude, skippedYesterday, gratitude, intention }` · `day.saveMorning({ date, gratitude?, intention? })` · `day.today` → `{ todayKey, wokeAt, closedAt, confirmedAt }`.

**AI notes:** **None.**

**Instrumentation:** none.

## Accessibility

- The caption *Last night* is the `h1`; the date is a `p` under it.
- Each journal line is a `figure` → `blockquote` + `figcaption` (the prompt).
- The two fields are labelled by their captions; the R18 caption is `aria-live="polite"`.
- The primary is the only button; focus lands on the first field when there is one, else the primary.
- Reduced motion: no transition in either direction.

## Acceptance criteria (observable — local tier; `yarn web:dev`)

1. Cold open at 7:10 with `woke_at` null → `/orient`; `days.woke_at = 7:10`, `woke_at_source = orient`; reloading does not move the stamp. *(Mason.)*
2. The frame shows *Last night* · the date · the three lines in order, the first captioned *What I want to make happen today*; with a passage set, *Every morning* and the passage follow; with no entry the passage stands alone; with neither, *Nothing to read yet. Tonight's journal shows up here tomorrow.* — never blank paper. *(Vesper.)*
3. Typing in *Grateful for, this morning* and blurring writes `days.morning_gratitude`; *Today's intention* writes `days.intention`; *Start the morning* with both empty writes nothing and lands on `/today`. *(Mason.)*
4. A second open the same day → `/today`, not the frame; a day closed at 03:00 before the frame opened → the next day's frame. *(Mason.)*
5. With yesterday's gratitude null and the day before's set, tapping *Start the morning* with the field empty shows *Skipped yesterday too.* under the field and proceeds; the next morning (third consecutive) shows nothing; `shouldShowSkipLine([true, false])` is true, `[true, true]` false, `[true, false, false, true, false]` false. *(Mason.)*
6. With `orient_ask_gratitude = false`, neither the gratitude field nor the line exists. *(Vesper.)*
7. The frame has no tab bar, no rail, no header, no status line; `grep -rn "min\b\|streak\|day [0-9]" apps/web/components/orient-frame/copy.ts` returns nothing. *(Vesper.)*
8. The habit sheet has no wake-anchor switch; `grep -rn "wakeAnchor" apps/web/components/habit-sheet/habit-sheet.tsx` returns nothing; ticking a habit done never writes `days.woke_at`. *(Mason.)*
9. `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` pass (four separate commands).

## Likely-relevant technical notes (ADVISORY — dev decides)

- `getLastNight(rls, userId, todayKey)` returns the entry with its prompts; the three keys are `ORIENT_READBACK_KEYS` in `@syn/constants`.
- The seven-day skip history is one query over `days` for `date` in the last eight days (yesterday and the seven before), `morning_gratitude IS NULL` per row; a missing row is a skip.
- `AppShell` already reads nothing about the path; `usePathname() === orientRoute()` in `ShellChrome` is the one line that hides the chrome.

## Dev's call

The beat's length before the tap proceeds (1.5 s) · whether the intention field is one row growing or a fixed two (one row, `rows={1}`, growing by content).

## Out of scope

- **The quick-pick** — DYN-14.
- **The column and field removals** — DYN-21.
- **The slide-up motion** — a plain navigation here; DYN-15 may add the 200 ms settle with the list.

## Depends on

- **DYN-5** — `days.morning_gratitude` / `intention`, `setWakeTime({ source })`, the journal read. Complete in `PROGRESS.md`.
- **DYN-7** — the serif `Textarea`. Complete in `PROGRESS.md`.

## Recommended execution

**Opus.** The entry rule interacts with day boundaries and auto-close, and the R18 line's four rules are a place a cheaper model writes a nudge.

---

### Kickoff (paste into the session)

> Build **DYN-13 — The orient frame and the wake moment** (attached spec). Model: **Opus**. **No chrome sentence about the person; no time, count or streak; never blank paper; one stamp per day; the R18 line's four rules exactly.**
> Attach/read first, in order: this spec · v1.1 §5.1, §5.2, §7.3, R11, R18, §13 #9 · `apps/web/AGENTS.md` · root `AGENTS.md` · `lib/entry/resolve-entry.ts` · `app/(shell)/layout.tsx` · DYN-5 (`journal.ts`, `item-fields.ts`) · this track's `DEVIATIONS.md` + `TECHNICAL-DECISIONS.md`.
> Walk the frame in the browser on a fresh day. Close in three places; log departures in `DEVIATIONS.md`. Run `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` as separate commands.
