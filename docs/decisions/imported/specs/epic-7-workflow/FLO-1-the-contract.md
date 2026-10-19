# FLO-1 — The contract: view models and unions, the two starter templates and the limits, the validators, `orderGroupsForDay`, `resolveNext`, `formatMinutesShort`

**Epic:** FLO — Workflow · **Phase 0** · Size: S
**Slice type:** Contract / types / pure functions — no UI, no table, no procedure. The risk class is *a union that disagrees with the enum FLO-2 writes*, and *a `next` that is right on the happy path and wrong on a collapsed, pinned, or empty lane*.

**Status:** Complete (2026-10-03)

> **Mason — contract review.** Before FLO-2 starts: the role union matches the enum FLO-2 will declare (`active`, `done`); `WorkflowBoardView` carries no `sortOrder` and no `isNext`; `resolveNext` is total (every board yields exactly one of its three results); neither pure function reads a clock or a global.

---

## Outcome

Everything later tickets type against exists and compiles: the view models a board is made of, the two built-in templates as data, the bounds, one Zod schema per input with the UX document's sentence as its message, and three pure functions — today's lane order, which task is next, and a duration in the board's short form. After this ships, FLO-2 can declare tables whose enum matches a union, FLO-4 can build components that take view models, and FLO-3 and FLO-6 can call the same `resolveNext` on the server's data and the client's patched cache. Nothing here touches a database, a route, or a component.

## Why / intent

- **TD-40** — view models live in `@syn/types` from the start because `@syn/ui`'s `TaskRow`, `LaneHeader` and `Board` take them (rule 5's promotion condition is met on day one); validators in `packages/validators/src/workflow.ts` (rule 7); starters and limits in `@syn/constants` (rule 8).
- **TD-38, UX §3.4, W8** — *next* is order and nothing else: the first of the person's tasks in the active column, walking today's group order, then the cell's order. It is a pure function so the client re-runs it the instant a toggle is pressed.
- **TD-37, UX §3.5, W9** — today's order is the pinned groups in pin order, then the rest in usual order.
- **UX §3.3** — durations are minutes, never seconds: nothing under a minute, then *1 min* … *59 min*, then *1 h 12 min*.
- **UX §3.6** — the two built-in templates and their roles.
- **Ground truth (consumed):** `CategoryKey` in `packages/types/src/domain/domain.ts` (a group's hue is one of the eight; no new union); `packages/constants/src/limits.ts`; `packages/utils/src/time.ts` (its `formatElapsed` is the timer's `m:ss` and is left alone); the validator pattern in `packages/validators/src/link.ts`.
- **What this slice is NOT (binding):** a table, an enum in `@syn/db`, a service, a hook, a component, a `copy.ts`.

**Rulings this slice makes (labelled, logged):**

- **`WorkflowBoardView.tasks` is one array already in order; a cell is a filter of it.** A task view carries `groupId` and `columnId` and no `sortOrder`: within a `(groupId, columnId)` pair, array order is the cell's order. The client reorders the array to move a task optimistically and never computes an order number (TD-35). Logged.
- **`resolveNext` returns one of three results** — `{ kind: "task", taskId }`, `{ kind: "all_firing" }`, `{ kind: "none" }` — matching the Next strip's three states (UX §3.4) so no caller re-derives *everything is firing* its own way. `none` is: no active column, or an active column with no tasks. Logged.
- **Tasks with `groupId: null` are walked last** (the lane *No group* is always last, UX §3.2). Logged.
- **A pinned id that names no group in the list is ignored**, not an error — a group archived after it was pinned leaves a harmless id behind (TD-37). Logged.
- **`formatMinutesShort(minutes)` returns the empty string below 1** — the caller renders the word alone (*firing*) and omits the middot. Logged.

## Behaviour & states

**No surface.** Described by the exports.

`packages/types/src/domain/workflow.ts`:

