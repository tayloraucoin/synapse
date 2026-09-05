# Epic 3 — Review: UX Architecture & Interaction Design

**Product:** Synapse
**Author:** Vesper
**Date:** 4 Sept 2026
**Governs:** the Review tab and everything reached from it — the Day Review with tiered miss scoring, the pending-review state, reflections, the Week Review, history, and the number itself. The official spec (`habit_tracker_official_ux_spec_v1.md` §7, §9.4, §10) is the authority above this document; Epic 1 owns Settings (including export) and Epic 2 owns the tabs that hand off here.
**Next consumer:** the UI designer, via the inventory in §9.

---

## 0. How this document works

Same record format as Epics 1 and 2. IDs: `RV-` review tab, `DR-` day review, `WR-` week review, `HS-` history.

### 0.1 The reviewing budget, stated as rules
The person is here at the end of a day — tired, possibly disappointed — or on Sunday with more room. The screens must work for the first case and may reward the second.

1. **Three taps per undone item, maximum.** Missed → tier → (sub-reason). Carry forward is one tap. Anything beyond that is optional and collapsed.
2. **The number comes after the decisions, never before.** Nothing on the Day Review is numeric until *Finish review* is pressed; the Week Review shows its numbers only once its days are reviewed (or says "so far").
3. **Every number carries its formula in words.** If the arithmetic can't be printed beside the result, the result isn't shown.
4. **The copy is descriptive, never evaluative.** Tiers are labelled by what happened, not by what it says about the person. No adjectives about the day. No "great", "only", "just", "again".
5. **Leaving is always allowed.** *Finish later* exists on every review surface; what's left becomes *pending*, visibly, and nothing is scored until it's decided.
6. **The record is editable, with history.** Any past day's review can be reopened and changed; the change is a fact ("edited Tuesday"), not a rewrite.
7. **Colour is absent from outcomes.** Done, missed, excused, moved are all in the neutral scale with words and glyphs; the violet appears only as the *moved* marker it already is elsewhere.
8. **There is no coach.** No sentence on these screens is generated about the person. Patterns are shown as counts and lists; conclusions are left to the reader.

### 0.2 Information architecture

```
Tab: Review                                       RV-00
  ├─ Day Review (today / most recent open)        DR-01
  │    ├─ Undone item panel (inline)              DR-02
  │    │    ├─ Tier + reason chooser (inline)     DR-03
  │    │    └─ Traded-up picker (sheet)           DR-04
  │    ├─ Shift-cut item panel (inline, resolved) DR-05
  │    ├─ Reflections (collapsed section)         DR-06
  │    └─ Finished (result state)                 DR-07
  ├─ Pending review (same DR-01, pending mode)
  ├─ Week Review (this week / so far)             WR-01
  │    ├─ Habit strip detail (sheet)              WR-02
  │    ├─ Carried across the week (list)          WR-03
  │    ├─ Shifts this week (list)                 WR-04
  │    └─ Time by category (bar)                  (inside WR-01)
  └─ History                                      HS-01
       ├─ Past week → WR-01 (closed)              
       └─ Past day  → DR-01 (edit mode)           
Export → Epic 1 ST-10 (linked from HS-01)
```

### 0.3 Vocabulary (final, this epic)
*Day Complete* · *Finish review* · *Finish later* · *Carry forward* · *Missed* · *Something came up — done for the record* · *Planned it wrong — half* · *Didn't do it — missed* · *Stayed on something more important* · *traded up* · *not counted* · *pending* · *moved* · *not assigned* · *cut when shifted* · *so far* · *edited*.

---

## 1. Review tab (RV)

### RV-00 Review tab
**Job:** route to the one review that's due, and to the week and the past.
**State / budget:** reviewing; the tab itself is a short index, not a dashboard.
**Entry:** tab bar; PN-04/05/07 landings; *Day Complete* on the List (goes straight to DR-01, not here). **Exit:** rows → DR-01 / WR-01 / HS-01.

