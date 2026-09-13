# App walkthrough feedback — v1.0 build

**Author:** Taylor (testing notes) · Vesper (mapping and severity)
**Status:** Open. First session, 11–12 Sept 2026, against the build at `b3e439e`.
**What this is:** feedback on the app **as built to the v1.0 spec** — the first-run flow, the habit library, the template editor. It is *not* feedback on the v1.1 direction; that lives in the ledger and the Q&A. Where a note is already answered by v1.1, the mapping says so, so it isn't fixed twice. This document also fills **Section K** of [`2026-09-11-vesper-questions-for-ux-v1.1.md`](2026-09-11-vesper-questions-for-ux-v1.1.md).
**Screens seen:** first run step 1 (day), step 2 (habits) with the starter chooser open, the *New habit* sheet, the template editor.

Severity is Vesper's: **Blocking** (breaks a law or a trust contract, or makes the flow fail) / **Should-fix** (hurts the experience) / **Consider** (taste). The **Lands in** column says whether the fix is a v1.0 patch, is absorbed by v1.1, or both.

---

## Standing direction from this session

> **Mobile first, always.** Think of everything from a mobile device — an app — first. How would a mobile designer design this?

This applies to every note below and to the v1.1 spec. The v1.0 spec was written mobile-first on paper (v1 §0.4, §2.2 "phone in one hand") but the build was reviewed on desktop and it shows: side-panel sheets, a three-segment control that wraps, a chooser with a footer button row. v1.1's screen specs will state the mobile layout first and derive desktop from it, not the reverse.

---

## First run · step 1 — Your day

| # | Note (Taylor) | Severity | Mapping | Lands in |
|---|---|---|---|---|
| W1 | The time zone is already assumed, but the input is open — you scroll down only to discover your zone is already selected. Show the **value with an Edit** action; tapping Edit opens the autocomplete with the input already focused. | Should-fix | v1 §4.2 step 1 says "timezone confirmation" — a confirmation, not an entry. The build renders the entry control. Fix is a display state: value + *Change*, control on demand. Same pattern should apply to any pre-filled field in first run (wake time). | v1.0 patch (`step-1-day.tsx`, deleted with the v1.0 sequence in DYN-10); carried into v1.1 as the rule for pre-filled fields — `TimeField disclosed` (DYN-10). |

## First run · step 2 — Habits (and the starter chooser)

| # | Note (Taylor) | Severity | Mapping | Lands in |
|---|---|---|---|---|
| W2 | Habit selection should be a **selection list** with the ability to add anything not there. The functionality exists but the UX could be smoother. | Should-fix | The build splits it into *Add a habit* (opens the full sheet) and *Start from a small set* (opens a chooser). One list with tap-to-select and a free-entry row at the bottom is the smoother shape. | v1.1 (the landscape screen, ledger §20 / Q&A L7). Small v1.0 patch possible: make the chooser the default view. |
| W3 | **Group** the list: start with *Recommended* (wake up immediately / no snooze, make bed, …), then by some group or category name. **Greatly extend** the options. Consider *Popular* and *All* as tabs. | Should-fix | v1.1 already has per-block starter libraries (Q&A Q11). Grouping by block (*Morning · Prep · Training · Wind-down*) is the natural first axis; *Recommended* is a curated subset across blocks. Tabs for *Popular / All* are a reasonable mobile pattern; I'd try segmented *Recommended / All* first and add *Popular* only when there's usage to define it. Content extension is a copy task, mine. | v1.1. |
| W4 | After selecting, the UI is awkward: checkbox-select, then a footer button that says *Add N selected* / *Close*, while the step's primary reads *Continue without habits*. A ticked checkbox should **be** the selection, and *Continue* should save anything unsaved. Instead of the added list appearing below, maybe a **Selected** tab. | Blocking | Two problems. (1) Double commit: tick → *Add* → the list re-renders below → *Continue*. v1 §4.2 asked for "a flat list builder"; the chooser-as-modal turned it into a two-stage commit. (2) The step's primary label doesn't know the chooser's state, so it reads *Continue without habits* while habits are ticked — a wrong sentence on the primary action, which fails the trust test. Fix: tick = added (optimistic, undoable), the primary is always *Continue*, and it counts (*Continue · 6 habits*). A *Selected* tab is the right mobile shape for reviewing what's ticked without scrolling past the chooser. | v1.0 patch (label and single-commit); v1.1 (the tabbed list). |

