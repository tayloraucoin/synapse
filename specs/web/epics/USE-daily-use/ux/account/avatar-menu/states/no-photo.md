---
target: specs/web/ux/account/avatar-menu/states/no-photo.md
status: approved
promoted:
boards:
  - name: "avatar-menu / no photo / 402 / light"
    page: "USE — set up"
    at: [964, 10080]
    note: "Frame @ x 964, y 11010"
    capture: specs/web/epics/USE-daily-use/ux/account/avatar-menu/captures/no-photo-402.png
rulings: [D-USE-37, D-USE-88]
---

# Avatar menu — no photo

No photo on the account; drawn installed (five rows). `?state=no-photo`.

## What shows, top to bottom

- Behind the menu, Now at 7:14, as `installed.md`. The header avatar is the initial "T" on paper with a hairline circle, inside the pressed ink ring.
- The menu as `installed.md`, with Who's photo replaced by the initial "T" at 40 px, on paper with a hairline circle.
- Rows: "Set my days", "Meal topics", a separator, "Profile", "Settings". Not installed, "Install the app" follows Profile as `not-installed.md` (the two are independent).

## What the person can do

As `installed.md`. "Profile" opens the Profile sheet at its no-photo state, with "Add photo" ([`../../profile-sheet/states/no-photo.md`](../../profile-sheet/states/no-photo.md)).

## Words

The initial: the name's first letter, upper case.

## The notes on the boards

**avatar-menu / no photo / 402 / light** (Frame @ x 964, y 11010):

> Avatar menu, no photo
>
> The name's initial on paper, with a hairline, in the header and the menu (N2). Corrects step 9's frame, which put the initial on the photo's colour.

## Rulings

- N2: "The avatar and the menu show the name's initial on paper."
- D-USE-37: approved as drawn; D-USE-88: the rows.
- Superseded, not specced: `avatar-menu / installed, no photo / 402 / light` ("USE — set up", Archive, x 1446, y 11340), step 9's frame, replaced by this one (D-USE-37; the Archive row label: "Step 9's avatar menus: superseded by step 12's"). Its note read in full:

  > Avatar menu · installed, no photo
  >
  > Installed: Install the app is gone. No photo: the name's initial on paper, in the header and the menu. Offline needs no frame: the menu still opens and the screens behind it show their own offline.

  What step 12 changed: step 9's frame drew the initial in ink on the photo's warm colour, in the header and the menu, despite its note; step 12 draws it as the note and N2 say, on paper with a hairline. The rows are unchanged. Its offline line is carried in `offline.md`.

## Widths

Drawn at: 402. At the desk: the rail footer's avatar shows the same initial on paper with a hairline, and the menu as here (D-USE-89).

## Criteria

| ID                           | When                     | Then                                                                                   | Evidence                    |
| ---------------------------- | ------------------------ | -------------------------------------------------------------------------------------- | --------------------------- |
| C-USE-avatar-menu-no-photo-1 | The account has no photo | The header avatar and Who show the initial on paper with a hairline, never on a colour | `captures/no-photo-402.png` |
