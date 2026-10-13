---
id: "USE-63"
size: small
objective: "Today shows Linear's side on fixtures: an issue In review, Blocked or Paused leaves its tier for Waiting at the block's foot and returns when it moves on, a status write in flight shows its spinner line, a failed write keeps Synapse's state with \"Not updated in Linear.\" and Try again, an issue closed in Linear shows done with every session closed and Reopen, and offline shows the StatusLine while every control still works"
slice_type: "Linear's states on the work rows; risks a failed write drawn red or reverting the row, a waiting item still offered as Next, Waiting decided by colour or status type instead of statusEffect, and offline disabling controls"
non_negotiables:
  - "Waiting is statusEffect's \"waiting\"; a waiting item is never Next (D-USE-78)."
  - "A failed write keeps the row's Synapse state; its line is ink with an info icon, never red and never a miss (C-USE-today-linear-failed-1)."
  - "Closed in Linear closes the task and every session of it (D-USE-97, D-USE-115)."
  - "Offline, every control works and firing and work time keep counting (C-USE-today-offline-1)."
  - "Composes USE-10's WorkRow and LinearStatusShape; the status word always beside its shape; preset tokens only."
  - "Reads through useLinear and useTodayWork; nothing here imports lib/fixtures or tRPC."
devs_call: "Where the row's sub-line slot sits (under the meta); the spinner (@syn/ui Spinner); the online signal (lib/hooks/use-online)."
cites:
  - "specs/web/epics/USE-daily-use/ux/work/today/states/waiting.md"
  - "specs/web/epics/USE-daily-use/ux/work/today/states/linear-failed.md"
  - "specs/web/epics/USE-daily-use/ux/work/today/states/linear-updating.md"
  - "specs/web/epics/USE-daily-use/ux/work/today/states/offline.md"
  - "C-USE-today-waiting-1"
  - "C-USE-today-waiting-2"
  - "C-USE-today-waiting-3"
  - "C-USE-today-linear-failed-1"
  - "C-USE-today-linear-updating-1"
  - "C-USE-today-linear-updating-2"
  - "C-USE-today-offline-1"
  - "D-USE-78"
  - "D-USE-97"
waiver: "Waiting is drawn here; the Linear failed, Linear updating and offline states are folded in because each is one line on the same work row from the same outbox."
truth_files: "none: promotion carries work/today/"
qa: Q1
reviewers:
  - assay
focus:
  - "waiting, Linear failed, Linear updating and offline at 402 against work/today/captures/ (assay)"
operator_review: false
planned_paths:
  - "apps/web/app/(shell)/today/_components/"
  - "apps/web/components/work/"
  - "apps/web/lib/data/use-today-work.ts"
  - "apps/web/lib/data/today-linear.test.ts"
  - "apps/web/lib/fixtures/"
  - "specs/web/epics/USE-daily-use/tickets/USE-063-today-linear-offline/evidence/"
depends_on:
  - "USE-4"
  - "USE-7"
  - "USE-10"
  - "USE-56"
  - "USE-57"
  - "USE-59"
out_of_scope:
  - "Changing a status (the Item sheet's chip and the status sheet): USE-66"
  - "Replaying offline writes in order on reconnect (C-USE-today-offline-2): the offline persistence ticket (C4)"
  - "The real outbox and sync: the Linear wiring (wave 3)"
criteria:
  - id: C1
    statement: "An item whose status statusEffect reads as waiting leaves its tier for Waiting and is skipped by Next; when its status leaves those three it returns to its tier and place"
    evidence: test
    command: "yarn test"
  - id: C2
    statement: "At 402 Waiting sits at the block's foot under \"Waiting · nothing to do until it moves\", each row's title muted with its status shape and word on the right; every tier heading keeps its square and word, Stretch slate"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-063-today-linear-offline/evidence/waiting-402.png"
  - id: C3
    statement: "At 402 a failed write shows \"Not updated in Linear.\" and Try again under the row in ink with an info icon, the row's state unchanged"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-063-today-linear-offline/evidence/linear-failed-402.png"
  - id: C4
    statement: "At 402 a write in flight shows \"Moving to In progress in Linear…\" with a spinner; an issue closed in Linear shows the row done with \"Done in Linear at 10:12 · all its sessions close\" and Reopen"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-063-today-linear-offline/evidence/linear-updating-402.png"
  - id: C5
    statement: "At 402 offline shows the StatusLine \"Offline. Everything works here; Linear catches up when back online.\" with the tiers, the running card and firing still live"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-063-today-linear-offline/evidence/offline-402.png"
  - id: C6
    statement: "The web app type-checks"
    evidence: check
    command: "yarn check-types"
  - id: C7
    statement: "The web app lints clean"
    evidence: check
    command: "yarn lint"
---

# Contract — today-linear-offline

## Build notes

Wave 2, after USE-59 and the Linear fixtures. Match `ux/work/today/captures/waiting-402.png`, `linear-failed-402.png`, `linear-updating-402.png` and `offline-402.png`.

- **Decisions that apply:**
  - D-USE-78: Blocked, Paused and In review leave the tiers for Waiting at the block's foot, at both widths; the row's lead slot stays the firing ring; status changes on the Item sheet's chip.
  - D-USE-35: a status is its shape in the workspace's colour with its word.
  - The data contract: Synapse's value is written first and stands; a failed row shows "Not updated in Linear." with Try again. D-USE-113: the outbox writes status, done, reopen, priority and description.
  - D-USE-97, D-USE-115: an issue whose state is completed, canceled or duplicate is closed; a sync that finds a placed issue closed closes the task and every session.
  - Words: "Waiting · nothing to do until it moves"; "Not updated in Linear."; "Try again"; "Moving to <status> in Linear…"; "Done in Linear at 10:12 · all its sessions close"; "Reopen"; "Offline. Everything works here; Linear catches up when back online."
  - Announced (polite): "Not updated in Linear."
- **Interfaces:** `useTodayWork` passes `waiting` rows apart and a `linearLine` per row (`updating` with its target, `failed` with retry, `closed` with time and reopen) from `useLinear`. `WaitingGroup` and `LinearRowLine` in `components/work/`.
- **Per path:** `today-linear.test.ts` holds C1. Scenarios `today-waiting`, `today-linear-failed`, `today-linear-updating`, `today-offline`.
- **Gotchas:**
  - Reopen writes `undone` for the slot and a `reopen` outbox row; the issue goes back to `linear_prev_state_id`.
  - Try again resends the same outbox row; it never writes a second one.
  - Offline is a scenario that never resolves writes; nothing is disabled.
- **Model:** Opus 5.5 at medium. A smaller model reverts the row on failure, paints the line red, or keeps a waiting item as Next.
