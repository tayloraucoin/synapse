# Synapse — the spec tracks

**Start here for any feature work.** This folder holds one track per epic plus the cross-cutting track, all written against the same foundation (`infrastructure/`, Complete 2026-09-04) and the same four UX documents. This file is the one home for what is *shared* between the tracks: the global build order, the placement rules every feature ticket obeys, and the cross-track dependencies. Each track's `README.md` adds only what is local to it.

**Authors:** Vesper (UI decisions against `packages/ui`), Mason (architecture, placement, data contract), Reeve (tickets, sequencing, logs). **Date:** 2026-09-05. **Executor:** an Opus thread per ticket, following each track's kickoff contract. **Process:** [`spec-system-guide.md`](spec-system-guide.md).

---

## The tracks

| Folder | Prefix | Governs | Source document | Tickets |
|---|---|---|---|---|
| [`infrastructure/`](infrastructure/) | `INF-` | The foundation — **Complete** | v2 handoff, CC conventions | 11 |
| [`epic-1-setup/`](epic-1-setup/) | `SET-` | The domain schema, auth, first run, library, categories, templates, week build, settings | `docs/ux/epic1_setup_ux_architecture.md` | 10 |
| [`epic-2-in-use/`](epic-2-in-use/) | `USE-` | The day model, the List, the Schedule, sheets, timers, shift, trim, notifications | `docs/ux/epic2_in_use_ux_architecture.md` | 8 |
| [`epic-3-review/`](epic-3-review/) | `REV-` | The resolver, the Day Review, the Week Review, history | `docs/ux/epic3_review_ux_architecture.md` | 4 |
| [`cross-cutting-system/`](cross-cutting-system/) | `SYS-` | The shell, time, About & feedback, error and session states, keyboard, PWA install and update | `docs/ux/synapse_navigation_and_system_ux_architecture.md` | 5 |
| [`epic-4-dynamic-schedule/`](epic-4-dynamic-schedule/) | `DYN-` | **UX v1.1** — the block model, the block editor, the twelve-screen first run, the orient frame, the quick-pick, the Today tab by block, the editable Schedule, Adjust, the evening, the amended Review, the revised notifications, the cleanup. Cuts across every surface Epics 1–3 built. | `docs/ux/habit_tracker_official_ux_spec_v1_1.md` (accepted 2026-09-12) | 21 (6 full, 15 in the authoring handoff) |

Ticket prefixes are three letters so they never collide with the two-letter **screen** IDs the UX documents use (`AU-`, `FR-`, `LB-`, `CT-`, `TP-`, `WK-`, `ST-`, `SH-`, `LS-`, `DH-`, `IT-`, `SC-`, `SF-`, `TR-`, `PN-`, `RV-`, `DR-`, `WR-`, `HS-`, `SY-`). A ticket cites screens by their ID; a screen never cites a ticket.

---

## The global build order (cross-track)

Each track's `00-build-order.md` is the queue for that track. This is the one sequence across all four. A ticket may start only when every entry in its `## Depends on` shows **Complete** in the owning track's `PROGRESS.md` — dependencies cross tracks freely, and the gate is the same wherever the dependency lives.

### Critical path

```
SET-1 → USE-1 → SET-4 → SET-5 → SET-6 → USE-2 → USE-3 → REV-1 → REV-2 → USE-8
```

That line is a person signing in, building a library and a template, planning a week, moving through a day, closing it honestly, and being reminded at the times they set. Everything else hangs off it.

### Waves

A wave is a set of tickets that can be built in parallel once every earlier wave is Complete. Within a wave, order is free.

| Wave | Tickets | Why they group |
|---|---|---|
| **A** | **SET-1** (schema) · **SET-2** (auth) | SET-1 is the root of every data-bearing ticket. SET-2 touches no domain table and can run alongside it. |
| **B** | **USE-1** (day model) · **SYS-1** (shell) · **SET-3** (icon pipeline) | All three need only the schema. USE-1 is the contract the week build materialises against; SYS-1 gives every later screen its chrome. |
| **C** | **SET-4** (categories & library) | The first CRUD surfaces; the habit sheet is reused by first run, templates, and the week build. |
| **D** | **SET-5** (templates) | Slots need habits. |
| **E** | **SET-6** (week build & materialisation) · **SET-8** (settings core) | SET-6 needs templates and the day model. SET-8 needs the icon pipeline for the avatar and nothing else domain-side. |
| **F** | **SET-7** (first run) · **USE-2** (the List) · **SET-9** (reasons & notification prefs) | First run composes SET-4/5/6's sheets. The List needs materialised days. Reasons are read by the Review and the shift. |
| **G** | **USE-3** (item sheet, day header, timers) · **REV-1** (resolver) · **SET-10** (export & delete) | Three independent mechanisms over a working day. |
| **H** | **USE-4** (manual time, one-off edit) · **USE-5** (Schedule) · **REV-2** (Day Review) · **SYS-2** (time zones) | Each extends one Complete surface. |
| **I** | **USE-8** (notifications) · **REV-3** (traded-up, reflections, edit mode, history) · **SYS-3** (About, errors, session) · **SYS-5** (PWA install & update) | USE-8 needs the review's pending state (REV-2) and the week's status (SET-6). SYS-5 needs a reviewed-day count. |
| **J** | **USE-6** (shift) · **USE-7** (trim) · **REV-4** (Week Review) · **SYS-4** (keyboard) | Phase-2 surfaces per official spec §12; none gates launch. |

