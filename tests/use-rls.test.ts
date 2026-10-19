import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { splitStatements } from "../packages/db/scripts/check-migrations.ts";

// USE-2: 0012_use_daily, read as text. The statements are cut the way
// check-migrations cuts them (comments out, whitespace collapsed), so the
// header's prose never counts as SQL. Nothing here connects to a database.

const root = fileURLToPath(new URL("../", import.meta.url));
const sqlText = readFileSync(
  `${root}packages/db/migrations/0012_use_daily.sql`,
  "utf8",
);
const split = splitStatements(sqlText);
assert.equal(split.unterminated, undefined, "0012 parses to the end");
const statements = split.statements.map((statement) => statement.text);

const OWNER_ONLY = [
  "blocks",
  "block_changes",
  "block_items",
  "todos",
  "slots",
  "day_events",
  "day_records",
  "meal_topics",
  "saved_colours",
  "clients",
  "work_items",
];
const APPEND_ONLY = "slot_events";

const created = statements
  .map((text) => /^CREATE TABLE "(\w+)"/.exec(text)?.[1])
  .filter((name): name is string => name !== undefined);

const createTable = (table: string) => {
  const found = statements.find((text) =>
    text.startsWith(`CREATE TABLE "${table}" (`),
  );
  assert.ok(found, `0012 creates ${table}`);
  return found;
};

const policiesOn = (table: string) =>
  statements.filter((text) =>
    new RegExp(`^CREATE POLICY "\\w+" ON "${table}" `).test(text),
  );

const policy = (table: string, command: string) => {
  const found = policiesOn(table).filter((text) =>
    text.includes(` FOR ${command} TO "authenticated" `),
  );
  assert.equal(
    found.length,
    1,
    `${table} has one ${command} policy for authenticated`,
  );
  assert.match(found[0]!, /AS PERMISSIVE/);
  return found[0]!;
};

const owner = (table: string) =>
  `("${table}"."user_id" = current_setting('app.user_id', true)::uuid)`;

const assertRlsEnabled = (table: string) =>
  assert.ok(
    statements.includes(`ALTER TABLE "${table}" ENABLE ROW LEVEL SECURITY`),
    `${table} enables RLS`,
  );

test("C1: every table 0012 creates except slot_events is owner-private for select, insert, update and delete", () => {
  // A new table must be named here, so none ships without this check (and no
  // linear_* or google_* table rides along).
  assert.deepEqual([...created].sort(), [...OWNER_ONLY, APPEND_ONLY].sort());

  for (const table of OWNER_ONLY) {
    assertRlsEnabled(table);
    assert.equal(
      policiesOn(table).length,
      4,
      `${table} has exactly four policies`,
    );
    const mine = owner(table);
    assert.ok(
      policy(table, "SELECT").endsWith(`USING ${mine}`),
      `${table} select`,
    );
    assert.ok(
      policy(table, "INSERT").endsWith(`WITH CHECK ${mine}`),
      `${table} insert`,
    );
    assert.ok(
      policy(table, "UPDATE").endsWith(`USING ${mine} WITH CHECK ${mine}`),
      `${table} update`,
    );
    assert.ok(
      policy(table, "DELETE").endsWith(`USING ${mine}`),
      `${table} delete`,
    );
  }
});

test("C2: slot_events lets its owner select and insert, and denies update and delete", () => {
  createTable(APPEND_ONLY);
  assertRlsEnabled(APPEND_ONLY);
  assert.equal(policiesOn(APPEND_ONLY).length, 4, "exactly four policies");
  const mine = owner(APPEND_ONLY);
  assert.ok(policy(APPEND_ONLY, "SELECT").endsWith(`USING ${mine}`));
  assert.ok(policy(APPEND_ONLY, "INSERT").endsWith(`WITH CHECK ${mine}`));
  assert.ok(policy(APPEND_ONLY, "UPDATE").endsWith(`USING (false)`));
  assert.ok(policy(APPEND_ONLY, "DELETE").endsWith(`USING (false)`));
  // No updated_at: a row is never changed after it is written.
  assert.doesNotMatch(createTable(APPEND_ONLY), /"updated_at"/);
});

