---
id: USE-117
size: small
objective: "The to-do reminder's lock-screen preview fills its frame like a phone's lock screen: no shell tabs over it, the date and a large clock at the top, the one notification near the foot and wholly visible"
slice_type: "a dev-only preview frame fixed to its drawing; risks the preview drifting into an app screen or gaining words beyond Taylor's own"
non_negotiables:
  - "The notification's body is the to-do's own words, \"Call the mechanic\", and nothing else (notification.md; product rule: a notification never reports a miss)."
  - "No second person; nothing red."
  - "Only @syn/ui components and preset tokens (canon §2, A-01 to A-20 by ID)."
devs_call: "How the part leaves the shell's chrome (its own focused host on /dev/parts, or a part flag the AppShell reads); the clock's type token."
cites:
  - "specs/web/epics/USE-daily-use/ux/day/todos/states/notification.md"
  - "D-USE-3"
truth_files: "none: the epic's ux/ already describes the drawn form; the build catches up to it"
qa: Q1
reviewers:
  - assay
focus: []
operator_review: false
planned_paths:
  - "apps/web/lib/fixtures/todos-parts.tsx"
  - "apps/web/components/planner/"
  - "apps/web/app/(dev)/dev/parts/"
  - "specs/web/epics/USE-daily-use/tickets/USE-117-notification-preview-full-bleed/evidence/"
depends_on: []
out_of_scope:
  - "The real push notification and its payload (the OS draws it; Synapse sets only its words)"
  - "Not installed and notifications off (the To-do sheet's states)"
criteria:
  - id: C1
    statement: "At 402 /dev/parts?state=todos-notification shows a full lock-screen frame with no tab bar: \"Monday 12 October\" over a large \"10:00\" at the top, and near the foot one card with the app icon, \"Synapse\", \"now\" and \"Call the mechanic\", none of it clipped"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-117-notification-preview-full-bleed/evidence/notification-402.png"
  - id: C2
    statement: "@syn/ui and the web app type-check"
    evidence: check
    command: "yarn check-types"
  - id: C3
    statement: "They lint clean"
    evidence: check
    command: "yarn lint"
---

# Contract — notification-preview-full-bleed

## Build notes

Found by the assay pass against Paper (2026-10-18, thread A, USE-19 C4). `/dev/parts` wraps every part in `AppShell`, so the lock-screen preview (`ReminderPreview`, registered as `todos-notification`) gets the phone's tab bar across its foot. The tabs cover the bottom of the notification card, which sits on the frame's bottom edge, and the clock is a small figure. Paper's `todo-reminder / the notification / 402 / light` (x 0, y 12720) draws the clock as a large display figure and the card at about y 690 of 874, clear of the foot.

- **Approach:** let this part render without the shell's tabs (the preview is not an app screen), then size the clock and place the card as drawn. Recapture at `/dev/parts?state=todos-notification`.
- **Decisions that apply:** D-USE-3: "the reminder is set on the To-do sheet; not installed and notifications off are drawn there". notification.md: "Not an app screen: the OS draws it; Synapse sets only its words."
- **Interfaces:** possibly a way for a part to opt out of `AppShell`'s chrome on `/dev/parts`; nothing on a product route.
- **Per path:** `todos-parts.tsx` the part; `components/planner/` `ReminderPreview`'s layout; `(dev)/dev/parts/` only if the host gains the opt-out.
- **Gotchas:** `/dev/parts` never ships to production (`notFound()` there); keep it that way. Other parts depend on the host's shell, so the opt-out is per part.
- **Model:** Sonnet 5.5 at medium; a smaller model restyles past the frame or drops the existing behaviour.
