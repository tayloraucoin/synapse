---
status: approved
epic: USE
approved: 2026-10-09
fed_by:
  - docs/product/operator-notes/2026-10-09-day-to-day-use.md
---

# Part 2: setting your days

Done once, then edited now and then. Here there's time to spend, so the screens can be roomy. Every surface is 402 wide, light first. Component names are from `@syn/ui`. `[PROPOSED]` marks a component that doesn't exist yet. In quoted interface words, a slash separates alternative wordings.

## Avatar menu

**What you see.** The `AppHeader` already shows an `Avatar` at the top right of every tab. Tapping it opens a `DropdownMenu` anchored under it. At the top is the person's photo and name. Below are four rows, each a 20 px glyph and a label:

1. "Set my days"
2. "Profile"
3. "Install the app", shown only while Synapse is not installed
4. "Settings"

There's no primary action; it's a menu.

**What you do.** "Set my days" opens the day editor on today's weekday. "Profile" opens the profile sheet. "Install the app" opens the install sheet. "Settings" goes where the avatar used to go (round 1).

**Why it matters.** Setting the days is real work, but it isn't daily work, so it sits one tap away from every screen without taking a tab (note 76).

**Stories.** Taylor, editing a Wednesday on a Sunday night, wants to get there from any tab without hunting through Settings.

| State         | What the person sees                                                                         |
| ------------- | -------------------------------------------------------------------------------------------- |
| installed     | Three rows; "Install the app" is gone                                                        |
| not installed | Four rows                                                                                    |
| no photo      | The avatar and the menu show the name's initial on paper                                     |
| offline       | The menu still opens; the screens behind it show their own offline state                     |
| others        | Not applicable: the menu holds no data, so there's no empty, loading, error or partial state |

## Profile sheet

**What you see.** A `ResponsiveSheet` titled "Profile", with the photo at 96 px and "Change photo", which opens the `ImageCropper`; a name `Input`; the account's email as plain text; and "Save" (refinement 3).

**Signed in, always.** Every screen in this narrative needs a signed-in session. Signed out, any route lands on the existing sign-in screen, then returns to where it was going (refinement 3).

| State          | What the person sees                                  |
| -------------- | ----------------------------------------------------- |
| no photo       | The initial in a circle, and "Add photo"              |
| uploading      | The photo dimmed, with `LoadingText` "Uploading"      |
| error, offline | Inline: "Not saved. Try again." The typed name stays. |

## Set my days

**What you see**, top to bottom:

- **Header.** A back chevron and the title "Set my days".
- **Which week.** A `SegmentedControl`: "Usual week" or "This week" (refinement 2).
  - **Usual week** edits each weekday's default. Its blocks persist every week: Wellness, Training, meals, Evening, and the work blocks' times, with no work in them.
  - **This week** edits the seven dated days, filled from the usual week, with "‹ 12 to 18 Oct ›" to step between weeks. It opens on This week from Sunday evening onward `[ASSUMPTION]`.
- **Week strip.** `WeekdayChips`, Monday to Sunday, the open day filled ink; in This week, each chip carries its date. A day already built shows a small dot under its letter, with "set" in its accessible name.
- **Day line.** The day's name in `heading`, e.g. "Monday", and an `EllipsesMenu` holding "Copy from…" and "Clear this day".
- **Bounds row.** Two `TimeField`s: "Up at 7:00" and "Lights out 22:30". These are the day's top and bottom (note 81).
- **The column.** `ScheduleAxis` on the left: hour labels at 96 px an hour, half-hours as hairlines with no number (note 23). Blocks are `ScheduleBlock`s at their true height, each a grouping box with a 3 px left rule in its colour, its icon and name, and its time span in `figure`. Inside, items show as bullets in a grid: icon and name, two columns when short, with "+3 more" when they don't fit (round 6). Transitions are slim `BlockBand`s, about 24 px, with icon and name on one line; a meal shows a fork-and-knife. **Orient** is always the first 5 minutes after "Up at", with a small lock glyph; its menu says "Orient is always first."
- **The + button.** Round, bottom right, 56 px, above the safe area. `[PROPOSED]`: a floating action button, since the kit has no round control beyond the mark and the dots.

The primary action is adding a block.

**What you do.**

