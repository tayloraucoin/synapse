---
target: specs/web/ux/account/morning-reading/states/list-off-open.md
status: approved
promoted:
boards:
  - name: "morning-reading / list-off-open / 402 / light"
    page: "USE — daily use"
    at: [5382, 2640]
    note: "Row label · Morning reading @ x 4340, y 2640 (no per-frame note)"
    capture: specs/web/epics/USE-daily-use/ux/account/morning-reading/captures/list-off-open-402.png
rulings: [D-USE-124, D-USE-125, D-USE-123]
---

# Settings › Morning reading — List, some off

The Passages' Off list opened: one off passage. `?state=list-off-open`.

## What shows, top to bottom

- As `list.md`, the Passages' "Off" opened (chevron down).
- The line "Not in the morning reading. Turn one on to bring it back." (muted).
- "The long view" over its first line, faint; under it two text buttons in ink, "Turn on" and "Delete".
- Links' Off stays collapsed.

## What it does

- "Turn on" clears `archived_at` and puts the row at the end of its list (D-USE-123). "Delete" opens `delete-confirm.md`.
- An Off list with nothing in it is not shown [ASSUMPTION: the disclosure hides when empty].

## Words

As the surface's Words (`../words-and-access.md`).

## The notes on the boards

None on the frame. The row label: "Writes what Orient reads: passages and links. Opened from Settings, beside Connections. … Images are designed, not built (dev note). Round 1 picked B; A and C sit at the row's end. Round 2: Assay round 1's red findings fixed."

## Rulings

- D-USE-124
- D-USE-125
- D-USE-123

## Widths

Drawn at: 402. At the desk: as the surface's Platforms (`../index.md`).

## Criteria

| ID                      | When          | Then                                                       | Evidence                         |
| ----------------------- | ------------- | ---------------------------------------------------------- | -------------------------------- |
| C-USE-morning-reading-8 | Off is opened | Off rows show with Turn on and Delete, never ···           | `captures/list-off-open-402.png` |
| C-USE-morning-reading-9 | Turn on       | The row leaves Off and lands at the end of its active list | test                             |
