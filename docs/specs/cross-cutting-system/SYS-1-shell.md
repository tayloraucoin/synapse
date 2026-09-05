# SYS-1 — The shell: chrome mounted, `PageFrame`, `shell.status`, the status-line sources, sheets as history, back, tab memory, record and plan headers, and three copy sign-offs

**Epic:** SYS — Cross-cutting · **Phase 0** · Size: L
**Slice type:** The frame every later screen renders inside — navigation, header order, one status line, URL-state sheets. The risk class is *a shell that argues*: two status lines at once, a header that flashes empty, a sheet that back cannot close, a tab bar that is tappable under a scrim, a second entry tree.
**Vigil:** none. **Vesper review:** the compact tab bar under a sheet's scrim; the header's back/title/avatar on both breakpoints; the status line's placement under the header.

**Status:** Not started

> **Vesper — chrome review.** Walk List → Settings → Habits → back → back on a phone and on a laptop. Back must pop exactly one thing each time. The status line must sit under the header, full width, and never stack.

---

## Outcome

Signed in, a person sees the List with a header, one status line when there is something to say, the three word tabs at the bottom (or the rail on the left), and a Settings door. Back closes a sheet before it leaves a screen. Switching tabs keeps each tab's scroll position; re-tapping the active tab scrolls to now. The Review tab carries a dot when items are waiting. A past day's header shows the date with *Today*; a future day's shows *Not until Thursday*. The setup line says *Setup isn't finished* [*Continue*] while first run is owed; the pending line says *Yesterday has 3 items to review* [*Review*] the morning after an auto-close. **Every placeholder page renders inside the chrome** with its `Heading` — no page content changes here.

## Why / intent

- **Cross-cutting §1** — one signed-in surface with three peers and one door; depth capped; sheets never navigate, screens do; back closes the topmost sheet, then pops; sequences excepted. §2 — compact under 768px, wide at and above; header 56px with title left, avatar right; tab bar 56px + safe area, dimmed under a scrim; status line under the header full width; the rail 220px with the presence dot and Settings last; content 720px/960px left-aligned; sheets 420px right panels. §3.4 — landmarks: `banner`, `navigation`, `main`, `complementary`, `dialog`; skip link first; focus to the new peer's title on tab switch; live regions. §4.1 — routes; §4.2 — the entry tree (INF-7's — not re-implemented); §4.3 — tab state: scroll and expanders per session; the date with *Today* on a non-today day. §11 — one `h1`; the tab bar semantics; the Review dot as text (*items waiting*).
- **Epic 2 SH-00** — the shell's reads: title region, avatar (*Settings*), word tabs, the dot as presence not count, the status-line slot's priority (offline · setup · pending · late offer) and dismissability (offline never; setup for the session; pending taps through; late offer for the day).
- **Official spec §5.1** — three tabs, Settings as the avatar in the header, the rail on desktop, word labels.
- **Official spec §10.5** — *Yesterday has 3 items to review.*; Epic 1 §0.5 — *Setup isn't finished — continue*.
- **Ground truth:** `apps/web/app/(shell)/layout.tsx` (the gate; no chrome), `_components/{app-shell,rail,tab-bar,nav-items,status-line-slot}.tsx` (built, unmounted), `lib/hooks/use-dismissed.ts`, `use-online.ts`, `lib/routes.ts`, `resolveEntryForRequest`, `getRequestUser`, `user.me`; `@syn/ui` `AppHeader` (`dateContext`, `zoneLabel`, `avatar`), `StatusLine` + presets, `ScreenFrame`; `STATUS_LINE_COPY` with three `[COPY]` entries; `DayMode`; nuqs (installed); SET-1's `days`, `day_items`, `users`, `user_avatars`.
- **What this slice is NOT (binding):** no page content; no re-implementation of the entry tree or the gate; no `lateOffer` computation (USE-6 — the prop is wired, the value is `false`); no `update`/`install`/`timezone` sources (SYS-5, SYS-2 — the props are wired, the values `false`/`undefined`); no keyboard shortcuts (SYS-4); no theme sync (SET-8).

**Rulings this slice makes (labelled, logged):**

