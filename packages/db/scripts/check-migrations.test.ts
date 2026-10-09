/**
 * `yarn test:migrations`: MIG-4's criteria for check-migrations.ts. Every
 * folder the tests change is a copy in the OS temp dir; the real migrations
 * and lock are only read.
 */

import assert from "node:assert/strict";
import {
  cpSync,
  mkdtempSync,
  readFileSync,
  renameSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { after, test } from "node:test";
import {
  findAuthDdl,
  isGuardedAuthStub,
  LOCK_PATH,
  MIGRATIONS_DIR,
  PACKAGE_DIR,
  runCheck,
  splitStatements,
} from "./check-migrations.ts";

const FIXTURES = path.join(
  PACKAGE_DIR,
  "scripts",
  "fixtures",
  "check-migrations",
);
const GUARDED = readFileSync(
  path.join(MIGRATIONS_DIR, "0000_brave_quicksilver.sql"),
  "utf8",
);
const UNGUARDED = readFileSync(
  path.join(FIXTURES, "0000_unguarded.sql"),
  "utf8",
);

const roots: string[] = [];
after(() => {
  for (const root of roots) rmSync(root, { recursive: true, force: true });
});

/** A temp copy of the migrations folder and the lock, for one test to change. */
function copyMigrations(): { dir: string; lock: string } {
  const root = mkdtempSync(path.join(tmpdir(), "check-migrations-"));
  roots.push(root);
  const dir = path.join(root, "migrations");
  cpSync(MIGRATIONS_DIR, dir, { recursive: true });
  return { dir, lock: path.join(dir, path.basename(LOCK_PATH)) };
}

function rulesOf(sql: string, frozen = false): string[] {
  return findAuthDdl("x.sql", sql, { frozen }).map((finding) => finding.rule);
}

/** 0000's guard statement, as the splitter cuts it. */
function guardStatement(): string {
  const found = splitStatements(GUARDED).statements.find((s) =>
    s.text.startsWith("DO "),
  );
  assert.ok(found, "0000 has no DO block");
  return found.text;
}

test("C1: the committed migrations pass, 0000's guard included", () => {
  const { files, findings } = runCheck(MIGRATIONS_DIR, LOCK_PATH);
  const journal = JSON.parse(
    readFileSync(path.join(MIGRATIONS_DIR, "meta", "_journal.json"), "utf8"),
  ) as { entries: unknown[] };
  assert.ok(files > 0);
  assert.equal(files, journal.entries.length);
  assert.deepEqual(findings, []);
});

test("C1: the pass is not vacuous: 0000 carries the guard and the FK to auth.users", () => {
  assert.equal(isGuardedAuthStub(guardStatement()), true);
  assert.match(GUARDED, /CREATE SCHEMA IF NOT EXISTS "auth"/);
  assert.match(GUARDED, /REFERENCES "auth"\."users"\("id"\)/);
  assert.deepEqual(findAuthDdl("0000", GUARDED), []);
});

test("C2: the unguarded 0000 drizzle-kit regenerates fails on both auth statements", () => {
  const findings = findAuthDdl("0000_unguarded.sql", UNGUARDED);
  assert.deepEqual(
    findings.map((f) => [f.rule, f.statement]),
    [
      ["auth-schema", 1],
      ["auth-object", 2],
    ],
  );
  assert.match(findings[0]?.message ?? "", /CREATE SCHEMA "auth"/);
  assert.match(findings[1]?.message ?? "", /CREATE TABLE "auth"\."users"/);
});

test("C2: the regenerated form put in 0000's place fails the whole check", () => {
  const { dir, lock } = copyMigrations();
  writeFileSync(path.join(dir, "0000_brave_quicksilver.sql"), UNGUARDED);
  const rules = runCheck(dir, lock).findings.map((f) => `${f.file} ${f.rule}`);
  assert.ok(
    rules.includes("0000_brave_quicksilver.sql auth-schema"),
    rules.join("\n"),
  );
  assert.ok(
    rules.includes("0000_brave_quicksilver.sql auth-object"),
    rules.join("\n"),
  );
  assert.ok(
    rules.includes("0000_brave_quicksilver.sql append-only"),
    rules.join("\n"),
  );
});

test("C2: the same file under any name fails: the check reads contents, not names", () => {
  const { dir, lock } = copyMigrations();
  writeFileSync(path.join(dir, "0011_workflow.sql"), UNGUARDED);
  const rules = runCheck(dir, lock).findings.map((f) => `${f.file} ${f.rule}`);
  assert.ok(rules.includes("0011_workflow.sql auth-schema"), rules.join("\n"));
});

test("C2: every loosened guard fails", () => {
  const guard = guardStatement();
  const variants: Record<string, string> = {
    "an extra statement after END IF": guard.replace(
      "END IF;",
      "END IF; ALTER TABLE auth.users ADD COLUMN plan text;",
    ),
    "an ELSE branch": guard.replace(
      "END IF;",
      "ELSE DROP TABLE auth.users; END IF;",
    ),
    "a third statement inside THEN": guard.replace(
      "END IF;",
      "GRANT ALL ON auth.users TO anon; END IF;",
    ),
    "the condition on another schema": guard.replace(
      "table_schema = 'auth'",
      "table_schema = 'public'",
    ),
    "the condition on another table": guard.replace(
      "table_name = 'users'",
      "table_name = 'sessions'",
    ),
    "IF EXISTS instead of IF NOT EXISTS": guard.replace(
      "IF NOT EXISTS (",
      "IF EXISTS (",
    ),
    "the condition negated by OR": guard.replace(
      "AND table_name = 'users'",
      "AND table_name = 'users' OR true",
    ),
    "a CHECK in the stub's columns": guard.replace(
      "email text",
      "email text CHECK (email <> '')",
    ),
    "a bare CREATE SCHEMA": guard.replace(
      'CREATE SCHEMA IF NOT EXISTS "auth"',
      'CREATE SCHEMA "auth"',
    ),
    "a REFERENCES in the stub's columns": guard.replace(
      "email text",
      "email text REFERENCES public.users (email)",
    ),
    "a DEFAULT in the stub's columns": guard.replace(
      "email text",
      "email text DEFAULT now()",
    ),
    "a nested dollar body": guard.replace(
      "email text",
      "email text DEFAULT $x$a$x$",
    ),
  };
  for (const [name, sql] of Object.entries(variants)) {
    assert.notEqual(sql, guard, `variant did not change the guard: ${name}`);
    assert.equal(isGuardedAuthStub(sql), false, name);
    assert.ok(rulesOf(`${sql};`).length > 0, `${name} passed: ${sql}`);
  }
});

test("C2: each kind of DDL or write against auth fails", () => {
  const statements = [
    'CREATE SCHEMA "auth"',
    "create schema if not exists auth",
    "drop schema auth cascade",
    "grant usage on schema public, auth to anon",
    "alter default privileges in schema auth grant all on tables to postgres",
    "alter table public.notes set schema auth",
    "alter schema scratch rename to auth",
    "create schema authorization auth",
    'create schema if not exists authorization "auth"',
    'alter table "auth"."users" add column "plan" text',
    "ALTER TABLE AUTH.USERS ENABLE ROW LEVEL SECURITY",
    "alter table auth . users enable row level security",
    "alter table auth/* c */.users enable row level security",
    "drop table auth.sessions",
    "create table auth.extra (id uuid)",
    "create index users_email_idx on auth.users (email)",
    "create trigger t after insert on auth.users for each row execute function public.f()",
    "create policy p on auth.users for select using (true)",
    "create or replace function auth.uid() returns uuid language sql as $$ select null::uuid $$",
    "drop function if exists auth.role",
    "call auth.cleanup()",
    "grant select on auth.users to authenticated",
    "comment on table auth.users is 'x'",
    "insert into auth.users (id, email) values (gen_random_uuid(), 'a@example.test')",
    "update auth.users set email = null",
    "delete from auth.users",
    "truncate auth.users",
    "create view public.emails as select email from auth.users",
    "alter table public.notes add constraint f foreign key (s) references auth.sessions (id)",
    "select auth.uid(1)",
    "set search_path = auth",
    "select set_config('search_path', 'auth', false)",
    "select set_config('search_path', 'au' || 'th', false)",
    "set search_path to scratch",
    "select set_config('search' || '_path', 'auth', false)",
    "set role supabase_auth_admin",
    "set local role postgres",
    "reset role",
    "set session authorization supabase_auth_admin",
    "do $$ begin execute format('create table %s.x (id int)', substr('xauthx', 2, 4)); end $$",
    "do $$ begin execute format('create table %s.x (id int)', reverse('htua')); end $$",
    "do $$ begin execute format('create table %s.x (id int)', concat('au', 'th')); end $$",
    "do $$ begin execute format('create table %s%s.x (id int)', 'au', 'th'); end $$",
    "create function public.f() returns void language sql set search_path = auth as $$ delete from users $$",
    'create table U&"\\0061uth".x (id int)',
    "do $$ begin execute 'create table ' || 'au' || 'th.x (id int)'; end $$",
    "do $$ begin execute format('create table %I.x (id int)', 'auth'); end $$",
    "do $$ begin execute E'create table \\x61uth.x (id int)'; end $$",
    "do $$ begin execute (select 'create table ' || nspname || '.x()' from pg_namespace limit 1); end $$",
    "do $body$ begin insert into auth.users (id) values (gen_random_uuid()); end $body$",
  ];
  for (const statement of statements) {
    assert.ok(rulesOf(`${statement};`).length > 0, statement);
  }
});

test("C2: a foreign key to auth.users and the four auth reads stay allowed", () => {
  const statements = [
    'ALTER TABLE "users" ADD CONSTRAINT "users_id_users_id_fk" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE cascade',
    'CREATE POLICY "p" ON "notes" FOR SELECT TO "authenticated" USING ("notes"."owner_id" = (select auth.uid()))',
    "select auth.role(), auth.jwt(), auth.email()",
    'CREATE TABLE "public"."author" ("auth" text NOT NULL)',
    "select 'authentication' as word",
    "-- a comment naming auth.users is ignored\nselect 1",
  ];
  for (const statement of statements) {
    assert.deepEqual(rulesOf(`${statement};`), [], statement);
  }
});

test("the splitter keeps strings, quoted names, dollar bodies and comments whole", () => {
  const { statements, unterminated } = splitStatements(
    "select 'a;b', \"c;d\";\n/* x; /* nested; */ y; */ select $t$ e; $t$;\n--> statement-breakpoint\nselect E'f\\';g';",
  );
  assert.equal(unterminated, undefined);
  assert.deepEqual(
    statements.map((s) => s.text),
    ["select 'a;b', \"c;d\"", "select $t$ e; $t$", "select E'f\\';g'"],
  );
  assert.deepEqual(
    rulesOf("select 1; select 'unclosed; drop table auth.users;"),
    ["unterminated"],
  );
  assert.deepEqual(rulesOf("select 1; do $$ begin drop table auth.users;"), [
    "unterminated",
  ]);
});

test("C3: an edited earlier migration fails", () => {
  const { dir, lock } = copyMigrations();
  const file = path.join(dir, "0003_flaky_major_mapleleaf.sql");
  writeFileSync(
    file,
    `${readFileSync(file, "utf8")}\n--> statement-breakpoint\nSELECT 1;`,
  );
  const findings = runCheck(dir, lock).findings;
  assert.deepEqual(
    findings.map((f) => [f.file, f.rule]),
    [["0003_flaky_major_mapleleaf.sql", "append-only"]],
  );
  assert.match(findings[0]?.message ?? "", /edited after it was recorded/);
});

test("C3: a one-byte edit, a removal, a rename and a moved journal timestamp each fail", () => {
  const cases: Record<string, (dir: string) => void> = {
    "one byte": (dir) => {
      const file = path.join(dir, "0002_simple_blue_shield.sql");
      writeFileSync(file, readFileSync(file, "utf8").replace(/;\s*$/, ";\n"));
    },
    removal: (dir) =>
      rmSync(path.join(dir, "0005_profile_fixtures_day_blocks_journal.sql")),
    rename: (dir) => {
      renameSync(
        path.join(dir, "0006_retire_v1_model.sql"),
        path.join(dir, "0006_renamed.sql"),
      );
      const journal = path.join(dir, "meta", "_journal.json");
      writeFileSync(
        journal,
        readFileSync(journal, "utf8").replace(
          '"0006_retire_v1_model"',
          '"0006_renamed"',
        ),
      );
    },
    "journal when": (dir) => {
      const journal = path.join(dir, "meta", "_journal.json");
      writeFileSync(
        journal,
        readFileSync(journal, "utf8").replace("1789357054755", "1789357054756"),
      );
    },
  };
  for (const [name, change] of Object.entries(cases)) {
    const { dir, lock } = copyMigrations();
    change(dir);
    const rules = runCheck(dir, lock).findings.map((f) => f.rule);
    assert.ok(rules.includes("append-only"), `${name}: ${rules.join(", ")}`);
  }
});

test("C3: a new migration fails until recorded, and recording never rewrites an entry", () => {
  const { dir, lock } = copyMigrations();
  const journalPath = path.join(dir, "meta", "_journal.json");
  const journal = JSON.parse(readFileSync(journalPath, "utf8")) as {
    entries: {
      idx: number;
      version: string;
      when: number;
      tag: string;
      breakpoints: boolean;
    }[];
  };
  const last = journal.entries.at(-1)!;
  journal.entries.push({
    ...last,
    idx: last.idx + 1,
    when: last.when + 1000,
    tag: "0012_synthetic",
  });
  writeFileSync(journalPath, JSON.stringify(journal, null, 2));
  writeFileSync(
    path.join(dir, "0012_synthetic.sql"),
    'CREATE TABLE "synthetic" ("id" uuid);',
  );

  assert.deepEqual(
    runCheck(dir, lock).findings.map((f) => [f.file, f.rule]),
    [["0012_synthetic.sql", "append-only"]],
  );
  const before = readFileSync(lock, "utf8");
  const recorded = runCheck(dir, lock, { record: true });
  assert.deepEqual(recorded.recorded, ["0012_synthetic.sql"]);
  assert.deepEqual(runCheck(dir, lock).findings, []);
  const after = JSON.parse(readFileSync(lock, "utf8")) as {
    migrations: unknown[];
  };
  const was = JSON.parse(before) as { migrations: unknown[] };
  assert.deepEqual(
    after.migrations.slice(0, was.migrations.length),
    was.migrations,
  );

  const file = path.join(dir, "0012_synthetic.sql");
  writeFileSync(file, 'CREATE TABLE "synthetic" ("id" uuid, "x" text);');
  const locked = readFileSync(lock, "utf8");
  assert.deepEqual(
    runCheck(dir, lock, { record: true }).findings.map((f) => [f.file, f.rule]),
    [["0012_synthetic.sql", "append-only"]],
  );
  assert.equal(readFileSync(lock, "utf8"), locked);
});

test("C3: record refuses a new migration that touches auth, and a migration missing from the journal fails", () => {
  const { dir, lock } = copyMigrations();
  const journalPath = path.join(dir, "meta", "_journal.json");
  const journal = JSON.parse(readFileSync(journalPath, "utf8")) as {
    entries: { idx: number; when: number; tag: string }[];
  };
  const last = journal.entries.at(-1)!;
  journal.entries.push({
    ...last,
    idx: last.idx + 1,
    when: last.when + 1000,
    tag: "0012_synthetic",
  });
  writeFileSync(journalPath, JSON.stringify(journal, null, 2));
  writeFileSync(
    path.join(dir, "0012_synthetic.sql"),
    "ALTER TABLE auth.users ADD COLUMN plan text;",
  );
  const before = readFileSync(lock, "utf8");
  const result = runCheck(dir, lock, { record: true });
  assert.deepEqual(result.recorded, []);
  assert.equal(readFileSync(lock, "utf8"), before);

  writeFileSync(path.join(dir, "0013_unlisted.sql"), "SELECT 1;");
  const rules = runCheck(dir, lock).findings.map((f) => `${f.file} ${f.rule}`);
  assert.ok(rules.includes("0013_unlisted.sql journal"), rules.join("\n"));
});

test("C3: a journal entry with no file fails, recorded or not", () => {
  const { dir, lock } = copyMigrations();
  const journalPath = path.join(dir, "meta", "_journal.json");
  const journal = JSON.parse(readFileSync(journalPath, "utf8")) as {
    entries: { idx: number; when: number; tag: string }[];
  };
  const last = journal.entries.at(-1)!;
  journal.entries.push({
    ...last,
    idx: last.idx + 1,
    when: last.when + 1000,
    tag: "0012_absent",
  });
  writeFileSync(journalPath, JSON.stringify(journal, null, 2));
  const fresh = runCheck(dir, lock).findings.map((f) => `${f.file} ${f.rule}`);
  assert.ok(fresh.includes("0012_absent.sql journal"), fresh.join("\n"));

  const recorded = copyMigrations();
  rmSync(path.join(recorded.dir, "0004_block_templates_and_stacked_slots.sql"));
  const gone = runCheck(recorded.dir, recorded.lock).findings.map(
    (f) => `${f.file} ${f.rule}`,
  );
  assert.ok(
    gone.includes("0004_block_templates_and_stacked_slots.sql journal"),
    gone.join("\n"),
  );
  assert.ok(
    gone.includes("0004_block_templates_and_stacked_slots.sql append-only"),
    gone.join("\n"),
  );
});

test("C3: record stops at the first refused entry, so nothing later takes its place", () => {
  const { dir, lock } = copyMigrations();
  const journalPath = path.join(dir, "meta", "_journal.json");
  const journal = JSON.parse(readFileSync(journalPath, "utf8")) as {
    entries: { idx: number; when: number; tag: string }[];
  };
  const last = journal.entries.at(-1)!;
  journal.entries.push(
    {
      ...last,
      idx: last.idx + 1,
      when: last.when + 1000,
      tag: "0012_touches_auth",
    },
    {
      ...last,
      idx: last.idx + 2,
      when: last.when + 2000,
      tag: "0013_synthetic",
    },
  );
  writeFileSync(journalPath, JSON.stringify(journal, null, 2));
  writeFileSync(
    path.join(dir, "0012_touches_auth.sql"),
    "DROP TABLE auth.sessions;",
  );
  writeFileSync(
    path.join(dir, "0013_synthetic.sql"),
    'CREATE TABLE "synthetic" ("id" uuid);',
  );
  const before = readFileSync(lock, "utf8");
  assert.deepEqual(runCheck(dir, lock, { record: true }).recorded, []);
  assert.equal(readFileSync(lock, "utf8"), before);
  const unrecorded = runCheck(dir, lock)
    .findings.filter((f) => f.rule === "append-only")
    .map((f) => f.file);
  assert.deepEqual(unrecorded, ["0012_touches_auth.sql", "0013_synthetic.sql"]);
});

test("C2: dynamic EXECUTE fails in a new migration, and only recorded SQL keeps it", () => {
  const policies =
    "do $$ declare n text := 'p'; begin execute format('DROP POLICY IF EXISTS %I ON storage.objects;', n); end $$;";
  assert.deepEqual(rulesOf(policies), ["dynamic-sql"]);
  assert.deepEqual(rulesOf(policies, true), []);
  assert.deepEqual(
    rulesOf("do $$ begin execute 'drop table au' || 'th.users'; end $$;", true),
    ["dynamic-sql"],
  );
  assert.deepEqual(
    rulesOf("grant execute on function public.f() to anon;"),
    [],
  );

  const { dir, lock } = copyMigrations();
  const file = path.join(dir, "0007_v1_2_additive.sql");
  writeFileSync(file, `${readFileSync(file, "utf8")}\n`);
  const rules = runCheck(dir, lock).findings.map((f) => `${f.file} ${f.rule}`);
  assert.ok(
    rules.includes("0007_v1_2_additive.sql dynamic-sql"),
    rules.join("\n"),
  );
  assert.ok(
    rules.includes("0007_v1_2_additive.sql append-only"),
    rules.join("\n"),
  );
});

test("C3: record refuses a missing lock instead of starting a new baseline", () => {
  const { dir, lock } = copyMigrations();
  rmSync(lock);
  const refused = runCheck(dir, lock, { record: true });
  assert.deepEqual(refused.recorded, []);
  assert.ok(refused.findings.some((f) => f.rule === "lock"));
  assert.throws(() => readFileSync(lock));
});

test("C4: yarn verify runs check-migrations and its tests after build", () => {
  const root = JSON.parse(
    readFileSync(path.join(PACKAGE_DIR, "..", "..", "package.json"), "utf8"),
  ) as {
    scripts: Record<string, string>;
  };
  const steps = root.scripts.verify!.split("&&").map((step) => step.trim());
  const build = steps.indexOf("yarn build");
  assert.ok(build >= 0, "verify has no yarn build step");
  assert.ok(steps.indexOf("yarn check-migrations") > build, steps.join(" && "));
  assert.ok(steps.indexOf("yarn test:migrations") > build, steps.join(" && "));
  assert.equal(
    root.scripts["check-migrations"],
    "yarn workspace @syn/db check-migrations",
  );
  assert.equal(
    root.scripts["test:migrations"],
    "yarn workspace @syn/db test:migrations",
  );
});
