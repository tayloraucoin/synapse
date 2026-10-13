---
target: specs/web/ux/work/today/index.md
status: approved
promoted:
design:
  file: "Synapse, 01M49AX02VV4SSBKNCN6NRTS6Y"
  pages: ["USE — work"]
  rows:
    [
      "USE — work · Today at a desk",
      "USE — work · Today, edges",
      "USE — work · Phone, Today",
    ]
  locked: 2026-10-10 (desk, D-USE-49); 2026-10-12 (phone, D-USE-58)
---

# Today — work

## Job

Answer at a glance what is Taylor's to do right now while AI threads run: the day's tiers, the to-dos and what is firing, with one item in hand at a time (N6, D-USE-43). Done is each item checked; a Linear-linked item moves its issue to Done (N4).

## Entry and exit

- **Desk:** rail "Today" (`/today`); opens first (D-USE-40). Out: rail Week, Schedule; a week-strip day; a block in the day column (Block panel, [`../block-panel/`](../block-panel/index.md)); a row opens the Item sheet (`../../day/item-sheet/`). Another date: a day head's › on the Week, or Open day in the Block panel ([opened-day](states/opened-day.md)).
- **Phone:** Now while a Work block is active (D-USE-50). Out: Schedule, Review tabs; a row tap opens the Item sheet; long-press opens the work menu ([work-menu](states/work-menu.md)); + opens Add.

## Layout, top to bottom

**Desk (1728, after the 220 px rail):** the content (1108 px) is centred right of the rail.

1. **Week strip** (desk-only, D-USE-55): seven day cards Mon to Sun; today's is outlined in ink with "today"; each card shows up to two lines (a work item with its tier square and "2/3" for a session, an event with a plum dot and its time) or "Nothing slotted yet", "No work", "Sunday reset".
2. **Main column** (720 px, `--content-text`): the header, "Monday, 12 October" in the display face, then right-aligned the time ("10:20"), **Step away** (only while a work timer runs, D-USE-46) and **+ Add ⌄** ([add](../../interactions/add/index.md)); the current block as a band in its colour ("Work 9:30 to 12:00 · Kestrel weekly at 11:00, in 40 min"); the **Next strip** (desk-only): "NEXT", emoji, title, the tier word, **Go ↵**; the tiers as `GroupHeading`s with their colour square, Urgent only when it holds something, then Primary, Secondary, Stretch (D-USE-38); **To-dos** as an open section under a rule (N6).
3. **Day column** (340 px, 48 px gap): "The day" with "whole day, then 8:00 to 18:00"; a day bar from 7:00 to "Lights out 22:30" with "Work ends 17:00" and a now mark; the hours 8:00 to 18:00 with each block in its colour, events in plum inside (N6, D-USE-41), the `NowLine` in verdigris.

**Phone (402):** `AppHeader` "Now" with + (Add) and the avatar; the To-dos tray line ("To-dos Call the mechanic… ⌄"); the Work block's `BlockHeader` (colour bar, "Work", "9:30 to 12:00 · Kestrel weekly at 11:00", ···, and the Step away pill beside ··· while a timer runs, D-USE-52); the tiers; `BottomNav` Now, Schedule, Review.

**A work row** (both widths): a 44 × 44 lead slot with the 10 px ring (or the firing mark, or the done mark); the project emoji in its own 18 px slot, 7 px gap (D-USE-48); the title; the meta line; on the right the length range ("30 to 60 min") or the firing time. Desk meta: client tile and name · project emoji and name · ID · priority chip (Urgent red, High yellow, Normal blue, Low grey, glyph always with it, D-USE-42) · size chip ("3 Medium") · label chips in Linear's colours · "session 1 of 3"; "No Linear" on a Synapse-only item. Phone meta trims to client tile, project emoji, ID, priority chip, size chip (D-USE-51). Sub-issues: desk shows them as checkboxes under the issue; phone folds them as "› 2 sub-issues · 1 done" (D-USE-51). Hover on any row shades it `--color-surface` (D-USE-49).

**Next** (D-USE-45, D-USE-49): order only, Urgent, Primary, Secondary, Stretch, then tier order; the first item neither firing nor done. Nothing in hand: Next lifts as the card (shaded `--color-surface`, no border, 22 px emoji, 17 px title, **Start** and **Done** at fixed width). Something running: the running card holds the lift (verdigris edge) and Next is a shaded row. The phone never pins Next (D-USE-61).

