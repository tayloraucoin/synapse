---
id: "USE-4"
size: small
objective: "The signed-in app gets USE's shell: the rail from 1024 (Today, Week, Schedule) and BottomNav below it (Now, Schedule, Review), on one new breakpoint token, with useIsSplit as its JS twin"
slice_type: "app chrome and one design token; risks the switch landing at 768 or 1025 instead of 1024, both navs showing at once, a server render that guesses the width, and a tab that leads to not found"
non_negotiables:
  - "One new break only: --breakpoint-split: 1024px. --breakpoint-wide stays 768, and ResponsiveSheet keeps it."
  - "The rail shows from 1024 up; BottomNav shows below 1024, 768 to 1023 included (D-USE-74)."
  - "The chrome switches in CSS. useIsSplit never picks what the server renders."
  - "Only @syn/ui components and preset tokens (canon §2). The current tab is marked by more than colour."
  - "No Workflow (beta), no Settings tab, no Review dot."
  - "The auth gate in (shell)/layout.tsx behaves as USE-1 left it."
  - "Nothing live imports from _legacy/; a legacy part reused is git mv'd out first."
devs_call: "Icons for each item (lucide, through @syn/ui); file split inside _components/; the placeholder pages' one line; how the rail's footer reads the name and avatar."
cites:
  - "specs/web/epics/USE-daily-use/ux/work/overview.md"
  - "D-USE-39"
  - "D-USE-74"
  - "D-USE-89"
  - "D-USE-93"
  - "D-USE-99"
truth_files: "none: _global/shell.md and navigation.md are amended at USE's promotion (D-USE-99)"
qa: Q1
reviewers:
  - assay
focus:
  - "the rail and tabs at 402, 1023, 1024 and 1440 against the ledger's captures (assay)"
operator_review: false
planned_paths:
  - "packages/config/tailwind/preset.css"
  - "packages/ui/src/lib/use-media-query.ts"
  - "packages/ui/src/index.ts"
  - "apps/web/app/(shell)/_components/"
  - "apps/web/app/(shell)/layout.tsx"
  - "apps/web/app/(shell)/week/page.tsx"
  - "apps/web/app/(shell)/review/page.tsx"
  - "apps/web/app/(shell)/today/schedule/page.tsx"
  - "apps/web/lib/routes.ts"
  - "apps/web/docs/design/tokens.md"
  - "tests/use-shell.test.ts"
  - "specs/web/epics/USE-daily-use/tickets/USE-004-shell-rail-tabs/evidence/"
depends_on:
  - "USE-1"
out_of_scope:
  - "The avatar menu, Profile, Install and Settings: the account tickets (wave 2)"
  - "Each page's AppHeader, Today, the Week, Schedule and Review's content: their surface tickets (wave 2)"
  - "Focused screens with no chrome (Orient, Review the day, the welcome): each ticket adds its path to the shell's focused list"
  - "The List/Now label switch at Ready, go: the day-records wiring (wave 3)"
criteria:
  - id: C1
    statement: "preset.css defines --breakpoint-split: 1024px beside --breakpoint-wide: 768px, and useIsSplit matches (min-width: 1024px)"
    evidence: test
    command: "yarn test:root"
  - id: C2
    statement: "At 1440, the rail shows the Synapse wordmark, then Today, Week and Schedule, each with an icon and its word, the current one shaded; the avatar and name sit in its footer; no BottomNav shows"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-004-shell-rail-tabs/evidence/rail-1440.png"
  - id: C3
    statement: "At 1024 the rail shows and BottomNav does not"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-004-shell-rail-tabs/evidence/edge-1024.png"
  - id: C4
    statement: "At 1023 BottomNav shows Now, Schedule and Review, and the rail does not"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-004-shell-rail-tabs/evidence/edge-1023.png"
  - id: C5
    statement: "At 402, BottomNav sits at the foot with Now current, and nothing on the page is hidden under it"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-004-shell-rail-tabs/evidence/tabs-402.png"
  - id: C6
    statement: "Every rail item and tab lands on its route, /today, /week, /today/schedule and /review, with no not found, and the item for that route is current"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-004-shell-rail-tabs/evidence/routes.txt"
  - id: C7
    statement: "From the keyboard, the skip link comes first and reaches main; the rail's links follow in order, the current one with aria-current=page"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-004-shell-rail-tabs/evidence/keyboard.txt"
  - id: C8
    statement: "The web app and @syn/ui type-check"
    evidence: check
    command: "yarn check-types"
  - id: C9
    statement: "The web app and @syn/ui lint clean"
    evidence: check
    command: "yarn lint"
