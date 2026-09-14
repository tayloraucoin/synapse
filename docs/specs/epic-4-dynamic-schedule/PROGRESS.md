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
| DYN-9 | The block editor, step two: drag, resize, gaps | DYN-8 | Complete (authored from the handoff and built in one thread with DYN-20 and DYN-16; DYN-7's `DragLayer` wired over the strip in `editor` mode, the seam drag and `g` added to the layer, the range as a faint band, `template.moveSlot` gaining `steps`; every gesture has its keyboard path; the four commands and the Storybook build pass; the gesture walk is not observed — see `DEVIATIONS.md`) | 2026-09-13 |
| DYN-10 | First run 1–6 | DYN-7, DYN-4 | Complete (authored from the handoff and built in one thread; six screens at `/setup/{1–6}`, the transitional ready at 7, the v1.0 steps deleted; the four commands pass; the browser walk is blocked at sign-in — see `DEVIATIONS.md`) | 2026-09-13 |
| DYN-11 | First run 7–12 and the first week | DYN-10, DYN-8, DYN-5 | Complete (authored from the handoff and built in one thread; six screens, the landscape chooser replacing `starter-set/`, `template.fit`, `completeFirstRun` pre-filling the week; the four commands pass; the acceptance walk is blocked at sign-in — see `DEVIATIONS.md`) | 2026-09-13 |
| DYN-12 | The week build amended | DYN-5, DYN-7 | Complete (authored from the handoff and built in one thread; the row line, the per-block day sheet, `week.tradeWorkouts`, `week.defaultPlan`, *Plan from your defaults*; the four commands pass; the acceptance walk is blocked at sign-in — see `DEVIATIONS.md`) | 2026-09-13 |
| DYN-13 | The orient frame and the wake moment | DYN-5, DYN-7 | Complete (authored from the handoff and built in one thread; `/orient` with the chrome hidden, the entry tree's new branch, `day.orient`/`saveMorning`, `shouldShowSkipLine` (probed: the four rules hold), the wake-anchor switch retired; the four commands pass; the acceptance walk is blocked at sign-in — see `DEVIATIONS.md`) | 2026-09-13 |
| DYN-14 | The quick-pick and *Set the day* | DYN-13, DYN-6 | Complete (authored from the handoff and built in one thread; `components/quick-pick/` with six collapsed sections, the live budget line, the R7 dialog, `ConfirmYesterdayPanel`; `/today` branches on `confirmedAt`; the four commands pass; the acceptance walk is blocked at sign-in — see `DEVIATIONS.md`) | 2026-09-13 |
| DYN-15 | Today by block, the day header, the item sheet, the habit-day sheet | DYN-14 | Complete (authored from the handoff and built in one thread; the list by block with the container work row and the marker, the header's focus and anchor, the five-row day header sheet with *Add from the library*, the item sheet's *Do now* / *Edit today's* / one-of, `components/habit-day-sheet/`; `item.chooseAlternate`, `day.addFromLibrary`, `DayView.unblocked`; the four commands pass; the acceptance walk is blocked at sign-in — see `DEVIATIONS.md`) | 2026-09-13 |
| DYN-16 | The Schedule, editable | DYN-15, DYN-6 | Complete (authored and built with DYN-20 and DYN-9; the canvas reads `blocks` + `unblocked`, draws `BlockBand`s, slack and the work container, wires `DragLayer` to `item.move`, `item.editToday`, `day.moveBlock` and Adjust for the morning band; the pin dialog via the layer's `onPinnedDrop`; move mode by `?mode=move`; ghosts only after the original time; the four commands and the Storybook build pass; the drag walk is not observed — see `DEVIATIONS.md`) | 2026-09-13 |
| DYN-17 | Adjust | DYN-15, DYN-6 | Complete (authored from the handoff and built in one thread; `components/adjust-sheet/` over `adjust.preview/commit/undo`, three entries, the late-wake offer from `shell.status.lateWakeOffer`; the shift and trim rows gone from the day header sheet; the four commands and the Storybook build pass; the acceptance walk is blocked at sign-in — see `DEVIATIONS.md`) | 2026-09-13 |
| DYN-18 | The evening | DYN-15, DYN-14 | Complete (authored from the handoff and built in one thread with DYN-19; `/day/{date}/journal` + `components/journal/`, the wind-down *Journal* row's navigation and self-tick (`syncJournalItem`), `review.confirmLastNight` with the panel first in the Day Review, Settings → Your day → *Closing the day* as the embedded screen with the wind-down chooser band and the ghost row; the four commands pass; the acceptance walk is blocked at sign-in — see `DEVIATIONS.md`) | 2026-09-13 |
| DYN-19 | Review amended | DYN-18 | Complete (authored and built with DYN-18; the Day Review grouped by `BlockHeader` with the work line, the intention, *planned · done* and *shortened*; the Week Review's counts line, time by block, Reflections; `stripStateFor` reads `not_confirmed`; the export's three new CSVs; the four commands pass; the acceptance walk is blocked at sign-in — see `DEVIATIONS.md`) | 2026-09-13 |
| DYN-20 | Notifications revised | DYN-14, DYN-18 | Complete (authored and built with DYN-9 and DYN-16; one `notifyStarts` scan over `block_start` · `item_start` (per block) · `fixture_start` · `devices_off`, gated on `confirmed_at` for what the pick derives and grouped by the minute; `claimDelivery` + `sendClaimed`; the three payload builders; `notification.setPref` with `blockKind`; ST-07's *Every item in…* group; the four commands pass; the timing edges are read from the code, not observed — see `DEVIATIONS.md`) | 2026-09-13 |
| DYN-21 | Migration `0006` and the retirements | DYN-9, DYN-16, DYN-17, DYN-19, DYN-20 | Complete (authored from the handoff and built in one thread; `0006_retire_v1_model.sql` — the v1.0 backfill in SQL, the assertion, the drops, `anchor_time` nulled — with its journal entry and snapshot; the v1.0 services, routers, utils, constants, composites, sheets and routes deleted and every reader re-pointed at `day_blocks`; `SCHEMA_REFERENCE.md` and the directory map regenerated; the four commands and the Storybook build pass; **`0006` is not applied to any tier — Taylor runs it after 0004/0005**) | 2026-09-13 |

## Checklist

- [x] DYN-1
- [x] DYN-2
- [x] DYN-3
- [x] DYN-4
- [x] DYN-5
- [x] DYN-6
- [x] DYN-7
- [x] DYN-8
- [x] DYN-9
- [x] DYN-10
- [x] DYN-11
- [x] DYN-12
- [x] DYN-13
- [x] DYN-14
- [x] DYN-15
- [x] DYN-16
- [x] DYN-17
- [x] DYN-18
- [x] DYN-19
- [x] DYN-20
- [x] DYN-21
