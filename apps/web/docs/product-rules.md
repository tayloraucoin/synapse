# `apps/web` — product rules

Moved verbatim from [`apps/web/AGENTS.md`](../AGENTS.md) on 2026-10-09 (migrate step 5, rulings 34, record 0001), which links here in one line.

## Scope

**Phase 1 only** (official spec §12). In scope: auth, first run, the habit
library, categories, templates, the week build, the two execution tabs, the Day
and Week Review, history, settings, PWA notifications, and Workflow (below).

**One marketing page, and only one:** the landing at `/` for a visitor who is
not signed in (SYS-6; design in `docs/ux/landing-page-ux.md`). Lifted into
scope by Taylor on 2026-09-05 for exactly this page. No second marketing page,
no blog, no pricing page, no `apps/marketing`.

**Workflow, the second feature area:** a board of lanes by columns for running
several AI-driven threads at once (`docs/ux/workflow-ux-spec-v0.1.md`, Epic 7).
Lifted into scope on 2026-10-03 on the authority of Taylor's stakeholder notes
of that date (*Synapse — Epic 2: Workflow*). It adds no AI, no outbound
request, no notification and no Realtime, and it does not wait behind the
orient frame (W16).

**Not in scope, and not to be scaffolded:** AI or a coach (§7.7 is a note, not
a feature), billing, any marketing surface beyond the one page above, anything
social, Google Calendar import (Phase 2), offline writes (Phase 2), the
Schedule tab's Phase-2 refinements.

---

## Product non-negotiables

From official spec §2.4 and §10.4. These bind every change in this app:

- **No streaks, no scores, no gamification.** The one number is adherence, it
  appears only in Review, and it always carries its formula in words.
- **No numbers about the day on the execution tabs.** No counts, no
  percentages, no progress. The only numbers are times and durations.
- **Colour is never the only carrier** of a distinction. Dot *and* word, border
  *and* word, chip *and* name.
- **Nothing red on the execution tabs.** Errors are ink and a sentence.
  "Missed" is neutral. The destructive colour appears on Delete account only.
- **No second person on the tabs.** No "you". No question marks except inside a
  sheet the person opened.
- **A notification is a scheduled fact in the person's own words.** It never
  reports a miss, a streak, a percentage, or how long since they opened the
  app (§8.5).
- **Faded is not disabled.** Every passed item stays live. Every done item
  stays live.
- **The record is annotated, never rewritten.** A late start leaves a ghost; a
  shift leaves a band.
- **Only the person can see their data — not the people who built this.** Every
  user-scoped query goes through `ctx.rls.execute()`.

---

## The route table

