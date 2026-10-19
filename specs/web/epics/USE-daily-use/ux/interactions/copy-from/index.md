---
target: specs/web/ux/interactions/copy-from/index.md
status: approved
promoted:
boards: []
dev_note: ""
rulings:
  [
    D-USE-32,
    D-USE-33,
    D-USE-39,
    D-USE-65,
    D-USE-68,
    D-USE-82,
    D-USE-83,
    D-USE-87,
  ]
---

# Copy from

One day takes the blocks of another built day. An empty day copies at once, with Undo; a day with blocks asks Replace first (round 1). Each drawn step is a file in `states/`.

## Where it starts

- **Set my days, the day's ···** › "Copy from…" ([`../../set-my-days/set-my-days/states/day-menu.md`](../../set-my-days/set-my-days/states/day-menu.md)): opens the picker, step 1.
- **The copy offer on an empty day** ([`../../set-my-days/set-my-days/states/copy-offer.md`](../../set-my-days/set-my-days/states/copy-offer.md), [`../../set-my-days/set-my-days/states/empty-day.md`](../../set-my-days/set-my-days/states/empty-day.md)): "Copy from Monday" copies that day at once, skipping the picker and the ask (step 3); "Other day…" opens the picker.
- **Review the day, a day with nothing set** › "Copy another day" ([`../../day/review-the-day/states/sunday-nothing-set.md`](../../day/review-the-day/states/sunday-nothing-set.md), D-USE-68): the picker, for today's date [ASSUMPTION, as that file says].

## Steps

| #   | The person                                      | The app                                                                                                         | Board (carried by)                                                                                       |
| --- | ----------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| 1   | Copy from… (or Other day…, or Copy another day) | A sheet of built days only, each with a strip of its blocks and the blocks named; the day being set is left out | `set-my-days / copy-picker / 402 / light` ([`states/copy-picker.md`](states/copy-picker.md))             |
| 2   | Taps a day, on a day with blocks                | An `AlertDialog`: "Replace Thursday with Monday?", naming what goes; Replace in ink, Cancel                     | `set-my-days / replace confirm / 402 / light` ([`states/replace-confirm.md`](states/replace-confirm.md)) |
| 2a  | Taps a day, on an empty day                     | No ask: it copies at once (step 3) [ASSUMPTION, round 1's note]                                                 | not drawn                                                                                                |
| 3   | Replace (or the copy at once)                   | The day holds the picked day's blocks; a `Toaster` "Thursday copied from Monday" with Undo                      | `set-my-days / copied, Undo / 402 / light` ([`states/copied-undo.md`](states/copied-undo.md))            |

## Rules

- **Empty copies at once; built asks.** The ask shows only when the day being set has blocks (round 1; D-USE-32). Either way Undo in the toast restores the day as it was, its own blocks and items back.
- **Only built days** are offered; a day with nothing set is never listed, nor the day being set.
- **What copies:** the blocks, their times, kinds and items. Up at and Lights out stay the day's own [ASSUMPTION: not drawn; both days read 7:00 and 22:30]. Orient stays first and locked.
- **Usual week:** a copy changes the usual weekday, and this week's same day follows where not yet started, except blocks already changed on that date ([`replace-confirm.md`](states/replace-confirm.md), [ASSUMPTION] as its note says; D-USE-33 "a usual-week change naming its reach").
- **This week:** a copy changes that date only; the usual week is untouched [ASSUMPTION: no This week copy is drawn].
- **Slotted work** [Decided (D-USE-87); default: work blocks copy as time only, the slotted work stays on its own day, and the copied Work block reads "Work goes in on This week." as drawn]. Open-4's dev note lists "Copy from and Reset with slotted work" as still to investigate.
- **A checklist day** (Sunday, "One checklist, no times") [PROPOSED]: copying it makes the day one checklist with no times [ASSUMPTION: not drawn past the picker].
- **Offline:** the ··· and the copy offer are read-only (D-USE-82: the day's own controls); nothing copies until back online.
- Nothing is red; the ask names what goes in words.
- **Desk:** the picker opens in the right-panel sheet and the ask as a centred `AlertDialog`; Set my days is list-detail from 1024 (D-USE-39, D-USE-65, D-USE-83).

## Words

"Copy from…" · "Copy from" · "Every Thursday takes the blocks of the day picked. Built days only." · "One checklist, no times" · "Replace Thursday with Monday?" · "Thursday's Wellness and Work go, and Monday's blocks take their place. This week's Thursday follows." · "Cancel" · "Replace" · "Thursday copied from Monday" · "Undo" · "Copy from Monday" · "Other day…" · "Copy another day".

## Access

The picker is a sheet that traps focus, × named "Close"; each day row is one button named "<Day>: <blocks named>" (the strip is decoration, its names are in words). The ask is an `AlertDialog`: focus starts on Cancel [ASSUMPTION], Esc cancels. The toast is announced politely; Undo is reachable by Tab while it shows. Controls at least 44 × 44.

## Rulings

- D-USE-32: round 4's first part approved: the picker of built days with strips, Replace only when the day has blocks, then the Toaster with Undo.
- D-USE-33: a usual-week change names its reach (the ask's "This week's Thursday follows").
- D-USE-68: Review the day's day with nothing set carries "Copy another day", which opens this flow.
- D-USE-82: offline, the day's own controls are read-only.
- D-USE-39, D-USE-65, D-USE-83: the desk form scales up; list-detail from 1024.

## Criteria

| ID                | When                                          | Then                                                           | Evidence                           |
| ----------------- | --------------------------------------------- | -------------------------------------------------------------- | ---------------------------------- |
| C-USE-copy-from-1 | Copy from… on a day with blocks, a day picked | The ask names what goes; Replace copies; Cancel leaves the day | `captures/replace-confirm-402.png` |
| C-USE-copy-from-2 | "Copy from Monday" on an empty day            | It copies at once with no ask; the toast offers Undo           | test                               |
| C-USE-copy-from-3 | Undo after any copy                           | The day is back as it was, blocks and items                    | test                               |
| C-USE-copy-from-4 | The picker opens                              | Only built days, the day being set left out                    | `captures/copy-picker-402.png`     |
