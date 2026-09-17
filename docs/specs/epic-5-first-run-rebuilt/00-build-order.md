# Epic 5 — The first run rebuilt (UX v1.2) — Build Order

**New here? Read `README.md` first**, then [`../README.md`](../README.md) for the global order. This file is the ordered, checkable build queue for this track, and the coverage matrix that proves every section of v1.2 has a ticket.

> Derived from each ticket's `## Depends on`. A ticket may start only when everything it lists shows **Complete** in the owning track's `PROGRESS.md`. If this file and a ticket's `## Depends on` disagree, **the ticket wins** — fix this file.

## How to work this file

1. Find the next unchecked ticket. 2. Confirm its gate in `PROGRESS.md` (Epic 4's is all Complete; nothing here waits on another track). 3. Build one ticket per thread. 4. On done, close in three places, then tick here.

## Critical path (sequential)

RUN-1 → RUN-2 → RUN-3 → RUN-7 → RUN-8 → RUN-10 → RUN-11 → RUN-12 → RUN-13 → RUN-15

The contract and the seeds; the one additive migration; the plan services; the composites; the frame and the first five screens (and the renumbering to fourteen); screens 7–9; screens 10–12; the day builder; the week and the morning modes; the cleanup. RUN-4, RUN-5, RUN-6 and RUN-9 run beside that line once their gates open; RUN-14 is provisional and off it.

## Build-order checklist

### Phase 0 — The contract and the migration (no UI)
- [x] **RUN-1** · Vocabulary, view models, validators, the seeds with their glyphs, the emoji lint rule, the two guide amendments — M · (none) · **Mason review of the unions and the lint override** — built 2026-09-16; **six new `pgEnum` tuples and two extended, the icon schema split into `icon.ts`, the rule proven on both literal forms**
- [x] **RUN-2** · Migration `0007`: the additive columns, `passages`, `quotes`, `day_plans`, `days.work_template_id`, the `passages` bucket, the `orient_passage` backfill — L · (RUN-1) · **Mason migration review** — authored 2026-09-16; **generated then hand-amended; neither added enum value is used in the file; not applied to any tier — Taylor runs it after `0004`–`0006`**

### Phase 1 — The services
- [x] **RUN-3** · Plan services: work-day types, fixture kinds and icons, habit versions and workout details, `usedBy` on templates, the profile widened — L · (RUN-2) — built 2026-09-16; **the retired inputs are ignored, not removed, until their senders go; database-backed criteria unverified**
- [x] **RUN-4** · Passages and the quote bank: `passage.*`, the `passage` upload kind, `quote.today`, the orient read model with the carousel and the third line — M · (RUN-2) — built 2026-09-16; **one `cycleIndex` for both cycles; the frame bridged until RUN-9; database-backed criteria unverified**
- [x] **RUN-5** · Day plans: the service, the weekday invariant, duplicate and delete, `week.prefill` reading plans first, *Set from the plan* through `saveMorning` — L · (RUN-3) · **Mason review of the weekday invariant and the confirm path (TD-10, TD-17)** — built 2026-09-16; **TD-21 and migration `0008` (a day snapshots its four anchors and exclusions); the cleanup is now `0009`; one workout per day placed from a plan — `[OPEN — Reeve]` N training blocks**
- [x] **RUN-6** · The day under v1.2: travel rows in the materialiser and the layout, version resolution in `confirmDay` and `editHabitDay`, `applyWorkType`, the journal reminder in `notify.ts` — L · (RUN-3) · **Vigil: the reminder's empty-at-send-time rule; travel rows dropped alone**

### Phase 2 — The composites
- [x] **RUN-7** · `@syn/ui` for v1.2: `Card`, `SelectRow`, `SortableList`, `RangeEditor`, `RichTextEditor`, `TagInput`, `PassageCarousel`, the optimistic steppers, `StepFrame` sticky, `TimeField` Done and leading, `WeekdayChips` flexible, `BlockBand` in-band labels, `LargeTargetRow` leading, the `font-emoji` stack, stories — L · (RUN-1) · **Vesper review of stories in both themes**

### Phase 3 — Setup, screens 1–12
- [x] **RUN-8** · The frame and screens 1–5: sticky action row, fourteen steps, the archetype glyphs, four-value selects with the disclosure, *Same shape?* and work-day type cards, fixture kinds, one wake time — L · (RUN-3, RUN-7)
- [x] **RUN-9** · Screen 6 and the orient frame: passages as a list with the sheet, the quote switch, the three morning-line switches; the carousel, the *Last night* row, the visualisation field; Settings → Before the day — L · (RUN-4, RUN-7, RUN-8) · **Sage lens on §5.2; Vesper review**
- [ ] **RUN-10** · Screens 7–9: steps as `SelectRow`s with the sortable lengths and the step sheet, the landscape's two tabs, the ranked screen with `HabitSetupCard` and versions — L · (RUN-8, RUN-3)
- [ ] **RUN-11** · Screens 10–12: `WorkoutSetupCard` with type, where and travel; closing the day with the new defaults, wind-down rows, sortable prompts and the reminder; `FocusSetupCard` with *Flexible*; Settings → Notifications gains N2 — L · (RUN-8, RUN-3, RUN-6)

### Phase 4 — The day builder, the week, the morning
- [ ] **RUN-12** · Screen 13 — the day builder: nine sub-screens, the three named lists, the review at 96px/h, `DayPlanCard`, *Build another day*; Settings → Your days; the block editor's template list with *used by* — L · (RUN-5, RUN-10, RUN-11) · **Vesper review of 13e's room line and 13i**
- [ ] **RUN-13** · Screen 14 and the morning modes: the week rows and the question, completion from plans, the week build's *Plan* row, the pick expanded under *build*, *Set from the plan* on the frame, *Working today* on a *Rarely* day, travel rows on Today and the Schedule; `step-12-fit` deleted — L · (RUN-12, RUN-6, RUN-9) · **Vigil: the Sometimes-day dialog; a plan-less day under set_from_plan**

### Phase 5 — Provisional and cleanup
- [ ] **RUN-14** · The quotes admin surface: `(admin)` route group, `adminProcedure`, `ADMIN_USER_IDS`, list · form · publish — M · (RUN-4) · **`[PROVISIONAL — Taylor, D3]`; does not gate; Mason review of the service-role write path**
- [ ] **RUN-15** · Migration `0008` and the retirements: drop `earliest_wake_time`, `orient_passage`, `orient_show_last_night`; remove `range-input`, `rotation-rows.tsx`; regenerate the references — S · (RUN-9, RUN-10, RUN-11, RUN-13) · **Mason migration review**

## Ordering constraints (alphabetical order hides these)

- **RUN-1 precedes everything** — the unions (`rarely`, `MorningMode`, `travel`, `journal_reminder`, the kinds), the validators and the seeds are what the migration's enums and every service and screen compute with.
- **RUN-2 precedes every service ticket** — a service written against columns that do not exist invents them.
- **RUN-3 precedes RUN-5 and RUN-6** — a plan references work templates with hours (TD-14) and habits with versions and travel (TD-11, TD-12); the day-side services resolve those.
- **RUN-7 precedes every screen ticket** — new reusable UI lands in `@syn/ui` with a story first. A screen ticket that finds a composite missing STOPS.
- **RUN-8 precedes RUN-9, RUN-10, RUN-11** — one sequence, renumbered to fourteen once, in RUN-8; the later tickets fill it.
- **RUN-4 precedes RUN-9** — the passage list, the sheet and the carousel read `passage.*` and `quote.today`.
- **RUN-10 and RUN-11 precede RUN-12** — the builder composes steps, ranked habits with versions, workouts with placement and travel, and wind-down habits that those screens create.
- **RUN-5 precedes RUN-12** — the builder writes through the day-plans service.
- **RUN-12 precedes RUN-13** — the week screen reads plans; completion pre-fills from them.
- **RUN-6 and RUN-9 precede RUN-13** — *Set from the plan* lives on the orient frame (RUN-9) and calls `saveMorning`'s `andSetDay` (RUN-5) which materialises travel rows (RUN-6); *Working today* calls `applyWorkType` (RUN-6).
- **RUN-9, RUN-10, RUN-11, RUN-13 precede RUN-15** — nothing is dropped while a surface still writes or imports it.
- **RUN-14 gates nothing** and is gated by D3; if D3 stalls, the bank ships seeded (RUN-2) and the opt-in switch (RUN-9) reads it.

## Full dependency table

| Ticket | Complete-required dependencies |
|---|---|
| RUN-1 | — (DYN-21 Complete in Epic 4; consumed) |
| RUN-2 | RUN-1 |
| RUN-3 | RUN-2 |
| RUN-4 | RUN-2 |
| RUN-5 | RUN-3 |
| RUN-6 | RUN-3 |
| RUN-7 | RUN-1 |
| RUN-8 | RUN-3, RUN-7 |
| RUN-9 | RUN-4, RUN-7, RUN-8 |
| RUN-10 | RUN-8, RUN-3 |
| RUN-11 | RUN-8, RUN-3, RUN-6 |
| RUN-12 | RUN-5, RUN-10, RUN-11 |
| RUN-13 | RUN-12, RUN-6, RUN-9 |
| RUN-14 | RUN-4 · and D3 ratified |
| RUN-15 | RUN-9, RUN-10, RUN-11, RUN-13 |

## Ticket-authoring batches (distinct from build phases)

| Batch | Tickets | Why grouped | Status |
|---|---|---|---|
| 1 | RUN-1, RUN-2 | The contract and the one migration: written together so the unions, the validators and the columns agree | **Authored 2026-09-16** |
| 2 | RUN-3, RUN-4, RUN-5, RUN-6 | The services over that model: plan side, passages, day plans, day side | **Authored 2026-09-16** |
| 3 | RUN-7 | The composites alone, with Vesper's review list | **Authored 2026-09-16** |
| 4 | RUN-8, RUN-9 | The frame, the first five screens, and screen 6 with the frame it feeds | **Authored 2026-09-16** |
| 5 | RUN-10, RUN-11 | Screens 7–12: the cards | **Authored 2026-09-16** |
| 6 | RUN-12, RUN-13 | The builder and the week: one composition, two screens | **Authored 2026-09-16** |
| 7 | RUN-14, RUN-15 | The provisional surface and the cleanup | **Authored 2026-09-16** |

All fifteen were authored in one thread on 2026-09-16, exceeding the guide's §7.4 ceiling for the same reason Epic 4's batches 1 and 2 did — one data model, and tickets written apart would disagree about it. Logged in `DEVIATIONS.md`.

## Build batches (distinct from authoring batches and from phases)

Taylor's instruction, 2026-09-16: Mason executes the track in batches, one batch per turn, and Taylor advances with **"next batch"**. This relaxes the README's one-ticket-per-thread rule (logged in `DEVIATIONS.md`) and keeps what that rule protects: a **hard checkpoint between tickets** inside a batch — three-place closure, the four verify commands, a five-line report — before the next ticket's attach-list is read. A batch never starts a ticket whose gate is not Complete. Two L tickets is the heaviest batch.

| Batch | Tickets | Gate (Complete in `PROGRESS.md`) | Status |
|---|---|---|---|
| 1 | RUN-1 · RUN-2 | — | **Complete 2026-09-16** |
| 2 | RUN-3 · RUN-4 | RUN-2 | **Complete 2026-09-16** |
| 3 | RUN-5 · RUN-6 | RUN-3 | **Complete 2026-09-16** |
| 4 | RUN-7 | RUN-1 | **Complete 2026-09-16** |
| 5 | RUN-8 · RUN-9 | RUN-3, RUN-4, RUN-7 | **Complete 2026-09-16** |
| 6 | RUN-10 · RUN-11 | RUN-8, RUN-3, RUN-6 | next |
| 7 | RUN-12 | RUN-5, RUN-10, RUN-11 | |
| 8 | RUN-13 | RUN-12, RUN-6, RUN-9 | |
| 9 | RUN-15 (+ RUN-14 only if D3 is ratified in `TECHNICAL-DECISIONS.md`; otherwise RUN-14 is skipped and the report says so) | RUN-9, RUN-10, RUN-11, RUN-13 (· RUN-4, D3) | |

## Coverage matrix — every section of v1.2 → the ticket that ships it

| v1.2 § | What | Ticket(s) |
|---|---|---|
| §1.4 vocabulary, §12.2 | The new unions and words; the copy files | RUN-1 (unions) · every screen ticket (its `copy.ts`) |
| §2 guardrails 4–5 | Optimistic by rule; save as you go | RUN-1 (guides) · RUN-7 (composites, TD-18) · every screen ticket |
| §3.5 versions | `habits.versions`, `day_items.version_key`, the tabs | RUN-1 · RUN-2 · RUN-3 · RUN-6 · RUN-10 · RUN-12 · RUN-13 |
| §3.6 fixture kinds | `fixtures.kind`, `icon`; the sheet's chips | RUN-1 · RUN-2 · RUN-3 · RUN-8 |
| §3.7 training: type, where, travel | The columns; travel rows; the card | RUN-1 · RUN-2 · RUN-3 · RUN-6 · RUN-11 · RUN-13 |
| §3.8 work-day types | `templates` columns; screen 3; the plan's pick | RUN-2 · RUN-3 · RUN-8 · RUN-12 |
| §3.9 rarely | `work_days` value; `applyWorkType`; *Working today* | RUN-1 · RUN-2 · RUN-6 · RUN-8 · RUN-13 |
| §3.10 the room | The room line; overflow mode a preference | RUN-12 · RUN-13 |
| §3.12 passages and the quote bank | Tables, services, the sheet, the carousel, the switch | RUN-2 · RUN-4 · RUN-9 · RUN-14 |
| §3.13 day plans | The table, the service, the builder, the week | RUN-2 · RUN-5 · RUN-12 · RUN-13 |
| §4 frame rules (R43) | Sticky row, Done, Remove, left-aligned empties, append, scoped sheets, `SelectRow`, cards collapse | RUN-7 · RUN-8 |
| §4.1–§4.5 | Screens 1–5 | RUN-8 |
| §4.6 | Screen 6 | RUN-9 |
| §4.7–§4.9 | Screens 7–9 | RUN-10 |
| §4.10–§4.12 | Screens 10–12 | RUN-11 |
| §4.13 | Screen 13, the builder | RUN-12 |
| §4.14 | Screen 14, the week | RUN-13 |
| §4.15 the week build | The *Plan* row; pre-fill from plans | RUN-5 · RUN-13 |
| §4.16 Settings → Your day | The amended list | RUN-8 · RUN-9 · RUN-10 · RUN-12 · RUN-13 |
| §4.17 the library | Emoji on rows; *Getting ready* | RUN-10 |
| §5.2 the orient frame | Carousel, *Last night*, the third line, *Set from the plan* | RUN-4 · RUN-9 · RUN-13 |
| §5.3 the pick under two modes | Expanded under *build*; skipped under *set* | RUN-5 · RUN-13 |
| §6 the day | Travel rows; *Working today* | RUN-6 · RUN-13 |
| §7.1 wind-down glyphs | The placed rows' icons | RUN-1 · RUN-11 |
| §7.2 the journal reminder | N2 in `notify.ts`; the setting | RUN-1 · RUN-2 · RUN-6 · RUN-11 |
| §9 | N2 in the catalogue and Settings → Notifications | RUN-1 · RUN-6 · RUN-11 |
| §10.2 component states | Every new composite's matrix | RUN-7 · the screen ticket that composes it |
| §10.4 accessibility | `SortableList` keyboard, `SelectRow` pressed, the editor's toolbar, the carousel's tabs | RUN-7 · RUN-9 · RUN-10 |
| §11.1 users, days | The columns | RUN-2 |
| §11.2 habits | versions, workout columns | RUN-2 |
| §11.3 fixtures | kind, icon | RUN-2 |
| §11.4 passages | The table, the bucket | RUN-2 · RUN-4 |
| §11.5 day_plans | The table | RUN-2 · RUN-5 |
| §11.6 quotes | The catalogue; the admin surface | RUN-2 · RUN-4 · RUN-14 |
| §11.7 materialisation | Plans first; travel rows; `andSetDay` | RUN-5 · RUN-6 |
| §12.1 register | The emoji lint rule | RUN-1 |
| §12.4 seeds | The glyphs on every list | RUN-1 |
| §13 open items | Each default cited where it lands | the ticket named in §13's *Where* column |
| Cleanup | `0008`, the retirements | RUN-15 |

## Locked references (do not re-litigate)

- **Decisions:** v1.2 §0.3 R28–R43; v1.1 R1–R27 where not amended; this track's TD-10…TD-20; Epic 4's TD-1…TD-9. Cite by ID; re-opening requires new evidence routed to Taylor.
- **Binding law:** `README.md` § Non-negotiables; `apps/web/AGENTS.md` § Product non-negotiables; `../README.md` § Placement rules; `codebase-conventions.md`; `drizzle-orm-conventions.md` for every schema line.
- **Launch-blocking set:** RUN-1…RUN-13, RUN-15. **Does not gate:** RUN-14.
- **What waits on Taylor:** D3 (RUN-14). Everything else is built against §13's defaults and amended by a `DEVIATIONS.md` line if his read flips one.
