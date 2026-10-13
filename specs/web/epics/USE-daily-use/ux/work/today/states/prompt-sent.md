---
target: specs/web/ux/work/today/states/prompt-sent.md
status: approved
promoted:
boards:
  - name: "today / prompt sent, both firing, Next lifts / 1728 / light"
    page: "USE — work"
    at: [3616, 0]
    note: "Note · today / prompt sent"
    capture: specs/web/epics/USE-daily-use/ux/work/today/captures/prompt-sent-1728.png
  - name: "phone-today / prompt sent, both firing, Next lifts / 402 / light"
    page: "USE — work"
    at: [1446, 5760]
    note: "Notes · phone, Today (row 5) @ x 1446"
    capture: specs/web/epics/USE-daily-use/ux/work/today/captures/prompt-sent-402.png
rulings: [D-USE-43, D-USE-44, D-USE-45, D-USE-47, D-USE-49, D-USE-51]
---

# Today — prompt sent (both firing, Next lifts)

## What shows, top to bottom

**Desk (1728):** no Step away (no work timer runs). In Primary, two firing rows in their places: [Portal sign-in] first, then [Case studies], second in place, its row changed: the breathing mark replaces the ring, the title recedes, its meta keeps "worked 35 min", and "firing · 1 min" starts on the right in dark rust. The reminder line stays under the first firing row only. Nothing is in hand, so in Secondary the SMS copy lifts as the shaded card with Start and Done; the strip names it, "Secondary", Go (Enter).

**Phone (402):** the same, trimmed: two firing rows ("firing" over "n min"), the meta at 60 % with "worked 57 min"; the SMS copy lifts as the card in Secondary.

## What the person can do

As [working](working.md): Start or Done on the new Next; the marks bring items back ([firing](../../../interactions/firing.md)).

## The notes on the boards

**Note · today / prompt sent** — today / prompt sent, both firing, Next lifts / 1728 / light — round 5 (D-USE-43, D-USE-44, D-USE-45)

One press of Prompt sent (or F, or the ring on any work row): [Case studies] stays in Primary, second in place, and its row changes. The breathing mark (rust dot, grey halo) replaces the ring, the title recedes, its meta keeps "worked 35 min", and "firing · 1 min" starts on the right in dark rust. Work time is paused and does not restart when the item comes back; Start or Resume restarts it. Two items now fire in Primary, and nothing is in Taylor's hands, so Next lifts: the SMS copy becomes the grey-shaded card with Start and Done in Secondary, and the strip names it with Go (Enter). Next is order only (resolve-next.ts): Urgent, Primary, Secondary, Stretch, then tier order; the first item neither firing nor done. Many items can fire at once; one is in Taylor's hands at a time.

**Notes · phone, Today (row 5) @ x 1446** — Prompt sent, both firing, Next lifts

The item fires in place: rust dot in a grey halo, title receded, meta at 60 % with "worked 57 min". Next lifts at once, the first undone item in tier order. "While it fires: Kegels" shows once, under the first firing row.

## Rulings

- D-USE-43: Prompt sent (or F, or the ring) fires; Next lifts; order only, after FLO-6's resolve-next.
- D-USE-44: work time pauses on Prompt sent and does not restart on return.
- D-USE-45: with nothing in hand, Next lifts as the card at once.
- D-USE-47, D-USE-49, D-USE-51: the firing row's anatomy and colours; phone two-line right column, 84 px.

## Widths

Drawn at 1728 and 402.

## Criteria

| ID                        | When                            | Then                                                                                                                | Evidence                        |
| ------------------------- | ------------------------------- | ------------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| C-USE-today-prompt-sent-1 | Prompt sent on the running card | The item fires in place, work time pauses, "worked n min" stays in its meta, firing time starts at "firing · 1 min" | `captures/prompt-sent-1728.png` |
| C-USE-today-prompt-sent-2 | Nothing is left in hand         | The next item by order lifts as the card at once                                                                    | `captures/prompt-sent-402.png`  |
