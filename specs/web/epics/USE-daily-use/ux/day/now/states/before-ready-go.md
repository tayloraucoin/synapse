---
target: specs/web/ux/day/now/states/before-ready-go.md
status: approved
promoted:
boards:
  - name: "now / before Ready, go / 402 / light"
    page: "USE — daily use"
    at: [0, 10200]
    note: "Frame @ x 0, y 11130"
    capture: specs/web/epics/USE-daily-use/ux/day/now/captures/before-ready-go-402.png
rulings: [D-USE-5, D-USE-25, D-USE-65]
---

# Now — before Ready, go

The tab before the day is live. `?state=before-ready-go`. Its note is the "Frame" at x 0, y 11130.

## What shows, top to bottom

Status bar 7:02. Monday 12 October.

- **`AppHeader`:** the date title "Monday, 12 October" (not "Now") with the avatar "T".
- **To-dos tray**, closed: "To-dos", "Call the mechanic…" (`../../todos/`).
- **The List as it is in the app today** [placeholder]: one row a block between hairlines, each with its kind's 3 px bar, the name (semibold) and the span right-aligned: Wellness 7:05 to 8:00, Training 8:00 to 8:57, Breakfast 9:00 to 9:30 (no bar, regular weight, muted: a meal), Work 9:30 to 12:00. Under them the caption "[placeholder: the List as it is in the app today]".
- **"Review the day"**, the primary `Button`, full width, ink, on the footer fade (D-USE-25).
- **`BottomNav`:** List (current), Schedule, Review.

## What the person can do

- **Review the day:** opens Review the day (`../../review-the-day/index.md`).
- Open the tray; the tabs.
- A block row [ASSUMPTION: as the List does today].

## Words

"Review the day" · "List" (the tab). The date as the title.

## The notes on the boards

**"now / before Ready, go / 402 / light"**, "Frame" @ x 0, y 11130:

> before Ready, go
>
> Before Ready, go the tab reads List and shows the day the way the List does now [placeholder], with Review the day on the footer fade.

## Rulings

- D-USE-5: List reads Now only while the day is live; the entry tree sends a later open before go to Review the day, so this frame is what the tab shows when reached by the tab.
- D-USE-25: the footer button floats on the fade.
- D-USE-65: at the desk, `/today` before Ready, go is Review the day at 1440 (`../../../work/today/states/before-ready-go.md`).

## Widths

Drawn at: 402. At 1024 and above: Review the day at 1440 (D-USE-65).

## Criteria

| ID                          | When                     | Then                                                                      | Evidence                           |
| --------------------------- | ------------------------ | ------------------------------------------------------------------------- | ---------------------------------- |
| C-USE-now-before-ready-go-1 | The tab before Ready, go | It reads List, the day as the List shows it, Review the day on the footer | `captures/before-ready-go-402.png` |
| C-USE-now-before-ready-go-2 | Review the day           | Review the day opens                                                      | test                               |
