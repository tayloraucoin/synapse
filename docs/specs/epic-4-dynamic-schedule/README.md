# Epic 4 — Dynamic schedule (UX v1.1): how to work this folder

**Read [`../README.md`](../README.md) first** — the global build order, the placement rules, and the cross-track dependencies. This file adds only what is local to Epic 4.

**Governs:** everything UX spec v1.1 changes — the block model (blocks, stacking, gaps, pins, alternates, routines with pools, fixtures, workouts, focuses, day shapes), the block editor, the twelve-screen first run, the orient frame, the quick-pick and *Set the day*, the Today tab by block, the editable Schedule, *Do now*, the Adjust sheet, habit-day editing, the evening (wind-down, journal, confirm-yesterday), the amended Review, and the revised notification catalogue. **Source document:** [`docs/ux/habit_tracker_official_ux_spec_v1_1.md`](../../ux/habit_tracker_official_ux_spec_v1_1.md) (accepted by Taylor 2026-09-12), under v1 for everything it does not rewrite. **Register:** the five states of v1.1 §1.3 — planning, waking, executing, winding down, reviewing — each with its own budget.

**Authors:** Reeve (tickets, sequencing, logs) · Mason (architecture, placement, the data contract) · Vesper's rulings are v1.1 §0.3 R1–R27, cited by ID. **Date:** 2026-09-12. **Executor:** an Opus thread per ticket.

---

## Folder layout

