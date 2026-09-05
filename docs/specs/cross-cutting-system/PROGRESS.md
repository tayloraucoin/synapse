# Cross-cutting — Progress

The only authoritative answer to "is this Complete". A row per ticket; the checklist mirrors `00-build-order.md`. Cross-track dependencies are marked Complete in their own track's `PROGRESS.md`, never here.

| Ticket | Title | Depends on | Status | Date |
|---|---|---|---|---|
| SYS-1 | The shell: chrome, `PageFrame`, `shell.status`, status-line sources, sheets as history, back, tab memory, record and plan headers | SET-1 | Complete (Vesper review pending a Supabase project) | 2026-09-05 |
| SYS-2 | Time: the device-zone check, SY-06, the deferred switches applied | USE-1, SET-8 | Not started | — |
| SYS-3 | About & feedback, error pages, session expired: SY-01, SY-04, SY-05, legal pages | SYS-1, SET-8 | Not started | — |
| SYS-4 | Keyboard and focus | USE-2, USE-5, SYS-3 | Not started | — |
| SYS-5 | PWA: install offer and sheet SY-07, update line SY-02, standalone resume | REV-2, SET-9 | Not started | — |
| SYS-6 | The landing page: `/` for a visitor who is not signed in | — (handoff approval; SYS-3 soft) | Not started — handoff awaiting Taylor's approval | — |

## Checklist

- [x] SYS-1
- [ ] SYS-2
- [ ] SYS-3
- [ ] SYS-5
- [ ] SYS-4 (does not gate launch)
- [ ] SYS-6 (the front door; builds after the handoff is approved)
