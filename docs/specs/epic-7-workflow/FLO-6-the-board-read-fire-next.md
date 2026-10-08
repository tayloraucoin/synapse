# FLO-6 — The board: read, fire, next — the two pages, `use-workflow-board`, the optimistic toggle, the Next strip and the tab title, view tabs, lane collapse, loading, first open, offline, failure, the keyboard grid

**Epic:** FLO — Workflow · **Phase 3** · Size: L
**Slice type:** The first surface, and the core loop of the product on it. The risk class is *the working person's worst moment*: a toggle that waits, a toggle that ends in the state the person did not last choose, a *next* that disagrees between the row and the strip, a board that blanks.
**Vigil:** induce a slow network and a failing one on the toggle; emulate reduced motion; walk the notes' §5 loop.

**Status:** Complete (2026-10-04)

> **Vigil — full review, induced.** With the network throttled to slow 3G: press a toggle and confirm the mark, the words, *next* on the row and the strip all change before the request settles. Press the same toggle twice quickly and confirm the final state is the second press's. With requests to `workflow.task.setFiring` blocked: confirm the row and *next* revert and exactly one save-failure line shows. Offline: confirm toggles are disabled, not hidden, and the offline line shows. With reduced motion emulated: confirm no mark animates and every firing row still says *firing*. Then walk the notes' loop on seeded data — fire two tasks, the third is *next*; bring the first back, it is *next* again if it outranks; fire all, *Everything is firing.*; bring back a lower then a higher, the higher is *next*. State which of these you ran and which you could only read.
>
> **Vesper — the glance.** At 1280px beside another window: is the answer to *which one now* readable in about a second, from the strip alone and from the board alone? Is anything on the board louder than the next row?

---

## Outcome

Opening *Workflow* shows a real board: the person's views as tabs, the working view's columns across, their groups down as lanes in today's order, their tasks as rows. One press on a row's toggle marks it firing — the mark breathes, the title steps back, the minutes count — and one press brings it back. At every moment exactly one task carries the word *next*, the header names it, and the browser tab's title names it too. A lane folds and still says what is inside it. The keyboard reaches every row and takes the toggle. After this ships, **the loop in the notes' §5 can be walked end to end on seeded data.** Adding, editing and moving tasks from the screen is FLO-7; arranging views and columns is FLO-8.

## Why / intent

- **UX §1.1–§1.3** — the working state: one answer in under a second, one action per glance. **UX §2** — guardrails 1–5 and 8.
- **UX §3.1, §3.3, §3.4, §3.5 (collapse), §4 WF-01** — what is seen, the states table, the accessibility block, the keyboard table. Read them; this ticket cites and does not paraphrase the layout.
- **W6, W7, W8, TD-38** — two states; one *next*; `resolveNext` over the cache, re-run on every patch.
- **TD-39** — one cache entry, `workflow.board({ viewId })`; the `useDayList` pattern: patch, then mutate, revert on error, invalidate on settle.
- **TD-36** — the client sends the state it wants and its own `at`.
- **TD-44** — `/workflow` resolves to a view and never renders; the view id is the uuid; `markOpened` records the last view; the tab title must not fight `TimerTitle`.
- **Assessment §5** — the failure contract; its rows for the toggle, the unknown view, and offline are criteria here.
- **Ground truth (consumed):** `apps/web/components/day-list/use-day-list.ts` (`toggleDone` — the optimistic shape, the in-flight guard); `apps/web/lib/hooks/{use-now,use-online,use-roving-focus}.ts`; `apps/web/components/page-frame/`; `apps/web/app/(shell)/_components/timer-title.tsx`; `apps/web/lib/trpc/server.ts` (`getServerApi`); `@syn/ui` `Tabs`, `EmptyState`, `StatusLine`, `AppHeader`.
- **FLO-3** — `workflow.board`, `view.list`, `view.markOpened`, `task.setFiring`, `group.setCollapsed`. **FLO-4** — every composite and `ScreenFrame` `"board"`. **FLO-5** — the routes, the nav, the placeholder pages this ticket replaces.
- **What this slice is NOT (binding):** creating, editing, moving or archiving anything (FLO-7); *New view*, the view menu, the sheets, the compact column tabs (FLO-8); drag (FLO-9); a store; a subscription; a notification.

