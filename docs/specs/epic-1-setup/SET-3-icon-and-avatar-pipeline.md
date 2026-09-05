# SET-3 — Icon and avatar pipeline: bucket policies, signed uploads, and the session-gated read route

**Epic:** SET — Setup · **Phase 1** · Size: M
**Slice type:** A storage mechanism with one write rail and one read rail. No screen. The risk class is *a private bucket that is not*: an object path a stranger can read, an upload URL minted for the wrong prefix.
**Vigil:** review by probing — read another person's icon path with your own session; upload to a path outside your prefix with a minted URL; read a path with no session. QA states the three probes and their responses.

**Status:** Not started

> **Mason — one placement call is routed to you and answered inline:** reads go through a streaming route handler rather than signed read URLs. Counter-propose in `TECHNICAL-DECISIONS.md` if the cache or cost story is wrong.

---

## Outcome

A client can ask for a place to put a 256px square JPEG (an item icon, or the account photo), put it there directly, store the resulting path on the row that owns it, and render it back with a plain `<img src>` that only the owner's session can resolve. Nothing here has a screen: LB-02's *Image* tab (SET-4) and ST-01's *Change photo* (SET-8) are the consumers. `useIconUpload` (INF-11's app hook) gets the `upload` function it was written to take.

## Why / intent

- **Official spec §3.3** — a custom icon is "upload image (crop to square, 256px, stored per user)"; §9.8 — the avatar uses "the same upload pipeline as custom icons". One pipeline, two buckets.
- **`SCHEMA_REFERENCE.md` §7** — the three buckets are private; paths are `icons/{user_id}/{uuid}.{ext}` and `avatars/{user_id}/{uuid}.{ext}`; ≤ 5 MB; jpeg/png/webp; "The first path segment is the owner id, which is what the storage RLS policies match on." §10: "Storage object policies are not in this package … the object-level RLS lands with the first ticket that uploads a file." That is this ticket.
- **v2 handoff §3.5** — `IconValue`'s `image` arm "carries the storage path; the URL is resolved by the caller, never by `@syn/ui`." `ItemIcon` takes `imageUrl?`; `Avatar` takes `src`.
- **Ground truth:** `apps/web/lib/hooks/use-icon-upload.ts` (pick → re-encode to 256px JPEG → park → `commit(upload)`), `lib/image/reencode.ts`, `@syn/ui` `ImageCropper` (outputs a `Blob`), `@syn/auth` `createAdminClient`, `lib/auth/get-request-context.ts` (`getRequestAuthContextFromRequest` for handlers), `packages/db/supabase/setup/` (hand-authored SQL lives here), `codebase-conventions.md` §3.5 (route-handler exceptions).
- **What this slice is NOT (binding):** no image UI. No public bucket. No CDN. No transformation service.

**Rulings this slice makes (labelled, logged):**

