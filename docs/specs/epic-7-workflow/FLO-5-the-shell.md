# FLO-5 — The shell: the fourth peer, the two routes and a frame, `tabForPath`, the orient exemption, the `4` key, `apps/web/AGENTS.md`'s scope and route rows

**Epic:** FLO — Workflow · **Phase 2** · Size: S
**Slice type:** Five small edits to files other tracks own, plus a placeholder route. The risk class is *a regression in the habit day's navigation or entry* — a tab highlighted wrong, the orient frame skipped where it should not be, a fifth tab that does not fit a small phone.

**Status:** Complete (2026-10-04) — criterion 4 met by the 320px fix Taylor took on 2026-10-04 (equal, unpadded tab cells below 360px; see `DEVIATIONS.md`).

---

## Outcome

*Workflow* is in the rail on a wide window and in the tab bar on a phone, fourth, between Review and Settings. Choosing it — or pressing `4` — opens `/workflow`, which shows the app's frame with the heading *Workflow* and nothing beneath it yet. Opening it first thing in the morning goes straight there; every other tab still waits behind the orient frame exactly as before. The app's own instruction file says Workflow is in scope and lists its routes. **The board itself is FLO-6; this ticket leaves an honest empty frame.**

## Why / intent

- **W1, UX §5** — a fourth peer after Review; the same word tab on compact; no dot, no badge.
- **W16, §13 #W8** — Workflow routes do not wait behind the orient frame. First run still comes first.
- **TD-44** — each edit in the file that already owns the fact: `nav-items.ts` (the list and `tabForPath`), `lib/routes.ts` (the builders), `lib/entry/resolve-entry.ts` (the exemption, inside the pure function), `use-global-shortcuts.ts` and `lib/keyboard/shortcuts.ts` (`4`).
- **README § Decision queue Q1 and Q3** — both defaults are in force: Workflow is in scope; the exemption is built. Each is one `DEVIATIONS.md` line here so a flip is findable.
- **Ground truth (consumed):** `apps/web/app/(shell)/_components/{nav-items.ts, rail.tsx, tab-bar.tsx}` (both navigations render every `NAV_ITEMS` row; neither needs a change beyond the list); `apps/web/lib/entry/resolve-entry.ts`; `apps/web/app/(shell)/layout.tsx` (redirects to orient only when the tree returns it — so the exemption belongs in the tree); `apps/web/components/page-frame/`; `apps/web/lib/keyboard/shortcuts.ts` (the one list the About table and the `?` dialog render).
- **What this slice is NOT (binding):** the board; the redirect from `/workflow` to a view (FLO-6, which has views to redirect to); the `n` key or any board key (FLO-6 — a key that is listed is a key that works); `ScreenFrame`'s `"board"` width (FLO-4); any change to `Rail`, `TabBar` or `AppShell` beyond what the list drives.

**Rulings this slice makes (labelled, logged):**

- **`tabForPath` checks `/workflow` before the rule that matches a path ending in `/schedule`**, and before the List's fall-through. Logged.
- **The exemption is a branch in `resolveEntry`**: when `intendedRoute` is a Workflow path, the orient branch is skipped and the route is returned through `sanitizeNextPath` as any deep link is. The layout is not edited. Logged.
- **`/workflow/[view]` is created now as well, rendering the same placeholder frame**, so the builder `workflowViewRoute` has a route behind it and FLO-6 replaces two files rather than adding a segment. Logged.
- **The placeholder uses `contentWidth="canvas"`**; FLO-6 switches it to `"board"`. Logged.
- **If five word tabs do not fit at 320px without truncating or shrinking below the type scale, STOP** and route to Vesper — it is a design question, not a class to tweak. Logged.

## Experience & states

**Wide.** The rail's rows read *List · Schedule · Review · Workflow · Settings*. *Workflow* is highlighted on any path under `/workflow`. No dot.

