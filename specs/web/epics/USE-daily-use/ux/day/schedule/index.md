---
target: specs/web/ux/day/schedule/index.md
status: approved
promoted:
design:
  file: "Synapse, 01M49AX02VV4SSBKNCN6NRTS6Y"
  pages: ["USE — daily use"]
  rows: ["USE — daily use · Row label · Schedule"]
  locked: 2026-10-12
---

# Schedule — day

Sources: N4 "Schedule, during the day"; N3's "already gone" (Review the day's job passes here after Ready, go); round 9; the row "Row label · Schedule" (p-3-0, y 20280, notes at y 21210, from step 8, rounds 1 to 3); coverage [`../../boards/use-daily-use/schedule.md`](../../boards/use-daily-use/schedule.md). The intent-pass flat file is folded in here. Words, access, instrumentation and criteria: [`words-and-access.md`](words-and-access.md).

## Job

Answer "where am I in the day" without leaving go mode's calm (N4). After Ready, go it takes Review the day's job (N3, `../review-the-day/states/after-ready-go.md`). Nothing is asked of Taylor here; done is having looked.

## Entry and exit

- **Entry:** the Schedule tab in `BottomNav` (Now, Schedule, Review); "See the whole day" in Now's header menu (`../now/states/header-menu.md`) and on Now's last-block empty state (`../now/states/empty-no-blocks.md`); "See the whole day" on Block complete's last block (D-USE-72, `../block-complete/index.md`); "See it" on the Tomorrow peek opens tomorrow's day as Schedule draws it (D-USE-74, `../close-the-day/index.md`). Route `/today/schedule`, as built (`apps/web/app/(shell)/today/schedule/page.tsx`); another day is `/day/<date>/schedule`. Re-tapping the tab scrolls to now (living truth: `specs/web/ux/_global/navigation.md`).
- **Exit:** a block, or the All day strip, opens its Block view with the breadcrumb "‹ Today › <Block>" (`../block-view/states/current.md` for the block under way; D-USE-72 for the strip). The tabs; the To-dos tray (`../todos/`).

## Layout, top to bottom (phone 402)

Full detail and the fixture: [`states/during-go.md`](states/during-go.md).

1. **Title:** the date, "Monday, 12 October" (`--text-title`, semibold), no `AppHeader` words and no back.
2. **To-dos tray**, closed, between hairlines: "To-dos", the first title ellipsised, ⌄ (D-USE-26; `../todos/`, cited, not carried).
3. **The All day strip**, only on a checklist day (D-USE-28): [`states/checklist-day.md`](states/checklist-day.md).
4. **The day column:** `ScheduleAxis` at 96 px an hour (D-USE-23, N4), hour labels ("7" … "13") at x 20 and hairlines from 56 px; blocks as `ScheduleBlock` grouping boxes from x 60 (322 wide, `--radius-control`, a 3 px left rule in the kind's `--color-category-*-dot` on its `-chip` fill), name (body, semibold) and span (label, medium, muted), items as the bullet grid (two 145 px cells a line, "+n more"); a Work block lists its items by tier under caption headings ("Primary", "Secondary"); transitions as a short dash and italic muted words; meals as dashed bands with their glyph. Done blocks fade to 45 %. The `NowLine` at the minute: a verdigris tag with the time on the rail, a 1.5 px line at 55 % over the content (D-USE-30). The block under way takes a hairline verdigris edge, the one "this moment" mark (N4; `DESIGN.md` D-P02).
5. **`BottomNav`:** Now, Schedule (selected, semibold), Review.

## Primary action

None; it is a view. Tapping a block is the main move.

## States

| State                  | File                                                                   | Widths drawn | One line                                             |
| ---------------------- | ---------------------------------------------------------------------- | ------------ | ---------------------------------------------------- |
| during go              | [`states/during-go.md`](states/during-go.md)                           | 402          | The day at 10:20; Work edged in verdigris            |
| checks and running     | [`states/checks-and-running.md`](states/checks-and-running.md)         | 402          | Checks in the block's colour; the running dot pulses |
| checklist day          | [`states/checklist-day.md`](states/checklist-day.md)                   | 402          | The All day strip above the rail                     |
| meeting inside a block | [`states/meeting-inside-a-block.md`](states/meeting-inside-a-block.md) | 402          | A plum band across Work at its time                  |
| empty                  | [`states/empty.md`](states/empty.md)                                   | not drawn    | Nothing on the day                                   |
| loading                | [`states/loading.md`](states/loading.md)                               | not drawn    | Skeleton bands                                       |
| error                  | [`states/error.md`](states/error.md)                                   | not drawn    | "The day didn't load."                               |
| partial                | [`states/partial.md`](states/partial.md)                               | not drawn    | Region by region                                     |
| offline                | [`states/offline.md`](states/offline.md)                               | not drawn    | A StatusLine; the day from the phone                 |

## Platforms

Phone 402 drawn; no wide frame (D-USE-39: Schedule scales up from the wide frames with none of its own).

- **768 to 1023:** the phone layout with `BottomNav` [ASSUMPTION: as Now, Decided (D-USE-74); the rail starts at 1024, D-USE-65].
- **1024 and up:** a rail item ("Today", "Week", "Schedule", N6), never a side panel beside go mode (D-USE-39, note 56). The page is Review the day's 1440 column plus the rail ("Schedule is this column plus Now's rail, so it has no wide frame of its own", the Review the day 1440 note): one column capped at `--content-text` (720) and centred, 96 px an hour, the 56 px gutter holding the now tag (`../review-the-day/states/success.md` › At 1440). The Time lens's today is this tab (D-USE-55); desk Today's day column is this column smaller (N6). Decided (D-USE-77): What a click on a block does at the desk. Default: the right-hand Block panel, as the day column's blocks (N6, D-USE-41, D-USE-74).

## Interactions opened here

None of its own. Block view: `../block-view/index.md`. A meeting inside a block: [`../../dev-notes/meeting-inside-a-work-block.md`](../../dev-notes/meeting-inside-a-work-block.md).

## Decisions and open items

- D-USE-23, 26, 28, 30, 38, 39, 49, 55, 72, 74 rule this surface; each state names its own.
- Verdigris marks this moment only (D-P02): the now line, the active block's edge, the running dot. Firing is rust on grey, never verdigris (D-USE-49).
- The flat file's "Not in N5's numbered order; drawn when the canvas reaches it [NEEDS DECISION]: default, with Now (step 5)" is superseded: the boards drew Schedule at step 8 (the row label).
- Decided (D-USE-77): The built Schedule's ghosts, "moved" violet border, shift bands and the axis's _earlier_ / _later_ (imported SC-01, `docs/decisions/imported/ux/epic2_in_use_ux_architecture.md` §5) are not drawn on the USE boards. Default: they stay as built, violet never a fill (D-USE-38).
- Decided (D-USE-77): Schedule before Ready, go (the tab is there; Review the day holds the job). Default: the same column without the active edge.