| Path | What |
|---|---|
| `README.md` | This file |
| `00-build-order.md` | The ordered, checkable queue, the critical path, and the **v1.1 coverage matrix** (every § of the spec → the ticket that ships it) |
| `01-authoring-handoff-remaining-tickets.md` | Dense per-ticket content for DYN-7…DYN-21, to be expanded into full tickets in later authoring threads (guide §7.4) |
| `DYN-1…DYN-6-*.md` | Full tickets — the foundation and the services. Mason's first two authoring batches |
| `PROGRESS.md` · `DEVIATIONS.md` · `TECHNICAL-DECISIONS.md` | The three records. `TECHNICAL-DECISIONS.md` opens with Mason's architecture-pass decisions, made 2026-09-12 |
| `_templates/slice-spec.md` | The blank ticket (identical to Epic 2's) |

---

## What this epic is, in one paragraph

Epics 1–3 built v1.0: one whole-day template per day, slots at absolute offsets, a wake-anchor habit, day parts, a shift sheet and a trim sheet. v1.1 keeps every honesty rule of v1.0 and changes the plan's shape: a day is an ordered set of **blocks** (orient · morning · training · prep · work · break · activity · wind-down), each from a **block template** whose slots **stack** with explicit gaps and flow forward from wake or backward to an anchor. Pooled parts of a day are resolved each morning by the **quick-pick**, and *Set the day* is the moment the record begins. The morning opens on the **orient frame**; the evening ends in a **wind-down routine** with a **journal** the morning reads back. Everything a person touches during the day is annotated, never rewritten, exactly as before. The build order is §11.12 of v1.1: the pure function and the migrations first, then services, then screens in the order a person meets them.

---

## What Mason decided in the architecture pass (the shape every ticket builds inside)

Logged in full in `TECHNICAL-DECISIONS.md`; the short form:

- **`templates` becomes the block template table** — it gains `kind`, `flow`, `structure`; it is not replaced. A "whole-day template" no longer exists; a day's template list is `day_blocks`.
- **`day_blocks` is the one new load-bearing table.** `day_items.day_block_id` points at it. The Today tab's sections, the Schedule's bands, the block-boundary notifications, and the Adjust sheet all read it.
- **Slots store `gap_before_min` and `pinned_at`; offsets are derived.** `offset_start_min` / `offset_end_min` are backfilled into gaps by migration and dropped in the cleanup migration, not before.
- **Workouts and focuses are habits.** `item_type` gains `workout`; a focus is a `deep_work` habit; both carry `weekly_target` and `typical_days` on `habits`. No `workouts` table, no `focuses` table.
- **Fixtures are their own table**, materialised as pinned `day_items` with `origin = fixture` on every planned instance of their weekday.
- **One pure function, `stackBlock`, in `@syn/utils/day/stack.ts`**, walks a block in its flow direction and returns starts, slack, and overrun. The block editor's footer, the quick-pick's budget line, the fit screen, Adjust's proposal, and the materialiser all call it. A second implementation anywhere is a defect.
- **`original_scheduled_start` is written at *Set the day*** for items on a pooled or unconfirmed day, at week build for fixtures and pins on structured days. The immutability trigger allows the one null → value transition and refuses every later write.
- **Adjust is one service, `adjust-day`,** with `shifts.kind ∈ {shift, refit}`; `apply-shift`, `apply-trim`, `computeShiftFit` and `computeTrim` are retired in DYN-21 after DYN-6 replaces their callers.
- **Three migrations**: `0004` (plan side: templates, slots, habits), `0005` (day side: users, fixtures, day_blocks, days, day_items, shifts, journal_entries, notification_prefs, the trigger), `0006` (cleanup, last). Each is authored, journalled, verified locally, and **stops before any hosted tier** (root `AGENTS.md`).

---

## What Vesper decided (cite, do not restate)

v1.1 §0.3 R1–R27 are the rulings; the `[DEFAULT]`, `[ASSUMPTION]` and `[OPEN]` items are §13's table. Tickets cite `v1.1 R#` and `v1.1 §13 #n`. Three that shape every screen ticket:

- **Every screen opens with its v1.1 walk-through** (who, the one job, what you see, what you do, what it must never do, desktop). The ticket's *Experience & states* section quotes the walk-through's mechanics and cites the section; it does not paraphrase the layout.
- **Copy is v1.1's, verbatim, in a `copy.ts`, and every string is adjustable.** A string v1.1 does not contain is `[COPY — needs Vesper sign-off]`.
- **Mobile first.** The compact layout is the one the acceptance criteria are written against; wide derives per each walk-through's last line.

---

## Source precedence

1. **Product behaviour** → v1.1 (its §0.3 rulings, then its screens) → v1 for what v1.1 does not rewrite (auth, timers, multitask, the resolver, the number, export, brand, a11y) → the cross-cutting document → the v2 handoff for component contracts.
2. **Architecture & placement** → [`../README.md`](../README.md) § Placement rules → `codebase-conventions.md` → the domain guides → this track's `TECHNICAL-DECISIONS.md`.
3. **App rules** → [`apps/web/AGENTS.md`](../../../apps/web/AGENTS.md) — its § Product non-negotiables bind every line here.
4. **This track's rulings**, labelled and logged.
5. **On-disk reality + `DEVIATIONS.md` + `TECHNICAL-DECISIONS.md`** (this track's, then Epics 1–3's, then the infrastructure track's).

---

## The kickoff contract (one ticket per thread)

```
You are building ONE ticket from docs/specs/epic-4-dynamic-schedule/: <TICKET-ID>.

OBJECTIVE
Ship the ticket's Acceptance criteria — nothing more (scope creep), nothing less.

BEFORE WRITING CODE
1. State the ticket ID and title in your first message.
2. Confirm every entry in the ticket's "Depends on" shows Complete in the owning
   track's PROGRESS.md (this track's, or epic-1-setup/, epic-2-in-use/,
   epic-3-review/, cross-cutting-system/ as named). If any is not Complete,
   STOP and say so.
3. Read the ticket spec end to end, then its attach-list in order. The attach-list
   always includes the v1.1 sections the ticket cites — read them, not a summary.
4. Read this track's DEVIATIONS.md and TECHNICAL-DECISIONS.md, then Epic 1's,
   Epic 2's, Epic 3's, and the infrastructure track's — on-disk reality + those
   logs override any stale string in a spec or a UX document.
5. State the exact file paths you will create, change, or remove before
   implementing.

CONSTRAINTS
- Honor every non-negotiable verbatim. If the spec would force you to break one,
  STOP and ask — never silently contradict it.
- The product non-negotiables in apps/web/AGENTS.md bind every pixel: no numbers
  about the day on the tabs (a plain anchor time is a time, v1.1 R17), nothing
  red, no second person in product copy, faded is never disabled, the record is
  annotated never rewritten, notifications never report a miss.
- The morning is confirmed, never detected (v1.1 §2.3). No service infers that a
  person is behind from the absence of taps.
- stackBlock in @syn/utils is the only implementation of the block arithmetic.
  Item state is derived by deriveItemState and nowhere else. Times come from the
  day's snapshotted zone through wallClockToInstant.
- A migration is authored, journalled, and verified on the local tier only. Stop
  before db:migrate on any hosted tier. Never edit an applied migration.
- Every string a person reads comes from v1.1 (or v1 where v1.1 defers to it),
  verbatim, in a copy.ts. Flag anything else [COPY — needs Vesper sign-off].
- Filenames kebab-case; named exports only; Server Components default; client
  leaves in _components/ or components/<feature>/ with "use client" line 1;
  routes from lib/routes.ts (add the builder and the AGENTS.md row when you add a
  route); every user-scoped query through ctx.rls.execute().
- Audit @syn/ui before building a component. New reusable UI goes to @syn/ui
  with a story first (DYN-7 is where the new composites land; a later ticket
  that needs one DYN-7 did not ship STOPS and says so).
- No tests. No AI. No scaffolding of apps/mobile.
- If you modify files owned by an upstream Complete ticket (any track), re-check
  that ticket's affected acceptance criteria before finishing.

DEFINITION OF DONE
1. yarn lint · yarn lint:boundaries · yarn check-types · yarn build pass (four
   separate commands). A schema ticket also runs yarn db:generate (or authors the
   SQL by hand with a journal entry) and yarn db:schema-reference.
2. Happy path exercised on the local tier against seeded data; every acceptance
   criterion checked and stated, including the induced ones.
3. The ticket's Status line set to: Status: Complete (YYYY-MM-DD).
4. PROGRESS.md row + checklist ticked.
5. One DEVIATIONS.md line per divergence. Architectural choices with real
   alternatives → TECHNICAL-DECISIONS.md.
6. yarn directory-map if files were added/moved/removed.
7. Close with 3–5 lines: what shipped, deviations, the one thing the next ticket
   must know.

Do not start the next ticket.
```

---

## Completion protocol

Three places, every time: the ticket's `Status:` line, `PROGRESS.md`, `DEVIATIONS.md` (+ `TECHNICAL-DECISIONS.md` when a choice had alternatives). Then tick `00-build-order.md`. "The agent said done" is not done.

---

## Locked scope (do not re-litigate)

- **v1.1 §0.3 R1–R27 are Taylor's rulings** (accepted 2026-09-12). Re-opening one requires new evidence routed to Taylor, not a preference inside a ticket.
- **v1.1 §13's defaults are in force** until Taylor flips one: `[DEFAULT — L6]` only Adjust carries a reason; `[DEFAULT — L6]` `original_scheduled_start` at Set the day; `[DEFAULT — R16]` unconfirmed wind-down items are *not confirmed*, excluded, visible; `[DEFAULT]` the block editor ships in two steps; `[ASSUMPTION]` work end is asked; the wake range is informational; work-day defaults are Mon–Fri always, Sat sometimes, Sun never.
- **v1's signed rulings stand where v1.1 does not rewrite them:** R1 (trims are *not assigned*, never missed; cuts inherit the reason and tier), R3 (honest math, neutral copy), R6 (simple, inspectable review math), R7 (7 is highest). **R5 (the wake-anchor habit) is superseded by v1.1 R11.**
- **Phase 2 is the collection** ([`docs/product/phase-2-collection.md`](../../product/phase-2-collection.md)): sets and reps, task selection, the mid-week check-in, monthly reflection, the journal timer, day parts, every integration, the quote bank, the other archetypes. Seams are recorded in the model (`data_sources` is a note, not a table); nothing is scaffolded.
- **Offline writes remain Phase 2.** Every ticket here keeps the standard offline line and disables writes; the quick-pick and the orient frame's fields save locally only as far as v1.1 states and never invent a sync.
- **The three greyed archetype cards are copy and a disabled state**, nothing more (P2-16).
- **Launch-blocking for this epic:** DYN-1 through DYN-6, DYN-8, DYN-10, DYN-11, DYN-13, DYN-14, DYN-15, DYN-17, DYN-18, DYN-20, DYN-21. **Does not gate:** DYN-9 (block editor drag), DYN-16 (Schedule drag) — the tap and keyboard fallbacks in DYN-8 and DYN-15 keep every job reachable. DYN-12 and DYN-19 gate only because the week build and the review would otherwise show the old model's vocabulary.

---

## Non-negotiables (every ticket honours these)

- **The morning is confirmed, never detected.** No service, job, or component infers lateness, absence, or being behind. Every adjustment is an action the person takes (v1.1 §2.3, R12).
- **One block arithmetic.** `stackBlock` and its companions in `@syn/utils/day/` are the only place a block's times, slack, overrun, or fit are computed. Five callers, one function.
- **The record is annotated, never rewritten.** `original_scheduled_start` is immutable once set; a drag, a *Do now*, an Adjust, and a habit-day edit each leave what they leave (a ghost, a band, a *shortened* line) and never touch the original.
- **Assignment is the promise.** Left out by the pick or Adjust → *not assigned today*, never scored. Cut by Adjust → inherits the reason and tier. *Not today* keeps v1's behaviour (v1.1 §6.3). Unconfirmed wind-down items are *not confirmed* — excluded and visible, never hidden (R16).
- **Pins and fixtures never move by a slip of the thumb.** A drag on one is a confirm dialog; the stack flows around them; Adjust never shortens or moves them.
- **Range is a default, never a clamp** (R21). No `MinutesStepper`, validator, or service bounds a habit-day's duration to the habit's range; the only bound is `DURATION_MIN … DURATION_MAX`.
- **The person's words are the only second person.** The orient frame's content and the journal are the person's own; the app's chrome on both stays in the neutral register. The one behaviour line (R18) obeys its four rules and its switch.
- **Nothing derived from the pick exists before the pick.** Pooled items, derived starts, and N1a/N1b pushes are created at `days.confirmed_at`, never at week build.
- **Every read and write through `ctx.rls.execute()`**, `user_id` from the session, never the input.

---

## Canonical paths & known-stale warnings

- **`packages/api/src/services/plan/save-slot.ts`** enforces the same-*start* rule today (`SameStartError`). DYN-4 replaces it with the same-*position* rule and a `SamePositionError` carrying both answers (multitask · one of). `findCollisions` follows.
- **`packages/api/src/services/day/materialize-day.ts`** is one function with four callers and a `days.template_id` write. DYN-5 rewrites it per `day_blocks`; `days.template_id` stops being written in DYN-5 and is dropped in DYN-21. Until DYN-21, `get-day.ts` tolerates both shapes.
- **`packages/api/src/services/day/{apply-shift,apply-trim,shift-fit,undo-shift}.ts`** and **`packages/utils/src/day/{shift-fit,trim}.ts`** are the v1.0 mechanics. DYN-6 ships `adjust-day` beside them; DYN-17 re-points the UI; DYN-21 removes them. Nothing new may import them.
- **`packages/utils/src/day/day-parts.ts`** and **`DayPartHeader`** are v1.0's day parts. DYN-15 stops rendering them; DYN-21 removes them (R20).
- **`users.wake_anchor_habit_id`**, `HabitSummaryView.isWakeAnchor`, `DayView.wakeAnchorItemId`, and the `wake-anchor-switch` in the habit sheet are v1.0's R5. DYN-13 stops writing and reading them; DYN-21 removes them (R11).
- **`STARTER_HABITS`** (`@syn/constants`) is the flat v1.0 starter set. DYN-1 adds `STARTER_LIBRARY` keyed by block kind; DYN-11 switches the consumers; DYN-21 removes the old export.
- **`apps/web/lib/routes.ts`** has `setupRoute(step)` for 1–5 and `resolveEntry` clamps to 5. DYN-10 widens both to 1–12 and adds `orientRoute()`; DYN-18 adds `journalRoute(date)`; DYN-8 adds `settingsYourDayRoute()`, `settingsBlockRoute(kind)`, `settingsFixturesRoute()`. `settingsTemplatesRoute()` / `settingsTemplateRoute(id)` redirect to *Your day* from DYN-8 and are removed in DYN-21. **Every added route also gets its row in `apps/web/AGENTS.md`.**
- **`NOTIFICATION_CATALOGUE`** and `NotificationKind` are v1.0's nine rows. DYN-1 adds `block_start`, `fixture_start`, `devices_off`; DYN-20 wires them. `item_start` becomes per-block (`notification_prefs.block_kind`, DYN-3).
- **The immutability trigger** `day_items_original_start_immutable` lives in `packages/db/supabase/setup/02_apply_triggers_rls.sql`. DYN-3 amends it (null → value once); the amended function ships as SQL in migration `0005`, and the setup file is updated to match so a fresh local database agrees with a migrated one.
- **`packages/db/migrations/meta/_journal.json`** is at `0003`. This epic's migrations are `0004`, `0005`, `0006`. A hand-authored migration without a journal entry applies nothing.
