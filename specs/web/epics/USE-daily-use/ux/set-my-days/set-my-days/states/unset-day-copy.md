---
target: specs/web/ux/set-my-days/set-my-days/states/unset-day-copy.md
status: approved
promoted:
boards:
  - name: "set-my-days / unset day, a day built, copy first / 402 / light"
    page: "USE — set up"
    at: [3514, 14000]
    note: "Note · unset day, a day built, copy first"
    capture: specs/web/epics/USE-daily-use/ux/set-my-days/set-my-days/captures/unset-day-copy-402.png
rulings: [D-USE-30, D-USE-32, D-USE-85]
---

# Set my days — an unset day, once a day is built

Tuesday in Usual week with no times yet, Monday built. `?state=unset-day-copy`. Drawn after Taylor's question of 2026-10-19 ("How to copy day now?"): with Copy from off the week's rows, copying took three taps. Its note is "Note · unset day, a day built, copy first" at x 3514, y 14930.

## What shows, top to bottom

- As [`empty-first-day.md`](empty-first-day.md) to the hairline, with "T" open and a dot under "M" (built).
- Left-aligned under the hairline (D-USE-30): "Nothing on Tuesday yet." (heading, semibold), then muted "Start from a day that's built, or set its own times."
- **The copy offer:** a primary `Button`, 48 px, copy glyph, "Copy from Monday"; beside it the ghost button "Other day…".
- A divider with the muted words "or set its own times".
- The two labelled `TimeField`s with grey suggestions, then "Set Tuesday, 7:00 to 22:30" as a secondary (outlined) button, and "Saves the two times shown. Either can change later."

## What the person can do

- **Copy from Monday:** Tuesday takes Monday's blocks **and its Up at and Lights out**, since it has none of its own; it copies at once with a `Toaster` and Undo (D-USE-32), and Undo returns it to unset. The day opens on its column.
- **Other day…:** Copy from's picker ([`../../../interactions/copy-from/states/copy-picker.md`](../../../interactions/copy-from/states/copy-picker.md)); a pick copies the same way.
- **Set Tuesday, …:** as on the first day; the day opens on [`copy-offer.md`](copy-offer.md).
- The button names the last built weekday before this one (D-USE-85), wrapping from Monday back to Sunday.

## Words

"Nothing on <weekday> yet." · "Start from a day that's built, or set its own times." · "Copy from <weekday>" · "Other day…" · "or set its own times" · "Set <weekday>, <up> to <out>" · "Saves the two times shown. Either can change later."

## The notes on the boards

**"set-my-days / unset day, a day built, copy first / 402 / light"**, "Note · unset day, a day built, copy first" @ x 3514, y 14930:

> 4 · An unset day once one is built: copy first
>
> Once any day is built, an unset day opens with the copy offer above its fields. Copying an unset day takes the source's Up at and Lights out as well as its blocks; Undo puts it back to unset. Row tap, then Copy from Monday: two taps.

## Rulings

- Taylor, 2026-10-19: approved ("okay") with the boards.
- It amends Copy from's rule "Up at and Lights out stay the day's own" for a day that has none ([`../../../interactions/copy-from/index.md`](../../../interactions/copy-from/index.md)).

## Widths

Drawn at: 402. At 1024 it sits in the day pane as the first-day state does ([`time-picker.md`](time-picker.md)'s 1024 board).

## Criteria

| ID                                 | When                                    | Then                                                                                   | Evidence                          |
| ---------------------------------- | --------------------------------------- | -------------------------------------------------------------------------------------- | --------------------------------- |
| C-USE-set-my-days-unset-day-copy-1 | An unset day opens, another day built   | "Copy from <day>" and "Other day…" above the fields; "Set <day>, …" secondary          | `captures/unset-day-copy-402.png` |
| C-USE-set-my-days-unset-day-copy-2 | "Copy from Monday" on an unset day      | Monday's blocks and bounds copy at once; a Toaster offers Undo                         | test                              |
| C-USE-set-my-days-unset-day-copy-3 | Undo after that copy                    | The day is unset again                                                                 | test                              |
