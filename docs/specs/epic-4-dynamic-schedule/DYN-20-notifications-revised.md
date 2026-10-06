# DYN-20 — Notifications revised

**Epic:** DYN — Dynamic schedule (UX v1.1) · **Phase 1** · Size: M
**Slice type:** The scheduler's catalogue and timing — a privacy surface with a timing rule. The risk class is *a push before the pick* (anything derived from the pick firing while `confirmed_at` is null) and *payload privacy* (a sentence on a lock screen that is not a time the person set).
**Vigil:** enqueue-at-pick (no N1a/N1b before `confirmed_at`), grouping, quiet after Day Complete, payload text per v1 §8.1. **Vesper review:** the four sentences and the *Every item in…* group.

**Status:** Complete (2026-09-13 — authored and built in one thread, with DYN-9 and DYN-16; one `notifyStarts` job over the four start kinds grouped by the minute, gated on `confirmed_at` for everything the pick derives; the three payload builders; `item_start` per block in `list-prefs` and ST-07's *Every item in…* group; the four root commands pass; the timing edges are read from the code, not observed — logged in `DEVIATIONS.md`)

**Owner:** Reeve (spec) → dev (build) · **Reviewer:** Vigil (timing, grouping, quiet, payloads), Vesper (copy), Mason (the delivery constraint)

## Outcome

Per v1.1 §9: **`block_start`** (N1a, on) at each block's `scheduled_start` after the pick — prep, training when placed, work (the anchor), break, activity, wind-down; never orient or morning (the person just woke; the frame is what they open) — in the block's own name (*Before work · 8:15*, *Work · 9:00*, *Wind-down · 22:00*). **`item_start`** (N1b) opt-in **per block** (`notification_prefs.block_kind`) rendered under *Every item in…*. **`fixture_start`** (N1c, on) for any pinned item or fixture, on a set or unset day. **`devices_off`** (N1d, off): *Phone away · 22:15*. No wake push, no orient push, no journal push. Same-minute starts of any of the four kinds collapse into one push. N4–N8 unchanged. ST-07 renders the new rows and the per-block group.

## Why / intent

- **§9.1** — the table; **§9.2** — *"Nothing derived from the pick exists before the pick, so N1a/N1b enqueue at `days.confirmed_at`; fixtures (N1c) enqueue at week build. On an unconfirmed day at 9:00, the only push that fires is a fixture's."*; **§9.3** — *"N1b renders as a group of block-kind toggles under one heading Every item in… Quiet after Day Complete stays on and non-editable."*; **R19**.
- **v1 §8.1, §8.3, §8.5, §8.6 stand** — a scheduled fact in the person's words; never a miss, a count, a streak, or the second person.
- **Ground truth (consumed, never rebuilt):** DYN-1's `NOTIFICATION_CATALOGUE` rows 10–12 and the `notification_kind` enum; DYN-3's `notification_prefs.block_kind` with the `NULLS NOT DISTINCT` unique; DYN-5's `enqueueBlockPushes` seam and `day_blocks`; USE-8's `deliverOnce` (the unique claim), `forEachUser`, `resolveTodayFor`; SET-1's merge rule in `list-prefs`.
- **What this slice is NOT (binding):** a queue (see the first ruling); a wake, orient, or journal push; N7/N8 (Phase 2); any change to N4–N6.

**Rulings this slice makes (labelled, logged):**

- **The delivery model stays a scan, and "enqueued at the pick" is a condition on the scan.** USE-8 delivers by scanning each fifteen-minute window and claiming `(kind, target, scheduled_for)` rows; DYN-5's stub said a queue would be a second delivery model. So `block_start` and `item_start` scans require `days.confirmed_at IS NOT NULL` — nothing the pick derives can fire before it — and `enqueueBlockPushes` reports how many block boundaries lie ahead of the pick rather than writing anything. Logged in `TECHNICAL-DECISIONS.md`.
- **One job, four kinds, grouped by the minute.** `notifyStarts` replaces `notifyItemStart` in the registry: it gathers the window's candidates of all four start kinds, groups by the scheduled minute, claims every candidate's delivery row, and sends one payload per minute that has at least one claimed, on-time candidate. A group of one is that kind's own sentence; a group of many is the titles joined with the time, no actions. Logged.
- **`fixture_start` is any pinned item or fixture** (`pinned = true` or `origin = fixture`) that is fixed-time, assigned and upcoming — on an unconfirmed day too. The devices-off marker is excluded from it by shape (`findDevicesOffMarker`) and is `devices_off`'s alone. Logged.
- **`item_start` reads `(item_start, block_kind)` rows only**; a non-pinned fixed-time item with no block never fires under it, and a `(item_start, null)` row — the v1.0 switch — is ignored by the scan. `listNotificationPrefs` returns `itemStartBlocks` for the seven kinds with items (orient excluded); `setNotificationPref` gains `blockKind`. Logged.
- **`block_start` fires for `planned` and `set` blocks with a `scheduled_start`** — a `not_today` block never, a `pooled` block never (it has no start until the pick). The title is the block's template name snapshot, else the kind's word. Logged.
- **The block kind's words move to `@syn/constants` (`BLOCK_KIND_WORDS`)**, and `@syn/ui`'s copy re-exports them, so the push and the band header cannot disagree. Logged.

## Experience & states

### Settings → Notifications — `settings/notifications/_components/notifications-screen.tsx`

Sections: **When a block starts** — *Block start* (`block_start`); *Pins and fixtures* (`fixture_start`); *Phone away* (`devices_off`). **Every item in…** — one `NotificationRow` per block kind with items (*Morning · Before work · Training · Work · Break · Activity · Wind-down*), each an `item_start` row keyed by block. **Reviews** and **Planning** as v1. The closing line stays: quiet after Day Complete, not editable.

### The pushes — `services/jobs/notify.ts`, `services/notifications/build-payload.ts`

`Before work · 8:15` (nothing beneath) · `Cold shower · 7:23` (the preflight note beneath, as v1) · `Stand-up · 9:30` · `Phone away · 22:15` · grouped: `Work · Stand-up · 9:00`. The tap lands on `/today`; a single item's push keeps v1's *Start* / *Done* actions; a block's, a fixture's, the marker's and a group's have none.

**Failure / edge states:** an unconfirmed day at 9:00 → the fixture's push only · confirming at 7:03 → prep, work, wind-down for today only (the scan reads today's blocks) · *Not today* on training → no push (state `not_today`) · `item_start` on for prep only → prep's items only · devices-off off by default · a closed day → nothing · a second scan of the same minute → `duplicate` on every claim, no send · a subscription that arrives Friday → past minutes claimed `skipped`, never sent.

