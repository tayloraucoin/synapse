---
target: specs/web/ux/interactions/add/states/from-linear-by-size.md
status: approved
promoted:
boards:
  - name: "set-my-days / from Linear, by size / 402 / light"
    page: "USE — set up"
    at: [1446, 1260]
    note: "Note · name only, 80 @ x 1446, y 2190"
    capture: specs/web/epics/USE-daily-use/ux/interactions/add/captures/from-linear-by-size-402.png
rulings: [D-USE-39, D-USE-57, D-USE-65, D-USE-77]
---

# + Add — From Linear, by size (Set my days)

Step 2b′ of [`../index.md`](../index.md). Drawn once, `set-my-days / from Linear, by size / 402 / light` ([capture](../captures/from-linear-by-size-402.png)): Set my days › This week, a Work block in editing, Primary's add row › From Linear ([`../../../day/block-view/states/work-add-to-a-tier.md`](../../../day/block-view/states/work-add-to-a-tier.md)). Step 8's picker with Size added. `?state=from-linear-by-size`.

## What shows, top to bottom

- × on the left; "Mon 12 · Work · Add to Primary" (muted), then "From Linear" (heading); "Search Linear issues"; All / [Lighthouse] / [Studio]; chips "Assigned to Taylor" and "Not done" (on, ink outline) and "Size" (off, muted) [PROPOSED]; the list in workspace groups with a lettered tile ("L [Lighthouse]", "S [Studio]"); the consequence line; "Add to Primary", the one primary, full width in ink.
- **A row:** a checkbox, the issue's icon, the name, and under it project · ID · length range ("Sync engine · ENG-151 · 30 min to 1 h"); the points word on the right ("2 Small", "3 Medium", "1 Quick"). An issue already on the day is faded with no checkbox to tick: "ENG-123 · already on Mon 12, in Primary". Several can be ticked at once.

## What the person can do

- Tick one or more rows; "Add to Primary" adds them to the tier, then step 3 of [`../index.md`](../index.md).
- **Size words and ranges** are [`../../../dev-notes/size-and-length.md`](../../../dev-notes/size-and-length.md)'s (1 Quick 15 to 30 min, 2 Small 30 min to 1 h, 3 Medium 1 to 2 h; the range from Linear's estimate). The Size chip's choices are not drawn [ASSUMPTION: the five words, any number at once].
- **The consequence line** [PROPOSED], above the action, for what is ticked: "With this, Primary runs to 13:00 at the top of its ranges: past Work's end at 12:00. Secondary and Stretch wait." Said in words, never red; it changes as rows are ticked [ASSUMPTION]; with nothing ticked it does not show [ASSUMPTION].
- **The workspace switch** (All plus one per workspace, groups by workspace) is drawn here again; D-USE-57 (later) groups by client with team and project lines, as [`../index.md`](../index.md) › Rules says; the Size additions stand on that list.
- × closes without adding.

## Words

"Mon 12 · Work · Add to Primary" · "From Linear" · "Search Linear issues" · "Assigned to Taylor" · "Not done" · "Size" · "already on Mon 12, in Primary" · the consequence line above · "Add to <tier>".

## The notes on the boards

**set-my-days / from Linear, by size / 402 / light** (Note · name only, 80 @ x 1446, y 2190):

> From Linear, by workspace and size
>
> Step 8's picker with Size: each issue shows its points word on the right and its length range under the name. [PROPOSED] A Size filter chip. [PROPOSED] Above Add, the consequence for the block: where Primary would end and what waits.

## Rulings

- No D-line names this frame; its marks stand as drawn.
- D-USE-77: step 8's [PROPOSED] and [ASSUMPTION] marks stand as drawn (Decided (D-USE-77)).
- D-USE-57: the list groups by client, then team and project lines; the frame's workspace switch is superseded there.

## Widths

Drawn at: 402. Desk: the right-panel sheet (D-USE-39, D-USE-65).

## Criteria

| ID                              | When                               | Then                                                                                                                                  | Evidence                               |
| ------------------------------- | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| C-USE-add-from-linear-by-size-1 | From Linear in a tier, rows ticked | Each row shows its points word and length range; the line above Add names where the tier ends at the top of its ranges and what waits | `captures/from-linear-by-size-402.png` |
| C-USE-add-from-linear-by-size-2 | An issue already on the day        | Faded, with no checkbox, naming its day and tier                                                                                      | `captures/from-linear-by-size-402.png` |
