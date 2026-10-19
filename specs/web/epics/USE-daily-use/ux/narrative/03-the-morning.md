---
status: approved
epic: USE
approved: 2026-10-09
fed_by:
  - docs/product/operator-notes/2026-10-09-day-to-day-use.md
---

# Part 3: the morning

The worst moment comes first here: half awake, on the toilet, one thumb, a few minutes, the bath filling (notes 11, 20). Every screen in the morning loop is built for that state. Each screen has one primary action, and nothing asks a question that isn't optional. The loop is Orient, then Review the day, then **Ready, go** (round 9).

## Orient

**What you see.** Today's Orient frame, kept in spirit (note 19), drawn in its bare route without the header and tabs. Top to bottom:

- the date as a caption;
- the `PassageCarousel`;
- any `LinkCallout`s;
- the collapsed "Last night" lines;
- three autosaving `Textarea`s: gratitude, intention, and "Today, as I see it".

The only change is the end. The single `Button` now reads **"Review the day"**, not "Start the morning", and goes to Review the day instead of the List tab.

**Five minutes, and no clock.** Orient is the first five minutes of every day as a block (note 86, amendment 1), but the screen never shows a time or a countdown. The calm is the point (note 14). If Taylor is still in Orient at 7:05, nothing happens; the day simply begins when "Review the day" is tapped.

**Why it matters.** "Get my emotions in the right place" comes before seeing the plan. The plan read in a calm state gets adjusted well; read flooded, it gets abandoned (note 20).

| State                         | What the person sees                                                                                                            |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| first open of the day         | The frame                                                                                                                       |
| opened again the same morning | Skipped; straight to Review the day, or to Now after "Ready, go"                                                                |
| woke late                     | The same frame. Orient moves to the real wake time, and the day lays out from there (see below)                                 |
| no passages yet               | The carousel is absent; the textareas and the button remain                                                                     |
| offline                       | The frame shows from cache; the textareas save when the connection is back, with a quiet `SaveStatus` reading "Waiting to save" |

## Review the day

**What you see.** A focused screen, still before go, so it has no tabs:

- **Header.** "Monday, 12 October" in `heading`, and a quiet `Button` (ghost), "Back to Orient".
- **To-dos tray.** A `Collapsible` pinned under the header. Closed, it reads "To-dos" with the first title beside it, ellipsised ("Call the mechanic…"). Open, it lists rows with a `Checkbox`, an icon, the title, and a reminder time in `figure` when one is set, then an `InlineAddRow`: "Add a to-do" (round 14). It is the planner's to-do column, brought beside the day (note 69). Per the product rule, it never shows a count.
- **The day column.** The same column as Set my days: `ScheduleAxis` at 96 px an hour, about seven hours to a screen (note 27), scrolled so Orient sits at the top. Each block is its grouping box with its items as bullets (round 6); transitions are slim bands; meals carry their glyph.
- **Ready, go.** A sticky `Button` (default, ink), full width, above the safe area. It is the primary action.

**What you do**, adjusting in place (note 38):

- **Swap:** tap an item bullet to open the **Item sheet**, then "Swap".
- **Reorder:** tap a block to open its **Block view**, then use the handles.
- **Add:** tap an empty time, or a block's own "Add to …".
- **Remove:** swipe a band, or an item in the block view, with "Undo".
- **Work for today:** it was slotted with the week, in "This week" (refinement 2). Here it can still be moved, added or dropped: tap a work block for its Primary, Secondary and Stretch sections (part 4). A day with nothing slotted shows the empty sections, ready for a quick add.
- **Ready, go** locks the day, opens the List tab as **Now**, and enters go mode (note 48). Locking only ends the review; everything stays editable later.

**Why it matters.** This is "here's my day ahead, be able to swap anything out" (note 38): the default already written in, so the morning spends its few minutes on judgement, not data entry.

**Stories.**

- Taylor, on a gym day that feels like yoga, wants to swap the workout in two taps and go (note 18).
- Taylor sees Thursday's dentist appointment, slotted on Sunday, and moves a Secondary item to after it.

| State                       | What the person sees                                                                                                                                                                 | What they can do                       |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------- |
| default                     | The weekday default as today                                                                                                                                                         | Adjust, Ready, go                      |
| no default for this weekday | Orient, then an `EmptyState`: "Saturday has no plan yet." With "Set Saturday", which opens Set my days, and "Go without a plan", which opens Now with only the to-dos                | Either                                 |
| woke late                   | The column starts at the real wake time. Blocks that have already passed sit above a faint line, "Planned before 7:40", collapsed into one row that opens. Nothing is marked missed. | Move a passed block later, or leave it |
| loading                     | Skeleton bands; the button is disabled with the label "Loading the day"                                                                                                              |                                        |
| error                       | `RegionRetry`: "The day didn't load." The button is hidden.                                                                                                                          | Retry                                  |
| offline                     | The day from cache, editable. Changes wait, and a `StatusLine` says so. Ready, go still works.                                                                                       | All                                    |
| already gone                | Not reachable. After Ready, go, this screen's job passes to the Schedule tab.                                                                                                        |                                        |

**Edge cases.**

- A long morning of edits is fine; nothing times out.
- Changing a block here changes today only, never Monday's default (note 18). A quiet line under the header, "Changes apply to today", shows once, the first time.
- Physio has no place yet (note 36) `[NEEDS DECISION]`; see part 5.

## Block view, from the day

Tapping a block in Review the day, or later on Schedule, opens the same Block view as in part 2. It has the breadcrumb "Today › Wellness", the stretched column, and readable rows (round 7). The difference is the rows: here they carry a `Checkbox` instead of a drag handle, and the handles appear only after "Edit" in the header's menu. A checked item stays visible and quiet, never hidden (the rule that done stays live). The breadcrumb goes back to the day.

| State                    | What the person sees                                                 |
| ------------------------ | -------------------------------------------------------------------- |
| from Review the day      | Breadcrumb "Today › Wellness"                                        |
| from Schedule, during go | The same, plus a now-line inside the block when the block is current |
| block in the past        | Rows faded and still live; checking late is allowed                  |
