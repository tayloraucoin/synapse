---
target: specs/web/ux/work/today/states/thumb-firing.md
status: approved
promoted:
boards:
  - name: "phone-today / firing with a thumb, ring 44, swipe right / 402 / light"
    page: "USE — work"
    at: [2892, 5760]
    note: "Notes · phone, Today (row 5) @ x 2892"
    capture: specs/web/epics/USE-daily-use/ux/work/today/captures/thumb-firing-402.png
rulings: [D-USE-53, D-USE-61, D-USE-62]
---

# Today — firing with a thumb (phone)

The gesture's rules are in [firing](../../../interactions/firing.md); this is the frame.

## What shows, top to bottom

**Phone (402, 10:43):** under the Work header, the **one-time hint** (bordered, the firing mark at left, a × to close): "Swipe a work row right to send it firing. The ring on the row still does it with one tap." Primary: [Portal sign-in] firing ("firing" over "28 min"), its lead slot drawn with the dashed 44 × 44 target; the reminder line. Secondary: the SMS copy lifted as Next with Start and Done; under it, [Synapse: desk Today layout] **mid-swipe**: the row slid right, revealing on its left a surface-grey action with the firing mark over "Prompt sent" in dark rust, a hairline at the row's leading edge.

## What the person can do

Swipe a work row right past the reveal to fire it (Prompt sent); tap the ring to fire; tap a firing mark to bring it back (never a swipe); × closes the hint for good.

## Words

Hint: "Swipe a work row right to send it firing. The ring on the row still does it with one tap." [PROPOSED, to Gloss]. Reveal: "Prompt sent".

## The notes on the boards

**Notes · phone, Today (row 5) @ x 2892** — Firing with a thumb

The ring's target is the whole 44 × 44 lead slot (dashed). Swipe right on a work row reveals Prompt sent and fires it [PROPOSED]; the ring is the tap fallback, and a one-time hint teaches the swipe until it's used. Bringing back is a tap on the mark only, never a swipe.

## Rulings

- D-USE-53: the 44 × 44 target, swipe right reveals and fires, the hint until used, bringing back by tap only.
- D-USE-61: swipe right is in (the note's [PROPOSED] is settled), with the ring as fallback and the one-time hint; the swipe starts away from the screen edge.
- The desk's answer is the keyboard: F fires or brings back the focused row (D-USE-62), plus the ring by click. No swipe at the desk.

## Widths

Drawn at 402 only. Desk: no swipe; F and the ring (D-USE-62, D-USE-55 "keyboard keys" desk-only).

## Criteria

| ID                         | When                                          | Then                                                            | Evidence                        |
| -------------------------- | --------------------------------------------- | --------------------------------------------------------------- | ------------------------------- |
| C-USE-today-thumb-firing-1 | A swipe right on a work row passes the reveal | The item fires in place, as Prompt sent                         | `captures/thumb-firing-402.png` |
| C-USE-today-thumb-firing-2 | A swipe starts at the screen's left edge      | It is left to the browser's back gesture; the row does not move | manual                          |
| C-USE-today-thumb-firing-3 | The swipe has been used once, or × pressed    | The hint never shows again                                      | manual                          |
| C-USE-today-thumb-firing-4 | A firing row is swiped                        | Nothing happens; only a tap on the mark brings it back          | manual                          |
