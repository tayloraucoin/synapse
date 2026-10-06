# USE-6 — Shift my day: SF-01, the late offer, LS-03 as a consequence, and the 10-minute undo — Phase 2

**Epic:** USE — In Use · **Phase 5 (Phase 2 per official §12; does not gate launch)** · Size: L
**Slice type:** A three-step sheet over a day-level mutation with a required reason, a fit computation, and a true undo window. The risk class is *a shift that lies*: a hard item moved, a cut item scored without its reason, an undo that resurrects a cut item someone already did anyway, overflow computed against the wrong anchor.
**Vigil:** review by inducing — shift with no overflow; shift with overflow against a hard item; shift past `day_close_time`; shift with a done item and a running timer; undo within 10 minutes after *Do it anyway* on a cut item (must refuse); a second shift the same day. QA states which of the six it exercised.

**Status:** Complete (2026-09-06)

> **Vigil — consequence review.** Every shift writes a `shifts` row, moves soft items, and may write `misses` rows. Verify each against the rows and against the List and the Schedule, not the sheet.

---

## Outcome

Running late, a person opens *Shift my day* from the day header (or from the once-a-day *Running late? Shift the day* line) and answers three things in one growing sheet: by how much, why, and which of the items that no longer fit to cut — with the lowest-priority ones pre-selected and a live tally. *Shift and cut 2* moves every flexible item, leaves fixed ones, records the shift, marks the cut items as cut with the shift's reason and tier, and shows a 10-second undo toast; the Schedule gains a band and the header reads *Shifted +60 min*. Within ten minutes the band's sheet offers *Undo this shift*. Cut items sit under *Cut when shifted* with *Do it anyway* (USE-2 built the action). **Nothing about the Day Review changes here** — REV-2 already renders cut items as resolved panels with *Change*.

## Why / intent

- **Official spec §5.6** — the entry points; the three steps with their reads; hard items never move; a hard item made already-passed is flagged, not cut; the result (a Shift row, cut items `cut_by_shift` + `missed` + a Miss inheriting reason and tier, the band, the re-sort, 10-second undo, then a logged event). §6.5 — shift-cut inheritance. §6.6 — sort ascending for cut suggestions. §0.3 R1 — cuts inherit the shift's reason and tier; the resolver reads them.
- **Epic 2 §6 (SF-01, §3.6 → §6.1 the late offer), §2 LS-03, §5 SC-02's undo** — every read, interact, rule, and state: the amount targets and the custom bounds (5–600, step 5, *Between 5 and 600 minutes.*); the reason rows in tier groups with *Other* (1–80 + a tier) and the muted *Items cut by this shift get this reason.*; *Stayed on something more important* absent (§12 call 7); step 3's summary, overflow list with *Cut* checkboxes pre-checked lowest first, the live line (*Cutting {c} frees {f} min · {r} min still over* / *That fits.* / *{r} min over — the day will run long*), the already-passed hard list; done and running items do not move (*{d} done items stay where they were.*); a second shift compounds; overflow against hard anchors in time order and against `day_close_time`; the late offer's trigger and copy; SC-02's *Undo this shift* within 10 minutes "only if no cut item has since been completed via *Do it anyway*" (§12 call 6).
- **Cross-cutting §8.1** — a shift: undo within 10 min; after that only a further shift; both recorded.
- **Ground truth:** USE-5's canvas and SC-02 sheet; USE-3's `day-header-sheet/` (the `hidden` row to reveal) and the store (a running item does not move); USE-2's LS-03 expander and `item.doAnyway`; USE-1's `DayView`, `compareForTrim`, `dayWindow`; SET-9's `reason.list` (`byTier`); SYS-1's `StatusLineSlot` (`lateOffer`, `onShiftDay`) and `shell.status`; `@syn/ui` `ResponsiveSheet size="tall"`, `LargeTargetRow`, `NumberUnitInput`, `TierRadioRows` (with `reasons`), `ReasonChips`, `OverflowCutList` (`items: OverflowItem[]`, `cut`, `overMin`, `passedHard`), `Button`, `Text`, `toastUndo`; `SHIFT_MIN/MAX`, `UNDO_LONG_MS`, `SHIFT_UNDO_WINDOW_MS`.
- **What this slice is NOT (binding):** no trim (USE-7); no change to the resolver (REV-1 already reads `misses.tier`); no reason editing.

**Rulings this slice makes (labelled, logged):**

