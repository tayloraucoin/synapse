---
id: "USE-27"
size: medium
objective: "/today/schedule shows the whole day on the phone: the date, the To-dos tray, the day column at 96 px an hour with each block's bullets, done blocks faded, the now line and one verdigris edge on the block under way; checks, running and firing marks; the All day strip on a checklist day; a meeting as one band inside its block; and the empty, loading, error, partial and offline states, on fixtures"
slice_type: 'a read-only day view; risks a second "this moment" mark, firing drawn in verdigris, a meeting splitting its block, colour alone telling a mark, a now line that drifts from the minute, and a failed region blanking the other'
non_negotiables:
  - "Verdigris marks this moment only: the now line, the block under way's edge, the running dot (D-P02). Firing is a clay dot in a fill-muted halo, never verdigris (D-USE-49)."
  - "One edge at a time: the block under way, or on a checklist day the strip until a set-time block is under way."
  - "A meeting inside a block is one plum band at its time; the block keeps one header and no item is split."
  - 'Marks are never colour alone: a check is a check, running carries "· running", firing its words.'
  - 'No count, streak or "missed"; nothing is asked here.'
  - "Composes @syn/ui's ScheduleAxis, ScheduleBlock and NowLine and USE-19's tray; only preset tokens; never shimmering, no spinner."
  - "Each region loads and fails on its own, as Now's partial."
devs_call: 'Whether the day column lives in components/planner (Review the day and desk Today will reuse it) and its split; the scroll-to-now on a re-tap and on "t"; the running ring''s pulse (100 % to 40 %, 2 s; still under reduced motion).'
cites:
  - "specs/web/epics/USE-daily-use/ux/day/schedule/index.md"
  - "specs/web/epics/USE-daily-use/ux/day/schedule/words-and-access.md"
  - "specs/web/epics/USE-daily-use/ux/day/schedule/states/during-go.md"
  - "specs/web/epics/USE-daily-use/ux/day/schedule/states/checks-and-running.md"
  - "specs/web/epics/USE-daily-use/ux/day/schedule/states/checklist-day.md"
  - "specs/web/epics/USE-daily-use/ux/day/schedule/states/meeting-inside-a-block.md"
  - "C-USE-schedule-1"
  - "C-USE-schedule-4"
  - "C-USE-schedule-during-go-1"
  - "C-USE-schedule-during-go-2"
  - "C-USE-schedule-during-go-3"
  - "C-USE-schedule-checks-and-running-1"
  - "C-USE-schedule-checklist-day-1"
  - "C-USE-schedule-meeting-inside-a-block-1"
  - "C-USE-schedule-meeting-inside-a-block-2"
  - "D-USE-77"
waiver: "One surface, Schedule: its index, words and drawn states; empty, loading, error, partial and offline are decided in its index (D-USE-77) and follow from them."
truth_files: "none: an epic proposal; promotion carries day/schedule/"
qa: Q1
reviewers:
  - assay
focus:
  - "during go, checks and running, the checklist day and the meeting at 402: one verdigris edge, firing never verdigris (assay)"
operator_review: false
planned_paths:
  - "apps/web/app/(shell)/today/schedule/"
  - "apps/web/components/planner/"
  - "apps/web/lib/data/use-schedule.ts"
  - "apps/web/lib/data/schedule.test.ts"
  - "apps/web/lib/fixtures/"
  - "packages/utils/src/planner/schedule-marks.ts"
  - "packages/utils/src/planner/schedule-marks.test.ts"
  - "packages/utils/src/planner/index.ts"
  - "specs/web/epics/USE-daily-use/tickets/USE-027-schedule-day/evidence/"
depends_on:
  - "USE-4"
  - "USE-6"
  - "USE-7"
  - "USE-10"
  - "USE-19"
  - "USE-21"
out_of_scope:
  - "The Block view a block or the strip opens (/today/block/{id}): its own ticket; taps use routes.ts's blockRoute"
  - "The empty day's three choices' flows (Make a checklist, Plan with blocks, Copy another day): Review the day's tickets; here they link"
  - "Another day's schedule (/day/<date>/schedule) and the Tomorrow peek: the close-the-day ticket"
  - "The desk's 1440 column: it scales from this page at --content-text beside the rail; desk Today's day column is its own ticket"
