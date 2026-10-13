---
target: specs/web/ux/account/avatar-menu/index.md
status: approved
promoted:
design:
  file: "Synapse, 01M49AX02VV4SSBKNCN6NRTS6Y"
  pages: ["USE — set up"]
  rows:
    - "USE — set up · Row label · Account"
    - "USE — set up · Row label · Archive"
  locked: 2026-10-10 (D-USE-49)
---

# Avatar menu — account

Handoff pass, the ledger of the boards. Sources: N2 "Avatar menu" and its Amendments; notes 76–77; round 1; step 9 round 1 (the archived menus) and step 12 round 1 (the Account row, "USE — set up", y 10080); D-USE-5, D-USE-28, D-USE-37, D-USE-88, D-USE-89. The intent-pass flat file is folded in here. Every state is a file in `states/`. Words, access, instrumentation and criteria: [`words-and-access.md`](words-and-access.md).

## Job

Reach Set my days, Meal topics, the profile, the install steps and Settings from any tab. Setting the days is real work but not daily work, so it sits one tap from every screen without taking a tab (note 76). Done is a row tapped, or the menu closed with nothing changed.

## Entry and exit

- **Entry:** the `Avatar` at the top right of the `AppHeader` on every tab (Now, Schedule, Review). It used to open Settings; now it opens this menu (D-USE-5). At the desk, the avatar in the rail footer (D-USE-89). [ASSUMPTION: focused screens with no tabs (Orient, Review the day, the Ready, go welcome) carry no avatar, as drawn.]
- **Exit, by row:**
  - "Set my days" opens Set my days ([`../../set-my-days/set-my-days/index.md`](../../set-my-days/set-my-days/index.md)) on the week, which bends N2's "on today's weekday" (that file's Entry, D-USE-49).
  - "Meal topics" opens the Meal topics sheet ([`../../interactions/meal-topics.md`](../../interactions/meal-topics.md)).
  - "Profile" opens the Profile sheet ([`../profile-sheet/index.md`](../profile-sheet/index.md), `?sheet=profile`).
  - "Install the app" opens the Install sheet ([`../install-sheet/index.md`](../install-sheet/index.md), `?sheet=install`) on the device's platform tab.
  - "Settings" opens Settings ([`../settings/index.md`](../settings/index.md)), where the avatar used to go (round 1); Settings › Connections holds the calendars and Linear workspaces (D-USE-90, D-USE-91).
- **Exit, closed:** a tap outside the menu, Escape, or a second tap on the avatar closes it; nothing changes and the screen beneath is as it was.

## Layout, top to bottom

A shadcn `DropdownMenu` (D-USE-28: background token, hairline border, 10 px radius, leading muted icons, 1 px separators, one soft shadow, bending "no shadows"), 264 px wide, anchored under the avatar and aligned to its right edge. No scrim: a dropdown, not a sheet; the screen beneath stays sharp and visible (step 9).

1. **The avatar, pressed:** keeps an ink ring while the menu is open [PROPOSED, step 9; stands by D-USE-37].
2. **Who:** the photo at 40 px (or the initial, `states/no-photo.md`), then the name in the label weight and the email, muted small, beside it. Not a control [ASSUMPTION: Profile is the row that opens the profile].
3. A 1 px separator.
4. **Rows, 44 px each, a 20 px leading glyph and a label:** "Set my days" (a calendar), "Meal topics" (a play button in a frame).
5. A 1 px separator.
6. **Rows:** "Profile" (a person), "Install the app" (a phone with a down arrow; only while not installed), "Settings" (a cog).

Installed: five rows; not installed: six (N2 Amendments, D-USE-88). There is no Help row (D-USE-88), so the first-go teaching is shown once ever and never again.

Components: all `@syn/ui` (`AppHeader`, `Avatar`, `DropdownMenu`).

## Primary action

None: it is a menu.

## States

| State         | File                      | Widths drawn | One line                                                  |
| ------------- | ------------------------- | ------------ | --------------------------------------------------------- |
| installed     | `states/installed.md`     | 402          | Five rows; "Install the app" is gone                      |
| not installed | `states/not-installed.md` | 402          | Six rows; "Install the app" after Profile                 |
| no photo      | `states/no-photo.md`      | 402          | The name's initial on paper, with a hairline              |
| offline       | `states/offline.md`       | —            | Not drawn: the menu opens; the screens behind show theirs |

Empty, loading, error and partial: N/A. The menu holds no data, so it has no empty, loading, error or partial state (N2). The name, email and photo are the account's, already on the device for the avatar.

## Platforms

Drawn at 402 only (phone, light). 768 to 1023 keeps the phone's `BottomNav` and header avatar (D-USE-74). At the desk (1024 and up, not drawn; D-USE-89):

- The avatar in the rail footer opens the same menu [ASSUMPTION: the dropdown opens upward from the footer, placed by its own collision handling].
- "Install the app" is hidden at the desk, since desk browsers notify without installing.
- "Profile" opens as the right-side panel (D-USE-60's form for sheets at the desk).
- "Settings" fills the main pane beside the rail, with nothing current in the rail.
- "Set my days" and "Meal topics" open as each file says at the desk.

Dark comes with the build's theme pass (D-USE-58).

## Interactions opened here

- Set my days: [`../../set-my-days/set-my-days/index.md`](../../set-my-days/set-my-days/index.md).
- Meal topics: [`../../interactions/meal-topics.md`](../../interactions/meal-topics.md).
- Profile: [`../profile-sheet/index.md`](../profile-sheet/index.md).
- Install the app: [`../install-sheet/index.md`](../install-sheet/index.md).
- Settings: [`../settings/index.md`](../settings/index.md).
