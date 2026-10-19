---
id: "USE-50"
size: small
objective: "Block view edits a This week Work block on its four tiers (the fit line, an add row per tier with New item, From the pool and From Linear) and a To-dos block (its add menu, the From To-dos picker with its type filter, a dated plan inside as a band, a Sunday reset with a repeating chore), on fixtures"
slice_type: "two kinds' editors on fixtures; risks a tier change that reaches the usual week, a fit line that counts or turns red, a type filter that filters the block, a to-do already in the block picked twice, and a to-do split across an event"
non_negotiables:
  - "From This week every change is that date's only; the usual Monday is unchanged."
  - "The fit line says where the plan ends in words from USE-8's fitInBlock, never a count, never red; Urgent shows its add row even when empty in editing."
  - "A To-dos block takes any type; the Type chips filter the picker's list only, never the block."
  - "The picker lists to-dos with no day, oldest first (USE-9's todoPool); one already in the block is greyed with \"In <block>\" and can't be picked."
  - "An event inside a To-dos block is a pinned plum band; a to-do that would cross it moves after it whole."
  - "Data through useBlockView and usePlannerWrites; only @syn/ui components and preset tokens; colour never alone."
  - "Every state of this ticket is reachable by ?state= (canon C-P08)."
devs_call: "Whether the picker is its own component in components/planner/; file split; the grip's drag across tiers (within a tier first)."
cites:
  - "specs/web/epics/USE-daily-use/ux/day/block-view/by-kind.md"
  - "C-USE-block-view-kind-2"
  - "C-USE-block-view-kind-3"
  - "C-USE-block-view-kind-4"
  - "D-USE-79"
truth_files: "none: day/block-view/ is promoted with USE"
qa: Q1
reviewers:
  - assay
focus:
  - "work tiers, add to a tier and the From To-dos picker at 402 against day/block-view/captures/ (assay)"
operator_review: false
planned_paths:
  - "apps/web/components/planner/block-view/"
  - "apps/web/components/planner/todos-picker/"
  - "apps/web/app/(shell)/days/block/"
  - "apps/web/lib/fixtures/scenarios/"
  - "specs/web/epics/USE-daily-use/tickets/USE-050-block-view-work-and-todos/evidence/"
depends_on:
  - "USE-4"
  - "USE-7"
  - "USE-8"
  - "USE-9"
  - "USE-10"
  - "USE-36"
  - "USE-49"
out_of_scope:
  - "What New item, From the pool and From Linear open: the New task sheet (the add ticket), the place-from-the-pool ticket, and Linear's tickets"
  - "The To-do sheet from a to-do's name: USE-28"
  - "Go mode's pull and return at the block's end: Now's To-dos ticket"
criteria:
  - id: C1
    statement: "Work on Mon 12 shows \"‹ Mon 12 › Work\", \"9:30 to 12:00 · this Monday only\", Done and ···, the fit line, and Urgent, Primary, Secondary and Stretch each with its square, rows with ID and size, the range trailing, the grip trailing, and its add row"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-050-block-view-work-and-todos/evidence/work-tiers-402.png"
  - id: C2
    statement: "Add to Primary takes a fill and opens \"Add to Primary\": New item, From the pool and From Linear, each with its muted line"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-050-block-view-work-and-todos/evidence/work-add-to-a-tier-402.png"
  - id: C3
    statement: "Errands on Sat 17 shows \"To-dos · 10:00 to 12:30 · this Saturday\", to-dos with icons, lengths and grips, and its add menu: From To-dos, New to-do and \"A new one lands here and in To-dos.\""
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-050-block-view-work-and-todos/evidence/todos-add-open-402.png"
  - id: C4
    statement: "From To-dos shows \"Into Errands · Sat 17, 10:00 to 12:30\", All types selected, rows with icon, meta and length, Groceries greyed \"In Errands\", the footer \"Adds Return the parcel. Errands then runs to 11:35, inside its time.\" and Add to Errands"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-050-block-view-work-and-todos/evidence/todos-pool-402.png"
  - id: C5
    statement: "Coffee with Sam at 11:00 sits in Errands as a plum band with \"Personal · 11:00 to 11:30\", no grip or length, and Groceries after it whole at 11:30"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-050-block-view-work-and-todos/evidence/todos-dated-plan-402.png"
  - id: C6
    statement: "Sunday reset shows its three home jobs on the rail, no Type or place control on the block, and \"Nothing after this today\" under the end line"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-050-block-view-work-and-todos/evidence/todos-sunday-reset-402.png"
  - id: C7
    statement: "The web app type-checks"
    evidence: check
    command: "yarn check-types"
  - id: C8
    statement: "Lint passes"
    evidence: check
    command: "yarn lint"
---

# Contract — block-view-work-and-todos

## Build notes

On USE-49's editing mode. Paper file `01M49AX02VV4SSBKNCN6NRTS6Y`, page "USE — set up", row "Block view from Set my days" (y 3780). Captures to match in `ux/day/block-view/captures/` (work-tiers, work-add-to-a-tier, todos-add-open, todos-pool, todos-dated-plan, todos-sunday-reset). Take ours at `/days/block/<id>?date=<date>&state=<state>`.

- **Decisions that apply:**
  - D-USE-31: the tiers, coloured, Urgent above Primary, an add row per tier; Urgent stays as an add row when empty in editing. D-USE-38, D-USE-79: Urgent red, Primary leaf, Secondary amber, Stretch slate (the red is a named bend).
  - D-USE-86: the grip sits at the trailing edge on work rows too (the frame draws it leading).
  - D-USE-41 and D-USE-31: the tier's dropdown is titled with the tier; New item, From the pool ("Work saved for later, not on a day yet"), From Linear ("Issues assigned to <name>", never "you").
  - A size sets a range; a length alone stands (`size-and-length.md`); a Linear row reads "<ID> · <points> <size>".
  - Open-5 round 4: a To-dos block fills from to-dos with no day, oldest first, any type; the picker keeps a type filter, All types by default; the chips show only the types listed. D-USE-74: undone to-dos go back to To-dos at the block's end.
  - D-USE-87: a to-do's length is the slot's (5 min until set); picks past the end read "Errands then runs to <time>, past its time." in ink, adding still allowed; no to-dos reads "Nothing in To-dos." over New to-do; the dashed "Free until <end>" builds in place of "Free from" and "Ends".
  - A dated plan is an event: a plum band at its time, pinned (D-USE-31, D-USE-79).
  - New to-do: an inline row typed as the add row, 5 min, landing in the block for this date and in To-dos (`todoInput` then `placeSlot`).
  - Access: the Type chips a single-select filter "Type, <value>"; each to-do's checkbox "<to-do>, <length>".
- **Interfaces:** `TodosPicker { block; dateKey; onAdd(todoIds) }` in `components/planner/todos-picker/`, a `ResponsiveSheet`; `BlockView` gains the tier sections and the To-dos add menu. Scenarios named for each state.
- **Gotchas:**
  - The fit line's variants (past the end, nothing in Primary) are words, never counts.
  - "Out" and "Home" in frame names mean nothing in the build.
- **Model:** Opus 5.5 at medium. A smaller model filters the block by type, lets a to-do be picked twice, or colours the fit line.