**Rulings this slice makes (labelled, logged):**

- **The latest press wins.** A second press on a row whose write is in flight is recorded as the wanted state and sent when the first settles, if it still differs. The row always shows the wanted state. The day list's guard drops the second press; this surface cannot, because the toggle is pressed in pairs. Logged.
- **Lanes are built in one place**: `orderGroupsForDay(board.groups, board.pinnedGroupIds)`, then the lane *No group* last when it holds a task in this view or there are no groups (UX §3.2). The same ordered list is passed to `resolveNext` and to the renderer, so the row and the strip cannot disagree. Logged.
- **One `now` for the board**, from `useNow`, passed to every `TaskRow`. Logged.
- **Compact shows the view's first column** until FLO-8 adds the column tabs. Logged.
- **Pressing a row writes `?sheet=task&id=`** through `useSheet`. No sheet is mounted until FLO-7; between the two tickets the press changes the URL and nothing else. Logged as a known interim.
- **The first-open empty state is its sentence only** (*Nothing in progress.*); its two actions arrive with the add rows in FLO-7. Logged.
- **The tab title is set by a client leaf local to the board page**, and yields to a running habit timer: while `TimerTitle` is showing a timer, the board does not write the title. Logged.
- **`g` and the strip do the same thing**: expand the lane if folded (an optimistic `group.setCollapsed`), scroll the row into view, focus it. Logged.

## Experience & states

Per UX §4 WF-01, items 1–4 of *what is seen*, less what FLO-7 and FLO-8 own.

**`/workflow`** — a Server Component: `workflow.view.list`, then redirect to `workflowViewRoute(lastOpenedId)`.

**`/workflow/{view}`** — a Server Component reads `workflow.board` and `workflow.view.list` through `getServerApi()` and passes both to the client leaf as initial data. An unknown or archived view redirects to `/workflow`. `PageFrame` with `contentWidth="board"`.

**Header.** `h1` *Workflow* · the view tabs (the existing `Tabs`, each a link; the current one selected) · the `NextStrip`.

**Board.** `Board` → for each lane a `BoardLane` with its `LaneHeader` (name, hue, `collapsed`, `firstToday` when pinned, `hasFiring` and `hasNext` computed for the fold) → a `BoardCell` per column → `TaskRow`s: `variant="active"` in the column whose role is `active`, `"closed"` in the one whose role is `done`, `"plain"` elsewhere. No menu slot yet.

**The toggle.** Press → patch the cached task (`firingStartedAt = at`, or `lastReturnedAt = at` and `firingStartedAt = null`) → *next* recomputes → `setFiring.mutate({ id, firing, at })`.

**Next.** `resolveNext` over the ordered lanes and the cached tasks. The row with that id gets `isNext`; the strip gets the group's name and the title; the polite live region says *Next: {title}* or *Everything is firing.* when the result changes after the first render; the tab title follows (UX §3.4).

**Keyboard** (the board region's own `keydown`, roving focus; UX WF-01's table, the rows that work in this ticket): `↑` `↓` previous / next row in the column across lanes · `←` `→` the neighbouring column's nearest row in the same lane · `Space` fire / back on an active row · `g` go to next · `[` `]` previous / next view. Each is added to `SHORTCUTS` under *Workflow*.

**States (exhaustive):**

| State | What is seen |
|---|---|
| Loading | `loading.tsx`: the frame, the `h1`, `BoardSkeleton`. Never a blank, never a spinner |
| A working day | The board, one *next* |
| Everything firing | The strip reads *Everything is firing.*; no row is next |
| The queue (no active column) | Plain rows, no toggles, no strip |
| First open | *No group* with no rows; the sentence *Nothing in progress.* |
| A view with no tasks | The lanes, empty cells, no message |
| A folded lane | Its head only, with the mark and/or *next* when true |
| Toggle fails | The row and *next* revert; the save-failure sentence once, inline |
| Offline | The standard offline line inline; toggles and the fold disabled, not hidden; rows still focusable |
| Unknown or archived view | Redirect to `/workflow` |

**Failure / edge states:** the board refetches on window focus and a task fired on another device appears firing, with *next* recomputed · the minute turns and durations update with no request · the person's day closes mid-session and the next refetch returns no pins — lanes reorder; no message · a refetch arrives while a toggle is in flight — the wanted state for that row is reapplied over the fresh data until the write settles.

