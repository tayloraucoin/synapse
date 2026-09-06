# Epic 2 — In Use — Progress

The only authoritative answer to "is this Complete". A row per ticket; the checklist mirrors `00-build-order.md`. Cross-track dependencies are marked Complete in their own track's `PROGRESS.md`, never here.

| Ticket | Title | Depends on | Status | Date |
|---|---|---|---|---|
| USE-1 | The day model: boundaries, today, state derivation, day parts, auto-close, the day read model | SET-1 | Complete (DB criteria pending a Supabase project) | 2026-09-05 |
| USE-2 | Plain List: LS-00/01/02/03, done and undo, the wake anchor, record and plan modes | USE-1, SET-6, SYS-1 | Not started | — |
| USE-3 | Item sheet and day header: IT-01, DH-01, DH-02, the timer engine and the tick store | USE-2, SET-9 | Not started | — |
| USE-4 | Manual time, sessions, pause/resume, and a one-off from the day: IT-02, G1, G3 | USE-3 | Not started | — |
| USE-5 | Schedule: SC-01, SC-02 (read), ghosts, window spans, shift bands | USE-3 | Not started | — |
| USE-6 | Shift my day: SF-01, the late offer, LS-03 *Do it anyway*, SC-02 undo | USE-5, SET-9 | Not started | — |
| USE-7 | Capacity trim: TR-01, LS-02 *Bring back*, *Keep instead* | USE-2, USE-3 | Not started | — |
| USE-8 | Notifications: N1/N4/N5/N6 jobs, payloads, grouping, quiet after complete, landings | USE-3, REV-2, SET-6, SET-9 | Not started | — |

## Checklist

- [x] USE-1
- [ ] USE-2
- [ ] USE-3
- [ ] USE-4
- [ ] USE-5
- [ ] USE-8
- [ ] USE-6 (Phase 2)
- [ ] USE-7 (Phase 2)
