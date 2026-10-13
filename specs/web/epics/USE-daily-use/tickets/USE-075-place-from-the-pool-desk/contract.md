---
id: "USE-75"
size: small
objective: "At the desk work is placed from the pool: a pool row dragged into a Priority cell lands there (a second day makes the next session, \"Added as session 2 of 3. Undo\"), dropped on a Work block in the Time lens it files under the day's first tier with room, \"+ Add to <tier>\" on any cell opens one search (Pool, then Linear not in the pool, then + New item), a placed chip drags to another day or back to the pool, and Undo puts everything back"
slice_type: "drag and a combobox over the planner writes; risks a copy made where a session belongs, the same item placed twice on one day, a drop with no keyboard path, Linear written on a place, and Undo leaving a session behind"
non_negotiables:
  - "A second day is a session of one item, never a copy; every session shows n of N (C-USE-place-from-the-pool-1)."
  - "One item sits once per day: a drop on a day that holds it is refused and its chip there is ringed [ASSUMPTION, as the index]."
  - "Every drag has a keyboard path: \"+ Add to <tier>\" shows on focus as on hover, and the popover is a combobox (C-USE-week-7)."
  - "Placing writes nothing to Linear; a Linear issue placed joins the pool as a work item (D-USE-57)."
  - "Undo restores the day and the pool row exactly (C-USE-place-from-the-pool-4)."
  - "@dnd-kit as the app uses it; @syn/ui components and preset tokens only."
devs_call: "The drop target's shade; the combobox (Command in a Popover, as the house primitive); Undo's lifetime (until the next placing or about 6 s)."
cites:
  - "specs/web/epics/USE-daily-use/ux/interactions/place-from-the-pool/index.md"
  - "specs/web/epics/USE-daily-use/ux/work/week/words-and-access.md"
  - "specs/web/epics/USE-daily-use/ux/work/week/states/priority-lens.md"
  - "C-USE-place-from-the-pool-1"
  - "C-USE-place-from-the-pool-2"
  - "C-USE-place-from-the-pool-3"
  - "C-USE-place-from-the-pool-4"
  - "C-USE-week-7"
  - "C-USE-week-priority-lens-3"
  - "C-USE-week-priority-lens-4"
  - "D-USE-40"
  - "D-USE-41"
  - "D-USE-42"
  - "D-USE-57"
waiver: "Placing at the desk: the interaction's rules, with the Priority lens frame that draws the drop and the popover and the Week's keyboard criterion."
truth_files: "none: promotion carries interactions/place-from-the-pool/"
qa: Q1
reviewers:
  - assay
focus:
  - "the Tue drop and the Add to Friday · Primary popover at 1728 against priority-lens-1728 (assay)"
operator_review: false
planned_paths:
  - "apps/web/components/work/pool/"
  - "apps/web/app/(shell)/week/_components/"
  - "apps/web/lib/data/use-place.ts"
  - "apps/web/lib/data/place.test.ts"
  - "packages/utils/src/work/first-tier-with-room.ts"
  - "packages/utils/src/work/first-tier-with-room.test.ts"
  - "packages/utils/src/work/index.ts"
  - "apps/web/lib/fixtures/"
  - "specs/web/epics/USE-daily-use/tickets/USE-075-place-from-the-pool-desk/evidence/"
depends_on:
  - "USE-4"
  - "USE-7"
  - "USE-8"
  - "USE-10"
  - "USE-55"
  - "USE-56"
  - "USE-61"
  - "USE-72"
  - "USE-73"
  - "USE-74"
out_of_scope:
  - "The phone's Place: USE-79 and USE-80"
  - "+ New item's form: USE-51's NewTaskSheet, opened with title, day and tier filled"
  - "Dropping into the Block panel's tiers and Today's nothing planned: USE-76 and USE-82, calling this ticket's place"
