# DYN-6 — Adjust, *Do now*, habit-day edits, and moves: `adjustDay`, `doNow`, `editHabitDay`, `moveItem`, `moveBlock`, and the reflow they share

**Epic:** DYN — Dynamic schedule (UX v1.1) · **Phase 1** · Size: L
**Slice type:** The day-level mutations — every way a set day changes after it is set. One pure function (`computeAdjust`) previewed by the client and recomputed by the server before writing, as USE-6 established; one reflow (`reflowBlock`) shared by four writers. The risk class is *a rewritten record* (a move that touches `original_scheduled_start`, a pin that moves) and *a stale apply* (an Adjust applied to a day that changed between preview and apply).
**Vigil:** induce staleness — preview an Adjust, mark an item done from a second caller, apply; preview, start a timer elsewhere, apply; *Do now* on an item whose slide would cross a pin. State which paths were exercised.

**Status:** Not started

> **Mason — mutation review.** Five writers (`adjustDay`, `doNow`, `editHabitDay`, `moveItem`, `moveBlock`) all re-lay part of a day. Review that the re-lay is one function over `stackBlock` (`reflowBlock`), that none of them ever includes `original_scheduled_start` in an update set, that pins and fixtures are refused by every one of them (not just the one the UI guards), that `adjustDay` recomputes and refuses on staleness exactly as `apply-shift` does today, that the three *how*s (shorten · cut · choose) share `fitToBudget`, and that a `shift` moves `days.work_start_time` while a `refit` never does.

---

## Outcome

A set day can bend without losing its record. **Adjust** takes what happened (a reason chip with its tier), what gives (start work later, or keep the anchor), and how (shorten everything to the range floors then cut, cut some, or choose what stays), shows the proposal, and on *Set* writes one `shifts` row of the right kind, shortens or cuts or slides the remaining items, and never touches a pin, a fixture, or a hard item. **Do now** moves one item to now, starts its timer, slides what follows in its block by the minimum, and reports in one line when the slide would push something into a pin or past a hard anchor. **Edit today's** changes an item's length, time (pinning it for today), priority, or assignment on this day only, with no clamp. **Move item** and **move block** are the Schedule's drag writes: 5-minute snap, re-stack the displaced, refuse pins and fixtures, never overlap. Every one of them leaves `original_scheduled_start` alone, so the ghost and the *moved* count stay honest. After this ships, **the item sheet (DYN-15), the Adjust sheet (DYN-17), the Schedule's drag layer (DYN-16), and the quick-pick's *Shorten to fit* (DYN-14) have services to call.** No UI here; v1.0's `apply-shift` and `apply-trim` stay until DYN-21 but gain no callers.

## Why / intent

