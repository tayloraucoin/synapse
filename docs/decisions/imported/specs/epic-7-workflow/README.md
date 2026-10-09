# Epic 7 — Workflow: how to work this folder

**Read [`../README.md`](../README.md) first** — the global build order, the placement rules, and the cross-track dependencies. This file adds only what is local to Epic 7.

**Governs:** Workflow, the second feature area — a board of lanes (groups) by columns (states) for running several AI-driven threads at once: the firing toggle and its mark, the one *next*, *first today*, views that own their columns, templates, the queue. **Source document:** [`docs/ux/workflow-ux-spec-v0.1.md`](../../ux/workflow-ux-spec-v0.1.md) (Vesper, draft for Taylor's read, 2026-10-03), which inherits official spec §9–§11 and the cross-cutting document except where its §0.4 amends them. **Its notes:** Taylor's stakeholder notes of 2026-10-03, cited through the UX document as `N§n` and `NQ#`. **Register:** a fifth state, *working* (UX §1.1) — a glance of about a second, attention in another window; the queue view is *planning*.

**Authors:** Reeve (tickets, sequencing, logs) · Mason (architecture, placement, the data contract — TD-33…TD-46, in [`01-technology-assessment.md`](01-technology-assessment.md)) · Vesper's rulings are UX §0.3 W1–W19, cited by ID. **Date:** 2026-10-03. **Executor:** Mason, an Opus thread per batch (see `00-build-order.md` § Build batches).

**A naming note.** The notes call this *Epic 2*. Here Epic 2 is *In use* (`USE-`). This is the seventh track; its tickets are `FLO-`, its screens `WF-`.

---

## Folder layout

| Path | What |
|---|---|
| `README.md` | This file |
| `00-build-order.md` | The ordered, checkable queue, the critical path, the build batches, and the **coverage matrix** |
| `01-technology-assessment.md` | Mason's architecture pass: what exists and is consumed, TD-33…TD-46 with their reasoning, placement by exact path, the failure contract. **Tickets cite it; it is read, not summarised** |
| `FLO-1…FLO-10-*.md` | The ten tickets, all full |
| `PROGRESS.md` · `DEVIATIONS.md` · `TECHNICAL-DECISIONS.md` | The three records. `TECHNICAL-DECISIONS.md` opens with TD-33…TD-46 in the house's short form, each pointing at the assessment for its context and options |
| `_templates/slice-spec.md` | The blank ticket (identical to Epic 6's) |

---

## What this epic is, in one paragraph

Most of the time on an AI-driven task is spent waiting for a prompt to return. Workflow turns that wait into parallel work: several tasks sit *In progress* at once; each is either **firing** (a prompt is running, not the person's problem) or the person's; and the board says, in one word in one place, which of the person's tasks is **next**. Tasks belong to groups, usually clients, drawn as lanes in a priority order that one group can lead *for today only*. Columns are states; a view is a named set of columns; a template is where a view's columns started; the queue is a view where nothing fires. It is built wide first, beside a terminal, and it adds no AI, no outbound request, no notification, no job and no Realtime.

---

## What Mason decided in the architecture pass (the shape every ticket builds inside)

In full in [`01-technology-assessment.md`](01-technology-assessment.md) §3; logged in `TECHNICAL-DECISIONS.md`. The short form:

- **One schema domain, `workflow/`, every table prefixed `workflow_`** (TD-33); six tables, columns as rows, saved templates as a jsonb snapshot, two partial unique indexes holding *at most one active and one done column per view* (TD-34).
- **Order is the house's dense `smallint`, per cell; a move is one transactional service** that also applies the role effects (TD-35).
- **Firing is two timestamps and is *set*, never toggled** (TD-36).
- ***First today* is a row keyed by the person's day key; expiry is derived; nothing runs** (TD-37).
- ***Next* and today's lane order are pure functions in `@syn/utils/workflow/`**, re-run on the client over the patched cache; neither is ever stored (TD-38).
- **One board read per view; every write patches that one cache entry** in the `useDayList` pattern; no Zustand, no Realtime (TD-39).
- **One router, `workflow`, with nested sub-routers; services in `services/workflow/`** (TD-40).
- **The two starter views are ensured on first read**, from constants (TD-41).
- **The breath is one keyframe, applied `motion-safe` only** (TD-42).
- **The cross-cell drag is a new `Board` composite on dnd-kit, built last, gating nothing; `SortableList` is not extended** (TD-43).
- **Five shell edits, each in the file that owns the fact** (TD-44).
- **The export includes the six tables, and that is launch-blocking** (TD-45).
- **One additive migration, `0011_workflow`, applied by Taylor after `0009` and `0010`** (TD-46).

---

## What Vesper decided (cite, do not restate)

UX §0.3 W1–W19 are the rulings; §13 #W1–#W15 the defaults and open items. Tickets cite `W#` and `§13 #W#`. Six that shape every screen ticket:

- **Every screen opens with its walk-through** (UX §4: who, the one job, what it must never do). The ticket quotes the mechanics and cites the section; it does not paraphrase the layout.
- **One mark moves** (W5, UX §3.3): a 10px accent mark breathing in the toggle. No row pulses, no border, no wash.
- **Exactly one *next*** (W7, W8): the word and a surface on one row, and the header strip. Computed, never stored.
- **No counts** (W15): no number on a column, a lane, or the nav. The only numbers are durations.
- **Every move works by menu and by key before any drag exists** (W12).
- **Copy is UX §7's, verbatim, in a `copy.ts`.** A string §7 does not contain is `[COPY — needs Vesper sign-off]`. The save-failure sentence is the day list's on-disk string, reused, not rewritten.

---

## Source precedence

1. **Product behaviour** → Taylor's notes → the Workflow UX spec (its §0.3 rulings, then its screens) → official spec §9–§11 and the cross-cutting document for what it does not amend → the v2 handoff for reused components' contracts.
2. **Architecture & placement** → [`../README.md`](../README.md) § Placement rules → `codebase-conventions.md` → the domain guides → this track's `TECHNICAL-DECISIONS.md` (TD-33…TD-46) and the assessment → Epics 4–6's (TD-1…TD-32), consumed.
3. **App rules** → [`apps/web/AGENTS.md`](../../../apps/web/AGENTS.md) — its § Product non-negotiables bind this surface as they bind the tabs (UX §0.4, §2).
4. **This track's rulings**, labelled and logged.
5. **On-disk reality + `DEVIATIONS.md` + `TECHNICAL-DECISIONS.md`** (this track's, then the earlier tracks').

---

## The kickoff contract (one batch per thread)

```
You are Mason, building ONE BATCH from docs/specs/epic-7-workflow/: <BATCH n — TICKET-IDs>.

OBJECTIVE
Ship each ticket's Acceptance criteria — nothing more (scope creep), nothing less —
one ticket at a time, with a hard checkpoint between them.

BEFORE WRITING CODE
1. State the batch and the ticket IDs and titles in your first message.
2. Confirm every entry in each ticket's "Depends on" shows Complete in this
   track's PROGRESS.md. If any is not Complete, STOP and say so.
3. Read the first ticket end to end, then its attach-list in order. The attach-list
   always includes the UX sections the ticket cites and the assessment sections it
   names — read them, not a summary.
4. Read this track's DEVIATIONS.md and TECHNICAL-DECISIONS.md — on-disk reality +
   those logs override any stale string in a spec, the assessment or the UX document.
5. State the exact file paths you will create, change, or remove before
   implementing.

CONSTRAINTS
- Honor every non-negotiable verbatim. If the spec would force you to break one,
  STOP and ask — never silently contradict it.
- The product non-negotiables in apps/web/AGENTS.md bind every pixel here: nothing
  red, no second person, colour never alone, no gradients, no shadow but an
  overlay's, the accent never fills a surface.
- No counts on this surface (W15): no number on a column, a lane, a tab or the nav.
  The only numbers are durations.
- One mark moves (W5, TD-42): the breath is applied motion-safe ONLY. Under reduced
  motion the mark is still at full opacity. No other element on the board animates
  at rest.
- Next is computed, never stored (W8, TD-38): resolveNextTask in @syn/utils is the
  only implementation; the server neither stores nor returns it.
- Firing is SET, never toggled (TD-36): the mutation takes the wanted state and an
  `at`; it is safe to send twice.
- A move is one service call (TD-35). Order is dense and server-rewritten; no
  fractional keys; no client-computed sort_order.
- Optimistic by rule; save as you go: no control waits for a response; a failure
  reverts with the one on-disk save-failure sentence; no form here has a Save button.
- Every move works by menu and by key (W12). Drag is FLO-9 and nothing waits on it.
- Archive, never delete (W18).
- A migration is authored, journalled, and verified on the local tier only. STOP
  before db:migrate on any hosted tier. Never edit an applied migration. 0004–0010
  are Taylor's to apply in order; 0011 follows them.
- A task's title and note are the person's client work: never logged, never in an
  error message, always in the export (TD-45).
- dnd-kit is imported only inside @syn/ui. No new dependency. No Zustand store.
  No Realtime. No outbound request.
- Every string a person reads comes from UX §7, verbatim, in a copy.ts. Flag
  anything else [COPY — needs Vesper sign-off]. No emoji in any copy.ts.
- Filenames kebab-case; named exports only; Server Components default; client
  leaves in _components/ with "use client" line 1; routes from lib/routes.ts (add
  the row in apps/web/AGENTS.md when you add a route); every user-scoped query
  through ctx.rls.execute(); another person's id is NOT_FOUND.
- Audit @syn/ui before building a component. New reusable UI goes to @syn/ui with
  a story first (FLO-4 is where the composites land; a later ticket that needs one
  it did not ship STOPS and says so).
- A grep-shaped acceptance criterion is run before it is claimed, and a comment
  that must mention a forbidden string describes it instead of quoting it.
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
   criterion checked and stated, including the induced ones. Where sign-in or a
   missing local database blocks a walk, say so — never claim a walk that did not
   happen.
3. The ticket's Status line set to: Status: Complete (YYYY-MM-DD).
4. PROGRESS.md row + checklist ticked.
5. One DEVIATIONS.md line per divergence. Architectural choices with real
   alternatives → TECHNICAL-DECISIONS.md.
6. yarn directory-map if files were added/moved/removed; yarn docs:check-links if
   a doc moved.
7. Close the batch with 3–5 lines per ticket and the batches left to go, with the
   tickets in each.

Do not start the next batch.
```

---

## Completion protocol

Three places, every time: the ticket's `Status:` line, `PROGRESS.md`, `DEVIATIONS.md` (+ `TECHNICAL-DECISIONS.md` when a choice had alternatives). Then tick `00-build-order.md`. "The agent said done" is not done.

---

## Locked scope (do not re-litigate)

- **UX §0.3 W1–W19 are Vesper's rulings on Taylor's notes** (draft 2026-10-03; Taylor's read may flip one — then the ticket that cites it is amended by a `DEVIATIONS.md` line, never by silent rework).
- **UX §13's defaults are in force** until Taylor flips one. **#W1, #W6, #W7 are `[OPEN]` and built to their defaults**: no weekly rule for *first today*; the board says nothing about a task left firing; no link on a task.
- **UX §12 is not built and not scaffolded**: detection from Claude Code, any tie to the habit day, firing history, a second person, notifications, offline writes. The seams are recorded in the assessment §7.
- **TD-33…TD-46 are the shape.** TD-1…TD-32 are consumed, never reopened.
- **Launch-blocking for this epic:** FLO-1 through FLO-8, with the export inside FLO-3 (TD-45). **Does not gate:** FLO-9 (the drag). **Blocking for the corpus, not the surface:** FLO-10.
- **Nothing in Epics 1–6 waits on this epic, and this epic changes nothing they shipped** except the five shell edits in FLO-5 and the export in FLO-3.

---

## Decision queue (Taylor)

Batched, each with a recommendation and the default in force. None blocks batch 1.

| # | Question | Recommendation | Default in force if unanswered | Blocks | Urgent by |
|---|---|---|---|---|---|
| Q1 | Is Workflow in `apps/web`'s scope? `apps/web/AGENTS.md` § Scope does not list it; the notes are the only authority for adding it. | Yes — one line, as the landing page was added on 2026-09-05. | **Yes.** FLO-5 writes the line and logs it. | FLO-5 | Batch 2 |
| Q2 | The firing treatment: a breathing mark (W5, §13 #W2), not a pulsing row. | The mark. | **The mark.** A flip is one variant on `TaskRow`. | FLO-4 | Batch 3 |
| Q3 | Workflow opens without the orient frame first (W16, #W8). | Exempt. | **Exempt.** One branch in `resolveEntry`. | FLO-5 | Batch 2 |
| Q4 | Migrations `0004`–`0010` on staging. | Apply before a hosted walk is wanted. | **Local tier only**; every ticket says so in its report. | A hosted walk of anything | When Taylor wants staging |
| Q5 | The on-screen noun (*Task*, W17, #W9). | *Task*, the notes' own word. | ***Task*.** A flip is `copy.ts` only; code says `workflow task` either way. | — | — |

**As built (FLO-10, 2026-10-04):** none of Q1–Q5 was answered; every default above is in force and is what shipped — Q1 the scope line in `apps/web/AGENTS.md` (FLO-5); Q2 the breathing mark (FLO-4); Q3 the orient exemption (FLO-5); Q4 the local tier only, `0011` applied to no database; Q5 *Task*. A flip is still the one change each row names, logged in `DEVIATIONS.md`.

---

## Non-negotiables (every ticket honours these)

- **One mark moves, motion-safe only** (W5, TD-42).
- **Exactly one *next*, computed, never stored** (W7, W8, TD-38).
- **No counts** (W15).
- **Firing is set, never toggled; a move is one service call** (TD-36, TD-35).
- **Optimistic by rule; save as you go; nothing leaves without a way back** (UX §2 guardrails 5 and 7).
- **Every move by menu and by key before any drag** (W12).
- **Archive, never delete** (W18).
- **The person's words are never logged and always exported** (TD-45).
- **Every read and write through `ctx.rls.execute()`**, `user_id` from the session; another person's id is `NOT_FOUND`.
- **The board never blanks** (UX §2 guardrail 8).

---

## Canonical paths & known-stale warnings

- **`packages/db/migrations/meta/_journal.json`** is at `0010`. This epic's one migration is `0011_workflow` (FLO-2). None of `0004`–`0011` is applied to a hosted tier by an agent.
- **`workflow_groups.hue` reuses `categoryColorKeyEnum`** (root `packages/db/src/schema/enums.ts`) and `CategoryKey` (`@syn/types`). The assessment §9 left *which construct* open; it was read on 2026-10-03 and this is the answer. Do not create a second hue enum.
- **`formatElapsed` in `packages/utils/src/time.ts` is the timer's `m:ss` and is not this epic's format.** The board's *4 min* / *1 h 12 min* has no formatter on disk; FLO-1 adds `formatMinutesShort` beside it. The assessment's TD-38 calls the possible new function `formatElapsed` — that name is taken.
- **The save-failure sentence is `COPY.saveError` in `apps/web/components/day-list/copy.ts`** — *Couldn't save. Try again.* The Workflow `copy.ts` carries the same string as its own key; it does not import the day list's file.
- **`apps/web/app/(shell)/_components/nav-items.ts`** — `tabForPath` ends with a rule matching any path that ends in `/schedule`; the Workflow rule goes before it. `TabBar` renders every `NAV_ITEMS` row, so the fifth tab is a list edit and a width check at 320px.
- **`TabBar` re-tapping the active tab dispatches scroll-to-now.** On Workflow nothing listens; that is correct and needs no code.
- **`useGlobalShortcuts` returns early on any modifier**, so `Alt`+arrows never reach it. Its `n` is scoped by `isDayRoute`; Workflow's `n` is a second, sibling scope, not a change to that one.
- **`ScreenFrame`'s header comment says *two widths only*.** FLO-4 adds the third, `"board"`, and amends the comment and the story.
- **`StateWord` reserves its accent dot for *now* and *soon*.** It is not reused here; `TaskRow` draws its own words and `FiringMark` its own mark (UX §9).
- **`SortableList` is single-list by contract and has seven callers.** It is reused unchanged for the Columns sheet and is not extended for the board (TD-43).
- **`build-export.ts` reads tables by an explicit list.** A table not added there is silently absent from the file whose screen says nothing is left out.