criteria:
  - id: C1
    statement: "firstTierWithRoom returns the first of Primary, Secondary, Stretch below its usual number and with the item fitting at the top of its range, Urgent never by default, and none when no tier has room"
    evidence: test
    command: "yarn test"
  - id: C2
    statement: "Through the planner writes, placing ALD-17 on Tue when it sits on Mon makes session 2 of the same item; placing it on Mon again is refused; placing a Linear issue not in the pool creates its work item and writes no outbox row; Undo after each leaves the records as before"
    evidence: test
    command: "yarn test"
  - id: C3
    statement: "At 1728 the Tue drop shows the chip ringed in ink with \"ALD-17 · session 2 of 3\" and \"Due Thu\", \"Added as session 2 of 3. Undo\" under it, Tue's fit line re-counted, and the pool row reading \"on Mon, Tue, Wed\", faded"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-075-place-from-the-pool-desk/evidence/drop-1728.png"
  - id: C4
    statement: "At 1728 + Add to Primary on Friday opens \"Add to Friday · Primary\" with \"audit\" typed: Pool's [Audit log export] \"KES-58 · 5 Large\" shaded, \"Linear, not in the pool yet\" with [Audit trail retention] \"KES-71 · unsized\", a rule and + New item \"audit\""
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-075-place-from-the-pool-desk/evidence/add-popover-1728.png"
  - id: C5
    statement: "@syn/utils and the web app type-check"
    evidence: check
    command: "yarn check-types"
  - id: C6
    statement: "The web app lints clean"
    evidence: check
    command: "yarn lint"
---

# Contract — place-from-the-pool-desk

## Build notes

Wave 2, after the pool panel and both lenses. Match `ux/work/week/captures/priority-lens-1728.png` (the Tue column and the popover).

- **Decisions that apply:**
  - D-USE-40, D-USE-42: placing the same item on a second day makes a session, "session n of N", its due badge worked out for that day; under it, muted, "Added as session 2 of 3. Undo"; the day's fit re-counts; the pool row names its days, faded. A first placing reads "Added to Tuesday · Primary. Undo" [ASSUMPTION].
  - D-USE-41: "+ Add to <tier>" on a cell's hover opens one search: Pool first, then "Linear, not in the pool yet", then '+ New item "<query>"'; it searches title and ID. Picking a Linear issue joins the pool and places it; unsized takes 30 min [ASSUMPTION].
  - The Time lens's drop (open-8 round 2) [PROPOSED]: it files under the day's first tier with room, "room" below the tier's usual number (D-USE-65's caps) [ASSUMPTION]; Urgent only by choice.
  - Dragging a placed chip to another cell moves it; dragging it onto the pool returns it there [ASSUMPTION, as N6].
  - Popover: 340 px, the sheet radius, a soft shadow; "Add to <Day> · <Tier>" (muted, 600); the search field focused (ring); results across groups by arrow keys (group names are not stops), Enter places, Esc closes and returns focus to the add row. The drop's ink edge is not the only mark: the Undo line names what happened, announced politely.
  - D-USE-57: placing writes nothing to Linear.
- **Interfaces:** `firstTierWithRoom({ tiers: { tier; count; usual: number | null; fits: boolean }[] }): Tier | null` in `@syn/utils/work`; `usePlace()` returning `{ place(itemOrIssue, { dateKey; blockId; tier }), move(slotId, to), unplace(slotId), undo }` over the planner writes, used by USE-76, USE-80 and USE-82. `AddToTierPopover` and the drop targets in `week/_components/`.
- **Per path:** `place.test.ts` holds C2; `first-tier-with-room.test.ts` holds C1 (append to `work/index.ts`, never reorder). Scenarios `week-drop` and `week-add-popover`.
- **Gotchas:** the usual numbers are USE-61's `TIER_USUAL`; never a second copy.
- **Model:** Opus 5.5 at medium. A smaller model copies the item for a second day, or places twice on one day.
