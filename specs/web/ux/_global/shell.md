---
source:
  - docs/ux/epic2_in_use_ux_architecture.md §1 SH-00, "3.6 → 6.1 The late offer"
  - docs/ux/synapse_navigation_and_system_ux_architecture.md §1.2, §2, §10 SY-02, SY-06, SY-07
  - docs/ux/ux-spec-v1.1.md §6.6 (DYN-17)
  - code 3b252e7 (app/(shell)/layout.tsx, _components/app-shell.tsx, status-line-slot.tsx, components/page-frame/, @syn/ui status-line, toaster)
status: approved
promoted: 2026-10-09
---

# shell — _global

## Job

Hold the five peers and one status line around every signed-in screen, decide who may see it, and never get in the way. Done looks like: the page is readable in the first frame, the chrome says at most one thing, and a sheet owns the screen while it is open.

## Layout and components

`AppShell`: the skip link first in the DOM, `Sidebar` (rail) at 768px and above, `BottomNav` fixed to the bottom below it; both are rendered and one is hidden by CSS, so the first paint always has a navigation. Each page renders a `PageFrame`: an `AppHeader` (the one `h1`, back where pushed, the avatar that opens Settings, the date and _Today_ in record and plan modes), an `aside` _App status_ holding the `StatusLine`, then `main#main` with a `ScreenFrame` at `text` (720px), `canvas` (960px) or `board` (uncapped, Workflow only). Sheets are `ResponsiveSheet` through `SheetHost`; dialogs `ConfirmDialog` or `AlertDialog`; toasts the `Toaster`. The orient route renders bare: no rail, no tab bar, no header; the skip link stays. Primary action: none in the chrome; a status line's action is secondary text.

## States

Exactly one status line shows, in this order: offline, setup, pending review, late offer, update, time zone, install; the permission line is wired to `false` and never renders. Dismissals: setup for the session, late offer and time zone for the day, install forever; offline, pending review and update cannot be dismissed. The chrome is never load-bearing: when `shell.status` fails the page renders with no dot, no line and the address as the name.

