---
target: specs/web/ux/day/schedule/states/checklist-day.md
status: approved
promoted:
boards:
  - name: "schedule / checklist day, all day strip / 402 / light"
    page: "USE — daily use"
    at: [964, 20280]
    note: "Frame @ x 964, y 21210"
    capture: specs/web/epics/USE-daily-use/ux/day/schedule/captures/checklist-day-402.png
rulings: [D-USE-23, D-USE-28, D-USE-69, D-USE-72, D-USE-77]
---

# Schedule — checklist day, the All day strip

Sunday at 11:20, a checklist day (a checklist with no span) with one set-time block. The surface is [`../index.md`](../index.md). `?state=checklist-day`. Now at the same moment is `../../now/states/sunday-checklist.md`; Review the day's is `../../review-the-day/states/sunday-checklist-and-plans.md`.

## What shows, top to bottom

**Phone (402):**

- Status bar 11:20.
- **Title:** "Sunday, 18 October", with a hairline under it. No tray is drawn; the tray stays [ASSUMPTION: as Review the day's Sunday frames, Decided (D-USE-69)].
- **The All day strip**, pinned above the rail, a hairline under it: "All day" (caption, medium, muted) in a 36 px gutter; a card (`--radius` 8 px, a 1 px `--color-now` verdigris edge [PROPOSED]): "Sunday" (body, semibold) and a "Checklist" tag (an outlined pill, caption, muted) at the trailing edge; then 11 px boxes in two 130 px columns: "Groceries", "Laundry", "Water the plants" (open boxes, `--color-input`), "Meal prep" checked (box filled `--color-neutral-500`, words in `--color-subtle-foreground`), faded in place.
- **The rail**, hours "10" to "15" in the 36 px gutter; the "11" label gives way to the now tag. The frame draws 80 px an hour; the axis keeps 96 [ASSUMPTION: as Review the day's Sunday frames, Decided (D-USE-69); D-USE-23].
- **Lunch with Sam** 13:00 to 14:30: a rose block (`--color-category-rose-chip`, 4 px `--color-category-rose-dot` rule, radius 8) with a lock glyph and "Lunch with Sam" (body, semibold), "13:00 to 14:30 · Personal [placeholder]": a set time.
- **The `NowLine`** at 11:20 with its tag.
- **`BottomNav`:** Now, Schedule (selected), Review.

**Desk (not drawn):** the strip sits above the scaled-up column (D-USE-39) [ASSUMPTION].

## What the person can do

- Tap the strip: the checklist in Block view (D-USE-72; `../../block-view/index.md`).
- Tap Lunch with Sam: its Block view.
- The tray, the tabs.

## Words

"All day" · "Sunday" · "Checklist" · "Groceries", "Laundry", "Water the plants", "Meal prep" · "Lunch with Sam" · "13:00 to 14:30 · Personal [placeholder]" · "11:20".

## The notes on the boards

**Frame @ x 964, y 21210** — schedule / checklist day, all day strip / 402 / light

> schedule, checklist day (D-USE-28)
>
> A checklist with no span sits in the All day strip above the rail, checked items faded in place. [PROPOSED] The strip takes the verdigris edge, since it's what is live all day. Tapping it opens the checklist in Block view.

## Rulings

- D-USE-77: step 8's [PROPOSED] and [ASSUMPTION] marks in this file stand as drawn (Decided (D-USE-77)).
- D-USE-28: a checklist with no span sits in an "All day" strip above the rail, with a Checklist tag.
- D-USE-72: the All day strip opens the checklist in block view; at a set-time block's time it lifts above the checklist on Now.
- The note's [PROPOSED] (the strip's verdigris edge) is a step-8 mark, not yet ruled; kept. While Lunch with Sam is under way, the edge moves to it [ASSUMPTION: one "this moment" mark, D-P02].
- D-USE-69: the Sunday frames keep the tray and the 96 px hour (ruled for Review the day; carried here).

## Widths

Drawn at 402. Desk: [`../index.md`](../index.md) › Platforms.

## Criteria

| ID                             | When                        | Then                                                            | Evidence                         |
| ------------------------------ | --------------------------- | --------------------------------------------------------------- | -------------------------------- |
| C-USE-schedule-checklist-day-1 | A checklist with no span    | It sits in the All day strip above the rail, tagged "Checklist" | `captures/checklist-day-402.png` |
| C-USE-schedule-checklist-day-2 | A checklist item is checked | It stays in place, faded                                        | capture                          |
| C-USE-schedule-checklist-day-3 | Tap the strip               | The checklist opens in Block view                               | manual                           |
