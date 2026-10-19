---
id: "USE-66"
size: small
objective: "A linked work item's Item sheet shows Linear on fixtures: the Linear line (status chip, ID, project, Linear ↗), Priority, Assignee and the synced Description; the chip opens the team's whole workflow grouped as in Linear with each status's consequence here; a write shows \"Updating Linear\", a failure keeps Synapse's value with Try again, offline waits, a close in Linear checks the item, and ··· offers Unlink with Undo"
slice_type: "Linear's states inside a sheet; risks a failed write drawn red or reverting the field, a status drawn without its word, Unlink touching Linear or losing the description, and status changes that skip statusEffect's consequence here"
non_negotiables:
  - "A changed field shows its new value at once; a failed write keeps it with \"Not updated in Linear. <Status> is kept here.\" and Try again, in ink, never red (C-USE-item-sheet-linear-failed-1)."
  - "Every status shows its shape (USE-10's LinearStatusShape, statusFill) with its word; priority its mark with its word; tier its square with its word (C-USE-item-sheet-4)."
  - "A picked status takes statusEffect's consequence here: Waiting, off today, back to the pool, start, or checked (C-USE-linear-status-status-sheet-2, -3)."
  - "Unlink asks nothing, keeps the item as a plain item with the description as notes, touches nothing in Linear, and offers Undo (C-USE-item-sheet-linear-more-open-2)."
  - "Assignee is shown and never written (D-USE-113)."
  - "Only @syn/ui components and preset tokens; Linear's own colours come only through LinearStatusShape and PriorityMark."
devs_call: "Whether the status list is a step inside the sheet or a ResponsiveSheet over it (the status sheet's form first); Show all's expand; the markdown rendering (@syn/ui's existing text parts, no new dependency)."
cites:
  - "specs/web/epics/USE-daily-use/ux/interactions/linear-status/index.md"
  - "specs/web/epics/USE-daily-use/ux/interactions/linear-status/states/change-status.md"
  - "specs/web/epics/USE-daily-use/ux/interactions/linear-status/states/status-sheet.md"
  - "specs/web/epics/USE-daily-use/ux/day/item-sheet/words-and-access.md"
  - "specs/web/epics/USE-daily-use/ux/day/item-sheet/states/linear-linked.md"
  - "specs/web/epics/USE-daily-use/ux/day/item-sheet/states/linear-syncing.md"
  - "specs/web/epics/USE-daily-use/ux/day/item-sheet/states/linear-failed.md"
  - "specs/web/epics/USE-daily-use/ux/day/item-sheet/states/linear-done.md"
  - "specs/web/epics/USE-daily-use/ux/day/item-sheet/states/linear-priority.md"
  - "specs/web/epics/USE-daily-use/ux/day/item-sheet/states/linear-more-open.md"
  - "specs/web/epics/USE-daily-use/ux/day/item-sheet/states/size-and-length.md"
  - "C-USE-linear-status-1"
  - "C-USE-linear-status-2"
  - "C-USE-linear-status-3"
  - "C-USE-linear-status-change-status-1"
  - "C-USE-linear-status-change-status-2"
  - "C-USE-linear-status-status-sheet-1"
  - "C-USE-linear-status-status-sheet-2"
  - "C-USE-linear-status-status-sheet-3"
  - "C-USE-item-sheet-3"
  - "C-USE-item-sheet-4"
  - "C-USE-item-sheet-linear-linked-1"
  - "C-USE-item-sheet-linear-syncing-1"
  - "C-USE-item-sheet-linear-failed-1"
  - "C-USE-item-sheet-linear-failed-2"
  - "C-USE-item-sheet-linear-done-1"
  - "C-USE-item-sheet-linear-done-2"
  - "C-USE-item-sheet-linear-priority-1"
  - "C-USE-item-sheet-linear-priority-2"
  - "C-USE-item-sheet-linear-more-open-1"
  - "C-USE-item-sheet-linear-more-open-2"
  - "C-USE-item-sheet-size-and-length-2"
  - "D-USE-35"
  - "D-USE-36"
  - "D-USE-78"
waiver: "The Linear status interaction, with the Item sheet's Linear states folded in (linked, syncing, failed, closed, priority, linked ···): each is the chip or a line under the Linear line, from the same outbox."
truth_files: "none: promotion carries day/item-sheet/ and interactions/linear-status/"
qa: Q1
reviewers:
  - assay
focus:
  - "linear linked, syncing, failed, closed in Linear, priority, linked ··· and the status sheet at 402 against their captures (assay)"
operator_review: false
planned_paths:
  - "apps/web/components/planner/item-sheet/"
  - "apps/web/components/work/"
  - "apps/web/lib/data/use-item-sheet.ts"
  - "apps/web/lib/data/item-sheet-linear.test.ts"
  - "apps/web/lib/fixtures/"
  - "specs/web/epics/USE-daily-use/tickets/USE-066-item-sheet-linear-status/evidence/"
