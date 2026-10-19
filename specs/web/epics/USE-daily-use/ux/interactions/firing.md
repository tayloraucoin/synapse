---
target: specs/web/ux/interactions/firing.md
status: approved
promoted:
boards:
  - name: "phone-today / Lunch, work still firing / 402 / light"
    page: "USE — work"
    at: [9640, 5760]
    note: "Notes · phone, Today (row 5, cont.) @ x 9640"
    capture: specs/web/epics/USE-daily-use/ux/interactions/captures/firing-still-firing-402.png
dev_note: ""
rulings:
  [
    D-USE-43,
    D-USE-44,
    D-USE-45,
    D-USE-47,
    D-USE-49,
    D-USE-53,
    D-USE-57,
    D-USE-61,
    D-USE-62,
  ]
---

# Firing and bringing back

A work item waiting on AI, set by hand with one tap, never written to Linear (N6). Many fire at once; one is in Taylor's hands at a time (D-USE-43). It crosses surfaces when a Work block ends with items firing.

## Where it starts

[Today](../work/today/index.md), on any work row (not to-dos, not events): the ring; **Prompt sent** on the running or held card; **F** on the focused row (desk); swipe right (phone); Prompt sent in the long-press menu ([work-menu](../work/today/states/work-menu.md)); the Item sheet's firing panel (`../day/item-sheet/states/while-firing.md`, another writer).

## Steps

| #   | The person                                        | The app                                                                                                                                                                        | Board (carried by)                                                                                                                 |
| --- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Presses Prompt sent, the ring, F, or swipes right | The row stays in its tier and place; the ring becomes the breathing mark; title recedes; "firing · 1 min" starts; work time pauses if it ran; Next lifts if nothing is in hand | `today / prompt sent, both firing, Next lifts / 1728 / light`, `phone-today / prompt sent, …` (`work/today/states/prompt-sent.md`) |
| 2   | Waits; checks a reminder                          | "While it fires: <reminder>" once under the first firing row while a daily reminder is undone; minutes count, never seconds                                                    | `today / working, firing in place / 1728 / light` (`work/today/states/working.md`)                                                 |
| 3   | Everything fires                                  | "Everything is firing."; to-dos lift (phone)                                                                                                                                   | `phone-today / everything firing / 402 / light` (`work/today/states/everything-firing.md`)                                         |
| 4   | Presses the mark (or F on the row)                | Back in tier and place, looking like the others; "fired n min" in its meta; work time does not restart; if first in order it is Next                                           | `today / brought back, …` (`work/today/states/brought-back.md`)                                                                    |
| 5   | The Work block ends while items fire              | The next block's Now shows them on top as "Still firing, from Work"; Bring back (the mark) and Done work there                                                                 | `phone-today / Lunch, work still firing / 402 / light` (this file)                                                                 |
| 6   | The day closes                                    | Firing ends; the item stays in its tier [ASSUMPTION]                                                                                                                           | none                                                                                                                               |

## The frame this file carries: Still firing, from Work

**Phone (402, 12:20):** Now during Lunch: the Lunch `BlockHeader` (its colour bar, "Lunch", "12:00 to 13:00 · Work again at 13:00", ···). Under it a section with the Work colour square, "Still firing, from Work"; the firing row ([Portal sign-in], "KES-42 · Primary · worked 40 min", "firing / 22 min"); then "Tap the mark when it's back; it waits in Primary for the 13:00 Work block. Done works from here too." A hairline, then "Lunch" and "[Lunch's own view continues here as designed on "USE — daily use": the meal and its topic.]" (`../day/now/`).

**Notes · phone, Today (row 5, cont.) @ x 9640** — Lunch, work still firing

When the Work block ends with items firing, Now shows them on top of the next block as "Still firing, from Work". Bring back and Done work there; the item waits in its tier for the next Work block. Firing ends at the day's close [ASSUMPTION].

Desk: not drawn; the desk shows the tiers all day, so a firing item stays in its row past the block's end and keeps counting (D-USE-40). [ASSUMPTION]

## Rules

- **Two clocks** (D-USE-44): work time runs only in hand (Start, Pause, Resume); firing time from Prompt sent to the mark pressed again. Prompt sent pauses work time; bringing back never restarts it.
- **Look** (D-USE-47, D-USE-49): a `--color-category-clay-dot` 10 px dot in a 22 px `--color-fill-muted` halo that breathes (still under reduced motion [PROPOSED]); title muted; meta at 60 %; "firing · n min" in `--color-red-700` (phone: two lines, 84 px column, D-USE-51). Bend named: dark rust words on the tabs, never an alarm.
- **Thumb** (D-USE-53, D-USE-61): the ring's target is the 44 × 44 lead slot; swipe right reveals Prompt sent and fires, starting away from the screen edge; a one-time hint until used ([thumb-firing](../work/today/states/thumb-firing.md)). Bringing back is a tap on the mark only.
- **Keys** (D-USE-62): F fires or brings back the focused row; Enter goes to Next.
- **Never:** a Firing group, "back · n min" (D-USE-44); a sound or chime on return (D-USE-62); anything that changes with how long something fires (D-USE-43); a write to Linear.
- **Offline:** firing works and keeps counting; the events queue ([timers across devices](../dev-notes/timers-across-devices.md)).
- **Past the block's end:** firing keeps counting into the next block (step 5); it is not paused by Step away (D-USE-46).

## Rulings

D-USE-43 the flow and Next by order; D-USE-44 in place, two clocks; D-USE-45 Next lifts at once; D-USE-47, D-USE-49 the row; D-USE-53, D-USE-61 the thumb; D-USE-57 still firing in the next block; D-USE-62 keys, no chime.

## Criteria

| ID             | When                                    | Then                                                                          | Evidence                               |
| -------------- | --------------------------------------- | ----------------------------------------------------------------------------- | -------------------------------------- |
| C-USE-firing-1 | Any of the five ways to fire            | The same result: in place, work time paused, firing time from 1 min           | test                                   |
| C-USE-firing-2 | The Work block ends with an item firing | The next block's Now shows "Still firing, from Work" with Bring back and Done | `captures/firing-still-firing-402.png` |
| C-USE-firing-3 | Bring back                              | No sound; no caption; work time stays paused                                  | manual                                 |
