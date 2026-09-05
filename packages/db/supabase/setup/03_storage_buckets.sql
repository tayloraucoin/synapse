-- ============================================================================
-- 03_storage_buckets.sql
-- Supabase Storage buckets AND their object policies. Idempotent. Run AFTER
-- the rest of setup.
--
-- EVERY BUCKET IS PRIVATE. Synapse's promise is that only the person can see
-- their data — not the people who built this — and a public bucket is a URL
-- anyone can guess their way into.
--
-- HOW OBJECTS ARE SERVED (SET-3). Icons and avatars go through the
-- session-gated route `/api/assets/{bucket}/{user_id}/{file}`, which checks the
-- session and the owner before streaming — so a path is worthless without a
-- cookie, and a list of forty icons costs no signing calls. Exports are the
-- one exception and use a 24-hour signed URL, because a download opens in the
-- system browser, which carries no session cookie (SET-10).
--
-- The bucket rows are upserted rather than left alone on conflict, so this
-- file stays the authority on the caps and the MIME allow-lists: change a
-- value here and the next `db:setup` applies it. Re-running with no edits
-- changes nothing.
--
-- Skipped automatically on vanilla local Postgres (no storage schema). Re-run
-- db:setup against staging or production Supabase to create the buckets there.
-- ============================================================================

DO $storage_buckets$
BEGIN
  IF to_regclass('storage.buckets') IS NULL THEN
    RAISE NOTICE 'storage.buckets not found — skipping bucket setup (vanilla Postgres; run db:setup on Supabase-hosted DBs)';
    RETURN;
  END IF;

  -- avatars — the optional account photo (official spec §9.8). Private;
  -- served through signed URLs. Small, image-only.
  INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  VALUES (
    'avatars',
    'avatars',
    false,
    5242880, -- 5 MB, matching USER_IMAGE_MAX_BYTES in @syn/constants
    ARRAY['image/jpeg', 'image/png', 'image/webp']
  )
  ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

  -- icons — custom habit icons (official spec §3.3, §9.9). Same limits as
  -- avatars: same upload pipeline, same constraints, so the two cannot drift.
  INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  VALUES (
    'icons',
    'icons',
    false,
    5242880, -- 5 MB
    ARRAY['image/jpeg', 'image/png', 'image/webp']
  )
  ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

  -- exports — the generated data-export bundle (official spec §7.6,
  -- Settings → Your data → Export everything). Private; signed-URL download
  -- with a short TTL enforced in the app. JSON or zip.
  INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  VALUES (
    'exports',
    'exports',
    false,
    104857600, -- 100 MB
    ARRAY['application/json', 'application/zip']
  )
  ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;
END $storage_buckets$;

-- Naming conventions (enforced in the app and in the storage policies):
--   avatars/{user_id}/{uuid}.{ext}
--   icons/{user_id}/{uuid}.{ext}
--   exports/{user_id}/{request_id}.zip
-- Keying the first path segment on the owner id is what the storage RLS
-- policies match against (owner-only read and write).

-- ============================================================================
-- Object-level policies (SET-3)
--
-- DENY EVERYTHING TO `authenticated`, on all three buckets.
--
-- That is not an oversight, it is the design. Neither rail uses the Supabase
-- storage client with a person's JWT:
--
--   * writes go to a signed upload URL the server minted, at a path the server
--     named from the session's user id;
--   * reads go through `/api/assets/{bucket}/{user_id}/{file}`, which checks
--     the session, checks the owner, and streams with the service role.
--
-- So there is no legitimate JWT-context object access to permit. These
-- policies exist so that if a future ticket ever reaches for
-- `supabase.storage.from(...)` in the browser, it FAILS CLOSED.
--
-- THEY ARE `RESTRICTIVE`, AND THAT IS THE WHOLE POINT. Permissive policies —
-- the default — are OR'd together, so a permissive "deny" grants nothing and
-- also PREVENTS nothing: the first permissive policy someone adds later would
-- override it silently. Restrictive policies are AND'd, so these hold no
-- matter what is added beside them. A deny that a later grant can switch off
-- is not a deny.
--
-- Each is scoped to its own bucket (`bucket_id <> '<name>'` passes every other
-- bucket through the AND), so the policy name states exactly what it covers
-- and a future bucket is unaffected.
--
-- The service role bypasses RLS entirely, which is why both rails still work.
-- Idempotent: dropped and recreated on every run.
-- ============================================================================

DO $storage_policies$
DECLARE
  bucket_name text;
  operation text;
  policy_name text;
BEGIN
  IF to_regclass('storage.objects') IS NULL THEN
    RAISE NOTICE 'storage.objects not found — skipping object policies (vanilla Postgres)';
    RETURN;
  END IF;

  FOREACH bucket_name IN ARRAY ARRAY['avatars', 'icons', 'exports'] LOOP
    FOREACH operation IN ARRAY ARRAY['select', 'insert', 'update', 'delete'] LOOP
      policy_name := format('storage_%s_%s_deny', bucket_name, operation);

      EXECUTE format(
        'DROP POLICY IF EXISTS %I ON storage.objects;', policy_name
      );

      -- INSERT takes WITH CHECK; the other three take USING.
      IF operation = 'insert' THEN
        EXECUTE format(
          'CREATE POLICY %I ON storage.objects AS RESTRICTIVE FOR INSERT TO authenticated WITH CHECK (bucket_id <> %L);',
          policy_name, bucket_name
        );
      ELSE
        EXECUTE format(
          'CREATE POLICY %I ON storage.objects AS RESTRICTIVE FOR %s TO authenticated USING (bucket_id <> %L);',
          policy_name, upper(operation), bucket_name
        );
      END IF;
    END LOOP;
  END LOOP;
END
$storage_policies$;
