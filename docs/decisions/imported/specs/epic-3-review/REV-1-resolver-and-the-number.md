# REV-1 — The resolver and the number: credit, counted, bands, off-schedule, traded-up verification, and the day and week read models

**Epic:** REV — Review · **Phase 0** · Size: L
**Slice type:** Contract — pure arithmetic over rows, plus two read models. No screen. The risk class is *a number that lies*: a trimmed item counted, a pending item scored, a traded-up verdict frozen, a half rounded wrong, a band that hides a missed 7.
**Vigil:** none. **Mason review:** the resolver cases (AC 1–10) — run, not read.

**Status:** Complete (2026-09-05)

> **Mason — arithmetic review.** Official §7.3 is nine lines of pseudocode and Epic 3 §5 is a nine-row table. Every row gets a case below. Paste the outputs in the closing note.

---

## Outcome

Given a day's items with their misses, the system can say what each contributed — 1, ½, 0, or nothing — and why, in the words the review will print; sum them into one percent with its sentence; break it down by priority band; count the off-schedule done items; and do the same over a week's reviewed days. Given a date it returns everything the Day Review renders (undone items with their decision state, cut items with their inherited reason, done items, reflections, the summary line) and, once finished, the number with its terms. **No screen changes.** REV-2 renders the day; REV-4 the week.

## Why / intent

- **Official spec §7.3** — the resolver, verbatim: `not_assigned → excluded`; `circumstance → excluded`; `stayed_on_important` with a traded item done and `priority >= item.priority → excluded`, else `0.5`; `scoping → 0.5`; `chose_not_to → 0`; done (on or off schedule) `→ 1`; `pending_review → excluded until resolved`; `carried → excluded today; scored on the day it resolves`. §7.4 — `adherence = sum(credit) / count(items not excluded)`, whole percent, shown with its sentence; *Off-schedule: {moved} of {done} done.*; *By priority — high (5–7) · mid (3–4) · low (1–2)*. §0.3 R1, R2, R6. §3.11 no cache. §6.3 off-schedule derived. §6.5 shift-cut inheritance.
- **Epic 3 §5** — the credit/counted table restated "so the tech spec inherits one definition"; `adherence = round(sum(credit) / count(counted) × 100)`; the week is the same arithmetic over its reviewed days' items; every display prints its sentence. **DR-07's reads** — the sentence's shape: *{d} done, {s} planned wrong (½), {c} didn't do (0), {e} not counted → {credit} / {counted} = {adherence}%.*, terms with zero omitted; counted = 0 → *Nothing was counted today.*; all done → *{d} done → {d} / {d} = 100%.*; the four fact lines (shifts, carried, not assigned). **WR-01** — computed over reviewed days only; *{n} days not yet reviewed aren't in this.*; *so far* while open. **DR-04** — an active traded item is *counts half — finish it and this changes*.
- **Ground truth:** SET-1's `day_items`, `misses`, `shifts`, `days`; USE-1's `DayView`, `deriveItemState`, `isOffSchedule`, `weekDates`; `@syn/ui`'s `FormulaTerm` (`count`, `label`, `weight?: "½" | "0" | "not counted"`), `BigNumber value`, `FormulaSentence terms credit counted percent`, `DecisionVerdict`, `WEIGHT_PHRASE`, `StripState`, `DecisionState`, `ReviewMode`; `DECISION_PANEL_COPY`.
- **What this slice is NOT (binding):** no writes; no screen; no reflection logic (reflections never affect the number).

**Rulings this slice makes (labelled, logged):**

