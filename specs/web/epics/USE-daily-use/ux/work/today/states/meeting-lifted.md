---
target: specs/web/ux/work/today/states/meeting-lifted.md
status: approved
promoted:
boards:
  - name: "now-work / meeting lifted, 11:00 / 402 / light"
    page: "USE — daily use"
    at: [2892, 16500]
    note: "Frame @ x 2892, y 17430"
    capture: specs/web/epics/USE-daily-use/ux/work/today/captures/meeting-lifted-402.png
rulings:
  [
    D-USE-27,
    D-USE-38,
    D-USE-40,
    D-USE-41,
    D-USE-45,
    D-USE-48,
    D-USE-49,
    D-USE-51,
    D-USE-65,
    D-USE-77,
  ]
---

# Today — meeting lifted (at its time)

A meeting inside the Work block reaches its time and lifts ahead of the tiers. The block stays one block ([dev note](../../../dev-notes/meeting-inside-a-work-block.md)). The step before: [meeting-coming-up](meeting-coming-up.md). `?state=meeting-lifted`.

## What shows, top to bottom

**Phone (402, 11:00), as drawn:** `AppHeader` "Now", the To-dos tray line, the Work `BlockHeader` ("Work", "9:30 to 12:00", ···). Then:

- A heading "At 11:00", ahead of the tiers.
- The lifted card for the meeting: the event icon, dot, "[Standup]" with a "Work" `Tag`, "Meeting · 11:00 to 11:15", **Start** and **Done**.
- **Primary** (after the meeting): "[Write the sync spec]" done, faded in place with its done mark, "45 min"; "[Review the Paper handoff]" "30 min", the work item that was lifted, back in its row.
- **Secondary**: "[Answer the review comments]" "20 min"; "[Agent: refactor the sync queue]" "30 min".
- **Stretch**: "[Tidy the Linear backlog]" "15 min".
- `BottomNav`.

N4: meetings and appointments sit in the flow at their pinned time with a "Work" or "Personal" `Tag`; at their time they lift ahead of the tiers (note 71). open-2 (step 8) [ASSUMPTION]: at its time it lifts under "At 11:00" and the lifted work item goes back to its row.

**The build, with the later rulings applied:** the meeting is an event, plum (D-USE-38: events stay plum, always a fill with the calendar icon). Rows take the locked phone form (D-USE-51); the done Primary shows its Done record (D-USE-48). The work item that goes back to its row is still Next: the shaded Next row, as while something runs (D-USE-45, D-USE-49) [ASSUMPTION]. Anything running or firing keeps running through the meeting; pausing is Taylor's call (Step away) (the dev note; D-USE-27).

[ASSUMPTION] Start on the meeting card starts its timer as any timed item's; Done checks it. When the meeting is done or its end passes, the lift returns to Next (not drawn).

**Desk (not drawn):** the meeting lifts as a row under the band, with its `Tag`; the tiers below are unchanged (D-USE-65). The day column keeps the event in plum (D-USE-40, D-USE-41).

## Words

"At 11:00"; "Meeting · 11:00 to 11:15"; "Work".

## The notes on the boards

**"now-work / meeting lifted, 11:00 / 402 / light"**, "Frame" @ x 2892, y 17430:

> meeting lifted, 11:00
>
> At its time the meeting lifts ahead of the tiers under "At 11:00", with its Work tag; the work item that was lifted returns to its row. The done Primary stays faded in place.

## Rulings

- D-USE-77: step 8's [PROPOSED] and [ASSUMPTION] marks in this file stand as drawn (Decided (D-USE-77)).
- D-USE-65: a desk meeting at its time lifts as a row under the band.
- D-USE-40, D-USE-41: the desk's day column carries events in plum. D-USE-38: events are plum.
- The frame draws plain rows and a verdigris-dot card; D-USE-51 makes them the trimmed work rows and D-USE-48 the Done record.
- How the meeting re-flows the block: [`../../../dev-notes/meeting-inside-a-work-block.md`](../../../dev-notes/meeting-inside-a-work-block.md).

## Widths

Drawn at 402. Desk: D-USE-65.

## Criteria

| ID                           | When                                        | Then                                                                                   | Evidence                          |
| ---------------------------- | ------------------------------------------- | -------------------------------------------------------------------------------------- | --------------------------------- |
| C-USE-today-meeting-lifted-1 | A meeting's time arrives                    | It lifts ahead of the tiers under "At <time>"; the lifted work item returns to its row | `captures/meeting-lifted-402.png` |
| C-USE-today-meeting-lifted-2 | A meeting lifts while an item runs or fires | The item keeps running or firing                                                       | test                              |
| C-USE-today-meeting-lifted-3 | Desk, a meeting's time arrives              | A row under the band with its Tag; tiers unchanged                                     | manual                            |
