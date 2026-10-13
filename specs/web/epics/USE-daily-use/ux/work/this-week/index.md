---
target: specs/web/ux/work/this-week/index.md
status: approved
promoted:
design:
  file: "Synapse, 01M49AX02VV4SSBKNCN6NRTS6Y"
  pages: ["USE — work"]
  rows: ["USE — work · Row label · Phone, editing and This week"]
  locked: 2026-10-12 (phone, D-USE-58)
---

# This week on the phone — work

Handoff pass, the ledger of the boards (thread 8). The row "Row label · Phone, editing and This week" (p-6-0, y 7200; its label in full: `../../refs/paper-map/p-6-0-notes.md`). Sources: N6 "The phone" and "Week (Plan week)", N2 "This week", D-USE-50, D-USE-54 to D-USE-58. The pool sheet's anatomy: [`pool-sheet-anatomy.md`](pool-sheet-anatomy.md). Words, access, instrumentation, criteria: [`words-and-access.md`](words-and-access.md).

## Job

Plan the week's work on the phone, one day at a time: put work from the pool on a day's tiers, see where that day's work ends, and bring in Linear issues, without the desk's two-pane Week (D-USE-55). Done is a week whose days hold what Taylor means to do, each day's fit read as a length, never a count (N6).

## Entry and exit

- **In:** Set my days › This week, then a day (the push of [`../../set-my-days/set-my-days/index.md`](../../set-my-days/set-my-days/index.md): the week, then a day from its list or a chip); "Plan the week" on Today's no-work-slotted ([`../today/states/no-work-slotted.md`](../today/states/no-work-slotted.md)); "Open This week" on Review the day (`../../day/review-the-day/states/no-work-open-this-week.md`); **Open the pool** on Today's nothing-planned opens the pool sheet straight away ([`../today/states/nothing-planned.md`](../today/states/nothing-planned.md)) [ASSUMPTION: over Now, with the place sheet set to today].
- **Out:** "‹ Week" back to the week list; the day chips move sideways; a row opens the Item sheet (`../../day/item-sheet/`); a Work block's header opens its Block view in editing ([`../../day/block-view/states/work-tiers.md`](../../day/block-view/states/work-tiers.md)) [ASSUMPTION: the header; the frame opens the tiers in place]; a non-work block opens its Block view; **Pool** opens the pool sheet; the + opens Set my days' + menu ([`../../set-my-days/set-my-days/states/plus-menu.md`](../../set-my-days/set-my-days/states/plus-menu.md)) [ASSUMPTION: the strip says only "the +"; Add's four choices open from Now's header, [`../../interactions/add/index.md`](../../interactions/add/index.md)].

## Layout, top to bottom (402)

Drawn on [`states/the-day.md`](states/the-day.md) (`this-week / the day, work tiers, Pool entry / 402 / light`):

1. **Status bar** (21:14).
2. **Header** (20 px sides, 6 top, 10 bottom): `Breadcrumb` "‹ Week" (body) over the day as the title, "Tuesday, 13 October" (title, semibold, title tracking); `SaveStatus` "✓ Saved" (label, muted) at the right, on the title's baseline.
3. **`WeekdayChips`, dated** (48 × `--size-target`, radius `--radius-control`, 4 px gaps, 12 px below): "M 12" … "S 18"; the open day filled `--color-primary` with semibold `--color-primary-foreground` words; the others a `--color-border` hairline; Saturday and Sunday words in `--color-disabled-foreground`.
4. **The day**, blocks in time order, 6 px apart: a meal as a 40 px dashed band ("Breakfast" semibold 14/20, "9:00 to 9:30" muted label); **the Work block open to its tiers** (sky chip fill, a 3 px `category-sky-dot` left edge, 12 × 14 padding): "Work" (heading) "9:30 to 12:00"; each tier a 7 px square in its colour and its word (label, muted); rows in body with the emoji first; the session mark (a 12 px link glyph and "2 of 3", caption, muted) or the due words ("due Wed") at the right; an empty tier's "+ Add to Stretch" (14/20, muted); a `category-sky-dot` rule, then the fit line (label, medium, ink). An event as a 40 px plum band ("15:30 [Dentist]").
5. **The foot** (absolute, 20 px sides, top 770): **Pool** at the left (a 52 px pill, `--color-primary`, a 16 px layers glyph and "Pool" semibold) and the + at the right (a `--size-row` circle, `--color-primary`, an 18 px plus).

