# Cross-cutting — Technical Decisions (append-only)

One section per architectural choice that had real alternatives. Written when the decision is made. Format:

```
## YYYY-MM-DD · <ticket-id> · <the decision, as a statement>
**Context (as it was then):** …
**Options weighed:** A … B … C …
**Decision:** …
**Consequences:** what this buys, what it costs, what it forecloses.
**Revisit trigger:** the condition under which this should be reopened.
```

## 2026-09-05 · SYS-1 · The route owns its header and status line through a `PageFrame`; `AppShell` owns the navigations, the skip link, and `main`

**Context (as it was then):** The built `AppShell` (v2 handoff §5.2) takes `header` and `statusLine` props. A Next layout cannot receive props from its page, and the header changes per route (a date with a *Today* action on the List, a title with back on Settings). The document's order is header → status line → content on every screen.
**Options weighed:** A — a React context the page writes into (`useShellHeader(props)`) and the layout's `AppShell` reads; the header flashes empty on the first client render. B — a `PageFrame` app component the page renders as its first child: `<PageFrame header={<AppHeader …/>} dayKey>{children}</PageFrame>`, which renders the header, then the connected `ShellStatusLine`, then the content, all server-renderable; `AppShell`'s two props stay unused. C — one route group per header shape.
**Decision:** B. A renders a headless shell for a frame on every navigation, which is the "page with no way out" flash `AppShell`'s own doc block warns about. C multiplies layouts for a prop. The status line is still one component in one slot — `PageFrame` renders it, so the order holds and every page gets it for free.
**Consequences:** Buys server-rendered headers with the right title on first paint and one place the status-line sources are wired. Costs a divergence from the handoff's `AppShell` signature (two props unused — logged) and the rule that a page without `PageFrame` is a defect. Forecloses nothing.
**Revisit trigger:** React's `<Activity>`/streaming layout data making A flash-free, at which point the context is the cleaner shape.

## 2026-09-05 · SYS-1 · Sheets are nuqs query parameters pushed to history; the one addressable sheet path redirects to the query form

**Context (as it was then):** Cross-cutting §1.3: back closes the topmost sheet before leaving a screen; sheets are history states without a path change; the only addressable sheet is `/day/{date}/item/{id}` for notifications.
**Options weighed:** A — `history.pushState` with the same URL and a state object; nuqs unused. B — `?sheet=item&id=…` via nuqs with `history: "push"`; the path stays, the query changes; `/day/{date}/item/{id}` redirects to `/day/{date}?sheet=item&id=…` (or `/today?…`). C — real sub-routes for every sheet.
**Decision:** B. A survives back but not a reload or a share, and every sheet re-implements it. C changes the path, which the document forbids, and puts a sheet in a layout tree. A query string is not a path; it is the URL state the conventions §9 already send to nuqs.
**Consequences:** Buys back-closes-sheet on every platform, reload-safe sheets, and one hook (`useSheet`) every feature uses. Costs a redirect for the one addressable path and a `sheetOpen` context so `AppShell` can dim the tab bar. Forecloses nothing.
**Revisit trigger:** a sheet whose state does not fit a short query string (none foreseen — ids and names only).

## 2026-09-05 · SYS-1 · `shell.status` is one procedure returning every shell fact, read once per navigation

**Context (as it was then):** The tab bar's Review dot, the status-line slot's six sources, the header's avatar, and the record/plan mode all need small facts about the account and the day: pending count, setup step, late-offer eligibility, today's key and zone, the display name and avatar path.
**Options weighed:** A — one `shell.status` query, cached by TanStack, invalidated by the mutations that change its inputs (decide, finish, close, setDone on the first fixed item, updatePreferences). B — a query per fact. C — the layout reads them server-side and passes props down to every page.
**Decision:** A. B is six round trips per navigation for a dozen scalars. C cannot update when a mutation changes a fact without a full navigation. One query, one invalidation list, one place to add a fact (the late offer arrives in USE-6, the install eligibility in SYS-5).
**Consequences:** Buys a dot and a line that are right after every mutation. Costs an invalidation list every mutating ticket must extend when it changes a shell fact — stated in each ticket's advisory notes. Forecloses nothing.
**Revisit trigger:** a shell fact that changes on a clock rather than a mutation (the late offer does — it is re-derived client-side on the minute tick from `firstFixedStart`, which the procedure returns instead of a boolean).

## 2026-09-05 · SYS-2 · Applying a deferred zone or day-close re-lays untouched future days through the materialiser