- **The fit is computed on the server and previewed by the same function**: `shift.preview({ date, deltaMin })` returns `{ moving: n, staying: d, overflow: OverflowItem[], passedHard: DayItemView[], suggestedCut: id[], overMin }`; `shift.apply({ date, deltaMin, reasonKey | reasonText+tier, cut: id[] })` recomputes with the same service and refuses (`CONFLICT`) if the day changed since the preview (an item done meanwhile) — the sheet re-previews and shows the new list. One function, `services/day/shift-fit.ts`. Logged (`TECHNICAL-DECISIONS.md`).
- **Overflow rule, precisely:** after moving every soft, undone, not-running, assigned item by `delta`, walk the day's fixed hard anchors in time order and `day_close_time`'s window end; a soft item overflows if its new `[start, end)` overlaps a hard item's `[start, end)` or ends after the window end. Suggested cuts: overflowing items in `compareForTrim` order until no overflow remains (removing an item may resolve later overlaps — recompute after each). Logged.
- **Undo is `shift.undo({ shiftId })`**: allowed only while `now − shifts.at ≤ 10 min` and no cut item of this shift has `assignment_state = assigned` (i.e. none was *Done anyway*); it restores every moved item's `scheduled_start/end` by `−delta` (from the shift's own `delta_min`; a second shift makes the earlier one un-undoable — refuse with `CONFLICT` when a later shift exists), deletes the cut items' `misses` rows, restores `assignment_state = assigned` and `completion_state = upcoming`, deletes the `shifts` row. The 10-second toast and the sheet's action call the same procedure. Logged.
- **The late offer's eligibility is `shell.status.lateOffer`** (SYS-1 declared the field; this ticket implements it): live day, not closed, no shift today, the first fixed item (by `scheduled_start`) is ≥ 30 minutes past its start and `upcoming` with no session. Dismissal is client-side for the day (`useDismissed("late-offer", "day", dayKey)` — SYS-1's slot already does this). Logged.
- **Reason rows in the shift are the person's set minus `stayed_on_important`,** grouped by tier with the tier definitions as headings (`TierRadioRows` with `reasons`), plus *Other* (`OTHER_REASON_KEY`) which reveals the text and a tier radio. Logged.
- **DH-01's *Shift my day* row un-hides** (USE-3 left it `hidden`); when the day is closed it stays hidden. Logged.

## Experience & states

### SF-01 Shift my day (`?sheet=shift`)

`ResponsiveSheet size="tall"` title *Shift my day*; the body grows through three labelled regions (*1 of 3* … as `Text variant="caption"`):

**Step 1 — Amount.** *By how much?* · `LargeTargetRow options=[+15, +30, +60, Custom]`; *Custom* reveals `NumberUnitInput unit="min" min={SHIFT_MIN} max={SHIFT_MAX}` (step 5) with the error *Between 5 and 600 minutes.*; choosing reveals step 2 and calls `shift.preview`.

**Step 2 — Reason.** *Why?* · `TierRadioRows reasons={byTierWithoutStayedOn} label="Why?" onReasonSelect otherText onOtherTextChange` — the tier rows act as group headings with definitions; a reason chip decides; *Other* needs text (1–80) and a *Counts as* tier before step 3 appears · muted *Items cut by this shift get this reason.*

**Step 3 — Fit.** *What changes* · summary `Text`: *{k} flexible items move +{n} min. Fixed items stay.* (+ *{d} done items stay where they were.* when d > 0) · then *Everything still fits.* **or** *{m} items no longer fit before {anchor title or "the day closes"}* · `OverflowCutList items cut onChange overMin passedHard` (its live line: *Cutting {c} frees {f} min · {r} min still over* / *That fits.*; unchecking below zero over: *{r} min over — the day will run long*; the passed-hard list *Already passed — will show as late:*) · footer: **Shift and cut {c}** (**Shift** when c = 0; primary) · **Cancel** (ghost).

On **Shift**: optimistic close; `shift.apply`; the List re-sorts, the header reads *Shifted +{n} min* (compounded), the Schedule gains a band; `toastUndo("Shifted +{n} min", UNDO_LONG_MS)` → `shift.undo`. Error: *Couldn't shift. Nothing changed — try again.* Offline (Phase 1 rule, which this Phase-2 ticket keeps): the primary is disabled with the standard line.

### The late offer (status line)

`shell.status.lateOffer: boolean` computed as ruled; SYS-1's slot renders *Running late?* [*Shift the day*] with *Dismiss for today*; the action opens `?sheet=shift`. Appears at most once a day; carries no colour, count, or urgency.

### SC-02 addition

