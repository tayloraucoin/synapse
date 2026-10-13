---
target: specs/web/ux/work/block-panel/index.md
status: approved
promoted:
design:
  file: "Synapse, 01M49AX02VV4SSBKNCN6NRTS6Y"
  pages: ["USE — work"]
  rows: ["USE — work · Row label · Block panel"]
  locked: 2026-10-10 (D-USE-49)
---

# Block panel — work

Handoff pass, the ledger of the boards. The row "Row label · Block panel" (p-6-0, y 4320, notes y 5477; coverage [`../../boards/use-work/block-panel.md`](../../boards/use-work/block-panel.md)), which reads: "Any block opened from the week: a right-hand panel over the week. A Work block shows its tiers; any other block shows its items." Sources: D-USE-41 ("Any block opens a right-hand Block panel: tiers for Work, items for other kinds"), D-USE-39, D-USE-74, D-USE-77, D-USE-93, D-USE-94. Words, access, instrumentation and criteria: [`words-and-access.md`](words-and-access.md).

## Job

Open one block of one date beside the week, without leaving the week: see what the block holds, plan into it (a Work block's tiers, any other block's items) and go back to the week with nothing lost. Done is the panel closed and the week as it was, with the block changed. It is the phone's Block view at the desk (`../../day/block-view/`, D-USE-55), "widened" (the non-work note).

## Entry and exit

- **In:** any block clicked in the Week's Time lens ([`../week/states/time-lens.md`](../week/states/time-lens.md); the time lens note: "Clicking any block opens the Block panel"); a block in Today's day column ([`../today/index.md`](../today/index.md) › Entry and exit; N6: "Clicking a block opens its Block view in the right panel"); a Schedule block at the desk (D-USE-77, `../../day/schedule/`).
- **Out:** × (the round button, top right), or Esc: the panel closes and the block's ink ring goes. **Open day:** the opened day for that date, [`../today/states/opened-day.md`](../today/states/opened-day.md). An item's row: the Item sheet (`../../day/item-sheet/`) [ASSUMPTION: it takes the same right panel, and closing it returns to this panel; D-USE-60 (3) has the desk Item sheet as a right-side panel and no frame draws the two together].
- **Route** [ASSUMPTION: a query on the page it opens over, `?panel=block&id=<block>&date=<date>`, as the Item sheet's `?sheet=item&id=` (`../overview.md`); no route is drawn or ruled].

## Layout, top to bottom (1728, the panel)

`ResponsiveSheet`'s right panel at `--sheet-w` as built (D-USE-39), drawn at 440 × 1117, full height at the right edge, over the week. No scrim: the week stays in view to its left with the opened block ringed in ink (a 2 px `--color-foreground` outline, 1 px offset), and the pool panel stays docked and open at 360 for dragging in (the work note; [`../week/pool-panel.md`](../week/pool-panel.md)). The panel covers the week's right columns (Fri to Sun at 1728). Panel: `--color-background`, a 1 px `--color-border` left edge, the sheet's shadow to its left (drawn `-8px 0 24px` at 8 % of ink [ASSUMPTION: the built sheet's shadow token]), 20 px top and bottom and 24 px side padding, 16 px between regions.

1. **Top line:** the `Breadcrumb` [PROPOSED, as Block view's] "<Day> › <Block>" ("Tue 13 › Work"; 13 px, muted) on the left. On the right, 8 px apart: **Open day** (a text button, 13 px semibold, ink) and **×** (a 32 px round button in `--color-surface`).
2. **Header** (the `BlockHeader`): the block's colour as a 3 × 40 px bar (Work `--color-category-sky-dot`, Training `--color-category-clay-dot`), then the block's name in the serif (24/30, weight 500) over its span and a fit line (13 px, muted): "9:30 to 12:00 · ends 11:40 at the top of the ranges"; "8:00 to 8:57 · ends 8:57 as planned".
3. **The body:** a Work block's tiers ([`states/work-block.md`](states/work-block.md)), or any other block's items ([`states/non-work-block.md`](states/non-work-block.md)), each ending in its "+ Add to <tier or block>" row.
4. **The scope line,** under a hairline (13/20, muted): what a change here reaches ("Tiers belong to Tuesday, not to this block. …"; "Changes apply to Monday 12 only. The usual Monday stays as it is.").

## Primary action

None filled: the add rows are the main move, as Block view's editing mode (`../../day/block-view/index.md` › Primary action). **Open day** is the one emphasised control (semibold ink); × leaves.

## States

| State                   | File                                                   | Widths drawn | One line                                                                 |
| ----------------------- | ------------------------------------------------------ | ------------ | ------------------------------------------------------------------------ |
| a Work block, from Time | [`states/work-block.md`](states/work-block.md)         | 1728         | Tue 13's 9:30 Work: the day's tiers in this block, grips, add rows       |
| a non-work block        | [`states/non-work-block.md`](states/non-work-block.md) | 1728         | Mon 12's Training: items on rail times, transitions in italics, Swap     |
| today's block, checking | [`states/checking-today.md`](states/checking-today.md) | none         | From Today or Schedule: the items carry checkboxes (D-USE-74); not drawn |

Not separate states: **loading** [ASSUMPTION: N/A, the panel opens on a block already on screen, as the Item sheet's loading (D-USE-65)]; **offline** (edits save on the device and sync later, as Block view, D-USE-64, D-USE-67, with the app's `StatusLine`); **error** on a save [ASSUMPTION: Block view's (`../../day/block-view/states/error.md`)].

## Platforms

- **Desk, 1024 and up** (D-USE-93): the panel, drawn at 1728 only. From 1024 to 1727 the panel keeps `--sheet-w` and the week behind it follows D-USE-94 (the pool docked at 360, the day columns shrink to about 120 px, then the week scrolls sideways); D-USE-94 names the Block panel with the Time lens.
- **Phone, below 1024:** no panel. The phone's answer is the Block view (`../../day/block-view/`, D-USE-55): from Schedule for today, from Set my days' day view for another date (`../../day/block-view/states/work-tiers.md` for a Work block in This week).

## Interactions opened here

Placing from the pool by drag or by "+ Add to <tier>": [`../../interactions/place-from-the-pool/index.md`](../../interactions/place-from-the-pool/index.md). Sessions ("session 2 of 3"): [`../../interactions/sessions.md`](../../interactions/sessions.md). Swap on a workout: the Item sheet's swap (`../../day/item-sheet/states/swap.md`). The Item sheet: `../../day/item-sheet/`.
