---
title: "What exists for daily use: keep, change, set aside"
description: "Open before shaping the USE narrative: what the codebase already has for Orient, the day, go mode, building a weekday and work items, and what each piece becomes."
layer: specs
status: draft
thread: USE
role: Vesper
date: 2026-10-09
last_reviewed: 2026-10-09
supersedes:
load_when: spec
---

# What already exists for using Synapse daily, and what each piece becomes

Studied 2026-10-09 at `b83158c` in three read-only passes (the day surfaces; day setup and the first run; the schema and Workflow). **Labels:** _verified_ means this thread re-checked it in code; _secondary_ means a study pass found it at the cited file and this thread did not re-check it; each verdict is _judgment_. The notes it serves: [`2026-10-09-day-to-day-use.md`](../../../../../docs/product/operator-notes/2026-10-09-day-to-day-use.md) ("note n").

## Answer

Most parts exist; what's missing is the shape that joins them. The calendar-style day, the icon with colour, a timer, mark-done, a manual time sheet and the editor for items inside a block all exist. What's missing:

1. A **weekday default made of an ordered list of blocks**. Today a plan is a named "Day A" with six fixed block slots, filled through a 17-screen questionnaire.
2. An **active block**, and anything like go mode.
3. A **countdown**. The timer only counts up.
4. **Blocks inside blocks**, and a meal kind.
5. **Work tiers, to-dos not tied to a time, reminders, and a Linear link.**

Orient is a block kind, but nothing pins it to wake or makes it five minutes long, and it hands off to a question form (QuickPick), not to a review of the day.

## The morning and the day

- **`OrientFrame`: keep the content, change the ending.** One screen: passages, links, last night, then gratitude, intention and "Today, as I see it", then "Start the morning", which goes to `/today` (secondary). It becomes step one of the morning loop and ends on the review.
- **`QuickPick`: set aside.** A form of questions (working today, training, free time) built for self-serve (secondary). The review should be the weekday's day, already laid out. Carry only its training Still/Swap idea.
- **`AdjustSheet`: keep.** Slept in, ran long or something came up, previewed before it applies (secondary). This is the mid-day re-plan. The morning adjust is editing the day directly.
- **`ScheduleCanvas`, `ScheduleAxis`, `BlockBand`, `NowLine`, `DragLayer`: keep, at a new density.** Already the Google Calendar-style day. The densities are 64 or 96 px an hour (verified, `schedule-canvas/layout.ts:30`). At 402 × 874, 96 px an hour shows about seven hours below the header and above the tab bar, inside the asked-for six to eight (estimated). Tapping a block opens the block view.
- **`ScheduleBlock`: change.** It draws no icon, and short items shrink to 16–32 px or a 2 px hairline (secondary). It needs an icon, and short items as bullets (notes 24–25).
- **`DayList`, `BlockSection`, `BlockHeader`, `ItemRow`, `ItemIcon`: keep and extend.** The block section is the base for the block view (with a breadcrumb) and for go mode (filtered to one block).
- **Timer (`TimerControl`, `TimerDisplay`, its store and service): keep, change.** It only counts up: Start, Pause, Stop. One timer runs per person, and Stop never marks done (secondary). It needs a countdown from the scheduled length and an over-time readout, with no alarm.
- **`ManualTimeSheet`: keep, plus a quick path.** Time is entered as from and to times, separately from marking done (secondary). Mark-done needs an optional "took N min" (note 63).
- **Icon pickers (`EmojiPicker`, `CuratedIconGrid`, `ColorSwatchRow`): keep, promote.** `IconValue` is an emoji, a curated glyph in one of 8 hues, or an image (secondary, `packages/types/src/domain/domain.ts:242`). The pickers are mounted only in the habit sheet. Taylor wants them on every item, with a hex or a preset colour (note 54).
- **`SortableList`: keep.** It reorders list rows but isn't used on Today (secondary). It covers reordering inside a block.
- **Active block: new.** Nothing has a current-block notion; states are per item (secondary, `packages/types/src/domain/ui-state.ts:19`).
- **Shell: change.** Five tabs: List, Schedule, Review, Workflow, Settings (verified, `nav-items.ts:27-31`). The header avatar opens the whole Settings list, with no menu (secondary). Go mode needs a home here, and the avatar needs a menu with "Set my days" (note 76).

## Building a weekday