test("C3: 0012 only adds: no drop or rename, no old table altered but users.clients_enabled, enums changed only by ADD VALUE, added values unused", () => {
  const isNew = (table: string) => created.includes(table);

  for (const text of statements) {
    assert.doesNotMatch(text, /\b(DROP|RENAME|TRUNCATE)\b/i, text);
    assert.doesNotMatch(
      text,
      /^(INSERT|UPDATE|DELETE|COPY|DO|ALTER POLICY)\b/i,
      text,
    );
    assert.doesNotMatch(text, /\bEXECUTE\b/i, text);

    const table =
      /^(?:ALTER TABLE|CREATE (?:UNIQUE )?INDEX "\w+" ON|CREATE POLICY "\w+" ON) "(\w+)"/.exec(
        text,
      )?.[1];
    if (table !== undefined && !isNew(table)) {
      assert.equal(
        text,
        `ALTER TABLE "users" ADD COLUMN "clients_enabled" boolean DEFAULT false NOT NULL`,
        `the only change to an old table is users.clients_enabled: ${text}`,
      );
    }
    if (text.startsWith("ALTER TYPE")) {
      assert.match(text, /^ALTER TYPE "public"\."\w+" ADD VALUE '\w+'$/, text);
    }
    assert.match(
      text,
      /^(CREATE TYPE|ALTER TYPE|CREATE TABLE|ALTER TABLE|CREATE INDEX|CREATE POLICY)\b/,
      `an addition: ${text}`,
    );
  }

  const added = statements
    .map((text) => /ADD VALUE '(\w+)'$/.exec(text)?.[1])
    .filter((value): value is string => value !== undefined);
  assert.deepEqual(added.sort(), [
    "evening",
    "life",
    "todo_reminder",
    "todos",
    "wellness",
  ]);
  for (const value of added) {
    const uses = statements.filter(
      (text) =>
        text.includes(`'${value}'`) && !text.endsWith(`ADD VALUE '${value}'`),
    );
    assert.deepEqual(
      uses,
      [],
      `'${value}' is used in the transaction that adds it`,
    );
  }
});

test("C4: 0012 holds every CHECK the Build notes list", () => {
  const checks: Array<[string, string]> = [
    [
      "blocks",
      `CHECK (num_nonnulls("blocks"."rrule", "blocks"."on_date") = 1)`,
    ],
    ["blocks", `CHECK ("blocks"."ends_at" > "blocks"."starts_at")`],
    [
      "slots",
      `CHECK (num_nonnulls("slots"."block_item_id", "slots"."todo_id", "slots"."work_item_id") = 1)`,
    ],
    [
      "slots",
      `CHECK ("slots"."tier" IS NULL OR "slots"."work_item_id" IS NOT NULL)`,
    ],
    [
      "block_changes",
      `CHECK ("block_changes"."skipped" OR ("block_changes"."starts_at" IS NOT NULL AND "block_changes"."ends_at" IS NOT NULL))`,
    ],
    [
      "work_items",
      `CHECK ("work_items"."length_min_min" <= "work_items"."length_max_min")`,
    ],
  ];
  for (const [table, check] of checks) {
    assert.ok(createTable(table).includes(check), `${table}: ${check}`);
  }
});

test("C5: 0012 holds every unique key the Build notes list", () => {
  const keys: Array<[string, string]> = [
    ["block_changes", `UNIQUE("block_id","on_date")`],
    ["slots", `UNIQUE("work_item_id","on_date")`],
    ["slots", `UNIQUE("block_item_id","on_date")`],
    ["slots", `UNIQUE("todo_id","on_date")`],
    ["slot_events", `UNIQUE("user_id","client_event_id")`],
    ["day_records", `UNIQUE("user_id","on_date")`],
    ["saved_colours", `UNIQUE("user_id","hex")`],
  ];
  for (const [table, key] of keys) {
    assert.ok(createTable(table).includes(key), `${table}: ${key}`);
  }
});

// USE-14: 0013_use_set_up, read the same way. One test per criterion, C1 to C3.

const sql13 = splitStatements(
  readFileSync(`${root}packages/db/migrations/0013_use_set_up.sql`, "utf8"),
);
assert.equal(sql13.unterminated, undefined, "0013 parses to the end");
const statements13 = sql13.statements.map((statement) => statement.text);
const NEW_IN_0013 = "day_bounds";

