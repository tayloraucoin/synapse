---
target: specs/web/ux/account/settings/states/workspace-per-project.md
status: approved
promoted:
boards:
  - name: "settings / Linear workspace, client per project / 402 / light"
    page: "USE — work"
    at: [10122, 7200]
    note: "Notes · phone, editing and This week (row 6, cont.) @ x 10122"
    capture: specs/web/epics/USE-daily-use/ux/account/settings/captures/workspace-per-project-402.png
rulings: [D-USE-57, D-USE-58, D-USE-89, D-USE-91]
---

# Settings › Connections — Linear workspace, client per project

The workspace sheet for "Lighthouse" [placeholder], opened from its row with clients on, set per project. `?state=workspace-per-project`.

## What shows, top to bottom

- Behind a scrim: Connections ("‹ Settings", "Connections").
- A `ResponsiveSheet` from about y 150 of 874, the grabber centred.
- Header: the title "Lighthouse" left, × right.
- A muted line: "Linear workspace · connected · synced 2 min ago".
- "Whose work is it", a label, over a two-part `SegmentedControl`: "One client" | "Set per project", the second picked (white segment, bold words).
- "Projects", a muted label, then one 52 px row per Linear project: the project's emoji, the name, and a `Select` on the right:
  - "🏥 Patient portal": a rose square and "Kestrel ▾".
  - "📁 Records import": a rose square and "Kestrel ▾".
  - "🧠 Synapse": "No client ▾".
  - "📦 Admin": "No client ▾".
- A muted line: "The project emoji comes from Linear, or set one here. A project's client never writes to Linear."
- "Disconnect Lighthouse", a text button in `--color-destructive-text`, at the foot.

## What the person can do

- **One client** shows one `Select` for the whole workspace instead of the project rows [ASSUMPTION: not drawn; the row form "All projects belong to <client>" on Connections is its result].
- **Set per project:** each project's `Select` lists "No client" and each client in Settings order [ASSUMPTION: plus "Add a client…", opening the client sheet]; a pick saves at once. "No client" puts that project's work under Personal.
- The project emoji: from Linear, or set here [ASSUMPTION: a tap on it opens the icon picker, `../../../interactions/icon-picker/`].
- **Disconnect Lighthouse** disconnects the workspace [ASSUMPTION: as ··· › Disconnect in `connections.md`, with a toast and Undo; the sheet closes].
- × or a drag down closes back to Connections. Nothing here writes to Linear.

## Words

As the surface's Words (`../words-and-access.md`). "synced 2 min ago" is a time, live.

## The notes on the boards

**settings / Linear workspace, client per project / 402 / light** (Notes · phone, editing and This week (row 6, cont.) @ x 10122, the card for this frame):

> Linear workspace, per project
>
> One client for the whole workspace, or set per project. Never written to Linear. Disconnect sits at the foot.

## Rulings

- D-USE-57: each Linear workspace mapped as One client or Set per project.
- D-USE-91: the workspace page, reached by the chevron, with Disconnect at its foot.
- D-USE-58: locked as drawn.

## Widths

Drawn at: 402, as a sheet. At the desk: the right-side panel over Settings [ASSUMPTION: D-USE-89 names the client sheet; this sheet follows it, D-USE-39].

## Criteria

| ID                                     | When                                 | Then                                                                                                            | Evidence                                 |
| -------------------------------------- | ------------------------------------ | --------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| C-USE-settings-workspace-per-project-1 | A clients-on workspace row is tapped | The sheet opens: sync line, One client or Set per project, each project with its client, Disconnect at the foot | `captures/workspace-per-project-402.png` |
| C-USE-settings-workspace-per-project-2 | A project's client changes           | Its work regroups under that client in the pool; Linear is not written                                          | test                                     |
