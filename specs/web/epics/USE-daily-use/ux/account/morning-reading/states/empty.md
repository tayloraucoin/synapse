---
target: specs/web/ux/account/morning-reading/states/empty.md
status: approved
promoted:
boards:
  - name: "morning-reading / empty / 402 / light"
    page: "USE — daily use"
    at: [5864, 2640]
    note: "Row label · Morning reading @ x 4340, y 2640 (no per-frame note)"
    capture: specs/web/epics/USE-daily-use/ux/account/morning-reading/captures/empty-402.png
rulings: [D-USE-119, D-USE-122]
---

# Settings › Morning reading — Nothing yet

No passages and no links. `?state=empty`.

## What shows, top to bottom

- Header as `list.md`.
- Passages: the heading, then "Nothing to read yet. A passage added here shows on Orient each morning." (muted, `EmptyState` one sentence), then "+ Add a passage".
- Links: the heading, then "No links yet. A playlist or a page added here shows under the reading.", then "+ Add a link".
- No order lines and no Off lists.

## What it does

- The add rows open their sheets. Orient's own empty line does not change (D-USE-119).

## Words

As the surface's Words (`../words-and-access.md`).

## The notes on the boards

None on the frame. The row label: "Writes what Orient reads: passages and links. Opened from Settings, beside Connections. … Images are designed, not built (dev note). Round 1 picked B; A and C sit at the row's end. Round 2: Assay round 1's red findings fixed."

## Rulings

- D-USE-119
- D-USE-122

## Widths

Drawn at: 402. At the desk: as the surface's Platforms (`../index.md`).

## Criteria

| ID                       | When                   | Then                                              | Evidence                 |
| ------------------------ | ---------------------- | ------------------------------------------------- | ------------------------ |
| C-USE-morning-reading-10 | No rows, active or off | Each section shows its one line above its add row | `captures/empty-402.png` |
