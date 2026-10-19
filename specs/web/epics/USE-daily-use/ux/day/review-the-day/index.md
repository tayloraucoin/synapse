---
target: specs/web/ux/day/review-the-day/index.md
status: approved
promoted:
design:
  file: "Synapse, 01M49AX02VV4SSBKNCN6NRTS6Y"
  pages: ["USE — daily use"]
  rows:
    [
      "USE — daily use · Row label · Review the day",
      "USE — daily use · Row label · Review the day (cont.)",
      "USE — daily use · Row label · Archive 1",
      "USE — daily use · Row label · Archive 3",
    ]
  locked: 2026-10-10
---

# Review the day — day

Sources: N3 "Review the day", N1 step table, N5 (the step 2 variation), notes 18, 20–27, 38, 48, refinement 2; the rows "Row label · Review the day" (p-3-0, y 3900) and "(cont.)" (y 5160); coverage [`../../boards/use-daily-use/review-the-day.md`](../../boards/use-daily-use/review-the-day.md), [`review-the-day-cont.md`](../../boards/use-daily-use/review-the-day-cont.md). The intent-pass flat file is folded in here. Words, access, instrumentation and criteria: [`words-and-access.md`](words-and-access.md).

## Job

"Here's my day ahead, be able to swap anything out" (note 38): see today as already written in, adjust in place in a tap or two, and lock it with Ready, go. The few minutes go to judgement, not data entry. Done is Ready, go. Stories: a gym day that feels like yoga, the workout swapped in two taps (note 18; [`states/after-swap-undo.md`](states/after-swap-undo.md)); Thursday's dentist, slotted on Sunday, with a Secondary moved after it (N3).

## Entry and exit

- **Entry:** "Review the day" on Orient (D-USE-5); a later open the same morning before Ready, go (the entry tree; `../orient/states/skipped.md`); "Review the day" on Now before go. Route `/today/review` [PROPOSED] (`../overview.md`). Focused: no `AppHeader`, no `BottomNav`, no avatar.
- **At the desk** before Ready, go, `/today` is Review the day at 1440 (D-USE-65; `../../work/today/states/before-ready-go.md`).
- **Exit:** Ready, go opens the Ready, go welcome, then Now in go mode (`../../interactions/ready-go/index.md`, open-3); the `Breadcrumb` "‹ Orient" goes back (D-USE-10); a block opens its Block view (`../block-view/index.md`, breadcrumb "Today › Wellness"); an item bullet opens the Item sheet ([`../item-sheet/index.md`](../item-sheet/index.md)); the tray opens in place (`../todos/`); "Set Saturday" and "Open This week" go to Set my days (`../../set-my-days/set-my-days/index.md`). After Ready, go this screen is not reachable ([`states/after-ready-go.md`](states/after-ready-go.md)).

## Layout, top to bottom (phone 402)

Full detail, sizes and the drawing fixture: [`states/success.md`](states/success.md).

