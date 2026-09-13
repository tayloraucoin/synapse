-- ============================================================================
-- 02_apply_triggers_rls.sql
-- Applies the updated_at trigger to every public table, wires the auth.users ->
-- public.users trigger, and enables RLS on every public table. Idempotent.
-- Run AFTER drizzle-kit migrate and AFTER 01_init_functions.sql.
--
-- These loops are deliberately data-driven: any table added by a future migration
-- is picked up automatically the next time this runs — no per-table edits.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- A) auth.users -> public.users shadow-row trigger.
-- Fires after Supabase Auth inserts a user. Drop-then-create for idempotency.
-- ----------------------------------------------------------------------------
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- The WHEN clause matters: auth.users is updated on every sign-in
-- (last_sign_in_at, refresh tokens, metadata), and without it the shadow row
-- would be rewritten on each of those for no reason.
drop trigger if exists on_auth_user_email_updated on auth.users;
create trigger on_auth_user_email_updated
  after update of email on auth.users
  for each row
  when (old.email is distinct from new.email)
  execute function public.handle_user_email_sync();

-- ----------------------------------------------------------------------------
-- B) updated_at trigger on every base table in public (except internal tables
--    that have no updated_at column, e.g. drizzle's migration journal).
-- ----------------------------------------------------------------------------
do $$
declare
  r record;
begin
  for r in
    select c.table_name
    from information_schema.columns c
    join information_schema.tables t
      on t.table_schema = c.table_schema
     and t.table_name = c.table_name
    where c.table_schema = 'public'
      and c.column_name = 'updated_at'
      and t.table_type = 'BASE TABLE'
  loop
    execute format(
      'drop trigger if exists set_updated_at on public.%I;', r.table_name
    );
    execute format(
      'create trigger set_updated_at before update on public.%I
         for each row execute function public.update_updated_at_column();',
      r.table_name
    );
  end loop;
end;
$$;

-- ----------------------------------------------------------------------------
-- B2) original_scheduled_start is immutable once set — on day_items (official
--     spec §3.7) and, since migration 0005, on day_blocks (UX v1.1 TD-5). The
--     function is in 01_init_functions.sql with every other function and is
--     table-agnostic; this arms it on both tables. Migration 0005 also arms
--     the day_blocks trigger, so a database migrated before setup ran has it;
--     this block keeps the two in step on every re-run.
--
--     Guarded on each table existing so this file stays runnable against a
--     database that has only migration 0000 applied — db:setup is documented
--     as idempotent and re-runnable, and a hard reference here would make that
--     false.
-- ----------------------------------------------------------------------------
do $$
begin
  if to_regclass('public.day_items') is null then
    raise notice 'day_items not found — skipping the immutability trigger (run drizzle-kit migrate first)';
  else
    drop trigger if exists day_items_original_start_immutable on public.day_items;
    create trigger day_items_original_start_immutable
      before update on public.day_items
      for each row
      execute function public.day_items_original_start_immutable();
  end if;

  if to_regclass('public.day_blocks') is null then
    raise notice 'day_blocks not found — skipping its immutability trigger (migration 0005 not applied)';
  else
    drop trigger if exists day_blocks_original_start_immutable on public.day_blocks;
    create trigger day_blocks_original_start_immutable
      before update on public.day_blocks
      for each row
      execute function public.day_items_original_start_immutable();
  end if;
end;
$$;

-- ----------------------------------------------------------------------------
-- C) Enable RLS on every base table in public. Policies live in a separate
--    document; enabling RLS here means "deny by default until a policy grants" —
--    the correct safe posture for sensitive data. Service-role bypasses RLS.
--
--    Enabling RLS on every table is intentional and unconditional: a table
--    that is added by a future migration and forgotten here would otherwise be
--    world-readable to any authenticated session. The loop means "forgotten"
--    cannot happen.
-- ----------------------------------------------------------------------------
do $$
declare
  r record;
begin
  for r in
    select table_name
    from information_schema.tables
    where table_schema = 'public'
      and table_type = 'BASE TABLE'
      and table_name <> '__drizzle_migrations'
  loop
    execute format(
      'alter table public.%I enable row level security;', r.table_name
    );
  end loop;
end;
$$;
