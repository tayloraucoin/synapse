# SET-10 — Your data: export everything, delete the account, ST-10 and ST-10a

**Epic:** SET — Setup · **Phase 4** · Size: M
**Slice type:** The trust surface — one export pipeline and the product's only destructive action. The risk class is *trust-breaking*: an export that leaves something out, a download link that outlives its promise, a delete that leaves a row behind, or a delete that fires on the wrong account.
**Vigil:** **full review by inducing** — delete with a running export; delete with an avatar and icons in storage; export an account with every table populated (use the smoke account after Epic 2/3 fixtures if available, else SQL-insert one row per table); a download link after 24 h (clock-shift the `expires_at`); a delete attempted with the word typed wrong. QA states the five paths and whether each was run.

**Status:** Complete (2026-09-06)

> **Vigil — destructive-path review.** ST-10a is the one place the destructive colour is permitted and the one place a person can lose everything. Verify the typed confirmation gate, the session end, the cascade, the storage cleanup, and that nothing about the deletion is logged with the person's data. **Mason:** the zip library choice is routed to you (advisory below); counter-propose in `TECHNICAL-DECISIONS.md`.

---

## Outcome

A person can press *Export everything* and, after a short wait on the same screen, download a zip holding five CSV files and one JSON file with their whole record, from a link that lasts 24 hours and says so. They can delete their account by typing *delete*, and everything — every row, every stored image, every export, the session — is gone at once, landing them on the sign-in screen with *Your account was deleted.* The trust line sits above both. **Nothing else changes.**

## Why / intent

- **Official spec §4.1 (trust surface), §7.6 (export), §9.3 (destructive reserved for Delete account), §10.3 (destructive confirmations require typing "delete")** — the promise, the file list (`days.csv`, `items.csv`, `misses.csv`, `shifts.csv`, `timer_sessions.csv`, `synapse-export.json` as the full graph), *Export everything* / *Your export is ready* with the size.
- **Epic 1 §7 (ST-10, ST-10a)** — every read, state, and string: *Preparing your export…* · *Your export is ready ({size}).* [*Download*] · *Links last for 24 hours.* · *That export has expired.* [*Export again*] · *Couldn't prepare the export. Try again.* · the delete body, label, and error *Couldn't delete. Nothing was removed — try again.*
- **Cross-cutting §5.2** — the export download opens in the system browser (an external link). §8.4 — the account is one of the three things ever deleted.
- **`SCHEMA_REFERENCE.md` §7** — the `exports` bucket, `exports/{user_id}/{request_id}.zip`, ≤ 100 MB, private, signed URLs. §2 — deletion cascades from `auth.admin.deleteUser`.
- **Ground truth:** SET-1's `data_exports`; SET-3's bucket SQL and admin-client pattern; `createAdminClient` (`@syn/auth`); `TypedConfirmDialog` (`word`, `confirmLabel`), `TrustLine`, `Button variant="destructive"`, `Text`, `AppHeader`; `SCHEDULED_JOBS` (INF-9); `/logout`; `signInRoute()` + `withNotice`.
- **What this slice is NOT (binding):** no admin surface, no email with the file, no partial export, no "download my day". It does not soft-delete (`users.deleted_at` exists from INF-5 and is **not** used — the delete is real; log why: the column predates this ticket and a soft delete would keep the data the person asked to remove).

**Rulings this slice makes (labelled, logged):**