### Epic 4 (UX v1.1), added 2026-09-12

Every ticket in Epics 1–3 and the cross-cutting track is Complete, so Epic 4's order is its own: [`epic-4-dynamic-schedule/00-build-order.md`](epic-4-dynamic-schedule/00-build-order.md). Its critical path is `DYN-1 → DYN-2 → DYN-3 → DYN-4 → DYN-5 → DYN-7 → DYN-8 → DYN-11 → DYN-13 → DYN-14 → DYN-15 → DYN-17 → DYN-18 → DYN-20 → DYN-21`. Nothing in Epics 1–3 waits on it; it consumes them all. Its launch-blocking set and what does not gate are in its README.

### Launch-blocking set

Official spec §12 (ruling R4) phases the build. **Phase 1 — the launch set:** SET-1…10, USE-1…5, USE-8, REV-1…3, SYS-1, SYS-2, SYS-3, SYS-5. **Phase 2 — does not gate launch:** USE-6 (shift), USE-7 (trim), REV-4 (Week Review), SYS-4 (keyboard). The Schedule tab (USE-5) is Phase 1 here because [`apps/web/AGENTS.md`](../../apps/web/AGENTS.md) puts "the two execution tabs" in scope and the composites for it are already built; its Phase-2 *refinements* (drag, zoom) stay out.

Offline writes and sync (cross-cutting §6, SY-03) are **Phase 2 and not ticketed**. Every Phase-1 ticket implements the standard offline line (*Offline — you can look, but changes need a connection.* / *Offline — changes save on this device.* per its document) and disables writes.

---

## Placement rules for every feature ticket (Mason)

The foundation fixed the layers; these rules fix where feature code lands inside them. A ticket cites these by number rather than restating them. If a ticket needs to break one, that is a `[NEEDS DECISION]` routed to Mason, not a local choice.

1. **Schema:** `packages/db/src/schema/<domain>/<table>.ts`, one table per file with its `relations()`. Domains for Synapse: `user/` (users, user-avatars), `library/` (categories, habits, reasons), `plan/` (templates, template-slots, days), `day/` (day-items, timer-sessions, misses, shifts), `notification/` (web-push-subscriptions, notification-prefs), `system/` (data-exports, feedback-messages). Every user-data table carries a denormalised `user_id` and `ownerPrivateCrudPolicies`; there is no other shape. Enum colocation follows `drizzle-orm-conventions.md` §3.
2. **Row types** are exported from `packages/db/src/index.ts` as `$inferSelect` / `$inferInsert` pairs. Nothing outside `@syn/db` and `@syn/api` imports a table.
3. **Routers:** `packages/api/src/routers/<domain>.ts`, one per domain, registered in `root.ts`. Names: `user` (exists), `category`, `habit`, `asset`, `template`, `week`, `day`, `item`, `timer`, `shift`, `review`, `reason`, `notification`, `shell`, `feedback`. A resolver validates, calls a service, returns.
4. **Services:** `packages/api/src/services/<domain>/<verb-noun>.ts`. Multi-step logic lives here and nowhere else. A service that writes a user's row takes `(rls: RlsClient, userId: string, input)` — the shape `services/user/preferences.ts` established.
5. **View mapping** (row → `@syn/types` view model) lives in the API: `packages/api/src/services/<domain>/to-view.ts`. `@syn/ui` never sees a row. A read model the app renders but no component types (a whole day, a review) is a return type of its service, inferred through `AppRouter`; it is promoted to `@syn/types` only when a component takes it.
6. **Pure domain logic** — anything that is a function of rows, a clock, and a zone with no I/O — lives in `packages/utils/src/<domain>/`: `day/` (boundaries, state derivation, day parts, offsets), `review/` (the resolver). It is platform-pure by construction and the client re-runs it without a fetch.
7. **Validators:** `packages/validators/src/<domain>.ts`, exported from the barrel. **The same schema the form uses is the schema the procedure takes.** Error strings are the UX document's copy, verbatim, as the schema message.
8. **Constants** that are runtime values (the starter set, the default reason set, the notification catalogue, bounds) live in `@syn/constants`. Prose a person reads never goes there.
9. **Feature folders in the app:** `apps/web/components/<feature>/` when two or more routes compose it (`habit-sheet/`, `template-editor/`, `week-build/`, `one-off-sheet/`, `item-sheet/`, `day-list/`, `review-day/`). Each holds a headless hook `use-<feature>.ts`, the composition `<feature>.tsx` (`"use client"` line 1), a `copy.ts` for its strings, and an `index.ts`. Route-local leaves stay in `app/**/_components/`.
10. **Copy:** every string a person reads comes from the owning UX document and lives in a `copy.ts` beside the thing that renders it — never inline in JSX, never in `@syn/constants`. A string the documents do not contain is a `[COPY — needs Vesper sign-off]` marker, not an improvisation.
11. **Data on the page:** a Server Component reads through `getServerApi()`; a client leaf reads and writes through the `trpc` React client and invalidates by key. Execution-mode mutations (done, undo, start, stop, not today) are **optimistic** — the row changes on tap and reverts with a sentence on failure.
12. **Sheets are URL state.** A sheet a person can open is a nuqs query param on the route beneath it (`?sheet=item&id=…`, `?sheet=day-header`), pushed to history so back closes it (cross-cutting §1.3). The one addressable sheet path, `/day/{date}/item/{id}`, redirects to the query form so a notification and an in-app tap land on the same state.
13. **Client state:** the table in `apps/web/lib/stores/README.md` is binding. The running-timer tick is the one sanctioned Zustand store (USE-3).
14. **Storage:** private buckets only; object paths `icons/{user_id}/…`, `avatars/{user_id}/…`, `exports/{user_id}/…`. Uploads go through a signed upload URL minted by a procedure; reads of icons and avatars go through the session-gated streaming route SET-3 defines; exports are served by a 24-hour signed URL.
15. **Scheduled work** registers in `SCHEDULED_JOBS` (`packages/api/src/services/jobs/run-scheduled-jobs.ts`) and runs under `buildServiceRoleAuthContext(userId)` per user. Every RLS bypass stays a greppable `buildServiceRoleAuthContext` call.

