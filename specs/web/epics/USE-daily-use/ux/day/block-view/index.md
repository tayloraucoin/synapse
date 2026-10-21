---
target: specs/web/ux/day/block-view/index.md
status: approved
promoted:
design:
  file: "Synapse, 01M49AX02VV4SSBKNCN6NRTS6Y"
  pages: ["USE — daily use", "USE — set up"]
  rows:
    - "USE — daily use · Row label · Block view"
    - "USE — set up · Row label · Block view from Set my days"
  locked: 2026-10-10
---

# Block view — day

Handoff pass, the ledger of the boards. Sources: N2 "Block view, editing", N3 "Block view, from the day", N1 step 3a; notes 22, 26, 29, 84, 87; rounds 7, 8; D-USE-8, 13, 17, 24, 28, 30, 31, 39, 64. The row "Row label · Block view" (p-3-0, y 6420, notes y 7350; coverage [`../../boards/use-daily-use/block-view.md`](../../boards/use-daily-use/block-view.md)). Words, access, instrumentation and criteria: [`words-and-access.md`](words-and-access.md).

## Job

Open one block as a child page of the day, its span stretched to fill the screen so every two-minute item is readable (notes 26, 29), and go back by the breadcrumb. One surface, two modes. **From the day:** check, reorder, remove, add, for today only. **Editing** a weekday's usual: build the block's checklist for every such weekday.

## Entry and exit

- **From the day:** a block tapped on Review the day (`../review-the-day/`), on Schedule ([`../schedule/index.md`](../schedule/index.md), during go), or "Edit block" on Now ([`../now/index.md`](../now/index.md)). Breadcrumb "‹ Today › Wellness". Route `/today/block/{id}` [PROPOSED] (`../overview.md`).
- **Editing:** a block in Set my days ([`../../set-my-days/set-my-days/index.md`](../../set-my-days/set-my-days/index.md)), or a new block just added there (N2, note 87; opens on [`states/empty.md`](states/empty.md)). Breadcrumb "‹ Monday › Wellness". Route `/days/block/{id}` [PROPOSED].
- **Exit:** the breadcrumb back to the day it came from; Done leaves Edit (from the day). An item's name opens the Item sheet ([`../item-sheet/index.md`](../item-sheet/index.md)), cited, not carried.

## Layout, top to bottom (phone 402)

Sizes, tokens and sample text: [`states/success.md`](states/success.md).

1. Status bar (the phone's).
2. `Breadcrumb` [PROPOSED] (Plumb at lock; open-1 "To Plumb"): "‹ Today › Wellness" or "‹ Monday › Wellness".
3. `BlockHeader`: the block's colour as a bar at the leading edge, the name (title), the span ("7:05 to 8:00") under it; trailing, from the day: "Edit" (plain text button) beside the round ··· (D-USE-24); editing: ··· alone.
4. A scope line under the header when it speaks: the Edit hint (from the day) or "Every Monday." (editing).
5. The stretched column: start times on the rail; rows at least 56 px, longer items taller; from the day a `Checkbox` leads each row; the planned length trails; in Edit or editing, a grip at the trailing edge (D-USE-17).
6. `InlineAddRow` "+ Add to Wellness" after the last item, then unused time as a dashed region "Free until 8:00" [ASSUMPTION, open-1].
7. The block's end as a solid line at "8:00", and the next block peeking at the foot ("Training · 8:00 to 8:57" with its colour bar).
8. From Schedule during go: the `BottomNav` tabs, Schedule selected.

[ASSUMPTION] Item icons show on rows where set (open-4, round 3: "Every item shows its icon wherever it is set"); step 3's frames predate that rule, and only `editing, offline` draws them.

## Primary action

Back by the breadcrumb (N1). In editing mode, the add row is the main move.

## States

| State               | File                                                     | Widths | One line                                                       |
| ------------------- | -------------------------------------------------------- | ------ | -------------------------------------------------------------- |
| from Review the day | [`states/success.md`](states/success.md)                 | 402    | The block filling the screen, with checkboxes                  |
| checked, swipe      | [`states/checked-swipe.md`](states/checked-swipe.md)     | 402    | Checked rows stay, faded; swipe reveals Remove                 |
| removed, undo       | [`states/removed-undo.md`](states/removed-undo.md)       | 402    | Times re-flow; a Toaster offers Undo                           |
| header menu         | [`states/header-menu.md`](states/header-menu.md)         | 402    | "Today's Wellness only": Rename, Icon and colour, Delete block |
| Edit, dragging      | [`states/edit-dragging.md`](states/edit-dragging.md)     | 402    | Grips, the hint, a lifted row over a drop line                 |
| editing Monday      | [`states/editing-monday.md`](states/editing-monday.md)   | 402    | The usual Monday's block, grips, no checkboxes                 |
| current             | [`states/current.md`](states/current.md)                 | 402    | From Schedule during go, with the now-line                     |
| past                | [`states/past.md`](states/past.md)                       | 402    | Faded, still live; nothing says missed                         |
| runs past its end   | [`states/overflow.md`](states/overflow.md)               | 402    | "Runs 12 min past 8:00." in ink                                |
| empty               | [`states/empty.md`](states/empty.md)                     | 402    | "Nothing in Wellness yet." with the add row focused            |
| loading             | [`states/loading.md`](states/loading.md)                 | 402    | Header live; rows as skeletons                                 |
| error               | [`states/error.md`](states/error.md)                     | 402    | `RegionRetry` under a live header                              |
| offline             | [`states/offline.md`](states/offline.md)                 | 402    | Checks save on the phone and sync later                        |
| editing, offline    | [`states/editing-offline.md`](states/editing-offline.md) | 402    | Drawn read-only; edits save and sync later (D-USE-67)          |
| partial             | [`states/partial.md`](states/partial.md)                 | —      | N/A: one block is one read                                     |

### Suggested items, from Set my days (2026-10-20)

Six more states, beside the same row at x 6748 to 9158: the list of items used before and the seed under a block's add row, the span total, a length inline, reordering, past the span and a kind's first block. Their table, words, access and criteria: [`suggested.md`](suggested.md) (D-USE-135 to 138).

### Editing by kind, from Set my days (area 5)

Thirteen more states, from the row "Row label · Block view from Set my days" on "USE — set up" (p-4-0, y 3780, notes y 4710; coverage [`../../boards/use-set-up/block-view-from-set-my-days.md`](../../boards/use-set-up/block-view-from-set-my-days.md)): Work's tiers, add to a tier and set work; Wellness, Training, a meal and a true break; the Sunday checklist; Life, set; four To-dos states. Their table, words, access and criteria: [`by-kind.md`](by-kind.md). The set-up page's `block-view / wellness, new and empty / 402 / light` is a second board of [`states/empty.md`](states/empty.md) (D-USE-81: 5 minutes).

## Platforms

Phone 402 only. At 1024 and wider Block view has no frame of its own and scales up from these (D-USE-39). At the desk's Today, N6: "Clicking a block opens its Block view in the right panel." Dark comes with the lock pass (D-USE-39).

## Interactions opened here

None of its own: swipe-to-remove, the header menu and reordering stay inside this surface. The Item sheet: [`../item-sheet/index.md`](../item-sheet/index.md). The icon picker, from "Icon and colour": [`../../interactions/icon-picker/index.md`](../../interactions/icon-picker/index.md) [ASSUMPTION: the same picker].
