---
size: small
objective: "The To-dos tray, the To-do sheet and Now's To-dos block read and write Taylor's real to-dos, with Remove and its Undo bringing back the to-do and its slots"
slice_type: "the to-dos' read and write path; risks a remove that leaves orphan slots, a restore that misses slot events, and a pull rule run on the server differently from the client"
non_negotiables:
  - "Every query runs inside ctx.rls.execute(); remove and restore each run in one transaction."
  - "Remove takes the to-do, its slots and their slot events together; restore puts all three back, events with their original ids and times."
  - "The pull rule stays in the hooks (USE-9's pure function); the server only stores."
  - "Every input is a @syn/validators schema; updateTodo, writeTodoDone, removeTodo and restoreTodo get one here."
devs_call: "Whether restore is the undo token (USE-92) or its own procedure; validator names."
cites:
  - "specs/web/epics/USE-daily-use/ux/dev-notes/life-and-todos.md"
  - "D-USE-74"
  - "D-USE-37"
truth_files: "none: behaviour is the ledger's; only the data source changes"
qa: Q1
reviewers: []
focus: []
operator_review: false
planned_paths:
  - "packages/api/src/services/todos/"
  - "packages/api/src/routers/todo.ts"
  - "packages/api/src/root.ts"
  - "packages/validators/src/todo.ts"
  - "apps/web/lib/data/live/todos.ts"
depends_on:
  - "USE-92"
out_of_scope:
  - "Reminder pushes for to-dos: USE-105"
  - "To-do slots placed in a block: USE-94's planner.placeSlot"
criteria:
  - id: C1
    statement: "todo.list for a date returns the dated to-dos, the pool and their slots in the shape readTodos returns, and parses with its schema"
    evidence: test
    command: "yarn test"
  - id: C2
    statement: "writeTodo, updateTodo and writeTodoDone write and refuse as the fixture does"
    evidence: test
    command: "yarn test"
  - id: C3
    statement: "Removing a to-do with a slot and slot events, then restoring it, leaves the three tables as they were, ids included"
    evidence: test
    command: "yarn test"
  - id: C4
    statement: "The web app and the API type-check"
    evidence: check
    command: "yarn check-types"
id: USE-95
---

# Contract — todos

## Build notes

The fixture's `readTodos`, `writeTodo`, `updateTodo`, `writeTodoDone`, `removeTodo` and `restoreTodo` become `todo.list`, `create`, `update`, `setDone`, `remove` and `restore`.

- **Decisions that apply:**
  - D-USE-74: an undone slot whose block has ended reads as returned; its to-do is back in the pool. The pull rule fills a To-dos block oldest first, any type, at go.
  - D-USE-37: a daily reminder is a to-do with a daily rule and a time (`remind_at`; `remind_on` from 0014).
  - Data contract: `todos` holds `on_date` (none means the pool), `rrule`, `remind_at`, `notes`, `done_at` and `archived_at`.
- **Approach:**
  - `services/todos/`: `listTodos(rls, dateKey)` returns `TodosRecords` (to-dos, their slots, the blocks those slots name).
  - `remove` returns the removed rows as `RemovedTodo` (as the fixture does), so the hook's Undo calls `restore` with them. Also record an undo token, so either path works.
  - Inputs: `todoInput` exists. Add `todoUpdateInput` (`{ id, patch: todoInput.partial() }`), `todoDoneInput` (`{ id, doneAt: string | null }`), `todoIdInput` and `removedTodoInput`.
- **Per path:** `services/todos/todos.test.ts` holds C1 to C3 over in-memory rows, plans then apply as in USE-92.
- **Gotchas:**
  - Delete the to-do and let the foreign keys cascade: `slots.todo_id` and `slot_events.slot_id` are `onDelete: cascade` (USE-2), and a cascade is not a policy, so slot_events stays append-only for callers. `restore` re-inserts the three in order, to-do, slots, events, with their ids; an insert is allowed on slot_events.
  - Done on a recurring to-do sets that date's slot done, never the rule's to-do (fixture behaviour, USE-28).
- **Model:** Opus 5.5 at medium. A smaller model deletes the to-do and orphans its slots.
