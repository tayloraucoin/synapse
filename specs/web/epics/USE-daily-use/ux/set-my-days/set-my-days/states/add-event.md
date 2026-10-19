---
target: specs/web/ux/set-my-days/set-my-days/states/add-event.md
status: approved
promoted:
boards:
  - name: "set-my-days / add event / 402 / light"
    page: "USE — set up"
    at: [5784, 0]
    note: "Note · name only, 80 @ x 5784, y 930"
    capture: specs/web/epics/USE-daily-use/ux/set-my-days/set-my-days/captures/add-event-402.png
rulings: [D-USE-19, D-USE-31, D-USE-34, D-USE-35, D-USE-38, D-USE-79]
---

# Set my days — Add event

The Add event sheet over This week's Monday: an appointment, meeting or social event at a set time, on this date only. `?state=add-event`. Opened from the + menu's Event ([`plus-menu.md`](plus-menu.md)). The layout is [`../index.md`](../index.md)'s. Its note is "Note · name only, 80" at x 5784, y 930.

## What shows, top to bottom

- Behind: the day, dimmed under a scrim ("‹ Week", "Monday, 12 October").
- **The sheet**, with a grabber:
  - × on the left; eyebrow "Mon 12 · this date only" (muted) over the title "Add event".
  - **Name:** label "Name", an emoji slot (smiley placeholder) beside the field, "[Design review] [placeholder]".
  - **Tag:** label "Tag", a `SegmentedControl` "Work" (selected) or "Personal".
  - Hairline, then 56 px rows: **Starts** with a time field "11:00" at the trailing edge; **Length** with a stepper "− 30 min +"; **Colour** with a plum swatch (ink ring) and "Plum, for events".
  - **Notes (optional):** label, then an empty textarea.
  - At the foot, the consequence line (muted): "Sits inside Work at 11:00 as a band. The work around it moves: [Review the Paper handoff] starts at 11:30."
  - Primary button, full width, ink: "Add event".

## What the person can do

- Name the event; the emoji slot opens the icon picker ([`../../../interactions/icon-picker/index.md`](../../../interactions/icon-picker/index.md)) [ASSUMPTION: as the New block sheet's slot].
- Pick Work or Personal.
- Set Starts and Length [ASSUMPTION: Starts steps by 15 minutes and takes a typed time, as the add sheet's (D-USE-19); Length's step is not drawn]. The consequence line updates with every change.
- Colour: plum by default [ASSUMPTION: tapping opens the swatch picker, D-USE-35].
- **Add event:** the event lands where its time falls, with no choice of place: inside a block as a band ([`event-inside-work.md`](event-inside-work.md)) or, in no block, as its own small block ([`event-own-block.md`](event-own-block.md)). The work after it re-flows (round 8; [`../../../interactions/make-room/index.md`](../../../interactions/make-room/index.md) when there is no room).
- × or a swipe down closes with nothing added [ASSUMPTION: no discard confirm, as the add sheet].
- [ASSUMPTION] With no name, Add event is faded with "Name needed", as the New block sheet (D-USE-34; [`../../new-block-sheet/states/invalid.md`](../../new-block-sheet/states/invalid.md)).

## Words

"Mon 12 · this date only" · "Add event" · "Name" · "Tag" · "Work" · "Personal" · "Starts" · "Length" · "Colour" · "Plum, for events" · "Notes (optional)" · the consequence line, "Sits inside <block> at <time> as a band. The work around it moves: <item> starts at <time>." [ASSUMPTION: outside every block, "Stands as its own block, <start> to <end>."; not drawn].

## The notes on the boards

**"set-my-days / add event / 402 / light"**, note "Note · name only, 80" @ x 5784, y 930:

> Add event
>
> Name, then the tag, Work or Personal, then Starts, Length and Colour (plum by default, D-USE-31). No choice of where it goes: the time decides, and the line above Add says so, naming what moves. Outside every block it stands as its own small block (drawn next round).

## Rulings

- N2: an event is tagged Work or Personal and sits in the block its time falls in, or stands as its own small block. Round 2 (open-3): no placement choice; the line above Add names what moves.
- D-USE-31: events are plum; D-USE-38 and D-USE-79: plum stays, told from off-schedule violet by form (always a fill with the calendar icon).
- An event is one date only, so Usual week offers none ([`plus-menu.md`](plus-menu.md)). Events from Google are [`google-events.md`](google-events.md).

## Widths

Drawn at: 402. Not drawn at: 1024 and wider (list-detail, D-USE-83) [ASSUMPTION: the sheet as the New block sheet shows at that width].

## Criteria

| ID                            | When                            | Then                                                                                                        | Evidence                     |
| ----------------------------- | ------------------------------- | ----------------------------------------------------------------------------------------------------------- | ---------------------------- |
| C-USE-set-my-days-add-event-1 | Event is picked from the + menu | The sheet: Name with emoji slot, Tag, Starts, Length, Colour (plum), Notes, the consequence line, Add event | `captures/add-event-402.png` |
| C-USE-set-my-days-add-event-2 | Starts or Length changes        | The consequence line names the block it lands in and what moves, before Add                                 | test                         |
| C-USE-set-my-days-add-event-3 | Add event is tapped             | The event lands at its time with no placement choice                                                        | test                         |
