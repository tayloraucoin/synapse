---
target: specs/web/ux/day/review-the-day/states/sunday-making-the-checklist.md
status: approved
promoted:
boards:
  - name: "review-day / sunday, making the checklist / 402 / light"
    page: "USE — daily use"
    at: [964, 5160]
    note: "Frame @ x 964, y 6090"
    capture: specs/web/epics/USE-daily-use/ux/day/review-the-day/captures/sunday-making-the-checklist-402.png
rulings: [D-USE-28]
---

# Review the day — Sunday, making the checklist

After "Make a checklist": typing the list. Its note is the "Frame" at x 964, y 6090.

## What shows, top to bottom

- Status bar 8:40. `Breadcrumb` "‹ Orient" over "Sunday, 18 October"; a hairline.
- **The checklist's head:** a list glyph and "Sunday" (title size, semibold: the checklist takes the day's name); under it "Checklist · all day" (caption, muted) and "Set a time" (caption, medium, `--color-link`).
- **Rows** on hairlines, `--h-target` each: a `Checkbox` and the name: "Groceries", "Laundry", "Water the plants" [placeholder items].
- **The row being typed:** a dashed checkbox, "Meal prep" with the caret, an ink underline under the row.
- Helper (caption, muted): "Return adds the next one. Drag to reorder later. [placeholder items]".
- Ready, go at the foot, on the fade.

## What the person can do

- Type, Return: the row is kept and the next one opens.
- **Set a time** gives the checklist a span (as the Now checklist board, 10:00 to 13:00); it then moves onto the rail ([`sunday-checklist-and-plans.md`](sunday-checklist-and-plans.md)).
- Drag to reorder, later (a grip [ASSUMPTION], D-USE-17).
- **Ready, go** starts the checklist: on a checklist day Now is the checklist (open-2, feedback round [PROPOSED]).

## Words

"<Weekday>" · "Checklist · all day" · "Set a time" · "Return adds the next one. Drag to reorder later."

## The notes on the boards

**"review-day / sunday, making the checklist / 402 / light"**, "Frame" @ x 964, y 6090:

> making the checklist
>
> Type a thing, press Return, and the next row opens. The checklist is all day unless "Set a time" gives it a span (as the Now checklist board, 10:00 to 13:00). Ready, go starts it.

## Rulings

- D-USE-28: an empty day offers Make a checklist; a checklist with no span sits in an "All day" strip above the rail with a Checklist tag.

## Widths

Drawn at: 402. At the desk: the same, in the capped column (D-USE-39).

## Criteria

| ID                                                 | When                         | Then                                            | Evidence                                       |
| -------------------------------------------------- | ---------------------------- | ----------------------------------------------- | ---------------------------------------------- |
| C-USE-review-the-day-sunday-making-the-checklist-1 | Return in the typed row      | The row is kept and the next row opens, focused | `captures/sunday-making-the-checklist-402.png` |
| C-USE-review-the-day-sunday-making-the-checklist-2 | Ready, go on a checklist day | Now opens on the checklist                      | test                                           |
