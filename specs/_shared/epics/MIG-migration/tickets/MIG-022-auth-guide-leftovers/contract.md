---
id: MIG-22
size: small # small: under half a day, the default; medium: half a day to two days; large: split it
objective: "The auth guide describes Synapse as built, and @syn/auth exports no browser factory that cannot run in a browser"
slice_type: "docs and a dead export; risks a builder following a stale admin-role or browser-client instruction"
non_negotiables:
  - "[FILL: at most seven, one line each]"
devs_call: "[FILL: what the builder decides freely]"
cites:
  - "[FILL: the one surface file, as specs/<app>/ux/<area>/<surface>.md]"
  - "[FILL: decision and criterion IDs from it, as D-OB2-1 or OB2-W3]"
truth_files: "none: [FILL: why no living UX file changes]" # or a list of specs/<app>/ux/ paths edited in this PR
qa: Q1 # Q1, Q2 or Q3, as the operator confirmed (docs/workflows/qa-levels.md)
reviewers: [] # who reviews, as the operator confirmed; role names, as in vigil or warden
focus: [] # named parts to examine more closely, as in "the webhook handler: every event type handled (warden)"
operator_review: false # true when Taylor wants to look it over himself, as for a new surface in the browser; the ticket still closes
planned_paths:
  - "docs/developer-guides/authentication.md"
  - "packages/auth/src/client.ts"
  - "packages/auth/src/index.ts"
depends_on: [MIG-7, MIG-19] # work-ids that must be built first (their own criteria PASS)
out_of_scope:
  - "Any change to auth behaviour, RLS or the session refresh"
criteria:
  - id: C1
    statement: "[FILL: what is true when this is done, observable by a user or caller]"
    evidence: test
    command: "[FILL: yarn <script>; a package.json script that runs this criterion's test]"
  - id: C2
    statement: "[FILL]"
    evidence: check
    command: "[FILL: yarn <script>]"
---

# Contract — MIG-22 auth-guide-leftovers

## Build notes

Drafted by MIG-7 on 2026-10-09 from its reviews (Mason consider 4, Warden should-fix 1, the part MIG-7 left); the criteria are written when the ticket starts.

- **The guide:** `docs/developer-guides/authentication.md` still carries a marketing app's sections (member and admin login, `get-marketing-session.ts`, `checkAdminAccess()`, "Admin access? `public.users.role` = `admin` or `super_admin`") and a file map that lists `apps/web/` twice. Synapse has one person role and no admin read; `house-auth.md` loads this guide on every auth change, so a stale admin sentence is a path to someone building one. Rewrite those sections to what `apps/web` holds.
- **The dead export:** `@syn/auth`'s `createBrowserClient()` resolves the env itself, so it throws in a browser bundle, and nothing calls it. Once MIG-19 has the app's literal reads in `lib/env/public.ts`, drop it from `client.ts` and the barrel; the browser path is `@syn/auth/browser`.
- **Level:** auth paths, so the operator weighs Q2 or Q3 with Mason (an export leaves the package's API) at start.
