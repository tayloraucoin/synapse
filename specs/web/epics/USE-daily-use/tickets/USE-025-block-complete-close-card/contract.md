---
id: "USE-25"
size: small
objective: "Complete <Block> with items left settles the block into the close card: ×, the check tile in the block's colour, \"<Block> complete\", Next as two rows, Start <next> and the named disclosure \"Not done: …\", which opens each item left with Later and Leave, Later moving it by D-USE-70's rule with Undo; the day's last block reads \"Nothing after this today.\", then Now's empty state"
slice_type: "a closing card with one-tap moves; risks a count or a \"missed\", Later landing somewhere other than D-USE-70's rule or changing the usual week, Undo that leaves a trace, and the card shown for an all-done block"
non_negotiables:
  - "No count anywhere, no second person, nothing red, nothing says missed; the disclosure names the items (\"Not done: Meditate, Cold bath\")."
  - "Later puts the item at the end of the next block of the same kind today, else at the end of the next block, for today only; laterTarget in @syn/utils decides it, and with no next block Later is not offered."
  - "Undo restores the item to its block exactly, removing the slot Later wrote; Leave writes nothing."
  - "The card is only for a block closed with items left; an all-done block keeps USE-20's footer, and ?state=all-done resolves to that footer."
  - "Start <next> and × both put the next block in focus (USE-20's focus rule); the items left stay simply not done."
  - "Only @syn/ui components (Card, Button, TextDisclosureButton, Toaster) and preset tokens; colour never alone (each Next row names its block)."
devs_call: "The card's split into parts; the last block's pause (about 4 s, held while focus is inside the card, never timing out under a screen reader); the moved row's layout."
cites:
  - "specs/web/epics/USE-daily-use/ux/day/block-complete/index.md"
  - "specs/web/epics/USE-daily-use/ux/day/block-complete/words-and-access.md"
  - "specs/web/epics/USE-daily-use/ux/day/block-complete/states/not-done-closed.md"
  - "specs/web/epics/USE-daily-use/ux/day/block-complete/states/not-done-open.md"
  - "specs/web/epics/USE-daily-use/ux/day/block-complete/states/last-block.md"
  - "C-USE-block-complete-2"
  - "C-USE-block-complete-3"
  - "C-USE-block-complete-4"
  - "C-USE-block-complete-5"
  - "C-USE-block-complete-7"
  - "C-USE-block-complete-8"
  - "C-USE-block-complete-not-done-closed-3"
  - "C-USE-block-complete-not-done-open-2"
  - "C-USE-block-complete-not-done-open-3"
  - "D-USE-70"
waiver: "One surface, Block complete: its index, words and the three card states built here; all-done is USE-20's footer and do-now is USE-26's."
truth_files: "none: an epic proposal; promotion carries day/block-complete/"
qa: Q1
reviewers:
  - assay
focus:
  - "the closed, open and last-block cards at 402: no count, Later's landing and Undo (assay)"
operator_review: false
planned_paths:
  - "apps/web/app/(shell)/today/_components/"
  - "apps/web/components/planner/"
  - "apps/web/lib/data/"
  - "apps/web/lib/fixtures/"
  - "packages/utils/src/planner/later.ts"
  - "packages/utils/src/planner/later.test.ts"
  - "packages/utils/src/planner/index.ts"
  - "specs/web/epics/USE-daily-use/tickets/USE-025-block-complete-close-card/evidence/"
depends_on:
  - "USE-4"
  - "USE-7"
  - "USE-10"
  - "USE-16"
  - "USE-17"
  - "USE-20"
out_of_scope:
  - "Do now and each item's consequence line: USE-26"
  - "Move to… with its choices and Pick a day: the Move to ticket"
  - "Offline queueing beyond the fixture server: the offline persistence ticket (wave 3)"
