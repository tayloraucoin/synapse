---
id: USE-158
size: small
objective: "A block opened from Set my days can be deleted from its ··· menu: asked once, then gone from that weekday (or that date), with Undo"
slice_type: "a new planner write through the fixture server, the live tRPC router and the optimistic cache, plus a menu row; the risk is deleting more than the scope named (other weekdays, the usual from a date) or an Undo that loses the items"
non_negotiables:
  - "The ··· menu reads Rename, Icon and colour, a 1 px separator, then 'Delete block' with the trash icon, in ink, never red (header-menu.md, D-USE-28)."
  - "It asks once (ConfirmDialog) naming the scope, 'Delete every Monday's Wellness?', then Block view returns to Set my days and a toast offers Undo (D-USE-69)."
  - "Usual week: the weekday leaves the block's rule; other weekdays keep it; with no weekday left the block is archived, never hard-deleted, its items kept."
  - "This week: only that date skips the block; the usual weekday keeps it."
  - "Undo brings the block and its items back as they were."
  - "No second person; nothing red; @syn/ui components and tokens only."
devs_call: "the write's name and input; the confirm's body words; whether a dated Life block shows both Not this week and Delete block"
cites:
  - "specs/web/epics/USE-daily-use/ux/day/block-view/states/header-menu.md"
  - "D-USE-69"
  - "C-USE-block-view-header-menu-3"
truth_files: "none: the epic's own ux/ ledger carries it (day/block-view/states/header-menu.md, its From Set my days section); it promotes to specs/web/ux/ with USE"
qa: Q1
reviewers:
  - assay
focus: []
operator_review: false
planned_paths:
  - "packages/validators/src/planner.ts"
  - "packages/validators/src/index.ts"
  - "packages/api/src/services/planner/write-blocks.ts"
  - "packages/api/src/services/planner/write-blocks.test.ts"
  - "packages/api/src/routers/planner/writes.ts"
  - "apps/web/lib/fixtures/planner/index.ts"
  - "apps/web/lib/data/live/planner-writes.ts"
  - "apps/web/lib/data/use-planner-writes.ts"
  - "apps/web/lib/data/optimistic-week.ts"
  - "apps/web/lib/data/block-edit.ts"
  - "apps/web/lib/data/block-edit.test.ts"
  - "apps/web/lib/fixtures/scenarios/block-view-editing.ts"
  - "apps/web/app/(shell)/days/block/[id]/_components/days-block-screen.tsx"
  - "apps/web/app/(shell)/days/block/[id]/_components/copy.ts"
  - "specs/web/epics/USE-daily-use/ux/day/block-view/states/header-menu.md"
  - "specs/web/epics/USE-daily-use/tickets/USE-158-delete-block-set-my-days/evidence/"
depends_on: []
out_of_scope:
  - "Delete block from the day (Today's Block view): it shipped with USE-48's day mode"
  - "Deleting a block from the week strip or Set my days' day column"
  - "Any schema change: blocks.archived_at already exists"
criteria:
  - id: C1
    statement: "Delete block from a usual weekday takes that weekday out of the block (archived when none is left, items kept), other weekdays keep it, and Undo brings it back; from This week only the date skips it"
    evidence: test
    command: "yarn test"
  - id: C2
    statement: "?state=block-view-delete-block-menu and block-view-delete-block-confirm at 402: the ··· menu titled 'Every Monday's Wellness' with Rename, Icon and colour, a separator and Delete block in ink; then the one question naming every Monday's Wellness"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-158-delete-block-set-my-days/evidence/"
---

# Contract — USE-158 delete-block-set-my-days

## Build notes

Taylor needs a way to delete a block; header-menu.md specs "Delete block" in the block's ··· and Set my days' Block view shipped without it (a build miss, 2026-10-20).

- **Approach:** a `removeBlock({ id, weekday })` planner write for the usual week: `withoutWeekday` on the rule, as Clear day does, archiving the block when no weekday is left. From a date, Delete block is the date's `block_changes` skip, as from the day. `blockEdits.deleteBlock` picks by place. The screen adds the separated row, a `ConfirmDialog`, `router.push(back)` and `toastUndo`.
- **Decisions that apply:** D-USE-69: "Delete block asks once (a confirm naming 'today's Wellness only'), then the block goes from today, Block view returns to the day, and a `Toaster` offers Undo; Monday's usual keeps it." In Set my days the scope is the menu's title: "Every Monday's Wellness" or "This Thursday's Wellness".
- **Interfaces:** `removeBlockInput` (`@syn/validators`); `planner.removeBlock` (tRPC); `PlannerServer.removeBlock`; `usePlannerWrites().removeBlock`; `blockEdits(...).deleteBlock`; `?state=block-view-delete-block-menu`, `block-view-delete-block-confirm`.
- **Gotchas:** Undo needs `UNDO_TOKEN_KEY` on a live server; a 500 "UNDO_TOKEN_KEY is not set" is the env, not this code. A dated Life block already has Not this week, which does the same; it gets no second row.
- **Model:** any.
