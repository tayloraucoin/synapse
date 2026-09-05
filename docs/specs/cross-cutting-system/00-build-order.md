# Cross-cutting — Build Order

**New here? Read `README.md` first**, then [`../README.md`](../README.md) for the global order. This file is the ordered, checkable build queue for this track.

> Derived from each ticket's `## Depends on`. A ticket may start only when everything it lists shows **Complete** in the owning track's `PROGRESS.md`. If this file and a ticket's `## Depends on` disagree, **the ticket wins** — fix this file.

## How to work this file

1. Find the next unchecked ticket. 2. Confirm its gate in `PROGRESS.md` (and the other track's, where a dependency crosses). 3. Build one ticket per thread. 4. On done, close in three places, then tick here.

## Critical path (sequential)

SYS-1 → (the epics) → SYS-5

The shell first, because every later screen renders inside it; the install offer last, because it waits for the third reviewed day.

## Build-order checklist

### Phase 0 — The shell (before any epic screen)
- [ ] **SYS-1** · The shell: chrome mounted, `PageFrame`, `shell.status`, the status-line sources, sheets as history, back, tab memory, record and plan headers, the copy sign-offs — L · (SET-1)

### Phase 1 — Time and system states (after the day model and settings)
- [ ] **SYS-2** · Time: the device-zone check, SY-06, the deferred zone and day-close switches applied to future days — M · (USE-1, SET-8)
- [ ] **SYS-3** · About & feedback, the error pages, session expired: SY-01, SY-04, SY-05, the legal pages — M · (SYS-1, SET-8)

### Phase 2 — Platform
- [ ] **SYS-5** · PWA: the install offer and sheet SY-07, the update line SY-02, standalone resume — M · (REV-2, SET-9)

### Phase 3 — Does not gate launch
- [ ] **SYS-4** · Keyboard and focus: global shortcuts, `?`, list and canvas navigation, form submit keys — M · (USE-2, USE-5, SYS-3)

## Ordering constraints (alphabetical order hides these)

- **SYS-1 precedes every screen in every epic that renders inside the shell** (SET-4 onward, USE-2 onward, REV-2 onward). SET-2 (auth) and SET-3 (assets) do not need it. Building the library before the shell means a screen with no back and no tab bar to verify against.
- **SET-1 precedes SYS-1** — the pending-review count reads `days` and `day_items`; without the tables the procedure cannot compile.
- **USE-1 and SET-8 precede SYS-2** — the pending pair's application (USE-1) and ST-08's fields (SET-8) are what the switch dialog writes into.
- **SET-8 precedes SYS-3** — About is a Settings section; its index row is SET-8's.
- **REV-2 precedes SYS-5** — the install offer's trigger is the third reviewed day.
- **SET-9 precedes SYS-5** — the install steps sheet is SET-9's `PlatformStepsSheet`.
- **USE-2, USE-5, SYS-3 precede SYS-4** — rows and blocks to navigate; About's shortcut table to fill.

## Full dependency table

| Ticket | Complete-required dependencies |
|---|---|
| SYS-1 | SET-1 |
| SYS-2 | USE-1, SET-8 |
| SYS-3 | SYS-1, SET-8 |
| SYS-4 | USE-2, USE-5, SYS-3 |
| SYS-5 | REV-2, SET-9 |

## Ticket-authoring batches (distinct from build phases)

| Batch | Tickets | Why grouped |
|---|---|---|
| 1 | SYS-1 | The shell alone |
| 2 | SYS-2, SYS-3 | Two settings-adjacent system behaviours |
| 3 | SYS-4, SYS-5 | Desktop and platform affordances |

All five were authored in one pass on 2026-09-05 (see `../README.md` § Authoring note and `DEVIATIONS.md`).

## Locked references (do not re-litigate)

- **Decisions:** cross-cutting §13's nine calls; official spec §0.3; v2 handoff §10 D2 (Vaul drawer), §12 calls; INF-7's launch-cookie and `resolveEntry`; INF-9's push-only service worker; this track's rulings in `TECHNICAL-DECISIONS.md`.
- **Binding law:** `README.md` § Non-negotiables; `apps/web/AGENTS.md`; `../README.md` § Placement rules; `codebase-conventions.md` §0, §3.1, §6, §9.
- **Launch-blocking set:** SYS-1, SYS-2, SYS-3, SYS-5.
- **What does not gate:** SYS-4. Offline/sync (SY-03) is Phase 2 and not in this track.