- **`computeAdherence` in `@syn/utils/review/adherence.ts`** takes `ScoredItem[]` — `{ id, priority, done, offSchedule, assignmentState, completionState, miss: { tier, reasonKey, tradedUp: { done, priority } | null } | null }` — and returns `{ credit, counted, percent: number | null, terms: FormulaTerm[], bands: { high, mid, low }: { credit, counted } | null, offSchedule: { moved, done }, perItem: Record<id, { credit: number | null, verdict: DecisionVerdict | "done" | "excluded" | "pending" }> }`. `percent = counted === 0 ? null : Math.round(credit / counted * 100)`. Logged (`TECHNICAL-DECISIONS.md`).
- **Traded-up is resolved from the traded item's current row.** Logged.
- **`terms` order is the sentence's:** done · planned wrong (½) · didn't do (0) · not counted; a term with count 0 is omitted (the composite also omits; compute it here so the API and the composite agree). *not counted* is the sum of circumstance + traded-up-verified; *planned wrong* is scoping + traded-up-unverified. Logged.
- **Cut-by-shift items score by their `misses.tier`** through the same rows (R1) — they are not a special case in the resolver, only in the read model's grouping. Logged.
- **The week's number is `computeAdherence` over the union of reviewed days' items** (`days.reviewed_at IS NOT NULL`), never an average of day percents. Unreviewed and pending days are excluded with the count for the sentence line. Logged.
- **Deferred (*not today*) items are ordinary undone items** to the resolver — they are decided in the Day Review like any other; the `deferred_at` only orders them last. Logged.
- **`getReviewDay(rls, userId, date, now)`** returns `ReviewDayView`: `{ dateKey, mode: ReviewMode, closedAt, closeReason, reviewedAt, reviewEditedAt, summary: { done, assigned, moved, notAssigned, cut }, toDecide: DecisionItemView[], cut: DecisionItemView[], doneItems: DayItemView[], reflections: { rateable, rated, items: ReflectionItemView[] }, shifts, result: AdherenceResult | null, pendingCount, wakeAnchorItemId }` where `DecisionItemView = { item: DayItemView, state: DecisionState, decision: Decision | null, verdict: DecisionVerdict | null, carriedCount, carriedSince, shiftContext }`. `result` is non-null only when the day is reviewed (`reviewed_at`) — the number comes after the decisions. `mode` is `live` (open day), `pending` (closed with `pending_review` items), `edit` (reviewed). Logged.
- **`getReviewWeek(rls, userId, weekKey, now)`** returns `ReviewWeekView` for REV-4 and RV-00's *This week* region: `{ weekKey, rangeLabel, planned, reviewed, open, result, unreviewedCount, templates: TemplateUsage[], habits: HabitStripView[], deepWork, tasks: { done, carried }, shifts: { count, totalMin, mostCommonReason }, categories: CategorySegment[] }` — built here so RV-00 (REV-2) and WR-01 (REV-4) read one model. `HabitStripView.days` is seven `StripState`s from the per-item verdicts: done → `done`; done + offSchedule → `done-moved`; excluded by circumstance or traded-up → `not-counted`; half → `half`; 0 → `didnt-do`; pending → `pending`; not assigned or no item → `not-assigned`. Logged.
- **History** (`getReviewHistory(rls, userId, { before, limit })`) returns weeks newest first with each day's status word and number, paginated by week. Logged.

## Behavior & states

**No surface.**

### `packages/utils/src/review/`

- `adherence.ts` — `computeAdherence`, `creditFor(item)`, `bandOf(priority)` (high 5–7, mid 3–4, low 1–2), `formulaTerms(result)`.
- `strip.ts` — `stripStateFor(verdict, item)`.
- Both pure, exported from the barrel.

### `packages/api/src/services/review/`

