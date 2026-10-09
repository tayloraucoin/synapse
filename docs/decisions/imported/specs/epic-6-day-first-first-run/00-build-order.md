# Epic 6 — The first run built day-first (UX v1.3) — Build Order

**New here? Read `README.md` first**, then [`../README.md`](../README.md) for the global order. This file is the ordered, checkable build queue for this track, the build batches Mason executes, and the coverage matrix that proves every section of v1.3 has a ticket.

> Derived from each ticket's `## Depends on`. A ticket may start only when everything it lists shows **Complete** in the owning track's `PROGRESS.md`. If this file and a ticket's `## Depends on` disagree, **the ticket wins** — fix this file.

## How to work this file

1. Find the next unchecked batch. 2. Confirm every ticket's gate in `PROGRESS.md` (Epic 5's RUN-1…RUN-13 are Complete; nothing here waits on RUN-14 or RUN-15). 3. Build one batch per thread, one ticket at a time with the checkpoint between. 4. On done, close each ticket in three places, then tick here.

## Critical path (sequential)

DAY-1 → DAY-2 → DAY-3 → DAY-4 → DAY-5 → DAY-7 → DAY-8 → DAY-9 → DAY-10 → DAY-11 → DAY-12 → DAY-13

The fix batch (the composites, then the screens); the contract and the seeds; the one additive migration; the plan services; the v1.3 composites; the outer sequence; the builder in three movements; the week, the frame and the evening; the retirements. DAY-6 (the day side) runs beside DAY-5 once DAY-4 is Complete and gates DAY-11 and DAY-12.

## Build-order checklist

### Phase 0 — The fix batch (survives any flip of §13)
- [x] **DAY-1** · The fix batch, the composites: the selection grammar on `LargeTargetRow`, `InfoDisclosure`, `PriorityMark`, the two-line collapsed card, steppers by one with an empty state, `StepFrameSkeleton`, the `SearchField` padding, stories — M · (none) · **Vesper review of stories in both themes**
- [x] **DAY-2** · The fix batch, the screens: the workout card that never remounts, *Usual days* kept, created order for setup lists, the ranked screen in place with the matters cell, the `Select` on screen 2, the focus card's alignment, the passage card centred, `loading.tsx` and pending primaries — M · (DAY-1) · **Vigil: the remount induced on a slow network**

### Phase 1 — The contract and the migration (no UI)
- [x] **DAY-3** · Vocabulary, view models, validators, the seeds: `transition`, `usually`, `link_kind`, the activity and after-work libraries with groups, the morning groups, the widened breaks, the example day, the link hosts, the block words, the block-hue tokens, `SETUP_TOTAL_STEPS` untouched until DAY-8 — M · (none) · **Mason review of the unions and the tokens**
- [x] **DAY-4** · Migration `0009_v1_3_additive`: `block_kind += transition`, `link_kind`, `links`, `fixtures` place and travel, `day_plans` two template FKs, `users.same_morning_routine` — M · (DAY-3) · **Mason migration review**

### Phase 2 — The services
- [x] **DAY-5** · Plan services: the plan-owned work template, the two new lists on a plan, links CRUD, fixtures' place and travel, *Usually* in the profile and the pre-fill, `same_morning_routine`, created order, *Working today* by plan — L · (DAY-4) · **Mason review of TD-23's ownership rule**
- [x] **DAY-6** · The day under v1.3: N training blocks keyed by workout, the transition block, the pooled activity block and `chooseFromPool`, fixture travel rows, *Not working today* on a *Usually* day, the quote after the journal — L · (DAY-4) · **Vigil: a day with two before-the-routine workouts; a pooled evening left pooled through the Day Review**

### Phase 3 — The composites
- [x] **DAY-7** · `@syn/ui` for v1.3: `BlockBand` hue, the compact example axis, `LinkCallout`, `BrandGlyph`, `SelectRow` with a leading `PriorityMark`, the `FixtureSheet`'s where/place/travel fields, stories — M · (DAY-1, DAY-3) · **Vesper review of the hues in both themes**

### Phase 4 — The screens
- [x] **DAY-8** · The outer sequence: five steps, screen 2 the blocks primer, screen 3 with *Usually*, the routes and redirects, the entry tree's clamp, Settings → Your day's new list — L · (DAY-3, DAY-5, DAY-7) · **Vesper review of screen 2**
- [x] **DAY-9** · The builder, first movement (B1–B7): name and days with the helper, up and lights out, work on this day, training with the cards and N placements, getting ready with the starters inline, fixed on this day with place and travel, so far — L · (DAY-8, DAY-5)
- [x] **DAY-10** · The builder, second movement (B8–B12): first thing with links, the landscape grouped, ranked in place, the routine with the same/varies question, winding down with the starters and the journal — L · (DAY-9, DAY-5)
- [x] **DAY-11** · The builder, third movement (B13–B17 and Your days): during work, after work, free time's landscape and ranking, this day's pool, the review with hues and what-gives, another day from the last — L · (DAY-10, DAY-6)
- [x] **DAY-12** · The week, the frame and the evening: screen 5 with hue strips, the orient frame's callouts, the pick's *Free time* section and the Today row, the day header's two rows, the quote after the journal, Settings' new screens — L · (DAY-11, DAY-6) · **Vigil: the pooled block through Set from the plan; the header rows on Usually and Rarely days**

