# Epic 5 — The first run rebuilt (UX v1.2): how to work this folder

**Read [`../README.md`](../README.md) first** — the global build order, the placement rules, and the cross-track dependencies. This file adds only what is local to Epic 5.

**Governs:** everything UX spec v1.2 changes — the fourteen-screen first run ending in the day builder and the week, work-day types, steps and versions, travel around a workout, passages and the quote bank, day plans, the two morning modes, the journal reminder, emoji on the person's nouns, and the two new guardrails (optimistic by rule; save as you go). **Source document:** [`docs/ux/ux-spec-v1.2.md`](../../ux/ux-spec-v1.2.md) (draft for Taylor's read, 2026-09-16), under v1.1 for everything it does not rewrite, under v1 for what v1.1 does not. **Its notes:** [`2026-09-16-first-run-walkthrough-feedback-v1.1.md`](../../product/2026-09-16-first-run-walkthrough-feedback-v1.1.md) (`S#.#`, `A#`) and the [engineering handoff](../../product/2026-09-16-ux-v1.2-engineering-handoff.md). **Register:** v1.1 §1.3's five states; this epic lives mostly in *planning* (the builder earns depth) and touches *waking* once (the orient frame).

**Authors:** Reeve (tickets, sequencing, logs) · Mason (architecture, placement, the data contract — TD-10…TD-20) · Vesper's rulings are v1.2 §0.3 R28–R43, cited by ID. **Date:** 2026-09-16. **Executor:** an Opus thread per ticket.

---

## Folder layout