## Primary action

Done: on the lifted card or the running card, right-most, ink fill, at both widths.

## States

| State                              | File                                               | Widths drawn | One line                                                 |
| ---------------------------------- | -------------------------------------------------- | ------------ | -------------------------------------------------------- |
| working                            | `states/working.md`                                | 1728, 402    | One firing in place; Next lifted                         |
| running                            | `states/running.md`                                | 1728, 402    | The running card, WORK TIME                              |
| prompt sent                        | `states/prompt-sent.md`                            | 1728, 402    | Two firing; Next lifts                                   |
| brought back                       | `states/brought-back.md`                           | 1728, 402    | Back in place; the Done record                           |
| stepped away                       | `states/stepped-away.md`                           | 1728, 402    | The bar with Resume all                                  |
| nothing planned                    | `states/nothing-planned.md`                        | 1728, 402    | Docked pool; the start card                              |
| thumb firing                       | `states/thumb-firing.md`                           | 402          | Swipe right, ring 44, hint                               |
| everything firing                  | `states/everything-firing.md`                      | 402          | "Everything is firing."                                  |
| no work slotted                    | `states/no-work-slotted.md`                        | 402          | Add rows; Plan the week                                  |
| offline                            | `states/offline.md`                                | 402          | StatusLine; all works                                    |
| Linear failed                      | `states/linear-failed.md`                          | 402          | "Not updated in Linear."                                 |
| Linear updating                    | `states/linear-updating.md`                        | 402          | Spinner line; closed in Linear                           |
| paused                             | `states/paused.md`                                 | 402          | One item held                                            |
| over the range                     | `states/over-the-range.md`                         | 402          | "12 min over"                                            |
| work menu                          | `states/work-menu.md`                              | 402          | Long-press menu                                          |
| done for today                     | `states/done-for-today.md`                         | 402          | A session's Done, Undo                                   |
| loading                            | `states/loading.md`                                | 402          | Skeleton rows                                            |
| error                              | `states/error.md`                                  | 402          | "Today didn't load."                                     |
| only Primary                       | `states/primary-only.md`                           | 402          | Secondary, Stretch fold; "+ Add" on each                 |
| past a cap                         | `states/past-a-cap.md`                             | 402          | "Two is the usual for Primary."                          |
| Urgent above Primary               | `states/urgent-above-primary.md`                   | 402          | Urgent takes the lifted card                             |
| later work block                   | `states/later-work-block.md`                       | 402          | Only what is still open; a quiet line                    |
| meeting coming up                  | `states/meeting-coming-up.md`                      | 402          | A band in the flow; "would end … past"                   |
| meeting lifted                     | `states/meeting-lifted.md`                         | 402          | Under "At 11:00", ahead of the tiers                     |
| opened day                         | `states/opened-day.md`                             | 1728         | Another date, planning: ‹ Week, no firing, Start or Done |
| waiting                            | `states/waiting.md`                                | 402          | Blocked, Paused, In review gather under Waiting          |
| before Ready, go; not a work block | `states/before-ready-go.md`, `not-a-work-block.md` | none         | Intent states, not drawn                                 |

## Platforms

Desk 1728 and phone 402 drawn. Desk-only: week strip, day column, Next strip with Go, keys, the tab title "Next: … — Synapse" (D-USE-43, D-USE-55). Phone-only: swipe to fire, long-press menu (desk: right-click, a `ContextMenu`, see [work-menu](states/work-menu.md), D-USE-65). 1024 and 1440: the breakpoint in [`../overview.md`](../overview.md).

## Interactions opened here

[firing](../../interactions/firing.md) · [step-away](../../interactions/step-away.md) · [start-while-one-runs](../../interactions/start-while-one-runs.md) · [add](../../interactions/add/index.md) · [sessions](../../interactions/sessions.md) · Item sheet (`../../day/item-sheet/`; while firing: `states/while-firing.md` there). A meeting inside the block: [dev note](../../dev-notes/meeting-inside-a-work-block.md).

## Words, access, instrumentation, criteria

In [`words-and-access.md`](words-and-access.md).
