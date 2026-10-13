---
target: specs/web/ux/work/today/states/brought-back.md
status: approved
promoted:
boards:
  - name: "today / brought back, Next follows order, Done / 1728 / light"
    page: "USE — work"
    at: [5424, 0]
    note: "Note · today / brought back, Done"
    capture: specs/web/epics/USE-daily-use/ux/work/today/captures/brought-back-1728.png
  - name: "phone-today / brought back, Next follows order, Done / 402 / light"
    page: "USE — work"
    at: [2410, 5760]
    note: "Notes · phone, Today (row 5) @ x 2410"
    capture: specs/web/epics/USE-daily-use/ux/work/today/captures/brought-back-402.png
rulings: [D-USE-44, D-USE-45, D-USE-47, D-USE-48, D-USE-51, D-USE-62]
---

# Today — brought back, Next follows order, Done

## What shows, top to bottom

**Desk (1728, 11:52):** [Portal sign-in] is back, first in Primary, looking like the others (no "back" caption); being first in order it is Next: the lifted shaded card with Start and Done, "fired 12 min" in its meta; the strip reads "Primary". [Case studies] still fires in place ("firing · 6 min", "worked 35 min"), the reminder line under it. The SMS copy in Secondary is done: the **Done record**, a filled done mark (muted circle, light check), the title receded, meta trimmed to client, project and ID, and "Took 1 h 10 · fired 32 min" on the right.

**Phone (402, 11:05):** [Portal sign-in] lifts as Next with **Resume** and Done (it had worked before firing; bringing back never restarts work time), meta "worked 40 min · fired 41 min". [Case studies] is done: the Done record sits under the title, "ALD-17 · Took 1 h 10 · fired 32 min" (D-USE-51). In Secondary, [Synapse: desk Today layout] has its sub-issues opened ("⌄ 2 sub-issues · 1 done"): each a checkbox; one placed alone on another day shows its day ("Thu 15").

## What the person can do

Start (or Resume) and Done on Next; the mark on a firing row brings it back; check a sub-issue (checks it in Linear, N6); open a row's sheet.

## The notes on the boards

**Note · today / brought back, Done** — today / brought back, Next follows order, Done / 1728 / light — round 5 (D-USE-44, D-USE-45, D-USE-48)

11:52. The thread finished and Taylor pressed the breathing mark on [Portal sign-in]. It simply looks like the others again: no "back" caption (D-USE-44). It keeps "fired 12 min" in its meta, a length. Being first in order, it is Next: the lifted card, shaded light grey, and the strip reads "Primary". Its work time does not restart until Start. [Case studies] still fires in place ("firing · 6 min", worked 35 min), with the reminder line under it. The SMS copy is done and shows the Done record on its row: a filled done mark, the title receded, meta trimmed to client, project and ID, and "Took 1 h 10 · fired 32 min" on the right (work time, then firing time; "fired" is left off when an item never fired). When every work item fires, the strip reads "Everything is firing." No sound, and nothing changes with how long something fires [NEEDS DECISION: a soft chime when something comes back; default off].

**Notes · phone, Today (row 5) @ x 2410** — Brought back, Next follows order, Done

A tap on the firing mark brings it back to its tier and place; first in order, it lifts as Next with Resume (bringing back never restarts work time). The Done record sits under the title on the phone: "Took 1 h 10 · fired 32 min". Sub-issues fold under their issue; opened, each is a checkbox, and one placed alone shows its day.

## Rulings

- D-USE-44: no "back · n min"; two clocks; bringing back never restarts work time.
- D-USE-45: back and first in order, it lifts as Next.
- D-USE-47, D-USE-48: "fired n min" once back; the Done record; "Took" is work time only [ASSUMPTION, D-USE-48].
- D-USE-51: the phone's Done record under the title; sub-issues fold.
- D-USE-62: no chime when an item comes back; the note's [NEEDS DECISION] is closed.
- [ASSUMPTION] The card reads Resume when the item has work time today and Start when it has none: the desk note says Start, the phone draws Resume after "worked 40 min".

## Widths

Drawn at 1728 and 402.

## Criteria

| ID                         | When                              | Then                                                                                                              | Evidence                         |
| -------------------------- | --------------------------------- | ----------------------------------------------------------------------------------------------------------------- | -------------------------------- |
| C-USE-today-brought-back-1 | The firing mark is pressed (or F) | The row looks like the others in its tier and place; no caption; "fired n min" in its meta; work time not running | `captures/brought-back-1728.png` |
| C-USE-today-brought-back-2 | Done on a fired item              | "Took <work> · fired <firing>"; "fired" left off if it never fired                                                | `captures/brought-back-402.png`  |
| C-USE-today-brought-back-3 | An item comes back                | No sound plays                                                                                                    | manual                           |
