# Epic 6 — The first run built day-first (UX v1.3): how to work this folder

**Read [`../README.md`](../README.md) first** — the global build order, the placement rules, and the cross-track dependencies. This file adds only what is local to Epic 6.

**Governs:** everything UX spec v1.3 changes — the five-screen first run with the day builder as its middle; the blocks primer and block hues; a plan that owns its work; per-day times; the after-work transition; several workouts on a day; fixed events with a place and travel; the free-time library and the evening pool; links on the orient frame; the quote after the journal; *Usually* as a work-day value; the selection grammar, the two-line cards, the info disclosure, the matters cell, steppers by one, designed loading; and the fix batch for the v1.2 build's defects. **Source document:** [`docs/ux/ux-spec-v1.3.md`](../../ux/ux-spec-v1.3.md) (draft for Taylor's read, 2026-09-24), under v1.2 for everything it does not rewrite, then v1.1, then v1. **Its notes:** [`2026-09-24-first-run-walkthrough-feedback-v1.2.md`](../../product/2026-09-24-first-run-walkthrough-feedback-v1.2.md) (`T#.#`, `G#`, `C#`). **Register:** v1.1 §1.3's five states; this epic lives in *planning* (the builder) and touches *waking* once (the frame's callouts) and *reviewing* once (the quote after the journal).

**Authors:** Reeve (tickets, sequencing, logs) · Mason (architecture, placement, the data contract — TD-23…TD-31) · Vesper's rulings are v1.3 §0.3 R44–R68, cited by ID. **Date:** 2026-09-24. **Executor:** an Opus thread per batch (see `00-build-order.md` § Build batches).

---

## Folder layout

