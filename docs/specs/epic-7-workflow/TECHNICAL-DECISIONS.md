# Epic 7 — Workflow — Technical Decisions (append-only)

One section per architectural choice that had real alternatives. Written when the decision is made. Format:

```
## YYYY-MM-DD · <ticket-id> · <the decision, as a statement>
**Context (as it was then):** …
**Options weighed:** A … B … C …
**Decision:** …
**Consequences:** what this buys, what it costs, what it forecloses.
**Revisit trigger:** the condition under which this should be reopened.
```

The first fourteen (TD-33…TD-46, continuing the global numbering from Epic 6's TD-32) are Mason's architecture pass over the Workflow UX spec, made 2026-10-03 before any ticket was cut, so every ticket builds inside them. **Their context, options, consequences and revisit triggers are written once, in [`01-technology-assessment.md`](01-technology-assessment.md) §3, and are not copied here** — one fact, one home. Each entry below is the decision as a statement and the pointer. Tickets cite them by number. TD-1…TD-32 stand and are consumed, never reopened.

Decisions made during the build are appended after these in the full format.

## 2026-10-03 · TD-33 · Workflow is one schema domain, `workflow/`, and every table carries the `workflow_` prefix
**Decision:** tables `workflow_groups`, `workflow_views`, `workflow_columns`, `workflow_tasks`, `workflow_templates`, `workflow_day_pins`; TypeScript `workflowGroups`, `WorkflowTaskView`, …. The on-screen noun stays *Task* (W17). **Full entry:** assessment §3 TD-33.

## 2026-10-03 · TD-34 · Six tables; columns are rows, saved templates are a jsonb snapshot; the database holds *at most one active and one done column per view*
**Decision:** the shapes in assessment §3 TD-34; `column_id` restrict, `group_id` set null, `view_id` cascade; two partial unique indexes on `workflow_columns (view_id)`; `isFiring` is not stored; the per-day order is pins only. **Amended at authoring (2026-10-03):** `workflow_groups.hue` is `categoryColorKeyEnum`, the existing root enum — no second hue enum. **Full entry:** assessment §3 TD-34.

## 2026-10-03 · TD-35 · Order is the house's dense `smallint`, scoped per cell, rewritten by the server; a move is one transactional service
**Decision:** list reorders take the full ordered id list, as `reorderLinks`; `moveWorkflowTask` closes the source gap, opens the destination, writes column, view, group and order, and applies the role effects, in one `rls.execute`. No fractional keys. **Full entry:** assessment §3 TD-35.

## 2026-10-03 · TD-36 · Firing is set, never toggled; and it is two timestamps
**Decision:** `workflow.task.setFiring({ id, firing, at })`, idempotent in both directions; refused outside an active column; no firing history table. **Full entry:** assessment §3 TD-36.

## 2026-10-03 · TD-37 · *First today* is keyed by the person's day key; expiry is derived, and nothing runs
**Decision:** `workflow_day_pins`, one row per `(user_id, day_key)`; the key from `resolveDayKey`; no job, no cleanup. **Full entry:** assessment §3 TD-37.

## 2026-10-03 · TD-38 · *Next* and today's order are pure functions in `@syn/utils/workflow/`
**Decision:** `orderGroupsForDay` and `resolveNextTask`; `now` is an argument; the server neither stores nor returns *next*. **Amended at authoring (2026-10-03):** the duration formatter is `formatMinutesShort` in `time.ts`; `formatElapsed` is the timer's and is not touched. **Full entry:** assessment §3 TD-38.

## 2026-10-03 · TD-39 · One board read per view; optimistic writes patch that one cache entry
**Decision:** `workflow.board({ viewId })` returns the whole board; *Closed earlier* is a second, lazy query; the `useDayList` patch-then-mutate pattern; undo payloads carry the prior place and firing; no Zustand store; no Realtime. **Full entry:** assessment §3 TD-39.

## 2026-10-03 · TD-40 · One router, `workflow`, with nested sub-routers; one service folder
**Decision:** `packages/api/src/routers/workflow.ts`; `packages/api/src/services/workflow/`; validators in `packages/validators/src/workflow.ts`; view models in `packages/types/src/domain/workflow.ts`; starters and limits in `@syn/constants`. **Full entry:** assessment §3 TD-40.

## 2026-10-03 · TD-41 · The two starter views are ensured on first read, not migrated in
**Decision:** `ensureWorkflowDefaults` runs when the person has no view of any state; built-in templates are constants, never rows; the last view cannot be archived. **Full entry:** assessment §3 TD-41.

## 2026-10-03 · TD-42 · The breath is one keyframe in `@syn/ui`'s stylesheet, applied `motion-safe` only
**Decision:** `--dur-breathe: 2400ms` in `preset.css`; `@keyframes syn-breathe` and `animate-breathe` in `packages/ui/src/styles/globals.css`; `FiringMark` applies `motion-safe:animate-breathe` so the animation is never attached under reduced motion. **Full entry:** assessment §3 TD-42.

## 2026-10-03 · TD-43 · The cross-cell drag is a new `Board` composite on dnd-kit; `SortableList` is not extended; it ships last
**Decision:** `packages/ui/src/composed/layout/board/` owns gesture and preview and emits intents; the board is first built static; the drag is FLO-9 and gates nothing. **Full entry:** assessment §3 TD-43.

## 2026-10-03 · TD-44 · The shell changes are five edits, each in the file that already owns the fact
**Decision:** `nav-items.ts`, `lib/routes.ts`, `lib/entry/resolve-entry.ts`, `ScreenFrame`/`PageFrame`, the shortcut files; board-local keys live on the board; the view id in the URL is the row's uuid; the last-opened view is `workflow_views.last_opened_at`. **Full entry:** assessment §3 TD-44.

## 2026-10-03 · TD-45 · The export includes Workflow, and that is launch-blocking for the epic
**Decision:** the six tables join `readAccountData`; `workflow_tasks.csv` and `workflow_groups.csv` join `EXPORT_FILE_NAMES`; deletion needs no change. Ships in FLO-3, before any surface a person can write to. **Full entry:** assessment §3 TD-45.

## 2026-10-03 · TD-46 · One additive migration, `0011_workflow`; authored and verified locally; applied by Taylor, after `0009` and `0010`
**Decision:** purely additive; an agent stops before `db:migrate` on any hosted tier; a human reads the SQL. **Full entry:** assessment §3 TD-46.
