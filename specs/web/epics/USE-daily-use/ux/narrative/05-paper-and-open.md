---
status: approved
epic: USE
approved: 2026-10-09
fed_by:
  - docs/product/operator-notes/2026-10-09-day-to-day-use.md
---

# Part 5: what Paper will hold, and what's open

## What Paper will hold

The Synapse file is `01M49AX02VV4SSBKNCN6NRTS6Y` (note 107). The frames are iPhone 402 × 874 only (note 99), light first, with dark added at lock. Artboards are named `<surface> / <state> / 402 / <scheme>`.

- **Overview first.** The overview-level list below is the starting point (refinement 4).
- **Variations: yes** (note 109). A few directions, drawn to judge rather than to keep, varied on **layout and density** for the three screens that carry the day:
  - **Review the day:** bullet grid vs a name-only block, and 96 vs 80 px an hour.
  - **Now:** lifted card vs plain checklist, and the tray open vs closed.
  - **Set my days:** week chips vs a seven-day list first.
- **Pace: screen by screen** (note 110), one surface per Design thread. It starts with the first-wake loop, the overview first, then each screen in the loop's order (refinement 4, part 1's step table): 0. **The overview.** One board of the first-wake loop end to end: Orient, then Review the day, then Swap, then Now, then Running, then Block complete, as low-detail frames joined by the flow. It sets direction before any screen is finished.
  1. Orient, with its new ending
  2. Review the day, with the To-dos tray
  3. Block view, from the day
  4. Item sheet, Swap open
  5. Now, entering go mode
  6. Running, and Done with time taken
  7. Block complete
  8. The work block in go mode, with the Linear row
  9. Set my days, Usual week and This week
  10. New block sheet
  11. Item sheet, in full, with the icon picker and Linear
  12. Avatar menu, profile sheet and install sheet

**Artboards** (all at 402, in the light scheme):

- **now:** current item · between blocks · behind the plan · no blocks left · before Ready, go · offline · error on check
- **now-running:** counting down · over · paused
- **now-done:** time-taken chips · other sheet
- **block-complete:** all done · with items not done, open
- **now-work:** tiers · not slotted · past a cap · meeting lifted · Linear row · Linear updating · Linear failed
- **now-other blocks:** Checklist block · empty Break
- **review-day:** default · no default for this weekday · woke late · loading · error · offline · tray open
- **block-view:** from the day · editing · empty · runs past its end
- **set-my-days:** usual week, first day empty · bounds set (copy from) · building · this week, work slotting · add event · loading · error · offline · Copy from picker · Replace confirm
- **new-block-sheet:** block, with kind · checklist · transition · meal · clash · invalid
- **item-sheet:** default · swap open · icon picker (emoji) · icon picker (icon, custom hex) · bad hex · Linear search · Linear linked · Linear not connected
- **avatar-menu:** installed · not installed · no photo
- **profile-sheet:** default · no photo · uploading
- **install-sheet:** iPhone · Android · iPhone in another browser
- **orient:** the frame with "Review the day"
- **todo-reminder:** the notification · not installed

**New components to settle on the canvas** (Plumb at lock): `Breadcrumb`, the floating + button, the icon picker's two-tab shell, `LinearLine`, the countdown mode of `TimerDisplay`, and the bullet-grid inside `ScheduleBlock`.

## Rules this bends, named

Taylor treats the product rules as experiments here (amendment 7). The narrative still keeps them wherever that costs nothing:

- **No gamification.** The design bends towards "gamify mode" (note 49) but adds no counts, streaks or scores. The reward is the check and the close card.
- **No numbers about the day on the tabs.** Only lengths and times are shown. "1 min over" is a length.
- **Words.** "Over" is the one neutral word, and late, behind and overdue never appear. "Time taken" carries no question mark on the tab.
- **Orient never shows a time.** Kept: the five minutes are the block's length, not a countdown.
- **Colour never alone.** Linear's status is a shape and a word. A done item is a check and a fade.

## Open questions, and how they were settled

Settled in refinement round 1:

1. **Physio** is a kind of Training block (refinement 5).
2. **Work tiers** belong to the day (refinement 6).
3. **Workouts** come from the library's workout kind, through Swap and its "Add one" (refinement 7).
4. **The stretch break** is a small Training block. A walk is a small Wellness block, and a Break can be left empty as a true break. The finer points of breaks come later (refinement 8).
5. **Weekends** work the same way. Sunday is often one Checklist block, reordered by dragging and checked in any order (refinement 10).
6. **Linear check-off** is designed as wired, and the wiring comes later (refinement 11).

Still assumed, none blocking:

- Monday's times in part 1 are placeholders for the drawings. `[ASSUMPTION]`
- "This week" is the default in Set my days from Sunday evening onward. `[ASSUMPTION]`
- A change to the usual week reaches the days of this week not yet started, except blocks already changed on that date. `[ASSUMPTION]`
