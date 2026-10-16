import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { splitStatements } from "../packages/db/scripts/check-migrations.ts";

// USE-100 C2: every table under packages/db/src/schema/integrations/ is
// owner-private, in the schema (it calls ownerPrivateCrudPolicies with its
// own name) and in 0016's SQL (four policies, each the owner test). Read as
// text, beside USE-2's use-rls.test.ts; nothing connects to a database.

const root = fileURLToPath(new URL("../", import.meta.url));
const schemaDir = `${root}packages/db/src/schema/integrations/`;

/** Each schema file's tables, by the name it gives pgTable. */
const schemaTables = readdirSync(schemaDir)
  .filter((file) => file.endsWith(".ts"))
  .flatMap((file) => {
    const source = readFileSync(`${schemaDir}${file}`, "utf8");
    return [...source.matchAll(/pgTable\(\s*"(\w+)"/g)].map((match) => ({
      file,
      table: match[1]!,
      source,
    }));
  });

const split = splitStatements(
  readFileSync(
    `${root}packages/db/migrations/0016_use_integrations.sql`,
    "utf8",
  ),
);
assert.equal(split.unterminated, undefined, "0016 parses to the end");
const statements = split.statements.map((statement) => statement.text);

const owner = (table: string) =>
  `("${table}"."user_id" = current_setting('app.user_id', true)::uuid)`;

const policy = (table: string, command: string) => {
  const found = statements.filter(
    (text) =>
      new RegExp(`^CREATE POLICY "\\w+" ON "${table}" `).test(text) &&
      text.includes(` FOR ${command} TO "authenticated" `),
  );
  assert.equal(found.length, 1, `${table} has one ${command} policy`);
  assert.match(found[0]!, /AS PERMISSIVE/);
  return found[0]!;
};

test("C2: the integrations schema holds the seven tables 0016 creates, and no other", () => {
  const created = statements
    .map((text) => /^CREATE TABLE "(\w+)"/.exec(text)?.[1])
    .filter((name): name is string => name !== undefined);
  assert.deepEqual(
    schemaTables.map((row) => row.table).sort(),
    [...created].sort(),
  );
  assert.equal(schemaTables.length, 7);
});

test("C2: every integrations table carries the owner-private policy factory under its own name", () => {
  for (const { file, table, source } of schemaTables) {
    assert.match(
      source,
      new RegExp(
        `\\.\\.\\.ownerPrivateCrudPolicies\\(\\{\\s*prefix: "${table}",\\s*ownerColumn: sql\`\\$\\{table\\.userId\\}\`,`,
      ),
      `${file}: ${table} spreads ownerPrivateCrudPolicies on its user_id`,
    );
    for (const other of [
      "ownerAppendOnlyPolicies",
      "catalogReadPolicies",
      "serviceRoleOnlyPolicies",
      "pgPolicy(",
    ]) {
      assert.ok(!source.includes(other), `${file} uses no ${other}`);
    }
  }
});

test("C2: in 0016 every integrations table enables RLS and has exactly the four owner-only policies", () => {
  for (const { table } of schemaTables) {
    assert.ok(
      statements.includes(`ALTER TABLE "${table}" ENABLE ROW LEVEL SECURITY`),
      `${table} enables RLS`,
    );
    assert.equal(
      statements.filter((text) =>
        new RegExp(`^CREATE POLICY "\\w+" ON "${table}" `).test(text),
      ).length,
      4,
      `${table} has exactly four policies`,
    );
    const mine = owner(table);
    assert.ok(policy(table, "SELECT").endsWith(`USING ${mine}`));
    assert.ok(policy(table, "INSERT").endsWith(`WITH CHECK ${mine}`));
    assert.ok(
      policy(table, "UPDATE").endsWith(`USING ${mine} WITH CHECK ${mine}`),
    );
    assert.ok(policy(table, "DELETE").endsWith(`USING ${mine}`));
  }
});
