---
target: specs/web/ux/account/morning-reading/index.md
status: draft
promoted:
design:
  file: "Synapse, 01M49AX02VV4SSBKNCN6NRTS6Y"
  pages: ["USE — daily use"]
  rows: ["USE — daily use · Row label · Morning reading"]
  locked: 2026-10-19 # Taylor, at lock; Assay round 3 of 3, no black or red
---

# Settings › Morning reading — account

Intent pass (`docs/workflows/stages/ux.md` §4), 2026-10-19, interview rounds 1 to 3 with Taylor. Sources: Orient's reads (`packages/api/src/services/morning/morning.ts`), Orient's empty line ([`../../day/orient/states/empty.md`](../../day/orient/states/empty.md)), the Settings pattern ([`../settings/index.md`](../settings/index.md), [`../settings/states/connections.md`](../settings/states/connections.md)), and the old write path, for fields and limits only (`packages/api/src/_legacy/services/library/passages.ts`, `links.ts`, `_legacy/routers/passage.ts`; `@syn/validators` `passageFormSchema`, `linkFormSchema`; `@syn/constants` limits). Layout, words, access, instrumentation and criteria wait for the handoff pass.

## The gap

Orient reads passages and links (`readReading`: active rows in `sort_order`). Nothing in the USE app writes them: the old router, services and `PassageList` sit under `_legacy`, not mounted, and `/settings` lists only Connections and Sign out (USE-85). USE-012 scoped writing them "to legacy Settings", which was never carried over, so Orient's empty line ("A passage shows up here once one is added") promises an add nobody can make. Taylor agreed, round 1.

## Job

Keep what Orient reads, in the order it reads it: the passages the carousel walks and the links under them. Done is the reading as wanted and the screen left. Rows act at once (order, off, on); the passage and link sheets save on Save.

## Entry and exit

- **Entry:** the avatar menu's "Settings", then a "Morning reading" row in the Settings list beside Connections (ruled in the prompt; `apps/web/components/account/settings-list.tsx`). Route `/settings/morning-reading` [PROPOSED: after `/settings/connections`]. No link from Orient: Orient stays read-only and its frame and states do not change.
- **Exit:** "‹ Settings" (top left) back to the Settings list. A passage row or "Add a passage" opens the passage sheet; a link row or "Add a link" opens the link sheet; each closes back here.

## Shape (for the canvas, not yet the layout)

One screen, two sections in Orient's order (round 1.4): **Passages**, then **Links**. Each section: its rows in reading order with a grip, an add row, and a collapsed **Off** section at its foot. House parts in reach: `Breadcrumb`, `SettingsRow`, `SortableList`, `EllipsesMenu`, `ArchivedSection`, `ResponsiveSheet`, `RichTextEditor`, `Input`, `DiscardDialog`, `Toaster`, `StatusLine`, `EmptyState`, `SkeletonRow`, `RegionRetry`, `LinkCallout`. A confirm dialog for delete is not yet named in `components.md` [ASSUMPTION: the house dialog primitive; Plumb confirms at the canvas].

How a passage and a link are written, and how order, off and delete work: [`writing-and-order.md`](writing-and-order.md). One capture per state: [`boards.md`](boards.md).

## Primary action

None on the screen (round 2.4): rows act at once, as Connections. The passage and link sheets carry "Save" (`Button`, default).

## States

