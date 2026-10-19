---
id: "USE-58"
size: small
objective: "The desk's Today gains the week strip across the top and the day column at its right, and opens another date in the same layout for planning (‹ Week, that day selected on the strip, its own day column, no ring, firing, Start or Done), on fixtures"
slice_type: "desk-only chrome around Today; risks the strip or column showing below 1024, a now line on a day that is not today, an opened day that still fires or starts, and ‹ Week losing the lens it came from"
non_negotiables:
  - "The week strip and the day column show only from 1024 (split:), never on the phone (D-USE-55)."
  - "An opened day not today has no ring, firing mark, Start or Done, and no now line; F, D and Enter do nothing there (C-USE-today-opened-day-2)."
  - "The strip shows lengths and words only: \"2/3\" for a session, never a count of the day (D-USE-47)."
  - "Composes @syn/ui's ScheduleAxis, ScheduleBlock and NowLine and USE-10's parts; preset tokens only (canon §2, A-01 to A-20)."
  - "Reads through useWeek and useToday; nothing here imports lib/fixtures or tRPC."
devs_call: "File split under today/_components/desk/; the strip's horizontal scroll below 1728; whether the opened day is ?date= on /today or its own segment (the ledger's ?date= first)."
cites:
  - "specs/web/epics/USE-daily-use/ux/work/today/states/opened-day.md"
  - "specs/web/epics/USE-daily-use/ux/work/today/words-and-access.md"
  - "C-USE-today-1"
  - "C-USE-today-opened-day-1"
  - "C-USE-today-opened-day-2"
  - "C-USE-today-opened-day-3"
  - "C-USE-today-opened-day-4"
  - "D-USE-41"
  - "D-USE-55"
  - "D-USE-65"
waiver: "The opened day, with the desk's week strip and day column (C-USE-today-1 in words-and-access) that frame it."
truth_files: "none: promotion carries work/today/"
qa: Q1
reviewers:
  - assay
focus:
  - "the strip and the day column at 1728 against working-1728, and the opened day against opened-day-1728 (assay)"
operator_review: false
planned_paths:
  - "apps/web/app/(shell)/today/_components/desk/"
  - "apps/web/components/work/"
  - "apps/web/lib/routes.ts"
  - "apps/web/lib/fixtures/"
  - "specs/web/epics/USE-daily-use/tickets/USE-058-today-strip-day-column/evidence/"
depends_on:
  - "USE-4"
  - "USE-7"
  - "USE-10"
  - "USE-55"
  - "USE-57"
out_of_scope:
  - "The Week the ‹ goes back to: USE-72; until it lands, ‹ Week goes to /week as a link"
  - "A block clicked in the day column opens the Block panel: USE-76"
  - "The phone's answer for another day (Set my days' day chips): the Set my days tickets"
criteria:
  - id: C1
    statement: "At 1728 the week strip shows seven day cards Mon to Sun, today's outlined in ink with \"today\", each with up to two lines (a work item with its tier square and \"2/3\", an event with a plum dot and its time) or \"Nothing slotted yet\", \"No work\", \"Sunday reset\"; the day column (340, 48 px gap) shows \"The day\", the day bar to \"Lights out 22:30\" with \"Work ends 17:00\", the hours 8:00 to 18:00 with blocks in their colours, events in plum and the NowLine in verdigris"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-058-today-strip-day-column/evidence/working-1728.png"
  - id: C2
    statement: "?date=2026-10-13 shows \"‹ Week\" with \"Planning Tuesday. Firing, Start and Done wait for the day itself.\", the strip with Tuesday selected, rows with no ring or Start, and the day column with the 15:30 Dentist and no now line"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-058-today-strip-day-column/evidence/opened-day-1728.png"
  - id: C3
    statement: "At 1023 neither the strip nor the day column shows"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-058-today-strip-day-column/evidence/edge-1023.png"
  - id: C4
    statement: "The web app type-checks"
    evidence: check
    command: "yarn check-types"
  - id: C5
    statement: "The web app lints clean"
    evidence: check
    command: "yarn lint"
---

# Contract — today-strip-day-column

## Build notes

Wave 2, after USE-57. Captures match `ux/work/today/captures/working-1728.png` and `opened-day-1728.png`; Paper file `01M49AX02VV4SSBKNCN6NRTS6Y`, page "USE — work", row "Today at a desk".

- **Decisions that apply:**
  - Index › Layout: the strip is desk-only (D-USE-55); the day column is 340 px with a 48 px gap, "The day" with "whole day, then 8:00 to 18:00", a day bar from 7:00 to "Lights out 22:30" with "Work ends 17:00" and a now mark, the hours 8:00 to 18:00, each block in its colour, events in plum inside (N6, D-USE-41), the `NowLine` in verdigris.
  - Between 1024 and 1728 the day column keeps 340 and the main column shrinks; then the strip scrolls sideways (work overview).
  - Opened day (D-USE-41): a day head's › on the Week, or Open day in the Block panel, opens that date in Today's layout, planning: "‹ Week" with the planning line, the strip with that day selected, its day column. "Work ends 15:10" in the header; "+ Add to Stretch" on an empty tier. No firing, Start or Done; keys F, D and Enter do nothing. ‹ Week returns to the Week in the lens it was left in (the lens is the Week's remembered toggle).
  - D-USE-47: lengths, never counts; "2/3" is a session's place.
- **Interfaces:** `WeekStrip { days: StripDayView[]; selected; onPick }` and `DayColumn { blocks; events; now: Date | null }` in `components/work/`; `todayRoute({ date })` in `routes.ts` for `?date=`. The opened day reads `useToday(date)`; a non-today date passes `now: null` and a `planning` flag to the rows, which drops the lead slot's controls.
- **Per path:** scenarios `today-opened-day` (Tue 13 Oct) join the registry. The strip's cards read the week through `useWeek`.
- **Gotchas:**
  - "today" on the strip is `--color-now`'s word with the ink outline; colour never alone.
  - A card's lines come from the date's records, never its weekday's name: work slots and events first; a Work block with nothing slotted reads "Nothing slotted yet"; a date with no Work block reads "No work", or the name of its one block when that is all it holds ("Sunday reset" in the fixture) [ASSUMPTION: the drawn cards, read as a rule].
  - Run Prettier only on files written here.
- **Model:** Opus 5.5 at medium. A smaller model shows the now line on every date, or leaves Start live on a planning day.
