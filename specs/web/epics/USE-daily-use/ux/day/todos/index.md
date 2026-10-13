---
target: specs/web/ux/day/todos/index.md
status: approved
promoted:
design:
  file: "Synapse, 01M49AX02VV4SSBKNCN6NRTS6Y"
  pages: ["USE — daily use"]
  rows:
    - "USE — daily use · Row label · To-dos tray and reminder"
  locked: 2026-10-10 (D-USE-49)
---

# To-dos tray and reminder — day

Handoff pass, the ledger of the boards. Sources: N1 "To-do", N3 "To-dos tray", N4 "To-do reminder"; notes 46, 47, 69; round 14; D-USE-3, 7, 26, 39, 40, 56, 64. Every state is a file in `states/`. The To-do sheet a row opens is its own surface, [`../todo-sheet/`](../todo-sheet/index.md).

**Why three boards named `now / …` live here.** The tray has no screen of its own: it is drawn on Now ("Drawn on Now in step 5 round 1", the row label), so three of its four frames carry Now's surface name. They show the tray's states, not Now's, so this file carries them (boards row: `../../boards/use-daily-use/to-dos-tray-and-reminder.md`). Two more frames that show the tray belong to other surfaces and are cited, not carried: `review-day / tray-open / 402 / light` (Review the day, [`../review-the-day/states/tray-open.md`](../review-the-day/states/tray-open.md)) and `now / a To-dos block in go mode / 402 / light` (Now, area 3; "The tray shows what's left in To-dos").

## Job

Keep life errands with no place on the rail ("call the mechanic", note 46) beside the day, like the planner's to-do column (note 69), and remind at a set time in Taylor's own words. Done is a to-do checked whenever.

## Entry and exit

- **Entry:** pinned under the header on Review the day and on Now (closed by default, D-USE-26); a reminder notification opens Now with the tray open on that to-do (`states/from-a-reminder.md`); "Or a to-do until 8:00" on Now's `ahead of the plan` opens it (Open "Audit gaps", Now's).
- **Exit:** a row opens the To-do sheet (D-USE-3; `?sheet=todo&id=`); the header closes the tray; the screen beneath carries on.

## Layout, top to bottom

A `Collapsible` pinned under the screen's header, full width, hairlines above and below.

1. **Trigger row:** "To-dos" (semibold, small) on the left. Closed: the first to-do's title beside it, muted, ellipsised ("Call the mechanic…"), and a chevron down on the right. Open: "To-dos" alone and a chevron up. Never a count.
2. **Rows** (open only), each a `Checkbox`, the to-do's icon (line icon, muted, 20 px slot), the title, and on the right either a small bell glyph with the reminder time in `figure`, or "From <weekday>" muted for a carried to-do.
3. **`InlineAddRow`:** "+ Add a to-do", muted.

Open, the tray pushes the block down; nothing covers the day, and the block stays live (`states/open.md`).

## Primary action

None of its own; it sits under the screen's primary action (Now's Done, Review the day's Ready, go). Checking a to-do is the main move.

## States

| State            | File                        | Widths drawn | One line                                     |
| ---------------- | --------------------------- | ------------ | -------------------------------------------- |
| the notification | `states/notification.md`    | 402          | The to-do's words only                       |
| from a reminder  | `states/from-a-reminder.md` | 402          | Now, tray open on the reminded to-do, tinted |
| open             | `states/open.md`            | 402          | Rows, a carried to-do, the add row           |
| empty            | `states/empty.md`           | 402          | "Add a to-do" only; closed, "To-dos" alone   |
| closed           | `states/closed.md`          | —            | Drawn inside other surfaces' frames          |
| loading          | `states/loading.md`         | —            | Not drawn                                    |
| error            | `states/error.md`           | —            | Not drawn                                    |
| offline          | `states/offline.md`         | —            | Not drawn; checks save on the phone          |

Partial: N/A, one list. The screen's own partial (the block loads, the tray fails) is the tray's `error.md`.

## Platforms

Drawn at 402 only (phone, light). At the desk: on Review the day at 1440 the tray stays a disclosure, scaled up in the capped column (D-USE-39 (2): "a side pane was weighed and not taken"); Now at the desk scales up with it (D-USE-39 (1)). On the desk's Today, To-dos is an open section in the main column, not a tray (D-USE-40, N6; carried by `../../work/today/`). Dark comes with the build's theme pass (D-USE-58).

## Interactions opened here

- A row opens the To-do sheet, [`../todo-sheet/`](../todo-sheet/index.md).
- "+ Add" › To-do on the work screens, [`../../interactions/add/index.md`](../../interactions/add/index.md) (step 2c).

Words, access, instrumentation, criteria and decisions: [`words-and-access.md`](words-and-access.md).
