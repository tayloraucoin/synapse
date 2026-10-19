---
id: "USE-9"
size: small
objective: "Pure functions for the to-do side of the day and for whose work it is: an undone to-do slot reads as returned once its block ends, the to-do pool is read from that, a To-dos block is filled oldest first at go, and a work item's client resolves from the item, then its project, then its workspace"
slice_type: "pure logic over records; risks a returned to-do written instead of derived, a to-do in the pool and in a live block at once, a pull that overfills a block or takes a to-do twice, and a client taken from the workspace when the project says none"
non_negotiables:
  - "Pure and platform-free: no Date.now(), no I/O; the caller passes now and every block's end."
  - "Returned is derived, never written: no job runs at a block's end (D-USE-74)."
  - "The pull is oldest first, any type; reminders due and chores due never reorder it."
  - "One to-do never sits in two live slots; the pull never takes one already slotted."
  - "Clients off means no client, whatever is mapped."
  - "@syn/utils never imports @syn/validators; inputs are structural."
  - "No new dependency."
devs_call: "Helper names; whether the pool returns records or ids with their returnedFrom; test-table layout."
cites:
  - "specs/web/epics/USE-daily-use/ux/day/now/states/todos-block.md"
  - "specs/web/epics/USE-daily-use/ux/account/settings/states/workspace-per-project.md"
  - "C-USE-now-todos-block-3"
  - "D-USE-74"
  - "D-USE-91"
waiver: "Three small pure functions with no UI; the pull and returned slots come from the To-dos block, client resolution from the workspace sheet. The operator grouped them in one ticket."
truth_files: "none: no behaviour ships; Now, the To-dos tray, the pool and the client filter read these in wave 2"
qa: Q1
reviewers: []
focus: []
operator_review: false
planned_paths:
  - "packages/utils/src/planner/todo-pool.ts"
  - "packages/utils/src/planner/todo-pool.test.ts"
  - "packages/utils/src/planner/pull.ts"
  - "packages/utils/src/planner/pull.test.ts"
  - "packages/utils/src/planner/index.ts"
  - "packages/utils/src/work/client.ts"
  - "packages/utils/src/work/client.test.ts"
  - "packages/utils/src/work/index.ts"
  - "packages/utils/src/index.ts"
depends_on:
  - "USE-3"
out_of_scope:
  - "Writing the pulled slots at Ready, go, and making a repeating to-do's next one when it is checked: the to-dos wiring (wave 3)"
  - "The tray's order (reminders first by time, D-USE-69) and the type filter: the To-dos tray ticket"
  - "Make room, and Move to later: their own tickets"
  - "Reading a work item's Linear project from the snapshot: the Linear sync ticket; the caller passes it"
criteria:
  - id: C1
    statement: "A to-do slot not done reads as returned once now reaches its block's end, and never before; a work or set-item slot never returns"
    evidence: test
    command: "yarn test"
  - id: C2
    statement: "todoPool holds every undated, undone, unarchived to-do not held by a live slot, oldest first, each returned one naming the date it returned from"
    evidence: test
    command: "yarn test"
  - id: C3
    statement: "pullTodos fills each From to-dos block in start order, oldest first, taking a to-do only when its length fits the minutes left and walking on past one that doesn't"
    evidence: test
    command: "yarn test"
  - id: C4
    statement: "The pull counts the slots already in a block against its minutes, never takes a to-do twice or one with a reminder time, and gives a to-do with no length 15 minutes"
    evidence: test
    command: "yarn test"
  - id: C5
    statement: "resolveClient takes the item's own client, then its project's in a per-project workspace, then the workspace's one client; a project set to No client stays with none"
    evidence: test
    command: "yarn test"
  - id: C6
    statement: "With clients off, or with the resolved client archived, resolveClient returns none"
    evidence: test
    command: "yarn test"
  - id: C7
    statement: "@syn/utils and its importers type-check"
    evidence: check
    command: "yarn check-types"
---

# Contract — planner-pure-functions

## Build notes

Wave 1, after USE-3, parallel to USE-7 and USE-8. The hooks call these. The wiring tickets write only what the pull returns, at go.

- **Decisions that apply:**
  - D-USE-74: a To-dos block in go mode is filled oldest first from to-dos with no day. Undone ones go back to To-dos at its end.
  - Data contract: an undone slot whose block has ended reads as returned, so its to-do is back in the pool with no job to run. The pull rule fills a To-dos block oldest first, any type, at go.
  - Life and To-dos dev note: the pull order is oldest first; reminders due and chores due do not reorder it [ASSUMPTION]. Any to-do goes in any To-dos block (D-USE-87).
  - D-USE-26: a carried to-do reads "From Sunday". So the pool names the date a returned to-do came from.
  - Sunday reset: a checked repeating to-do makes its next one, which waits in To-dos with no day. So a chore is just an undated row here.
  - Data contract: one pure function resolves an item's client: the item's own, then its project's, then its workspace's. `users.clients_enabled` defaults to false.
  - Workspace sheet (D-USE-91): One client or Set per project. "No client" puts that project's work under Personal.
- **Interfaces:**
  - `planner/todo-pool.ts`:
    - `isReturned({ todoId; doneAt }, blockEnd: Date, now: Date): boolean`.
    - `todoPool({ todos: { id; onDate; doneAt; archivedAt; createdAt }[]; slots: { todoId; onDate; doneAt; blockEnd: Date }[]; now }): { todoId; returnedFrom: string | null }[]`. The order is `createdAt`, then `id`.
  - `planner/pull.ts`:
    - `pullTodos({ blocks: { id; fill; start: Date; end: Date; slots: { todoId; lengthMin: number | null; sortOrder }[] }[]; pool: { todoId; lengthMin: number | null; remindAt: string | null }[] }): { blockId; todoId; sortOrder }[]`.
    - It takes only `fill === "from_todos"` blocks. New `sortOrder`s follow the block's highest. `PULL_DEFAULT_LENGTH_MIN = 15`.
  - `work/client.ts`:
    - `resolveClient({ clientsEnabled; item: { clientId; linearConnectionId; linearProjectId }; connections: ReadonlyMap<string, { clientId; perProject: boolean }>; projectClients: ReadonlyMap<string, string | null>; archived: ReadonlySet<string> }): string | null`.
    - `projectClients` is keyed `${connectionId}:${projectId}`. In a per-project workspace, an unmapped project has no client.
- **Per path:** one test file per source file, each `describe` named after its criterion. Append to `planner/index.ts`, `work/index.ts` and `src/index.ts`.
- **Gotchas:**
  - USE-8 creates `work/index.ts` in parallel. Whichever lands second appends; never reorder. The same goes for the two `src/index.ts` banners.
  - "Live" means undone with a block not yet ended, today or later. A done slot's to-do is done itself (checking a row checks the to-do).
  - Three of the pull's details are defaults Taylor confirmed at the Tickets gate, not drawn: 15 minutes for a to-do with no length, skip one that doesn't fit and walk on, and leave reminder to-dos out of the pull.
  - Compare instants as numbers. `blockEnd` comes from `readDay`'s occurrence, never built by hand.
- **Model:** Opus 5.5 at medium. A smaller model writes "returned" as a state, overfills a block, or falls back to the workspace's client when the project says none.
