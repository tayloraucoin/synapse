# `apps/web` — app-local rules

**Read the root [`AGENTS.md`](../../AGENTS.md) first.** This file adds only what
is local to this app: the route map, the scope, and the product
non-negotiables. It never restates root guidance.

---

## This is Next.js 16, not the Next.js you remember

`middleware.ts` is gone — the file is `proxy.ts`. `next/config` is gone. Route
`params` and `cookies()`/`headers()` are async. Caching defaults changed. Read
the relevant guide under `node_modules/next/dist/docs/` before writing app code
rather than reaching for a remembered API.

---

## Scope

**Phase 1 only** (official spec §12). In scope: auth, first run, the habit
library, categories, templates, the week build, the two execution tabs, the Day
and Week Review, history, settings, and PWA notifications.

**One marketing page, and only one:** the landing at `/` for a visitor who is
not signed in (SYS-6; design in `docs/ux/landing-page-ux.md`). Lifted into
scope by Taylor on 2026-09-05 for exactly this page. No second marketing page,
no blog, no pricing page, no `apps/marketing`.

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

## The route map

Cross-cutting §4.1, and every one has a builder in
[`lib/routes.ts`](lib/routes.ts). **A hardcoded path anywhere else in this app
is a defect.**

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
| `/setup/{1–14}` | `setupRoute(step)` | UX v1.2 §4.1–§4.14 — fourteen screens (RUN-8 renumbered): 1–12 are v1.2's (RUN-8…RUN-11); 13 is *Your days* and the nine-screen day builder (RUN-12, `components/day-builder/`), whose *Continue · n days* completes first run until RUN-13; 14 is a 404 until RUN-13 |
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
| `/settings` | `settingsRoute()` | ST-00 |
| `/settings/account` | `settingsAccountRoute()` | ST-01 |
| `/settings/habits` | `settingsHabitsRoute()` | LB-01 |
| `/settings/habits/{id}` | `settingsHabitRoute(id)` | LB-02 |
| `/settings/your-day` | `settingsYourDayRoute()` | UX v1.1 §4.14 — the twelve first-run screens as a list (DYN-8) |
| `/settings/your-day/{screen}` | `settingsYourDayScreenRoute(screen)` | one of DYN-10's six screens, DYN-18's `closing-the-day` (screen 11 under v1.2), or v1.2's `work-day-types` (RUN-8), `training` / `focuses` (RUN-11), `your-days` (RUN-12), embedded: `shape · work-days · work-start · work-day-types · training · focuses · commitments · wake · before-the-day · closing-the-day · your-days` |
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

The two `/legal/*` pages sit outside all three groups on purpose: a privacy
policy a person has to sign in to read is not a privacy policy, and both the
landing footer and About link to them.

### The three route groups

| Group | Gate | Frame |
|---|---|---|
| `(auth)` | redirects a **signed-in** person to `/` | one centred column, `max-w-sm` |
| `(setup)` | a verified session | the sequence; deliberately does **not** re-run the entry tree |
| `(shell)` | **the auth gate** — session → verified → entry tree | skip link + `main#main`; the chrome arrives with Epic 2 |

---

## Folder layout

```
app/
  _components/     client leaves shared across routes, "use client" line 1
  (auth)/ (setup)/ (shell)/   route groups
  api/             route handlers — the enumerated tRPC exceptions only
lib/
  routes.ts        every path in the app
  auth/            request context, the verified-email gate
  clients/supabase/client.ts   the browser client (reads NEXT_PUBLIC_* literals)
  entry/           the §4.2 decision tree
  env/             tier resolution, read only by env.ts
  forms/           useSynapseForm — submit-first
  pwa/             install detection, push subscribe
  stores/          the client-state rule; no store yet
  trpc/            client · provider · server caller
env.ts             THE only process.env reader
proxy.ts           session refresh only
```

---

## Reminders

- **Server Components by default.** A client leaf carries `"use client"` on
  line 1 and lives in `_components/`.
- **`env.ts` is the only `process.env` reader.** The two documented exceptions
  are `lib/clients/supabase/client.ts` and `lib/trpc/provider.tsx`, which read
  canonical `NEXT_PUBLIC_*` names as literals because Next cannot inline
  anything else.
- **Page data comes from the tRPC server caller** (`lib/trpc/server.ts`), never
  raw `@syn/db` in a page.
- **Real schema names** are in
  [`../../packages/db/SCHEMA_REFERENCE.md`](../../packages/db/SCHEMA_REFERENCE.md),
  generated from the schema. Do not guess a column.
- **Audit `@syn/ui` before building a component.** If it is reusable, it belongs
  there with a story, not here.
