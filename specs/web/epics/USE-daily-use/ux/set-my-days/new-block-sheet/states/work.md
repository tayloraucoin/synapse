---
target: specs/web/ux/set-my-days/new-block-sheet/states/work.md
status: approved
promoted:
boards:
  - name: "new-block / work, how work fills it / 402 / light"
    page: "USE — set up"
    at: [964, 5040]
    note: "Note · name only, 96"
    capture: specs/web/epics/USE-daily-use/ux/set-my-days/new-block-sheet/captures/work-402.png
rulings: [D-USE-34, D-USE-80]
---

# New block sheet — Work, how work fills it

Work picked from This week's Monday 12, after Lunch. `?sheet=new-block&state=work` [ASSUMPTION: the state param]. The two ways are explained in the dev note `../../../dev-notes/how-work-fills-a-block.md`.

## What shows, top to bottom

- Grabber; ×; "Mon 12 · this date only" over "New block".
- **Kind:** Wellness, Training, Work (picked, sky soft fill and edge), Break, then Evening: five kinds, as step 9 round 3 drew it.
- **Name:** the empty icon tile beside "Work".
- Hairline; **Starts** "13:00"; **Length** "− 2 h +".
- **Colour:** the sky swatch, "Sky, Work's colour".
- **How work fills it** (label, semibold), two radio cards, the picked one with an ink edge:
  - "Tasks for the day" (picked): "Work is slotted each week, by tier. The block is time to get through it."
  - "Set work": "The same work every time, like writing on Tuesday mornings."
- "Goes in after Lunch, 13:00 to 15:00, and opens on its tiers to add work."
- "Add block", ink. No Checklist row on a Work block.

## What the person can do

- Pick Tasks for the day (the default, today's way) or Set work.
- **Add block:** Tasks for the day opens the block on its tiers (`../../../day/block-view/states/work-tiers.md`); Set work opens it to set its fixed items (`../../../day/block-view/states/set-work.md`).

## Words

"Mon 12 · this date only" · "How work fills it" · "Tasks for the day" · "Work is slotted each week, by tier. The block is time to get through it." · "Set work" · "The same work every time, like writing on Tuesday mornings." · "Goes in after Lunch, 13:00 to 15:00, and opens on its tiers to add work." Set work's "writing on Tuesday mornings" is [placeholder].

## The notes on the boards

**"new-block / work, how work fills it / 402 / light"**, "Note · name only, 96" @ x 964, y 5970:

> New block, Work picked
>
> Kind first (Wellness, Training, Work, Break, Evening), then name, icon, start, length, colour from the kind. [PROPOSED] Work adds "How work fills it": Tasks for the day (default, today's way) or Set work (the same work every time). See the dev note. A line above Add says where it goes.

## Rulings

- The [PROPOSED] "How work fills it" stands as drawn [ASSUMPTION: approved with step 9's later rounds and the Set work block view, D-USE-32 to 34; no D-line names it].
- D-USE-34: this frame predates the seven kinds and Ends; as built the sheet shows the seven kinds and "Ends 15:00" with "2 h" beside it, and Repeats reads "Does not repeat" from This week (D-USE-80's default).

## Widths

Drawn at: 402. At 1024 and wider: the right panel at `--sheet-w` (D-USE-39, D-USE-83).

## Criteria

| ID                           | When                             | Then                                                                  | Evidence                |
| ---------------------------- | -------------------------------- | --------------------------------------------------------------------- | ----------------------- |
| C-USE-new-block-sheet-work-1 | Work is picked                   | "How work fills it" shows with Tasks for the day picked; no Checklist | `captures/work-402.png` |
| C-USE-new-block-sheet-work-2 | Add block with Tasks for the day | The Block view opens on its tiers                                     | test                    |
