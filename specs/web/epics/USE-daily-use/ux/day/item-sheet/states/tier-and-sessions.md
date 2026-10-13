---
target: specs/web/ux/day/item-sheet/states/tier-and-sessions.md
status: approved
promoted:
boards:
  - name: "phone-edit / item sheet, tier and sessions / 402 / light"
    page: "USE — work"
    at: [964, 7200]
    note: "Notes · phone, editing and This week (row 6) @ x 964"
    capture: specs/web/epics/USE-daily-use/ux/day/item-sheet/captures/tier-and-sessions-402.png
rulings: [D-USE-42, D-USE-54, D-USE-57, D-USE-58, D-USE-103]
---

# Item sheet — tier and sessions (a spread task)

A work row tapped on Now at 10:20, Monday 12: a task spread across three days, this the first session. `?state=tier-and-sessions`.

## What shows, top to bottom

- Behind the scrim, "Now". The sheet from y 110: × left, ··· right.
- Scope line "Mon 12 · Work · session 1 of 3".
- Title row: the project emoji (a compass) inline before "[Synapse: desk Today layout]".
- `LinearLine`: a bordered chip with the In progress half-disc and "In progress"; "SYN-212"; the project emoji and "Synapse" muted; "Linear ↗".
- **Tier**: label, and on the right muted "Mon 12 only · asks before changing all"; the coloured `SegmentedControl` (Urgent, Primary, Secondary selected, Stretch).
- **Sessions**: label, and on the right muted "2 to 4 h each"; `SessionRow`s: "Mon 12" (bold) with the amber square, "Secondary · this one"; "Wed 14" with green "Primary" and ×; "Thu 15" with amber "Secondary" and ×; then "+ Add a day".
- **Sub-issues**: label; `Checkbox` rows: checked "[Rail tabs: Today, Week, Schedule]"; unchecked "[Firing in place on the row]" with "Thu 15" muted and ··· on the right (placed alone on Thursday).
- Footer pair: "Start" (outlined) and "Done for today" (filled).

## What the person can do

- A tier segment changes this session's tier; changing it for all asks This session (default) or All sessions, with the consequence for the others (D-USE-42's default, D-USE-57).
- × on a session drops that day; "Add a day" adds one. Checking a sub-issue checks it in Linear.
- ··· on a sub-issue offers "Place on a day by itself" (then one day, one tier, the consequence, Place).
- **Start** makes the running card. **Done for today** closes today's share only: "Done for today · took 2 h 05 · next session Wed 14" and a toast with Undo; nothing goes to Linear until the task is done.
- ··· in the header opens `work-more-open.md`.

## Words

"session <n> of <m>"; "Mon 12 only · asks before changing all"; "Sessions"; "2 to 4 h each"; "this one"; "Add a day"; "Sub-issues"; "Start"; "Done for today".

## The notes on the boards

**phone-edit / item sheet, tier and sessions / 402 / light** (Notes · phone, editing and This week (row 6) @ x 964, card "Item sheet, tier and sessions"):

> Item sheet, tier and sessions
>
> Tier changes this session and asks before changing all (the D-USE-42 default). Sessions list each day and its tier; × drops a day, Add a day adds one. Sub-issues check here, and ··· on one offers "Place on a day by itself". Done for today on a session; "Mark the task done" is in ···.

The strip's next card, "Sub-issue, placed alone", reads: "One day, one tier, the consequence, Place. It stays a checkbox inside its issue too; checking it in either place checks it in Linear." (its frame is carried by [`sub-issue-alone.md`](sub-issue-alone.md)).

## Rulings

- D-USE-54: the item sheet edits the tier for this session and asks before changing all, lists Sessions, checks sub-issues, offers "Place on a day by itself"; a session's Done reads "Done for today".
- D-USE-57: a spread task's tier change asks This session (default) or All sessions. D-USE-58: locked.

## Widths

Drawn at: 402. The desk draws sessions on the Week (D-USE-42); the desk's item sheet: Decided (D-USE-103): the right-side panel (`../index.md` › Platforms).

## Criteria

| ID                                   | When                               | Then                                                                                       | Evidence                             |
| ------------------------------------ | ---------------------------------- | ------------------------------------------------------------------------------------------ | ------------------------------------ |
| C-USE-item-sheet-tier-and-sessions-1 | A session's sheet opens            | Tier for this session, Sessions with × and Add a day, Sub-issues, Start and Done for today | `captures/tier-and-sessions-402.png` |
| C-USE-item-sheet-tier-and-sessions-2 | The tier changes and All is picked | Every session takes the tier; This session is the default                                  | manual                               |
