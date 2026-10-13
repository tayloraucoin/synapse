---
target: specs/web/ux/day/now/index.md
status: approved
promoted:
design:
  file: "Synapse, 01M49AX02VV4SSBKNCN6NRTS6Y"
  pages: ["USE — daily use"]
  rows:
    [
      "USE — daily use · Row label · Now",
      "USE — daily use · Row label · Now (cont.)",
      "USE — daily use · Row label · Archive 1",
    ]
  locked: 2026-10-12
---

# Now — day

Sources: N4 "Now", notes 37, 49, 52, 55–57, 60, 65, rounds 9 and 10, refinements 8 and 10; the rows "Row label · Now" (p-3-0, y 10200) and "(cont.)" (y 11460); coverage [`../../boards/use-daily-use/now.md`](../../boards/use-daily-use/now.md), [`now-cont.md`](../../boards/use-daily-use/now-cont.md). The intent-pass flat file is folded in here. Words, access, instrumentation and criteria: [`words-and-access.md`](words-and-access.md).

## Job

"Here's your current thing that you're actively on" (note 52): the active block only, the current item lifted, and the reward is the check itself, quiet, immediate, felt (note 37). No count of what is left; the block's span is the only measure. Done is the item checked and the next one lifted. N4's two stories sit in [`states/done-next-lifts.md`](states/done-next-lifts.md) and [`states/header-menu.md`](states/header-menu.md).

## Entry and exit