### Phase 5 — The retirements
- [x] **DAY-13** · Migration `0010_retirements` (RUN-15's three drops carried in) and the file retirements: the nine v1.2 step files, `work-day-type-card`'s list, the three settings screens, `range-input`, `ensureWorkTemplates` if unreferenced, the native select if unreferenced; references regenerated — S · (DAY-8, DAY-9, DAY-10, DAY-11, DAY-12) · **Mason migration review**

## Ordering constraints (alphabetical order hides these)

- **DAY-1 precedes DAY-2** — the screens' fixes compose the composites' fixes (the grammar, the card, the stepper, the skeleton).
- **DAY-1 and DAY-2 precede nothing else and are gated by nothing** — the fix batch ships first so it survives Taylor's read of §13.
- **DAY-3 precedes DAY-4** — the enum tuples and the validators are what the migration's enums and every service compute with.
- **DAY-4 precedes DAY-5 and DAY-6** — a service written against columns that do not exist invents them.
- **DAY-5 precedes DAY-8** — the outer sequence's screen 3 writes *Usually* through the widened validator and Settings lists the new screens' data.
- **DAY-7 precedes DAY-8** — screen 2's example day needs the hued band and the compact axis.
- **DAY-8 precedes DAY-9** — the builder is screen 4 of five; its frame, routes and the entry clamp land once.
- **DAY-9 → DAY-10 → DAY-11** — one `BUILDER_SCREENS` order, filled front to back; a movement is not built ahead of the screens it follows.
- **DAY-6 precedes DAY-11 and DAY-12** — the pool's service and the N-block materialiser are what B16, the review's preview, the pick's section and the Today row call.
- **DAY-11 precedes DAY-12** — screen 5 reads complete plans with pools and transitions.
- **DAY-8…DAY-12 precede DAY-13** — nothing is dropped while a surface still writes or imports it.

## Full dependency table

| Ticket | Complete-required dependencies |
|---|---|
| DAY-1 | — (RUN-7 Complete in Epic 5; consumed) |
| DAY-2 | DAY-1 |
| DAY-3 | — (RUN-1 Complete in Epic 5; consumed) |
| DAY-4 | DAY-3 |
| DAY-5 | DAY-4 |
| DAY-6 | DAY-4 |
| DAY-7 | DAY-1, DAY-3 |
| DAY-8 | DAY-3, DAY-5, DAY-7 |
| DAY-9 | DAY-8, DAY-5 |
| DAY-10 | DAY-9, DAY-5 |
| DAY-11 | DAY-10, DAY-6 |
| DAY-12 | DAY-11, DAY-6 |
| DAY-13 | DAY-8, DAY-9, DAY-10, DAY-11, DAY-12 |

## Ticket-authoring batches (distinct from build phases)

| Batch | Tickets | Why grouped | Status |
|---|---|---|---|
| 1 | DAY-1, DAY-2 | The fix batch: composites and the screens that compose them | **Authored 2026-09-24** |
| 2 | DAY-3, DAY-4 | The contract and the migration: the unions, the validators and the columns agree | **Authored 2026-09-24** |
| 3 | DAY-5, DAY-6 | The services over that model: plan side, day side | **Authored 2026-09-24** |
| 4 | DAY-7, DAY-8 | The composites and the outer sequence that first uses them | **Authored 2026-09-24** |
| 5 | DAY-9, DAY-10, DAY-11 | The builder's three movements: one `BUILDER_SCREENS` order | **Authored 2026-09-24** |
| 6 | DAY-12, DAY-13 | The surfaces around the builder and the cleanup | **Authored 2026-09-24** |

All thirteen were authored in one thread on 2026-09-24, exceeding the guide's §7.4 ceiling for the same reason Epics 4 and 5 did — one data model (TD-23…TD-31), and tickets written apart would disagree about it. Logged in `DEVIATIONS.md`.

## Build batches (what Mason executes, one per thread)

Taylor's standing instruction (Epic 5, 2026-09-16): Mason executes the track in batches, one batch per thread, and Taylor advances with **"next batch"**. The README's kickoff contract carries the **hard checkpoint between tickets** inside a batch. A batch never starts a ticket whose gate is not Complete. Two L tickets is the heaviest batch; batch 6 is three because the builder's three movements share one file order and one hook.

| Batch | Tickets | Gate (Complete in `PROGRESS.md`) | What it proves | Status |
|---|---|---|---|---|
| 1 | DAY-1 · DAY-2 | — | The v1.2 build's defects gone: the card stays open, the steppers step by one, nothing blanks, the selection reads as a selection | **Complete 2026-09-25** |
| 2 | DAY-3 · DAY-4 | — | The contract and the columns for everything after | **Complete 2026-09-25** (`0009` authored, not applied) |
| 3 | DAY-5 · DAY-6 | DAY-4 | The plan owns its work; two workouts on a day; a pooled evening; travel on a fixture | **Complete 2026-09-25** |
| 4 | DAY-7 · DAY-8 | DAY-1, DAY-3, DAY-5 | Five outer screens; the primer with hues; *Usually* | **Complete 2026-09-25** |
| 5 | DAY-9 · DAY-10 | DAY-8, DAY-5 | Day A's morning built day-first through B12 | **Complete 2026-09-25** |
| 6 | DAY-11 · DAY-12 | DAY-10, DAY-6 | The evening, the review, another day, the week; the frame's callouts; the pool on the day | **Complete 2026-09-25** |
| 7 | DAY-13 | DAY-8…DAY-12 | The old screens and columns gone; references regenerated | **Complete 2026-09-25** (`0010` authored, not applied) |

## Coverage matrix — every section of v1.3 → the ticket that ships it

| v1.3 § | What | Ticket(s) |
|---|---|---|
| §1 vocabulary, §12.2 | The words; the copy files | DAY-3 (`BLOCK_KIND_WORDS`) · every screen ticket (its `copy.ts`) |
| §2 guardrail 6 | The sequence never blanks | DAY-1 (`StepFrameSkeleton`) · DAY-2 (`loading.tsx`) · DAY-8…DAY-11 (per-screen skeletons) |
| §3.1 blocks, hues | The ninth kind; the tokens; `BlockBand hue` | DAY-3 · DAY-4 · DAY-7 |
| §3.8 the plan's own work | TD-23; B3; *Working today · as Day A* | DAY-5 · DAY-9 · DAY-12 |
| §3.9 usually | The value; *Not working today* | DAY-3 · DAY-5 · DAY-6 · DAY-8 · DAY-12 |
| §3.13 day plans | The two new lists | DAY-4 · DAY-5 · DAY-11 |
| §3.14 fixtures: place, travel | Columns; the sheet; travel rows | DAY-4 · DAY-5 · DAY-6 · DAY-7 · DAY-9 |
| §3.15 several workouts | TD-24; B4 | DAY-6 · DAY-9 |
| §3.16 free time | The library; the pool; `chooseFromPool`; the pick and the Today row | DAY-3 · DAY-5 · DAY-6 · DAY-11 · DAY-12 |
| §3.17 links | The table; the sheet; the callouts | DAY-3 · DAY-4 · DAY-5 · DAY-7 · DAY-10 · DAY-12 |
| §4 frame rules | R56, R57, R58, R60, R62, R63; *Back* on the action row | DAY-1 · DAY-2 · DAY-9 |
| §4.1 | Screen 1 | DAY-8 |
| §4.2 | Screen 2, the primer | DAY-3 (the example day) · DAY-7 · DAY-8 |
| §4.3 | Screen 3, five values, the `Select`, the disclosure | DAY-1 · DAY-2 · DAY-8 |
| §4.4 B1–B7 | The first movement | DAY-9 |
| §4.4 B8–B12 | The second movement | DAY-10 |
| §4.4 B13–B17, Your days | The third movement | DAY-11 |
| §4.5 | Screen 5 | DAY-12 |
| §4.6 Settings → Your day | The new list; redirects; the new screens | DAY-8 · DAY-12 · DAY-13 |
| §4.7 the library | The new groups | DAY-10 · DAY-11 |
| §5.2 the frame | The callouts | DAY-12 |
| §5.3 the pick | *Free time* | DAY-12 |
| §6 the day | The transition section; the pooled row; fixture travel; the header rows | DAY-6 · DAY-12 |
| §7.2 the journal | The quote after | DAY-6 · DAY-12 |
| §8, §9 | Counting; no new push | DAY-6 |
| §10.2 component states | Every new and amended composite | DAY-1 · DAY-7 · the screen ticket that composes it |
| §10.4 accessibility | The disclosure, the callout, the mark, the bands, the skeleton, the `Select` | DAY-1 · DAY-7 · DAY-8 |
| §11.1–§11.5 | The columns and the table | DAY-3 · DAY-4 |
| §11.6 materialisation | The transition; the pooled block; N blocks; fixture travel | DAY-6 |
| §12.4 seeds | The libraries, the groups, the example day, the hosts | DAY-3 |
| §13 open items | Each default cited where it lands | the ticket named in §13's *Where* column |
| Cleanup | `0010`, the retirements | DAY-13 |

## Locked references (do not re-litigate)

- **Decisions:** v1.3 §0.3 R44–R68; v1.2 R28–R43 and v1.1 R1–R27 where not amended; this track's TD-23…TD-31; Epic 5's TD-10…TD-22; Epic 4's TD-1…TD-9. Cite by ID; re-opening requires new evidence routed to Taylor.
- **Binding law:** `README.md` § Non-negotiables; `apps/web/AGENTS.md` § Product non-negotiables; `../README.md` § Placement rules; `codebase-conventions.md`; `drizzle-orm-conventions.md` for every schema line.
- **Launch-blocking set:** DAY-1…DAY-13. **Does not gate:** nothing.
- **What waits on Taylor:** nothing. §13 #31 (the hue mapping) is `[PROPOSED]` and built as written; #37, #38, #39 are `[OPEN]` and built to their defaults. A flip is a `DEVIATIONS.md` line.