| Path | What |
|---|---|
| `README.md` | This file |
| `00-build-order.md` | The ordered, checkable queue, the critical path, the build batches, and the **v1.3 coverage matrix** |
| `DAY-1…DAY-13-*.md` | The thirteen tickets, all full |
| `PROGRESS.md` · `DEVIATIONS.md` · `TECHNICAL-DECISIONS.md` | The three records. `TECHNICAL-DECISIONS.md` opens with Mason's architecture pass (TD-23…TD-31), made 2026-09-24 |
| `_templates/slice-spec.md` | The blank ticket (identical to Epic 5's) |

---

## What this epic is, in one paragraph

Epic 5 built v1.2 and Taylor walked it on a phone. The screens were right about the parts and wrong about the order: twelve screens of facts collected globally, then a builder that asked for them again per day. v1.3 turns the flow day-first. Five outer screens — the shape of the week, a one-screen primer on blocks with an example day drawn as hued bands, which days are work (now with *Usually*), **your days**, and your week — and the builder in the middle asks for each part of a day where it belongs: when it starts and ends, the work (the plan's own now, not a type), the workouts and where they go, getting ready, what is fixed, the reading and the links, the morning routine against the room, winding down, breaks and meals, the after-work hand-off, free time as a pool chosen from a library, and the day as it stands with its what-gives. The first day collects the libraries; later days start from the last. Around that, the v1.2 build's defects are fixed first — the selection grammar, the card that closed itself, the steppers, the loading — so the fix batch ships whatever Taylor's read flips.

---

## What Mason decided in the architecture pass (the shape every ticket builds inside)

Logged in full in `TECHNICAL-DECISIONS.md` (TD-23…TD-31); the short form:

- **The work template is plan-owned** (TD-23) — created with the plan, named after it, archived with it; the day side (`days.work_template_id`, `applyWorkType`, TD-21) is untouched; *Working today* offers plans by name; the profile's anchors are the first plan's.
- **Several training blocks per day, keyed by the placed workout** (TD-24) — `reconcileBlocks` matches training rows by the workout item they hold; no new column.
- **`transition` is a ninth block kind, one per day, after work** (TD-25) — `day_plans.after_work_template_id`; `DEFAULT_BLOCK_ORDER` gains it; N transitions is open item #37.
- **Free time is a pooled `activity` template** (TD-26) — `day_plans.activity_template_id`; the block materialises `pooled`; `chooseFromPool` fills it in place from the pick or the Today row.
- **Fixture travel reuses TD-12 whole** (TD-27) — the same three columns plus `location`; one shared `writeTravelRows`.
- **`links` is its own table; the kind is derived server-side; nothing is fetched; the Spotify mark is an inline SVG** (TD-28).
- **Block hues are token aliases onto the category scales**, one `hue` prop on `BlockBand`, planning surfaces only (TD-29).
- **Two migrations: `0009` additive (DAY-4), `0010` retirements (DAY-13, absorbing RUN-15)** (TD-30).
- **Five outer steps; `first_run_step` above five resumes at four** (TD-31).

---

## What Vesper decided (cite, do not restate)

v1.3 §0.3 R44–R68 are the rulings; the `[DEFAULT]`, `[ASSUMPTION]`, `[OPEN]` and `[COPY]` items are §13 #31–#43. Tickets cite `v1.3 R#` and `v1.3 §13 #n`. Five that shape every screen ticket:

- **Every screen opens with its v1.3 walk-through** (who, the one job, what you see, what it must never do). The ticket quotes the mechanics and cites the section; it does not paraphrase the layout.
- **The frame rules (v1.3 §4), amended once:** one selection grammar (R56); cards collapse in place to two lines (R57, R58); steppers by one with an empty state (R62); `InfoDisclosure` for every "what does this do?" (R60); the skeleton on every transition (R63); *Back* on the action row inside the builder.
- **Profile screens show once.** B8, B9, B10, B15 are shown on the first plan and skipped after; B11 follows `same_morning_routine`.
- **Copy is v1.3's, verbatim, in a `copy.ts`.** A string v1.3 does not contain is `[COPY — needs Vesper sign-off]`. No emoji in any `copy.ts` (R29, enforced by lint).
- **Mobile first.** The compact layout is the one the acceptance criteria are written against; wide derives per each walk-through's last line.

---

## Source precedence

1. **Product behaviour** → v1.3 (its §0.3 rulings, then its screens) → v1.2 for what v1.3 does not rewrite → v1.1 → v1 → the cross-cutting document → the v2 handoff for component contracts.
2. **Architecture & placement** → [`../README.md`](../README.md) § Placement rules → `codebase-conventions.md` → the domain guides → this track's `TECHNICAL-DECISIONS.md` (TD-23…TD-31), then Epic 5's (TD-10…TD-22), then Epic 4's (TD-1…TD-9).
3. **App rules** → [`apps/web/AGENTS.md`](../../../apps/web/AGENTS.md) — its § Product non-negotiables bind every line here.
4. **This track's rulings**, labelled and logged.
5. **On-disk reality + `DEVIATIONS.md` + `TECHNICAL-DECISIONS.md`** (this track's, then Epic 5's, then Epic 4's, then Epics 1–3's, then the infrastructure track's).

---

## The kickoff contract (one batch per thread)

```
You are building ONE BATCH from docs/specs/epic-6-day-first-first-run/: <BATCH n — TICKET-IDs>.

OBJECTIVE
Ship each ticket's Acceptance criteria — nothing more (scope creep), nothing less —
one ticket at a time, with a hard checkpoint between them.

BEFORE WRITING CODE
1. State the batch and the ticket IDs and titles in your first message.
2. Confirm every entry in each ticket's "Depends on" shows Complete in the owning
   track's PROGRESS.md (this track's, or epic-5-first-run-rebuilt/ as named). If
   any is not Complete, STOP and say so.
3. Read the first ticket end to end, then its attach-list in order. The attach-list
   always includes the v1.3 sections the ticket cites — read them, not a summary.
4. Read this track's DEVIATIONS.md and TECHNICAL-DECISIONS.md, then Epic 5's, then
   Epic 4's — on-disk reality + those logs override any stale string in a spec or
   a UX document.
5. State the exact file paths you will create, change, or remove before
   implementing.

CONSTRAINTS
- Honor every non-negotiable verbatim. If the spec would force you to break one,
  STOP and ask — never silently contradict it.
- The product non-negotiables in apps/web/AGENTS.md bind every pixel: no numbers
  about the day on the tabs, nothing red, no second person in product copy, faded
  is never disabled, the record is annotated never rewritten, notifications never
  report a miss.
- Optimistic by rule (v1.2 §2 guardrail 4, TD-18) and save as you go (guardrail 5):
  no control waits for a response; writes debounce; a failure reverts with one
  line; Continue, Next and Done navigate.
- The sequence never blanks (v1.3 §2 guardrail 6, R63): every route transition
  shows the frame's skeleton; every list shows skeleton rows while fetching.
- One selection grammar (R56): surface, a 1.5px ink border, a check. The ink fill
  is the primary button's and the Stepper17 cell's, nowhere else.
- Block hues appear only where v1.3 §3.1 names (the primer, the builder's B7,
  B13, B14, B17, screen 5) — never on /today or the Schedule (TD-29).
- Emoji live on the person's nouns only (R29, TD-20): never in a copy.ts, a
  heading, a button, a caption, a status line, or a notification.
- The morning is confirmed, never detected (TD-17). The evening is chosen, never
  inferred: a pooled activity block stays pooled until a tap (TD-26).
- stackBlock in @syn/utils is the only block arithmetic; the transition and the
  N training blocks are more blocks in the same walk, never a change to it.
- A migration is authored, journalled, and verified on the local tier only. Stop
  before db:migrate on any hosted tier. Never edit an applied migration; 0004–0008
  are Taylor's to apply in order; 0009 and 0010 follow them.
- Every string a person reads comes from v1.3 (or v1.2 / v1.1 / v1 where it
  defers), verbatim, in a copy.ts. Flag anything else [COPY — needs Vesper
  sign-off].
- Filenames kebab-case; named exports only; Server Components default; client
  leaves in _components/ or components/<feature>/ with "use client" line 1;
  routes from lib/routes.ts (add the row in apps/web/AGENTS.md when you add or
  retire a route); every user-scoped query through ctx.rls.execute().
- Audit @syn/ui before building a component. New reusable UI goes to @syn/ui
  with a story first (DAY-1 and DAY-7 are where the composites land; a later
  ticket that needs one they did not ship STOPS and says so).
- No outbound request on a person's behalf: links are stored and opened, never
  fetched (TD-28).
- No tests. No AI. No scaffolding of apps/mobile.
- If you modify files owned by an upstream Complete ticket (any track), re-check
  that ticket's affected acceptance criteria before finishing.

THE CHECKPOINT BETWEEN TICKETS (inside a batch)
Before reading the next ticket's attach-list: the four verify commands pass;
the ticket's Status line, PROGRESS.md and DEVIATIONS.md are updated; a five-line
report (what shipped, deviations, the one thing the next ticket must know) is
written. Then, and only then, the next ticket.

DEFINITION OF DONE (per ticket)
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
7. Close the batch with 3–5 lines per ticket and the batches left to go.

Do not start the next batch.
```

---

## Completion protocol

Three places, every time: the ticket's `Status:` line, `PROGRESS.md`, `DEVIATIONS.md` (+ `TECHNICAL-DECISIONS.md` when a choice had alternatives). Then tick `00-build-order.md`. "The agent said done" is not done.

---

## Locked scope (do not re-litigate)

- **v1.3 §0.3 R44–R68 are Vesper's rulings on Taylor's notes** (draft 2026-09-24; Taylor's read may flip one — then the ticket that cites it is amended by a `DEVIATIONS.md` line, never by silent rework). v1.2 R28–R43 stand where v1.3 does not amend them; v1.1 R1–R27 likewise.
- **v1.3 §13's defaults are in force** until Taylor flips one: #31 the hue mapping; #32 B3's preselection; #33 the last plan's what-gives; #34 B16 preselects matters ≥ 4; #35 the strips on B13 and B14; #36 the week rows' hue strips; #41 the example day; #42 the shared routine as one referenced template; #43 *Usually* pre-fills as work. **#37, #38, #39 are `[OPEN]` and built to their defaults** (one transition; the evening chosen on arrival; links in the morning only).
- **Epic 5's TD-10…TD-22 and Epic 4's TD-1…TD-9 are consumed, never reopened.**
- **Phase 2 stays the collection**, now with P2-18 (a quote keyed to the entries), P2-19 (Google Places on a fixture), P2-20 (the Review's *four days running* line) pinned by v1.3 §13.
- **Offline writes remain Phase 2.**
- **RUN-14 (the quotes admin surface) stays Epic 5's, provisional, and does not gate anything here.** RUN-15 is absorbed by DAY-13 (TD-30).
- **Launch-blocking for this epic:** DAY-1 through DAY-13. **Does not gate:** nothing — the epic is the first run.

---

## Non-negotiables (every ticket honours these)

- **Optimistic by rule; save as you go** (TD-18; v1.2 §2).
- **The sequence never blanks** (R63).
- **One selection grammar** (R56); **cards collapse in place to two lines** (R57, R58).
- **Emoji on the person's nouns only** (R29).
- **The morning is confirmed, never detected; the evening is chosen, never inferred** (TD-17, TD-26).
- **The room is stated as room** (v1.2 §12.3); **free time is never a miss** (v1.3 §8).
- **One block arithmetic** — `stackBlock` unchanged.
- **Block hues on planning surfaces only** (TD-29).
- **Nothing pre-selected on a chooser** except v1.3 §13's named defaults.
- **The app never speaks the message**; links open and write nothing; the quote is the morning's (R53, R54).
- **Every read and write through `ctx.rls.execute()`**, `user_id` from the session; the two enumerated exceptions (quotes' catalogue read, RUN-14's admin write) stand.

---

## Canonical paths & known-stale warnings

- **`apps/web/app/(setup)/_components/`** holds fourteen step files under v1.2. DAY-8 reduces the outer sequence to five (`step-1-shape`, `step-2-blocks` new, `step-3-work-days` from `step-2-work-days`, `step-4-days` from `step-13-days`, `step-5-week` from `step-14-week`); the nine v1.2 screen files whose contents move into the builder are **deleted in DAY-13**, not before — DAY-9…DAY-11 move their pieces into `components/day-builder/` and leave the old files importable until Settings re-points. Until DAY-8, `SETUP_TOTAL_STEPS = 14` and `setupRoute` accepts 1–14.
- **`apps/web/components/day-builder/screens/13a…13i-*.tsx`** are v1.2's nine. DAY-9…DAY-11 rename to `b01-name-days.tsx` … `b17-review.tsx` as each lands; a screen not yet moved keeps its `13x` file. `BUILDER_SCREENS` in `use-day-builder.ts` is the one place the order lives.
- **`apps/web/app/(setup)/_components/work-day-type-card.tsx`** becomes the plan's work step (DAY-9, `components/day-builder/screens/b03-work.tsx`); the `WorkDayTypeCards` list and Settings → `work-day-types` retire in DAY-13.
- **`packages/api/src/services/plan/templates.ts` `ensureWorkTemplates`** is RUN-3's profile-level ensure; DAY-5 adds `ensureWorkFor(planId)` beside it and re-points the callers; the old function goes in DAY-13 if nothing imports it.
- **`packages/api/src/services/day/habit-item.ts` `writeWorkoutRows`** gains an extracted `writeTravelRows` in DAY-6; do not fork the travel writer for fixtures.
- **`packages/db/migrations/meta/_journal.json`** is at `0008`. This epic's migrations are `0009_v1_3_additive` (DAY-4) and `0010_retirements` (DAY-13). None of `0004`–`0010` is applied to a hosted tier by an agent.
- **`packages/constants/src/starter-library.ts`** has empty `activity` and no `transition` key; DAY-3 adds both and a `group` field on morning and activity rows. The emoji lint's exception list (`packages/config/eslint/no-emoji.js`) names the seed files; DAY-3 adds `example-day.ts` and `link-hosts.ts` to it only if they carry glyphs (they do not).
- **`apps/web/lib/routes.ts`**: `setupRoute(step)` 1–14 → 1–5 (DAY-8); `YourDayScreen` loses `work-start · work-day-types · wake` (redirects in DAY-8, removed in DAY-13) and gains `first-thing · morning-habits · ranked · free-time · after-work · evenings` (DAY-12). **Every added or retired route also gets its row in `apps/web/AGENTS.md`.**
- **`packages/ui/src/composed/control/native-select/`** is used only by screen 2; DAY-1 re-points screen 2 at the `select` primitive; the native one stays for Settings → Notifications until DAY-13 audits its callers.
