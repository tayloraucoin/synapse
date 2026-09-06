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

---

## USE-2 — the optimistic patch re-derives, and the minute tick preserves identity

**Context:** Two requirements pull against each other. Done must be instant — no spinner, no wait (Epic 2 §0.1). And every row state has to track the clock, so a row that says *soon* stops saying it fifteen minutes later. Both touch the same rows, sixty times an hour.

**Options:**

- **A. Patch `doneAt` optimistically; let the refetch fix the state.** Simplest, and wrong for the length of a round trip: the row reads *now* with a checkmark on it.
- **B. Re-derive on the client only, and treat the server `state` as a first-paint hint.** One authority, but two implementations of the precedence rules unless the same function runs in both places.
- **C. One `deriveItemState`, called by the server for the first paint and by the client on every patch and every tick, with object identity preserved when nothing changed.**

**Decision:** C. `deriveItemState` is already the one implementation (USE-1); the work here is calling it in the two client moments that need it — the optimistic patch, so the row is indistinguishable from the real one before the server answers, and the minute tick, so a state that is a fact about a clock keeps up with the clock.

Identity is the part that is easy to miss. `useDerivedItems` returns the SAME item object when its state has not changed, and the reassembly returns the SAME day object when no item changed. Without that, every minute would produce a new object for every row and React would repaint a thirty-row list sixty times an hour to display exactly what it already displayed.

**Consequences:** A tick that moves nothing costs one comparison per row and no render. Probed over nine ticks against a three-row day: five rebuilt, four returned the identical object, and rows in untouched parts kept identity across every rebuild. The cost is that the reassembly addresses items by index across three collections in a fixed order, so the flatten and the rebuild must walk them in the same order — they are adjacent in the file for that reason.

**Revisit trigger:** a row field that changes on the tick without changing `state` — a live countdown, say. That would break the identity shortcut, and the answer would be to isolate the ticking field in its own component rather than to widen what the tick rebuilds.

---

## USE-3 — the session row is the truth and the store is a display

**Context:** A timer has to tick at 1 Hz in four places, survive a closed sheet, a reload, and a second device, and end correctly when the day auto-closes. Those are two different jobs: publishing a number quickly, and knowing whether a timer exists at all.

**Options:**

- **A. The store owns the timer.** Fast, and wrong on the second device, on reload, and whenever the auto-close pass ends a session the browser never heard about.
- **B. The query owns everything, polled.** Correct and unusable: a number that moves once per refetch does not read as a timer.
- **C. The session row is authoritative for EXISTENCE; the store is authoritative for DISPLAY, and is re-seeded from the server on every refetch.**

**Decision:** C, which is what the ticket rules and what the store README anticipated when it named this the first Zustand store the product would earn. The split is the whole design: `timer_sessions` answers "is something running and how much is logged", and the store answers "what digits do I draw this second".

`seed` REPLACES the map rather than merging it, and that is the load-bearing detail. A timer ended on another device, or closed by the auto-close pass, is simply absent from the next read model — merging would leave it counting up here forever against something nobody is doing, which is the exact failure this arrangement exists to prevent.

Starting is idempotent for the same reason: two devices starting one item must produce one session, so the service returns the open one rather than opening a second.

**Consequences:** A tick re-renders only what subscribes to that item id, so a thirty-row list costs one row per second rather than thirty. The cost is a window between a server change and the next refetch where the store is stale — bounded by the query invalidation the mutations already trigger, and always resolved in the direction of the server.

**Revisit trigger:** offline timing. Phase 2 has offline writes; a timer started with no connection has no session row to be authoritative, and the answer would be a local queue that becomes a session on reconnect — not a store that decides for itself.

---

## USE-8 — exactly-once is a database constraint, not a job that is careful

**Context:** The scheduler runs every fifteen minutes over a fifteen-minute window. Ticks fire late, overlap, retry after a timeout, and occasionally run twice. Official spec §8.1 promises each notification is "delivered once".

**Options:**

- **A. A `sent_at` column on the thing being notified about** — `day_items.notified_at`. One column, no new table.
- **B. Careful jobs**: check before sending, narrow the window, trust the cron.
- **C. A `notification_deliveries` ledger with a unique key on `(user, kind, target, minute)`, inserted before the send.**

**Decision:** C. A does not survive contact with the second kind: N4 is about a day, N6 is about a WEEK, which has no row to hang a column on, and N4 can legitimately fire twice for one day once *Later* defers it. B is the version that works in testing and fails at 3am on the night the cron double-fires — nothing in it makes a second send impossible, only unlikely.

The insert IS the claim. A job sends only when its `ON CONFLICT DO NOTHING` returned a row, so two overlapping scans race the constraint rather than racing each other, and the loser sends nothing without needing to know it lost.

**Three details that carry weight:**

- **`NULLS NOT DISTINCT`.** Postgres treats NULLs as distinct in a unique key by default. Every N6 row has a null `target_id`, so without this the Sunday reminder would be the one kind with no protection at all — the failure would be invisible until somebody was told twice about the same week.
- **A row is written even with no subscription.** Otherwise installing the app on Friday would replay every past-due minute of the week that evening, as the first scan found them all unsent.
- **Too late is recorded and dropped.** §8.1 says "at the time assigned"; a 7:00 reminder arriving at 7:40 is noise about something the list already shows as passed. The `skipped` row is what answers "why was I not told".

**A pref that is off writes nothing at all** — not a skipped row. That is not a delivery which did not happen; it is a notification the person declined to have, and a ledger of things somebody switched off would be a log of their preferences rather than bookkeeping about messages.

**Consequences:** The table grows by roughly one row per notification per person. It is service-role only and nobody reads their own; it can be pruned on any schedule without affecting correctness, since a pruned row for a past minute can never come due again.

**Revisit trigger:** a notification that should repeat within one minute, or a kind whose target is neither a row nor a key. Both would need the key widened, and widening it is the moment to check that every existing kind still collides where it should.

---

## USE-4 — an undo restores what was there, not something that looks like it

**Context:** *Remove* on a one-off offers five seconds of undo. `timer_sessions` and `misses` both cascade from `day_items`, so a delete takes them silently.

**Options:**

- **A. Soft-delete the item** — a `removed_at` column, undone by clearing it. Nothing cascades because nothing is deleted.
- **B. Restore the row and accept the loss** of its sessions.
- **C. Capture the dependents before the delete and re-insert them with the item.**

**Decision:** C. A puts a nullable column on the hottest table in the product and adds `removed_at IS NULL` to every query that reads a day — one forgotten predicate and a removed item reappears in a list, a count, or a review. The cost is paid forever by code that has nothing to do with undo.

B is the tempting one, and it is quietly wrong. The item comes back looking correct while the time somebody spent on it is gone — a record that is missing something without saying so, which is the one failure this product cannot have. AC7 names it directly.

C keeps the delete a real delete, so the id is free and the restore can reuse it. That matters beyond tidiness: a notification deep link, an open sheet, and tomorrow `carried_from_item_id` all point at that id, and a new one would leave every one of them pointing at nothing.

**Consequences:** `removeOneOff` returns a bundle rather than a row, and the undo payload is larger. The bundle is typed against the schema (`$inferSelect`) rather than as loose records, so a column added later travels with the undo automatically instead of being dropped by a hand-written shape.

**Revisit trigger:** a fourth thing that cascades from `day_items`. The bundle would need it, and nothing in the type system says so — a new cascade is the moment to re-read this.
