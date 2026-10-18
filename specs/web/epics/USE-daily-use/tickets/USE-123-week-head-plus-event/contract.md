---
id: USE-123
size: small
objective: "On the Week at the desk, hovering or focusing a day head shows \"+ Event\" beside it, and it opens USE-53's event popover anchored under it, set to that day"
slice_type: "a fix found by the Paper assay (thread C, 2026-10-18) on USE-73 C2; the button lives only in the /dev/parts fixture today; risks a hover-only control with no keyboard path"
non_negotiables:
  - "\"+ Event\" shows on a weekday head's hover and on focus within the head, never on Sat or Sun heads that have no ›."
  - "It is 24 px, --color-background, a --color-input hairline, semibold caption, as time-lens.md draws it."
  - "It is named \"Add an event on <weekday> <date>\" (ADD_EVENT_COPY.plusEventName) and reachable by Tab."
  - "It opens USE-53's EventPopover anchored under the head, set to that date; Add event writes as USE-53 does."
  - "It shows in both lenses' heads, Priority and Time, and the head's › still opens the day."
  - "Only @syn/ui components and preset tokens (canon §2)."
devs_call: "Whether the head becomes a group with two controls or the button sits in a slot after the ›."
cites:
  - "specs/web/epics/USE-daily-use/ux/work/week/states/time-lens.md"
  - "C-USE-week-time-lens-1"
  - "D-USE-41"
truth_files: "none: time-lens.md already draws it; the code is brought to it"
qa: Q1
reviewers:
  - assay
focus:
  - "the Wed head hovered and the popover open at 1728 against `week / time lens / 1728 / light` (assay)"
operator_review: false
planned_paths:
  - "apps/web/app/(shell)/week/_components/"
  - "apps/web/components/work/"
  - "apps/web/lib/fixtures/"
  - "specs/web/epics/USE-daily-use/tickets/USE-123-week-head-plus-event/evidence/"
depends_on:
  - "USE-53"
  - "USE-73"
out_of_scope:
  - "The popover's own fields and its writes (USE-53)"
  - "Google events' read-only rule"
criteria:
  - id: C1
    statement: "Rendering the Week's head row, a weekday head has a button named \"Add an event on Wednesday 14\" that opens the event popover set to 2026-10-14; Sat and Sun heads have none"
    evidence: test
    command: "yarn test"
  - id: C2
    statement: "At 1728 on /dev/parts?state=week-time, hovering Wednesday's head shows \"+ Event\" beside \"Wed 14 ›\", and pressing it opens \"New event · Wednesday 14\" under the head"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-123-week-head-plus-event/evidence/plus-event-1728.png"
  - id: C3
    statement: "The web app type-checks"
    evidence: check
    command: "yarn check-types"
---

# Contract — USE-123 week-head-plus-event

## Build notes

Found by the Paper assay of thread C on 2026-10-18: USE-73 C2 judged **mismatch**. Hovering Wednesday's head on `week-time` shows no "+ Event". `ADD_EVENT_COPY.plusEvent` is used only by `lib/fixtures/add-event-parts.tsx`, which mocks a head for USE-53's capture. No Week head mounts it.

- **Approach:** lift the fixture's head button into the Week's day head (both lenses), shown on hover and focus-within, and wire it to the EventPopover USE-53 built. Keep the fixture part rendering through the real head, so USE-53's captures still work.
- **Decisions that apply:** D-USE-41: "the Time lens beside Priority, same pool and rules; events are not a pool tab ("+ Event" on a day head); any block opens the Block panel." time-lens.md, Day heads: "'Wed 14 ›' with **+ Event** beside it (24 px, `--color-background`, a `--color-input` hairline, semibold caption), shown on the head's hover."
- **Interfaces:** the Week's day head gains an `onAddEvent(date)`; nothing else.
- **Per path:** `week/_components/`, the head and the popover's anchor; `components/work/`, if the head lives there; `lib/fixtures/`, `add-event-parts.tsx` using the real head.
- **Gotchas:** a hover-only control fails keyboard users. Show it on focus-within as well, and keep it in the Tab order. The popover covers Wed to Fri mornings by design.
- **Model:** Sonnet is enough.
