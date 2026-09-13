# Epic 4 — Dynamic schedule (UX v1.1) — Progress

The only authoritative answer to "is this Complete". A row per ticket; the checklist mirrors `00-build-order.md`. Cross-track dependencies (SET-*, USE-*, REV-*, SYS-*) are Complete in their own tracks' `PROGRESS.md` and are never re-marked here.

| Ticket | Title | Depends on | Status | Date |
|---|---|---|---|---|
| DYN-1 | Vocabulary, view models, constants, and `stackBlock` | — | Complete (twelve probes pasted in the closing report) | 2026-09-12 |
| DYN-2 | Migration `0004`: block templates, stacked slots, habits' block kinds and rotations, the offset backfill | DYN-1 | Complete (verified on scratch databases; hosted and project-local application pending Taylor) | 2026-09-12 |
| DYN-3 | Migration `0005`: the profile, fixtures, `day_blocks`, the day-side columns, the journal, per-block notification prefs, the trigger amendment | DYN-2 | Complete (verified on scratch databases; application to Supabase tiers pending Taylor) | 2026-09-12 |
| DYN-4 | Plan services: block templates by kind, the same-position rule, fixtures, workouts and focuses, the library by block | DYN-3 | Complete (validators, grep, and the four verify commands probed; the database-backed criteria wait for `0004`/`0005` on a tier — see `DEVIATIONS.md`) | 2026-09-12 |
| DYN-5 | Materialisation per block and *Set the day* | DYN-4 | Complete (the pure layout and state derivations probed; the database-backed criteria wait for `0004`/`0005` on a tier — see `DEVIATIONS.md`) | 2026-09-13 |
| DYN-6 | Adjust, *Do now*, habit-day edits, and moves | DYN-5 | Complete (the pure arithmetic and fingerprint probed; undo decision (b) taken; the database-backed and induced-staleness criteria wait for `0004`/`0005` on a tier — see `DEVIATIONS.md`) | 2026-09-13 |
| DYN-7 | `@syn/ui` for v1.1 | DYN-1 | Complete (authored from the handoff and built in one thread; every composite storied; the Storybook build and the four commands pass — see `DEVIATIONS.md`) | 2026-09-13 |
| DYN-8 | The block editor, step one, and Settings → Your day | DYN-4, DYN-7 | Complete (authored from the handoff and built in one thread; the editor, Your day, the library regrouped, the redirects, `template-editor/` deleted; the four commands and the Storybook build pass; the acceptance walk is blocked at sign-in — see `DEVIATIONS.md`) | 2026-09-13 |
| DYN-9 | The block editor, step two: drag, resize, gaps | DYN-8 | Not started (handoff) · does not gate | — |
| DYN-10 | First run 1–6 | DYN-7, DYN-4 | Complete (authored from the handoff and built in one thread; six screens at `/setup/{1–6}`, the transitional ready at 7, the v1.0 steps deleted; the four commands pass; the browser walk is blocked at sign-in — see `DEVIATIONS.md`) | 2026-09-13 |
| DYN-11 | First run 7–12 and the first week | DYN-10, DYN-8, DYN-5 | Complete (authored from the handoff and built in one thread; six screens, the landscape chooser replacing `starter-set/`, `template.fit`, `completeFirstRun` pre-filling the week; the four commands pass; the acceptance walk is blocked at sign-in — see `DEVIATIONS.md`) | 2026-09-13 |
| DYN-12 | The week build amended | DYN-5, DYN-7 | Complete (authored from the handoff and built in one thread; the row line, the per-block day sheet, `week.tradeWorkouts`, `week.defaultPlan`, *Plan from your defaults*; the four commands pass; the acceptance walk is blocked at sign-in — see `DEVIATIONS.md`) | 2026-09-13 |
| DYN-13 | The orient frame and the wake moment | DYN-5, DYN-7 | Complete (authored from the handoff and built in one thread; `/orient` with the chrome hidden, the entry tree's new branch, `day.orient`/`saveMorning`, `shouldShowSkipLine` (probed: the four rules hold), the wake-anchor switch retired; the four commands pass; the acceptance walk is blocked at sign-in — see `DEVIATIONS.md`) | 2026-09-13 |
| DYN-14 | The quick-pick and *Set the day* | DYN-13, DYN-6 | Complete (authored from the handoff and built in one thread; `components/quick-pick/` with six collapsed sections, the live budget line, the R7 dialog, `ConfirmYesterdayPanel`; `/today` branches on `confirmedAt`; the four commands pass; the acceptance walk is blocked at sign-in — see `DEVIATIONS.md`) | 2026-09-13 |
| DYN-15 | Today by block, the day header, the item sheet, the habit-day sheet | DYN-14 | Not started (handoff) | — |
| DYN-16 | The Schedule, editable | DYN-15, DYN-6 | Not started (handoff) · does not gate | — |
| DYN-17 | Adjust | DYN-15, DYN-6 | Not started (handoff) | — |
| DYN-18 | The evening | DYN-15, DYN-14 | Not started (handoff) | — |
| DYN-19 | Review amended | DYN-18 | Not started (handoff) | — |
| DYN-20 | Notifications revised | DYN-14, DYN-18 | Not started (handoff) | — |
| DYN-21 | Migration `0006` and the retirements | DYN-9, DYN-16, DYN-17, DYN-19, DYN-20 | Not started (handoff) | — |

## Checklist

- [x] DYN-1
- [x] DYN-2
- [x] DYN-3
- [x] DYN-4
- [x] DYN-5
- [x] DYN-6
- [x] DYN-7
- [x] DYN-8
- [ ] DYN-9 (does not gate)
- [x] DYN-10
- [x] DYN-11
- [x] DYN-12
- [x] DYN-13
- [x] DYN-14
- [ ] DYN-15
- [ ] DYN-16 (does not gate)
- [ ] DYN-17
- [ ] DYN-18
- [ ] DYN-19
- [ ] DYN-20
- [ ] DYN-21