- **Export is built synchronously inside the mutation** (`user.requestExport`): read every table for the user through `rls.execute`, build the CSVs and the JSON in memory, zip, upload to `exports/{userId}/{exportId}.zip` with the admin client, mark `ready` with `byte_size` and `expires_at = now + 24h`. A personal dataset is kilobytes to a few megabytes; a queue is a second system for a problem that does not exist yet. The mutation returns the row; the screen polls `user.exportStatus` while `preparing` only if the mutation is still in flight on reload. Logged (`TECHNICAL-DECISIONS.md`). Revisit trigger: an export over 30 s or 50 MB.
- **The download is a 24-hour signed URL minted on demand** by `user.exportDownloadUrl({ id })` — never stored, never in the page's HTML — opened in a new window (`target="_blank" rel="noopener"`). Logged.
- **Expiry is a scheduled job**, `expire_exports`, registered in `SCHEDULED_JOBS`: rows `ready` with `expires_at < now` → `expired`, object deleted. The screen also treats a `ready` row past `expires_at` as expired without waiting for the job. Logged.
- **CSV columns are the table's columns in `SCHEMA_REFERENCE.md` order, snake_case, ISO-8601 timestamps in UTC with the day's zone in `days.csv`;** `synapse-export.json` is `{ exportedAt, user: {…scalars, no email? — include email; it is theirs}, categories, habits, reasons, templates: [{…, slots}], days: [{…, items: [{…, timerSessions, miss}], shifts}], notificationPrefs }`. Every column of every user table appears somewhere; nothing is summarised. Logged.
- **Delete runs under the admin client after the typed gate is re-checked server-side** (`user.deleteAccount({ confirmation: "delete" })` — the input schema requires the literal, case-insensitive): storage prefixes `icons/{id}/`, `avatars/{id}/`, `exports/{id}/` are listed and removed best-effort first (logged counts, no names), then `auth.admin.deleteUser(id)` cascades every row, then the response clears the session cookies (the same helper `/logout` uses) and the client navigates to `withNotice(signInRoute(), "account-deleted")`. Logged.
- **Nothing about the deletion is logged beyond the fact and the counts.** No email, no title, no path in any log line. Logged.

## Experience & states

### ST-10 Your data (`/settings/data`)

`AppHeader` *Your data*, `onBack`. `TrustLine`. Section `GroupHeading` *Export*: body *Everything in your account as CSV files and one JSON file. Nothing is left out.* · `Button variant="secondary"` *Export everything* (`busy` and disabled while preparing) · result line by state: `preparing` → *Preparing your export…* · `ready` → *Your export is ready ({size}).* [*Download*] + `Text variant="caption"` *Links last for 24 hours.* · `expired` → *That export has expired.* [*Export again*] · `failed` → *Couldn't prepare the export. Try again.* The latest `data_exports` row for the user is read on load so the result persists across visits until downloaded-and-expired. `{size}` is `formatBytes` (add to `@syn/utils` `number.ts`: *412 KB*, *2.1 MB*).

Section `GroupHeading` *Delete account*: body *This removes your account and every item, day, and note in it. There's no undo.* · `Button variant="ghost"` styled as text *Delete account and all data* → ST-10a. **Not** adjacent to the export button (Epic 1 §0.3: destructive never adjacent to the primary — the two sections are separated by rhythm and a hairline).

Offline: *Export everything* and the delete action disabled with the inline line.

### ST-10a Delete account

