---
target: specs/web/ux/account/morning-reading/states/discard.md
status: approved
promoted:
boards:
  - name: "morning-reading / discard / 402 / light"
    page: "USE — daily use"
    at: [8274, 2640]
    note: "Row label · Morning reading @ x 4340, y 2640 (no per-frame note)"
    capture: specs/web/epics/USE-daily-use/ux/account/morning-reading/captures/discard-402.png
rulings: [D-USE-126]
---

# Settings › Morning reading — Discard unsaved

Leaving the edit sheet with unsaved words. `?state=discard`.

## What shows, top to bottom

- The edit sheet behind a scrim, with "Then the day, one block at a time, and tea before any of it." as the unsaved change.
- `DiscardDialog`: "Discard changes?", "The edits to “Where the feet are” are not kept. The passage stays as it was.", "Keep editing" (outline) and "Discard" (ink).

## What it does

- "Keep editing" returns to the sheet with the words. "Discard" closes the sheet; nothing is written. Leaving with no change asks nothing.

## Words

As the surface's Words (`../words-and-access.md`).

## The notes on the boards

None on the frame. The row label: "Writes what Orient reads: passages and links. Opened from Settings, beside Connections. … Images are designed, not built (dev note). Round 1 picked B; A and C sit at the row's end. Round 2: Assay round 1's red findings fixed."

## Rulings

- D-USE-126

## Widths

Drawn at: 402. At the desk: as the surface's Platforms (`../index.md`).

## Criteria

| ID                       | When                 | Then                                    | Evidence                   |
| ------------------------ | -------------------- | --------------------------------------- | -------------------------- |
| C-USE-morning-reading-16 | × with unsaved words | The dialog asks; Discard writes nothing | `captures/discard-402.png` |
