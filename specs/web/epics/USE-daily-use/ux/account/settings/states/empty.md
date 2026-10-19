---
target: specs/web/ux/account/settings/states/empty.md
status: approved
promoted:
boards: []
not_drawn: "Not drawn on any page; Connections with no Google account and no Linear workspace"
rulings: [D-USE-56, D-USE-90]
---

# Settings › Connections — nothing connected

`?state=empty`. Where "Connect Linear" on the pool's From Linear tab lands (D-USE-56) when nothing is connected yet.

## What shows

Not drawn. [ASSUMPTION] The two sections as in `connections.md`, each with its title and explainer and no rows: Google Calendar shows only "+ Add a Google account" (no account on the right); Linear shows only "+ Add a workspace". The Clients switch, off, under Linear. No illustration and no centred empty message: the explainers say what each connection brings.

- One Google account but every calendar off: the rows show with empty rings and muted names, as Family and Holidays in `connections.md`; the day shows no Google events.
- Linear connected but Google not, or the reverse: the connected section as drawn, the other as above.

## Rulings

- D-USE-56: Linear not connected, the From Linear tab reads Connect Linear and goes to Settings › Connections.
- D-USE-90: Connections is this epic's only Settings section.

## Widths

Not drawn at any width; at the desk in Settings' main pane (D-USE-89).

## Criteria

| ID                     | When                 | Then                                                         | Evidence |
| ---------------------- | -------------------- | ------------------------------------------------------------ | -------- |
| C-USE-settings-empty-1 | Nothing is connected | Each section shows its title, explainer and its Add row only | capture  |
