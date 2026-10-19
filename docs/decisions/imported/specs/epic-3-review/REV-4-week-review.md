# REV-4 — Week Review: WR-01, WR-02, WR-03, WR-04 — Phase 2

**Epic:** REV — Review · **Phase 2 (per official §12; does not gate launch)** · Size: L
**Slice type:** A record over a week — the same arithmetic, read slowly, with strips, bars, and lists. The risk class is *a dashboard*: a trend, a comparison, a colour on an outcome, a number without its sentence.
**Vigil:** none. **Vesper review:** the strip's seven glyphs at 16px on compact; the sort by what slipped; the category bar's legend.

**Status:** Complete (2026-09-06)

> **Vesper — dashboard review.** If WR-01 reads as a dashboard, it failed. There is no trend arrow, no comparison to last week, no colour on any outcome, and every number prints its sentence.

---

## Outcome

Any day, a person can open this week and read: the number so far with its sentence, the priority bands, off-schedule, how each template was used against its target, one strip per habit — seven squares Monday to Sunday in the tier register, sorted so what slipped is first — deep work and tasks summarised, shifts counted, and where the timed hours went by category. Tapping a habit shows its week in full, each day's outcome in words, and a four-week fact. Carried tasks and shifts have their own lists. When Sunday closes and every day is reviewed, the number stands alone and the footer says *Week closed {date}*. **Nothing here is evaluated in words.**

## Why / intent

