---
target: specs/web/ux/interactions/start-while-one-runs.md
status: approved
promoted:
boards:
  - name: "phone-today / Start while one runs, ask / 402 / light"
    page: "USE — work"
    at: [6748, 5760]
    note: "Notes · phone, Today (row 5, cont.) @ x 6748"
    capture: specs/web/epics/USE-daily-use/ux/interactions/captures/start-while-one-runs-ask-402.png
dev_note: ""
rulings: [D-USE-27, D-USE-43, D-USE-57, D-USE-65]
---

# Start while one runs

One item is in hand at a time. Starting another asks where the running one goes (D-USE-43, amending D-USE-27 at the desk). An overlay opened from several places.

## Where it starts

Start on any item while another's work timer runs: the lifted Next card or a row's Start on [Today](../work/today/index.md), Start in the long-press menu ([work-menu](../work/today/states/work-menu.md)), Start in the Item sheet (`../day/item-sheet/`). Not asked when the other item is paused or held (no timer runs) [ASSUMPTION].

## Steps

| #   | The person                                              | The app                                                                              | Board (carried by)                                                  |
| --- | ------------------------------------------------------- | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------- |
| 1   | Presses Start on the SMS copy while [Case studies] runs | A bottom sheet over a dimmed Today asks where the running one goes                   | `phone-today / Start while one runs, ask / 402 / light` (this file) |
| 2a  | Keeps Firing (default), presses Start                   | The running item fires in place (as Prompt sent); the new item starts its work time  | `work/today/states/prompt-sent.md`, `work/today/states/running.md`  |
| 2b  | Picks Paused, presses Start                             | The running item holds (WORK TIME · PAUSED, Resume on its card); the new item starts | `work/today/states/paused.md`                                       |
| 2c  | Cancel (or a tap on the scrim, or a swipe down)         | Both stay as they were                                                               | none                                                                |

## The frame this file carries

**Phone (402, 10:42):** Today dimmed under a scrim (the running card, the Step away pill visible behind). A bottom sheet with a grab handle: "Start [Appointment reminders: SMS copy]" (bold); "One item is in hand at a time. [Case studies: write the Alder intro] is running; it moves to:"; two radio rows separated by hairlines: **Firing** (selected, with the small firing mark), "Its prompt is out; firing time starts now"; **Paused**, "Work time held; Resume from its row"; then **Cancel** (outline) and **Start** (ink), side by side.

**Notes · phone, Today (row 5, cont.) @ x 6748** — Start while one runs

One item in hand at a time. Starting another asks where the running one goes: Firing (default) or Paused (D-USE-43). Cancel leaves both as they were.

## Desk

Not drawn. D-USE-43 rules the same ask at the desk. Its form: the same content as a shadcn `Dialog` centred over Today, Firing selected, Enter for Start and Esc for Cancel (D-USE-65).

## Words

"Start <title>"; "One item is in hand at a time. <title> is running; it moves to:"; "Firing", "Its prompt is out; firing time starts now"; "Paused", "Work time held; Resume from its row"; "Cancel", "Start" [PROPOSED, to Gloss].

## Access

The sheet is a modal: focus moves to the selected radio; the radios are one group named "Where <title> goes"; Esc or Cancel restores focus to the Start that opened it.

## Rulings

- D-USE-43: Firing (default) or Paused [PROPOSED in D-USE-43; drawn and locked by D-USE-57, D-USE-58].
- D-USE-27: amended at the desk; one item in hand at a time.
- D-USE-57: drawn on the phone.

## Criteria

| ID                           | When                     | Then                                | Evidence                                    |
| ---------------------------- | ------------------------ | ----------------------------------- | ------------------------------------------- |
| C-USE-start-while-one-runs-1 | Start while another runs | The ask opens with Firing selected  | `captures/start-while-one-runs-ask-402.png` |
| C-USE-start-while-one-runs-2 | Cancel                   | No timer or firing event is written | test                                        |
