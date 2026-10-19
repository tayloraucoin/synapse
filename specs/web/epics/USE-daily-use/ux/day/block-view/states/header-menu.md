---
target: specs/web/ux/day/block-view/states/header-menu.md
status: approved
promoted:
boards:
  - name: "block-view / header menu / 402 / light"
    page: "USE — daily use"
    at: [1446, 6420]
    note: "Note · header menu"
    capture: specs/web/epics/USE-daily-use/ux/day/block-view/captures/header-menu-402.png
rulings: [D-USE-24, D-USE-28, D-USE-69]
---

# Block view — header menu

··· tapped, from the day. Round 2. `?state=header-menu`. Its note is "Note · header menu" at x 1446, y 7350.

## What shows, top to bottom

As [`success.md`](success.md), except:

- ··· pressed: the round button fills ink with white dots.
- A pull-down (`DropdownMenu`) under it, its trailing edge on the column's: `--color-background` fill, hairline border, 10 px radius, one soft shadow (D-USE-28). Title "Today's Wellness only" (caption, semibold, muted). Then "Rename" (pencil), "Icon and colour" (a dotted circle), a 1 px separator, "Delete block" (trash). Each row: a muted icon at the leading edge, the word in ink. Delete block is ink, never red.
- The menu covers the trailing part of the first rows ("Pee and…", "Start the…"); the rest unchanged.

## What the person can do

- "Rename": [ASSUMPTION] the name in the header becomes a field in place; today only.
- "Icon and colour": [ASSUMPTION] the icon picker with the block's colours (`../../../interactions/icon-picker/index.md`); today only.
- "Delete block": removes today's Wellness; see Rulings.
- A tap outside or Escape closes the menu.

## Words

"Today's Wellness only" (the menu's title: the scope, then the block's name), "Rename", "Icon and colour", "Delete block".

## The notes on the boards

**"block-view / header menu / 402 / light"**, note "Note · header menu" @ x 1446, y 7350:

> header menu · round 2 (D-USE-24)
>
> Tapping the round ··· button opens an iOS pull-down under it, titled with its scope, "Today's Wellness only". It holds Rename and Icon and colour, then Delete block after a gap, each with a trailing icon. Edit is no longer in the menu: it's a plain button beside ···, as in iOS lists. [ASSUMPTION: Delete block asks once, with Undo after.]

## Rulings

- D-USE-24: Edit beside a round ···; ··· opens a pull-down titled with its scope: Rename, Icon and colour, then Delete block, each with a trailing icon.
- D-USE-28 (later, wins): menus are shadcn dropdowns with leading muted icons and 1 px separators; the frame draws the icons leading, so the note's "trailing icon" is superseded by the frame and D-USE-28.
- open-1 (step 3 round 1, drawn): `[ASSUMPTION]` Delete block, from the day, asks once and offers Undo after. Decided (D-USE-69), as drawn: Delete block asks once (a confirm naming "today's Wellness only"), then the block goes from today, Block view returns to the day, and a `Toaster` offers Undo; Monday's usual keeps it. The confirm is not drawn [ASSUMPTION: a `Dialog` as Now's Start while one runs].

## Widths

Drawn at: 402. Not drawn at: the desk; scales up (D-USE-39).

## Criteria

| ID                             | When                               | Then                                                                                                                            | Evidence                       |
| ------------------------------ | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ |
| C-USE-block-view-header-menu-1 | ··· is tapped from the day         | A pull-down titled "Today's Wellness only" holds Rename, Icon and colour, a separator, Delete block, icons leading, nothing red | `captures/header-menu-402.png` |
| C-USE-block-view-header-menu-2 | A menu change is made from the day | It applies to today only                                                                                                        | test                           |
| C-USE-block-view-header-menu-3 | Delete block is chosen             | It asks once, then the block goes with Undo offered                                                                             | test                           |
