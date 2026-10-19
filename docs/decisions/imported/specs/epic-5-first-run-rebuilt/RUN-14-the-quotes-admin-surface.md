# RUN-14 — The quotes admin surface: the `(admin)` route group, `adminProcedure`, `ADMIN_USER_IDS`, and a list · form · publish page

**Epic:** RUN — The first run rebuilt (UX v1.2) · **Phase 5** · Size: M
**Slice type:** A new procedure tier and the first app path that writes with the service role — a one-way door on the authorisation topology, opened for one table that holds no user data. The risk class is *the tier leaking* (an `adminProcedure` reused for anything user-scoped) and *the gate misplaced* (an allow-list read anywhere but `env.ts`).
**Vigil:** a non-admin session on every admin route and procedure → 404 / `NOT_FOUND` (never 403, never a hint); the service-role client never touches a user-scoped table from this path.

**Status:** Not started — **`[PROVISIONAL — Taylor, D3]`: cut and gated. Build only when D3 is ratified in `TECHNICAL-DECISIONS.md`. Until then the bank changes by migration (TD-13) and nothing else in the epic waits.**

> **Mason — authorisation review.** Confirm before merge: `adminProcedure` is `protectedProcedure` plus one check against `env.ADMIN_USER_IDS`; it is used by exactly the `quote.*` write procedures and nothing else (`grep` in the acceptance); the write path uses the service-role client because `quotes` carries `catalogReadPolicies` (no authenticated write), and the same client is not handed anything with a `user_id`; the route group's layout 404s a non-admin before rendering; `ADMIN_USER_IDS` is parsed in `env.ts` only. **Vigil:** induce the non-admin probes.

---

## Outcome

Taylor can curate the quote bank from the app: `/admin/quotes` lists every quote (published and not) with its attribution, source and tags; a form adds or edits one; *Publish* / *Unpublish* flips `published_at`; nobody who is not on the allow-list can reach the route or the procedures, and a probe learns nothing. The bank's read side (`quote.today`, the carousel) is unchanged — it still reads through the catalogue policy, published only. After this ships, **the phase-2 pin P2-14 is closed and `catalogReadPolicies`' comment says a catalogue may also change through an admin surface.** No other admin function exists; this is not a dashboard.

## Why / intent

