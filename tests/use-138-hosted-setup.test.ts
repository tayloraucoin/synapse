import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { fileURLToPath } from "node:url";

// USE-138: production went live with migrations applied and db:setup never
// run, so auth.users had no trigger, a signed-in account had no public.users
// row, and user.me answered 404 (planner.today 500). The setup SQL is read as
// text, comments out and whitespace collapsed; nothing here connects to a
// database. Each test fails if its part is removed from setup.

const root = fileURLToPath(new URL("../", import.meta.url));
const read = (path: string) =>
  readFileSync(`${root}${path}`, "utf8")
    .replace(/--[^\n]*/g, " ")
    .replace(/\s+/g, " ")
    .toLowerCase();

const setup = "packages/db/supabase/setup/";
const functions = read(`${setup}01_init_functions.sql`);
const triggers = read(`${setup}02_apply_triggers_rls.sql`);
const verify = read(`${setup}04_verify_setup.sql`);
const runner = readFileSync(
  `${root}packages/db/scripts/run-setup-sql.ts`,
  "utf8",
);

test("C1: handle_new_user() is security definer with a pinned search_path and inserts only the caller's own new row", () => {
  const body =
    /create or replace function public\.handle_new_user\(\)(.*?)\$\$;/.exec(
      functions,
    )?.[1];
  assert.ok(body, "01 defines public.handle_new_user()");
  assert.match(body, /security definer/);
  assert.match(body, /set search_path = public/);
  assert.match(
    body,
    /insert into public\.users \(id, email, created_at, updated_at\) values \(new\.id, new\.email, now\(\), now\(\)\) on conflict \(id\) do nothing;/,
  );
});

test("C2: setup arms on_auth_user_created after insert on auth.users, so a new sign-up gets a row with nothing done by hand", () => {
  assert.match(
    triggers,
    /create trigger on_auth_user_created after insert on auth\.users for each row execute function public\.handle_new_user\(\);/,
  );
});

test("C3: setup backfills a public.users row for every auth user without one, and only those", () => {
  assert.match(
    triggers,
    /insert into public\.users \(id, email, created_at, updated_at\) select au\.id, au\.email, now\(\), now\(\) from auth\.users au where not exists \(select 1 from public\.users pu where pu\.id = au\.id\) on conflict \(id\) do nothing;/,
  );
  const backfill = triggers.indexOf("select au.id, au.email");
  const armed = triggers.indexOf("create trigger on_auth_user_created");
  assert.ok(
    armed < backfill,
    "the trigger is armed before the backfill, so a sign-up between the two still gets its row",
  );
});

test("C4: db:setup ends with a read-only check that fails when the trigger, a row or RLS is missing", () => {
  assert.match(
    runner,
    /"03_storage_buckets\.sql",\s*(?:\/\/[^\n]*\n\s*)?"04_verify_setup\.sql",\s*\] as const/,
    "04 runs last",
  );
  assert.match(runner, /ON_ERROR_STOP=1/, "a raised exception fails the run");
  assert.match(verify, /tgname = 'on_auth_user_created'/);
  assert.match(
    verify,
    /raise exception '% auth user\(s\) have no public\.users row'/,
  );
  assert.match(verify, /not c\.relrowsecurity/);
  assert.match(
    verify,
    /^ ?begin transaction read only; do \$\$.*\$\$; commit; ?$/,
    "04 runs inside one read-only transaction",
  );
  assert.doesNotMatch(
    verify,
    /\b(insert|update|delete|alter|create|drop|grant|truncate)\b/,
    "04 only reads",
  );
});
