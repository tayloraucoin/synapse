---
size: medium
objective: "The pool, New task, the Item sheet and Today's Done read and write Taylor's real work items: create, edit, done, reopen, back to the pool and remove, each with its sessions"
slice_type: "the work items' read and write path; risks a task's Done that leaves a session open, a reopen that loses what was done, and a pool read that drifts from the fixture's"
non_negotiables:
  - "Marking a task done closes every open session with it; a session's Done never marks the task (D-USE-57, D-USE-65)."
  - "Each write that touches work_items and slots runs in one transaction inside ctx.rls.execute(), with an undo token (USE-92)."
  - "Remove from Synapse archives the item (archived_at) and drops its open sessions; nothing is deleted."
  - "Every input is a @syn/validators schema; createTaskInput moves into @syn/validators, and markTaskDone, reopenTask, backToPool and removeFromSynapse get one."
  - "Nothing here writes to Linear; a linked item's Linear side is USE-102's outbox."
devs_call: "The work router's procedure names; the service split under services/work/."
cites:
  - "specs/web/epics/USE-daily-use/ux/interactions/sessions.md"
  - "C-USE-sessions-1"
  - "D-USE-57"
  - "D-USE-65"
truth_files: "none: behaviour is the ledger's; only the data source changes"
qa: Q1
reviewers: []
focus: []
operator_review: false
planned_paths:
  - "packages/api/src/services/work/"
  - "packages/api/src/routers/work.ts"
  - "packages/api/src/root.ts"
  - "packages/validators/src/work.ts"
  - "apps/web/lib/fixtures/work/create-task.ts"
  - "apps/web/lib/data/live/work.ts"
depends_on:
  - "USE-92"
out_of_scope:
  - "Placing, moving, spreading and tiering sessions: USE-99"
  - "The Linear snapshot inside the pool read, and placing Linear issues: USE-101"
  - "Client order and client writes: USE-104"
criteria:
  - id: C1
    statement: "work.pool returns the pool's work items, their slots, clients and blocks in the shape readPool returns, and parses with its schema"
    evidence: test
    command: "yarn test"
  - id: C2
    statement: "work.createTask writes the item and, when placed, its first session, in one transaction, as the fixture does"
    evidence: test
    command: "yarn test"
  - id: C3
    statement: "markTaskDone sets done_at and done_source synapse and closes every open session; reopenTask clears them and reopens exactly the sessions that Done closed"
    evidence: test
    command: "yarn test"
  - id: C4
    statement: "backToPool removes the open sessions and keeps done ones; removeFromSynapse archives the item and removes its open sessions"
    evidence: test
    command: "yarn test"
  - id: C5
    statement: "editWorkItem writes and refuses as the fixture does"
    evidence: test
    command: "yarn test"
  - id: C6
    statement: "The web app and the API type-check"
    evidence: check
    command: "yarn check-types"
id: USE-98
---

# Contract — work-pool-and-items

## Build notes

The `WorkServer`'s item methods: `readPool`, `createTask`, `editWorkItem`, `markTaskDone`, `reopenTask`, `backToPool` and `removeFromSynapse`.

- **Decisions that apply:**
  - D-USE-57: a session's Done is the slot's `done_at`, never the task's.
  - D-USE-65: the task is done when Taylor marks it done or Linear closes it, and every open session closes with it.
  - C-USE-sessions-1: a session is one work slot on one day, and "session n of m" is counted on read.
- **Approach:**
  - `services/work/read-pool.ts` returns `PoolRecords` without the Linear snapshot. USE-101 adds the snapshot.
  - Item writes are plans plus apply, with `recordUndo`.
  - Reopen needs to know which sessions Done closed. Take them from the undo token, if Done's token is passed. Otherwise, sessions whose `done_at` equals the task's `done_at` are the ones Done closed: the fixture closes them with the same stamp. Match `lib/fixtures/work/`.
- **Interfaces:**
  - Move `createTaskInput` from `apps/web/lib/fixtures/work/create-task.ts` to `@syn/validators/work`. The fixture imports it back, and its tests stay green.
  - Add `workItemIdInput` (`{ workItemId }`) for done, reopen, back to the pool and remove.
- **Per path:** `services/work/*.test.ts` hold C1 to C5 over in-memory rows.
- **Gotchas:**
  - `done_source` is `synapse` here. `linear` is written only by sync (USE-101).
  - A task with sub-issues: a sub-issue checked inside its issue is the child's `done_at`. Done on the parent does not close its children unless the fixture does; match it.
- **Model:** Opus 5.5 at medium. A smaller model marks the task done from a session's Done.
