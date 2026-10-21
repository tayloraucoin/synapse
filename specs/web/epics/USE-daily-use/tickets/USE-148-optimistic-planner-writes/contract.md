---
id: USE-148
size: medium
objective: "Planner writes show at once: createBlock, writeBounds, editBlock and the item writes change the week cache in onMutate and roll back on an error"
slice_type: "cache writes ahead of the server; risks a ghost row after a refusal and a flicker when the server's answer lands"
non_negotiables:
  - "Every cached week the write reaches changes in onMutate; an error puts every one back exactly as it was."
  - "The server's answer still settles it (invalidate on settle, as now)."
  - "A write the rule does not know falls through untouched."
devs_call: "Which writes beyond createBlock are covered; the default is bounds, block edits and item add, edit, remove and order."
cites:
  - "specs/web/epics/USE-daily-use/ux/set-my-days/set-my-days/states/saved.md"
truth_files: "none: the epic's own ux/ ledger is amended in the same commit (set-my-days/set-my-days/states/saved.md); it promotes to specs/web/ux/ with USE"
qa: Q1
reviewers: []
focus: []
operator_review: false
planned_paths:
  - "apps/web/lib/data/use-planner-writes.ts"
  - "apps/web/lib/data/optimistic-week.ts"
  - "apps/web/lib/data/optimistic-week.test.ts"
  - "specs/web/epics/USE-daily-use/ux/set-my-days/set-my-days/states/saved.md"
depends_on: []
out_of_scope:
  - "Copy, clear, reset, split and dated changes, which still wait for the server"
criteria:
  - id: C1
    statement: "applyOptimistic adds a new block to each day its rule or date hits, patches edits by id, and leaves an unknown write's week unchanged"
    evidence: test
    command: "yarn workspace web test"
---

# Contract — USE-148 optimistic-planner-writes

## Build notes

Fix 7 of Taylor's review of 2026-10-19.

- **Approach:** `applyOptimistic(call, week)` in `lib/data/optimistic-week.ts`, pure. The planner mutation's `onMutate` cancels the week queries, snapshots them, and `setQueriesData` through it; `onError` restores the snapshot.
- **Gotchas:** a new block's temporary id must not reach a route; navigation waits for the server's id.
- **Model:** Opus 5.5.