*Undo this shift* (ghost) appears when `shift.canUndo({ shiftId })` is true (within 10 min, no later shift, no cut item done anyway); tapping calls `shift.undo` and closes; the toast and the action are the same procedure.

### LS-03 (already built)

The expander's heading line reads the shift's `deltaMin`, `at`, and reason (USE-2 renders from `DayView.shifts` and the cut items); *Do it anyway* is USE-2's `item.doAnyway`. **This ticket adds nothing there** except verifying AC 8.

**States (exhaustive):** step 1 · step 1 custom · step 2 · step 2 other · step 3 fits · step 3 overflow · step 3 over-and-allowed · applying · error · preview-stale (re-preview) · offline · undo-window · undo-refused (the action absent). Late offer: eligible · dismissed · not eligible.

**Failure / edge states:** delta pushes a soft item's start before *now*? (moving later never does) · a soft item overlapping a hard one **before** the shift (allowed by the editor) → it is not counted as new overflow unless the shift made it worse — **rule:** overflow is evaluated on the post-shift positions only, so a pre-existing overlap that persists counts; document this in the service and mark `[REVISIT: if it reads as a false cut in use]` · the window end passes during step 3 → apply recomputes; the preview-stale path · undo after *Do it anyway* → `CONFLICT` with the sentence *This shift can't be undone now.* `[COPY — needs Vesper sign-off]`.

## Non-negotiables (this slice)

- **Hard items never move.** Not by a shift, not by an undo.
- **Done and running items never move.**
- **A shift needs a reason before it can be applied.** The primary is disabled until step 2 is answered.
- **Cut items get a `misses` row with the shift's tier and reason and `resolved_by = shift`, `shift_id` set.** The resolver scores them by that tier (R1).
- **Undo is a true reversal within 10 minutes, refused after a later shift or a *Do it anyway*.** After that a reversal is another shift, and both are recorded.
- **`Stayed on something more important` is never offered here.**
- **Every string is Epic 2 §6 verbatim**; one gap is marked.

## Data & AI

**Schema changes: none.**

**Tables:** `shifts` (insert, delete on undo) · `day_items` (update `scheduled_start/end`, `assignment_state`, `completion_state`) · `misses` (insert for cuts; delete on undo) · `days` (read) · `reasons` (read via SET-9).

**Placement:** router `shift.ts` (rule 3): `shift.preview`, `shift.apply`, `shift.canUndo`, `shift.undo`; services `services/day/{shift-fit,apply-shift,undo-shift,late-offer}.ts`; validators `packages/validators/src/shift.ts` (`shiftAmountSchema` with *Between 5 and 600 minutes.*, `shiftReasonSchema` — key or text 1–80 + tier); feature folder `components/shift-sheet/`; `shell.status.lateOffer` implemented in SYS-1's `services/shell/status.ts`; DH-01's row un-hidden in `components/day-header-sheet/`; SC-02's action in `components/schedule-canvas/shift-detail-sheet.tsx`.

**tRPC / validators:** as above.

**AI notes:** **None.**

## Accessibility

- Each step's label (*By how much?*, *Why?*, *What changes*) is an `h3`; the step counter is text.
- `LargeTargetRow` and `TierRadioRows` are radiogroups; *Custom* moves focus into the number field.
- `OverflowCutList`'s checkboxes carry the item title and *cut* in their names; the live line is `aria-live="polite"`.
- The primary's label carries the count (*Shift and cut 2*) so the consequence is in the button's name.
- The late offer's dismiss is labelled *Dismiss for today*.

## Acceptance criteria (observable — a seeded day with hard and soft items, one done, one running; a fixed clock)

