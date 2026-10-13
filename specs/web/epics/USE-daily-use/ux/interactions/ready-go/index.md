---
target: specs/web/ux/interactions/ready-go/index.md
status: approved
promoted:
boards: []
dev_note: "Dev note · The Ready, go hand-off"
rulings: [D-USE-5, D-USE-25, D-USE-39, D-USE-65, D-USE-71, D-USE-72]
---

# The Ready, go hand-off

Step 5b round 2 (D-USE-71): between Review the day and Now, a focused welcome screen with one button that starts the first block. Step 2c of [`../first-wake-loop.md`](../first-wake-loop.md). Drawn on "USE — daily use", row "Row label · Ready, go hand-off" (y 8940, notes y 9870): "Step 5b · Ready, go hand-off / Round 2 (current): the welcome, first go ever, late wake, checklist day. Then Now once settled, from round 1 and still true: first block not yet started, reopened later. Then offline, How it flows, and the dev note. Round 1 is in the Archive." Round 1 is superseded (`../../boards/use-daily-use/archive-2.md`). No intent-pass flat file was written for this flow; open-3's two items are folded in here.

## Where it starts

- **Ready, go** on Review the day ([`../../day/review-the-day/index.md`](../../day/review-the-day/index.md)), its footer button on a fade (D-USE-25).
- A reopen after Ready, go and before Start (D-USE-71).

## Steps

| #   | The person                                                 | The app                                                                                                                                        | Board (carried by)                                                                                                                                                                                                                                       |
| --- | ---------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Taps **Ready, go**                                         | The day locks on the phone; Review the day fades out (`--dur-sheet`, 200 ms), the welcome fades in, its sections rising 8 px one after another | `ready-go / welcome, rec. / 402 / light` ([`states/welcome.md`](states/welcome.md)); branches [`first-go-ever`](states/first-go-ever.md), [`late-wake`](states/late-wake.md), [`checklist-day`](states/checklist-day.md), [`offline`](states/offline.md) |
| 2   | Reads; nothing moves on by itself                          | The welcome waits for the button: no timer                                                                                                     | the same                                                                                                                                                                                                                                                 |
| 3   | Taps **Start Wellness** (or Start Training, Open the list) | The welcome fades; Now opens on the first block, the same Now as step 5, with the tabs (`../../day/now/index.md`)                              | [`states/not-yet-started.md`](states/not-yet-started.md) before the block's time                                                                                                                                                                         |
| 4   | Opens the app again later                                  | Before Start: the welcome. After Start: Now as it stands, no hand-off                                                                          | [`states/reopened-later.md`](states/reopened-later.md)                                                                                                                                                                                                   |

"Today, as I see it" is read back from Orient's line of that name (`../../day/orient/index.md`, [`../../day/orient/states/success.md`](../../day/orient/states/success.md)).

## Rules

All Decided (D-USE-71), the flow's [PROPOSED] Rules taken as drawn:

