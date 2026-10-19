---
target: specs/web/ux/dev-notes/meeting-inside-a-work-block.md
status: approved
promoted:
dev_note: "Dev note · A meeting inside a work block"
rulings:
  [
    D-USE-27,
    D-USE-38,
    D-USE-43,
    D-USE-46,
    D-USE-52,
    D-USE-57,
    D-USE-65,
    D-USE-77,
  ]
---

# A meeting inside a work block

How a meeting or appointment sits inside a Work block in go mode. Used by [`../work/today/states/meeting-coming-up.md`](../work/today/states/meeting-coming-up.md) (before its time), [`../work/today/states/meeting-lifted.md`](../work/today/states/meeting-lifted.md) (at its time) and [`../work/today/states/primary-only.md`](../work/today/states/primary-only.md) (the pinned row), and by the Schedule's meeting band (`../day/schedule/states/meeting-inside-a-block.md`). Its engine is shared with [Make room](../interactions/make-room/index.md) and [A later start](../interactions/later-start/index.md); neither repeats this file.

## The dev note

**Dev note · A meeting inside a work block** ("USE — daily use", x 1928, y 19020):

> Dev note · A meeting inside a work block
>
> The block stays one block. A meeting or appointment is a pinned item inside it: a band at its time on the Schedule, a band in the flow on Now. Nothing splits the block into before and after.
>
> Logged in day/overview.md, Open.
>
> Mechanics to settle
>
> The plan's times flow around the band: the block's free time shrinks by the meeting. An item is never split; the card shows the consequence ("would end 10:50, past Design sync"). At its time the meeting lifts (round 1). Anything running keeps running (D-USE-27): agents run on through a meeting; pausing is Taylor's call. If the tiers no longer fit by 12:00, Stretch is what slides first. Shares the engine with Make room and A later start.
>
> The simple default
>
> No prompt, no sheet: the band appears, times re-flow, and the only words are the consequence on the card. Ask only when Primary itself won't fit, and then reuse Make room's sheet.

Its summary card under it (Frame @ x 1928, y 19950):

> dev note: a meeting inside a block
>
> One block, one pinned band; times re-flow, nothing splits, running items keep running, Stretch slides first. Ask only when Primary won't fit, reusing Make room.

## What each line means for the build

- **One block.** A meeting is an item with a pinned time inside the Work block, not a block boundary; the block keeps one record, one header ("9:30 to 12:00") and one set of tiers. The Schedule draws it as a band at its time (plum, D-USE-38); Now draws it as a band in the flow ([meeting-coming-up](../work/today/states/meeting-coming-up.md)).
- **Times flow around the band.** The plan's projected times skip the meeting's span: the block's free time is its length less the meeting. The band sits where the projected times reach the meeting's start, which may be inside a tier.
- **Never split.** An item that would run across the meeting keeps one length; its card shows "would end <time>, past <meeting>". The projection counts the item's end after the meeting [ASSUMPTION: the "would end" time is the straight end, 10:20 + 30 min = 10:50, not pushed past the meeting].
- **At its time it lifts** ([meeting-lifted](../work/today/states/meeting-lifted.md)): under "At <time>" on the phone; at the desk, a row under the band (D-USE-65).
- **Running keeps running.** In a Work block: a running work timer and every firing item carry on through the meeting (D-USE-43 firing; D-USE-27 at block level). Nothing pauses on its own; Step away is the pause (D-USE-46, D-USE-52).
- **Stretch slides first.** When the tiers no longer fit by the block's end, the projection drops Stretch first [ASSUMPTION: then Secondary; Urgent and Primary never slide without asking]. A slid item stays in its tier and waits for the next Work block, as firing items do (D-USE-57) [ASSUMPTION].
- **The simple default.** No prompt, no sheet: the band appears, the times re-flow, and the card's consequence is the only words. Only when Primary itself won't fit does a sheet open: Make room's sheet ([`../interactions/make-room/states/sheet.md`](../interactions/make-room/states/sheet.md)) [ASSUMPTION: Urgent counts with Primary].
- **One engine.** Minutes to find and what gives, as Make room (taking minutes for an addition) and A later start (the slide); this note adds a pinned span inside a block. Google events moving use the same engine (open-4).

## Open

Logged in the day's Open list (open-2, "Dev note: a meeting inside a work block"); the [PROPOSED] band in the flow and the step 8 [ASSUMPTION]s on the meeting are not yet ruled.

## Rulings

- D-USE-77: step 8's [PROPOSED] and [ASSUMPTION] marks in this file stand as drawn (Decided (D-USE-77)).
