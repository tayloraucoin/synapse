---
id: "USE-65"
size: small
objective: "A work item's Item sheet carries its own fields on fixtures: Size's five cards setting the length range, Length as Exact or Range with the top the day plans with, Tier, When, Notes on a Synapse-only item, the ··· action sheet (Mark the task done, Back to the pool, Spread across the week, Open in Linear, Remove from Synapse, with their consequences), and Start with Done (or Done for today) at the foot"
slice_type: "a sheet's work fields; risks a size that leaves the range unset, the day planning with the bottom of a range, Remove from Synapse touching Linear, Mark the task done leaving sessions open, and the foot's buttons shown on a planning day"
non_negotiables:
  - "A size card resets the range from the size's defaults; the steppers then change it freely; the helper names the top the day plans with (C-USE-item-sheet-size-and-length-1)."
  - "Mark the task done closes every session and, on a linked item, the issue; Remove from Synapse leaves Linear unchanged (C-USE-item-sheet-work-more-open-2)."
  - "Start and Done at the foot call USE-59's and USE-60's functions; the sheet never writes clock events of its own."
  - "No Start or Done on a day not yet begun or on an opened day (C-USE-item-sheet-linear-linked-1)."
  - "Only @syn/ui components and preset tokens; each tier segment carries its square and word; no red on Remove (A-01 to A-20)."
devs_call: "File split under components/planner/item-sheet/; the size cards' component (a Plumb proposal: a row of five selectable cards in components/work/); how Exact maps to lengthMinMin = lengthMaxMin."
cites:
  - "specs/web/epics/USE-daily-use/ux/day/item-sheet/states/size-and-length.md"
  - "specs/web/epics/USE-daily-use/ux/day/item-sheet/states/work-more-open.md"
  - "specs/web/epics/USE-daily-use/ux/day/item-sheet/states/linear-linked.md"
  - "C-USE-item-sheet-size-and-length-1"
  - "C-USE-item-sheet-work-more-open-1"
  - "C-USE-item-sheet-work-more-open-2"
  - "C-USE-item-sheet-linear-linked-2"
  - "D-USE-36"
  - "D-USE-54"
  - "D-USE-57"
waiver: "A work item's fields: size and length, the work ··· and the linked sheet's size card criterion, all on the same sheet."
truth_files: "none: promotion carries day/item-sheet/"
qa: Q1
reviewers:
  - assay
focus:
  - "size and length and the work ··· at 402 against their captures (assay)"
operator_review: false
planned_paths:
  - "apps/web/components/planner/item-sheet/"
  - "apps/web/components/work/"
  - "apps/web/lib/data/use-item-sheet.ts"
  - "apps/web/lib/data/item-sheet-work.test.ts"
  - "apps/web/lib/fixtures/"
  - "specs/web/epics/USE-daily-use/tickets/USE-065-item-sheet-work/evidence/"
depends_on:
  - "USE-4"
  - "USE-7"
  - "USE-8"
  - "USE-10"
  - "USE-55"
  - "USE-56"
  - "USE-59"
  - "USE-60"
  - "USE-64"
out_of_scope:
  - "The Linear line, status, priority, Description synced, Unlink: USE-66"
  - "A tier change on one session (This session or All sessions), Sessions and Sub-issues rows, the firing panel: USE-67"
  - "Spread's sheet: USE-78; this ticket opens it; Back to the pool and When's Move to: USE-69's step"
criteria:
  - id: C1
    statement: "Medium picked writes size medium with lengthMinMin 60 and lengthMaxMin 120, and on a linked item one estimate write of 3; Exact writes one length; Mark the task done sets the item's doneAt and every session's; Remove from Synapse archives the item and writes nothing to Linear"
    evidence: test
    command: "yarn test"
  - id: C2
    statement: "At 402 size and length shows Size with \"Linear's estimate, both ways\" and the five cards with 3 Medium selected, Length with Exact / Range and \"− 1 h +\" to \"− 2 h +\", \"Set from Medium; change it freely. The day plans with 2 h, the top of the range.\", Tier, When \"Today, Work 9:30 ›\", Start and Done at the foot"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-065-item-sheet-work/evidence/size-and-length-402.png"
  - id: C3
    statement: "At 402 ··· on a work item shows the heading with emoji and \"· session 1 of 3\", Mark the task done with \"Closes Wed's and Thu's sessions and the Linear issue\", Back to the pool, Spread across the week, Open in Linear, Remove from Synapse with \"The Linear issue stays as it is\", none in red"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-065-item-sheet-work/evidence/work-more-open-402.png"
  - id: C4
    statement: "The web app type-checks"
    evidence: check
    command: "yarn check-types"
  - id: C5
    statement: "The web app lints clean"
    evidence: check
    command: "yarn lint"
---

# Contract — item-sheet-work

## Build notes

Wave 2, after USE-64. Match `ux/day/item-sheet/captures/size-and-length-402.png` and `work-more-open-402.png`. The size rules are `ux/dev-notes/size-and-length.md`.

- **Decisions that apply:**
  - The size dev note: Quick 15 to 30 min, Small 30 to 60, Medium 1 to 2 h, Large 2 to 4 h, Huge 4 h or more, with "Bigger than a block. Split it?" under Huge (it opens Spread). Points 1, 2, 3, 5, 8. Length is Exact or Range; units switch on their own (minutes under 90, then hours in half-hour steps). The day plans with the top of a range. Size syncs both ways with Linear's estimate; a plain item may have a size, or only a length.
  - D-USE-36: Notes and Description are one value; a Synapse-only item shows Notes (USE-66 draws Description on a linked one).
  - D-USE-57: the work ···: "Mark the task done" with "Closes <days>' sessions and the Linear issue"; "Back to the pool"; "Spread across the week"; "Open in Linear"; "Remove from Synapse" with "The Linear issue stays as it is". Undo in the toast for each [ASSUMPTION, as the state file]. Open in Linear hides on a Synapse-only item.
  - The scope line on the phone's work rows: "Mon 12 · Work · <Tier>", "· session 1 of 3" for a session (D-USE-54).
  - The foot: Start and Done for an item that is today's and not firing; a session's foot reads Start and "Done for today".
- **Interfaces:** `WorkItemFields { view; onSize; onLength; onTier; onNotes }`, `WorkMoreSheet` (`ActionRowSheet`), `SizeCards` in `components/work/`. `useItemSheet` gains `setSize`, `setLength`, `setTier` (one-day items; a session's goes through USE-67's ask), `markTaskDone`, `backToPool`, `removeFromSynapse`.
- **Per path:** `item-sheet-work.test.ts` holds C1. Scenarios `item-size-and-length`, `item-work-more-open`.
- **Gotchas:**
  - Size's estimate write is the outbox's `estimate` kind (D-USE-113, confirmed at the Tickets gate).
  - Unsized with no length counts 0 in fit (USE-8); the helper then reads no top.
- **Model:** Opus 5.5 at medium. A smaller model plans with the bottom of the range, or deletes the Linear issue on Remove.
