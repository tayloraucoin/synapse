---
id: "USE-51"
size: small
objective: "+ Add offers the same four in order at both widths (Task to a tier, From the pool, To-do, Event): the phone's Add sheet and the desk's + Add menu, and New task with title, client, tier, size and days, whose two or more days make sessions of one task, whose fit line names each day's tier end, and whose no-days form saves to the pool and never to Linear, on fixtures"
slice_type: "an entry sheet and a form on fixtures; risks the four in a different order per width, a task copied per day instead of sessions of one, a fit line that counts or reds, a day with no Work block that can be picked, and a Synapse-only task written to Linear"
non_negotiables:
  - "The four, in this order, at both widths (D-USE-54); each opens its own step; × or a swipe down adds nothing."
  - "Two or more days make sessions of one task (one work item, a slot per day), never copies."
  - "With no days the task waits in the pool and nothing is written to Linear (D-USE-57)."
  - "The fit line uses USE-8's fitInBlock per picked day, in words, never a count, never red; a day with no Work block can't be picked and the line says so."
  - "Writes through the data hooks on fixtures (workItemInput, then placeSlot per day); a Toaster names where it went with Undo."
  - "Only @syn/ui components and preset tokens; tier and size are radio groups named in words, colour never alone."
  - "Every state of this ticket is reachable by ?state= (canon C-P08)."
devs_call: "File split under components/work/; the form module's shape; whether the desk menu's T, P, D, E keys ship now."
cites:
  - "specs/web/epics/USE-daily-use/ux/interactions/add/index.md"
  - "C-USE-add-1"
  - "C-USE-add-2"
  - "D-USE-41"
  - "D-USE-42"
  - "D-USE-51"
  - "D-USE-54"
  - "D-USE-57"
  - "D-USE-65"
truth_files: "none: interactions/add/ is promoted with USE"
qa: Q1
reviewers:
  - assay
focus:
  - "the Add sheet, New task with two days and save to the pool at 402, and the desk menu at 1728 (assay)"
operator_review: false
planned_paths:
  - "apps/web/components/work/add/"
  - "apps/web/lib/fixtures/"
  - "apps/web/lib/data/use-work-writes.ts"
  - "specs/web/epics/USE-daily-use/tickets/USE-051-add-sheet-and-new-task/evidence/"
depends_on:
  - "USE-4"
  - "USE-7"
  - "USE-8"
  - "USE-10"
  - "USE-36"
out_of_scope:
  - "Mounting + in Now's header and + Add in Today's header: Now's and Today's tickets"
  - "From the pool's sheet and Place: the place-from-the-pool ticket; From Linear by size: its own ticket"
  - "The To-do sheet: USE-28; Event: the Add event ticket"
  - "The client and project picker's own screens: the clients ticket"
criteria:
  - id: C1
    statement: "The Add sheet names \"Mon 12 · Work, 9:30 to 12:00\" and lists Task to a tier, From the pool, To-do and Event in order, each with its muted line and icon, × on the right"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-051-add-sheet-and-new-task/evidence/add-sheet-402.png"
  - id: C2
    statement: "At 1728 + Add opens the same four as a dropdown under the button, a rule before Event"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-051-add-sheet-and-new-task/evidence/add-menu-1728.png"
  - id: C3
    statement: "New task with Primary, 3 Medium (\"1 to 2 h\"), M 12 and W 14 picked, S 17 and S 18 dashed, reads \"Mon's Primary runs to 11:40 at the top of its ranges; Wed's to 11:10. Sat and Sun have no Work block.\" over \"Add to Primary, Mon and Wed\""
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-051-add-sheet-and-new-task/evidence/new-task-402.png"
  - id: C4
    statement: "Opened from the pool with no days, New task shows \"Pool · New task\", Days \"None yet\", \"With no days it waits in the pool. It isn't sent to Linear; Synapse-only work stays here.\" and Save to the pool"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-051-add-sheet-and-new-task/evidence/save-to-the-pool-402.png"
  - id: C5
    statement: "Through the fixtures, two days write one work item and two slots with the tier; no days writes one work item with no slot and no Linear write; Undo removes what was written"
    evidence: test
    command: "yarn test"
  - id: C6
    statement: "The web app type-checks"
    evidence: check
    command: "yarn check-types"
  - id: C7
    statement: "Lint passes"
    evidence: check
    command: "yarn lint"
---

# Contract — add-sheet-and-new-task

## Build notes

Captures to match: `ux/interactions/add/captures/` (add-sheet, new-task, save-to-the-pool) and the menu in `ux/work/today/captures/running-1728.png`. Paper file `01M49AX02VV4SSBKNCN6NRTS6Y`, page "USE — work" (phone-edit rows) and "USE — desk". Captures on `/dev/parts?state=add-<state>` (USE-7's host) until the headers that open them exist.

- **Decisions that apply:**
  - D-USE-54: + Add on the phone is a sheet with the desk's four; New task has title, client and project (optional), Tier, Size (sets the range), Days; two or more days make sessions of one task; a fit line per day; the action names the days.
  - D-USE-42: the desk's + Add ⌄ is a shadcn `DropdownMenu`; D-USE-41: "+ Add to <tier>" skips the menu and opens New task with the tier set (also Block view's New item).
  - D-USE-51: + in the Now header opens Add. D-USE-108 (1): × on the right on the Add sheet.
  - D-USE-57: no days saves to the pool, never to Linear; Placed with Undo. D-USE-98: Due is Synapse's own date and drives the pool's order.
  - D-USE-65: at the desk New task opens in the right panel at `--sheet-w` with the phone's fields.
  - Size words and ranges: 1 Quick, 2 Small, 3 Medium, 5 Large, 8 Huge (`dev-notes/size-and-length.md`); the range stays editable.
  - Access: the sheet traps focus; × "Close"; each row one button named label and line; day chips toggle buttons "Monday 12, selected"; a dashed day disabled with "no Work block" in its name; the fit line announced politely.
- **Interfaces:** `AddSheet`, `AddMenu`, `NewTaskSheet { dateKey; blockId?; tier?; from: "add" | "pool" }` and `new-task/form.ts` (pure) in `components/work/add/`; `useWorkWrites()` with `createTask({ item, tier, days })` over a fixture write that creates the work item then one slot per day; the client picker lists clients only until Linear lands (project reads none).
- **Gotchas:**
  - "Issues assigned to <name>" names the signed-in person, never "you".
  - Gloss passed every string; keep them as drawn.
- **Model:** Opus 5.5 at medium. A smaller model copies the task per day, lets a dashed day be picked, or writes the pool task out.
