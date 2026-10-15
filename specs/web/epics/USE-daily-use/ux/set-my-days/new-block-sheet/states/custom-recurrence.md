---
target: specs/web/ux/set-my-days/new-block-sheet/states/custom-recurrence.md
status: approved
promoted:
boards:
  - name: "new-block / custom recurrence / 402 / light"
    page: "USE — set up"
    at: [4338, 5040]
    note: "Frame @ x 4338, y 5970"
    capture: specs/web/epics/USE-daily-use/ux/set-my-days/new-block-sheet/captures/custom-recurrence-402.png
rulings: [D-USE-24, D-USE-37, D-USE-80, D-USE-87]
---

# New block sheet — custom recurrence

Repeats › Custom… (`repeats-menu.md`), a step inside the sheet for Sunday reset. The same step serves the To-do sheet's Repeats › Custom… (`../../../day/todo-sheet/states/repeats-open.md`; its own words name the to-do there, and it has no time). `?sheet=new-block&state=custom-recurrence` [ASSUMPTION: the state param].

## What shows, top to bottom

- The sheet, shorter, on a grey scrim; grabber.
- Back chevron left; "Sunday reset · New block" (caption, muted) over "Custom recurrence".
- **Repeat every:** a number field "1" and a select "week"; under it, muted, "day, week, month or year".
- **Repeat on:** seven round toggles M T W T F S S; W and the last S filled ink (Wednesday, Sunday), the rest outlined; under them, muted, "With month: on day 18, or on the third Sunday".
- **Ends:** radio rows "Never" (picked), "On" with a faded date field "18 Jan 2027", "After" with a faded field "13 times".
- "Every Wednesday and Sunday, 13:00 to 16:00. It shows on both days in the usual week."
- "Done", ink.

## What the person can do

- Set every N days, weeks, months or years; with week, the weekdays; with month, by date ("on day 18") or by nth weekday ("on the third Sunday") [ASSUMPTION: that line becomes a two-way choice when month is picked; drawn as a hint]; with day or year, no Repeat on.
- Ends: Never, On a date (the field wakes), After N times.
- **Done** returns to the sheet with Repeats reading the rule in words ("Weekly on Wednesday and Sunday" [ASSUMPTION]); back returns with no change.
- **Editing a repeating block later** asks This one, This and following, or All, as Google does; it extends D-USE-24's scoped ··· menu ("Today's Wellness only") [ASSUMPTION: the same question on a drag or a delete of a repeating block; not drawn].

## Words

"Custom recurrence" · "Repeat every" · "day, week, month or year" · "Repeat on" · "With month: on day 18, or on the third Sunday" · "Ends" · "Never" · "On" · "After" · "<n> times" · "Every Wednesday and Sunday, 13:00 to 16:00. It shows on both days in the usual week." · "Done" · "This one", "This and following", "All".

## The notes on the boards

**"new-block / custom recurrence / 402 / light"**, "Frame" @ x 4338, y 5970:

> Custom recurrence (round 5)
>
> [PROPOSED] Google's custom form: every N day, week, month or year; weekdays to repeat on; monthly by date or by nth weekday; ends never, on a date, or after N times. Editing a repeating block asks This one, This and following, or All, as Google does.

## Rulings

- D-USE-80: Custom… is this form; the [PROPOSED] closes. It stores one RRULE.
- D-USE-37: the To-do sheet's Repeats, approved, reaches the rest of its rules through this step.
- How monthly and yearly blocks show in a usual week: the Decided (D-USE-87) in `repeats-menu.md`.

## Widths

Drawn at: 402. At 1024 and wider: the step inside the right panel at `--sheet-w` (D-USE-39, D-USE-83).

## As built (USE-47)

`?state=new-block-custom-recurrence&sheet=new-block` (the sheet's own prefix, as USE-46's states) and `/days?state=repeat-scope`. The step is `CustomRecurrenceStep` (`components/planner/custom-recurrence/`), so the To-do sheet's Repeats can mount it (USE-28). Done stores one rule through `buildRule`; a custom rule that equals a preset is stored and read as that preset. The trigger reads `describeRule` ("Weekly on Wednesday and Sunday", "Monthly on the third Sunday, 13 times"). With month the hint becomes two radio rows, "On day 18" and "On the third Sunday"; with day or year there is no Repeat on. The faded On field reads three months from the start, After reads 13 [ASSUMPTION]. A rule the usual week cannot hold (every N days or weeks, monthly, yearly) says "It shows in This week on its dates only." (or "on its weeks only") [ASSUMPTION: D-USE-87 read wider]. The scope question is `RepeatScope` (`components/planner/repeat-scope/`), an AlertDialog asked when a repeating block is dragged on a dated day: "Move Training to 8:30?", "Training repeats. Which dates take the change?", This one ("Thursday, 15 October only", first and focused), This and following, All, Cancel [ASSUMPTION: the words]. This one is the date's block change (times only until USE-88); This and following is the fixture write `splitBlock` (the old rule ends the day before, COUNT recounted; the date's own items, slots and changes move with it) with "Training changed from Thursday, 15 October on." and Undo; All is `editBlock`, "Training changed on every date." with Undo. A delete of a repeating block from a date is not asked yet: no delete reaches a dated day's column.

## Criteria

| ID                                        | When                               | Then                                                                        | Evidence                             |
| ----------------------------------------- | ---------------------------------- | --------------------------------------------------------------------------- | ------------------------------------ |
| C-USE-new-block-sheet-custom-recurrence-1 | Every 1 week, Wednesday and Sunday | The summary line names both days; the block shows on both in the usual week | `captures/custom-recurrence-402.png` |
| C-USE-new-block-sheet-custom-recurrence-2 | A repeating block is edited        | This one, This and following, or All is asked                               | test                                 |
