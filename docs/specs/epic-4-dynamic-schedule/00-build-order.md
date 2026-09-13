# Epic 4 — Dynamic schedule (UX v1.1) — Build Order

**New here? Read `README.md` first**, then [`../README.md`](../README.md) for the global order. This file is the ordered, checkable build queue for this track, and the coverage matrix that proves every section of v1.1 has a ticket.

> Derived from each ticket's `## Depends on`. A ticket may start only when everything it lists shows **Complete** in the owning track's `PROGRESS.md`. If this file and a ticket's `## Depends on` disagree, **the ticket wins** — fix this file.

## How to work this file

1. Find the next unchecked ticket. 2. Confirm its gate in `PROGRESS.md` (and the other track's, where a dependency crosses). 3. Build one ticket per thread. 4. On done, close in three places, then tick here.

## Critical path (sequential)

DYN-1 → DYN-2 → DYN-3 → DYN-4 → DYN-5 → DYN-7 → DYN-8 → DYN-11 → DYN-13 → DYN-14 → DYN-15 → DYN-17 → DYN-18 → DYN-20 → DYN-21

The vocabulary and the arithmetic; the two migrations; the services that write blocks and set a day; the composites; the block editor that authors a template; the first run that fills the library; the orient frame; the quick-pick; the Today tab; Adjust; the evening; the notifications that point at all of it; the cleanup that removes the old model. That line is a person setting up a dynamic week, waking into it, and closing it honestly.

## Build-order checklist

### Phase 0 — The contract (no UI)
- [x] **DYN-1** · Vocabulary, view models, constants, and `stackBlock`: the block model's types and its one arithmetic — M · (none) · **Mason review of `stackBlock`'s probes** — built 2026-09-12; **the five `pgEnum` tuples moved with the unions so the workspace stays green; `0004` carries all five `ADD VALUE`s**
- [x] **DYN-2** · Migration `0004`: block templates, stacked slots, block kinds and rotations on habits, the offset backfill — L · (DYN-1) · **Mason migration review** — authored 2026-09-12; **the backfill measures gaps from the previous position's end, a window's end being its own end and a before-wake slot's being shifted to the anchor; verified on scratch databases, not yet applied to any tier**
- [x] **DYN-3** · Migration `0005`: the profile, fixtures, `day_blocks`, the day-side columns, the journal, per-block notification prefs, the trigger amendment — L · (DYN-2) · **Mason migration review** — authored 2026-09-12; **the existing immutability function already permitted exactly `NULL → value`, so it is armed on `day_blocks` unchanged; `0004` and `0005` may run in one `db:migrate`; verified on scratch databases, not yet applied to any tier**

### Phase 1 — The services
- [x] **DYN-4** · Plan services: block templates by kind, the same-position rule with *one of*, fixtures, workouts and focuses, the library by block — L · (DYN-3) · **Mason review of the position invariant**
- [x] **DYN-5** · Materialisation per block and *Set the day*: `materializeDay` rewritten, `confirmDay`, the day read model by block, the week view by block — L · (DYN-4) · **Mason review of the keep rules and the trigger transition**
- [x] **DYN-6** · Adjust, *Do now*, habit-day edits, and moves: `adjustDay`, `doNow`, `editHabitDay`, `moveItem`, `moveBlock`, the reflow — L · (DYN-5) · **Mason review; Vigil: induced staleness between preview and apply**

### Phase 2 — The composites
- [x] **DYN-7** · `@syn/ui` for v1.1: `BlockHeader`, `BlockBand`, `GapBand`, `BudgetLine`, `DragLayer`, `ConfirmYesterdayRows`, the serif `Textarea` variant, `StepFrame` to twelve, `ScheduleBlock`/`ItemRow`/`SlotView` extensions, stories — L · (DYN-1) · **Vesper review of stories in both themes**

### Phase 3 — Setup (planning mode)
- [x] **DYN-8** · The block editor, step one, and Settings → Your day: kind-aware editor with the slot sheet's fallbacks, the library by block, the habit sheet's block chip — L · (DYN-4, DYN-7)
- [ ] **DYN-9** · The block editor, step two: drag to reorder, resize, seam-drag gaps, keyboard equivalents — M · (DYN-8) · does not gate
- [x] **DYN-10** · First run 1–6: the shape of the week, work days, work start and what gives, standing commitments, wake, before the day — L · (DYN-7, DYN-4)
- [x] **DYN-11** · First run 7–12: before work with *one of*, the landscape, training, closing the day, focuses, the fit; the first week pre-filled — L · (DYN-10, DYN-8, DYN-5)
- [x] **DYN-12** · The week build amended: per-block day sheet, shape toggle, the pre-filled week, the training swap confirm — M · (DYN-5, DYN-7)

### Phase 4 — The morning (waking state)
- [x] **DYN-13** · The orient frame and the wake moment: the entry route, `woke_at` stamping, last night's words, the two optional lines, the R18 line, the wake-anchor path retired — M · (DYN-5, DYN-7) · **Sage line flagged (v1.1 §13 #9)**
- [x] **DYN-14** · The quick-pick and *Set the day*: the unconfirmed Today tab, collapsed sections, the budget line, over budget, *Unstructured today*, the *Last night* section — L · (DYN-13, DYN-6)

### Phase 5 — The day (executing state)
- [x] **DYN-15** · Today by block: `BlockHeader` sections, the container work row, the day header with focus and anchor, the day header sheet's rows, the item sheet's *Do now* / *Edit today's* / *one of*, the habit-day sheet — L · (DYN-14)
- [ ] **DYN-16** · The Schedule, editable: bands, the drag layer wired, the pin confirm, band drag → Adjust, the explicit move mode, keyboard — L · (DYN-15, DYN-6) · does not gate · **Vesper review**
- [x] **DYN-17** · Adjust: the four-step sheet, its three entries and the late offer; the shift and trim sheets re-pointed — L · (DYN-15, DYN-6) · **Vigil: the doesn't-fit-even-cut path and the 10 s undo**

### Phase 6 — The evening and the review
- [x] **DYN-18** · The evening: the wind-down section's confirm-in-the-morning rows and the devices-off marker, the journal screen, the confirm-yesterday panel in the Day Review, Settings → Closing the day — L · (DYN-15, DYN-14)
- [x] **DYN-19** · Review amended: Day Review by block with *not confirmed* and *shortened*, the intention line; Week Review counts, *time by block*, reflections, the strip state; export additions — M · (DYN-18)
- [ ] **DYN-20** · Notifications revised: the catalogue, enqueue at *Set the day*, block-boundary jobs, per-block item toggles, devices-off — M · (DYN-14, DYN-18) · **Vigil: payload privacy, enqueue-at-pick**

### Phase 7 — Cleanup
- [ ] **DYN-21** · Migration `0006` and the retirements: drop the offset columns, `days.template_id`, `wake_anchor_habit_id`; remove the shift and trim sheets and services, day parts, the old starter set, the template routes; regenerate the references — M · (DYN-9, DYN-16, DYN-17, DYN-19, DYN-20) · **Mason migration review**

## Ordering constraints (alphabetical order hides these)

- **DYN-1 precedes everything** — the unions and `stackBlock` are what the migrations' backfill and every service compute with; a migration written before the arithmetic exists invents its own.
- **DYN-2 precedes DYN-3** — `day_blocks` references `templates.kind`; the day side cannot be typed until the plan side has a kind.
- **DYN-3 precedes DYN-4** — services write columns that must exist; a service against a schema that lacks `gap_before_min` reintroduces offsets.
- **DYN-4 precedes DYN-5** — the materialiser reads block templates, slots with gaps, fixtures, and habits with rotations; without DYN-4's services and validators there is nothing to materialise from.
- **DYN-5 precedes DYN-6** — Adjust and *Do now* reflow `day_blocks` and `day_items` rows that DYN-5 shapes; the confirm service is what writes `original_scheduled_start`, which the ghost DYN-6 leaves depends on.
- **DYN-7 precedes every screen ticket** — new reusable UI lands in `@syn/ui` with a story first (root `AGENTS.md` § UI). A screen ticket that finds a composite missing STOPS.
- **DYN-8 precedes DYN-11** — first run's block screens (7, 9, 10) are the block editor embedded; the fit screen reads its footer arithmetic.
- **DYN-10 precedes DYN-11** — one `StepFrame` sequence, widened to twelve in DYN-10; DYN-11 fills 7–12.
- **DYN-13 precedes DYN-14** — the quick-pick is what the orient frame's *Start the morning* lands on, and `woke_at` is the budget's start.
- **DYN-6 precedes DYN-14** — the quick-pick's *Shorten to fit* and the over-budget dialog call `fitToBudget`; the pick's *Set the day* calls `confirmDay` (DYN-5) and nothing in DYN-6, but *Shorten to fit* is DYN-6's `fitToBudget` exposed through `day.previewFit`.
- **DYN-14 precedes DYN-15** — the Today tab renders the confirmed day; its unconfirmed state is the quick-pick.
- **DYN-15 precedes DYN-16 and DYN-17** — the day header sheet's *Adjust the day* and *Edit today* rows are the doors; the item sheet's *Do now* is the sibling mechanic.
- **DYN-14 and DYN-18 precede DYN-20** — N1a enqueues at `confirmed_at`; the wind-down start push and *Phone away* need the evening's block and pin to exist.
- **DYN-9, DYN-16, DYN-17, DYN-19, DYN-20 precede DYN-21** — nothing is removed while a surface still imports it.

## Full dependency table

| Ticket | Complete-required dependencies |
|---|---|
| DYN-1 | — (SET-1, USE-1 Complete in their tracks; consumed) |
| DYN-2 | DYN-1 |
| DYN-3 | DYN-2 |
| DYN-4 | DYN-3 |
| DYN-5 | DYN-4 |
| DYN-6 | DYN-5 |
| DYN-7 | DYN-1 |
| DYN-8 | DYN-4, DYN-7 |
| DYN-9 | DYN-8 |
| DYN-10 | DYN-7, DYN-4 |
| DYN-11 | DYN-10, DYN-8, DYN-5 |
| DYN-12 | DYN-5, DYN-7 |
| DYN-13 | DYN-5, DYN-7 |
| DYN-14 | DYN-13, DYN-6 |
| DYN-15 | DYN-14 |
| DYN-16 | DYN-15, DYN-6 |
| DYN-17 | DYN-15, DYN-6 |
| DYN-18 | DYN-15, DYN-14 |
| DYN-19 | DYN-18 |
| DYN-20 | DYN-14, DYN-18 |
| DYN-21 | DYN-9, DYN-16, DYN-17, DYN-19, DYN-20 |

## Ticket-authoring batches (distinct from build phases)

| Batch | Tickets | Why grouped | Status |
|---|---|---|---|
| 1 | DYN-1, DYN-2, DYN-3 | The contract and the two migrations: one data model, written together so the backfill, the types, and the columns agree | **Authored 2026-09-12** |
| 2 | DYN-4, DYN-5, DYN-6 | The three service tickets over that model: the write path, the materialiser, the mutations | **Authored 2026-09-12** |
| 3 | DYN-7 | The composites alone — a Storybook ticket with Vesper's review list | Handoff written; expand next |
| 4 | DYN-8, DYN-9, DYN-12 | The block editor and the week build: one editing grammar | Handoff written |
| 5 | DYN-10, DYN-11 | First run, one sequence in two halves | Handoff written |
| 6 | DYN-13, DYN-14 | The morning: the two screens of the waking state | Handoff written |
| 7 | DYN-15, DYN-16, DYN-17 | The day: the tab, the axis, the one sheet that adjusts it | Handoff written |
| 8 | DYN-18, DYN-19 | The evening and the review that reads it | Expanded and built 2026-09-13 |
| 9 | DYN-20, DYN-21 | Notifications and the cleanup | Handoff written |

Batches 1 and 2 exceed the guide's §7.4 ceiling of three per thread by being written in one thread together, for the same reason Epics 1–3 did: one data model, and tickets written apart would disagree about it. Logged in `DEVIATIONS.md`.

## Coverage matrix — every section of v1.1 → the ticket that ships it

| v1.1 § | What | Ticket(s) |
|---|---|---|
| §1.4 vocabulary, §12 copy | The unions, the copy files, the vocabulary table | DYN-1 (unions) · every screen ticket (its `copy.ts`) · DYN-21 (retired words removed) |
| §2 guardrails | R17 plain anchor time, R18 the one line, §2.3 confirmed not detected | DYN-15 (header) · DYN-13 (the line) · every service ticket (no detection) |
| §3.1 block kinds, order | `BlockKind`, `block_order`, Settings → Block order | DYN-1 · DYN-3 · DYN-8 |
| §3.2 stacking, gaps, pins | `gap_before_min`, `pinned_at`, `stackBlock` | DYN-1 · DYN-2 · DYN-4 |
| §3.3 flow direction, the arithmetic, anchor direction | `stackBlock` forward/backward, `computeBudget`, `anchor_direction` | DYN-1 · DYN-3 · DYN-5 |
| §3.4 routines: opener · pool · closer, variants with counts | `structure`, `role`, `weekly_target` | DYN-2 · DYN-4 · DYN-8 · DYN-14 |
| §3.5 one of | `alternates_group`, the three-answer question | DYN-2 · DYN-4 · DYN-8 · DYN-14 · DYN-15 |
| §3.6 fixtures and one-offs | `fixtures` table, materialised as pins, the fixture sheet | DYN-3 · DYN-4 · DYN-5 · DYN-10 · DYN-12 |
| §3.7 training | `workout` type, rotation, placement, unplaced refusal, *inside work* split | DYN-2 · DYN-4 · DYN-5 · DYN-11 · DYN-14 · DYN-15 |
| §3.8 work: focus and template | focus as `deep_work` with counts, a second work template | DYN-2 · DYN-4 · DYN-11 · DYN-14 |
| §3.9 day shapes | `days.shape`, unstructured materialisation, *Working today?* | DYN-3 · DYN-5 · DYN-12 · DYN-14 |
| §3.10 the fit, overflow mode | `overflow_mode`, `fitToBudget` | DYN-3 · DYN-6 · DYN-11 · DYN-14 |
| §3.11 the block editor | The editor in two steps | DYN-8 · DYN-9 |
| §4.1–4.12 first run | Twelve screens | DYN-10 (1–6) · DYN-11 (7–12) |
| §4.13 the week build amended | Per-block day sheet, pre-filled week, training swap | DYN-12 |
| §4.14 Settings → Your day | The block list and block order | DYN-8 |
| §4.15 the library | By block, the habit sheet's block chip, W5–W7 | DYN-8 |
| §5.1–5.2 the orient frame | Entry, `woke_at`, read-back, the two lines, R18 | DYN-13 |
| §5.3–5.4 the quick-pick | Unconfirmed Today, sections, budget, over budget, unstructured, *Set the day* | DYN-14 |
| §6.1 Today tab | Block sections, container row, split work, header | DYN-15 |
| §6.2 day header sheet | The five rows | DYN-15 |
| §6.3 item sheet | *Do now*, *Edit today's*, *one of*, *Not today* as v1 | DYN-15 (UI) · DYN-6 (services) |
| §6.4 habit-day editing | `HabitDaySheet`, no clamp | DYN-15 (UI) · DYN-6 (service) |
| §6.5 Schedule editable | Bands, drag, pin confirm, band drag → Adjust, keyboard, move mode | DYN-16 (drag) · DYN-15 (bands read-only) · DYN-6 (moves) |
| §6.6 Adjust | The four steps, three entries, the late offer | DYN-17 (UI) · DYN-6 (service) |
| §7.1 the wind-down routine | Backward stack, devices-off pin, journal closer, confirm-in-the-morning rows | DYN-5 (stack) · DYN-15 (rows) · DYN-18 |
| §7.2 the journal | The screen, autosave, six prompts | DYN-18 (UI) · DYN-3 (table) · DYN-4 (service) |
| §7.3 confirm yesterday | The section in the pick, the panel in the review, *not confirmed* | DYN-14 (pick) · DYN-18 (review) · DYN-5 (state) |
| §8.1 Day Review | By block, not confirmed, shortened, intention | DYN-19 |
| §8.2 Week Review | Counts, time by block, reflections, strip state | DYN-19 |
| §9 notifications | The catalogue, enqueue at pick, block boundaries, per-block toggles | DYN-1 (kinds) · DYN-3 (prefs column) · DYN-20 |
| §10.1 item states | `not-confirmed`, `confirm-later`, pinned, container | DYN-1 (unions) · DYN-5 (derivation) · DYN-7 (visuals) |
| §10.2 component states | Every new composite's matrix | DYN-7 · the screen ticket that composes it |
| §10.3 tokens | No new colours; block bar steps | DYN-7 · DYN-19 |
| §10.4 accessibility | Keyboard for every drag, move mode, live regions | DYN-7 · DYN-9 · DYN-16 · DYN-14 |
| §11.2 users | Profile additions | DYN-3 |
| §11.3 habits | `block_kind`, `weekly_target`, `typical_days`, `workout` | DYN-2 |
| §11.4 templates | `kind`, `flow`, `structure`, `anchor_time` nullable | DYN-2 |
| §11.5 template_slots | `gap_before_min`, `pinned_at`, `role`, `alternates_*`, backfill, `save-slot` | DYN-2 · DYN-4 |
| §11.6 fixtures | The table | DYN-3 |
| §11.7 days, day_blocks | The columns, the table | DYN-3 |
| §11.8 day_items | The columns, the trigger's transition | DYN-3 |
| §11.9 shifts | `kind`, `shortened_item_ids` | DYN-3 · DYN-6 |
| §11.10 journal_entries | The table, the service | DYN-3 · DYN-4 |
| §11.11 materialisation | The two phases | DYN-5 |
| §11.12 cleanup | Migration `0006`, retirements | DYN-21 |
| §13 open items | Each default cited where it lands | the ticket named in §13's *Where* column |
| §14.3 what to do | v1's superseded note | done 2026-09-12 (this authoring pass) |

## Locked references (do not re-litigate)

- **Decisions:** v1.1 §0.3 R1–R27; v1 §0.3 R1, R3, R6, R7; this track's `TECHNICAL-DECISIONS.md` (TD-1…TD-9). Cite by ID; re-opening requires new evidence routed to Taylor.
- **Binding law:** `README.md` § Non-negotiables; `apps/web/AGENTS.md` § Product non-negotiables; `../README.md` § Placement rules; `codebase-conventions.md`; `drizzle-orm-conventions.md` for every schema line.
- **Launch-blocking set:** see `README.md` § Locked scope.
- **What does not gate:** DYN-9, DYN-16. Nothing in Epics 1–3 waits on this epic; this epic waits on all of them being Complete, which they are.
