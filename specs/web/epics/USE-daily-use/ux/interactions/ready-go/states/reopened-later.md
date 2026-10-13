---
target: specs/web/ux/interactions/ready-go/states/reopened-later.md
status: approved
promoted:
boards:
  - name: "ready-go / reopened later, no hand-off / 402 / light"
    page: "USE — daily use"
    at: [2410, 8940]
    note: "Frame @ x 2410, y 9870"
    capture: specs/web/epics/USE-daily-use/ux/interactions/ready-go/captures/reopened-later-402.png
rulings: [D-USE-5, D-USE-71]
---

# The Ready, go hand-off — reopened later

Step 4 of [`../index.md`](../index.md): the app opened again at 7:31 the same morning, after Start. Drawn in round 1 and still true (the row label). Now's layout is `../../../day/now/index.md`. Its note is the "Frame" at x 2410, y 9870.

## What shows, top to bottom

Now as it stands, with no hand-off and no quiet line:

- `AppHeader` "Now" with the avatar; the To-dos tray closed.
- Wellness, "7:05 to 8:00", ···.
- Done rows, checked and muted: Pee and weigh 2 min, Water 1 min, Start the cold bath 2 min.
- The lifted card: Meditate, "10 min · 7:10", its dot filled verdigris; Start and Done.
- Cold bath 10 min, with a grip.
- `BottomNav`.

## What the person can do

Everything Now allows (`../../../day/now/index.md`).

## Words

None of its own.

## The notes on the boards

**"ready-go / reopened later, no hand-off / 402 / light"**, "Frame" @ x 2410, y 9870:

> Reopened later · 7:31
>
> Opening the app again the same morning goes straight to Now as it stands, with no hand-off and no line (N3: Orient skipped on a reopen). The hand-off plays once a day, on Ready, go only.

## Rulings

- D-USE-5: a later open skips Orient (`../../../day/orient/states/skipped.md`).
- D-USE-71: a reopen before Start shows the welcome; after Start, Now (this frame).

## Widths

Drawn at: 402. At the desk: Now's own widths (D-USE-39).

## Criteria

| ID                              | When                                   | Then                                   | Evidence                          |
| ------------------------------- | -------------------------------------- | -------------------------------------- | --------------------------------- |
| C-USE-ready-go-reopened-later-1 | A reopen after Start                   | Now as it stands, no hand-off, no line | `captures/reopened-later-402.png` |
| C-USE-ready-go-reopened-later-2 | A reopen after Ready, go, before Start | The welcome                            | test                              |
