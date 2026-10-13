---
target: specs/web/ux/work/overview.md
status: approved
promoted:
---

# work — overview

Handoff pass, the ledger of the boards. The work area is the desk's day (N6) and the work block on the phone (D-USE-50): Today, the Week, the Block panels and This week. Decisions live in [`../day/decisions/`](../day/decisions/D-USE-38-41.md) (D-USE-39 to 62; then D-USE-93 to 102 and 103 to 112 in [`D-USE-93-102.md`](../day/decisions/D-USE-93-102.md), [`D-USE-103-112.md`](../day/decisions/D-USE-103-112.md)); coverage of every artboard on "USE — work" is in [`../boards/use-work/`](../boards/use-work/today-at-a-desk.md).

## Frame

Mid-morning, two or three AI threads out for two or three clients; the one question is what is Taylor's to do while that runs (N6). The desk answers it at a glance, today first; the week is one click away; the pipeline stays out of sight. Never a board to manage (N6, iteration 2). Many items fire at once; one is in Taylor's hands at a time (D-USE-43). Times are lengths, never counts (D-USE-47).

## Surfaces and routes

| Route | Surface | Width | Entry | Exit |
| --- | --- | --- | --- | --- |
| `/today` | [`today/`](today/index.md) | desk: Today; phone: Now with a Work block active | Rail "Today"; the phone's Now tab during Work; Ready, go | Week; Schedule; the Item sheet |
| `?sheet=item&id=` | `../day/item-sheet/` | both | A row (click, tap) | Closes to Today |
| `/week` [ASSUMPTION] | [`week/`](week/index.md) | desk only, from 1024 (D-USE-93); below it Set my days › This week (D-USE-55) | Rail "Week"; Plan the week on Today | Today; the opened day; the Block panel; the Item sheet |
| `?panel=block&id=&date=` [ASSUMPTION] | [`block-panel/`](block-panel/index.md) | desk only, from 1024 (D-USE-93); below it Block view (D-USE-55) | A block in the Time lens, Today's day column, or Schedule (D-USE-77) | ×, Esc, Open day |
| `/today?date=` [ASSUMPTION] | [`today/states/opened-day.md`](today/states/opened-day.md) | desk only; below it a day chip in Set my days (D-USE-55) | A day head's › on the Week; Open day in the Block panel | ‹ Week |
| `/days?week=this&day=` [PROPOSED, the Set my days route] | [`this-week/`](this-week/index.md) | phone, below 1024; at the desk the Week (D-USE-55) | Set my days › This week, then a day; Plan the week on Today's no-work-slotted; Open This week on Review the day | ‹ Week; the Item sheet; the Block view; Pool (the pool sheet, [`place-from-the-pool/`](../interactions/place-from-the-pool/index.md)) |

`/today` is one route at both widths: at and above the split the desk layout renders, below it the phone's Now (D-USE-39, D-USE-50).

## The rail (desk)

N6 "The rail" on D-USE-39's rail (`--rail-w`, 220 px): Synapse wordmark, then **Today**, **Week**, **Schedule**, a rule, **Workflow (beta)** (until the board retires); the avatar and name in the footer. The current item is shaded `--color-surface`. The rail stays during go mode (D-USE-39). Order is fixed; each item is a link with an icon and its word (colour never alone). These tabs (and the phone's Now, Schedule, Review) replace the app's five in `_global/shell.md` and `navigation.md` at promotion; Settings is reached through the avatar (D-USE-89); whether the other tabs' routes retire is Technical's (D-USE-99).

## Navigation at each width

- **Desk (1728 drawn):** rail, then the week strip across the top of the content (desk-only, D-USE-55), then Today's main column (capped at `--content-text`, 720 px) and the day column (340 px) to its right, the pair centred in the space right of the rail. The Item sheet opens in `ResponsiveSheet`'s right panel at `--sheet-w` (D-USE-39; desk form Decided (D-USE-103), closing D-USE-60 (3)).
- **Phone (402 drawn):** the phone's own shell: `AppHeader` "Now" with + (Add) and the avatar, the To-dos tray line, then the active block; `BottomNav` Now, Schedule, Review (D-USE-50). No rail, no week strip, no day column, no Next strip, no keys (D-USE-51, D-USE-55). The two-pane Week becomes Set my days › This week (D-USE-55, row 6's dev note "What stays at the desk, and the phone's answer", [`../dev-notes/what-stays-at-the-desk.md`](../dev-notes/what-stays-at-the-desk.md)).
- **Breakpoint:** one break for the whole desk, `--breakpoint-split: 1024px` in `preset.css` (D-USE-93). From 1024 up the rail and every desk surface show (Today, the Week, the Block panel, the opened day, Schedule, Settings in the main pane); below it the phone's tabs and Set my days › This week stand in (D-USE-55). The rail the app builds from 768 moves to 1024 (768 to 1023 keeps `BottomNav`, D-USE-74). Today switches at 1024 (D-USE-65); between 1024 and 1728 the day column keeps 340 px and the main column shrinks, then the week strip scrolls horizontally. The Week keeps the pool docked at 360 and its day columns shrink to about 120 px, then scroll sideways (D-USE-94). 1024 and 1440 are not drawn for any work surface.

## Flow order

Today at the desk, in the work loop's order (row 1): working → running → prompt sent → brought back with Done → stepped away; then the edges (row 2), the Week (row 3), the Block panels (row 4), the phone's Today (row 5), then editing, This week and Settings on the phone (row 6). Flows: the Work table of [`../interactions/index.md`](../interactions/index.md) (firing, spread, place from the pool, add an event, step away, start while one runs, + Add, sessions); data rules in [`../dev-notes/timers-across-devices.md`](../dev-notes/timers-across-devices.md).

## Design

Paper file `01M49AX02VV4SSBKNCN6NRTS6Y`, page "USE — work" (p-6-0). Desk 1728 × 1117 (rows 1 to 4, locked D-USE-49), phone 402 × 874 (rows 5 and 6, locked D-USE-58). Light only; dark comes with the build's theme pass. Colours (Progress, D-USE-49): verdigris is Taylor's hands (running); rust on grey is waiting on AI (firing, Prompt sent); ink is the day's structure; Next and hover share a light grey shade. Clients and titles are [placeholder].
