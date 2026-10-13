---
target: specs/web/ux/day/orient/index.md
status: approved
promoted:
design:
  file: "Synapse, 01M49AX02VV4SSBKNCN6NRTS6Y"
  pages: ["USE — daily use"]
  rows: ["USE — daily use · Row label · Orient"]
  locked: 2026-10-10
---

# Orient — day

Sources: N3 "Orient", N1 (step 2, "Four rhythms"), notes 13–14, 19–20, 86, amendment 1; the row "Row label · Orient" (p-3-0, y 2640; coverage [`../../boards/use-daily-use/orient.md`](../../boards/use-daily-use/orient.md)).

## Job

Settle the emotions before the plan is seen (note 20): "Get my emotions in the right place" comes first; a plan read calm gets adjusted well, read flooded it gets abandoned. Top to bottom: a passage, any links, three optional lines, last night's reflections. Done is "Review the day" tapped in a calm state. Orient is the first five minutes of every day as a locked block (note 86, amendment 1; N1 "Orient. A locked block … It can't be removed"), but the screen never shows a time or a countdown (N5 "Orient never shows a time": the five minutes are the block's length, not a countdown). The phone's own status bar is the only clock on the boards.

## Entry and exit

- **Entry:** the first open of the day, on its own (N1 "Four rhythms"); after sign-in when signed out (refinement 3), then back here. Route `/orient`, bare: no `AppHeader`, no `BottomNav`, no avatar (`_global/shell.md`; D-USE-5).
- **The open is the wake.** Opening Orient stamps the day's wake time once, on the server, before the frame paints (as built: `day.orient` writes `woke_at`). The day lays out from that time ([`states/late.md`](states/late.md)).
- **Exit:** "Review the day" goes to Review the day (`/today/review` [PROPOSED]), no longer the List tab (D-USE-5). It sets nothing; writing the lines is optional.
- **Not shown again** the same day: a later open goes to Review the day, or to Now after Ready, go ([`states/skipped.md`](states/skipped.md)). A closed day never shows Orient.
- Overlays opened here: the full-screen reader ("Read all", [`states/passage-open.md`](states/passage-open.md)) and the "Last night" sheet ([`states/last-night-open.md`](states/last-night-open.md)); both close back to Orient.

## Layout, top to bottom (phone 402)

One bare column. Sizes, tokens and sample text: [`states/success.md`](states/success.md), the frame at full detail.

1. **Greeting:** the date caption over the title "Good morning" (`Text`; the level-1 heading). D-USE-9.
2. **The reading:** `PassageCarousel`, clamped, with dots and "Read all" (D-USE-9). Swipe for the next passage.
3. **Links:** the person's `LinkCallout`s; none set, nothing drawn and no gap.
4. **Before the day:** `GroupHeading` with `SaveStatus` beside it, then three labelled autogrow `Textarea`s (D-USE-14), autosaving.
5. **Last night:** `TextDisclosureButton` "Read last night's reflections", opening the "Last night" sheet (D-USE-9, D-USE-14); absent with no evening written.
6. Space, then the primary `Button` "Review the day" above the safe area, floating on a fade (D-USE-25).

## Primary action

"Review the day" (`Button`, default), at the column's foot at every width. Writing the lines is optional; nothing on Orient asks a question.

## States

| State | File | Widths drawn | One line |
| --- | --- | --- | --- |
| success: first open | [`states/success.md`](states/success.md) | 402 | The frame at full detail |
| passage open | [`states/passage-open.md`](states/passage-open.md) | 402 | "Read all": the full-screen reader |
| last night open | [`states/last-night-open.md`](states/last-night-open.md) | 402 | The "Last night" sheet, read only |
| woke late | [`states/late.md`](states/late.md) | 402 | The same frame on purpose; the day lays out from the wake |
| empty: no passages yet | [`states/empty.md`](states/empty.md) | 402 | One quiet line where the reading sits |
| loading | [`states/loading.md`](states/loading.md) | 402 | Words paint at once; the reading waits as a skeleton |
| error | [`states/error.md`](states/error.md) | 402 | Only the reading fails, with Try again |
| offline | [`states/offline.md`](states/offline.md) | 402 | From cache; "Waiting to save" |
| opened again | [`states/skipped.md`](states/skipped.md) | not drawn | Not shown; straight on |
| still here at 7:05 | [`states/lingering.md`](states/lingering.md) | not drawn | Nothing happens |
| partial | — | — | N/A: the frame reads one day's record |

