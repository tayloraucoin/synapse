---
target: specs/web/ux/day/block-complete/index.md
status: approved
promoted:
design:
  file: "Synapse, 01M49AX02VV4SSBKNCN6NRTS6Y"
  pages: ["USE — daily use"]
  rows:
    - "USE — daily use · Row label · Block complete"
  locked: 2026-10-12 (D-USE-72, as drawn)
---

# Block complete — day

Handoff pass, the ledger of the boards. Sources: N4 "Block complete"; N1's step table (step 6); note 64; round 12; step 7 round 1 and the feedback round; D-USE-8, 13, 28, 30, 70, 72. The row "Row label · Block complete" (p-3-0, y 15240, notes y 16170; coverage [`../../boards/use-daily-use/block-complete.md`](../../boards/use-daily-use/block-complete.md)). Its label: "Step 7 · Block complete / All done (footer), not done and open, not done with Do now (feedback round), not done and closed, last block of the day. Round 1 and the feedback round." Words, access, instrumentation and criteria: [`words-and-access.md`](words-and-access.md). Folds the intent pass's flat `day/block-complete.md`, deleted once folded (thread 3).

## Job

"Okay, complete wellness block, move into the next block" (note 64): a small moment of closing between two stretches of the day, then on. Done is the next block started. The reward is the check and the close card, with no counts, streaks or scores: the design bends towards "gamify mode" (note 49) and stops there (N5).

## Entry and exit

- **Entry, all done:** the last item in the block checked on Now. The block keeps its rows and a footer floats over them ([`states/all-done.md`](states/all-done.md); D-USE-28). No card.
- **Entry, not done:** "Complete Wellness" from the block's ··· on Now with items left (Now's header menu, `../now/states/header-menu.md`, cited). The block settles into the close card ([`states/not-done-closed.md`](states/not-done-closed.md)).
- **Exit:** "Start Training" makes the next block active on Now (`../now/index.md`). × (close card) stays on Now, which then shows the next block anyway (N4). "See the whole day" (last block) opens Schedule. A few seconds after the last block's card, or on ×, Now shows its empty state ([`states/last-block.md`](states/last-block.md); `../now/states/empty-no-blocks.md`).
- Superseded from the intent pass: "Start Breakfast" and "Next: Breakfast · 9:00", then "Work · 9:30". The fixture wins (D-USE-8): on Monday Wellness is followed by Training (8:00), then Breakfast (9:00).

## Layout, top to bottom (phone 402 × 874)

Each frame sits on Now; Now's chrome is Now's (`../now/index.md`), cited:

1. Status bar; Now's header "Now" with the avatar "T"; the To-dos tray closed, "To-dos Call the mechanic…" with its chevron (`../todos/states/closed.md`).
2. **All done:** the block as on Now, every row checked and faded, then a footer on the fade (D-USE-25): a filled check and "Wellness complete" leading, "Next: Training, 8:00" trailing (muted), and a full-width ink `Button` "Start Training".
3. **Not done (the close card):** a `Card` (hairline border, `--radius-card`, 20 px padding), centred in the space between the tray and the tabs: × (muted, 18 px) top-left; a round tile, 48 px, tinted with the block's colour, holding a check in the block's colour; "Wellness complete" (heading, centred); "Next" (caption, muted); two rows on a hairline: a filled dot in Training's colour (clay), "Training" (semibold), "8:00" trailing; a hollow ring, "then Breakfast" (muted), "9:00"; the full-width ink `Button` "Start Training"; a quiet `TextDisclosureButton` "Not done: Meditate, Cold bath" with a chevron. Opened, it lists each item left ([`states/not-done-open.md`](states/not-done-open.md), [`states/not-done-do-now.md`](states/not-done-do-now.md)).
4. `BottomNav`: Now, Schedule, Review; Now selected.

The check tile replaces N4's "the block's icon" (as drawn, D-USE-72). The intent pass's "Next as two `ListRow`s with icons" is drawn as a dot and a ring instead of icons [ASSUMPTION: colour is never alone, since each row names its block].

## Primary action

Start the next block: in the footer (all done) or on the card, full width, under Next. The last block has none; "See the whole day" is its only button.

## States

| State                                   | File                                                     | Widths | One line                                                                                            |
| --------------------------------------- | -------------------------------------------------------- | ------ | --------------------------------------------------------------------------------------------------- |
| all done (footer)                       | [`states/all-done.md`](states/all-done.md)               | 402    | Rows stay, checked; footer "Wellness complete", Start Training                                      |
| not done, open                          | [`states/not-done-open.md`](states/not-done-open.md)     | 402    | The disclosure open; Meditate moved with Undo; Cold bath with Move to later, Leave                  |
| not done, do now                        | [`states/not-done-do-now.md`](states/not-done-do-now.md) | 402    | Do now, Later, Leave, each with its consequence                                                     |
| not done, closed                        | [`states/not-done-closed.md`](states/not-done-closed.md) | 402    | The close card; "Not done: Meditate, Cold bath" closed                                              |
| last block of the day                   | [`states/last-block.md`](states/last-block.md)           | 402    | "Nothing after this today." and See the whole day                                                   |
| empty, loading, error, partial, offline | —                                                        | —      | N/A: a settle of a block already on screen; the checks that led here carry their own states (Now's) |

[ASSUMPTION] Offline, Start, Do now, Later and Leave save on the phone and sync later, as checks do (D-USE-72 queues Running's actions "like any check"); Now's `offline` (`../now/states/offline.md`) carries the StatusLine.

## Platforms

Phone 402 only. At 1024 and wider Block complete has no frame of its own and scales up from these (D-USE-39); at the desk the footer and card sit in Today's main column [ASSUMPTION]. Dark comes with the lock pass (D-USE-39).

## Interactions opened here

- "Move to later" / "Later": the one-tap move, [`../../interactions/move-to/index.md`](../../interactions/move-to/index.md) (D-USE-70).
- "Do now" past the block's end: the slide, [`../../interactions/make-room/index.md`](../../interactions/make-room/index.md) (D-USE-72).
- "Change" on "Took 10 min": the `MinutesStepper` (D-USE-13), as on Now.