1. **Header:** `Breadcrumb` "‹ Orient" over the date title "Monday, 12 October" (D-USE-10; replaces N3's ghost "Back to Orient").
2. **To-dos tray**, closed, pinned under the header: "To-dos" and the first title, ellipsised (`../todos/`, cited, not carried).
3. **The day column:** `ScheduleAxis` at 96 px an hour (D-USE-23), about seven hours to a screen, scrolled so Orient sits at the top. Orient as a locked ink line ("Orient · 5 min"); blocks as `ScheduleBlock` grouping boxes with the [PROPOSED] bullet grid (two fixed cells a line, "+n more"); a Work block by tier; transitions as dashes in italics; meals as dashed bands with their glyph.
4. **The rail +** [PROPOSED] in the time gutter, with its up and down marks (D-USE-15, D-USE-18): [`../../interactions/add-from-the-rail/index.md`](../../interactions/add-from-the-rail/index.md).
5. **Ready, go:** the primary `Button`, full width, ink, above the safe area, floating on a fade with any Toaster above it (D-USE-25).

New components to Plumb: listed in [`states/success.md`](states/success.md) (open-1, "To Plumb").

## Primary action

Ready, go: it locks the review only; everything stays editable after. At the desk it sits at the column's foot, right-aligned, a fixed 240 wide (D-USE-39).

## States

| State                    | File                                                                             | Widths drawn | One line                                         |
| ------------------------ | -------------------------------------------------------------------------------- | ------------ | ------------------------------------------------ |
| success: a usual morning | [`states/success.md`](states/success.md)                                         | 402, 1440    | The board's frame at full detail                 |
| first mornings           | [`states/first-mornings.md`](states/first-mornings.md)                           | 402          | The one-time hint beside the rail +              |
| first change             | [`states/first-edit.md`](states/first-edit.md)                                   | 402          | "Changes apply to today…", once                  |
| after a swap, Undo       | [`states/after-swap-undo.md`](states/after-swap-undo.md)                         | 402          | The Item sheet's Swap landing, with Undo         |
| tray open                | [`states/tray-open.md`](states/tray-open.md)                                     | 402          | The tray pushes the column down                  |
| woke late                | [`states/late.md`](states/late.md)                                               | 402          | Passed blocks fold into "Planned before 8:10"    |
| passed open              | [`states/late-passed-open.md`](states/late-passed-open.md)                       | 402          | Move later or Leave per passed block             |
| no work slotted          | [`states/no-work.md`](states/no-work.md)                                         | 402          | Add to Primary, Add to Secondary, Open This week |
| Add to Primary           | [`states/no-work-add-to-primary.md`](states/no-work-add-to-primary.md)           | 402          | The add sheet preset to the tier                 |
| Open This week           | [`states/no-work-open-this-week.md`](states/no-work-open-this-week.md)           | 402          | Where the link lands, low detail                 |
| Sunday, nothing set      | [`states/sunday-nothing-set.md`](states/sunday-nothing-set.md)                   | 402          | Make a checklist, Plan with blocks               |
| making the checklist     | [`states/sunday-making-the-checklist.md`](states/sunday-making-the-checklist.md) | 402          | Return adds the next row                         |
| checklist beside plans   | [`states/sunday-checklist-and-plans.md`](states/sunday-checklist-and-plans.md)   | 402          | The All day strip above the rail                 |
| the now-line             | [`states/sunday-now-line.md`](states/sunday-now-line.md)                         | 402          | A verdigris time tag in the rail                 |
| empty: no default        | [`states/empty.md`](states/empty.md)                                             | 402          | Superseded by the Sunday frame (D-USE-68)        |
| loading                  | [`states/loading.md`](states/loading.md)                                         | 402          | Skeleton bands; "Loading the day"                |
| error                    | [`states/error.md`](states/error.md)                                             | 402          | `RegionRetry`; Ready, go hidden                  |
| offline                  | [`states/offline.md`](states/offline.md)                                         | 402          | From cache, editable, one status line            |
| partial                  | [`states/partial.md`](states/partial.md)                                         | not drawn    | Decided (D-USE-69)                               |
| after Ready, go          | [`states/after-ready-go.md`](states/after-ready-go.md)                           | not drawn    | Not reachable; Schedule takes the job            |

## Platforms

Phone 402 for every state; one wide frame, success at 1440 (D-USE-39): focused at every width, no rail and no tabs, one centred column capped at `--content-text`, Ready, go right-aligned; the full list of what it settles is in [`states/success.md`](states/success.md) › At 1440. Every other state scales up from it with no wide frame of its own; sheets (add, Make room, A later start) open in `ResponsiveSheet`'s right panel at `--sheet-w` (D-USE-39). The desk switches at 1024 (D-USE-65).

## Interactions opened here

- Add from the rail and the add sheet: [`../../interactions/add-from-the-rail/index.md`](../../interactions/add-from-the-rail/index.md) (the work "+ Add" is a different entry: [`../../interactions/add/index.md`](../../interactions/add/index.md)).
- Make room: [`../../interactions/make-room/index.md`](../../interactions/make-room/index.md). A later start: [`../../interactions/later-start/index.md`](../../interactions/later-start/index.md). One engine serves both.
- Swap and the rest of the Item sheet: [`../item-sheet/index.md`](../item-sheet/index.md); Move to: [`../../interactions/move-to/index.md`](../../interactions/move-to/index.md).
- The whole loop: [`../../interactions/first-wake-loop.md`](../../interactions/first-wake-loop.md).

## Decisions and open items

D-USE-2, 4, 5, 7, 8, 10, 11, 15–19, 22, 23, 25, 28, 30, 39, 60, 65 rule this surface; each state names its own. Adjusting in place, and what a change here touches: [`states/first-edit.md`](states/first-edit.md). Physio is a Training block (D-USE-4).