criteria:
  - id: C1
    statement: "Complete Wellness at 7:40 with Meditate and Cold bath left: the rows give way to the card with ×, the leaf check tile, \"Wellness complete\", \"Next\", a clay dot \"Training\" \"8:00\", a ring \"then Breakfast\" \"9:00\", Start Training and \"Not done: Meditate, Cold bath\" closed"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-025-block-complete-close-card/evidence/not-done-closed-402.png"
  - id: C2
    statement: "Opened after Later on Meditate: Meditate muted over \"Moved to the end of Training\" with Undo; Cold bath with Later and Leave"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-025-block-complete-close-card/evidence/not-done-open-402.png"
  - id: C3
    statement: "The day's last block at 21:40: ×, the tinted check tile, \"Wind-down complete\", \"Nothing after this today.\" and an outline See the whole day; no Next, no Start, no disclosure"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-025-block-complete-close-card/evidence/last-block-402.png"
  - id: C4
    statement: "laterTarget sends Wellness's Meditate on Monday to the end of Training, an item to the end of a later block of its own kind when there is one, and returns null after the last block"
    evidence: test
    command: "yarn test"
  - id: C5
    statement: "Later writes one slot at the end of the target block and Wellness no longer holds the item; Undo removes that slot and the item is back, not done; Leave writes nothing; Start Training and × each put Training in focus with Meditate still not done in Wellness"
    evidence: test
    command: "yarn test"
  - id: C6
    statement: "An all-done block has no close card, and after the last block's card closes the view is empty"
    evidence: test
    command: "yarn test"
  - id: C7
    statement: "The web app and @syn/utils type-check"
    evidence: check
    command: "yarn check-types"
  - id: C8
    statement: "The web app lints clean"
    evidence: check
    command: "yarn lint"
---

# Contract — block-complete-close-card

## Build notes

After USE-20 (the footer and the focus rule). Captures to match: `ux/day/block-complete/captures/{not-done-closed,not-done-open,last-block}-402.png`; Paper `01M49AX02VV4SSBKNCN6NRTS6Y`, "USE — daily use", row "Block complete" (y 15240). The open frame draws round 1's "Move to later"; the words are now "Later" (not-done-do-now.md), so build "Later"; USE-26 adds Do now beside it.

- **Decisions that apply:**
  - D-USE-28: the close card is for the not-done case.
  - D-USE-72 (step 7 round 1): the named disclosure with no count, × on the left to stay, Next as two rows; the last block reads "Nothing after this today." with See the whole day, and Now's empty state follows.
  - D-USE-70: Move to later puts the item at the end of the next block of the same kind today, else the end of the next block (Monday's Meditate lands at the end of Training). The usual week is never changed.
  - D-USE-74: the last block with items left offers Do now and Leave, no Later.
  - N4: × stays on Now, which shows the next block anyway; Start with items left leaves them simply not done. Undo stays on the moved row until the card closes or Start is tapped.
  - Words: "<Block> complete", "Next", "then <Block>", "Start <Block>", "Not done: <item>, <item>", "Moved to the end of <Block>", "Undo", "Later", "Leave", "Nothing after this today.", "See the whole day".
- **Interfaces:**
  - `@syn/utils` `planner/later.ts`: `laterTarget({ blocks; fromBlockId; now }): { blockId; sortOrder } | null`, by kind then order.
  - `useBlockClose()`: `complete(blockId)` (the header menu's Complete, USE-17's `onComplete`), `later(item)`, `undoLater(item)`, `leave(item)`, `close()`. A set item's Later places its slot in the target block (`placeSlotInput`); a to-do's moves its slot.
  - `components/planner/`: `CloseCard`, `NotDoneList`, `NextRows`.
  - Scenarios: `not-done-closed`, `not-done-open`, `last-block`; `all-done` resolves to USE-20's `all-done-start-next` data with Took 10 min.
- **Per path:** `later.test.ts` holds C4; `lib/data/block-close.test.ts` holds C5 and C6 against the fixture server.
- **Gotchas:**
  - A closed-with-items block is kept on the device the same way as USE-20's focus; `activeBlock` reads it, so the card does not come back on reload.
  - The check tile's tint is the block kind's chip; Wind-down's [placeholder] plum-pink is a kind token, never a raw colour.
- **Model:** Opus 5.5 at medium. A smaller model writes "2 not done" or moves the block's item for every Monday.
