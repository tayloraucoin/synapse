---
target: specs/web/ux/set-my-days/set-my-days/states/install-offer.md
status: approved
promoted:
boards:
  - name: "set-my-days / install offer, once / 402 / light"
    page: "USE — set up"
    at: [3856, 10080]
    note: "Note · set-my-days / install offer"
    capture: specs/web/epics/USE-daily-use/ux/set-my-days/set-my-days/captures/install-offer-402.png
rulings: [D-USE-25, D-USE-37, D-USE-49, D-USE-89]
---

# Set my days — the install offer, once

The first day has just been set and saved, and Synapse is not on the home screen: a `StatusLine` offers the install steps, once. `?state=install-offer`. Drawn in the Account row (step 12, y 10080), before the install sheet it opens; its note is "Note · set-my-days / install offer" at x 3856, y 11010.

## What shows, top to bottom

- Status bar 21:10. "‹ Week" (the `Breadcrumb` [PROPOSED]) over "Every Monday"; `SaveStatus` "✓ Saved" at the trailing edge.
- `WeekdayChips`, usual: "M" selected in ink with a dot, the only day set; T, W, T, F, S, S empty, no dots.
- Day line: "Up at 7:00", "Lights out 22:30", the ···. A hairline.
- The column from 7: Orient's ink line with the lock and "Orient · 5 min"; Wellness 7:05 to 8:00 ("Pee and weigh", "Water", "Start the cold bath", "+2 more"); Training 8:00 to 8:57 ("Drive to the YMCA", "Workout: gym", "Drive home"); Breakfast 9:00 to 9:30 as a dashed meal band; Work 9:30 to 12:00, "Work goes in on This week."; Lunch 12:00 to 13:00 passing under the fade. Block contents are Taylor's own data as built in earlier frames.
- The fade (D-USE-25) across the foot of the screen.
- **The offer**, bottom left on the fade, beside the + (bottom right): a `StatusLine`, 44 px tall, with a Lucide smartphone icon, "Synapse can go on the home screen." in body ink, and "How", an underlined text `Button`.

## What the person can do

- **How** opens the install sheet ([`../../../account/install-sheet/index.md`](../../../account/install-sheet/index.md)) on the phone's own tab (`?sheet=install`), and the offer is gone for good.
- Leave Set my days (‹ Week, then out): the offer is gone for good, never shown again.
- Everything else on the day works as in [`the-day.md`](the-day.md); the offer takes no tap to dismiss.

## Words

"Synapse can go on the home screen." · "How".

## The notes on the boards

**"set-my-days / install offer, once / 402 / light"**, "Note · set-my-days / install offer" @ x 3856, y 11010:

> set-my-days / install offer, once (N2)
>
> After the first day is set (Monday, saved), a StatusLine reads "Synapse can go on the home screen." with How, which opens step 12's install sheet on the phone's own tab. [ASSUMPTION] Shown once, only while Synapse isn't installed; it goes when Set my days is left or How is tapped. After that, install is only in the avatar menu.

## Rulings

- N2, Install sheet: "It's offered once on its own: after the first day is set, as a `StatusLine` with 'How' (round 16). Otherwise it's only in the avatar menu." It replaces the older offer after three reviewed days (`_global/shell.md`).
- The note's three [ASSUMPTION]s stand as drawn under D-USE-49 (the lock) and D-USE-37 (step 12 approved with its marks), named here: [ASSUMPTION: shown once ever, and only while Synapse is not installed]; [ASSUMPTION: gone when Set my days is left or How is tapped]; [ASSUMPTION: after that, install is only in the avatar menu's "Install the app"].
- [ASSUMPTION: "the first day is set" is the first weekday saved with its bounds in Usual week, as drawn; a day set first in This week counts the same.] Once is per account, not per device [ASSUMPTION].
- Open-7 "Audit gaps" and "Audit against N5" named this offer as missing; this frame fills it.

## Widths

Drawn at: 402. At the desk (1024 and up) the offer is never shown, since Install the app is hidden there and desk browsers notify without installing (D-USE-89).

## Criteria

| ID                                | When                                                       | Then                                                                                   | Evidence                         |
| --------------------------------- | ---------------------------------------------------------- | -------------------------------------------------------------------------------------- | -------------------------------- |
| C-USE-set-my-days-install-offer-1 | The first day is saved, below 1024, Synapse not installed  | "Synapse can go on the home screen." with How, bottom left beside the +, over the fade | `captures/install-offer-402.png` |
| C-USE-set-my-days-install-offer-2 | How                                                        | The install sheet opens on the device's tab; the offer never shows again               | test                             |
| C-USE-set-my-days-install-offer-3 | Set my days is left without How                            | The offer never shows again; install stays in the avatar menu                          | test                             |
| C-USE-set-my-days-install-offer-4 | Synapse runs from the home screen, or the width is 1024 up | No offer                                                                               | test                             |
