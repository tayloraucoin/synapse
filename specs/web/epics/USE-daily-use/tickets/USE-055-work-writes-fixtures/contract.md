---
id: "USE-55"
size: small
objective: "The work screens read the pool and write work through hooks on the fixture server: usePool gives work items neither done nor archived with their sessions' days and clients, and useWorkWrites places, moves and unplaces work, changes a tier for this session or all, edits a work item, marks the task done, sends it back to the pool, removes it from Synapse and sets client order, every write undoable"
slice_type: "the data seam's work side, beside the set-up fixtures; risks a second week read or planner-writes hook, a write the router will refuse being accepted, an Undo that restores the wrong records, a pool that shows done or archived work, and two client orders"
non_negotiables:
  - "Build on USE-36: its readWeek, useWeek, usePlannerWrites and undo(token); never a second week read, planner-writes hook or Undo scheme."
  - "One useWorkWrites: USE-51 creates it; extend it, or create it as USE-51's contract says if it has not landed. Whichever lands second merges."
  - "One slot-edit schema (USE-16's slotUpdateInput, as USE-32 extends it)."
  - "Every write parses its @syn/validators input and refuses what it refuses, with its words."
  - "Undo restores exactly the records the write changed, and nothing else."
  - "Server data lives in TanStack Query over the fixture server (USE-7); nothing under lib/data or lib/fixtures imports @syn/db, @syn/api or tRPC."
devs_call: "File split under lib/fixtures/work/; query keys; the pool scenario's placeholder items past those named below."
cites:
  - "specs/web/epics/USE-daily-use/ux/work/week/pool-panel.md"
  - "specs/web/epics/USE-daily-use/ux/work/week/words-and-access.md"
  - "specs/web/epics/USE-daily-use/ux/interactions/sessions.md"
  - "C-USE-week-6"
  - "C-USE-sessions-2"
  - "C-USE-sessions-3"
  - "D-USE-40"
  - "D-USE-42"
  - "D-USE-57"
  - "D-USE-96"
waiver: "The data side the work screens share: the pool panel names the pool and client order; Sessions names This session or All sessions. The screens that draw them cite their own files."
truth_files: "none: no behaviour ships; the work screens render on this"
qa: Q1
reviewers: []
focus: []
operator_review: false
planned_paths:
  - "apps/web/lib/fixtures/work/"
  - "apps/web/lib/fixtures/scenarios/"
  - "apps/web/lib/data/use-pool.ts"
  - "apps/web/lib/data/use-work-writes.ts"
  - "apps/web/lib/data/work-writes.test.ts"
depends_on:
  - "USE-7"
  - "USE-8"
  - "USE-9"
  - "USE-36"
  - "USE-32"
out_of_scope:
  - "Linear, Google, connections and client mappings on fixtures: USE-56"
  - "The week, set-up writes, events and block items: USE-36"
  - "createTask and placeIssues: USE-51 and USE-52"
  - "useWorkClock: USE-23"
  - "Each screen's own ?state= scenarios: its own ticket"
criteria:
  - id: C1
    statement: "Every record in the pool scenarios parses with its @syn/validators schema"
    evidence: test
    command: "yarn test"
  - id: C2
    statement: "readPool returns work items neither done nor archived, each with the dates its sessions sit on, its client and clientsEnabled"
    evidence: test
    command: "yarn test"
  - id: C3
    statement: "A tier change with sessions all moves every session of that item; with this, only the one slot; a second slot for one item on one date is refused with placeSlotInput's words"
    evidence: test
    command: "yarn test"
  - id: C4
    statement: "Undo after a place, a move, an unplace, a tier change, a work item edit, Mark the task done, Back to the pool or Remove from Synapse leaves the fixture server's records equal to before the write"
    evidence: test
    command: "yarn test"
  - id: C5
    statement: "Client order written through setClientOrder is the order readPool groups by; Mark the task done sets the item's doneAt and every open session's; Remove from Synapse archives the item"
    evidence: test
    command: "yarn test"
  - id: C6
    statement: "The web app type-checks"
    evidence: check
    command: "yarn check-types"
---

# Contract — work-writes-fixtures

## Build notes

Wave 2, after USE-32 and USE-36. USE-36 gives the planner side (the week, blocks, items, slots, events, Undo); USE-51 and USE-52 add `createTask` and `placeIssues` to `useWorkWrites`. This ticket adds the rest of the work side once, so the Today, Week, This week and Item sheet tickets compose hooks instead of each adding writes.

- **Decisions that apply:**
  - D-USE-40, D-USE-42: a second day for one item is a session, never a copy; one item sits once per date (`slots` unique `(work_item_id, on_date)`).
  - D-USE-57 and Sessions: a tier change on one session asks This session (the default) or All sessions; All moves every session. A session's Done is the slot's, never the task's. Placing, moving and removing write nothing to Linear.
  - D-USE-96: one client order, kept by drag in the pool or in Settings; it groups the pool and breaks Sort's ties.
  - Data contract: the task is done when marked done or Linear closes it, and every open session closes with it; Remove from Synapse archives (`archived_at`).
- **Interfaces:**
  - Server reads: `readPool(): Promise<PoolRecords>` (work items, their slots, clients, `clientsEnabled`).
  - Server writes, each returning USE-36's `{ undo }`: `placeWork({ workItemId, dateKey, blockId, tier, sortOrder })`, `moveWork({ slotId, dateKey?, blockId?, tier?, sortOrder? })`, `unplaceWork({ slotId })`, `setWorkTier({ slotId, tier, sessions: "this" | "all" })`, `editWorkItem(editWorkItemInput)`, `markTaskDone({ workItemId })`, `backToPool({ workItemId })`, `removeFromSynapse({ workItemId })`, `setClientOrder(clientOrderInput)`.
  - Hooks: `usePool()`; `useWorkWrites()` gains the writes above, each a mutation invalidating the day, the week and the pool, with `undo(token)` from USE-36.
  - Scenario `pool`: the ledger's placeholders (Kestrel Health, Alder Studio, Personal; KES-58, KES-63, BIZ-9, ALD-21, ALD-17 with sessions Mon to Wed, SYN-218 at 20 h, SYN-212 with three sessions, a Synapse-only item) on USE-36's `set-up-this-week` week.
- **Per path:** `work-writes.test.ts` holds C1 to C5, one `describe` per criterion. Fixture modules sit in `lib/fixtures/work/`; append to the scenario registry, never rewrite another domain's.
- **Gotchas:**
  - Session order is by date (USE-8's `countSessions`); never store "n of N".
  - The week is Monday first, from `day/boundaries.ts`.
- **Model:** Opus 5.5 at medium. A smaller model writes a second week read, keeps records in a store, or lets Undo leave a session behind.
