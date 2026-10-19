---
target: specs/web/ux/interactions/spread/index.md
status: approved
promoted:
boards: []
dev_note: ""
rulings:
  [
    D-USE-40,
    D-USE-42,
    D-USE-54,
    D-USE-55,
    D-USE-56,
    D-USE-57,
    D-USE-65,
    D-USE-93,
    D-USE-94,
    D-USE-102,
  ]
---

# Spread across the week

A task bigger than a block becomes sessions on several days in one step: the hours left, which Work block, the days, each session's length and one tier, previewed before anything is placed (D-USE-42). The sessions are one item (D-USE-40; [`../sessions.md`](../sessions.md)). Each drawn step is a file in `states/`.

## Where it starts

- **Desk, the pool panel:** "Spread…" on a big item's row ("8 Huge · 20 h"), in the Week, beside the Block panel, or docked on Today's nothing-planned ([`../../work/week/pool-panel.md`](../../work/week/pool-panel.md); [`../../work/today/states/nothing-planned.md`](../../work/today/states/nothing-planned.md)). [ASSUMPTION] It shows on an 8 Huge item, or any item longer than its biggest Work block.
- **A session's menu** (the canvas note): the Item sheet's ··· › "Spread across the week" ([`../../day/item-sheet/states/work-more-open.md`](../../day/item-sheet/states/work-more-open.md)). At the desk [ASSUMPTION] the same ··· in the right-panel sheet, and a Week chip's right-click menu (the desk work menu, D-USE-65).
- **Phone:** "Spread it across the week" on a place that doesn't fit ([`../place-from-the-pool/states/doesnt-fit.md`](../place-from-the-pool/states/doesnt-fit.md)); the Item sheet's ··· › "Spread across the week" ([`../../day/item-sheet/states/work-more-open.md`](../../day/item-sheet/states/work-more-open.md)). An 8 Huge pool row's meta names it ([`../place-from-the-pool/states/pool-sheet.md`](../place-from-the-pool/states/pool-sheet.md)).
- [ASSUMPTION] Size and length's "Bigger than a block. Split it?" under 8 Huge opens it ([`../../dev-notes/size-and-length.md`](../../dev-notes/size-and-length.md)).

## Steps