---

# Contract — shell-rail-tabs

## Build notes

Wave 1, after USE-1, parallel to USE-2. Every wave 2 surface renders inside this chrome.

- **Approach:**
  1. Add `--breakpoint-split: 1024px` in `preset.css`'s theme block beside `--breakpoint-wide`, so Tailwind 4 makes the `split:` variant.
  2. Add `useIsSplit()` beside `useIsWide()`, exported from the barrel. Amend the file comment's "there is no second breakpoint": there are two now, 768 for sheets and 1024 for the desk (D-USE-93).
  3. Write the new `AppShell`, `Rail` and `TabBar` in `(shell)/_components/`. Both navs render; CSS picks one (`hidden split:block`, `split:hidden`). The old shell in `_legacy/` is reference only.
  4. Mount `AppShell` in `(shell)/layout.tsx`, keeping USE-1's gate and providers.
  5. Add placeholder pages for `/week`, `/today/schedule` and `/review`, each one muted line in `@syn/ui`'s frame like USE-1's Today, plus route helpers in `lib/routes.ts`.
- **Decisions that apply:**
  - D-USE-99: the rail at the desk is Today, Week, Schedule; the phone's tabs are Now, Schedule, Review; Settings is reached through the avatar (D-USE-89). Workflow (beta) is dropped, a bend in `technical/calls.md`.
  - D-USE-93 and D-USE-83: one break for the desk, `--breakpoint-split: 1024px` in `preset.css`. The rail the app builds from 768 moves to 1024.
  - D-USE-74: 768 to 1023 keeps `BottomNav`.
  - D-USE-39: the rail (`--rail-w`, 220 px) stays during go mode. The current item is shaded `--color-surface`. Order is fixed; each item is a link with an icon and its word.
  - work/overview.md: the avatar and name sit in the rail's footer.
- **Interfaces:**
  - `useIsSplit(): boolean` from `@syn/ui`.
  - `AppShell({ user, firstTab?: "Now" | "List", children })`. `firstTab` defaults to "Now"; the day-records wiring passes "List" before Ready, go (day/overview.md).
  - `nav-items.ts`: `RAIL_ITEMS`, `TAB_ITEMS`, `tabForPath`, `isFocusedPath`. The focused list starts with `/orient` and `/today/review`; a focused path renders with no rail and no tabs.
  - `weekRoute()` and `reviewRoute()` in `lib/routes.ts`; `todayScheduleRoute()` stays.
- **Per path:**
  - `tokens.md`: a line for `--breakpoint-split`.
  - `tests/use-shell.test.ts`: reads `preset.css` and `use-media-query.ts` as text for C1, with the test named after it.
  - `evidence/`: the captures, taken in the browser pane with fixtures off. `routes.txt` lists each link, its URL and what rendered. `keyboard.txt` is the focus order read from the accessibility tree.
- **Captures to match:** `ux/work/today/captures/running-1728.png` (the rail) and `running-402.png` (the tabs). Paper file `01M49AX02VV4SSBKNCN6NRTS6Y`, page "USE — work" (p-6-0).
- **Gotchas:**
  - Use `Sidebar` with `collapsible="none"`. Otherwise shadcn's own mobile sheet switches at 768.
  - The rail's footer is the avatar and the name, not a control. The avatar-menu ticket makes it the menu's trigger, so this ticket ships no dead button.
  - The old layout read `api.shell.status()`, and USE-1 moved that router. Read the name and avatar through `user` instead, in a try/catch: the chrome never blocks a page.
  - Pad `main` by `--tabbar-h` below 1024 so the bar never covers content.
- **Model:** Opus 5.5 at medium. A smaller model switches the navs with `useIsSplit` (a flash, and a wrong server render) or keeps the 768 rail.
