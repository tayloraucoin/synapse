---
target: specs/web/ux/dev-notes/notes-and-description.md
status: approved
promoted:
dev_note: "Dev note · Notes and Linear's description"
rulings: [D-USE-36, D-USE-60, D-USE-65]
---

# Notes and Linear's description

One value, two names. Used by the Item sheet ([`../day/item-sheet/index.md`](../day/item-sheet/index.md): Notes on `states/default.md`, Description on `states/linear-linked.md`, joining on `states/linear-search.md`, splitting on `states/linear-more-open.md`).

## The dev note

**Dev note · Notes and Linear's description** ("USE — set up", x 5302, y 7560):

> One value, two names (Taylor, round 3). A plain item has Notes; a linked item shows the same field as Description, marked "Synced with Linear", and edits go to the issue. There is never a second, Synapse-only box beside it. [PROPOSED]
>
> Logged in day/overview.md, Open.
>
> How it moves
>
> Link: the issue's description fills the field. If the item already had notes, they're added to the end of the description and the toast says so, with Undo; nothing is lost. Unlink: the description stays as the item's notes, so the words are kept; Linear keeps its copy. Show: Linear's markdown rendered, three lines then "Show all"; tapping edits in place, as plain text with markdown kept.
>
> To investigate
>
> Edit conflicts: if the issue's description changed in Linear while Taylor was typing here, keep Taylor's text and show "Changed in Linear too" with a way to see theirs; never overwrite silently. Images and mentions in a description show as links. Offline edits wait and send on reconnect.

Its summary card under it (Frame @ x 5302, y 8490): "Dev note · Notes and Linear's description / One field: Notes on a plain item, Description (synced) on a linked one. Notes join the description on link, with Undo; the description stays as notes on unlink; edit conflicts never overwrite silently."

## Rulings

- D-USE-36: Notes and Linear's description are one value, shown as Description on a linked item.
- D-USE-60 (2): the item sheet gains Description (one field with Notes).
- Step 8's item view ("Notes stay in Synapse", "USE — daily use", x 1928, y 17760) is superseded on this point by D-USE-36; Open "Step 11 round 3": step 8's item view now labels the field Description.
- The words and place of "Changed in Linear too" and the way to see Linear's text are not drawn; they are a line under the Description box in ink with the info icon, "Changed in Linear too. See theirs", opening Linear's text read-only below with "Use theirs" (D-USE-65).
