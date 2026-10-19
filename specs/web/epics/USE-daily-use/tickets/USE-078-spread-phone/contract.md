---
id: "USE-78"
size: small
objective: "Below 1024 Spread is a full sheet, not the dialog: the item named, Hours left, Session length, Which Work block (Morning, Afternoon, Pick per day), Days and tier as a sub-page listing each weekday's free time with today not offered once its block began, The sessions previewed, the carry line naming what goes on to next week, and Spread it, on fixtures"
slice_type: "the phone's form of a shared allocation; risks a second preview function, the dialog shown at 402, a day picked with no room said in red, and the sub-page losing the picks on back"
non_negotiables:
  - "One preview: USE-77's spreadPreview; the phone draws it and never computes its own."
  - "A full sheet below 1024 with Days and tier as a step inside it, back on the left; never the dialog (C-USE-spread-4)."
  - "Free time is a length, never a count or a percentage; today once past its block says so (C-USE-spread-days-and-tier-1)."
  - "Spread it places one item's sessions, each \"n of N\", and writes nothing to Linear (C-USE-spread-across-the-week-402-3)."
  - "@syn/ui ResponsiveSheet and preset tokens; 44 × 44 targets (the 34 px chips grow to 44)."
devs_call: "Whether the sheet and the dialog share one form component with two shells; the sub-page's transition (none under reduced motion)."
cites:
  - "specs/web/epics/USE-daily-use/ux/interactions/spread/states/across-the-week/402.md"
  - "specs/web/epics/USE-daily-use/ux/interactions/spread/index.md"
  - "specs/web/epics/USE-daily-use/ux/interactions/spread/states/days-and-tier.md"
  - "C-USE-spread-4"
  - "C-USE-spread-across-the-week-402-1"
  - "C-USE-spread-across-the-week-402-2"
  - "C-USE-spread-across-the-week-402-3"
  - "C-USE-spread-days-and-tier-1"
  - "C-USE-spread-days-and-tier-2"
  - "C-USE-spread-days-and-tier-3"
  - "D-USE-54"
  - "D-USE-55"
  - "D-USE-57"
waiver: "Spread on the phone: the full sheet's state, its Days and tier page, and the index's phone criterion."
truth_files: "none: promotion carries interactions/spread/"
qa: Q1
reviewers:
  - assay
focus:
  - "the full sheet and Days and tier at 402 against their captures (assay)"
operator_review: false
planned_paths:
  - "apps/web/components/work/spread/"
  - "apps/web/lib/data/use-spread.ts"
  - "apps/web/lib/fixtures/"
  - "specs/web/epics/USE-daily-use/tickets/USE-078-spread-phone/evidence/"
depends_on:
  - "USE-4"
  - "USE-7"
  - "USE-10"
  - "USE-77"
out_of_scope:
  - "Opening it from doesn't fit (Spread it across the week): USE-80"
  - "Carry on next week's later placing: the work pool wiring"
criteria:
  - id: C1
    statement: "At 402 the sheet shows \"Spread across the week\", \"Pool · <client> · SYN-218 · 8 Huge\", Hours left, Session length, Which Work block with Morning, Afternoon and Pick per day, Days and tier \"Tue to Fri · Primary\", The sessions with each day's \"Work ends <time>\", the carry line \"<length> carry on to <Day> <date>, next week.\" and Spread it"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-078-spread-phone/evidence/across-the-week-402.png"
  - id: C2
    statement: "At 402 Days and tier shows \"‹ Spread across the week\", each weekday with \"<length> free in the morning\", today \"today, already past <time>\" not offered, \"Tier, every session\" and Done; unticking a day drops its session from the preview and grows the carry line"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-078-spread-phone/evidence/days-and-tier-402.png"
  - id: C3
    statement: "The web app type-checks"
    evidence: check
    command: "yarn check-types"
  - id: C4
    statement: "The web app lints clean"
    evidence: check
    command: "yarn lint"
---

# Contract — spread-phone

## Build notes

Wave 2, after USE-77. Match `ux/interactions/spread/captures/across-the-week-402.png` and `days-and-tier-402.png`.

- **Decisions that apply:**
  - D-USE-54: on the phone a full sheet with the desk's fields and the preview. D-USE-55: Spread stands in for the desk's drag. D-USE-57: the Days and tier page; "doesn't fit" offers Spread; the ··· holds Spread.
  - Words, each width as drawn (Gloss's one-set proposal is not taken): "Hours left", "Session length", "Which Work block", "Morning", "Afternoon", "Pick per day", "Days and tier", "<Day> to <Day> · <Tier>", "The sessions", "Work ends <time>", "<length> carry on to <Day> <date>, next week.", "Spread it"; sub-page "‹ Spread across the week", "Days", "today, already past <time>", "<length> free in the morning", "<length> free", "Tier, every session", "Done".
  - Hours left beyond what the picked days hold: the carry line names what carries and its day.
  - Toast after Spread it, as the desk's [ASSUMPTION].
- **Interfaces:** `SpreadSheet` and `DaysAndTierStep` in `components/work/spread/`, sharing `useSpread` and the form state with USE-77's dialog. The dialog (from 1024) and this sheet (below) are different trees, so `useIsSplit` picks between them, as placement.md allows; the sheet is `ResponsiveSheet`, its side panel from 768 to 1023 (D-USE-103).
- **Per path:** scenarios `spread-402`, `spread-days-and-tier`.
- **Gotchas:** the page between 768 and 1023 has no Week, so Spread opens from This week or the Item sheet there.
- **Model:** Opus 5.5 at medium. A smaller model writes a second preview, or shows the desk dialog on the phone.