- **v1.2 §3.12, §11.6, R36** — *"managed by Taylor on an admin surface"*; the tone rule for the curator (`[OPEN §13 #24]` — the default sentence goes in the page's one muted line).
- **TD-13** — option B: the route group, the tier, the env allow-list, the service-role write; **refused:** an `is_admin` column or any RLS write policy for admins.
- **Root `AGENTS.md` § Hard guardrails** — *"RLS is deny-by-default and user-private. There are no admin-read policies on user data."* This ticket adds none: `quotes` is app content. *"Secrets never reach a browser bundle. Server env is read through one `env.ts` per app"* — the allow-list is server env.
- **`apps/web/AGENTS.md` § The three route groups** — a fourth group `(admin)` with its own gate; every route in `lib/routes.ts` and the table.
- **`docs/ai-guides/trpc-foundation-patterns.md`** — the procedure-tier pattern (`protectedProcedure` from `isAuthed`); the new tier follows it.
- **Ground truth (consumed):** `packages/api/src/trpc.ts` (`isAuthed`, `protectedProcedure`), `context.ts` (the service-role client's existence for jobs — read how `notify.ts` obtains it), `apps/web/env.ts`, `apps/web/app/(shell)/layout.tsx` (the gate pattern), `lib/auth/*`, RUN-4's `services/system/quotes.ts` and `routers/quote.ts`, RUN-2's `quotes`, `packages/db/src/schema/rls/standard-policies.ts` (the comment).
- **What this slice is NOT (binding):** any admin view of user data, ever; a role stored in the database; a second admin page; a public quotes page.

**Rulings this slice makes (labelled, logged):**

- **`ADMIN_USER_IDS`** is a comma-separated list of Supabase user ids in server env, `z.string().optional()` in `env.ts`, parsed once into a `Set` by a helper in `lib/auth/admin.ts`; unset means no admin exists (the route 404s for everyone). Logged.
- **`adminProcedure`** in `trpc.ts`: `protectedProcedure.use(isAdmin)` where `isAdmin` throws `NOT_FOUND` (not `FORBIDDEN`) when the session's user id is not in the set; the set reaches the API through the context (`ctx.adminUserIds`, built by the app's context factory from `env`), so `@syn/api` reads no env. Logged.
- **The write procedures** — `quote.list` (all rows, admin), `quote.save`, `quote.publish`, `quote.unpublish`, `quote.delete` — use the service-role client obtained the way the jobs obtain it, scoped to `quotes` in a `services/system/quotes-admin.ts` that imports only that table. `quote.today` stays on `protectedProcedure` and the catalogue read. Logged.
- **The route group** `apps/web/app/(admin)/` has a `layout.tsx` that reads the session, checks the set, and `notFound()`s otherwise; one page `admin/quotes/page.tsx` (Server Component listing) with a client leaf `_components/quote-form.tsx`. Route `adminQuotesRoute()`; `/admin/quotes` in the AGENTS table under a new group row. Logged.
- **The page's one line of guidance**, muted, under the heading: *Nothing that instructs, exhorts, or commands in the second person.* `[COPY — §13 #24, Taylor's to rewrite]`. Logged.
- **`catalogReadPolicies`' comment gains one sentence** on ship: *A catalogue may also change through an admin surface that writes with the service role (RUN-14); never through an authenticated policy.* Logged.

## Experience & states

### `/admin/quotes`

Heading *Quotes* `[COPY]`; the muted tone line; a list of `ListRow`s: the quote's first line (truncated), attribution, a `Tag` *published* / *draft* (word and hairline, never colour alone), tags as chips, `EllipsesMenu` (*Edit · Publish / Unpublish · Delete*); **Add a quote** (full-width secondary) → the form in a `ResponsiveSheet`: `Textarea` **Quote** (≤ 400, plain), `Input` **Attribution** (≤ 120), `Input` **Source** (optional), `TagInput` **Tags**; *Cancel · Save*. *Delete* confirms in a `Dialog`. No search, no pagination until the bank passes 200 rows (`[OPEN]`). **States:** empty (*No quotes yet.* `[COPY]`) · listing · sheet · saving · failed · offline (writes disabled) · **not-admin (404 page, identical to any 404)**.

**Failure / edge states:** `ADMIN_USER_IDS` unset → every admin route and procedure 404s, including for Taylor (stated in the environments guide) · a quote deleted while shown on someone's frame today → tomorrow's cycle shifts; nothing else · a published quote edited → the edit is live at the next read (no versioning; a quote is not a record).

## Non-negotiables (this slice)

- **No admin-read on user data.** The service-role path touches `quotes` only.
- **`NOT_FOUND`, never `FORBIDDEN`**, for a non-admin.
- **The allow-list is read in `env.ts` and reaches the API through the context.**
- **`adminProcedure` is used by `quote.*` writes and nothing else.**
- **`quote.today` is unchanged.**
- **No role in the database.**

## Data & AI

**Schema changes: none** (`quotes` exists; its policies are unchanged).

**Tables:** `quotes` (read all — service role; write — service role).

**Placement:** `packages/api/src/trpc.ts` (`adminProcedure`, `isAdmin`), `context.ts` (`adminUserIds`), `services/system/quotes-admin.ts` (new), `routers/quote.ts` (the writes); `apps/web/env.ts` (`ADMIN_USER_IDS`), `lib/auth/admin.ts` (new), `lib/trpc/server.ts` + the context factory (pass the set), `app/(admin)/layout.tsx`, `app/(admin)/admin/quotes/page.tsx`, `app/(admin)/admin/quotes/_components/quote-form.tsx`, `lib/routes.ts` (`adminQuotesRoute`), `apps/web/AGENTS.md` (the group and the route); `packages/validators/src/quote.ts` (new — `quoteFormSchema`); `packages/db/src/schema/rls/standard-policies.ts` (the comment); `docs/developer-guides/environments.md` (the variable); `.env.example`. Rule 3; the app's env rule.

**tRPC / validators:** `quote.list` (admin) · `quote.save` · `quote.publish` · `quote.unpublish` · `quote.delete` (admin) · `quote.today` (unchanged).

**AI notes:** **None.**

## Accessibility

- The list rows are labelled by the quote's first line; the published/draft `Tag` is text.
- The form's fields are labelled; the sheet traps focus; *Delete* confirms.
- The 404 for a non-admin is the app's standard `ErrorPage`, reachable by keyboard like any page.

## Acceptance criteria (observable — local tier; two sessions, one on the allow-list, one not)

1. With `ADMIN_USER_IDS` containing A: A opens `/admin/quotes`, adds a quote (draft), edits it, publishes it (`published_at` set), unpublishes, deletes; the list shows the *published* / *draft* word on each row.
2. B (signed in, not listed) requesting `/admin/quotes` receives the app's 404 page; B calling `quote.save` receives `NOT_FOUND`; the response body contains no word about admin or permission. *(Vigil.)*
3. With `ADMIN_USER_IDS` unset: A receives the 404 too; `quote.today` still works for everyone.
4. `grep -rn "adminProcedure" packages/api/src` lists `trpc.ts` and `routers/quote.ts` only; `grep -rn "ADMIN_USER_IDS" apps/web packages` lists `env.ts`, `.env.example` and the environments guide only. *(Mason.)*
5. `services/system/quotes-admin.ts` imports the `quotes` table and no other schema table (its imports pasted). *(Mason.)*
6. A published quote appears in `quote.today`'s rotation the next day for an opted-in user; a draft never does (RUN-4's probe re-run).
7. `standard-policies.ts`' comment carries the added sentence; `environments.md` documents the variable and the "unset = no admin" rule.
8. `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` pass (four separate commands).

## Likely-relevant technical notes (ADVISORY — dev decides)

- The jobs already construct a service-role client (`notify.ts`); read how, and give `quotes-admin.ts` a function that takes that client rather than constructing its own.
- The `(shell)` layout's gate is the pattern for `(admin)/layout.tsx`; add the set check after the verified-session check.
- `TagInput` from RUN-7 is the tags field.

## Dev's call

The list's ordering (published first, then drafts, by `updated_at` desc) · the sheet vs an inline form on desktop · the `[COPY]` lines.

## Out of scope

- **Any other admin function** — none exists; a second would need its own ticket and Taylor's ask.
- **Quote seeding by migration** — Taylor's, by data migration, until this ships.
- **Public quote pages, sharing, attribution links** — never in scope.

## Depends on

- **RUN-4** — `quotes` read side, `routers/quote.ts`. Complete in `PROGRESS.md`.
- **D3 ratified** — a line in this track's `TECHNICAL-DECISIONS.md` recording Taylor's answer to the handoff's D3.

## Recommended execution

**Opus.** A new authorisation tier is a one-way door; the failure mode of choosing down is a `FORBIDDEN` that leaks existence, or a service-role client that a later ticket reaches for because it was handy.

---

### Kickoff (paste into the session)

> Build **RUN-14 — The quotes admin surface** (attached spec). Model: **Opus**. **No admin-read on user data; NOT_FOUND never FORBIDDEN; the allow-list lives in env.ts and reaches the API through the context; adminProcedure serves quote writes and nothing else; no role in the database.** Confirm D3 is ratified in `TECHNICAL-DECISIONS.md` before writing a line.
> Attach/read first, in order: this spec · v1.2 §3.12, §11.6, §13 #23/#24 · root `AGENTS.md` § Hard guardrails · `apps/web/AGENTS.md` § The three route groups · `docs/ai-guides/trpc-foundation-patterns.md` · `docs/ai-guides/db-and-rls-authoring.md` · `docs/developer-guides/environments.md` · `packages/api/src/{trpc,context}.ts` · DYN-20 (`notify.ts`'s service-role client — reuse) · RUN-4 · this track's `DEVIATIONS.md` + `TECHNICAL-DECISIONS.md` (TD-13 and the D3 line).
> Induce the non-admin probes and paste them. Close in three places; log departures in `DEVIATIONS.md`. Run `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` as separate commands.