- `to-scored.ts` — rows → `ScoredItem[]` (joins `misses` and, for `traded_up_item_id`, the traded item's `completion_state` and `priority`; `offSchedule` via USE-1's `isOffSchedule`; `done` = `completion_state = done`).
- `get-review-day.ts`, `get-review-week.ts`, `get-review-history.ts` as ruled; `to-view.ts` for `DecisionItemView` (reason labels via SET-9's reasons; `carriedCount`/`carriedSince` by following `carried_from_item_id` back).
- `services/review/decision-state.ts` — `decisionStateFor(item, miss, dayMode)`: undecided (no miss, not carried) · decided (a miss with `resolved_by = day_review`, or `carried`) · resolved-by-shift (a miss with `resolved_by = shift`) · changed (`shift_id` set and `resolved_by = day_review`) · pending (undecided on a closed day).

### `packages/api/src/routers/review.ts`

`review.day({ date })` · `review.week({ week })` · `review.history({ before?, limit })`. Read-only in this ticket.

**States (exhaustive), per item verdict:** done · done-moved · excluded (circumstance) · excluded (traded up, verified) · half (scoping) · half (traded up, unverified) · zero (chose not to) · pending · carried (excluded today) · not assigned (excluded) · cut (by tier).

**Failure / edge states:** a miss whose `reason_key` no longer exists in `reasons` (archived) → the label from the miss's own `reason_text` or the archived row's label (archived rows are still rows; read them) · `traded_up_item_id` pointing at a deleted one-off (`SET NULL`) → treated as unverified (half) with the decided line reading *stayed on something not on the list* `[COPY — needs Vesper sign-off]` · a day with `reviewed_at` but items later undone from the List → `result` recomputes from the rows (the number changes; `review_edited_at` was stamped by USE-2).

## Non-negotiables (this slice)

- **Nothing stored.** No column, no cache.
- **Excluded is excluded from `counted`, not credited 0.** The denominator is *items not excluded*.
- **Half is 0.5 and the percent rounds once, at the end** (`Math.round`), never per item.
- **Traded-up reads the traded item's current state.**
- **The week is the union, not an average.**
- **Reflections never enter the resolver's inputs.**

## Data & AI

**Schema changes: none.**

**Tables:** `days`, `day_items`, `misses`, `shifts`, `reasons`, `habits`, `templates`, `timer_sessions`, `categories` (read).

**Placement:** `packages/utils/src/review/` (rule 6); `packages/api/src/services/review/` (rules 4, 5); router `review.ts` (rule 3); validators `packages/validators/src/review.ts` (`reviewDayInput`, `reviewWeekInput`, `historyInput`).

**tRPC / validators:** as above.

**AI notes:** **None.**

## Accessibility

**None — no surface in this slice.**

## Acceptance criteria (observable — the pure function in a scratch script; the read models against the local tier with SQL-built days)

1. Twelve items: 9 done (2 off-schedule), 1 scoping, 1 chose_not_to, 1 circumstance → `credit 9.5`, `counted 11`, `percent 86`, terms `[9 done, 1 planned wrong (½), 1 didn't do (0), 1 not counted]`, `offSchedule { moved: 2, done: 9 }` — official §7.4's example exactly. *(Mason.)*
2. A `not_assigned` item is absent from `counted` and from every term; a `pending_review` item likewise; a `carried` item likewise on its day. *(Mason.)*
3. Traded-up: missed priority 5, traded item priority 7 and done → excluded (*not counted*); traded priority 4 and done → half; traded priority 7 and `active` → half; the same traded item later `done` → excluded on the next call with no other change. *(Mason.)*
4. A cut-by-shift item with `misses.tier = scoping` scores ½ and counts; with `circumstance` it is excluded. *(Mason.)*
5. Bands: items with priorities 7, 6 (done), 5 (½), 4, 3 (done, 0), 2 (½), 1 (done) → high `2.5 of 3`, mid `1 of 2`, low `1.5 of 2`; a band with no items is null (omitted from the line). *(Mason.)*
6. All done: `percent 100`, terms `[d done]`; nothing counted: `percent null`, terms `[]`. *(Mason.)*
7. Rounding: 2 of 3 → 67; 1 of 3 → 33; 2.5 of 3 → 83 (not 84). *(Mason.)*
8. `review.day` for a live day with two undone items returns `mode: "live"`, `toDecide` of two with `state: "undecided"`, `result: null`, `summary` counts, `doneItems`; after SQL-marking a miss on one, its `state: "decided"` with the decided text inputs; for a closed day with pending items, `mode: "pending"` and `pendingCount`; for a reviewed day, `mode: "edit"` and `result` non-null.
9. `review.week` over a week with three reviewed days and one pending: `result` computed over the three, `unreviewedCount 1`, `open: true` when Sunday has not closed; `habits[]` strips show the right `StripState` per day including `not-assigned` on unplanned days; sorted by `credit / counted` ascending. *(Mason.)*
10. `review.history` returns weeks newest first with day rows (`{ date, status: "reviewed" | "pending" | "not-reviewed" | "nothing-assigned", percent }`), paginated by `before`. As user B, every model is B's.
11. `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` pass (four separate commands).

## Likely-relevant technical notes (ADVISORY — dev decides)

- Keep `computeAdherence` free of `Date`; `offSchedule` is a boolean computed by the caller with USE-1's helper.
- The traded item join is a self-join on `day_items`; fetch the day's items once and resolve in memory.
- `carriedSince`: walk `carried_from_item_id` until null and take that item's day's date; cap the walk at 60.
- `mostCommonReason` ties: the earliest shift's reason.

## Dev's call

`ReviewDayView` / `ReviewWeekView` as `types.ts` beside the services · the history page size (recommend 8 weeks).

## Out of scope

- **Rendering** — REV-2, REV-3, REV-4.
- **Writing decisions** — REV-2.
- **Export** — SET-10 (it exports rows, not numbers).

## Depends on

- **SET-1** — the tables. Complete in `../epic-1-setup/PROGRESS.md`.
- **USE-1** — `isOffSchedule`, `weekDates`, `DayView` mapping. Complete in `../epic-2-in-use/PROGRESS.md`.

## Recommended execution

**Opus.** Ten cases where an off-by-one in the denominator or a frozen verdict produces a plausible wrong percent. A cheaper model credits excluded items 0 and the number is wrong on every day with an excused miss.

---

### Kickoff (paste into the session)

> Build **REV-1 — The resolver and the number** (attached spec). Model: **Opus**. **Nothing stored; excluded leaves the denominator; half is 0.5 rounded once at the end; traded-up reads the traded item's current row; the week is the union.**
> Attach/read first, in order: this spec · official spec §0.3 R1, R2, R6, §3.11, §6.3, §6.5, §7.3, §7.4 · Epic 3 §5, DR-07's reads, WR-01's reads, DR-04's rule · `apps/web/AGENTS.md` · root `AGENTS.md` · `docs/specs/README.md` § Placement rules · USE-1 (`isOffSchedule`, `weekDates`, `DayView`) · SET-9 (`reason.list`) · `packages/ui/src/composed/display/big-number/` (`FormulaTerm`) and `control/decision-panel/` (`Decision`, `DecisionVerdict`) · `packages/types/src/domain/ui-state.ts` (`StripState`, `DecisionState`, `ReviewMode`) · this track's `DEVIATIONS.md` + `TECHNICAL-DECISIONS.md` · `../epic-2-in-use/DEVIATIONS.md` · `../epic-1-setup/DEVIATIONS.md` · `docs/specs/infrastructure/DEVIATIONS.md`.
> Run the ten cases and paste the outputs. Close in three places. Run `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` as separate commands.
