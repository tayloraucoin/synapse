---
target: specs/web/ux/work/today/words-and-access.md
status: approved
promoted:
---

# Today — words, access, instrumentation, criteria

The rest of [`index.md`](index.md)'s slots, split out to keep the index under its cap. State-only strings sit in each state file.

## Words (Gloss)

Strings shared by every state, as drawn:

- Rail: "Today", "Week", "Schedule", "Workflow (beta)". Header: the date as "Monday, 12 October"; the time as "10:20"; "+ Add"; "Step away". Strip (desk): "NEXT", the tier word ("Primary"), "Go". Tiers: "Urgent", "Primary", "Secondary", "Stretch"; "To-dos". Day column: "The day", "whole day, then 8:00 to 18:00", "Work ends 17:00", "Lights out 22:30".
- Block band and header: "Work 9:30 to 12:00 · Kestrel weekly at 11:00, in 40 min" (desk band), "9:30 to 12:00 · Kestrel weekly at 11:00" (phone header).
- Rows: lengths only, never counts (D-USE-47): "30 to 60 min", "2 to 4 h", "3 Medium · 1 to 2 h", "session 1 of 3", "No Linear". Firing: "firing · 4 min" (desk, one line), "firing" over "5 min" (phone, two lines, D-USE-51); past an hour "1 h 20". "worked 35 min" while firing; "fired 12 min" once back (D-USE-47). Done record: "Took 1 h 10 · fired 32 min", "fired" left off when the item never fired (D-USE-48).
- Cards: "Start", "Done", "Pause", "Resume", "Prompt sent"; "WORK TIME"; "left of 2 h · worked 35 min since 9:45".
- Reminder: "While it fires: Kegels · daily", once, under the first firing row (D-USE-47).
- Step 8's states (402): the cap helpers "Two is the usual for Primary." and "Four is the usual for Secondary." (D-USE-65); a folded heading's "+ Add" [PROPOSED]; the later block's line "What's still open from the morning's Work. What was done stays in the 9:30 block." [PROPOSED]; the meeting band "10:30 to 11:00 · the work below waits until 11:00" and "in 10 min" [PROPOSED]; the card's consequence "would end 10:50, past [Design sync]" [PROPOSED]; the lifted meeting "At 11:00", "Meeting · 11:00 to 11:15" with its "Work" or "Personal" `Tag`. A consequence is a time, never a warning colour.
- No second person, no question marks, no "missed" (product rules). Firing minutes are never seconds (N6); the work clock alone shows seconds ("1:24:10"), as the phone's running card (D-USE-29).
- Gloss passed (area 8), the round 7 Open line's words: "firing / n min" in two lines, "Step away", "Everything is firing." with "To-dos, while it all fires", "Left open on Friday, at the tier it had", "Bring these in", the swipe hint, and the stepped-away bar's words (D-USE-46) stand as drawn. Each is a label or one plain fact in sentence case, with no second person, no question, no count and no miss (`_global/copy-register.md`); the hint addresses no one ("Swipe a work row right to send it firing."). The row 6 words ("Place", "Spread it", "two days make it two sessions") are passed in the files that carry their frames; "Place in Primary · ends 11:40" sits on B, not picked (D-USE-54).

## Access (Threshold)

- **Desk keys** (D-USE-62): **F** fires the focused row, or brings it back when firing; **D** Done on the focused row; **J** and **K** move focus down and up through the rows in order (tiers, then To-dos); **Enter** goes to Next (focuses it; on the strip it is Go). [ASSUMPTION] Keys act only when focus is not in a text field or an open menu or sheet. Focus moves without animation (A-15).
- **Focus order (desk):** rail, week strip, header (Step away, + Add), Next strip's Go, rows top to bottom (each row: lead slot, then the row as a link to its sheet, then its card buttons), To-dos, day column.
- **Names [PROPOSED]:** the ring "Prompt sent, <title>"; the firing mark "Bring back <title>, firing <n> min"; the done mark "Done, <title>"; Step away "Step away, pause work time"; the row "<title>, <tier>, <length>". Next adds ", next" to its row's name.
- **Announced** (polite live region) [PROPOSED]: "<title> firing", "<title> back", "Next: <title>", "Stepped away at 10:42", "Work time resumed", "Not updated in Linear."
- **Colour never alone:** firing carries its words; running carries WORK TIME; the tier square sits with its word; priority chips carry a glyph; the client tile carries a letter (D-USE-51). On the phone while an item runs, Next is a shaded row and nothing else marks it (no strip, D-USE-51), as drawn, plus ", next" in its accessible name (D-USE-65).
- **Meetings [ASSUMPTION]:** the meeting band is not a control; its name reads "<meeting>, 10:30 to 11:00, in 10 min"; at its time "At 11:00: <meeting>" is announced once (polite). The cap helper is plain text tied to its heading (`aria-describedby`), never an alert.
- **Phone:** every target at least 44 × 44, the ring's whole lead slot (D-USE-53). Swipe right always has the ring and the long-press menu's Prompt sent as alternatives.
- **Reduced motion:** the firing halo holds still instead of breathing [PROPOSED]; the lift of Next changes without movement.
- **Contrast:** the receded title and the phone's 60 % meta (D-USE-51) must hold 4.5:1 on the background [ASSUMPTION: to verify at build; A-11].

## Instrumentation

None named on the boards or in the log. Timer and firing events are data ([`../../dev-notes/timers-across-devices.md`](../../dev-notes/timers-across-devices.md)), not analytics. [ASSUMPTION] No analytics event in this phase; any later one never carries an item's title, client, project or Linear ID.

## Criteria

| ID            | When                                | Then                                                                                                                                    | Evidence                                                                |
| ------------- | ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| C-USE-today-1 | `/today` at 1728                    | Rail, week strip, main column (720) and day column (340) as `captures/working-1728.png`                                                 | capture                                                                 |
| C-USE-today-2 | `/today` at 402 during Work         | Now with the Work block's tiers; no rail, week strip, day column or Next strip                                                          | `captures/working-402.png`                                              |
| C-USE-today-3 | Any change to firing, Done or order | Next is the first item, Urgent to Stretch then tier order, neither firing nor done                                                      | test of resolve-next                                                    |
| C-USE-today-4 | Any moment                          | At most one item has a running work timer                                                                                               | test                                                                    |
| C-USE-today-5 | Desk, focus on a row                | F, D, J, K, Enter act as D-USE-62                                                                                                       | manual                                                                  |
| C-USE-today-6 | Every row                           | Emoji in an 18 px slot with a 7 px gap; 22 px on the card title                                                                         | capture                                                                 |
| C-USE-today-7 | Any state                           | No count, streak or "missed"; no red except firing's dark rust words and the priority and due chips (bends named in D-USE-42, D-USE-49) | capture                                                                 |
| C-USE-today-8 | A meeting falls inside a Work block | The block stays one block; the meeting is a band in the flow, then lifts at its time; nothing is split                                  | `captures/meeting-coming-up-402.png`, `captures/meeting-lifted-402.png` |
| C-USE-today-9 | A tier passes its usual number      | A soft helper line; the add goes through                                                                                                | `captures/past-a-cap-402.png`                                           |
