---
status: approved
epic: USE
approved: 2026-10-09
fed_by:
  - docs/product/operator-notes/2026-10-09-day-to-day-use.md
---

# Part 4: go mode

After **Ready, go**, the day becomes a run of checks: "check, check, check" (note 65). Go mode lives on the List tab, which reads **Now** while the day is live; Schedule stays the whole day (round 9). The bottom `BottomNav` stays, so the rest of the app is always one tap away.

## Now

**What you see**, top to bottom:

- **To-dos tray.** The same tray as Review the day, closed.
- **The active block, and only it** (note 56). Its grouping box fills the screen:
  - a `BlockHeader` with icon, name, span ("Wellness · 7:05 to 8:57") and an `EllipsesMenu` holding "Complete Wellness", "Edit block" and "See the whole day";
  - the transitions inside the block, shown in the flow as slim bands, because they don't leave it (note 57).
- **The current item, lifted** (round 10). A `Card` with no shadow and a hairline border, holding:
  - a 40 px `ItemIcon` and the name in `heading`;
  - the planned length in `figure` ("10 min") and the planned start ("7:20");
  - two `Button`s side by side: **Start** (secondary) and **Done** (default, ink). Done is the primary action.

  The current item's dot is verdigris, the one place the brand colour marks "this moment".

- **The rest of the block.** `ItemRow`s with a `Checkbox`. Done rows stay in place, faded and live. The next undone row is lifted as soon as the current one is done.

**What you do.**

- **Done.** It checks the item with a short settle, and the next undone item lifts (note 60).
- **Start.** The card turns into the running card (below).
- **Tap a row** to make it the current item. Order is a plan, not a rule.
- **Check a row's box** to complete it without lifting it.
- **Long-press a row** for Swap, Edit, and "Not today". "Not today" moves it out of the block with no judgement.

**Why it matters.** "Here's your current thing that you're actively on" (note 52), with nothing outside the block competing for the eye. The reward is the check itself: quiet, immediate, felt (note 37). There is no count of what's left. The block's own span is the only measure.

**Stories.**

- Taylor, out of the bath with wet hands, wants to check _Cold bath_ with one large target and move on.
- Taylor, mid-Wellness, wants to see the rest of the day without leaving go mode: "See the whole day" opens Schedule.

| State             | What the person sees                                                                                                                                    | What they can do              |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| current item      | As above                                                                                                                                                | Start, Done                   |
| between blocks    | A transition sitting between blocks becomes the active block on its own: a slim box ("Breakfast · 9:00 to 9:30", meal glyph) with one item and Done     | Done                          |
| ahead of the plan | The block finished before its span; the close card shows (below)                                                                                        |                               |
| behind the plan   | Nothing changes colour. A quiet line at the top of the block reads "Planned to end at 8:57" once that time has passed. No word for late is ever used.   | Carry on, complete, or adjust |
| Checklist block   | Every row shows with a drag handle and a `Checkbox`, with no lifted card and no times. Checked in any order, and reordered by dragging (refinement 10). | Check, reorder                |
| empty Break       | Just "Break · 15:00 to 15:10" in the box, and "End break". A true break holds nothing to do (refinement 8).                                             | End break                     |
| no blocks left    | `EmptyState`: "The day's blocks are done." With the to-dos tray open and "See the whole day"                                                            | To-dos                        |
| before Ready, go  | Now reads as the List tab did, with a `Button`: "Review the day"                                                                                        |                               |
| offline           | All checks work and sync later. A `StatusLine` says "Offline. Checks are saved on this phone."                                                          | All                           |
| error on check    | The box reverts, with an inline "Not saved. Try again."                                                                                                 | Retry                         |

## Running

**What you see.** The lifted card in its running state:

- a `TimerDisplay` counting **down** from the planned length, large, in `figure` ("7:42");
- under it, the planned length as a caption ("of 10 min");
- two `Button`s: **Pause** (secondary) and **Done** (default).

At zero the count keeps going, now as "**1 min over**", "2 min over", in plain ink: no red, no sound, no vibration (note 62, round 11). The display is `aria-live="off"`, so VoiceOver reads it only when focused.

**What you do.** Done stops the timer, checks the item and records the time taken. Pause holds it. Leaving the app doesn't stop it; it's time-based, not ticking in the background. One timer runs at a time, so starting another item pauses this one, with a `Toaster` reading "Meditate paused".

