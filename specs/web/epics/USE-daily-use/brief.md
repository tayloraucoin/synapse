---
epic: USE
status: draft
---

# Brief — Synapse as a daily tool

> Framed lightly (Frame stage, Compass), from Taylor's notes of 2026-10-09 ([`docs/product/operator-notes/2026-10-09-day-to-day-use.md`](../../../../docs/product/operator-notes/2026-10-09-day-to-day-use.md), cited as "note n") and the study ([`research/what-exists.md`](research/what-exists.md)). No solution vocabulary here; the narrative carries that.

## Job

- **Trigger:** the phone comes out of the bathroom drawer at wake, with about ten minutes before the cold bath, and other apps blocked (notes 9–12). The first five minutes go to Orient (amendment 1); then the day ahead needs to be seen, adjusted and started. After that, through the day: "here's your current thing" (note 52), and "check, check, check" (note 65).
- **Baseline:** the app asks "what all things do you want to do in life", which "feels overwhelming" (note 88). The day is planned on paper in a Passion Planner week (notes 68–69, [`refs/`](refs/passion-planner-weekly-spread.jpg)), and timing is done on the phone's own timer (note 50). Work priorities live outside the day.

## User

- Taylor, the only user for now (notes 1–3), on an iPhone (402 × 874), half-awake in the bathroom, then moving through the day one-handed between tasks. The weekday shape follows the gym: Monday and Tuesday at the YMCA, Wednesday abs and yoga at home, Thursday and Friday home workouts (note 35). Wellness repeats each week; work is empty until slotted (notes 66–67).

## Metric

- **Signal:** a qualitative bar, named plainly. Taylor runs the morning loop and goes through the day by checking things off, on real data, every weekday (note 37).
- **By when:** two working weeks after the first build is in Taylor's hands (confirmed at Stop 2).
- **Kill criterion:** after those two weeks the paper planner or the phone timer is still where the day actually runs. Then the shape is wrong, not the polish.

## Evidence

- Taylor's own use, in Taylor's words (notes 1–100): judgment, first-person.
- The codebase already holds most of the parts: the calendar-style day, icons with colour, a timer, mark-done, the block item editor (what-exists, Answer): verified and secondary.
- **Counter-evidence:** the earlier epics built breadth for a self-serve user, and some of it (named plans, the walk, the miss tiers) now sits in the way. The workflow board was built and is already called a beta (note 40). A tool shaped tightly around one person's schedule may need reshaping before anyone else uses it; Taylor accepts that (note 6).

## Appetite

- **About two build days**, next week, for the first loop on Taylor's own data: weekday defaults, the morning loop, go mode, work tiers. Token-light: "This shouldn't take that much." No hardening; QA is a UI audit only (Stop 2 amendment). Linear wiring, desktop and the data views come later (notes 42, 97, 99).

## Mode

- R&D: "I'm experimenting to build this" (amendment 7).

## Decision this unblocks

- Taylor approves a narrative for daily use. Every later USE thread (the intent pass, Paper screen by screen, Technical, Tickets) reads it.

## Out of scope

- Desktop, unless asked (note 99). Linear's API and sync (note 42), though the linked item is designed. Changes to the first run, which is kept but not worked on (amendment 2). The workflow board's revamp (note 40). Data and review views (note 97). Weight tracking (note 15). Named day templates (note 33).

## Knowledge gaps

1. What the existing parts do and what each becomes. Answered: [`research/what-exists.md`](research/what-exists.md).
2. The current install steps for iPhone and Android. Answered there under Lookups, 2026-10-09; Google's own Android page was not found.
3. Which Linear issue fields exist to show on a linked item. Answered there under Lookups.
4. How physio fits the week (note 36). Open; it's Taylor's to work out, and the narrative leaves room for it.
