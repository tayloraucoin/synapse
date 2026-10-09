/**
 * Fails a branch that weakens its tests without saying so (E-37, ruling (h);
 * A13.2, Touchstone's spec).
 *
 *   yarn check-test-weakening      fixtures first, then the branch against main
 *
 * Compared with the merge-base on main, working tree included:
 *   - a test file (*.test.ts, *.test.tsx, *.spec.ts, *.spec.tsx) or a fixture
 *     JSON (tooling/ ... /fixtures/ ... .json) deleted;
 *   - fewer test( or it( calls, or fewer assert. or expect( calls, in a file;
 *   - more .skip(, .only( or .todo( in a file;
 *   - in a fixture JSON, fewer cases (objects with an "expect"), or a case
 *     flipped from deny to allow or from fail to pass.
 * A finding is allowed only when the branch says so: a non-empty "Test
 * changes" section in an as-built.md it changes, or a `Test-changes:` trailer
 * on one of its commits (toolkit work has no ticket).
 */

import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

import { REPO_ROOT } from "./lib/docs.ts";
import { getBaseRef, readOnRef, runGit } from "./lib/git.ts";
import { isEmptySection, parseAsBuilt } from "./lib/specs.ts";

const FIXTURES = "tooling/fixtures/test-weakening";
const TEST_FILE = /\.(test|spec)\.tsx?$/;
const FIXTURE_JSON = /^tooling\/(.+\/)?fixtures\/.+\.json$/;

const count = (text: string, pattern: RegExp) =>
  (text.match(pattern) ?? []).length;

type Case = { key: string; expect: string };
function casesOf(value: unknown, at = "$", out: Case[] = []): Case[] {
  if (Array.isArray(value))
    value.forEach((item, i) => casesOf(item, `${at}[${i}]`, out));
  else if (value && typeof value === "object") {
    const object = value as Record<string, unknown>;
    if (typeof object.expect === "string")
      out.push({
        key: typeof object.name === "string" ? object.name : at,
        expect: object.expect,
      });
    for (const [key, item] of Object.entries(object))
      if (key !== "expect") casesOf(item, `${at}.${key}`, out);
  }
  return out;
}

/** What weakens a file between two versions; `after` null means deleted. */
function findWeakening(
  file: string,
  before: string,
  after: string | null,
): string[] {
  if (after === null) return [`${file} was deleted`];
  const found: string[] = [];
  if (TEST_FILE.test(file)) {
    const pairs: [string, RegExp, "fewer" | "more"][] = [
      ["test( and it( calls", /\b(test|it)\s*\(/g, "fewer"],
      ["assert. and expect( calls", /\b(assert\.|expect\s*\()/g, "fewer"],
      [".skip(, .only( and .todo( calls", /\.(skip|only|todo)\s*\(/g, "more"],
    ];
    for (const [what, pattern, direction] of pairs) {
      const a = count(before, pattern);
      const b = count(after, pattern);
      if (direction === "fewer" ? b < a : b > a)
        found.push(`${file}: ${what} went from ${a} to ${b}`);
    }
  } else {
    let a: Case[];
    let b: Case[];
    try {
      a = casesOf(JSON.parse(before));
      b = casesOf(JSON.parse(after));
    } catch {
      return [`${file} is not valid JSON on one side`];
    }
    if (b.length < a.length)
      found.push(`${file}: cases went from ${a.length} to ${b.length}`);
    const loose = new Map([
      ["deny", "allow"],
      ["fail", "pass"],
    ]);
    const now = new Map(b.map((c) => [c.key, c.expect]));
    for (const c of a)
      if (loose.get(c.expect) === now.get(c.key))
        found.push(
          `${file}: "${c.key}" flipped from ${c.expect} to ${now.get(c.key)}`,
        );
  }
  return found;
}

function selfTest(): string[] {
  const failures: string[] = [];
  const dir = path.join(REPO_ROOT, FIXTURES);
  const names = readdirSync(dir).filter((n) => n.endsWith(".json"));
  for (const name of names) {
    const fixture = JSON.parse(readFileSync(path.join(dir, name), "utf8")) as {
      path: string;
      before: string;
      after: string | null;
      expect: "weakened" | "clean";
      message?: string;
    };
    const found = findWeakening(fixture.path, fixture.before, fixture.after);
    if (found.length > 0 !== (fixture.expect === "weakened"))
      failures.push(
        `${name}: expected ${fixture.expect}, got ${found.length ? found.join("; ") : "clean"}`,
      );
    else if (
      fixture.message &&
      !found.some((f) => f.includes(fixture.message!))
    )
      failures.push(
        `${name}: no finding mentions "${fixture.message}": ${found.join("; ")}`,
      );
  }
  if (names.length === 0) failures.push(`no fixtures in ${FIXTURES}`);
  return failures.length ? failures : [String(names.length)];
}

const proof = selfTest();
if (proof.length > 1 || !/^\d+$/.test(proof[0]!)) {
  console.error(
    `check-test-weakening — fixtures misbehaved:\n  ${proof.join("\n  ")}`,
  );
  process.exit(1);
}

const base = getBaseRef();
const fork = base ? runGit(["merge-base", base, "HEAD"]) : null;
if (!fork) {
  console.log(
    `check-test-weakening — ${proof[0]} fixtures behaved; no main branch to compare with, skipped.`,
  );
  process.exit(0);
}
const changes = (
  runGit(["diff", "--name-status", "--no-renames", fork, "--"]) ?? ""
)
  .split("\n")
  .filter(Boolean)
  .map((line) => {
    const [status, file] = line.split("\t");
    return { status: status!, file: file! };
  });

const findings: string[] = [];
for (const { status, file } of changes) {
  if (!TEST_FILE.test(file) && !FIXTURE_JSON.test(file)) continue;
  if (status === "A") continue;
  const before = readOnRef(fork, file);
  if (before === null) continue;
  const after =
    status === "D" ? null : readFileSync(path.join(REPO_ROOT, file), "utf8");
  findings.push(...findWeakening(file, before, after));
}

if (findings.length > 0) {
  const declared =
    changes.some(
      ({ status, file }) =>
        status !== "D" &&
        file.endsWith("/as-built.md") &&
        !isEmptySection(
          parseAsBuilt(
            readFileSync(path.join(REPO_ROOT, file), "utf8"),
          ).sections.get("Test changes"),
        ),
    ) ||
    /^Test-changes: \S/m.test(
      runGit(["log", "--format=%B", `${fork}..HEAD`]) ?? "",
    );
  if (!declared) {
    console.error(
      `check-test-weakening — ${findings.length} weakening(s) against ${base}:\n  ${findings.join("\n  ")}\n` +
        'Say why: a "Test changes" line in the ticket\'s as-built.md, or a "Test-changes: <why>" trailer on the commit.',
    );
    process.exit(1);
  }
  console.log(
    `check-test-weakening — ${findings.length} weakening(s), each declared:\n  ${findings.join("\n  ")}`,
  );
  process.exit(0);
}
console.log(
  `check-test-weakening — ${proof[0]} fixtures behaved; no weakening against ${base}.`,
);
