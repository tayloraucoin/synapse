---
target: specs/web/ux/set-my-days/set-my-days/states/offline.md
status: approved
promoted:
boards:
  - name: "set-my-days / offline / 402 / light"
    page: "USE — set up"
    at: [0, 2520]
    note: "Frame @ x 0, y 3450"
    capture: specs/web/epics/USE-daily-use/ux/set-my-days/set-my-days/captures/offline-402.png
rulings: [D-USE-33, D-USE-67, D-USE-82, D-USE-87]
---

# Set my days — offline

The usual Thursday with no connection. `?state=offline`. Its note is the "Frame" at x 0, y 3450. Layout, words and access: [`../index.md`](../index.md).

## What shows, top to bottom

- **Header:** "‹ Week", the title "Every Thursday"; `SaveStatus` hidden.
- **Weekday chips**, live: M T W **T** F S S with their dots.
- **Bounds row, faded and inert:** "Up at 7:00", "Lights out 22:30" and the ··· in faded ink.
- **Column**, from cache: Orient · 5 min at 7:00; Wellness 7:05 to 8:00; Training 8:00 to 8:57; Breakfast 9:00 to 9:30; Work 9:30 to 12:00, "Work goes in on This week."; Lunch fading under the line.
- **`StatusLine`** where the + was, at the foot: a cloud-off glyph and "Offline. Changes wait until the connection is back." (label). No +.

## What the person can do

- Read the day; switch days on the chips; back.
- Not edit the day's own controls: Up at, Lights out, the ··· and the + are read-only (D-USE-82). No drag to move a block [ASSUMPTION: moving a block in time is the day's own edit].
- Open a block: its Block view **edits offline** (D-USE-82, D-USE-67): a change saves on the phone and syncs when back. See [`../../../day/block-view/states/offline.md`](../../../day/block-view/states/offline.md) and [`../../../day/block-view/states/editing-offline.md`](../../../day/block-view/states/editing-offline.md), superseded in behaviour by D-USE-67.
- A usual-week change made offline in a block names its reach when it syncs [Decided (D-USE-87): not drawn; default: the Toaster of [`usual-change-reaches.md`](usual-change-reaches.md) shows on sync, not offline].

## Words

"Offline. Changes wait until the connection is back." (N2, the canvas), kept with D-USE-82.

## The notes on the boards

**"set-my-days / offline / 402 / light"**, "Frame @ x 0, y 3450":

> Offline
>
> Read-only. The StatusLine sits where the + was, "Offline. Changes wait until the connection is back." Bounds and ··· are faded and inert; blocks still open, read-only [ASSUMPTION]. SaveStatus is hidden.

## Rulings

- D-USE-82 (Split): the day's own controls (Up at, Lights out, the ···, the +) stay read-only as drawn, with its StatusLine. **Superseded in behaviour:** the note's "blocks still open, read-only [ASSUMPTION]": a block opened from here edits offline as D-USE-67 rules, saving on the phone and syncing when back. The note's "Read-only" now covers the day's own controls only. The canvas is not edited.
- D-USE-67: Block view edits offline as the item sheet does; Set my days' offline row is checked against it (this file).
- N2's offline row ("read-only … Edits are disabled") holds for the day's controls only, under D-USE-82.
- D-USE-33: offline approved in round 4.

## Widths

Drawn at: 402. At 1024 and wider (D-USE-83, [`the-day.md`](the-day.md)) the `StatusLine` sits at the foot of the day pane; a block opened in the detail pane edits offline as above [ASSUMPTION].

## Criteria

| ID                          | When                      | Then                                                                                     | Evidence                   |
| --------------------------- | ------------------------- | ---------------------------------------------------------------------------------------- | -------------------------- |
| C-USE-set-my-days-offline-1 | Offline                   | The StatusLine in the +'s place; bounds and ··· faded and inert; no +; SaveStatus hidden | `captures/offline-402.png` |
| C-USE-set-my-days-offline-2 | A block is opened offline | Its Block view edits; changes save on the phone                                          | test                       |
| C-USE-set-my-days-offline-3 | Back online               | Block edits made offline sync with nothing lost                                          | test                       |
