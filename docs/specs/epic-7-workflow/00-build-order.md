# Epic 7 — Workflow — Build Order

**New here? Read `README.md` first**, then [`../README.md`](../README.md) for the global order. This file is the ordered, checkable build queue for this track, the build batches Mason executes, and the coverage matrix that proves every section of the Workflow UX spec has a ticket.

> Derived from each ticket's `## Depends on`. A ticket may start only when everything it lists shows **Complete** in `PROGRESS.md`. If this file and a ticket's `## Depends on` disagree, **the ticket wins** — fix this file.

## How to work this file

1. Find the next unchecked batch. 2. Confirm every ticket's gate in `PROGRESS.md`. 3. Build one batch per thread, one ticket at a time with the checkpoint between. 4. On done, close each ticket in three places, then tick here.

## Critical path (sequential)

FLO-1 → FLO-2 → FLO-3 → FLO-6 → FLO-7 → FLO-8

The contract; the six tables; the services and the export; the board with its toggle and its *next*; tasks and groups moved by menu and key; views, columns and templates. FLO-4 (the composites, after FLO-1) and FLO-5 (the shell, gated by nothing) run beside FLO-2 and FLO-3, and both gate FLO-6. FLO-9 (the drag) hangs off FLO-7 and gates nothing. FLO-10 closes the corpus.

## Build-order checklist

### Phase 0 — The contract (no UI, no table)
- [x] **FLO-1** · The contract: `@syn/types` view models and unions, the two starter templates and the limits, the validators with UX §7's messages, `orderGroupsForDay`, `resolveNextTask`, `formatMinutesShort` — S · (none) · **Mason review of the unions and the two pure functions**

### Phase 1 — The data
- [x] **FLO-2** · The `workflow/` schema domain and migration `0011_workflow`: six tables, one enum, the two partial unique indexes, owner-private policies, row types, the schema reference — M · (FLO-1) · **Mason migration review; human reads the SQL**
- [x] **FLO-3** · Services, the `workflow` router, and the export: the board read, ensure-defaults, set-firing, the move, start, archive and restore, groups and pins, views and columns, templates; the six tables in the account export — L · (FLO-2) · **Vigil: the move's seven paths; the export diffed against the schema**

### Phase 2 — The composites and the shell (parallel with Phase 1)
- [ ] **FLO-4** · `@syn/ui` for Workflow: `FiringMark`, `FiringToggle`, `TaskRow`, `LaneHeader`, `NextStrip`, `InlineAddRow`, the static `Board`, `ScreenFrame` `"board"`, the breath token and keyframe, stories — L · (FLO-1) · **Vesper review of stories in both themes and under reduced motion**
- [ ] **FLO-5** · The shell: the fourth peer, the two routes and a placeholder frame, `tabForPath`, the orient exemption, the `4` key, `apps/web/AGENTS.md`'s scope and route rows — S · (none)

### Phase 3 — The surface
- [ ] **FLO-6** · The board: read, fire, next — the two pages, `use-workflow-board`, the optimistic toggle, the Next strip and the tab title, loading, first open, offline, failure, the keyboard grid — L · (FLO-3, FLO-4, FLO-5) · **Vigil: the toggle under a slow and a failing network; reduced motion; the notes' §5 loop walked**
- [ ] **FLO-7** · Tasks and groups: the add rows, the task sheet, *Move to* and `Alt`+arrows, *Start*, archive with undo, *Closed earlier*; group create, rename, colour, collapse, move, *First today*, archive — L · (FLO-6) · **Vigil: every move's undo restores firing; a pin across a day close**
- [ ] **FLO-8** · Views, columns, templates, the archive, the compact column tabs: view tabs and switching, *New view*, the Columns sheet with roles and remove-with-move, *Save as a template*, the Archived sheet, the view menu — L · (FLO-7) · **Vigil: removing a column that holds firing tasks; the last view and the last column**

### Phase 4 — Does not gate
- [ ] **FLO-9** · The drag: `Board` gains its `DndContext`; a row across cells and lanes; a lane among lanes; touch and keyboard — M · (FLO-7) · **Vigil on touch and keyboard; Vesper on the lift and the drop line**

### Phase 5 — The corpus
- [ ] **FLO-10** · Close-out: the placement rules' new domain and router, the tracks table, the docs index, the directory map, the link check, the scope line confirmed — S · (FLO-8)

