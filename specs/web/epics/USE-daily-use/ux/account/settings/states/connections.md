---
target: specs/web/ux/account/settings/states/connections.md
status: approved
promoted:
boards:
  - name: "settings / connections / 402 / light"
    page: "USE — set up"
    at: [6266, 10080]
    note: "Frame @ x 6266, y 11010"
    capture: specs/web/epics/USE-daily-use/ux/account/settings/captures/connections-402.png
rulings: [D-USE-40, D-USE-49, D-USE-89, D-USE-90, D-USE-91]
---

# Settings › Connections — connections (clients off)

Connections with one Google account and two Linear workspaces, the Clients switch off (its default). `?state=connections`.

## What shows, top to bottom

- Status bar, 21:10.
- Header: a chevron and "Settings" (the back link), muted, then the title "Connections"; a hairline below.
- **Google Calendar**, a section title, with "Personal account [placeholder]" muted on the right.
- The explainer, muted small: "Events answered yes sit on the day. Maybe or not answered show faintly, to add if wanted."
- Four calendar rows, 52 px, on hairlines, each a 10 px dot, the name and a `Switch` on the right:
  - "Personal": plum dot (`--color-category-plum-dot`), switch on.
  - "Lighthouse team": plum dot, switch on.
  - "Family": an empty ring (`--color-input` edge), the name muted, switch off.
  - "Holidays": empty ring, name muted, switch off.
- "+ Add a Google account" (48 px, a plus glyph and the words).
- A rule between the sections.
- **Linear**, a section title, then the explainer, muted small: "Issues assigned to Taylor, to slot into work blocks."
- Two workspace rows, 52 px: a 24 px letter tile on `--color-surface` ("L", "S"), the name ("Lighthouse", "Studio"), "Connected" muted, and ··· on the right.
- "+ Add a workspace".
- A muted caption at the foot: "[placeholder calendars and workspaces]" (a canvas label, not a product string).

## What the person can do

- A calendar's switch turns it on or off at once: on, its events reach the day (answered yes as a plum band; maybe or not answered as a faint dashed band with Add to day; no hidden, `../../../dev-notes/google-calendar.md`); off, its events leave the day. Calendars are read-only: nothing is written to Google (N6, D-USE-40).
- "Add a Google account" starts Google's sign-in and consent for read-only calendar access [ASSUMPTION: OAuth in a new window; the new account's calendars join as their own group, each off until switched on]; in progress and failed: `connecting.md`.
- ··· on a workspace opens a menu with "Disconnect" (D-USE-91) [ASSUMPTION: one item; Disconnect acts with a toast and Undo, the workspace's issues leaving the pool and its placed items staying as Synapse-only items, never deleted in Linear].
- "Add a workspace" starts Linear's sign-in for that workspace (each workspace connects on its own, N6); see `connecting.md`.
- The Clients switch is not on this frame; turning it on gives `clients-on.md`.
- "Settings" goes back to the Settings list.

## Words

As the surface's Words (`../words-and-access.md`).

## The notes on the boards

**settings / connections / 402 / light** (Frame @ x 6266, y 11010):

> New · Settings › Connections
>
> [PROPOSED] Per the Google Calendar dev note: several Google calendars, each on or off (plum dot when on), Add a Google account; the Linear workspaces, each with ··· (Disconnect), Add a workspace. Settles step 12's [NEEDS DECISION] on where connections live. Names are [placeholder].

## Rulings

- D-USE-40: N6 approved, its Connections section with it (read-only calendars, several, each on or off; workspaces each connected on its own).
- D-USE-49: locked as drawn; the note's [PROPOSED] goes to the handoff as it stands.
- D-USE-91: with clients off, a workspace row is "Connected" with ··· (Disconnect), as this frame.
- D-USE-90: only Connections is specced; the rest of Settings is untouched.

## Widths

Drawn at: 402. At the desk: Settings fills the main pane beside the rail, nothing current in the rail (D-USE-89); this section as at 402.

## Criteria

| ID                           | When                           | Then                                                                                                                                      | Evidence                       |
| ---------------------------- | ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ |
| C-USE-settings-connections-1 | Connections opens, clients off | Google Calendar with each calendar's switch and dot, Add a Google account; Linear with "Connected" and ··· per workspace, Add a workspace | `captures/connections-402.png` |
| C-USE-settings-connections-2 | A calendar is switched off     | Its dot empties and its events leave the day; nothing is written to Google                                                                | test                           |
| C-USE-settings-connections-3 | ··· on a workspace             | "Disconnect" is offered                                                                                                                   | manual                         |