## Platforms

Phone 402 only on the boards. At the desk (1024 and wider) Orient has no wide frame of its own and scales up from these (D-USE-39): focused at every width, with no rail, one centred column capped at the reading measure (as built, 64ch, 720 px wide) [ASSUMPTION: the built cap stands]. "Review the day" stays at the column's foot, full column width [ASSUMPTION]. The sheet and the reader at the desk: their own state files.

## Interactions opened here

- The first-wake loop, end to end: [`../../interactions/first-wake-loop.md`](../../interactions/first-wake-loop.md).
- The reader and the "Last night" sheet open only here: Orient's states.

## Words

By Gloss. Same in every state: "Good morning"; the date as "Monday, 12 October" (weekday, day, month; no year); "Read all"; "Before the day"; "Grateful for"; "Intention"; "Today, as I see it"; "Saved"; "Read last night's reflections"; "Review the day". No second person, no time, no count, nothing red. These replace the built strings "Every morning", "Grateful for, this morning", "Today's intention", "Last night" (as a row) and "Start the morning" (D-USE-9). The reading's caption, link titles and every sample line are [placeholder].

## Access

By Threshold.

- **Focus on open:** the "Good morning" heading (`tabIndex -1`), not a field, so no keyboard rises over the reading at 7am [ASSUMPTION: the boards show no keyboard on first open; the built frame focuses the first field].
- **Order:** heading, carousel (Left and Right arrows move passages; dots are not tab stops), "Read all", each link, the three fields, "Read last night's reflections", "Review the day".
- **Names:** the carousel is a region "Morning reading" (the caption's text); "Read all" is a button, "Read all, <passage title>"; links keep the title and host, "opens in a new tab"; fields are named by their labels; the disclosure is a button with `aria-haspopup="dialog"`.
- **Announced:** `SaveStatus` changes politely ("Saved", "Waiting to save"); the reader and the sheet are dialogs that move focus in and return it to their trigger.
- **Targets:** 44 px for fields, links, Try again and the reader's ×; the button 48 px.
- **Reduced motion:** the sheet and reader appear without a slide; the carousel snaps.
- Colour is never alone: the current dot also differs by position only, and is decorative; "Waiting to save" is words.

## Instrumentation

No product event is named for Orient in USE [ASSUMPTION: none; Phase 1 adds none here]. The wake stamp is the day's record, not analytics. Never in any payload: the lines, the passages, last night's words, link URLs.

## Criteria

| ID | When | Then | Evidence |
| --- | --- | --- | --- |
| C-USE-orient-1 | The first open of the day | Orient shows bare, with no header, tabs or time anywhere in the page | `captures/success-402.png` |
| C-USE-orient-2 | "Review the day" is tapped | Review the day opens; nothing else is written | test |
| C-USE-orient-3 | Orient is opened a second time that day | It is skipped (`states/skipped.md`) | test |
| C-USE-orient-4 | A line is typed | It autosaves and `SaveStatus` reads "Saved" | `captures/success-402.png` |
| C-USE-orient-5 | Any state | No second person, no count, no countdown, nothing red | captures |
| C-USE-orient-6 | Viewed at 1440 | One centred, capped column, no rail | test |

## Decisions and open items

- D-USE-5, 9, 14, 21, 25, 39 rule this surface; each state names the ones it uses.
- Two decisions on what the built frame carries and the boards do not (the Sometimes-day question, the quote day) sit in [`states/success.md`](states/success.md) (D-USE-63).
