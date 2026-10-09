---
source:
  - docs/ux/synapse_navigation_and_system_ux_architecture.md §1–§4
  - docs/ux/epic2_in_use_ux_architecture.md §0.2; epic1_setup_ux_architecture.md §0.4, §0.5
  - docs/ux/workflow-ux-spec-v0.1.md §5 (W1, W15, W16)
  - code 3b252e7 (app/(shell)/_components/nav-items.ts, tab-bar.tsx, rail.tsx, lib/entry/, lib/hooks/use-back.ts, use-global-shortcuts.ts, lib/keyboard/shortcuts.ts, components/shortcuts-host/)
status: approved
promoted: 2026-10-09
---

# navigation — _global

A rules file: how the app is navigated and where it opens.

## Job

Get the person to today's list, or wherever they were going, with nothing to learn: five word peers in one order, a back that never leaves the app, and an entry tree that decides once per document load.

## Layout and components

`BottomNav` (compact) and `Sidebar` (wide) read one list, `NAV_ITEMS`; `AppHeader` carries back and the avatar; `ShortcutsDialog` lists `SHORTCUTS`. Hrefs come from `lib/routes.ts` only.

## States

| Case                            | What shows                                                                                                                                                                     | What the person can do                                                                   | Evidence                            |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------- | ----------------------------------- |
| The peers                       | _List · Schedule · Review · Workflow · Settings_, in that order, both navigations                                                                                              | Tap any; a dot on _Review_ when days wait for review; never a dot or count on _Workflow_ | seen                                |
| Active tab                      | A prefix rule: a Workflow path is Workflow; `/settings*` Settings; `/review*` Review; a path ending `/schedule` Schedule; everything else List, so `/day/{date}` lights _List_ | —                                                                                        | seen (Workflow, Settings, List)     |
| Re-tap the active tab           | No navigation; the List and the Schedule scroll to now                                                                                                                         | Tap again                                                                                | inferred: use-scroll-memory.ts      |
| Tab state                       | Each tab keeps its scroll position for the session (`sessionStorage`), restored on mount                                                                                       | Switch away and back                                                                     | inferred: use-scroll-memory.ts      |
| Header back                     | Shown where a screen was pushed over another; with in-app history it pops, with none it replaces to the parent (Settings by default) so back never leaves the app              | Tap, or browser back                                                                     | seen (About → Settings)             |
| Sheets and back                 | A sheet is `?sheet=<name>&id=` pushed into history; browser or system back closes it before leaving the screen; one sheet per route                                            | Back, Esc, the sheet's own close                                                         | seen (Workflow task sheet)          |
| Entry: no session               | A document load of a shell route goes to `/signin?next=<path and query>`; `/` shows the landing                                                                                | Sign in; the path is honoured after                                                      | seen                                |
| Entry: unverified email         | `/verify`, before anything else                                                                                                                                                | Verify                                                                                   | inferred: require-verified-email.ts |
| Entry: setup owed               | `/setup/{step}`; a stored step above 5 resumes at 4; the launch limit of three never passes because the counter never increments (Open 1)                                      | _Finish later_ leaves; the status line and Settings offer it again                       | seen                                |
| Entry: Workflow exempt          | A Workflow target skips the orient branch (permanent, W16) and, since 2026-10-06, the setup branch (temporary, Open 3)                                                         | Use the board                                                                            | seen                                |
| Entry: orient                   | Setup done, today has no wake and is not closed: `/orient` before any tab, once per day; a deep link waits behind it; a day auto-closed before the frame was opened skips it   | Open the frame                                                                           | inferred: resolve-entry.ts          |
| Entry: deep link or today       | The sanitised intended path, else `/today`; pending reviews never redirect                                                                                                     | —                                                                                        | inferred: resolve-entry.ts          |
| The gate runs on document loads | A tab tap inside the shell does not re-run the tree: with setup owed, _List_ and _Settings_ render from the board                                                              | —                                                                                        | seen                                |
| Standalone resume               | The installed app over an hour in the background replaces to `/`, which re-runs the tree                                                                                       | —                                                                                        | inferred: resume-guard.tsx          |
| `1` `2` `3` `4` `,`             | List, Schedule, Review, Workflow, Settings                                                                                                                                     | Press, no modifier                                                                       | seen (`,` and `1`)                  |
| `t`                             | Scroll to now on the List or Schedule                                                                                                                                          | Press                                                                                    | inferred: use-global-shortcuts.ts   |
| `n`                             | On `/today*` or `/day/*`: pushes `?sheet=one-off`; on a Workflow board: replaces to `?add=1`, the first lane's add row; elsewhere nothing                                      | Press                                                                                    | inferred: shortcuts-host.tsx        |
| `?`                             | The _Keyboard shortcuts_ dialog, every row of `SHORTCUTS`; at any width a keyboard reaches (Open 8)                                                                            | Esc closes                                                                               | seen                                |
| `Esc`                           | Radix closes the topmost sheet or dialog; the host never handles it                                                                                                            | —                                                                                        | seen                                |
| Suppressed keys                 | Nothing fires with a modifier held, or while focus is in a field, a select, an editable, or any dialog                                                                         | —                                                                                        | inferred: use-global-shortcuts.ts   |

## Words

Tab labels _List · Schedule · Review · Workflow · Settings_; the Review dot's hidden text _items waiting_; dialog title _Keyboard shortcuts_; the shortcut labels as `lib/keyboard/shortcuts.ts` lists them (the About table renders the same array). Back's accessible name _Back_; the avatar's _Settings_.

## Access

Tab order: the skip link, then the rail (wide) or the header, status line, `main`, then the tab bar (compact). Both navigations carry `aria-label="Main"`; the tab bar is a `navigation` of links with `aria-current="page"` on the active item (SYS-1's call, not a `tablist`); the rail is a region without a landmark (Open 5). A tab switch moves focus to the new page's `h1` (`tabIndex=-1`); opening or closing a sheet does not. Dialogs trap focus. No shortcut is shown as a badge on a control. Reduced motion: no motion is involved in navigation.

## Instrumentation

None today.

## Criteria

| ID                 | When                                                                            | Then                                                                                            | Evidence |
| ------------------ | ------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | -------- |
| C-WEB-navigation-1 | Any shell route at 390 and 1440                                                 | Five peers in the stated order; the active one matches the prefix rule; no dot ever on Workflow | capture  |
| C-WEB-navigation-2 | A document load of a shell route with setup owed                                | Lands on `/setup/{step}`; `/workflow` does not                                                  | manual   |
| C-WEB-navigation-3 | `1` `2` `3` `4` `,` `?` pressed with no field focused; then inside a text field | Each navigates or opens; nothing fires inside the field                                         | manual   |
| C-WEB-navigation-4 | A screen opened from a link with no in-app history, then back                   | Replaces to the parent; the app is not left                                                     | manual   |

## Decisions and open items

D-WEB-1 to D-WEB-4. Open 1, 3, 5, 8 in `overview.md`.