| Route | Builder | Screen |
|---|---|---|
| `/` | `homeRoute()` | signed out: the landing page (SYS-6). Signed in: resolves per §4.2 — never renders |
| `/signin` | `signInRoute(next?)` | AU-01 |
| `/signup` | `signUpRoute()` | AU-02 |
| `/verify` | `verifyRoute(next?)` | AU-03 |
| `/forgot` | `forgotRoute()` | AU-04 |
| `/reset` | `resetRoute()` | AU-05 |
| `/invite` | `inviteRoute()` | AU-02 with the invite line |
| `/logout` | `logoutRoute()` | AU-06 (a route handler) |
| `/auth/callback` | `authCallbackRoute()` | OAuth / PKCE |
| `/auth/confirm` | `authConfirmRoute()` | email `token_hash` |
| `/setup/{1–5}` | `setupRoute(step, { edit? })` | UX v1.3 §4.1–§4.5 — five screens (DAY-8 renumbered; 6 and up are 404s, and the entry tree resumes a stored v1.2 step above 5 at 4): 1 *The shape of your week*; 2 *Days are built in blocks* — the primer, the example day and the legend (`components/blocks-primer/`); 3 *Work days*, five values; 4 *Your days* and the day builder (RUN-12, `components/day-builder/`; `?edit={planId}` opens the builder on that plan's review); 5 *Your usual week* and the mode question (RUN-13) — *Open today* / *Plan this week first* write `morning_mode`, complete first run and pre-fill the week from the plans |
| `/orient` | `orientRoute()` | UX v1.1 §5.2 — the orient frame; the entry tree puts it before any tab while today has no `woke_at` (DYN-13); no header, no tab bar |
| `/today` | `todayRoute()` | LS-01 — the quick-pick while `confirmed_at` is null (v1.1 §5.3, DYN-14), the list after |
| `/today/schedule` | `todayScheduleRoute(options?)` | SC-01, editable (UX v1.1 §6.5, DYN-16); `{ move: true }` → `?mode=move`, the tap-to-lift fallback the day header sheet's *Edit today* opens |
| `/day/{date}` | `dayRoute(date)` | LS-01, record or plan mode |
| `/day/{date}/schedule` | `dayScheduleRoute(date, options?)` | SC-01, past (record: no drag) or future (plan: drag, no ghosts); the same `{ move }` option |
| `/day/{date}/item/{id}` | `dayItemRoute(date, id)` | IT-01 — addressable for deep links |
| `/day/{date}/journal` | `journalRoute(date)` | UX v1.1 §7.2 — the journal (DYN-18); today or a past day, read-only from Review (`?from=review`), a future day is a 404 |
| `/review` | `reviewRoute()` | RV-00 |
| `/review/day/{date}` | `reviewDayRoute(date)` | DR-01 |
| `/review/week/{week}` | `reviewWeekRoute(week)` | WR-01 |
| `/review/week/{week}/habit/{id}` | `reviewWeekHabitRoute(week, id)` | WR-02 |
| `/review/history` | `reviewHistoryRoute()` | HS-01 |
| `/workflow` | `workflowRoute()` | Workflow UX v0.1 §5 — the fourth peer (W1). Never renders: resolves to the last view opened, else the first (FLO-6). **Exempt from the orient redirect** (W16): `resolveEntry` skips the orient branch for any Workflow path (`isWorkflowPath`). **TEMPORARILY exempt from the setup redirect too** (Taylor, 2026-10-06) — put back when Workflow needs the full schedule; the note is in `lib/entry/resolve-entry.ts` |
| `/workflow/{view}` | `workflowViewRoute(viewId, { column?, add? })` | WF-01, the board; `{view}` is the view's uuid (an unknown or archived one goes back to `/workflow`); `?col=` is compact's shown column, replaced not pushed (FLO-8); `?add=1` opens the first lane's add row and is cleared (FLO-7, the `n` key, which reads the view back with `workflowViewIdOf(path)`). Sheets are `?sheet=` URL state: `task&id=` WF-02 (FLO-7), `new-view` WF-03, `columns` WF-04, `archived` WF-05 (FLO-8). Exempt from the orient redirect, as above |
| `/settings` | `settingsRoute()` | ST-00 |
| `/settings/account` | `settingsAccountRoute()` | ST-01 |
| `/settings/habits` | `settingsHabitsRoute()` | LB-01 |
| `/settings/habits/{id}` | `settingsHabitRoute(id)` | LB-02 |
| `/settings/your-day` | `settingsYourDayRoute()` | UX v1.3 §4.6 — the first run's screens and the builder's parts as a list, in the document's order (DYN-8; DAY-8) |
| `/settings/your-day/{screen}` | `settingsYourDayScreenRoute(screen)` | one screen, embedded: `shape · work-days · your-days · first-thing` (B8: passages, links, the quote, the three lines) `· morning-habits · ranked · free-time` (B15a + B15b) `· training · commitments · closing-the-day` (the journal; the two times read-only) `· focuses · each-morning` (the mode question alone; *Save* writes `morning_mode`). Any other word is a 404 |
| `/settings/your-day/block/{kind}` | `settingsYourDayBlockRoute(kind, templateId?)` | the block editor for a kind (§3.11); the template list above it when more than one |
| `/settings/your-day/order` | `settingsYourDayOrderRoute()` | Block order (§4.14) |
| `/settings/week` · `/settings/week/{week}` | `settingsWeekRoute(week?)` | WK-01 |
| `/settings/categories` | `settingsCategoriesRoute()` | CT-01 |
| `/settings/reasons` | `settingsReasonsRoute()` | ST-06 |
| `/settings/notifications` | `settingsNotificationsRoute()` | ST-07 |
| `/settings/day` | `settingsDayRoute()` | ST-08 |
| `/settings/appearance` | `settingsAppearanceRoute()` | ST-09 |
| `/settings/data` | `settingsDataRoute()` | ST-10 |
| `/settings/share` | `settingsShareRoute()` | ST-11 |
| `/settings/about` | `settingsAboutRoute()` | SY-01 |
| `/legal/privacy` | `legalPrivacyRoute()` | SYS-3 — public, no shell, no gate |
| `/legal/terms` | `legalTermsRoute()` | SYS-3 — public, no shell, no gate |

`{date}` is `YYYY-MM-DD` and `{week}` is `YYYY-Www`; both are validated by
`dateKeySchema` / `weekKeySchema` from `@syn/validators` — the same schemas the
API uses, so a key that 404s here cannot succeed against a procedure.
