---
target: specs/web/ux/set-my-days/set-my-days/states/saved.md
status: approved
promoted:
boards:
  - name: "set-my-days / saved (header states) / 402 / light"
    page: "USE — set up"
    at: [5302, 1260]
    note: "Frame @ x 5302, y 2190"
    capture: specs/web/epics/USE-daily-use/ux/set-my-days/set-my-days/captures/saved-402.png
rulings: [D-USE-33]
---

# Set my days — saved (the header's SaveStatus)

How an edit saves. `?state=saved`. The artboard is not a screen: a short sheet, 402 wide and fit-content in height, drawing the three states of `SaveStatus` at the top right of the header. Its note is the "Frame" at x 5302, y 2190. Layout, words and access: [`../index.md`](../index.md).

## What shows, top to bottom

- A caption heading, "SAVESTATUS, TOP RIGHT OF THE HEADER" (small caps, muted), then three rows split by hairlines, each with when on the left and the header's reading on the right:
  1. "While an edit is sent": a spinner glyph and "Saving" (muted).
  2. "For 2 s after it lands, then nothing": a check and "Saved" (muted).
  3. "When it fails; the edit stays on screen": "Not saved ·" in ink and "Try again" underlined, in ink. No red.
- On the screen frames, the header's trailing edge holds this reading opposite "‹ Week"; frames that show "Saved" held are a moment caught, not a reading that stays.

## What the person can do

- Nothing to save: there is no Save button; every edit saves as it is made (N2).
- An edit shows at once, before it lands (Taylor, 2026-10-19; USE-148): a new block, a day's times, a block's change and an item added, changed, removed or reordered draw in the day as made while "Saving" reads; if the save fails they are put back as they were and "Not saved · Try again" reads. Copy, clear, reset and a date's own change still wait for the save.
- "Try again": sends the failed edit again; the edit stays on screen until it lands [ASSUMPTION: it retries the latest failed edit; no queue is shown].

## Words

"Saving" · "Saved" · "Not saved · Try again".

## The notes on the boards

**"set-my-days / saved (header states) / 402 / light"**, "Frame @ x 5302, y 2190":

> Saved
>
> No Save button. [PROPOSED] Saving while sending, Saved for 2 s, then nothing (earlier frames show it held). A failure reads "Not saved · Try again" in ink, and the edit stays on screen.

## Rulings

- N2: edits save as they're made; `SaveStatus` in the header reads "Saved" for a moment (the States table's saved row).
- D-USE-33: step 9 round 4 approved in full, saved among it. The note's [PROPOSED] (Saving, 2 s, then nothing) is kept as drawn; no D-line lifts step 9's marks.
- Offline, `SaveStatus` is hidden ([`offline.md`](offline.md)); while loading and on error it is absent ([`loading.md`](loading.md), [`error.md`](error.md)).

## Widths

Drawn at: 402. The same three readings at every width; at 1024 and wider (D-USE-83) `SaveStatus` sits in the header above both panes [ASSUMPTION].

## Criteria

| ID                        | When                     | Then                                                             | Evidence                 |
| ------------------------- | ------------------------ | ---------------------------------------------------------------- | ------------------------ |
| C-USE-set-my-days-saved-1 | An edit is sent          | "Saving" with a spinner, top right                               | `captures/saved-402.png` |
| C-USE-set-my-days-saved-2 | It lands                 | "Saved" with a check for 2 s, then nothing                       | `captures/saved-402.png` |
| C-USE-set-my-days-saved-3 | It fails                 | "Not saved · Try again" in ink, no red; the edit stays on screen | `captures/saved-402.png` |
| C-USE-set-my-days-saved-4 | Any state of the surface | No Save button                                                   | manual                   |
