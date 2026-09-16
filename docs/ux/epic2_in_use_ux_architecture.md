# Epic 2 — In Use: UX Architecture & Interaction Design

**Product:** Synapse
**Author:** Vesper
**Date:** 4 Sept 2026
**Governs:** everything a person sees and touches while moving through a day — the app shell, the Plain List, the Schedule, the item sheet, timers, multitask, late starts, shift-my-day-forward, the capacity trim, closing windows, and where a push notification lands. The official spec (`ux-spec-v1.md` §5, §6, §8, §9.7, §10) is the authority above this document; Epic 1 (`epic1_setup_ux_architecture.md`) owns every screen this one links out to.
**Next consumer:** the UI designer, via the inventory in §11.

---

## 0. How this document works

Same record format as Epic 1 (ID · Job · State/budget · Entry/Exit · Reads · Interacts · States · Done when). IDs: `SH-` shell, `LS-` list, `DH-` day header, `IT-` item sheet, `SC-` schedule, `SF-` shift, `TR-` trim, `PN-` notification landings.

### 0.1 The execution budget, stated as rules
These two tabs are used by someone who has explicitly asked not to think. Every rule below is a consequence of that, and every screen in this epic is checked against them.

1. **One decision per touch.** A tap either does the thing (done, start) or opens the one sheet that holds the rest. No two-step confirmations on the tabs except undo, which is passive.
2. **Nothing asks a question unless the person opened a sheet.** No question marks on the tabs. The only exception is the once-per-day late offer (§3.6), which is a statement with a dismiss.
3. **Nothing configurable is reachable from the tabs.** Templates, habits, settings, and the week are behind the header avatar or the two doors the official spec allows (empty-day actions; the day header sheet), and both doors lead to Epic 1 screens rather than editing in place.
4. **Reading order is time order.** Both tabs render the day top-to-bottom by scheduled time; the person never re-sorts.
5. **Faded is not disabled.** Every passed item stays live. Every done item stays live (undo, edit).
6. **The record is annotated, never rewritten.** A late start leaves a ghost. A shift leaves a band. A done-then-undone item keeps its history in the sheet.
7. **No numbers about the day.** Counts of done items, percentages, and streaks do not appear on either tab. The only numbers are times and durations.
8. **Undo is inline and short.** 5 seconds for done/undone, 10 for a shift. After that, the action is a fact, reversible only by another action.
9. **Second person is absent.** No "you" on the tabs.

### 0.2 Information architecture

```
App shell (signed in)                                   SH-00
  Tab: List  (default)                                  LS-01
    ├─ Day header sheet                                 DH-01
    │    ├─ Set wake time                               DH-02
    │    ├─ I have less time today                      TR-01
    │    ├─ Shift my day                                SF-01
    │    └─ Add a one-off                → Epic 1 WK-03
    ├─ Item sheet                                       IT-01
    │    ├─ Add time by hand                            IT-02
    │    └─ Timer control                               (inside IT-01)
    ├─ Not assigned today (expander)                    LS-02
    └─ Cut when shifted (expander)                      LS-03
  Tab: Schedule                                         SC-01
    ├─ Item sheet                                       IT-01 (same)
    ├─ Day header sheet                                 DH-01 (same)
    └─ Shift band detail                                SC-02
  Tab: Review                                            (Epic 3)
  Header avatar → Settings                              (Epic 1 ST-00)
Notification landings                                   PN-01 … PN-05
Empty-day state (both tabs)                             LS-00
Pending-review line (both tabs, morning after)          → Epic 3
```

### 0.3 Vocabulary on the tabs (final)
*now* · *soon* · *open* · *closing* · *moved* · *done* · *from Thu* · *not assigned today* · *cut when shifted* · *multitask* · *Start* · *Stop* · *Pause* · *Resume* · *Done* · *Undo* · *Not today* · *Shift my day* · *I have less time today* · *Add a one-off* · *Day Complete*. Nothing else recurs.

---

## 1. Shell (SH)

### SH-00 App shell
**Job:** hold the three tabs and one door to settings, and never get in the way.
**Entry:** any sign-in; any notification; app launch. **Exit:** none; the shell persists.

**Reads**
1. Header: the screen's title region (owned by the active tab) · right: avatar button (32px; accessible label *Settings*)
2. Tab bar (bottom on mobile, left rail on desktop): *List* · *Schedule* · *Review* — word labels; a small dot on *Review* when there are pending-review items (a presence mark, not a count; accessible label *Review — items waiting*)
3. Status line slot directly under the header, shown only when one of these is true, in this priority order (one at a time): *Offline — changes save on this device.* · *Setup isn't finished — continue* · *Yesterday has {n} items to review* · *Running late? Shift the day* (§3.6)

