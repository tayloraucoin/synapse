---
id: USE-122
size: small
objective: "At the desk, Enter with focus on nothing in particular takes focus to Next, and focus stays on a row after F and D instead of dropping to the page"
slice_type: "a fix found by the Paper assay (thread C, 2026-10-18) on USE-71 C4; risks Enter stealing a control's own Enter, or a key acting inside a sheet"
non_negotiables:
  - "Enter with focus on the body, or on nothing inside the main column, focuses Next (the lifted card's row; on the strip, Go)."
  - "Enter on a focused control stays that control's own (a row's link opens its sheet)."
  - "After F or D, focus stays on the acted row, or moves to the row that took its place; it never falls to the body."
  - "Keys act only when focus is not in a text field, an open menu or a sheet, and never on an opened day."
  - "Focus moves without animation (A-15)."
devs_call: "Where focus lands when the acted row leaves the list (Done), as long as it is a row."
cites:
  - "specs/web/epics/USE-daily-use/ux/work/today/words-and-access.md"
  - "C-USE-today-5"
  - "D-USE-62"
truth_files: "none: the key map already says this; the code is brought to it"
qa: Q1
reviewers:
  - assay
focus:
  - "Enter from the body and focus after F and D, read from the accessibility tree at 1440 (assay)"
operator_review: false
planned_paths:
  - "apps/web/lib/hooks/use-today-keys.ts"
  - "apps/web/lib/hooks/use-today-keys.test.ts"
  - "apps/web/app/(shell)/today/_components/desk/"
  - "specs/web/epics/USE-daily-use/tickets/USE-122-today-enter-focuses-next/evidence/"
depends_on:
  - "USE-71"
out_of_scope:
  - "New keys, and the phone (no keys there)"
criteria:
  - id: C1
    statement: "The hook, driven from a document whose activeElement is the body, focuses Next on Enter; after F and after D the focused element is a row"
    evidence: test
    command: "yarn test"
  - id: C2
    statement: "In the browser at 1440 on /dev/parts?state=today-working, Enter from a fresh page focuses \"[Alder intro], next\", and F and D each leave focus on a row, read back from the accessibility tree"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-122-today-enter-focuses-next/evidence/keys.txt"
  - id: C3
    statement: "The web app type-checks"
    evidence: check
    command: "yarn check-types"
---

# Contract — USE-122 today-enter-focuses-next

## Build notes

Found by the Paper assay of thread C on 2026-10-18: USE-71 C4 judged **mismatch**. Evidence: `USE-071-today-keys-drag/evidence/keys.txt`. Each case ran on a fresh page. J, K, F (fire and bring back) and D act. Enter from a fresh page left focus on BODY, and after F and D focus fell to BODY.

- **Approach:** `todayKeyAction` already returns `{ type: "next" }` when `context.onControl` is false. Trace why the action never runs from the body: the listener's scope (`root` or nothing), or `goToNext`'s target. After F and D, refocus the row by key once the list re-renders.
- **Decisions that apply:** D-USE-62, words-and-access › Desk keys: "**Enter** goes to Next (focuses it; on the strip it is Go). [ASSUMPTION] Keys act only when focus is not in a text field or an open menu or sheet. Focus moves without animation (A-15)."
- **Interfaces:** `TodayKeyActions.goToNext` and `focusTarget` may change shape; nothing new outside the hook.
- **Per path:** `use-today-keys.ts`, the Enter path and refocus after acting; its test, both cases; `desk/`, wiring if the screen passes the wrong root.
- **Gotchas:** after Escape closes a sheet, focus returns to the sheet's opener, and Enter on it opens the sheet again; that is the control's own Enter, not a bug.
- **Model:** Sonnet is enough.