Decided (D-USE-107): the frame draws the day short: no `ScheduleAxis`, no Orient line, no bounds row, blocks as rows rather than at 96 px an hour, the work tiers open inside the Work block. Ruled: the build keeps Set my days' day column ([`../../set-my-days/set-my-days/states/the-day.md`](../../set-my-days/set-my-days/states/the-day.md)) and adds this frame's work parts: the Work block's tiers in place, the session marks, the due words, the fit line and Pool beside the +.

## Primary action

**Pool**, then **Place** on a row: tap to place (A, picked, D-USE-54, D-USE-58), the phone's stand-in for drag. Pool sits at the foot's left, the + at its right, both in thumb reach.

## States

| State                      | File                             | Widths | One line                                        |
| -------------------------- | -------------------------------- | ------ | ----------------------------------------------- |
| the day, Pool entry        | `states/the-day.md`              | 402    | Tiers, session marks, due words, fit line, Pool |
| client filter              | `states/client-filter.md`        | 402    | All clients, then each in Settings order        |
| From Linear, connected     | `states/linear-connected.md`     | 402    | Grouped by client; two filters on; Sync now     |
| From Linear, not connected | `states/linear-not-connected.md` | 402    | Connect Linear; to Settings › Connections       |
| pool empty                 | `states/pool-empty.md`           | 402    | Under the title; From Linear and New task       |
| pool search                | `states/pool-search.md`          | 402    | Full height; both tabs; where each lives        |
| clients off                | `states/clients-off.md`          | none   | No client heads; no client filter               |
| no Work block              | `states/no-work-block.md`        | none   | Pool still opens; Place lists no tier           |
| past day                   | `states/past-day.md`             | none   | Faded, still editable, nothing missed           |
| loading                    | `states/loading.md`              | none   | Still skeleton rows                             |
| error                      | `states/error.md`                | none   | RegionRetry, Try again                          |
| offline                    | `states/offline.md`              | none   | StatusLine; placing works, Linear waits         |

The pool sheet's default (Pool tab) is `this-week / A: pool sheet, tap to place, rec. / 402 / light`, carried by [`../../interactions/place-from-the-pool/states/pool-sheet.md`](../../interactions/place-from-the-pool/states/pool-sheet.md).

## Platforms

- **402, phone; below 1024** (D-USE-93): this surface. Light only; dark comes with the build's theme pass (D-USE-58).
- **1024 and up:** the desk's answer is the Week ([`../week/index.md`](../week/index.md)): two panes, the pool docked, drag in place of Place (D-USE-55; "Dev note · What stays at the desk, and the phone's answer", [`../../dev-notes/what-stays-at-the-desk.md`](../../dev-notes/what-stays-at-the-desk.md)). Set my days still shows list-detail at 1024 (D-USE-39 (3), D-USE-83). Decided (D-USE-108 (3)): its day pane keeps Pool; the pool sheet and the place sheet open as `ResponsiveSheet`'s right-side panel at `--sheet-w` (D-USE-39, "every sheet scales up"; D-USE-103's form), since the day pane is the phone's day component.

## Interactions opened here

[place-from-the-pool](../../interactions/place-from-the-pool/index.md) (Pool, Place, the place sheet, Placed with Undo, doesn't fit) · [spread](../../interactions/spread/index.md) (from doesn't fit, or a row's "Spread across the week") · [add](../../interactions/add/index.md) (New task from the pool, saved to the pool) · [sessions](../../interactions/sessions.md) (the "2 of 3" marks; this session or all) · the Item sheet (`../../day/item-sheet/`) · the client filter, ordered as Settings › Connections › Clients ([`../../account/settings/states/clients-on.md`](../../account/settings/states/clients-on.md), D-USE-96) · Settings › Connections ([`../../account/settings/states/connections.md`](../../account/settings/states/connections.md)).

## Decisions and open items

D-USE-40, 42, 50, 54 to 58, 82, 93, 96, 98, 103, 107, 108. The two raised here are decided (D-USE-107, D-USE-108).
