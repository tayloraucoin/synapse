---
target: specs/web/ux/set-my-days/new-block-sheet/states/invalid.md
status: approved
promoted:
boards:
  - name: "new-block / invalid, no name / 402 / light"
    page: "USE — set up"
    at: [5302, 5040]
    note: "Frame @ x 5302, y 5970"
    capture: specs/web/epics/USE-daily-use/ux/set-my-days/new-block-sheet/captures/invalid-402.png
rulings: [D-USE-34]
---

# New block sheet — invalid, no name

The name cleared on the Stretch block of `from-a-tapped-time.md`. `?sheet=new-block&state=invalid` [ASSUMPTION: the state param].

## What shows, top to bottom

- As `from-a-tapped-time.md` (Training picked, 17:00 to 17:20, "Weekly on Monday", Checklist off), with the **Name** field empty, holding focus (a heavier ink edge, the caret).
- In the consequence line's place (muted): "A block needs a name. The kind's name fills in when a kind is picked; this one was cleared."
- The primary, faded (`--color-fill-muted` with muted ink), reading "Name needed".

## What the person can do

- Type a name: the line goes back to "Goes in…" and the primary to "Add block".
- Pick a kind again: its name fills in [ASSUMPTION: as on open, when the field is empty].
- × closes with nothing added.

## Words

"A block needs a name. The kind's name fills in when a kind is picked; this one was cleared." · "Name needed".

## The notes on the boards

**"new-block / invalid, no name / 402 / light"**, "Frame" @ x 5302, y 5970:

> Invalid
>
> The name was cleared. The field holds focus and the button, faded ink, reads "Name needed". No red, no shake.

## Rulings

- D-USE-34: "Name needed" on faded ink approved. No red and no shake (product rules: nothing red; canon's error states in words).
- N2's invalid row, "Add block stays disabled, and the label reads Name needed", stands.

## Widths

Drawn at: 402. At 1024 and wider: the right panel at `--sheet-w` (D-USE-39, D-USE-83).

## Criteria

| ID                              | When                | Then                                                               | Evidence                   |
| ------------------------------- | ------------------- | ------------------------------------------------------------------ | -------------------------- |
| C-USE-new-block-sheet-invalid-1 | The name is cleared | The field keeps focus; the primary is faded, "Name needed"; no red | `captures/invalid-402.png` |
| C-USE-new-block-sheet-invalid-2 | A name is typed     | The primary reads "Add block" and is live                          | test                       |