- **Uploads: a tRPC mutation mints a signed upload URL; the browser PUTs the blob to it.** `asset.createUploadUrl({ kind: "icon" | "avatar", contentType })` → `{ path, uploadUrl, token }` for `<bucket>/{userId}/{uuid}.jpg`, via the admin client's `createSignedUploadUrl`. The server chooses the path; the client never names one. Logged.
- **Reads: a session-gated streaming route, not signed read URLs.** `GET /api/assets/{bucket}/{userId}/{file}` checks the session, checks `userId === session user`, downloads with the admin client, and streams with `Cache-Control: private, max-age=86400, immutable` and the stored content type. An `<img src>` then needs no round trip to mint, the browser caches per session, and a path is never valid without a cookie. Signed read URLs expire mid-session and require a batch-sign call on every list render. Logged (`TECHNICAL-DECISIONS.md`).
- **Object-level storage policies deny everything to `authenticated`** (the app never uses the Supabase JS storage client with the user's JWT; both rails use the admin client under a server check). The policies exist so a future JWT path fails closed. Logged.
- **Bucket creation is setup SQL, idempotent**, in `packages/db/supabase/setup/03_storage_buckets.sql`, run by `db:setup` — the same category of hand-authored SQL as the triggers. Logged.
- **The route builder is `assetRoute(path)` in `lib/routes.ts`**, and the view mapper (SET-4 onward) never emits a URL — the component's caller computes `imageUrl = icon.kind === "image" ? assetRoute(icon.value) : null`. One helper, `iconImageUrl(icon)`, in `apps/web/lib/assets/icon-url.ts`. Logged.

## Behavior & states

**No surface.** Described by the two rails.

### Write rail

1. Caller (LB-02 or ST-01) has a `Blob` from `ImageCropper` → `useIconUpload({ upload })`.
2. `upload(blob)`: `trpc.asset.createUploadUrl.mutate({ kind, contentType: "image/jpeg" })` → `PUT uploadUrl` with the blob body and `Content-Type` → on `2xx`, return `path`; on failure return `null` (the hook shows *Couldn't save that image — you can add it in Settings.*).
3. The caller stores the path on its row (`habits.icon = { kind: "image", value: path }` or `user_avatars.storage_path`). For the avatar, the mutation `user.setAvatar({ path, byteSize, contentType })` (this ticket; SET-8 calls it) upserts `user_avatars` and deletes the previous object best-effort.
4. Orphans (a minted path never committed) are tolerated; a reaping job is Phase 2 and noted in `Out of scope`.

### Read rail

`apps/web/app/api/assets/[bucket]/[...path]/route.ts`:

- `bucket` ∈ {`icons`, `avatars`} else 404. `path` = `[userId, file]` exactly, else 404.
- Session via `getRequestAuthContextFromRequest`; none → 401 (a bare status; an image request has no reader).
- `userId !== authContext.userId` → **404**, never 403 (`trpc-foundation-patterns.md`: a probe learns nothing).
- Download via admin client; missing → 404; stream body with `Content-Type` from storage metadata, `Cache-Control: private, max-age=86400, immutable`, `X-Content-Type-Options: nosniff`.

**States (exhaustive):** minting · uploading · committed · read-hit (200) · read-miss (404) · unauthenticated read (401) · foreign read (404) · oversized upload (the signed URL enforces the bucket's 5 MB cap; the hook's 25 MB pre-encode guard and the 256px re-encode make this unreachable in practice).

**Failure / edge states:** admin credentials unset on a tier → the mutation throws `INTERNAL_SERVER_ERROR` with a logged fault naming the missing variable; the hook's caller shows its own sentence. A `HEIC` pick → `reencode.ts` already converts or fails with *Couldn't read that image — try a different one.*

## Non-negotiables (this slice)

- **The server names the path; the client never does.** Prefix = the session's user id, always.
- **Foreign paths are 404.** Not 403.
- **Buckets stay private.** No public URL exists for an icon or an avatar.
- **Secrets stay server-side.** The admin client is used only in the mutation and the route handler; nothing under `"use client"` imports `@syn/auth`'s admin factory (the boundaries lint already forbids it — do not suppress).
- **Every RLS bypass is a named call.** The admin client here is the storage equivalent; comment the two call sites with the reason.

## Data & AI

**Schema changes: none** (`user_avatars` exists from SET-1). **Setup SQL added:** `03_storage_buckets.sql` (buckets + object policies).

**Tables:** `user_avatars` (owner-private write via `user.setAvatar`) · `habits` (untouched here; SET-4 writes the icon path).

**Placement:** router `packages/api/src/routers/asset.ts` (rule 3) with service `services/asset/create-upload-url.ts` (rule 4); `user.setAvatar` on the existing `user` router with `services/user/avatar.ts`; route handler `apps/web/app/api/assets/[bucket]/[...path]/route.ts` (conventions §3.5 — "a browser API's shape", an `<img>` GET); `apps/web/lib/assets/icon-url.ts`; `assetRoute` in `lib/routes.ts`; validators `packages/validators/src/asset.ts` (`createUploadUrlInput`, `setAvatarInput`).

**tRPC / validators:** `asset.createUploadUrl` (mutation) · `user.setAvatar` (mutation) · `user.removeAvatar` (mutation). Zod: `asset.ts`.

**AI notes:** **None.**

## Accessibility

**None — no surface in this slice.** (The `alt` text is the consumer's responsibility: `ItemIcon` and `Avatar` already carry labels.)

## Acceptance criteria (observable — local tier with a local Supabase storage or the staging project's storage; state which)

1. `db:setup` creates `icons`, `avatars`, `exports` as private buckets with the caps and MIME allow-lists from `SCHEMA_REFERENCE.md` §7, idempotently (running twice changes nothing).
2. As user A, `asset.createUploadUrl({ kind: "icon", contentType: "image/jpeg" })` returns a path beginning `icons/<A>/`; a `PUT` of a JPEG to the URL succeeds; the object exists in the bucket at that path.
3. `GET /api/assets/icons/<A>/<file>` with A's session → 200, `image/jpeg`, the `private` cache header, the bytes uploaded. *(Vigil.)*
4. The same URL with B's session → 404; with no session → 401; a `bucket` of `exports` → 404. *(Vigil.)*
5. A `PUT` to A's minted URL with a body of 6 MB is rejected by storage (the cap), and the hook surfaces its sentence. *(Vigil.)*
6. `user.setAvatar` as A upserts `user_avatars` for A; calling it again with a new path replaces the row and the old object is gone; `user.removeAvatar` deletes the row and the object; B's `user.setAvatar` cannot touch A's row.
7. `iconImageUrl({ kind: "image", value: "icons/<A>/x.jpg" })` returns `/api/assets/icons/<A>/x.jpg`; for `emoji` and `curated` it returns `null`.
8. No file under `"use client"` imports `createAdminClient` (`yarn lint:boundaries` plus a grep).
9. `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` pass (four separate commands).

## Likely-relevant technical notes (ADVISORY — dev decides)

- `createSignedUploadUrl(path)` returns `{ signedUrl, token, path }`; the browser can either `PUT` to `signedUrl` with the `Authorization: Bearer <token>` header or use `uploadToSignedUrl`. A raw `fetch` PUT keeps `@supabase/supabase-js` out of the client bundle for this path — the browser client already exists for auth, so either is fine.
- Storage returns `Blob`/`ArrayBuffer` from `download`; stream it via `new Response(arrayBuffer, { headers })`. For 256px JPEGs this is ~20 KB; buffering is fine.
- `immutable` is safe because paths carry a uuid; a replaced icon is a new path.
- Bucket SQL: `INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) VALUES (...) ON CONFLICT (id) DO UPDATE SET …`; object policies on `storage.objects` for `authenticated` denying all four operations, named `storage_<bucket>_<op>_deny`.

## Dev's call

`fetch` PUT vs `uploadToSignedUrl` · whether the old avatar object is deleted synchronously or best-effort after the upsert (recommend best-effort, logged) · the exact 404 body (recommend empty).

## Out of scope

- **The icon picker UI and the crop step** — SET-4 (LB-02); `ImageCropper` and `useIconUpload` exist.
- **The avatar screen** — SET-8 (ST-01).
- **Orphan reaping** for minted-but-uncommitted objects — Phase 2; note the path convention makes it a prefix scan.
- **Export downloads** — SET-10 uses signed read URLs on the `exports` bucket, not this route; the bucket is created here.

## Depends on

- **SET-1** — `user_avatars`. Complete in `PROGRESS.md`.

## Recommended execution

**Sonnet.** One mutation, one route, one SQL file, and a probe list. The failure mode of choosing down is a 403 where a 404 belongs, or a path the client chose — both are on the probe list, so a diligent Sonnet catches them.

---

### Kickoff (paste into the session)

> Build **SET-3 — Icon and avatar pipeline: bucket policies, signed uploads, and the session-gated read route** (attached spec). Model: **Sonnet**. **The server names the path; foreign paths are 404; buckets stay private; the admin client appears in exactly two server files.**
> Attach/read first, in order: this spec · official spec §3.3, §9.8 · `packages/db/SCHEMA_REFERENCE.md` §7, §10 · `apps/web/lib/hooks/use-icon-upload.ts` and `lib/image/reencode.ts` (reuse, don't fork) · `packages/ui/src/composed/control/image-cropper/` · `apps/web/lib/auth/get-request-context.ts` · `packages/auth/src/index.ts` (`createAdminClient`) · `docs/ai-guides/trpc-foundation-patterns.md` · `docs/architecture/codebase-conventions.md` §3.5 · `docs/specs/README.md` § Placement rules · this track's `DEVIATIONS.md` + `TECHNICAL-DECISIONS.md` · `docs/specs/infrastructure/DEVIATIONS.md`.
> Add the bucket SQL to `packages/db/supabase/setup/` as `03_storage_buckets.sql`, idempotent. Close in three places. Run `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` as separate commands.