test("USE-14 C1: day_bounds enables RLS and is owner-private for select, insert, update and delete", () => {
  const policies = statements13.filter((text) =>
    text.startsWith(`CREATE POLICY "day_bounds_`),
  );
  assert.equal(policies.length, 4, "exactly four policies");
  assert.ok(
    statements13.includes(
      `ALTER TABLE "${NEW_IN_0013}" ENABLE ROW LEVEL SECURITY`,
    ),
    "day_bounds enables RLS",
  );
  const mine = owner(NEW_IN_0013);
  const one = (command: string) => {
    const found = policies.filter((text) =>
      text.includes(` AS PERMISSIVE FOR ${command} TO "authenticated" `),
    );
    assert.equal(found.length, 1, `one ${command} policy for authenticated`);
    return found[0]!;
  };
  assert.ok(one("SELECT").endsWith(`USING ${mine}`));
  assert.ok(one("INSERT").endsWith(`WITH CHECK ${mine}`));
  assert.ok(one("UPDATE").endsWith(`USING ${mine} WITH CHECK ${mine}`));
  assert.ok(one("DELETE").endsWith(`USING ${mine}`));
});

test("USE-14 C2: 0013 only adds, but for day_events.on_date's NOT NULL", () => {
  const RELAXED = `ALTER TABLE "day_events" ALTER COLUMN "on_date" DROP NOT NULL`;
  const createdTypes = statements13
    .map((text) => /^CREATE TYPE "public"\."(\w+)"/.exec(text)?.[1])
    .filter((name): name is string => name !== undefined);
  const createdTables = statements13
    .map((text) => /^CREATE TABLE "(\w+)"/.exec(text)?.[1])
    .filter((name): name is string => name !== undefined);
  assert.deepEqual(createdTypes, ["event_tag"]);
  assert.deepEqual(createdTables, [NEW_IN_0013]);
  assert.equal(
    statements13.filter((text) => text === RELAXED).length,
    1,
    "the one relaxed NOT NULL",
  );

  for (const text of statements13) {
    assert.doesNotMatch(
      text,
      /^(INSERT|UPDATE|DELETE|COPY|DO|ALTER POLICY|ALTER TYPE)\b/i,
      text,
    );
    assert.doesNotMatch(text, /\b(RENAME|TRUNCATE|EXECUTE)\b/i, text);
    if (text === RELAXED) continue;
    assert.doesNotMatch(text, /\bDROP\b/i, text);

    const table =
      /^(?:ALTER TABLE|CREATE (?:UNIQUE )?INDEX "\w+" ON|CREATE POLICY "\w+" ON) "(\w+)"/.exec(
        text,
      )?.[1];
    if (table !== undefined && table !== NEW_IN_0013) {
      assert.match(
        text,
        /^ALTER TABLE "(day_events|block_items|slots)" ADD (COLUMN|CONSTRAINT) /,
        `an old table only gains a column or a constraint: ${text}`,
      );
      if (/ADD COLUMN .* NOT NULL$/.test(text)) {
        assert.match(
          text,
          / DEFAULT /,
          `a NOT NULL column has a default: ${text}`,
        );
      }
    }
    assert.match(
      text,
      /^(CREATE TYPE|CREATE TABLE|ALTER TABLE|CREATE INDEX|CREATE POLICY)\b/,
      `an addition: ${text}`,
    );
  }

  const added = statements13
    .map((text) => /^ALTER TABLE "(\w+)" ADD COLUMN "(\w+)"/.exec(text))
    .filter((match): match is RegExpExecArray => match !== null)
    .map(([, table, column]) => `${table}.${column}`)
    .sort();
  assert.deepEqual(added, [
    "block_items.on_date",
    "day_events.client_id",
    "day_events.color",
    "day_events.notes",
    "day_events.rrule",
    "day_events.tag",
    "slots.skipped",
  ]);
});

test("USE-14 C3: 0013 holds its CHECKs and unique keys", () => {
  const bounds = statements13.find((text) =>
    text.startsWith(`CREATE TABLE "day_bounds" (`),
  );
  assert.ok(bounds, "0013 creates day_bounds");
  for (const part of [
    `CHECK (num_nonnulls("day_bounds"."weekday", "day_bounds"."on_date") = 1)`,
    `CHECK ("day_bounds"."weekday" BETWEEN 0 AND 6)`,
    `CHECK ("day_bounds"."lights_out" > "day_bounds"."up_at")`,
    `UNIQUE("user_id","weekday")`,
    `UNIQUE("user_id","on_date")`,
  ]) {
    assert.ok(bounds.includes(part), `day_bounds: ${part}`);
  }
  assert.ok(
    statements13.includes(
      `ALTER TABLE "day_events" ADD CONSTRAINT "day_events_rrule_or_on_date_check" CHECK (num_nonnulls("day_events"."rrule", "day_events"."on_date") = 1)`,
    ),
    "an event has exactly one of rrule and on_date",
  );
});
