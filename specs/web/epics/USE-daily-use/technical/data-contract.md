---
epic: USE
status: ratified
role: Mason
support: Warden
---

# Data contract

Fresh tables, shaped like the ledger's records (`ux/dev-notes/blocks-and-todos-model.md`): Block, To-do, Slot and Event, with Work following the same pattern (D-USE-31). The old tables stay in the database untouched. New code reads none of them except `users`, `user_avatars`, `web_push_subscriptions`, `notification_prefs` and `notification_deliveries`. A ticket that needs another (the journal, Orient's passages) names it in its Build notes.

All rules here:

- Every new table is owner-private and deny-by-default, through `ownerPrivateCrudPolicies`, and is reached only through `ctx.rls.execute()`.
- Columns follow `docs/architecture/drizzle-orm-conventions.md`.
- Migrations make only additions. `0012_use_daily` holds the planner and work tables (USE-2). The `linear_*` and `google_*` tables come in the next migration, with the Linear connect ticket (Tickets gate, 2026-10-13; [calls.md](calls.md)). Taylor runs each on staging; no agent runs a migration anywhere.

## The planner

| Table           | Holds                                                                                                                                                                                                                                                                                                                                                                                                        |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `blocks`        | `kind` (`block_kind`; the enum gains `wellness`, `life`, `todos`, `evening`, and the validator narrows new input to the ledger's seven); `name`, `icon`; `starts_at`, `ends_at` (wall clock in `users.timezone`); `rrule` (RFC 5545, one rule, D-USE-80) or `on_date` (This week only); `fill` (`set_items` \| `tasks_for_the_day` \| `from_todos`); `checklist` (no times); `meal`; `notify`; `archived_at` |
| `block_changes` | A dated exception to a repeating block, as Google keeps them: `block_id`, `on_date`, and either new `starts_at`/`ends_at` or `skipped`. This is how This week differs from the usual week. Reset to usual deletes the row; Copy from writes rows.                                                                                                                                                            |
| `block_items`   | A block's set items (Wellness, Training, Life, Set work): `title`, `icon`, `length_min`, `at_time` (nullable), `sort_order`                                                                                                                                                                                                                                                                                  |
| `todos`         | `title`, `icon`, `length_min`, `type` (`home` \| `errand` \| `call` \| `digital` \| `other`), `on_date` (none means the pool), `rrule`, `remind_at` (a daily reminder is a to-do with a daily rule and a time), `notes`, `done_at`, `archived_at`                                                                                                                                                            |
| `slots`         | The join: exactly one of `block_item_id`, `todo_id` or `work_item_id`, plus `block_id`, `on_date`, `sort_order`, `tier` (`urgent` \| `primary` \| `secondary` \| `stretch`, only with a work item), `length_min`, `done_at`, `took_min` (a plain Done's Change, D-USE-13). Unique `(work_item_id, on_date)`: one item, one block a day.                                                                      |
| `day_events`    | A Synapse event: `on_date`, `starts_at`, `ends_at`, `title`, `icon`. Never a slot; it pins inside whichever block its time falls in.                                                                                                                                                                                                                                                                         |
| `day_records`   | One row per date that has been opened: `oriented_at`, `ready_at` (Ready, go), `closed_at`. Orient's own writes are settled by the Orient ticket.                                                                                                                                                                                                                                                             |

- A **day is read, not built**. Expand every block's rule for the date, apply `block_changes`, then join the slots. A set item's slot is written on first touch (start, check or edit), never ahead of time.
- An **undone slot whose block has ended** reads as returned, so its to-do is back in the pool with no job to run (D-USE-74). The pull rule fills a To-dos block oldest first, any type, at go.
- A **session** is one work slot on one day. "Session n of m" is counted on read. A session's Done is the slot's `done_at` and never the task's (D-USE-57, D-USE-65).

## Work

- **`work_items`** is the pool. Columns:
  - `title`, `icon`, `notes`
  - `size` (`quick` \| `small` \| `medium` \| `large` \| `huge`; null means unsized), `length_min_min`, `length_max_min`
  - `due_on`, `client_id`
  - `parent_work_item_id` (a sub-issue: checked inside its issue as the child's `done_at`, or placed on its own as a slot)
  - `linear_connection_id`, `linear_issue_id`, `linear_identifier`, `linear_prev_state_id`
  - `done_at`, `done_source` (`synapse` \| `linear`), `archived_at`

  The task is done when Taylor marks it done or Linear closes it, and every open session closes with it.

- **`clients`**: `name`, `color_key`, `sort_order` (Taylor's drag order, which is also client priority, D-USE-42), `archived_at`. **`users` gains `clients_enabled`**, default false. One pure function resolves an item's client: the item's own, then its project's, then its workspace's.

## The clock: events, never a ticking number

**`slot_events`** is append-only: it has insert and select policies, and no update or delete. Columns:

- `slot_id`
- `kind`: `started` \| `paused` \| `resumed` \| `prompt_sent` \| `brought_back` \| `done` \| `undone` \| `day_closed`
- `at`: the device's time
- `client_event_id`: unique per user, so a replay is a no-op
- `step_away_id`: the tag Resume all reads
- `received_at`

It is indexed on `(slot_id, at)`. It covers every timed slot, work and not, so one clock serves Now, Running and Today.

- **Derivation.** One pure function, `deriveClock(events, dayWindow)`, sorts by `at`, then `received_at`. Every device runs it, and so does the server.
  - Work time is the sum of the spans opened by `started` or `resumed` and closed by `paused`, `prompt_sent` or `done`.
  - Firing runs from `prompt_sent` to `brought_back`, `done` or `day_closed`. Bringing an item back never opens a work span (D-USE-44).
- **The function is total.** Any sequence of events yields one valid state:
  - inside a Work block, a `started` closes any other open work span at its own `at` (one in hand, D-USE-43);
  - outside a Work block, several items can run at once (D-USE-27);
  - a `done` wins over a later `paused`;
  - a duplicate is ignored.

  Devices resolve conflicts by event time, never by arrival.

- **Step away** writes one `paused` per running item, all sharing one `step_away_id`. Resume all resumes exactly those items (D-USE-46).
- **The day's close** (C11) is derived, not written. Spans still open at `users.day_close_time` (03:00 by default) end there. The item stays in its tier, and nothing shows in the UI.
- **Done** reads "Took <work> · fired <firing>", per session. Neither number is ever written to Linear.

## Linear and Google

- **`linear_connections`**, one per workspace: `organization_id`, `name`, `url_key`, `logo_url`, the token and refresh token as ciphertext (C5), `token_expires_at`, `scopes`, `client_id` (when all projects belong to one client), `per_project`, `last_synced_at`, `last_sync_error`. Only `services/linear/` reads the token columns, and it names each column it selects. They never reach a browser.
- **`linear_snapshots`**: `connection_id`, `fetched_at`, and `payload jsonb` holding the assigned issues, sub-issues, teams, projects and workflow states. The payload is parsed by the zod schema in `@syn/validators`, so Linear's shape stays out of our tables. Placing an issue creates its `work_items` row.
- **`linear_project_clients`** maps `(connection_id, project_id)` to `client_id`.
- **`linear_writes`** is the outbox, with `kind` = `status` \| `done` \| `reopen` and `state` = `pending` \| `sent` \| `failed`.
  - Synapse's value is written first, and it stands. A `failed` row shows as "Not updated in Linear." with Try again.
  - Checking an item moves the issue to the team's first completed state. Unchecking moves it back to `linear_prev_state_id`.
- **Sync is polling**, because webhooks need a workspace admin. It runs on opening the pool, on focus when the last sync is older than two minutes, every five minutes while the app is visible, and on Sync now. A sync that finds a placed issue closed closes the task and every session (D-USE-97). The fields and the flow for connecting several workspaces come from `docs/research/platform-apis/linear-api.md`.
- **Google**: `google_accounts` (a ciphertext refresh token), `google_calendars` (`enabled`), and `google_event_snapshots` (per account and week). The rules: read-only, several calendars, each on or off. An event answered yes is a band. Maybe or not answered is a dashed band with Add to day. An event answered no is hidden. Details come from `docs/research/platform-apis/google-calendar-api.md`.
- **Never written out**: clients, firing, work time and a session's Done are never written to Linear. Nothing is ever written to Google.

## Push and reminders

`notification_kind` gains `todo_reminder`. A block with `notify` uses the existing `block_start`. Both ride the existing scheduler, which now runs every 5 minutes (C12), together with the push pipeline and `web_push_subscriptions`, on the phone and at the desk. The "While it fires" line is a pure pick: the first undone daily reminder, shown only while something is firing.

## Where state lives

| State                                          | Where                                                                        |
| ---------------------------------------------- | ---------------------------------------------------------------------------- |
| Every record                                   | Postgres, through tRPC. TanStack Query is the only cache.                    |
| The open sheet, the day, the week, every state | The URL (`?sheet=`, `/days?week=&day=`, `?state=`)                           |
| The ticking figure                             | Derived each second in `useWorkClock`, never stored                          |
| Offline writes and the last-read data          | IndexedDB, through TanStack's persister, replayed in order on reconnect (C4) |
| One-time hints and remembered toggles          | `localStorage`, through the existing hooks                                   |

## Validation at the boundary

Every router input is a zod schema from `@syn/validators`. An event's `at` must fall inside its slot's day window and be no more than two minutes past the server's now. A replayed event keeps its own `at`, so it passes the same test hours later. Linear's and Google's payloads are parsed, never trusted: an unknown field is dropped, and a missing required field fails the sync, with `last_sync_error` set.
