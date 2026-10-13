---
target: specs/web/ux/dev-notes/timers-through-the-day.md
status: approved
promoted:
dev_note: "Dev note · Timers through the day"
rulings: [D-USE-13, D-USE-27, D-USE-29, D-USE-72]
---

# Timers through the day

The timer rules for Running and Done on Now. Used by [Running and Done](../day/running/index.md). The work clock (two clocks per item, firing, Step away, events across devices) is [`timers-across-devices.md`](timers-across-devices.md), cited and not repeated; the colour bands are [`over-by-how-much.md`](over-by-how-much.md).

## The dev note

**Dev note · Timers through the day** ("USE — daily use", x 3856, y 13980):

> Dev note · Timers through the day
>
> • Every count runs down from the planned length, on the card and on the Running rows alike; at zero it reads "3 min over" in ink, the border unchanged, no sound.
>
> • Pause holds the figure in muted ink with "Paused" in the meta line; Resume takes Pause's place. [PROPOSED] the figure stays as the number rather than the sentence "Paused at 4:10".
>
> • Left running all day (a note, not a screen): at the day's close every timer stops at the boundary and the item is left for the morning, not missed.
>
> • Offline [ASSUMPTION]: counts are time-based (start time minus paused spans), so they run offline; Start, Pause and Done queue like any check.
>
> • Done on a timed item records the time taken and the row shows it ("12 min", "Done · 34 min"), no Change. A plain Done records the planned length and offers "Took 2 min · Change" for a few seconds (D-USE-13); Change opens the MinutesStepper, typeable, with Save.

Its summary card under it (Frame @ x 3856, y 14910): "dev note / The timer rules in one place: counts down everywhere, over in ink, pause, the day's close (all timers stop at the boundary, the item left for the morning), offline [ASSUMPTION], and which Done shows which time."

## Where later lines differ

- "In ink" at zero (bullet 1 and the card): superseded by D-USE-29 and D-USE-72; past the plan the figure takes Done's percent bands, "over" always beside the colour ([`over-by-how-much.md`](over-by-how-much.md)).
- Bullet 2's [PROPOSED]: Decided (D-USE-72), the number held and pulsing, "Paused · started 7:14" in the meta line ([`../day/running/states/paused.md`](../day/running/states/paused.md)).
- Bullet 4's [ASSUMPTION]: Decided (D-USE-72). The same rule holds for the work clock, with events replayed in order (Mason 3 in [`timers-across-devices.md`](timers-across-devices.md)).
- Running rows (bullet 1): several run at once, the focused one as the card, the rest as rows under "Running" with their own count, Pause and box (D-USE-27); they count down like the card (Decided (D-USE-72)). Done on a Running row shows "Done · 34 min" a moment, then the row leaves Running for its tier (Decided (D-USE-72)). Drawn on the work block's row (area 4; `../day/running/states/several-running.md` and after), with its own dev note, [`several-running.md`](several-running.md).
- Day's close (bullet 3): the work clock's spans end at the same boundary [ASSUMPTION, in `timers-across-devices.md`].
