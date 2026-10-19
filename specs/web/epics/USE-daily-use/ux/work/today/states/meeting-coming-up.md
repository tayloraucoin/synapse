---
target: specs/web/ux/work/today/states/meeting-coming-up.md
status: approved
promoted:
boards:
  - name: "now-work / meeting mid-block, coming up / 402 / light"
    page: "USE — daily use"
    at: [3374, 16500]
    note: "Frame @ x 3374, y 17430"
    capture: specs/web/epics/USE-daily-use/ux/work/today/captures/meeting-coming-up-402.png
rulings: [D-USE-38, D-USE-45, D-USE-49, D-USE-51, D-USE-58, D-USE-65, D-USE-77]
---

# Today — meeting coming up (mid-block)

A meeting sits inside the Work block, ten minutes away. It is a band in the flow at the point the plan reaches its time; the lifted card shows what the meeting does to it [PROPOSED]. The block stays one block ([dev note](../../../dev-notes/meeting-inside-a-work-block.md)). At its time: [meeting-lifted](meeting-lifted.md). `?state=meeting-coming-up`.

## What shows, top to bottom

**Phone (402, 10:20), as drawn:** `AppHeader` "Now", the To-dos tray line, the Work `BlockHeader` ("Work", "9:30 to 12:00", ···). Then:

- **Primary**: the lifted card for "[Review the Paper handoff]", meta "30 min · would end 10:50, past [Design sync]", **Start** and **Done**.
- The meeting band, in the flow [PROPOSED], 52 px: the event icon in a 20 px slot; "[Design sync]" with a "Work" `Tag`; under it "10:30 to 11:00 · the work below waits until 11:00"; on the right "in 10 min".
- Below the band, still Primary: "[Fix the sync retry]" "20 min".
- **Secondary**: "[Answer the review comments]" "20 min"; "[Agent: refactor the sync queue]" "30 min".
- **Stretch**: "[Tidy the Linear backlog]" "15 min".
- `BottomNav`.

The band sits where the plan's times reach 10:30, inside a tier if that is where the plan is; nothing splits the block or the item (the dev note). The card's consequence is the only warning: no prompt, no sheet.

**The build, with the later rulings applied:** the band is an event, plum (D-USE-38). Rows and card take the locked phone form (D-USE-51), the card the shaded Next card (D-USE-45, D-USE-49); the consequence joins the card's meta [ASSUMPTION: after the length range, in ink, never warning or red]. The locked phone `BlockHeader` also names the meeting ("9:30 to 12:00 · Kestrel weekly at 11:00", D-USE-58); the frame's header does not. [ASSUMPTION] Both show: the header names the block's meetings, the band places this one in the flow.

**Desk (not drawn):** the Work band names the meeting ahead ("Work 9:30 to 12:00 · Kestrel weekly at 11:00, in 40 min", drawn on "USE — work", [working](working.md)), and the day column holds it in plum. Decided (D-USE-77): the desk adds no band in the tiers (the Work band already says it) and the lifted card's meta carries the same consequence, "would end 10:50, past <meeting>".

## What the person can do

Start the item anyway (nothing stops it; it runs on through the meeting, the dev note); fire it; pick another. At 10:30 the band lifts ([meeting-lifted](meeting-lifted.md)).

## Words

"would end 10:50, past [Design sync]"; "10:30 to 11:00 · the work below waits until 11:00"; "in 10 min"; "Work". [PROPOSED] (step 8, not ruled).

## The notes on the boards

**"now-work / meeting mid-block, coming up / 402 / light"**, "Frame" @ x 3374, y 17430:

> now, meeting coming up [PROPOSED]
>
> The meeting sits in the flow as a band at the point the plan reaches 10:30, with "in 10 min". The lifted card shows the consequence: it would end past the meeting. At 10:30 it lifts (round 1).

## Rulings

- D-USE-77: step 8's [PROPOSED] and [ASSUMPTION] marks in this file stand as drawn (Decided (D-USE-77)).
- The band in the flow is [PROPOSED] (step 8 and the dev note; not ruled).
- D-USE-38: events are plum. D-USE-65: at its time, the desk lifts a meeting as a row under the band.
- The frame draws plain rows and a verdigris-dot card; D-USE-51 makes them the trimmed work rows.

## Widths

Drawn at 402. Desk: Decided (D-USE-77), above.

## Criteria

| ID                              | When                                  | Then                                                                                        | Evidence                             |
| ------------------------------- | ------------------------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------ |
| C-USE-today-meeting-coming-up-1 | A meeting falls inside the Work block | It shows as a band where the plan reaches its time, with "in n min"; the block is not split | `captures/meeting-coming-up-402.png` |
| C-USE-today-meeting-coming-up-2 | Next would end past the meeting       | Its card names it: "would end <time>, past <meeting>"; no prompt                            | `captures/meeting-coming-up-402.png` |
| C-USE-today-meeting-coming-up-3 | Times after the band                  | They re-flow by the meeting's length                                                        | test                                 |
