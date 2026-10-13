---
target: specs/web/ux/day/todos/states/loading.md
status: approved
promoted:
boards: []
not_drawn: "Not drawn on any page; the notification's note leaves loading [FILL] at handoff"
rulings: [D-USE-69]
---

# To-dos tray — loading

`?state=loading`.

## What shows

Not drawn. Decided (D-USE-69), the tray loads with its screen and has no spinner of its own. Closed, the trigger reads "To-dos" alone until the list arrives, then the first title fades in. Open, one `SkeletonRow` stands where the rows go, above "Add a to-do", which works at once (a to-do added while loading joins the list when it arrives).

## Rulings

None rules this state. The intent file left it [FILL] at handoff; the board note "Loading and partial stay [FILL] at handoff" (`notification.md`).

## Widths

Not drawn at any width; the default holds at every width.

## Criteria

| ID                    | When                        | Then                                                                | Evidence |
| --------------------- | --------------------------- | ------------------------------------------------------------------- | -------- |
| C-USE-todos-loading-1 | The to-dos have not arrived | No spinner and no count; closed reads "To-dos"; "Add a to-do" works | manual   |