| # | The person | The app | Board (carried by) |
| --- | --- | --- | --- |
| 1 | Spread… | Desk: a centred `Dialog` over the Week under a scrim, set to the item's hours, Morning Work, the days left with that block, Primary [ASSUMPTION: these defaults are the sample's]. Phone: a full sheet (D-USE-54) | `week / spread a big task / 1728 / light` ([`states/across-the-week/1728.md`](states/across-the-week/1728.md)); `this-week / spread across the week / 402 / light` ([`states/across-the-week/402.md`](states/across-the-week/402.md)) |
| 2 | Sets Work left, Which block, Days, Each session, Tier | The preview re-counts: one row per session with its date, block, what it shares ("shares with [Alder intro] 3/3") and the time it gets; the sum line; the action's count | same |
| 2a | Pick blocks | [ASSUMPTION] each picked day lists its Work blocks to tick, any mix | not drawn |
| 2b | Phone: Days and tier | A sub-page: each day with its free time in the chosen block, one tier for every session; Back returns to the preview (D-USE-57) | `this-week / spread, days and tier / 402 / light` ([`states/days-and-tier.md`](states/days-and-tier.md)) |
| 3 | Add 4 sessions | The dialog closes; a session lands in the chosen tier of each picked day, each "n of N" with the link mark; the pool row keeps what is left; a toast names the days with Undo [ASSUMPTION: not drawn; as "Placed, Undo" (D-USE-57) and the drop's "Added as session 2 of 3. Undo"] | not drawn |
| 4 | Undo | Every session from this spread is removed; the pool row is as it was [ASSUMPTION] | not drawn |

## Rules

- **One item, many sessions.** Checking a session is "Done for today"; the task is done only by "Mark the task done" or Linear ([`../sessions.md`](../sessions.md)). Every session shows n of N.
- **The preview counts what is already there.** Each session gets the block's time left after the block's other work, at the top of its ranges [ASSUMPTION: the ranges' top, as the fit line]; the sum says what stays in the pool. Lengths and times only, never counts of misses, never red.
- **Afternoons stay free** when Morning Work is picked: nothing is placed in a block not chosen.
- **Carry on next week** [PROPOSED] (D-USE-42): sessions keep being placed the same way, week by week, until Work left is done. [ASSUMPTION] Next week's sessions are placed when that week is first shown, and each is visible to move or drop.
- Decided (D-USE-102): What N counts with Carry on next week on. Ruled: the sessions placed so far (4 here); N grows when next week's are placed.
- **Editing one session later** asks This session (default) or All sessions ([`../sessions.md`](../sessions.md), D-USE-57; open-8's item there).
- **Linear:** spreading writes nothing to Linear; sessions are Synapse's (D-USE-57: only "Mark the task done" closes the issue) [ASSUMPTION for the estimate: Work left does not change Linear's estimate].
- **Offline:** it works and syncs later, as everything on the phone (D-USE-56) [ASSUMPTION at the desk].

## Words

"Spread…" (pool row), "Spread across the week" (title and menu item); the dialog's strings are in [`states/across-the-week/1728.md`](states/across-the-week/1728.md), the phone sheet's in [`states/across-the-week/402.md`](states/across-the-week/402.md) and [`states/days-and-tier.md`](states/days-and-tier.md); the phone's action is "Spread it". [ASSUMPTION] The toast: "4 sessions added, Tue to Fri" with "Undo".

## Access

- A `Dialog`: focus moves to Work left on open [ASSUMPTION] and is trapped; × is named "Close"; Esc cancels; focus returns to "Spread…" on close.
- Which block is a radio group; each day chip is a toggle button named by the full day, "Tuesday 13, picked"; Monday is disabled with its reason as its description [ASSUMPTION: "Its Morning Work has begun"].
- The preview is a list, each row read as "Tue 13, Work 9:30 to 12:00, 2 hours 30"; its changes and the sum are announced politely [PROPOSED].
- The tier's colour square always sits with its word; the checkbox has its sentence as its label. Targets at least 44 × 44 on the phone; the 34 px chips grow to 44 there [ASSUMPTION].

## Platforms

Desk from 1024 (D-USE-93), the Week behind it per D-USE-94; the phone below 1024 as a full sheet with a Days and tier sub-page (D-USE-54, D-USE-55: Place and Spread stand in for drag). Drawn: the desk dialog at 1728 ([`states/across-the-week/1728.md`](states/across-the-week/1728.md)); the phone's full sheet at 402, row 6 x 3856 ([`states/across-the-week/402.md`](states/across-the-week/402.md)), and its Days and tier page, row 6 x 9158 ([`states/days-and-tier.md`](states/days-and-tier.md)). Not drawn: Pick blocks open, a set length, the toast and Undo (steps 2a, 3, 4).

## Rulings

- D-USE-40: a task longer than a day is one item placed as sessions.
- D-USE-42: Spread's fields, the preview and Carry on next week [PROPOSED].
- D-USE-54: on the phone, a full sheet with the desk's fields and the preview.
- D-USE-55: Spread stands in for the desk's drag on the phone.
- D-USE-57: Spread's Days and tier page; "doesn't fit" offers Spread; the ··· holds Spread; This session or All sessions.
- D-USE-93, D-USE-94: the desk from 1024; the Week behind narrows to 120 px columns, then scrolls.

## Criteria

| ID | When | Then | Evidence |
| --- | --- | --- | --- |
| C-USE-spread-1 | Spread… on a big pool row | The dialog opens over the Week with the item named and its hours as Work left | `captures/across-the-week-1728.png` |
| C-USE-spread-2 | Add <n> sessions | One session per picked day in the chosen tier, each "n of N"; what is left stays in the pool; Undo offered | test |
| C-USE-spread-3 | Done on one session | "Done for today"; the other sessions and the Linear issue are unchanged | test |
| C-USE-spread-4 | Below 1024 | The phone's full sheet, not the dialog, with Days and tier as a sub-page | `captures/across-the-week-402.png` |
