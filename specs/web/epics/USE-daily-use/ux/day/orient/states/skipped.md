---
target: specs/web/ux/day/orient/states/skipped.md
status: approved
promoted:
boards: []
not_drawn: "Nothing to draw: Orient is not shown on a second open the same day; the app goes straight to Review the day, or to Now after Ready, go (N3)"
rulings: [D-USE-5]
---

# Orient — opened again the same morning

## What happens

- Orient shows once a day. Once the wake is stamped (Orient was opened), a later open of the app or of `/orient` goes on without showing it:
  - before Ready, go: to Review the day;
  - after Ready, go: to Now (the List tab);
  - a closed day: never Orient [as built].
- The entry tree in `_global/navigation.md` carries this (D-USE-5, written at handoff).
- The lines written earlier are not lost; they stay with the day's record [ASSUMPTION: no way back to Orient's lines that day is drawn].

## What the person can do

Nothing on Orient; the screen opened is Review the day or Now.

## The notes on the boards

None: not drawn.

## Rulings

- **D-USE-5:** the entry tree sends a later open to Review the day or Now; Orient exits to Review the day.
- Review the day's `Breadcrumb` "‹ Orient" (D-USE-10) does go back to Orient before Ready, go, which shows it again, deliberately [ASSUMPTION: the back is the one way to see Orient twice].

## Widths

Not drawn at any width; the same at the desk.

## Criteria

| ID                     | When                                         | Then                             | Evidence |
| ---------------------- | -------------------------------------------- | -------------------------------- | -------- |
| C-USE-orient-skipped-1 | The app opens a second time before Ready, go | Review the day opens, not Orient | test     |
| C-USE-orient-skipped-2 | The app opens after Ready, go                | Now opens                        | test     |
