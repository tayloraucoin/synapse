---
target: specs/web/ux/day/now/states/empty-no-blocks.md
status: approved
promoted:
boards:
  - name: "now / empty, no blocks left / 402 / light"
    page: "USE — daily use"
    at: [2410, 11460]
    note: "Frame @ x 2410, y 12390"
    capture: specs/web/epics/USE-daily-use/ux/day/now/captures/empty-no-blocks-402.png
rulings: [D-USE-26, D-USE-30, D-USE-69, D-USE-72, D-USE-73]
---

# Now — empty, no blocks left

After the day's last block, at 18:40. The surface is [`../index.md`](../index.md). `?state=empty-no-blocks`.

## What shows, top to bottom

- Now's header: "Now", the avatar "T".
- **The To-dos tray, open** (chevron up), as [`../../todos/states/open.md`](../../todos/states/open.md): "Call the mechanic" with its phone icon and the bell with "10:00" (muted), "Library books [placeholder]" with its bag icon and "From Sunday" (muted), "+ Add a to-do". Both boxes unchecked.
- No block header and no rows. Centred in the space below the tray: **"The day's blocks are done."** (medium weight) and an outlined secondary button, **"See the whole day"**.
- The tab bar: Now (selected), Schedule, Review.

## What the person can do

- **See the whole day** opens Schedule.
- The tray: check a to-do, tap a row for the To-do sheet ([`../../todo-sheet/`](../../todo-sheet/)), Add a to-do. An unchecked to-do just stays; a checked one stays checked, faded and live, until the day ends (D-USE-69).
- The evening close is its own surface ([`../../close-the-day/`](../../close-the-day/index.md), D-USE-73) [ASSUMPTION: reached as that surface says, not from this screen].

## Words

"The day's blocks are done." · "See the whole day". Nothing counts what was done or left (product rules: no numbers about the day).

## The notes on the boards

**"now / empty, no blocks left / 402 / light"**, "Frame" @ x 2410, y 12390:

> no blocks left (empty)
>
> After the last block: "The day's blocks are done.", the tray open, and See the whole day. An unchecked to-do just stays.

## Rulings

- N4 and the intent pass (the flat `day/now.md`, deleted once folded, States: empty, no blocks left): "The day's blocks are done.", the tray open, "See the whole day".
- D-USE-72: Block complete's last block reads "Nothing after this today." with See the whole day, and this empty state follows (open-1, Block complete step 7 round 1).
- D-USE-26 rules the tray closed by default; here it is open, as drawn, since the day holds nothing else to do.
- The line is centred; D-USE-30's "under the title, not centred" rules an empty day's choice only [ASSUMPTION: this frame stands as drawn].

## Widths

Drawn at: 402. At the desk: the column scales up, capped and centred (D-USE-39 (1)).

## Criteria

| ID                          | When                                | Then                                                                      | Evidence                           |
| --------------------------- | ----------------------------------- | ------------------------------------------------------------------------- | ---------------------------------- |
| C-USE-now-empty-no-blocks-1 | The last block of the day is closed | The tray open, "The day's blocks are done.", See the whole day; no counts | `captures/empty-no-blocks-402.png` |
| C-USE-now-empty-no-blocks-2 | A to-do is left unchecked           | It stays in the tray                                                      | test                               |
| C-USE-now-empty-no-blocks-3 | See the whole day                   | Schedule opens                                                            | test                               |
