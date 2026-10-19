---
source:
  - docs/ux/synapse_navigation_and_system_ux_architecture.md §7
  - docs/ux/ux-spec-v1.md §6.1, §6.2; ux-spec-v1.1.md §5.1; ux-spec-v1.3.md §0.3 R64
  - code 3b252e7 (packages/utils/src/day/boundaries.ts, wall-clock.ts, week.ts, item-state.ts; packages/api/src/services/day/today.ts, close-day.ts, jobs/auto-close-days.ts, user/apply-pending-settings.ts; apps/web/lib/hooks/use-now.ts, use-device-zone.ts)
status: approved
promoted: 2026-10-09
---

# time-and-day — _global

A rules file: which day it is, when it opens and closes, and what time means on it.

## Job

Make the day the person lived the unit of record: it opens and closes at their close time in their stored zone, survives a clock change and a flight without moving anything already lived, and never turns a passing clock into a verdict.

## Layout and components

No surface of its own. The day header (`day/`) and the status line (`shell.md`) show the consequences; `useNow` ticks the rows.

## States

| Case                     | What shows                                                                                                                                                                                                                                                             | What the person can do                         | Evidence                                      |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- | --------------------------------------------- |
| The day key              | A day is the calendar date, in the stored zone, of the instant shifted back by the close time: anything between midnight and 03:00 belongs to the day that started the morning before. Default close 03:00                                                             | Change the close time in Settings → Day & time | inferred: boundaries.ts                       |
| The window               | `[close, next close)` in the day's own snapshot of zone and close time, taken when the row is created; the span is 23 h on a spring-forward night and 25 h on a fall-back night                                                                                        | —                                              | inferred: boundaries.ts                       |
| Opening                  | The first read of the day creates its row; an unplanned day is a real, empty day                                                                                                                                                                                       | Plan it, add a one-off, journal                | inferred: one-off.ts                          |
| The morning              | Setup done, no wake yet, day open: the orient frame before any tab, once; opening it stamps the wake (source _orient_); a manual wake time can correct it later                                                                                                        | Open the frame; _Set wake time_                | inferred: orient/page.tsx, resolve-entry.ts   |
| Closing                  | By _Finish review_ or, every fifteen minutes by a job, once the window has ended; auto-close marks nothing missed: undone items become _pending review_; a running timer is ended at the boundary, not at the moment the job ran                                       | Review the day                                 | inferred: auto-close-days.ts, close-day.ts    |
| A closed day             | Never reopens to the live List; it is edited through the Day Review and `record-integrity.md`                                                                                                                                                                          | Open it from Review                            | inferred: close-day.ts                        |
| Live, record, plan       | Compared by key, not by clock: the person's current day is live; earlier keys are records; later keys are plans                                                                                                                                                        | —                                              | inferred: boundaries.ts dayModeFor            |
| Now                      | A fixed item is _now_ inside its scheduled span; a windowed item is _open_ inside its window                                                                                                                                                                           | —                                              | inferred: item-state.ts                       |
| Soon                     | The fifteen minutes before a fixed start; unscheduled items are never now or soon                                                                                                                                                                                      | —                                              | inferred: item-state.ts                       |
| Closing                  | A window is _closing_ with the greater of ten minutes or ten percent left                                                                                                                                                                                              | —                                              | inferred: item-state.ts                       |
| The tick                 | Rows re-derive on the minute, aligned to the clock, paused while the tab is hidden and ticked at once on return; passed is never missed                                                                                                                                | —                                              | inferred: use-now.ts, item-state.ts           |
| Spring forward           | A time scheduled inside the missing hour moves to the first minute after it, reads its new time, carries no other mark                                                                                                                                                 | —                                              | inferred: wall-clock.ts                       |
| Fall back                | A time that occurs twice is the first occurrence; nothing repeats; the day is 25 h                                                                                                                                                                                     | —                                              | inferred: wall-clock.ts                       |
| Device zone              | Read in one place, on the client, re-read when the tab becomes visible; null on the server, so no line and no label until hydration                                                                                                                                    | —                                              | inferred: use-device-zone.ts                  |
| Travelling               | Device zone differs from the stored zone and setup is done: the time-zone line once per day (`shell.md`); _Switch_ writes a pending zone that applies from tomorrow, computed on the server from the zone still lived in; today keeps its zone and nothing on it jumps | Switch, Keep, Dismiss for the day              | inferred: zone-switch-dialog.tsx, today.ts    |
| The pending pair applied | On the first read of the day after it comes due, by an app open or the job's pass; future planned days are re-laid at the same wall clock in the new zone; today and the past are untouched; the key never moves backwards on a promotion turn (SYS-2, 2026-09-06)     | —                                              | inferred: today.ts, apply-pending-settings.ts |
| Close-time change        | From tomorrow; it moves no scheduled time, only which day an instant belongs to                                                                                                                                                                                        | —                                              | inferred: apply-pending-settings.ts           |
| Times on the List        | Shown in the day's snapshot zone, never the device's; a day lived elsewhere carries a zone label in its header while the two differ (`day/`)                                                                                                                           | —                                              | inferred: shell-status-line.tsx note          |
| Per-day times            | _Up at_, _lights out_, _phone away_, _working by_, _until about_ live on each day plan; the profile holds the first plan's as its defaults (R64)                                                                                                                       | Edit on the plan                               | inferred: routes.ts, v1.3 R64                 |
| The week                 | Monday to Sunday in the stored zone; the key is the ISO week; a Monday before 1 January can carry the new year's week                                                                                                                                                  | —                                              | inferred: week.ts                             |

## Words

Never _late_, _behind_, _overdue_ from a clock. State words on rows are the day area's: _now · soon · open · closing · moved_. The zone line and dialog name both zones.

## Access

The now line and timers update with `aria-live="off"`; a row's state change is not announced on its own. Nothing here is colour alone.

## Instrumentation

None today.

## Criteria

| ID                   | When                                                         | Then                                                                                         | Evidence |
| -------------------- | ------------------------------------------------------------ | -------------------------------------------------------------------------------------------- | -------- |
| C-WEB-time-and-day-1 | A done at 01:30 under a 03:00 close                          | Belongs to the day that opened the previous morning                                          | test     |
| C-WEB-time-and-day-2 | A fixed 07:00 item on a spring-forward day with a 02:30 item | 02:30 reads 03:00; 07:00 is untouched; the day is 23 h                                       | test     |
| C-WEB-time-and-day-3 | A pending zone comes due at an open                          | Tomorrow's 7:00 is 7:00 in the new zone; today's items keep their instants                   | test     |
| C-WEB-time-and-day-4 | The job runs after a day's window ends                       | Undone items read _pending review_; none read _missed_; a running timer ends at the boundary | test     |

## Decisions and open items

D-WEB-1 to D-WEB-3. Nothing open; the key-moves-backwards fix is SYS-2's logged deviation.
