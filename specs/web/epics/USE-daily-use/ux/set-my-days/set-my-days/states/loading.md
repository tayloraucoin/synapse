---
target: specs/web/ux/set-my-days/set-my-days/states/loading.md
status: approved
promoted:
boards:
  - name: "set-my-days / loading / 402 / light"
    page: "USE — set up"
    at: [5784, 1260]
    note: "Frame @ x 5784, y 2190"
    capture: specs/web/epics/USE-daily-use/ux/set-my-days/set-my-days/captures/loading-402.png
rulings: [D-USE-33]
---

# Set my days — loading

The usual Thursday while its blocks load. `?state=loading`. Its note is the "Frame" at x 5784, y 2190. Layout, words and access: [`../index.md`](../index.md).

## What shows, top to bottom

- **Header**, painted at once: "‹ Week", the title "Every Thursday"; no `SaveStatus`.
- **Weekday chips**, live: M T W **T** F S S with their dots.
- **Bounds row**, painted: "Up at 7:00", "Lights out 22:30", the ···.
- **Column:** the hour rail (7 to 13) and its hairlines; Orient's line and lock at 7:00, "Orient · 5 min"; then skeleton bands, roughly block-shaped, at the day's block positions (surface grey, a paler band where a Break sits), with no names or times.
- **The +**, bottom right, faded grey and disabled.

## What the person can do

- Switch days on the chips (N2's loading row).
- Back, "‹ Week".
- Not add: the + waits until the column has loaded.

## Words

None of its own.

## The notes on the boards

**"set-my-days / loading / 402 / light"**, "Frame @ x 5784, y 2190":

> Loading
>
> Skeleton bands in the column, roughly block-shaped. The header, chips, bounds and Orient paint at once; the + waits, disabled.

## Rulings

- N2: skeleton bands in the column; the strip and header are live.
- D-USE-33: loading approved as drawn in round 4.
- Bounds and ··· are painted; whether they take edits before the column lands is not said [ASSUMPTION: they are live, as the header and chips are].

## Widths

Drawn at: 402. At 1024 and wider (D-USE-83, [`the-day.md`](the-day.md)) the skeleton bands fill the day pane; the week list beside it paints at once [ASSUMPTION].

## Criteria

| ID                          | When             | Then                                                                                     | Evidence                   |
| --------------------------- | ---------------- | ---------------------------------------------------------------------------------------- | -------------------------- |
| C-USE-set-my-days-loading-1 | A day is loading | Header, chips, bounds and Orient show at once; block-shaped skeleton bands in the column | `captures/loading-402.png` |
| C-USE-set-my-days-loading-2 | Still loading    | The + is disabled; the chips switch days                                                 | test                       |
