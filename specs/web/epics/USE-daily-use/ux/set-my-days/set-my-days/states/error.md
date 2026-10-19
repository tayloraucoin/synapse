---
target: specs/web/ux/set-my-days/set-my-days/states/error.md
status: approved
promoted:
boards:
  - name: "set-my-days / error / 402 / light"
    page: "USE — set up"
    at: [6266, 1260]
    note: "Frame @ x 6266, y 2190"
    capture: specs/web/epics/USE-daily-use/ux/set-my-days/set-my-days/captures/error-402.png
rulings: [D-USE-33]
---

# Set my days — error

The usual Thursday's column failed to load. `?state=error`. Its note is the "Frame" at x 6266, y 2190. Layout, words and access: [`../index.md`](../index.md).

## What shows, top to bottom

- **Header:** "‹ Week", the title "Every Thursday"; no `SaveStatus`.
- **Weekday chips**, live: M T W **T** F S S with their dots.
- **Bounds row:** "Up at 7:00", "Lights out 22:30", the ···, drawn as usual.
- **Column:** the hour rail and hairlines; Orient's line at 7:00, "Orient · 5 min"; under it a `RegionRetry` card (hairline, surface): "The day didn't load." (heading), "Nothing was lost. The other days still open from the chips." (muted), and "Try again" (outlined button, ink). The rest of the column is empty rail.
- **The +**, faded grey and disabled. No red anywhere.

## What the person can do

- "Try again": reloads the column; while it loads, [`loading.md`](loading.md).
- Switch days on the chips: only the column failed.
- Back, "‹ Week".
- Not add: the + stays disabled.
- Bounds and ··· [ASSUMPTION: drawn live and stay live; a bounds edit saves as usual].

## Words

- "The day didn't load." (N2)
- "Nothing was lost. The other days still open from the chips." (the canvas adds it to N2's row)
- "Try again"

## The notes on the boards

**"set-my-days / error / 402 / light"**, "Frame @ x 6266, y 2190":

> Error
>
> RegionRetry under Orient: "The day didn't load." with Try again. Only the column fails; the chips still move to other days. No red. The + stays disabled.

## Rulings

- N2: a `RegionRetry` in the column, "The day didn't load." with "Try again".
- D-USE-33: error approved as drawn in round 4.
- A save that fails is not this state: it is `SaveStatus` "Not saved · Try again" ([`saved.md`](saved.md)).

## Widths

Drawn at: 402. At 1024 and wider (D-USE-83, [`the-day.md`](the-day.md)) the `RegionRetry` sits in the day pane under Orient; the week list stays live [ASSUMPTION].

## Criteria

| ID                        | When                   | Then                                                                                | Evidence                 |
| ------------------------- | ---------------------- | ----------------------------------------------------------------------------------- | ------------------------ |
| C-USE-set-my-days-error-1 | The day's column fails | `RegionRetry` under Orient with its two lines and Try again; no red; the + disabled | `captures/error-402.png` |
| C-USE-set-my-days-error-2 | A chip is tapped       | That day opens                                                                      | test                     |
| C-USE-set-my-days-error-3 | Try again              | The column loads again                                                              | test                     |