## Ordering constraints (alphabetical order hides these)

- **FLO-1 precedes everything** — the unions are what the enum, the validators, the services and the components all type against; a table or a component written first invents them.
- **FLO-2 precedes FLO-3** — a service written against columns that do not exist invents them.
- **FLO-3 carries the export** — from the first slice a person can write a client's name into, the export screen's *nothing is left out* must be true (TD-45). It is not deferred to FLO-10.
- **FLO-4 needs only FLO-1 and FLO-5 needs nothing**; both are built beside the data. FLO-4's stories use fixtures, not a database. FLO-5 is batched after FLO-3 only so that batch ends with a route in the nav.
- **FLO-6 waits on all three of FLO-3, FLO-4, FLO-5** — it is the first ticket that composes them.
- **FLO-6 precedes FLO-7 precedes FLO-8** — one `use-workflow-board` hook and one cache entry, grown front to back: read and fire, then write and move, then arrange.
- **FLO-9 follows FLO-7, not FLO-6** — the drag calls the same `move` and `reorder` mutations the menu and the keys call; it is never the first caller of either (W12).
- **FLO-9 may be built before or after FLO-8.** Nothing in FLO-8 or FLO-10 waits on it.
- **FLO-10 is last** — it writes the placement rules and the index against what was actually built.

## Full dependency table

| Ticket | Complete-required dependencies |
|---|---|
| FLO-1 | — |
| FLO-2 | FLO-1 |
| FLO-3 | FLO-2 |
| FLO-4 | FLO-1 |
| FLO-5 | — |
| FLO-6 | FLO-3, FLO-4, FLO-5 |
| FLO-7 | FLO-6 |
| FLO-8 | FLO-7 |
| FLO-9 | FLO-7 |
| FLO-10 | FLO-8 |

## Ticket-authoring batches (distinct from build phases)

| Batch | Tickets | Why grouped | Status |
|---|---|---|---|
| 1 | FLO-1, FLO-2, FLO-3 | The contract, the columns and the services: the unions, the tables and the procedures agree | **Authored 2026-10-03** |
| 2 | FLO-4, FLO-5 | What FLO-6 composes that is not data | **Authored 2026-10-03** |
| 3 | FLO-6, FLO-7, FLO-8 | The surface: one hook and one cache entry, grown in three steps | **Authored 2026-10-03** |
| 4 | FLO-9, FLO-10 | The drag and the corpus | **Authored 2026-10-03** |

All ten were authored in one thread on 2026-10-03, exceeding the guide's §7.4 ceiling for the same reason Epics 4, 5 and 6 did — one data model (TD-33…TD-46). Logged in `DEVIATIONS.md`.

## Build batches (what Mason executes, one per thread)

Taylor's standing instruction (Epic 5, 2026-09-16): Mason executes the track in batches, one batch per thread, and Taylor advances with **"next batch"**. The README's kickoff contract carries the **hard checkpoint between tickets** inside a batch. A batch never starts a ticket whose gate is not Complete. No batch holds two L tickets.

| Batch | Tickets | Gate (Complete in `PROGRESS.md`) | What it proves | Status |
|---|---|---|---|---|
| 1 | FLO-1 · FLO-2 | — | The contract and the columns for everything after; `0011` authored, not applied | **Complete 2026-10-03** |
| 2 | FLO-3 · FLO-5 | FLO-2 | Every procedure answers on the local tier; the export is whole; `/workflow` exists in the nav and renders a frame | **Built 2026-10-03** — FLO-3 Complete; FLO-5 blocked on its criterion 4 (320px) |
| 3 | FLO-4 | FLO-1 | Every composite with its story; the mark breathes, and is still under reduced motion | Not started |
| 4 | FLO-6 | FLO-3, FLO-4, FLO-5 | The notes' §5 loop, end to end: fire, work another, come back, the right one is *next* | Not started |
| 5 | FLO-7 | FLO-6 | A day's real use without touching a database: add, edit, move, start, archive, pin | Not started |
| 6 | FLO-8 | FLO-7 | Different workflows: a new view from a template, its columns arranged, a template saved | Not started |
| 7 | FLO-9 · FLO-10 | FLO-7, FLO-8 | The fast path over the same moves; the corpus says what was built | Not started |

