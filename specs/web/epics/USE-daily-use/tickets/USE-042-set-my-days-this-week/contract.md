---
id: "USE-42"
size: medium
objective: "Set my days' This week works: the dated week and day, the 1024 list-detail, item icons in the column, the + with Event, the day's ··· (Reset to usual, Clear this day), a usual change naming its reach, a day's own change marked \"This day only\", a block dragged in time and an overlap with its one fix, and offline as D-USE-82 splits it, on fixtures"
slice_type: "the editing half of a surface on fixtures; risks a This week edit reaching the usual week, Clear without its one ask, a drag that moves other blocks, two fixed panes at 1024, the push leaking past 1023, and offline controls that look live"
non_negotiables:
  - "Data only through the set-up hooks; reach, overlaps and own changes come from them, never computed here."
  - "A This week edit changes that date only; Reset to usual and Clear this day each end in a Toaster with Undo."
  - "From 1024 list-detail: a fixed 320 week pane and a flexible day pane, a day always selected, no chips or \"Week\" in the pane; 768 to 1023 keep the push."
  - "Dragging a block moves only that block; an overlap shows both side by side, neither moved or deleted."
  - "Offline the day's own controls are faded and inert and the + gives way to the StatusLine; a block still opens."
  - "Only @syn/ui components and preset tokens; destructive rows in ink, never red; no second person, no counts."
  - "Every state of this ticket is reachable by ?state= (canon C-P08)."
devs_call: "The drag's implementation (the existing drag layer, no new dependency); file split; how the selected row's ink edge is drawn; the Clear confirm's component (AlertDialog)."
cites:
  - "specs/web/epics/USE-daily-use/ux/set-my-days/set-my-days/index.md"
  - "D-USE-33"
  - "D-USE-39"
  - "D-USE-65"
  - "D-USE-82"
  - "D-USE-83"
truth_files: "none: specs/web/ux/set-my-days/ is promoted with USE"
qa: Q1
reviewers:
  - assay
focus:
  - "the day at 1024 and 1023, the day menu, reach and own change, and offline against set-my-days/set-my-days/captures/ (assay)"
operator_review: false
planned_paths:
  - "apps/web/app/(shell)/days/"
  - "apps/web/components/planner/"
  - "apps/web/lib/fixtures/scenarios/"
  - "specs/web/epics/USE-daily-use/tickets/USE-042-set-my-days-this-week/evidence/"
depends_on:
  - "USE-4"
  - "USE-7"
  - "USE-10"
  - "USE-36"
  - "USE-39"
out_of_scope:
  - "Copy from… and its flow: the Copy from ticket"
  - "Event's sheet and an event's band in the column: the Add event ticket"
  - "Google events' bands: the Google Calendar ticket (wave 3), whose records they need"
  - "The pool and From Linear over This week (D-USE-54): the This week pool ticket"
  - "Block view, opened from any block here: its tickets"
