---
target: specs/web/ux/day/block-view/states/life-set.md
status: approved
promoted:
boards:
  - name: "block-view / life, set, editing / 402 / light"
    page: "USE — set up"
    at: [4338, 3780]
    note: "Frame @ x 4338, y 4710"
    capture: specs/web/epics/USE-daily-use/ux/day/block-view/captures/life-set-402.png
rulings:
  [
    D-USE-17,
    D-USE-24,
    D-USE-33,
    D-USE-34,
    D-USE-38,
    D-USE-79,
    D-USE-81,
    D-USE-83,
  ]
---

# Block view — a Life block, set, editing

A Life block in the usual Thursday, opened from Set my days at 21:10: "Dinner with friends" [placeholder plan], the same plan every Thursday. Life is the kind for plans, social or not, holding its own items like Wellness (open-5, framing round 2). `?state=life-set`. Its note is "Frame" at x 4338, y 4710. The kind and its rules: [`../../../dev-notes/life-and-todos.md`](../../../dev-notes/life-and-todos.md); the model: [`../../../dev-notes/blocks-and-todos-model.md`](../../../dev-notes/blocks-and-todos-model.md).

## What shows, top to bottom

- **Status bar:** 21:10.
- **Breadcrumb:** "‹ Thursday › Dinner with friends".
- **Header:** Life's yellow bar (#C9A227, the ninth hue, D-USE-38, D-USE-79), "Dinner with friends" (title) over "Life · 19:00 to 21:00 · every Thursday" (label, muted; wraps to two lines): the kind, the span, the scope. Trailing: "Done" beside the round ···. A hairline.
- **Rows** on the rail, 56 px on hairlines, each with the start, the icon (24 px slot), the name, the length (muted) and a grip:
  - 19:00 🚗 _"Drive to Marco's"_ 20 min (italic, muted: a transition in the flow, as Training's drives);
  - 19:20 🍝 "Dinner" 1 h 20 min;
  - 20:40 🚗 _"Drive home"_ 20 min (italic, muted).
- **The add row:** "+ Add to Dinner with friends" (muted).
- Under it (label, muted): "The same plan every Thursday, set once in the usual week. A week it isn't on: Not this week, on This week, frees the time." Then "[placeholder plan]" (caption, subtle).
- The block's end as a solid line at "21:00"; the next block peeking: the slate bar, "Evening · 21:30 to 22:30".
- A hidden layer in the frame, "Life fills it with" and a "Set" select, is turned off (round 2 took Life's From to-dos mode away, so there is no fill to choose); it is not shown and not built.

## What the person can do

- As Wellness in editing ([`editing-monday.md`](editing-monday.md)): drag a grip to reorder, times re-flowing (D-USE-17); swipe left to remove with Undo; type in the add row (5 min, D-USE-81); tap an item for the Item sheet ([`../../item-sheet/index.md`](../../item-sheet/index.md)).
- "Done" or "‹ Thursday": back to Set my days.
- **Not this week**, on This week only: frees the block for one week; the usual week is untouched (the note; the Life and chores dev note). Not drawn: Decided (D-USE-87) where it sits. Default: a row in the block's ··· when opened from This week [ASSUMPTION: and in Set my days' block menu on This week], with Undo in a `Toaster`.

Every change in the usual week reaches every Thursday (D-USE-33's reach, as [`editing-monday.md`](editing-monday.md)).

## Words

"Life · 19:00 to 21:00 · every Thursday"; "Add to Dinner with friends"; "The same plan every Thursday, set once in the usual week. A week it isn't on: Not this week, on This week, frees the time."; "Not this week".

## The notes on the boards

**"block-view / life, set, editing / 402 / light"**, note "Frame" @ x 4338, y 4710:

> Life block, set, editing
>
> [PROPOSED] Life, rose, shares the set-work view. "Not this week" on This week frees it for one week; the usual week is untouched.

## Rulings

- **Colour:** the note says "rose" (round 2, Vesper's pick); round 3 set Life yellow and D-USE-79 makes the yellow stand (#C9A227 and #F6EDC4 as a ninth category hue, its light dot a named 2.3:1 exception, D-USE-38). The frame already draws the yellow bar. Life is yellow; "rose" in the note is superseded.
- **The view:** "shares the set-work view" ([`set-work.md`](set-work.md), the Set work block: fixed items with rail times, no tiers). Life has no fill choice (open-5, framing round 2: Life "holds its own items like Wellness; it loses the From to-dos mode").
- D-USE-34: the New block sheet's seven kinds, Life among them ([`../../../set-my-days/new-block-sheet/index.md`](../../../set-my-days/new-block-sheet/index.md)).
- Done in the header: as [`checklist-editing.md`](checklist-editing.md) Decided (D-USE-84).
- From the Life and chores dev note, still [ASSUMPTION]: Make room takes from Life no sooner than from Work; Review groups Life on its own line; Life counts as planned time, never as work.

## Widths

Drawn at: 402. Not drawn at: 1024 and wider; at 1024 Set my days is list-detail (D-USE-83) [ASSUMPTION: Block view opens in the day pane]; otherwise scales up.

## Criteria

| ID                          | When                                  | Then                                                                                                       | Evidence                    |
| --------------------------- | ------------------------------------- | ---------------------------------------------------------------------------------------------------------- | --------------------------- |
| C-USE-block-view-life-set-1 | A Life block is opened in Set my days | Life's yellow bar, "Life · <span> · every <weekday>", rail rows with icons, lengths and grips, the add row | `captures/life-set-402.png` |
| C-USE-block-view-life-set-2 | Not this week is used on This week    | The block is gone from that week's day only; the usual week and other weeks keep it                        | test                        |
| C-USE-block-view-life-set-3 | The block's colour                    | Yellow #C9A227 (token once it exists), never rose; the bar sits beside the kind's name                     | `captures/life-set-402.png` |
