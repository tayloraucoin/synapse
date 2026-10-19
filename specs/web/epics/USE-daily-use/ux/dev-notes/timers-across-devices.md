---
target: specs/web/ux/dev-notes/timers-across-devices.md
status: approved
promoted:
---

# Timers across devices (work time, firing, Step away)

No canvas dev note covers this; it carries the round 7 Open line's "Mason, phone data needs" in full, for the Technical stage, with the timer rules the boards rely on. Cited by [Today](../work/today/index.md), [firing](../interactions/firing.md), [step-away](../interactions/step-away.md), [start-while-one-runs](../interactions/start-while-one-runs.md), [error](../work/today/states/error.md) and [offline](../work/today/states/offline.md).

## Mason, phone data needs (verbatim, Open "Work on the phone, round 7")

1. One timer, many screens: work time, pauses, Step away and firing are stored as timestamped events on the item (started, paused, resumed, prompt sent, brought back, done), never as a ticking number, so a timer started on the phone reads right at the desk and the reverse; both clients derive the clock.
2. In step across devices: an open desk tab sees a phone's Prompt sent or Done within a few seconds (Supabase Realtime on the item's events, or a refetch on focus); say which.
3. Offline on the phone: timer and firing events queue with their own times and replay in order; two devices acting on one item resolve by event time, and a Done wins over a later Pause.
4. Step away across devices: one pause event per paused item, so Resume all at the desk resumes what the phone paused.
5. Push on the phone for daily reminders and the stretch break: web push to an installed home-screen PWA on iOS 16.4 or later [NOT VERIFIED], with the To-do sheet's "not installed" and "notifications off" states as the fallback.
6. The swipe starts away from the screen edge so it never fights the browser's back swipe [NOT VERIFIED in iOS standalone mode].

## The timer rules the boards rely on

- **Two clocks per item** (D-USE-44): work time is the sum of started/resumed to paused/prompt-sent/done spans; firing time runs from prompt sent to brought back (or done). Prompt sent ends a work span by itself; brought back never opens one (D-USE-44).
- **One in hand** (D-USE-43): at most one item has an open work span. Starting another first closes the running one's span with a prompt sent (Firing, default) or a pause (Paused) event ([start-while-one-runs](../interactions/start-while-one-runs.md)).
- **Step away** (D-USE-46): one pause event per running item, all with the same time, tagged as Step away's so Resume all resumes exactly those (Mason 4). A card's own Pause is not tagged [ASSUMPTION].
- **Display:** the countdown is the top of the range minus work time; past it, "n min over" (D-USE-29, D-USE-42). Firing shows whole minutes, "1 h 20" past an hour; work time shows seconds on the running card only.
- **Done** records "Took <work time> · fired <firing time>", "fired" left off at zero (D-USE-48). A session's Done is per session ([sessions](../interactions/sessions.md)).
- **Day's close:** an open firing span and an open work span end at the day's close [ASSUMPTION, Open "Firing flow"; N6]; the item stays in its tier.
- **Never written to Linear:** firing and work time (N6). Linear writes (status, done) queue offline and replay in order (D-USE-56).
- **A failed load** loses no time, since the clock is derived from events ([error](../work/today/states/error.md)).

## Open for Technical

- Realtime or refetch on focus (Mason 2): Supabase Realtime on the item events, refetch on focus as the fallback; Technical may overrule with a reason (D-USE-65).
- iOS web push and the edge swipe (Mason 5, 6) are [NOT VERIFIED].
