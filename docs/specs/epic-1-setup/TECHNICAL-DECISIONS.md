# Epic 1 — Setup — Technical Decisions (append-only)

One section per architectural choice that had real alternatives. Written when the decision is made. Format:

```
## YYYY-MM-DD · <ticket-id> · <the decision, as a statement>
**Context (as it was then):** …
**Options weighed:** A … B … C …
**Decision:** …
**Consequences:** what this buys, what it costs, what it forecloses.
**Revisit trigger:** the condition under which this should be reopened.
```

## 2026-09-05 · SET-1 · The whole official-spec §3 schema lands in one migration, owned by Epic 1

**Context (as it was then):** INF-5 shipped `users` and `web_push_subscriptions` only and left every domain table to "the feature epics' tech spec". Three epics each need a subset; Epic 2 renders `day_items` that Epic 1's week build creates; Epic 3 reads `misses` that Epic 2's shift writes.
**Options weighed:** A — one migration carrying all of §3, in the first feature ticket. B — one migration per epic, each `ALTER`ing the last (Epic 1 adds `days`/`day_items` without timer or miss columns; Epic 2 adds them). C — a separate "domain" track holding only the schema.
**Decision:** A, as SET-1. Official §0.3 R4 says the schema is shaped for every phase from day one; B produces three one-way doors where one will do and a `day_items` shape that changes under Epic 2's feet. C adds a fifth folder for one ticket and the founder asked for four.
**Consequences:** Buys one migration to review and one `SCHEMA_REFERENCE.md` every later ticket cites. Costs a large first ticket (L) and columns that sit empty until Epic 2 and 3 arrive. Forecloses nothing — a later column is a normal migration with a deviation line.
**Revisit trigger:** a Phase-2 need (calendar import, offline sync) that wants a column §3 did not anticipate.

## 2026-09-05 · SET-1 · `week_plans` is derived, not stored

