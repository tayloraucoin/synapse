---
target: specs/web/ux/day/close-the-day/index.md
status: approved
promoted:
design:
  file: "Synapse, 01M49AX02VV4SSBKNCN6NRTS6Y"
  pages: ["USE — daily use"]
  rows:
    - "USE — daily use · Row label · Evening"
  locked: 2026-10-12 (D-USE-73)
---

# Close the day — day

Handoff pass, the ledger of the boards. Its own surface by D-USE-73. Sources: D-USE-14, 30, 73; open-2 "Feedback round, steps 5 to 7"; DYN-18 (built). The row "Row label · Evening" (p-3-0, y 21540, note y 22470; coverage [`../../boards/use-daily-use/evening.md`](../../boards/use-daily-use/evening.md)). Its label: "Evening · close the day (outside N5) / The bedtime Orient, step 7b [PROPOSED], from the feedback round. Not one of N5's steps; kept at the end of the day's flow." The narrative never named it. Words, access, criteria and the built journal: [`built-and-words.md`](built-and-words.md).

## Job

The bedtime Orient: a few lines in Taylor's own words at the end of the day, so the morning has something true to read back (DYN-18, after v1.1 §7.2). Done is nothing: there is no button, no count and no finish; an empty night is nothing, not a miss.

## Entry and exit

- **Entry:** the Wind-down block's Journal item, on Now or in Block view (DYN-18: the row opens the journal rather than the Item sheet; `../now/index.md`, `../block-view/index.md`). [ASSUMPTION] Also the Evening block's Journal item when that kind holds it; the canvas names the block "Wind-down" [placeholder].
- **Exit:** "‹ Wind-down" goes back to where it opened from [ASSUMPTION: Now in the Wind-down block]. "See it" on the Tomorrow peek opens tomorrow's day as Schedule draws it (built `dayRoute(<tomorrow>)`; D-USE-74).
- **Read back:** three of its lines show on the next morning's Orient, under "Read last night's reflections" in the "Last night" sheet (D-USE-14; [`../orient/states/last-night-open.md`](../orient/states/last-night-open.md), cited). Built: `ORIENT_READBACK_KEYS` = "What I want to make happen tomorrow" (re-tensed "… today"), "Tomorrow, as I see it", "Looking forward to".

## Layout, top to bottom (phone 402)

1. Status bar.
2. `Breadcrumb` [PROPOSED] (Plumb at lock, as Block view's): "‹ Wind-down" (muted); under it the title "Close the day" (title, semibold). A hairline.
3. A caption (muted): "<weekday, day month> · read back on tomorrow's Orient".
4. Six prompts in order, each a caption (muted, sans) over a serif `Textarea` that grows with its text, a hairline under each; the field in focus has an ink underline.
5. `SaveStatusText` "Saved" (caption, muted) under the last field.
6. **Tomorrow peek:** a bordered `Card` (hairline, `--radius-card`): "Tomorrow" (caption, muted) over "Wellness at 7:05, then Training" (body, semibold); "See it" (underlined link) trailing. Not a house primitive yet [ASSUMPTION: a `Card` with a `TextLink`, no new component].
7. No tabs on the drawn frame [ASSUMPTION: a child page, like Block view, hides the `BottomNav`].

## Primary action

None, by rule: writing is the whole act and every field autosaves (DYN-18 "no finish button"). The Tomorrow peek's "See it" is secondary.

## States

| State                   | File                                         | Widths | One line                                                                                                                                              |
| ----------------------- | -------------------------------------------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| journal (writing)       | [`states/journal.md`](states/journal.md)     | 402    | Five lines written, the sixth focused, Saved, the Tomorrow peek                                                                                       |
| empty                   | [`states/empty.md`](states/empty.md)         | —      | Not drawn: six empty fields; built                                                                                                                    |
| offline                 | [`states/offline.md`](states/offline.md)     | —      | Not drawn: "Saving on this device"; built                                                                                                             |
| read-only               | [`states/read-only.md`](states/read-only.md) | —      | Not drawn: a past day from Review, serif text; built                                                                                                  |
| loading, error, partial | —                                            | —      | [ASSUMPTION] As built: the page renders on the server with the entry (no loading state); an error falls to the app's error page; one read, no partial |

## Platforms

Phone 402 only. At 1024 and wider no frame; it scales up (D-USE-39) into a single reading column, as built (`contentWidth="text"`). Dark comes with the lock pass (D-USE-39).

## Interactions opened here

None. The prompts are set in Settings → Your day → Closing the day (DYN-18), out of USE's boards.

## Decisions and open items

- D-USE-73: its own surface, the journal under a "Wind-down" breadcrumb with the Tomorrow peek. D-USE-30: the evening close joins the USE checklist as step 7b. D-USE-14: three lines read back on Orient's "Last night" sheet.
- Open carried here: open-2 "Feedback round, steps 5 to 7", its Close the day part and its [NEEDS DECISION] on its own surface file (Decided, D-USE-73).
- D-USE-74: "See it" opens tomorrow's day as Schedule draws it. D-USE-75: the offline line's words ([`built-and-words.md`](built-and-words.md)).
