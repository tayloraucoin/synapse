/**
 * The checks signals, C1 to C5 (assess.md's table; all inform layer 2).
 *
 * C1 one verify command: a root `verify` script 0, a CI file that chains two
 *    or more kinds of check 1, neither 2.
 * C2 CI config: present 0, absent 2.
 * C3 tests: a runner and test files 0, one of the two 1, neither 2.
 * C4 type-check and lint scripts in the root: both 0, one 1, none 2.
 * C5 read-only format check: a `--check` format script 0, write-only 1, none 2.
 */

import { listPackages, type PackageJson, type Repo } from "./repo.ts";
import type { Measure, Signal } from "./signal.ts";

const rootScripts = (repo: Repo): Record<string, string> =>
  repo.json<PackageJson>("package.json")?.scripts ?? {};

const CI_FILE =
  /^(\.github\/workflows\/[^/]+\.ya?ml|\.gitlab-ci\.ya?ml|\.circleci\/config\.ya?ml|azure-pipelines\.ya?ml|bitbucket-pipelines\.ya?ml|\.buildkite\/[^/]+\.ya?ml|\.travis\.ya?ml|Jenkinsfile)$/;

export const listCiFiles = (repo: Repo) =>
  repo.files.filter((rel) => CI_FILE.test(rel));

/** The kinds of check a command line runs, by the words it uses. */
const CHECK_KINDS: [kind: string, pattern: RegExp][] = [
  ["lint", /\b(?:lint\b|eslint\b|biome (?:lint|check)\b)/],
  ["types", /\b(?:check-types|typecheck|type-check|tsc)\b/],
  ["test", /\b(?:test|vitest|jest|playwright test)\b/],
  ["build", /\bbuild\b/],
  ["format", /\b(?:format:check|prettier\b[^\n]*--check)/],
];