**Context (as it was then):** Official §3.6 lists `WeekPlan { week_start_date, status, days[] }`. Every consumer (WK-01, N6, RV-00's "this week") can compute status from the week's `days`: planned if any day has a template or a one-off, else unplanned.
**Options weighed:** A — create the table as written. B — derive status; no table. C — create the table with status as a generated column.
**Decision:** B. A row whose only content is derivable is a second home for one fact, and the first bug is a week that says *planned* after its last template was removed. `WeekPlanStatus` stays in `@syn/types` as the derived value's type.
**Consequences:** Buys one fewer table and one fewer write on every week-build change. Costs a small aggregate query where a flag read would have been. Forecloses nothing — if a week ever needs its own attribute (a note, a theme), a `weeks` table is a normal migration.
**Revisit trigger:** the first attribute of a week that is not derivable from its days.

## 2026-09-05 · SET-1 · The wake anchor lives on `users.wake_anchor_habit_id` only

**Context (as it was then):** Official §3.1 has `users.wake_anchor_habit_id`; §3.3 has `habits.is_wake_anchor` "at most one per user". INF-5 already shipped the user column as a bare uuid awaiting its foreign key.
**Options weighed:** A — both columns, kept in sync by the service. B — the user column alone; `isWakeAnchor` derived at read time. C — the habit column alone with a partial unique index.
**Decision:** B. "At most one" is a fact about the person, not the habit; the user column enforces it structurally, and LB-02's "This replaces {other} as your wake-up habit" is a single-column update. `HabitSummaryView.isWakeAnchor` is `habit.id === user.wakeAnchorHabitId` in the view mapper.
**Consequences:** Buys one write on anchor change and no sync bug. Costs a join (or a second read) in the library list. Forecloses nothing.
**Revisit trigger:** none foreseen.

## 2026-09-05 · SET-1 · Every user-data table carries a denormalised `user_id`

**Context (as it was then):** `template_slots`, `day_items`, `timer_sessions`, and `misses` could derive their owner through a parent (`templates.user_id`, `days.user_id`). `ownerPrivateCrudPolicies` takes an owner column on the table itself.
**Options weighed:** A — owner via subquery in the policy (`EXISTS (SELECT 1 FROM days WHERE …)`). B — a denormalised `user_id` on every table, set by the service, matched by the policy directly.
**Decision:** B. A policy that subqueries another RLS-guarded table re-evaluates that table's policy on every row and is the shape `db-and-rls-authoring.md` warns will silently break under Realtime later. A direct column keeps every policy the same three lines and every table greppable for its owner.
**Consequences:** Buys uniform policies and a cheap index per table. Costs one column and one invariant per child table: the service writes the parent's `user_id`, never the caller's claim. Forecloses nothing.
**Revisit trigger:** none — this is the convention for the life of the schema.

## 2026-09-05 · SET-1 · Deferred settings use a pending-pair on `users`, applied at the next day boundary

**Context (as it was then):** Cross-cutting §7.3 and §7.5 say a time-zone switch and a day-close change take effect *from tomorrow*, so nothing on the current day jumps. A plain column update would reclassify "now" the moment it is saved — change the close from 03:00 to 05:00 at 04:00 and today's date flips backwards.
**Options weighed:** A — write immediately; accept the edge. B — `pending_timezone` + `pending_timezone_from` and `pending_day_close_time` + `pending_day_close_time_from` on `users`; every reader applies a pending value once the person's current day key is ≥ the `from` date. C — a settings-history table.
**Decision:** B. A is a real defect on a promise the document makes in words. C is a table for two fields. The read service (`services/user/preferences.ts`) applies and clears the pending pair on read; the scheduler's per-user pass does the same, so the switch happens even if the app is not opened.
**Consequences:** Buys the documented behaviour and a `days.timezone` / `days.day_close_time` snapshot that keeps past days honest. Costs four nullable columns and one "apply pending" step in two places. Forecloses nothing.
**Revisit trigger:** a third deferred setting, at which point C is the right shape.

## 2026-09-05 · SET-3 · Icon and avatar reads go through a session-gated streaming route, not signed read URLs

**Context (as it was then):** `IconValue.image` carries a storage path; `ItemIcon` and `Avatar` want a URL. The buckets are private. Every list of habits, every day, and the header render icons.
**Options weighed:** A — sign a read URL per path on every render (a batch procedure the client calls with the visible paths). B — a route handler `GET /api/assets/{bucket}/{userId}/{file}` that checks the session, checks the prefix, downloads with the admin client, and streams with a private cache header. C — a public bucket with unguessable names.
**Decision:** B. A path becomes an `<img src>` with no round trip, the browser caches per session for a day, and a URL is worthless without a cookie. A costs a signing call per list render and produces URLs that expire mid-session. C is a URL anyone who has seen it can fetch forever, which is not "only you can see your data".
**Consequences:** Buys zero-latency icon rendering and one place the storage read rule lives. Costs a server hop per uncached image and a second use of the admin client (both call sites are commented). Forecloses nothing — exports still use signed URLs because they open in the system browser without a cookie.
**Revisit trigger:** icon traffic that measurably loads the function, at which point a CDN in front of the route is the next step, not signed URLs.

## 2026-09-05 · SET-6 · One materialiser with one "untouched" predicate serves every write path

**Context (as it was then):** Four surfaces write a day's items from a template — apply, change the anchor, remove the template, re-apply after an edit (TP-04) — and each has a keep rule in the UX documents. Cross-cutting §8 says records are annotated, never rewritten.
**Options weighed:** A — one reconciling service keyed on `template_slot_id`, with a single exported predicate for "may be rewritten", used by all four callers and by SET-4's re-snapshot rule. B — four services, each with its own keep logic. C — delete-and-reinsert on every apply, guarded by "no touched items on the day".
**Decision:** A. B is the same rule in four places, which is the definition of drift. C throws away ids that notifications and deep links already point at, and a day with one done item becomes un-reapplyable.
**Consequences:** Buys one place to reason about the record's integrity and a predicate every later ticket reuses. Costs a reconciliation step (read, diff, update/insert/delete) instead of a bulk insert, and one nullable column (`template_name_snapshot`) so a touched item can still say where it came from after its template is removed. The anchor change is the one path that writes to touched rows, and only their two scheduled-time columns.
**Revisit trigger:** a second kind of source for items (calendar import) that needs its own reconciliation key.

## 2026-09-05 · SET-8 · `users.theme` is the cross-device theme source; next-themes is the per-device cache

**Context (as it was then):** INF-3 shipped next-themes with `localStorage` under `syn:theme`; INF-5 shipped `users.theme`. Two homes, unreconciled. Official spec §4.6 lists Appearance as a setting.
**Options weighed:** A — next-themes only; the column stays unused. B — the column is authoritative; a small client leaf applies it once per session and the control writes both. C — the column only, with the theme rendered server-side from the row (no flash-of-wrong-theme script).
**Decision:** B. A means a person who chose Dark on their phone gets Light on their laptop, which is a setting that does not sync — worse than no setting. C throws away next-themes' pre-hydration script and reintroduces the flash it exists to prevent.
**Consequences:** Buys a preference that follows the person. Costs one reconciliation leaf and the rule that the control writes both. Forecloses nothing.
**Revisit trigger:** a second per-device preference that should sync, at which point the leaf becomes a general "apply account preferences" step.

## 2026-09-05 · SET-10 · The export is built synchronously inside the mutation and served by a 24-hour signed URL

**Context (as it was then):** Official spec §7.6 describes an Edge Function and a download link; ST-10 describes preparing → ready with the size, and links that last 24 hours. A personal record is small.
**Options weighed:** A — build the zip inside `user.requestExport`, upload, mark ready. B — enqueue a job; the scheduler builds it within 15 minutes. C — stream the zip straight from a route handler with no storage.
**Decision:** A. B makes *Preparing your export…* last up to a quarter of an hour for a few hundred kilobytes. C has no "ready, {size}" state and no 24-hour link, both of which the document names; it also runs the whole-account read on every download.
**Consequences:** Buys the documented states with one mutation and one scheduled expiry job. Costs a function invocation that does real work (seconds, not minutes) and a hard dependency on the account staying small enough to zip in memory. Forecloses nothing — B is the fallback when the revisit trigger fires, and the row shape already supports it.
**Revisit trigger:** an export that takes over 30 seconds or exceeds 50 MB.

## 2026-09-05 · SET-1 · Enum/union parity is enforced by the type system, not by review

**Context (as it was then):** SET-1's non-negotiable is "enum spelling is `@syn/types`'" — a value the database stores and a value a component chooses must be the same string. Fourteen new `pgEnum`s were being written against fourteen unions in `packages/types/src/domain/domain.ts`, by hand, in one sitting. A single character's drift produces a database that stores `task_apointment` and a UI that can never match it, and nothing fails until a row exists.

**Options weighed:** A — write carefully and catch it in the migration review (what the ticket assumed). B — a runtime assertion in a test or a startup check. C — a compile-time identity function, `enumValues<Union>()(tuple)`, that constrains the tuple to the union's members and requires the tuple to cover the union.

**Decision:** C, in `packages/db/src/schema/enum-values.ts`. Constraints are only real when tooling enforces them, and the cheapest enforcement point that works here is the type system — above lint, above review, and available with no new dependency and no runtime cost (the function returns its argument). B was ruled out on the track's own terms: there are no tests during slices, and a startup assertion fails after deployment rather than before commit. A is the option that has already failed everywhere it has been tried, because the reviewer reading fourteen enums is the same person who just wrote them.

**Consequences:** Buys a red `check-types` for both failure modes, verified by inducing each: a typo fails at the declaration with the correct spelling in the message; an omission puts a `MISSING_ENUM_VALUE` sentinel in the column's type and fails at the first insert of a real value. Costs one 30-line file and a wrapper call on each `pgEnum`, which is visible noise in the schema. It also means a union in `@syn/types` and its enum are now genuinely coupled: removing a member from a union is a compile error in `@syn/db` until the enum follows, which is the point. Forecloses nothing — deleting the wrapper leaves fourteen ordinary `pgEnum` calls.

**Revisit trigger:** an enum that deliberately holds a value the union must not (none is foreseen — the two are the same vocabulary by definition).

## 2026-09-05 · SET-3 · Storage object policies are `RESTRICTIVE` denials, not permissive ones

**Context (as it was then):** Neither storage rail uses the Supabase storage client with a person's JWT — uploads go to a server-minted signed URL, reads go through a session-gated route using the service role. So no JWT-context object access should ever succeed, and SET-3's ruling was to write that down as policy "so a future JWT path fails closed".

**Options weighed:** A — no policies at all, relying on RLS being enabled on `storage.objects` with nothing granting. B — permissive `USING (false)` policies, one per bucket per operation, as the ticket's advisory note describes. C — the same set declared `AS RESTRICTIVE`.

**Decision:** C. A works today and documents nothing, so the next person to touch storage has to re-derive the intent. B reads like a guard and is not one: permissive policies are **OR'd**, so a policy that grants nothing also prevents nothing — the first permissive grant added beside it wins, silently, which is the exact failure the guard was written to prevent. Restrictive policies are **AND'd**, so they hold no matter what is added later. Each is scoped `bucket_id <> '<name>'` so a policy named for a bucket governs that bucket and leaves any future one alone.

**Consequences:** Buys a denial that survives a later permissive grant, and a file that states the access model rather than merely happening to enforce it. Costs twelve policies where four would nominally do, and one real constraint to remember: **if a Phase-2 ticket ever needs browser-side storage access, these must be narrowed deliberately** — it cannot be granted around them, which is the point, but it does mean the failure will present as "my correct-looking grant does nothing". The comment in the SQL says so.

**Revisit trigger:** a surface that genuinely needs the browser to talk to storage directly — a resumable upload for large files is the plausible one, and it would narrow the `insert` policy for one bucket rather than dropping the set.

---

## SET-6 — one predicate, expressed twice, with the negation derived

**Context:** Four write paths decide what materialisation may rewrite: apply a template, change the anchor, remove the template, re-apply after a template edit. Each needs to know whether a row is "untouched". Removing a template additionally needs the complement — which rows are kept — and WK-02 needs to COUNT that complement before the person chooses.

**Options:**

- **A. Each caller writes the conditions it needs.** Direct, and how the first draft of `removeTemplateFromDay` was written.
- **B. One `untouchedWhere()`, and each caller negates it however it likes.**
- **C. One `untouchedWhere()` plus a `touchedWhere()` defined as `NOT (untouchedWhere())`, both returning a narrowed `SQL`.**

**Decision:** C. A was not hypothetical — the draft it produced omitted the timer-session and miss sub-selects, so removing a template would have deleted an item somebody had already started, while the materialiser kept the identical row. That is not a slip a reviewer reliably catches: the four column checks it DID have look complete, and the two it dropped are the ones that live in sub-selects rather than columns. B fixes the positive case but leaves each negation site free to be subtly different. C makes the complement a derivation rather than a second author.

The narrowed `SQL` return type is part of the decision. Drizzle types `and()` as `SQL | undefined` because it is undefined for an empty argument list; that is untrue of a six-condition list written in place, and leaving it optional would have forced an assertion at every call site — or, worse, made `touchedWhere()` impossible, since `not()` will not take an optional.

**Consequences:** Every column the untouched predicate gains, the touched predicate gains in the same edit. The count WK-02 shows before the choice is produced by the same SQL the choice runs. The cost is that "touched" has no independent definition to read — someone wanting to know what it means has to negate six conditions in their head — which the comment on it states directly.

**Revisit trigger:** a caller that needs a PARTIAL notion of touched, such as "started but not done". That is a third predicate, not a variation on these two, and it should be written as one rather than by loosening either of these.

---

## SET-7 — first-run progress lives on the account, not in the browser

**Context:** The sequence has five steps and a *Finish later* exit. Something has to remember where a person stopped so the entry tree can send them back.

**Options:**

- **A. `sessionStorage` or `localStorage`.** No round trip, no schema, instant.
- **B. The URL alone** — resuming means bookmarking a step.
- **C. `users.first_run_step`, written on every transition.**

**Decision:** C, which INF-5 anticipated with the column and INF-7 with `resolveEntry`. A loses the sequence the first time someone switches from a laptop to a phone, which is precisely the moment a half-finished setup is most likely to be abandoned; it also cannot be read by the entry tree, which runs on the server. B asks a person mid-onboarding to manage their own bookmarks.

The cost is a write on every Continue, Skip, back and *Finish later*. That write is awaited before navigating, so closing the tab on the next frame still resumes correctly — but a FAILED write navigates anyway. Trapping someone in a wizard because a bookkeeping update failed is a worse outcome than resuming them one step early, and the step they land on is one they have already seen.

The single exception is FR-03 template id, which is `sessionStorage`. It is not progress: it exists so stepping back and forward does not leave a trail of empty *Morning* templates, and losing it costs one extra template the person can archive. The ticket permits this exception by name.

**Consequences:** Resume works across devices and cold opens. `first_run_step` and `first_run_completed_at` are written together on FR-05 so an account can never be both finished and owing a step. Every step transition is one mutation, which is visible in the network tab and is the thing to look at first if resume ever misbehaves.

**Revisit trigger:** an offline-capable first run. Phase 2 has offline writes; if the sequence ever has to work on a plane, the step would need a local queue and this decision becomes "the account is the source of truth, the browser is a cache".

---

## SET-8 — the theme has two stores and one authority

**Context:** A colour scheme has to be right in the first painted frame, and it has to follow a person to a second device. Those two requirements pull in opposite directions.

**Options:**

- **A. `localStorage` only** (next-themes as shipped by INF-3). Correct on first paint, per-device forever.
- **B. `users.theme` only.** Follows the person, but every cold open paints the default first and corrects itself after the first query returns — a visible flash of the wrong theme on every launch.
- **C. Both, with the row as the authority and the local store as a cache.**

**Decision:** C. The two stores are not redundant; they answer different questions. `localStorage` answers "what did this browser paint last time", which is the only question available before JavaScript runs. `users.theme` answers "what did this person choose", which is the only question that survives a new device.

The reconciliation is what makes it one fact rather than two: ST-09 writes both on every change, and `ThemeSync` applies the stored value ONCE per session when it differs. Once, guarded by a ref — a sync that re-ran would fight the control, because a stale query result arriving after a fresh choice would flip the theme back a moment after someone made it.

The write is fire-and-forget. The visible change has already happened locally; blocking a colour scheme behind a round trip, or reverting it because one failed, would be the screen arguing with something the person can plainly see.

**Consequences:** No flash on cold open, and a choice that follows the account. The cost is a window where the two disagree — a failed write leaves the other device one theme behind until the next successful one. Nothing else reads `users.theme`, so that window has no other consequence.

**Revisit trigger:** a second setting that has to be right before hydration. Two of these would justify one server-rendered preferences payload on the document rather than two independent caches.
