---
target: specs/web/ux/day/block-view/states/empty.md
status: approved
promoted:
boards:
  - name: "block-view / empty / 402 / light"
    page: "USE — daily use"
    at: [4338, 6420]
    note: "Note · empty"
    capture: specs/web/epics/USE-daily-use/ux/day/block-view/captures/empty-402.png
  - name: "block-view / wellness, new and empty / 402 / light"
    page: "USE — set up"
    at: [3856, 3780]
    note: "Frame @ x 3856, y 4710"
    capture: specs/web/epics/USE-daily-use/ux/day/block-view/captures/empty-new-block-402.png
rulings: [D-USE-24, D-USE-69, D-USE-81, D-USE-84]
---

# Block view — empty

A new block, just added in Set my days, opens here (N2, note 87). `?state=empty`. Drawn twice: step 3's frame on "USE — daily use" (Monday, 20:14; "Note · empty" at x 4338, y 7350) and step 9 round 3's on "USE — set up" (Thursday, 21:10; "Frame" at x 3856, y 4710), the newer drawing.

## What shows, top to bottom

**Step 3, `block-view / empty`:**

- Breadcrumb "‹ Monday › Wellness"; the header with the leaf bar, "Wellness", "7:05 to 8:00", ··· alone.
- Scope line "Every Monday." (caption, muted), then a hairline.
- "Nothing in Wellness yet." (body, muted).
- The add row, focused: an ink-bordered field, "+" leading, "Pee and weigh" typed with the caret, "5 min" trailing (caption, muted).
- Under it (caption, muted): "Return adds it at 7:05 and opens the next line."
- No rail, no "Free until", no peek. The system keyboard up over the lower half.

**Step 9 round 3, `block-view / wellness, new and empty`:**

- Status bar 21:10. Breadcrumb "‹ Thursday › Wellness".
- Header: the leaf bar, "Wellness" over "7:05 to 8:05 · every Thursday" (the scope in the header's meta, no scope line); "Done" beside the round ···. A hairline.
- "Nothing in Wellness yet." (body) above the first row.
- The add row on the rail at "7:05", focused: a field with a green focus border, a dashed square (the icon slot) leading, the caret, "Add to Wellness" as placeholder, "10 min" trailing (muted; superseded by D-USE-81: 5 min).
- Under it (label, muted): "Return adds it and opens the next row. The dashed square picks its icon."
- "Free until 8:05" in a dashed region; the block's end as a solid line at "8:05".
- The keyboard ("Keyboard" placeholder) over the lower third; no peek drawn above it.

## What the person can do

- Type a name; Return adds it at the block's start (or after the last item), 5 minutes long (D-USE-81), and keeps the line open for the next.
- Tap the dashed square: the icon picker ([`../../../interactions/icon-picker/index.md`](../../../interactions/icon-picker/index.md)); the item takes the icon.
- Tap an added item: the Item sheet. ···; Done or the breadcrumb back to the day.

## Words

"Nothing in Wellness yet." (the block's name); "Add to Wellness"; "5 min"; "Return adds it at 7:05 and opens the next line." (step 3) or "Return adds it and opens the next row. The dashed square picks its icon." (round 3); "Free until 8:05".

## The notes on the boards

**"block-view / empty / 402 / light"**, note "Note · empty" @ x 4338, y 7350:

> empty
>
> A new block opens here (N2). "Nothing in Wellness yet." with the add row focused and the keyboard up. A typed item takes 5 minutes and follows the last; return keeps the line open for the next.

**"block-view / wellness, new and empty / 402 / light"**, note "Frame" @ x 3856, y 4710:

> New · The new block, empty
>
> N2's empty state: "Nothing in Wellness yet." under the title, the add row focused, keyboard up. [ASSUMPTION] A new item is 10 min; Return adds it and opens the next row; the dashed square picks the icon. The free time below says what's left.

## Rulings

- N2: "Nothing in Wellness yet." with the add row focused; a typed item takes 5 minutes and follows the last.
- D-USE-81: a new item typed into a block's add row takes 5 minutes; the round 3 note's 10 minutes is superseded (the canvas is not edited). Work items keep [`../../../dev-notes/size-and-length.md`](../../../dev-notes/size-and-length.md).
- D-USE-69: unused time is a dashed "Free until <block end>".
- Decided (D-USE-84) **Which layout builds.** The two frames differ: round 3 adds the rail time, the icon square, the "Free until" region and the end line, puts the scope in the header meta and draws Done. Default: the round 3 frame, the newer drawing, with 5 min and step 3's "Return adds it at 7:05" caption giving way to round 3's. Done in the header: as [`checklist-editing.md`](checklist-editing.md).
- From the day, an empty block (all items removed) shows the same line with the add row, not focused [ASSUMPTION; not drawn].

## Widths

Drawn at: 402. Not drawn at: 1024 and wider; as `editing-monday.md`.

## Criteria

| ID                       | When                                | Then                                                                                      | Evidence                                                     |
| ------------------------ | ----------------------------------- | ----------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| C-USE-block-view-empty-1 | A new block is added in Set my days | Its Block view opens with "Nothing in Wellness yet." and the add row focused, keyboard up | `captures/empty-402.png`, `captures/empty-new-block-402.png` |
| C-USE-block-view-empty-2 | A name is typed and Return pressed  | It is added at the next start, 5 min, and the line stays open                             | test                                                         |
| C-USE-block-view-empty-3 | The dashed square is tapped         | The icon picker opens and the item takes the icon                                         | `captures/empty-new-block-402.png`                           |
| C-USE-block-view-empty-4 | The block has unused time           | A dashed "Free until <end>" sits under the rows, then the end line                        | `captures/empty-new-block-402.png`                           |
