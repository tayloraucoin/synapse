---
source:
  - docs/ux/synapse_navigation_and_system_ux_architecture.md §6
  - docs/ux/epic2_in_use_ux_architecture.md §10.7; epic1_setup_ux_architecture.md §0.3, §11
  - code 3b252e7 (apps/web/lib/hooks/use-online.ts, lib/trpc/provider.tsx, lib/stores/use-timer-store.ts; the copy.ts files that carry an offline line; packages/api/src/services/day/timer.ts, journal.ts)
status: approved
promoted: 2026-10-09
---

# offline-and-sync — _global

A rules file: what the person sees without a connection, and how two devices agree.

## Job

Never let a lost connection lose a word or lie about one: say offline once, keep what can be kept on the device, block what cannot be saved with one standard line, and let a second device show the same record.

## Layout and components

The shell's `StatusLine` (offline variant); each writing screen's own line and disabled primary; inline error lines; TanStack Query as the only server cache (30 s stale time); the timer store, re-seeded from the server.

## States

| Case                       | What shows                                                                                                                                                                                                               | What the person can do | Evidence                                                             |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------- | -------------------------------------------------------------------- |
| Detection                  | `navigator.onLine`, through one hook; the server renders online, so the line never flashes on first paint                                                                                                                | —                      | inferred: use-online.ts                                              |
| The standard line          | In the shell, first in order, not dismissable, gone when the browser reports online                                                                                                                                      | Read anything cached   | seen                                                                 |
| Offline writes, Phase 1    | Blocked, not queued. A screen that writes reads the hook, disables its primary and shows its own line; nothing is queued for later                                                                                       | Wait, or read          | seen (quick-pick primary disabled); inferred: 60 `useOnline` readers |
| Setup and Your day         | _Offline — you can look, but changes need a connection._                                                                                                                                                                 | Read                   | inferred: (setup)/_components/copy.ts                                |
| Auth screens               | _You're offline — sign-in needs a connection._                                                                                                                                                                           | Wait                   | inferred: (auth)/_components/copy.ts                                 |
| Journal                    | _Offline — your words stay here until you're back._; the draft stays in local storage                                                                                                                                    | Keep writing           | inferred: journal/copy.ts, use-local-draft.ts                        |
| Day Review                 | _Couldn't save the review. Your decisions are kept on this device — try again._ on a failed save; live decisions are kept locally until they save                                                                        | Try again              | inferred: review-day/copy.ts                                         |
| List and item sheet        | Ticks and small writes are optimistic; a failed request reverts and shows _Couldn't save. Try again._ inline; nothing is disabled ahead of the failure                                                                   | Try again              | inferred: use-day-list.ts, use-item-sheet.ts                         |
| Workflow                   | Optimistic toggle; a failure reverts with _Couldn't save. Try again._                                                                                                                                                    | Try again              | inferred: workflow/_components/copy.ts                               |
| Syncing, sync issues       | The copy table holds _Syncing…_ and _Some changes couldn't sync._ · _Details_; neither renders, because nothing is queued                                                                                                | —                      | inferred: status-line copy.ts                                        |
| Reconnect                  | The line clears; queries refetch when stale (30 s) or on return to the tab; no count of anything                                                                                                                         | —                      | inferred: provider.tsx                                               |
| Two devices                | Reads converge within the stale time; a write from one device shows on the other after its next refetch; the server keeps the last write it received, with no per-field merge (Open 9)                                   | —                      | inferred: provider.tsx                                               |
| Two devices, timers        | The session row is the truth; starting the same item twice yields one session with one elapsed time; either device stops it; the store is re-seeded on every refetch, so an auto-closed session shows idle, not counting | Start, stop            | inferred: timer.ts, use-timer-store.ts                               |
| Two devices, journal       | Each answer merges by key, so a field written on one device never erases another field written on the other                                                                                                              | Write                  | inferred: journal.ts                                                 |
| Session gone while offline | A failed refresh is not an expiry; the dialog needs an `UNAUTHORIZED` answer or a `SIGNED_OUT` event, which need a connection                                                                                            | —                      | inferred: session-expired.ts                                         |
| Exports                    | _Your data_ export is a server job; its link expires; offline, the section's primary is disabled with the standard line                                                                                                  | Wait                   | inferred: export-section.tsx                                         |

## Words

The standard line and the four screen lines as quoted; the failure line _Couldn't save. Try again._ everywhere a write fails inline; never a count of pending changes, never _sync_ on screen today.

## Access

The offline line is a polite `status` region, so it is announced once; a disabled primary keeps its label and is announced disabled; an inline failure line sits under the control it belongs to. Reduced motion: nothing moves.

## Instrumentation

None today.

## Criteria

| ID                       | When                                           | Then                                                                                 | Evidence |
| ------------------------ | ---------------------------------------------- | ------------------------------------------------------------------------------------ | -------- |
| C-WEB-offline-and-sync-1 | The browser reports offline on any shell route | The standard line, first, no dismiss; gone on reconnect                              | capture  |
| C-WEB-offline-and-sync-2 | Offline on a setup screen and on the journal   | The primary is disabled with that screen's line; the journal draft survives a reload | manual   |
| C-WEB-offline-and-sync-3 | A tick while the request fails                 | The tick reverts and _Couldn't save. Try again._ shows inline                        | manual   |
| C-WEB-offline-and-sync-4 | Start a timer on two devices for one item      | One session; both show the same elapsed time; either stops it                        | manual   |

## Decisions and open items

D-WEB-1 to D-WEB-3. Open 9 in `overview.md`. Offline writes are Phase 2 by `apps/web/docs/product-rules.md`.
