---
target: specs/web/ux/set-my-days/new-block-sheet/states/from-a-tapped-time.md
status: approved
promoted:
boards:
  - name: "new-block / block with kind, from a tapped time / 402 / light"
    page: "USE — set up"
    at: [482, 5040]
    note: "Frame @ x 482, y 5970"
    capture: specs/web/epics/USE-daily-use/ux/set-my-days/new-block-sheet/captures/from-a-tapped-time-402.png
rulings: [D-USE-33, D-USE-34, D-USE-80]
---

# New block sheet — a block, from a tapped time

The base state: 17:00 tapped on the usual Monday's empty rail (`../../set-my-days/states/tap-a-time.md`), Training picked and "Stretch" typed. `?sheet=new-block&state=success` [ASSUMPTION: the state param].

## What shows, top to bottom

- Grabber; ×; "Usual Monday · every week" over "New block".
- **Kind:** Wellness, Training (picked, clay soft fill and edge), Work, Life (yellow dot), then To-dos (moss), Break, Evening.
- **Name:** the empty icon tile beside "Stretch" (typed over "Training").
- Hairline; **Starts** "17:00"; hairline; **Ends** "17:20", with "20 min" muted beside it.
- Hairline; **Repeats**, a `Select` reading "Weekly on Monday" with a chevron.
- **Colour:** the clay swatch, "Clay, Training's colour".
- Hairline; **Checklist, no times**, off, "Off: each item gets a length and a place on the rail."
- "Goes in on Mondays, 17:00 to 17:20, after Work. Opens empty to add its items."
- "Add block", ink.

## What the person can do

- Change any field; Ends' length follows Starts and Ends. The tapped slot's end runs to the next block or 1 h [ASSUMPTION, open-5 round 4; drawn here as 20 min, the person's own Ends].
- Repeats: `repeats-menu.md`. Icon: the icon picker. Checklist: `checklist.md`.
- **Add block:** the block lands on every Monday of the usual week, 17:00 to 17:20, and its Block view opens empty (`../../../day/block-view/states/empty.md`).

## Words

"Usual Monday · every week" · "20 min" · "Weekly on Monday" · "Goes in on Mondays, 17:00 to 17:20, after Work. Opens empty to add its items."

## The notes on the boards

**"new-block / block with kind, from a tapped time / 402 / light"**, "Frame" @ x 482, y 5970:

> A block, from a tapped time
>
> Tapped 17:00 on every Monday. Kind first; picking one fills the name ("Stretch" typed over Training) and the colour. Starts, Ends with the length beside it, Repeats, Checklist off. The line above Add says where it goes and that it opens empty. [ASSUMPTION] Name focused with the keyboard up, not drawn.

## Rulings

- D-USE-34: seven kinds, Ends with the length beside it, Repeats, approved as drawn. The [ASSUMPTION] on focus stands as the default (`../words-and-access.md` › Access).
- D-USE-33: tap a time marks the slot and opens New block there.
- D-USE-80: Repeats defaults to weekly on its day from the usual week, Does not repeat from This week (the Repeats menu's note).
- A stretch break is a small Training block (refinement 8).

## Widths

Drawn at: 402. At 1024 and wider: the right panel at `--sheet-w` (D-USE-39, D-USE-83).

## Criteria

| ID                                         | When                                  | Then                                                                        | Evidence                              |
| ------------------------------------------ | ------------------------------------- | --------------------------------------------------------------------------- | ------------------------------------- |
| C-USE-new-block-sheet-from-a-tapped-time-1 | 17:00 tapped on the usual Monday      | Starts 17:00; Repeats "Weekly on Monday"; scope "Usual Monday · every week" | `captures/from-a-tapped-time-402.png` |
| C-USE-new-block-sheet-from-a-tapped-time-2 | Training picked, then "Stretch" typed | The colour is clay; the name stays "Stretch" when the kind changes          | test                                  |
