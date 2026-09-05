-- ============================================================================
-- 03_storage_buckets.sql
-- Supabase Storage buckets. Idempotent. Run AFTER the rest of setup.
-- Storage object RLS policies live with the app's storage guide; this file
-- only declares the buckets and their constraints.
--
-- EVERY BUCKET IS PRIVATE. Synapse's promise is that only the person can see
-- their data — not the people who built this — and a public bucket is a URL
-- anyone can guess their way into. Objects are served through signed URLs.
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
  ON CONFLICT (id) DO NOTHING;

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
  ON CONFLICT (id) DO NOTHING;

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
  ON CONFLICT (id) DO NOTHING;
END $storage_buckets$;

-- Naming conventions (enforced in the app and in the storage policies):
--   avatars/{user_id}/{uuid}.{ext}
--   icons/{user_id}/{uuid}.{ext}
--   exports/{user_id}/{request_id}.zip
-- Keying the first path segment on the owner id is what the storage RLS
-- policies match against (owner-only read and write).
