---
target: specs/web/ux/day/open/open-1.md
status: approved
promoted:
---

# day — open items, part 1 of 9

The intent pass's and the Design stage's Open list, moved verbatim from `../overview.md` (D-USE-59), items 1 to 16 in their original order. The UX handoff pass carries each item into the surface, interaction or dev-note file it belongs to, or rules it with a D-line; an item already carried keeps its text here with "Carried: <file>" appended.

- **Where the D-USE log lives** (2026-10-12, the ledger convention, `docs/workflows/stages/ux.md` §4). This file is about 23,400 tokens against the overview's 1,500 cap, almost all of it the decision log, so `yarn check-specs` fails on it (it failed before the convention). [NEEDS DECISION] Default: the log moves to `day/decisions.md`, split by range (`decisions/D-USE-1-29.md`, …) past 4,000 tokens, with this overview linking to it; a `decisions` kind would join `check-specs`. Not moved until Taylor rules.

- "Decide for me" on Make room (D-USE-11) needs a model call, which Phase 1 rules out (record 0001). [NEEDS DECISION] Keep it drawn and wire it later, or drop it for now. Carried: `interactions/make-room/index.md`.

- Urgent's soft cap and where it shows in This week (D-USE-20). [NEEDS DECISION] Default: no cap, and an "Add to Urgent" row above Primary. Carried: decided no cap (D-USE-79), `work/today/states/urgent-above-primary.md`.

- **Dev note: Make room** (D-USE-11, D-USE-16). Explore the mechanics before Technical: what is eligible (pinned items, appointments, travel, Orient, a block's minimum), how minutes are taken (from one item, spread, gaps first), how it plays with re-flow around pinned items (round 8) and with blocks that then run past Lights out, what Undo restores, and what "Decide for me" would weigh. Then find the simplest face for it: a sensible default that needs no sheet most of the time, with the sheet only when the default can't be guessed. The board's sheet is a placeholder for that work, not the answer. Carried: `interactions/make-room/index.md`.

- To Plumb, drawn once on the board: `Breadcrumb`, the rail + button and its drag state, the add sheet, the Make room sheet, the autogrow `Textarea`, the full-screen passage reader, the countdown mode of `TimerDisplay`, the bullet grid in `ScheduleBlock`. [PROPOSED] Carried: `day/block-view/`, `interactions/add-from-the-rail/`, `interactions/make-room/`, `day/orient/`, `day/running/`, `day/review-the-day/states/success.md`.

- Orient's loading and error (step 1, drawn) [PROPOSED]: the title and lines paint at once with the reading waiting as a skeleton, instead of the page waiting on the server; a failed load fails only the reading region ("This morning's reading didn't load.", Try again), instead of the full-page error. Awaiting Taylor. Carried: `day/orient/states/loading.md`, `day/orient/states/error.md`.

- Waking late with a block already under way (step 2, drawn at 8:10, so Wellness has passed): [ASSUMPTION] the block keeps its end and starts after Orient (Training 8:15 to 8:57). The fixture's late wake is 8:10 on Orient and Review the day. Carried: `day/orient/states/late.md` (Orient's half; the layout is Review the day's). Carried: `day/review-the-day/states/late.md` (Review the day's half) and `interactions/later-start/index.md`.

- **A later start** (Taylor, Review round 1) [PROPOSED, drawn]: when Orient opens well past plan (about 15 min [ASSUMPTION]), a sheet "A later start" opens once over Review the day with two paths, "Cut some" (the first two blocks' items to tick, "Cut the block", "Show later blocks"; what isn't cut slides) and "Slide the day back" (every block keeps its length; set-time items stay and blocks split around them; the new end of day shown). "Not now" leaves the late state. Words avoid the second person (Taylor's "You are up late" becomes "Up at 8:10"), keeping the product rule. Carried: `interactions/later-start/index.md`.

- **Dev note: a later start.** Sliding with priority (which blocks shrink, which never move: appointments, travel, set times; Stretch first, Urgent never; meals fixed or floating; a block's minimum), a slide past Lights out, snoozes landing mid-block, Undo. Shares one engine with Make room (minutes to find, what to take them from); "Decide for me" stays against Phase 1's no-AI rule. Carried: `interactions/later-start/index.md`.

- Where "Move to later" (block complete) and "Not today" (Now) put an item. [NEEDS DECISION] Default: Move to later puts it at the end of the next block of the same kind today, else the next block; Not today takes it off today only. Carried: `interactions/move-to/index.md`. Decided (D-USE-70).

- **Block view, step 3 round 1 (drawn).** [PROPOSED] A tap fallback for reordering: the row's long-press menu gains Move up and Move down (D-USE-17 has only the grip). [ASSUMPTION] Delete block, from the day, asks once and offers Undo after. [ASSUMPTION] Unused time in a block reads "Free until 8:00", with the add row at its top. Awaiting Taylor. Carried: `day/block-view/states/edit-dragging.md`, `day/block-view/states/header-menu.md`, `day/block-view/states/success.md`.

- **Item sheet, step 4 round 1 (drawn).** [PROPOSED] Swap leads the default sheet as an outlined button; the empty library reads "Nothing else of this kind yet." when the current item shows above it (N2's words read wrong there). [NEEDS DECISION] Swapping a gym workout for one at home leaves the drives to and from the YMCA. Default: they stay and are removed by hand; a later round could offer "Remove the drives too" in the Undo Toaster. Carried: `day/item-sheet/states/swap-empty.md`, `day/item-sheet/states/swap.md`.

- **Dev note: several running** (D-USE-27). Counts are computed from start time minus paused spans; the day's close stops all at the boundary; step 6 builds on it. Carried: `dev-notes/several-running.md`.

- **Running, step 6 rounds 1 and 2 (drawn).** [PROPOSED] Paused holds the figure as a number ("4:10"), pulsing, with "Paused · started 7:14" in the meta line and Resume in Pause's place, instead of N4's sentence "Paused at 4:10". [PROPOSED] Running rows count down like the card. [ASSUMPTION] Done on a Running row shows its time a moment, then the row leaves Running for its tier. [ASSUMPTION] Offline: counts are time-based, so they run; Start, Pause and Done queue like any check. [PROPOSED] A `warning-text` token (oklch 62% 0.13 85 for the figure, 58% on small text); nothing in preset.css covers warning yet. [PROPOSED, later] Running uses the same percent bands as Done, so a 45-min item isn't red at 46. Running on desktop (several tiers at once) waits for the desktop pass. Awaiting Taylor. Carried: `day/running/words-and-access.md` (Decided, D-USE-72).

- **Dev note: timers through the day** (step 6, on the canvas): counts down everywhere, over in ink, pause, all timers stop at the day's close with the item left for the morning, offline, and which Done shows which time (timed: the time taken, no Change; plain: "Took 2 min · Change", D-USE-13). Carried: `dev-notes/timers-through-the-day.md`.

- **Block complete, step 7 round 1 (drawn).** [PROPOSED] The not-done disclosure names the items ("Not done: Meditate, Cold bath") instead of N4's "2 not done", keeping no counts. [PROPOSED] The close card carries × on the left to stay; Next shows two rows (the next block, then the one after). The fixture wins over `block-complete.md`'s example: on Monday Wellness is followed by Training, not Breakfast. [ASSUMPTION] The last block of the day reads "Nothing after this today." with See the whole day, and Now's empty state follows. Step 5's footer frame shows "Took 12 min · Change" after a plain Done; step 7's copy corrects it to the planned 10 min. Awaiting Taylor. Carried: `day/block-complete/index.md` (Decided, D-USE-72).
