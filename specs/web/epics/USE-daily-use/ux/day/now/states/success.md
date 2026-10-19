---
target: specs/web/ux/day/now/states/success.md
status: approved
promoted:
boards:
  - name: "now / success / 402 / light"
    page: "USE — daily use"
    at: [482, 10200]
    note: "Frame @ x 482, y 11130"
    capture: specs/web/epics/USE-daily-use/ux/day/now/captures/success-402.png
not_picked:
  - name: "now / B: plain checklist, tray closed / 402 / light"
    ruled: D-USE-26
  - name: "now / C: lifted card, tray open / 402 / light"
    ruled: D-USE-26
  - name: "now / D: plain checklist, tray open / 402 / light"
    ruled: D-USE-26
rulings: [D-USE-7, D-USE-17, D-USE-24, D-USE-26, D-USE-72, D-USE-109]
---

# Now — current item (success)

Where Ready, go lands. `?state=success`. Its note is the "Frame" at x 482, y 11130.

## What shows, top to bottom

Phone 402 × 874, `--color-background`, 20 px sides. Status bar 7:14; Monday 12 October.

1. **`AppHeader`:** "Now" (heading, semibold) and the avatar "T" (a 28 px muted circle); a hairline under. Decided (D-USE-74): + (Add) shows here on every block, one header, as D-USE-51 (7) has it for the Work block (later than these frames, which draw none).
2. **To-dos tray**, closed: "To-dos" (label, semibold), "Call the mechanic…" (muted, ellipsised), a chevron down; hairlines above and below (`../../todos/states/closed.md`).
3. **`BlockHeader`:** a 3 px leaf bar at the left, "Wellness" (`--text-title`, semibold), "7:05 to 8:00" under it (label, medium); a 32 px round ··· button, `--color-fill-muted`, at the trailing edge, nothing beside it.
4. **Done rows**, faded and live: a checked box (muted fill, white tick), the name muted, the length right-aligned muted: "Pee and weigh" 2 min, "Water" 1 min, "Start the cold bath" 2 min. No grips on done rows.
5. **The lifted card:** `Card`, `--color-surface`, hairline border, `--radius-card`, no shadow, 16 px padding. A 40 px `ItemIcon` (a person glyph on the leaf chip fill), then a verdigris dot and "Meditate" (`heading`, semibold), "10 min · 7:10" (label) under. Below, two equal `Button`s, 48 px: **Start** (outlined, secondary) and **Done** (ink, primary).
6. **Undone rows:** an empty box, "Cold bath" (body, ink), "10 min" and a six-dot grip at the trailing edge (D-USE-17).
7. Space, then **`BottomNav`:** Now (current), Schedule, Review.

## What the person can do

- **Done:** [`done-next-lifts.md`](done-next-lifts.md). **Start:** the running card (`../../running/index.md`).
- **Tap a row:** it becomes current ([`row-tapped.md`](row-tapped.md)). **Check a row's box:** completes it in place without lifting it.
- **Long-press a row:** [`row-long-press.md`](row-long-press.md). **Drag a grip:** [`reordering.md`](reordering.md).
- **···:** [`header-menu.md`](header-menu.md). **Tap a done row's box:** unchecks it [ASSUMPTION: done rows are live, N4].
- Open the tray; the tabs.

## The notes on the boards

**"now / success / 402 / light"**, "Frame" @ x 482, y 11130:

> current item (success)
>
> Ready, go lands here. Only Wellness shows; the next undone item, Meditate, is lifted with Start and Done, its dot verdigris. Done rows stay faded and live. [PROPOSED] The block header carries ··· alone: Done on the card is the screen's action, so a text button beside ··· (D-USE-24) would compete.

## Rulings

- D-USE-26: variation A, the lifted card with the tray closed; the header carries ··· alone. Decided (D-USE-72) for the note's [PROPOSED].
- D-USE-7: the overview's lifted card kept. D-USE-17: a grip on every undone row.
- Not picked (D-USE-26): B plain checklist, tray closed; C lifted card, tray open; D plain checklist, tray open (their notes, `../../../boards/use-daily-use/archive-1.md`, row 2's thread). Why, from their notes: B, "Done is the 20 px box, a small target for wet hands."; C, "The open tray takes about 190 px and pushes the card below the middle. Open on a tap or from a reminder, not by default."; D, "nothing stands out as 'this moment'."

## Widths

Drawn at: 402. Wider: see the index's Platforms (D-USE-39, D-USE-65).

## Criteria

| ID                  | When                  | Then                                                                                               | Evidence                   |
| ------------------- | --------------------- | -------------------------------------------------------------------------------------------------- | -------------------------- |
| C-USE-now-success-1 | Mid-Wellness after go | Only Wellness; done rows faded; the next undone item lifted with Start and Done; its dot verdigris | `captures/success-402.png` |
| C-USE-now-success-2 | The block header      | ··· alone, no text button                                                                          | `captures/success-402.png` |
