---
target: specs/web/ux/day/now/states/header-menu.md
status: approved
promoted:
boards:
  - name: "now / header menu / 402 / light"
    page: "USE — daily use"
    at: [2410, 10200]
    note: "Frame @ x 2410, y 11130"
    capture: specs/web/epics/USE-daily-use/ux/day/now/captures/header-menu-402.png
rulings: [D-USE-24, D-USE-26, D-USE-28]
---

# Now — header menu

··· tapped. `?state=header-menu`. Its note is the "Frame" at x 2410, y 11130.

## What shows, top to bottom

As [`success.md`](success.md), with:

- **···** pressed: the round button fills ink with white dots.
- **A pull-down** under it, its trailing edge on the column's, about 240 wide: background token, hairline border, 10 px radius, one soft shadow (D-USE-28). Title "Wellness, today" (caption, medium, muted). Rows with a muted leading icon: "Complete Wellness" (a circled tick), "Edit block" (pencil); a separator; "See the whole day" (calendar).
- It covers the trailing part of the done rows and the card's top; no scrim.

## What the person can do

- **Complete Wellness:** the close card (step 7; `../../block-complete/index.md`).
- **Edit block:** the Block view, editing (`../../block-view/index.md`).
- **See the whole day:** Schedule ([`../../schedule/index.md`](../../schedule/index.md)).
- Tap outside: closes.

## Words

"<Block>, today" · "Complete <Block>" · "Edit block" · "See the whole day".

## The notes on the boards

**"now / header menu / 402 / light"**, "Frame" @ x 2410, y 11130:

> header menu
>
> ··· opens a pull-down titled with its scope, "Wellness, today" (D-USE-24): Complete Wellness (the close card, step 7), Edit block (Block view, editing), See the whole day (Schedule).

## Rulings

- D-USE-24: a pull-down titled with its scope. D-USE-26: ··· alone on Now's header. D-USE-28: the menu style.
- N4's `EllipsesMenu` holds the same three; the order is the canvas's.
- N4 story: mid-Wellness, the rest of the day without leaving go mode, through "See the whole day".

## Widths

Drawn at: 402. Wider: the index's Platforms.

## Criteria

| ID                      | When              | Then                                                                      | Evidence                       |
| ----------------------- | ----------------- | ------------------------------------------------------------------------- | ------------------------------ |
| C-USE-now-header-menu-1 | ···               | A pull-down "<Block>, today" with Complete, Edit block, See the whole day | `captures/header-menu-402.png` |
| C-USE-now-header-menu-2 | See the whole day | Schedule opens; go mode stays                                             | test                           |
