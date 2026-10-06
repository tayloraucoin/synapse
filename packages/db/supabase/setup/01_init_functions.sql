-- ============================================================================
-- 01_init_functions.sql
-- Extensions + reusable functions. Idempotent. Run ONCE per database, BEFORE
-- 02_apply_triggers_rls.sql. Safe to re-run.
--
-- Run order overall (see SETUP.md):
--   drizzle-kit migrate      -- creates all public.* tables
--   01_init_functions.sql    -- this file
--   02_apply_triggers_rls.sql
--   03_storage_buckets.sql
-- ============================================================================

-- gen_random_uuid() is built into Postgres 13+ (pgcrypto). Ensure it is present;
-- Supabase ships it, but this keeps a bare local Postgres safe.
create extension if not exists pgcrypto;

-- ----------------------------------------------------------------------------
-- update_updated_at_column()
-- Sets updated_at = now() on every UPDATE. Applied to every public table in
-- 02_apply_triggers_rls.sql, so updated_at never depends on application code
-- remembering to set it.
-- ----------------------------------------------------------------------------
create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ----------------------------------------------------------------------------
-- handle_new_user()
-- The table Supabase creates for users is auth.users — populated by Supabase
-- Auth, not by us. public.users is our shadow table whose PK equals
-- auth.users.id. This trigger keeps the shadow row in lockstep: every time
-- Supabase inserts an auth user (signup, magic link, OAuth, or
-- admin.createUser), a matching public.users row appears.
--
-- Why a trigger and not app code: signups go through Supabase Auth, often
-- client-side, so there is no reliable server hook to insert the shadow row.
-- Doing it in the database guarantees the row exists before any FK needs it.
--
-- SECURITY DEFINER: the trigger runs as the function owner so it can write to
-- public.users regardless of the calling role.
-- ----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, created_at, updated_at)
  values (new.id, new.email, now(), now())
  on conflict (id) do nothing;
  return new;
end;
$$;

-- ----------------------------------------------------------------------------
-- day_items_original_start_immutable()
-- official spec §3.7: `original_scheduled_start` "never changes after
-- materialisation" — it is where the ghost renders, and it is the half of the
-- plan-vs-actual distinction that a late start or a shift must not be able to
-- erase. `scheduled_start` is the one that moves.
--
-- Why a trigger and not a service rule: the same reasoning as handle_new_user.
-- "Never changes" is a promise the RECORD makes, and four write paths (the
-- materialiser, the shift, a late start, TP-04 re-materialisation) all update
-- this table. A rule enforced in four services is a rule until someone adds a
-- fifth; the database is where it holds regardless.
--
-- Setting it from NULL is allowed: that is materialisation writing it once —
-- or, since UX v1.1 (TD-5), *Set the day* writing it once for items and blocks
-- of a day that was pooled or unconfirmed at week build. The body is
-- table-agnostic and is armed on day_blocks too (02_apply_triggers_rls.sql,
-- migration 0005). Migration 0005 re-declares it identically; keep the two in
-- step if this ever changes.
-- ----------------------------------------------------------------------------
create or replace function public.day_items_original_start_immutable()
returns trigger
language plpgsql
as $$
begin
  if old.original_scheduled_start is not null
     and new.original_scheduled_start is distinct from old.original_scheduled_start then
    raise exception 'original_scheduled_start is immutable';
  end if;
  return new;
end;
$$;

-- ----------------------------------------------------------------------------
-- handle_user_email_sync()
-- The insert trigger above fires once. Without this companion the shadow row's
-- email would stay frozen at whatever the person signed up with while
-- auth.users moved on — so the export, and anything else that reads the shadow
-- address, would act on an address the person no longer controls.
-- ----------------------------------------------------------------------------
create or replace function public.handle_user_email_sync()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.users
  set email = new.email,
      updated_at = now()
  where id = new.id;
  return new;
end;
$$;