| State          | Key              | What shows                                                                                                                                                                                                        | What the person can do                 | Copy                                                                           | Artboard | Evidence                                              |
| -------------- | ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- | ------------------------------------------------------------------------------ | -------- | ----------------------------------------------------- |
| empty          | `empty`          | N/A: the chrome has no empty state; a page's empty state is the page's                                                                                                                                            | —                                      | —                                                                              | —        | —                                                     |
| loading        | `loading`        | First paint carries the name and the Review dot from the server; the status line arrives with the client query, a beat later                                                                                      | Use the page                           | —                                                                              | —        | seen                                                  |
| error          | `error`          | `shell.status` failed: no line, no dot, the email as the name; the page still renders                                                                                                                             | Use the page                           | —                                                                              | —        | inferred: layout.tsx, shell-status-line.tsx           |
| partial        | `partial`        | N/A: the chrome is read in one query                                                                                                                                                                              | —                                      | —                                                                              | —        | —                                                     |
| offline        | `offline`        | The offline line, first in order, no dismiss; cleared when the browser reports online                                                                                                                             | Read; writes per `offline-and-sync.md` | _Offline — changes save on this device._                                       | —        | seen                                                  |
| success        | `success`        | The ordinary frame: navigation, header, no line                                                                                                                                                                   | Everything                             | —                                                                              | —        | seen                                                  |
| setup          | `setup`          | Setup owed: the line with _Finish_ and a dismiss; _Finish_ goes to the resumed step                                                                                                                               | Finish, Dismiss (session)              | _Setup isn't finished_ · _Finish_                                              | —        | seen                                                  |
| pending review | `pending-review` | The most recent closed, unreviewed day with waiting items; _Review_ opens that day's review; no dismiss                                                                                                           | Review                                 | _Yesterday has 3 items to review_ / _Thursday has 1 item to review_            | —        | inferred: shell-status-line.tsx                       |
| late offer     | `late-offer`     | Today only, when the orient frame was opened over 30 min after the wake target on a day set the night before with a hard anchor, no Adjust yet, day open; the action opens `?sheet=adjust&entry=late-offer`       | Adjust the morning, Dismiss (day)      | _Up later than planned_ · _Adjust the morning_                                 | —        | inferred: status.ts isLateWakeOffer                   |
| update         | `update`         | A newer service worker is waiting; no dismiss; _Reload_ takes over the new worker then reloads                                                                                                                    | Reload                                 | _A new version is ready._ · _Reload_                                           | —        | inferred: update-ready.ts                             |
| time zone      | `timezone`       | Device zone differs from the stored zone, setup done; _Switch_ opens the zone dialog (`system-states.md`); after a switch the line stays away for the day                                                         | Switch, Dismiss (day)                  | _Your device is in Europe/London. Synapse is on America/Vancouver._ · _Switch_ | —        | inferred: shell-status-line.tsx                       |
| install        | `install`        | Installable browser, not standalone, three reviewed days, setup done; _How_ fires the browser's own prompt on Android Chrome, else opens the steps sheet                                                          | How, Dismiss (forever)                 | _Synapse can be installed — it opens faster and gets reminders._ · _How_       | —        | inferred: use-installable.ts                          |
| sheet open     | `sheet`          | A sheet through `SheetHost`: `main` leaves the accessibility tree, the tab bar dims and is `aria-hidden`; two sheets are counted so the inner one closing keeps it dimmed; Workflow's sheets bypass this (Open 6) | The sheet; Esc or back                 | —                                                                              | —        | seen (Workflow, not dimmed); inferred: sheet-host.tsx |
| bare           | `bare`           | `/orient`: no rail, no tab bar, no header; the frame renders `main`                                                                                                                                               | The frame                              | —                                                                              | —        | inferred: app-shell.tsx                               |
| timer in title | `timer`          | A running timer puts _7:04 · Synapse_ in the tab title, restored on unmount                                                                                                                                       | —                                      | —                                                                              | —        | inferred: timer-title.tsx                             |
| toast          | `toast`          | One at a time, bottom centre, 4 s, no icon, no close; only for undo                                                                                                                                               | Undo                                   | _Applied Morning A_ · _Undo_                                                   | —        | inferred: toaster.tsx                                 |

## Words

Skip link _Skip to today's list_. Wordmark _Synapse_ (text, not a logo). Rail footer: the person's name, else the email. Status strings as above; the pending line names _Yesterday_ for the day before and the weekday for older days, _1 item_ singular. Nothing in the chrome is a question, an exclamation or second person; the late offer states a fact.

## Access

Landmarks in order: `banner` (the header, outside `main`), `complementary` _App status_, `main`, `navigation` _Main_ (the tab bar). The status line is `role="status"`, `aria-live="polite"`; its dismiss is an icon button named _Dismiss_ or _Dismiss for today_; its action is a text button. The skip link is the first focusable element and shows at the top-left on focus. Avatar: _Settings_. Under a hosted sheet nothing beneath is reachable by screen reader or tap. Reduced motion: the chrome has no motion.

## Instrumentation

None today; the chrome logs nothing.

## Criteria

| ID            | When                                                    | Then                                                                          | Evidence |
| ------------- | ------------------------------------------------------- | ----------------------------------------------------------------------------- | -------- |
| C-WEB-shell-1 | Offline and setup owed at once                          | Only the offline line shows; the setup line follows reconnect                 | capture  |
| C-WEB-shell-2 | 390 and 1440, light and dark                            | Tab bar below 768px, rail at and above; one `h1`; the four landmarks in order | capture  |
| C-WEB-shell-3 | A hosted sheet open at 390                              | `main` is `aria-hidden`; the tab bar is dimmed and inert                      | capture  |
| C-WEB-shell-4 | `shell.status` fails                                    | The page renders; no line, no dot                                             | manual   |
| C-WEB-shell-5 | The setup line dismissed, then a reload in the same tab | It stays away for the session; a new tab shows it                             | manual   |

## Decisions and open items

D-WEB-1 to D-WEB-3. Open 4, 6 and 7 in `overview.md`.
