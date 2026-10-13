---
target: specs/web/ux/day/orient/states/error.md
status: approved
promoted:
boards:
  - name: "orient / error / 402 / light"
    page: "USE — daily use"
    at: [2892, 2640]
    note: "Note · success"
    capture: specs/web/epics/USE-daily-use/ux/day/orient/captures/error-402.png
rulings: [D-USE-49, D-USE-63]
---

# Orient — error

The reading failed to load. Its note is the "Note · success" at x 2892, y 3570. Drawn as a proposal in round 2 and locked with the page (D-USE-49), so the drawn proposal is the spec.

## What shows, top to bottom

- Status bar and greeting as success.
- **`RegionRetry · reading`** in the reading's place: between two `--color-border` hairlines, 16 px above and below, 12 px gap, one row: "This morning's reading didn't load." (body, `--color-muted-foreground`) on the left, and a secondary button "Try again" (`--h-target`, 14 px side padding, `--color-border` outline, `--radius-control`, body at label weight, `--color-foreground`) on the right. `RegionRetry` is a Plumb proposal [ASSUMPTION: no house primitive draws a region-level retry].
- **No links:** they come with the reading and fail with it [ASSUMPTION: the loading frame skeletons them together].
- **Before the day:** as success, "Saved" beside the heading; "Grateful for" grown with its sample line.
- "Read last night's reflections" shows.
- "Review the day" shows and works.

## What happens

- Only the reading fails. The lines and Review the day still work.
- "Try again" reloads the reading in place: the region shows the loading skeleton, then the reading, or this row again.
- Not red: the row is muted ink, no error colour, no icon (an error page at 7am breaks the calm).

## What the person can do

Try again; type the lines; open the reflections; tap "Review the day".

## Words

"This morning's reading didn't load." and "Try again" (Gloss). No blame, no second person.

## The notes on the boards

**"orient / error / 402 / light"**, note "Note · success" @ x 2892, y 3570:

> error [PROPOSED]
>
> Today a failed load is the full-page error. Proposed: only the reading fails, with Try again in place; the lines and Review the day still work. An error page at 7am breaks the calm.

## Rulings

- Open-1, "Orient's loading and error" [PROPOSED], awaited Taylor; the frames were drawn and locked (D-USE-49), so the drawn proposal is now the spec. It replaces the built full-page error.
- When the day's own record (the lines) also fails to load, the lines show empty and still save; the full-page error stays only for a failed sign-in session (D-USE-63).

## Widths

Drawn at: 402. Not drawn at: the desk; as success, the row in the capped column (D-USE-39).

## Criteria

| ID                   | When                      | Then                                                                                                 | Evidence                 |
| -------------------- | ------------------------- | ---------------------------------------------------------------------------------------------------- | ------------------------ |
| C-USE-orient-error-1 | The reading fails to load | Only its region shows "This morning's reading didn't load." with Try again; the rest of Orient works | `captures/error-402.png` |
| C-USE-orient-error-2 | Try again is tapped       | The region reloads in place                                                                          | test                     |
| C-USE-orient-error-3 | The error shows           | Nothing on the page is red                                                                           | `captures/error-402.png` |
