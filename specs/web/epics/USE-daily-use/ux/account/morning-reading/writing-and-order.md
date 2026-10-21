---
target: specs/web/ux/account/morning-reading/writing-and-order.md
status: approved
promoted:
dev_note: "Dev note · Passage images"
---

# Settings › Morning reading — writing, order, off and delete

The rules behind [`index.md`](index.md), as settled by D-USE-120 to D-USE-129.

## How a row is written

- **Passage** (D-USE-120): an optional title (80 characters) and a Markdown body (required, 8,000) in the house `RichTextEditor` as built: bold, italic, quote, list and link, nothing else. The editor's read-only mode is what Orient renders, so the two cannot drift. Tags are in the schema but not shown; a save keeps a passage's tags as they are.
- **Images** (D-USE-121): drawn with and without, and not built. The built sheet has no Images row; images already on a passage are kept and still shown by Orient. The dev note "Dev note · Passage images" (x 15504) records what building them needs: the `passages` bucket, owner-private; a signed upload; the stored path checked against the owner's segment before save; up to four, in order; a failed upload stays as its tile with Try again; Delete removes them from the bucket too.
- **Link** (D-USE-120): a title (required, 80) and a URL (2,048), either `https:` or a `spotify:` URI the server rewrites to `open.spotify.com`. The kind (Spotify or web) is derived and never chosen. Nothing is fetched: no preview and no title lookup.

## Order, off and delete

- **Order** (D-USE-123): a grip on each row drags within its section and saves the section's whole order on drop. ··· › "Move up" and "Move down" do the same one place at a time; this is the keyboard path. A new row lands at the end. Orient reads the same order.
- **Off** (D-USE-124): ··· › "Turn off" sets `archived_at`. The row leaves Orient and moves to its section's Off list, and the toast offers Undo, which puts it back where it was. In the Off list each row shows "Turn on" and "Delete". Turn on clears `archived_at` and puts the row at the end of its list.
- **Delete** (D-USE-125): only on an off row, after the confirm dialog ("Keep it", "Delete", both in ink). It removes the row for good. The server refuses a delete on an active row.
- **Offline** (D-USE-129): nothing writes. The order, off, on, delete and the sheets' Save wait for a connection, and nothing is queued.
