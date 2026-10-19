---
target: specs/web/ux/set-my-days/set-my-days/index.md
status: approved
promoted:
design:
  file: "Synapse, 01M49AX02VV4SSBKNCN6NRTS6Y"
  pages: ["USE — set up"]
  rows:
    [
      "USE — set up · Row label · Set my days",
      "USE — set up · Row label · Set my days (cont.)",
      "USE — set up · Row label · Set my days (cont. 2)",
      "USE — set up · Row label · Set my days, first week",
    ]
  locked: 2026-10-10
---

# Set my days — set-my-days

Sources: N2 "Set my days"; notes 32–33, 75–89; refinements 2, 10; step 9 rounds 1 to 4 (D-USE-32, D-USE-33) and the Life and To-dos rounds; the rows "Row label · Set my days" (p-4-0, y 0), "(cont.)" (y 1260) and "(cont. 2)" (y 2520); coverage `../../boards/use-set-up/set-my-days.md`, `set-my-days-cont.md`, `set-my-days-cont-2.md`. The intent-pass flat file is folded in here. Words, access, instrumentation and criteria: [`words-and-access.md`](words-and-access.md).

## Job

Build each weekday's default once and edit it now and then (Usual week); each week, slot work by tier into the dated days and add the week's events (This week). Done is a day that reads like the planner's week page: Orient, then the blocks at their true times. Stories (N2): Tuesday done in ten seconds by "Copy from Monday"; Wednesday's gym swapped for abs and yoga without touching Monday; Sunday night, the week's Primary work slotted and Thursday's dentist added without touching Wellness.

## Entry and exit

- **Entry:** "Set my days" in the avatar menu on any tab ([`../../account/avatar-menu/index.md`](../../account/avatar-menu/index.md)); "Set Saturday" and "Open This week" on Review the day (`../../day/review-the-day/states/empty.md`, `../../day/review-the-day/states/no-work-open-this-week.md`). It opens on **the week** ([`states/the-week.md`](states/the-week.md), B) and a day opens from it ([`states/the-day.md`](states/the-day.md), A): this bends N2's "opens on today's weekday" (open-3 round 2; D-USE-49 (the lock)). This week is the default from Sunday evening onward [ASSUMPTION, from N2].
- **Exit:** the `Breadcrumb` [PROPOSED] "‹ Now" on the week goes back to the tab it was opened from [ASSUMPTION: the crumb names that tab; every frame draws "Now"]; "‹ Week" on a day goes back to the week. The URL: [`layout.md`](layout.md). A block opens its Block view in editing ([`../../day/block-view/index.md`](../../day/block-view/index.md), breadcrumb "‹ Monday › Wellness"); in This week a Work block opens on its tiers with an add row each. Edits save as made; there is no Save button.

## Layout, top to bottom (phone 402)

Status bar; the header (`Breadcrumb` over the title, `SaveStatus`); the which-week `SegmentedControl`; then on the week the stepper and the seven-day list with its strips, or on a day the `WeekdayChips`, the day line with the bounds and the ···, and the day column (`ScheduleAxis` at 96 px an hour, Orient, `ScheduleBlock`s, `BlockBand`s); the + [PROPOSED]. Each region, its sizes and the kind colours: [`layout.md`](layout.md).

## Primary action

Adding a block: tap an empty time on the rail ([`states/tap-a-time.md`](states/tap-a-time.md)) or the +. At 1024 the + sits at the day pane's foot.

## States

