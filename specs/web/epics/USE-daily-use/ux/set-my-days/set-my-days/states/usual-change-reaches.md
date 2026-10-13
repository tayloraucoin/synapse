---
target: specs/web/ux/set-my-days/set-my-days/states/usual-change-reaches.md
status: approved
promoted:
boards:
  - name: "set-my-days / usual change reaches this week / 402 / light"
    page: "USE — set up"
    at: [4338, 1260]
    note: "Frame @ x 4338, y 2190"
    capture: specs/web/epics/USE-daily-use/ux/set-my-days/set-my-days/captures/usual-change-reaches-402.png
rulings: [D-USE-33]
---

# Set my days — a usual-week change reaches this week

The usual Thursday at 21:10, back from editing every Thursday's Wellness. `?state=usual-change-reaches`. Its note is the "Frame" at x 4338, y 2190. Layout, words and access: [`../index.md`](../index.md).

## What shows, top to bottom

- **Header:** "‹ Week", `SaveStatus` "Saved"; the title "Every Thursday".
- **Weekday chips:** M T W **T** F S S, Thursday filled ink, dots under the built days.
- **Bounds row:** "Up at 7:00", "Lights out 22:30", the ···.
- **Column:** Orient · 5 min at 7:00; **Wellness 7:05 to 8:00 ringed in ink** (the block just changed; Pee and weigh, Water, Start the cold bath, "+2 more"); Training 8:00 to 8:57; Breakfast 9:00 to 9:30; Work 9:30 to 12:00, "Work goes in on This week."
- **Toaster** (ink, light text), floating above the +: "Wellness changed for every Thursday. This week's Thursday 15 follows, except blocks changed on that day." with "See it" (underlined) at the trailing edge.
- The + bottom right.

## What the person can do

- "See it": opens this week's Thursday 15 in Set my days ([`day-own-change.md`](day-own-change.md)).
- Let it go: the Toaster leaves on its own [ASSUMPTION: the Toaster's usual time, as the other Toasters in this area].
- Everything else as the usual week ([`usual-week.md`](usual-week.md)).

## Words

"Wellness changed for every Thursday. This week's Thursday 15 follows, except blocks changed on that day." and "See it". The block's name, the weekday and the date are filled in. When this week's day has already begun, the day is not named and nothing follows [ASSUMPTION: the Toaster then reads only "Wellness changed for every Thursday."; not drawn].

## The notes on the boards

**"set-my-days / usual change reaches this week / 402 / light"**, "Frame @ x 4338, y 2190":

> A usual-week change reaches this week
>
> After editing every Thursday's Wellness, a Toaster says what follows: this week's Thursday 15, except blocks changed on that day [ASSUMPTION, N5]. See it opens that day. Days already started never change.

## Rulings

- The rule: a change to the usual week reaches every day of this week not yet started, except blocks already changed on that date. It is still `[ASSUMPTION, N5]` (N2, N5 "Paper and Open"): no D-line has settled it. D-USE-33 approved the round's "usual-week change naming its reach", that is, this Toaster, not the rule behind it. The same assumption is in [`../../overview.md`](../../overview.md) Open.
- It never reaches a day already begun (N2, note 18): settled, not an assumption.
- Reset to usual on the day's ··· ([`day-menu.md`](day-menu.md)) is the way back from a day's own changes.

## Widths

Drawn at: 402. At 1024 and wider (D-USE-83, [`the-day.md`](the-day.md)) the Toaster sits at the foot of the day pane [ASSUMPTION]; See it opens Thursday 15 in that pane.

## Criteria

| ID                                       | When                                     | Then                                                                                           | Evidence                                |
| ---------------------------------------- | ---------------------------------------- | ---------------------------------------------------------------------------------------------- | --------------------------------------- |
| C-USE-set-my-days-usual-change-reaches-1 | A block in the usual week is changed     | A Toaster names the change, the dated day of this week that follows, and the exception; See it | `captures/usual-change-reaches-402.png` |
| C-USE-set-my-days-usual-change-reaches-2 | This week's matching day has not started | Its blocks take the change, except blocks changed on that date                                 | test                                    |
| C-USE-set-my-days-usual-change-reaches-3 | This week's matching day has begun       | Nothing on it changes                                                                          | test                                    |
| C-USE-set-my-days-usual-change-reaches-4 | See it is tapped                         | This week's day opens                                                                          | test                                    |
