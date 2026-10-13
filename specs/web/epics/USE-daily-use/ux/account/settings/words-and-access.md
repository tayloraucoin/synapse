---
target: specs/web/ux/account/settings/words-and-access.md
status: approved
promoted:
---

# Settings › Connections — words, access, criteria

The second half of [`index.md`](index.md), split to keep each file under its cap.

## Words

Gloss. As drawn; state-only strings sit in each state file. No second person. Names of calendars, workspaces, clients and projects on the canvas are `[placeholder]` (Personal, Lighthouse team, Family, Holidays; Lighthouse, Studio, Alder Studio; Kestrel Health; Patient portal, Records import, Synapse, Admin).

- Header: "Settings" (back), "Connections".
- Google Calendar: "Google Calendar", "<account> account" ("Personal account [placeholder]"), "Events answered yes sit on the day. Maybe or not answered show faintly, to add if wanted.", "Add a Google account".
- Linear: "Linear", "Issues assigned to Taylor, to slot into work blocks." (drawn on the clients-off frame only), "Connected", "Add a workspace", "Disconnect" (the ··· menu, not drawn open [ASSUMPTION: one item]).
- Mapping lines: "All projects belong to <client>", "Set per project · <n> projects for clients" (a count of projects in Settings, not a number about the day).
- Clients: "Clients", "Group work by who it's for. Off by default.", "In this order in the pool. Hold the grip to reorder.", "<n> projects" or "a workspace", "Add a client", "Work with no client shows under Personal."
- Workspace sheet: "Linear workspace · connected · synced <n> min ago", "Whose work is it", "One client", "Set per project", "Projects", "No client", "The project emoji comes from Linear, or set one here. A project's client never writes to Linear.", "Disconnect <workspace>".
- Client sheet: "Client", "Upload a logo", "Or the letter and colour, as here", "Name", "Colour", "Sky, plum and clay stay with Work, events and firing.", "Linear", "Save", "Remove client · its work moves to Personal".
- [PROPOSED] Undrawn lines, in N2's register: "Not connected. Try again." (a connect that fails), "Calendars didn't load." with "Try again", "Offline. Changes wait until the connection is back." (N2's StatusLine).

## Access

Threshold. `[PROPOSED]` where the boards are silent.

- **Focus and headings:** "Connections" is the page's h1; "Google Calendar", "Linear" and "Clients" are h2. Tab order follows the layout top to bottom; the back link first.
- **Names:** each calendar `Switch` "<calendar name>", its state read as on or off; the dot is decorative (the switch carries the state, so colour is never alone). ··· "More for <workspace>"; a clients-on workspace row is one link, "<workspace>, <mapping line>"; the Clients switch "Clients"; a grip "Reorder <client>"; a client row "<client>, <what it covers>".
- **Reorder without a drag:** the grip takes focus; Space picks up, the arrow keys move, Space drops, and the new place is announced ("Kestrel Health, 1 of 2") [PROPOSED]. A drag is never the only way.
- **Sheets:** focus moves to the sheet's title on open and returns to the row that opened it; × and Escape close. The project client selects are `Select`s named "<project> client, <value>". Colour swatches are a radio group "Colour", each named by its colour word ("Rose", "Leaf", "Amber", "Moss", "Slate", "Ink" [ASSUMPTION: the token names]), the picked one with its ring and `aria-checked`.
- **Disconnect and Remove** are text buttons in destructive text, named in full ("Disconnect Lighthouse", "Remove client Kestrel Health").
- **Announced (polite):** "Not saved. Try again." and a connect that fails; the toast after Disconnect or Remove with Undo reachable by keyboard [ASSUMPTION].
- **Targets:** every row 52 px or more; switches, grips and swatches at least 44 × 44 hit area. Reduced motion: sheets fade in place.

## Instrumentation

None named by the narrative or the log [ASSUMPTION: Phase 1 sends no product events from Settings]. Never in any payload: calendar, workspace, project or client names, account emails, logos.

## Criteria

| ID               | When                                                         | Then                                                                                              | Evidence                                                      |
| ---------------- | ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| C-USE-settings-1 | Settings opens from the avatar menu                          | Connections is reachable from the Settings list; the other sections are unchanged                 | manual                                                        |
| C-USE-settings-2 | "Connect Linear" on the pool's From Linear tab               | Connections opens                                                                                 | manual                                                        |
| C-USE-settings-3 | Clients off, then on                                         | Workspace rows switch between "Connected" with ··· and the mapping line with a chevron (D-USE-91) | `captures/connections-402.png`, `captures/clients-on-402.png` |
| C-USE-settings-4 | Any change on Connections                                    | Nothing is written to Google or Linear                                                            | test                                                          |
| C-USE-settings-5 | `/settings/connections` with each `?state=` key of `states/` | That state renders (canon C-P08)                                                                  | capture                                                       |
| C-USE-settings-6 | At 1024 and up                                               | Settings fills the main pane; the client sheet is the right-side panel                            | manual                                                        |

## Decisions and open items

- D-USE-40 (N6 approved: read-only calendars, several, each on or off), D-USE-42 (Pool v3: client order is client priority), D-USE-49 and D-USE-58 (locks), D-USE-56 (Connect Linear lands here), D-USE-57 (clients, workspace mapping, client sheet), D-USE-87 (Google events offline), D-USE-88 to D-USE-91.
- Open carried here: open-4 "Dev note: Google Calendar" (its Settings › Connections part) and the Connections part of "Set my days, step 9 round 3"; open-9 "Work on the phone, round 7" (Connections with clients, workspace per project, the client sheet, [PROPOSED] client colours); open-8 "Work at a desk, round 3" ([NEEDS DECISION] where client priority is first set: as drawn, the order of the Clients list, which is the pool's order; the logo [ASSUMPTION]).
- Left for areas 7 and 8, as stated: client colours [PROPOSED], client priority as the order.
- N6's "Push for an event's start": decided off, not in Phase 1 (D-USE-92). No push for Google events and no control on Connections.
