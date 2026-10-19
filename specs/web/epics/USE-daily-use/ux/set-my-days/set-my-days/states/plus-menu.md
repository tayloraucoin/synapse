---
target: specs/web/ux/set-my-days/set-my-days/states/plus-menu.md
status: approved
promoted:
boards:
  - name: "set-my-days / empty day, + menu / 402 / light"
    page: "USE — set up"
    at: [4338, 0]
    note: "Frame @ x 4338, y 930"
    capture: specs/web/epics/USE-daily-use/ux/set-my-days/set-my-days/captures/plus-menu-empty-day-402.png
  - name: "set-my-days / + menu / 402 / light"
    page: "USE — set up"
    at: [4820, 0]
    note: "Note · grid, 96 @ x 4820, y 930"
    capture: specs/web/epics/USE-daily-use/ux/set-my-days/set-my-days/captures/plus-menu-402.png
rulings: [D-USE-28, D-USE-33, D-USE-34, D-USE-87]
---

# Set my days — the + menu

The round + opened: what it adds to the time column. Two frames: the empty usual Thursday (no Event) and This week's Monday (with Event). `?state=plus-menu` (`&week=usual` for the first). The layout is [`../index.md`](../index.md)'s. The notes are "Frame" at x 4338, y 930 and "Note · grid, 96" at x 4820, y 930.

## What shows, top to bottom

- The day as it was under it: [`empty-day.md`](empty-day.md) ("Every Thursday") or Monday, 12 October with Wellness, Training, Breakfast, Work and Lunch (bullets as dots). No scrim.
- **The menu**, a shadcn dropdown (D-USE-28: background token, hairline border, 10 px radius, leading muted icons, one soft shadow), anchored above the +, right-aligned:
  - Muted title: "Add to Thursday" or "Add to Monday".
  - **Block**, square icon, "Wellness, Training, Work, Break, Evening" under it.
  - **Transition**, a slim bar icon, "A drive, a meal, a move between blocks".
  - **Event**, calendar icon, "At a set time, this date only". This week only: the Thursday frame leaves it out.
  - A 1 px separator, then **From a saved block**, list icon, "One from another day, with its items".
- The + turns to × while the menu is open.

## What the person can do

- **Block:** the New block sheet at the first free time (here 7:05 on the empty Thursday) ([`../../new-block-sheet/index.md`](../../new-block-sheet/index.md)).
- **Transition:** the New block sheet for a transition ([`../../new-block-sheet/states/transition.md`](../../new-block-sheet/states/transition.md)) [ASSUMPTION: at the first free time, as Block].
- **Event:** the Add event sheet ([`add-event.md`](add-event.md)).
- **From a saved block:** not drawn. Decided (D-USE-87) What it opens. Default: a picker in Copy from's form ([`../../../interactions/copy-from/states/copy-picker.md`](../../../interactions/copy-from/states/copy-picker.md)) listing other days' blocks; the picked block lands with its items at the first free time, with a Toaster and Undo.
- ×, a tap outside, or Escape closes the menu.
- Tapping an empty time still opens New block at that time ([`tap-a-time.md`](tap-a-time.md)).

## Words

"Add to <weekday>" · "Block" · "Wellness, Training, Work, Break, Evening" · "Transition" · "A drive, a meal, a move between blocks" · "Event" · "At a set time, this date only" · "From a saved block" · "One from another day, with its items".

## The notes on the boards

**"set-my-days / empty day, + menu / 402 / light"**, note "Frame" @ x 4338, y 930:

> New · The + on the empty day
>
> The same + menu as Monday's. [PROPOSED] In Usual week Event is left out: an event is one date only and Usual week shows none. Block opens New block at the first free time, here 7:05.

**"set-my-days / + menu / 402 / light"**, note "Note · grid, 96" @ x 4820, y 930:

> The + and the ···, split
>
> [PROPOSED] + adds to the time column: Block, Transition, Event, and From a saved block (a block from another day with its items). ··· acts on the whole day: Copy from…, Reset to usual, Clear this day. Add event moves from ··· to +. Tapping an empty time still opens New block at that time.

## Rulings

- Round 3 (open-4, "Set my days, step 9 round 3"): the + and ··· split, Add event moves to +, Event left out in Usual week; [PROPOSED] as drawn. The ···'s side is [`day-menu.md`](day-menu.md).
- D-USE-34: the New block sheet has seven kinds, Life and To-dos among them. Decided (D-USE-87) Block's line names five ("Wellness, Training, Work, Break, Evening"). Default: the drawn words, a sample and not a list of the kinds.
- D-USE-28: the dropdown's form.

## Widths

Drawn at: 402. Not drawn at: 1024 and wider (list-detail, D-USE-83) [ASSUMPTION: the same dropdown from the day pane's +].

## Criteria

| ID                            | When                      | Then                                                                                    | Evidence                               |
| ----------------------------- | ------------------------- | --------------------------------------------------------------------------------------- | -------------------------------------- |
| C-USE-set-my-days-plus-menu-1 | + is tapped in This week  | "Add to <weekday>": Block, Transition, Event, a separator, From a saved block           | `captures/plus-menu-402.png`           |
| C-USE-set-my-days-plus-menu-2 | + is tapped in Usual week | The same menu without Event                                                             | `captures/plus-menu-empty-day-402.png` |
| C-USE-set-my-days-plus-menu-3 | Block is picked           | The New block sheet opens at the first free time                                        | test                                   |
| C-USE-set-my-days-plus-menu-4 | The menu is open          | The + reads ×; ×, a tap outside or Escape closes it (focus as `../words-and-access.md`) | test                                   |
