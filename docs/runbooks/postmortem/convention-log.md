---
title: Convention log
description: One line per bug whose trace pointed at a convention (a missing criterion type, a QA level set too low, a reviewer not cast, a check that does not exist). Read when conventions are next changed.
layer: runbooks
status: adopted
thread: USE-138
role: none
date: 2026-10-19
last_reviewed: 2026-10-19
supersedes:
load_when: on request
---

# Convention log

Written by the Bug track's Trace stage (`docs/workflows/tracks/bug.md`). Newest last. Each line: date, the bug's ticket, the ticket that let it through, the gap, what now covers it.

- 2026-10-19 · USE-138 · USE-108 (Q1, no reviewers) put production on live Postgres, and its one hosted criterion (C4, manual) looked at staging; USE-2's C8 also covered staging only. Nothing checked that production had `db:setup` run, so `auth.users` had no trigger and a new sign-up had no `public.users` row. Gap: no criterion type for "the target hosted tier is migrated and set up", and Q1 on a ticket that makes a tier read the database. Now covered by `04_verify_setup.sql`, which fails `db:setup` on a tier that is not ready. Still open: a ticket that takes a tier live should carry a manual criterion that `db:setup` verified on that tier.
- 2026-10-19 · USE-138 · USE-92 (whose contract says "Taylor sets the key in Vercel") and USE-108, which took production live, never checked it was set. `UNDO_TOKEN_KEY` was missing in production, so every planner write answered 500 at the first save. Gap: every secret is `.optional()` so builds pass without them, and no check asks what a production deploy needs; a ticket that adds a server secret has no criterion that the deployed tier holds it. Now covered for this key by `apps/web/lib/env/deploy-env.ts`, which fails a production build without it. Still open: a ticket that adds a secret should add it to `REQUIRED_IN_PRODUCTION` when a request path cannot run without it.
- 2026-10-21 · checklist bugs (no ticket) · USE-16 and USE-17 (tick and add waited for the server), USE-17 and RUN-7 (a grip that never dragged; the touch sensor never wired), WEB-1 (15px body type in fields, so iOS zooms), USE-40 (a timed checklist drawn the height of its span). Gap: every criterion and capture runs on the fixture server (instant writes) in a desktop browser, so none could see latency, iOS zoom or a touch drag; nothing asked for a write against a slow server or a phone's input. Now covered: optimistic writes as the apps/web rule, with `slotWrites: "hang"` and `failWrites` states, a coarse-pointer field floor (`--fs-input`) and a touch-sensor handle. Still open: a criterion type for "on a phone" (touch, zoom) on any ticket that adds a field or a drag.
