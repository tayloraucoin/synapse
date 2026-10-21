---
target: specs/web/ux/account/morning-reading/index.md
status: approved
promoted:
design:
  file: "Synapse, 01M49AX02VV4SSBKNCN6NRTS6Y"
  pages: ["USE — daily use"]
  rows: ["USE — daily use · Row label · Morning reading"]
  locked: 2026-10-19 # Taylor, at lock; Assay round 3 of 3, no black or red
---

# Settings › Morning reading — account

Handoff pass (`docs/workflows/stages/ux.md` §4), 2026-10-20, the ledger of the boards. Sources: the intent pass (rounds 1 to 3, 2026-10-19), the row "Row label · Morning reading" (y 2640, label at x 4340, frames x 4900 to 15022), its captures, and the Settings pattern ([`../settings/index.md`](../settings/index.md)). Rulings: D-USE-119 to D-USE-133 ([`../../day/decisions/D-USE-119-133.md`](../../day/decisions/D-USE-119-133.md)). Writing, order, off and delete: [`writing-and-order.md`](writing-and-order.md). Words, access, instrumentation and criteria: [`words-and-access.md`](words-and-access.md). Board coverage: [`../../boards/use-daily-use/morning-reading.md`](../../boards/use-daily-use/morning-reading.md). Every state is a file in `states/`.

## Job

Keep what Orient reads, in the order it reads it: the passages the carousel walks and the links under them (D-USE-119). The job is done when the reading is set and the screen is left. Rows act at once (order, off, on, delete); the sheets save on Save.

## Entry and exit

- **Entry:** the avatar menu's "Settings", then the "Morning reading" row after Connections in the Settings list (`apps/web/components/account/settings-list.tsx`). The row has no second line (D-USE-132). The route is `/settings/morning-reading`. Orient has no link here and does not change.
- **Exit:** "‹ Settings" (top left). A passage row or "Add a passage" opens the passage sheet; a link row or "Add a link" opens the link sheet; ··· › Edit opens the same sheets. Each sheet closes back here.

## Layout, top to bottom (phone 402)

1. **Header:** `Breadcrumb` "‹ Settings", then the title "Morning reading" (title, 22), then a hairline.
2. **Passages:** the heading (heading, 17), with `SaveStatus` on the right after a drop or a move. A muted order line sits under it (label, 13). Then one row per active passage in `sort_order`: a grip (left, 44 px target), then the title (body, 15, medium) over its first line (Newsreader, body, muted, one line with an ellipsis), then ··· (`EllipsesMenu`) on the right. A passage with no title shows its first line alone (D-USE-133). Hairlines sit between rows. Next comes "+ Add a passage" (`InlineAddRow`), then "Off ›" (`ArchivedSection`, collapsed). A rule closes the section.
3. **Links:** the heading and a muted line. Then one row per active link: a grip, a 20 px kind glyph (Spotify, or a link glyph), the title (body, medium) over the host (label 13, muted; D-USE-131), then ···. Next comes "+ Add a link", then "Off ›".
4. **Open Off list:** a muted line, then each off row: its title and first line, faint, and under them two text buttons in ink, "Turn on" and "Delete" (`list-off-open`).
5. **Sheets:** `ResponsiveSheet` with a grabber, × on the left and the title beside it. The passage sheet has "Title" (with "Optional" on the right), an `Input`, "Passage", a `RichTextEditor` (the editor fills the height, with its toolbar: bold, italic, quote, list, link), and a full-width `Button` "Save". The link sheet has "Title", an `Input`, "Link", an `Input` with its hint, and "Save".
6. **Overlays:** the `Toaster` at the foot (off, with Undo); the confirm dialog (`AlertDialog`) for delete; `DiscardDialog` from a sheet.

Components are all `@syn/ui`: `Breadcrumb`, `SortableList`, `EllipsesMenu`, `InlineAddRow`, `ArchivedSection`, `SaveStatus`, `ResponsiveSheet`, `Input`, `RichTextEditor`, `Button`, `AlertDialog`, `DiscardDialog`, `Toaster`, `StatusLine`, `SkeletonRow`, `RegionRetry`. The link row's 13 px host is this row's own setting, not `LinkCallout` (D-USE-131). Type sizes: 22, 17, 15, 13 (C-R04). Passage text is Newsreader (D-USE-130).

## Primary action

None on the screen (D-USE-127). The sheets carry "Save" (`Button`, default).

## States

| State                | File                            | One line                                                     |
| -------------------- | ------------------------------- | ------------------------------------------------------------ |
| list                 | `states/list.md`                | Three passages, two links, the add rows, Off collapsed       |
| list, some off       | `states/list-off-open.md`       | Passages' Off open: one off passage, Turn on and Delete      |
| nothing yet          | `states/empty.md`               | One line per section above its add row                       |
| add passage          | `states/add-passage.md`         | The empty passage sheet                                      |
| add passage, images  | `states/add-passage-images.md`  | As add passage, with Images [design only]                    |
| edit passage         | `states/edit-passage.md`        | The sheet filled with a passage                              |
| edit passage, images | `states/edit-passage-images.md` | As edit passage, with its images [design only]               |
| discard unsaved      | `states/discard.md`             | `DiscardDialog` over the edit sheet                          |
| add link             | `states/add-link.md`            | The empty link sheet                                         |
| edit link            | `states/edit-link.md`           | The link sheet with a Spotify playlist                       |
| link not openable    | `states/link-invalid.md`        | The field's line in ink; Save waits                          |
| reordering           | `states/reorder.md`             | A passage lifted by its grip, the gap where it lands         |
| row menu             | `states/row-menu.md`            | Edit, Move up, Move down, Turn off with its line             |
| off, with Undo       | `states/off-undo.md`            | The row gone; the toast with Undo                            |
| delete confirm       | `states/delete-confirm.md`      | The dialog over the open Off list                            |
| saved, after a drop  | `states/saved-drop.md`          | The new order; "Saved" beside Passages                       |
| saved, after Save    | `states/saved.md`               | The sheet closed, the new passage at the end; no toast       |
| save failed          | `states/save-failed.md`         | The sheet keeps its words; one line in ink; Save tries again |
| loading              | `states/loading.md`             | Headings and lines at once; `SkeletonRow`s                   |
| error                | `states/error.md`               | One `RegionRetry`; header and back stay                      |
| offline              | `states/offline.md`             | As last saved; the `StatusLine`; writes drawn waiting        |
| offline, sheet open  | `states/offline-sheet.md`       | The sheet keeps its words; the `StatusLine` above Save       |
| partial              | —                               | N/A: one read loads both sections (D-USE-133)                |

Each state is a scenario `morning-reading-<key>` at `/settings/morning-reading?state=<key>` and `/dev/parts?state=` (C-P08).

## Platforms

Drawn at 402 (phone, light). At the desk (1024 and up, not drawn): Settings fills the main pane beside the rail (D-USE-89, D-USE-93), this screen as at 402, and the sheets open as the right-side panel (D-USE-60's form, D-USE-39). Dark comes with the build's theme pass (D-USE-58).

## Out of scope (Open)

The quote bank (Orient's "A quote" slide, `quotes_opt_in`); journal prompts; passage images in code (D-USE-121, the dev note); tags on a passage.