**Reads (top to bottom)**
1. Header: *Review*
2. **Today** region — one of:
   - day open, items undone: *Today* · *{done} of {assigned} done · {undone} to decide* · action *Close out today* (→ DR-01)
   - day open, everything done: *Today* · *Every item was done.* · action *Close out today* (→ DR-01, which finishes in one tap)
   - day closed and reviewed: *Today* · *Reviewed at {time} · {adherence}%* · text action *Open* (→ DR-01 edit mode)
   - nothing assigned today: *Today* · *Nothing was assigned.* · no action
3. **Pending** region — only when any past day has pending items: *{Weekday} has {n} items to decide* per day, most recent first, each a row → DR-01 pending mode for that day
4. **This week** region: *This week* · *{reviewed} of {planned} days reviewed* · if all reviewed days are in: *{adherence}% so far* (the word *so far* until Sunday closes; after that the number stands alone) · action *Open* (→ WR-01)
5. **History** row: *Past weeks and days* → HS-01
6. Nothing else. No streak, no trend arrow, no comparison to last week.

**Interacts:** each region's action or row as above. Pull to refresh.
**States:** loading (skeleton regions) · offline (readable; reviews made offline are queued — Phase 2; Phase 1 shows the line and disables *Close out today*) · error (*Couldn't load. Pull to try again.*).
**Done when:** n/a.

---

## 2. Day Review (DR)

### DR-01 Day Review
**Job:** close the day honestly, once, without dragging it out.
**State / budget:** reviewing, tired. Everything required is a tap; everything optional is collapsed; leaving is one tap.
**Entry:** *Day Complete* (List), RV-00 *Close out today*, RV-00 pending rows, PN-04/05, HS-01 day rows (edit mode), 03:00 auto-close (which opens nothing — it marks the day closed and items pending; the person arrives later via RV-00 or PN-05). **Exit:** *Finish review* → DR-07 → RV-00 · *Finish later* → RV-00 (or the List, if entered from *Day Complete*) with remaining items pending · back → same as *Finish later*.

**Modes** (same screen, small differences noted): **live** (today, day not yet closed) · **pending** (a closed day with undecided items) · **edit** (a reviewed day reopened).

**Reads (top to bottom)**
1. Header: *{Weekday} {day} {Month}* · in edit mode a second line *Reviewed {when}* and, if edited since, *· edited {when}* · in pending mode a second line *Closed at {time} — {n} to decide*
2. Summary line, words only: *{done} of {assigned} done* · *· {moved} moved* when any · *· {n} not assigned* when trimmed · *· {c} cut when shifted* when any. No percent.
3. Section heading *To decide* (live/pending) — absent when nothing is undone; then one **item panel** (DR-02) per undone item, in schedule order, with deferred (*not today*) items last within their time
4. Section heading *Cut when shifted* — one **resolved panel** (DR-05) per cut item, only when any
5. Section heading *Done* — collapsed by default in live/pending, expanded in edit; rows: icon · title · *done {time}* or *done {time} · moved from {planned}* · quantity value when any · a small *edit* affordance (→ Epic 2 IT-01 for that item, which remains the editor for done items' details)
6. Section *Reflections* (DR-06), collapsed; heading reads *Reflections* with *· {rated} of {rateable}* when any axes exist
7. Footer: *Finish later* (text) · *Finish review* (primary; disabled while any item in *To decide* is undecided; label reads *Finish review* when everything is decided, and in edit mode *Save changes*)

In edit mode the *To decide* section is replaced by *Decided* — the same panels, already resolved, each with a *Change* affordance (DR-02 in its resolved state).

**Interacts**

| Element | Type | Behaviour |
|---|---|---|
| Item panel | DR-02 | Decides one item. |
| Done row *edit* | link → IT-01 | Returns here. |
| Finish later | text button | Live mode: the day stays open; decided items keep their decisions; undecided stay undone; returns to the caller. Pending mode: remaining items stay pending. Edit mode: discards unsaved changes after *Discard changes?* — **Keep editing** · **Discard**. |
| Finish review / Save changes | primary | Live: closes the day (`closed_at = now`, `close_reason = manual`), writes all decisions, computes the number, → DR-07. Pending: writes decisions, marks pending resolved, → DR-07. Edit: writes changes, stamps `review_edited_at`, → DR-07 with *edited* in its header. If an item is decided *Carry forward*, the next day's DayItem is created on finish (not on tap). |
| Auto-close (system) | — | At `day_close_time`: `closed_at`, `close_reason = auto`; every undone item → `pending_review`; nothing else. The day's number is not computed until the pending items are decided. |

**States:** live · pending · edit · nothing to decide (the *To decide* section is absent; the summary line reads *Every item was done.* when assigned > 0; *Finish review* enabled immediately) · nothing assigned (the screen says *Nothing was assigned today.* with *Finish review* to close it) · saving (footer disabled, inline spinner) · error (*Couldn't save the review. Your decisions are kept on this device — try again.*) · offline (decisions are kept locally; *Finish review* disabled in Phase 1 with the standard line).
**Done when:** `closed_at` is set and no item is undone or pending.

### DR-02 Undone item panel
**Job:** decide one item in at most three taps, in place, without leaving the list.
**Entry:** rendered inline in DR-01 per undone item. **Exit:** none — the panel resolves in place.

**Reads (undecided)**
1. Icon · title · category chip if any · type word
2. Second line: *at 7:20 · 15 min* / *between 1:00 and 4:00* / *anytime* · *· not today* when deferred · *· from Thursday* when carried
3. Two large targets side by side: *Carry forward* (only for tasks/appointments; absent for habits and deep work) · *Missed*

**Reads (deciding — after *Missed*):** the panel expands beneath the targets with DR-03.

**Reads (decided):** the two targets are replaced by a single line stating the decision — *Carry forward → tomorrow* · *Missed — something came up: {reason} · not counted* · *Missed — planned it wrong: {reason} · counts half* · *Missed — didn't do it · counts as missed* · *Missed — stayed on {item}: traded up · not counted* — followed by a *Change* text action that reopens the chooser with the current selection.

**Interacts**

| Element | Type | Behaviour |
|---|---|---|
| Carry forward | large target | Decides immediately (one tap): `completion_state: carried`; the line reads *Carry forward → tomorrow*. For a task that has already been carried ≥ 3 times, a muted note beneath: *Carried {n} times since {date}.* — a fact, no advice. |
| Missed | large target | Reveals DR-03 inline; the item is not decided until a tier (and, where the tier has sub-reasons, a reason) is chosen. |
| Change | text | Reopens DR-03 with the current choice selected; *Carry forward* becomes available again if applicable. |

**States:** undecided · deciding · decided · pending (identical to undecided; the day is closed, so the panel's second line adds *pending*).

### DR-03 Tier and reason chooser
**Job:** attribute the miss in one or two taps, with the weighting visible but quiet.
**Entry:** *Missed* in DR-02. **Exit:** choosing resolves back into DR-02.

**Reads**
1. Three tier rows, full-width, in this order, each with its definition as a second line:
   - *Something came up* — *done for the record*
   - *Planned it wrong* — *counts half*
   - *Didn't do it* — *counts as missed*
2. Beneath the selected tier (rows 1 and 2 only), its reasons as chips from the person's reason set: for tier 1 — *Something came up* · *Not feeling well* · *Other*; for tier 2 — *Earlier thing ran long* · *Slept in* · *Stayed on something more important* · *Other*; plus any reasons the person added to that tier. Tier 3 has no chips; choosing the row decides.
3. *Other* reveals a text field (placeholder empty; 1–80) and a small text action *Keep this reason* (adds it to the reason set under the current tier)
4. An optional note field labelled *Note* (maxlength 280) beneath the chips, collapsed behind a text action *Add a note*

**Interacts**

| Element | Type | Behaviour · validation |
|---|---|---|
| Tier row | radio row | Selecting tier 3 decides at once. Selecting tier 1 or 2 reveals chips; the item is decided when a chip is chosen. Switching tiers clears the chip. |
| Reason chip | single-select chip | Decides. *Stayed on something more important* → opens DR-04 before deciding. |
| Other | chip + text | Requires text to decide. Error under the field on attempt to finish: *Say what it was, in a few words.* |
| Keep this reason | text action | Adds to the reason set with the current tier; the chip appears in future reviews. |
| Add a note / Note | text action → textarea | Optional. |

**Resolution written:** `Miss{tier, reason_key, reason_text?, traded_up_item_id?, resolved_by: day_review}`.
**States:** tier unselected · tier selected, chip pending · decided · offline (works locally).

### DR-04 Traded-up picker
**Job:** name what the person stayed on, so the system can decide whether the miss counts.
**Entry:** the *Stayed on something more important* chip. **Exit:** choosing → DR-02 decided · Cancel → back to DR-03 with no chip selected.

**Reads**
1. Title *What did you stay on?*
2. Body: *If it was at least as important and got done, this one isn't counted. Otherwise it counts half.*
3. List of today's items that are done or active, in schedule order: icon · title · *priority {n}* · *done {time}* or *running* · beside each, the verdict it would produce, in muted text: *not counted* (priority ≥ this item's and done) or *counts half* (lower priority, or not yet done)
4. A last row *Something not on the list* → decides as *counts half* with `reason_text` prompt (1–80): *What was it?*
5. Footer *Cancel*

**Interacts:** any row → sets `traded_up_item_id`, decides with the verdict shown; *Something not on the list* → text then decides at half.
**Rule (restated for the builder):** verdict = *not counted* iff `traded.priority >= missed.priority AND traded.completion_state == done`; active-but-not-done items show *counts half — finish it and this changes*; if it's finished before *Finish review*, the verdict is recomputed at finish and the decided line updates.
**States:** list · empty (no done or active items today: the body adds *Nothing's done yet today, so this will count half.* and only the last row is offered) · offline.

### DR-05 Resolved panel (cut when shifted)
**Job:** show the decision the shift already made, and allow it to be changed here rather than re-litigated.
**Reads:** icon · title · time line · decided line *Cut when shifted +{n} min — {tier phrase}: {reason} · {weight phrase}* · *Change* text action.
**Interacts:** Change → DR-03 with the shift's tier and reason preselected; changing writes a new Miss with `resolved_by: day_review` and keeps the Shift row's own reason untouched (the shift's record is a fact; this item's attribution is the thing being corrected). A line appears beneath: *Changed from the shift's reason.*
**States:** resolved · changed.

### DR-06 Reflections
**Job:** capture the ratings and notes the person configured, without asking on a night they don't want to.
**Reads:** heading *Reflections · {rated} of {rateable}* (collapsed) · when expanded, one block per done item with axes or a note: icon · title · per axis a label and a 1–7 stepper · *Note* textarea · items already rated in the item sheet show their values filled and are listed last
**Interacts:** steppers save on change; notes save on *Finish review* or when the section is collapsed. Nothing here is required and nothing here affects the number.
**States:** collapsed · expanded · no rateable items (the section is absent).

### DR-07 Finished
**Job:** state the day's number with its arithmetic, once, and hand back.
**Entry:** *Finish review* / *Save changes*. **Exit:** *Done* → RV-00 (or the List if the review was entered from *Day Complete*).

**Reads (top to bottom)**
1. Header: *{Weekday} {day} {Month}* · *Reviewed* / *Reviewed · edited*
2. The number, large, in the review serif: *{adherence}%*
3. The formula in words directly beneath, one sentence: *{d} done, {s} planned wrong (½), {c} didn't do (0), {e} not counted → {credit} / {counted} = {adherence}%.* Terms with a zero count are omitted from the sentence. When counted = 0: no number; the sentence reads *Nothing was counted today.*
4. Line: *Off-schedule: {moved} of {done} done.* (omitted when moved = 0)
5. Line: *By priority — high (5–7): {a} of {b} · mid (3–4): {a} of {b} · low (1–2): {a} of {b}* — bands with nothing assigned are omitted; credits shown as decimals only when a half exists (*1.5 of 2*)
6. Line, only when shifts occurred: *Shifted +{total} min ({n} shift{s}).*
7. Line, only when carried: *{n} carried to tomorrow.*
8. Line, only when not-assigned: *{n} not assigned today.*
9. Primary *Done*

**Interacts:** Done. Nothing else — no share, no compare.
**States:** normal · counted = 0 · all done (the number reads *100%*, the sentence *{d} done → {d} / {d} = 100%.*; no other adjective).
**Done when:** the person leaves; the number is stored as computed (recomputed on any later edit).

---

## 3. Week Review (WR)

### WR-01 Week Review
**Job:** show which habits slipped, where the time went, and how the templates were used — for the week, as a record.
**State / budget:** reviewing, with room; this is the one surface that may be read slowly. Numbers are permitted because every one carries its formula.
**Entry:** RV-00 *This week · Open*; PN-07; HS-01 week rows. **Exit:** back → caller · strip row → WR-02 · lists → WR-03 / WR-04.

**Reads (top to bottom)**
1. Header: *{Mon date} – {Sun date}* · second line: *{reviewed} of {planned} days reviewed* · while the week is open: *so far*
2. The number, in the review serif: *{adherence}%* with its sentence beneath, same shape as DR-07 over seven days: *{d} done, {s} planned wrong (½), {c} didn't do (0), {e} not counted → {credit} / {counted}.* — computed over reviewed days only; a line beneath when days are unreviewed or pending: *{n} days not yet reviewed aren't in this.*
3. Line: *By priority — …* as DR-07
4. Line: *Off-schedule: {moved} of {done} done.*
5. Section *Templates*: one row per template applied or targeted this week: name · *{used} of {target}* when targeted, else *used {used}* · nothing else, no marker here (the marker lives in the week build, where a choice is made)
6. Section *Habits*: one **strip row** per habit assigned at least once this week (habits only; tasks and deep work are listed separately), sorted by credit ratio ascending so what slipped is first `[VESPER CALL: sorting by what slipped answers the question the person came with; sorting alphabetically would make them hunt]`: icon · title · seven squares Mon–Sun · *{credit} of {counted}* in tabular figures. Square glyphs, each with an accessible label: filled — *done* · filled with a small dot — *done, moved* · outline — *not counted (something came up / traded up)* · half-filled — *planned it wrong* · empty square — *didn't do it* · no square (blank) — *not assigned* · hatched — *pending*.
7. Section *Deep work*: rows icon · title · *{sessions} sessions · {total} min* · *{done} of {counted}*
8. Section *Tasks*: *{done} done · {carried} carried into next week* → WR-03
9. Section *Shifts*: *{n} shifts · +{total} min · most often: {reason}* → WR-04 (absent when n = 0)
10. Section *Time by category*: a single horizontal stacked bar in category hues, then a list beneath: category name · *{min} min* · *{share}%* (uncategorised time listed as *No category*); time = summed timer sessions, so the section heading carries *· from timers* and a line *Items without timed sessions aren't included.*
11. Footer, only when the week is closed: *Week closed {date}*; when open: nothing

**Interacts**

| Element | Type | Behaviour |
|---|---|---|
| Strip row | button | → WR-02. |
| Square | static, labelled | Long-press or focus shows a tooltip with the day and outcome word; tapping the row is the action. |
| Templates row | static | |
| Tasks / Shifts sections | rows → WR-03 / WR-04 | |
| Category list row | static | |

**Rules**
- The week closes when Sunday's day closes and every day is reviewed; until then, everything reads *so far* and pending days are excluded with the line stated.
- Habits assigned zero times show nothing here (they're in the library, not the week).
- The strip's seven positions always render Mon–Sun regardless of the week's planned days; unplanned days are blank.

**States:** open (*so far*) · closed · no planned days (*Nothing was planned this week.* and the sections are absent) · loading (skeleton strips) · offline (readable from cache) · error.
**Done when:** n/a — a record.

### WR-02 Habit strip detail
**Job:** show one habit's week in full — every occurrence, its outcome, and its reason.
**Entry:** WR-01 strip row. **Exit:** back; day row → DR-01 (edit mode for that day).
**Reads:** header icon · title · *{credit} of {counted} this week* · the strip again, larger · then seven rows Mon–Sun (blank days read *not assigned* in muted text): weekday · scheduled time · outcome line — *done 7:24* · *done 14:52 · moved from 7:45* · *missed — something came up: long call · not counted* · *missed — planned it wrong: slept in · counts half* · *missed — didn't do it* · *traded up: stayed on Deep work · not counted* · *cut when shifted +60 · slept in · counts half* · *pending* · plus timed minutes when sessions exist (*· 9 min*) and quantity when captured (*· 24 pages*) · beneath the rows, a line *Last 4 weeks: {credit} of {counted}* as a plain fact.
**Interacts:** day row → DR-01 edit for that day, scrolled to the item.
**States:** loading · offline.

### WR-03 Carried across the week
**Reads:** header *Carried into next week* · rows: icon · title · *first assigned {date}* · *carried {n} times* · rows are read-only (the week build is where they're placed) · a link *Open next week* → Epic 1 WK-01.
**States:** empty (*Nothing was carried.*) · loading.

### WR-04 Shifts this week
**Reads:** header *Shifts* · rows per shift: weekday · *+{n} min at {time}* · reason · *cut {c}* · summary line at the bottom: *{n} shifts · +{total} min · reasons: {reason} ×{k}, …*
**Interacts:** row → Epic 2 SC-02 for that shift if the day is still today; otherwise static.
**States:** empty · loading.

---

## 4. History (HS)

### HS-01 History
**Job:** reach any past week or day.
**Entry:** RV-00 *Past weeks and days*. **Exit:** week row → WR-01 (closed) · day row → DR-01 (edit) · *Export everything* → Epic 1 ST-10.
**Reads:** header *History* · a list of weeks, most recent first, each row: *{Mon date} – {Sun date}* · *{adherence}%* or *{reviewed} of {planned} reviewed* if open · expandable to its seven days, each: weekday and date · *{adherence}%* / *pending* / *not reviewed* / *nothing assigned* · at the bottom a text link *Export everything* with the line *Your whole record, as files.*
**Interacts:** week row → WR-01 · expand → day rows → DR-01 · Export → ST-10.
**States:** empty (*No history yet — it starts with your first reviewed day.*) · loading · paginated (*Show earlier weeks*).

---

## 5. The number — UX contract for the builder

Restated so the tech spec inherits one definition.

| Item outcome | Credit | Counted |
|---|---|---|
| done (on or off schedule) | 1 | yes |
| missed · something came up | — | no |
| missed · traded up (verified) | — | no |
| missed · planned it wrong (incl. unverified "stayed on") | 0.5 | yes |
| missed · didn't do it | 0 | yes |
| cut when shifted | per the inherited tier | per the tier |
| not assigned today | — | no |
| carried | — | not today; counted on the day it resolves |
| pending | — | not until decided |

`adherence = round(sum(credit) / count(counted) × 100)`. Priority bands: high 5–7, mid 3–4, low 1–2, same rule per band. Off-schedule = done items whose `done_at` falls outside `[original_scheduled_start, scheduled_end]`. The week is the same arithmetic over its reviewed days' items. Every display of the number prints its sentence.

---

## 6. Copy register for this epic
- Outcome words: *done*, *moved*, *missed*, *not counted*, *counts half*, *counts as missed*, *traded up*, *pending*, *carried*, *not assigned*, *cut when shifted*.
- Never: *failed*, *skipped*, *streak*, *lost*, *broke*, *great*, *only*, *just*, *again*, *keep it up*, any exclamation.
- Numbers: integers for percentages; decimals only for half credits; tabular figures everywhere.
- Headings are the date or a plain noun. The serif appears on DR-07's and WR-01's number and sentence and nowhere else in the epic.

---

## 7. Cross-screen flows

### 7.1 An ordinary night
List → *Day Complete* → DR-01 (live) → three undone items → Meditate: *Missed* → *Planned it wrong* → *Earlier thing ran long* → decided · Call the DMV: *Carry forward* · Vocal: *Missed* → *Didn't do it* → decided → *Finish review* → DR-07: *78%* / *7 done, 1 planned wrong (½), 1 didn't do (0) → 7.5 / 9 = 78%.* → *Done* → List shows *Day closed at 21:40*.

### 7.2 Too tired
DR-01 → decide one → *Finish later* → List. 03:00: day auto-closes, two items pending. Morning: PN-05 → DR-01 (pending) → decide → *Finish review* → DR-07.

### 7.3 Traded up
DR-01 → Lift: *Missed* → *Planned it wrong* → *Stayed on something more important* → DR-04 → *Deep work · priority 7 · done 12:40 · not counted* → decided line *Missed — stayed on Deep work: traded up · not counted*.

### 7.4 Correcting a shift's reason
DR-01 → *Cut when shifted* → Yoga *Change* → DR-03 preselected *Planned it wrong · Slept in* → choose *Something came up · Not feeling well* → line *Changed from the shift's reason.*

### 7.5 Sunday
RV-00 → *This week · Open* → WR-01 → *so far* until Sunday's DR-07 → back → the number stands alone → Habits sorted by what slipped → Cold bath strip *2 of 5* → WR-02 → Thursday *missed — didn't do it* → tap → DR-01 edit for Thursday → *Change* → … → *Save changes* → DR-07 *Reviewed · edited*.

### 7.6 Looking back a month
RV-00 → History → expand a week → a day → DR-01 edit (read, or change) → back.

---

## 8. Calls made in this pass (flip freely)
1. Strip rows sort by what slipped, not alphabetically.
2. The Week Review's category time comes from timer sessions only, stated on the section.
3. *Carried {n} times since {date}* appears as a plain fact on a task carried three or more times — the answer to round 3's "does a task ever expire" is no, but the count is visible.
4. Tier 3 (*Didn't do it*) has no sub-reasons; the row decides.
5. A shift-cut item's attribution can be changed in the Day Review without altering the shift's own record.
6. *Something not on the list* in the traded-up picker decides at half rather than blocking.
7. Reflections never affect the number and are never required.
8. History is reachable only from the Review tab; the List and Schedule don't browse the past.

---

## 9. Interaction inventory (input to the UI component list)

| Control / element | Appears in |
|---|---|
| Index region (title, one-line status, one action) | RV-00 |
| Pending day row | RV-00 |
| Review header (date, reviewed/edited line, closed line) | DR-01, DR-07, WR-01 |
| Summary line (words only) | DR-01 |
| Item panel: identity block · two large targets · decided line with *Change* | DR-02, DR-05 |
| Tier radio rows with definition line | DR-03 |
| Reason chip row (single-select) with *Other* text and *Keep this reason* | DR-03 |
| Collapsed note field (text action → textarea) | DR-03 |
| Traded-up picker sheet: list rows with verdict tail · last-row free entry | DR-04 |
| Collapsible section with count in heading | DR-01 (Done, Reflections) |
| Reflection block: axis label + 1–7 stepper · note textarea | DR-06 |
| Done row with *edit* link | DR-01 |
| Footer pair: text *Finish later* · primary *Finish review* / *Save changes* | DR-01 |
| Big number (serif) + formula sentence + fact lines | DR-07, WR-01 |
| Template usage row | WR-01 |
| Habit strip row: icon · title · seven labelled squares (7 glyph states) · tabular ratio | WR-01, WR-02 |
| Deep work / task summary rows | WR-01 |
| Stacked horizontal bar (category hues) + legend list | WR-01 |
| Day outcome row (weekday · time · outcome line · minutes · quantity) | WR-02 |
| Shift row | WR-04 |
| Week row (expandable to day rows) · *Show earlier weeks* | HS-01 |
| Skeleton region · skeleton strip | RV-00, WR-01 |
| Discard-changes dialog | DR-01 edit |

---

## 10. Open items carried
1. Whether the Week Review's *Time by category* should also include planned durations for items done without timers (currently timers only, stated on-screen). Cheap either way.
2. The four-week line on WR-02 — kept as a plain fact; say the word if it reads as a trend.

## 11. Sign-off
Vesper — three taps close any item, no number appears before a decision, every number prints its arithmetic, leaving is always allowed, nothing is evaluated in words, and no coach exists. All three epics now have their backbone; the UI component pass can start from the three inventories.
