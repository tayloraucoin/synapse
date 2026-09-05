# Cross-Cutting UX Architecture — Navigation, Platform, System Behaviour & Record Lifecycle

**Product:** Synapse
**Author:** Vesper
**Date:** 4 Sept 2026
**Governs:** everything that isn't a single screen — how the app is navigated on mobile and desktop, how it decides where to open, how it behaves as an installed PWA, offline and across devices, at day and week boundaries and across time zones, what can be edited when, and the handful of screens the three epics didn't own. It also audits coverage: every record type's full lifecycle, with the screen that owns each step, and the gaps closed here.
**Authority:** the official spec first; the three epic documents for their own screens; this document for everything between them.
**Next consumer:** the UI designer (shell, navigation, and system-state components — inventory in §12) and the tech team (routing, sync, and time rules — §4, §6, §7, §8).

---

## 0. What this document adds

| Area | Was it specced? | Where | What this document does |
|---|---|---|---|
| Settings and every CRUD surface | Yes | Epic 1 §3–§7 | Coverage matrix (§9) confirms each lifecycle step and closes three gaps |
| Tabs and the day header | Yes | Epic 2 §1–§3 | — |
| Navigation model, mobile vs. desktop | Partly (shell only) | Epic 2 SH-00 | §1–§3: full model, breakpoints, containers, back, keyboard |
| Routing, deep links, entry logic | No | — | §4 |
| PWA install and platform behaviour | Only notifications | Official §8 | §5 |
| Offline, sync, multi-device | Named per screen | all epics | §6: one contract |
| Time zones, DST, day/week boundaries | Partly | Official §6.1 | §7 |
| Record integrity (what is editable when) | Scattered | all epics | §8: one rulebook |
| About, feedback, update available, session expiry | No | — | §10 |
| Accessibility navigation (landmarks, focus order) | Floor only | Official §11 | §3.4, §11 |

---

## 1. Navigation model

### 1.1 The shape
Synapse has one signed-in surface with three peers — **List**, **Schedule**, **Review** — and one door — **Settings**. Everything else is reached from one of those four and returns to it. There are no other top-level destinations, no hamburger, no "more".

```
                ┌──────────── Settings (door) ────────────┐
                │  Account · Habits · Templates · Week ·   │
                │  Categories · Reasons · Notifications ·  │
                │  Day & time · Appearance · Calendar ·    │
                │  Your data · Share · About               │
                └──────────────────────────────────────────┘
      List ◄──────────► Schedule ◄──────────► Review        (peers)
        │                  │                    │
   day header sheet   day header sheet     Day / Week / History
   item sheet         item sheet
   expanders          shift band detail
```

Depth is capped: from any peer, the deepest a person can be is **peer → screen → sheet → sub-sheet** (e.g. Settings → Templates → Template editor → Slot sheet → Habit sheet is the single exception at depth four, and it returns cleanly). Nothing opens a sheet over a sheet over a sheet.

### 1.2 Containers, and which content uses which
Three containers, used consistently so the body learns them:

| Container | Mobile | Desktop | Used for |
|---|---|---|---|
| **Screen** | full viewport, header with back | fills the content area, header with back | lists, canvases, sequences, the three peers, review surfaces |
| **Sheet** | bottom sheet, drag handle, up to 90% height, scrolls inside | right-side panel, 420px, over the content, scrim | create/edit forms, the item sheet, the day header sheet, choosers |
| **Dialog** | centred, ≤ 320px wide | centred, ≤ 420px | confirmations, the three-option apply dialog, the discard prompt |

Sheets never navigate: closing a sheet always returns to exactly what was beneath it, scroll position intact. Screens navigate: opening one pushes; back pops.

### 1.3 Back
- **Mobile:** system back (Android gesture/button, iOS edge swipe) and the header back do the same thing: close the topmost sheet if one is open, otherwise pop the screen. On a peer with nothing open, back does nothing (it does not exit the app on iOS; on Android the second back within 2 s exits, per platform convention).
- **Desktop:** browser back follows the same stack — sheets are in history as a state, so back closes a sheet before leaving a screen. The header back is also present.
- **Dirty state:** back on a dirty form triggers the discard prompt (Epic 1 §10); canvases autosave and never prompt.
- **Sequences (first run):** back moves to the previous step and never leaves the sequence; *Finish later* is the exit.

