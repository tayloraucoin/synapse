---
id: "USE-53"
size: small
objective: "An event is added by hand and lands where its time falls, with no choice of place: the phone's Add event sheet (name and icon, Work or Personal, Starts, Length, plum, Notes) and the desk popover (Starts, Ends, Work or Personal, Client, Repeats), each naming where it lands and what moves before Add, then a plum band inside its block or its own small block, with Undo, on fixtures"
slice_type: "two forms over one landing rule on fixtures; risks a placement choice offered, a landing line that disagrees with where it lands, an item split by the band, an event told by colour alone, and Synapse events not editable after"
non_negotiables:
  - "The time decides where it lands; the line above Add names the block and what moves, from the set-up pure functions' eventLanding, and changes with every field."
  - "Items after the band move to its end whole; when the tiers no longer fit, Stretch slides first, then Secondary; with no room at all, Make room (USE-35) decides."
  - "Events are plum, a fill with the calendar icon and their name and span, never colour alone (D-USE-31)."
  - "Writes through dayEventInput (with 0013's tag, notes, colour, client and repeat); no name reads \"Name needed\" on a faded Add."
  - "A Synapse event opens again in its own form to edit or delete; nothing is written to Google."
  - "Only @syn/ui components and preset tokens; nothing red."
  - "Every state of this ticket is reachable by ?state= (canon C-P08)."
devs_call: "One form component with two layouts or two components; the popover's anchor; file split."
cites:
  - "specs/web/epics/USE-daily-use/ux/interactions/add-event.md"
  - "C-USE-add-event-1"
  - "C-USE-add-event-2"
  - "D-USE-31"
  - "D-USE-41"
  - "D-USE-42"
  - "D-USE-95"
  - "D-USE-102"
waiver: "D-USE-102 rules two forms as drawn: the desk popover here and the phone sheet with its landings in set-my-days/set-my-days/states/ (add-event.md, event-inside-work.md, event-own-block.md)."
truth_files: "none: interactions/ and set-my-days/ are promoted with USE"
qa: Q1
reviewers:
  - assay
focus:
  - "the phone sheet, the band inside Work with its re-flow and the desk popover's landing line (assay)"
operator_review: false
planned_paths:
  - "apps/web/components/planner/add-event/"
  - "apps/web/app/(shell)/days/"
  - "apps/web/lib/fixtures/"
  - "apps/web/lib/data/use-planner-writes.ts"
  - "specs/web/epics/USE-daily-use/tickets/USE-053-add-event/evidence/"
depends_on:
  - "USE-4"
  - "USE-7"
  - "USE-10"
  - "USE-11"
  - "USE-14"
  - "USE-33"
  - "USE-36"
  - "USE-42"
  - "USE-46"
out_of_scope:
  - "The Week's \"+ Event\" on a day head and Today's + Add › Event: the Week's and USE-51's tickets mount these forms"
  - "Google's events, read-only bands and Add to day: the Google Calendar ticket"
  - "Make room's sheet: USE-41"
criteria:
  - id: C1
    statement: "Event from Mon 12's + opens \"Mon 12 · this date only\" over \"Add event\": Name with its emoji slot, Tag Work or Personal, Starts 11:00, Length \"30 min\", Colour \"Plum, for events\", Notes (optional), the line \"Sits inside Work at 11:00 as a band. The work around it moves: [Review the Paper handoff] starts at 11:30.\" and Add event"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-053-add-event/evidence/add-event-402.png"
  - id: C2
    statement: "Added, Design review sits in Work at 11:00 as a plum band with the calendar icon, \"11:00 to 11:30\" and \"Work\", the next item at 11:30, and a Toaster \"Added inside Work, 11:00\" with Undo"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-053-add-event/evidence/event-inside-work-402.png"
  - id: C3
    statement: "A dentist at 15:30 in no block stands as a small plum block at its true height with \"15:30 to 16:15 · Personal · this Monday only\" and a Toaster \"Dentist added as its own block\" with Undo"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-053-add-event/evidence/event-own-block-402.png"
  - id: C4
    statement: "At 1728 the popover \"New event · Wednesday 14\" with Starts 14:00, Ends 14:30, Work, Client Kestrel Health with its letter tile, Does not repeat, reads \"Sits inside Work, 13:00 to 15:00. Nothing moves: that block has room until 15:00.\""
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-053-add-event/evidence/event-popover-1728.png"
  - id: C5
    statement: "Through the fixtures an event inside a block moves the items after it whole and Undo puts them back; one in no block is its own; an empty name or Ends before Starts is refused in words"
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

# Contract — add-event

## Build notes

Phone sheet captures: `ux/set-my-days/set-my-days/captures/` (add-event, event-inside-work, event-own-block). Desk: the popover inside `ux/work/week/captures/time-lens-1728.png`. Paper file `01M49AX02VV4SSBKNCN6NRTS6Y`, pages "USE — set up" (y 930, 2190) and "USE — desk". Take ours at `/days?week=this&day=mon&state=<state>`; the popover on `/dev/parts?state=event-popover` until the Week mounts it.

- **Decisions that apply:**
  - N2 and round 2: an event is tagged Work or Personal and sits in the block its time falls in, or stands as its own small block; no placement choice; the line names what moves.
  - D-USE-31, D-USE-79: plum, told from violet by form (a fill with the calendar icon). The block stays one block: the event is a pinned item inside it (`dev-notes/meeting-inside-a-work-block.md`).
  - D-USE-102: the phone sheet has Starts with Length, Colour (plum) and Notes, "this date only"; the desk popover has Starts with Ends, Client and Repeats. Each as drawn.
  - D-USE-42: the popover names where the event lands and what moves; Synapse events editable (a tap opens the form filled, with Save and Delete event), Google's read-only.
  - D-USE-95: a client's tile carries its letter, so colour is never alone; Client shows for a Work event and when clients are on.
  - D-USE-41: events come from calendars or "+ Event", never a pool tab.
  - Assumptions taken as drawn: Starts steps by 15 and takes a typed time; × closes with nothing added; outside every block the line reads "Stands as its own block, <start> to <end>."; offline adding works and syncs later (D-USE-56).
  - Access: the popover traps focus, focus in the name, back to its opener on close; the landing line tied to Add by `aria-describedby` and announced politely.
- **Interfaces:** `AddEventSheet` and `EventPopover` over one `add-event/form.ts` (pure: fields, the line from `eventLanding`, `dayEventInput`); `usePlannerWrites().writeDayEvent` returns the moves and its Undo. Scenarios `add-event`, `event-inside-work`, `event-own-block`, `event-popover`, `event-name-needed`.
- **Gotchas:**
  - The band's span and tag sit trailing, as drawn; the own block's line is "this <weekday> only", not "This day only".
  - Repeats in the popover is the New block sheet's Select (USE-46).
- **Model:** Opus 5.5 at medium. A smaller model asks where the event goes, splits an item, or draws the band in violet.
