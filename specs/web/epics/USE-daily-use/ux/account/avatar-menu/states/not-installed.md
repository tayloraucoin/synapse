---
target: specs/web/ux/account/avatar-menu/states/not-installed.md
status: approved
promoted:
boards:
  - name: "avatar-menu / not installed / 402 / light"
    page: "USE — set up"
    at: [482, 10080]
    note: "Frame @ x 482, y 11010"
    capture: specs/web/epics/USE-daily-use/ux/account/avatar-menu/captures/not-installed-402.png
rulings: [D-USE-37, D-USE-88, D-USE-89]
---

# Avatar menu — not installed

Synapse open in the phone's browser, not on the home screen. `?state=not-installed`.

## What shows, top to bottom

- Behind the menu, Now at 7:14, as `installed.md`.
- The menu as `installed.md`, with one more row after "Profile": "Install the app", its glyph a phone with a down arrow. Six rows: "Set my days", "Meal topics", a separator, "Profile", "Install the app", "Settings".

## What the person can do

- "Install the app" opens the Install sheet ([`../../install-sheet/index.md`](../../install-sheet/index.md)) on the device's platform tab.
- Every other row as `installed.md`. After the once-only offer on Set my days, this row is the only way to install (`../../../set-my-days/set-my-days/states/install-offer.md`).

## Words

"Install the app".

## The notes on the boards

**avatar-menu / not installed / 402 / light** (Frame @ x 482, y 11010):

> Avatar menu, not installed
>
> "Install the app" sits after Profile and opens the install sheet on the device's platform. Settings goes where the avatar used to go; Settings › Connections (step 9, x 7712) holds the calendars and Linear workspaces.

## Rulings

- D-USE-88: "Install the app" only while not installed, after Profile.
- D-USE-89: hidden at the desk, since desk browsers notify without installing.
- D-USE-37: approved as drawn.
- The note's "step 9, x 7712" is where Settings › Connections was first drawn; it now sits in the Account row at x 6266 ([`../../settings/index.md`](../../settings/index.md)).
- Superseded, not specced: `avatar-menu / not installed / 402 / light` ("USE — set up", Archive, x 964, y 11340), step 9's frame, replaced by step 12's (D-USE-37; the Archive row label: "Step 9's avatar menus: superseded by step 12's"). It draws the same six rows; its note read in full:

  > Avatar menu · not installed
  >
  > The row's opening frame: the avatar on any tab opens a shadcn dropdown, photo, name and email on top. [ASSUMPTION] Meal topics joins as an entry beside Set my days, since its sheet (D-USE-28) has no other home. [PROPOSED] The pressed avatar takes an ink ring. No scrim: a dropdown, not a sheet.

  What step 12 changed: the frame moved into the Account row with its siblings and a note naming Install the app's place and Settings' role; the ink ring and no scrim stand (D-USE-37), and Meal topics' [ASSUMPTION] is ended by D-USE-88.

## Widths

Drawn at: 402. At the desk: N/A, the row is hidden and the menu is `installed.md`'s (D-USE-89).

## Criteria

| ID                                | When                           | Then                                                 | Evidence                         |
| --------------------------------- | ------------------------------ | ---------------------------------------------------- | -------------------------------- |
| C-USE-avatar-menu-not-installed-1 | A phone browser, not installed | "Install the app" sits between Profile and Settings  | `captures/not-installed-402.png` |
| C-USE-avatar-menu-not-installed-2 | "Install the app" is chosen    | The Install sheet opens on the device's platform tab | manual                           |
