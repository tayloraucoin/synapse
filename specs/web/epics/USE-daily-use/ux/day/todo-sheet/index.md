---
target: specs/web/ux/day/todo-sheet/index.md
status: approved
promoted:
design:
  file: "Synapse, 01M49AX02VV4SSBKNCN6NRTS6Y"
  pages: ["USE — set up"]
  rows:
    - "USE — set up · Row label · To-do sheet"
    - "USE — set up · Row label · Archive"
  locked: 2026-10-10 (D-USE-49)
---

# To-do sheet — day

Handoff pass, the ledger of the boards. Sources: N1 "To-do", N4 "To-do reminder"; notes 46, 47; round 14; D-USE-3 (the sheet exists), D-USE-35 (Notes on every to-do, Digital), D-USE-37 (step 11 rounds 1 and 2 approved as drawn, marks standing). Built on the item sheet's shell ([`../item-sheet/`](../item-sheet/index.md)). Every state is a file in `states/`.

## Job

Set one to-do's title, icon, type, repeat, reminder and notes, without leaving the day. Done is the sheet closed with the change in place. Nothing is saved by a button: every change saves as made.

## Entry and exit

- **Entry:** a to-do row in the tray, on Review the day or Now (`../todos/`, D-USE-3). Route `?sheet=todo&id=` (`../overview.md`). "+ Add" › To-do on the work screens also opens it (`../../interactions/add/index.md`, step 2c): Decided (D-USE-69), the same sheet with the title empty and focused, the to-do created once a title is typed, every other row at its default.
- **Exit:** × (top left) or a drag down on the grabber closes to the screen beneath. "How" opens the Install sheet ([`../../account/install-sheet/index.md`](../../account/install-sheet/index.md)); "Settings" opens the app's Settings at Notifications. Steps inside the sheet (the icon picker, Custom…, Give it a day…) go back with the back link on the left.

## Layout, top to bottom

A `ResponsiveSheet` (bottom sheet at 402 over a scrim, from about mid-screen) with a grabber.

1. **Header row:** × `Button` (icon) left; ··· `EllipsesMenu` (round, filled muted) right. No Swap.
2. **Scope line**, muted small: "To-dos · in the tray, no day yet" (a to-do with a day: "To-dos · <day>" [ASSUMPTION]).
3. **Title row:** the icon tile (`EmojiSlotButton`, 44 px, To-dos' moss tint [ASSUMPTION: the kind's colour, Open "framing round 2"]) and the title in the title style, editable in place [ASSUMPTION: a tap on the title edits it, as the item sheet's name].
4. **Rows, 56 px each (`--spacing-row`, D-USE-34) on hairlines:**
   - **Type:** label left; a shadcn `Select` right showing the type's emoji and word ("📞 Call").
   - **Repeats:** label left; a `Select` right ("Does not repeat").
   - **Reminder:** label with a sub-line ("Off"); a `Switch` right. On, an **At** row follows (`states/reminder-on.md`).
   - **Notes:** label; an autogrowing `Textarea` (no "(optional)" here, as drawn). One value with Linear's description only on linked items; a to-do has Notes alone (`../../dev-notes/notes-and-description.md`).
5. **Footer line**, muted, changing by state; default: "Changes save as they're made. It waits in the tray until it's done or a To-dos block takes it."

Components: all `@syn/ui` (`ResponsiveSheet`, `Button`, `EllipsesMenu`, `DropdownMenu`, `EmojiSlotButton`, `Select`, `Switch`, `TimeField`, `Textarea`, `Toaster`).

## Primary action

None: changes save as made (D-USE-37, "Edited in place, no primary").

## States

| State                  | File                          | Widths drawn | One line                                           |
| ---------------------- | ----------------------------- | ------------ | -------------------------------------------------- |
| default                | `states/default.md`           | 402          | Call the mechanic, reminder off                    |
| Type open              | `states/type-open.md`         | 402          | Home, Errand, Call, Digital, Other                 |
| Repeats open           | `states/repeats-open.md`      | 402          | The repeat list and its consequence                |
| reminder on            | `states/reminder-on.md`       | 402          | The At row: day and time                           |
| not installed (iPhone) | `states/not-installed.md`     | 402          | "Reminders need the installed app." with How       |
| notifications off      | `states/notifications-off.md` | 402          | "Notifications are off for Synapse." with Settings |
| ··· open               | `states/more-open.md`         | 402          | Give it a day…, Mark done, Delete to-do            |
| loading                | `states/loading.md`           | —            | Not drawn                                          |
| error                  | `states/error.md`             | —            | Not drawn                                          |
| offline                | `states/offline.md`           | —            | Not drawn                                          |

Empty and partial: N/A, the sheet shows one to-do.

## Platforms

Drawn at 402 only (phone, light). At the desk the sheet is `ResponsiveSheet`'s right panel at `--sheet-w`, every row as at 402 (D-USE-39: "Sheets keep `ResponsiveSheet`'s right panel… every sheet scale up"). Dark comes with the build's theme pass (D-USE-58).

## Interactions opened here

- The icon tile opens the icon picker: [`../../interactions/icon-picker/`](../../interactions/icon-picker/index.md).
- Repeats › Custom… opens the custom recurrence of the Repeats select (Open "Repeats, framing round 5", `../open/open-5-cont.md`; the New block sheet, area 5).
- Notes: [`../../dev-notes/notes-and-description.md`](../../dev-notes/notes-and-description.md).
- How: the Install sheet ([`../../account/install-sheet/index.md`](../../account/install-sheet/index.md)).

Words, access, instrumentation, criteria and decisions: [`words-and-access.md`](words-and-access.md).
