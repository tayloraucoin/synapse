---
id: "USE-32"
size: small
objective: "The wave 2 screens get the write inputs they need and the shapes Linear and Google are read in, as code: slot, work item, block item and client edits in @syn/validators, Linear's snapshot, connection and outbox views with no token field, Google's accounts and calendars, and the pure rule for how a Linear status is drawn and what it does here"
slice_type: "contract as code, pulled forward from the wiring; risks a token field on a view the browser reads, a status rule keyed on colour, an edit input looser than 0012's checks, and each UI ticket inventing its own copy of these"
non_negotiables:
  - "No view schema carries a token, refresh token or secret; a test reads every exported Linear and Google schema's keys."
  - "Every edit input refuses what 0012's CHECKs refuse, in the UX's words, as USE-3's inputs do."
  - "Linear's payload is parsed, never trusted: unknown fields are stripped, and a missing required field fails the parse."
  - "statusFill and statusEffect are pure and total: no I/O, no clock, one answer for any input."
  - "@syn/utils never imports @syn/validators; the status functions take structural input."
  - "No new dependency."
devs_call: "File split inside linear.ts and google.ts; whether the edit inputs derive from USE-3's inputs with .partial() or stand alone; helper names past the ones below; test-table layout."
cites:
  - "specs/web/epics/USE-daily-use/ux/interactions/linear-status/index.md"
  - "C-USE-linear-status-1"
  - "C-USE-linear-status-2"
  - "D-USE-35"
  - "D-USE-78"
waiver: "The shapes every wave 2 screen in Today, the Week, This week, the Item sheet and Settings reads or writes. Only the status rule is drawn on one surface (Linear status); the rest follow technical/data-contract.md, so the UI tickets import one copy instead of inventing their own."
truth_files: "none: no behaviour ships; the wave 2 screens and the wave 3 wiring import these"
qa: Q1
reviewers: []
focus: []
operator_review: false
planned_paths:
  - "packages/validators/src/planner.ts"
  - "packages/validators/src/work.ts"
  - "packages/validators/src/linear.ts"
  - "packages/validators/src/google.ts"
  - "packages/validators/src/index.ts"
  - "packages/validators/src/use-wave2.test.ts"
  - "packages/utils/src/work/linear-status.ts"
  - "packages/utils/src/work/linear-status.test.ts"
  - "packages/utils/src/work/index.ts"
depends_on:
  - "USE-3"
  - "USE-8"
out_of_scope:
  - "The linear_* and google_* tables, token columns and crypto: Linear connect (Q3, wave 3)"
  - "Fetching from Linear or Google, mapping their responses into these shapes, the outbox's sender: the Linear and Google sync tickets (wave 3)"
  - "Fixtures and hooks over these: USE-13 and USE-14"
criteria:
  - id: C1
    statement: "No exported Linear or Google schema has a key matching token, secret or refresh, at any depth"
    evidence: test
    command: "yarn test"
  - id: C2
    statement: "slotUpdateInput takes tier, sessions, onDate and lengthMin beside USE-16's fields and refuses a sessions choice with no tier; editWorkItemInput refuses a shortest length above the longest; each with its words"
    evidence: test
    command: "yarn test"
  - id: C3
    statement: "linearSnapshotPayload strips an unknown field, refuses an issue with no identifier or state, and accepts the seven state types including triage and duplicate"
    evidence: test
    command: "yarn test"
  - id: C4
    statement: "statusFill gives a started status position ÷ (statuses in its group + 1) by its place in the team's group, ordered by position: Lighthouse's five give 1/6 to 5/6; completed fills; backlog, unstarted and canceled are empty"
    evidence: test
    command: "yarn test"
  - id: C5
    statement: "statusEffect reads completed as check, canceled and duplicate as off today, Blocked, Paused and In review as waiting, Ongoing as back to the pool, the team's first started status as start, and anything else as none"
    evidence: test
    command: "yarn test"
  - id: C6
    statement: "@syn/validators and @syn/utils type-check"
    evidence: check
    command: "yarn check-types"
---

# Contract — wave2-inputs-and-shapes

## Build notes

Wave 2, first, after USE-3 and USE-8. The README's contract-first rule: lock the shapes before the UI, or the UI is built twice. USE-3 left the Linear and Google shapes to wave 3; the wave 2 screens draw Linear on every work row, so the shapes come forward. The wiring keeps them and maps Linear's responses into them.

