---
size: medium
objective: "A status change, Done, Reopen, a priority, the description or a size card's estimate on a linked item reaches Linear through an outbox, and a failed write reads 'Not updated in Linear.' with Try again"
slice_type: "an outbox to a third-party API; risks a write lost or sent twice, Synapse's own value rolled back by a failure, and a write to Linear of something the ledger keeps local"
non_negotiables:
  - "Synapse's value is written first and stands; a Linear failure never undoes it (data contract)."
  - "Every outgoing write is a linear_writes row first, in the same transaction as Synapse's change; it is sent after commit, and Try again resends the same row."
  - "Only the six kinds of D-USE-113 are ever sent: status, done, reopen, priority, description, estimate. Clients, firing, work time and a session's Done never reach Linear."
  - "Done moves the issue to its team's first completed state and stores the state it left in linear_prev_state_id; Reopen moves it back to that state (D-USE-97)."
  - "Tokens are read only by services/linear through token-crypto; rows are written inside ctx.rls.execute()."
devs_call: "Where the after-commit send runs (in the request, after the transaction resolves); the retry count before failed; the estimate mapping's helper."
cites:
  - "specs/web/epics/USE-daily-use/ux/interactions/linear-status/index.md"
  - "C-USE-linear-status-2"
truth_files: "none: behaviour is the ledger's; only the data source changes"
qa: Q1
reviewers: []
focus: []
operator_review: false
planned_paths:
  - "packages/api/src/services/linear/"
  - "packages/api/src/routers/linear.ts"
  - "packages/api/src/services/jobs/"
  - "packages/validators/src/linear.ts"
  - "apps/web/lib/data/live/"
depends_on:
  - "USE-101"
out_of_scope:
  - "Assignee: waits until it is drawn (D-USE-113)"
  - "A Linear status change ending a timer: deferred by the ledger"
criteria:
  - id: C1
    statement: "writeLinearIssue writes Synapse's value and a pending outbox row in one transaction; the send marks it sent, or failed with its error, and Synapse's value stays either way"
    evidence: test
    command: "yarn test"
  - id: C2
    statement: "writeLinearDone on writes the team's first completed state and stores the previous state; off writes that previous state back"
    evidence: test
    command: "yarn test"
  - id: C3
    statement: "retryLinearWrite resends a failed row once and never creates a second row for the same change"
    evidence: test
    command: "yarn test"
  - id: C4
    statement: "No outbox kind outside the six exists, and a write naming a client, a firing time, work time or a session's Done is refused before any row is written"
    evidence: test
    command: "yarn test"
  - id: C5
    statement: "On Taylor's workspace, a status change, Done, Reopen, a priority, a description and an estimate from Synapse each show in Linear"
    evidence: manual
    reason: "test-shape's one manual live check per Linear write, on Taylor's workspace"
  - id: C6
    statement: "The web app and the API type-check"
    evidence: check
    command: "yarn check-types"
id: USE-102
---

# Contract — linear-writes

## Build notes

The fixture's `writeLinearIssue`, `writeLinearDone` and `retryLinearWrite`, and the fake sender (`sendLinearOutbox`), which becomes real.

- **Decisions that apply:**
  - D-USE-113: the outbox writes status, done, reopen, priority, description and the estimate (a size card writes it, the size dev note's "both ways"). Priority is drawn as "changes it in Linear"; Description is synced with the issue. Assignee waits until it is drawn.
  - D-USE-97: Reopen on an issue closed in Linear reopens it in Linear; the issue goes back to the status it had before it closed. A failed write reads "Not updated in Linear." with Try again, as any Linear write does.
  - Data contract: checking an item moves the issue to the team's first completed state; unchecking moves it back to `linear_prev_state_id`.
- **Facts** (copied from the platform research, checked 2026-10-13; confirm in USE-101's schema spike):
  - The write is `issueUpdate(id: String!, input: IssueUpdateInput!) { success issue { id state { id } } }`, with `input.stateId` for status, done and reopen [NOT VERIFIED].
  - `priority` is an Int, 0 to 4 (0 none, 1 urgent … 4 low) [NOT VERIFIED]; `description` is Markdown [NOT VERIFIED].
  - `estimate`: the field and the team's scale (points or t-shirt, likely `team.issueEstimationType`) are not researched. Map Synapse's size to the team's scale in one pure function, and confirm the scale in the spike.
  - First completed state: the team's states with type `completed`, sorted by `position` ascending, first one; cached per team in the snapshot. A team may have several and has no documented default.
  - Errors: only `RATELIMITED` is documented; treat any other `errors[]` or `success: false` as failed, keeping the message in `last_error`.
- **Approach:**
  - `services/linear/outbox.ts`: `enqueue(tx, write)` inside the change's transaction, and `send(rls, rowId)` after commit.
  - Sending also runs on each sync (USE-101), for pending rows older than a minute, and from a scheduler job every 5 minutes (USE-105 registers it; this ticket writes the job).
  - `linear.write`, `linear.writeDone` and `linear.retry` return `linearWriteView`.
  - New inputs: `linearDoneInput` (`{ workItemId, done, issueId? }`) and `linearRetryInput` (`{ id }`).
- **Per path:** `outbox.test.ts` (C1 to C4) with a stubbed client; `estimate.ts` with its own table test.
- **Gotchas:**
  - The fixture shows "Moving to <status> in Linear…" while pending. Return the row's `state`, so the hook shows the same words.
  - A disconnected workspace's rows cascade away (USE-100).
- **Model:** Opus 5.5 at medium. A smaller model sends inside the transaction and rolls back Synapse's change on a Linear error.
