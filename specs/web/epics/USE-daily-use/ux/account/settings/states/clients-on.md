---
target: specs/web/ux/account/settings/states/clients-on.md
status: approved
promoted:
boards:
  - name: "settings / connections, clients on / 402 / light"
    page: "USE — work"
    at: [9640, 7200]
    note: "Notes · phone, editing and This week (row 6, cont.) @ x 9640"
    capture: specs/web/epics/USE-daily-use/ux/account/settings/captures/clients-on-402.png
rulings: [D-USE-42, D-USE-57, D-USE-58, D-USE-89, D-USE-91, D-USE-95, D-USE-96]
---

# Settings › Connections — clients on

The Clients switch on: each Linear workspace says how its work maps to clients, and the client list sits in pool order. `?state=clients-on`.

## What shows, top to bottom

- Status bar, 21:10.
- Header: "‹ Settings" muted, then "Connections"; a hairline below.
- A muted line: "Google Calendar · as drawn on "USE — set up"" (a canvas stand-in: the Google Calendar section of `connections.md` sits here unchanged).
- **Linear**, a section title (no explainer line on this frame [ASSUMPTION: the explainer of `connections.md` stays; the stand-in left it out]).
- Two workspace rows, 56 px, each a 24 px tile, the name over a muted mapping line, and a chevron on the right (D-USE-91):
  - "Lighthouse" (tile "L" on `--color-surface`): "Set per project · 3 projects for clients".
  - "Alder Studio" (tile "A" in moss, the client's colour): "All projects belong to Alder Studio".
- "+ Add a workspace".
- **Clients**, a section title, with "Group work by who it's for. Off by default." muted under it and a `Switch`, on, at the right.
- A muted line: "In this order in the pool. Hold the grip to reorder."
- Two client rows, 52 px: a six-dot grip, a 20 px colour tile with the client's letter, the name, and what it covers, muted, on the right:
  - "Kestrel Health" (rose tile, "K"): "2 projects".
  - "Alder Studio" (moss tile, "A"): "a workspace".
- "+ Add a client".
- A muted foot line: "Work with no client shows under Personal."

## What the person can do

- A workspace row opens its workspace sheet (`workspace-per-project.md`), where the mapping is set and Disconnect sits at the foot.
- The Clients switch turns clients off: the list hides, workspace rows go back to "Connected" with ··· (`connections.md`), and the pool's client filter is not shown (row 6's note on the client filter sheet) [ASSUMPTION: the clients and mappings are kept for when it is turned on again].
- Hold a grip and drag to reorder; the order is the pool's grouping order and the client priority, and it breaks ties in the pool's Sort (D-USE-42's Pool v3, D-USE-96; the client filter lists clients in this order). It is the same order as the drag of a client head in the pool: either place changes it (D-USE-96). Saves at once.
- A client row opens the client sheet (`client-sheet.md`); "Add a client" opens it empty [ASSUMPTION: the name focused, the first free colour picked].
- Nothing here is written to Linear (D-USE-57's workspace note).

## Words

As the surface's Words (`../words-and-access.md`). The count in "3 projects for clients" and "2 projects" counts projects in Settings, not anything about the day.

## The notes on the boards

**settings / connections, clients on / 402 / light** (Notes · phone, editing and This week (row 6, cont.) @ x 9640, the card for this frame):

> Connections, clients on
>
> Each Linear workspace says how its work maps to clients. The Clients switch (off by default) shows the client list, in pool order, with a grip to reorder and Add a client.

## Rulings

- D-USE-57: Settings › Connections with the Clients switch on, clients in pool order with a grip, each Linear workspace mapped as One client or Set per project.
- D-USE-91: with clients on, a workspace row is the mapping line and a chevron to the workspace page; Disconnect sits at its foot.
- D-USE-42: the drag order of clients is client priority.
- D-USE-96: one order kept in two places, this list's grip and the pool's client heads; no separate priority field (answers open-8's "where client priority is first set").
- D-USE-95: Alder Studio in moss, as drawn, is allowed (the client colours).
- D-USE-58: locked as drawn.

## Widths

Drawn at: 402. At the desk: in Settings' main pane beside the rail (D-USE-89); the grip reorders by mouse drag as well [ASSUMPTION].

## Criteria

| ID                          | When                            | Then                                                                                                                           | Evidence                      |
| --------------------------- | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ----------------------------- |
| C-USE-settings-clients-on-1 | The Clients switch is turned on | The client list, the order line, Add a client and the Personal line show; workspace rows show their mapping line and a chevron | `captures/clients-on-402.png` |
| C-USE-settings-clients-on-2 | A client is dragged to the top  | The pool groups that client first and the client filter lists it first                                                         | test                          |
| C-USE-settings-clients-on-3 | Any change here                 | Nothing is written to Linear                                                                                                   | test                          |
