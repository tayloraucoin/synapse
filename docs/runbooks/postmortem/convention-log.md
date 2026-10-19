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
