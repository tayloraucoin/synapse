# REV-2 — Review tab and Day Review: RV-00, DR-01 in live and pending modes, DR-02, DR-03, DR-05, DR-07, finish, finish later, and carry forward

**Epic:** REV — Review · **Phase 1** · Size: L
**Slice type:** The one ceremony in the product — a column of decisions that closes a day and then, only then, prints a number. The risk class is *a review that pressures or lies*: a percentage before the decisions, a forced answer at 11pm, a carry that writes early, a finish that closes a day with an undecided item, a shift's record rewritten by a *Change*.
**Vigil:** review by inducing — *Finish later* with one decided and two undecided; the 03:00 auto-close after that (pending mode next morning); *Finish review* with a running timer; *Change* on a cut item; *Keep this reason* then reopen the chooser. QA states which of the five it exercised.

**Status:** Complete (2026-09-05)

> **Vesper — register review.** Read every string on DR-01 and DR-07 against Epic 3 §6's never-list. Then close a bad day (five missed) on a phone at night and say whether anything on the screen judged you.

---

## Outcome

The Review tab says what is due — today's count in words, any past day with pending items, this week so far, and the door to history. *Day Complete* (or *Close out today*) opens the day: a words-only summary, one panel per undone item in schedule order with *Carry forward* (tasks only) and *Missed*, the tier chooser inline with its weights in quiet words, cut items already resolved with *Change*, the done list collapsed, reflections collapsed, and *Finish later* · *Finish review* at the bottom. Finishing closes the day, writes every decision, creates tomorrow's carried items, and shows the number with its sentence and the fact lines. Leaving keeps what was decided and marks the rest pending; the auto-close does the same at 03:00 and the morning's status line and the Review dot say so. **The traded-up picker, reflections' block, edit mode, and history are REV-3** — this ticket renders *Stayed on something more important* as a chip that opens nothing yet (`onTradedUp` shows the panel's own chip as selected and waits; REV-3 wires the sheet), the *Reflections* section header with its count but no body, and treats a reviewed day's link as a placeholder.

## Why / intent

- **Official spec §7.1, §7.2** — the three regions; the Day Review's entry points; the header's plain-words count with nothing numeric until finished; one panel per undone item; the three tiers with their chips and the quiet weighting line; the optional note and *keep this reason*; shift-cut items resolved with a single *Change*; *Finish review* / *Finish later*; the states (nothing to review, partial, editing). §0.3 R3 — *Something came up / Planned it wrong / Didn't do it*; never *weak*, *fail*, *penalty*. §10.2 — *counts as done for the record · counts half · counts as missed*. §10.5 — *Every item was done.*, *Yesterday has 3 items to review.*
- **Epic 3 §0.1** — the eight reviewing rules. **§1 (RV-00), §2 (DR-01, DR-02, DR-03, DR-05, DR-07)** — every read, interact, state, and rule: the summary line; *To decide* absent when nothing is undone; deferred items last; the footer's disabled state; *Finish later* semantics per mode; *Finish review* writes and closes and creates carried items *on finish, not on tap*; auto-close writes nothing but `closed_at` and `pending_review`; DR-02's three reads; *Carried {n} times since {date}*; DR-03's rows, chips, *Other*, *Keep this reason*, *Add a note*; DR-05's line and *Change*; DR-07's reads. §6 — the register. §7.1, §7.2 — the flows.
- **Cross-cutting §8.1** — a Miss is always editable in DR-02/03; the change is stamped; the Shift's own record is untouched. §8.2 — DR-01 reflects a record-mode edit on return.
- **Ground truth:** REV-1's `review.day`, `ReviewDayView`, `computeAdherence`; USE-1's `closeDay`; USE-3's `?sheet=item` (the *edit* link) and `timer.stop`; SET-9's `reason.list` (`byTier`), `reason.keep`; SYS-1's `shell.status` (`pendingReviewCount`, the dot) and the status line; SET-6's materialiser pattern for creating a carried item on the next day (`services/day/` — add `carry-item.ts` beside it); `@syn/ui` `ReviewRegion`, `ListRow`, `DecisionPanel` (with `Decision`, `DecisionVerdict`, `TRADED_UP_REASON_KEY`), `DecidedLine`, `GroupHeading`, `CollapsiblePanel`, `BigNumber`, `FormulaSentence`, `FactLine`, `Button`, `Text`, `AppHeader`, `ScreenFrame prose`, `SkeletonBlock`, `RegionRetry`; `reviewRoute`, `reviewDayRoute`, `reviewHistoryRoute`, `reviewWeekRoute`, `todayRoute`.
- **What this slice is NOT (binding):** no DR-04, no DR-06 body, no edit mode, no HS-01, no WR-01 (REV-3, REV-4). No number anywhere before *Finish review*.

**Rulings this slice makes (labelled, logged):**

- **The Day Review is a feature folder** `apps/web/components/review-day/{use-review-day.ts, review-day.tsx, decision-column.tsx, finished.tsx, copy.ts, index.ts}` rendered by `/review/day/{date}`; the page is a Server Component reading `review.day` and passing the initial view; the hook owns decisions and finish. Logged.
- **Decisions are written as they are made** (`review.decide({ itemId, decision })` → upsert `misses` or set `completion_state = carried`? **No** — carry is written on finish per the document; the tap records `{ kind: "carry" }` **client-side** and the panel shows *Carry forward → tomorrow*; `review.decide` for a miss upserts the `misses` row at once so *Finish later* keeps it. **Ruling:** misses write on tap; carries write on finish. Logged. Cost: a carried decision made and then *Finish later* is lost — the item stays undone (the document: "decided items keep their decisions" — **therefore** store the pending carry too: `completion_state = carried` is written on tap but the *next-day item is created on finish*. Final ruling: **both decisions write on tap; only the carried item's creation waits for finish.** The `carried` state on an open day is visible to the resolver as excluded, which is right.) Logged.
- **`review.finish({ date })`** in one transaction: refuse (`BAD_REQUEST`) if any assigned undone item on the day has no decision; end any running timer (`timer.stop` service); `closeDay(reason: "manual")` when the day is open (pending mode: the day is already closed — set `reviewed_at`); for every `carried` item create tomorrow's `day_items` row (`origin = carried`, `carried_from_item_id`, `time_mode = unscheduled`, snapshots copied, `priority` and `scheduling` copied, the `days` row created if absent — through SET-6's day-upsert helper, never a raw insert); set `reviewed_at = now()`; return `ReviewDayView` with `result`. Logged.
- **`review.finishLater({ date })`** writes nothing in live mode (decisions are already written) and nothing in pending mode; it exists so the client has one call that returns the caller route. Logged. (Edit mode's discard is REV-3.)
- **`review.changeDecision`** on a cut item updates the existing `misses` row in place: `tier`, `reason_key`, `reason_text`, `resolved_by = day_review`, keeping `shift_id`; DR-05 reads `shift_id IS NOT NULL AND resolved_by = day_review` as *Changed from the shift's reason.* Logged.
- **`Keep this reason`** calls `reason.keep({ label, tier })` and selects the new chip. Logged.
- **DR-07 is the same route in a finished state**, not a separate route: after finish the hook swaps the column for `finished.tsx`; a reload of `/review/day/{date}` on a reviewed day shows DR-01 in edit mode (REV-3) — until REV-3, it shows DR-07 again (the `result` is on the view). Logged.
- **RV-00's *Close out today* opens DR-01 for `todayKey`;** *Day Complete* on the List does the same with `?from=list` so *Finish later* and DR-07's *Done* return to the List. Logged.
- **The pending-review status line's count and RV-00's pending rows read the same field** (`shell.status.pendingReviewCount` and `review.pendingDays`). Logged.

## Experience & states

### RV-00 Review tab (`/review`)

`AppHeader` title *Review* (with the avatar, per the shell). `ScreenFrame`. Three `ReviewRegion`s:

- **Today** — `title="Today"`, `status` by state: *{done} of {assigned} done · {undone} to decide* + `action` *Close out today* · *Every item was done.* + *Close out today* · *Reviewed at {time} · {adherence}%* + `action` *Open* (REV-3 edit; until then opens DR-07) · *Nothing was assigned.* with no action.
- **Pending** (only when any): a `GroupHeading`-less list of `ListRow`s *{Weekday} has {n} items to decide*, most recent first, each → `reviewDayRoute(date)`.
- **This week** — `title="This week"`, `status` *{reviewed} of {planned} days reviewed* + *{adherence}% so far* when any reviewed day (the word *so far* until Sunday closes), `action` *Open* → `reviewWeekRoute(weekKey)` (REV-4's placeholder until then).
- **History** — a `ListRow` *Past weeks and days* → `reviewHistoryRoute()` (REV-3).

Pull to refresh (compact). Loading: `ReviewRegion loading`. Error: `ReviewRegion error` *Couldn't load. Pull to try again.* Offline: readable; *Close out today* disabled with the line.

### DR-01 Day Review (`/review/day/{date}`)

`AppHeader` title *{Weekday} {day} {Month}*, `subtitle` in pending mode *Closed at {time} — {n} to decide*, `onBack` (same as *Finish later*). `ScreenFrame prose`. Summary `Text` (review serif? **No** — Newsreader is DR-07's and WR-01's number and sentence only, Epic 3 §6): *{done} of {assigned} done* · *· {moved} moved* · *· {n} not assigned* · *· {c} cut when shifted*. Then:

- `GroupHeading` *To decide* (absent when `toDecide` is empty) → one `DecisionPanel` per item (`state`, `decision`, `reasons={byTier}`, `canCarry={item.type === "task_appointment"}`, `carriedCount`/`carriedSince`, `timeZone`, `onCarry`, `onMissed`, `onDecide`, `onChange`, `onTradedUp` (REV-3), `note`/`onNoteChange`). Deferred items last.
- `GroupHeading` *Cut when shifted* (only when any) → `DecisionPanel` with `state="resolved-by-shift"`, `shiftContext`, `decision` from the miss; *Change* → the chooser with the shift's tier and reason preselected; after a change the panel shows `DECISION_PANEL_COPY.changedFromShift`.
- `CollapsiblePanel` *Done* (collapsed in live/pending) → `ListRow`s: icon · title · *done {time}* / *done {time} · moved from {planned}* · quantity · trailing text link *edit* → `?sheet=item&id=…` (USE-3's sheet over this route — the sheet is mounted here too).
- `CollapsiblePanel` *Reflections · {rated} of {rateable}* (collapsed; body REV-3; absent when `rateable = 0`).
- Footer (sticky above the safe area): *Finish later* (ghost) · *Finish review* (primary, `disabled` while any `toDecide` item is `undecided` or `deciding`).

Nothing to decide with assigned > 0: the summary reads *Every item was done.* and *Finish review* is enabled at once. Nothing assigned: *Nothing was assigned today.* with *Finish review* to close it.

**Finish** → `review.finish` → the column is replaced by DR-07. **Finish later** → `review.finishLater` → `router.replace(from === "list" ? todayRoute() : reviewRoute())`.

### DR-07 Finished

`AppHeader` title the date, `subtitle` *Reviewed* (REV-3 adds *· edited*). `BigNumber value={percent} size="day"` · `FormulaSentence terms credit counted percent` (the composite prints *Nothing was counted today.* for `counted = 0` — verify; add if absent and log) · `FactLine`s: *Off-schedule: {moved} of {done} done.* (when moved > 0) · *By priority — high (5–7): {a} of {b} · mid (3–4): … · low (1–2): …* (bands with nothing omitted; decimals only when a half exists) · *Shifted +{total} min ({n} shift{s}).* · *{n} carried to tomorrow.* · *{n} not assigned today.* · primary *Done* → the caller route.

**States (exhaustive):** RV-00: loading · loaded (four Today variants) · pending-present · offline · error. DR-01: live · pending · nothing-to-decide · nothing-assigned · deciding (a panel open) · all-decided · saving (footer disabled, inline spinner) · error (*Couldn't save the review. Your decisions are kept on this device — try again.* — in Phase 1 "kept on this device" means the panels keep their state until retry; no local queue) · offline (*Finish review* disabled with the standard line; decisions still attempt and revert). DR-07: normal · counted-0 · all-done (100%) .

**Failure / edge states:** *Finish review* races the auto-close (03:00 passes mid-review) → `review.finish` on an already-closed day sets `reviewed_at` and resolves pending items — the same path as pending mode; the response's `mode` tells the client · a panel decided *Missed → Other* with empty text and *Finish review* pressed → the panel shows *Say what it was, in a few words.* and finish is refused client-side · a carried task whose tomorrow already has a carried copy (a double finish) → `review.finish` is idempotent on `reviewed_at`; the second call returns the view without creating another.

## Non-negotiables (this slice)

- **No percentage on DR-01. Ever.** The number is DR-07's.
- **Three taps.** The panel's `onDecide` fires only when the decision is complete; the finish button is the only other tap.
- **Leaving keeps what was decided and marks nothing missed.** Pending is a state, not a verdict.
- **Carried items are created on finish, never on tap.**
- **A *Change* on a cut item never touches `shifts`.**
- **Every string is Epic 3 §1–§2 and official §10 verbatim; nothing evaluative.**
- **Every read and write through `ctx.rls.execute()`.**

## Data & AI

**Schema changes: none.**

**Tables:** `misses` (upsert, update) · `day_items` (update `completion_state` to `carried`/`missed`; insert the carried copy on tomorrow) · `days` (`closed_at`, `close_reason`, `reviewed_at`; upsert tomorrow's row) · `timer_sessions` (end on finish) · `reasons` (read; `reason.keep` writes).

**Placement:** `review.decide`, `review.changeDecision`, `review.finish`, `review.finishLater`, `review.pendingDays` on the review router; services `services/review/{decide,change-decision,finish-review,pending-days}.ts` and `services/day/carry-item.ts`; validators `packages/validators/src/review.ts` (`decisionInput` — a discriminated union matching `Decision`; *Say what it was, in a few words.* on empty *Other* text); feature folder `components/review-day/`; pages replace `/review` and `/review/day/[date]` placeholders.

**tRPC / validators:** as above; `review.day` (REV-1).

**AI notes:** **None.**

## Accessibility

- Each `DecisionPanel` is a `section` named by its item; the two large targets are 56px buttons; the tier rows are a radiogroup; a decided panel's `DecidedLine` is announced once.
- The footer's *Finish review* disabled state has visible text explaining nothing — the undecided panels are the explanation; a screen reader hears *disabled*. `[Vesper: acceptable; the document adds no line.]`
- DR-07's number and sentence are one paragraph for AT: *86 percent. 9 done, 1 planned wrong, half…* (`BigNumber` and `FormulaSentence` are adjacent; group them with `aria-labelledby` or a single region).
- Focus after *Finish review* moves to the DR-07 heading.

## Acceptance criteria (observable — a seeded day with done, undone (task and habit), deferred, and cut items; a second browser for the auto-close morning)

1. `/review` shows *Today · {done} of {assigned} done · {undone} to decide* with *Close out today*; the week region with *{r} of {p} days reviewed*; the history row; no pending rows on a fresh account. *(Vesper.)*
2. *Close out today* → DR-01 with the words-only summary, *To decide* panels in schedule order with deferred last, the cut item under *Cut when shifted* already decided, *Done* collapsed with the rows, *Finish review* disabled; **no percentage anywhere** (screenshot). *(Vesper.)*
3. A task's panel offers *Carry forward* and *Missed*; a habit's offers *Missed* full width. *Carry forward* decides in one tap (*Carry forward → tomorrow*); `completion_state = carried` at once; a task carried three times shows *Carried 3 times since {date}.*
4. *Missed* → the three tier rows with their definition lines; *Didn't do it* decides at once (`misses.tier = chose_not_to`); *Planned it wrong* reveals its chips and *Slept in* decides (`tier = scoping`, `reason_key = slept_in`); *Other* needs text; *Keep this reason* adds it to the set and it appears in `/settings/reasons` under that tier.
5. *Change* on a decided panel reopens the chooser with the current selection; on the cut item, changing writes `resolved_by = day_review` on the same `misses` row, keeps `shift_id`, and the panel shows *Changed from the shift's reason.*; the `shifts` row is byte-identical before and after. *(Vigil.)*
6. With one undecided panel, *Finish review* is disabled; deciding it enables the button; pressing it closes the day (`closed_at`, `close_reason = manual`, `reviewed_at`), ends a running timer, creates tomorrow's carried item (`origin = carried`, `carried_from_item_id`, unscheduled, snapshots), and shows DR-07 with the number, the sentence, and the fact lines (*1 carried to tomorrow.*). *(Vigil.)*
7. DR-07's sentence for official §7.4's example day reads exactly *9 done, 1 planned wrong (½), 1 didn't do (0), 1 not counted → 9.5 / 11 = 86%.*; for an all-done day *{d} done → {d} / {d} = 100%.*; for nothing counted the composite's line.
8. *Finish later* with one decided and two undecided keeps the miss row, leaves the day open, and returns to the caller (the List when entered from *Day Complete*, else the tab); the tab's Today reads *… · 2 to decide*. *(Vigil.)*
9. Run USE-1's auto-close (SQL-shift the window): the day closes `auto`, the two items are `pending_review`, `/review` shows *{Weekday} has 2 items to decide*, the shell's Review dot is present, and the status line reads *Yesterday has 2 items to review*; opening it shows pending mode with the subtitle; finishing sets `reviewed_at` and shows DR-07. *(Vigil.)*
10. *Every item was done.* appears in the summary when nothing is undone; *Finish review* is enabled immediately; *Nothing was assigned today.* on an empty day.
11. The *edit* link on a done row opens the item sheet over the review; changing a note there and closing returns to the review unchanged.
12. Offline: decisions attempt and revert with the sentence; *Finish review* is disabled with the standard line.
13. Every string on DR-01 and DR-07 is in Epic 3 §1–§2 / official §10; none of §6's never-list appears (grep the `copy.ts` for *failed*, *skipped*, *streak*, *great*, *only*, *just*, *again*). *(Vesper.)*
14. `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` pass (four separate commands).

## Likely-relevant technical notes (ADVISORY — dev decides)

- `DecisionPanel` already computes the verdict client-side from the tier; the decided line's text comes from `decision.reasonText ?? reasonKey` — pass the reason **label** (from `byTier`) in `reasonText` for display, and the key in `reasonKey` for the write; the composite prints what it is given.
- The footer's sticky position: `position: sticky; bottom: env(safe-area-inset-bottom)` inside `ScreenFrame`; on wide it is static at the column's end.
- `review.finish` returns the full `ReviewDayView` with `result` so DR-07 needs no second fetch.
- The `?from=list` param is nuqs state read once.

## Dev's call

The exact sticky-footer implementation · whether the *Done* rows are `ListRow` or `ItemRow variant="read-only"` (recommend `ListRow` — the document's row has an *edit* link, not a checkbox) · the pending list's ordering key.

## Out of scope

- **DR-04 traded-up picker, DR-06 reflections body, DR-01 edit mode, HS-01** — REV-3.
- **WR-01** — REV-4 (RV-00's *Open* links to the placeholder).
- **The shell's dot and status line** — SYS-1 reads `pendingReviewCount`; this ticket makes it non-zero.
- **N4/N5** — USE-8.

## Depends on

- **REV-1** — `review.day`, the resolver. Complete in `PROGRESS.md`.
- **USE-3** — the item sheet for *edit*, `timer.stop`. Complete in `../epic-2-in-use/PROGRESS.md`.
- **SET-9** — `reason.list`, `reason.keep`. Complete in `../epic-1-setup/PROGRESS.md`.
- **SYS-1** — the chrome, `shell.status`. Complete in `../cross-cutting-system/PROGRESS.md`.

## Recommended execution

**Opus.** Three modes on one screen, a finish transaction with four side effects, the pending lifecycle across the boundary, and a register the whole product's honesty rests on. A cheaper model shows the percent early or creates the carried item on tap, and the review stops being a record.

---

### Kickoff (paste into the session)

> Build **REV-2 — Review tab and Day Review** (attached spec). Model: **Opus**. **No number before the decisions; three taps per item; leaving keeps decisions and marks nothing missed; carried items are created on finish; a *Change* never touches the shift's record; nothing evaluative.**
> Attach/read first, in order: this spec · Epic 3 §0.1, §1 (RV-00), §2 (DR-01, DR-02, DR-03, DR-05, DR-07), §6, §7.1, §7.2 · official spec §0.3 R3, §7.1, §7.2, §10.2, §10.5 · cross-cutting §8.1, §8.2 · `apps/web/AGENTS.md` · root `AGENTS.md` · `docs/specs/README.md` § Placement rules · REV-1 (`review.day`, `ReviewDayView` — reuse) · USE-1 (`closeDay`) · USE-3 (`?sheet=item`, `timer.stop`) · SET-9 (`reason.list`, `reason.keep`) · SET-6 (the day-upsert helper for the carried copy) · SYS-1 (`shell.status`) · `packages/ui/src/composed/control/decision-panel/` (read `copy.ts` and the story), `display/{review-region,decided-line,big-number}/` · this track's `DEVIATIONS.md` + `TECHNICAL-DECISIONS.md` · `../epic-2-in-use/DEVIATIONS.md` · `../epic-1-setup/DEVIATIONS.md` · `docs/specs/infrastructure/DEVIATIONS.md`.
> Run the five Vigil paths and the register check and state each. Close in three places. Run `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` as separate commands.
