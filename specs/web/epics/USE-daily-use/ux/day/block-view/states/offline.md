---
target: specs/web/ux/day/block-view/states/offline.md
status: approved
promoted:
boards:
  - name: "block-view / offline / 402 / light"
    page: "USE — daily use"
    at: [5784, 6420]
    note: "Note · offline"
    capture: specs/web/epics/USE-daily-use/ux/day/block-view/captures/offline-402.png
rulings: [D-USE-56, D-USE-64, D-USE-67]
---

# Block view — offline (from the day)

No connection, opened from the day. `?state=offline`. Its note is "Note · offline" at x 5784, y 7350.

## What shows, top to bottom

As [`success.md`](success.md), except:

- A `StatusLine` under the header, full width, `--color-surface` band, caption, muted: "Offline. Checks are saved on this phone and sync later." (no icon on this frame).
- "Pee and weigh" checked and faded (checked offline).
- The rest as success: Water 7:07, Start the cold bath 7:08, Meditate 7:10, Cold bath 7:20, the add row at 7:30, "Free until 8:00", "8:00", the Training peek; "Edit" and ··· live.

## What the person can do

- Check and uncheck: saved on the phone, synced when back.
- [ASSUMPTION] Edit, reorder, Remove with Undo, the add row and the header menu also work offline and sync later, as Review the day offline is "all editable" ("Note · success" @ x 3856, y 6090) and the item sheet edits offline (D-USE-64). The frame draws only a check.
- An item's name: the Item sheet, which edits offline (`../../item-sheet/states/offline.md`).

## Words

"Offline. Checks are saved on this phone and sync later." [ASSUMPTION: if every edit works offline, Gloss may widen "Checks" to "Changes"; the frame's words stand until then].

## The notes on the boards

**"block-view / offline / 402 / light"**, note "Note · offline" @ x 5784, y 7350:

> offline
>
> From the day, checks work and sync later; the StatusLine says so. Editing Monday's default offline is read-only: grips and the add row are disabled [not drawn; same frame, greyed].

## Rulings

- N3 / the intent file: from the day, checks work and sync later.
- D-USE-56: on the phone, offline, everything works, with a StatusLine. D-USE-64: the item sheet edits offline and syncs later.
- The note's second sentence (editing offline is read-only) is the same rule `block-view / editing, offline` draws; it is checked against D-USE-64 in [`editing-offline.md`](editing-offline.md), and is superseded in behaviour (D-USE-67). Nothing about the from-the-day frame conflicts with D-USE-64.

## Widths

Drawn at: 402. Not drawn at: the desk; scales up (D-USE-39).

## Criteria

| ID                         | When                   | Then                                                            | Evidence                   |
| -------------------------- | ---------------------- | --------------------------------------------------------------- | -------------------------- |
| C-USE-block-view-offline-1 | Offline, from the day  | The StatusLine shows under the header; checks save on the phone | `captures/offline-402.png` |
| C-USE-block-view-offline-2 | The connection returns | The checks sync and the StatusLine goes, nothing lost           | test                       |