## Habit sheet — *New habit*

| # | Note (Taylor) | Severity | Mapping | Lands in |
|---|---|---|---|---|
| W5 | *Task / appointment* doesn't fit its segment; the label wraps. | Should-fix | Three segments with a two-word label in a mobile-width sheet. Either shorter labels or the type moves out of the sheet (see W6). | v1.0 patch if the type stays; moot under W6. |
| W6 | Do **appointments** even belong in habits? They're a different kind of schedule item. Is **deep work** one either? The screen is called *Habits* and it offers types that aren't habits. | Blocking | Agreed, and v1.1 resolves it structurally: appointments become **fixtures** and one-offs (Q&A Q6, ledger §21); deep work becomes the **work block** with a focus (L3); the library holds habits only. In v1.0 terms the sheet is doing v1 §3.3's job — one table, three types — and the label *Habits* is honest about only a third of it. Don't patch the sheet; let v1.1 split the concepts. | v1.1. |
| W7 | Why does Category say *None* with no other options, and why the awkward circle around it? | Should-fix | v1 §4.3 step 4: "chip picker, *+ New category* inline." The build shows the empty-state chip with the selected-ring treatment and no *+ New category* affordance, so it reads as a broken control rather than an empty picker. Fix: hide the picker until a category exists, or show *+ New category* beside *None*, and the ring only on a real selection. | v1.0 patch. Whether categories survive v1.1 at all is open — blocks may do the grouping job (Q&A, add to §L). |

## Template editor

| # | Note (Taylor) | Severity | Mapping | Lands in |
|---|---|---|---|---|
| W8 | Instead of *Add an item*, **drag and drop or select**. Default the duration to the **middle of the range**, and make adjusting the allocated time smooth. | Should-fix | v1 §4.4 already specifies the midpoint default ("the duration defaults to the midpoint of the habit's range") — verify the build honours it. The add gesture: a tap-to-add from a picker is fine on mobile; drag is the gesture for *placing*, not *adding*. Smooth adjustment = a resize handle on the block, not a number field. | v1.0: check the midpoint default. v1.1: the block editor (ledger §6, §22). |
| W9 | **Transition time** between items needs to be easy to add. The interface should feel like **Google Calendar time-blocking**. | Should-fix | This is the ledger's §6 exactly: gaps as first-class, resizable, offsets derived. Not patchable in v1.0 — the model stores absolute offsets. | v1.1. |
| W10 | (From the Q&A, Q30) Duration inputs **clamp to the habit's range**; they shouldn't. The range is a default, not a limit. | Should-fix | Validation rule in the slot form. Remove the clamp; keep the range as the initial value and as a hint. | v1.0 patch; v1.1 rule. |

---

## What to do with this

**v1.0 patches** (small, safe, worth doing before the walkthrough continues so the next session isn't tripped by the same things): W1, W4 (label + single commit), W5, W7, W8 (verify midpoint), W10.

**Absorbed by v1.1** (do not patch — the concept changes): W2, W3, W6, W9, and the tabbed *Selected* half of W4.

**New question for the Q&A §L, from W7:** do categories survive v1.1, or do blocks take over the grouping job? Categories were only ever for time-distribution reporting (v1 §3.2); if the Week Review's *time by category* becomes *time by block*, the category concept can go.

## Still to walk

Week build · the List · the Schedule · the item sheet and timers · shift and trim · Day Review · Week Review · Settings tree · install and offline. Add rows as you go; the numbering continues from W11.
