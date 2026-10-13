---
target: specs/web/ux/day/orient/states/loading.md
status: approved
promoted:
boards:
  - name: "orient / loading / 402 / light"
    page: "USE — daily use"
    at: [2410, 2640]
    note: "Note · success"
    capture: specs/web/epics/USE-daily-use/ux/day/orient/captures/loading-402.png
rulings: [D-USE-49]
---

# Orient — loading

The reading and links are still on their way. Its note is the "Note · success" at x 2410, y 3570. Drawn as a proposal in round 2 and locked with the page (D-USE-49), so the drawn proposal is the spec.

## What shows, top to bottom

- Status bar and greeting as success: the title and date paint at once.
- **Skeleton · passage** in the reading's place (2 px above, 10 px gaps, `--color-fill-muted`, `--radius-control`): a caption bar 132 × 12, then three text bars 14 px tall, 8 px further down, full width, full width, and 240 px.
- **Skeleton · links:** two full-width bars 56 px tall, in the links' place.
- **Before the day:** the heading "Before the day" with no `SaveStatus` yet; the three labelled fields at one line each, live and empty.
- **"Read last night's reflections"** shows.
- "Review the day" shows and works.

## What happens

- Today the page waits on the server and paints whole. Here, the title and the lines paint at once; the reading (and the links) wait in their own shape. The words never wait on the network.
- When the reading arrives it replaces the skeleton in place, with no jump in the lines below [ASSUMPTION: the skeleton reserves the clamped reading's height].
- Typing before the reading arrives works and saves.

## What the person can do

Type the lines; open the reflections; tap "Review the day". The reading is not yet tappable.

## Words

None of its own. No "Loading" text; the skeleton is silent [ASSUMPTION: the region carries `aria-busy` and the name "Morning reading", announced once when filled].

## The notes on the boards

**"orient / loading / 402 / light"**, note "Note · success" @ x 2410, y 3570:

> loading [PROPOSED]
>
> Today the page waits on the server and paints whole. Proposed: the title and the lines paint at once, the reading waits in its own shape. The words never wait on the network.

## Rulings

- Open-1, "Orient's loading and error" [PROPOSED], awaited Taylor; the frames were drawn and locked (D-USE-49), so the drawn proposal is now the spec.
- Reduced motion: the skeleton does not shimmer [ASSUMPTION: canon].

## Widths

Drawn at: 402. Not drawn at: the desk; as success, with the skeleton in the capped column (D-USE-39).

## Criteria

| ID                     | When                          | Then                                                                                      | Evidence                   |
| ---------------------- | ----------------------------- | ----------------------------------------------------------------------------------------- | -------------------------- |
| C-USE-orient-loading-1 | The reading is slow           | The title, date, lines and button paint at once; the reading and links show as a skeleton | `captures/loading-402.png` |
| C-USE-orient-loading-2 | A line is typed while loading | It saves                                                                                  | test                       |
| C-USE-orient-loading-3 | The reading arrives           | It fills the skeleton's place with no layout jump below                                   | test                       |