**Compact.** The tab bar's five word tabs in the same order.

**`/workflow` and `/workflow/{view}`.** `PageFrame` with an `AppHeader` whose `h1` is *Workflow*, the status line slot, and an empty `main`. On navigation focus moves to the `h1` (the frame already does this).

**The `4` key** navigates to `/workflow` from anywhere in the shell, under the same suppression as `1`–`3`. It is listed on About → Keyboard and in the `?` dialog under a *Workflow* heading, with the one row *Workflow*.

**Entry.** With today's day not yet woken: opening `/today`, `/review`, `/settings` → the orient frame, as before. Opening `/workflow` → `/workflow`. With first run incomplete inside the launch limit: `/workflow` → the setup sequence, as before.

**States (exhaustive):** the placeholder, signed in · signed out (the layout's sign-in redirect, remembering `/workflow`) · email unverified (the verify redirect) · first run owed · orient owed (exempt).

**Failure / edge states:** `shell.status` failing still renders the frame (unchanged) · re-tapping the active *Workflow* tab dispatches scroll-to-now, which nothing on this route hears — correct, and no code.

## Non-negotiables (this slice)

- **The habit day's entry is unchanged**: every non-Workflow shell route still redirects to the orient frame when it did before.
- **No path string outside `lib/routes.ts`.**
- **No dot, no badge, no count on the Workflow tab.**
- **The exemption lives in `resolveEntry`, not in the layout.**
- **Only `4` is added to the shortcut list.** A key that does nothing yet is not listed.

## Data & AI

**Schema changes: none.**

**Tables:** none.

**Placement:** `apps/web/lib/routes.ts` (`workflowRoute()`, `workflowViewRoute(viewId, options?: { column?: string })`); `apps/web/app/(shell)/_components/nav-items.ts`; `apps/web/lib/entry/resolve-entry.ts`; `apps/web/lib/hooks/use-global-shortcuts.ts`; `apps/web/lib/keyboard/shortcuts.ts`; `apps/web/app/(shell)/workflow/page.tsx`, `apps/web/app/(shell)/workflow/[view]/page.tsx`, `apps/web/app/(shell)/workflow/_components/copy.ts` (the `h1`); `apps/web/AGENTS.md` (§ Scope: one sentence lifting Workflow into scope, dated, citing Taylor's notes of 2026-10-03; the route map: two rows; `/workflow` noted as exempt from the orient redirect). Mason, TD-44; rule 10 for the string.

**tRPC / validators:** none.

**AI notes:** **None.**

## Accessibility

- The new tab is a link with `aria-current="page"` when active, as the others.
- Five tabs at 320px: each target stays at least 44px wide and the labels stay at the tab bar's existing size.
- `4` is suppressed while a field has focus or a dialog is open, by the existing guard.

## Acceptance criteria (observable — the app on the local tier at 320px, 375px and 1280px)

1. At 1280px the rail lists *List, Schedule, Review, Workflow, Settings* in that order; at 375px the tab bar lists the same five.
2. On `/workflow` and on `/workflow/anything`, *Workflow* is the item with `aria-current="page"` and no other is.
3. On `/today/schedule` and `/day/2026-10-03/schedule` the active item is still *Schedule*; on `/settings/week` still *Settings*; on `/review/history` still *Review*; on `/today` still *List*.
4. At 320px all five labels are fully visible on one row, none truncated, each tab's box at least 44px wide. If not, the ticket stopped and says so.
5. `/workflow` renders one `h1` reading *Workflow* inside the shell, with the rail or tab bar present; `document.title` and the page have no console error.
6. Pressing `4` on `/today` navigates to `/workflow`; pressing `4` while a text field has focus types the character and does not navigate.
7. `SHORTCUTS` contains the `4` entry under a *Workflow* group and no other Workflow key; About → Keyboard and the `?` dialog both show it.
8. `resolveEntry` with `today = { wokeAt: null, closed: false }`, first run complete, returns the orient route for `intendedRoute` `/today`, `/review` and `null`, and returns `/workflow` for `intendedRoute` `/workflow` and `/workflow/abc` for that.
9. `resolveEntry` with first run incomplete and `launchCount` 1 returns a setup route for `intendedRoute` `/workflow`.
10. `grep -rn "\"/workflow" apps/web --include="*.ts" --include="*.tsx"` matches only `apps/web/lib/routes.ts` and the `startsWith` checks that call for a literal prefix in `nav-items.ts`, `resolve-entry.ts` and `use-global-shortcuts.ts` — or none of those three if they compare against the builder's result.
11. `apps/web/AGENTS.md` § Scope names Workflow with the date and the authority, and the route map has rows for `/workflow` and `/workflow/{view}` with their builders.
12. `DEVIATIONS.md` has a line for the scope default (Q1) and one for the orient exemption (Q3).
13. `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` pass (four separate commands).

## Likely-relevant technical notes (ADVISORY — dev decides)

- `NavTab` gains `"workflow"`; `PageFrame`'s scroll memory is keyed by `tabForPath`, so Workflow gets its own remembered scroll for free.
- Prefer comparing against `workflowRoute()` over a second literal in the three files criterion 10 names; `isDayRoute` in `use-global-shortcuts.ts` is the existing shape for a path-scope helper.
- `ResumeGuard` re-runs the tree with the current path; with the exemption a person returning to an installed app on `/workflow` stays there.
- Next 16: `params` is async in `[view]/page.tsx`.

## Dev's call

Literal prefix versus builder comparison in the three scope checks · whether the two placeholder pages share one small server component.

## Out of scope

- **The board, the view redirect, `markOpened`** — FLO-6.
- **`n`, `g`, `[`, `]`, arrows, `Space`** — FLO-6, FLO-7, FLO-8, each listed in `SHORTCUTS` by the ticket that makes it work.
- **The `"board"` frame width** — FLO-4, applied in FLO-6.
- **The tab title** — FLO-6.
- **`docs/specs/README.md`'s placement rules and tracks table** — FLO-10.

## Depends on

**No slice dependencies.** (It is batched after FLO-3 only so the batch ends with a route in the nav.)

## Recommended execution

**Sonnet.** Small, precedented edits with the judgment ruled. The failure mode of choosing down is an exemption written into the layout, or a `tabForPath` rule placed after the schedule rule — criteria 3 and 8 catch both.

---

### Kickoff (paste into the session)

> Build **FLO-5 — The shell** (attached spec). Model: **Sonnet**. **Workflow is the fourth peer and skips the orient frame; nothing about the habit day's navigation or entry changes.**
> Attach/read first, in order: this spec · `docs/ux/workflow-ux-spec-v0.1.md` §0.3 (W1, W16), §5 · `01-technology-assessment.md` §3 (TD-44) · `apps/web/AGENTS.md` · root `AGENTS.md` · `apps/web/app/(shell)/_components/{nav-items.ts, rail.tsx, tab-bar.tsx}`, `apps/web/app/(shell)/layout.tsx`, `apps/web/lib/entry/resolve-entry.ts`, `apps/web/lib/hooks/use-global-shortcuts.ts`, `apps/web/lib/keyboard/shortcuts.ts`, `apps/web/lib/routes.ts` · `docs/specs/cross-cutting-system/SYS-1-shell.md` and `SYS-4-keyboard-and-focus.md` (their acceptance criteria — re-check the ones these edits touch) · this track's `README.md`, `DEVIATIONS.md` + `TECHNICAL-DECISIONS.md`.
> Edit the list, not the navigations. Put the exemption in `resolveEntry`. Add `4` and nothing else to the shortcut list. If five tabs do not fit at 320px, stop and say so. Close in three places; log the two defaults in `DEVIATIONS.md`. Run `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` as separate commands.
