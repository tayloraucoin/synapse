---
target: specs/web/ux/dev-notes/google-calendar.md
status: approved
promoted:
dev_note: "Dev note · Google Calendar"
rulings: [D-USE-38, D-USE-40, D-USE-79, D-USE-82, D-USE-87]
---

# Google Calendar

Several Google calendars on the day, and what each answer to an invitation does. Used by Set my days (`../set-my-days/set-my-days/`: `states/google-events.md` and `states/event-own-block.md`), Settings › Connections (`settings / connections / 402 / light`, "USE — set up" x 6266, y 10080, carried by [`../account/settings/states/connections.md`](../account/settings/states/connections.md)), and the day's event bands wherever a block holds one ([`meeting-inside-a-work-block.md`](meeting-inside-a-work-block.md)).

## The dev note

**Dev note · Google Calendar** ("USE — set up", x 1446, y 2520):

> Dev note · Google Calendar
>
> Subscribe to several calendars; events land on the day as plum bands, like a typed event. Taylor's ask: answered yes is in, the rest isn't assumed.
>
> Logged in day/overview.md, Open.
>
> Proposed (to draw next thread)
>
> Settings › Connections holds Google calendars (several, each on or off) and the Linear workspaces, which settles step 12's open question. Yes: on the day as a band, read-only times. Maybe or not answered: a faint dashed band with "Add to day". No: hidden. Events sit in the block their time falls in, or stand alone.
>
> To decide
>
> Read-only or two-way; whether a calendar event can carry items; how a moved meeting re-flows a planned block (the Make room engine); offline; Usual week shows none, This week shows them.

No summary card sits under it. "Logged in day/overview.md, Open" is the canvas's wording; the item lives in `../day/open/open-4.md` ("Dev note: Google Calendar").

## What it means for the build, with the later lines

- **Read-only, several calendars, each on or off.** Settled: N6's Connections section (approved, D-USE-40) reads "Google calendars are read-only, several of them, each on or off", and Technical's prompt item 7 says the same. Nothing is written back to Google. Calendars are drawn and wired after the two days (N6, round 4).
- **Connections is drawn** (the "next thread" the note names): several calendars each with a switch (plum dot when on), Add a Google account, and the Linear workspaces each with ··· (Disconnect) and Add a workspace; names [placeholder]. It settles step 12's open question on where connections live. Carried by [`../account/settings/states/connections.md`](../account/settings/states/connections.md), in [`../account/settings/index.md`](../account/settings/index.md).
- **On the day** (`set-my-days / this week, Google events / 402 / light`): answered yes is a plum band at its time inside the block, times read-only, "Google" at its end, the work after it re-flowing; maybe or not answered is a faint dashed band with Add to day, taking no time until added; no is hidden. An event outside every block is its own small block (`states/event-own-block.md`).
- **Usual week shows none; This week shows them** (the Google events frame's note), since the usual week has no dates.
- **Colour:** events are plum, always a fill with the calendar icon, told from off-schedule violet by form (D-USE-38, D-USE-79).
- **A moved meeting re-flows the block** as a meeting inside a work block does: times flow around the band, an item is never split, the card names the consequence, and Make room's sheet is asked for only when Primary won't fit ([`meeting-inside-a-work-block.md`](meeting-inside-a-work-block.md), [`../interactions/make-room/index.md`](../interactions/make-room/index.md)).
- **Decided (D-USE-87): Items on a calendar event.** Default: none; a Google event is a band, not a container, and carries no items (not drawn).
- **Decided (D-USE-87): Offline.** Default: the events last synced stay on the day as drawn, read-only like the rest of Set my days' own controls offline (D-USE-82); Add to day waits for the connection [ASSUMPTION].

## Rulings

- D-USE-40: N6 approved, with its Connections section (read-only, several, each on or off).
- D-USE-38, D-USE-79: events plum, told from violet by form.
- D-USE-82: Set my days offline, read-only day controls.
