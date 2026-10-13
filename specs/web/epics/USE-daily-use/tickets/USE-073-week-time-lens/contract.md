---
id: "USE-73"
size: small
objective: "The Week's Time lens shows the hour axis 8:00 to 17:00, each day's blocks at their times in their kind colours, work chips inside Work blocks with their tier edge and session mark, events in plum inside the block they fall in, the fit line in each day's last Work block and the now line on today; + Event on a day head's hover or focus opens USE-53's event popover under it, and a block click opens the Block panel"
slice_type: "a time grid; risks blocks placed by array order rather than time, an event splitting a Work block, a chip showing firing time, and the lens not remembered"
non_negotiables:
  - "Blocks sit at their times from readDay's occurrences; nothing is placed by hand."
  - "An event sits inside the block its time falls in and never splits it."
  - "The event popover is USE-53's, mounted here; this ticket draws no form of its own."
  - "No firing time on a chip; a tier edge's colour sits with the tier's word in the chip's name (colour never alone)."
  - "Only @syn/ui components (ScheduleAxis, ScheduleBlock, NowLine) and preset tokens."
devs_call: "Whether the grid shares ScheduleAxis with USE-58's day column; + Event's anchor."
cites:
  - "specs/web/epics/USE-daily-use/ux/work/week/states/time-lens.md"
  - "C-USE-week-time-lens-1"
  - "C-USE-week-time-lens-2"
  - "C-USE-week-time-lens-3"
  - "C-USE-week-time-lens-4"
  - "D-USE-41"
  - "D-USE-98"
truth_files: "none: promotion carries work/week/"
qa: Q1
reviewers:
  - assay
focus:
  - "the Time lens at 1728 against time-lens-1728, with the popover open under Wednesday (assay)"
operator_review: false
planned_paths:
  - "apps/web/app/(shell)/week/_components/"
  - "apps/web/components/work/"
  - "apps/web/lib/data/use-week-view.ts"
  - "apps/web/lib/fixtures/"
  - "specs/web/epics/USE-daily-use/tickets/USE-073-week-time-lens/evidence/"
depends_on:
  - "USE-4"
  - "USE-6"
  - "USE-7"
  - "USE-10"
  - "USE-36"
  - "USE-53"
  - "USE-55"
  - "USE-72"
out_of_scope:
  - "The Block panel a block opens: USE-76; this ticket sets ?panel=block&id=&date="
  - "Dropping a pool row on a Work block: USE-75"
  - "The event popover, its landing line and its write: USE-53"
  - "Google events' bands: the Google Calendar ticket"
criteria:
  - id: C1
    statement: "At 1728 Time shows the axis, Training, Work, Lunch and the stretch break at their times in kind colours, work chips inside Work with tier edges, \"1/3\" marks and due badges, Mon's \"11:00 [Kestrel]\" and Tue's \"15:30 [Dentist]\" in plum, each day's fit line in its last Work block, and the now line across Monday at 10:20"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-073-week-time-lens/evidence/time-lens-1728.png"
  - id: C2
    statement: "At 1728 hovering Wednesday's head shows + Event, which opens USE-53's popover anchored under it, set to Wednesday 14; a click on a block sets ?panel=block&id=&date=; switching lens and reopening the Week opens on Time"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-073-week-time-lens/evidence/event-and-panel-1728.png"
  - id: C3
    statement: "The web app type-checks"
    evidence: check
    command: "yarn check-types"
  - id: C4
    statement: "The web app lints clean"
    evidence: check
    command: "yarn lint"
---

# Contract — week-time-lens

## Build notes

Wave 2, after USE-72. Match `ux/work/week/captures/time-lens-1728.png`.

- **Decisions that apply:**
  - D-USE-41: Time: a 48 px hour axis, 8:00 to 17:00 at 80 px an hour, seven 148 px columns, today's shaded `--color-surface`; blocks at their times in their kind colours (inset 4 px, radius 5, the label muted; Work with a 3 px sky-dot left edge and "Work" semibold); work as chips inside Work blocks; events in plum (`--color-category-plum-chip`, a 3 px plum-dot edge) inside the block they fall in; "+ Event" (24 px, a hairline, semibold caption) beside a day head on hover and focus; the now line (2 px `--color-now`) on today; clicking any block opens the Block panel.
  - Work chips: `--color-background`, radius 4, a 2 px left edge in the tier's colour (leaf Primary, amber Secondary, slate Stretch), "<emoji> <title>" with a short session mark ("1/3"), a 16 px due badge (D-USE-98); no firing time. The fit line sits in each day's last Work block (muted caption).
  - The stretch break (15:00 to 15:10) is a 12 px clay bar with no label; its name is in its accessible label.
  - The lens is remembered for the person (USE-72's toggle).
- **Interfaces:** `TimeLens` in `week/_components/`; `useWeekView` gains each day's occurrences laid out by minutes from 8:00. `+ Event` opens USE-53's desk popover with the date; a block links `blockPanelRoute(id, date)`.
- **Per path:** scenario `week-time`.
- **Gotchas:** Saturday's "No work blocks" and Sunday's line follow USE-58's card rule.
- **Model:** Opus 5.5 at medium. A smaller model places blocks by index, or splits a Work block around an event.
