---
target: specs/web/ux/day/block-complete/states/not-done-closed.md
status: approved
promoted:
boards:
  - name: "block-complete / not done, closed / 402 / light"
    page: "USE — daily use"
    at: [1446, 15240]
    note: "Frame @ x 1446, y 16170"
    capture: specs/web/epics/USE-daily-use/ux/day/block-complete/captures/not-done-closed-402.png
rulings: [D-USE-28, D-USE-72]
---

# Block complete — not done, closed

Now at 7:40: "Complete Wellness" chosen from the block's ··· with Meditate and Cold bath unchecked. The close card, its disclosure closed. `?state=not-done-closed`. This is the card the other not-done states open from.

## What shows, top to bottom

Phone 402 × 874.

1. Status bar (7:40); "Now" with the avatar "T"; the To-dos tray closed.
2. The block's rows are gone; the **close card** sits centred in the space (hairline border, `--radius-card`, 20 px padding):
   - × (muted) top-left;
   - a 48 px round tile tinted leaf, a leaf check inside;
   - "Wellness complete" (heading, centred);
   - "Next" (caption, muted);
   - a filled clay dot, "Training" (semibold), "8:00" trailing; a hairline; a hollow ring, "then Breakfast" (muted), "9:00" trailing;
   - the full-width ink `Button` "Start Training";
   - `TextDisclosureButton` "Not done: Meditate, Cold bath" with a down chevron, centred, muted.
3. `BottomNav`, Now selected.

## What the person can do

- "Start Training": Training becomes the active block; Meditate and Cold bath stay simply not done (N4).
- ×: the card closes and the person stays; Now then shows the next block anyway (N4).
- "Not done: …": opens the list ([`not-done-do-now.md`](not-done-do-now.md); round 1's [`not-done-open.md`](not-done-open.md)).

## Words

"Wellness complete"; "Next"; "Training" "8:00"; "then Breakfast" "9:00"; "Start Training"; "Not done: Meditate, Cold bath".

## The notes on the boards

**"block-complete / not done, closed / 402 / light"**, note "Frame" @ x 1446, y 16170:

> not done, closed [PROPOSED words]
>
> "Complete Wellness" from ··· with items left: the block settles into the close card. Next as two rows (Training, then Breakfast), Start Training, × to stay. The disclosure names the items, "Not done: Meditate, Cold bath", instead of N4's "2 not done" (no counts).

## Rulings

- D-USE-28: the close card is for the not-done case.
- D-USE-72 (step 7 round 1): "[PROPOSED words]", the named disclosure with no count, × on the left to stay, and Next as two rows: Decided (D-USE-72), as drawn. Supersedes the intent pass's "2 not done" and N4's single "Next: Breakfast · 9:00, then Work · 9:30".
- [ASSUMPTION] With one block left after the next, Next shows one row; with none after the current, see [`last-block.md`](last-block.md).

## Widths

Drawn at: 402. Not drawn at: the desk; scales up (D-USE-39).

## Criteria

| ID                                     | When                                    | Then                                                                                                                | Evidence                           |
| -------------------------------------- | --------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| C-USE-block-complete-not-done-closed-1 | "Complete Wellness" with two items left | The card shows ×, the check tile, "Wellness complete", Next as two rows, Start, and "Not done: Meditate, Cold bath" | `captures/not-done-closed-402.png` |
| C-USE-block-complete-not-done-closed-2 | Any not-done card                       | No count of items appears anywhere                                                                                  | `captures/not-done-closed-402.png` |
| C-USE-block-complete-not-done-closed-3 | Start is tapped with items left         | They stay not done in Wellness; nothing says missed                                                                 | test                               |