- **Entry:** Ready, go, through the welcome (D-USE-71; [`../../interactions/ready-go/index.md`](../../interactions/ready-go/index.md)); the List tab, which reads Now while the day is live (D-USE-5); a to-do reminder, the tray open on it (`../todos/states/from-a-reminder.md`); Do now on Block complete's not-done list, which reopens the block here with the item lifted and, past the block's end, extends it while the day slides (Make room's engine). Decided (D-USE-72) (`../block-complete/index.md`, [`../../interactions/make-room/index.md`](../../interactions/make-room/index.md)). Route `/today`, one route at both widths (`../../work/overview.md`).
- **Exit:** Start turns the card into Running (`../running/index.md`); the last item done gives the all-done footer, or Block complete for the not-done case (D-USE-28; `../block-complete/index.md`); "See the whole day" opens Schedule ([`../schedule/index.md`](../schedule/index.md)); "Edit block" opens the Block view editing (`../block-view/index.md`); Swap or Edit opens the Item sheet (`../item-sheet/index.md`); Not today takes the item off today (D-USE-70). The tabs stay.

## Layout, top to bottom (phone 402)

Full detail and the fixture: [`states/success.md`](states/success.md).

1. **`AppHeader`** "Now" with the avatar ("T"); + (Add) shows here on every block (D-USE-74; [`states/success.md`](states/success.md)).
2. **To-dos tray**, closed (D-USE-26): "To-dos" and the first title, ellipsised (`../todos/`, cited, not carried).
3. **`BlockHeader`:** the kind's 3 px colour bar (a meal takes its glyph), the name in `--text-title`, the span under it ("7:05 to 8:00"), and a round ··· alone at the trailing edge (D-USE-26).
4. **The block's items in order:** done rows faded and live; the current item lifted in a `Card` (no shadow, hairline): a 40 px `ItemIcon` on the kind's chip fill, a verdigris dot, the name in `heading`, "10 min · 7:10", then Start (secondary, outlined) and Done (primary, ink) side by side; the rest as `ItemRow`s with a `Checkbox`, the length, and a grip on every undone row (D-USE-17). Transitions sit in the flow as slim bands (note 57).
5. **`BottomNav`** Now, Schedule, Review (reads List before Ready, go, D-USE-5).

## Primary action

Done, on the lifted card (Start, a row tap, a row's box, long-press and ··· are secondary). When the block is all done, the footer's "Start <next block>" takes its place, on the fade (D-USE-25, D-USE-28).

## States

| State | File | Widths drawn | One line |
| --- | --- | --- | --- |
| before Ready, go | [`states/before-ready-go.md`](states/before-ready-go.md) | 402 | The List as it is, Review the day |
| current item | [`states/success.md`](states/success.md) | 402 | Wellness, Meditate lifted |
| Done, next lifts | [`states/done-next-lifts.md`](states/done-next-lifts.md) | 402 | "Took 10 min · Change"; Cold bath lifts |
| a row tapped | [`states/row-tapped.md`](states/row-tapped.md) | 402 | Cold bath made current |
| row long-press | [`states/row-long-press.md`](states/row-long-press.md) | 402 | Swap, Edit, Move up, Move down, Not today |
| header menu | [`states/header-menu.md`](states/header-menu.md) | 402 | "Wellness, today" |
| reordering | [`states/reordering.md`](states/reordering.md) | 402 | Dropped above the card: next up |
| all done, start next | [`states/all-done-start-next.md`](states/all-done-start-next.md) | 402 | "Wellness complete", Start Training |
| all done, add more | [`states/all-done-add-more.md`](states/all-done-add-more.md) | 402 | "Add to Wellness", "Free until 8:00" |
| ahead of the plan | [`states/ahead.md`](states/ahead.md) | 402 | "Starting early is fine" |
| behind the plan | [`states/behind.md`](states/behind.md) | 402 | "Planned to end at 8:00" |
| between blocks | [`states/transition.md`](states/transition.md) | 402 | Breakfast alone, full-width Done |
| Checklist block | [`states/checklist-block.md`](states/checklist-block.md) | 402 | Boxes and grips, no card |
| Sunday's checklist | [`states/sunday-checklist.md`](states/sunday-checklist.md) | 402 | Now is the checklist |
| meal, pick a topic | [`states/meal-pick-topic.md`](states/meal-pick-topic.md) | 402 | Row 2's |
| meal, topic picked | [`states/meal-topic-picked.md`](states/meal-topic-picked.md) | 402 | Row 2's |
| Meal topics sheet | [`../../interactions/meal-topics.md`](../../interactions/meal-topics.md) | 402 | Row 2's |
| empty Break | [`states/empty-break.md`](states/empty-break.md) | 402 | Row 2's |
| a To-dos block | [`states/todos-block.md`](states/todos-block.md) | 402 | Row 2's |
| no blocks left | [`states/empty-no-blocks.md`](states/empty-no-blocks.md) | 402 | Row 2's |
| offline | [`states/offline.md`](states/offline.md) | 402 | Row 2's |
| error on check | [`states/error-on-check.md`](states/error-on-check.md) | 402 | Row 2's |
| loading | [`states/loading.md`](states/loading.md) | not drawn | Skeleton rows (D-USE-74) |
| partial | [`states/partial.md`](states/partial.md) | not drawn | Region by region (D-USE-74) |

Running items on Now (the running card, rows under "Running"): `../running/index.md` (D-USE-27). The Work block on Now is phone Today: `../../work/today/index.md` (D-USE-50).

## Platforms

Phone 402 drawn for every state; no wide frame on these rows.

- **Below 1024:** the phone layout. D-USE-39's work frame note scales go mode up from 768 (one column capped at `--content-text`, centred; Start and Done a fixed 160, right-aligned) and says Now's other blocks follow it unchanged. Decided (D-USE-74): 768 to 1023 keeps `BottomNav`, since the desk layout and its rail start at 1024 (D-USE-65).
- **1024 and above:** `/today` is the desk Today (D-USE-40, D-USE-65; `../../work/today/index.md`). Before Ready, go it is Review the day at 1440 (`../../work/today/states/before-ready-go.md`); outside a Work block the band names the current block and the tiers stay, quieter (`../../work/today/states/not-a-work-block.md`). Decided (D-USE-74): a non-work block's items are checked at the desk in its Block panel, opened from the band or the day column (`../../work/today/index.md`).

## Interactions opened here

Item sheet (Swap, Edit): `../item-sheet/index.md`. Move to: [`../../interactions/move-to/index.md`](../../interactions/move-to/index.md). Make room (Do now past the end): [`../../interactions/make-room/index.md`](../../interactions/make-room/index.md). The tray: `../todos/`. The loop: [`../../interactions/first-wake-loop.md`](../../interactions/first-wake-loop.md).

## Decisions and open items

D-USE-5, 7, 13, 17, 24–30, 39, 40, 50, 65, 70, 71, 72 rule this surface; each state names its own. Variation A (lifted card, tray closed) picked over B to D (D-USE-26; `../../boards/use-daily-use/archive-1.md`). Order is a plan, not a rule (note 60).
