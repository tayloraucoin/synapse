# Epic 3 — Review — Build Order

**New here? Read `README.md` first**, then [`../README.md`](../README.md) for the global order. This file is the ordered, checkable build queue for this track.

> Derived from each ticket's `## Depends on`. A ticket may start only when everything it lists shows **Complete** in the owning track's `PROGRESS.md`. If this file and a ticket's `## Depends on` disagree, **the ticket wins** — fix this file.

## How to work this file

1. Find the next unchecked ticket. 2. Confirm its gate in `PROGRESS.md` (and the other track's, where a dependency crosses). 3. Build one ticket per thread. 4. On done, close in three places, then tick here.

## Critical path (sequential)

REV-1 → REV-2 → REV-3

The number, the review that produces it, the history that reopens it.

## Build-order checklist

### Phase 0 — The contract
- [x] **REV-1** · The resolver and the number: credit, counted, bands, off-schedule, traded-up verification, the day and week read models — L · (SET-1, USE-1) · **Mason review of the resolver cases** — built 2026-09-05; **41 cases run including §7.4's worked example; excluded leaves the denominator and the rounding happens once**

### Phase 1 — The Day Review
- [x] **REV-2** · Review tab and Day Review: RV-00, DR-01 live and pending, DR-02/03/05/07, finish, finish later, carry forward — L · (REV-1, USE-3, SET-9, SYS-1) — built 2026-09-05; **no number before the decisions; decisions write on tap and only the carried row waits for finish**
- [x] **REV-3** · Traded-up, reflections, edit mode, and history: DR-04, DR-06, DR-01 edit, HS-01 — M · (REV-2)

### Phase 2 — Phase-2 surface (does not gate launch)
- [ ] **REV-4** · Week Review: WR-01, WR-02, WR-03, WR-04 — L · (REV-3, USE-3)

## Ordering constraints (alphabetical order hides these)

- **REV-1 precedes REV-2** — the review renders decisions and then a number; a review built before the resolver invents the arithmetic in the page.
- **USE-3 precedes REV-2** — DR-01's *Done* section's *edit* link opens the item sheet, and *Finish review* must end a running timer through the same engine.
- **SET-9 precedes REV-2** — the chooser's chips are the person's reason set; *Keep this reason* is `reason.keep`.
- **SYS-1 precedes REV-2** — the Review dot and the pending-review status line read the facts REV-2 writes; the chrome must exist to show them.
- **REV-2 precedes REV-3** — edit mode is the same screen; the traded-up picker completes a decision the panel starts.
- **REV-3 precedes REV-4** — WR-02's day rows open DR-01 in edit mode; HS-01's week rows open WR-01.
- **USE-3 precedes REV-4** — time by category sums timer sessions.

## Full dependency table

| Ticket | Complete-required dependencies |
|---|---|
| REV-1 | SET-1, USE-1 |
| REV-2 | REV-1, USE-3, SET-9, SYS-1 |
| REV-3 | REV-2 |
| REV-4 | REV-3, USE-3 |

## Ticket-authoring batches (distinct from build phases)

| Batch | Tickets | Why grouped |
|---|---|---|
| 1 | REV-1 | The arithmetic alone |
| 2 | REV-2, REV-3 | One screen in three modes and the two sheets that complete it |
| 3 | REV-4 | The week, a record over the same arithmetic |

All four were authored in one pass on 2026-09-05 (see `../README.md` § Authoring note and `DEVIATIONS.md`).

## Locked references (do not re-litigate)

- **Decisions:** official spec §0.3 R1, R2, R3, R6; §3.11; Epic 3 §8's eight calls; v2 handoff §10, §12; this track's rulings in `TECHNICAL-DECISIONS.md`.
- **Binding law:** `README.md` § Non-negotiables; `apps/web/AGENTS.md` § Product non-negotiables; `../README.md` § Placement rules.
- **Launch-blocking set:** REV-1, REV-2, REV-3.
- **What does not gate:** REV-4. USE-8 (notifications) waits on REV-2, not on REV-3 or REV-4. SYS-5 (the install offer) waits on REV-2's reviewed-day count.