**Interacts**

| Element | Type | Behaviour |
|---|---|---|
| Tabs | tab bar | Switching keeps scroll position per tab for the session. Re-tapping the active tab scrolls to now (List: the now/soon item; Schedule: the now line). |
| Avatar | button | → Settings ST-00. |
| Status line | dismissable text row where noted | Offline is not dismissable; setup-incomplete is dismissable for the session; pending-review taps through to Review; the late offer dismisses for the day. |

**States:** online · offline · first launch after install (identical; there is no tour) · session expired (returns to AU-01 with *Sign in again to continue.*; local unsynced changes are kept and synced after sign-in).
**Done when:** n/a.

---

## 2. Plain List (LS)

### LS-01 Plain List
**Job:** move through today without deciding anything that doesn't have to be decided.
**State / budget:** executing; the strictest budget in the product.
**Entry:** default tab; PN-01/02/03 landings; Review's "open today". **Exit:** header → DH-01 · row → IT-01 · checkbox → done in place · expanders → LS-02/03 · empty actions → Epic 1.

**Reads (top to bottom)**
1. Day header (tappable as one control): *{Weekday} {day} {Month}* · second line in muted text: template name (or *No template*) · *Woke {time}* when `woke_at` is set · *Shifted +{n} min* when a shift exists today
2. Status line slot (SH-00)
3. Section heading: *Morning* with the span in muted text *{start}–{end}*; then *Afternoon*; then *Evening* (ends at the last scheduled item); then *Anytime* only when unscheduled items exist with no day part
4. Rows in time order. Each row reads, left to right: checkbox · icon · title (with the quantity value after a middle-weight separator once captured: *Read · 24 pages*) · state word when any (*now*, *soon*, *open*, *closing*, *moved*, *from Thu*) · time text (*7:20* · *1:00–4:00* · blank) · when done off-schedule the time reads *7:20 → 4:32*; when a timer is running the time text is replaced by the elapsed time *12:41*; the category edge is present but not read (it is decoration with meaning; accessible label includes the category name)
5. A multitask group reads as one bracketed block: the word *multitask* once at the block's top-right in muted text; each member row is otherwise identical to a normal row
6. Beneath the last section, two collapsed lines when relevant: *{n} not assigned today* (LS-02) · *{n} cut when shifted* (LS-03)
7. Beneath those, a single primary-weight text action at the very bottom: *Day Complete* (→ Epic 3 Day Review; absent once the day is closed, replaced by *Day closed at {time}* in muted text with a link *Review* )
8. Nothing else. No counts, no progress, no greeting.

**Interacts**

| Element | Type | Behaviour |
|---|---|---|
| Day header | button (whole region) | → DH-01. |
| Checkbox | 44px target, left 56px of the row | Not done → done: `done_at = now`; the row's title shifts to the done treatment; time text gains *→ {actual}* if off-schedule; inline *Undo* appears in the state-word position for 5 s. Done → not done: tapping again clears `done_at` (keeps `timer_sessions` and notes); inline *Undo* for 5 s restores the done state with the original `done_at`. If a timer is running on the item, done stops the timer and records the session. If the item has a quantity unit and no value yet, done does **not** ask — the value can be added in IT-01; the row shows *add {unit}* as a muted tail for the rest of the day. `[VESPER CALL: asking for the number at the checkbox would cost a decision on the tab; the tail is an invitation.]` |
| Row (anywhere except the checkbox) | button | → IT-01 for that item. |
| Wake-anchor row | as any row | Marking it done sets `day.woke_at = done_at` and re-anchors the day parts; the header gains *Woke {time}*; section spans recompute; no motion beyond the header line appearing. |
| Section heading | static | Not a control. |
| `{n} not assigned today` | expander | → LS-02 inline. |
| `{n} cut when shifted` | expander | → LS-03 inline. |
| Day Complete | text button (primary weight) | → Epic 3 DR-01. Available at any time; if items remain undone the Review handles them. |
| Pull to refresh | gesture | Re-fetches the day; never resets scroll. |

**Row states** — the official spec's §5.9 matrix applies verbatim. In addition, for this document's purposes:

