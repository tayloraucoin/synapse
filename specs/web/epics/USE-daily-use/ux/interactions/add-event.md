---
target: specs/web/ux/interactions/add-event.md
status: approved
promoted:
boards: []
dev_note: ""
rulings:
  [
    D-USE-31,
    D-USE-40,
    D-USE-41,
    D-USE-42,
    D-USE-54,
    D-USE-93,
    D-USE-95,
    D-USE-102,
  ]
---

# Add an event (desk)

An event added by hand at the desk: a popover that asks the name, the times, Work or Personal, the client and Repeats, and says where the event lands and what moves before it is added (D-USE-42). Events added here live in Synapse and stay editable; Google's stay read-only. The popover is drawn once, inside `week / time lens / 1728 / light`, carried by [`../work/week/states/time-lens.md`](../work/week/states/time-lens.md); this file holds the behaviour (`boards: []`).

## Where it starts

- **The Week, Time lens:** hover a day head for "+ Event" (drawn on "Wed 14 ›" as a small outlined chip) (D-USE-41) [ASSUMPTION: the Priority lens's day heads offer it too, since Events is a row there].
- **Today:** "+ Add ⌄" › "Event" ([`add/index.md`](add/index.md) step 2d), for today's date.
- **Phone:** + Add › Event (D-USE-54) and Set my days' + › Event open the phone's Add event sheet, [`../set-my-days/set-my-days/states/add-event.md`](../set-my-days/set-my-days/states/add-event.md).

## Steps

| #   | The person          | The app                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | Board (carried by)                                                                                                |
| --- | ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| 1   | "+ Event" on Wed 14 | A popover (340, the sheet radius, soft shadow) under the head, focus in the name                                                                                                                                                                                                                                                                                                                                                                                                         | `week / time lens / 1728 / light`, its "Event popover · Wed" ([`time-lens.md`](../work/week/states/time-lens.md)) |
| 2   | Fills it            | "New event · Wednesday 14" (600); the name field (ring) with its emoji slot, "📞 [Call with Kestrel legal]"; **Starts** "14:00" and **Ends** "14:30", each a field with − +; a `SegmentedControl` **Work** (selected) or **Personal**; **Client** with the rose "K" tile and "Kestrel Health"; **Repeats** "Does not repeat"; a rule, then the landing line (muted): "Sits inside Work, 13:00 to 15:00. Nothing moves: that block has room until 15:00."; **Add event**, full width, ink | same                                                                                                              |
| 3   | Add event           | The event shows in plum at its time in that day's column (D-USE-31, D-USE-41), inside the block its time falls in; the work after it re-flows when it must [ASSUMPTION: a toast "Added inside Work, 14:00" with Undo, as Set my days' [`event-inside-work.md`](../set-my-days/set-my-days/states/event-inside-work.md)]                                                                                                                                                                  | not drawn at the desk                                                                                             |

## Rules

- **The time decides where it lands**; there is no choice of place. The line above Add event says where and what moves, and changes with every field: inside a block with room, "Nothing moves"; [ASSUMPTION] where work must move, it names it as the phone does ("The work around it moves: <item> starts at <time>."); in no block, it stands as its own small plum block ([`../set-my-days/set-my-days/states/event-own-block.md`](../set-my-days/set-my-days/states/event-own-block.md)). A meeting inside a Work block never splits it ([`../dev-notes/meeting-inside-a-work-block.md`](../dev-notes/meeting-inside-a-work-block.md)).
- **Work or Personal** is the event's tag, shown on it as Today shows ("Work" or "Personal" `Tag`). **Client** applies to a Work event [ASSUMPTION: hidden for Personal, and when clients are off]; its tile carries its letter or logo, so colour is never alone (D-USE-95).
- **Repeats** takes the Repeats select's options, Google Calendar's baseline ([`../set-my-days/new-block-sheet/states/repeats-menu.md`](../set-my-days/new-block-sheet/states/repeats-menu.md)) [ASSUMPTION: the same select].
- **Synapse events are editable** [ASSUMPTION: clicking one opens this popover filled, with "Save" and "Delete event"]; **Google events are read-only**, several calendars each on or off ([`../dev-notes/google-calendar.md`](../dev-notes/google-calendar.md)) [ASSUMPTION: clicking one shows its name, time and calendar, and "Open in Google Calendar"]. Nothing is written to Google.
- Events are not a pool tab: they come from calendars or "+ Event" (D-USE-41).
- [ASSUMPTION] No name: Add event is faded with "Name needed" (as Set my days' sheet). Ends before Starts is refused in words [ASSUMPTION].
- Offline: [ASSUMPTION] adding works and syncs later (D-USE-56); Google's last-synced events stay, read-only.
- Decided (D-USE-102): One form or two. The phone's Add event sheet (step 9) has Starts with Length, Colour (plum) and Notes, "this date only"; the desk popover (round 3) has Starts with Ends, Client and Repeats. Ruled: each as drawn.

## Words

"+ Event" · "New event · <Weekday> <date>" · "Starts" · "Ends" · "Work" · "Personal" · "Client" · "Repeats" · "Does not repeat" · "Sits inside <block>, <start> to <end>. Nothing moves: that block has room until <end>." · "Add event". No second person; times as "14:00".

## Access

A `Popover` with a focus trap [ASSUMPTION]; focus starts in the name and returns to "+ Event" on close; Esc closes with nothing added. "+ Event" shows on focus as on hover, named "Add an event on Wednesday 14". Starts and Ends are time inputs that also step with − + (each named "Earlier", "Later" for its field) [ASSUMPTION]. The landing line is tied to Add event by `aria-describedby` and announced politely when it changes [PROPOSED]. Plum is never alone: the event carries its name and time.

## Platforms

Desk from 1024 (D-USE-93), drawn at 1728 only. Below 1024, the phone's sheet (above).

## Rulings

- D-USE-41: "+ Event" on a day head; events in plum; not a pool tab.
- D-USE-42: the popover names where the event lands and what moves; Synapse events editable, Google read-only.
- D-USE-31: events are plum. D-USE-40: Google calendars read-only, several, each on or off. D-USE-54: Event is one of + Add's four on the phone. D-USE-95: client colours and their letter tile.

## Criteria

| ID                | When                                               | Then                                                                                                       | Evidence                                   |
| ----------------- | -------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| C-USE-add-event-1 | "+ Event" on Wed 14, 14:00 to 14:30, Work, Kestrel | The landing line reads "Sits inside Work, 13:00 to 15:00. Nothing moves: that block has room until 15:00." | `../work/week/captures/time-lens-1728.png` |
| C-USE-add-event-2 | Add event                                          | It shows in plum at its time in that day's block; nothing is written to Google                             | test                                       |
| C-USE-add-event-3 | A Google event clicked                             | It reads only; no field is editable                                                                        | manual                                     |