/** The kinds of check the run lines of a CI file chain, in table order. */
export function readCiChecks(text: string): string[] {
  const commands = text
    .split("\n")
    .filter((line) => !/^\s*(?:#|name:)/.test(line))
    .filter((line) =>
      /\b(?:yarn|npm|pnpm|npx|bun|node|tsc|eslint|prettier|vitest|jest|turbo)\b/.test(
        line,
      ),
    )
    .join("\n");
  return CHECK_KINDS.filter(([, re]) => re.test(commands)).map(([k]) => k);
}

export const C1: Signal = {
  id: "C1",
  group: "checks",
  layer: 2,
  title: "One verify command",
  measure(repo): Measure {
    const verify = rootScripts(repo).verify;
    if (verify)
      return {
        value: "script",
        score: 0,
        evidence: `a root verify script: ${clip(verify)}`,
      };
    for (const rel of listCiFiles(repo)) {
      const kinds = readCiChecks(repo.read(rel) ?? "");
      if (kinds.length >= 2)
        return {
          value: "ci",
          score: 1,
          evidence: `no verify script; ${rel} chains ${kinds.join(", ")}`,
        };
    }
    return {
      value: "none",
      score: 2,
      evidence: "no verify script, and no CI file chains two kinds of check",
    };
  },
};

export const C2: Signal = {
  id: "C2",
  group: "checks",
  layer: 2,
  title: "CI config",
  measure(repo): Measure {
    const files = listCiFiles(repo);
    return files.length
      ? { value: files, score: 0, evidence: files.join(", ") }
      : { value: [], score: 2, evidence: "no CI file is tracked" };
  },
};

const RUNNER_DEPS = [
  "vitest",
  "jest",
  "mocha",
  "ava",
  "uvu",
  "tap",
  "@playwright/test",
  "cypress",
];
const RUNNER_SCRIPT =
  /\b(?:vitest|jest|mocha|ava|uvu|playwright test|cypress run|node (?:[^\n]*\s)?--test)\b/;
const TEST_FILE =
  /(?:\.(?:test|spec|cy)\.[cm]?[jt]sx?$|(?:^|\/)(?:__tests__|tests?)\/[^/]+\.[cm]?[jt]sx?$)/;

export const C3: Signal = {
  id: "C3",
  group: "checks",
  layer: 2,
  title: "Tests",
  measure(repo): Measure {
    const runners = new Set<string>();
    for (const { rel, pkg } of listPackages(repo)) {
      const deps = { ...pkg.devDependencies, ...pkg.dependencies };
      for (const dep of RUNNER_DEPS)
        if (deps[dep]) runners.add(`${dep} in ${rel}`);
      for (const [name, cmd] of Object.entries(pkg.scripts ?? {}))
        if (RUNNER_SCRIPT.test(cmd)) runners.add(`script ${name} in ${rel}`);
    }
    const tests = repo.files.filter((rel) => TEST_FILE.test(rel));
    const runner = [...runners];
    const score =
      runner.length && tests.length ? 0 : runner.length || tests.length ? 1 : 2;
    const parts = [
      runner.length
        ? `runner: ${runner.slice(0, 3).join(", ")}${more(runner, 3)}`
        : "no test runner",
      tests.length ? `${tests.length} test files` : "no test files",
    ];
    return {
      value: { runners: runner, testFiles: tests.length },
      score,
      evidence: parts.join("; "),
    };
  },
};

const TYPES_SCRIPT = /^(?:check-types|typecheck|type-check|types|tsc)$/;
// A hyphen is a word boundary, so `tsc-alias` and `lint-staged` are fenced off.
const TYPES_COMMAND = /\b(?:tsc|check-types|typecheck|type-check)\b(?!-)/;
const LINT_SCRIPT = /^lint$/;
const LINT_COMMAND = /\b(?:eslint|biome (?:lint|check)|oxlint|lint)\b(?!-)/;

export const C4: Signal = {
  id: "C4",
  group: "checks",
  layer: 2,
  title: "Type check and lint scripts",
  measure(repo): Measure {
    const scripts = Object.entries(rootScripts(repo));
    const find = (name: RegExp, cmd: RegExp) =>
      scripts.find(([n]) => name.test(n))?.[0] ??
      scripts.find(
        ([n, c]) => !/^(?:dev|build|start)/.test(n) && cmd.test(c),
      )?.[0];
    const types = find(TYPES_SCRIPT, TYPES_COMMAND);
    const lint = find(LINT_SCRIPT, LINT_COMMAND);
    const score = types && lint ? 0 : types || lint ? 1 : 2;
    return {
      value: { types: types ?? null, lint: lint ?? null },
      score,
      evidence: [
        types ? `type check: ${types}` : "no type-check script",
        lint ? `lint: ${lint}` : "no lint script",
      ].join("; "),
    };
  },
};

const FORMATTER = /\b(?:prettier|biome (?:format|check)|dprint)\b/;
/** Prettier's -c, -l and their long forms; dprint check; biome format or check without --write. */
const READ_ONLY_FORMAT =
  /(?:\s(?:--check|-c|--list-different|-l)\b|\bdprint check\b|\bbiome (?:format|check)\b(?![^\n&|;]*--write))/;

export const C5: Signal = {
  id: "C5",
  group: "checks",
  layer: 2,
  title: "Read-only format check",
  measure(repo): Measure {
    // A root that hands formatting to the workspaces (turbo run format:check) counts by name.
    const scripts = Object.entries(rootScripts(repo)).filter(
      ([n, c]) => FORMATTER.test(c) || /^format(?::|$)/.test(n),
    );
    const check = scripts.find(([n, c]) =>
      FORMATTER.test(c) ? READ_ONLY_FORMAT.test(c) : /^format:check$/.test(n),
    );
    if (check)
      return {
        value: "check",
        score: 0,
        evidence: `${check[0]}: ${clip(check[1])}`,
      };
    if (scripts.length)
      return {
        value: "write",
        score: 1,
        evidence: `write-only: ${scripts.map(([n, c]) => `${n}: ${clip(c)}`).join(", ")}`,
      };
    return {
      value: "none",
      score: 2,
      evidence: "no format script in the root",
    };
  },
};

const clip = (s: string, n = 80) =>
  s.length > n ? `${s.slice(0, n - 1)}…` : s;
const more = (list: unknown[], shown: number) =>
  list.length > shown ? ` and ${list.length - shown} more` : "";
