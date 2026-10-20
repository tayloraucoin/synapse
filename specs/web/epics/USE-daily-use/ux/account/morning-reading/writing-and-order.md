---
target: specs/web/ux/account/morning-reading/writing-and-order.md
status: draft
promoted:
---

# Settings › Morning reading — writing, order, off and delete

Intent pass detail, moved beside [`index.md`](index.md) for the size cap.

## How a row is written

- **Passage** (round 1.2): an optional title (80 characters) and a Markdown body (required, 8,000) in the house `RichTextEditor` as built: bold, italic, quote, list, link, and nothing else. The editor's read-only mode is what Orient renders, so the two cannot drift. Tags (in the old schema) are not shown [ASSUMPTION: tags have no reader in USE].
- **Images** (round 1.3, Taylor): drawn in both versions, with images (up to four, the column's limit) and without, so the board holds the design; **not built for now**. A dev note on the row, "Dev note · Passage images", records what building them needs (the `passages` bucket, a signed upload, the owner-segment check the old service made, upload failed with Try again, remove). The built sheet is the without-images version.
- **Link:** a title (required, 80) and a URL (2,048): `https:`, or a `spotify:` URI the server rewrites to `open.spotify.com` (as the old `normaliseLinkUrl`). The kind is derived, never chosen. Nothing is fetched: no preview, no title lookup.

## Order, off and delete

- **Order** (round 2.1): a grip on each row, drag within its section, saves on drop. One muted line above each list teaches it [PROPOSED: "Hold the grip to move a passage." in the register of Connections' order line; Gloss finishes]. A keyboard path: "Move up" and "Move down" in the row's ···. A new row lands at the end.
- **Off** (rounds 2.2, 3.2): from the row's ···. Off means rest: the row leaves Orient (`archived_at` set) and moves to its section's Off list; a `Toaster` says it left the morning reading, with Undo. In the Off list each row offers "Turn on" (back at the end of the order [ASSUMPTION]) and "Delete".
- **Delete** (rounds 2.2, 3.3): only on an off row. A confirm dialog names the consequence (it goes for good and cannot be brought back), Cancel and Delete, both in ink: no red (red stays on Delete account). Delete removes the row. The old path never deleted, so this is a new write (Technical).