- Tap a day chip to switch days. Edits save as they're made; a `SaveStatus` in the header reads "Saved".
- Tap an empty time on the rail, or the +. The **New block sheet** opens, at the tapped time or at the first free time after the last block (round 3).
- Tap a block to open its **Block view** in edit mode. In This week, a work block opens on its tier sections: "Add to Primary", "Add to Secondary", "Add to Stretch" (refinement 6).
- In This week, "Add event" in the day's menu adds an appointment, meeting or social event at a set time, tagged "Work" or "Personal". It sits in whichever block its time falls in, or stands as its own small block (note 71, refinement 2).
- Long-press a block, then drag it to move it in time; others don't move, and an overlap shows both side by side.
- Change "Up at", and Orient moves with it. Blocks that would now sit outside the bounds keep their place and get a dashed edge, never deleted.
- **Copy from…** opens a `PickerList` of the built days. Picking one asks "Replace Thursday with Monday?" (`AlertDialog`, "Replace" and "Cancel"). After replacing, a `Toaster` offers "Undo" (round 4).

**Why it matters.** This is the planner's week page, made editable: the day is set as the shape of real time, not answered as a questionnaire (notes 82–85, 88).

**Stories.**

- Taylor, with Monday built, wants Tuesday done in ten seconds: Tuesday, then "Copy from Monday".
- Taylor, on Wednesday's rest day, wants the gym out and abs and yoga in, without touching Monday.
- Taylor, on Sunday evening, wants to slot the week's Primary work into each day and add Thursday's dentist appointment, without touching Wellness at all (refinement 2).

| State                               | What the person sees                                                                                                                         | What they can do  |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- |
| empty, first day                    | The bounds row reads "Up at" and "Lights out" with no times, and an `EmptyState` reads "Set when the day starts and ends." The column waits. | Set the two times |
| empty, bounds set, other days built | Orient, then empty column. A `Button` (secondary) reads "Copy from Monday", above "or tap a time to add a block".                            | Copy, or add      |
| building                            | Some blocks, gaps showing as empty rail                                                                                                      | Everything        |
| loading                             | Skeleton bands in the column; the strip and header are live                                                                                  | Switch days       |
| error                               | A `RegionRetry` in the column: "The day didn't load." with "Try again"                                                                       | Retry             |
| offline                             | The day shows read-only, with a `StatusLine`: "Offline. Changes wait until the connection is back." Edits are disabled.                      | Read              |
| saved                               | `SaveStatus` reads "Saved" for a moment                                                                                                      |                   |

**Edge cases.**

- A block that runs past "Lights out" gets a dashed edge.
- A day with no work, like Saturday, is just fewer blocks.
- A very long block name truncates at one line in the column and shows in full in the block view.
- A change to the usual week reaches every day of this week not yet started, except the blocks already changed on that date `[ASSUMPTION]`. It never reaches a day already begun (note 18).
- Sunday is often one Checklist block (refinement 10).

## New block sheet

**What you see.** A `ResponsiveSheet` titled "New block", with:

- a `SegmentedControl`: "Block" or "Transition";
- for a block, a `ChipPicker` for its kind: "Wellness", "Training", "Work", "Break" or "Evening" (refinements 5, 8). A Break can be left empty, as a true break;
- for a block, a `Switch`: "Checklist, no times" (refinement 10);
- for a transition, a `Switch`: "Meal";
- a name `Input`;
- an `EmojiSlotButton` for the icon, which opens the icon picker;
- a `ColorSwatchRow` for a block's colour (a transition takes its parent's colour);
- a `TimeField`: "Starts";
- a `MinutesStepper`: "Length", 60 by default, or 15 for a transition;
- a sticky `Button`: "Add block" or "Add transition".

**What you do.** Add, and the block appears in the column and opens its Block view, ready for items (note 87). A transition dropped inside a block's span asks nothing; it belongs to that block (round 5).

| State          | What the person sees                                                                |
| -------------- | ----------------------------------------------------------------------------------- |
| default        | The name is focused, with the keyboard up                                           |
| clash          | A quiet line in the sheet: "Overlaps Work, 9:30 to 12:00." Adding is still allowed. |
| invalid        | No name: "Add block" stays disabled, and the label reads "Name needed"              |
| error, offline | Inline: "Not added. Try again." The sheet keeps what was typed.                     |

## Block view, editing

**What you see.**

- **Breadcrumb.** `[PROPOSED]` `Breadcrumb` (Plumb at lock): "Monday › Wellness". Tapping "Monday" goes back (round 7).
- **Block header.** `BlockHeader`: icon, name, span ("7:05 to 8:57"), and an `EllipsesMenu` with Rename, Icon and colour, Delete block.
- **The column.** The same column, stretched so this block's span fills the screen. A one-hour block is about 600 px, so every two-minute item gets a readable `ItemRow`: drag handle, `ItemIcon`, name, planned length in `figure`, and start time on the rail (note 29). Transitions inside show as slim bands in the flow.
- **Add row.** An `InlineAddRow` at the foot: "Add to Wellness".

