import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { splitStatements } from "../packages/db/scripts/check-migrations.ts";

// USE-30: 0014_use_todo_remind_on, read as text and cut the way
// check-migrations cuts it, so the header's prose never counts as SQL.

const root = fileURLToPath(new URL("../", import.meta.url));
const split = splitStatements(
  readFileSync(
    `${root}packages/db/migrations/0014_use_todo_remind_on.sql`,
    "utf8",
  ),
);
assert.equal(split.unterminated, undefined, "0014 parses to the end");

test("C1: 0014 adds todos.remind_on as a nullable date and holds nothing else", () => {
  assert.deepEqual(
    split.statements.map((statement) => statement.text),
    [`ALTER TABLE "todos" ADD COLUMN "remind_on" date`],
  );
});
