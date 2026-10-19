---
target: specs/web/ux/day/todos/states/empty.md
status: approved
promoted:
boards:
  - name: "now / tray empty / 402 / light"
    page: "USE — daily use"
    at: [1446, 12720]
    note: "Frame @ x 1446, y 13650"
    capture: specs/web/epics/USE-daily-use/ux/day/todos/captures/empty-402.png
rulings: [D-USE-26]
---

# To-dos tray — empty

No to-dos. Now at 7:14, the tray open. Drawn on Now; carried here (`../index.md`). `?state=empty`.

## What shows, top to bottom

- Now's header; the trigger row "To-dos" with a chevron up.
- One row: "+ Add a to-do", muted. No line saying the list is empty, no illustration, no count.
- The Wellness block directly under it, as in `open.md`.
- **Closed** (not drawn as its own frame): the trigger reads "To-dos" alone, with the chevron down and no title beside it.

## What the person can do

- Add a to-do, as in `open.md`.
- Close the tray.

## Words

"To-dos"; "Add a to-do". Nothing else.

## The notes on the boards

**now / tray empty / 402 / light** (Frame @ x 1446, y 13650):

> tray empty
>
> [ASSUMPTION] No to-dos: the open tray holds only "Add a to-do", and closed it reads "To-dos" alone. Never a count.

## Rulings

- D-USE-26: "an empty tray holds only 'Add a to-do'"; the note's [ASSUMPTION] and the intent file's are decided.
- N3: the tray never shows a count.

## Widths

Drawn at: 402. At the desk see `../index.md` › Platforms.

## Criteria

| ID                  | When                   | Then                                           | Evidence                 |
| ------------------- | ---------------------- | ---------------------------------------------- | ------------------------ |
| C-USE-todos-empty-1 | No to-dos, tray open   | Only "Add a to-do"; no empty message, no count | `captures/empty-402.png` |
| C-USE-todos-empty-2 | No to-dos, tray closed | The trigger reads "To-dos" alone               | manual                   |