**What you do.**

- Add an item: type a name and press return. It takes 5 minutes and follows the last item. Tapping it opens the **Item sheet**.
- Drag a handle (`SortableList`) to reorder. Times re-flow around pinned items (round 8).
- Swipe left on a row to delete it, with a `Toaster` offering "Undo".

| State  | What the person sees                                                                                            |
| ------ | --------------------------------------------------------------------------------------------------------------- |
| empty  | "Nothing in Wellness yet." with the add row focused                                                             |
| full   | Items past the block's end show over a dashed line: "Runs 12 min past 8:57." This is information, not an error. |
| others | As Set my days                                                                                                  |

## Item sheet

**What you see.** A `ResponsiveSheet` titled with the item's name. It holds:

- **Icon.** The icon picker `[PROPOSED]`: a two-tab `Tabs` with "Emoji" (`EmojiPicker`) and "Icon" (`CuratedIconGrid`). Under the icon tab, `ColorSwatchRow` gives eight presets plus a "Custom" swatch that opens a hex `Input` (note 54).
- **Length.** A `MinutesStepper`.
- **Pinned time.** A `Switch`, "At a set time", with a `TimeField`.
- **Swap.** Opens a `PickerList` of the library, filtered to the same kind (workouts for a workout) and searchable, with `SearchField` (note 95).
- **Work items only:**
  - a `SegmentedControl` for the tier: "Primary", "Secondary" or "Stretch";
  - for a meeting, a `SegmentedControl`: "Work" or "Personal" (note 71).
- **Linear item.** Designed as if wired, because the design is the source of truth; the wiring comes later (refinement 11). "Link a Linear issue" opens a `SearchField` over the person's open issues, assigned first. Once linked, `[PROPOSED]` `LinearLine` shows the issue ID ("ENG-123"), the project name, and the status as Linear's shape plus its word ("In progress"). Below sit priority and assignee as `ListRow`s, then "Open in Linear" and "Unlink" (round 15). Checking the item off moves the issue to the team's Done status. Unchecking moves it back to its status before.

| State                  | What the person sees                                                                          |
| ---------------------- | --------------------------------------------------------------------------------------------- |
| default                | As above                                                                                      |
| swap open              | The picker over the sheet. An empty library reads "Nothing of this kind yet." with "Add one". |
| hex bad                | "Not a colour. Try 6 characters, like 2F6F62." The swatch keeps the old colour.               |
| Linear not connected   | "Link a Linear issue" reads "Connect Linear" and goes to Settings                             |
| Linear syncing         | The status word, then `LoadingText`: "Updating Linear"                                        |
| Linear failed          | "Not updated in Linear." with "Try again". The check in Synapse stands.                       |
| issue closed in Linear | The item checks itself, with the line "Done in Linear"                                        |

## Install sheet

**What you see.** A `ResponsiveSheet` titled "Install Synapse", with `Tabs` for "iPhone" and "Android", opened on the device's own platform. Numbered steps, each with a small drawn glyph of the control (round 16):

- **iPhone (iOS 26, Safari):**
  1. Tap the ••• beside the address bar.
  2. Tap Share.
  3. Tap Add to Home Screen.
  4. Leave "Open as Web App" on.
  5. Tap Add.
- **Android (Chrome):**
  1. Tap the ⋮ menu.
  2. Tap Install app, or Add to Home screen.
  3. Tap Install.
- **Footer.** "Then open Synapse from the home screen."

**What you do.** Read, and close. It's offered once on its own: after the first day is set, as a `StatusLine` with "How" (round 16). Otherwise it's only in the avatar menu.

| State                                 | What the person sees                                                 |
| ------------------------------------- | -------------------------------------------------------------------- |
| iPhone in another browser             | A line above the steps: "Open this page in Safari first."            |
| Android with the browser's own prompt | A `Button`, "Install", fires Chrome's prompt; the steps sit below it |
| installed                             | Not reachable                                                        |

## Amendments

- **2026-10-12, D-USE-88 (Taylor, UX handoff thread 6).** The avatar menu's rows are now, in order: "Set my days", "Meal topics", a rule, "Profile", "Install the app" (only while Synapse is not installed), "Settings". Installed, there are five rows; not installed, six. There is no Help row. The menu above keeps its first wording as approved; this line wins where they differ.
