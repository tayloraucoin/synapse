---
target: specs/web/ux/day/running/words-and-access.md
status: approved
promoted:
---

# Running and Done — words, access, criteria

The second half of [`index.md`](index.md), split to keep each file under its cap.

## Words

Gloss. Strings the same in every state; state-only strings sit in each state file. No second person; times and lengths are the only numbers.

- Card meta: "Started 7:14"; paused, "Paused · started 7:14".
- Figure: "7:42" counting down; past the plan "0:40 over" (under a minute), "3 min over" (a minute or more); "of 10 min" beside it.
- Buttons: "Pause", "Resume", "Done".
- After a plain Done: "Took 2 min · Change", fading to "2 min". After a timed Done: "12 min"; past the ink band "12 min of 10".
- The sheet: "<item> · planned 2 min", "Time taken", "min", "Save".
- Running rows (several running): the heading "Running"; a row's meta "Running · 12:04 of 30 min", "Running · 4 min over"; after its box, "Done · 34 min", from warning "Done · 41 min of 30".
- "Over" is the one word; late, behind and overdue never appear (N5).

## Access

Threshold. `[PROPOSED]` where the boards are silent.

- **The figure** is `aria-live="off"` and read only when focused (N4); its accessible text is the full sentence, "7 minutes 42 seconds left of 10 minutes", "3 minutes over 10 minutes" [PROPOSED].
- **Order on the card:** the item's name, the figure, Pause (or Resume), Done.
- **Names:** Pause "Pause Meditate", Resume "Resume Meditate", Done "Done, Meditate"; Change "Change time taken for Start the cold bath"; the stepper's − and + "Fewer minutes", "More minutes", the field "Minutes taken".
- **Announced (polite):** Pause and Resume once ("Meditate paused", "Meditate resumed"); a Done with its time ("Meditate done, 12 minutes"); the Change offer is reachable by Tab while it shows and does not time out while focused [PROPOSED].
- **Colour never alone:** "over" always beside the warning or danger colour; past the ink band a Done reads "of <plan>"; paused is said in the meta line, not only by the pulse and the muted ink.
- **Contrast:** `warning-text` at 62% on the figure and 58% on small text (D-USE-72, [PROPOSED until the colours look]).
- **Reduced motion:** the paused figure holds at 60%, no pulse (D-USE-29).
- **Running rows** [PROPOSED]: in order, the row (a button, "<item>, running, <count>", lifts it), its Pause ("Pause <item>"), its box ("Done, <item>"); the ring is decorative. A lift moves focus to the card's title.
- **Targets:** Pause, Resume, Done, Change, a row's Pause and box, −, + and × at least 44 × 44.

## Instrumentation

None named by the narrative or the log [ASSUMPTION: Phase 1 sends no product events from Running]. The time taken is stored on the item as data (note 74), not as an event. Never in any payload: item names.

## Criteria

| ID              | When                                 | Then                                                                       | Evidence                                 |
| --------------- | ------------------------------------ | -------------------------------------------------------------------------- | ---------------------------------------- |
| C-USE-running-1 | Start on the lifted card             | The card counts down from the planned length; nothing else on Now moves    | `captures/counting-down-402.png`         |
| C-USE-running-2 | Another item is started              | The first keeps running (D-USE-27); no Toaster                             | test                                     |
| C-USE-running-3 | Past the plan                        | "over" in the words, colour by Done's percent bands, no sound or vibration | `captures/over-a-minute-or-more-402.png` |
| C-USE-running-4 | A plain Done                         | The plan is recorded and "Took <n> min · Change" shows a few seconds       | `captures/took-change-402.png`           |
| C-USE-running-5 | The day's close with a timer running | It stops at the boundary; the item is left for the morning, not missed     | test                                     |
| C-USE-running-6 | Offline                              | Counts run; Start, Pause and Done queue and replay in order                | test                                     |
| C-USE-running-7 | Each `?state=` key of `states/`      | That state renders (canon C-P08)                                           | capture                                  |

## Decisions and open items

- D-USE-13 (one-tap Done, Took · Change), D-USE-27 (several run at once; supersedes the flat file's "One timer at a time" and N4's "Meditate paused" Toaster), D-USE-29 (bands, pulse; bends "ink only"), D-USE-38 (the warning token), D-USE-39 (no wide frame), D-USE-72 (step 6 rounds 1 and 2 as drawn; Running uses Done's percent bands).
- Leaving the app doesn't stop a timer: it is time-based, not ticking in the background (N4; stands).
- "Over" is the one neutral word (N5; stands).
- Open: open-1 "Running, step 6 rounds 1 and 2 (drawn)" (all Decided (D-USE-72), in the state files) and "Dev note: timers through the day" ([`../../dev-notes/timers-through-the-day.md`](../../dev-notes/timers-through-the-day.md)).
