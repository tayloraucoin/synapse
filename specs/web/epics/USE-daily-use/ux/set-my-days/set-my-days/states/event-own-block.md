---
target: specs/web/ux/set-my-days/set-my-days/states/event-own-block.md
status: approved
promoted:
boards:
  - name: "set-my-days / event as its own block / 402 / light"
    page: "USE — set up"
    at: [482, 1260]
    note: "Frame @ x 482, y 2190"
    capture: specs/web/epics/USE-daily-use/ux/set-my-days/set-my-days/captures/event-own-block-402.png
rulings: [D-USE-31, D-USE-33, D-USE-38, D-USE-79]
---

# Set my days — an event as its own block

An event whose time falls in no block: a dentist at 15:30 stands as a small plum block of its own. `?state=event-own-block`. Added from Add event ([`add-event.md`](add-event.md)). The layout is [`../index.md`](../index.md)'s. Its note is "Frame" at x 482, y 2190.

## What shows, top to bottom

- Header, chips (M 12 selected), bounds row as the day; "Saved" with a check.
- The column scrolled to the afternoon, hour labels 12 to 18:
  - Lunch 12:00 to 13:00, a dashed band with the fork-and-knife.
  - **Work** 13:00 to 15:00 (sky), "No work slotted yet" (muted).
  - Empty rail 15:00 to 15:30.
  - **The event block** 15:30 to 16:15 at its true height: plum fill with a plum left rule, calendar icon, "Dentist [placeholder]" (strong), then "15:30 to 16:15 · Personal · this Monday only" (muted).
  - Empty rail below.
- **Toaster**, full width above the +: "Dentist added as its own block" with "Undo".
- The + at the bottom right.

## What the person can do

- **Undo:** removes the event block [ASSUMPTION: while the Toaster shows].
- Tap the event block [ASSUMPTION: opens it to edit in the Add event sheet's form; not drawn].
- If a block is later set across its time [ASSUMPTION: the event moves inside that block as a band, [`event-inside-work.md`](event-inside-work.md), since the time decides].

## Words

"<span> · <tag> · this <weekday> only" · "<name> added as its own block" · "Undo".

## The notes on the boards

**"set-my-days / event as its own block / 402 / light"**, note "Frame" @ x 482, y 2190:

> An event as its own block
>
> The column scrolled to the afternoon. A dentist at 15:30 falls in no block, so its time makes it a small plum block of its own (round 2: no placement choice). It's dated, so it says "this Monday only". A Toaster with Undo confirms it.

## Rulings

- D-USE-33: step 9 round 4 approved in full, an event as its own block among it. N2: an event "stands as its own small block" when its time falls in no block.
- Round 2 (open-3): no placement choice; the time decides. D-USE-31, D-USE-38, D-USE-79: plum, a fill with the calendar icon.
- Its date line is "this Monday only", not D-USE-33's "This day only" mark: an event is dated by nature, not a block changed for one date.
- This Toaster spans the width above the +; [`event-inside-work.md`](event-inside-work.md)'s sits beside the + [ASSUMPTION: one `Toaster` form, its width set by its text].

## Widths

Drawn at: 402. Not drawn at: 1024 and wider (list-detail, D-USE-83) [ASSUMPTION: the same block in the day pane].

## Criteria

| ID                                  | When                              | Then                                                                                               | Evidence                           |
| ----------------------------------- | --------------------------------- | -------------------------------------------------------------------------------------------------- | ---------------------------------- |
| C-USE-set-my-days-event-own-block-1 | An event's time falls in no block | It stands as a plum block at its true height, with icon, name, span, tag and "this <weekday> only" | `captures/event-own-block-402.png` |
| C-USE-set-my-days-event-own-block-2 | It is added                       | A Toaster "<name> added as its own block" with Undo                                                | `captures/event-own-block-402.png` |