| State                          | File                                                                   | Widths    | One line                                        |
| ------------------------------ | ---------------------------------------------------------------------- | --------- | ----------------------------------------------- |
| empty, first day               | [`states/empty-first-day.md`](states/empty-first-day.md)               | 402       | The two fields and "Set Monday, 7:00 to 22:30"  |
| unset day, copy first          | [`states/unset-day-copy.md`](states/unset-day-copy.md)                 | 402       | "Copy from Monday" above the fields             |
| first day set                  | [`states/first-day-set.md`](states/first-day-set.md)                   | 402       | Orient, the first-block prompt, nothing to copy |
| time picker                    | [`states/time-picker.md`](states/time-picker.md)                       | 402, 1024 | 24-hour Hour and Minute lists; sheet, popover   |
| copy offer                     | [`states/copy-offer.md`](states/copy-offer.md)                         | 402       | Orient, then "Copy from Monday"                 |
| usual week                     | [`states/usual-week.md`](states/usual-week.md)                         | 402       | The week list; unset rows "Set day"             |
| usual Saturday                 | [`states/usual-saturday.md`](states/usual-saturday.md)                 | 402       | A To-dos block holds its rule                   |
| usual Thursday evening         | [`states/usual-thursday-evening.md`](states/usual-thursday-evening.md) | 402       | Life set, then Evening, open time between       |
| the week (B)                   | [`states/the-week.md`](states/the-week.md)                             | 402       | This week's list, "12 to 18 Oct"                |
| the day (A)                    | [`states/the-day.md`](states/the-day.md)                               | 402, 1024 | A dated day; list-detail at 1024                |
| item icons                     | [`states/item-icons.md`](states/item-icons.md)                         | 402       | Icons replace the bullets                       |
| empty day                      | [`states/empty-day.md`](states/empty-day.md)                           | 402       | An empty usual Thursday's offers                |
| the + menu                     | [`states/plus-menu.md`](states/plus-menu.md)                           | 402       | Block, Transition, Event, From a saved block    |
| day menu                       | [`states/day-menu.md`](states/day-menu.md)                             | 402       | Copy from…, Reset to usual, Clear this day      |
| add event                      | [`states/add-event.md`](states/add-event.md)                           | 402       | Its time decides where it sits                  |
| event inside Work              | [`states/event-inside-work.md`](states/event-inside-work.md)           | 402       | A plum band; items re-flow                      |
| Google events                  | [`states/google-events.md`](states/google-events.md)                   | 402       | Yes as a band, maybe dashed                     |
| event as its own block         | [`states/event-own-block.md`](states/event-own-block.md)               | 402       | Outside every block                             |
| tap a time                     | [`states/tap-a-time.md`](states/tap-a-time.md)                         | 402       | The New block sheet at that time                |
| out of bounds                  | [`states/out-of-bounds.md`](states/out-of-bounds.md)                   | 402       | Dashed edge, kept, not run                      |
| overlap                        | [`states/overlap.md`](states/overlap.md)                               | 402       | Side by side                                    |
| usual change reaches this week | [`states/usual-change-reaches.md`](states/usual-change-reaches.md)     | 402       | The change names its reach                      |
| a day's own change kept        | [`states/day-own-change.md`](states/day-own-change.md)                 | 402       | "This day only"                                 |
| saved                          | [`states/saved.md`](states/saved.md)                                   | 402       | The header's states                             |
| install offer, once            | [`states/install-offer.md`](states/install-offer.md)                   | 402       | "Synapse can go on the home screen." with How   |
| loading                        | [`states/loading.md`](states/loading.md)                               | 402       | Skeleton bands                                  |
| error                          | [`states/error.md`](states/error.md)                                   | 402       | "The day didn't load."                          |
| offline                        | [`states/offline.md`](states/offline.md)                               | 402       | Read-only day controls (D-USE-82)               |
| partial                        | —                                                                      | N/A       | One day is one read                             |

Copy from's picker, Replace and Undo are the flow `../../interactions/copy-from/index.md`. A Sunday of one checklist has no frame of its own: the week's Sunday row and `../../day/block-view/states/checklist-editing.md`.

## Platforms

- **402, phone:** the push: the week, then a day with "‹ Week" (every state above).
- **768 to 1023:** keeps the phone's push (D-USE-83).
- **1024 and wider:** list-detail, a fixed 320 week pane beside a flexible day pane, from `--breakpoint-split: 1024px`, which goes into `preset.css` with the build (D-USE-39 (3), D-USE-83; the same break as Today, D-USE-65). Drawn once, [`states/the-day.md`](states/the-day.md); every other state scales into its pane, and sheets open in `ResponsiveSheet`'s right panel at `--sheet-w` (D-USE-39).
- **Dark:** not drawn; it comes with the build's theme pass (D-USE-58).

## Interactions opened here

The New block sheet, This week's day, Copy from, From Linear, Block view, the item sheet, meal topics, the icon picker and the install offer: linked in [`words-and-access.md`](words-and-access.md).

## Decisions and open items

D-USE-1, 20, 32, 33, 34, 38, 39, 58, 79, 80 to 83 rule this surface; each state names its own.