| State | Row reads | Checkbox |
|---|---|---|
| Upcoming | title · time | empty |
| Soon | title · *soon* · time | empty |
| Now / open | title · *now* or *open* · time | empty |
| Closing (windows) | title · *closing* · time | empty |
| Active | title · elapsed time (tabular, updating each second) | empty (done stops the timer) |
| Passed, untouched | title · time, row at 0.55 opacity | empty |
| Done on time | title (done treatment) · time | filled |
| Done off-schedule | title · *moved* · *7:20 → 4:32* | filled |
| Done, quantity missing | title · *add {unit}* tail · time | filled |
| Carried from a past day | title · *from Thu* · time or blank | empty |
| Calendar item (Phase 2) | calendar glyph instead of icon · title · time | empty |
| Not today (collapsed by IT-01) | row moves to the bottom of its section, 0.55 opacity, reads *not today* in the state-word slot | empty; tapping the checkbox still completes it and clears *not today* |

**States (screen):** normal · empty day (LS-00) · day closed (the *Day Complete* action replaced; rows remain interactive; a done/undone after close is recorded and the Review recomputes) · loading (skeleton rows under real section headings if cached, else skeleton headings too) · offline (status line; all local actions work; timers run locally) · error (*Couldn't load today. Pull to try again.*, with cached rows shown if any).
**Done when:** n/a — a working surface.

### LS-00 Empty day (both tabs)
**Job:** make an unplanned day a place to act, not an absence.
**Reads:** the day header as LS-01 · *Nothing planned today.* · two actions: *Plan this day* · *Add a one-off* · and, only when a template exists and none is applied, a third text action *Apply {most-used template}* `[VESPER CALL: one-tap for the common case; the most-used template by application count in the last 4 weeks; hidden if there is no history]`.
**Interacts:** Plan this day → Epic 1 WK-02 for today · Add a one-off → Epic 1 WK-03 for today · Apply {template} → materialises today at the template's anchor and returns to LS-01 with the rows present and a 10-second undo toast *Applied {template}* [*Undo*].
**States:** offline (all three disabled; line) · loading.

### LS-02 Not assigned today (expander)
**Job:** keep trimmed items visible and retrievable without letting them read as undone.
**Reads:** heading *Not assigned today* · one line beneath: *Trimmed to fit {capacity} min. These don't count.* · rows in the faded treatment with no checkbox: icon · title · original time · *{duration} min* · a *Bring back* text action per row.
**Interacts:** Bring back → the item returns to `assigned` and its section; `capacity_min` is left as set (the day now exceeds it; no message). Collapse control at the heading.
**States:** empty (the expander is absent, not shown empty) · offline (Bring back works locally).

### LS-03 Cut when shifted (expander)
**Job:** show what the shift removed, and why, so nothing vanished.
**Reads:** heading *Cut when shifted* · one line: *Shifted +{n} min at {time} — {reason}.* · rows, faded, no checkbox: icon · title · original time · *{duration} min* · a *Do it anyway* text action per row `[VESPER CALL: the honest counterpart to Bring back — the item returns as assigned and unscheduled, its Miss row is deleted, and it will be scored on its actual outcome]`.
**Interacts:** Do it anyway → item becomes `assigned`, `unscheduled`, placed under *Anytime*; the Miss is removed. Collapse control.
**States:** as LS-02.

---

## 3. Day header sheet (DH)

### DH-01 Day header sheet
**Job:** hold the four day-level actions so the tabs don't have to.
**State / budget:** executing; four rows, nothing else; opens and closes in one motion.
**Entry:** tapping the day header on either tab. **Exit:** any row → its target · tap outside / swipe down / *Close*.

**Reads:** title *{Weekday} {day} {Month}* · subtitle: template name · *starts {anchor}* · *Woke {time}* or *Wake time not set* · four rows: *Set wake time* · *I have less time today* · *Shift my day* · *Add a one-off* · footer *Close*.

**Interacts**

| Row | Behaviour |
|---|---|
| Set wake time | → DH-02. |
| I have less time today | → TR-01. Hidden when the day is closed. |
| Shift my day | → SF-01. Hidden when the day is closed. |
| Add a one-off | → Epic 1 WK-03 for today; on save returns to the tab with the row present. |

**States:** day closed (the two middle rows absent; subtitle adds *Closed at {time}*) · offline (all four rows work locally except Add a one-off in Phase 1, which is disabled with the line).

### DH-02 Set wake time
**Job:** record when the day actually started when the wake anchor didn't capture it, or correct it.
**Reads:** title *Wake time* · body: when unset — *Marking your wake-up habit done sets this on its own. Or set it here.* · when set by the anchor — *Set at {time} by {habit}.* · when set by hand — *Set by hand.* · label *Woke at* · footer *Cancel* · *Save*.
**Interacts:** Woke at (native time picker; default: the anchor's `done_at` if set, else the day's `anchor_time`; bounded to the day, i.e. from `day_close_time` yesterday to now) · Save → `day.woke_at` set, `woke_at_source = manual`; the day parts recompute; back to the tab · a text action *Clear* when set by hand (returns to planned anchor).
**States:** saving · offline (works locally).

---

## 4. Item sheet (IT)

### IT-01 Item sheet
**Job:** hold everything about one item that doesn't fit on its row — timer, quantity, notes, reflection, done, not today — without the person having to leave the day.
**State / budget:** executing; the sheet is scannable in one glance, actions at the bottom, nothing required.
**Entry:** any row on either tab; PN-01/02/03 actions; SC-01 block tap. **Exit:** swipe down / tap outside / *Close* · any action returns to the tab in place.

**Reads (top to bottom)**
1. Icon (24px) · title · category chip if any · type word in muted text (*habit* · *task* · *deep work*)
2. Time line: *{mode phrase}* — *at 7:20* · *between 1:00 and 4:00* · *anytime* — followed by *· {duration} min* when a duration exists, and *Fixed* when hard-scheduled (the only place the word appears in execution mode beyond the Schedule glyph)
3. State line, present only when there is a state to report: *done 4:32 — moved from 7:20* · *done 7:24* · *carried from Thursday* · *not today* · *timer running · {elapsed}* · *time logged: {total} min in {n} sessions*
4. Preflight note, when the habit has one, as a short quoted block with the label *Before starting*
5. **Timer** region: the elapsed display (tabular, `00:00` when idle) and the control(s): *Start* · while running: *Pause* · *Stop* · while paused: *Resume* · *Stop* · a small link beneath: *Add time by hand* (→ IT-02) · when sessions exist, a muted list: *7:22–7:31 · 9 min* per session with an edit affordance each (→ IT-02 prefilled)
6. **Quantity** region, only when the habit has a unit: label *{Unit}* with a numeric field and the unit after it
7. **Reflection** region, only when the habit has axes or when the item is done: per axis a label and a 1–7 stepper; a textarea labelled *Note* (placeholder empty; helper *Optional.*)
8. Footer actions, right-aligned, in this order: *Not today* (text) · *Done* (primary) — when done, the primary becomes *Undo done* (secondary weight) and *Not today* is absent

**Interacts**

| Element | Type | Behaviour · validation |
|---|---|---|
| Start | button | Creates a `timer_session {started_at: now}`; item state → active; the row on the tab shows elapsed; if the item is passed (scheduled start earlier than now by more than its duration, or its window closed), this is a **late start** and the ghost-and-annotate rule applies: `scheduled_start` becomes now, `original_scheduled_start` is untouched, the row shows *moved* once done; on the Schedule, the ghost appears immediately (§5). Only one timer may run outside a multitask group: starting a second stops the first with a 5-second toast *Stopped {other}* [*Undo*] (undo restarts it and stops this one). |
| Pause / Resume | buttons | Pause closes the session; Resume opens a new one. Phase 2. |
| Stop | button | Closes the session. Does not mark done. The state line updates to *time logged*. |
| Add time by hand | link | → IT-02. |
| Session row edit | → IT-02 with the session prefilled | |
| Quantity | numeric input (decimal allowed), unit label after | Optional; saves on blur or on Done; non-numeric rejected silently (the field won't accept it). Clears the *add {unit}* tail on the row. |
| Reflection stepper | 1–7 stepper per axis | Saves on change. |
| Note | textarea, maxlength 500 | Saves on Done or on close; while typing offline it is kept locally. |
| Done | primary | `done_at = now` (or, if a timer is running, stops it and uses now); closes the sheet; the row updates; inline undo on the row for 5 s. |
| Undo done | secondary | Clears `done_at`; sessions, quantity, and notes remain; closes the sheet. |
| Not today | text button | Sets a per-day flag `deferred_today`; the row moves to the bottom of its section at 0.55 with the word *not today*; the item is still assigned and the Day Review will ask about it. Reversible by completing it or by *Undo* on the row (5 s), or by opening the sheet again where the button reads *Back in the list*. No reason is asked here — reasons belong to the Review. |
| Close | swipe / outside / footer text | Saves any pending note/quantity. |

**Rules**
- Done never requires a timer, a quantity, or a reflection.
- A done item's sheet is fully editable (quantity, notes, ratings, sessions).
- A carried item's sheet shows its origin line but is otherwise identical.
- Calendar items (Phase 2) have no timer or quantity; footer is *Done* only, with *Not today* absent.
- Cut-by-shift and not-assigned items don't open this sheet from their expanders; their only actions are the expander actions.

**States:** upcoming · active · paused · done · deferred · saving (the primary shows an inline spinner; the sheet stays) · error (*Couldn't save. Your changes are kept — try again.*) · offline (all actions work locally).
**Done when:** n/a.

### IT-02 Add time by hand
**Job:** record duration for something done without the timer, or fix a session.
**Reads:** title *Add time* / *Edit time* · labels *From* · *To* · a computed line *{n} min* · footer *Cancel* · *Save* · in edit mode a text action *Remove this session*.
**Interacts:** From / To (native time pickers; default: scheduled start and start + duration; bounded to the day; To must be after From — error *"To" should be after "from".*; sessions may overlap other items but not each other on the same item — error *This overlaps another session on this item.*) · Save → session `source: manual` · Remove this session → deletes with a 5-second undo toast.
**States:** saving · error · offline.

---

## 5. Schedule (SC)

### SC-01 Schedule
**Job:** show where the day sits against the plan — on time or behind — at a glance.
**State / budget:** executing, but a deliberate check-in rather than a pass-through; the person came here to look, so the screen may be dense, but it still asks nothing.
**Entry:** the tab; re-tapping scrolls to now. **Exit:** block → IT-01 · header → DH-01 · band → SC-02.

**Reads (top to bottom)**
1. Day header (identical to LS-01, same control)
2. Status line slot
3. The time axis, vertical, on the left: an hour label per hour (*7*, *8* … in the locale's short form), 15-minute hairlines; the axis begins one hour before the earliest item (or the anchor) and ends one hour after the latest; a small *earlier* / *later* control at each end extends the axis by an hour per tap for one-offs outside it
4. The **now line**: a horizontal rule across the full width at the current minute, a small dot on the axis, and the time in small text at its right end (*9:41*); it moves once per minute; everything above it is at 0.55 opacity
5. Blocks, placed against the axis: each block reads icon · title · time text (*7:20–7:45*) · for windows, the window is drawn as a lighter span from start to end with the block sitting at the window's top until started, then at the actual start · a small anchor glyph before the title on Fixed items (accessible label *fixed*) · multitask members side by side in the same band, each labelled
6. Ghosts: at `original_scheduled_start` for any item started or done after being passed — an outline block, title struck through, at `neutral-400`, with the small word *planned* beneath the time
7. Live blocks for moved items carry a violet border and the word *moved* at the top-right
8. Shift bands: a thin full-width band at the minute of each shift reading *Shifted +{n} min · {reason}* in small text
9. Done blocks: filled with the done surface and a check glyph; done-off-schedule blocks are done-styled at their actual position with the violet border retained
10. Below the last block, nothing — no Day Complete here `[VESPER CALL: closing the day is a List and Review action; the Schedule is for looking]`

**Interacts**

| Element | Type | Behaviour |
|---|---|---|
| Block | button | → IT-01. A long-press does nothing (no drag rescheduling in v1 — moving an item is a late start or a shift, never a drag, so the record stays honest). |
| Ghost | static, accessible | Announces *{title}, planned {time}, started {actual}*. Tapping opens the live block's sheet. |
| Window span | static | Tapping the span outside its block does nothing. |
| Shift band | button | → SC-02. |
| Axis ends (*earlier* / *later*) | text buttons | Extend the axis. |
| Now line | static | Not a control. |
| Pinch / zoom | not supported in v1 | The axis density is fixed at 15 minutes; at 150%+ text scale it switches to 30. |

**Block states** follow the §5.9 matrix. Additionally, a block whose duration renders shorter than 32px shows icon and title only, with the time in its accessible label; a block under 16px renders as a hairline with the title in a small tag beside the axis.

**States:** normal · empty day (LS-00 with the axis behind it) · day closed (the now line stops at close time with the word *closed*; blocks remain interactive) · loading (axis with skeleton blocks) · offline (status line; blocks interactive locally) · error (as LS-01).
**Done when:** n/a.

### SC-02 Shift band detail
**Job:** show one shift's record.
**Reads:** title *Shifted +{n} min* · lines: *At {time}* · *Reason: {reason}* · *Counts as: {tier phrase}* · *Cut: {titles}* or *Nothing was cut.* · footer *Close* · a text action *Undo this shift* only within 10 minutes of the shift `[VESPER CALL: a short true undo window beyond the toast — after that, reversing is another shift, so the record shows both]`.
**Interacts:** Undo this shift → restores every item's `scheduled_start`, removes the Miss rows on cut items, deletes the Shift row; only if no cut item has since been completed via *Do it anyway*. Close.
**States:** within undo window · beyond it (the action is absent) · offline.

---

## 6. Shift my day forward (SF)

### SF-01 Shift my day
**Job:** move every flexible item later by one amount, for one stated reason, and settle what no longer fits — in one sheet.
**State / budget:** executing and already late; three steps, each with one decision, large targets, no free text required.
**Entry:** DH-01 row; the late offer line (§3.6 of this document, below). **Exit:** Shift → the tab, updated, with a 10-second undo toast · Cancel at any step → the tab, unchanged.

The sheet is one surface that grows; the person never leaves it. Steps are labelled as a small line *1 of 3* etc.

**Step 1 — Amount**
- Reads: title *Shift my day* · label *By how much?* · four large targets *+15* · *+30* · *+60* · *Custom* · when Custom: a minutes field and the four targets stay
- Interacts: choosing an amount reveals step 2 below it (the chosen target stays selected and editable); Custom: numeric input, 5–600 min, step 5; error *Between 5 and 600 minutes.*

**Step 2 — Reason**
- Reads: label *Why?* · the person's reason set as full-width rows in tier groups (group headings are the tier definitions: *Something came up — done for the record* · *Planned it wrong — half* · *Didn't do it — missed*) · the last row *Other* · beneath the list, muted: *Items cut by this shift get this reason.*
- Interacts: choosing a reason reveals step 3; *Other* reveals a text field (1–80, required) and a *Counts as* radio of the three tiers (required) before step 3 appears. *Stayed on something more important* is not offered in a shift `[VESPER CALL: it describes a single miss, not a whole day's slip; it stays a Day Review reason]`.

**Step 3 — Fit**
- Reads: label *What changes* · a summary line: *{k} flexible items move +{n} min. Fixed items stay.* · then one of: *Everything still fits.* · or *{m} items no longer fit before {the first hard anchor they collide with, e.g. "your 11:00 call"}* (or *before the day closes*) · beneath, the overflow list: each row icon · title · new time · *{duration} min* · priority number · a checkbox reading *Cut* (pre-checked from the lowest priority up until the overflow is resolved) · a live line under the list: *Cutting {c} frees {f} min · {r} min still over* or *That fits.* · a second list, muted, for hard items the shift makes already-passed: *Already passed — will show as late:* with titles
- Interacts: Cut checkboxes (toggling recomputes the live line; unchecking below zero over is allowed — the line then reads *{r} min over — the day will run long*; Shift stays enabled) · primary **Shift and cut {c}** (label carries the count; reads **Shift** when c = 0) · secondary **Cancel**

**On Shift:** the Shift row is written; flexible items' `scheduled_start`/`end` advance by `delta`; hard items are untouched; cut items → `assignment_state: cut_by_shift`, `completion_state: missed`, Miss with the shift's reason and tier; the sheet closes; the tab shows the new order, the header line *Shifted +{n} min*, and a toast *Shifted +{n} min* [*Undo*] for 10 s; the Schedule gains a band.

**Rules**
- Items already done or with a running timer don't move; the summary line says *{d} done items stay where they were.*
- A second shift in a day compounds; the header shows the total (*Shifted +90 min*) and SC-01 shows two bands.
- Overflow is computed against the day's hard anchors in time order and against `day_close_time`.

**States:** step 1 · step 2 · step 3 (fits / overflow) · applying (buttons disabled) · error (*Couldn't shift. Nothing changed — try again.*) · offline (works locally; reconciled on sync — Phase 2; Phase 1 disabled with the line).
**Done when:** the Shift row exists and the tab reflects it.

### 3.6 → 6.1 The late offer (status line)
**Trigger:** the day's first fixed item is ≥ 30 minutes passed and untouched, and no shift exists today, and the day isn't closed, and the offer hasn't been dismissed today.
**Reads:** *Running late? Shift the day* — a single row in the status-line slot with a dismiss control (accessible label *Dismiss for today*).
**Interacts:** tap → SF-01; dismiss → gone for the day. It appears at most once per day and carries no colour, no count, and no urgency beyond its own words. `[Alarm test: it's a question, which the tabs forbid — I'm allowing this one exception because it is the person's own likely question, asked once, in their own register, and dismissable. If it ever reads as a nag in use, cut it; nothing depends on it.]`

---

## 7. Capacity trim (TR)

### TR-01 I have less time today
**Job:** fit today into the time actually available, cutting lowest-priority flexible items first, with the result visible and adjustable before it applies.
**State / budget:** executing; one number, one look, one confirm.
**Entry:** DH-01 row. **Exit:** Apply → the tab with the trimmed list and LS-02 populated · Cancel.

**Reads**
1. Title *I have less time today*
2. Label *Time available* · beneath, muted: *Planned: {planned} min ({first}–{last})*
3. Quick chips: *−15* · *−30* · *−45* · *−60*
4. Result region (appears once the number is below planned): *Fits in {capacity} min.* · *Not assigned today:* followed by the trimmed items as rows — icon · title · *{duration} min* · priority · a *Keep instead* text action each · beneath: *Kept:* is not listed (the tab is the list) · a final line when nothing can be trimmed further: *Nothing else is flexible. {r} min over.*
5. Footer: *Cancel* · *Apply*

**Interacts**

| Element | Type | Behaviour |
|---|---|---|
| Time available | numeric input, minutes, prefilled with the planned total | 5–1440. Typing recomputes the result live. A value ≥ planned shows *That's the whole plan — nothing to trim.* and disables Apply. |
| Quick chips | buttons | Subtract from the current value. |
| Keep instead | per trimmed row | Returns that item to the kept set and trims the next-lowest flexible item that isn't already trimmed; if none remains, the line reads *Kept — {r} min over.* and Apply stays enabled. |
| Apply | primary | Writes `day.capacity_min`; trimmed items → `not_assigned`; the tab updates; LS-02 appears. No toast; the expander is the confirmation. |
| Cancel | text | Nothing written. |

**Rules:** hard items are never trimmed and are included in the planned total; done and active items are never trimmed; the trim sorts by resolved priority ascending, then shorter duration, then later start; a second trim in a day replaces the first (items previously not-assigned that now fit are brought back automatically — the result region says *{n} come back.*).
**States:** idle (no result yet) · result fits · result over · applying · offline (works locally; Phase 1 disabled).
**Done when:** `capacity_min` is set and the list reflects it.

---

## 8. Windows and the closing signal

Windows need no screen; their behaviour is entirely in the rows, the blocks, and one push.
- Before start: row reads the window *1:00–4:00*; block sits at the window's top.
- Inside the window: the state word *open* (List) and the block inside the span (Schedule).
- At the closing threshold — remaining ≤ max(10% of the window, 10 min): the word becomes *closing*; the block is unchanged; N3 fires once.
- After the window: the row is passed (0.55), fully interactive; starting it is a late start with a ghost at the window's top.
- No colour change, no countdown, no motion at any point.

---

## 9. Notification landings (PN)

Every push opens the app in a specific state. The tap target is the notification body unless an action button was used.

| ID | Push | Body tap lands on | Action buttons and their result |
|---|---|---|---|
| PN-01 | N1 item start | LS-01 scrolled to the item, IT-01 open for it | *Start* → timer started, IT-01 open · *Done* → done, IT-01 not opened, the List shows the row done with undo |
| PN-02 | N2 window open (Phase 2) | LS-01 scrolled to the item | *Open* → IT-01 |
| PN-03 | N3 window closing (Phase 2) | LS-01 scrolled to the item | *Open* → IT-01 |
| PN-04 | N4 review reminder | Epic 3 DR-01 | *Review* → DR-01 · *Later* → snooze 60 min (once) |
| PN-05 | N5 pending review | Epic 3 DR-01 for yesterday | *Review* → DR-01 |
| PN-06 | N6 week build | Epic 1 WK-01 next week | *Plan* → WK-01 |
| PN-07 | N7 week ready (Phase 2) | Epic 3 WR-01 | *Open* → WR-01 |
| PN-08 | N8 timer running (Phase 2, persistent) | IT-01 for the active item | *Stop* / *Pause* → applied without opening |
| PN-09 | N9 calendar item (Phase 2) | LS-01 scrolled to the item | — |

**In-app behaviour when the app is foregrounded at push time:** no system notification; the List row simply becomes *now* (N1) or *closing* (N3); nothing else surfaces. `[VESPER CALL: a banner inside the app for something already on screen is noise.]`
**Grouped pushes** (same minute): tap lands on LS-01 scrolled to the first; no action buttons.
**Signed out at tap time:** AU-01, then the landing.

---

## 10. Cross-screen flows

### 10.1 An ordinary morning
Alarm → N1 *Immediate wake up · 7:00* → *Done* on the notification → `woke_at` set, day parts anchored → open the app later: LS-01 shows *Woke 7:02*, Morning section, the next item *soon* → tap checkbox → done → row → IT-01 → Start on the cold bath → Stop → Done.

### 10.2 Running late
9:10, first fixed item untouched since 7:20 → status line *Running late? Shift the day* → SF-01 → +60 → *Slept in* (Planned it wrong) → step 3: *2 items no longer fit before your 11:00 call* — Yoga and Face training pre-checked → **Shift and cut 2** → tab reorders, header *Shifted +60 min*, LS-03 shows the two, undo toast 10 s.

### 10.3 Doing a cut item anyway
LS-03 → *Do it anyway* on Yoga → row appears under *Anytime* → done at 15:40 → Day Review scores it as done, off-schedule.

### 10.4 Late start
14:30, Meditate was at 7:45, untouched → row (0.55) → IT-01 → Start → Schedule: ghost at 7:45 with *planned*, live block at 14:30 with *moved*; List: after Done, row reads *moved · 7:45 → 14:52*.

### 10.5 Less time
DH-01 → *I have less time today* → type 45 → *Fits in 45 min. Not assigned today: Yoga, Face training, Vocal.* → *Keep instead* on Vocal → Face training and Breathwork are now trimmed, line says *Fits in 45 min.* → Apply → LS-02 shows three.

### 10.6 Forgot the timer
Lifting done without Start → checkbox → done → later IT-01 → *Add time by hand* → IT-02 From 11:30 To 12:20 → Save → state line *time logged: 50 min in 1 session*.

### 10.7 Offline through the morning
Airplane mode → status line *Offline — changes save on this device.* → done/undone/start/stop all work → reconnect → the line disappears; conflicts (the same item edited on another device) resolve last-write-wins per field with `done_at` preferring the earlier value `[route to the tech spec]`.

### 10.8 The day ends
LS-01 bottom → *Day Complete* → Epic 3 DR-01. Or 03:00 passes → the day closes; undone items → pending; next morning SH-00 status line *Yesterday has 3 items to review*; Review tab dot.

---

## 11. Interaction inventory (input to the UI component list)

| Control / element | Appears in |
|---|---|
| Tab bar (3 word tabs, presence dot) · desktop rail | SH-00 |
| Header: day title, subtitle line, avatar button | SH-00, LS-01, SC-01 |
| Status line row (with optional dismiss) | SH-00 (offline, setup, pending, late offer) |
| Day-part section heading with span | LS-01 |
| Item row: 44px checkbox · icon · title · state word · time text · category edge · quantity tail · undo inline | LS-01, LS-02/03 (variant without checkbox, with text action) |
| Multitask bracket (group container) | LS-01, SC-01 |
| Expander (heading, explanatory line, faded rows) | LS-02, LS-03 |
| Empty-day block (sentence + 2–3 actions) | LS-00 |
| Text action, primary weight (*Day Complete*) | LS-01 |
| Bottom sheet: title, subtitle, action rows, footer | DH-01 |
| Native time picker field | DH-02, IT-02 |
| Item sheet: header block, time line, state line, quoted preflight, timer region, quantity field, reflection steppers, note textarea, footer actions | IT-01 |
| Timer display (tabular, 1s tick) and Start/Pause/Resume/Stop control | IT-01, N8 |
| Session list row with edit | IT-01 |
| 1–7 stepper | IT-01 |
| Numeric input with trailing unit | IT-01 (quantity), TR-01 (minutes), SF-01 (custom) |
| Time axis (hour labels, 15-min hairlines, extend controls) | SC-01 |
| Now line (rule + dot + time tag) | SC-01 |
| Schedule block (icon, title, time, anchor glyph, moved border, done fill; three size variants) · window span · ghost block · shift band | SC-01 |
| Detail sheet (read-only lines + one conditional action) | SC-02 |
| Growing three-step sheet: large-target chooser (4 options), grouped reason rows with tier headings, overflow list with Cut checkboxes and live tally, count-carrying primary | SF-01 |
| Quick-chip row (−15/−30/−45/−60) · result region with per-row text action | TR-01 |
| Undo toast (5s / 10s) | LS-01, IT-01, SF-01, LS-00 |
| Skeleton row · skeleton block · skeleton axis | LS-01, SC-01 |
| Push notification with 0–2 actions; grouped variant; persistent timer variant | PN-* |

---

## 12. Calls made in this pass (flip freely)
1. The quantity tail (*add pages*) instead of asking for the number at the checkbox.
2. *Do it anyway* on cut-by-shift items, mirroring *Bring back* on trimmed ones.
3. *Apply {most-used template}* as a third empty-day action when history exists.
4. No Day Complete on the Schedule tab.
5. No drag-to-reschedule anywhere in v1.
6. A 10-minute true undo on a shift, beyond the 10-second toast.
7. *Stayed on something more important* is a Review reason only, never a shift reason.
8. The late offer as the one permitted question on the tabs, once per day, dismissable.
9. Foregrounded pushes surface nothing beyond the row's state word.

## 13. Sign-off
Vesper — both tabs pass the worst-moment test (one-handed, arm's length, one decision per touch), nothing on them asks or counts, every state in the official matrix has a row and a block, and every push has a landing. Ready for the UI component list; Epic 3 next.
