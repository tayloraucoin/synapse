---
target: specs/web/ux/set-my-days/new-block-sheet/states/clash.md
status: approved
promoted:
boards:
  - name: "new-block / clash / 402 / light"
    page: "USE — set up"
    at: [4820, 5040]
    note: "Frame @ x 4820, y 5970"
    capture: specs/web/epics/USE-daily-use/ux/set-my-days/new-block-sheet/captures/clash-402.png
rulings: [D-USE-33, D-USE-34]
---

# New block sheet — clash

Stretch set to start at 11:30 on the usual Monday, inside Work (9:30 to 12:00). `?sheet=new-block&state=clash` [ASSUMPTION: the state param].

## What shows, top to bottom

- As `from-a-tapped-time.md` (Training, "Stretch", "Weekly on Monday", "Clay, Training's colour", Checklist off), with **Starts** "11:30" and **Ends** "11:50", "20 min" beside it.
- In the consequence line's place, in ink (not muted): "Overlaps Work, 9:30 to 12:00. Adding still works: the two sit side by side, and Work keeps its time."
- "Add block", ink, live.

## What the person can do

- **Add block:** the two blocks sit side by side at half width, as `../../set-my-days/states/overlap.md` draws it, Work keeping its time; the new block opens its Block view empty.
- Change Starts or Ends until the line goes back to "Goes in…".

## Words

"Overlaps <Block>, <start> to <end>. Adding still works: the two sit side by side, and <Block> keeps its time."

## The notes on the boards

**"new-block / clash / 402 / light"**, "Frame" @ x 4820, y 5970:

> Clash
>
> 11:30 lands inside Work. A quiet line in ink, "Overlaps Work, 9:30 to 12:00.", and what adding does: side by side, as round 4's overlap draws it. Add stays live.

## Rulings

- D-USE-34: the clash line in ink, Add live, approved. It is never red and never blocks (N2: adding is still allowed).
- D-USE-33: overlapping blocks sit side by side, with one fix offered in Set my days.
- A transition at a time inside a block is not a clash: it joins the block (`transition.md`).

## Widths

Drawn at: 402. At 1024 and wider: the right panel at `--sheet-w` (D-USE-39, D-USE-83).

## Criteria

| ID                            | When                         | Then                                                      | Evidence                 |
| ----------------------------- | ---------------------------- | --------------------------------------------------------- | ------------------------ |
| C-USE-new-block-sheet-clash-1 | A block's time overlaps Work | The overlap line in ink names Work's span; Add stays live | `captures/clash-402.png` |
| C-USE-new-block-sheet-clash-2 | Added anyway                 | Both sit side by side; Work keeps its time                | test                     |