```ts
export type WorkflowColumnRole = "active" | "done";
export type WorkflowTemplateColumn = { name: string; role: WorkflowColumnRole | null };
export type WorkflowViewTab = { id: string; name: string };
export type WorkflowColumnView = { id: string; name: string; role: WorkflowColumnRole | null };
export type WorkflowGroupView = { id: string; name: string; hue: CategoryKey; collapsed: boolean };
export type WorkflowTaskView = {
  id: string;
  title: string;
  note: string | null;
  groupId: string | null;
  columnId: string;
  firingStartedAt: Date | null;
  lastReturnedAt: Date | null;
  closedAt: Date | null;
};
export type WorkflowBoardView = {
  view: WorkflowViewTab;
  columns: WorkflowColumnView[];      // in order
  groups: WorkflowGroupView[];        // usual order, unarchived
  pinnedGroupIds: string[];           // today's pins, newest first
  tasks: WorkflowTaskView[];          // in cell order
  dayKey: string;                     // the day the pins belong to
};
export type WorkflowTemplateView = { id: string; name: string; builtIn: boolean; columns: WorkflowTemplateColumn[] };
export type WorkflowNext =
  | { kind: "task"; taskId: string }
  | { kind: "all_firing" }
  | { kind: "none" };
```

`packages/constants/src/workflow-starters.ts` — `WORKFLOW_STARTERS`, two entries with stable keys `working` and `queue`: *Working* → *In progress* (`active`), *Ongoing*, *Finish later*, *Done* (`done`); *Queue* → *Up next*, *Later*, *Someday* (no roles). `limits.ts` gains `WORKFLOW_TITLE_MAX = 120`, `WORKFLOW_NOTE_MAX = 2000`, `WORKFLOW_NAME_MAX = 40`, `WORKFLOW_COLUMNS_MAX = 5`.

`packages/utils/src/workflow/order-groups.ts` — `orderGroupsForDay<T extends { id: string }>(groups: readonly T[], pinnedIds: readonly string[]): T[]`.
`packages/utils/src/workflow/resolve-next.ts` — `resolveNext(input: { groupsInOrder: readonly { id: string }[]; tasks: readonly WorkflowTaskView[]; columns: readonly WorkflowColumnView[] }): WorkflowNext`.
`packages/utils/src/time.ts` — `formatMinutesShort(minutes: number): string`.

`packages/validators/src/workflow.ts` — one schema per FLO-3 input, exported with its inferred type: `workflowBoardInput`, `workflowTaskCreateInput` (`viewId`, `columnId`, `groupId` nullable, `title`), `workflowTaskUpdateInput` (`id`, optional `title`, `note`, `groupId`), `workflowTaskMoveInput` (`id`, `toColumnId`, `toGroupId` nullable, `toIndex` int ≥ 0, optional `restoreFiringStartedAt` date-or-null for undo), `workflowTaskSetFiringInput` (`id`, `firing`, `at`), `workflowIdInput`, `workflowReorderInput` (`ids`), `workflowGroupCreateInput` (`name`), `workflowGroupRenameInput`, `workflowGroupSetHueInput`, `workflowGroupSetCollapsedInput`, `workflowViewCreateInput` (`name`, and exactly one of `starterKey` or `templateId`), `workflowViewRenameInput`, `workflowColumnSaveInput` (`viewId`, optional `id`, `name`), `workflowColumnSetRoleInput` (`id`, `role` nullable), `workflowColumnRemoveInput` (`id`, optional `moveTasksTo`), `workflowTemplateSaveInput` (`viewId`, `name`), `workflowTemplateRenameInput`, `workflowListClosedInput` (`viewId`, optional `cursor`).

Messages, verbatim from UX §7: an empty or whitespace title → *A task needs a title.* · an empty view name → *A view needs a name.* · an empty template name → *A template needs a name.* Titles and names are trimmed by the schema; lengths are capped by the limits with no message (UX WF-01: the field stops accepting and says nothing).

**States (exhaustive, `resolveNext`):** no active column → `none` · active column empty → `none` · every active task firing → `all_firing` · otherwise the first non-firing task found walking `groupsInOrder`, then the null group → `task`.

