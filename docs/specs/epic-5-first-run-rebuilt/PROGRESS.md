# Epic 5 — The first run rebuilt (UX v1.2) — Progress

The only authoritative answer to "is this Complete". A row per ticket; the checklist mirrors `00-build-order.md`. Epic 4's tickets (DYN-*) are Complete in `../epic-4-dynamic-schedule/PROGRESS.md` and are never re-marked here.

| Ticket | Title | Depends on | Status | Date |
|---|---|---|---|---|
| RUN-1 | Vocabulary, view models, validators, the seeds with their glyphs, the emoji lint rule | — | Complete (batch 1; 25 probes pasted; the lint rule proven both ways; the four commands pass — see `DEVIATIONS.md`) | 2026-09-16 |
| RUN-2 | Migration `0007`: the additive columns, `passages`, `quotes`, `day_plans`, the bucket, the backfill | RUN-1 | Complete (batch 1; authored, journalled, reference regenerated; **not applied to any tier — Taylor runs `0007` after `0004`–`0006`; the database-backed criteria are unverified** — see `DEVIATIONS.md`) | 2026-09-16 |
| RUN-3 | Plan services: work-day types, fixture kinds, versions and workout details, `usedBy`, the profile widened | RUN-2 | Complete (batch 2; pure probes pasted; the four commands pass; **the database-backed criteria are unverified — no tier touched** — see `DEVIATIONS.md`) | 2026-09-16 |
| RUN-4 | Passages and the quote bank: services, the upload kind, the orient read model | RUN-2 | Complete (batch 2; `cycleIndex` and the path guard probed; the four commands pass; **the database-backed and Vigil criteria are unverified — no tier touched** — see `DEVIATIONS.md`) | 2026-09-16 |
| RUN-5 | Day plans: the service, the weekday invariant, pre-fill from plans, *Set from the plan* | RUN-3 | Complete (batch 3; TD-21 + migration `0008` added; one workout per day for now; pure probes pasted; the four commands pass; **database-backed criteria unverified** — see `DEVIATIONS.md`) | 2026-09-16 |
| RUN-6 | The day under v1.2: travel rows, version resolution, `applyWorkType`, the journal reminder | RUN-3 | Complete (batch 3; `writeWorkoutRows` shared by the pick, the trade and the week build; `applyWorkType`/`removeWorkType` + N2 job; pure probes pasted; the four commands and the Storybook build pass; **database-backed criteria unverified** — see `DEVIATIONS.md`) | 2026-09-16 |
| RUN-7 | `@syn/ui` for v1.2 | RUN-1 | Complete (batch 4; `Card`, `EmojiSlot`, `SelectRow`/`SelectRowList`, `SortableList`, `RangeEditor`, `RichTextEditor`, `TagInput`, `PassageCarousel`, `useOptimisticValue`, the ten extensions; every state a story; key paths verified in the browser; the Storybook build and the four commands pass; **Vesper's story review pending** — see `DEVIATIONS.md`) | 2026-09-16 |
| RUN-8 | The frame and screens 1–5 | RUN-3, RUN-7 | Complete (batch 5; fourteen steps, 9 and 13 as placeholders, 14 a 404; screens 1–5 rebuilt; `WorkDayTypeCard`; the fixture sheet's kinds and glyph; *Work-day types* under Settings; the four commands and the Storybook build pass; **the signed-in walk is unverified — no session in this thread; Vesper's review pending** — see `DEVIATIONS.md`) | 2026-09-16 |
| RUN-9 | Screen 6 and the orient frame | RUN-4, RUN-7, RUN-8 | Complete (batch 5; `components/passages/` with the sheet, uploads, undo and reorder; screen 6 with the quote and the three switches writing at once; the frame's carousel, *Last night* disclosure and third field; the four commands pass; **the signed-in walk is unverified — no session in this thread; Vesper and Sage pending** — see `DEVIATIONS.md`) | 2026-09-16 |
| RUN-10 | Screens 7–9 | RUN-8, RUN-3 | Not started | — |
| RUN-11 | Screens 10–12 | RUN-8, RUN-3, RUN-6 | Not started | — |
| RUN-12 | Screen 13 — the day builder | RUN-5, RUN-10, RUN-11 | Not started | — |
| RUN-13 | Screen 14 and the morning modes | RUN-12, RUN-6, RUN-9 | Not started | — |
| RUN-14 | The quotes admin surface `[PROVISIONAL — Taylor, D3]` | RUN-4 · D3 | Not started | — |
| RUN-15 | Migration `0008` and the retirements | RUN-9, RUN-10, RUN-11, RUN-13 | Not started | — |

## Checklist

- [x] RUN-1
- [x] RUN-2
- [x] RUN-3
- [x] RUN-4
- [x] RUN-5
- [x] RUN-6
- [x] RUN-7
- [x] RUN-8
- [x] RUN-9
- [ ] RUN-10
- [ ] RUN-11
- [ ] RUN-12
- [ ] RUN-13
- [ ] RUN-14
- [ ] RUN-15
