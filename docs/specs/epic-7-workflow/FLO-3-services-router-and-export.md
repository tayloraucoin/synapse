# FLO-3 — Services, the `workflow` router, and the export: the board read, ensure-defaults, set-firing, the move, start, archive and restore, groups and pins, views and columns, templates; the six tables in the account export

**Epic:** FLO — Workflow · **Phase 1** · Size: L
**Slice type:** The API for the whole feature area, and the one multi-step write in it. The risk class is *a move that leaves a gap or a duplicate in a cell's order*, *a role effect forgotten on one path* (firing surviving outside an active column; `closed_at` surviving outside a done one), and *an export that silently omits a table*. The move is the ticket inside the ticket.
**Vigil:** exercise the move on every path below and inspect both cells' `sort_order` after each; diff the export's tables against the schema.

**Status:** Complete (2026-10-03)

> **Vigil — full review of the move and the export.** State which of these were exercised on the local tier and what each cell's `sort_order` sequence was afterwards: (1) reorder inside a cell; (2) same lane, another column; (3) same column, another lane; (4) another lane and another column; (5) out of the active column while firing; (6) into the done column; (7) out of the done column; (8) each of 5–7 undone with `restoreFiringStartedAt`; (9) `toIndex` beyond the cell's length; (10) the same move sent twice. Then: every table under `packages/db/src/schema/workflow/` appears in `readAccountData`, and the JSON export of a seeded account contains a task's title.

---

## Outcome

Every operation the Workflow surface needs is a typed procedure on `workflow.*`, each a thin resolver over a service that runs under the caller's row-level security. Reading a board for the first time creates the person's two starter views. A task can be created, edited, fired and brought back, moved anywhere in one step, started from the queue, closed, archived and restored; groups can be made, ordered, pinned first for today, and archived; views, their columns and their roles can be arranged; a view's columns can be saved as a template. And from this ticket on, the account export contains all of it. **No screen calls any of this yet (FLO-6).**

## Why / intent