**Failure / edge states:** tasks whose `groupId` names a group not in `groupsInOrder` (an archived group's leftovers) are walked with the null group, not dropped · tasks with `closedAt` set are never in the active column and are ignored if they somehow are · `orderGroupsForDay` with duplicate pinned ids keeps the first.

## Non-negotiables (this slice)

- **No clock, no I/O, no React in `@syn/utils/workflow/`.** Platform-pure by construction (rule 6).
- **No `sortOrder`, no `isNext`, no `isFiring` on any view model.** Order is array order; next is computed; firing is `firingStartedAt !== null`.
- **The hue is `CategoryKey`.** No second hue union.
- **`formatElapsed` is not touched.**
- **No emoji and no app-voice prose in `@syn/constants`** — the starter names are seed data, as `default-reasons.ts` is.

## Data & AI

**Schema changes: none.**

**Tables:** none.

**Placement:** `packages/types/src/domain/workflow.ts` (+ `packages/types/src/index.ts`); `packages/constants/src/workflow-starters.ts`, `packages/constants/src/limits.ts` (+ `index.ts`); `packages/utils/src/workflow/{order-groups,resolve-next}.ts`, `packages/utils/src/time.ts` (+ `index.ts`); `packages/validators/src/workflow.ts` (+ `index.ts`). Rules 5, 6, 7, 8; Mason, TD-38 and TD-40.

**tRPC / validators:** the schemas above; no procedure.

**AI notes:** **None.**

## Accessibility

**None — no surface in this slice.**

## Acceptance criteria (observable — by reading the exports and evaluating the functions)

1. `@syn/types` exports every type listed above; `WorkflowGroupView.hue` is `CategoryKey`; no exported workflow type has a property named `sortOrder`, `isNext` or `isFiring`.
2. `WORKFLOW_STARTERS` has exactly two entries; *Working* has four columns with `active` on the first and `done` on the last; *Queue* has three with no role.
3. `orderGroupsForDay([a, b, c], ["c", "x", "a"])` returns `[c, a, b]`; with no pins it returns the input order.
4. `resolveNext` with groups `[g1, g2]`, active column `col`, and tasks in array order `t1 (g1, firing)`, `t2 (g1, not firing)`, `t3 (g2, not firing)` returns `{ kind: "task", taskId: "t2" }`; with `t2` firing it returns `t3`; with all three firing, `{ kind: "all_firing" }`.
5. `resolveNext` returns `{ kind: "none" }` for a board whose columns have no `active` role, and for one whose active column holds no task.
6. A non-firing task with `groupId: null` is returned only when no task in any listed group is the person's.
7. A non-firing task in a non-active column is never returned.
8. `formatMinutesShort` returns `""` for 0, `"1 min"` for 1, `"59 min"` for 59, `"1 h"` for 60, `"1 h 12 min"` for 72.
9. `workflowTaskCreateInput.safeParse({ …, title: "   " })` fails with the message *A task needs a title.*; a 121-character title fails; a title with surrounding spaces parses trimmed.
10. `workflowViewCreateInput` fails when both or neither of `starterKey` and `templateId` are given.
11. No file under `packages/utils/src/workflow/` imports `react`, reads `Date.now`, or constructs a `Date` with no argument.
12. `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` pass (four separate commands).

## Likely-relevant technical notes (ADVISORY — dev decides)

- The existing duration strings elsewhere in the app (*45 min*) may come from an app-local helper; if one exists that already matches criterion 8, promote it to `time.ts` under this name rather than writing a second.
- `resolveNext` is easiest as: find the active column; filter its tasks; if none, `none`; build a `Map` of group id → rank from `groupsInOrder` with unknown and null ids ranked last; stable-sort by rank (array order is already cell order); return the first with `firingStartedAt === null`.
- Date fields cross the wire as `Date` because `superjson` is on both rails.

## Dev's call

File split inside `packages/utils/src/workflow/` · whether the validators share a base `id` schema with the existing ones · the starter entries' exact shape beyond `key`, `name`, `columns`.

## Out of scope

- **The enum and the tables** — FLO-2.
- **Row → view mapping** — FLO-3 (`to-view.ts`).
- **Any component or `copy.ts`** — FLO-4, FLO-6.

## Depends on

**No slice dependencies.**

## Recommended execution

**Sonnet.** A precise contract with the judgment already ruled. The failure mode of choosing down further is a `resolveNext` that forgets the null group or the collapsed lane, which criteria 4–7 catch.

---

### Kickoff (paste into the session)

> Build **FLO-1 — The contract** (attached spec). Model: **Sonnet**. **Order is array order, next is computed, firing is a timestamp: no view model carries a `sortOrder`, an `isNext` or an `isFiring`.**
> Attach/read first, in order: this spec · `docs/ux/workflow-ux-spec-v0.1.md` §1.4, §3.2–§3.6, §7, §11 · `01-technology-assessment.md` §3 (TD-37, TD-38, TD-40), §4 · root `AGENTS.md` · `docs/specs/README.md` § Placement rules · `packages/types/src/domain/domain.ts` (`CategoryKey`) · `packages/validators/src/link.ts` (the pattern) · this track's `README.md`, `DEVIATIONS.md` + `TECHNICAL-DECISIONS.md`.
> No table, no service, no component. Pure functions take everything as arguments. Messages are UX §7's sentences verbatim. Close in three places; log departures in `DEVIATIONS.md`. Run `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` as separate commands.
