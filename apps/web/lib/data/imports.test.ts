import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

/**
 * C6, read as text: the seam's two folders never reach the database, the
 * API or the tRPC client, and only the seam and the dev pages reach the
 * fixtures, so wave 3 swaps hook bodies and no surface changes.
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
  const text = readFileSync(file, "utf8");
  const found: string[] = [];
  for (const match of text.matchAll(
    /(?:\bfrom\s+|\bimport\s*\(\s*|\bimport\s+)["']([^"']+)["']/g,
  )) {
    found.push(match[1]!);
  }
  return found;
}

const rel = (file: string) =>
  path.relative(WEB, file).split(path.sep).join("/");

describe("C6: the seam's imports", () => {
  const seam = [
    ...sourceFiles(path.join(WEB, "lib/data")),
    ...sourceFiles(path.join(WEB, "lib/fixtures")),
  ];

  it("finds the seam's files", () => {
    expect(seam.length).toBeGreaterThan(5);
  });

  it("never imports the database, the API or the tRPC client", () => {
    const banned = /^(@syn\/db|@syn\/api|@trpc\/|@\/lib\/trpc)(\/|$)/;
    const hits = seam.flatMap((file) =>
      specifiers(file)
        .filter((spec) => banned.test(spec) || /(^|\/)trpc(\/|$)/.test(spec))
        .map((spec) => `${rel(file)} → ${spec}`),
    );
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
