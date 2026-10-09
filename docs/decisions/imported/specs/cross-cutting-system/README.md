# Cross-cutting — Navigation, platform, system behaviour: how to work this folder

**Read [`../README.md`](../README.md) first** — the global build order, the placement rules, and the cross-track dependencies. This file adds only what is local to this track.

**Governs:** everything that isn't a single screen — the signed-in shell and its two navigations, the status-line slot and its sources, sheets as history states, back, tab memory, record and plan mode headers, time zones and the deferred switches, About & feedback, the error and session-expired states, keyboard and focus, PWA install and update. **Source document:** [`docs/ux/synapse_navigation_and_system_ux_architecture.md`](../../ux/synapse_navigation_and_system_ux_architecture.md) (screens `SY-01…07`; §1–§8, §10–§12), under the official spec §5.1, §8, §9, §11. **Register:** whatever the surface beneath it is — this track never adds a register of its own; a system line is a fact, in the product's voice.

**Authors:** Vesper · Mason · Reeve, 2026-09-05. **Executor:** an Opus thread per ticket.

---

## Folder layout

| Path | What |
|---|---|
| `README.md` | This file |
| `00-build-order.md` | The ordered, checkable queue with the critical path |
| `SYS-1…SYS-5-*.md` | One implementable slice each |
| `PROGRESS.md` · `DEVIATIONS.md` · `TECHNICAL-DECISIONS.md` | The three records |
| `_templates/slice-spec.md` | The blank ticket |

---

## What Vesper decided for this track (the UI, against what is built)