depends_on:
  - "USE-4"
  - "USE-7"
  - "USE-10"
  - "USE-32"
  - "USE-56"
  - "USE-65"
out_of_scope:
  - "Linking an issue (Link a Linear issue), Linear not connected, the linked item from Now: USE-68"
  - "Waiting on Today: USE-63"
  - "The real outbox, conflict handling (\"Changed in Linear too\"): the Linear wiring"
criteria:
  - id: C1
    statement: "Picking each Lighthouse status writes one outbox row and applies statusEffect here: Paused moves the item to Waiting, Canceled takes it off today, Ongoing returns it to the pool, Done checks it; Unlink sets notes to the description, clears the link, writes no outbox row, and Undo restores it"
    evidence: test
    command: "yarn test"
  - id: C2
    statement: "At 402 linked shows the Linear line (In progress chip part filled, \"ENG-123\", \"Sync engine\", \"Linear ↗\"), Size, Length, Tier, Priority with High's bars, Assignee \"Taylor\", Description with \"Synced with Linear\" and Show all; no Start or Done before the day begins"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-066-item-sheet-linear-status/evidence/linear-linked-402.png"
  - id: C3
    statement: "At 402 the status list shows \"Moves it in Linear (Lighthouse)\", Backlog, Unstarted, Started and Completed and canceled groups, each status's shape in Linear's colour with its word and consequence, the current one checked"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-066-item-sheet-linear-status/evidence/status-sheet-402.png"
  - id: C4
    statement: "At 402: syncing shows \"Updating Linear\" with a small spinner; failed shows \"Not updated in Linear. In review is kept here.\" with Try again in ink; offline shows \"Updates Linear when back online\"; closed shows the chip at Done and \"Done in Linear. Checked off here too, at 10:42.\""
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-066-item-sheet-linear-status/evidence/linear-lines-402.png"
  - id: C5
    statement: "At 402 Priority opens \"Priority · changes it in Linear\" with Urgent, High (checked), Normal with \"Medium in Linear\" in blue, Low, a rule and No priority; linked ··· shows Move to…, Not today, a rule, Unlink from Linear with its consequence, and no Monday's usual"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-066-item-sheet-linear-status/evidence/priority-and-more-402.png"
  - id: C6
    statement: "The web app type-checks"
    evidence: check
    command: "yarn check-types"
  - id: C7
    statement: "The web app lints clean"
    evidence: check
    command: "yarn lint"
---

# Contract — item-sheet-linear-status

## Build notes

Wave 2, after USE-65. Match `ux/day/item-sheet/captures/` linear-linked, linear-syncing, linear-failed, linear-done, linear-priority, linear-more-open, and `ux/interactions/linear-status/captures/status-sheet-402.png`.

- **Decisions that apply:**
  - D-USE-35 and the fill note: a status is Linear's shape in the workspace's colour, part filled by its place in its group, always with its word. D-USE-78: the chip on the Item sheet is where status changes; a row's lead slot only fires.
  - The status list (status-sheet.md): "Status"; "Moves it in Linear (<workspace>)"; groups Backlog, Unstarted, Started, "Completed and canceled"; consequences "moves to Waiting", "starts the timer", "off today, back to the pool", "checks it off", "takes it off today". change-status.md's earlier dropdown carries the same content [judgment: the grouped list serves both files' criteria].
  - Checking a linked item moves the issue to the team's Done; unchecking moves it back to its status before. An open status picked on a closed item unchecks it here.
  - D-USE-36: Description is the item's notes on a linked item, "Synced with Linear", three lines then "Show all"; edits go to the issue (D-USE-113).
  - D-USE-113: priority writes to Linear ("Priority · changes it in Linear"; Normal draws in blue with "Medium in Linear"); Assignee is not written.
  - Unlink: "Unlink from Linear" with "The item stays here as a plain item. The issue in Linear is untouched. Undo is offered after."
  - Words: "Updating Linear"; "Not updated in Linear. <Status> is kept here."; "Updates Linear when back online"; "Done in Linear. Checked off here too, at <time>."; announced politely.
- **Interfaces:** `LinearFields`, `StatusList`, `PriorityMenu` in `components/planner/item-sheet/`; `useItemSheet` gains `setStatus`, `setPriority`, `setDescription`, `retryLinear`, `unlink` over `useLinear`.
- **Per path:** `item-sheet-linear.test.ts` holds C1. Scenarios `item-linear-linked`, `-syncing`, `-failed`, `-offline`, `-done`, `-priority`, `-more-open`, `-status`.
- **Gotchas:** C-USE-item-sheet-size-and-length-2 (an estimate changed in Linear moves Size here) is a sync scenario on fixtures: the snapshot's estimate changes and Size follows on read.
- **Model:** Opus 5.5 at medium. A smaller model reverts on failure, colours a status without its word, or deletes the description on Unlink.