criteria:
  - id: C1
    statement: 'At 10:20 on Monday: "Monday, 12 October", the closed tray, hours 7 to 13 at 96 px an hour, Wellness, Training and Breakfast faded, Work with its verdigris edge and tier captions over sky bullets, Lunch''s dashed band, and the now tag "10:20" with its line'
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-027-schedule-day/evidence/during-go-402.png"
  - id: C2
    statement: 'Checked items carry a 10 px check in their block''s colour, the running item a verdigris dot in a ring with "· running", planned items a dot'
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-027-schedule-day/evidence/checks-and-running-402.png"
  - id: C3
    statement: 'Sunday at 11:20: the All day strip above the rail with "Sunday", the Checklist tag and its boxes (Meal prep checked and faded), Lunch with Sam 13:00 to 14:30 with its lock, and the now line'
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-027-schedule-day/evidence/checklist-day-402.png"
  - id: C4
    statement: 'A meeting at 10:30 is one plum band across Work with a lock, "[Design sync]" and "10:30 to 11:00 · Meeting"; Work keeps one header, its items above and below the band'
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-027-schedule-day/evidence/meeting-inside-a-block-402.png"
  - id: C5
    statement: 'The day failing alone shows RegionRetry with "The day didn''t load." and Try again under the title, the tray live; offline shows one StatusLine "Offline. Changes are saved on this phone and sync later." above the tray'
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-027-schedule-day/evidence/error-and-offline-402.png"
  - id: C6
    statement: "scheduleMark gives done, running, firing or planned from a slot and its clock; underWay gives one block or the strip, never two; a day event inside a block is returned as a band of that block, with the block's items before and after it"
    evidence: test
    command: "yarn test"
  - id: C7
    statement: "As the fixture clock passes a minute the now line's minute changes and nothing else in the view model does; before Ready, go no block has the edge; with the to-dos failing the day still settles"
    evidence: test
    command: "yarn test"
  - id: C8
    statement: "The web app and @syn/utils type-check"
    evidence: check
    command: "yarn check-types"
  - id: C9
    statement: "The web app lints clean"
    evidence: check
    command: "yarn lint"
---

# Contract — schedule-day

## Build notes

After USE-19 and USE-21 (the tray's region and the system-state parts). Replaces USE-4's placeholder at `/today/schedule`. Captures to match: `ux/day/schedule/captures/{during-go,checks-and-running,checklist-day,meeting-inside-a-block}-402.png`; Paper `01M49AX02VV4SSBKNCN6NRTS6Y`, "USE — daily use", row "Schedule" (y 20280). Each at `/today/schedule?state=<name>`.

- **Decisions that apply:**
  - D-USE-23: 96 px an hour with the bullet grid (two 145 px cells a line, "+n more"). D-USE-30: a now line across every timed day view, the tag in the rail, faint over content. D-USE-26: the tray closed by default.
  - N4 and D-P02: the block under way takes a hairline verdigris edge, the one "this moment" mark; done blocks fade to 45 %.
  - D-USE-28: a checklist with no span sits in an "All day" strip above the rail, tagged Checklist. D-USE-72: the strip opens the checklist in block view.
  - D-USE-38: events are plum, always a fill with its icon. The meeting dev note: one block, one pinned band; nothing splits.
  - D-USE-49 and D-USE-77: firing is the clay dot in a fill-muted halo, title receded; the built Schedule's ghosts, moved border and shift bands stay out; before Ready, go the same column without the edge; empty is the title, tray, axis and now line with D-USE-68's three choices under the title; loading paints the title at once, the tray as two bars, the column as still bands; error is RegionRetry with "The day didn't load." and "Nothing is lost. The plan is still there once it loads." [placeholder]; offline is a StatusLine and the day from the phone, the now line still moving.
  - D-USE-39 and D-USE-55: no wide frame; from 1024 it is the rail's Schedule, one column at `--content-text`, centred.
  - Words: the date, "To-dos", block names and spans, "Primary", "Secondary", "+<n> more", "All day", "Checklist", "· running", "<span> · Meeting".
- **Interfaces:**
  - `@syn/utils` `planner/schedule-marks.ts`: `scheduleMark(slot, slotClock)`, `underWay({ blocks; allDay; now; phase })`, `placeEvents(blocks, events)`.
  - `lib/data/use-schedule.ts`: `useSchedule(dateKey)` over `useToday` and `useTodos`.
  - `components/planner/day-column/`: `DayColumn`, `AllDayStrip`, `MeetingBand`.
  - Scenarios: `during-go`, `checks-and-running`, `checklist-day`, `meeting-inside-a-block`, `schedule-empty`, `schedule-loading`, `schedule-error`, `schedule-partial`, `schedule-offline`.
- **Per path:** `schedule-marks.test.ts` holds C6; `schedule.test.ts` holds C7 against the fixture server.
- **Gotchas:**
  - Read `ScheduleAxis`, `ScheduleBlock` and `NowLine` before composing: they were built for the old Schedule and may carry its ghosts; never fork them, pass props.
  - The capture scrolls so 7:00 sits at the top; the page itself opens scrolled to now.
  - The canvas's "[placeholder]" titles ship as fixture data only.
- **Model:** Opus 5.5 at medium. A smaller model edges two blocks, draws firing in verdigris, or splits Work around the meeting.
