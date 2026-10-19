-- ============================================================================
-- 04_verify_setup.sql
-- Read-only. Fails db:setup (psql ON_ERROR_STOP) when the tier it just set up
-- is not in the state the app needs. Run LAST, after 01 to 03 (USE-138).
--
-- Why it exists: production went live with migrations applied and setup never
-- run, so no auth.users trigger existed, a signed-in account had no
-- public.users row, and user.me answered 404. Nothing checked. Now setup
-- cannot report success on a tier where that is true.
-- ============================================================================

-- Read only by construction, not by keyword: any write inside fails.
begin transaction read only;

do $$
declare
  missing_rows bigint;
  unprotected text;
begin
  if not exists (
    select 1 from pg_trigger
    where tgrelid = 'auth.users'::regclass
      and tgname = 'on_auth_user_created'
      and not tgisinternal
      and tgenabled <> 'D'
  ) then
    raise exception 'on_auth_user_created is missing or disabled on auth.users';
  end if;

  if not exists (
    select 1 from pg_proc
    where oid = 'public.handle_new_user'::regproc and prosecdef
  ) then
    raise exception 'public.handle_new_user() is not security definer';
  end if;

  select count(*) into missing_rows
  from auth.users au
  where not exists (select 1 from public.users pu where pu.id = au.id);
  if missing_rows > 0 then
    raise exception '% auth user(s) have no public.users row', missing_rows;
  end if;

  select string_agg(c.relname, ', ') into unprotected
  from pg_class c
  where c.relnamespace = 'public'::regnamespace
    and c.relkind = 'r'
    and c.relname <> '__drizzle_migrations'
    and not c.relrowsecurity;
  if unprotected is not null then
    raise exception 'RLS is off on: %', unprotected;
  end if;

  raise notice 'setup verified: trigger present, every auth user has a row, RLS on every public table';
end;
$$;

commit;
