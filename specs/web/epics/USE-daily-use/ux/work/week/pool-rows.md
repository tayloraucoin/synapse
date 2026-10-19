---
target: specs/web/ux/work/week/pool-rows.md
status: approved
promoted:
---

# Week — the pool's rows (v3)

The rows of [`pool-panel.md`](pool-panel.md), as drawn on both Week frames ([capture](captures/priority-lens-1728.png)). Rows v3 (D-USE-41, D-USE-42): emoji, title, priority glyph, ID, size, labels, due state.

## A row

- Indented 20 px under its team line, 6 px right padding, 8 px vertical padding, a hairline under each.
- **Lead:** the item's emoji (14 px) in an 18 px slot with an 8 px gap (D-USE-48).
- **Title** (label size, `--color-foreground`).
- **Meta line** (5 px gaps, caption): the priority glyph (12 px), the ID (muted), the size chip (`--color-fill-muted`, radius 4, 18 px: "5 Large"), then label chips (pill, hairline border, a 6 px dot in Linear's label colour, the label word: "Compliance", "Copy", "Docs").
- **Due badge** at the top right when due soon (D-USE-98): 20 px, radius 5, semibold caption. Warning from two days before the due date, "Due Wed" (drawn on Monday for a Wednesday due date; the canvas's `#FBEEC9` fill and dark-amber words map to D-USE-72's `warning-text` token, D-USE-79); danger on the day and after, "Due today" (`--color-destructive-text` on red-50). The date is Linear's due date, or Synapse's own on a plain item (D-USE-98). Bend, named: red on the tabs for "Due today" (D-USE-41, D-USE-42).
- **Priority glyphs** (colour and shape together, D-USE-42): Urgent a red square with "!" (`--color-destructive`); High three bars in yellow; Normal two of three bars in blue (`--color-category-sky-dot`, the third `--color-fill-muted`); Low [ASSUMPTION: one bar in grey; not drawn]. No priority: no glyph [ASSUMPTION].

## Kinds of row drawn

| Row          | Drawn as                                                                                                                                        |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| due soon     | 📤 "[Audit log export]", High, "KES-58", "5 Large", "Compliance"; "Due Wed"                                                                     |
| due today    | 🔐 "[Session timeout copy]", Urgent, "KES-63", "1 Quick", "Copy"; "Due today"                                                                   |
| plain        | 📊 "[Partner deck refresh]", Normal, "BIZ-9", "2 Small", "Docs"; 🦸 "[Homepage hero copy]", Normal, "ALD-21", "1 Quick", "Copy"                 |
| placed       | ✍️ "[Case studies: write the Alder intro]" at 60 % opacity, meta "ALD-17 · 3 Medium · on Mon, Tue, Wed": its sessions' days, no glyph or labels |
| big          | 📅 "[Calendar connection settings]", High, "SYN-218", "8 Huge · 20 h" (the hours left), then **Spread…** (semibold, underlined)                 |
| Synapse-only | 🧹 "[Tidy the client files folder]", "No Linear", "2 Small"                                                                                     |

- **Placed** items stay in the pool, faded, naming the days their sessions sit on; they are still draggable to add a session [ASSUMPTION: as the Tue drop on the Priority frame, which adds session 2 of 3].
- **Spread…** is drawn on the Huge item only [ASSUMPTION: it shows on a Huge item; any item reaches Spread from its Item sheet's ···, D-USE-57]. It opens [`../../interactions/spread/index.md`](../../interactions/spread/index.md).
- An item with no estimate reads "unsized" (the add popover's "KES-71 · unsized"); its length then starts at 30 min ([`../../interactions/add/index.md`](../../interactions/add/index.md) › Rules).

## Interaction on a row

Hover is not drawn on the pool [ASSUMPTION: `--color-fill-muted`, since the panel is already `--color-surface`, Today's hover shade]. Drag lifts it ([`../../interactions/place-from-the-pool/index.md`](../../interactions/place-from-the-pool/index.md)). A click opens the Item sheet in the right panel (D-USE-60) [ASSUMPTION: N6 "click an item for its sheet"].

## Words

"Clients in your order. Drag a client to reorder." · "Due Wed", "Due tomorrow", "Due today" · "on Mon, Tue, Wed" · "8 Huge · 20 h" · "Spread…" · "No Linear" · "unsized" · "+ New item in the pool" · "Linear synced 2 min ago" · "Sync now" · "Search the pool" · "Group: Client" · "Sort: Due date" · "Pool" · "Linear". Size words: Quick, Small, Medium, Large, Huge with their points ([`../../dev-notes/size-and-length.md`](../../dev-notes/size-and-length.md)).
