import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

/**
 * USE-7's C6, in USE-90's form (C5), read as text: the seam never reaches the
 * database or the API's code; `lib/data` reaches tRPC only through
 * `lib/trpc` (and the API's types), `lib/fixtures` not at all; and only the
 * seam and the dev pages reach the fixtures, so wave 3 swaps servers and no
 * surface changes.
 */

const WEB = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (
      entry.name.startsWith(".") ||
      ["node_modules", "_legacy"].includes(entry.name)
    )
      return [];
    if (entry.isDirectory()) return sourceFiles(full);
    return /\.(ts|tsx|mts)$/.test(entry.name) ? [full] : [];
  });
}

/** Every module specifier a file imports, exports from, or loads. */
function specifiers(file: string): string[] {
  return imports(file).map((found) => found.spec);
}

/**
 * Each import with whether it is type-only (`import type`, `export type`):
 * a type import loads nothing at run time.
 */
function imports(file: string): { spec: string; typeOnly: boolean }[] {
  const text = readFileSync(file, "utf8");
  const found: { spec: string; typeOnly: boolean }[] = [];
  for (const match of text.matchAll(
    /(?:\b(import|export)(\s+type)?\b[^;"']*?\bfrom\s+|\bimport\s*\(\s*|\bimport\s+)["']([^"']+)["']/g,
  )) {
    found.push({ spec: match[3]!, typeOnly: match[2] !== undefined });
  }
  return found;
}

const rel = (file: string) =>
  path.relative(WEB, file).split(path.sep).join("/");

describe("C5: the seam's imports", () => {
  const data = sourceFiles(path.join(WEB, "lib/data"));
  const fixtures = sourceFiles(path.join(WEB, "lib/fixtures"));
  const seam = [...data, ...fixtures];

  it("finds the seam's files", () => {
    expect(data.length).toBeGreaterThan(5);
    expect(fixtures.length).toBeGreaterThan(5);
    expect(data.map(rel)).toContain("lib/data/live/server.ts");
  });

  it("never imports the database or the API's code", () => {
    const hits = seam.flatMap((file) =>
      imports(file)
        .filter(
          ({ spec, typeOnly }) =>
            /^@syn\/db(\/|$)/.test(spec) ||
            (/^@syn\/api(\/|$)/.test(spec) && !typeOnly),
        )
        .map(({ spec }) => `${rel(file)} → ${spec}`),
    );
    expect(hits).toEqual([]);
  });

  it("reaches tRPC only through lib/trpc, and only from lib/data", () => {
    const viaTrpc = (spec: string) => /^@\/lib\/trpc(\/|$)/.test(spec);
    const trpc = (spec: string) =>
      /^@trpc\//.test(spec) ||
      (/(^|\/)trpc(\/|$)/.test(spec) && !viaTrpc(spec));
    const hits = [
      ...data.flatMap((file) =>
        specifiers(file)
          .filter(trpc)
          .map((spec) => `${rel(file)} → ${spec}`),
      ),
      ...fixtures.flatMap((file) =>
        specifiers(file)
          .filter((spec) => trpc(spec) || viaTrpc(spec))
          .map((spec) => `${rel(file)} → ${spec}`),
      ),
    ];
    expect(hits).toEqual([]);
  });

  it("is the only way into the fixtures, with the dev pages", () => {
    const allowed = (file: string) =>
      /^lib\/(data|fixtures)\//.test(rel(file)) ||
      rel(file).startsWith("app/(dev)/");
    const reachesFixtures = (file: string, spec: string) =>
      spec.startsWith("@/lib/fixtures") ||
      (spec.startsWith(".") &&
        rel(path.resolve(path.dirname(file), spec)).startsWith("lib/fixtures"));
    const hits = sourceFiles(WEB)
      .filter((file) => !allowed(file))
      .flatMap((file) =>
        specifiers(file)
          .filter((spec) => reachesFixtures(file, spec))
          .map((spec) => `${rel(file)} → ${spec}`),
      );
    expect(hits).toEqual([]);
  });
});

/**
 * USE-108's C2: no fixture module in a production build. Outside
 * `lib/fixtures`, a module loads a fixture only through one of the two
 * entries, and `next.config.ts` resolves both to their stubs in
 * `lib/no-fixtures/` in a production build; the stubs name the fixtures
 * only as types. A new run-time import of a fixture anywhere else fails here.
 */
describe("C2: the fixtures stay out of a production build", () => {
  const ENTRIES = ["@/lib/fixtures/entry", "@/lib/fixtures/parts"];

  /** Each import's specifier and whether it loads anything at run time. */
  function loads(file: string): { spec: string; runtime: boolean }[] {
    const text = readFileSync(file, "utf8");
    const found: { spec: string; runtime: boolean }[] = [];
    for (const match of text.matchAll(
      /\b(import|export)(\s+type\b)?\s*([^;"']*?)\s*from\s+["']([^"']+)["']/g,
    )) {
      const clause = match[3]!.replace(/[{}]/g, "").trim();
      const names = clause
        .split(",")
        .map((name) => name.trim())
        .filter(Boolean);
      const typeOnly =
        match[2] !== undefined ||
        (names.length > 0 && names.every((name) => name.startsWith("type ")));
      found.push({ spec: match[4]!, runtime: !typeOnly });
    }
    for (const match of text.matchAll(
      /\bimport\s*\(\s*["']([^"']+)["']|^import\s+["']([^"']+)["']/gm,
    )) {
      found.push({ spec: (match[1] ?? match[2])!, runtime: true });
    }
    return found;
  }

  const fixturePath = (file: string, spec: string) =>
    spec.startsWith("@/lib/fixtures")
      ? spec
      : spec.startsWith(".") &&
          rel(path.resolve(path.dirname(file), spec)).startsWith("lib/fixtures")
        ? `@/${rel(path.resolve(path.dirname(file), spec))}`
        : null;

  const shipped = sourceFiles(WEB).filter(
    (file) =>
      !rel(file).startsWith("lib/fixtures/") &&
      !/\.(test|stories)\.tsx?$/.test(file),
  );

  it("loads a fixture only through the two entries", () => {
    const hits = shipped.flatMap((file) =>
      loads(file)
        .filter(({ runtime }) => runtime)
        .map(({ spec }) => fixturePath(file, spec))
        .filter((spec): spec is string => spec !== null)
        .filter((spec) => !ENTRIES.includes(spec))
        .map((spec) => `${rel(file)} → ${spec}`),
    );
    expect(hits).toEqual([]);
  });

  it("resolves each entry to its stub in a production build", () => {
    const config = readFileSync(path.join(WEB, "next.config.ts"), "utf8");
    expect(config).toMatch(
      /env\.NODE_ENV === "production" \? \{ \.\.\.FIXTURE_ENTRIES \} : \{\}/,
    );
    expect(config).toMatch(/resolveAlias: fixtureAliases/);
    for (const entry of ENTRIES) {
      const stub = config.match(
        new RegExp(`"${entry}": "\\./(lib/no-fixtures/[\\w-]+\\.ts)"`),
      )?.[1];
      expect(stub, entry).toBeDefined();
      const loaded = loads(path.join(WEB, stub!)).filter(
        ({ spec, runtime }) => runtime && fixturePath(WEB, spec) !== null,
      );
      expect(loaded, stub).toEqual([]);
    }
  });
});
