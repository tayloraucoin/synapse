---
target: specs/web/ux/account/avatar-menu/states/installed.md
status: approved
promoted:
boards:
  - name: "avatar-menu / installed / 402 / light"
    page: "USE — set up"
    at: [0, 10080]
    note: "Frame @ x 0, y 11010"
    capture: specs/web/epics/USE-daily-use/ux/account/avatar-menu/captures/installed-402.png
rulings: [D-USE-28, D-USE-37, D-USE-88]
---

# Avatar menu — installed

Synapse running from the home screen, with a photo. The menu opened from Now at 7:14. `?state=installed`.

## What shows, top to bottom

- Behind the menu, Now, sharp, with no scrim: the `AppHeader` ("Now", the avatar top right with its ink ring); the To-dos tray closed ("To-dos", "Call the mechanic…"); Wellness "7:05 to 8:00" with "Pee and weigh" (2 min), "Water" (1 min) and "Start the cold bath" (2 min) checked, the lifted card "Meditate" ("10 min · 7:10", Start and Done), then "Cold bath" (10 min); the `BottomNav` (Now, Schedule, Review). All `[placeholder]` day content.
- The `DropdownMenu`, 264 px, under the avatar:
  - Who: the photo at 40 px `[placeholder]`, "Taylor Aucoin", "taylor@example.com".
  - A separator.
  - "Set my days", "Meal topics".
  - A separator.
  - "Profile", "Settings".
- Five rows; no "Install the app"; no Help row.

## What the person can do

Each row opens its screen or sheet (`../index.md` › Entry and exit). A tap outside, Escape or the avatar closes the menu.

## Words

As the surface's Words (`../words-and-access.md`).

## The notes on the boards

**avatar-menu / installed / 402 / light** (Frame @ x 0, y 11010):

> Avatar menu, installed
>
> N2's three rows plus step 9's Meal topics [ASSUMPTION, still]: Set my days, Meal topics, a rule, Profile, Settings. "Install the app" is gone once Synapse runs from the home screen. The pressed avatar keeps its ink ring; no scrim (step 9).

## Rulings

- D-USE-88: these rows as drawn; N2 amended, which ends the note's "[ASSUMPTION, still]" on Meal topics (the frame's layer name "Row · Meal topics [ASSUMPTION]" is stale) and rules out a Help row.
- D-USE-37: step 12 round 1 approved as drawn; the ink ring [PROPOSED] stands.
- D-USE-28: the menu is a shadcn dropdown with one soft shadow.
- Installed means Synapse runs in standalone display mode [ASSUMPTION: `display-mode: standalone`, or `navigator.standalone` on iPhone].

## Widths

Drawn at: 402. At the desk: the rail footer's avatar opens the same menu, and "Install the app" is always hidden there, so the desk always shows this state's five rows (D-USE-89; `../index.md` › Platforms).

## Criteria

| ID                            | When                         | Then                                                               | Evidence                     |
| ----------------------------- | ---------------------------- | ------------------------------------------------------------------ | ---------------------------- |
| C-USE-avatar-menu-installed-1 | Installed, the avatar tapped | Who, Set my days, Meal topics, a rule, Profile, Settings; no scrim | `captures/installed-402.png` |
| C-USE-avatar-menu-installed-2 | The menu is open             | The avatar carries an ink ring and `aria-expanded="true"`          | `captures/installed-402.png` |
