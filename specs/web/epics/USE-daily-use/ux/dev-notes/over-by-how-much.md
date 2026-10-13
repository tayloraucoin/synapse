---
target: specs/web/ux/dev-notes/over-by-how-much.md
status: approved
promoted:
dev_note: "Dev note · Over, by how much"
rulings: [D-USE-29, D-USE-38, D-USE-72]
---

# Over, by how much

The colour of a time past its plan, running and done. Used by [Running and Done](../day/running/index.md) (`states/over-under-a-minute.md`, `over-a-minute-or-more.md`, `paused.md`, `timed-done.md`, `timed-over-warning.md`) and by the work clock's over ([`../work/today/states/over-the-range.md`](../work/today/states/over-the-range.md), D-USE-57). Timer mechanics: [`timers-through-the-day.md`](timers-through-the-day.md), [`timers-across-devices.md`](timers-across-devices.md).

## The dev note

**Dev note · Over, by how much** ("USE — daily use", x 4338, y 13980):

> Dev note · Over, by how much
>
> • Running (Taylor's rule): on time in ink; under a minute over in warning ("0:40 over"); a minute or more over in danger ("3 min over"). The word "over" always carries it, so colour is never alone.
>
> • Done (by percent over the planned length, D-USE-29): up to 10% over, ink; over 10% to 25%, warning; over 25%, danger. Each band edge rounds to a whole minute and is at least 1 min, so a 2-min item isn't warned at 2:10. 10 min: ink to 11, warning 12, danger 13 on. 30 min: ink to 33, warning 34 to 37, danger 38 on. Under the plan is always ink.
>
> • [PROPOSED] Later, running could use the same bands, so a 45-min block isn't red at 46. Drawn as Taylor asked for now.
>
> • Tokens [PROPOSED]: warning-text, a new token (yellow at oklch 62% 0.13 85 on the figure, 58% on small text for contrast); danger reuses destructive-text. Bends product-rules "Nothing red on the execution tabs", P-A04 and N4's "ink only" (note 62), at Taylor's call.
>
> • Paused: the figure pulses in ink between 100% and 40% over 2 s, the only motion on Now. Under reduced motion it holds at 60%.

Its summary card under it (Frame @ x 4338, y 14910): "dev note / The bands for running and for done, the rounding, the tokens, the rules this bends, and the pulse."

## Where later lines differ

- Bullet 3: Decided (D-USE-72), **Running uses Done's percent bands**, now, not later. Bullet 1's rule ("under a minute" warning, "a minute or more" danger) is superseded as a rule; it stays as the figure's form: "m:ss over" under a minute, "n min over" from a minute.
- Bullet 4: `warning-text` stays [PROPOSED until the colours look] (D-USE-72, D-USE-38: "The warning becomes a darker text token"). The bends are named in D-USE-29.
- Bullet 5: as drawn (D-USE-29, D-USE-72).
- Not on the boards: whether a Done in the ink band but over the plan names the plan ("11 min") [ASSUMPTION: no; "of <plan>" shows only from warning, `../day/running/states/timed-over-warning.md`].
