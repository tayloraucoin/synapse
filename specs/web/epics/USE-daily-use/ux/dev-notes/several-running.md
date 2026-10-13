---
target: specs/web/ux/dev-notes/several-running.md
status: approved
promoted:
dev_note: "Dev note · Several running"
rulings:
  [
    D-USE-27,
    D-USE-29,
    D-USE-43,
    D-USE-44,
    D-USE-49,
    D-USE-57,
    D-USE-72,
    D-USE-76,
  ]
---

# Several running

The rules for several timers at once, outside a Work block. Used by [Running and Done](../day/running/index.md): `states/several-running.md`, `running-row-focused.md`, `done-on-a-running-row.md`, `done-well-over.md`. Timer mechanics on Now: [`timers-through-the-day.md`](timers-through-the-day.md); the work clock across devices: [`timers-across-devices.md`](timers-across-devices.md); the colour bands: [`over-by-how-much.md`](over-by-how-much.md). Cited, not repeated. Carries open-1's "Dev note: several running".

## The dev note

**Dev note · Several running** ("USE — daily use", x 1446, y 19020):

> Dev note · Several running
>
> • Any number of items can run at once (Taylor: AI threads run while other work goes on). Starting one never pauses another. This replaces N4's one-timer rule and its "Meditate paused" Toaster.
>
> • The item Taylor is on is the lifted card, with the verdigris dot. Everything else that runs sits under "Running" as a row: a progress ring, its own count, Pause, and the box. Tapping a row lifts it, and the old card drops to a row and keeps running.
>
> • Each count is computed from its start time minus paused spans, so many timers cost nothing in the background. Past the planned length a row reads "4 min over", in ink.
>
> • The app can't see when an agent finishes. Taylor checks it off. [NEEDS DECISION, later] A Linear status change could end it, along with the Linear seam.
>
> • At the day's close every running timer stops at the boundary (the existing rule).
>
> • Step 6 (Running) builds on this.

Its summary card under it (Frame @ x 1446, y 19950): "dev note / The rules for several timers at once. Step 6 builds on it."

## Inside a Work block: how D-USE-43, D-USE-44 and D-USE-49 amend it

The note was written before step 8 and draws its rows in a Work block. Inside a Work block it no longer holds as drawn:

- **One in hand (D-USE-43).** Many items can fire at once, but one is in Taylor's hands at a time. Starting another while one runs asks Firing (the default) or Paused ([`../interactions/start-while-one-runs.md`](../interactions/start-while-one-runs.md); D-USE-57 on the phone). Bullet 1's "starting one never pauses another" holds only outside a Work block.
- **No Running group (D-USE-44).** A firing item stays in its own tier and place; its row changes in place (the breathing mark, the title receded, "firing · n min" on the right). Bullet 2's rows under "Running" and the lift by tapping a row give way to pressing the firing mark to bring an item back ([`../interactions/firing.md`](../interactions/firing.md)).
- **Two clocks (D-USE-44).** Work time runs only in Taylor's hands; firing time runs from Prompt sent until the item is brought back. Done records both ("Took 1 h 10 · fired 32 min"). Step away pauses every work timer at once ([`../interactions/step-away.md`](../interactions/step-away.md)).
- **Colour (D-USE-49).** Firing is rust on grey; verdigris means only Taylor's hands (the running card, WORK TIME), as the note's verdigris dot already has it.

The phone's form: [`../work/today/states/running.md`](../work/today/states/running.md), [`../work/today/states/prompt-sent.md`](../work/today/states/prompt-sent.md).

## Where later lines differ, outside a Work block

- Bullet 3's "in ink": superseded by D-USE-29 and D-USE-72; Running rows take Done's percent bands ([`over-by-how-much.md`](over-by-how-much.md)).
- Bullet 2's rows count down like the card, and Done on a row shows its time a moment, then leaves Running (Decided (D-USE-72)).
- Bullet 4's [NEEDS DECISION, later] stays open, with the Linear seam. Related, not a ruling on it: on the phone, an issue closed in Linear shows done with Reopen [PROPOSED] (D-USE-57, `../work/today/states/linear-updating.md`).
- Bullet 5: as [`timers-through-the-day.md`](timers-through-the-day.md) bullet 3.

## Rulings

- D-USE-76: the frame is carried as a non-work block's Running rows; inside a Work block firing in place replaces it.
