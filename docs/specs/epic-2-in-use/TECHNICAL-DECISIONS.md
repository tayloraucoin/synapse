# Epic 2 — In Use — Technical Decisions (append-only)

One section per architectural choice that had real alternatives. Written when the decision is made. Format:

```
## YYYY-MM-DD · <ticket-id> · <the decision, as a statement>
**Context (as it was then):** …
**Options weighed:** A … B … C …
**Decision:** …
**Consequences:** what this buys, what it costs, what it forecloses.
**Revisit trigger:** the condition under which this should be reopened.
```

## 2026-09-05 · USE-1 · Item state is derived by one pure function, computed on the server for first paint and re-computed on the client every minute

**Context (as it was then):** `DayItemView.state` is an `ItemState` the row renders from. *Now*, *soon*, *open*, *closing*, and *passed* change with the clock; a list that only knows the state at fetch time shows *soon* forever.
**Options weighed:** A — the server computes `state` and the client refetches every minute. B — one function `deriveItemState(row, day, now, zone)` in `@syn/utils`, called by the API's view mapper for the initial payload and by a client hook `useDerivedItems(items, now)` on each minute tick, over the same view fields. C — the client alone derives state from raw rows.
**Decision:** B. A is a request a minute per open tab for a value the client can compute. C puts the only copy of the rule on the web client, which the future Expo app would have to reimplement — and the server needs it too, for the auto-close pass and the N1 job. One function, three callers, platform-pure by construction.
**Consequences:** Buys a row that is right to the minute with no traffic, and a rule that lives where the mobile app can import it. Costs the discipline that every field the function needs is on `DayItemView` (it is: times, mode, done, deferral, states) and a `useNow` tick at 60 s that the List owns. Forecloses storing state — which official §3.11 forbids anyway.
**Revisit trigger:** a state that depends on a fact not on the view (none foreseen).

## 2026-09-05 · USE-1 · Day boundaries are computed from the person's *effective* close time and zone, and every day row snapshots the pair it was created under

**Context (as it was then):** Cross-cutting §7.1: a Day is keyed by its calendar date in the stored zone and runs from `day_close_time` to `day_close_time`. Cross-cutting §7.3/§7.5: both settings change "from tomorrow". SET-1 gave `users` a pending-pair and `days` two snapshot columns.
**Options weighed:** A — compute everything from the live `users` columns. B — `resolveDayKey(now, zone, closeTime)` from the user's *effective* values (pending applied when its `from` date is reached), with each `days` row snapshotting `timezone` and `day_close_time` so past and future days are laid out under the rule they were planned with. C — store `window_start`/`window_end` instants on every day row.
**Decision:** B. A breaks the "from tomorrow" promise the moment a setting is saved. C stores what B computes and drifts when the snapshot changes. The pending pair is applied and cleared in exactly two places — the preferences read service and the scheduler's per-user pass — so a person who never opens the app still switches on the right day.
**Consequences:** Buys honest boundaries across a zone change and a close-time change. Costs an "apply pending" step in two services and the rule that a day's own zone, not the user's current one, formats its times. Forecloses nothing.
**Revisit trigger:** a third deferred setting (see Epic 1's decision on the pending pair).

## 2026-09-05 · USE-3 · The running timer's tick is a Zustand store; everything else about a timer is server state

**Context (as it was then):** `apps/web/lib/stores/README.md` sanctions exactly one Zustand store — the 1 Hz elapsed tick read by the row, the sheet, the document title, and (Phase 2) the persistent notification. A timer *session* is a row (`timer_sessions`), and starting one is a mutation.
**Options weighed:** A — Context providing `elapsedSec`, re-rendering the day list every second. B — a store holding `{ activeItemId, startedAt, pausedAccumulatedSec, status }` seeded from the day read model, with a single `setInterval` publisher; consumers select `elapsedSec` for one item. C — each consumer runs its own interval from `startedAt`.
**Decision:** B. A is the case the README names as wrong. C is four intervals for one fact and four clocks that drift apart by a second. The store holds only what is derivable from the session row plus the clock; it is never the source of truth for whether a timer exists — the mutation and the query are.
**Consequences:** Buys a list that does not re-render on the tick and a document title that can show the elapsed time. Costs one store file and the rule that the store is re-seeded from the query on every refetch (a second device's start shows up on refetch, cross-cutting §6.4). Forecloses nothing.
**Revisit trigger:** a second high-frequency fact (none foreseen in Phase 1).

## 2026-09-05 · USE-8 · Notification payloads are built by one function from the catalogue, and the scheduler scans a 15-minute window with an idempotency key per (user, kind, target, minute)

**Context (as it was then):** INF-9 shipped the cron route, `sendToUser`, and a content-free `WebPushPayload`. Official §8.1: a notification is a scheduled fact in the person's own words, delivered once. §8.2's grouping rule. §8.4: quiet after Day Complete. The cron runs every 15 minutes, so a scan must not send twice for the same minute across overlapping windows.
**Options weighed:** A — each job queries "due since last run" and trusts the cron's cadence. B — a `notification_deliveries` table (service-role only) keyed on `(user_id, kind, target_id, scheduled_for)`, inserted before send with `ON CONFLICT DO NOTHING`; the insert's success is the permission to send. C — a `sent_at` column on `day_items` per kind.
**Decision:** B, with the table added by USE-8 as migration `0003` (logged deviation; a human applies). A double-sends on any retry or overlap, which is the one failure §8.1 forbids. C spreads delivery bookkeeping across domain rows and has no home for N4/N5/N6, whose target is a day or a week, not an item.
**Consequences:** Buys exactly-once per target minute and one place to answer "was this sent". Costs a table that only the scheduler writes (and `serviceRoleOnlyPolicies` — its first real use) and a `0003` migration. Forecloses nothing.
**Revisit trigger:** the scan's runtime approaching the function timeout (INF-9's own trigger), at which point enqueue and send split.

## 2026-09-05 · USE-6 · The shift's fit is one pure function, previewed by the client and recomputed by the server before writing

**Context (as it was then):** SF-01's step 3 shows the consequence of a shift before it is applied: which soft items overflow a hard anchor or the day's end, with cuts pre-selected lowest first. The day can change between preview and apply (an item done, a timer started).
**Options weighed:** A — compute on the client from the cached day and trust the client's cut list. B — `shift.preview` and `shift.apply` both call one pure `computeShiftFit` in `@syn/utils`; apply recomputes and refuses with `CONFLICT` if the day changed since the preview. C — server-only, with the sheet round-tripping on every checkbox.
**Decision:** B. A writes cuts the server never checked, which is how a done item gets cut. C is a request per tap on the one screen where the person is already late. One function, two callers, and the same shape USE-7's trim uses.
**Consequences:** Buys a preview that is exactly what will be written and a place (`@syn/utils/day/`) the mobile app imports. Costs a staleness check on apply and the rule that undo subtracts the shift's own delta from the still-movable set rather than replaying a stored list. Forecloses nothing.
**Revisit trigger:** per-field offline reconciliation (Phase 2), when a shift made offline must merge with a day changed elsewhere.
