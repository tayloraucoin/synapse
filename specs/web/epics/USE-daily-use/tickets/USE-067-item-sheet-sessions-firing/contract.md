---
id: "USE-67"
size: small
objective: "A session's Item sheet shows its sessions and sub-issues on fixtures: Tier for this session with the This session or All sessions ask and its consequence, Sessions with × and + Add a day, Sub-issues as checkboxes with Place on a day by itself, Start and Done for today at the foot; and a firing item's sheet shows the firing panel with Bring back and Done"
slice_type: "sessions and sub-issues inside a sheet; risks All applied without asking, a session's Done or × touching the task or Linear, a placed sub-issue leaving its issue's checklist, and Bring back restarting work time"
non_negotiables:
  - "A tier change on one session asks This session (selected) or All sessions, naming where the others would end at the top of their ranges, in words, never red (C-USE-sessions-2)."
  - "× on a session drops that day only; Add a day adds a session; nothing writes to Linear but a sub-issue's check (D-USE-57)."
  - "A sub-issue placed alone stays a checkbox under its issue; checking it in either place checks it in Linear and the other place follows (C-USE-item-sheet-sub-issue-alone-2)."
  - "Bring back stops firing and never starts work time (D-USE-44); the panel's figures come from the derived clock."
  - "Only @syn/ui components and preset tokens; each tier carries its square and word."
devs_call: "File split; SessionRow from @syn/ui or a work part; the day chips (WeekdayChips) for Place on a day by itself."
cites:
  - "specs/web/epics/USE-daily-use/ux/interactions/sessions.md"
  - "specs/web/epics/USE-daily-use/ux/day/item-sheet/states/tier-and-sessions.md"
  - "specs/web/epics/USE-daily-use/ux/day/item-sheet/states/sub-issue-alone.md"
  - "specs/web/epics/USE-daily-use/ux/day/item-sheet/states/while-firing.md"
  - "C-USE-sessions-2"
  - "C-USE-sessions-3"
  - "C-USE-item-sheet-tier-and-sessions-1"
  - "C-USE-item-sheet-tier-and-sessions-2"
  - "C-USE-item-sheet-sub-issue-alone-1"
  - "C-USE-item-sheet-sub-issue-alone-2"
  - "C-USE-item-sheet-while-firing-1"
  - "C-USE-item-sheet-while-firing-2"
  - "D-USE-44"
  - "D-USE-54"
  - "D-USE-57"
  - "D-USE-65"
waiver: "Sessions' tier ask, with the Item sheet's tier-and-sessions, sub-issue-alone and while-firing states folded in: each is a field or panel of the same work item's sheet."
truth_files: "none: promotion carries day/item-sheet/ and interactions/sessions.md"
qa: Q1
reviewers:
  - assay
focus:
  - "tier and sessions, this session or all, sub-issue placed alone and while firing at 402 against their captures (assay)"
operator_review: false
planned_paths:
  - "apps/web/components/planner/item-sheet/"
  - "apps/web/components/work/"
  - "apps/web/lib/data/use-item-sheet.ts"
  - "apps/web/lib/data/item-sheet-sessions.test.ts"
  - "apps/web/lib/fixtures/"
  - "specs/web/epics/USE-daily-use/tickets/USE-067-item-sheet-sessions-firing/evidence/"
depends_on:
  - "USE-4"
  - "USE-7"
  - "USE-8"
  - "USE-10"
  - "USE-55"
  - "USE-56"
  - "USE-59"
  - "USE-60"
  - "USE-65"
out_of_scope:
  - "Spread across the week: USE-77 and USE-78"
  - "Done for today's toast on Today: USE-60; the sheet calls the same function"
  - "Linear's line and status: USE-66"
