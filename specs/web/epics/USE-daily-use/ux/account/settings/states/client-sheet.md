---
target: specs/web/ux/account/settings/states/client-sheet.md
status: approved
promoted:
boards:
  - name: "settings / client, name colour logo / 402 / light"
    page: "USE — work"
    at: [10604, 7200]
    note: "Notes · phone, editing and This week (row 6, cont.) @ x 10604"
    capture: specs/web/epics/USE-daily-use/ux/account/settings/captures/client-sheet-402.png
rulings: [D-USE-42, D-USE-57, D-USE-58, D-USE-89, D-USE-95]
---

# Settings › Connections — client sheet

The client sheet for "Kestrel Health" [placeholder], opened from its row in the Clients list. `?state=client-sheet`.

## What shows, top to bottom

- Behind a scrim: Connections ("‹ Settings", "Connections").
- A `ResponsiveSheet` from about y 200 of 874, the grabber centred.
- Header: the title "Client" left, × right.
- The logo row: a 48 px rounded tile in the client's colour with its letter ("K", white), beside "Upload a logo" (medium) over "Or the letter and colour, as here" (muted).
- "Name", a label, over an `Input` holding "Kestrel Health".
- "Colour", a label, over six 36 px round swatches: rose (`--color-category-rose-dot`, picked: a ring around a smaller dot), leaf, amber, moss, slate (each `--color-category-<name>-dot`) and ink (`--color-foreground`).
- A muted line: "Sky, plum and clay stay with Work, events and firing."
- A row on hairlines: "Linear" left, and on the right, muted, what the client covers: "Lighthouse: Patient portal, Records import".
- "Save", a full-width primary `Button` (48 px, `--color-primary`).
- "Remove client · its work moves to Personal", a text button in `--color-destructive-text`.

## What the person can do

- **Upload a logo** picks an image [ASSUMPTION: the profile sheet's photo flow, `../../profile-sheet/index.md`, crop to the square tile; the logo then replaces the letter tile wherever the client shows]. With no logo, the letter and colour stand in, as here. A logo read from the Linear workspace is an [ASSUMPTION] from open-8 (the API read is not verified; this upload is the fallback).
- **Name** edits the client's name; its letter follows.
- **Colour** picks one of the six (D-USE-95). Sky, plum and clay are left out (D-USE-57, ruled by D-USE-95): they belong to Work, events and firing. Moss may be shared with To-dos' kind colour. The client's mark always carries its name or letter, so colour is never alone (N6's bend).
- **Linear** shows the projects or workspace the client covers; it is set from the workspace sheet (`workspace-per-project.md`) [ASSUMPTION: read-only here].
- **Save** saves the name, colour and logo and closes [ASSUMPTION: faded until a change, as the profile sheet's Save, D-USE-37]. × closes without saving.
- **Remove client** removes it; its work moves to Personal [ASSUMPTION: at once, with a toast and Undo; nothing in Linear changes].
- Opened by "Add a client": the same sheet, empty [ASSUMPTION: title "Client", the name focused, no Remove row].

## Words

As the surface's Words (`../words-and-access.md`).

## The notes on the boards

**settings / client, name colour logo / 402 / light** (Notes · phone, editing and This week (row 6, cont.) @ x 10604, the card for this frame):

> Client sheet
>
> Name, colour (not sky, plum or clay), logo upload or the letter tile, the Linear projects it covers. Removing a client moves its work to Personal.

## Rulings

- D-USE-57: a client sheet (name, colour, logo or letter tile); client colours avoid sky, plum and clay.
- D-USE-95: the six drawn are the client colours (rose, leaf, amber, moss, slate, ink); moss may be shared with To-dos, since the mark always carries its letter or logo. Ends D-USE-57's [PROPOSED].
- D-USE-42: logos from the Linear workspace or uploaded in Synapse.
- D-USE-89: at the desk the client sheet opens as the right-side panel.
- D-USE-58: locked as drawn.

## Widths

Drawn at: 402, as a sheet. At the desk: the right-side panel over Settings (D-USE-89).

## Criteria

| ID                            | When                   | Then                                                                                                        | Evidence                        |
| ----------------------------- | ---------------------- | ----------------------------------------------------------------------------------------------------------- | ------------------------------- |
| C-USE-settings-client-sheet-1 | A client row is tapped | The sheet opens: logo or letter tile, Name, Colour (six, no sky, plum or clay), Linear, Save, Remove client | `captures/client-sheet-402.png` |
| C-USE-settings-client-sheet-2 | Remove client          | The client goes; its work shows under Personal; Linear is unchanged                                         | test                            |