## Non-negotiables (this slice)

- **The toggle never waits.** The row changes on the press.
- **The row and the strip are fed by one `resolveNext` result.** Nothing else decides what is next.
- **Exactly one *next*, or the one line that says there is none.**
- **One save-failure line per failure, the on-disk sentence; nothing red.**
- **The board never blanks.**
- **No count anywhere** — not in the header, a tab, a lane, a column head, the strip, or the tab title.
- **No store.** Server data in the query cache; the wanted-state map is local to the hook.
- **Page data through `getServerApi()`; client reads and writes through the `trpc` client.**

## Data & AI

**Schema changes: none.**

**Tables:** through FLO-3's procedures only — `workflow.board`, `workflow.view.list` (read); `workflow.view.markOpened`, `workflow.task.setFiring`, `workflow.group.setCollapsed` (write).

**Placement:** `apps/web/app/(shell)/workflow/page.tsx`, `workflow/loading.tsx`, `workflow/[view]/page.tsx`, `workflow/[view]/loading.tsx`, `workflow/[view]/_components/{workflow-board.tsx, use-workflow-board.ts, workflow-title.tsx, copy.ts}`; `apps/web/lib/keyboard/shortcuts.ts`. Route-local, not `components/<feature>/` — one route composes it (rule 9; assessment §4). The `copy.ts` FLO-5 put under `workflow/_components/` moves here or is imported; one home for the `h1`.

**tRPC / validators:** FLO-3's; nothing new.

**AI notes:** **None.**

## Accessibility

UX WF-01's accessibility block binds whole. The traps specific to this ticket:

- One polite live region, written only when *next* changes after first render. A toggle press therefore announces at most one line; a refetch that changes nothing announces nothing.
- Roving focus: one row in the board is in the tab order; arrows move it; `Tab` from the row reaches its toggle and then leaves the board. Everything is also reachable by `Tab` alone.
- `g` and the strip move focus to the next row and scroll it into view; when the lane was folded, focus lands after the lane opens.
- Keys are ignored while a field or a dialog has focus.
- The durations never announce.

## Acceptance criteria (observable — the local tier with FLO-3's seed, at 375px and 1280px, both themes; the induced conditions in the Vigil callout)

