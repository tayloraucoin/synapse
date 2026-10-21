---
target: specs/web/ux/day/block-view/states/suggested-new.md
status: approved
promoted:
boards:
  - name: "block-view / wellness, new, suggested / 402 / light"
    page: "USE — set up"
    at: [6748, 3780]
    note: "Note · new, suggested"
    capture: specs/web/epics/USE-daily-use/ux/day/block-view/captures/suggested-new-402.png
rulings: [D-USE-135, D-USE-136, D-USE-137]
---

# Block view — a new block, suggested

A new Wellness just added to the usual Thursday, opened from Set my days. `?state=suggested-new`. Its note is "Note · new, suggested" at x 6748, y 4710.

## What shows, top to bottom

- Status bar 21:10. `Breadcrumb` "‹ Thursday › Wellness".
- `BlockHeader`: the leaf bar, "Wellness", "7:05 to 8:05 · every Thursday"; "Done" and the round ···.
- The span total: "Nothing in Wellness yet" (ink, semibold) and "60 min free" (muted); the track is empty.
- A hairline, then the add row at 7:05: "+ Add to Wellness", not focused, with the keyboard down.
- **Used before:** "Pee and weigh" (⚖️) 2 min, "Water" (💧) 1 min and "Meditate" (🧘) 10 min, each with its +.
- **Suggested for Wellness:** "Breath work" (🌬️) 5 min, "Stretch" (🤸) 5 min, "Sunlight" (☀️) 5 min and "Journal" (✍️) 5 min.
- "+ Add one". The list scrolls past the fold; the end line and the next block's peek follow it.

## What the person can do

- Tap a +: the item is added ([`suggested-added.md`](suggested-added.md)).
- Tap the add row to type a new item, as [`empty.md`](empty.md). "Add one" opens the Item sheet's add, preset to Wellness [ASSUMPTION: the sheet Swap's "Add one" opens].
- "Done" or the breadcrumb goes back to the day.

## The notes on the boards

**"block-view / wellness, new, suggested / 402 / light"**, note "Note · new, suggested" @ x 6748, y 4710:

> Suggested items · a new block
>
> A new Wellness on Thursday. Under the add row, the Swap board's library pattern: icon tile in the kind's tint, name, length, a + on each row, "Add one" last. "Used before" first (items from any Wellness block, one per name, their last length), then "Suggested for Wellness" (the seed). The bar under the header is the running total against the span. [PROPOSED]

## Widths

Drawn at 402. At 1024 and wider it scales into the panel (`../index.md` › Platforms).
