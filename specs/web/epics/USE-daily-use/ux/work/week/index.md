---
target: specs/web/ux/work/week/index.md
status: approved
promoted:
design:
  file: "Synapse, 01M49AX02VV4SSBKNCN6NRTS6Y"
  pages: ["USE — work"]
  rows: ["USE — work · Row label · Week"]
  locked: 2026-10-10 (D-USE-49)
---

# Week — work

Handoff pass, the ledger of the boards (thread 7). The row "Row label · Week" (p-6-0, y 2880; its label: "Row 3 · planning / Week / Priority lens with add on hover; Time lens; spreading a big task across the week."). Sources: N6 "Week (Plan week)", D-USE-41, D-USE-42, D-USE-93 to D-USE-98. The pool panel: [`pool-panel.md`](pool-panel.md) and [`pool-rows.md`](pool-rows.md); the two popovers as drawn: [`popovers.md`](popovers.md). Words, access, instrumentation, criteria: [`words-and-access.md`](words-and-access.md).

## Job

Plan the week at the desk: put work from the pool on days and tiers, see where each day's work ends, and add events, in one view with two lenses (D-USE-41). Done is a week whose days hold what Taylor means to do, each day's fit read as a time, never a count (N6).

## Entry and exit

- **In:** the rail's **Week**; **Plan the week** on Today's start card ([`../today/states/nothing-planned.md`](../today/states/nothing-planned.md)) and in the desk's no-work-slotted line ([`../today/states/no-work-slotted.md`](../today/states/no-work-slotted.md), D-USE-65). Route `/week` [ASSUMPTION: not named in the log; the app's `/review/week` is the old Review tab's, whose fate D-USE-99 sends to Technical].
- **Out:** the rail (Today, Schedule, Workflow (beta)); a day head's › opens that day in Today's layout, planning state ([`../today/states/opened-day.md`](../today/states/opened-day.md), D-USE-41); any block in the Time lens opens the Block panel ([`../block-panel/index.md`](../block-panel/index.md)); a chip or a pool row opens the Item sheet (`../../day/item-sheet/`) as the right-side panel (D-USE-60, D-USE-65) [ASSUMPTION: N6 "click an item for its sheet"; not drawn at the desk].

## Layout, left to right, then top to bottom (1728)

1. **Rail** (220 px, `--rail-w`), as [`../overview.md`](../overview.md) › The rail: Synapse; Today, **Week** (current, shaded `--color-surface`), Schedule, a rule, Workflow (beta); "T" and "Taylor" in the footer (D-USE-99).
2. **Pool panel** (360 px, docked, `--color-surface` with a right hairline): [`pool-panel.md`](pool-panel.md). The same panel docks in Today's nothing-planned state and stays open beside the Block panel.
3. **Main** (1148 px, 32 px side padding):
   - **Header** (36 px): "Plan the week" in the display serif (30/36, medium) and "‹ 12 to 18 Oct ›" (muted, body) on one baseline; at the right, the lens `SegmentedControl` **Priority** / **Time** (fill-muted track, the selected segment `--color-background`, semibold), then **Today** (outline, 36 px). [ASSUMPTION] ‹ and › step a week back and forward; **Today** returns to this week (not drawn).
   - **The lens**, below a hairline, filling the rest: Priority ([`states/priority-lens.md`](states/priority-lens.md)) or Time ([`states/time-lens.md`](states/time-lens.md)).

**The lenses in brief** (same pool, same rules in both; D-USE-41):

- **Priority:** an 84 px label column (Events, Primary, Secondary, Stretch, Fits, each tier with its colour square) and seven equal day columns; chips in cells; "+ Add to <tier>" on a cell's hover; each day's foot "Work ends 16:20" or "Nothing slotted yet".
- **Time:** a 48 px hour axis, 8:00 to 17:00 at 80 px an hour, seven 148 px day columns; each day's blocks at their times in their kind colours; work as chips inside Work blocks; events in plum; "+ Event" on a day head's hover; the now line on today.

**Both:** today's column is marked by its head ("today" in `--color-now`; in Priority a 2 px `--color-now` line under the head; in Time the column shaded `--color-surface`). Saturday and Sunday heads are muted with no ›. Chips sit on the page in surface grey with no border (round 3, D-USE-42). Due badges are worked out per day column (D-USE-98). An item can sit in several cells as sessions, "session n of N" (D-USE-42). Week chips never show firing time (D-USE-98).

## Primary action

Placing work: drag a pool row into a cell (Priority) or onto a Work block (Time), or "+ Add to <tier>" on a cell; both are [`../../interactions/place-from-the-pool/index.md`](../../interactions/place-from-the-pool/index.md). No filled primary button sits on the page; the popovers' own actions are the primaries.

## States

| State                       | File                                                                       | Widths | One line                                     |
| --------------------------- | -------------------------------------------------------------------------- | ------ | -------------------------------------------- |
| Priority lens, add on hover | `states/priority-lens.md`                                                  | 1728   | Tiers by day; a drop; the add popover        |
| Time lens                   | `states/time-lens.md`                                                      | 1728   | Blocks at their times; the event popover     |
| empty week                  | `states/empty-week.md`                                                     | none   | The usual blocks; empty tiers; the pool full |
| past day                    | `states/past-day.md`                                                       | none   | Faded, still editable, nothing missed        |
| Linear tab                  | `states/linear-tab.md`                                                     | none   | Linear issues not in the pool                |
| pool empty                  | `states/pool-empty.md`                                                     | none   | Under the title, From Linear and New item    |
| loading                     | `states/loading.md`                                                        | none   | Skeleton chips and rows                      |
| error                       | `states/error.md`                                                          | none   | A region retry                               |
| offline                     | `states/offline.md`                                                        | none   | StatusLine; placing works                    |
| spread a big task           | [`../../interactions/spread/index.md`](../../interactions/spread/index.md) | 1728   | The Spread dialog (a flow, not a state here) |

## Platforms

- **Desk, 1728 drawn.** From 1024 up the rail and the Week show (D-USE-93, `--breakpoint-split: 1024px`).
- **1024 to 1727 (not drawn):** the pool stays docked at 360; the seven day columns shrink to a floor of about 120 px, then the week scrolls sideways, as Today's week strip does; the Time lens and the Block panel follow the same rule (D-USE-94). The header keeps one line [ASSUMPTION].
- **Below 1024:** no Week. The phone's answer is Set my days › This week, one day at a time behind the day chips, with the pool as a sheet and Place and Spread standing in for drag (D-USE-55; "Dev note · What stays at the desk, and the phone's answer"); its spec is [`../this-week/`](../this-week/index.md). The Time lens's phone answer is the Schedule tab for today and Set my days' day view for other days (D-USE-55). No lens switch on the phone.
- Light only; dark comes with the build's theme pass (D-USE-58).

## Interactions opened here

[place-from-the-pool](../../interactions/place-from-the-pool/index.md) (drag, "+ Add to <tier>" and its popover) · [spread](../../interactions/spread/index.md) ("Spread…" on a pool row or a session's menu) · [add-event](../../interactions/add-event.md) ("+ Event" on a day head) · [sessions](../../interactions/sessions.md) · [add](../../interactions/add/index.md) (cited) · the Block panel ([`../block-panel/index.md`](../block-panel/index.md)) · the opened day ([`../today/states/opened-day.md`](../today/states/opened-day.md)) · the Item sheet (`../../day/item-sheet/`) · client order, shared with Settings › Connections › Clients ([`../../account/settings/states/clients-on.md`](../../account/settings/states/clients-on.md), D-USE-96).
