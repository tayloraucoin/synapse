---
source:
  - docs/ux/synapse_navigation_and_system_ux_architecture.md §0, §9, §13
  - docs/ux/ux-spec-v1.md §2.4; ux-spec-v1.1.md §2; ux-spec-v1.2.md §2; ux-spec-v1.3.md §2
  - docs/ux/workflow-ux-spec-v0.1.md §0.4, §2
  - code 3b252e7 (apps/web/app, apps/web/lib/routes.ts, apps/web/lib/entry)
status: approved
promoted: 2026-10-09
---

# _global — overview

## Frame

Everything that is not one screen: how the web app is entered, framed, navigated, kept honest about time, offline and records, and what it says, for a person rushed on a phone at 7:10 or seated at a desk on Sunday night. Behaviour rules only; tokens, type, colour, motion and component contracts are MIG-9's. Every row was seen in the running app at 390, 834 and 1440, light and dark, against the local seeded account, or is marked inferred with its source file.

## Routes and surfaces

Every path has a builder in `apps/web/lib/routes.ts`; a path string anywhere else is a defect. Four route groups in code (SET-2, 2026-09-05), plus routes outside every group.

| Route or group                                             | Gate                                                                 | Frame                                    | Surface file               |
| ---------------------------------------------------------- | -------------------------------------------------------------------- | ---------------------------------------- | -------------------------- |
| `/`                                                        | signed out: the landing; signed in: the entry tree, never renders    | —                                        | `navigation.md`            |
| `(auth)` `/signin` `/signup` `/forgot` `/invite`           | a signed-in person is sent to `/`                                    | one centred column, `main#main`          | `auth/`                    |
| `(auth-pending)` `/verify` `/reset`                        | per screen: `/reset` needs a session, `/verify` tolerates one        | same column, no group gate               | `auth/`                    |
| `(setup)` `/setup/{1–5}`                                   | a verified session; does not re-run the entry tree; 6 and up are 404 | the sequence, `main#main`, no chrome     | `first-run/`               |
| `(shell)` tabs, day, review, workflow, settings, `/orient` | session → verified email → entry tree; runs on a document load       | `AppShell` + `PageFrame`; `/orient` bare | `shell.md`                 |
| `/legal/privacy` `/legal/terms`                            | none, public, no shell                                               | own frame                                | `landing/`                 |
| `/logout` `/auth/callback` `/auth/confirm`                 | handlers                                                             | —                                        | `auth/overview.md` rows    |
| `/api/assets/{bucket}/{path}`                              | the owner's session only; no public image URL                        | serves the avatar and habit icons        | this row                   |
| `/day/{date}/item/{id}`                                    | redirect to `/today` or `/day/{date}` with `?sheet=item&id=`         | —                                        | `day/overview.md` row      |
| `/workflow`                                                | redirect to the last view opened, else the first                     | —                                        | `workflow/overview.md` row |
| any other path                                             | —                                                                    | `not-found.tsx`, no shell                | `system-states.md`         |

## Navigation and shell

Five peers, List · Schedule · Review · Workflow · Settings: a bottom tab bar under 768px, a left rail at 768px and above (`navigation.md`). The shell is the auth gate and the one status line (`shell.md`); the system screens are `system-states.md`.

## Decision log

| ID      | Decision                                                                                                            | Why                                                   | Date       |
| ------- | ------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- | ---------- |
| D-WEB-1 | Shell and system-states fill the surface template; the five rules files keep its headings, rules as tables of cases | Those two are perceived; the rest are inherited rules | 2026-10-09 |
| D-WEB-2 | Where code and docs/ux disagree, the file says what the code does; the item sits in Open with the spec's text       | Contract non-negotiable 3; never resolved silently    | 2026-10-09 |
| D-WEB-3 | Every state row carries an Evidence cell: `seen` or `inferred: <file>`                                              | Contract non-negotiable 4                             | 2026-10-09 |
| D-WEB-4 | Handler and redirect routes are a row in their owning overview; `/` and `/api/assets/*` are owned here              | Thread 1 ruling 2                                     | 2026-10-09 |
| D-WEB-5 | Area approved; Open 1 to 9 keep the code's behaviour and stay listed for the closing thread's table                 | The operator's word                                   | 2026-10-09 |

## Open

Each item: the code's behaviour (the default, taken by D-WEB-5), then the spec's text and section.

1. `[NEEDS DECISION]` Nothing increments the launch counter, so an unfinished setup is redirected into the sequence on every document load, not the first three. Default: every load. Spec: nav §4.2 step 3, "on the first three launches only; after that, land on `/today` with the resume status line"; INF-7 (2026-09-04) chose the cookie.
2. `[NEEDS DECISION]` Four route groups, `(auth)`, `(auth-pending)`, `(setup)`, `(shell)`. Default: four. Spec: `apps/web/AGENTS.md` names three; SET-2 (2026-09-05) added the fourth.
3. `[NEEDS DECISION]` Workflow is exempt from the setup redirect as well as the orient one. Default: exempt, until Workflow needs the full schedule. Spec: workflow §5 Entry, "first run still comes first"; the post-epic line of 2026-10-06 suspends it.
4. `[NEEDS DECISION]` The permission status line is never rendered. Default: never. Spec: v2 handoff §5.10 ships `PermissionLine`; the track line of 2026-09-05 keeps it unused.
5. `[NEEDS DECISION]` The wide rail is a plain region, not a `navigation` landmark. Default: as is. Spec: nav §3.4 and §11, "`navigation` (tab bar / rail)".
6. `[NEEDS DECISION]` Workflow's sheets (WF-02 to WF-05) bypass `SheetHost`: the tab bar and `main` stay live beneath their scrim. Default: as is. Spec: nav §2.2, the tab bar "dimmed under the scrim, still visible, not tappable" under every sheet.
7. `[NEEDS DECISION]` The setup line's action reads _Finish_. Default: _Finish_. Spec: Epic 1 §0.5 "_Setup isn't finished — continue_"; the copy table and the Settings index say _Continue_ / _continue_.
8. `[NEEDS DECISION]` The `?` dialog opens at any width that produces the key. Default: any width. Spec: nav §3.1 "desktop only".
9. `[NEEDS DECISION]` No conflict merge: the last write to reach the server stands, except timer starts (idempotent) and journal keys (merged). Default: as is. Spec: nav §6.3, per-field rules with `done_at` keeping the earlier value.
