---
target: specs/web/ux/account/settings/index.md
status: approved
promoted:
design:
  file: "Synapse, 01M49AX02VV4SSBKNCN6NRTS6Y"
  pages: ["USE — set up", "USE — work"]
  rows:
    - "USE — set up · Row label · Account"
    - "USE — work · Row label · Phone, editing and This week"
  locked: 2026-10-10 (D-USE-49); the phone rows 2026-10-12 (D-USE-58)
---

# Settings › Connections — account

Handoff pass, the ledger of the boards. Sources: N6 "Connections (Settings)"; the Google Calendar dev note ([`../../dev-notes/google-calendar.md`](../../dev-notes/google-calendar.md)); step 12 (the Account row on "USE — set up", x 6266); round 7, row 6 on "USE — work" (x 9640 to 10604); D-USE-56, D-USE-57, D-USE-58, D-USE-89 to D-USE-91. No intent-pass flat file existed for Settings. Words, access, instrumentation and criteria: [`words-and-access.md`](words-and-access.md). Every state is a file in `states/`.

## Scope

This epic specs **Settings › Connections only** (D-USE-90). Technical's calls bend the rest: Settings keeps only what USE draws, Connections, the avatar menu's Profile and Install, and sign out; the other sections (Account, Week, Day, Habits, Appearance, Data, About, Notifications) are legacy and do not return (`../../../technical/calls.md`). As built (USE-85): `/settings` is the list, a Connections row and Sign out, under "‹ Now", pushed from the avatar menu as Set my days is.

## Job

Connect what feeds the day: Google calendars (read-only, several, each on or off) and Linear workspaces (each connected on its own), and, when work is for others, the clients that group it (N6). Done is the connections set and the screen left; every change saves as made, except the client sheet's Save.

## Entry and exit

- **Entry:** the avatar menu's "Settings" ([`../avatar-menu/index.md`](../avatar-menu/index.md), D-USE-88), then a Connections row in the app's Settings list [ASSUMPTION: a row beside the existing sections, route `/settings/connections` after the app's `/settings/<section>` pattern]. Also "Connect Linear" on the pool sheet's From Linear tab when Linear is not connected (D-USE-56; drawn as `this-week / From Linear, not connected / 402 / light`, "USE — work" x 4338, y 7200, carried by [`../../work/this-week/states/linear-not-connected.md`](../../work/this-week/states/linear-not-connected.md)), and N2's "Connect Linear" on an item's "Link a Linear issue" row. Both land here.
- **Exit:** "‹ Settings" (top left) back to the Settings list. A workspace row (clients on) opens the workspace sheet (`states/workspace-per-project.md`); a client row or "Add a client" opens the client sheet (`states/client-sheet.md`); each closes back to Connections.

## Layout, top to bottom (phone 402)

1. **Header:** back link "‹ Settings" on the left, the title "Connections" under it; a hairline below.
2. **Google Calendar** section: title, the account on the right ("Personal account [placeholder]"), a muted explainer, then one 52 px row per calendar: a 10 px dot (plum `--color-category-plum-dot` filled when on; an empty ring in `--color-input` when off, the name muted), the calendar's name, a `Switch` right. Then "+ Add a Google account" (48 px). A rule closes the section.
3. **Linear** section: title, a muted explainer, one row per workspace in one of two forms (D-USE-91): clients off, a 24 px letter tile, the name, "Connected" muted and ··· (`states/connections.md`); clients on, the tile, the name over its mapping line, and a chevron (`states/clients-on.md`). Then "+ Add a workspace".
4. **Clients** (drawn only on): title, "Group work by who it's for. Off by default." and a `Switch`; when on, the order line, the client rows (grip, colour tile, name, what it covers), "+ Add a client", and the foot line "Work with no client shows under Personal." (`states/clients-on.md`). Where the Clients switch sits while off is not drawn [ASSUMPTION: the same title, line and switch under Linear, nothing below them].

Components: all `@syn/ui` (`Switch`, `Button`, `EllipsesMenu`, `DropdownMenu`, `ResponsiveSheet`, `SegmentedControl`, `Select`, `Input`, `Toaster`, `StatusLine`). The grip reorder is the drag pattern of Set my days' rows [ASSUMPTION].

## Primary action

None on Connections: switches and rows act at once. The client sheet has "Save" (`states/client-sheet.md`).

## States

| State                      | File                              | Widths drawn | One line                                              |
| -------------------------- | --------------------------------- | ------------ | ----------------------------------------------------- |
| connections (clients off)  | `states/connections.md`           | 402          | Four calendars, two workspaces "Connected" with ···   |
| clients on                 | `states/clients-on.md`            | 402          | Workspaces mapped, the client list in pool order      |
| workspace, per project     | `states/workspace-per-project.md` | 402          | One client or Set per project; Disconnect at the foot |
| client sheet               | `states/client-sheet.md`          | 402          | Name, colour, logo or letter, its Linear projects     |
| nothing connected          | `states/empty.md`                 | —            | Not drawn                                             |
| connecting, connect failed | `states/connecting.md`            | —            | Not drawn                                             |
| loading                    | `states/loading.md`               | —            | Not drawn                                             |
| error                      | `states/error.md`                 | —            | Not drawn                                             |
| offline                    | `states/offline.md`               | —            | Not drawn                                             |

As built (USE-85), each state is a scenario named `settings-<state>` (`settings-connections`, `-empty`, `-loading`, `-error` for the calendar list, `-save-fails`, `-connecting`, `-connect-fails`, `-offline`), at `/settings/connections?state=` and `/dev/parts?state=`.

## Platforms

Drawn at 402 only (phone, light). At the desk (1024 and up, not drawn): the rail footer's avatar opens the same menu; **Settings fills the main pane beside the rail, nothing current in the rail**, and Connections sits in it as at 402; the **client sheet opens as the right-side panel** (D-USE-89, D-USE-60's form). The workspace sheet at the desk: the right-side panel too [ASSUMPTION: D-USE-89 names Profile and the client sheet; every sheet scales up the same way, D-USE-39]. Dark comes with the build's theme pass (D-USE-58).
