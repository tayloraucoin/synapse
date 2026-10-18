---
id: USE-121
size: small
objective: "The desk's day column reads as drawn: the day bar names when Work ends (17:00, the last Work block's end), every block's label is readable, Breakfast stands at 9:00, and the bar's segments carry no cramped letters"
slice_type: "a fix found by the Paper assay (thread C, 2026-10-18) on USE-58 C1; risks moving the Week's Fits value along with the label, or clipping a label again at another block size"
non_negotiables:
  - 'The day bar''s middle label reads "Work ends <end of the day''s last Work block>": 17:00 on Monday 12, as words-and-access lists it.'
  - 'The Week''s Fits row keeps its own value ("Work ends 16:20"); only the day column''s label changes.'
  - "No block label is clipped by the block after it: a short block (Stretch break, 15:00 to 15:10) shows its name whole or shortens it with an ellipsis, never cut through the text."
  - "Every block of the date shows in the column, Breakfast 9:00 to 9:30 included."
  - "The day bar's segments are colour with no letters, as drawn; the column's hours carry the names."
  - "Only @syn/ui components and preset tokens (canon §2)."
devs_call: "How a short block shows its name (single line with ellipsis, or the name beside the block); the bar segments' accessible names."
cites:
  - "specs/web/epics/USE-daily-use/ux/work/today/words-and-access.md"
  - "C-USE-today-1"
truth_files: "none: the words already say 17:00; the code is brought to them"
qa: Q1
reviewers:
  - assay
focus:
  - "the day column at 1728 against `today / working, firing in place / 1728 / light` (assay)"
operator_review: false
planned_paths:
  - "apps/web/app/(shell)/today/_components/desk/desk-column.ts"
  - "apps/web/components/work/desk-day-column.tsx"
  - "apps/web/components/planner/day-bar/"
  - "specs/web/epics/USE-daily-use/tickets/USE-121-day-column-work-ends-and-labels/evidence/"
depends_on:
  - "USE-58"
out_of_scope:
  - "The Week's Fits row and fitInBlock's arithmetic"
  - "The phone's day (USE-81) and Set my days' day view"
criteria:
  - id: C1
    statement: 'deskColumn on the today-working records names "Work ends 17:00" and lists Breakfast 9:00 to 9:30 among the blocks'
    evidence: test
    command: "yarn test"
  - id: C2
    statement: 'At 1728, /dev/parts?state=today-working shows the day bar with "Work ends 17:00" and no letters on its segments, Breakfast at 9:00, and "Stretch break" readable between the 13:00 and 15:10 Work blocks'
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-121-day-column-work-ends-and-labels/evidence/day-column-1728.png"
  - id: C3
    statement: "The web app type-checks"
    evidence: check
    command: "yarn check-types"
---

# Contract — USE-121 day-column-work-ends-and-labels

## Build notes

Found by the Paper assay of thread C (Work: Today, Week, pool) on 2026-10-18: USE-58 C1 judged **mismatch**. Evidence: `USE-058-today-strip-day-column/evidence/working-1728.png` beside the Paper artboard `today / working, firing in place / 1728 / light` (file 01M49AX02VV4SSBKNCN6NRTS6Y, page USE — work).

- **Approach:** `desk-column.ts` builds the bar's "Work ends" from the date's Fits line (`Work ends 16:20`, the top of the ranges). Take it from the last Work block's `endsAt` instead, and keep the Fits value where the Week shows it. Find why Breakfast drops out of the column's blocks (the same week's Tuesday shows it on the phone's day, USE-81). Give a short block's label a single line that cannot run under the next block. Drop the letters from the bar's segments.
- **Decisions that apply:** C-USE-today-1: rail, week strip, main column (720) and day column (340) as the working capture. words-and-access, Day column: "The day", "whole day, then 8:00 to 18:00", "Work ends 17:00", "Lights out 22:30".
- **Interfaces:** none new.
- **Per path:** `desk-column.ts`, the label's source and the block list; `desk-day-column.tsx`, the short-block label; `day-bar/`, segments without letters.
- **Gotchas:** the Week's Priority lens shows "Work ends 16:20" in Fits on purpose; don't change `week-view.ts`. The same day column frames the opened day (USE-58 C2), so check `?date=2026-10-13` too.
- **Model:** Sonnet is enough.