**Context (as it was then):** The pending pair (Epic 1's decision) switches `users.timezone` or `day_close_time` from tomorrow. Days already materialised for tomorrow and later carry the old snapshot and absolute times computed under it; a person who planned 07:00 in Vancouver and lands in London expects 07:00 London tomorrow, not 15:00.
**Options weighed:** A — leave future days as materialised; the person sees odd times and fixes them by hand. B — on application, update each untouched future day's snapshot and re-run `materializeDay` for template days (and a wall-clock-preserving recompute for one-off-only days). C — snapshot nothing on `days`; always render in the user's current zone.
**Decision:** B. A breaks the plan the person made. C makes past days lie the moment the zone changes (cross-cutting §7.3's rule that a day renders in its own zone). B reuses the one materialiser and the one "untouched" predicate, so the record-integrity rules hold without a second implementation.
**Consequences:** Buys future days that read as planned in the new zone and past days that stay as lived. Costs a hook in the pending-pair application and the acknowledged oddity that a re-laid item's immutable `original_scheduled_start` is the old instant (harmless until a late start; revisit noted in SYS-2). Forecloses nothing.
**Revisit trigger:** the `original_scheduled_start` oddity reading wrong in use, at which point never-started future items may be deleted and re-inserted instead of updated.

## 2026-09-05 · SYS-1 · The page owns `main`; the shell owns the navigation around it

**Context (as it was then):** SYS-1 rules that `PageFrame` renders header → status line → children, that every `(shell)` page renders one as its first child, and separately that `AppHeader` must be a `banner` landmark with the status line `complementary` and the content `main` (cross-cutting §3.4). `AppShell` as INF-7 left it already rendered `<main>` around its children — which is where the pages, and therefore their headers, go.

**Options weighed:** A — leave `main` in `AppShell` as the ticket's implementation note says, and accept a `<header>` nested inside `main`, which is not a banner landmark at all (and which an accessibility audit flags as a landmark inside a landmark). B — leave `main` in `AppShell` and give `AppHeader` an explicit `role="banner"`; the role is honoured, but a banner nested in main is still malformed and reads as one. C — hoist the header out of the page by having `PageFrame` register it in context for `AppShell` to render; a child cannot pass content upward in one pass, so this is a state write during render and a second paint. D — move `main` into `PageFrame`, so the page renders the whole column: banner, complementary, main, as siblings.

**Decision:** D. The landmark requirement is an accessibility floor and the `main`-in-`AppShell` line is an implementation detail, so when the two collide the detail yields. B is the tempting one and is worse than it looks: it satisfies a checklist while leaving the document structure wrong, which is precisely the kind of accessibility that works in an audit and not in a screen reader. C pays a re-render on every navigation to preserve a file boundary.

**Consequences:** Buys the three landmarks in the relationship the document describes, with the skip link still first in the DOM and still targeting `#main`. Costs a real invariant: **a `(shell)` page that does not render a `PageFrame` has no `main` landmark and a dead skip link.** That was already the rule — the frame is where the header, the one `h1`, and the status line come from — but it now fails visibly rather than silently, which is the better direction for a rule to fail in. `AppShell` keeps the skip link, both navigations, and the sheet dimming; its `header`, `statusLine` and `contentWidth` props are gone rather than left unused, so nothing can pass them and wonder why nothing happened.

**Revisit trigger:** a `(shell)` route that legitimately renders no header — a full-bleed canvas, say. It would still need `main`, so the answer would be a second frame component rather than moving `main` back.

## 2026-09-06 · SYS-2 · A promoted setting may move the day key forward, never backward

**Context (as it was then):** `resolveTodayFor` answers "has tomorrow arrived" with the OLD zone and close time — deliberately, so a westward move cannot apply its own switch a day early — and then recomputes `todayKey` with whatever is now in force. Probing SYS-2 AC 7 showed the recompute is not safe in one direction: raising the close time from 03:00 to 05:00 makes 04:30 on the boundary day belong to tomorrow under the old rule (so the change is due) and to the day BEFORE under the new one. The person opens the app and the day they have been living since 03:00 disappears, with every item they ticked on it.
**Options weighed:** A — promote, then clamp the key so it never precedes the key the promotion decision was made against. B — defer a close-time promotion until the instant satisfies both the old and the new rule, i.e. wait until 05:00. C — treat the day key as the old value for the rest of that day and apply the new close from the following boundary, stored as a third pending state.
**Decision:** A. B leaves `users.day_close_time` un-promoted through a window the person is already past, so `/settings/day` keeps saying *Applies from tomorrow* on a tomorrow that has arrived; it also has to re-derive the wait on every request. C is a third state machine for a two-hour window. A is one comparison at the one place the two rules can disagree, and it states the rule the product already believes: a day that has been lived does not un-happen.
**Consequences:** Buys a day key that only ever advances. Costs a deliberate asymmetry — a promotion that moves the key FORWARD is allowed through, because a westward flight genuinely does start the next day early, and clamping that would strand the person in yesterday. Forecloses nothing.
**Revisit trigger:** a setting that legitimately shortens the current day. None exists; `day_close_time` and `timezone` are the only two deferred values.
