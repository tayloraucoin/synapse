---
target: specs/web/ux/account/settings/states/offline.md
status: approved
promoted:
boards: []
not_drawn: "Not drawn on any page; Connections offline"
rulings: [D-USE-56, D-USE-64, D-USE-82, D-USE-87]
---

# Settings › Connections — offline

`?state=offline`.

## What shows

Not drawn. Connections shows what it last had, with a `StatusLine` at the top: "Offline. Changes wait until the connection is back." (N2's line) [ASSUMPTION].

- **Connect and disconnect wait:** "Add a Google account", "Add a workspace", ··· › Disconnect and "Disconnect <workspace>" are disabled, since they need Google or Linear [ASSUMPTION].
- **Synapse's own settings work** (D-USE-56: offline, everything works on the phone): a calendar's switch, the Clients switch, reordering clients, a project's client and the client sheet save on the phone and sync when back (D-USE-64's rule for edits) [ASSUMPTION]. A calendar switched on offline brings its events once synced; the events already synced stay on the day, read-only (D-USE-87).
- "synced <n> min ago" on the workspace sheet keeps its last time.
- Upload a logo waits for the connection [ASSUMPTION].

## Rulings

- D-USE-56: offline, everything works on the phone, with a StatusLine.
- D-USE-64: edits save on the phone and sync later.
- D-USE-82: N2's offline StatusLine on Set my days, the form borrowed.
- D-USE-87: Google events offline stay as last synced, read-only.

## Widths

Not drawn at any width; the same at every width.

## Criteria

| ID                       | When    | Then                                                                                                                              | Evidence |
| ------------------------ | ------- | --------------------------------------------------------------------------------------------------------------------------------- | -------- |
| C-USE-settings-offline-1 | Offline | The StatusLine shows; connect and disconnect are disabled; switches, clients and mappings save on the phone and sync on reconnect | test     |