- **v1.1 §6.6** — Adjust, the four steps: the reason chip row with the tier travelling (§11.9); *what gives* ordered by anchor direction (soft: *Start work later* first; hard: only *Keep work at 9:00*; depends: both); *how* (shorten everything → R4; cut some; choose what stays with the live budget); the proposal with *Keep instead* (v1 §6.8), *Fits. Work at 9:00.* / *Work moves to 9:40.*; the `useAdjust` logic verbatim: "computes the remaining span to the next hard thing (anchor or pin); shorten = each soft item to `max(duration_min_min, current)` then cut ascending by priority (v1 §6.6 ties) until fits; cut = cut ascending until fits; choose = the person's ticks; slide = a `shifts` row with `kind: shift`. Hard items never trimmed. 10-second undo after Set." Writes: a `shifts` row (`kind`, reason, tier, `cut_item_ids` via misses, `shortened_item_ids`); cut → `cut_by_shift` with a Miss inheriting the tier (v1 R1, §6.5); shortened → `duration_min`; slid → `scheduled_start`. *doesn't-fit-even-cut*: "Set is still allowed; the number is the feedback."
- **v1.1 §6.3 (1)** — *Do now*: "moves the item's `scheduled_start` to now, starts its timer, and slides every later item in the same block by the minimum needed so nothing overlaps; pins and fixtures don't move, and if the slide would push a soft item into a pin or past a hard anchor, the sheet says so in one line … **Do now anyway** (the overflow item becomes not assigned today) · **Adjust instead**. A ghost stays at the original time. No reason is asked (R8)."
- **v1.1 §6.4** — habit-day editing: *Takes* with the range as muted text never a limit (R21); *At* in the stack or a time (pins it for today); *Priority today*; *Leave out today* → not assigned; "Changes the day, not the habit."; writes `duration_min`, `scheduled_start`/`pinned`, `priority`, `assignment_state`; the block re-flows on save.
- **v1.1 §6.5** — drags: 5-minute snap; the displaced re-stack beneath; a band header drag moves the whole block; a pin or fixture → confirm dialog (R22), and a band drag on the morning is offered as Adjust instead; "a drag on an item that hasn't happened is a re-plan: `scheduled_start` moves, `original_scheduled_start` doesn't … counts as *moved* in Review — a count, never a score" (R23); "dropping onto an occupied time inserts, and the occupant slides"; writes `day_items.scheduled_start/end`, `duration_min`, `pinned`; `day_blocks.start/end` on a band drag; never `original_scheduled_start`.
- **v1.1 R4, R7, R8, R21, R22, R23** and **TD-4, TD-6.**
- **v1.1 §2.3** — confirmed, not detected: nothing here runs on a timer; every entry is a call the person made.
- **Ground truth (consumed):** USE-6's `services/day/{apply-shift,shift-fit,undo-shift}.ts` and `utils/day/shift-fit.ts` (the preview-then-apply-with-staleness pattern — **reuse the pattern, not the code**); USE-7's `apply-trim.ts` (*Keep instead* semantics); USE-3's `timer.ts` (`startTimer`), `set-done.ts`; USE-4's `manual-time.ts`; DYN-1's `stackBlock`, `fitToBudget`, `compareForTrim`; DYN-5's `layOutDay`, blocks, `confirmDay`.
- **What this slice is NOT (binding):** no sheet, no drag layer, no status line (DYN-14–17); no removal of the v1.0 services (DYN-21); no change to the resolver or the number (v1 §7.3–7.4 stand — a `refit`'s cuts are misses with the reason's tier, exactly as a shift's).

**Rulings this slice makes (labelled, logged):**

- **`reflowBlock(rls, tx, blockId, { from?: itemId })`** re-lays one block's soft, non-pinned, not-done, not-active items from a given position onward with `stackBlock` and writes only `scheduled_start`/`scheduled_end`. Pins, fixtures, done items, active items, and hard items are fixed points the stack flows around. Every writer in this ticket calls it; nothing else re-lays a block after confirm. Logged.
- **`computeAdjust` is pure** (`utils/day/adjust.ts`): input `{ blocks (remaining items only, minutes), nowMin, anchor: { min, isHard }, direction, what: "slide" | "hold", how?: "shorten" | "cut" | "choose", chosenIds?, keepInstead?: id[] }` → `{ proposal: PlacedItem[] with new durations, shortened: id[], cut: id[], slideMin, newAnchorMin, overMin, fits: boolean }`. The server recomputes on apply and refuses `CONFLICT` if the day's remaining set changed since the preview (same fingerprint rule as `apply-shift`: item ids + states + done). Logged.
- **A `shift` moves `days.work_start_time`** (and the work block's start) by `slideMin` and slides every remaining soft item; the hard anchor becomes today's soft one only if the person chose *Start work later* — the profile's `anchor_direction` is never changed by Adjust. A `refit` writes `delta_min = 0`. Logged.
- **Adjust's scope is "the rest of the day from now to the next hard thing"** — usually the morning to the work anchor; in the evening, activity to wind-down's start. The scope is computed, not chosen; the sheet shows which. Logged.
- **`doNow` is `startTimer` + a move + `reflowBlock(from: item)`**, in one transaction; it refuses on a pinned or fixture item (`BAD_REQUEST` *Fixed things don't move by drag.* — v1.1 §6.5's line, reused `[COPY]`), and returns `{ overflow: DayItemView | null, overflowReason: "pin" | "anchor" | null }` so the sheet can offer *Do now anyway* / *Adjust instead*; `doNowAnyway` = the same plus `assignment_state = not_assigned` on the overflow item. Logged.
- **`editHabitDay` writes `duration_min` unbounded by the range** (validator: 1–480 only); *At* with a clock → `pinned = true, scheduled_start = that instant`; *In the stack* → `pinned = false` and the block re-flows; `priority` today only; *Leave out today* → `assignment_state = not_assigned` (the same state as a trim, v1 R1). The habit is never written. Logged.
- **`moveItem({ id, toMin })`** refuses pins and fixtures unless `confirmed: true` (the dialog's answer; the service still refuses a *fixture* even when confirmed if the fixture is `hard` **and** the person did not confirm — one flag, both cases); snaps to `DRAG_SNAP_MIN`; if the target minute is occupied, the moved item takes it and the occupant and everything after re-stack (never overlap, never multitask by drop). `moveBlock({ blockId, deltaMin })` slides every movable item in the block and the block's own start/end; on the **morning** block the service **allows** it (the UI offers Adjust first, §6.5 — the service is not the UI's guard) and logs nothing (a band drag is a re-plan). Logged.
- **Undo for Adjust is 10 s** (reuse `SHIFT_UNDO_WINDOW_MS` via `ADJUST_UNDO_WINDOW_MS`) and restores durations, assignments, misses, and times from the `shifts` row's stored `before` snapshot (a jsonb `undo_snapshot` on `shifts`? — **no new column:** reuse USE-6's `undo-shift.ts` approach of subtracting the delta from the still-movable set, extended to restore `shortened_item_ids` to their pre-adjust durations, which must therefore be stored: **`shifts.shortened_item_ids` becomes insufficient; ruling: store `shortened: [{ id, fromMin }]` in `shifts.reason_text`? No.** → `[NEEDS DECISION — Mason, BLOCKING for the undo AC only]`: either (a) add `shifts.undo_snapshot jsonb` in `0006` and ship Adjust's undo in DYN-21, or (b) accept a 10 s undo that restores cuts and slides but not durations, with the sheet's undo toast saying *Undone — lengths kept* `[COPY]`. **Provisional default: (b)**, logged, with (a) queued for DYN-21. Logged.

## Behavior & states

**No surface.** Described by procedures and row transitions.

### Validators — `packages/validators/src/adjust.ts`, `habit-day.ts`, `item.ts` (amended)

- `adjustPreviewInput { date, entry: AdjustEntry, reasonKey: string, what: "slide" | "hold", how?: "shorten" | "cut" | "choose", chosenIds?: uuid[], keepInstead?: uuid[] }`; `adjustApplyInput = adjustPreviewInput & { fingerprint: string }`.
- `habitDayEditInput { itemId, durationMin?: 1–480, at?: { kind: "stack" } | { kind: "clock", clock }, priority?: 1–7, leaveOut?: boolean }` — **no range bound**.
- `doNowInput { itemId, anyway?: boolean }`; `moveItemInput { itemId, toMin: int ≥ 0, confirmed?: boolean }`; `moveBlockInput { blockId, deltaMin: int, confirmed?: boolean }`.

### Services — `packages/api/src/services/day/`

- **`reflow-block.ts`** — as ruled.
- **`adjust-day.ts`** — `previewAdjust` (loads the remaining scope, runs `computeAdjust`, returns the proposal with a fingerprint) and `applyAdjust` (recompute, compare, write in one transaction: the `shifts` row with `kind`, `reason_key`, `tier` from the reason set, `delta_min`, `shortened_item_ids`; cuts → `assignment_state = cut_by_shift`, `completion_state = missed`, a `misses` row `{ tier, reason_key, resolved_by: shift, shift_id }`; shortened → `duration_min`; slid → via `reflowBlock`; a `shift` also moves `days.work_start_time` and the work block; returns `DayView` + `undoUntil`). `undoAdjust` per the provisional default.
- **`do-now.ts`** — as ruled; calls USE-3's `startTimer`.
- **`edit-habit-day.ts`** — as ruled.
- **`move-item.ts`**, **`move-block.ts`** — as ruled.
- **`utils/day/adjust.ts`** — `computeAdjust`, `scopeOf(day, nowMin)` (the remaining span to the next hard thing), `fingerprintOf(items)`.

### Routers

- `adjust` (new; the `shift` router stays mounted until DYN-21 but gains nothing): `preview`, `apply`, `canUndo`, `undo`.
- `item`: `doNow`, `editToday`, `move`; `day`: `moveBlock`, `previewFit({ date, habitIds, durations })` → `fitToBudget` for the quick-pick's *Shorten to fit* (DYN-14).
- `root.ts`: mount `adjust`.

**States (exhaustive):** Adjust — preview fits · preview over with cuts · preview over with nothing left to cut (`overMin > 0`, `fits: false`, apply allowed) · applied (shift) · applied (refit) · stale (`CONFLICT`) · undone. Do now — moved and started · overflow-pin · overflow-anchor · anyway (overflow not assigned) · refused (pinned). Edit today — length · pinned today · unpinned · priority · left out. Move — snapped · displaced others · refused (pin, no confirm) · confirmed pin move · block moved.

**Failure / edge states:** Adjust when the scope is empty (everything remaining is done or hard) → preview `{ fits: true, proposal: [] }` and the sheet says so `[COPY: Nothing left to adjust.]` · Adjust entered from a one-off (`entry: one-off`) preselects *Something came up* — the tier comes from the person's reason set, never hard-coded · a reason archived between preview and apply → `CONFLICT` (stale) · *Choose what stays* with a hard item unticked → the service keeps it and reports `keptHard: [id]` · `doNow` on an active item → no-op returning the day · `doNow` on an item in a *pooled* block (impossible after confirm; before confirm the day is unconfirmed and the item sheet's *Do now* is absent — the service refuses `CONFLICT` *Set the day first.* `[COPY]`) · `editHabitDay` with `at: clock` earlier than now on a live day → allowed (a pin in the past is a passed item, faded, interactive) · `moveItem` on a done item → refused `BAD_REQUEST` (done items are the record; the ghost/annotation covers them) · `moveItem` across the day's close → refused · `moveBlock` on wind-down past lights-out → allowed; the number is the feedback · two devices: the fingerprint catches the Adjust case; `moveItem` last-write-wins on `scheduled_start` (cross-cutting §6.3's rule for the same field) — stated, not solved.

## Non-negotiables (this slice)

- **`original_scheduled_start` is never in an update set.** Grep-verified (AC 15).
- **Pins, fixtures, done items, active items, and hard items are fixed points** for every writer; Adjust never shortens or moves them; moves refuse them without `confirmed`.
- **One reflow, one adjust arithmetic.** `reflowBlock` and `computeAdjust` over `stackBlock` and `fitToBudget`; nothing else lays out a set day.
- **Preview-then-apply with a fingerprint.** Apply never trusts the client's proposal.
- **Range floor only downward, only in *shorten*; no clamp anywhere** (R4, R21).
- **A `shift` may move today's anchor; nothing here writes the profile.**
- **No reason is asked or stored for `doNow`, `editHabitDay`, `moveItem`, `moveBlock`** (R8). Only Adjust writes `shifts`.
- **Every read and write through `ctx.rls.execute()`.**

## Data & AI

**Schema changes: none.** (`shifts.undo_snapshot` is queued for `0006` under the `[NEEDS DECISION]` above.)

**Tables:** `days` (update `work_start_time`) · `day_blocks` (update times) · `day_items` (update times, `duration_min`, `priority`, `pinned`, `assignment_state`, `completion_state`) · `shifts` (insert; update on undo) · `misses` (insert; delete on undo) · `timer_sessions` (via `startTimer`) · `reasons` (read) · `users` (read `anchor_direction`, `lights_out_time`).

**Placement:** `packages/utils/src/day/adjust.ts` (rule 6); `packages/api/src/services/day/{reflow-block,adjust-day,do-now,edit-habit-day,move-item,move-block}.ts` (rule 4); `packages/validators/src/{adjust,habit-day,item,day}.ts` (rule 7); `packages/api/src/routers/{adjust,item,day}.ts` + `root.ts` (rule 3). Mason's call.

**tRPC / validators:** `adjust.preview` · `adjust.apply` · `adjust.canUndo({ shiftId })` · `adjust.undo({ shiftId })` · `item.doNow` · `item.editToday` · `item.move` · `day.moveBlock` · `day.previewFit`.

**AI notes:** **None.**

**Instrumentation:** none.

## Accessibility

**None — no surface in this slice.**

## Acceptance criteria (observable — local tier; the DYN-5 seed with Monday confirmed at 7:03; `now` injected; two callers for the induced cases)

1. **Adjust — slept in, hold, shorten.** At `now = 8:10` with nothing done, `adjust.preview({ entry: "late-offer", reasonKey: "slept_in", what: "hold", how: "shorten" })` → every remaining soft morning item at its range floor from 8:10, prep unchanged, the proposal ending ≤ 9:00 or, if still over, the lowest priorities in `cut` until it fits; `fits` and `overMin` consistent; hard items untouched. `adjust.apply` with the fingerprint → one `shifts` row `kind = refit, delta_min = 0, tier = scoping, reason_key = slept_in`, `shortened_item_ids` = the shortened set, cut items `cut_by_shift` + `misses` rows with `shift_id`; `original_scheduled_start` unchanged on every row; the Review's resolver credits cuts at half. *(Mason.)*
2. **Adjust — slide.** With `anchor_direction = work_waits` (soft), `what: "slide"` → `slideMin` = the overrun, proposal keeps every item at its length, `newAnchorMin` = 9:00 + slide; apply → `shifts.kind = shift, delta_min = slideMin`, `days.work_start_time` moved, the work block and its focus item moved, prep slid; the profile's `anchor_direction` unchanged. *(Mason.)*
3. **Adjust — cut.** `how: "cut"` → no durations change; ascending-priority cuts until it fits; `keepInstead: [stretch]` re-adds stretch and cuts the next-lowest (v1 §6.8).
4. **Adjust — choose.** `how: "choose", chosenIds: [three]` → the three kept at their lengths, the rest `not_assigned` (**not** `cut_by_shift` — a choice is a trim, v1 R1), `fits`/`overMin` reported; a hard item omitted from `chosenIds` is kept and reported in `keptHard`. *(Mason.)*
5. **Adjust — nothing left.** Every soft item done; `preview` → `overMin > 0, fits: false, cut: []`; `apply` succeeds with a `refit` row and no changes. *(Mason.)*
6. **Adjust — stale.** Preview; from a second caller mark one remaining item done; apply → `CONFLICT`; a fresh preview reflects the done item. *(Vigil.)*
7. **Adjust — undo.** Within 10 s, `adjust.undo` restores cuts (`assigned`, `upcoming`, misses deleted) and slides (times back by the delta); durations stay at their shortened values under the provisional default; after 10 s `canUndo = false`. *(Vigil.)*
8. **Do now.** At 7:50 with breath work (7:03) untouched, `item.doNow(breath)` → `scheduled_start = 7:50`, a running `timer_sessions` row, every later morning item slid by the minimum with no overlap, prep and the work anchor untouched if they fit; `original_scheduled_start` unchanged (the ghost); `overflow: null`. *(Mason.)*
9. **Do now — overflow.** Make the morning tight (a 60-min item) so the slide pushes stretch into prep's start: `doNow` → `overflow = stretch, overflowReason = "anchor"`, nothing written past the overflow; `doNow({ anyway: true })` → stretch `not_assigned`, the rest slid. With a pin at 8:00: `overflowReason = "pin"`. *(Vigil.)*
10. **Do now — refused.** On the stand-up fixture → `BAD_REQUEST`; on an active item → no-op; on an unconfirmed day → `CONFLICT`.
11. **Edit today.** `item.editToday(meditate, { durationMin: 90 })` on a habit with range 10–30 → `duration_min = 90`, the block re-flowed, the habit's range unchanged (**no clamp**); `{ at: { kind: "clock", clock: "8:30" } }` → `pinned = true` at 8:30 and the stack flows around it; `{ at: { kind: "stack" } }` → unpinned, re-flowed; `{ priority: 7 }` → today's row only; `{ leaveOut: true }` → `not_assigned`, absent from blocks, present in `notAssigned` with *Bring back* still working (USE-7's `bringBack`). *(Mason.)*
12. **Move item.** `item.move(read, { toMin: 8:07 })` → snapped to 8:05, the occupant and the rest re-stacked beneath with no overlap; `original_scheduled_start` unchanged; `deriveItemState` reports `moved` for the upcoming item; done later → `done-off-schedule` with the ghost at the original. *(Mason.)*
13. **Move item — pin.** `item.move(standUp, { toMin })` → refused; with `confirmed: true` → moved, still `pinned`, the work block's items flow around the new position. `item.move(doneItem)` → refused.
14. **Move block.** `day.moveBlock(morning, { deltaMin: 30 })` → every movable morning item +30, the block's start/end +30, pins untouched, prep unchanged; the block's `original_scheduled_start` unchanged. *(Mason.)*
15. `grep -rn "originalScheduledStart" packages/api/src/services/day/{reflow-block,adjust-day,do-now,edit-habit-day,move-item,move-block}.ts` shows reads only — no `.set({ … originalScheduledStart` anywhere; and a deliberate attempt to update it by SQL on a set row raises the trigger. *(Mason.)*
16. `day.previewFit({ date, habitIds, durations })` returns `fitToBudget`'s result against the day's computed budget — the quick-pick's *Shorten to fit* and the over-budget dialog read it.
17. As user B, every procedure naming A's item, block, or shift is `NOT_FOUND`. *(Mason.)*
18. `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` pass (four separate commands).

## Likely-relevant technical notes (ADVISORY — dev decides)

- Read `apply-shift.ts` and `shift-fit.ts` for the fingerprint and the preview/apply split, then write `adjust-day.ts` fresh over `stackBlock`; do not extend `computeShiftFit` — it is retired in DYN-21 and extending it would make the retirement a rewrite.
- `scopeOf`: from `nowMin` to the first of (the next hard item's start, the work anchor if hard, the next pin, the day's close). Adjust's proposal is over the soft, not-done, not-active items inside that scope; items outside it are untouched and the sheet's copy names the scope (*the morning*, *the evening*).
- `reflowBlock` is the one place `stackBlock` is called after confirm; pass fixed points as pinned entries (done and active items become pins at their actual times) so the pure function needs no new concept.
- The 10 s undo: store nothing new; `undo-shift.ts`'s "subtract the delta from the still-movable set" generalises. Durations are the open item — see the `[NEEDS DECISION]`.

## Dev's call

The fingerprint's exact inputs (ids + states + `done_at` + `duration_min` is enough) · whether `move-item` and `move-block` are one file · whether the `adjust` router also exposes `scope({ date })` for the sheet's copy (recommended).

## Out of scope

- **The Adjust sheet, the late-wake offer status line, the item sheet's buttons, the habit-day sheet, the drag layer** — DYN-17, DYN-15, DYN-16.
- **Retiring `apply-shift`, `apply-trim`, `shift-fit`, `trim`, the `shift` router** — DYN-21.
- **`shifts.undo_snapshot`** — DYN-21 (`0006`) if (a) is chosen.
- **The Review's rendering of *shortened*** — DYN-19.

## Depends on

- **DYN-5** — `day_blocks` rows, `layOutDay`, confirmed days, the read model. Complete in `PROGRESS.md`. (USE-3's `startTimer`, USE-6's pattern, USE-7's `bringBack` — Complete in Epic 2.)

## Recommended execution

**Opus.** Five writers share one reflow and one arithmetic, each with a fixed-point rule, a staleness rule, and an undo; the induced cases (a second device between preview and apply, a slide across a pin) are the ticket. A cheaper model writes `doNow` as a move plus a timer and lets the slide walk through the stand-up, which the day then shows as a stand-up at 9:40 that nobody moved.

---

### Kickoff (paste into the session)

> Build **DYN-6 — Adjust, *Do now*, habit-day edits, and moves** (attached spec). Model: **Opus**. **`original_scheduled_start` never in an update set; pins, fixtures, done, active, and hard items are fixed points for every writer; one reflow and one adjust arithmetic over `stackBlock`; preview-then-apply with a fingerprint; no clamp; no reason except in Adjust.**
> Attach/read first, in order: this spec · v1.1 §6.3–§6.6, §10.1, R4, R7, R8, R21–R23 · this track's `TECHNICAL-DECISIONS.md` TD-4, TD-6 · USE-6 (`apply-shift.ts`, `shift-fit.ts`, `undo-shift.ts` — the pattern, not the code) · USE-7 (`apply-trim.ts`, `bring-back.ts` — *Keep instead*, *Bring back*) · USE-3 (`timer.ts` `startTimer`) · DYN-1 (`stackBlock`, `fitToBudget`, `compareForTrim`) · DYN-5 (`layOutDay`, `reflow` expectations, the read model) · `packages/api/src/routers/{item,day,shift}.ts`, `root.ts` · `packages/validators/src/{item,day,shift}.ts` · `packages/db/SCHEMA_REFERENCE.md` (day group) · `DEVIATIONS.md` + `TECHNICAL-DECISIONS.md` (this track's, Epic 2's).
> Resolve the undo `[NEEDS DECISION]` by taking the provisional default (b) unless Taylor has ruled; log it. Run every AC probe including the two induced staleness cases from a second caller. Close in three places. Run `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` as separate commands.