- **Decisions that apply:**
  - D-USE-35: a status is drawn as Linear draws it. In progress is yellow and part filled; the fill comes from its place in its group.
  - The dev note: inside the Started group, ordered by position, fill = position ÷ (statuses in the group + 1). Completed is a full disc with a check; Backlog a dotted ring; Unstarted an empty ring; Canceled a grey disc with a cross. Recompute on every sync; never store the fraction.
  - D-USE-78 and the status sheet: In progress "starts the timer"; Ongoing "off today, back to the pool"; Blocked, Paused and In review "moves to Waiting"; Done "checks it off"; Canceled and Duplicate "takes it off today". The names are the workspace's own [ASSUMPTION: matched by name as drawn, since Blocked sits in Unstarted].
  - Data contract: a session's tier change asks This session or All sessions; a plain Done's Change is `took_min`; Linear's payload is parsed by zod and an unknown field dropped; tokens never reach a browser.
  - Notes and Linear's description are one value (D-USE-36), so an issue carries its description. D-USE-113: the outbox writes status, done, reopen, priority and description; Assignee is not written. D-USE-115: completed, canceled and duplicate count as closed.
- **Interfaces:**
  - `planner.ts`: USE-16 (the Now thread) adds `slotUpdateInput { id; doneAt?; tookMin?; sortOrder?; skipped?; blockId? }`. This ticket adds `tier?`, `sessions?: "this" | "all"`, `onDate?` and `lengthMin?` to that one schema; if USE-16 has not landed, create it with USE-16's fields too. Whichever lands second merges: never two slot-edit schemas. Also `removeSlotInput { id }` and `editBlockItemInput { id } & partial of blockItemInput` (Make it Monday's usual). A day event stays USE-3's `dayEventInput`.
  - `work.ts`: `workItemRecord` gains `linearConnectionId` and `linearIssueId` (nullable, 0012's columns); `editWorkItemInput { id } & partial of workItemInput`, with the range refine; `clientOrderInput { ids: uuid[] }`; `clientsEnabledInput { enabled }`.
  - `linear.ts`: `linearOrganizationSchema { id; name; urlKey; logoUrl | null }`, `linearTeamSchema { id; key; name; icon | null }`, `linearProjectSchema { id; name; icon | null; color }`, `linearWorkflowStateSchema { id; name; type; position: number; color; teamId }` with `type` in triage, backlog, unstarted, started, completed, canceled, duplicate, `linearIssueSchema { id; identifier; title; description | null; url; stateId; priority: 0–4; estimate | null; dueDate | null; labels: { name; color }[]; projectId | null; teamId; parentId | null; assignedToMe }`, `linearSnapshotPayload` (the five lists), `linearConnectionView { id; organizationName; urlKey; logoUrl; clientId | null; perProject; lastSyncedAt | null; lastSyncError | null }`, `linearWriteView { id; workItemId; kind: status | done | reopen | priority | description | estimate; state: pending | sent | failed; createdAt }` (D-USE-113, with the estimate Taylor confirmed at the Tickets gate), `linearIssueWriteInput { workItemId; stateId?; priority?; description?; estimate? }` with exactly one of the four, `linearProjectClientInput { connectionId; projectId; clientId | null }`.
  - `google.ts`: `googleAccountView { id; email; label }`, `googleCalendarView { id; accountId; name; color; primary; enabled }`, `googleCalendarToggleInput { calendarId; enabled }`.
  - `@syn/utils` `work/linear-status.ts`: `statusFill(state: { id; type; position; teamId }, states): number` (0 to 1) and `statusEffect(state, states): "check" | "off_today" | "waiting" | "to_pool" | "start" | "none"`.
- **Per path:** `use-wave2.test.ts` holds C1 to C3, one `describe` per criterion. `linear-status.test.ts` holds C4 and C5. Append to `work/index.ts` under USE-8's barrel; never reorder.
- **Gotchas:**
  - Linear's priority is 0 (none) to 4 (low), with 1 urgent. The UI's chip words (Urgent, High, Normal, Low) are the screens'.
  - The research marks the issue fields [NOT VERIFIED] until the sync ticket's spike. These shapes are ours: the sync maps whatever Linear returns into them.
  - Group by `teamId` before ordering by `position`: two teams' started groups never share a denominator.
- **Model:** Opus 5.5 at medium. A smaller model puts the token on the connection view, or computes the fill from array order.
