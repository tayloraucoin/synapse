---
target: specs/web/ux/day/block-view/states/checked-swipe.md
status: approved
promoted:
boards:
  - name: "block-view / checked, swipe / 402 / light"
    page: "USE — daily use"
    at: [482, 6420]
    note: "Note · checked, swipe"
    capture: specs/web/epics/USE-daily-use/ux/day/block-view/captures/checked-swipe-402.png
rulings: [D-USE-13, D-USE-17]
---

# Block view — checked, swipe

Two items checked, a third swiped left. `?state=checked-swipe`. Its note is "Note · checked, swipe" at x 482, y 7350.

## What shows, top to bottom

As [`success.md`](success.md), except:

- "Pee and weigh" (7:05) and "Water" (7:07) checked: the box filled muted grey with a white check; the name and length faded to muted. They keep their place.
- "Start the cold bath" (7:08) slid left: its row shows "e cold bath" and "2 min", and a "Remove" action fills the trailing edge, `--color-primary` (ink) fill, `--color-primary-foreground` text, semibold, the row's full height. Never red.
- Everything below (Meditate 7:10, Cold bath 7:20, the add row at 7:30, "Free until 8:00", 8:00, the Training peek) unchanged.

## What the person can do

- Tap a checked box: unchecks it [ASSUMPTION: done stays live both ways].
- Tap "Remove": the row goes ([`removed-undo.md`](removed-undo.md)). Swipe back or tap elsewhere: the row closes [ASSUMPTION].
- Check any item ahead of its time.

## Words

"Remove".

## The notes on the boards

**"block-view / checked, swipe / 402 / light"**, note "Note · checked, swipe" @ x 482, y 7350:

> checked, swipe
>
> Checked rows stay in place, faded, with the check; they never hide. Swipe left on a row: "Remove", in ink, never red. Checking ahead of time is allowed here.

## Rulings

- N3: a checked item stays visible and quiet, never hidden (the rule that done stays live).
- N3 "Remove: swipe … an item in the block view, with Undo".
- D-USE-13: a checkbox records the planned length.
- D-USE-17: long-press stays the row's menu (Swap, Edit, Not today); swipe is not the long-press.

## Widths

Drawn at: 402. Not drawn at: the desk; scales up (D-USE-39) [ASSUMPTION: at the desk Remove sits in the row's menu, since a pointer can't swipe].

## Criteria

| ID                               | When                                     | Then                                     | Evidence                         |
| -------------------------------- | ---------------------------------------- | ---------------------------------------- | -------------------------------- |
| C-USE-block-view-checked-swipe-1 | A row is checked                         | It stays in place, faded, with the check | `captures/checked-swipe-402.png` |
| C-USE-block-view-checked-swipe-2 | A row is swiped left                     | "Remove" shows in ink, never red         | `captures/checked-swipe-402.png` |
| C-USE-block-view-checked-swipe-3 | A later item is checked before its start | It checks; nothing warns                 | test                             |