- **TD-40** — one router, nested sub-routers, the procedure list; services `(rls, userId, input)`, one file per verb-noun (rule 4); `to-view.ts` (rule 5); one `WorkflowRuleError` mapped to `BAD_REQUEST` with the code as the message, as `LinkRuleError` is.
- **TD-39** — `workflow.board({ viewId })` returns the whole board; *Closed earlier* is a second, lazy query.
- **TD-41** — `ensureWorkflowDefaults`: when the person has no view of any state, create *Working* and *Queue* from `WORKFLOW_STARTERS`.
- **TD-35** — the move: one transaction; dense order in both cells; the role effects.
- **TD-36** — `setFiring` is a set, idempotent, refused outside an active column.
- **TD-37** — pins by day key from `resolveDayKey(now, users.timezone, users.day_close_time)`.
- **TD-45** — the export includes the six tables. Launch-blocking.
- **UX §3.2–§3.8, WF-04, WF-05, Dialogs** — the behaviours the services implement, cited per procedure below.
- **Assessment §5** — the failure contract; its server-side rows are acceptance criteria here.
- **Ground truth (consumed):** `packages/api/src/routers/link.ts` and `services/library/links.ts` (the thin resolver, the rule error, the full-id-list reorder — reuse the pattern); `services/library/ensure-reason-set.ts` (the `ensureX` idiom); `services/day/today.ts` (how a service reads the person's zone and day close and calls `resolveDayKey`); `packages/utils/src/day/boundaries.ts` (`resolveDayKey`, `dayWindow`); `services/user/build-export.ts`.
- **FLO-1** — every input schema and view model. **FLO-2** — the tables.
- **What this slice is NOT (binding):** a hook, a page, a component; a toggle mutation; a stored or returned *next*; a job; a route handler; a second RLS bypass.

**Rulings this slice makes (labelled, logged):**

- **The board's tasks are every unarchived task in the view that is open, or was closed inside today's day window** (`dayWindow` for today's key). Tasks closed before it are `listClosed`'s (UX §3.8). Returned ordered so that array order within a `(groupId, columnId)` pair is `sort_order` (FLO-1's ruling). Logged.
- **Role effects, one function, called by every path that changes a task's column** (`move`, `start`, `column.remove`, `column.setRole`, `task.restore`): leaving an `active` column clears `firing_started_at` and does **not** set `last_returned_at` (the prompt did not return; the task left); entering a `done` column sets `closed_at` to now if null; leaving one clears it. Logged.
- **Undo is the same procedure with the prior place.** `move` and `restore` accept `restoreFiringStartedAt`; it is applied only when the destination column is `active`. There is no undo procedure. Logged.
- **`toIndex` is clamped** to the destination cell's length. Logged.
- **A task's `groupId` changing through `task.update` is a move** to the end of the new cell in the same column — one code path for order. Logged.
- **Archiving a group moves its tasks to the end of each *No group* cell, keeping their relative order, in the same transaction** (UX Dialogs). A restored group returns empty, at the end of the order. Logged.
- **Removing a column moves its archived tasks too.** `column_id` restricts (TD-34), and an archived task still references its column; `column.remove` reassigns every task, archived included, to `moveTasksTo` (or to the view's first remaining column for archived-only columns), so the delete can succeed and a later restore has a column to return to. Logged.
- **A new group's hue is the next of the eight** in the enum's order after the person's most recently created group, wrapping (UX §3.5). Logged.
- **Built-in templates are returned by `template.list` from constants** with `builtIn: true` and an id of the form `starter:<key>`; `rename` and `archive` refuse them with `built_in_template`. `view.create` takes `starterKey` or `templateId`, never both. Logged.
- **`view.list` returns the unarchived tabs in order, the archived ones, and `lastOpenedId`** — the unarchived view with the latest `last_opened_at`, else the first. Logged.
- **The dev seed gains a Workflow context** so every later ticket has a board to look at before FLO-7 can create one from the screen: the two starter views; three groups with invented names (*Northwind*, *Harbor*, *Internal* — never a real client's or person's name, here or in any story or fixture); nine tasks spread over *Working*'s cells, two of them firing, one returned with a note, one closed today, one closed last week; two tasks in *Queue*. It follows the existing modular seed's shape under `packages/db/src/seed/`. Logged.
- **`task.start` targets the first unarchived view in tab order that has an `active` column** (UX §3.7, §13 #W13), the end of the task's group's cell there; it returns the target view's tab so the toast can name it. Logged.

## Behaviour & states

**No surface.** Procedures, all `protectedProcedure`:

| Procedure | Does | Refuses with |
|---|---|---|
| `workflow.board` (query) | Ensure defaults; the view must be the caller's and unarchived; return `WorkflowBoardView` with today's `dayKey` and pins | `NOT_FOUND` |
| `workflow.view.list` (query) | Ensure defaults; tabs, archived, `lastOpenedId` | — |
| `workflow.view.create` | New view at the end with columns copied from a starter or a saved template (W10) | `NOT_FOUND` (template) |
| `workflow.view.rename` · `reorder` · `markOpened` | Name; full-id-list order; stamp `last_opened_at` | `incomplete_reorder` |
| `workflow.view.archive` · `restore` | Archive keeps tasks (UX Dialogs); restore returns it to the end | `last_view` |
| `workflow.column.save` | Create at the end, or rename | `too_many_columns` (at `WORKFLOW_COLUMNS_MAX`) |
| `workflow.column.reorder` | Full id list for one view | `incomplete_reorder` |
| `workflow.column.setRole` | Set or clear a role; setting clears it from any other column in the view in the same transaction; taking `active` off applies the role effects to its tasks | — |
| `workflow.column.remove` | Empty: delete. Holding tasks: move them to `moveTasksTo`, appended per cell in order, with role effects; then delete | `last_column` · `column_has_tasks` (no `moveTasksTo`) |
| `workflow.group.create` · `rename` · `setHue` · `setCollapsed` · `reorder` | As named; create at the end | `incomplete_reorder` |
| `workflow.group.archive` · `restore` | Above | — |
| `workflow.group.pinToday` · `unpinToday` | Upsert today's pin row: pin puts the id first (removing an earlier occurrence); unpin removes it | — |
| `workflow.task.create` | End of the cell | — |
| `workflow.task.update` | Title, note, group | — |
| `workflow.task.move` | TD-35 | — |
| `workflow.task.setFiring` | TD-36 | `not_in_active_column` |
| `workflow.task.start` | Above | `no_active_view` |
| `workflow.task.archive` · `restore` | Archive closes the gap and clears firing. Restore: end of its cell (or `toIndex`); its column's view archived → the first unarchived view's first column (UX WF-05) | — |
| `workflow.task.listClosed` (query) | Closed before today's window, newest first, 50 a page, cursor | — |
| `workflow.task.listArchived` (query) | Archived tasks (with group name and `archivedAt`) and archived groups | — |
| `workflow.template.list` (query) · `save` · `rename` · `archive` | Above; `save` snapshots the view's column names and roles | `built_in_template` |

Every id in every input that is not the caller's — a task, a column, a group, a view, a template, a `moveTasksTo`, a `toColumnId`, a `toGroupId` — is `NOT_FOUND`.

**States (exhaustive, a task):** open · firing · back (open, `last_returned_at` set) · closed · archived. Transitions only through the procedures above; the role-effects function is the single place firing and closed are cleared by movement.

**Failure / edge states:** `setFiring(true)` on a firing task, or `(false)` on one that is not → no write, returns the task · a move to the place a task already is → no write · `ensureWorkflowDefaults` called concurrently by two requests → at most one pair of views (do it inside one transaction, re-reading the count) · `pinToday` for an archived group → `NOT_FOUND` · a pin row holding an id whose group was archived later → left as is; `orderGroupsForDay` ignores it · the person's day close passes mid-session → the next `board` read computes a new key and returns no pins.

## Non-negotiables (this slice)

- **Every read and write through `ctx.rls.execute()`.** The singleton `db` is not imported. No `buildServiceRoleAuthContext`.
- **A move is one transaction, and both cells are dense (0…n−1) when it commits.**
- **Firing is set, never toggled.** No procedure inverts state.
- ***Next* is not computed, stored, or returned here.**
- **Another person's id is `NOT_FOUND`, never `FORBIDDEN`.**
- **A title or a note never appears in a log line or an error message.** Rule errors carry a code.
- **The export reads all six tables**, through `getTableColumns`, with nothing transcribed.
- **Resolvers validate, call one service, and return.**

## Data & AI

**Schema changes: none.**

**Tables:** `workflow_groups`, `workflow_views`, `workflow_columns`, `workflow_tasks`, `workflow_templates`, `workflow_day_pins` (read, write — all under RLS); `users` (read: `timezone`, `day_close_time`).

**Placement:** `packages/api/src/routers/workflow.ts` (+ `root.ts`); `packages/api/src/services/workflow/{get-board,list-views,ensure-defaults,save-view,archive-view,save-columns,set-column-role,remove-column,save-group,reorder-groups,archive-group,pin-group-today,save-task,move-task,set-firing,start-task,archive-task,list-closed-tasks,list-archived,save-template,apply-role-effects,rule-error,to-view}.ts`; `packages/api/src/services/user/build-export.ts`; `packages/db/src/seed/` (one new context file, registered in the seed's orchestrator). Rules 3, 4, 5; Mason, TD-40, TD-45.

**tRPC / validators:** the procedures above; inputs from `packages/validators/src/workflow.ts` (FLO-1). A schema FLO-1 did not ship is added there, not inline.

**AI notes:** **None.**

## Accessibility

**None — no surface in this slice.**

## Acceptance criteria (observable — the local tier with a seeded account, through the server caller or the tRPC panel; state if no local database was available and which criteria were therefore read rather than run)

1. For an account with no views, `workflow.view.list` returns two tabs, *Working* then *Queue*; *Working* has four columns with `active` first and `done` last; calling it again creates nothing.
2. `workflow.board` for *Working* returns columns in order, groups in usual order, `pinnedGroupIds`, `dayKey`, and tasks such that within any `(groupId, columnId)` pair their array order equals their `sort_order`.
3. After each of the Vigil callout's move paths 1–4, both affected cells' `sort_order` values read 0, 1, 2, … with no gap and no duplicate. *(Vigil.)*
4. Moving a firing task out of the active column leaves `firing_started_at` null and `last_returned_at` unchanged; moving it back with `restoreFiringStartedAt` restores the original timestamp exactly. *(Vigil.)*
5. Moving a task into the done column sets `closed_at`; moving it out clears it.
6. `move` with `toIndex: 999` places the task last; the same `move` sent twice leaves the same rows as once. *(Vigil.)*
7. `setFiring({ firing: true })` twice leaves the first `firing_started_at`; `setFiring({ firing: false })` on a task that is not firing writes nothing; `setFiring` on a task in a non-active column fails `BAD_REQUEST` `not_in_active_column`.
8. `column.setRole` to `active` on a second column leaves exactly one `active` column in the view; taking `active` off a column clears firing on every task in it.
9. `column.remove` on a column with tasks and no `moveTasksTo` fails `column_has_tasks`; with it, the tasks (archived ones included) are in the destination and the column row is gone; on the view's last column it fails `last_column`.
10. `view.archive` on the last unarchived view fails `last_view`.
11. `group.archive` on a group with three tasks in one column leaves those tasks with `group_id` null, at the end of that column's *No group* cell, in their original relative order.
12. `group.pinToday(a)` then `pinToday(b)` yields `pinnedGroupIds` `[b, a]`; `unpinToday(b)` yields `[a]`; a `board` read with the clock past the person's next day close returns `[]` and the earlier row still exists.
13. `task.start` on a *Queue* task moves it to *Working*'s active column, at the end of its group's cell, and returns *Working*'s tab; with no view that has an active column it fails `no_active_view`.
14. `task.listClosed` returns tasks closed before today's day window, newest first, and none closed today; `board` returns the ones closed today and none earlier.
15. `template.save` then `template.list` returns the two built-ins (`builtIn: true`) followed by the saved one with the view's column names and roles; `template.archive` on a built-in id fails `built_in_template`.
16. With a second seeded account's ids substituted into any input — a task id, a `toColumnId`, a `moveTasksTo`, a view id — the call fails `NOT_FOUND`, and no row of either account changes.
17. `grep -rn "from \"@syn/db\"" packages/api/src/services/workflow` shows no import of the singleton client's name; every query in the folder is inside an `rls.execute` callback.
18. The JSON from `readAccountData` for the seeded account contains all six Workflow tables with every column `getTableColumns` reports, and `EXPORT_FILE_NAMES` contains `workflow_tasks.csv` and `workflow_groups.csv`. *(Vigil.)*
19. No string under `packages/api/src/services/workflow` or `routers/workflow.ts` interpolates a `title`, `note` or `name` into a log call or an error message.
20. The seed's Workflow context type-checks and is registered; if the seed was run on the local tier (it prompts by design — say whether it was), `workflow.board` for *Working* returns the three invented groups and the seeded tasks. No seed file, story or fixture in this epic contains a real client's or person's name.
21. `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` pass (four separate commands).

## Likely-relevant technical notes (ADVISORY — dev decides)

- The move, in one `rls.execute`: load the task; resolve and verify the destination column and group as the caller's; if the cell is unchanged, splice within one ordered id list and rewrite; otherwise remove from the source list and rewrite it, insert into the destination list at the clamped index and rewrite it, then update the task's `column_id`, `view_id`, `group_id` and apply role effects. Rewriting a cell is the loop `reorderLinks` already uses.
- A cell is `where view_id = ? and column_id = ? and group_id is not distinct from ? and archived_at is null`. Archived tasks keep a `sort_order` but are outside every cell.
- `ensureWorkflowDefaults` inside `getBoard` cannot be the first thing a `board({ viewId })` call needs — a caller with no views has no view id. It is `view.list` that a fresh account calls first (the `/workflow` page); `board` still calls ensure so a direct call is never left without defaults.
- `build-export.ts`: six more `own(table, table.userId)` reads, six more `AccountData` keys, and two CSV names; the file's own header comment explains why nothing is transcribed.
- The criterion-17 grep is a proxy for "no unpoliced query here": write comments in that folder so they do not quote the package's client export.

## Dev's call

The file split within `services/workflow/` (the list above is the expected set, not a mandate) · whether list reorders share one generic helper · the cursor's shape for `listClosed` · whether `view.list` and `template.list` share a read.

## Out of scope

- **The optimistic client, the cache patches, the undo toasts** — FLO-6, FLO-7.
- **Computing *next*** — FLO-1's function, called by FLO-6.
- **Detection from Claude Code** — not built; `setFiring`'s signature is the seam (TD-36).
- **A firing history** — not built.
- **Applying `0011` to a hosted tier** — Taylor.

## Depends on

- **FLO-2** — the six tables. Complete in `PROGRESS.md`.

## Recommended execution

**Opus.** The move is small and its edge cases are the ticket: a cheaper model ships paths 1 and 2, and corrupts order on path 4 or leaves a task firing in *Finish later*.

---

### Kickoff (paste into the session)

> Build **FLO-3 — Services, the `workflow` router, and the export** (attached spec). Model: **Opus**. **A move is one transaction and both cells are dense when it commits; firing is set, never toggled; the export leaves nothing out.**
> Attach/read first, in order: this spec · `docs/ux/workflow-ux-spec-v0.1.md` §3.2–§3.8, §4 WF-04, WF-05, Dialogs, §11 · `01-technology-assessment.md` §3 (TD-35…TD-41, TD-45), §5 · `docs/ai-guides/trpc-foundation-patterns.md` · root `AGENTS.md` · `docs/specs/README.md` § Placement rules 3–5 · `packages/api/src/routers/link.ts`, `services/library/links.ts`, `services/library/ensure-reason-set.ts`, `services/day/today.ts`, `services/user/build-export.ts` (reuse, don't fork) · FLO-1, FLO-2 · `packages/db/SCHEMA_REFERENCE.md` (workflow) · this track's `README.md`, `DEVIATIONS.md` + `TECHNICAL-DECISIONS.md`.
> Thin resolvers over services under `ctx.rls.execute()`. One role-effects function for every path that changes a column. Another person's id is `NOT_FOUND`. Titles and notes are never logged. Exercise the ten paths in the Vigil callout and state the order values you saw. Close in three places; log departures in `DEVIATIONS.md`. Run `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` as separate commands.
