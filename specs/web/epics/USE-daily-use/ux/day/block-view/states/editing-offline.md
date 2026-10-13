---
target: specs/web/ux/day/block-view/states/editing-offline.md
status: approved
promoted:
boards:
  - name: "block-view / editing, offline / 402 / light"
    page: "USE — daily use"
    at: [6266, 6420]
    note: "Note · block-view / editing, offline"
    capture: specs/web/epics/USE-daily-use/ux/day/block-view/captures/editing-offline-402.png
rulings: [D-USE-56, D-USE-64, D-USE-67]
---

# Block view — editing, offline

The editing mode with no connection: the usual Monday's Wellness at 21:10. The audit gap drawn 2026-10-10 (open-7 "Audit gaps"). `?state=editing-offline`. Its note is "Note · block-view / editing, offline" at x 6266, y 7350.

## What shows, top to bottom (as drawn)

- Status bar 21:10; breadcrumb "‹ Monday › Wellness".
- **Header:** the leaf bar, "Wellness" over "7:05 to 8:00 · every Monday"; "Done" (semibold, ink, live) and ··· (round, faded).
- **`StatusLine`** band: a wifi-off icon and "Offline. Changes wait until the connection is back." (caption, muted).
- **Rows**, each with its item icon (emoji) before the name, the length trailing and a faded grip: 7:05 (a balance scale) "Pee and weigh" 2 min; 7:07 (a droplet) "Water" 1 min; 7:08 (a shower head) "Start the cold bath" 2 min; 7:10 (a meditating figure) "Meditate" "At 7:10 · 10 min" with a faded clock (the set-time mark) in the grip's place; 7:20 (an ice cube) "Cold bath" 10 min.
- The add row at 7:30 "+ Add to Wellness" faded; "Free until 8:00" faded; "8:00" and its line; the Training peek.

## What the person can do

**As drawn:** read; "Done" leaves editing; "‹ Monday" goes back. Grips, the set-time clock, the add row and ··· do nothing.

**Under the default below:** everything in [`editing-monday.md`](editing-monday.md) works, saved on the phone and synced later; the StatusLine stays; no control is faded.

## Words

"Offline. Changes wait until the connection is back." (N2's StatusLine words; they fit both readings). "7:05 to 8:00 · every Monday"; "At 7:10 · 10 min".

## The notes on the boards

**"block-view / editing, offline / 402 / light"**, note "Note · block-view / editing, offline" @ x 6266, y 7350:

> block-view / editing, offline (block-view.md)
>
> Step 3's 13 frames on "USE — daily use" already cover loading, error, offline from the day, current and past; this one was missing. Read-only, with N2's StatusLine. Grips, the set-time clock, the add row and ··· are faded. [ASSUMPTION] Done stays live as the way out of editing.

## Rulings

- **The conflict.** This locked frame, the note under `block-view / offline` ("Editing Monday's default offline is read-only") and N2's Set my days offline row ("read-only … Edits are disabled") draw editing as read-only offline. Taylor's rule since: the item sheet edits offline and syncs later (D-USE-64), as everything works offline on the phone (D-USE-56); D-USE-64 sends this frame back to this thread.
- Decided (D-USE-67), edits in Block view's editing mode also save on the phone and sync later, as the item sheet does (D-USE-64, D-USE-56), so the frame's read-only rendering is superseded in behaviour (no canvas edit; a canvas change would reopen Design). Alternative: keep editing read-only offline as drawn, because editing changes the usual week.
- Under the default, Set my days' own offline (area 5) faces the same question; that thread carries it.
- The frame draws item icons and the set-time clock (open-4, round 3); the earlier step 3 frames predate them (index › Layout). "Done" appears only on this editing frame; `editing-monday` has none [ASSUMPTION: under the default, editing has no Done, as `editing-monday`; under the alternative, Done stays live, as the note assumes].
- open-7 "Audit gaps" names this frame; the item as a whole is not carried here.

## Widths

Drawn at: 402. Not drawn at: the desk; as `editing-monday.md`.

## Criteria

| ID                                 | When                              | Then                                                                                        | Evidence                           |
| ---------------------------------- | --------------------------------- | ------------------------------------------------------------------------------------------- | ---------------------------------- |
| C-USE-block-view-editing-offline-1 | Offline in editing mode           | The StatusLine "Offline. Changes wait until the connection is back." shows under the header | `captures/editing-offline-402.png` |
| C-USE-block-view-editing-offline-2 | An edit is made offline (default) | It saves on the phone and syncs on reconnect, nothing lost                                  | test                               |