- **`PageFrame`** (`apps/web/components/page-frame/`) renders `header` → `ShellStatusLine` → `children`; every `(shell)` page renders it as its first child. `AppShell`'s `header` and `statusLine` props stay unused (logged deviation from the handoff §5.2). Logged (`TECHNICAL-DECISIONS.md`).
- **`shell.status`** returns `{ todayKey, timezone, dayCloseTime, displayName, avatarPath, setupIncomplete, setupStep, pendingReviewCount, pendingDays: [{ date, weekday, count }], reviewedDayCount, firstFixedStartToday: Date | null, hasShiftToday }` — the last two let USE-6 derive the late offer client-side on the minute tick; `reviewedDayCount` is SYS-5's. Logged.
- **Sheets are nuqs query state**, `useSheet(name)` → `{ open, id, openWith(id?), close }` with `history: "push"`; a `ShellContext` exposes `setSheetOpen` so any open sheet dims the tab bar and hides `main` from AT (`AppShell sheetOpen`). `/day/{date}/item/{id}` is a Server Component that redirects to `dayRoute(date) + "?sheet=item&id="` (or `todayRoute()` when the date is today). `/day/{today}` redirects to `/today`; `/day/{today}/schedule` to `/today/schedule`. Logged.
- **Tab scroll memory** is `sessionStorage` per tab (`syn:scroll:<tab>`, add to `STORAGE_KEYS`), saved on `scroll` (throttled) and restored after the route's data renders; re-tapping the active tab dispatches `syn:scroll-to-now` (a `window` `CustomEvent`) that the List and the Schedule subscribe to (USE-2, USE-5). Logged.
- **Focus on tab switch moves to the new page's `h1`** — `AppHeader`'s title gets `tabIndex={-1}` and `PageFrame` focuses it on pathname change when the change was a tab switch (not a sheet or back). Logged.
- **Record and plan headers**: `PageFrame` takes `dayKey?`; when present and ≠ `todayKey`, it passes `dateContext={{ label, onToday }}` to the header (the List's `DayHeader` is the title node; `dateContext` and `notUntilWeekday` are USE-2's props on it — `PageFrame` computes `mode` from `dayKey` and hands it down). Logged.
- **The three copy sign-offs**: `STATUS_LINE_COPY.setup = { text: "Setup isn't finished", actionLabel: "Continue", dismissLabel: "Dismiss" }`; `pending-review` text built by `pendingReviewText(weekday, count)` → *Yesterday has {n} items to review* / *{Weekday} has {n} items to review* (add the builder beside `timezoneMismatchText`), `actionLabel: "Review"`; `permission` unchanged and unwired. Remove the `[COPY]` markers for the two signed entries; leave the marker on `permission` with a note that it is unused. Logged.
- **The header avatar** reads `displayName` and `avatarPath` from `shell.status`; `imageUrl = avatarPath ? assetRoute(avatarPath) : null` (SET-3's helper — until SET-3 is Complete, `imageUrl` is null and the initials show; no dependency). Logged.
- **`pendingDays` and the dot**: `reviewHasPending = pendingReviewCount > 0`; the status line's pending variant shows the most recent pending day's line and taps through to `reviewDayRoute(date)`. Logged.

## Experience & states

### The layout

`(shell)/layout.tsx` keeps its gate and wraps `children` in `<ShellProviders>` (the `ShellContext` + a `shell.status` prefetch via the server caller passed as `initialData`) and `<AppShell user reviewHasPending sheetOpen>`. The skip link and `main#main` move into `AppShell` (already there); the layout's own copies are removed. The doc block is updated (SYS-1, not Epic 2).

### `PageFrame`

`{ header: ReactNode (an AppHeader), dayKey?: string, contentWidth?: "text" | "canvas", children }` → renders the header (a `banner` landmark — `AppHeader` renders `<header>`), then `ShellStatusLine dayKey` (a `complementary` landmark wrapping `StatusLineSlot` with `role="status"`), then `ScreenFrame width={contentWidth}` with the children. `AppShell`'s `contentWidth` is passed through from the frame via context so `main`'s max-width agrees.

### `ShellStatusLine`

Reads `shell.status` and `useOnline`, passes to `StatusLineSlot`: `dayKey`, `setupIncomplete` + `onFinishSetup` (→ `setupRoute(setupStep ?? 1)`), `reviewPending` + `onOpenReview` (→ the most recent pending day), `lateOffer=false`, `updateReady=false`, `timezoneMismatch=undefined`, `installOffer=false`, `permissionOffer=false`. Later tickets replace the constants with sources. The slot's dismissals are already scoped (`useDismissed`).

### Navigation behaviour

- `TabBar`/`Rail` (built): on click of the active item, dispatch `syn:scroll-to-now` and prevent navigation; otherwise navigate. Save the current tab's scroll before leaving; restore the target's after mount (a `useScrollMemory(tab)` hook in `lib/hooks/`).
- Sheets: `useSheet` in `lib/hooks/use-sheet.ts`; `ShellContext.setSheetOpen` toggled by an effect in `ResponsiveSheet`'s callers — **simplest:** a `SheetHost` wrapper in `components/page-frame/sheet-host.tsx` that any feature renders its sheet through, setting the context while `open`. Log the mechanism.
- Back: nuqs with `history: "push"` means browser/system back pops the query first; on a peer with nothing open, back does nothing in-app (the browser's history is the shell's; on Android the second back within 2 s exits — platform behaviour, not ours).
- Settings on compact: `/settings` is a screen pushed over the peer (a route); its sections push over it; `AppHeader onBack` → `router.back()` when the previous entry is in-app, else `settingsRoute()`/`todayRoute()` (a `useBack(fallback)` hook that tracks in-app history depth in the context).

### Record / plan headers

`PageFrame dayKey` with `dayKey !== todayKey`: `dateContext.label` = *{Weekday} {day} {Month}*, `onToday` → `todayRoute()` (or `todayScheduleRoute()` on a schedule route); the tab bar still highlights *List*/*Schedule* (the prefix rule is built). Plan mode's *Not until {weekday}* is `DayHeader`'s prop (USE-2 passes it); the frame provides `mode`.

**States (exhaustive):** compact · wide · sheet-open (tab bar dimmed, `main` `aria-hidden`) · status-line: none · offline · setup · pending · (late/update/timezone/install wired, false) · record header · plan header · loading `shell.status` (the dot absent, the avatar initials from `getRequestUser`'s email until the query resolves — **no:** prefetch server-side so the first paint is complete) · signed out (the gate redirects; unchanged).

**Failure / edge states:** `shell.status` fails → the chrome renders with no dot and no status line, the page still renders (the query is not load-bearing) · a sheet param for an unknown id → the feature's sheet closes itself (each sheet's rule) · deep link to `/day/2026-09-04/item/x` → redirect → the List opens the sheet (USE-3) or, before USE-3, ignores the param.

## Non-negotiables (this slice)

- **One status line, the fixed priority, never a stack.**
- **Both navigations render always; CSS hides one** (`AppShell`'s rule — do not introduce a JS breakpoint for the chrome).
- **The tab bar under a scrim is dimmed and inert, never hidden.**
- **Back pops exactly one thing.**
- **No second entry tree.** The layout's gate and `resolveEntry` stay as INF-7 left them.
- **No number about the day in the shell.** The pending line's count is official §10.5's line; the dot is a presence mark.
- **Every string is the document's; the two sign-offs are as ruled.**

## Data & AI

**Schema changes: none.**

**Tables:** `users`, `user_avatars`, `days`, `day_items` (read for `shell.status`).

**Placement:** router `packages/api/src/routers/shell.ts` (rule 3) with `services/shell/status.ts`; `apps/web/components/page-frame/{page-frame,shell-status-line,sheet-host,index}.tsx`; `app/(shell)/_components/shell-providers.tsx`, `shell-context.tsx`; hooks `lib/hooks/{use-sheet,use-scroll-memory,use-back}.ts`; redirects in `app/(shell)/day/[date]/{page,schedule/page,item/[id]/page}.tsx` (the item page becomes a redirect; the day pages gain the today redirect and keep their placeholders otherwise); `STATUS_LINE_COPY` edits and `pendingReviewText` in `@syn/ui`'s status-line `copy.ts` (+ story update); `STORAGE_KEYS.SCROLL_PREFIX`; the `(shell)` layout edit; `nav-items.ts` unchanged.

**tRPC / validators:** `shell.status` (query, no input).

**AI notes:** **None.**

## Accessibility

- Landmarks: `AppHeader` → `<header role="banner">`; `TabBar`/`Rail` → `<nav aria-label="Main">` (built); `main#main`; the status line wrapper → `<aside role="complementary">` containing `role="status"` (`aria-live="polite"`); sheets → Radix `dialog` with `aria-modal` (built).
- The skip link is the first focusable and reads *Skip to today's list* (built); it stays first when `PageFrame` renders the header.
- Exactly one `h1` per page: the `AppHeader` title; placeholders' `Heading` moves into the header's `title`.
- Tab switch → focus on the `h1`; sheet close → focus returns to the opener (Radix).
- The Review dot's `sr-only` *items waiting* (built).
- The tab bar dimmed under a scrim: `aria-hidden` and `pointer-events: none` (built — verify).

## Acceptance criteria (observable — compact (375px) and wide (1024px); the smoke account with a pending day made by SQL)

1. Every `(shell)` route renders inside the chrome: on compact the header, the status-line slot, the content, and the tab bar; on wide the rail, the header, the slot, the content; the skip link is the first Tab stop on every route. *(Vesper.)*
2. Only one of the two navigations is in the accessibility tree at a time, and neither disappears during hydration (throttle the network; no frame without navigation).
3. With `first_run_completed_at` null, the slot reads *Setup isn't finished* [*Continue*]; *Continue* → `/setup/{step}`; dismiss hides it for the session and it returns after a reload… **no** — "dismissable for the session" means until the tab closes; verify it stays hidden across in-app navigation and returns in a new tab.
4. With a closed day carrying `pending_review` items (SQL), the Review tab shows the dot with *items waiting* for AT, and the slot reads *Yesterday has {n} items to review* [*Review*] → `/review/day/{date}`; for a day two days back it reads *{Weekday} has {n} items to review*; with no pending items neither appears.
5. Offline (DevTools) the slot reads *Offline — changes save on this device.* with no dismiss, above any other line; back online it disappears and the next line (if any) shows.
6. `?sheet=x` set by `useSheet` pushes history; browser back removes it and the page beneath is unchanged and unscrolled; the tab bar is dimmed and inert while any sheet is open (`SheetHost`), and `main` is `aria-hidden`. *(Vesper.)*
7. `/day/{today}` → `/today`; `/day/{today}/schedule` → `/today/schedule`; `/day/2026-09-04/item/abc` → `/day/2026-09-04?sheet=item&id=abc`; `/day/2026-13-40` → 404 (unchanged).
8. On `/day/{yesterday}` the header shows *{Weekday} {day} {Month}* with a *Today* action → `/today`; the *List* tab is highlighted; on `/day/{tomorrow}` the same with the plan-mode flag passed down.
9. Scroll the List, switch to Review, switch back: the scroll position is restored; re-tapping *List* dispatches `syn:scroll-to-now` (observe with a listener) and does not navigate.
10. Tab switch moves focus to the new page's `h1` (VoiceOver/NVDA announces the title). *(Vesper.)*
11. Settings → Habits → back → Settings → back → the peer that opened Settings; on wide the same with the rail; `router.back()` never leaves the app.
12. `shell.status` as user B returns B's facts; the avatar shows B's initials (or image once SET-3/SET-8 land).
13. `packages/ui/src/composed/feedback/status-line/copy.ts` has the two signed strings and only `permission` still marked; the story renders them.
14. `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` pass (four separate commands).

## Likely-relevant technical notes (ADVISORY — dev decides)

- Prefetch `shell.status` in the layout with the server caller and hand it to a `HydrationBoundary` (TanStack) so the client query starts warm; invalidate it in later tickets' mutations (decide, finish, closeDay, updatePreferences, setDone on the first fixed item, applyTemplate).
- `useSheet`: `useQueryStates({ sheet: parseAsString, id: parseAsString }, { history: "push" })`; `close()` clears both.
- `useScrollMemory`: save `window.scrollY` on `scroll` throttled to 100 ms; restore in a `useLayoutEffect` after the page's first data render (the List will signal readiness — until then restore on mount).
- `useBack(fallback)`: the context counts in-app navigations; `depth > 0 ? router.back() : router.replace(fallback)`.
- The `(shell)` layout's `contentWidth`: `AppShell` reads it from context; `PageFrame` sets it.

## Dev's call

`SheetHost` vs a `useSheetOpen()` effect each feature calls (recommend the host) · the scroll throttle · how `HydrationBoundary` is wired.

## Out of scope

- **Page content** — every epic.
- **The late offer's value** — USE-6; **update/install** — SYS-5; **time zone** — SYS-2.
- **Keyboard shortcuts** — SYS-4.
- **Theme sync** — SET-8.
- **The header's zone label value** — SYS-2 (the prop is `AppHeader`'s).

## Depends on

- **SET-1** — `days`, `day_items`, `user_avatars`. Complete in `../epic-1-setup/PROGRESS.md`.

## Recommended execution

**Opus.** The shell is where a flash, a stacked line, or a broken back would be inherited by every screen after it; the header/status-line ordering across a server layout and client pages is the kind of structural call a cheaper model resolves with a client-only header that flashes.

---

### Kickoff (paste into the session)

> Build **SYS-1 — The shell** (attached spec). Model: **Opus**. **One status line in the fixed priority; both navigations always rendered and one hidden by CSS; back pops exactly one thing; the tab bar under a scrim is dimmed, never hidden; no second entry tree.**
> Attach/read first, in order: this spec · cross-cutting §1, §2, §3.4, §4.1, §4.3, §11, §12 · Epic 2 SH-00 · official spec §5.1, §10.5 · Epic 1 §0.5 · `apps/web/AGENTS.md` · root `AGENTS.md` · `docs/specs/README.md` § Placement rules · `apps/web/app/(shell)/layout.tsx` and `_components/*` (mount, don't rewrite) · `apps/web/lib/entry/*` (do not touch) · `packages/ui/src/composed/{navigation/app-header,feedback/status-line,layout/screen-frame}/` · `apps/web/lib/stores/README.md` (nuqs for URL state) · `packages/db/SCHEMA_REFERENCE.md` (plan, day groups) · this track's `DEVIATIONS.md` + `TECHNICAL-DECISIONS.md` · `../epic-1-setup/DEVIATIONS.md` · `docs/specs/infrastructure/DEVIATIONS.md` (INF-7 lines).
> Sign the two status-line strings as ruled; leave `permission` marked and unwired. Close in three places. Run `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` as separate commands.
