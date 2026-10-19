---
target: specs/web/ux/day/review-the-day/states/offline.md
status: approved
promoted:
boards:
  - name: "review-day / offline / 402 / light"
    page: "USE — daily use"
    at: [3856, 5160]
    note: "Note · success"
    capture: specs/web/epics/USE-daily-use/ux/day/review-the-day/captures/offline-402.png
rulings: [D-USE-56, D-USE-64]
---

# Review the day — offline

No connection. Its note is the "Note · success" at x 3856, y 6090.

## What shows, top to bottom

- As [`success.md`](success.md), with one `StatusLine` under the header, above the tray: a full-width `--color-surface` band, 8 px top and bottom, "Offline. Changes are saved on this phone and sync later." (label, muted).
- The tray, the column (Orient, Wellness, Training 8:00 to 8:57, Breakfast, Work, Lunch), the rail + and Ready, go as success; the column moves down by the line's height.

## What the person can do

Everything: the day from cache, all editable. Swaps, adds and removes save on the phone and sync when back. Ready, go still works.

## Words

"Offline. Changes are saved on this phone and sync later." Replaces N3's "a `StatusLine` says changes wait" with the canvas words.

## The notes on the boards

**"review-day / offline / 402 / light"**, "Note · success" @ x 3856, y 6090:

> offline
>
> The day from cache, all editable. One status line under the header; Ready, go still works.

## Rulings

- N3's offline row: the day from cache, editable; a `StatusLine`; Ready, go still works.
- D-USE-56 and D-USE-64: on the phone, edits save offline and sync later.
- Make room, A later start and the add sheet work offline too [ASSUMPTION: they read only the cached day].

## Widths

Drawn at: 402. At the desk: the line spans the capped column (D-USE-39).

## Criteria

| ID                             | When                               | Then                                                     | Evidence                   |
| ------------------------------ | ---------------------------------- | -------------------------------------------------------- | -------------------------- |
| C-USE-review-the-day-offline-1 | Offline                            | The day from cache, one status line, everything editable | `captures/offline-402.png` |
| C-USE-review-the-day-offline-2 | A change offline, then back online | It syncs with nothing lost                               | test                       |
