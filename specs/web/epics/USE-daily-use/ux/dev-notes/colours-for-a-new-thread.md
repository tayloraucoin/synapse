---
target: specs/web/ux/dev-notes/colours-for-a-new-thread.md
status: approved
promoted:
dev_note: "Dev note · Colours, for a new thread"
boards:
  - name: "colour / Life rose, To-dos moss / 402 / light"
    page: "USE — set up"
    at: [3374, 2520]
    note: "Frame @ x 3374, y 3450"
    capture: specs/web/epics/USE-daily-use/ux/dev-notes/captures/life-and-todos-colours-402.png
rulings: [D-USE-35, D-USE-38, D-USE-42, D-USE-49, D-USE-57, D-USE-72, D-USE-79]
---

# Colours, for a new thread

Tier, event and status colours on the work block, and what the colours thread decided. Used by Today ([`../work/today/index.md`](../work/today/index.md), [`states/waiting.md`](../work/today/states/waiting.md)), the Item sheet's tier control ([`../day/item-sheet/states/linear-linked.md`](../day/item-sheet/states/linear-linked.md)), Linear statuses ([`../interactions/linear-status/index.md`](../interactions/linear-status/index.md)) and the timers ([`over-by-how-much.md`](over-by-how-much.md)); the Life and To-dos kind colours by Set my days (`../set-my-days/set-my-days/`), the New block sheet (`../set-my-days/new-block-sheet/`), the block view (`../day/block-view/`) and Now's To-dos block ([`../day/now/states/todos-block.md`](../day/now/states/todos-block.md), D-USE-74).

## The dev note

**Dev note · Colours, for a new thread** ("USE — daily use", x 2892, y 19020):

> Dev note · Colours, for a new thread
>
> The brand kit has no tier or event colours. Drawn with existing tokens as a placeholder, to settle in its own thread with the brand kit.
>
> Logged in day/overview.md, Open.
>
> What's drawn
>
> Tiers: Urgent red-500, Primary leaf, Secondary amber, Stretch sky (a small square beside the heading, never colour alone). Events (meetings, appointments): plum. Linear statuses: the workspace's own colours, read from Linear. Clashes: Stretch sky is also Work's kind colour; plum sits near violet, which means off-schedule; Urgent red and Blocked or Paused red bend "nothing red on the tabs" (Taylor's call).
>
> To decide
>
> A Stretch cyan distinct from sky, or Work's kind moving off sky; tier and event tokens in preset.css; dark-mode values; whether Linear's status colours are kept or drawn as ink.

Its summary card under it (Frame @ x 2892, y 19950): "dev note: colours, for a new thread / No tier or event colours in the brand kit yet. What's drawn, the clashes (Stretch and Work both sky; plum near off-schedule violet; red on the tabs), and what to decide."

## What it means for the build, with the later lines

- **D-USE-38, the colours set** [PROPOSED until Taylor's look]: tiers step red, leaf, amber, **slate** (Stretch leaves sky, so it no longer shares the Work block's colour; the note's cyan option is not taken). Events stay plum, told from off-schedule violet by form: an event is always a fill with the calendar icon; violet is never a fill. Urgent, Blocked and Paused share one red, "needs you now". Life's yellow (#C9A227, #F6EDC4) becomes a ninth category hue with dark values; its light dot is 2.3:1, a named exception. Bends named: "nothing red on the tabs", "destructive on Delete account only", the kit's 3:1 floor for Life's dot.
- **Linear's status colours stay** as Linear draws them (D-USE-35), never ink; the word always beside the shape.
- **D-USE-42, priority chips** in Taylor's colours: Urgent red, High yellow, Normal blue, Low grey, the glyph always with it.
- **D-USE-49, firing is rust on grey:** the `--color-category-clay-dot` dot in a `--color-fill-muted` halo, "firing · n min" in `--color-red-700`; verdigris means only Taylor's hands. Another named bend of "nothing red on the tabs".
- **D-USE-57:** client colours avoid sky, plum and clay [PROPOSED].
- **D-USE-72, the warning text token:** `warning-text` (oklch 62% 0.13 85 on the figure, 58% on small text) stays [PROPOSED] until the colours look (D-USE-38: "The warning becomes a darker text token").
- **Still open:** the tier, event and Life tokens in `packages/config/tailwind/preset.css` (a token change, with the build), and dark-mode values (D-USE-58: dark comes with the build's theme pass). Until then every square, band and chip uses a token, never a raw value (AGENTS.md).

## The colour board for Life and To-dos

**`colour / Life rose, To-dos moss / 402 / light`** ("USE — set up", x 3374, y 2520; capture `captures/life-and-todos-colours-402.png`). The name is round 2's (rose); the board itself draws round 3's pick. Drawn: the heading "Colours for the two new kinds" over "Life yellow, To-dos moss", then two day columns side by side, "Thursday: Life" and "Sunday: To-dos", each Work, Break · Stretch, Work with a Secondary square, then the new block ("Dinner with friends", Life, in yellow; "Sunday reset", To-dos, in moss), then Evening, with "0:40 over" in the warning yellow under each column. Under them, the board's words in full:

> Life is yellow, as Taylor set it. preset.css has no yellow yet: drawn raw (#C9A227, #F6EDC4) [PROPOSED]. The clash to settle in the colours thread: Break amber, Secondary's amber and the over-time warning yellow sit near it; deepen the warning or move Break.
>
> To-dos takes moss (Vesper's pick): a muted, grey-leaning olive and an unused token. Upkeep time sits quietly in the day, near a mid grey without reading as an empty gap (fill-muted) or as Evening's slate.
>
> Watch: moss sits near Wellness leaf. The block's name always shows beside its colour; no kind badge on the column, the same as every other kind.

Its note under it (Frame @ x 3374, y 3450): "Colour / Life yellow, as Taylor set (raw values until a token exists; clashes to the colours thread). To-dos moss, Vesper's pick."

- **Settled:** Life is yellow (#C9A227, #F6EDC4), a ninth category hue with dark values and its named 2.3:1 dot exception, its [PROPOSED] lifted (D-USE-38, D-USE-79); the board's rose (in its name) is round 2's and is not built. The clash is answered by D-USE-38's darker warning text token (D-USE-72, `warning-text`), not by moving Break. To-dos is moss, an existing token. The block's name always shows beside its colour (colour never alone); no kind badge. Dark values come with the build's theme pass. Placeholders: "Dinner with friends", "Sunday reset", the times [placeholder].

## Rulings

- D-USE-79: D-USE-38's colours stand as drawn, with the warning-text token; Urgent has no soft cap.
- D-USE-38, D-USE-79 (the colour board): Life yellow as a ninth hue, To-dos moss; round 2's rose not built.
