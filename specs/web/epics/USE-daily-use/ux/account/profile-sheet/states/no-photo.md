---
target: specs/web/ux/account/profile-sheet/states/no-photo.md
status: approved
promoted:
boards:
  - name: "profile-sheet / no photo / 402 / light"
    page: "USE — set up"
    at: [1928, 10080]
    note: "Frame @ x 1928, y 11010"
    capture: specs/web/epics/USE-daily-use/ux/account/profile-sheet/captures/no-photo-402.png
rulings: [D-USE-37]
---

# Profile sheet — no photo

No photo on the account. `?state=no-photo`.

## What shows, top to bottom

- As `default.md`, with the photo block changed:
  - The initial "T" in a 96 px circle on paper with a hairline (the avatar menu's no-photo form, `../../avatar-menu/states/no-photo.md`).
  - "Add photo", underlined, in place of "Change photo".
- Name "Taylor Aucoin", Email "taylor@example.com", Save faded, as `default.md`.

## What the person can do

- **Add photo** works as Change photo: the device's own picker, then `crop.md`, then `uploading.md`.
- Everything else as `default.md`.

## Words

"Add photo".

## The notes on the boards

**profile-sheet / no photo / 402 / light** (Frame @ x 1928, y 11010):

> Profile, no photo
>
> The initial in a circle on paper, and "Add photo" (N2).

## Rulings

- N2: "The initial in a circle, and 'Add photo'."
- D-USE-37: approved as drawn. With no Remove photo in Phase 1 ([ASSUMPTION], standing), this state is reached only by an account that never had a photo.

## Widths

Drawn at: 402. At the desk: the right-side panel, as here (D-USE-89).

## Criteria

| ID                             | When                     | Then                                                  | Evidence                    |
| ------------------------------ | ------------------------ | ----------------------------------------------------- | --------------------------- |
| C-USE-profile-sheet-no-photo-1 | The account has no photo | The initial on paper with a hairline, and "Add photo" | `captures/no-photo-402.png` |