- **Named day plans ("Day A", each owning weekdays): change.** Each weekday separate, no named templates for now (notes 32–33).
- **The day-builder walk (B01–B17) and the Settings "Your day" rows: set aside, not deleted.** The questionnaire is the "thousand things" of note 88. Kept for the first run (amendment 2).
- **`preview-strip.tsx` with `ScheduleAxis`: keep, extend.** It already draws a plan as blocks at 96 px an hour, each band a button (secondary). The base for tapping a time to add a block (note 83).
- **`slot-rows.tsx`, `block-editor/`: keep.** They already add and edit the items inside a block (note 84).
- **B2 times (up at, lights out, phone away): keep.** The wake and sleep bounds, per plan (secondary). Settings, Day & time, holds a competing usual wake time.
- **`day-plan-card` Duplicate: change.** It copies a whole plan, and there is no "copy from Monday" (secondary, note 79).
- **Orient placement: change.** It is laid out from wake, its length is the sum of its items, and Block order can move it down (secondary). Pin it at wake, five minutes, not removable (note 86, amendment 1).
- **First run, steps 1–5: keep, out of focus.** The week's shape, the blocks primer, work days, your days, your usual week (secondary).
- **`week-build`: set aside.** It plans one dated week, not weekday defaults.
- **`blocks-primer`: keep**, perhaps in the menu.
- **`platform-steps-sheet`: keep, surface, rewrite.** It has steps for iOS, Android and desktop, in placeholder copy. It shows only after three reviewed days and finished setup (secondary, `shell-status-line.tsx:189-198`). The iOS steps predate iOS 26.

## The data

- **`day_plans`: change.** It has six fixed template links: morning, prep, work, after work, activity, wind-down (verified, `plan/day-plans.ts:102-128`). It cannot hold an ordered, open list of blocks, and Orient has no slot.
- **`templates`, `template_slots`: keep.** A template is one block, and its slots carry length, gap, pinned time and order (secondary).
- **`day_blocks`: change.** No parent, no name of its own, no icon (secondary). "Drive to the gym" inside wellness (note 57) needs a parent.
- **`block_kind`: change.** Orient, morning, training, prep, work, break, transition, activity, wind-down (verified, `enums.ts:82-90`). Here `transition` means the after-work hand-off, and there is no meal. Taylor's transition is any in-between, and a meal is one kind of it (note 92).
- **`day_items`: keep, extend.** Snapshots with time, length, icon, completion and done-at (secondary). No actual-length field; `timer_sessions` can supply spent time.
- **`fixtures`: keep, extend.** Meetings and appointments by weekday, with no work-or-not flag (note 71).
- **Workflow tables: set aside.** A board for AI-prompt threads, with no tier, due date or length, and almost entirely separate from the day (secondary). Taylor calls it a beta (note 40).
- **Miss tiers, alternates, multitask groups, opener-pool-closer, priority 1–7: set aside for this epic.** Self-serve breadth. `tier-radio-rows` is the miss tiers, not work tiers (secondary).
- **New:**
  - a work tier: primary (up to 2), secondary (3–4), stretch;
  - a to-do not tied to a time;
  - a per-item reminder;
  - a Linear link. `day_items.calendar_event_id`, an unused seam, shows the pattern (secondary, `day-items.ts:144`).

## Rules this bends

Taylor ruled that these are for experimenting, not hard rules (amendment 7). Named, not gated on.

- **No gamification** (`product-rules.md`) against the "dopamine rush" and "gamify mode" (notes 37, 49). Sage's reading (judgment): the check-off, a quiet done state and "complete the block" carry the reward without counts or streaks.
- **No numbers about the day on the tabs.** A countdown and an over-time readout are lengths, which the rule allows. A count of items left would bend it.
- **Words.** `time-and-day.md` never says late, behind or overdue, so the over-time readout needs a neutral word.
- **Orient never shows a time** (verified, `orient-frame.tsx:30`), and v1.1 §5.4 says there's no morning timer. Five minutes can be the block's length without a countdown on screen.
- **Colour.** A hex chosen for an item is the person's data, not a design value; colour still never carries meaning alone.

## Lookups (2026-10-09)

- **iPhone, Safari on iOS 26** (secondary: ithinkdiff.com, heise.de): the three dots by the address bar, Share, Add to Home Screen, leave "Open as Web App" on, then Add. Since iOS 26, every site added this way opens as a web app.
- **Android, Chrome** (secondary: vendor guides): the three-dot menu, "Install app" or "Add to Home screen", then Install. Chrome may also offer its own prompt.
- **Linear issue fields** (verified on linear.app/docs/creating-issues; the status categories and "No priority" are secondary, from Linear's docs via search):
  - identifier (ENG-123), title, team, project, milestone;
  - status, in the categories Triage, Backlog, Unstarted, Started, Completed, Canceled;
  - priority: Urgent, High, Medium, Low, No priority;
  - assignee, labels, cycle, estimate, due date, description, relations.

## Not found

- A Linear or link field on any item or task.
- A per-item reminder. The only notifications are the system kinds: item start, block start, review.
- A to-do not tied to a time. A one-off `day_item` belongs to a date.
- Google's own current install help for Chrome on Android.
- A measured count of the hours on screen.

## Promote to library

No. It describes one codebase at one commit.
