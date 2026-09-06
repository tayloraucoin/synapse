# Epic 1 — Setup — Build Order

**New here? Read `README.md` first** — process, kickoff contract, completion protocol, precedence — and [`../README.md`](../README.md) for the global order across all four tracks. This file is the ordered, checkable build queue for this track.

> Derived from each ticket's `## Depends on`. A ticket may start only when everything it lists shows **Complete** in the owning track's `PROGRESS.md`. If this file and a ticket's `## Depends on` disagree, **the ticket wins** — fix this file.

## How to work this file

1. Find the next unchecked ticket. 2. Confirm its gate in `PROGRESS.md` (and the other track's, where a dependency crosses). 3. Build one ticket per thread. 4. On done, close in three places, then tick here.

## Critical path (sequential)

SET-1 → SET-4 → SET-5 → SET-6 → SET-7

The schema, then the library a template is built from, then the template a week is built from, then the week that gives tomorrow a list, then the sequence that walks a stranger through all of it. USE-1 (epic-2-in-use) sits between SET-1 and SET-6 on the global path.

## Build-order checklist

### Phase 0 — The root
- [x] **SET-1** · Domain schema: every §3 table in one migration, seeds, constants — L · (none; INF-5 Complete) · **Mason migration review; a human runs `db:migrate`** — reviewed 2026-09-05; `0001_famous_titania.sql` awaits Taylor

### Phase 1 — Identity and assets (parallel with Phase 0)
- [x] **SET-2** · Auth: AU-01…05, the invite line, sign-out and session flows — L · (none; INF-6/7/8 Complete) — built 2026-09-05; **Vigil's six failure paths unrun until a Supabase project exists**
- [x] **SET-3** · Icon and avatar pipeline: bucket policies, signed uploads, the streaming read route — M · (SET-1) — built 2026-09-05; **the three Vigil probes need Supabase Storage**

### Phase 2 — The library
- [x] **SET-4** · Categories and the habit library: API, CT-01/02, LB-01/02/03 — L · (SET-1, SET-3, SYS-1) · Vesper review of the icon chooser — built 2026-09-05; **Vesper's review needs a reachable signed-in shell**

### Phase 3 — Templates and the week
- [x] **SET-5** · Templates: API, TP-01/02/03, the multitask rule — L · (SET-4) — built 2026-09-05; **the invariant was probed directly; the screens need a reachable session**
- [x] **SET-6** · Week build and materialisation: WK-01/02/03, TP-04, the apply flow — L · (SET-5, USE-1) · **Mason review of the materialiser** — built 2026-09-05; **one untouched predicate, four callers; the rendered SQL caught a syntax error the type system could not**

### Phase 4 — Sequences and settings
- [ ] **SET-7** · First run: FR-01…05, resume, the setup status line — M · (SET-4, SET-5, SET-6)
- [ ] **SET-8** · Settings core: ST-00, ST-01 (+AU-06), ST-08, ST-09, ST-11 — M · (SET-3, SYS-1)
- [ ] **SET-9** · Reasons and notification preferences: ST-06/06a, ST-07, the permission sheet — M · (SET-5, SET-6, SET-8)
- [ ] **SET-10** · Your data: export and delete account, ST-10/10a — M · (SET-8) · **Vigil: destructive path**

## Ordering constraints (alphabetical order hides these)

- **SET-1 precedes every data-bearing ticket in every track.** It is the one migration; a ticket that adds a column later is a logged deviation, not a second migration by default.
- **SET-2 is independent of SET-1.** Auth writes only `auth.users` and the trigger-fed shadow row. Build it in parallel.
- **SET-3 precedes SET-4** — LB-02's *Image* tab is the first consumer of the upload pipeline; building the sheet first means a stubbed tab that gets rewritten.
- **SYS-1 precedes SET-4** — the library is the first screen inside the shell that a person navigates *into*; without the chrome there is no back and no tab bar to verify against. SET-2 and SET-3 do not need it.
- **SET-5 precedes SET-6** — the week build applies templates; the materialiser reads slots.
- **USE-1 precedes SET-6** — the materialiser writes absolute timestamps with `wallClockToInstant` and keys days with `resolveDayKey`; writing a second copy of that arithmetic here is how two days disagree about when they start.
- **SET-4, SET-5, SET-6 precede SET-7** — first run embeds LB-02, TP-02, and WK-01 whole. A first-run ticket built earlier invents three forms.
- **SET-8 precedes SET-9 and SET-10** — the settings index (ST-00) is the door to both; ST-08's day-close and review-reminder fields are what ST-07 mirrors.
- **SET-5 and SET-6 precede SET-9** — the permission sheet's trigger is *the first fixed-time slot saved* in TP-03 or WK-03; SET-9 wires the hook into those two forms.

## Full dependency table

| Ticket | Complete-required dependencies |
|---|---|
| SET-1 | — (INF-5) |
| SET-2 | — (INF-6, INF-7, INF-8) |
| SET-3 | SET-1 |
| SET-4 | SET-1, SET-3, SYS-1 |
| SET-5 | SET-4 |
| SET-6 | SET-5, USE-1 |
| SET-7 | SET-4, SET-5, SET-6 |
| SET-8 | SET-3, SYS-1 |
| SET-9 | SET-5, SET-6, SET-8 |
| SET-10 | SET-8 |

## Ticket-authoring batches (distinct from build phases)

| Batch | Tickets | Why grouped |
|---|---|---|
| 1 | SET-1, SET-3 | The data contract and the one non-tRPC rail it needs |
| 2 | SET-2 | Auth alone — Supabase flows, no domain model |
| 3 | SET-4, SET-5, SET-6 | The library → template → week write path; one materialisation rule named in three places |
| 4 | SET-7, SET-8 | The two screens that compose everything else |
| 5 | SET-9, SET-10 | Reasons, notification preferences, and the trust surface |

All ten were authored in one pass on 2026-09-05 (see `../README.md` § Authoring note and `DEVIATIONS.md`).

## Locked references (do not re-litigate)

- **Decisions:** official spec §0.3 R1–R7; Epic 1 §13's four calls (day-close bound 00:00–06:00 and 03:00 default; FR-04 targets next week on Saturday/Sunday; the ten starter habits; calendar-import counts — Phase 2); v2 handoff §10 D2–D15 and §12; this track's rulings, summarised in `TECHNICAL-DECISIONS.md`.
- **Binding law:** `README.md` § Non-negotiables; `../README.md` § Placement rules; `apps/web/AGENTS.md` § Product non-negotiables; `codebase-conventions.md` §0, §6, §7, §8.
- **Launch-blocking set:** all ten tickets (official spec §12 Phase 1).
- **What does not gate:** nothing in this track waits on Epic 3 or on USE-2 onward. The template editor's *Applied to {n} days* line and TP-04 need days to exist (SET-6), not the List (USE-2).