criteria:
  - id: C1
    statement: "This week shows \"‹ 12 to 18 Oct ›\" and seven dated rows, \"No work slotted yet\" in words where a day has none, and Fri 16 and Sat 17 \"Not set yet\" with Copy from…"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-042-set-my-days-this-week/evidence/the-week-402.png"
  - id: C2
    statement: "Mon 12 opens with \"‹ Week\" over \"Monday, 12 October\", dated chips, no which-week switch, no now-line, and Work's tiers each with its square and name"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-042-set-my-days-this-week/evidence/the-day-402.png"
  - id: C3
    statement: "At 1024 the rail (nothing current), the 320 week pane with Mon 12 selected by fill and ink edge, and the day pane titled \"Monday, 12 October\" with no chips or crumb, the + at its foot"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-042-set-my-days-this-week/evidence/the-day-1024.png"
  - id: C4
    statement: "At 1023 the same day is the phone's push, with \"‹ Week\" and the chips"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-042-set-my-days-this-week/evidence/the-day-1023.png"
  - id: C5
    statement: "Item icons replace the bullets where set, work items show their project's emoji, meals keep the fork and knife and \"+2 more\" stays text"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-042-set-my-days-this-week/evidence/item-icons-402.png"
  - id: C6
    statement: "The + on a This week day lists Block, Transition, Event, a separator and From a saved block under \"Add to Monday\""
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-042-set-my-days-this-week/evidence/plus-menu-402.png"
  - id: C7
    statement: "The ··· opens a dropdown titled \"Monday, 12 October\": Copy from…, Reset to usual Monday, a separator and Clear this day in ink; Clear asks once (\"Clear Monday, 12 October?\") before a Toaster with Undo"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-042-set-my-days-this-week/evidence/day-menu-402.png"
  - id: C8
    statement: "After a usual Wellness edit, a Toaster reads \"Wellness changed for every Thursday. This week's Thursday 15 follows, except blocks changed on that day.\" with See it, and the block is ringed"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-042-set-my-days-this-week/evidence/usual-change-reaches-402.png"
  - id: C9
    statement: "Thursday 15 shows Wellness following the usual week and Training's own version with a pencil and \"This day only\" in muted caption, no pill"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-042-set-my-days-this-week/evidence/day-own-change-402.png"
  - id: C10
    statement: "Breakfast dragged to 8:30 sits beside Training at half width with an ink edge, and one line under them reads \"Overlaps Training, 8:30 to 8:57.\" with \"Start at 8:57\""
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-042-set-my-days-this-week/evidence/overlap-402.png"
  - id: C11
    statement: "Offline, the bounds and ··· are faded and inert, no + shows, \"Offline. Changes wait until the connection is back.\" sits at the foot, SaveStatus is hidden, and a block still opens"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-042-set-my-days-this-week/evidence/offline-402.png"
  - id: C12
    statement: "The web app type-checks"
    evidence: check
    command: "yarn check-types"
  - id: C13
    statement: "Lint passes"
    evidence: check
    command: "yarn lint"
---

# Contract — set-my-days-this-week

## Build notes

Set my days, part 2, on part 1's page. Paper file `01M49AX02VV4SSBKNCN6NRTS6Y`, page "USE — set up", rows "Set my days (cont.)" (y 1260), "(cont. 2)" (y 2520) and the 1024 frame (x 3856, y 3450). Captures to match in `ux/set-my-days/set-my-days/captures/`: the-week, the-day (402, 1024), item-icons, plus-menu, day-menu, usual-change-reaches, day-own-change, overlap, offline. Take ours at `/days?week=this&state=<state>`.

- **Decisions that apply:**
  - D-USE-39 (3), D-USE-83, D-USE-65: list-detail from `--breakpoint-split`; the pane count from the viewport, everything inside a pane by container queries, so the day pane is the phone's day component. A day is always selected: today, or from Sunday evening the week's first day.
  - The day (`the-day.md`): dated chips "M 12"; the bounds row alone; no now-line on a day that is not today.
  - Item icons (`item-icons.md`): an item's icon replaces its dot; work items take their Linear project's emoji (D-USE-31); an item with no icon keeps the dot.
  - The day menu (`day-menu.md`, D-USE-87 defaults): Copy from…, Reset to usual <weekday> (at once, Toaster with Undo; shown only in This week and only once the day differs), Clear this day (an `AlertDialog` "Clear Monday, 12 October?" naming what goes, Clear in ink, Cancel; then Undo; disabled with no blocks). Event lives on the +, not the ···.
  - The reach (D-USE-33): the Toaster names the change, the date that follows and the exception; with the day begun it reads only "<Block> changed for every <weekday>."; See it opens that date.
  - D-USE-33: "This day only" with a pencil, muted caption, never a pill; a marker, not a control; never in the usual week.
  - Overlap (D-USE-33): long-press then drag moves a block in time; others don't move; the pair side by side at half width, the moved one with an ink edge; "Start at <end>" keeps its length; the line stays until the overlap is gone.
  - D-USE-82: offline the day's own controls (Up at, Lights out, the ···, the +) are read-only with the StatusLine; no drag; a block opened from it edits offline (D-USE-67).
- **Interfaces:** the day pane is one component at both widths; `DayColumn` gains overlap pairs and a drag handle prop; scenarios `the-week`, `the-day`, `item-icons`, `plus-menu`, `day-menu`, `clear-confirm`, `usual-change-reaches`, `day-own-change`, `overlap`, `offline`.
- **Gotchas:**
  - The drawn Stretch square is sky; build it slate (D-USE-79).
  - The frames draw dots under every dated chip; a date not set has none [ASSUMPTION].
  - Reduced motion: the push and the switch change without a slide.
- **Model:** Opus 5.5 at medium. A smaller model writes This week edits to the usual block, nests two fixed panes, or moves the other block on a drag.
