---
size: medium
objective: "Daily reminders and a block's start notify on the phone and at the desk through web push, from a scheduler that runs every five minutes, never twice for one reminder and never reporting a miss"
slice_type: "a cross-user scheduled job over user-private rows; risks a reminder sent twice or not at all across a five-minute window, a job reading users' rows outside RLS, and words that report a miss"
non_negotiables:
  - "The cron runs every 5 minutes (C12); each job lists accounts with the singleton db and reads each account's rows only through createRlsClient(buildServiceRoleAuthContext(userId)), as expire-exports does."
  - "A reminder is sent at most once: each job inserts its notification_deliveries row (key user, kind, target_id, target_key, scheduled_for truncated to the minute) with ON CONFLICT DO NOTHING before it sends, and sends only when the insert returned a row."
  - "A notification never reports a miss and never uses the second person (apps/web/docs/product-rules.md)."
  - "A to-do already done, or a block already started or completed, sends nothing."
  - "One job that throws is logged and does not stop the others (run-scheduled-jobs' rule)."
devs_call: "The window rule's exact edges (recommended: due in (lastRun, now], with lastRun = now − 5 min and a 1-minute overlap deduped); the payload's words within the product rules; job file names."
cites:
  - "specs/web/epics/USE-daily-use/ux/dev-notes/timers-across-devices.md"
truth_files: "none: behaviour is the ledger's; the To-do sheet's notification states are built on fixtures"
qa: Q1
reviewers: []
focus: []
operator_review: false
planned_paths:
  - "apps/web/vercel.json"
  - "packages/api/src/services/jobs/"
  - "packages/api/src/services/notifications/"
  - "packages/constants/src/notification-catalogue.ts"
  - "apps/web/lib/pwa/"
depends_on:
  - "USE-95"
  - "USE-91"
  - "USE-102"
out_of_scope:
  - "The stretch break's push: the finer points of breaks are deferred by the ledger"
  - "A Google event's start: no push (D-USE-92)"
  - "The Linear outbox sweep's logic: USE-102 writes it; this ticket only registers it"
criteria:
  - id: C1
    statement: "vercel.json's cron for /api/jobs/scheduler runs every 5 minutes"
    evidence: test
    command: "yarn test"
  - id: C2
    statement: "The todo_reminder job sends one push for a daily reminder whose time falls in the window, and none on a second run over an overlapping window"
    evidence: test
    command: "yarn test"
  - id: C3
    statement: "A reminder already done for the date, or a block with notify that has started or is complete, sends nothing"
    evidence: test
    command: "yarn test"
  - id: C4
    statement: "Every payload the two jobs build passes the product rules' words check: no number about the day, no miss, no second person"
    evidence: test
    command: "yarn test"
  - id: C5
    statement: "No job reads a user's row except through an RLS client built for that user"
    evidence: test
    command: "yarn test"
  - id: C6
    statement: "A daily reminder arrives on Taylor's installed iPhone and in the desk browser at its time"
    evidence: manual
    reason: "iOS push to an installed PWA and a desk browser, on staging; operator check"
  - id: C7
    statement: "The API type-checks"
    evidence: check
    command: "yarn check-types"
id: USE-105
---

# Contract — push-and-reminders

## Build notes

Technical's data contract: `notification_kind` gained `todo_reminder` (0012). A block with `notify` uses the existing `block_start`. Both ride the existing scheduler, which now runs every 5 minutes (C12), with the push pipeline and `web_push_subscriptions`, on the phone and at the desk.

- **Decisions that apply:**
  - C12: the scheduler runs every 5 minutes, so a reminder is at most 5 minutes late.
  - D-USE-111: desktop push on the Mac is "drawn, and wired after"; this is that wiring. The browser's own web push serves the desk; there is no native Mac app.
  - D-USE-37: a daily reminder is a to-do with a daily rule and a time.
  - The "While it fires" line is a pure pick in the UI; nothing here.
- **Approach:**
  - `services/jobs/todo-reminders.ts`: for each account, read to-dos with `remind_at` whose rule (or `remind_on`, 0014) falls on today in the account's zone and whose time is in the window. Skip any done for the date. Insert the delivery row first (`target_id` = the to-do, `scheduled_for` = the reminder's time today, to the minute); send only when it returned a row, as the table's own comment requires. Build the payload through `build-payload.ts`, fan out through `fan-out.ts`.
  - `services/jobs/block-starts.ts`: the same for blocks with `notify` whose start falls in the window (read through USE-91's day read).
  - Register both, plus USE-102's `linear-outbox` sweep, in `SCHEDULED_JOBS`.
  - `vercel.json`: `"schedule": "*/5 * * * *"`.
  - Update the comment in `run-scheduled-jobs.ts`: it says fifteen minutes.
- **Push at the desk:** `lib/pwa/push-subscribe.ts` already subscribes in any browser. Check that the subscribe path runs at the desk (the avatar menu's Install sheet and the To-do sheet's "notifications off" state), and that `sw.js` shows the push when the tab is closed. No new UI.
- **Per path:**
  - `todo-reminders.test.ts` and `block-starts.test.ts` (C2, C3) over in-memory rows, with the clock passed in.
  - `words.test.ts` (C4) runs `checkCopy` (or a local rule list taken from `product-rules.md`) over each payload.
  - C5 reads the job files as text.
  - C1 reads `vercel.json`.
- **Gotchas:**
  - Vercel runs crons more often than daily only on a paid plan. The 15-minute cron already deploys, so the plan allows it; say so if a deploy refuses.
  - iOS asks for permission only after a tap, in an installed app (rabbit hole 11).
- **Model:** Opus 5.5 at medium. A smaller model reads every user's to-dos through the singleton db.
