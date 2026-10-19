---
id: "USE-62"
size: small
objective: "A meeting inside a Work block stays inside it: on the phone a plum band sits in the flow where the plan reaches its time, with \"in n min\", times after it re-flow by its length, the card that would run past it says so in its meta, and at its time the meeting lifts ahead of the tiers under \"At <time>\" while anything running or firing carries on; at the desk the band names it and a row with its Tag sits under the band at its time"
slice_type: "a pure re-flow and its drawing; risks the block split in two, a warning colour or prompt for the consequence, the band placed by clock time instead of the plan, and a running item paused when the meeting lifts"
non_negotiables:
  - "The block stays one block; nothing splits it or an item (C-USE-today-8)."
  - "The consequence is a time in ink in the card's meta, never a warning colour, prompt or sheet (C-USE-today-meeting-coming-up-2)."
  - "A meeting lifting never pauses, fires or brings back anything (C-USE-today-meeting-lifted-2)."
  - "The flow is pure and in @syn/utils: the plan at the top of each range, Stretch sliding first, whole minutes, total."
  - "The band is an event in plum with its Work or Personal Tag; colour never alone; preset tokens only."
devs_call: "The flow function's name and output shape; whether the desk's row under the band is the same component as the phone's lifted meeting."
cites:
  - "specs/web/epics/USE-daily-use/ux/work/today/states/meeting-coming-up.md"
  - "specs/web/epics/USE-daily-use/ux/work/today/words-and-access.md"
  - "specs/web/epics/USE-daily-use/ux/work/today/states/meeting-lifted.md"
  - "C-USE-today-8"
  - "C-USE-today-meeting-coming-up-1"
  - "C-USE-today-meeting-coming-up-2"
  - "C-USE-today-meeting-coming-up-3"
  - "C-USE-today-meeting-lifted-1"
  - "C-USE-today-meeting-lifted-2"
  - "C-USE-today-meeting-lifted-3"
  - "D-USE-38"
  - "D-USE-77"
waiver: "A meeting inside the Work block, before its time (coming up) and at it (lifted), with C-USE-today-8 from words-and-access: one band in two moments."
truth_files: "none: promotion carries work/today/"
qa: Q1
reviewers:
  - assay
focus:
  - "meeting coming up and meeting lifted at 402 against their captures, and the desk's row under the band (assay)"
operator_review: false
planned_paths:
  - "packages/utils/src/work/flow.ts"
  - "packages/utils/src/work/flow.test.ts"
  - "packages/utils/src/work/index.ts"
  - "apps/web/app/(shell)/today/_components/"
  - "apps/web/components/work/"
  - "apps/web/lib/data/use-today-work.ts"
  - "apps/web/lib/fixtures/"
  - "specs/web/epics/USE-daily-use/tickets/USE-062-today-meetings/evidence/"
depends_on:
  - "USE-4"
  - "USE-7"
  - "USE-8"
  - "USE-10"
  - "USE-35"
  - "USE-57"
  - "USE-59"
out_of_scope:
  - "Make room's sheet when Primary itself won't fit: USE-41, on USE-35's engine"
  - "The Schedule's meeting band: the Schedule ticket"
  - "Adding an event: USE-53"
criteria:
  - id: C1
    statement: "flowWorkBlock lays the block's undone rows from now at the top of each range, places a day event where the plan reaches its start, pushes later rows by its length, names a row that would end past it with its end time, and slides Stretch first when the block overflows"
    evidence: test
    command: "yarn test"
  - id: C2
    statement: "At 402 at 10:20, the lifted card's meta reads \"30 min · would end 10:50, past [Design sync]\", the band \"[Design sync]\" with its Work Tag, \"10:30 to 11:00 · the work below waits until 11:00\" and \"in 10 min\" sits in Primary's flow, and the header names \"Kestrel weekly at 11:00\""
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-062-today-meetings/evidence/meeting-coming-up-402.png"
  - id: C3
    statement: "At 402 at 11:00 the meeting lifts under \"At 11:00\" (\"Meeting · 11:00 to 11:15\" with its Tag) ahead of the tiers, the lifted work item is back in its row, and a running item still runs"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-062-today-meetings/evidence/meeting-lifted-402.png"
  - id: C4
    statement: "At 1728 at the meeting's time a row with its Tag sits under the band; the tiers are unchanged"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-062-today-meetings/evidence/meeting-lifted-1728.png"
  - id: C5
    statement: "@syn/utils and the web app type-check"
    evidence: check
    command: "yarn check-types"
  - id: C6
    statement: "The web app lints clean"
    evidence: check
    command: "yarn lint"
---

# Contract — today-meetings

## Build notes

Wave 2, after USE-59. Match `ux/work/today/captures/meeting-coming-up-402.png` and `meeting-lifted-402.png`. The mechanics are the dev note `ux/dev-notes/meeting-inside-a-work-block.md`.

- **Decisions that apply:**
  - The dev note: the block stays one block; a meeting is a pinned item inside it, a band in the flow on Now. The plan's times flow around it; an item is never split; the card shows the consequence. At its time it lifts. Anything running keeps running (D-USE-27). If the tiers no longer fit, Stretch slides first. No prompt, no sheet.
  - The band is an event, plum (D-USE-38). The consequence joins the card's meta after the range, in ink [ASSUMPTION, as the state file].
  - D-USE-77: at the desk no band in the tiers (the Work band says it, "Work 9:30 to 12:00 · Kestrel weekly at 11:00, in 40 min"); the lifted card's meta carries the same consequence; at its time a row with its Tag sits under the band.
  - Words: "would end 10:50, past [Design sync]"; "10:30 to 11:00 · the work below waits until 11:00"; "in 10 min"; "At 11:00"; "Meeting · 11:00 to 11:15"; "Work" or "Personal".
  - Access [ASSUMPTION]: the band is not a control; its name reads "<meeting>, 10:30 to 11:00, in 10 min"; "At 11:00: <meeting>" is announced once, politely.
- **Interfaces:** `flowWorkBlock({ block: { start; end }; rows: { slotId; tier; topMin; doneAt; running }[]; events: { id; start; end; title }[]; now }): { rows: { slotId; start; end; pastEvent?: { id; title } }[]; bands: { eventId; afterSlotId | null }[]; slid: string[] }` in `@syn/utils/work/flow.ts`, using USE-8's `topMinutes`. `MeetingBand` and `LiftedMeeting` in `components/work/`.
- **Per path:** `flow.test.ts` holds C1; append to `work/index.ts`, never reorder. Scenarios `today-meeting-coming-up` (10:20) and `today-meeting-lifted` (11:00).
- **Gotchas:**
  - The dev note says Make room and A later start share this engine. USE-35's room engine works at the day's level (blocks, slides, cuts); this is the layout inside one Work block, which it does not cover. Reuse USE-35's minute helpers; never a second copy of them.
  - The band's place is by the plan, not by the clock: a 10:30 meeting sits after the rows the plan finishes by 10:30.
- **Model:** Opus 5.5 at medium. A smaller model splits the block, colours the consequence, or pauses the running item at the meeting.