| State                | What the person sees                                                                                                          |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| counting down        | "7:42" and "of 10 min"                                                                                                        |
| over                 | "3 min over" and "of 10 min". Ink only; the border doesn't change.                                                            |
| paused               | "Paused at 4:10" and Resume                                                                                                   |
| left running all day | At the day's close the timer ends at the boundary and the item is left for the morning, not marked missed (the existing rule) |

## Done, with time taken

**What you see.** After a **Done** with no timer, the checked row shows a one-line `QuickChipRow` under its name for about six seconds: "Time taken", then "As planned" and "Other…" (note 63, round 11). Ignored, it fades and nothing is recorded. "Other…" opens a small sheet with a `MinutesStepper`, starting at the planned length, and "Save". After a timed Done, the row simply shows "12 min" in `figure`; there's no chip.

**Why it matters.** The data matters later (note 74), but never at the cost of a check. Skipping is the default, not a refusal.

## Block complete

**What you see.** When the last item in the block is checked, or "Complete Wellness" is chosen from its menu, the block's box settles into a close `Card`, centred in the space:

- the block's icon, and "**Wellness complete**" in `heading`;
- "Next: Breakfast · 9:00", then "Work · 9:30", as two `ListRow`s with icons;
- one `Button`, default and full width: "**Start Breakfast**";
- if anything was left unchecked, a quiet `TextDisclosureButton`: "2 not done". Opening it lists the items, each with "Move to later" or "Leave". Left items stay simply not done (round 12).

**What you do.** Start the next block, which becomes the active block. Or close the card and stay; Now then shows the next block anyway.

**Why it matters.** "Okay, complete wellness block, move into the next block" (note 64): a small moment of closing between two stretches of the day, then on.

## A work block in go mode

**What you see.** The same Now, with Work as the active block. Under the `BlockHeader` sit three `GroupHeading`s: **Primary**, **Secondary** and **Stretch**, with items under each (round 13). The first undone Primary is lifted. Meetings and appointments sit in the flow at their pinned time, with a "Work" or "Personal" `Tag`; at their time they lift ahead of the tiers (note 71).

A **Linear-linked item** keeps the person's own icon and title. Under the title, one line holds `[PROPOSED]` `LinearLine`: the project name, then "ENG-123" in `figure`, then the status as Linear's shape glyph plus its word ("In progress"), so colour is never alone (round 15). Tapping opens the Item sheet. Checking it off moves the issue to Done in Linear. The line's shape and word change with it, and a brief "Updating Linear" shows while that happens. If it fails, the line reads "Not updated in Linear" with "Try again", and the check in Synapse stands. It is designed as wired; the wiring itself comes later (refinement 11).

**Past a cap.** A third Primary or a fifth Secondary is allowed; a `HelperText` under the heading says "Two is the usual for Primary." It's soft, never a block (round 13).

| State               | What the person sees                                                                                                                                                      |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| work not slotted    | The three headings, each empty, with "Add to Primary" `InlineAddRow`s. A quiet line reads "Work is set each morning."                                                     |
| only Primary set    | Secondary and Stretch are collapsed to their headings                                                                                                                     |
| several work blocks | The tiers belong to the day (refinement 6). The first work block shows all three sections; each later one shows what's still undone, so an item never sits in two places. |

## To-do reminder

**What you see.** At the reminder time, a notification whose text is the to-do in Taylor's own words, "Call the mechanic", with nothing added. Tapping it opens Now with the tray open on that to-do. The tray marks it with a small bell glyph and its time.

**What you do.** Check it whenever; to-dos have no place on the rail (note 46). An unchecked to-do carries to tomorrow's tray, quietly.

| State                  | What the person sees                                                                                                            |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| not installed (iPhone) | No reminders can arrive. The reminder field reads "Reminders need the installed app." with "How", which opens the install sheet |
| notifications off      | The same line, pointing to Settings, then Notifications                                                                         |

## Schedule, during the day

The Schedule tab is the whole day at 96 px an hour, as in Review the day, with the `NowLine` and checked items faded. The active block has a hairline verdigris edge, the one "this moment" mark. Tapping a block opens its Block view with the breadcrumb. It answers "where am I in the day" without leaving go mode's calm.
