---
target: specs/web/ux/account/avatar-menu/words-and-access.md
status: approved
promoted:
---

# Avatar menu — words, access, criteria

The second half of [`index.md`](index.md), split to keep each file under its cap.

## Words

Gloss, as drawn and finished. No second person; no numbers.

- Rows, in order: "Set my days", "Meal topics", "Profile", "Install the app", "Settings". Sentence case, no ellipses: each opens its screen or sheet at once.
- Who: the account's name and email, as stored ("Taylor Aucoin", "taylor@example.com" on the boards are `[placeholder]`). A long name or email truncates with an ellipsis on one line [ASSUMPTION: not drawn]; the full value stays in the accessible name.
- No-photo initial: the name's first letter, upper case ("T").

## Access

Threshold. `[PROPOSED]` where the boards are silent.

- **The avatar:** a `Button` with `aria-haspopup="menu"` and `aria-expanded`. Its accessible name changes from "Settings" (D-USE-5) to "Account menu" [PROPOSED]. The photo inside it is decorative.
- **The menu:** `role="menu"`; each row a `menuitem` with its label as its name; the glyphs are decorative (`aria-hidden`); the separators are `separator`. The Who block is not focusable; it is read as the menu's description (`aria-describedby`: name, then email) [PROPOSED].
- **Focus:** on open, focus moves to "Set my days"; Up and Down move through the rows, wrapping; Home and End jump; typing a letter jumps to the row it starts. Enter or Space opens the row. Escape, Tab or a tap outside closes, and focus returns to the avatar. On a row's open, focus goes where that screen or sheet puts it.
- **Installed or not:** "Install the app" is removed from the menu, not hidden visually, so it is never in the reading order while installed.
- **Not colour alone:** the pressed avatar's ink ring pairs with `aria-expanded="true"`.
- **Targets:** rows 44 px tall across the menu's full width; the avatar's target is at least 44 × 44 around its 28 px circle.
- **Reduced motion:** the menu appears without its fade and scale.

## Instrumentation

None named by the narrative or the log [ASSUMPTION: Phase 1 sends no product events from this menu]. Never in any payload: the name, the email or the photo.

## Criteria

| ID                  | When                                   | Then                                                                                         | Evidence                         |
| ------------------- | -------------------------------------- | -------------------------------------------------------------------------------------------- | -------------------------------- |
| C-USE-avatar-menu-1 | The avatar is tapped on any tab        | The menu opens under it with no scrim: Who, Set my days, Meal topics, a rule, Profile…       | `captures/installed-402.png`     |
| C-USE-avatar-menu-2 | Synapse runs from the home screen      | Five rows; "Install the app" is absent from the menu and the reading order                   | `captures/installed-402.png`     |
| C-USE-avatar-menu-3 | Synapse runs in the browser on a phone | Six rows; "Install the app" sits between Profile and Settings                                | `captures/not-installed-402.png` |
| C-USE-avatar-menu-4 | Each row is chosen                     | It opens Set my days, Meal topics, Profile, the Install sheet or Settings as `index.md` says | manual                           |
| C-USE-avatar-menu-5 | Escape, Tab or a tap outside           | The menu closes, nothing changes, focus returns to the avatar                                | manual                           |
| C-USE-avatar-menu-6 | The menu is open                       | No Help row is present                                                                       | `captures/installed-402.png`     |
| C-USE-avatar-menu-7 | Width 1024 and up                      | The rail footer's avatar opens the same menu, with no "Install the app"                      | manual                           |
| C-USE-avatar-menu-8 | Each `?state=` key of `states/`        | That state renders (canon C-P08)                                                             | capture                          |

## Decisions and open items

- D-USE-5 (the avatar opens a menu, not Settings), D-USE-28 (menus are shadcn dropdowns), D-USE-37 (step 12 round 1 approved as drawn, marks standing), D-USE-49 (lock), D-USE-58 (dark at the theme pass), D-USE-74 (768 to 1023 keeps `BottomNav`), D-USE-88 (the rows; no Help row; N2 amended), D-USE-89 (the desk).
- Open carried here: the avatar menu's half of "Step 12 round 1: avatar menu, profile sheet, install sheet" (`../../day/open/open-7.md`); the avatar menu's part of "Set my days, step 9 round 1" (`../../day/open/open-3.md`: Meal topics, the ink ring, no scrim); the Meal topics [ASSUMPTION] in "Audit against N5 and the States tables" (`../../day/open/open-7.md`), ended by D-USE-88.
