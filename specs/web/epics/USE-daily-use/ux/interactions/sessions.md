---
target: specs/web/ux/interactions/sessions.md
status: approved
promoted:
boards:
  - name: "phone-edit / tier, this session or all / 402 / light"
    page: "USE — work"
    at: [7712, 7200]
    note: "Notes · phone, editing and This week (row 6, cont.) @ x 7712"
    capture: specs/web/epics/USE-daily-use/ux/interactions/captures/sessions-this-session-or-all-402.png
dev_note: ""
rulings:
  [
    D-USE-40,
    D-USE-42,
    D-USE-54,
    D-USE-57,
    D-USE-58,
    D-USE-65,
    D-USE-97,
    D-USE-103,
  ]
---

# Sessions, and "this session or all"

A task longer than a day is one item placed as sessions on several days (D-USE-40). A session is one day's share; checking it means "done for today"; the task is done when Taylor marks it done or Linear does (N6).

## Where it starts

- [Today](../work/today/index.md): a row with "session 1 of 3" in its meta; its Done.
- The Item sheet (`../day/item-sheet/`): Sessions, the tier, "Mark the task done" in ···.
- Making sessions: New task with two or more days ([`add/states/new-task.md`](add/states/new-task.md)), Place with several days ([`place-from-the-pool/`](place-from-the-pool/index.md)), Spread across the week ([`spread/`](spread/index.md)).

## Steps

| #   | The person                                                                                                                              | The app                                                                                                                                                      | Board (carried by)                                                                                                                  |
| --- | --------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Sees a session on Today                                                                                                                 | The meta reads "session 1 of 3"; the week strip shows "2/3" on the day of session 2 (desk)                                                                   | `today / working, firing in place / 1728 / light` (`work/today/states/working.md`)                                                  |
| 2   | Presses Done on a session                                                                                                               | Today's share closes: "Done for today · took 2 h 05 · next session Wed 14"; a toast "Done for today. Session 2 is Wed 14." with Undo; nothing goes to Linear | `phone-today / Done for today, a session, Undo / 402 / light` (`work/today/states/done-for-today.md`)                               |
| 3   | Undo                                                                                                                                    | The session reopens as it was                                                                                                                                | same                                                                                                                                |
| 4   | Changes the tier (or length) of one session in the Item sheet ([`tier-and-sessions.md`](../day/item-sheet/states/tier-and-sessions.md)) | Asks This session (default) or All sessions, with the consequence for the others                                                                             | `phone-edit / tier, this session or all / 402 / light` (this file, below; [capture](captures/sessions-this-session-or-all-402.png)) |
| 5   | Marks the task done (Item sheet ···)                                                                                                    | Closes every session and the Linear issue                                                                                                                    | `phone-edit / item sheet ··· menu / 402 / light` (`day/item-sheet/states/work-more-open.md`)                                        |
| 6   | Linear closes the issue                                                                                                                 | Every session closes; the row shows done with the time; Reopen reopens it in Linear and every session (D-USE-97)                                             | `phone-today / Linear updating, closed in Linear / 402 / light` (`work/today/states/linear-updating.md`)                            |

## Step 4: this session or all

The Item sheet of `[Synapse: desk Today layout]` (three sessions: Mon 12, Wed 14, Thu 15), Primary picked on the tier control. `?state=this-session-or-all`.

- **Top to bottom:** behind the scrim, the status bar (21:10), "Now", "Work". The sheet from y 520 (354 high), the grab handle; "Move to Primary" (heading); muted "[Synapse: desk Today layout] has three sessions: Mon 12, Wed 14, Thu 15."; two radio rows between rules: "This session" (selected, filled dot) with "Mon 12 only" muted, and "All sessions" with "Wed's ends 12:10 at the top of its ranges" muted; "Move", full width in ink.
- **What the person can do:** pick a row; Move applies it and the sheet returns to the Item sheet [ASSUMPTION]; a swipe down cancels and the tier stays as it was [ASSUMPTION]. A length change asks the same, with the length in the heading [ASSUMPTION: not drawn].
- **The consequence under All sessions** names where each other session's tier would end at the top of its ranges, in words, never red. Drawn, it names Wed only, though Wed 14 is already Primary on [`tier-and-sessions.md`](../day/item-sheet/states/tier-and-sessions.md) and Thu 15 would change [ASSUMPTION: placeholder data; the build names each session whose tier changes].
- **Words:** "Move to <tier>" · "<title> has three sessions: Mon 12, Wed 14, Thu 15." · "This session" · "Mon 12 only" · "All sessions" · "Wed's ends 12:10 at the top of its ranges" · "Move". Gloss proposes "Wed's Primary ends 12:10 at the top of its ranges" [PROPOSED: the tier named, as New task's line names it].
- **Access:** the rows are a radio group named by the heading, This session checked; each radio's name carries its line ("All sessions, Wed's ends 12:10 …"); Move is the default button; controls at least 44 × 44; focus returns to the tier control on close.
- **Desk:** inside the Item sheet's right-side panel (D-USE-103).

## Rules

- A session's Done never writes to Linear; only the task's done does (D-USE-57).
- The item sheet lists Sessions, each day and its tier; × drops a day, Add a day adds one (D-USE-54).
- One item never sits in two work blocks on the same day (refinement 6); a session is per day.
- Each session keeps its own work and firing time [ASSUMPTION]; "took" on its Done record is that session's work time.
- The last session's Done does not mark the task done ([done-for-today](../work/today/states/done-for-today.md)) (D-USE-65).

## Words

"session 1 of 3"; "Done for today"; "next session Wed 14"; "Session 2 is Wed 14."; "Undo"; "This session", "All sessions"; "Mark the task done". Step 4's own words are above.

## The notes on the boards

**phone-edit / tier, this session or all / 402 / light** (Notes · phone, editing and This week (row 6, cont.) @ x 7712, card "Tier, this session or all"):

> Tier, this session or all
>
> Changing the tier (or length) of a spread task asks This session (default) or All sessions, with the consequence for the others (D-USE-42's default).

## Rulings

- D-USE-40: a long task is one item placed as sessions.
- D-USE-42: an item can sit in several cells as sessions; editing one session asks first (its default).
- D-USE-54: a session's Done reads "Done for today"; the item sheet's Sessions.
- D-USE-57: the next session named, Undo; this session or all; Mark the task done in ···. D-USE-58: locked as drawn.
- D-USE-103: at the desk the ask opens inside the Item sheet's right-side panel.

## Criteria

| ID               | When                         | Then                                                                                            | Evidence                                        |
| ---------------- | ---------------------------- | ----------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| C-USE-sessions-1 | Done on a session            | Today's share closes, the next session is named, Undo offered; the Linear issue is unchanged    | `../work/today/captures/done-for-today-402.png` |
| C-USE-sessions-2 | A tier change on one session | This session or All sessions is asked, This session selected, the others' consequence under All | `captures/sessions-this-session-or-all-402.png` |
| C-USE-sessions-3 | All sessions, Move           | Every session takes the tier                                                                    | test                                            |
