import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * USE-105 C5: no job reads a user's row except through an RLS client built
 * for that user. Read as text: the singleton `db` appears once per job, in
 * the account scan, and selects user ids alone; every other query runs on
 * the `tx` that `createRlsClient(buildServiceRoleAuthContext(userId))` hands.
 */

const DIR = import.meta.dirname;
const JOBS = ["todo-reminders.ts", "block-starts.ts"] as const;
const text = (name: string) => readFileSync(join(DIR, name), "utf8");

describe("the push jobs read through RLS (C-USE-105-5)", () => {
  it.each(JOBS)("%s uses the singleton db only to list accounts", (name) => {
    const source = text(name);
    const uses = [...source.matchAll(/\bdb\b\s*\./g)];
    expect(uses).toHaveLength(1);
    expect(source).toMatch(
      /await db\s*\.selectDistinct\(\{ userId: \w+\.userId \}\)/,
    );
  });

  it.each(JOBS)("%s reads each account under its own RLS client", (name) => {
    const source = text(name);
    expect(source).toMatch(
      /createRlsClient\(buildServiceRoleAuthContext\(userId\)\)/,
    );
    expect(source).toMatch(/rls\.execute\(async \(tx\) =>/);
    // Every select but the account scan is the transaction's.
    const selects = [
      ...source.matchAll(/(\w+)\s*\.select(?:Distinct)?\(/g),
    ].map((m) => m[1]);
    expect(selects.filter((who) => who !== "tx")).toEqual(["db"]);
  });

  it.each(JOBS)(
    "%s claims and sends through the account's RLS client",
    (name) => {
      expect(text(name)).toMatch(/rlsPushDeps\(rls, userId, now\)/);
    },
  );
});