## Non-negotiables (this slice)

- **Nothing the pick derives fires before `confirmed_at`.**
- **Every sentence is a time the person set, in their own words. No miss, count, streak, or second person.**
- **Exactly-once stays the unique constraint, never a job's carefulness.**
- **Quiet after Day Complete is a condition on every query.**
- **No new table, no queue.**

## Data & AI

**Schema changes: none.**

**Tables:** `notification_prefs` (read, upsert with `block_kind`), `notification_deliveries` (insert, update), `day_blocks`, `day_items`, `days`, `users` (read).

**Placement:** `services/jobs/{notify,run-scheduled-jobs}.ts`; `services/notifications/{block-pushes,build-payload,deliver,list-prefs}.ts`; `packages/validators/src/notification.ts`; `packages/constants/src/block-kinds.ts`; `packages/ui/src/composed/display/block-header/copy.ts`; `settings/notifications/_components/notifications-screen.tsx`; `components/reminder-prompt/copy.ts`. Rule 3, rule 9.

**tRPC / validators:** `notification.setPref({ kind, enabled, blockKind? })`; `notification.prefs` gains `itemStartBlocks`.

## Acceptance criteria (observable — local tier; the scheduler is `POST /api/jobs/scheduler`)

1. An unconfirmed day with a 9:00 fixture: the 9:00 scan sends the fixture's push and nothing for the work block. *(Vigil.)*
2. Confirming at 7:03 with prep at 8:15, work at 9:00, wind-down at 22:00: the three scans send *Before work · 8:15*, *Work · 9:00*, *Wind-down · 22:00*; no push for orient or morning. *(Vigil.)*
3. *Every item in… Before work* on: a prep item's minute sends *Cold shower · 7:23*; a morning item's minute sends nothing under `item_start`. *(Vigil.)*
4. Training set *Not today*: no push for it. *(Vigil.)*
5. *Phone away* off (default): no push at devices-off; on: *Phone away · 22:15*. *(Vigil, Vesper.)*
6. A block and an item at 9:00: one push, *Work · Stand-up · 9:00*, no actions. *(Vigil.)*
7. `grep -rn "you\b\|missed\|streak\|%" packages/api/src/services/notifications/build-payload.ts` finds only the header comment's never-list. *(Vesper.)*
8. `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` pass (four separate commands).

## Likely-relevant technical notes (ADVISORY — dev decides)

- `deliverOnce` claims and sends in one call; the grouped send wants a claim-then-send split — `claimDelivery` + `markSent`, with `deliverOnce` composed from them so N4–N6 are untouched.
- `findDevicesOffMarker` needs `templateSlotId`, `origin`, `type`, `pinned`, `scheduledStart` on the row — select them.
- The scan's window is `[now − 15 min, now)`; the block's `scheduled_start` is an instant already.

## Dev's call

The section headings' words · whether a group of many keeps the first item's URL or `/today` · the TTL for the three new kinds (fifteen minutes, as `item_start`).

## Out of scope

- **N7 Week Review ready, N8 Timer running** — Phase 2.
- **A per-item mute** — not in the document.

## Depends on

- **DYN-14** — `confirmed_at` and the pick. Complete in `PROGRESS.md`.
- **DYN-18** — the wind-down block and the marker. Complete in `PROGRESS.md`.