**To start a batch**, a new thread is given: the role prompt `docs/roles/engineering/Mason—cto-principle-dev-role-prompt.md`, this track's `README.md` (its kickoff contract, with the batch line filled in), and the batch's tickets. Everything else is on the tickets' attach-lists.

## Coverage matrix — every section of the Workflow UX spec → the ticket that ships it

| UX § | What | Ticket(s) |
|---|---|---|
| §0.3 W1, §5 | The fourth peer; routes; entry | FLO-5 |
| §0.3 W2, §3.1 | Wide first; the grid; the full-width frame | FLO-4 (`Board`, `ScreenFrame`) · FLO-6 |
| §1.4, §7 | The words; the copy files | FLO-1 (validator messages, starter names) · FLO-4 (component defaults) · FLO-6…FLO-8 (the route's `copy.ts`) |
| §2 guardrails | One mark; one next; no counts; optimistic; fallbacks; undo; never blank | README non-negotiables · FLO-4 · FLO-6 · FLO-7 |
| §3.2 | Tasks; *No group* | FLO-2 · FLO-3 · FLO-6 · FLO-7 |
| §3.3 | Firing: the toggle, the mark, the words, the durations | FLO-1 (`formatMinutesShort`) · FLO-3 (`setFiring`) · FLO-4 · FLO-6 |
| §3.4 | *Next*: the row, the strip, the announcement, the tab title | FLO-1 (`resolveNextTask`) · FLO-4 (`NextStrip`, `TaskRow`) · FLO-6 |
| §3.5 | Groups: hue, usual order, *first today*, collapse | FLO-1 (`orderGroupsForDay`) · FLO-2 · FLO-3 · FLO-4 (`LaneHeader`) · FLO-7 |
| §3.6 | Columns, views, templates | FLO-1 (starters) · FLO-2 · FLO-3 · FLO-8 |
| §3.7 | The queue; *Start*; *Move to view* | FLO-3 · FLO-7 |
| §3.8 | Done; *Closed earlier* | FLO-3 · FLO-7 |
| §4 WF-01 | The board: header, heads, lanes, rows, states, accessibility, compact | FLO-4 · FLO-6 (read, fire, keys, states) · FLO-7 (add, move, menus) · FLO-8 (view tabs, view menu, compact column tabs) · FLO-9 (drag) |
| §4 WF-02 | The task sheet | FLO-7 |
| §4 WF-03 | New view | FLO-8 |
| §4 WF-04 | Columns | FLO-8 |
| §4 WF-05 | Archived | FLO-8 |
| §4 Dialogs | Archive group · archive view · rename · colour | FLO-7 (group) · FLO-8 (view, template) |
| §5 | Navigation and routes | FLO-5 · FLO-6 (`?sheet`, `?add`) · FLO-8 (`?col`) |
| §6 | Motion | FLO-4 |
| §8 | What it never says or does | README non-negotiables; a negative criterion in FLO-6 and FLO-8 |
| §9 | Component needs | FLO-4 · FLO-9 |
| §10 | Convergence tests | Vesper's review callouts on FLO-4, FLO-6, FLO-9 |
| §11 | The data as needs | FLO-2 · FLO-3 |
| §12 | Not in this version | README locked scope; each ticket's Out of scope |
| §13 | Open items and defaults | Each default cited where it lands |
| Assessment §5 | The failure contract | FLO-3 · FLO-6 · FLO-7 · FLO-8 (as acceptance criteria) |
| Assessment TD-45 | The export | FLO-3 |

## Locked references (do not re-litigate)

- **Decisions:** UX §0.3 W1–W19; this track's TD-33…TD-46; TD-1…TD-32. Cite by ID; re-opening requires new evidence routed to Taylor.
- **Binding law:** `README.md` § Non-negotiables; `apps/web/AGENTS.md` § Product non-negotiables; `../README.md` § Placement rules; `codebase-conventions.md`; `drizzle-orm-conventions.md` for every schema line.
- **Launch-blocking set:** FLO-1…FLO-8, with the export inside FLO-3. **Does not gate:** FLO-9. **Corpus:** FLO-10.
- **What waits on Taylor:** nothing blocks a batch. README § Decision queue Q1–Q5 each have a default in force; a flip is a `DEVIATIONS.md` line. Migrations `0004`–`0011` are his to apply.
