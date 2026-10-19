# Epic 7 — Workflow — Technology Assessment

**Author:** Mason · **Date:** 2026-10-03
**Status:** Draft for Taylor's read. Stage 3 of the spec system ([`../spec-system-guide.md`](../spec-system-guide.md) §2): the architecture pass, written before the build order and before any ticket.
**Reads:** [`docs/ux/workflow-ux-spec-v0.1.md`](../../ux/workflow-ux-spec-v0.1.md) (Vesper, 2026-10-03; rulings W1–W19, open items #W1–#W15), cited as `UX §n` and `W#`. Taylor's stakeholder notes of the same day are cited through it as `N§n`.
**Builds inside:** [`../README.md`](../README.md) § Placement rules (cited as *rule n*), [`codebase-conventions.md`](../../architecture/codebase-conventions.md), the domain guides, and every prior track's `TECHNICAL-DECISIONS.md` (TD-1…TD-32, consumed, not reopened).

**What this file is, and is not.** It is the assessment of what has to be built for Workflow and the architectural decisions that shape it. It is not the track's process: the kickoff contract, the build order, the logs and the tickets are Reeve's, cut from this and the UX spec later the same day ([`README.md`](README.md)). The decisions below are numbered **TD-33…TD-46**, continuing the global sequence. **Their context, options, consequences and revisit triggers live here; [`TECHNICAL-DECISIONS.md`](TECHNICAL-DECISIONS.md) logs each as a statement and points back, and records the two amendments made at authoring (the hue enum; the formatter's name).** Where §6's slices A–J and the tickets FLO-1…FLO-10 differ, the tickets win.

**Verification status.** Nothing was built. Every claim about existing code below was read on disk on 2026-10-03 at `2da1cdf`; paths are exact. No command was run because nothing changed that a command could check.

---

## 1. Verdict

Workflow fits the existing architecture without a new package, a new dependency, a new transport rail, or a boundary change. It is one new schema domain, one new router with its services, one pure-logic folder, seven `@syn/ui` components, one route segment, and five small edits to the shell. It adds no AI, no outbound request, no notification, no scheduled job, and no Realtime subscription.

Three things carry the risk, in this order:

1. **The schema** — six tables and migration `0011`. A one-way door, and it queues behind `0009` and `0010`, which are authored and applied nowhere.
2. **The move** — one task changing column, lane and position in one step, with dense ordering in two cells and an undo that restores firing. This is the only multi-step write, and the only place a careless implementation corrupts order.
3. **The cross-cell drag** — the one piece of UI with no precedent in `@syn/ui`. It is deliberately the last thing built and gates nothing (W12).

Everything else is precedented and reversible.

---

## 2. What exists and is consumed, never rebuilt

| Need | What is on disk | Path |
|---|---|---|
| The rail, the tab bar, one nav list | `NAV_ITEMS`, `tabForPath`, `Rail`, `TabBar` | `apps/web/app/(shell)/_components/nav-items.ts` · `rail.tsx` · `tab-bar.tsx` |
| The auth gate and the entry tree | `ShellLayout`, `resolveEntry` (pure) | `apps/web/app/(shell)/layout.tsx` · `apps/web/lib/entry/resolve-entry.ts` |
| The page structure and its widths | `PageFrame` → `ScreenFrame`, `width: "text" \| "canvas"` | `apps/web/components/page-frame/page-frame.tsx` · `packages/ui/src/composed/layout/screen-frame/` |
| The one keyboard listener | `useGlobalShortcuts`, `ShortcutsHost`, `SHORTCUTS` | `apps/web/lib/hooks/use-global-shortcuts.ts` · `apps/web/components/shortcuts-host/` · `apps/web/lib/keyboard/shortcuts.ts` |
| Roving focus within a list | `useRovingFocus` | `apps/web/lib/hooks/use-roving-focus.ts` |
| A clock on the minute, paused when hidden | `useNow` | `apps/web/lib/hooks/use-now.ts` |
| URL-state sheets | `useSheet` (nuqs), `ResponsiveSheet` | `apps/web/lib/hooks/use-sheet.ts` · `@syn/ui` |
| Optimistic write, patch-then-mutate | `toggleDone` in `useDayList` | `apps/web/components/day-list/use-day-list.ts` |
| Undo | `toastUndo`, `UNDO_SHORT_MS`, `useUndoWindow` | `@syn/ui` toaster · `@syn/constants` motion · `apps/web/lib/hooks/use-undo-window.ts` |
| Offline | `useOnline`, `<StatusLine variant="offline" placement="inline">` | `apps/web/lib/hooks/use-online.ts` · `@syn/ui` |
| Reorder one vertical list | `SortableList` (dnd-kit; handle, `Alt`+arrows, live text) | `packages/ui/src/composed/control/sortable-list/` |
| dnd-kit, owned by `@syn/ui` alone | `RESTRICTED_EXTERNAL` `@dnd-kit/*` → `ui` | `packages/config/eslint/boundaries.js` |
| Owner-private policies | `ownerPrivateCrudPolicies` | `packages/db/src/schema/rls/standard-policies.ts` |
| Dense order rewritten from a full id list | `reorderLinks`, `LinkRuleError("incomplete_reorder")` | `packages/api/src/services/library/links.ts` |
| The thin-resolver pattern with a rule-error map | `linkRouter` | `packages/api/src/routers/link.ts` |
| The person's day boundary | `resolveDayKey(now, timeZone, dayCloseTime)` | `packages/utils/src/day/boundaries.ts` |
| The whole-account export | `readAccountData`, `EXPORT_FILE_NAMES` | `packages/api/src/services/user/build-export.ts` |
| Account deletion | `auth.admin.deleteUser`, cascading every table through `users` | `packages/api/src/services/user/delete-account.ts` |
| The reduced-motion floor | duration tokens → 0; a global `0ms !important` floor; `usePrefersReducedMotion` | `packages/config/tailwind/preset.css` · `packages/ui/src/styles/globals.css` · `packages/ui/src/hooks/` |

Two facts found in that reading shape decisions below. `useGlobalShortcuts` already returns early on any modifier, so the board's `Alt`+arrow keys cannot collide with it. And **no `@keyframes` exists anywhere in the repository** — every animation is `tw-animate-css` — so the firing mark's breath is the first one authored here (TD-42).

---

## 3. Decisions

Each is stated as a decision, with the options weighed, what it costs, and when to reopen it.

### TD-33 · Workflow is one schema domain, `workflow/`, and every table carries the `workflow_` prefix

**Context.** The UX nouns are *task*, *group*, *view*, *column*, *template*. Three of them are already taken in this codebase or its vocabulary: `templates` is a table (block templates); *Task* is a habit type (`habits.type`, official §10.2); *view* is the suffix of every view model in `@syn/types`. Vesper ruled the on-screen word stays *Task* and the code noun is *workflow task* (W17).
**Options.** A — bare names in a new domain folder (`tasks`, `groups`, `views`); B — prefix everything `workflow_`; C — rename the concept in code (`threads`, `boards`).
**Decision.** B. Schema domain `packages/db/src/schema/workflow/`; tables `workflow_groups`, `workflow_views`, `workflow_columns`, `workflow_tasks`, `workflow_templates`, `workflow_day_pins`. TypeScript: `workflowGroups`, `WorkflowTask`, `WorkflowBoardView`. Rule 1's domain list gains `workflow/`.
**Consequences.** Longer names; zero ambiguity in a grep, in the export, and for an agent that has only seen the habit day. C would put a word on disk that appears on no screen.
**Revisit trigger.** None foreseen.

### TD-34 · Six tables; columns are rows, saved templates are a snapshot

**Context.** UX §11 states the data as needs; W10 rules a view owns its columns and a template is only where it started.
**Decision.** The shape, with the convention's column order applied at authoring:

| Table | Holds | Notable columns |
|---|---|---|
| `workflow_groups` | A lane | `name` text · `hue` (the existing category-hue key set — reuse its enum or its `@syn/types` union; confirm which at build, do not invent a second list) · `sort_order` smallint · `collapsed` boolean default false · `archived_at` |
| `workflow_views` | A board | `name` text · `sort_order` smallint · `last_opened_at` timestamptz null · `archived_at` |
| `workflow_columns` | A state in one view | `name` text · `role` enum `workflow_column_role` (`active`, `done`) **nullable** · `sort_order` smallint · FK `view_id` → views, cascade |
| `workflow_tasks` | A task | `title` text · `note` text null · `sort_order` smallint · `firing_started_at` timestamptz null · `last_returned_at` timestamptz null · `closed_at` timestamptz null · `archived_at` · FK `column_id` → columns, **restrict** · FK `group_id` → groups, **set null** · FK `view_id` → views, cascade |
| `workflow_templates` | A saved arrangement | `name` text · `columns` jsonb (`WorkflowTemplateColumn[]`: `{ name, role }`, shape comment per drizzle-conventions §3c) · `archived_at` |
| `workflow_day_pins` | *First today*, for one day | `day_key` date · `group_ids` jsonb (`string[]`, pin order, newest first) · unique `(user_id, day_key)` |

Every table: `id`, `created_at`, `updated_at`, a denormalised `user_id` → `users.id` cascade, an index on `user_id`, and `ownerPrivateCrudPolicies` (rule 1). No other policy shape.

Constraints the database holds, not the application: a partial unique index on `workflow_columns (view_id) where role = 'active'`, and the same for `'done'` — W11's *at most one of each* is a property, not a promise. `workflow_tasks.view_id` is denormalised from the column for the board read and the cascade; the service is the only writer of both and writes them together.

**Options weighed.** Columns as jsonb on the view (the notes' §8 shape) — rejected: tasks reference a column, and a jsonb id cannot be a foreign key, so a removed column would orphan tasks silently. Templates as rows-of-rows — rejected: nothing references a template's columns after a view is made (W10), so a snapshot is the honest shape. A live `template_id` on the view (notes §8) — rejected with W10.
**The notes' `isFiring`** is not stored: firing is `firing_started_at IS NOT NULL` (UX §11; one fact, one home). **The notes' `DailyPriorityOverride.groupOrder`** becomes pins only (UX §11): a full order per date has to be reconciled whenever a group is created or archived that day; a pin list does not.
**Consequences.** `column_id` restrict means removing a column must move its tasks first — which is exactly WF-04's dialog, so the constraint and the screen agree. `group_id` set-null means an archived-then-hard-removed group could never strand a task; in practice groups are archived, not deleted (W18), and the archive service moves tasks to *No group* explicitly.
**Revisit trigger.** A second person on a board (the notes' non-goal) reopens every `user_id`.

### TD-35 · Order is the house's dense `smallint`, scoped per cell, rewritten by the server

**Context.** Tasks are ordered inside a cell (one group in one column); groups, views and columns each in one list. The codebase has exactly one ordering pattern: dense `sort_order` 0…n−1 rewritten from the full id list, refusing an incomplete list (`reorderLinks`).
**Options.** A — the house pattern; B — fractional or lexorank keys (one row written per move).
**Decision.** A. Group, view and column reorders take the full ordered id list, exactly as `reorderLinks`. A task move is one service call — `moveWorkflowTask(rls, userId, { id, toColumnId, toGroupId, toIndex })` — that, in one `rls.execute` transaction, verifies the column and group are the caller's (absent → `NOT_FOUND`), closes the gap in the source cell, opens one in the destination, writes the task's `column_id`, `view_id`, `group_id`, `sort_order`, and applies the role effects: leaving an `active` column clears `firing_started_at`; entering a `done` column sets `closed_at`; leaving one clears it. It returns the board.
**Consequences.** A move writes O(cell) rows. One person, cells of a handful of tasks: irrelevant. In exchange there is no rebalancing code, no second ordering idiom for agents to copy, and order is always inspectable. B is the right answer for a multi-writer board and the wrong one here.
**Revisit trigger.** A cell routinely above ~200 tasks, or concurrent writers.

### TD-36 · Firing is set, never toggled; and it is two timestamps

**Decision.** `workflow.task.setFiring({ id, firing: boolean, at: Date })`. `firing: true` sets `firing_started_at = at` only if it is null; `firing: false` sets `last_returned_at = at` and nulls `firing_started_at` only if it is set. Both are no-ops otherwise and both return the task. A task not in an `active` column refuses with a rule error. The client sends its own `at`, as `item.setDone` does, so an optimistic row and the stored row agree to the millisecond.
**Options weighed.** A `toggle` mutation — rejected: a double-submit or a retry inverts the state, and this is the most-pressed control on the surface.
**Consequences.** Idempotent under double-tap, retry, and two devices. Undo of a move restores firing by calling the move with the prior state carried in the undo payload (TD-39), not by a second concept.
**Not built, recorded:** no firing history table. UX §12 defers *how long prompts take*; a `workflow_firing_sessions` log is the seam if it is ever wanted, and adding it later loses nothing but the history not yet recorded.
**Revisit trigger.** Detection from Claude Code (UX §12): that arrives as a third-party-inbound route handler with its own credential — conventions §3.5's enumerated exception — calling this same service. The seam is the service's signature, which is why it is `set`, takes `at`, and lives in `@syn/api`.

### TD-37 · *First today* is keyed by the person's day key; expiry is derived, and nothing runs

**Decision.** `workflow_day_pins` holds one row per `(user_id, day_key)`. The board read computes today's key with `resolveDayKey(now, users.timezone, users.day_close_time)` and reads that row or none. A new day has a new key, so yesterday's pins are simply not read. No scheduled job, no cleanup; a stale row is a few bytes and is in the export as a record of what was pinned.
**Options weighed.** A column on the group (`first_today_until`) — rejected: two groups pinned need an order between them, and expiry-by-timestamp drifts when the person changes their day close. A `SCHEDULED_JOBS` entry to clear pins — rejected: a job for something a key already expresses.
**Consequences.** *First today* follows the person's own day close (#W14), consistently with every other "today" in the product, and survives a time-zone change the way days do.
**Revisit trigger.** #W1 (a weekly rule): that is a `weekday` column on a rule table, resolved into the same order function — additive.

### TD-38 · *Next* and today's order are pure functions in `@syn/utils/workflow/`

**Decision.** `packages/utils/src/workflow/`: `orderGroupsForDay(groups, pinnedIds)` and `resolveNextTask(lanesInOrder, activeColumnId)` (W8), plus `formatElapsed` if the existing duration formatter in `time.ts` does not already give *4 min* / *1 h 12 min* (check first; do not add a second). No I/O, no clock read inside — `now` is an argument. Exported from the `@syn/utils` barrel.
**Why here (rule 6).** *Next* must move the instant the toggle is pressed, before the server answers. The client re-runs the same function over its patched cache; the server never stores or returns *next*. One implementation, two callers, and the Expo app gets it unchanged.
**Consequences.** There is no `is_next` anywhere to go stale. The cost is that the client must hold the whole active column — it does (TD-39).

### TD-39 · One board read per view; optimistic writes patch that one cache entry

**Decision.** `workflow.board({ viewId })` returns the whole board: the view, its columns, every unarchived group in usual order with `collapsed`, today's pinned ids, and the view's unarchived tasks (closed-before-today excluded; see below). `workflow.view.list()` returns the tabs. Every mutation on the board follows the `useDayList` pattern: guard with an in-flight set, patch `utils.workflow.board.setData`, call `mutate`, revert and show the save-failure line on error, invalidate on settle. Undo payloads (`toastUndo`, `UNDO_SHORT_MS`) carry the task's prior `{ columnId, groupId, index, firingStartedAt }`.
*Closed earlier* (UX §3.8) is a second, lazy query — `workflow.task.listClosed({ viewId, cursor })` — fetched when the section is opened, so the board read stays bounded by what is open.
**Options weighed.** Per-lane or per-column queries — rejected: a move would straddle two cache entries and *next* would need all of them anyway.
**Client state (rule 13).** Server data in TanStack Query; sheets and the compact column in nuqs (`?sheet=`, `?id=`, `?col=`); the drag's lifted state local to `Board`. **No Zustand store**: the elapsed time re-renders on the minute through `useNow`, which is human frequency.
**Not Realtime.** One person. A second device sees changes on refetch (window focus). A board that live-syncs is a `dualContext` policy rewrite and a publication migration for no user who exists.
**Consequences.** One cache key to reason about. The board payload grows with open tasks; it is a person's own open work and stays small.

### TD-40 · One router, `workflow`, with nested sub-routers; one service folder

**Decision.** `packages/api/src/routers/workflow.ts` exports `workflowRouter`, registered in `root.ts`:

```
workflow.board                      query
workflow.view.{list, create, rename, reorder, archive, restore, markOpened}
workflow.column.{save, reorder, setRole, remove}        remove takes moveTasksTo?
workflow.group.{create, rename, setHue, setCollapsed, reorder, archive, restore, pinToday, unpinToday}
workflow.task.{create, update, move, setFiring, start, archive, restore, listClosed, listArchived}
workflow.template.{list, save, rename, archive}
```

Services in `packages/api/src/services/workflow/` (rule 4), one file per verb-noun, each `(rls, userId, input)`: `get-board.ts`, `ensure-defaults.ts`, `save-task.ts`, `move-task.ts`, `set-firing.ts`, `start-task.ts`, `archive-task.ts`, `save-group.ts`, `reorder-groups.ts`, `pin-group-today.ts`, `archive-group.ts`, `save-view.ts`, `save-columns.ts`, `remove-column.ts`, `save-template.ts`, `to-view.ts` (rule 5). One `WorkflowRuleError` with codes, mapped to `BAD_REQUEST` at the router as `LinkRuleError` is.
**Options weighed.** Five flat routers (`workflowTask`, …) — rejected: rule 3 is one router per domain, and five top-level names for one feature area clutter `root.ts`.
**Validators** (rule 7): `packages/validators/src/workflow.ts`, one schema per input, the same schema for the form and the procedure, error messages the UX §7 strings verbatim (*A task needs a title.*).
**Types:** `packages/types/src/domain/workflow.ts` — `WorkflowTaskView`, `WorkflowGroupView`, `WorkflowColumnView`, `WorkflowBoardView`, `WorkflowTemplateColumn`, `WorkflowColumnRole`. They are in `@syn/types` from the start because `@syn/ui`'s `TaskRow`, `LaneHeader` and `Board` take them (rule 5's promotion condition is met on day one).
**Constants** (rule 8): `packages/constants/src/workflow-starters.ts` — the two built-in templates (*Working*, *Queue*) with their columns and roles; `limits.ts` gains `WORKFLOW_TITLE_MAX = 120`, `WORKFLOW_NOTE_MAX = 2000`, `WORKFLOW_NAME_MAX = 40`, `WORKFLOW_COLUMNS_MAX = 5`. The starter names are seed data in the sense `default-reasons.ts` is, not app-voice prose; they carry no emoji, so the lint's exception list is untouched.

### TD-41 · The two starter views are ensured on first read, not migrated in

**Decision.** `ensureWorkflowDefaults(rls, userId)` runs inside `getBoard` / `view.list` when the person has no view, archived or not, and creates *Working* and *Queue* from `WORKFLOW_STARTERS`. The `ensureX` idiom, as `ensure-reason-set.ts`. Built-in templates are constants and never rows; `workflow_templates` holds only what the person saved.
**Options weighed.** Seed in the migration or a signup trigger — rejected: migrations do not write user data here, and existing accounts would need a backfill.
**Consequences.** A person who archives both views and then every view cannot exist: the last view cannot be archived (UX Dialogs), enforced in the service, so *ensure* fires exactly once per account.

### TD-42 · The breath is one keyframe in `@syn/ui`'s stylesheet, applied `motion-safe` only

**Context.** UX §3.3: a 10px mark, opacity 1 → 0.35 → 1 over 2400ms, continuous; still under reduced motion. No `@keyframes` exists in the repository, and `globals.css` forces `animation-duration: 0ms !important` under reduce.
**Decision.** `--dur-breathe: 2400ms` in `packages/config/tailwind/preset.css` beside the two duration tokens (it is a token; it does **not** collapse to 0 under reduce — see next sentence), and `@keyframes syn-breathe` with its `animate-breathe` utility in `packages/ui/src/styles/globals.css`. `FiringMark` applies it as `motion-safe:animate-breathe`.
**The trap, named.** An infinite animation forced to `0ms` does not stop cleanly; it resolves to a keyframe state, and which one is the browser's business. If the class were applied unconditionally, reduced-motion users could get a mark frozen at 0.35 opacity — the dim end, reading as *off*. `motion-safe:` means the animation is never attached under reduce and the mark sits at its resting opacity of 1. This is an acceptance criterion, not a note.
**Options weighed.** `animate-pulse` from `tw-animate-css` (what `COMMITTING_PULSE` uses) — rejected: it is 2s to 0.5 with a different curve, and reusing it would make *a write is in flight* and *a prompt is running* the same visual word.
**Consequences.** One long animation in the product, on a 10px compositor-only property. Cheap.

### TD-43 · The cross-cell drag is a new `Board` composite on dnd-kit; `SortableList` is not extended; it ships last

**Context.** `SortableList` is one vertical list: no cross-container moves, no `DragOverlay`. The board needs a row to move between any two cells and lanes to reorder among themselves. dnd-kit may be imported only inside `@syn/ui`.
**Decision.** `packages/ui/src/composed/layout/board/` — `Board`, owning one `DndContext`, a `SortableContext` per cell and one for the lanes (discriminated by drag type), a `DragOverlay`, the pointer / touch (300ms long-press, `DRAG_LONG_PRESS_MS`) / keyboard sensors and the polite live text, matching `SortableList`'s lift look and announcements. It takes view models and emits intents — `onMoveTask({ id, toColumnId, toGroupId, toIndex })`, `onReorderGroups(ids)` — and performs nothing (the `DragLayer` contract: gesture and preview only). `SortableList` stays as it is and is reused unchanged for WF-04's column list.
**Sequencing (W12).** The board is first built with **no drag**: the row menu's *Move to*, the board's own `Alt`+arrow handling, and the lane menu's *Move up* / *Move down* all call the same `move` and `reorder` mutations the drag will. Drag is a later slice over a finished board and **gates nothing**.
**Options weighed.** Extend `SortableList` with containers — rejected: seven callers depend on its single-list contract. A second DnD library — rejected outright; the pin and the boundary rule exist to prevent exactly that.
**Risk.** Nested sortables (lanes containing cells) in one `DndContext` is supported by dnd-kit but is the least-precedented code in the epic. It gets a Storybook story with the full matrix before any app code uses it, and a Vigil pass on touch and keyboard.
**Revisit trigger.** If nested sortables prove unstable on touch: lanes keep *Move up* / *Move down* only, and the drag is rows-only. The UX survives that unchanged.

### TD-44 · The shell changes are five edits, each in the file that already owns the fact

| Change | File | What |
|---|---|---|
| The fourth peer (W1) | `apps/web/app/(shell)/_components/nav-items.ts` | `NavTab` gains `"workflow"`; `NAV_ITEMS` gains the row before Settings; `tabForPath` gains `/workflow`, checked before the `endsWith("/schedule")` rule |
| Routes | `apps/web/lib/routes.ts` | `workflowRoute()`, `workflowViewRoute(viewId, { column? })`; rows added to `apps/web/AGENTS.md`'s route map and its **Scope** paragraph |
| The orient exemption (W16) | `apps/web/lib/entry/resolve-entry.ts` | The orient branch is skipped when `intendedRoute` is a Workflow path. Decided inside the pure function, where the tree's rules already live — not as a second condition in the layout |
| Full-width content (UX §3.1) | `packages/ui/src/composed/layout/screen-frame/` and `PageFrame` | A third width, `"board"`: no max-width, the same 32px padding. `ScreenFrame`'s header comment says *two widths only*; this amends it and its story |
| Keys | `apps/web/lib/hooks/use-global-shortcuts.ts`, `apps/web/lib/keyboard/shortcuts.ts`, `shortcuts-host.tsx` | `4` navigates; `n` on a Workflow path calls a new `onNewWorkflowTask` handler; `SHORTCUTS` gains the Workflow group for About and the `?` dialog |

**Board-local keys are not global.** `↑ ↓ ← →`, `Space`, `Enter`, `g`, `[`, `]` and `Alt`+arrows are handled by the board's own `keydown` on its container with roving focus — the pattern the List uses — because they mean something only when a row has focus. `g` and `[` `]` work from anywhere on the board, so the handler sits on the board region, not on a row. The global listener already ignores modified keys, so `Alt`+arrows cannot double-fire.
**`n` crosses the chrome-to-page seam the way it already does:** the host navigates to `?sheet=`-style URL state. For Workflow the equivalent is a `?add=1` param the board reads and clears, opening the add row; the host holds no board state.
**The view id in the URL is the row's uuid.** A slug would need its own uniqueness rule and a rename story for no reader but the person.
**The last-opened view** is `workflow_views.last_opened_at`, written by `view.markOpened` when a view renders; `/workflow` is a Server Component that reads `view.list` and redirects. Server state, so it follows the person across devices; no cookie, no storage key.
**The tab title** (#W12) is a small client leaf beside `TimerTitle` in the shell providers, or local to the board page — dev's call; it must not fight `TimerTitle` when a habit timer is running. Recommended: the running timer wins, as it is the older promise.

### TD-45 · The export includes Workflow, and that is launch-blocking for the epic

**Context.** `build-export.ts` promises *nothing is left out* and reads every table by an explicit list (twenty today). The UX's trust test routes this here.
**Decision.** The six tables join `readAccountData` and `AccountData`; the JSON graph carries them; `EXPORT_FILE_NAMES` gains `workflow_tasks.csv` and `workflow_groups.csv` (the two a person would open in a spreadsheet — the rest are in the JSON). Columns still come from `getTableColumns`, so nothing is transcribed. Deletion needs no change: every table cascades from `users`.
**Why it is a condition, not a feature.** The export screen says the file is complete. From the moment a person can type a client's name into a task, that sentence is false until this lands. It ships in the same slice as the first surface a person can write to, or before it.
**Also noted.** A task's title and note are the person's client work. They never pass through `@syn/observability`: the router logs codes, never values, as everywhere.

### TD-46 · One additive migration, `0011_workflow`; authored and verified locally; applied by Taylor, after `0009` and `0010`

**Decision.** `0011_workflow.sql`: the enum, six tables, their indexes, the two partial unique indexes, the policies — generated by `yarn db:generate` (interactive) or hand-authored with its journal entry, per `db-and-rls-authoring.md`. Purely additive; it touches no existing table. `yarn db:schema-reference` after. **An agent stops before `db:migrate` on any hosted tier.**
**The queue.** `_journal.json` is at `0010`; `0009` and `0010` are authored and, as of the Epic 6 close, applied to no hosted tier. `0011` does not depend on either's contents, but migrations apply in order, so Workflow cannot reach staging until Taylor has applied `0004`–`0010`. That is the one external dependency of this epic and it is already Taylor's.
**Review.** The SQL is read by a human before it is applied anywhere hosted: the six `user_id` cascades, the `restrict` on `column_id`, the two partial uniques, and that every table has all four owner policies.

---

## 4. Placement, by exact path

New files. Nothing here needs a boundary exception.

```
packages/constants/src/workflow-starters.ts             the two built-in templates
packages/constants/src/limits.ts                        + four WORKFLOW_* bounds
packages/types/src/domain/workflow.ts                   the view models and unions
packages/utils/src/workflow/order-groups.ts             orderGroupsForDay
packages/utils/src/workflow/resolve-next.ts             resolveNextTask
packages/validators/src/workflow.ts                     every input schema
packages/db/src/schema/workflow/{enums,workflow-groups,workflow-views,workflow-columns,
                                 workflow-tasks,workflow-templates,workflow-day-pins,index}.ts
packages/db/src/index.ts                                + row type pairs
packages/db/migrations/0011_workflow.sql                + meta/_journal.json entry
packages/api/src/routers/workflow.ts                    + registration in root.ts
packages/api/src/services/workflow/*.ts                 TD-40's list
packages/api/src/services/user/build-export.ts          + six tables (TD-45)
packages/config/tailwind/preset.css                     + --dur-breathe
packages/ui/src/styles/globals.css                      + @keyframes syn-breathe, animate-breathe
packages/ui/src/composed/control/firing-toggle/         FiringToggle (+ story, index)
packages/ui/src/composed/display/firing-mark/           FiringMark
packages/ui/src/composed/display/task-row/              TaskRow
packages/ui/src/composed/display/lane-header/           LaneHeader
packages/ui/src/composed/display/next-strip/            NextStrip
packages/ui/src/composed/control/inline-add-row/        InlineAddRow
packages/ui/src/composed/layout/board/                  Board (static first; drag in its own slice)
packages/ui/src/composed/layout/screen-frame/           + width "board"
apps/web/lib/routes.ts                                  + two builders
apps/web/lib/entry/resolve-entry.ts                     the orient exemption
apps/web/lib/hooks/use-global-shortcuts.ts              + 4, + n on Workflow
apps/web/lib/keyboard/shortcuts.ts                      + the Workflow group
apps/web/app/(shell)/_components/nav-items.ts           + the fourth peer
apps/web/app/(shell)/workflow/page.tsx                  resolves to a view; never renders
apps/web/app/(shell)/workflow/[view]/page.tsx           the server shell: getServerApi().workflow.board
apps/web/app/(shell)/workflow/[view]/_components/       workflow-board.tsx · use-workflow-board.ts ·
                                                        task-sheet.tsx · new-view-sheet.tsx ·
                                                        columns-sheet.tsx · archived-sheet.tsx · copy.ts
```

**Route-local, not `components/<feature>/`.** Rule 9 puts a feature folder in `apps/web/components/` when two or more routes compose it. Workflow has one route. If a second appears (a Settings screen, an embed in the day), the folder is promoted then, in one move.

**Nothing in `@syn/hooks` yet.** The headless board logic is `resolveNextTask` and `orderGroupsForDay` in `@syn/utils`; `use-workflow-board.ts` binds the tRPC client and is therefore app-local by the §4A rule. `useOptimisticValue` is reused from `@syn/hooks` for the task sheet's save-as-you-go fields.

**`Board` is `layout`, the rows are `display`, the toggle is `control`** — matching the existing split of `composed/`. `TaskRow` renders its own *firing* / *back* / *next* words; `StateWord` is not reused (UX §9) and its reservation comment stands.

---

## 5. Failure contract

For the one surface a person presses many times an hour.

| Event | Must | Must never |
|---|---|---|
| Toggle pressed, request slow | Change on the press; *next* recomputed locally at once | Wait for the response; show a spinner |
| Toggle pressed twice quickly | Second press queues behind the first for that row (the in-flight guard) and applies after | Send two conflicting writes; end in the state the person did not last choose |
| Toggle request fails | Revert the row and *next*; one save-failure line | Leave the row firing locally while the server says otherwise |
| Move fails | Row returns to its cell and position; firing restored; one line | Leave two cells with a gap or a duplicate order |
| Move's response arrives after a second move | The later move's result wins (invalidate on settle, guard by task id) | Snap the row back to the first move's place |
| Offline | Controls disabled, the standard line, rows openable read-only | Queue writes (Phase 2 for the whole product) |
| The view in the URL is archived or unknown | Redirect to the first view | 404 a person out of their own board |
| A task id in `?sheet=task` no longer exists | Close the sheet | Error page |
| Two devices | Last write wins; refetch on focus | Merge prompts |
| Column removed while it holds tasks | Refused unless `moveTasksTo` is given; FK `restrict` underneath | Orphan or cascade-delete tasks |
| Another person's id in any input | `NOT_FOUND` | `FORBIDDEN`; any signal that the row exists |

---

## 6. What needs to be done — the work, in dependency order

Not tickets; the slices Reeve cuts tickets from, with what each unlocks. Sizes per the spec-system guide §7.3.

| # | Slice | Contents | Size | Depends on | Notes |
|---|---|---|---|---|---|
| A | **The contract** | `@syn/types` domain file · `@syn/constants` starters and limits · `@syn/validators` · `@syn/utils/workflow` (the two pure functions) | S | — | No surface, no table. Everything else types against it. |
| B | **Schema and `0011`** | The domain folder, row types, the migration, the schema reference | M | A | One-way door. Human reads the SQL. Local tier only. |
| C | **Services and the router** | TD-40's list; `ensureWorkflowDefaults`; the export tables (TD-45) | L | B | `move-task.ts` is the ticket inside the ticket. |
| D | **`@syn/ui` for Workflow** | `FiringMark`, `FiringToggle`, `TaskRow`, `LaneHeader`, `NextStrip`, `InlineAddRow`, a **static** `Board`, `ScreenFrame` `"board"`, the breath token and keyframe | L | A | Storybook-first; parallel with B and C. No drag. |
| E | **The shell** | Nav, routes, `tabForPath`, the orient exemption, `4` and `n`, `apps/web/AGENTS.md` rows and scope | S | A | Parallel with B–D. Lands a route that renders an empty frame. |
| F | **The board: read, fire, next** | The two pages, `use-workflow-board`, the optimistic toggle, the Next strip, the tab title, loading, empty, offline, failure, the board's keyboard grid | L | C, D, E | The core loop. After this slice the notes' §5 example can be walked end to end. |
| G | **Tasks and groups** | Add rows, the task sheet, *Move to* and `Alt`+arrows, *Start*, archive and undo, *Closed earlier*; group create, rename, hue, collapse, *Move up/down*, *First today*, archive | L | F | Every move by menu and key. Complete without drag. |
| H | **Views, columns, templates** | View tabs and switching, *New view*, the Columns sheet with roles and remove-with-move, *Save as a template*, the Archived sheet, the compact column tabs | L | G | The planning layer. |
| I | **The drag** | `Board` gains its `DndContext`; row drag across cells and lanes; lane drag | M | G | **Gates nothing.** Vigil on touch and keyboard. |
| J | **Close-out** | `yarn directory-map`, `docs:check-links`, the docs index rows, the placement-rule amendments in `docs/specs/README.md` (domain `workflow/`, the router name) | S | H | Not launch-blocking for the surface; blocking for the corpus. |

**Critical path:** `A → B → C → F → G → H`. **Parallel off it:** D and E beside B–C. **Does not gate:** I.
**Launch-blocking for this epic:** A through H, and TD-45's export inside C.
**Risk-weighted attention (spec-system guide §11.3):** C's move and F's optimistic toggle get explicit failure-state acceptance criteria from §5 above; B gets human SQL review; I gets Vigil.

**Guardrails that will need stating in the track's kickoff contract**, because an agent will otherwise get them wrong: no tests; no migration applied to a hosted tier; the breath applied `motion-safe` only; firing is `set`, never `toggle`; *next* is computed, never stored; dnd-kit only inside `@syn/ui`; copy from UX §7 verbatim in a `copy.ts`; no counts anywhere on the surface (W15).

---

## 7. What is deliberately not built

Recorded as seams, not scaffolded (the root guardrail).

- **Detection from Claude Code** — the seam is `setFiring`'s signature (TD-36). No route handler, no token table, no `source` column.
- **Any tie to the habit day** (W13) — no FK from a group to a habit, none from a task to a day item. If it comes, it is a nullable FK added by a later migration.
- **A weekly rule for *first today*** (#W1) — additive to TD-37.
- **Firing history** — no table.
- **Realtime, offline writes, notifications, a second person** — none.
- **A link on a task** (#W7) — if it comes, it reuses `links`' server-side derivation (TD-28) and stores, never fetches.

---

## 8. Decisions for Taylor

Batched, each with a recommendation and what happens if there is no answer. None blocks slices A–E.

| # | Decision | Recommendation | If no answer |
|---|---|---|---|
| 1 | Is Workflow in scope for `apps/web` Phase 1? `apps/web/AGENTS.md` § Scope does not list it, and the notes are the only authority for adding it. | Yes; add one line, as the landing page was added on 2026-09-05. | Treated as yes on the strength of the notes; the line is written in slice E and flagged in its `DEVIATIONS.md`. |
| 2 | Vesper's W5 / #W2 narrows *pulses/flashes* to a breathing mark. | Build the mark. It is one class to widen later. | The mark. |
| 3 | W16: Workflow opens without the orient frame first. | Exempt, as ruled. It is one branch in a pure function either way. | Exempt. |
| 4 | Migrations `0004`–`0010` on staging. | Apply before slice F needs a hosted walk. | Workflow is built and verified on the local tier only, and says so. |
| 5 | The ticket prefix. Three letters, no collision with the existing track prefixes or the two-letter screen IDs (`WF-` is now a screen prefix). | `FLO-`. Reeve's call. | Reeve picks. |

---

## 9. Assumptions made in this pass

Each is reversible and is repeated here so it can be falsified.

- `[ASSUMPTION]` The category-hue key set exists as a reusable enum or union for `workflow_groups.hue`. The eight keys are in `preset.css` and on `categories`; which construct to reuse is read at build (slice B), not guessed here.
- `[ASSUMPTION]` `@syn/utils`' existing time helpers format a duration as *4 min* / *1 h 12 min*. If not, one function is added to `time.ts`, not a new file.
- `[ASSUMPTION]` Data-sensitivity class: the highest the domain implies. Task titles and notes are client work under someone else's confidentiality; they are owner-private, never logged, and in the export.
- `[ASSUMPTION]` The compact tab bar renders all of `NAV_ITEMS`, so a fifth word tab is a list edit and a width check at 320px, not a new component. To be confirmed in slice E; if five words do not fit at 320px, that is a question back to Vesper, not a truncation.
- Nothing was invented for a flagged-open item: #W1, #W6 and #W7 are built to their stated defaults (no weekly rule, no stale-firing signal, no link).

---

## 10. Sign-off

Settled here: TD-33…TD-46. One-way doors among them: the table shapes (TD-34), the ordering idiom (TD-35), and `0011` (TD-46) — each reviewed as such. Everything else is reversible in a slice.

Next: Reeve stands up the track — `README.md` with its kickoff contract, `00-build-order.md`, `PROGRESS.md`, `DEVIATIONS.md`, and `TECHNICAL-DECISIONS.md` opening with TD-33…TD-46 — and cuts tickets from §6 against the UX spec's sections. Not started; waiting on Taylor.