- **Official spec §7.5** — the header with the week's adherence, the priority-band row, template usage; the per-habit strip with the tier register (filled done · half-filled done-off-schedule glyph · outline excused · hatched half · empty chose-not-to · blank not assigned) with tooltips and accessible labels and *{credit} of {counted}*; carried across the week; shifts this week; time by category as one stacked bar with minutes, no pie; history region. §0.3 R6 — the week is the same formula over seven days. §9.4 — Newsreader for the Week Review header's number and sentence. §7.7 — no coach.
- **Epic 3 §3 (WR-01, WR-02, WR-03, WR-04), §5, §8 calls 1–2** — every read, rule, and state: the header lines; *so far*; *{n} days not yet reviewed aren't in this.*; the templates rows with no marker; strips sorted by credit ratio ascending; the seven glyph states with their labels; deep work rows; tasks summary; shifts summary; time by category *· from timers* with *Items without timed sessions aren't included.*; *Week closed {date}*; WR-02's rows and outcome lines and the four-week line; WR-03's rows and *Open next week*; WR-04's rows and summary.
- **Ground truth:** REV-1's `review.week` (`ReviewWeekView` with `habits[].days` as `StripState[7]`, `templates`, `categories`, `shifts`, `tasks`, `deepWork`, `result`, `unreviewedCount`, `open`), `review.history`; REV-3's edit mode (`reviewDayRoute(date)?item=`); USE-6's SC-02 (`?sheet=shift&id=`); USE-3's sessions; SET-6's `settingsWeekRoute`; `@syn/ui` `HabitStrip` (`days`, `dayLabels`, `credit`, `counted`, `layout`, `size`), `StripSquare`, `TemplateUsageRow`, `CategoryBar` (`segments`), `BigNumber size="week"`, `FormulaSentence`, `FactLine`, `DayOutcomeRow form="long"`, `ShiftRow`, `ListRow`, `GroupHeading`, `AppHeader`, `ScreenFrame prose`, `EmptyState`, `SkeletonBlock`; `DAY_LABELS` fixture (Mon…Sun — put the real one in `copy.ts`).
- **What this slice is NOT (binding):** no writes; no N7 (Phase 2 notification, with USE-8's Phase-2 senders); no comparison to a previous week; no trend.

**Rulings this slice makes (labelled, logged):**

- **The Week Review is a feature folder** `components/review-week/{review-week.tsx, habit-detail.tsx, copy.ts, index.ts}` rendered by `/review/week/{week}` and `/review/week/{week}/habit/{id}` (WR-02 is a route — cross-cutting §4.1 — rendered as a screen on compact and as a right panel over WR-01 on wide, the same `ResponsiveSheet` pattern with the URL as the state). Logged.
- **Time by category sums `timer_sessions` of the week's items grouped by the habit's current category** (Epic 3 §8 call 2; an item with no habit or no category is *No category*). REV-1's `categories` segments carry `minutes`; the share is computed by the composite or here — here, as `{share}%` in the legend list. Logged.
- **Strips render `HabitStrip layout="inline"` on wide and `"stacked"` on compact**, `size` 16 on compact. Logged.
- **WR-02's *Last 4 weeks: {credit} of {counted}*** is one extra `computeAdherence` over four `review.week` unions — `review.habitWeek({ week, habitId })` returns the seven `DayOutcomeRow` inputs and the four-week pair. Logged.
- **The week closes** when Sunday's day is closed and every planned day has `reviewed_at`; REV-1's `open` is that predicate; *Week closed {date}* prints Sunday's `closed_at` date. Logged.

## Experience & states

### WR-01 (`/review/week/{week}`)

`AppHeader` title *{Mon date} – {Sun date}* with `subtitle` *{reviewed} of {planned} days reviewed* (+ *so far* while open), `onBack`. `ScreenFrame prose`. `BigNumber size="week"` + `FormulaSentence` (over reviewed days) + `FactLine` *{n} days not yet reviewed aren't in this.* when `unreviewedCount > 0` · *By priority — …* · *Off-schedule: {moved} of {done} done.* Sections (`GroupHeading` each):

- *Templates* — `TemplateUsageRow name used target` per template applied or targeted; no marker.
- *Habits* — `HabitStrip` per habit assigned at least once, sorted by `credit / counted` ascending, `dayLabels` Mon…Sun, `onOpen` → `reviewWeekHabitRoute(week, id)`.
- *Deep work* — `ListRow`s: icon · title · *{sessions} sessions · {total} min* · *{done} of {counted}*.
- *Tasks* — one `ListRow` *{done} done · {carried} carried into next week* → WR-03.
- *Shifts* — one `ListRow` *{n} shifts · +{total} min · most often: {reason}* → WR-04 (absent when 0).
- *Time by category · from timers* — `CategoryBar segments` then a legend list: name · *{min} min* · *{share}%* (`No category` for uncategorised) and the line *Items without timed sessions aren't included.*
- Footer when closed: `Text tone="secondary"` *Week closed {date}*.

No planned days: `EmptyState text="Nothing was planned this week."` and no sections.

### WR-02 (`/review/week/{week}/habit/{id}`)

Header: icon · title · *{credit} of {counted} this week*; the strip again at 24px; seven `DayOutcomeRow form="long"`: weekday · scheduled time · outcome (*done 7:24* · *done 14:52 · moved from 7:45* · *missed — something came up: long call · not counted* · *missed — planned it wrong: slept in · counts half* · *missed — didn't do it* · *traded up: stayed on Deep work · not counted* · *cut when shifted +60 · slept in · counts half* · *pending* · blank days *not assigned* muted) · minutes when sessions · quantity when captured · `onOpen` → `reviewDayRoute(date)?item={itemId}` (REV-3's edit mode, scrolled). Beneath: `FactLine` *Last 4 weeks: {credit} of {counted}*.

### WR-03 (`?sheet=carried` over WR-01)

`ResponsiveSheet` title *Carried into next week* · `ListRow`s: icon · title · *first assigned {date}* · *carried {n} times* (read-only) · link *Open next week* → `settingsWeekRoute(nextWeek)`. Empty: *Nothing was carried.*

### WR-04 (`?sheet=shifts` over WR-01)

`ResponsiveSheet` title *Shifts* · `ShiftRow weekday deltaMin atLabel reason cutCount onOpen?` per shift (`onOpen` → SC-02 only when the shift's day is today) · summary `Text` *{n} shifts · +{total} min · reasons: {reason} ×{k}, …*. Empty: *No shifts this week.* `[COPY — needs Vesper sign-off: WR-04 lists an empty state without a sentence]`.

**States (exhaustive):** WR-01: open (*so far*) · closed · no-planned-days · loading (skeleton strips) · offline (cached) · error. WR-02: loading · loaded · offline. WR-03/04: list · empty · loading.

**Failure / edge states:** a habit archived mid-week → its strip still renders from the items' snapshots (title from the snapshot, icon too) · a template archived after use → still listed by name · a category deleted mid-week → its minutes fall into *No category* (the join is to the current category; §8.1 says past reports keep the name — **ruling:** the legend uses the category's name at read time; a deleted category has none; log as `[REVISIT: snapshot category name on the item if this reads wrong]`).

## Non-negotiables (this slice)

- **No trend, no comparison, no colour on an outcome.** The strip's register is neutral; the category bar's hues are categories, not outcomes.
- **Every number prints its sentence.** `BigNumber` never without `FormulaSentence`.
- **Sorted by what slipped.** Never alphabetical.
- **Reviewed days only** in the number, with the line saying what is left out.
- **No coach sentence.** Counts and lists; conclusions are the reader's.

## Data & AI

**Schema changes: none.**

**Tables:** read only, through REV-1's models.

**Placement:** `review.habitWeek` on the review router with `services/review/habit-week.ts`; feature folder `components/review-week/`; pages replace `/review/week/[week]` and `/review/week/[week]/habit/[id]` placeholders.

**tRPC / validators:** `review.week` (REV-1) · `review.habitWeek` (`weekKeySchema` + id).

**AI notes:** **None.**

## Accessibility

- `HabitStrip` squares already carry labels (*Tuesday, done*); the row's `onOpen` is a button named by the habit and its ratio.
- `CategoryBar` is decorative with the legend as its text alternative (`aria-hidden` on the bar, the list is the content).
- The week header's number and sentence are one region for AT (as DR-07).
- WR-02's rows are buttons named by weekday and outcome.
- Tooltips on squares appear on focus as well as long-press.

## Acceptance criteria (observable — a week with three reviewed days, one pending, one unplanned; habits with mixed outcomes; timer sessions in two categories)

1. `/review/week/{week}` shows the range, *3 of 4 days reviewed · so far*, the number over the three with its sentence and *1 days not yet reviewed aren't in this.*, the bands, off-schedule. *(Vesper.)*
2. *Templates* lists each with *{used} of {target}* or *used {n}*; no marker.
3. *Habits* strips render seven squares each with the right glyph per day (done · done-moved dot · not-counted outline · half · didn't-do · blank · pending hatched), the right accessible labels, and *{credit} of {counted}*; the order is ascending by ratio (the worst first). *(Vesper.)*
4. *Deep work* rows show sessions and minutes; *Tasks* shows *{done} done · {carried} carried into next week*; *Shifts* shows the summary (absent with none).
5. *Time by category · from timers* shows the bar and a legend with minutes and shares summing to 100 (±1), *No category* for uncategorised sessions, and the exclusion line.
6. Tapping a strip opens WR-02 (a screen on compact, a panel on wide) with the strip, seven outcome rows in the document's wording, minutes and quantity where present, and *Last 4 weeks: {c} of {n}*; a day row opens DR-01 in edit mode scrolled to the item.
7. *Tasks* → WR-03 lists carried tasks with first-assigned dates and counts and *Open next week*; *Shifts* → WR-04 lists shifts with the summary; a shift on today opens SC-02.
8. After SQL-closing Sunday and reviewing every planned day, the subtitle drops *so far* and the footer reads *Week closed {date}*.
9. A week with no planned days shows *Nothing was planned this week.* and no sections.
10. `grep -i "last week\|trend\|streak" apps/web/components/review-week` returns nothing.
11. `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` pass (four separate commands).

## Likely-relevant technical notes (ADVISORY — dev decides)

- `HabitStrip`'s `days` is a fixed 7-tuple; REV-1's model already emits it.
- The share: `Math.round(minutes / total * 100)` with the largest-remainder fix so the legend sums to 100.
- WR-02 on wide as a panel: the page renders WR-01 with the panel open by URL; on compact, a full screen with back to the week.

## Dev's call

Largest-remainder vs plain rounding on the shares · whether WR-03/04 are sheets (recommended) or routes.

## Out of scope

- **N7** — Phase 2, with USE-8's Phase-2 senders.
- **A month or year view** — never in v1.
- **Any comparison or trend** — never.

## Depends on

- **REV-3** — edit mode for WR-02's day rows; history's week rows link here. Complete in `PROGRESS.md`.
- **USE-3** — timer sessions for time by category. Complete in `../epic-2-in-use/PROGRESS.md`.

## Recommended execution

**Sonnet.** The arithmetic is REV-1's; this is broad composition against precise reads with one sort rule and one share rule. The failure mode of choosing down is a strip in the wrong register or an alphabetical sort — both are acceptance criteria.

---

### Kickoff (paste into the session)

> Build **REV-4 — Week Review: WR-01, WR-02, WR-03, WR-04** (attached spec). Model: **Sonnet**. **No trend, no comparison, no colour on an outcome; every number with its sentence; sorted by what slipped; reviewed days only, with the line that says so.**
> Attach/read first, in order: this spec · Epic 3 §3 (WR-01…04), §5, §6, §8 calls 1–2 · official spec §0.3 R6, §7.5, §7.7, §9.4 · `apps/web/AGENTS.md` · root `AGENTS.md` · `docs/specs/README.md` § Placement rules · REV-1 (`review.week`, `ReviewWeekView`) · REV-3 (edit mode with `?item=`) · USE-6 (SC-02) · `packages/ui/src/composed/display/{habit-strip,template-usage-row,category-bar,day-outcome-row,big-number}/` and their stories · this track's `DEVIATIONS.md` + `TECHNICAL-DECISIONS.md` · `docs/specs/infrastructure/DEVIATIONS.md`.
> Close in three places. Run `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` as separate commands.