`TypedConfirmDialog` `title="Delete your account?"` `description` = *Type **delete** to confirm. Everything is removed straight away.* (with `delete` in `<strong>`) · `inputLabel="Confirm"` · `word="delete"` (case-insensitive — check the composite; if it is case-sensitive, log a deviation and pass the lowercased input) · `cancelLabel="Cancel"` · `confirmLabel="Delete account"` (the composite renders the confirm as the destructive variant — verify; this is the one permitted use of the token) · `busy` while deleting. Success → session ended → `/signin?notice=account-deleted` renders *Your account was deleted.* above the form (SET-2's notice pattern; add the string to the `(auth)` copy). Error → *Couldn't delete. Nothing was removed — try again.* inside the dialog. Offline → the trigger is disabled before the dialog opens.

**States (exhaustive):** ST-10: idle (no export yet) · preparing · ready · expired · failed · offline. ST-10a: closed · open-disabled (word not typed) · open-enabled · deleting · error · offline.

**Failure / edge states:** two rapid *Export everything* presses → the second is ignored while `preparing` (button disabled; the mutation is also guarded by "a `preparing` row younger than 5 minutes exists → return it") · upload fails after the zip is built → `failed` with `error` stored, the sentence shown · delete's storage cleanup partly fails → proceed to `deleteUser` anyway (the rows are what the person asked to remove; orphaned objects are unreachable — the read route 404s a missing user — and are reaped by prefix later `[REVISIT: an orphan sweep job, Phase 2]`) · `deleteUser` fails → nothing was removed (storage cleanup ran, which is a loss of images only — log it as a deviation the first time it happens and reorder if it does).

## Non-negotiables (this slice)

- **The destructive colour appears on exactly one control**: the dialog's confirm. `grep -rn "destructive" apps/web` outside this route and the primitive is a defect.
- **Delete needs the typed word, checked on the client and on the server.**
- **The export leaves nothing out.** Every user table, every column.
- **Download links are minted on demand and expire in 24 hours.** Nothing persistent points at the file.
- **No person-identifying content in any log line** from either path.
- **Delete is real**: `auth.admin.deleteUser`, cascade, storage cleanup. No soft delete.

## Data & AI

**Schema changes: none.**

**Tables:** `data_exports` (insert, update, read) · every user table (read for the export; deleted by cascade) · `web_push_subscriptions` (read for the export — endpoints excluded: they are device credentials, not the person's record; log this) · `auth.users` (admin delete).

**Placement:** `user.requestExport`, `user.exportStatus`, `user.exportDownloadUrl`, `user.deleteAccount` on the `user` router; services `services/user/{build-export,request-export,export-download-url,delete-account}.ts` and `services/jobs/expire-exports.ts` registered in `SCHEDULED_JOBS`; `deleteAccountInput`, `exportDownloadInput` in `packages/validators/src/account.ts`; page replaces the placeholder with leaves in `_components/`; `formatBytes` in `@syn/utils`.

**tRPC / validators:** as above. The zip library: **advisory** — `fflate` (zero-dependency, small, synchronous `zipSync`) over `jszip`; add it to `@syn/api`'s dependencies and to the boundaries lint's restricted externals if the lint tracks archive libraries (it does not today; note it). Mason decides; log it.

**AI notes:** **None.**

## Accessibility

- The export result line is `aria-live="polite"`; *Download* is a link with `rel="noopener"` and its accessible name includes the size.
- The typed-confirm input has a visible label (*Confirm*) and the word is in the description, not only as a placeholder.
- The destructive confirm is disabled, not hidden, until the word matches; the disabled state is announced.
- Focus returns to *Delete account and all data* on cancel; on success the page navigates.

## Acceptance criteria (observable — local tier, an account with rows in every table; storage reachable)

1. `/settings/data` renders the trust line, both sections, and the strings in the document's order; the delete action is text-weight and not adjacent to *Export everything*.
2. *Export everything* → *Preparing your export…* → *Your export is ready ({size}).* [*Download*] with *Links last for 24 hours.*; `data_exports` has a `ready` row with `byte_size`, `storage_path`, and `expires_at ≈ now + 24h`; the object exists. *(Vigil.)*
3. The zip contains exactly `days.csv`, `items.csv`, `misses.csv`, `shifts.csv`, `timer_sessions.csv`, `synapse-export.json`; each CSV has a header row of the table's columns and one row per user row; the JSON contains every table for the user including categories, habits, reasons, templates with slots, and notification prefs; no other user's row appears (compare counts against SQL). *(Vigil.)*
4. *Download* opens a signed URL in a new window that serves the zip; the URL is not present in the page HTML; a second click mints a new URL.
5. Setting `expires_at` to the past by SQL: the screen shows *That export has expired.* [*Export again*]; running the scheduler route marks the row `expired` and the object is gone. *(Vigil.)*
6. Reloading during `preparing` (simulate by inserting a `preparing` row) shows *Preparing your export…* and resolves when the row changes; a `failed` row shows *Couldn't prepare the export. Try again.*
7. ST-10a: the confirm is disabled until *delete* (any case) is typed; typing *delet* keeps it disabled; **Cancel** returns focus to the trigger. *(Vigil.)*
8. Confirming deletes: `auth.users`, `users`, and every domain table have zero rows for the id; `icons/{id}/`, `avatars/{id}/`, `exports/{id}/` prefixes are empty; the session is gone; `/signin` shows *Your account was deleted.*; signing in with the old credentials fails. *(Vigil.)*
9. `user.deleteAccount({ confirmation: "nope" })` is `BAD_REQUEST`; as user B it cannot delete A (there is no id parameter — confirm the procedure takes none).
10. The server log for a delete contains the fact and counts only (inspect the dev log output); no email, path, or title.
11. `grep -rn "variant=\"destructive\"" apps/web` matches only ST-10a's leaf (or nothing, if the composite applies it).
12. `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` pass (four separate commands).

## Likely-relevant technical notes (ADVISORY — dev decides)

- Build CSVs by hand (quote fields containing `,`, `"`, or newlines; `""` escape) — a CSV library is not worth a dependency for six files.
- Read everything in one `rls.execute` with plain selects per table (no joins); assemble the JSON graph in memory from the ids. The export is the one place a whole-account read is right.
- `createSignedUrl(path, 60 * 60 * 24)` for the download; the row's `expires_at` and the URL's expiry are set from the same instant so they agree.
- Storage cleanup: `list(prefix)` then `remove(paths)` in batches of 100; the admin client lists at most 100 per call by default.
- Session end after delete: reuse `/logout`'s cookie-clearing helper in the mutation's response path — a tRPC mutation cannot set cookies directly through the fetch adapter without the `resHeaders` hook; the simplest honest path is: mutation deletes and returns `{ ok: true }`, then the client posts to `/logout` (which succeeds even though the user is gone) and navigates.

## Dev's call

`fflate` vs `jszip` (recommend `fflate`; log it) · the polling interval while `preparing` · whether the `preparing` guard is 5 minutes or a lock column · the storage-cleanup batch size.

## Out of scope

- **HS-01's *Export everything* link** — REV-3 links here.
- **An orphan sweep for storage** — Phase 2 (`[REVISIT]` above).
- **Exports over 100 MB or async generation** — the revisit trigger.
- **Any admin visibility of exports or deletions** — none, ever.

## Depends on

- **SET-8** — ST-00's door and the route group's settings frame. Complete in `PROGRESS.md`.

## Recommended execution

**Opus.** The export's completeness and the delete's ordering are correctness claims a person's trust rests on, and both are the kind of thing that passes a happy-path check while missing a table or leaving a prefix. The Vigil list exists because a cheaper model will not think to shift the clock or delete with an export in flight.

---

### Kickoff (paste into the session)

> Build **SET-10 — Your data: export everything, delete the account, ST-10 and ST-10a** (attached spec). Model: **Opus**. **The export leaves nothing out; links are minted on demand and last 24 hours; delete needs the typed word on both sides and is real — cascade plus storage — with nothing personal in any log.**
> Attach/read first, in order: this spec · Epic 1 §7 (ST-10, ST-10a), §0.3 · official spec §4.1, §7.6, §9.3, §10.3 · cross-cutting §5.2, §8.4 · `packages/db/SCHEMA_REFERENCE.md` (every group; §7 buckets; §2 deletion) · `apps/web/AGENTS.md` · root `AGENTS.md` · `docs/specs/README.md` § Placement rules · SET-3 (admin-client pattern, bucket SQL — reuse) · SET-8 (the settings frame, the `user` router) · SET-2 (the `notice` pattern on `/signin`) · `packages/api/src/services/jobs/run-scheduled-jobs.ts` · `packages/ui/src/composed/feedback/typed-confirm-dialog/` · this track's `DEVIATIONS.md` + `TECHNICAL-DECISIONS.md` · `docs/specs/infrastructure/DEVIATIONS.md`.
> Run every Vigil path and state which. Close in three places. Run `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` as separate commands.
