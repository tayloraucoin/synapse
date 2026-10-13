---
target: specs/web/ux/account/overview.md
status: approved
promoted:
---

# account — overview

Handoff pass, the ledger of the boards. The account area is what sits behind the avatar (D-USE-1): the avatar menu, the profile sheet, the install sheet, and Settings › Connections. Decisions live in [`../day/decisions/`](../day/decisions/D-USE-88-92.md) (this area's are D-USE-1, 5, 28, 37, 57, 58, 88 to 92); coverage is in [`../boards/use-set-up/account.md`](../boards/use-set-up/account.md), the set-up Archive row ([`archive.md`](../boards/use-set-up/archive.md), step 9's menus) and "USE — work" row 6 ([`phone-editing-and-this-week.md`](../boards/use-work/phone-editing-and-this-week.md), the clients frames).

## Frame

Setting the days is real work but not daily work, so it is one tap from every screen without taking a tab (N2, note 76). The menu also holds Meal topics (D-USE-28, D-USE-88), the profile basics (refinement 3), the install steps for a PWA on iPhone and Android (note 98), and Settings, which the avatar used to open (round 1, D-USE-5). Every screen needs a signed-in session (refinement 3). Settings in this epic is Connections only: Google calendars, Linear workspaces and clients (D-USE-90).

## Surfaces and routes

| Route                                                                      | Surface                                    | Entry                                                                                                                                                                                | Exit                                                 |
| -------------------------------------------------------------------------- | ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------- |
| none: a menu                                                               | [`avatar-menu/`](avatar-menu/index.md)     | The avatar in `AppHeader` on every tab; the rail footer at the desk (D-USE-89)                                                                                                       | Set my days, Meal topics, Profile, Install, Settings |
| `?sheet=profile`                                                           | [`profile-sheet/`](profile-sheet/index.md) | "Profile"                                                                                                                                                                            | Closes                                               |
| `?sheet=install`                                                           | [`install-sheet/`](install-sheet/index.md) | "Install the app"; the once-only offer's "How" ([`../set-my-days/set-my-days/states/install-offer.md`](../set-my-days/set-my-days/states/install-offer.md)); the to-do sheet's "How" | Closes                                               |
| `/settings/connections` [ASSUMPTION: under the app's existing `/settings`] | [`settings/`](settings/index.md)           | "Settings", then Connections; "Connect Linear" on the pool's From Linear tab (D-USE-56)                                                                                              | "‹ Settings"                                         |

Meal topics is the shared sheet in [`../interactions/meal-topics.md`](../interactions/meal-topics.md); Set my days is [`../set-my-days/`](../set-my-days/overview.md).

## Navigation and shell

The avatar opens this menu instead of Settings; Settings is a row in it (D-USE-5). The install offer moves: once, after the first day is set, as a `StatusLine` with "How" (round 16), not after three reviewed days (`_global/shell.md`). No Help row; the first-go teaching is never re-shown (D-USE-88).

## Widths

Every frame here is drawn at 402. At the desk (1024 and up, D-USE-89): the rail footer's avatar opens the same menu; Profile and the client sheet open as the right-side panel (D-USE-60's form); Settings fills the main pane beside the rail, nothing current; Install the app is hidden.

## Design

Paper file `01M49AX02VV4SSBKNCN6NRTS6Y`: "USE — set up" step 12 (y 10080, locked D-USE-49) and "USE — work" row 6 at x 9640 to 10604 (locked D-USE-58). Light only; dark comes with the build's theme pass. Names, photos and workspaces are [placeholder].

## Open

None for this area. Client colours and client priority are ruled with the work rows (areas 7 and 8).