- Plays once a day, on Ready, go only. "Review the day" (back, top left) goes back with nothing undone; the day stays editable (N3).
- The Orient line shows only when it has words; otherwise the section is absent.
- Offline works the same; the lock saves on the phone and syncs later; nothing waits on the network.
- Before the first block's time, the button still starts it.
- Reduced motion: opacity only.
- Words [placeholder] until Gloss. From round 1's words frame, kept for Gloss: the payoff is in the words and the type, never a score; never "late", never a count, never second person.
- Focused at every width, no rail and no tabs (D-USE-39); the desk, and where Start lands there: [`states/welcome.md`](states/welcome.md) › Widths.
- [ASSUMPTION] The welcome is a route of its own (the dev note's three routes); its path is unnamed.

## How it flows

**How it flows · step 5b round 2** (p-3-0, x 3374, y 8940), in full:

> How it flows · round 2
>
> Ready, go: Review the day fades out (--dur-sheet 200 ms) and the welcome fades in, its sections rising 8 px one after another. It stays until the button: no timer, nothing moves on by itself. Start Wellness: the welcome fades and Now opens on Wellness, the same Now as step 5, with the tabs. Reduced motion: opacity only.
>
> Title · drawn [placeholder until Gloss] / The day is set. / Calm, and true: the review is done.
>
> Title · shorter / Ready. / Echoes the button just pressed
>
> Title · plain, no serif / Monday, under way. / Reads like the rest of the app
>
> Rules [PROPOSED]
>
> Reopened before Start: the welcome again; after Start: Now. "Review the day" goes back with nothing undone (the day stays editable, N3). The line from Orient shows only when "Today, as I see it" has words; otherwise the section is absent. First go ever: the line gives way to "From here, at the bottom", shown once. Offline works the same; the lock saves on the phone. Before the first block, the button still starts it: "Planned for 7:05. Starting early is fine."

## The dev note

**Dev note · The Ready, go hand-off** (p-3-0, x 3856, y 8940), in full:

> Dev note · The Ready, go hand-off
>
> Round 2's foundation: a welcome screen between Review the day and Now, reached by a cross-fade, with one button that starts the first block. The line from Orient is now drawn there. Fancier options, not drawn:
>
> Logged in day/overview.md, Open.
>
> How it maps to apps/web
>
> Round 2 needs no shared element: three routes (Review the day, the welcome, Now) joined by opacity cross-fades, plus a CSS stagger on the welcome's sections, all on the motion tokens. The View Transitions API gives the cross-fade with no new dependency; without it, a plain route change is fine. [ASSUMPTION: CSS only, no Framer Motion.] Round 1's fold into the BlockHeader could come back later as an extra, via view-transition-name on the first block.
>
> Options to discuss, each with cost and risk
>
> Haptic on the fold: one light tap as the block lands. Cheap, but iOS Safari has no web haptics, so only an installed native shell would feel it. Risk: nothing felt on iPhone today.
>
> A verdigris sweep: a hairline of the brand colour runs once along the block's edge. Cheap in CSS. Risk: verdigris means "this moment", and a sweep edges toward A-13 celebration.
>
> A sound: one soft tone. Low cost. Risk: a phone in a quiet house at 7 a.m.; off by default.
>
> First week vs everyday: the full 1 s with C's marks for the first seven goes, then a 400 ms version. Low cost. Risk: two versions to keep in step.

Open-3, "The Ready, go hand-off, step 5b round 2" and "Dev note: the Ready, go hand-off".

## Rulings

- D-USE-71: round 2 as drawn; round 1 (Archive 2) superseded; words [placeholder] until Gloss. The two other titles are Gloss's options, not decisions.
- D-USE-72: Now's marks after Start stand as drawn.
- D-USE-5: the entry tree; D-USE-71 adds the welcome between Ready, go and Start. Review the day's `states/after-ready-go.md` sends an open after Ready, go to Now: read "after Start".
- Kept from round 1, each in the state it bears on (Rulings there): `ready-go / late wake, block under way / 402 / light` ([`states/late-wake.md`](states/late-wake.md)), `ready-go / checklist day / 402 / light` ([`states/checklist-day.md`](states/checklist-day.md)), `ready-go / A1 Ready, go pressed / 402 / light` ([`states/welcome.md`](states/welcome.md)).

## Criteria

| ID               | When                              | Then                                           | Evidence                          |
| ---------------- | --------------------------------- | ---------------------------------------------- | --------------------------------- |
| C-USE-ready-go-1 | Ready, go                         | The welcome cross-fades in and waits; no timer | `captures/welcome-402.png`        |
| C-USE-ready-go-2 | Start                             | Now on the first block, tabs shown             | test                              |
| C-USE-ready-go-3 | Reopen before Start / after Start | The welcome / Now, no hand-off                 | `captures/reopened-later-402.png` |
| C-USE-ready-go-4 | Reduced motion                    | Opacity only                                   | test                              |
| C-USE-ready-go-5 | Back, "Review the day"            | Review the day with nothing undone             | test                              |
