---
target: specs/web/ux/dev-notes/size-and-length.md
status: approved
promoted:
dev_note: "Dev note · Size and length"
rulings: [D-USE-42, D-USE-54, D-USE-57, D-USE-65, D-USE-77]
---

# Size and length

Size words, the length range a size sets, and planning with the top of a range. Used by the Item sheet ([`../day/item-sheet/states/size-and-length.md`](../day/item-sheet/states/size-and-length.md), [`linear-linked.md`](../day/item-sheet/states/linear-linked.md), [`tier-and-sessions.md`](../day/item-sheet/states/tier-and-sessions.md)), Add's New task ([`../interactions/add/index.md`](../interactions/add/index.md)), and the work rows' size chip and range ([`../work/today/index.md`](../work/today/index.md)).

## The dev note

**Dev note · Size and length** ("USE — daily use", x 2410, y 19020):

> Dev note · Size and length
>
> Size is Linear's points with a word each: 1 Quick, 2 Small, 3 Medium, 5 Large, 8 Huge. Picking a size sets a length range; the range stays editable.
>
> Logged in day/overview.md, Open.
>
> Default ranges [ASSUMPTION]
>
> Quick 15 to 30 min · Small 30 to 60 min · Medium 1 to 2 h · Large 2 to 4 h · Huge 4 h or more, with "Bigger than a block. Split it?" under it. Length is Exact or Range; units switch on their own (minutes under 90, then hours in half-hour steps). The day plans with the top of a range, so it ends early, not late. Size syncs both ways with Linear's estimate; a plain item can have a size too, or only a length.
>
> Learn from the times taken
>
> Later: once Taylor has finished enough items of a size, the default range follows the real times taken (no numbers shown about it, only the range).

Its summary card under it (Frame @ x 2410, y 19950): "dev note: size and length / Default ranges per size, the Exact or Range switch, units, planning with the top of a range, and a later idea: ranges that follow the real times taken."

## What it means for the build, with the later lines

- **The ranges stay [ASSUMPTION]** as drawn: no D-line rules them. They are defaults per size; the item keeps whatever range was set on it.
- **Huge.** "Bigger than a block. Split it?" leads to Spread across the week (D-USE-42, D-USE-54, D-USE-57): sessions on several days, each with its own length [ASSUMPTION: the link is not drawn].
- **Fit and the day's plan use the top** everywhere: the running card counts down from the top of the range (D-USE-42); Move to's "fits, even at the top of its range" (`../interactions/move-to/states/linear-work-item.md`); the over clock counts past the top (`../work/today/states/over-the-range.md`).
- **D-USE-54: Size is on New task** on the phone (title, client and project, Tier, Size, Days), the same five words; New task with no days saves to the pool (D-USE-57). A plain item may have a size without Linear.
- **D-USE-42: the size chip** on rows and in the pool reads point and word ("3 Medium"); the phone row keeps it (D-USE-51).
- **Both ways with Linear:** picking a size writes Linear's estimate; an estimate changed in Linear changes Size here. A workspace using a scale other than 1, 2, 3, 5, 8 [ASSUMPTION: not drawn; the nearest word shows, the point as Linear has it].
- **Learning from times taken** is later, not in the first build; it would show only the range, no numbers about it (product rules: no numbers about the day).

## Rulings

- D-USE-77: step 8's [PROPOSED] and [ASSUMPTION] marks in this file stand as drawn (Decided (D-USE-77)).