---

## Cross-track dependencies

| Ticket | Depends on (in another track) | What it takes |
|---|---|---|
| USE-1 | SET-1 | The domain tables. |
| SYS-1 | SET-1 | `days` and `day_items` for the pending-review count. |
| SET-6 | USE-1 | `wallClockToInstant`, `resolveDayKey`, the day window — the materialiser writes absolute times with them. |
| USE-2 | SET-6 | Materialised days to render. |
| USE-3 | SET-9 | Nothing — listed to say so: the item sheet asks no reason. |
| REV-1 | SET-1 | The tables the resolver reads. |
| REV-2 | USE-3, SET-9 | `closeDay` (USE-1), the reason set (SET-9), the item sheet as the editor of done items (USE-3). |
| USE-8 | REV-2, SET-6, SET-9 | Pending-review facts, week status, notification preferences. |
| SYS-2 | USE-1, SET-8 | The pending-pair columns and their application; ST-08's fields. |
| SYS-3 | SYS-1 | The shell to render About in; the error pages already exist as placeholders. |
| SYS-4 | USE-2, USE-5 | Rows and blocks to move focus between. |
| SYS-5 | REV-2 | The reviewed-day count that times the install offer. |
| REV-4 | REV-2, USE-3 | Reviewed days; timer sessions for time-by-category. |
| DYN-1 | SET-1, USE-1 | `@syn/types`' domain file and `enumValues`; `@syn/utils/day/` (consumed, extended in place). |
| DYN-5 | SET-6, USE-1, USE-8 | The keep rules and `isUntouchedItem`; `wallClockToInstant`, `deriveItemState`; the notification fan-out and delivery ledger. |
| DYN-6 | USE-3, USE-6, USE-7 | `startTimer`; the preview-then-apply-with-fingerprint pattern; *Keep instead* and *Bring back*. |

---

## What every track shares (do not restate in a ticket)

- **Precedence:** official spec §0.3 (signed) → the epic document for its own screens → the cross-cutting document between them → the v2 handoff for component contracts → `codebase-conventions.md` → the domain guides → the nearest `AGENTS.md` → each track's rulings → `DEVIATIONS.md` + `TECHNICAL-DECISIONS.md` (on-disk reality wins over any stale string).
- **Product non-negotiables** are in [`apps/web/AGENTS.md`](../../apps/web/AGENTS.md) § Product non-negotiables and bind every ticket here.
- **Hard guardrails** are in the root [`AGENTS.md`](../../AGENTS.md): never migrate a hosted tier, never scaffold `apps/mobile`, logs append-only, no tests mid-slice, no AI, no billing, no social surface.
- **Verification:** `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build`, run as separate commands. A ticket that adds schema also runs `yarn db:generate` (interactive) and `yarn db:schema-reference`, and **stops before `db:migrate` on any hosted tier**.
- **Closure:** three places (the ticket's `Status:`, the track's `PROGRESS.md`, a `DEVIATIONS.md` line per divergence), then the build-order checkbox, then `yarn directory-map` if files moved.

---

## Authoring note (Reeve)

All 27 tickets were authored in one pass on 2026-09-05 by the three roles working in sequence — Vesper's UI decisions per epic against the built `packages/ui`, Mason's data contract and placement, Reeve's sequencing and ticket text. The spec-system guide's §7.4 ceiling of three tickets per authoring thread was exceeded deliberately, as the infrastructure track did, because the four documents share one data model and tickets written apart would have disagreed about it. Each track's `DEVIATIONS.md` opens with that line.
