---
target: specs/web/ux/day/close-the-day/built-and-words.md
status: approved
promoted:
---

# Close the day — what is built, words, access, criteria

The second half of [`index.md`](index.md), split to keep each file under its cap.

## What is built (DYN-18, Complete 2026-09-13)

Ticket: `docs/decisions/imported/specs/epic-4-dynamic-schedule/DYN-18-the-evening.md`; departures in that epic's `DEVIATIONS.md` (2026-09-13 DYN-18 lines). Code: `apps/web/app/(shell)/day/[date]/journal/page.tsx` (`journalRoute(date)`, `/day/{date}/journal`), `apps/web/components/journal/` (`journal-screen.tsx`, `use-journal.ts`, `copy.ts`), the prompts in `packages/constants/src/journal-prompts.ts` (the person's own in `users.journal_prompts`), `syncJournalItem` in `packages/api/src/services/day/journal.ts`.

Built behaviour USE keeps: six prompts as captions over serif autogrow `Textarea`s; autosave 600 ms after the last keystroke and on blur, one key per save (the jsonb merge); `SaveStatusText` under the last field; no finish button, no timer, no count, no starter phrase; the Journal row ticks itself when any field has text and clears when all are emptied, a hand-ticked row left alone; today and past days writable, a future day 404s; a past day opened from Review read-only; offline "Saving on this device". DAY-12 (v1.3 R54) added the morning's quote closing the page once every prompt is answered.

## Where the drawn frame and the built journal differ

|                          | Built                                                             | Drawn (D-USE-73 rules the drawn)                                                 |
| ------------------------ | ----------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| Header                   | `ShellPageHeader`: back, the date as title, "Journal" as subtitle | `Breadcrumb` "‹ Wind-down", title "Close the day"                                |
| Date                     | the title                                                         | a caption "Monday, 12 October · read back on tomorrow's Orient"                  |
| Tomorrow peek            | none                                                              | the card "Tomorrow / Wellness at 7:05, then Training / See it"                   |
| The quote (DAY-12)       | after the last answer                                             | not drawn (the sixth field is empty) [ASSUMPTION: kept, above the Tomorrow peek] |
| Name                     | "Journal"                                                         | "Close the day"                                                                  |
| Prompts, autosave, Saved | as above                                                          | the same six captions, serif lines, "Saved"                                      |

The breadcrumb, title, date caption and Tomorrow peek are new build work; the rest is built and reused.

## Words

Gloss. "Wind-down" (the block's name, [placeholder]); "Close the day"; "<Weekday>, <day> <Month> · read back on tomorrow's Orient"; the six prompts are the person's (built defaults): "How the day went", "Grateful for today", "Grateful for, in life", "Looking forward to", "What I want to make happen tomorrow", "Tomorrow, as I see it"; "Saved"; "Saving on this device"; "Tomorrow"; "<first block> at <time>, then <second block>"; "See it"; "Nothing written." (read-only, built `[COPY]`).

No second person. The built offline line "Offline — your words stay here until you're back." (`copy.ts`) breaks it (product rules, no second person). Decided (D-USE-75): it reads "Offline. The words stay on this phone until back online."; the build changes `copy.ts` in a ticket.

## Access

Threshold, from DYN-18 and `[PROPOSED]` for the new parts.

- **Focus on open:** the title "Close the day" (`tabIndex -1`); [ASSUMPTION] no field is focused, so the keyboard does not rise uninvited.
- **Order:** breadcrumb, title, the date caption, each field (its prompt is its `label`), the save status, the Tomorrow peek's "See it".
- **Announced (polite):** the save status (`aria-live`, built).
- **Read-only:** each answer a `blockquote` with its prompt as `figcaption` (built).
- **Targets:** "‹ Wind-down" and "See it" at least 44 × 44.
- **Reduced motion:** nothing animates.

## Instrumentation

None (DYN-18: "Instrumentation: none"). Never in any payload: the person's words or prompts.

## Criteria

| ID                    | When                                         | Then                                                                                              | Evidence                   |
| --------------------- | -------------------------------------------- | ------------------------------------------------------------------------------------------------- | -------------------------- |
| C-USE-close-the-day-1 | The Wind-down block's Journal item is tapped | Close the day opens: "‹ Wind-down", the title, the date caption, six prompts, no button, no count | `captures/journal-402.png` |
| C-USE-close-the-day-2 | A field is written and left                  | It saves on pause and blur; "Saved" shows; the Journal row ticks itself                           | test                       |
| C-USE-close-the-day-3 | The next morning                             | Orient's "Last night" sheet shows three of these lines (D-USE-14)                                 | test                       |
| C-USE-close-the-day-4 | The page is open                             | The Tomorrow peek names tomorrow's first two blocks and the first's start                         | `captures/journal-402.png` |
| C-USE-close-the-day-5 | Any state                                    | No second person, no count, no timer, nothing pre-filled; an empty night is not a miss            | captures                   |
| C-USE-close-the-day-6 | Each `?state=` key of `states/`              | That state renders (canon C-P08)                                                                  | capture                    |
