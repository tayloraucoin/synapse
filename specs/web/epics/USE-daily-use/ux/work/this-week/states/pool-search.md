---
target: specs/web/ux/work/this-week/states/pool-search.md
status: approved
promoted:
boards:
  - name: "this-week / pool search / 402 / light"
    page: "USE — work"
    at: [6748, 7200]
    note: "Notes · phone, editing and This week (row 6, cont.) @ x 6748"
    capture: specs/web/epics/USE-daily-use/ux/work/this-week/captures/pool-search-402.png
rulings: [D-USE-54, D-USE-57]
---

# This week on the phone — pool search

The search glyph tapped in the pool sheet, "booking" typed. `?state=pool-search` [ASSUMPTION: key].

## What shows, top to bottom

- **The pool sheet at full height** (818 px, its top at `--size-row`; [`../pool-sheet-anatomy.md`](../pool-sheet-anatomy.md)): the grabber; no title, × or tabs.
- **The search row:** a field (`--size-target` high, a `--color-input` hairline, `--radius-control`, 12 px sides) with a 16 px search glyph and "booking" (body); **Cancel** (body, semibold) at its right, 10 px apart.
- **"In the pool and in Linear"** (caption, muted, 12 px above).
- **Results**, the rows of the pool (at least 60 px, a hairline under each), each saying where it lives first in its meta:
  - 📅 "[Booking: reschedule flow]", "Pool · Kestrel · KES-58 · 3 Medium", **Place**.
  - 🌐 "[Lay out the booking page]", "Linear · Alder · ALD-14 · 1 Quick", **Place**.
- A muted label line under the list: "Search looks at titles and IDs in both tabs. No match: "Nothing called that. New task with this title" as a row." [ASSUMPTION: a designer's annotation on the frame, not product words; it states the no-match rule].
- **The keyboard** from 520 px down ("[iOS keyboard]", `--color-fill-muted`).

## What the person can do

- Type: results narrow as typed, by title and ID, across both tabs, whatever tab was open [ASSUMPTION: the filters on the tab are ignored while searching].
- **Place** on a result: the place sheet, as from either tab.
- A result row: its Item sheet [ASSUMPTION].
- **No match:** one row, "Nothing called that. New task with this title" [ASSUMPTION: the row opens New task with the query as the title, saved to the pool unless days are picked, never to Linear, D-USE-57].
- **Cancel:** clears the query and returns the sheet to 724 px on the tab it came from [ASSUMPTION].

## Words

"booking" (the query) · "Cancel" · "In the pool and in Linear" · "Pool · <client> · <ID> · <size>" · "Linear · <client> · <ID> · <size>" · "Nothing called that. New task with this title". Gloss passed these; the desk's '+ New item "<query>"' says the same in the desk's form ([`../../week/words-and-access.md`](../../week/words-and-access.md)).

## The notes on the boards

**Notes · phone, editing and This week (row 6, cont.) @ x 6748** — Pool search

The search grows the sheet to full height and searches both tabs by title and ID, each result saying where it lives. No match offers a new task with that title.

## Rulings

- D-USE-57: pool search across both tabs.
- D-USE-54: search is part of the pool sheet.

## Widths

Drawn at 402. 1024 and up: the pool panel's Search field, which takes this rule ([`../../week/pool-panel.md`](../../week/pool-panel.md) › Top to bottom, item 3).

## Criteria

| ID                            | When             | Then                                                                                                    | Evidence                       |
| ----------------------------- | ---------------- | ------------------------------------------------------------------------------------------------------- | ------------------------------ |
| C-USE-this-week-pool-search-1 | A query is typed | The sheet is full height; results from both tabs by title and ID, each meta starting "Pool" or "Linear" | `captures/pool-search-402.png` |
| C-USE-this-week-pool-search-2 | Nothing matches  | One row, "Nothing called that. New task with this title"                                                | test                           |
