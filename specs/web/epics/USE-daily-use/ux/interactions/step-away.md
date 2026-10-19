---
target: specs/web/ux/interactions/step-away.md
status: approved
promoted:
boards: []
dev_note: ""
rulings: [D-USE-44, D-USE-46, D-USE-52, D-USE-57, D-USE-62]
---

# Step away and Resume all

A light switch for work time: one press holds every running work timer; firing keeps counting, because the AI keeps working (D-USE-44).

## Where it starts

[Today](../work/today/index.md): **Step away** in the desk header (left of + Add) or the phone's Work block header (a quiet pill with the pause glyph beside ···), shown only while a work timer runs (D-USE-46, D-USE-52). Since one item is in hand at a time (D-USE-43), that is at most one running timer in practice; the rule is written for every running timer.

## Steps

| #   | The person                                 | The app                                                                                                                                                                                                                                          | Board (carried by)                                                                                                                                   |
| --- | ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | An item runs                               | Step away shows                                                                                                                                                                                                                                  | `today / running, work clock, add menu / 1728 / light`, `phone-today / running, work time, step away / 402 / light` (`work/today/states/running.md`) |
| 2   | Presses Step away at 10:42                 | One pause event per running item, all at 10:42; the button gives way to the bar ("Stepped away at 10:42", "Work time held · firing keeps counting", Resume all); each held card reads WORK TIME · PAUSED, edge to hairline, Pause becomes Resume | `today / stepped away / 1728 / light`, `phone-today / stepped away, Resume all / 402 / light` (`work/today/states/stepped-away.md`)                  |
| 3a  | Presses Resume all                         | Exactly the timers Step away paused resume; the bar clears; Step away returns                                                                                                                                                                    | as step 1                                                                                                                                            |
| 3b  | Presses Resume on one held card            | That card resumes; the bar clears when nothing else is held                                                                                                                                                                                      | as step 1                                                                                                                                            |
| 3c  | Presses Prompt sent or Done on a held card | It fires or is done; the bar clears when nothing else is held [ASSUMPTION]                                                                                                                                                                       | `work/today/states/prompt-sent.md`                                                                                                                   |
| 4   | Comes back after the block's end           | Nothing is asked; the bar waits (D-USE-62)                                                                                                                                                                                                       | none                                                                                                                                                 |

## Rules

- Resume all resumes only what Step away paused, never an item paused by its own Pause ([paused](../work/today/states/paused.md)) [ASSUMPTION, from "exactly the timers Step away paused"].
- Firing items are untouched: their firing time keeps counting.
- Next and its shading do not change while stepped away (the held card keeps the lift).
- Across devices: one pause event per item, so Resume all at the desk resumes what the phone paused ([timers across devices](../dev-notes/timers-across-devices.md), Mason 4).
- Offline: the events queue with their own times.
- Never a question on return, never a count of time away.

## Words

"Step away"; "Stepped away at 10:42"; "Work time held · firing keeps counting" [PROPOSED wording, to Gloss]; "Resume all"; "Resume".

## Access

Step away's name: "Step away, pause work time". On press, announce "Stepped away at 10:42"; focus moves to Resume all [PROPOSED]. On Resume all, announce "Work time resumed" and focus returns to the header.

## Rulings

- D-USE-44 (4): Step away pauses every running work timer; firing counts on.
- D-USE-46: drawn at the desk; header button only while a work timer runs; the bar and the held card.
- D-USE-52: the phone's pill and bar.
- D-USE-62: a long step away asks nothing.

## Criteria

| ID                | When               | Then                                                                           | Evidence                                |
| ----------------- | ------------------ | ------------------------------------------------------------------------------ | --------------------------------------- |
| C-USE-step-away-1 | Step away          | Every running work timer gets a pause event at the same time; firing continues | test                                    |
| C-USE-step-away-2 | Resume all         | Only those timers resume                                                       | test                                    |
| C-USE-step-away-3 | No work timer runs | Step away is hidden                                                            | `../work/today/captures/paused-402.png` |
