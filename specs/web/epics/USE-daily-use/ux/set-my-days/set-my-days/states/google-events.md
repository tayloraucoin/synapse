---
target: specs/web/ux/set-my-days/set-my-days/states/google-events.md
status: approved
promoted:
boards:
  - name: "set-my-days / this week, Google events / 402 / light"
    page: "USE — set up"
    at: [0, 1260]
    note: "Frame @ x 0, y 2190"
    capture: specs/web/epics/USE-daily-use/ux/set-my-days/set-my-days/captures/google-events-402.png
rulings: [D-USE-31, D-USE-38, D-USE-79, D-USE-87]
---

# Set my days — Google events on the day

This week's Monday with events from a subscribed Google calendar: answered yes as a read-only plum band, maybe or not answered as a faint dashed band with Add to day. `?state=google-events`. The layout is [`../index.md`](../index.md)'s. The connection and its open questions are the dev note [`../../../dev-notes/google-calendar.md`](../../../dev-notes/google-calendar.md). Its note is "Frame" at x 0, y 2190.

## What shows, top to bottom

- Header, chips (M 12 selected), bounds row as the day; "Saved" with a check.
- Orient, Wellness, Training and Breakfast with item icons ([`item-icons.md`](item-icons.md)).
- **Work** 9:30 to 12:00:
  - "Primary" with its leaf square; "[Write the sync spec] · ENG-123" with its project emoji.
  - **Yes event:** a plum band, calendar icon, "[Standup]" (strong), "10:30 to 11:00", "Google" at its trailing end (muted). Times read-only.
  - **Maybe event:** a faint dashed band with no fill, "[Coffee with Ana] 11:00 · maybe" (muted), and a small secondary button "Add to day". It takes no time.
  - "[Review the Paper handoff] · 11:00", re-flowed to the yes band's end.
- Lunch 12:00 to 13:00; the + at the bottom right.

## What the person can do

- **Add to day** on a maybe: Decided (D-USE-87) Not drawn after the tap. Default: it becomes a yes-style plum band at its time, read-only, and the work after it re-flows as [`event-inside-work.md`](event-inside-work.md), with a Toaster and Undo; it is not answered in Google (read-only until the dev note's "Read-only or two-way" is settled).
- A yes band: its times are read-only [ASSUMPTION: a tap shows the event read-only, with no edit; not drawn].
- An event declined (No) is hidden. Usual week shows no events.
- An event in no block stands as its own small block ([`event-own-block.md`](event-own-block.md)) [ASSUMPTION: a Google one too, with "Google" in place of the tag].

## Words

"Google" (the source, at a yes band's end) · "<time> · maybe" · "Add to day". Event names are [placeholder].

## The notes on the boards

**"set-my-days / this week, Google events / 402 / light"**, note "Frame" @ x 0, y 2190:

> New · Google events on the day
>
> Answered yes: a plum band at its time inside the block, times read-only, "Google" at its end; the work after it re-flows to 11:00. Maybe or not answered: a faint dashed band with Add to day, which takes no time until added. No: hidden. Usual week shows none. Events are [placeholder].

## Rulings

- Round 3 (open-4, "Set my days, step 9 round 3"): a yes event as a plum band (the next item re-flows), a maybe as a dashed band with Add to day [PROPOSED].
- D-USE-31, D-USE-38, D-USE-79: events are plum, a fill with the calendar icon; a maybe, with no fill, is not yet an event on the day.
- The dev note's "To decide" (read-only or two-way, items on a calendar event, a moved meeting's re-flow through Make room's engine, offline) stays open there; this file carries the day's half. Settings › Connections is the account area's.

## Widths

Drawn at: 402. Not drawn at: 1024 and wider (list-detail, D-USE-83) [ASSUMPTION: the same bands in the day pane].

## Criteria

| ID                                | When                                            | Then                                                                                      | Evidence                         |
| --------------------------------- | ----------------------------------------------- | ----------------------------------------------------------------------------------------- | -------------------------------- |
| C-USE-set-my-days-google-events-1 | A subscribed event is answered yes              | A plum band at its time, read-only times, "Google" at its end; the work after it re-flows | `captures/google-events-402.png` |
| C-USE-set-my-days-google-events-2 | An event is maybe or not answered               | A faint dashed band with "<time> · maybe" and Add to day, taking no time                  | `captures/google-events-402.png` |
| C-USE-set-my-days-google-events-3 | An event is declined, or the view is Usual week | It is not shown                                                                           | test                             |
