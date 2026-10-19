---
target: specs/web/ux/account/settings/states/connecting.md
status: approved
promoted:
boards: []
not_drawn: "Not drawn on any page; Google or Linear connect in progress, or failed"
rulings: [D-USE-40, D-USE-57]
---

# Settings › Connections — connecting, connect failed

`?state=connecting` and `?state=connect-failed` [ASSUMPTION: the two keys].

## What shows

Not drawn. [ASSUMPTION] for each, as the defaults:

- **In progress:** "Add a Google account" or "Add a workspace" opens the provider's own sign-in and consent (Google: read-only calendar access only, N6; Linear: the workspace picked there). While it is away, the Add row shows a quiet spinner in place of its plus and the words stay; it cannot be tapped twice. Back from the provider, the new account's calendars or the new workspace row appear in place (calendars each off until switched on [ASSUMPTION]; a new workspace "Connected", or with clients on, "No client" as its mapping line).
- **Cancelled** at the provider: back to Connections as it was, nothing said.
- **Failed:** under the Add row, in ink with an alert icon (never red): "Not connected. Try again." with "Try again" as a text button [PROPOSED: N2's "Not saved. Try again." form].
- **A connection that later fails** (a revoked or expired grant): the row's muted word reads "Reconnect" in place of "Connected" (clients off) or under the mapping line (clients on) [ASSUMPTION: not drawn]; the pool's From Linear failure on a row stays D-USE-56's "Not updated in Linear." with Try again.
- **A calendar list that fails to load** for a connected account: see `error.md`.

## Rulings

- D-USE-40: read-only calendars; each workspace connected on its own (N6).
- D-USE-57: the clients-on mapping line for a workspace.

## Widths

Not drawn at any width; the same at the desk, in Settings' main pane (D-USE-89).

## Criteria

| ID                          | When                | Then                                                                                     | Evidence |
| --------------------------- | ------------------- | ---------------------------------------------------------------------------------------- | -------- |
| C-USE-settings-connecting-1 | A connect fails     | "Not connected. Try again." in ink with an icon, under its Add row; nothing else changes | manual   |
| C-USE-settings-connecting-2 | Google is connected | Only read-only calendar access is asked for                                              | manual   |