### 1.4 Where "home" is
The List, today. Every notification, every link with no path, and every sign-in lands there unless §4.2 routes elsewhere.

---

## 2. Mobile and desktop

### 2.1 Breakpoints
Two layouts, one break: **compact** under 768px CSS width, **wide** at 768px and above. `[VESPER CALL: one break, because the product has one content column; tablets in portrait get compact, tablets in landscape get wide.]` Text scaling up to 200% is handled by reflow within each layout, not by switching layouts.

### 2.2 Compact (phones, small tablets)
- Header: title region left, avatar right, 56px. Safe-area insets respected (notch, home indicator).
- Tab bar: bottom, three word tabs, 56px + safe area. Hidden while a sheet is open? No — dimmed under the scrim, still visible, not tappable `[VESPER CALL: keeps the sense of place]`.
- Status line: directly under the header, full width.
- Content: single column, edge-to-edge rows, 16px horizontal padding.
- Sheets: bottom, drag-to-dismiss, the footer actions pinned above the safe area.
- Settings: a screen pushed over the current peer; its sections are screens pushed over it.
- One-handed reach: every primary action sits in the lower half (sheet footers, the *Day Complete* action at the list's end, the bottom tab bar). Nothing that must be tapped in execution mode lives in the header except the day header itself.

### 2.3 Wide (desktop, tablet landscape)
- Left rail: 220px, the three peers as word rows with the Review presence dot, Settings as the last row (with the avatar), the wordmark at the top. The rail is not collapsible in v1.
- Content area: max 720px for lists and reviews, 960px for the Schedule and the template editor and the week build (the three canvases); left-aligned within the area, not centred, with 32px padding. Prose never exceeds 64ch.
- Sheets: right-side panel 420px, over the content with a scrim; the content beneath stays visible and scrolled where it was. The item sheet on the Schedule opens beside the axis so the block stays in view.
- Dialogs: centred.
- Settings: the rail row opens the Settings index in the content area; sections open in the same area with a back; no second rail.
- Week build on wide: seven columns; the day sheet opens as the right panel beside them.
- Keyboard: §3.

### 2.4 What changes between them (and only this)
Container placement, rail vs. tab bar, canvas widths, and keyboard affordances. Copy, order, states, and actions are identical. A person who learned the phone knows the desktop.

---

## 3. Keyboard and focus (wide, and external keyboards on compact)

### 3.1 Global shortcuts (desktop only; never shown as badges — listed on About → Keyboard)
- `1` / `2` / `3` — List / Schedule / Review · `,` — Settings
- `t` — scroll to now (List: the now/soon row; Schedule: the now line)
- `n` — Add a one-off (today)
- `Esc` — close the topmost sheet or dialog
- `?` — the shortcut list (a dialog)
`[VESPER CALL: single keys, no modifiers, because nothing in the app has a text field focused by default on the peers; shortcuts are suppressed while any input has focus.]`

### 3.2 Within the List and Schedule
- `↑` / `↓` — move focus between rows/blocks in time order · `Space` — toggle done on the focused row · `Enter` — open the item sheet · `s` — start/stop the timer on the focused row.
- Focus ring: 2px accent, 2px offset, on the whole row.

### 3.3 Within forms and sheets
- Tab order follows reading order as written in each epic's *Reads* list; the primary action is last; `Enter` in a single-line field submits the form; `Cmd/Ctrl+Enter` submits from a textarea.
- The 1–7 stepper is a radiogroup: `←`/`→` move, number keys `1–7` select directly.
- Segmented controls are radiogroups with arrow keys.
- Time pickers use the native control's keys.

### 3.4 Landmarks and focus management
- `banner` (header) · `navigation` (tab bar / rail) · `main` (content) · `complementary` (status line) · `dialog` for sheets and dialogs with `aria-modal`, focus trapped, initial focus on the first field or, for the item sheet, on the title.
- On closing a sheet, focus returns to the element that opened it.
- On tab switch, focus moves to the new peer's header title.
- Live regions: toasts `polite`; the status line `polite` on change; timers and the now line `off`.

---

## 4. Routing and entry

### 4.1 Routes
Human-readable, shallow, stable — every screen in the three epics has one so notifications, the desktop address bar, and support can point at it.

| Route | Screen |
|---|---|
| `/` | resolves per §4.2 |
| `/signin` · `/signup` · `/verify` · `/forgot` · `/reset` | AU-01…05 |
| `/setup/{1–5}` | FR-01…05 |
| `/today` · `/today/schedule` | LS-01 · SC-01 (today) |
| `/day/{YYYY-MM-DD}` · `/day/{date}/schedule` | the same tabs for a past day (read/edit per §8) |
| `/day/{date}/item/{id}` | IT-01 opened over the List for that day |
| `/review` | RV-00 |
| `/review/day/{date}` | DR-01 |
| `/review/week/{YYYY-Www}` | WR-01 |
| `/review/week/{week}/habit/{id}` | WR-02 |
| `/review/history` | HS-01 |
| `/settings` and `/settings/{account|habits|templates|week|categories|reasons|notifications|day|appearance|calendar|data|share|about}` | ST-00 and sections |
| `/settings/habits/{id}` · `/settings/templates/{id}` · `/settings/week/{YYYY-Www}` | LB-02 (edit, as a panel over the list on wide; as a screen on compact) · TP-02 · WK-01 |
| `/invite` | AU-02 with the invite line (the shared link) |

Sheets are addressable only where a notification needs them (`/day/{date}/item/{id}`); otherwise they are history states without a path change.

### 4.2 Entry decision tree (every cold open, and every `/`)
1. No session → `/signin` (or `/invite` if that's where the link pointed; remember the intended route and return to it after sign-in).
2. Session, email unverified → `/verify`.
3. First run incomplete → `/setup/{resumed step}`. `[VESPER CALL: on the first three launches only; after that, land on `/today` with the resume status line, so a person who deliberately skipped setup isn't dragged back every time.]`
4. A notification launched the app → its landing (Epic 2 §9).
5. Otherwise → `/today`.
Pending reviews never redirect; they surface as the status line and the Review dot.

### 4.3 Tab state
Each peer keeps its scroll position and any expanded expander for the session. Switching days (via a `/day/{date}` route from Review) shows the date in the header with a *Today* action to return; the tab bar still says *List* and *Schedule*.

---

## 5. PWA and platform

### 5.1 Install
- Not prompted at first run. Offered once, from Settings → Notifications on iOS (because push needs it) and from a one-line status message on any platform after the third day with a reviewed day: *Synapse can be installed — it opens faster and gets reminders.* [*How*] · dismiss (never returns). `[VESPER CALL: the third reviewed day is the first moment the person has shown they're using it, which is the only honest moment to ask for a place on their home screen.]`
- *How* opens a per-platform instruction sheet: iOS (Share → Add to Home Screen), Android (the install prompt, triggered directly when available), desktop (the browser's install action). No screenshots in v1; numbered steps, because they are a sequence.
- Manifest: name *Synapse*, short name *Synapse*, display `standalone`, orientation `portrait` on compact (landscape allowed on wide), theme colour neutral-50 / neutral-900 by theme, background colour the same, the app mark per official spec §9.8.

### 5.2 Standalone behaviour
- No browser chrome; the header carries back. Safe areas respected.
- External links (the OS notification-settings instructions, the export download) open in the system browser.
- The app resumes where it was if backgrounded for under an hour; after that it re-runs §4.2 (which lands on today).

### 5.3 Platform differences to design around, stated once
- iOS: push only when installed; no persistent timer notification (N8); no notification action buttons on older versions — the body tap still lands correctly; the time picker is the wheel.
- Android: full push with actions; N8 supported; the install prompt is available.
- Desktop: push supported in Chrome/Edge; N8 supported; keyboard shortcuts active.
The interface never mentions the platform by name except in the notification status line and the install sheet.

### 5.4 Update available
When a new service worker is waiting: a status line *A new version is ready.* [*Reload*] — non-dismissable, but it never interrupts; the reload happens only on tap, and a running timer survives it (state is persisted locally first). `[Screen SY-02, §10.]`

---

## 6. Offline, sync, and multiple devices — the UX contract

### 6.1 What works offline (Phase 2 target; Phase 1 blocks writes with the standard line)
Everything on the List and Schedule for the current day and any cached day: done/undone, start/stop/pause, not today, quantity, notes, reflections, manual time, shift, trim, set wake time. Day Review decisions are kept locally and finish when online. Setup screens are readable; writes wait.

### 6.2 What the person sees
- One status line: *Offline — changes save on this device.* Present the whole time; disappears when the connection returns and the queue is flushed.
- While flushing after reconnect: the line reads *Syncing…* for as long as it takes, then disappears. No count of pending changes `[a count is a worry, not information]`.
- A change that fails to sync after reconnect (a true error, not a network gap): the line reads *Some changes couldn't sync.* [*Details*] → a sheet listing the affected items by title and time with *Try again* per item and *Discard* per item. `[SY-03, §10.]`

### 6.3 Conflicts (two devices, same day)
Rules, in plain terms, for the tech spec to implement and for the interface to reflect:
- Per-field last-write-wins, except: `done_at` keeps the **earlier** value (you did it once; the earlier record is the honest one); `timer_sessions` merge as a set; `notes` concatenate with a line break if both changed; a Miss written by a Day Review on one device wins over a Miss inherited from a shift on another.
- The interface never asks the person to resolve a conflict. If a merge changed something visible on the screen they're looking at, the row updates in place with a 5-second inline word *updated* in the state slot.

### 6.4 Timers across devices
A timer started on one device shows as running on the other once synced, with the same elapsed time; either device can stop it. Two timers started on two devices for the same item merge into one session spanning the earlier start to the later stop.

---

## 7. Time: zones, DST, and boundaries

### 7.1 The day
A Day is keyed by its calendar date in the person's stored time zone and runs from `day_close_time` to `day_close_time`. Everything scheduled is stored as an absolute timestamp computed from the day's anchor in that zone.

### 7.2 DST
On the spring-forward night, the day is 23 hours; anything scheduled in the missing hour is moved to the first minute after it, with the row reading its new time and no other mark. On the fall-back night, the day is 25 hours; nothing repeats. Templates express offsets, so the next day is unaffected.

### 7.3 Travelling
- `users.timezone` is the person's stored zone, not the device's. When the device zone differs, a status line appears once per day: *Your device is in {zone}. Synapse is on {stored zone}.* [*Switch*] · dismiss. Switching changes the stored zone from **tomorrow**; today keeps its zone so nothing on the current day jumps. `[VESPER CALL: a mid-day zone change would make "moved" meaningless; deferring it to tomorrow keeps every record honest.]`
- Times on the List are always shown in the day's zone, never the device's, with a small zone label in the day header only while the two differ (*times in Vancouver*).

### 7.4 The week
Weeks start Monday in the stored zone. The Week Review closes when Sunday's day closes (Monday `day_close_time`) and every day is reviewed. Changing `day_close_time` in Settings takes effect from the next day boundary.

### 7.5 Changing the day close time
Settings → Day & time. Takes effect tomorrow; the helper says so: *Applies from tomorrow.*

---

## 8. Record integrity — what can be changed, when, and what it leaves behind

The rule in one line: **plans are editable until they become records; records are annotated, never rewritten.**

### 8.1 Per record type

| Record | Editable | By what | Immutable / leaves behind |
|---|---|---|---|
| Habit (library) | Always | LB-02 | Past DayItems snapshot title and icon; range/importance changes affect future slots only; archive never deletes |
| Category | Always | CT-02 | Past reports keep the name; delete unassigns from habits |
| Template | Always | TP-02/03 | Days already applied ask via TP-04; started/done/reviewed items on those days are never replaced |
| Week plan (future days) | Always | WK-01/02 | — |
| Week plan (today) | Template swap, anchor, one-offs | WK-02 | Started/done items stay; scheduled times recompute for untouched items |
| Week plan (past days) | One-offs only | WK-02 | Template and anchor read-only |
| DayItem scheduled time (today, template-derived) | **Not directly** | — | Only through a late start (ghost) or a shift (band). `[Deliberate: a per-item drag would erase the plan-vs-actual distinction. If in practice this hurts, the safe addition is a per-item "move to" that writes the same ghost as a late start.]` |
| One-off DayItem (today) | Time, title, priority, timing | WK-03 via the item sheet's *Edit* (gap closed, §9.3) | Editing the time after it's started or done writes a ghost like a late start |
| DayItem done state | Always, any day | Checkbox / IT-01 | Undo keeps sessions and notes; a past day's change stamps `review_edited_at` and recomputes the number |
| Timer sessions | Always | IT-02 | Manual edits are marked `source: manual` |
| Quantity, notes, reflections | Always | IT-01, DR-06 | — |
| Miss (attribution) | Always | DR-02/03 (edit mode) | Change is stamped; the Shift's own record is untouched |
| Shift | Undo within 10 min | SC-02 | After that, only a further shift; both are recorded |
| Capacity trim | Re-trim today | TR-01 | A new trim replaces the old; `capacity_min` history is not kept `[Consider: cheap to keep if the coach ever wants it]` |
| Day close | Reopen? **No** | — | A closed day is edited through the Day Review; it never "reopens" to the List's live state |
| Account fields | Always | ST-01 | Email change verifies first |
| Reason set | Always | ST-06 | Past Misses keep their reason text |

### 8.2 Past days on the List and Schedule
`/day/{date}` for a past date renders both tabs in a **record mode**: the header shows the date with *Today* to return; the now line is absent; checkboxes still toggle and the item sheet still opens (a past done/undone is a record edit, stamped); *Day Complete*, the day header sheet's shift and trim rows, and the late offer are absent; one-offs can be edited or removed (removal on a reviewed day asks: *Remove {title} from {date}? It was {outcome}.* — **Keep** · **Remove**, and the number recomputes). Future days render in **plan mode**: no now line, no checkboxes (a muted line: *Not until {weekday}*), the day header sheet offers only *Add a one-off*, and rows open a read-only version of the item sheet with a single action *Edit in week* → WK-02.

### 8.3 Archived things on old days
An archived habit's past DayItems render normally from their snapshot; the item sheet shows *archived* beside the type word. An archived template's name still appears in past day headers.

### 8.4 Deleting
Only three things are ever deleted: a one-off DayItem (by the person), a timer session (by the person), and the account (by the person, with everything). Everything else archives.

---

## 9. Coverage matrix and the gaps closed

### 9.1 Lifecycle coverage

| Record | Create | Read/list | Update | Archive/remove | Restore |
|---|---|---|---|---|---|
| Account | AU-02 | ST-01 | ST-01 | ST-10a (delete) | — |
| Habit | LB-02, FR-02, TP-03→LB-02, WK-03→LB-02 | LB-01, LB-03 | LB-02 | LB-01 archive | LB-01 archived section |
| Category | CT-02, LB-02 inline | CT-01 | CT-02 | CT-01 delete | — |
| Template | TP-02, FR-03, WK-02→TP-02 | TP-01 | TP-02, TP-04 | TP-01 archive | TP-01 archived section |
| Template slot | TP-03 | TP-02 | TP-03 | TP-02 remove (undo) | undo toast |
| Week plan / day | WK-01/02, FR-04, LS-00 | WK-01, LS-01, SC-01 | WK-02 | WK-02 remove template | — |
| One-off DayItem | WK-03, DH-01, LS-00 | LS-01, SC-01 | **WK-03 via IT-01 *Edit*** (gap, §9.3) | **IT-01 *Remove*** (gap, §9.3) | undo toast |
| DayItem state | LS-01, IT-01 | LS-01, SC-01, DR-01, WR-02 | IT-01 | — | — |
| Timer session | IT-01, IT-02 | IT-01 | IT-02 | IT-02 | undo toast |
| Miss | DR-03, SF-01 | DR-01, WR-02 | DR-02 Change | — | — |
| Shift | SF-01 | SC-01/02, WR-04 | — | SC-02 undo (10 min) | — |
| Trim | TR-01 | LS-02 | TR-01 | LS-02 Bring back | — |
| Reason | ST-06a, DR-03 keep | ST-06 | ST-06a | ST-06 archive | ST-06 archived |
| Reflection | IT-01, DR-06 | DR-01, WR-02 | same | — | — |
| Notification prefs | ST-07 | ST-07 | ST-07 | — | — |
| Day & time prefs | FR-01, ST-08 | ST-08 | ST-08 | — | — |
| Export | ST-10 | ST-10, HS-01 link | — | — | — |

### 9.2 Reads confirmed, no gap
Every list above has an empty, loading, error, and offline state in its epic. Every create/edit sheet has a discard prompt. Every archive has a restore.

### 9.3 Three gaps, closed here
**G1 — Editing a one-off from the day.** Epic 2's item sheet had no edit path for one-offs. Add to IT-01, for items with `origin: one_off` only: a text action *Edit* in the header row → WK-03 in edit mode for that item; and in the footer, before *Not today*, a text action *Remove* → dialog *Remove {title} from today?* — **Keep** · **Remove** (undo toast 5 s). Template-derived items show neither; their sheet header gains a muted line *From {template}* so the absence is explained.

**G2 — Past and future days on the tabs.** Neither epic defined the tabs for a non-today date, which Review links to. Defined in §8.2 as record mode and plan mode.

**G3 — The item sheet on a past day.** IT-01 opened from Epic 3's *edit* link had no stated behaviour. It is the same sheet in record mode: no *Not today*; *Done*/*Undo done* present; the header shows the date; any change stamps the day's review as edited and recomputes the number, and DR-01 reflects it on return.

Two more small ones, also closed:
**G4 — Where "Add a one-off" from the List puts the item.** Under the day part of its time, or *Anytime*; if it's for a future date (the date field in WK-03 is editable when opened from the day header — added: label *Day*, default today), it goes to that day's plan.
**G5 — Settings index counts while offline.** Show cached counts; never a spinner in a row.

---

## 10. Screens this document owns (SY)

### SY-01 About & feedback
**Job:** tell a friend what this is and give them one way to say something back.
**Entry:** Settings index, last row before Sign out: *About* — *Version, feedback, keyboard shortcuts*. **Exit:** back.
**Reads:** header *About* · *Synapse* · version line *{version} · {build date}* · body: *A private daily list. Habits, tasks, appointments, and deep work in one place, closed honestly each night.* · section *Feedback* — body *Something broken or confusing? Say so — it goes to the person who builds this.* · text field label *Message* (maxlength 1000) · an optional switch *Include which screen I'm on and my app version* (on by default; helper *Nothing from your list is included.*) · button *Send* · after send: *Sent. Thanks.* · section *Keyboard shortcuts* (wide only) — the §3.1/3.2 list as a plain table · section *Legal* — two text links *Privacy* · *Terms* (each a short static page; `[OPEN: copy — yours to write; the interface promise is already fixed by the trust line]`) · the trust line at the bottom.
**Interacts:** Message (required to send: *Write something first.*) · switch · Send (→ Edge Function → your inbox; no ticketing) · links.
**States:** sending · sent · error (*Couldn't send. Try again, or email {address}.*) · offline (Send disabled).

### SY-02 Update available (status line)
Per §5.4. *A new version is ready.* [*Reload*]. Reload persists local state first, then reloads; on return, the person is where they were.

### SY-03 Sync issues (sheet)
Per §6.2. Title *Some changes couldn't sync* · body *These were made on this device and didn't reach your account.* · rows: item title · the change in words (*marked done 7:24* · *timer 9 min* · *note*) · *Try again* · *Discard* · footer *Try all again* · *Close*.

### SY-04 Session expired
A dialog over whatever was open: *Signed out* / *Sign in again to continue. Anything you changed is kept on this device.* — **Sign in** → AU-01 → back to the same route. Never appears while a timer is running if the refresh can be done silently; if it can't, the timer keeps running locally and the dialog says so: *A running timer will be saved when you sign in.*

### SY-05 Error page (route not found / unrecoverable)
*This page isn't here.* / *The link may be old, or the day it points to hasn't been planned.* — **Open today**. For an unrecoverable client error: *Something went wrong on this screen.* / *Your changes are kept.* — **Reload** · **Open today**. Never a stack trace, never an error code in the copy (the code is logged, not shown).

### SY-06 Time-zone mismatch (status line)
Per §7.3. *Your device is in {zone}. Synapse is on {stored zone}.* [*Switch*] · dismiss. Switch → dialog *Switch to {zone}?* / *Today stays on {stored zone}. Tomorrow starts on {zone}.* — **Keep** · **Switch**.

### SY-07 Install (status line + sheet)
Per §5.1.

---

## 11. Accessibility navigation summary
Landmarks per §3.4; skip link *Skip to today's list* as the first focusable element on every screen; every screen has exactly one `h1` (the header title); sheets announce their title on open; the tab bar is a `tablist` on compact and a `navigation` list on wide; the Review dot is text for assistive tech (*items waiting*); status lines are `status` regions; the Schedule's axis is navigable by row with `aria-rowindex` per 15-minute band so a screen-reader user can move through the day in order; ghosts and shift bands are announced in sequence with their words (*planned*, *shifted +60 min, slept in*).

---

## 12. Interaction inventory (input to the UI component list)

| Element | Where |
|---|---|
| Left rail (wide): wordmark, three peer rows, Settings row with avatar, presence dot | §2.3 |
| Bottom tab bar (compact) with dimmed-under-scrim state | §2.2 |
| Header: title, optional date-with-*Today* action, zone label, back, avatar | §2, §4.3, §7.3 |
| Screen / Sheet / Dialog containers with the three placements | §1.2 |
| Status line variants: offline · syncing · sync issues · setup incomplete · pending review · late offer · update available · time-zone mismatch · install offer | §5–§7, Epic 2 |
| Skip link | §11 |
| Keyboard-shortcut table (About) and `?` dialog | §3.1 |
| Record-mode / plan-mode header treatment for non-today days; *Not until {weekday}* line | §8.2 |
| Read-only item sheet variant with *Edit in week* | §8.2 |
| Item sheet additions: *Edit* header action, *Remove* footer action, *From {template}* line, *archived* word | §9.3 |
| Sync-issues sheet rows with per-row Try again / Discard | SY-03 |
| Session-expired dialog · Error page (two variants) · Time-zone switch dialog · Install instruction sheet (three platform variants) | SY-04…07 |
| Feedback form (textarea, switch, send) · version line · legal links | SY-01 |

---

## 13. Calls made in this pass (flip freely)
1. One breakpoint at 768px; tablets in portrait are phones.
2. The tab bar stays visible, dimmed, under a sheet.
3. First-run redirect only on the first three launches; after that, the status line.
4. The install offer waits for the third reviewed day.
5. A device/stored time-zone mismatch is switched from tomorrow, never mid-day.
6. Template-derived items on today can't have their time edited directly — only late start or shift. The safe addition, if it hurts, is noted in §8.1.
7. `done_at` prefers the earlier value in a conflict.
8. Feedback goes to your inbox, no ticketing, with an opt-out for screen/version context and never any list data.
9. Single-key desktop shortcuts, suppressed while any input has focus.

## 14. Sign-off
Vesper — with this document the UX architecture is closed: every record has a full lifecycle with an owning screen, every route resolves, both layouts are defined from one model, every system state has words, and the five gaps between the epics are filled. Nothing here reopens a logged decision. The UI component pass can proceed from four inventories: Epic 1 §12, Epic 2 §11, Epic 3 §9, and §12 here.
