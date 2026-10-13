---
target: specs/web/ux/work/this-week/words-and-access.md
status: approved
promoted:
---

# This week on the phone — words, access, instrumentation, criteria

The rest of [`index.md`](index.md)'s slots, split out to keep the index under its cap. State-only strings sit in each state file; the sheet's in [`pool-sheet-anatomy.md`](pool-sheet-anatomy.md).

## Words (Gloss)

Strings shared by every state, as drawn:

- Header: "‹ Week"; the day as "Tuesday, 13 October"; "✓ Saved". Chips: "M 12" … "S 18".
- The Work block: "Work", "9:30 to 12:00"; "Primary", "Secondary", "Stretch"; "2 of 3"; "due Wed"; "+ Add to <tier>"; the fit line. Foot: "Pool".
- The pool sheet: "Pool"; "Pool" and "From Linear" (or "Connect Linear"); "All clients ▾", "Size ▾", "Due date ▾"; "Assigned to Taylor", "Not done"; "Synced 2 min ago", "Sync now"; "Place"; "Cancel".
- Matching the desk where the same thing is said ([`../week/pool-rows.md`](../week/pool-rows.md) › Words): size words Quick to Huge with their points; due words from two days before (D-USE-98: "due Thu" here, "Due Thu" as the desk's badge; the case differs because one is a row's caption and one a badge [ASSUMPTION]); "No Linear" for Synapse-only work; client order as the desk's.
- Open-9's words to Gloss on these frames: "Place" passed. The rest of that list ("Place in Primary · ends 11:40", "Spread it", "two days make it two sessions", "Left open on Friday…", "Bring these in") sit on frames other files carry.
- Decided (D-USE-105): **the fit line bends the register:** the copy register's never-list holds "doesn't fit", while N6 and D-USE-57 rule "Doesn't fit by 40 min at the top of the ranges" (a named bend, kept as drawn: lengths only, in ink, never red). Gloss's "Runs 40 min past Work at the top of the ranges" is not taken.
- [PROPOSED, to Gloss] one session form: "2 of 3" with the link mark (phone row), "session 2 of 3" (desk chip meta), N6's "Session 2 of the task".
- [PROPOSED, to Gloss] "Settings › Connections" for the client filter's "Settings › Clients"; one sync wording; one placed form (see the state files).
- No second person ("Taylor" on the canvas is the signed-in person's name [placeholder]), no question marks, no "missed", no count of the day: the fit is a length.

## Access (Threshold)

- **Order and landmarks:** the header (Back, the title as the page's h1, SaveStatus as a polite status), the chips (a radio group named "Day", each "Tuesday 13 October", the open one checked), the day (each block a button named "<kind>, <start> to <end>"), then Pool and the + [PROPOSED].
- **Rows** are buttons named "<title>, <tier>, session 2 of 3, due Wednesday" (the link mark and "due" spoken in words). Long-press has a path without it: the row's Item sheet holds every action [PROPOSED].
- **Pool** is named "Pool"; the + "Add to this day" [PROPOSED: the drawn + has no text]. Pool is 52 px high and the + a `--size-row` circle, both above the 44 px phone target, in thumb reach at the foot.
- **The pool sheet** is a modal dialog named "Pool": focus goes to its title on open, stays inside, and returns to Pool on close; × is named "Close"; a swipe down has × as its other path. The tabs are a `Tabs` tablist; the filters are toggle buttons with `aria-pressed` ("Assigned to Taylor, on"); "All clients ▾" names its sheet ("Client filter, All clients").
- **Place** is named "Place <title>" so each row's button is told apart. Its 32 px height is below the phone's 44 px target: [PROPOSED] the hit area takes the row's full 60 px height at the right, or the button grows to `--size-target`. WCAG 2.5.8 (24 px) is met either way.
- **Faded rows** (placed issues, `--color-disabled-foreground`) still read: they carry their day in words, and must hold 4.5:1 as text [ASSUMPTION: to verify at build; A-11].
- **Search** is a searchbox labelled "Search the pool and Linear"; results are announced politely as they change ("2 results") [PROPOSED; a count of results is not a count of the day].
- **Announced** [PROPOSED]: "Placed <title> on Tuesday, Primary. Undo available", "Synced", "Client: Kestrel Health".
- **Colour never alone:** tiers carry their word; client tiles their letter; status shapes their word in the meta; the fit line is words.
- **Reduced motion:** the sheet appears without the slide; the search's growth to full height is instant [PROPOSED].

## Instrumentation

None named on the boards or in the log. [ASSUMPTION] No analytics event in this phase; any later one never carries an item's title, client, project, team or Linear ID.

## Criteria

| ID                | When                                       | Then                                                                                           | Evidence                   |
| ----------------- | ------------------------------------------ | ---------------------------------------------------------------------------------------------- | -------------------------- |
| C-USE-this-week-1 | Set my days › This week, a day, below 1024 | Header, dated chips, the day with its Work block open to its tiers, Pool and the + at the foot | `captures/the-day-402.png` |
| C-USE-this-week-2 | Pool, then Place on any row                | The place sheet opens; nothing moves until its action                                          | test                       |
| C-USE-this-week-3 | 1024 and wider                             | No This week surface of its own: the Week with its docked pool (D-USE-55, D-USE-93)            | manual                     |
| C-USE-this-week-4 | Any state                                  | No count of the day, no "missed", no red; fit and due in words                                 | capture                    |
| C-USE-this-week-5 | Placing, filtering or searching            | Nothing is written to Linear (D-USE-57)                                                        | test                       |
| C-USE-this-week-6 | Screen reader on the pool sheet            | Focus held in the sheet, returned to Pool on close; every Place names its item                 | manual                     |
