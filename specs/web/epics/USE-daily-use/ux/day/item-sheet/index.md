---
target: specs/web/ux/day/item-sheet/index.md
status: approved
promoted:
design:
  file: "Synapse, 01M49AX02VV4SSBKNCN6NRTS6Y"
  pages: ["USE — set up", "USE — daily use", "USE — work"]
  rows:
    - "USE — set up · Row label · Item sheet"
    - "USE — set up · Row label · Item sheet (cont.)"
    - "USE — daily use · Row label · Item sheet (see step 11)"
    - "USE — daily use · Row label · Work block (cont.)"
    - "USE — work · Row label · Phone, Today"
    - "USE — work · Row label · Phone, editing and This week"
  locked: 2026-10-10 (phone work rows 2026-10-12, D-USE-58)
---

# Item sheet — day

Handoff pass, the ledger of the boards. Sources: N2 "Item sheet", N3 (Swap), N4 (Linear-linked item), N6 (the item sheet at the desk); D-USE-12, 24, 35 to 37, 54, 57, 60. Every state is a file in `states/`; the icon picker, Move to and Linear status changes are interactions.

## Job

Change one item without leaving the day: swap it for another of its kind (the morning's most common edit, note 18), or set its icon, length, pinned time, notes, and on a work item its tier, sessions and Linear link. Done is the sheet closed with the change in place. Nothing is saved by a button: every change saves as made, for today only (D-USE-60).

## Entry and exit

- **Entry:** an item bullet on Review the day ([`../review-the-day/index.md`](../review-the-day/index.md)); an item row in a Block view (`../block-view/index.md`, also from Set my days); "Swap" or "Edit" from a long-press on Now ([`../now/index.md`](../now/index.md)); a linked row tapped on Now in a work block (`../now-work.md`, state `linear-item-from-now`); a work row tapped on Today on the phone (`../../work/today/`, D-USE-57: `tier-and-sessions`, `while-firing`). Route `?sheet=item&id=` (`../overview.md`).
- **Exit:** × (top left) closes to the screen beneath; a drag down on the grabber does the same. Steps inside the sheet (Swap, the icon picker, Move to, Pick a day, Linear search) go back with the back link on the left. "Connect Linear" goes to Settings › Connections; "Linear ↗" and "Open in Linear" open the issue in Linear.

## Layout, top to bottom

A `ResponsiveSheet` (bottom sheet at 402 over a scrim; the screen beneath stays visible above it) with a grabber.

1. **Header row.** × `Button` (icon) on the left. On the right, on a plain item: "Swap", an outlined text `Button` [PROPOSED, D-USE-24], then the ··· `EllipsesMenu` (round, filled muted). On a work item: ··· only.
2. **Scope line**, muted small text: "<Block>, <start> to <end> · today only" (a work item adds "· <Tier>"; on the phone's work rows "Mon 12 · Work · <Tier>", with "· session 1 of 3" for a session).
3. **Title row:** the icon tile (`EmojiSlotButton`, 44 px, the kind's tint; opens the icon picker) and the item's name in the title style.
4. **Linear line** (linked work items only): `[PROPOSED]` `LinearLine`: the status chip (Linear's shape in the workspace's colour plus its word, a chevron; opens the status picker, `../../interactions/linear-status/index.md`), the ID in `figure` ("ENG-123"), the project name, and "Linear ↗" on the right.
5. **Fields, one per row on hairline separators:** plain item: Length (`MinutesStepper`), At a set time (`Switch` with a sub-line; on, a Time row with a `TimeField`), Notes (optional) (`Textarea`). Work item: Size, Length (Exact or Range), Tier, Priority, Assignee, Description (`linear-linked`); on the phone's work rows: Tier, Sessions, Sub-issues (`tier-and-sessions`).
6. **Footer line**, muted: "Changes save as they're made, for today. Monday's usual is unchanged." A work item on Now or Today ends with a pair of 50/50 buttons instead (Start and "Done for today", or Bring back and Done).

Components: all `@syn/ui` (`ResponsiveSheet`, `Button`, `EllipsesMenu`, `DropdownMenu`, `EmojiSlotButton`, `MinutesStepper`, `Switch`, `TimeField`, `Textarea`, `SegmentedControl`, `RangeEditor`, `ListRow`, `PriorityMark`, `Avatar`, `PickerList`, `SearchField`, `Tabs`, `Checkbox`, `FiringMark`, `Toaster`, `Spinner`). Not house primitives, Plumb proposals: `LinearLine` and its status shape, the Size cards (five), the Linear card (`linear-item-from-now`).

## Primary action

None on a plain or linked item: changes save as made. In Swap: pick one (a tap). In Pick a day: "Move to <day>" (`../../interactions/move-to/`). On a work item opened from Now or Today: "Done for today" or Done, filled, bottom right.

## States

| State                  | File                             | Widths drawn | One line                                    |
| ---------------------- | -------------------------------- | ------------ | ------------------------------------------- |
| default                | `states/default.md`              | 402          | A plain Wellness item, edits in place       |
| ··· open               | `states/more-open.md`            | 402          | Move to…, Not today, Make it Monday's usual |
| at a set time          | `states/at-a-set-time.md`        | 402          | The Time row with where it ends             |
| swap                   | `states/swap.md`                 | 402          | The library filtered to the kind            |
| swap, empty library    | `states/swap-empty.md`           | 402          | "Nothing else of this kind yet."            |
| Linear search          | `states/linear-search.md`        | 402          | Link a Linear issue                         |
| Linear linked          | `states/linear-linked.md`        | 402          | The linked work item                        |
| Linear syncing         | `states/linear-syncing.md`       | 402          | "Updating Linear"                           |
| Linear failed          | `states/linear-failed.md`        | 402          | "Not updated in Linear." with Try again     |
| closed in Linear       | `states/linear-done.md`          | 402          | Checked itself, "Done in Linear"            |
| linked, ··· open       | `states/linear-more-open.md`     | 402          | Unlink from Linear with its consequence     |
| priority open          | `states/linear-priority.md`      | 402          | The priority picker                         |
| Linear not connected   | `states/linear-off.md`           | 402          | "Connect Linear"                            |
| linked, from Now       | `states/linear-item-from-now.md` | 402          | Step 8's Linear card                        |
| size and length        | `states/size-and-length.md`      | 402          | Size's five words set the length range      |
| tier and sessions      | `states/tier-and-sessions.md`    | 402          | A session of a spread task                  |
| sub-issue placed alone | `states/sub-issue-alone.md`      | 402          | One day, one tier, Place on <day>           |
| work ··· menu          | `states/work-more-open.md`       | 402          | Mark the task done, Back to the pool…       |
| while firing           | `states/while-firing.md`         | 402          | The firing panel, Bring back                |
| loading                | `states/loading.md`              | —            | Not drawn                                   |
| offline                | `states/offline.md`              | —            | Not drawn                                   |

Partial: N/A, the sheet shows one item.

## Platforms

Drawn at 402 only (phone, light). The desk (1440, 1728) and 1024: Decided (D-USE-103; D-USE-60 (3)): the phone sheet shown as `ResponsiveSheet`'s right-side panel at `--sheet-w` over Today or the screen beneath (D-USE-39: sheets keep the right panel as built; N6: "click a row to open the Item sheet in `ResponsiveSheet`'s right panel"), every field and step as at 402. The drag-up full view has no wide form (D-USE-39). Dark is not drawn; it comes with the build's theme pass (D-USE-58).

## Interactions opened here

- The icon picker, from the icon tile: [`../../interactions/icon-picker/`](../../interactions/icon-picker/index.md).
- Move to and Pick a day, from ··· › Move to…: [`../../interactions/move-to/`](../../interactions/move-to/index.md).
- Linear status changes, from the status chip: [`../../interactions/linear-status/index.md`](../../interactions/linear-status/index.md).
- Notes and Linear's description, one value: [`../../dev-notes/notes-and-description.md`](../../dev-notes/notes-and-description.md).

Words, access, instrumentation, criteria and decisions: [`words-and-access.md`](words-and-access.md).