1. DH-01 shows *Shift my day*; tapping opens SF-01 at step 1 with the four targets; *Custom* accepts 5–600 in steps of 5 and rejects 3 with *Between 5 and 600 minutes.*
2. Choosing *+60* reveals *Why?* with the tier groups and the person's reasons minus *Stayed on something more important*, plus *Other*; the primary is absent until a reason is chosen; *Other* needs text and a tier.
3. Step 3 for a day where nothing collides reads *{k} flexible items move +60 min. Fixed items stay.* and *Everything still fits.* with **Shift**; applying moves every soft undone item's `scheduled_start/end` by +60, leaves hard, done, and running items, writes a `shifts` row, and shows *Shifted +60 min* [*Undo*] for 10 s; the header reads *Shifted +60 min*; the Schedule shows the band. *(Vigil.)*
4. With a hard 11:00 item, step 3 reads *2 items no longer fit before {title}* and lists them with *Cut* pre-checked lowest priority first and the live line; unchecking one shows *{r} min still over*; **Shift and cut 1** applies: the cut item is `cut_by_shift` + `missed` with a `misses` row (`tier`, `reason_key`, `resolved_by = shift`, `shift_id`); LS-03 lists it. *(Vigil.)*
5. A shift that pushes a soft item past the day's window end lists it as overflow *before the day closes*. *(Vigil.)*
6. A hard item the shift would make already-passed appears under *Already passed — will show as late:* and is not cut.
7. *Undo* on the toast (or *Undo this shift* in SC-02 within 10 minutes) restores every moved time, deletes the misses, restores the cut items to `assigned`/`upcoming`, and deletes the shift; after *Do it anyway* on a cut item, SC-02 shows no undo and `shift.undo` returns `CONFLICT`. *(Vigil.)*
8. A second shift the same day compounds: the header reads *Shifted +90 min*, two bands, and the first shift's undo is refused. *(Vigil.)*
9. With the first fixed item 30 minutes past and untouched, the status line reads *Running late?* [*Shift the day*] with a dismiss; the action opens SF-01; dismiss hides it for the day; after a shift exists it does not appear.
10. Offline: the primary is disabled with the standard line.
11. As user B, `shift.apply` on A's date affects nothing of A's.
12. `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` pass (four separate commands).

## Likely-relevant technical notes (ADVISORY — dev decides)

- `shift-fit.ts` is pure over `DayView`-shaped inputs plus the window end; put the arithmetic in `@syn/utils/day/shift-fit.ts` and have the service call it, so the preview and the apply cannot disagree.
- Keep a `previewHash` (delta + the day's `updated_at` max) on the preview response; `apply` recomputes and compares before writing.
- The undo needs the moved item ids: store them? The document's `shifts` has no list; derive as "soft items on the day whose `scheduled_start − originalScheduledStart` equals the sum of shifts' deltas at the time" — fragile. **Simpler:** the undo subtracts `delta_min` from every soft, undone item on the day that was not cut and not done, which is exactly the set that was moved unless something was done meanwhile (done items do not move back — they are records). Log this as the rule.

## Dev's call

The preview-stale detection mechanism · whether step regions animate in (200 ms, `DURATION_SHEET_MS`) or appear · the `late-offer` computation's placement inside `shell.status` vs a separate procedure.

## Out of scope

- **Trim** — USE-7.
- **The Day Review's *Change* on cut items** — REV-2 (already reads `misses.shift_id`).
- **WR-04's shift list** — REV-4.
- **Offline shift reconciliation** — Phase 2 offline work.

## Depends on

- **USE-5** — the band, SC-02, the canvas. Complete in `PROGRESS.md`.
- **SET-9** — `reason.list`. Complete in `../epic-1-setup/PROGRESS.md`.

## Recommended execution

**Opus.** The fit computation, the cut suggestion loop, the undo's refusal rules, and the compounding second shift are the ticket. A cheaper model moves hard items or undoes a cut someone already did anyway.

---

### Kickoff (paste into the session)

> Build **USE-6 — Shift my day: SF-01, the late offer, LS-03 as a consequence, and the 10-minute undo** (attached spec). Model: **Opus**. **Hard, done, and running items never move; a reason is required; cuts inherit the shift's tier via a `misses` row; undo is true within 10 minutes and refused after a later shift or a *Do it anyway*.**
> Attach/read first, in order: this spec · Epic 2 §6 (SF-01, the late offer), §2 LS-03, §5 SC-02, §12 · official spec §0.3 R1, §5.6, §6.5, §6.6 · cross-cutting §8.1 · `apps/web/AGENTS.md` · root `AGENTS.md` · `docs/specs/README.md` § Placement rules · USE-5 (the canvas, SC-02 — extend) · USE-3 (`day-header-sheet/` — un-hide the row) · USE-2 (LS-03, `item.doAnyway`) · USE-1 (`compareForTrim`, `dayWindow`) · SET-9 (`reason.list`) · SYS-1 (`shell.status`, the slot) · `packages/ui/src/composed/control/{large-target-row,tier-radio-rows,overflow-cut-list}/` · this track's `DEVIATIONS.md` + `TECHNICAL-DECISIONS.md` · `../epic-1-setup/DEVIATIONS.md` · `docs/specs/infrastructure/DEVIATIONS.md`.
> Run the six Vigil paths and state each. Close in three places. Run `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` as separate commands.
