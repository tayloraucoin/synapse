---
id: "USE-56"
size: small
objective: "Linear, Google and clients run on fixtures: two Linear workspaces with a snapshot of issues, teams, projects and workflow states, an outbox whose writes go pending then sent or failed, project-to-client mappings, a Google account with calendars, and hooks that join each work item to its issue, status, project and client"
slice_type: "the data seam's integration side; risks a token reaching a hook, Linear's status written first and Synapse's value second, a failed write reverting what Synapse shows, and a client resolved by hand instead of by resolveClient"
non_negotiables:
  - "Every fixture parses with USE-32's view schemas; no view carries a token, and no hook returns one."
  - "Synapse's value is written first and stands: a failed outbox row never reverts it (data contract)."
  - "Placing, filtering, clients and tiers write nothing to Linear's outbox; only status, done and reopen do (D-USE-57)."
  - "A work item's client comes from USE-9's resolveClient, never resolved by hand in a hook."
  - "A status's fill and effect come from USE-32's statusFill and statusEffect, recomputed on read, never stored; nothing under lib/data or lib/fixtures imports @syn/db, @syn/api or tRPC."
  - "One Linear snapshot: USE-52 adds one with useLinearIssues; extend it, or create it as USE-52 says if it has not landed. Never two."
devs_call: "File split inside lib/fixtures; how a scenario sets the next write's outcome (sent, failed, held while offline); placeholder names; query keys."
cites:
  - "specs/web/epics/USE-daily-use/ux/account/settings/index.md"
  - "specs/web/epics/USE-daily-use/ux/account/settings/words-and-access.md"
  - "C-USE-settings-4"
  - "D-USE-57"
  - "D-USE-91"
waiver: "The integration data every Linear-showing screen shares; Settings › Connections holds the workspaces, calendars and client mappings it reads. The screens cite their own files."
truth_files: "none: no behaviour ships; the work screens and Settings render on this"
qa: Q1
reviewers: []
focus: []
operator_review: false
planned_paths:
  - "apps/web/lib/fixtures/"
  - "apps/web/lib/data/use-linear.ts"
  - "apps/web/lib/data/use-connections.ts"
  - "apps/web/lib/data/use-clients.ts"
  - "apps/web/lib/data/integrations.test.ts"
depends_on:
  - "USE-7"
  - "USE-9"
  - "USE-32"
  - "USE-55"
out_of_scope:
  - "OAuth, tokens, the real sync and the outbox's sender: Linear connect and sync, Google Calendar (wave 3)"
  - "Google's event bands on the day: the Schedule and day tickets"
  - "Each screen's Linear states: its own ticket"
criteria:
  - id: C1
    statement: "Every Linear and Google fixture parses with USE-32's schemas, and no value any hook here returns has a token key"
    evidence: test
    command: "yarn test"
  - id: C2
    statement: "useLinear's join gives a linked work item its identifier, status with fill and effect, priority, estimate, labels, project, team, description and URL, and gives a Synapse-only item none"
    evidence: test
    command: "yarn test"
  - id: C3
    statement: "A status or priority write appends a pending outbox row and changes the item at once; the scenario then marks it sent or failed, and failed leaves the new status in place with Try again resending it"
    evidence: test
    command: "yarn test"
  - id: C4
    statement: "With clients off every item resolves to no client; with clients on, a per-project workspace's unmapped project resolves to none and a mapped one to its client"
    evidence: test
    command: "yarn test"
  - id: C5
    statement: "Sync now sets lastSyncedAt to the fixture clock's now; a scenario whose snapshot closes a placed issue marks the item done with doneSource linear"
    evidence: test
    command: "yarn test"
  - id: C6
    statement: "The web app type-checks"
    evidence: check
    command: "yarn check-types"
---

# Contract — linear-google-fixtures

## Build notes

Wave 2, after USE-32 and the planner fixtures. Every work row, the pool, the Item sheet and Settings show Linear; they read it here.

- **Decisions that apply:**
  - Data contract: Synapse's value is written first and stands; a failed row shows "Not updated in Linear." with Try again. Checking moves the issue to the team's first completed state; unchecking moves it back to `linear_prev_state_id`. A sync that finds a placed issue closed closes the task and every session (D-USE-97).
  - D-USE-57: placing and Synapse-only work are never written to Linear.
  - D-USE-91: with clients on, each workspace maps to one client or per project; D-USE-96: one client order.
  - D-USE-41: background sync and Sync now; the Linear tab only when connected.
  - Google: read-only; several calendars, each on or off.
- **Interfaces:**
  - Server reads: `readConnections()` (Linear connection views, Google accounts and calendars, `clientsEnabled`, project-client maps), `readLinear()` (each connection's snapshot and the outbox).
  - Server writes: `writeLinearIssue(linearIssueWriteInput)` (status, priority or description), `retryLinearWrite(id)`, `syncLinear(connectionId?)`, `writeProjectClient(linearProjectClientInput)`, `writeCalendar(googleCalendarToggleInput)`, `writeClientsEnabled(clientsEnabledInput)`, `writeClient(clientInput)`, `disconnect(connectionId)`.
  - Hooks: `useLinear()` composes USE-52's `useLinearIssues()`, returning `{ issueFor(workItem), statesFor(teamId), notInPool, connections, lastSyncedAt, setStatus, retry, syncNow }`; `useConnections()`; `useClients()` (records, order, `clientFor(workItem)` through `resolveClient`).
  - Scenarios: `default` gains (or keeps, if USE-52 drew them) a Kestrel Health workspace (teams Product Engineering and Business Development; projects Patient portal, Partnerships) and Taylor's own workspace (Brand site, Synapse), Lighthouse's workflow (Backlog; Blocked, Todo, Up next; In progress, Ongoing, Paused, In review, Changes requested; Done, Canceled, Duplicate), and issues for every placeholder in the pool and Today. Named ones: `linear-off`, `linear-write-fails`, `linear-closed`, `clients-on`, `clients-per-project`.
- **Per path:** `integrations.test.ts` holds C1 to C5, one `describe` per criterion. `use-linear.ts`, `use-connections.ts`, `use-clients.ts` are the hooks; the fixture modules sit in their own files.
- **Gotchas:**
  - The status's colour is Linear's; the screens draw it through `LinearStatusShape` (USE-10), never a token named for a status.
  - "Not in the pool" is an assigned, open issue with no `work_items` row: placing creates the row.
  - Offline holds a write as pending; the persister ticket (C4) replays it. Here, the `offline` scenario simply never resolves the write.
- **Model:** Opus 5.5 at medium. A smaller model reverts the status on a failed write, or resolves a client from the workspace when the project says none.
