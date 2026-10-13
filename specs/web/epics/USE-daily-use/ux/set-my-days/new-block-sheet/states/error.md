---
target: specs/web/ux/set-my-days/new-block-sheet/states/error.md
status: approved
promoted:
boards:
  - name: "new-block / error, not added / 402 / light"
    page: "USE — set up"
    at: [5784, 5040]
    note: "Frame @ x 5784, y 5970"
    capture: specs/web/epics/USE-daily-use/ux/set-my-days/new-block-sheet/captures/error-402.png
rulings: [D-USE-34, D-USE-82, D-USE-87]
---

# New block sheet — error, not added (and offline)

Add block failed on the Stretch block of `from-a-tapped-time.md`. `?sheet=new-block&state=error` [ASSUMPTION: the state param].

## What shows, top to bottom

- As `from-a-tapped-time.md`, everything typed kept (Training, "Stretch", 17:00 to 17:20, "Weekly on Monday", Checklist off).
- In the consequence line's place, in ink with a leading alert-circle icon: "Not added." then "Try again" (underlined text button).
- "Add block", ink, live.

## What the person can do

- **Try again** or **Add block** sends it again; on success the sheet closes into the Block view as usual.
- Change anything; × closes, and what was typed is lost [ASSUMPTION: not drawn].

## Offline

- From Set my days, the day's own + and empty times are read-only offline (D-USE-82; `../../set-my-days/states/offline.md`), so the sheet does not open there offline. The frame note's [ASSUMPTION] ("still opens from a loaded day") is read under D-USE-82: it holds only when the connection drops while the sheet is open, and then Add shows this same line, with everything kept, until back online.
- Decided (D-USE-87) From Review the day's add sheet ("Block"), which works offline (`../../../day/review-the-day/states/offline.md`): default, the sheet adds the block to today on the phone and syncs when back, as D-USE-64 and D-USE-67 have edits do.

## Words

"Not added." · "Try again". N2's "Not added. Try again." is drawn as a line and a text button.

## The notes on the boards

**"new-block / error, not added / 402 / light"**, "Frame" @ x 5784, y 5970:

> Error, offline
>
> "Not added. Try again." inline above Add, in ink with an icon; everything typed stays. [ASSUMPTION] Offline the sheet still opens from a loaded day and shows the same line on Add, since Set my days is read-only offline.

## Rulings

- D-USE-34: "Not added. Try again." inline, approved. In ink with an icon, never red.
- D-USE-82: Set my days' own controls, the + among them, are read-only offline; a block opened from it edits offline (D-USE-67), but a new block is not added from it offline.

## Widths

Drawn at: 402. At 1024 and wider: the right panel at `--sheet-w` (D-USE-39, D-USE-83).

## Criteria

| ID                            | When                | Then                                                              | Evidence                 |
| ----------------------------- | ------------------- | ----------------------------------------------------------------- | ------------------------ |
| C-USE-new-block-sheet-error-1 | Add block fails     | "Not added." with Try again inline, in ink; everything typed kept | `captures/error-402.png` |
| C-USE-new-block-sheet-error-2 | Set my days offline | The + and empty times do not open the sheet                       | test                     |
