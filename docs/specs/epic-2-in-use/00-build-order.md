# Epic 2 — In Use — Build Order

**New here? Read `README.md` first**, then [`../README.md`](../README.md) for the global order. This file is the ordered, checkable build queue for this track.

> Derived from each ticket's `## Depends on`. A ticket may start only when everything it lists shows **Complete** in the owning track's `PROGRESS.md`. If this file and a ticket's `## Depends on` disagree, **the ticket wins** — fix this file.

## How to work this file

1. Find the next unchecked ticket. 2. Confirm its gate in `PROGRESS.md` (and the other track's, where a dependency crosses). 3. Build one ticket per thread. 4. On done, close in three places, then tick here.

## Critical path (sequential)

USE-1 → USE-2 → USE-3 → USE-8

The day model, the list that renders it, the sheet that acts on it, the reminders that point at it. USE-1 is on the global critical path *before* SET-6 (the materialiser writes with its helpers).

## Build-order checklist

### Phase 0 — The contract
- [x] **USE-1** · The day model: boundaries, today, state derivation, day parts, auto-close, the day read model — L · (SET-1) · **Mason review of the time arithmetic**

### Phase 1 — The List
- [x] **USE-2** · Plain List: LS-00/01/02/03, done and undo, the wake anchor, record and plan modes — L · (USE-1, SET-6, SYS-1) — built 2026-09-05; **done is optimistic and undo restores the original `done_at`; the minute tick rebuilds only rows whose state moved**

### Phase 2 — The sheets and the timer
- [x] **USE-3** · Item sheet and day header: IT-01, DH-01, DH-02, the timer engine and the tick store — L · (USE-2, SET-9) · Vigil: timer across sheet close, reload, and a second device — built 2026-09-05; **the session row is the truth and the store is re-seeded from it on every refetch**
- [ ] **USE-4** · Manual time, sessions, pause/resume, and a one-off from the day: IT-02, G1, G3 — M · (USE-3)

### Phase 3 — The Schedule
- [ ] **USE-5** · Schedule: SC-01, SC-02 (read), ghosts, window spans, shift bands — L · (USE-3) · Vesper review of block density

### Phase 4 — Notifications (launch-blocking)
- [ ] **USE-8** · Notifications: N1/N4/N5/N6 jobs, payloads, grouping, quiet after complete, landings PN-01/04/05/06 — L · (USE-3, REV-2, SET-6, SET-9) · **Vigil: payload privacy**

### Phase 5 — Phase-2 surfaces (do not gate launch)
- [ ] **USE-6** · Shift my day: SF-01, the late offer, LS-03 *Do it anyway*, SC-02 undo — L · (USE-5, SET-9)
- [ ] **USE-7** · Capacity trim: TR-01, LS-02 *Bring back*, *Keep instead* — M · (USE-2, USE-3)

## Ordering constraints (alphabetical order hides these)

- **USE-1 precedes SET-6** (Epic 1) — the materialiser must write absolute times with `wallClockToInstant` and key days with `resolveDayKey`; a second copy of that arithmetic is two days that disagree about DST.
- **SET-6 precedes USE-2** — the List renders materialised days; without them it renders the empty state only, and AC on rows cannot run.
- **SYS-1 precedes USE-2** — the tab bar, the header, and the status-line slot are the frame the List lives in; USE-2 supplies `lateOffer` and the day header, SYS-1 the rest.
- **USE-2 precedes USE-3** — the sheet opens from a row; the row's optimistic done/undo is what the sheet's *Done* must agree with.
- **SET-9 precedes USE-3** — listed to say the item sheet asks *no* reason and reads *no* reason set; the dependency is the permission sheet's `reminder_prompt_answered_at` predicate, which USE-3 must not trip when *Add a one-off* saves a fixed item from the day header (it may — that is the same WK-03).
- **USE-3 precedes USE-5** — a block opens the same sheet; the ghost needs the late-start rule the timer engine writes.
- **USE-5 precedes USE-6** — the shift band and SC-02's undo live on the Schedule.
- **REV-2 precedes USE-8** — N4 and N5 read pending-review facts the review writes; a reminder about a review that cannot be opened is noise.
- **USE-7 needs USE-2 and USE-3** — the trim's expander is LS-02 and its door is the day-header sheet's hidden row; it can be built any time after those two.

## Full dependency table

| Ticket | Complete-required dependencies |
|---|---|
| USE-1 | SET-1 |
| USE-2 | USE-1, SET-6, SYS-1 |
| USE-3 | USE-2, SET-9 |
| USE-4 | USE-3 |
| USE-5 | USE-3 |
| USE-6 | USE-5, SET-9 |
| USE-7 | USE-2, USE-3 |
| USE-8 | USE-3, REV-2, SET-6, SET-9 |

## Ticket-authoring batches (distinct from build phases)

| Batch | Tickets | Why grouped |
|---|---|---|
| 1 | USE-1 | The contract alone — its edge cases are the ticket |
| 2 | USE-2, USE-3, USE-4 | The List and its sheets: one row model, one optimistic-mutation grammar, one timer |
| 3 | USE-5, USE-6, USE-7 | The Schedule and the two day-level mutations that draw on it |
| 4 | USE-8 | Notifications alone — a privacy surface with its own review list |

All eight were authored in one pass on 2026-09-05 (see `../README.md` § Authoring note and `DEVIATIONS.md`).

## Locked references (do not re-litigate)

- **Decisions:** official spec §0.3 R1, R5, R7 and the smaller calls in §0.3's last paragraph (soon = 15 min; closing nudge for windows only; adjustable trims); Epic 2 §12's nine calls; cross-cutting §13's nine calls; v2 handoff §10, §12; this track's rulings in `TECHNICAL-DECISIONS.md`.
- **Binding law:** `README.md` § Non-negotiables; `apps/web/AGENTS.md` § Product non-negotiables; `../README.md` § Placement rules; `codebase-conventions.md` §0, §6, §8, §9.
- **Launch-blocking set:** USE-1, USE-2, USE-3, USE-4, USE-5, USE-8.
- **What does not gate:** USE-6 and USE-7 (Phase 2). Nothing in Epic 3 waits on USE-5 onward except REV-4 (time-by-category needs sessions from USE-3, not the Schedule).
