---
size: medium
objective: "Synapse polls each connected Linear workspace for Taylor's assigned issues, keeps a parsed snapshot, places and links issues as work items, and closes a task and its sessions when Linear closes the issue"
slice_type: "a polling integration over a third-party GraphQL API; risks a response shape we did not parse, a query over Linear's complexity cap, a rate limit hit by over-eager polling, and a closed issue that leaves sessions open"
non_negotiables:
  - "Linear's payload is parsed by a zod schema in @syn/validators, never trusted: an unknown field is dropped, a missing required field fails the sync and sets last_sync_error."
  - "An issue whose state type is completed, canceled or duplicate counts as closed; a sync that finds a placed issue closed closes the task (done_source linear) and every open session (D-USE-115, D-USE-97)."
  - "Polling only, on the data contract's cadence; no webhook."
  - "Every token is read only by services/linear, through token-crypto; every row write runs inside ctx.rls.execute()."
  - "On RATELIMITED the sync backs off until the reset header's time and sets last_sync_error; it never retries in a loop."
devs_call: "The GraphQL documents' exact selections after the schema spike; page sizes within the caps below; the client module's shape."
cites:
  - "specs/web/epics/USE-daily-use/ux/interactions/linear-status/index.md"
  - "C-USE-linear-status-1"
truth_files: "none: behaviour is the ledger's; only the data source changes"
qa: Q1
reviewers: []
focus: []
operator_review: false
planned_paths:
  - "packages/api/src/services/linear/"
  - "packages/api/src/routers/linear.ts"
  - "packages/api/src/services/work/"
  - "packages/validators/src/linear.ts"
  - "apps/web/lib/fixtures/work/place-issues.ts"
  - "apps/web/lib/data/live/"
  - "apps/web/lib/data/use-linear.ts"
depends_on:
  - "USE-100"
  - "USE-99"
out_of_scope:
  - "Writes to Linear (status, done, reopen, priority, description, estimate): USE-102"
  - "A Linear status change ending a timer: deferred by the ledger"
criteria:
  - id: C1
    statement: "The snapshot schema parses a recorded assigned-issues response kept beside the test, drops an unknown field, and fails on a missing identifier"
    evidence: test
    command: "yarn test"
  - id: C2
    statement: "A sync that finds a placed issue in a completed, canceled or duplicate state sets the work item done with done_source linear and closes every open session, in one transaction"
    evidence: test
    command: "yarn test"
  - id: C3
    statement: "A RATELIMITED response stops the sync, records last_sync_error and the reset time, and the next sync before that time makes no request"
    evidence: test
    command: "yarn test"
  - id: C4
    statement: "placeIssues creates each issue's work item and its session in one transaction; linkToLinear and unlinkFromLinear write the item's Linear columns as the fixture does"
    evidence: test
    command: "yarn test"
  - id: C5
    statement: "Each query document's computed complexity, by Linear's rule, stays under 10,000 points"
    evidence: test
    command: "yarn test"
  - id: C6
    statement: "With Taylor's workspace connected, the pool lists Taylor's assigned open issues, and an issue closed in Linear shows done on Today after Sync now"
    evidence: manual
    reason: "needs Taylor's live Linear workspace; one manual check"
  - id: C7
    statement: "The web app and the API type-check"
    evidence: check
    command: "yarn check-types"
id: USE-101
---

# Contract — linear-sync

## Build notes

The fixture's `readLinear` and `syncLinear`, the pool read's snapshot (USE-98 left it out), and the `WorkServer`'s `placeIssues`, `linkToLinear` and `unlinkFromLinear`.

- **Decisions that apply:**
  - D-USE-115: closed means a state type of completed, canceled or duplicate.
  - D-USE-97: Reopen on an issue closed in Linear also reopens it in Linear (USE-102 writes that).
  - Data contract: the fill is recomputed on every sync and never stored. Placing an issue creates its `work_items` row.
- **First, a schema spike.** The research could not render Linear's 51,000-line schema. Before writing documents, introspect the live API with Taylor's connection, confirm each field below, and record the response used by C1. Fields marked [NOT VERIFIED] may differ.
- **Facts** (copied from the platform research, checked 2026-10-13):
  - **Issues:** `viewer { assignedIssues(first: 50, filter: { state: { type: { nin: ["completed","canceled","duplicate"] } } }) { nodes { … } pageInfo { hasNextPage endCursor } } }`. Or `issues(filter: { assignee: { isMe: { eq: true } } })`.
    - Node fields [NOT VERIFIED]: `id identifier title parent { id } children(first: 10) { nodes { id identifier title state { type } } } state { id name type position color } priority priorityLabel estimate dueDate labels(first: 5) { nodes { name color } } project { id name icon color } team { id key name }`.
    - Placed issues already closed need their own read by id, so a closed one is seen: `issues(filter: { id: { in: [...] } })`.
  - **States:** `teams(first: 10) { nodes { id key states(first: 20) { nodes { id name type position color } } } }`. `position` is a Float; the first completed state is the lowest position with type completed.
  - **Pagination:** Relay `first`/`after` (50 by default). Continue on `endCursor` while `hasNextPage`. Max page size [NOT VERIFIED]. There is no documented `updatedAt` filter, so each sync is a full snapshot.
  - **Limits** (OAuth app, per user, per hour): 5,000 requests and 2,000,000 complexity points; one query at most 10,000 points.
    - Complexity: a property is 0.1, an object 1, and a connection multiplies its children by its page size.
    - Over the limit: HTTP 400 with `errors[].extensions.code = "RATELIMITED"`.
    - Headers: `X-RateLimit-Requests-Remaining` and `-Reset`; `X-Complexity`; `X-RateLimit-Complexity-Remaining` and `-Reset`. Resets are UTC epoch ms.
  - **Auth:** `Authorization: Bearer <access token>`, refreshed as in USE-100.
- **Cadence** (data contract): on opening the pool, on focus when the last sync is over 2 minutes old, every 5 minutes while visible, and on Sync now. The client triggers `linear.sync`. The server refuses a sync within 30 s of the last one per connection, and returns the snapshot.
- **Approach:**
  - `services/linear/client.ts`: `fetch` against `https://api.linear.app/graphql`, with the documents as constants.
  - `services/linear/sync.ts`: fetch, parse with `linearSnapshotSchema`, store `linear_snapshots`, run the closed-issue pass over placed items, set `last_synced_at` or `last_sync_error`.
  - `linear.read` returns the latest snapshot per connection, plus the outbox rows (USE-102 fills them).
  - Move `placeIssuesInput` from `lib/fixtures/work/place-issues.ts` into `@syn/validators/linear`.
- **Per path:** `sync.test.ts` (C2, C3) with a stubbed client; `snapshot.test.ts` (C1) with `__recorded__/assigned-issues.json`; `complexity.test.ts` (C5) computes each document's cost by the rule above.
- **Gotchas:**
  - A project `icon` may be an emoji or a named icon [NOT VERIFIED]. An emoji shows as itself; a named icon shows the project's colour square (calls.md).
  - Clients resolve item, then project, then workspace (USE-9's pure function); mappings are USE-104's.
- **Model:** Opus 5.5 at medium. A smaller model trusts the response shape and stores it unparsed.