- **The shell is `AppShell` as built** (rail on wide, tab bar on compact, skip link, `main`), mounted once in the `(shell)` layout. The route owns its `AppHeader` and its status line through a `PageFrame` (SYS-1's ruling) so header → status line → content is the order on every screen.
- **One status line at a time**, resolved by `StatusLineSlot`'s priority: offline > setup > pending review > late offer > update > time zone > install. The `permission` variant is **never** shown in the shell; ST-07's own line is the only permission surface (SET-9).
- **Three copy sign-offs, made here:** setup → *Setup isn't finished* [*Continue*]; pending review → *Yesterday has {n} items to review* [*Review*] (with the weekday when it is not yesterday); permission → unused. SYS-1 edits `@syn/ui`'s `copy.ts` accordingly.
- **Sheets are URL state** (`?sheet=…`), pushed to history, so back closes the topmost sheet before leaving a screen; the tab bar dims under a sheet (`AppShell sheetOpen`).
- **Dialogs are `ConfirmDialog` / `AlertDialog` parts**; SY-04 and SY-06 are dialogs; SY-05 is `ErrorPage`; SY-01 is a settings screen; SY-02/06/07 are status-line presets already built.
- **Keyboard shortcuts are invisible** — no badges; the list lives on About and behind `?` (`ShortcutsDialog`).
- **Copy is the document's, verbatim.**

---

## Source precedence

1. **Product behaviour** → official spec §0.3 (signed), §5.1, §8, §9.6, §11 → `synapse_navigation_and_system_ux_architecture.md` for its screens and rules (its §13's nine calls are signed) → the epic documents for the screens the shell frames → the v2 handoff for component contracts.
2. **Architecture & placement** → [`../README.md`](../README.md) § Placement rules → `codebase-conventions.md` → the domain guides.
3. **App rules** → [`apps/web/AGENTS.md`](../../../apps/web/AGENTS.md) — the route map is its authority; SYS-3 amends it for the legal pages, with a deviation line.
4. **This track's rulings**, labelled and logged.
5. **On-disk reality + every track's `DEVIATIONS.md` + `TECHNICAL-DECISIONS.md`.**

---

## The kickoff contract (one ticket per thread)

```
You are building ONE ticket from docs/specs/cross-cutting-system/: <TICKET-ID>.

OBJECTIVE
Ship the ticket's Acceptance criteria — nothing more (scope creep), nothing less.

BEFORE WRITING CODE
1. State the ticket ID and title in your first message.
2. Confirm every entry in the ticket's "Depends on" shows Complete in the owning
   track's PROGRESS.md (epic-1-setup/, epic-2-in-use/, epic-3-review/ as named).
   If any is not Complete, STOP and say so.
3. Read the ticket spec end to end, then its attach-list in order.
4. Read this track's DEVIATIONS.md and TECHNICAL-DECISIONS.md, the three epics',
   and the infrastructure track's — on-disk reality + those logs override any
   stale string in a spec or a UX document.
5. State the exact file paths you will create or change before implementing.

CONSTRAINTS
- Honor every non-negotiable verbatim. If the spec would force you to break one,
  STOP and ask — never silently contradict it.
- One status line at a time, in the fixed priority. No banner stacks. No number
  about the day in any system line. No question except the late offer.
- Every string a person reads comes from the UX document, verbatim, in a copy.ts.
- Filenames kebab-case; named exports only; Server Components default; client
  leaves in _components/ or components/<feature>/ with "use client" line 1; routes
  from lib/routes.ts; every user-scoped query through ctx.rls.execute().
- Audit @syn/ui before building a component. The shell, the status-line presets,
  the error page, and the shortcuts dialog exist. If a composite is genuinely
  missing, STOP and say why.
- No tests. No AI. No schema change without a logged deviation and a journalled
  migration a human applies.
- If you modify files owned by an upstream Complete ticket, re-check that ticket's
  affected acceptance criteria before finishing.

DEFINITION OF DONE
1. yarn lint · yarn lint:boundaries · yarn check-types · yarn build pass (four
   separate commands).
2. Every acceptance criterion checked on compact and wide and stated.
3. The ticket's Status line set to: Status: Complete (YYYY-MM-DD).
4. PROGRESS.md row + checklist ticked.
5. One DEVIATIONS.md line per divergence. Architectural choices with real
   alternatives → TECHNICAL-DECISIONS.md.
6. yarn directory-map if files were added/moved/removed.
7. Close with 3–5 lines: what shipped, deviations, the one thing the next ticket
   must know.

Do not start the next ticket.
```

---

## Completion protocol

Three places, every time. Then tick `00-build-order.md`. "The agent said done" is not done.

---

## Locked scope (do not re-litigate)

- **Cross-cutting §13's nine calls are signed:** one breakpoint at 768px; the tab bar stays visible, dimmed, under a sheet; first-run redirect on the first three launches then the status line; the install offer waits for the third reviewed day; a zone mismatch switches from tomorrow; template-derived items on today cannot have their time edited directly; `done_at` prefers the earlier value (Phase 2); feedback goes to the builder's inbox with an opt-out for screen/version and never any list data; single-key desktop shortcuts suppressed while any input has focus.
- **Routes are cross-cutting §4.1 as rendered in `apps/web/AGENTS.md`**; SYS-3 adds two legal pages by a logged deviation; nothing else adds a route.
- **Offline writes and sync (§6, SY-03) are Phase 2 and not ticketed.** The `offline` and `syncing`/`sync-issues` variants exist in `@syn/ui`; only `offline` is wired in Phase 1.
- **The infrastructure track's calls stand:** `proxy.ts` refreshes the session and the layouts gate; the launch counter is a cookie; the manifest and the push-only service worker are INF-9's; the scheduler is a Vercel cron.
- **Phase 1 vs Phase 2:** SYS-1, SYS-2, SYS-3, SYS-5 are launch-blocking; SYS-4 (keyboard) is not (a desktop nicety the documents give no launch weight).

---

## Non-negotiables (every ticket honours these)

- **One status line, one priority order, never a stack.**
- **No system line carries a number about the day.** The pending count is a count of items waiting, which official §10.5 writes; nothing else counts.
- **No question in a system line except the late offer**, once a day, dismissable.
- **Back closes the topmost sheet before leaving a screen**, on every platform, through history.
- **Every screen has exactly one `h1`, the landmarks of §3.4, and the skip link first.**
- **Times shown in the day's zone; the device's zone is read in exactly one place** (SYS-2's hook).
- **Nothing here gates on `apps/mobile`, adds a store, or reads `process.env` outside `env.ts`.**
- **Every read and write through `ctx.rls.execute()`;** `feedback_messages` is insert-only for the author.

---

## Canonical paths & known-stale warnings

- `apps/web/app/(shell)/layout.tsx` is the auth gate and renders **no chrome**; its doc block says "the chrome arrives with Epic 2's first ticket" — it arrives with **SYS-1** (this track). Update the doc block; log it.
- `apps/web/app/(shell)/_components/{app-shell,rail,tab-bar,nav-items,status-line-slot}.tsx` exist and are the chrome; `StatusLineSlot` takes its sources as props (its own doc block says so). SYS-1 supplies them from `shell.status`.
- `apps/web/app/{error,not-found}.tsx` already carry SY-05's copy in plain markup; SYS-3 re-renders them through `ErrorPage` for one home.
- `apps/web/lib/entry/*` is INF-7's entry tree; nothing here re-implements it.
- `apps/web/lib/pwa/{install-detection,push-subscribe,use-install-prompt}.ts` and `app/_components/{service-worker-registration,pwa-mode-sync}.tsx` are INF-9's; SYS-5 extends the registration leaf for the waiting-worker signal.
- `@syn/constants` `CONTACT_EMAIL` is empty until Taylor supplies it (INF-2's `TODO`); SYS-3's error line needs it — `[NEEDS VALUE AT BUILD]`.
- `STORAGE_KEYS.INSTALL_DISMISSED_UNTIL` exists; `useDismissed("install", "forever")` is what the slot already uses — one mechanism; SYS-5 confirms which and removes the other (log).