1. `/workflow` responds with a redirect to `/workflow/{id}` of the last-opened view; with none opened, the first.
2. `/workflow/{id}` for *Working* renders the seeded lanes in usual order with their tasks in cell order, the active column's rows with toggles, the done column's rows at 0.55 opacity, and no toggle in any other column.
3. Pressing an idle task's toggle, with the network throttled, shows the breathing mark, *firing*, and the receded title before the request completes; reloading the page shows it still firing with a minute count. *(Vigil.)*
4. With two tasks firing in the first lane and one idle below them, that third task carries *next* and the strip reads *Next* and the lane's name, a middot, and its title; bringing the first task back moves *next* and the strip to it in the same frame. *(Vigil.)*
5. With every active task firing, the strip reads *Everything is firing.*, is not a button, and no row has the next surface.
6. On *Queue*, no row has a toggle and no strip renders.
7. Two quick presses on one toggle (off → on → off) end with the task not firing, on screen and in the database, with at most two requests sent. *(Vigil.)*
8. With `setFiring` failing, the row returns to its prior state, *next* returns to its prior row, and one line reading the day list's save-failure sentence appears; nothing on the page is red. *(Vigil.)*
9. Offline: the offline line shows; each toggle is present with `disabled`; pressing does nothing.
10. Folding a lane that holds a firing task and the next task shows the mark and the word *next* on its head; the fold survives a reload; pressing the strip opens the lane and focuses the row.
11. A group pinned today (set through FLO-3's procedure) leads the lanes and its head reads *first today*; *next* follows the new order.
12. `document.title` is *Next: {title} — Synapse*, *Everything is firing — Synapse*, or *Workflow — Synapse* as the state dictates; with a habit timer running it is the timer's.
13. With reduced motion emulated, no element on the board has a running animation and every firing row shows the word *firing*.
14. `↓` from the last row of a lane's active cell focuses the first row of the next lane's active cell; `Space` on it toggles it; `g` focuses the next task; `]` navigates to the next view. Each of these keys appears on About → Keyboard.
15. Navigating to `/workflow/{id}` on a throttled network shows the skeleton board, never an empty `main`.
16. `/workflow/not-a-view` redirects to a real view; no error page.
17. `grep -rn "count\|length}" "apps/web/app/(shell)/workflow"` shows no rendered tally: no JSX expression prints a number of tasks, lanes, or views.
18. At 1280px the board spans the content area beside the rail (no 960px cap); at 375px the first column shows, rows edge to edge, and the page does not scroll sideways.
19. FLO-5's criteria 2, 3 and 8 still hold.
20. `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` pass (four separate commands).

## Likely-relevant technical notes (ADVISORY — dev decides)

- `use-workflow-board.ts` owns: the query (initial data from the server), `now`, the lanes, the cells (a `Map` keyed by `groupId ?? "none"` and `columnId`, built by filtering the ordered task array), `next`, the wanted-state map, `fire(id)` / `markBack(id)`, `setCollapsed`, and the error line. Keep it headless: the component composes, the hook decides.
- The wanted-state map: `Map<taskId, boolean>`; on press set it and, if no request for that id is in flight, send; on settle, if the map's value differs from what was sent, send again; otherwise delete the entry and invalidate. Apply the map over the cached data when deriving rows so a refetch cannot flicker a row back.
- `markOpened` once per view id, in an effect, not during render; it need not block or patch anything.
- `TimerTitle` shows how the title is written and when a timer is running; read it before writing `workflow-title.tsx`.
- The grep in criterion 17 is plain: array lengths used for logic are fine, but keep the word out of comments and do not render one.
- Next 16: `params` is async; `redirect` from a Server Component.

## Dev's call

How the wanted-state map is held (ref versus reducer) · whether the two pages share a loader · the live region's placement · the arrow-key geometry for `←` `→` when the neighbouring cell is empty (nearest non-empty cell in that direction, or stay — say which in the report).

## Out of scope

- **Add rows, the task sheet, row and lane menus, moves, *Start*, archive, *Closed earlier*, *First today* from the screen, the `n` and `Enter` and `Alt`+arrow keys** — FLO-7.
- ***New view*, the view menu, the Columns, New view and Archived sheets, the compact column tabs** — FLO-8.
- **Drag** — FLO-9.
- **A signal for a task left firing for hours** — not built (§13 #W6).

## Depends on

- **FLO-3** — the procedures and the seed. Complete in `PROGRESS.md`.
- **FLO-4** — the composites and the `"board"` width. Complete in `PROGRESS.md`.
- **FLO-5** — the routes and the nav. Complete in `PROGRESS.md`.

## Recommended execution

**Opus.** The optimistic toggle with a wanted-state map under refetch is the kind of code that works in the demo and flickers in use; a cheaper model drops the second press or lets a refetch snap a row back, on the control this product exists for.

---

### Kickoff (paste into the session)

> Build **FLO-6 — The board: read, fire, next** (attached spec). Model: **Opus**. **The toggle never waits and the latest press wins; one `resolveNext` result feeds the row and the strip; the board never blanks; no counts.**
> Attach/read first, in order: this spec · `docs/ux/workflow-ux-spec-v0.1.md` §1, §2, §3.1–§3.5, §4 WF-01, §5, §7, §8 · `01-technology-assessment.md` §3 (TD-36, TD-38, TD-39, TD-44), §5 · `apps/web/AGENTS.md` · root `AGENTS.md` · `docs/specs/README.md` § Placement rules 9–13 · `apps/web/components/day-list/use-day-list.ts`, `apps/web/lib/hooks/{use-now,use-online,use-roving-focus,use-sheet}.ts`, `apps/web/app/(shell)/_components/timer-title.tsx` (reuse, don't fork) · FLO-1, FLO-3, FLO-4, FLO-5 · this track's `README.md`, `DEVIATIONS.md` + `TECHNICAL-DECISIONS.md`.
> Compose FLO-4's components; write no row markup. Patch the one cache entry, then mutate; revert with the on-disk save-failure sentence. Induce the slow, failing, offline and reduced-motion conditions in the Vigil callout and say which you ran. Close in three places; log departures in `DEVIATIONS.md`. Run `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` as separate commands.