criteria:
  - id: C1
    statement: "Through the fixture server, All sessions moves every session's tier and This session only Mon 12's; × removes that day's slot only; Add a day places a session; checking a placed sub-issue sets its doneAt and writes one done outbox row, seen in both places"
    evidence: test
    command: "yarn test"
  - id: C2
    statement: "At 402 a session's sheet shows \"Mon 12 · Work · session 1 of 3\", the Linear line, Tier with \"Mon 12 only · asks before changing all\", Sessions \"2 to 4 h each\" with Mon 12 \"this one\", Wed 14 and Thu 15 with × and + Add a day, Sub-issues with one checked and one placed \"Thu 15\" with ···, Start and Done for today"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-067-item-sheet-sessions-firing/evidence/tier-and-sessions-402.png"
  - id: C3
    statement: "At 402 picking Primary asks \"Move to Primary\", \"… has three sessions: Mon 12, Wed 14, Thu 15.\", This session with \"Mon 12 only\" selected, All sessions with each changing session's end, and Move"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-067-item-sheet-sessions-firing/evidence/this-session-or-all-402.png"
  - id: C4
    statement: "At 402 Place on a day by itself shows \"Sub-issue of SYN-212 · …\", the day chips with weekends greyed, Tier, \"Thu's Secondary runs to 11:20 at the top of its ranges.\" and \"Place on Thu 15\""
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-067-item-sheet-sessions-firing/evidence/sub-issue-alone-402.png"
  - id: C5
    statement: "At 402 a firing item's sheet shows the firing panel (the mark, \"Firing · 22 min\", \"Prompt sent at 11:58 · worked 40 min before it\") with Bring back and Done at the foot"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-067-item-sheet-sessions-firing/evidence/while-firing-402.png"
  - id: C6
    statement: "The web app type-checks"
    evidence: check
    command: "yarn check-types"
  - id: C7
    statement: "The web app lints clean"
    evidence: check
    command: "yarn lint"
---

# Contract — item-sheet-sessions-firing

## Build notes

Wave 2, after USE-65. Match `ux/day/item-sheet/captures/tier-and-sessions-402.png`, `sub-issue-alone-402.png`, `while-firing-402.png` and `ux/interactions/captures/sessions-this-session-or-all-402.png`.

- **Decisions that apply:**
  - D-USE-57, D-USE-65: a session's Done closes today's share; the last session's Done does not mark the task done. A tier change on one session asks This session (default) or All sessions, with the consequence for the others: "Move to <tier>"; "<title> has three sessions: …"; "This session" / "Mon 12 only"; "All sessions" / "<Day>'s ends <time> at the top of its ranges", naming each session whose tier changes; "Move". A swipe down cancels and the tier stays [ASSUMPTION].
  - D-USE-54: Sessions lists each day and its tier; × drops a day; "+ Add a day" adds one.
  - Sub-issues: checkboxes; ··· offers "Place on a day by itself": one day, one tier, the consequence (USE-8's `fitInBlock`), "Place on <day>"; days with no Work block greyed. A placed sub-issue shows its day muted with its own ··· under the issue, and folds under its issue on Now's row (D-USE-51).
  - Firing panel: `FiringMark`, "Firing · <n> min" in `--color-red-700` (past an hour "1 h 20"), "Prompt sent at <time> · worked <n> min before it"; the foot reads Bring back and Done (D-USE-44, D-USE-48).
  - Access: the ask's radios are a group named by the heading; Move is the default button; focus returns to the tier control.
- **Interfaces:** `SessionsField`, `SubIssuesField`, `SessionTierAsk`, `PlaceSubIssueStep`, `FiringPanel` in `components/planner/item-sheet/`. `useItemSheet` gains `setTier(tier, sessions)`, `dropSession`, `addSessionDay`, `checkSubIssue`, `placeSubIssue`, `bringBack`.
- **Per path:** `item-sheet-sessions.test.ts` holds C1. Scenarios `item-tier-and-sessions`, `item-this-session-or-all`, `item-sub-issue-alone`, `item-while-firing`.
- **Gotchas:**
  - A sub-issue is a work item with `parentWorkItemId`; placing it alone gives it its own slot.
  - Session numbers are `countSessions`'s; never stored.
- **Model:** Opus 5.5 at medium. A smaller model applies All without asking, or lets × close the task.