| State                | Key                   | One line on what shows                                                                                                                            |
| -------------------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| list                 | `list`                | Three passages and two links in reading order, each with a grip and ···; the add rows; the Off lists collapsed                                    |
| list, some off       | `list-off-open`       | The Passages' Off list opened: one off passage with Turn on and Delete                                                                            |
| nothing yet          | `empty`               | No passages, no links: one quiet line per section above its add row                                                                               |
| add passage          | `add-passage`         | The passage sheet, empty: Title, the editor, Save; without images                                                                                 |
| add passage, images  | `add-passage-images`  | As add passage, with the Images row (two images and an add tile) [design only]                                                                    |
| edit passage         | `edit-passage`        | The sheet filled with a passage; Save; without images                                                                                             |
| edit passage, images | `edit-passage-images` | As edit passage, with its images [design only]                                                                                                    |
| discard unsaved      | `discard`             | Leaving a sheet with unsaved words asks before closing (`DiscardDialog`)                                                                          |
| add link             | `add-link`            | The link sheet, empty: Title, Link, Save                                                                                                          |
| edit link            | `edit-link`           | The link sheet filled with a Spotify playlist                                                                                                     |
| link not openable    | `link-invalid`        | The link sheet with a URL that cannot open: the field's line in ink, Save waits                                                                   |
| row menu             | `row-menu`            | The row's ···: Edit, Move up, Move down, Turn off (with its consequence); the keyboard path for order (added on the canvas, round 4)              |
| reordering           | `reorder`             | A passage lifted by its grip mid-drag, the gap where it lands                                                                                     |
| off, with Undo       | `off-undo`            | The row gone from the list; the toast with Undo at the foot                                                                                       |
| delete confirm       | `delete-confirm`      | The dialog over the list, naming the consequence                                                                                                  |
| saved, after Save    | `saved`               | The sheet closed, the new passage at the end of the list; no toast (Assay round 1 asked for this half to be drawn)                                |
| saved, after a drop  | `saved-drop`          | The new order, "Saved" beside the section heading (`SaveStatus`)                                                                                  |
| save failed          | `save-failed`         | The sheet stays open with its words; one line in ink, and Save tries again (no second Try again beside Save; Assay round 1)                       |
| loading              | `loading`             | Header and section titles at once; `SkeletonRow`s where the rows sit                                                                              |
| error                | `error`               | The list failed to load: `RegionRetry` with Try again; header and back stay                                                                       |
| offline              | `offline`             | The list from cache; one `StatusLine` that changes wait for a connection; grips, ··· and the add rows drawn waiting (faint)                       |
| offline, sheet open  | `offline-sheet`       | An open sheet keeps its words; the `StatusLine` above Save, and Save waits                                                                        |
| partial              | —                     | N/A: one read loads both sections (`readReading`) [ASSUMPTION: the write surface reads both in one call, or the handoff splits error per section] |

## Platforms

Phone 402, light, on the boards. At the desk (1024 and up, not drawn): Settings fills the main pane beside the rail (D-USE-89, D-USE-93), this screen as at 402, and the sheets open as the right-side panel (D-USE-60's form) [ASSUMPTION: as the client sheet].

## Out of scope (Open)

- The quote bank (Orient's "A quote" slide, `quotes_opt_in`): not here.
- Journal prompts: not here.
- Passage images in code: designed, not built (round 1.3); the dev note carries it.
- Tags on a passage: not shown.

## Decisions and open items

The handoff pass logs these from D-USE-119: the gap and the entry; Markdown in the house editor; images designed, not built; one screen, two sections; grip order; off as rest and delete only from off; the passage sheet over the list; no screen-level primary; saved shown by the row; offline read only.

- [PROPOSED, for Plumb] The serif first line in the list bends D-P01 (Newsreader only on Review); passage text already uses it in `PassageCarousel`, `PassageReader` and `RichTextEditor`. Record the passage-text bend in `apps/web/docs/design/DESIGN.md` at the handoff.
- Links keep `LinkCallout`'s 12 px host line, so the list has five type sizes (22, 17, 15, 13, 12); Assay round 1, amber, left as the house part draws it.
- [NEEDS DECISION] Whether the Settings row shows a line under "Morning reading" (for example the first passage's title). Default: no line, as the Connections row. No count (product rules).

Layout: [FILL at the handoff pass]. Words: [FILL, Gloss]. Access: [FILL, Threshold]. Instrumentation: [FILL]. Criteria: [FILL].