| Path | What |
|---|---|
| `README.md` | This file |
| `00-build-order.md` | The ordered, checkable queue, the critical path, and the **v1.2 coverage matrix** |
| `RUN-1…RUN-15-*.md` | The fifteen tickets, all full |
| `PROGRESS.md` · `DEVIATIONS.md` · `TECHNICAL-DECISIONS.md` | The three records. `TECHNICAL-DECISIONS.md` opens with Mason's architecture pass (TD-10…TD-20), made 2026-09-16 |
| `_templates/slice-spec.md` | The blank ticket (identical to Epic 4's) |

---

## What this epic is, in one paragraph

Epic 4 built v1.1 and Taylor walked its first run on a phone. The screens were right about the facts and wrong about the feel: controls that waited on the network, rows with no room for their contents, a fit screen that ended twelve screens of hospitality with a sentence about scarcity. v1.2 keeps the block model whole and rebuilds the first run around it: the parts are collected on screens 1–12 with emoji on every noun the person owns, then **screen 13 composes a named day from them** — a work-day type, four times, the workouts placed, *Getting ready A*, *Morning routine A*, breaks, the fixtures, *Wind-down A* — and **screen 14 shows the week those days make** and asks whether mornings should be set from the plan or built each day. Around that: passages become a collection with a quote bank; the orient frame reads a carousel and asks a third line; the journal gains a reminder; a habit may have a quick and a full version; a workout knows where it happens and how long the travel is. Every fact writes when it is entered. The build order is the handoff's §5: the contract and one migration, the services, the composites, then the screens in the order a person meets them, then the week and the morning, then the provisional admin surface, then the cleanup.

---

## What Mason decided in the architecture pass (the shape every ticket builds inside)

Logged in full in `TECHNICAL-DECISIONS.md` (TD-10…TD-20); the short form:

- **`day_plans` is a table of references** (TD-10) — three template FKs, a work template FK, weekdays, four nullable times, two small jsonbs, exclusions. A plan copies nothing; the three named lists are ordinary templates and a second plan may point at the first's.
- **Versions are a jsonb on `habits`**, the choice a `version_key` on the item (TD-11). No alternates rows; a version is a duration with a label.
- **Travel rows are `day_items` with `origin = travel` and `parent_item_id`** (TD-12); the workout's length never includes them; `stackBlock` is unchanged.
- **`quotes` is a catalogue under `catalogReadPolicies`** (TD-13); the admin write surface is RUN-14, `[PROVISIONAL — Taylor, D3]`; until it ships the bank changes by migration.
- **Work-day types are `templates` of kind `work`** with `work_end_time`, `location_kind`, `anchor_direction`, `icon` (TD-14); the profile's three anchor columns stay the defaults.
- **Passages store Markdown; images live in a `passages` bucket** (TD-15) with the icon path grammar.
- **`@dnd-kit/*` and `@tiptap/*` are `@syn/ui`'s alone** (TD-16), listed in `RESTRICTED_EXTERNAL` beside `frimousse`.
- **`Set from the plan` calls `confirmDay` with the pick's defaults** from `saveMorning` (TD-17); no second confirm path; the tap confirms, nothing detects.
- **The stepper composites own the optimistic value and the 400ms debounce** through a `useOptimisticValue` hook in `@syn/hooks` (TD-18).
- **`applyWorkType` and `days.work_template_id`** are how *Rarely* becomes *Working today* (TD-19).
- **The emoji rule is an ESLint override on `copy.ts`** (TD-20); seeds carry `icon: IconValue`, never a glyph in a title.
- **One migration, `0007`, additive** (RUN-2); the drops are `0008` (RUN-15), last. Each is authored, journalled, verified locally, and **stops before any hosted tier** (root `AGENTS.md`). `0004`–`0006` are not yet applied to any tier either; `0007` follows them.

---

## What Vesper decided (cite, do not restate)

v1.2 §0.3 R28–R43 are the rulings; the `[DEFAULT]`, `[ASSUMPTION]` and `[OPEN]` items are §13 #16–#30. Tickets cite `v1.2 R#` and `v1.2 §13 #n`. Four that shape every screen ticket:

- **Every screen opens with its v1.2 walk-through** (who, the one job, what you see, what you do, what it must never do, desktop). The ticket quotes the mechanics and cites the section; it does not paraphrase the layout.
- **The frame rules (v1.2 §4, R43) bind every setup screen:** the action row is sticky; value + Change has Done; revealed fields have Remove; empty states are left-aligned and in the flow; lists append; a sheet is scoped to its block; selection is a `SelectRow`; cards collapse on Done; every fact writes when entered.
- **Copy is v1.2's, verbatim, in a `copy.ts`, and every string is adjustable.** A string v1.2 does not contain is `[COPY — needs Vesper sign-off]`. No emoji in any `copy.ts` (R29, enforced by lint).
- **Mobile first.** The compact layout is the one the acceptance criteria are written against; wide derives per each walk-through's last line.

---

## Source precedence

1. **Product behaviour** → v1.2 (its §0.3 rulings, then its screens) → v1.1 for what v1.2 does not rewrite → v1 for what v1.1 does not → the cross-cutting document → the v2 handoff for component contracts.
2. **Architecture & placement** → [`../README.md`](../README.md) § Placement rules → `codebase-conventions.md` → the domain guides → this track's `TECHNICAL-DECISIONS.md` (TD-10…TD-20), then Epic 4's (TD-1…TD-9).
3. **App rules** → [`apps/web/AGENTS.md`](../../../apps/web/AGENTS.md) — its § Product non-negotiables bind every line here.
4. **This track's rulings**, labelled and logged.
5. **On-disk reality + `DEVIATIONS.md` + `TECHNICAL-DECISIONS.md`** (this track's, then Epic 4's, then Epics 1–3's, then the infrastructure track's).

---

## The kickoff contract (one ticket per thread)

```
You are building ONE ticket from docs/specs/epic-5-first-run-rebuilt/: <TICKET-ID>.

OBJECTIVE
Ship the ticket's Acceptance criteria — nothing more (scope creep), nothing less.

BEFORE WRITING CODE
1. State the ticket ID and title in your first message.
2. Confirm every entry in the ticket's "Depends on" shows Complete in the owning
   track's PROGRESS.md (this track's, or epic-4-dynamic-schedule/ as named). If
   any is not Complete, STOP and say so.
3. Read the ticket spec end to end, then its attach-list in order. The attach-list
   always includes the v1.2 sections the ticket cites — read them, not a summary.
4. Read this track's DEVIATIONS.md and TECHNICAL-DECISIONS.md, then Epic 4's, then
   Epics 1–3's and the infrastructure track's — on-disk reality + those logs
   override any stale string in a spec or a UX document.
5. State the exact file paths you will create, change, or remove before
   implementing.

CONSTRAINTS
- Honor every non-negotiable verbatim. If the spec would force you to break one,
  STOP and ask — never silently contradict it.
- The product non-negotiables in apps/web/AGENTS.md bind every pixel: no numbers
  about the day on the tabs, nothing red, no second person in product copy, faded
  is never disabled, the record is annotated never rewritten, notifications never
  report a miss.
- Optimistic by rule (v1.2 §2 guardrail 4, TD-18): no control waits for a response
  to change its own state; writes debounce; a failure reverts with one line.
- Save as you go (v1.2 §2 guardrail 5): every fact writes when it is entered;
  Continue and Done navigate. A screen left half-filled loses nothing.
- Emoji live on the person's nouns only (v1.2 R29, TD-20): never in a copy.ts,
  a heading, a button, a caption, a status line, or a notification's chrome.
- The morning is confirmed, never detected (v1.1 §2.3, TD-17). Set from the plan
  is the tap on Start the morning, nothing earlier.
- stackBlock in @syn/utils is the only implementation of the block arithmetic;
  travel rows are two more items in a stack (TD-12), never a change to it.
- A migration is authored, journalled, and verified on the local tier only. Stop
  before db:migrate on any hosted tier. Never edit an applied migration; 0004–0007
  are applied by Taylor in order.
- Every string a person reads comes from v1.2 (or v1.1 / v1 where it defers),
  verbatim, in a copy.ts. Flag anything else [COPY — needs Vesper sign-off].
- Filenames kebab-case; named exports only; Server Components default; client
  leaves in _components/ or components/<feature>/ with "use client" line 1;
  routes from lib/routes.ts (add the builder and the AGENTS.md row when you add a
  route); every user-scoped query through ctx.rls.execute(); quotes and the
  admin path are the enumerated exceptions (TD-13).
- Audit @syn/ui before building a component. New reusable UI goes to @syn/ui
  with a story first (RUN-7 is where the new composites land; a later ticket
  that needs one RUN-7 did not ship STOPS and says so). @dnd-kit and @tiptap are
  @syn/ui's alone (TD-16).
- No tests. No AI. No scaffolding of apps/mobile.
- If you modify files owned by an upstream Complete ticket (any track), re-check
  that ticket's affected acceptance criteria before finishing.

DEFINITION OF DONE
1. yarn lint · yarn lint:boundaries · yarn check-types · yarn build pass (four
   separate commands); yarn workspace @syn/ui run build-storybook --quiet when
   @syn/ui changed. A schema ticket also runs yarn db:generate (or authors the
   SQL by hand with a journal entry) and yarn db:schema-reference.
2. Happy path exercised on the local tier against seeded data; every acceptance
   criterion checked and stated, including the induced ones. Where sign-in blocks
   an unattended browser walk, say so — never claim a walk that did not happen.
3. The ticket's Status line set to: Status: Complete (YYYY-MM-DD).
4. PROGRESS.md row + checklist ticked.
5. One DEVIATIONS.md line per divergence. Architectural choices with real
   alternatives → TECHNICAL-DECISIONS.md.
6. yarn directory-map if files were added/moved/removed; yarn docs:check-links if
   a doc moved.
7. Close with 3–5 lines: what shipped, deviations, the one thing the next ticket
   must know.

Do not start the next ticket.
```

---

## Completion protocol

Three places, every time: the ticket's `Status:` line, `PROGRESS.md`, `DEVIATIONS.md` (+ `TECHNICAL-DECISIONS.md` when a choice had alternatives). Then tick `00-build-order.md`. "The agent said done" is not done.

---

## Locked scope (do not re-litigate)

- **v1.2 §0.3 R28–R43 are Vesper's rulings on Taylor's notes** (draft 2026-09-16; Taylor's read may flip one — then the ticket that cites it is amended by a `DEVIATIONS.md` line, never by silent rework). v1.1 R1–R27 stand where v1.2 does not amend them (R6 → R37, R15's "no push" → R38).
- **v1.2 §13's defaults are in force** until Taylor flips one: #16 last night's lines collapsed behind a row; #18 *Before work* training sits before the routine; #19 the first plan preselects every *Always* and *Sometimes* weekday; #20 getting ready starts all-on in screen 7's order and the routine preselects by rank down to the room; #21 the passage cycle is by list order at day-open; #25 phone away = lights out − 60, the reminder = phone away − 60; #26 *Same shape?* preselects *Yes*; #27 *Set from the plan* sets on the tap.
- **The decision queue** (handoff §6, D1–D8) is Taylor's. Only **D3** (the admin surface) gates a ticket — RUN-14 — and its no-answer default is "the seeded catalogue ships; RUN-14 waits". Nothing else in this epic waits on a decision.
- **Epic 4's TD-1…TD-9 are consumed, never reopened.** `stackBlock`, `day_blocks`, the trigger's transition, the one Adjust service — every ticket here builds on them.
- **Phase 2 stays the collection** except P2-14 (the quote bank), pulled forward by v1.2 R36. "Chosen against the day" (ledger §25) stays phase 2; tags are its seam and nothing reads them but the passage list's filter.
- **Offline writes remain Phase 2.** Optimistic-by-rule is about latency, not sync: a failed write reverts and says so; nothing queues.
- **Launch-blocking for this epic:** RUN-1 through RUN-13, RUN-15. **Does not gate:** RUN-14 (the admin surface; the bank is seeded without it).

---

## Non-negotiables (every ticket honours these)

- **Optimistic by rule.** A control's own state changes on the tap; the write debounces; a failure reverts with one line; nothing disables in flight except a primary that would double-submit; a second tap on a tick is an un-tick, never a duplicate (TD-18).
- **Save as you go.** Every fact writes when entered; *Continue* and *Done* navigate; no bulk commit at the end of a screen.
- **Emoji on the person's nouns only** (R29). A glyph is `IconValue` data on a habit, a step, a workout, a focus, a fixture, a passage, a day plan, the two evening times, or the four archetype cards — never a character in a `copy.ts`.
- **The morning is confirmed, never detected.** *Set from the plan* is the tap; a *Sometimes* day is asked, never inferred; no service infers anything from the absence of taps (v1.1 §2.3, TD-17).
- **The room is stated as room.** *72 min for the routine · 45 chosen*; over is muted arithmetic. Never *doesn't fit*, *too much*, *over budget* (v1.2 §12.3).
- **One block arithmetic.** `stackBlock` is unchanged by this epic; travel rows are items in a stack; the builder's screens, the room line and the review all call it.
- **The record is annotated, never rewritten.** `original_scheduled_start` rules stand (TD-5); a version change is a habit-day edit; a travel row dropped is *not assigned today*.
- **Nothing pre-selected on a chooser** (v1.1 §4.8's hospitality rule). The only preselections are in the builder, from the person's own list, and §13 names each.
- **The app never speaks the message.** A quote is attributed, in the reading face, under a neutral caption; nothing in the frame is keyed to anything about the person; the cycle records nothing (R36).
- **Every read and write through `ctx.rls.execute()`**, `user_id` from the session, never the input — with two enumerated exceptions: `quotes` reads go through the catalogue policy, and RUN-14's writes use the service role because `quotes` is not user data (TD-13).

---

## Canonical paths & known-stale warnings

- **`apps/web/app/(setup)/_components/`** holds twelve step files and one `copy.ts` for twelve. RUN-8 renumbers to fourteen (`step-9-ranked`, `step-13-days`, `step-14-week` new; `step-9-training` → `step-10-training`, `step-10-closing` → `step-11-closing`, `step-11-focuses` → `step-12-focuses`; `step-12-fit` deleted in RUN-13). Until RUN-8, `SETUP_TOTAL_STEPS = 12` and `setupRoute` accepts 1–12.
- **`rotation-rows.tsx`** is DYN-11's workout row; RUN-11 replaces it with `workout-setup-card.tsx` and deletes it.
- **`packages/ui/src/composed/control/range-input/`** is LB-02's from/to pair; RUN-7 adds `range-editor/` (compact) and RUN-15 removes `range-input` once nothing imports it.
- **`packages/ui/src/composed/control/drag-layer/`** is the Schedule's axis drag (DYN-7/9/16). It is not a sortable list; RUN-7's `sortable-list/` is, and the two never share code (TD-16).
- **There is no `Card` primitive** in `packages/ui/src/primitives/layout/`. RUN-7 adds `card/` from the shadcn set, re-slotted like the rest.
- **`users.earliest_wake_time`, `orient_passage`, `orient_show_last_night`** stop being written in RUN-8/RUN-9 and are dropped in `0008` (RUN-15). `orient_passage` is copied into one `passages` row by `0007`'s backfill (RUN-2).
- **`services/day/quick-pick.ts`** builds the pick's sections and defaults; TD-17 reuses its default resolution from `saveMorning`. Do not fork it into a second resolver.
- **`services/jobs/notify.ts`** is DYN-20's one scan; RUN-6 adds the `journal_reminder` kind to that scan, not a second job.
- **`packages/db/migrations/meta/_journal.json`** is at `0006`. This epic's migrations are `0007` (RUN-2) and `0008` (RUN-15). None of `0004`–`0008` is applied to a hosted tier by an agent.
- **`packages/constants/src/starter-library.ts`** carries no `icon`; RUN-1 adds one per entry. Four new seed files land beside it (`workout-types.ts`, `fixture-kinds.ts`, `work-day-kinds.ts`, `schedule-shapes.ts`).
- **`apps/web/lib/routes.ts`**: `setupRoute(step)` 1–12 → 1–14 (RUN-8); `settingsYourDayScreenRoute(screen)` gains `work-day-types · ranked · your-days · each-morning · passages` (RUN-8, RUN-9, RUN-10, RUN-12, RUN-13); `adminQuotesRoute()` only if RUN-14 ships. **Every added route also gets its row in `apps/web/AGENTS.md`.**
