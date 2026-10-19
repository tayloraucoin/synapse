import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * USE-91 C4: no service under services/planner imports the singleton `db`
 * (or reaches the pool with `getDb`), and every read that queries runs inside
 * `rls.execute`. Read as text, so a new file is held to it unasked.
 */

const DIR = import.meta.dirname;
const sources = readdirSync(DIR)
  .filter((name) => name.endsWith(".ts") && !name.endsWith(".test.ts"))
  .map((name) => ({ name, text: readFileSync(join(DIR, name), "utf8") }));

/** Every name a file imports from `@syn/db`, type-only imports included. */
function dbImports(text: string): string[] {
  const names: string[] = [];
  const pattern = /import\s+(?:type\s+)?\{([^}]*)\}\s+from\s+"@syn\/db"/g;
  for (const match of text.matchAll(pattern)) {
    for (const part of (match[1] ?? "").split(",")) {
      const name = part
        .trim()
        .replace(/^type\s+/, "")
        .split(/\s+as\s+/)[0];
      if (name) names.push(name);
    }
  }
  return names;
}

describe("the planner services read through RLS (C-USE-91-4)", () => {
  it("finds the read services", () => {
    expect(sources.map((s) => s.name)).toEqual(
      expect.arrayContaining(["read-day.ts", "read-week.ts", "select-rows.ts"]),
    );
  });

  it.each(sources.map((s) => [s.name, s.text] as const))(
    "%s never imports the singleton db",
    (_name, text) => {
      const names = dbImports(text);
      expect(names).not.toContain("db");
      expect(names).not.toContain("getDb");
      expect(text).not.toMatch(/from\s+"@syn\/db\/client"/);
      expect(text).not.toMatch(/import\s+\*\s+as\s+\w+\s+from\s+"@syn\/db"/);
    },
  );

  it("queries only through the transaction rls.execute hands it", () => {
    const text = (name: string) => sources.find((s) => s.name === name)!.text;
    expect(text("select-rows.ts")).toMatch(/selectPlannerRows\(\s*tx: Tx,/);
    for (const name of ["read-day.ts", "read-week.ts"]) {
      expect(text(name)).toMatch(
        /rls\.execute\(\(tx\) =>\s*selectPlannerRows\(tx,/,
      );
    }
  });
});
