/**
 * The contract-loop harness's scratch repo (A13.2; Touchstone's spec, Vigil's
 * ten fixtures), shared by tooling/contract-*.test.ts.
 * Builds a scratch repo in $TMPDIR with real git and a copy of tooling/, and
 * runs the loop's scripts as subprocesses: no mocks, because git and the
 * filesystem are the infrastructure this repo owns.
 *
 *   yarn test:tooling      runs the contract-*.test.ts files in parallel
 *
 * Every repo, file and verdict here is synthetic. A fixture script stands in
 * for Claude as the reviewer; the results it produces count only while
 * PEM_SPECS_FIXTURE=1, which nothing outside this file sets.
 */

import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { after, before } from "node:test";
import { fileURLToPath } from "node:url";

const REPO = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);
const scratch = mkdtempSync(
  path.join(process.env.TMPDIR ?? tmpdir(), "pem-loop-"),
);
const template = path.join(scratch, "template");
let counter = 0;

export type Run = { status: number; out: string };

export function exec(
  cwd: string,
  cmd: string,
  args: string[],
  env: Record<string, string> = {},
): Run {
  const result = spawnSync(cmd, args, {
    cwd,
    encoding: "utf8",
    env: { ...process.env, ...env, INIT_CWD: cwd, CLAUDE_PROJECT_DIR: "" },
  });
  return {
    status: result.status ?? 1,
    out: `${result.stdout}${result.stderr}`,
  };
}
export const git = (cwd: string, ...args: string[]) =>
  execFileSync("git", args, {
    cwd,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  }).trim();
export const tool = (
  cwd: string,
  script: string,
  args: string[],
  env: Record<string, string> = {},
) =>
  exec(cwd, process.execPath, [path.join(cwd, "tooling", script), ...args], {
    PEM_SPECS_FIXTURE: "1",
    ...env,
  });
export const write = (cwd: string, rel: string, text: string) => {
  mkdirSync(path.dirname(path.join(cwd, rel)), { recursive: true });
  writeFileSync(path.join(cwd, rel), text);
};
export const read = (cwd: string, rel: string) =>
  readFileSync(path.join(cwd, rel), "utf8");
export const commit = (cwd: string, message: string) => {
  git(cwd, "add", "-A");
  git(cwd, "commit", "-q", "--no-verify", "-m", message);
};
export const checkSpecs = (cwd: string) =>
  tool(cwd, "check-specs.ts", ["--skip-fixtures", "--strict"]);

/** The work branch a fresh repo is on: the operator's, as tickets never make one (PR-14). */
export const WORK_BRANCH = "work";

/** A fresh copy of the template repo, on the operator's work branch off main. */
export function freshRepo(): string {
  const dir = path.join(scratch, `repo-${++counter}`);
  cpSync(template, dir, { recursive: true, verbatimSymlinks: true });
  git(dir, "switch", "-q", "-c", WORK_BRANCH);
  return dir;
}

const REVIEW_RUNNER = `
import { readFileSync } from "node:fs";
const prompt = readFileSync(0, "utf8");
const verdict = process.env.PEM_FIXTURE_VERDICT ?? "PASS";
const ids = [...prompt.matchAll(/^- ([A-Z][A-Z0-9]{1,4}-\\d+): /gm)].map((m) => m[1]);
const lines = ids.map((id) => id + ": " + verdict + " (synthetic)");
// The usage shape is the headless result's (synthetic numbers).
const usage = { input_tokens: 1200, cache_read_input_tokens: 3400, cache_creation_input_tokens: 500, output_tokens: 260 };
console.log(JSON.stringify({ result: [...lines, "No findings (synthetic).", "VERDICT: " + verdict].join("\\n"), model: "fixture-model", usage, modelUsage: { "fixture-model": { inputTokens: 1200, cacheReadInputTokens: 3400, cacheCreationInputTokens: 500, outputTokens: 260 } } }));
`;

/** Registers the scratch repo's setup and teardown in the calling test file. */
export function useScratchRepo() {
  before(() => {
    mkdirSync(template);
    cpSync(path.join(REPO, "tooling"), path.join(template, "tooling"), {
      recursive: true,
      filter: (src) =>
        !src.includes(`${path.sep}fixtures${path.sep}`) &&
        !src.endsWith(`${path.sep}fixtures`),
    });
    for (const rel of [
      "docs/engineering/templates/contract.template.md",
      "docs/engineering/templates/as-built.template.md",
      "docs/engineering/schemas/results.schema.json",
      "docs/engineering/schemas/contract.schema.json",
      "docs/product/brief.template.md",
      "docs/roles/engineering/vigil-qa.md",
      "docs/roles/engineering/warden-security-privacy-engineer.md",
      "docs/roles/engineering/mason-cto-principal-dev.md",
    ])
      cpSync(path.join(REPO, rel), path.join(template, rel));
    const toolkit = JSON.parse(read(REPO, "toolkit.json"));
    write(template, "toolkit.json", JSON.stringify(toolkit, null, 2));
    for (const app of Object.values(toolkit.apps) as { path: string }[])
      write(template, `${app.path}/.gitkeep`, "");
    // A stack entry's runbook must exist for toolkit.json to validate (D-STK-13).
    for (const module of Object.values(toolkit.stack ?? {}) as {
      runbook: string | null;
    }[])
      if (module.runbook) write(template, module.runbook, "");
    write(
      template,
      "package.json",
      JSON.stringify({
        name: "loop-scratch",
        private: true,
        packageManager: "yarn@4.13.0",
        scripts: {
          "test:sample": "node --test sample.test.ts",
          "test:none":
            "node --test --test-name-pattern NOTHING-MATCHES sample.test.ts",
          "check:ok": "node -e 0",
          "check:fail": "node -e process.exit(1)",
          "check:specs": "node tooling/check-specs.ts --skip-fixtures",
        },
      }),
    );
    write(
      template,
      ".yarnrc.yml",
      "nodeLinker: node-modules\nenableTelemetry: false\n",
    );
    write(template, "yarn.lock", "");
    write(template, ".gitignore", "node_modules/\n.yarn/\n");
    write(
      template,
      "sample.test.ts",
      'import { test } from "node:test";\nimport assert from "node:assert/strict";\ntest("C1 the filter keeps matching rows", () => {\n  assert.equal([1, 2].filter((n) => n > 1).length, 1);\n});\n',
    );
    write(template, "review-runner.ts", REVIEW_RUNNER);
    exec(template, "yarn", ["install"]);
    symlinkSync(
      path.join(REPO, "node_modules/yaml"),
      path.join(template, "node_modules/yaml"),
    );
    git(template, "init", "-q", "-b", "main");
    git(template, "config", "user.email", "fixture@example.invalid");
    git(template, "config", "user.name", "Fixture");
    git(template, "config", "commit.gpgsign", "false");
    commit(template, "PEM: scratch repo");
  });

  after(() => rmSync(scratch, { recursive: true, force: true }));
}

/** A filled one-off contract, as a builder writes it before the second init. */
export function oneOffContract(
  id: string,
  extra: {
    cites?: string[];
    truth?: string | string[];
    planned?: string[];
    criteria?: string;
    depends?: string[];
    qa?: "Q0" | "Q1" | "Q2" | "Q3";
    reviewers?: string[];
    focus?: string[];
    operatorReview?: boolean;
  } = {},
) {
  return [
    "---",
    `id: ${id}`,
    "size: small",
    "objective: Filter the records by status.",
    "slice_type: Logic on an existing list; the risk is dropping rows.",
    "non_negotiables:",
    "  - No row is lost.",
    "devs_call: The function's name.",
    `cites: ${JSON.stringify(extra.cites ?? [])}`,
    `truth_files: ${JSON.stringify(extra.truth ?? "none: no living UX file in the scratch repo")}`,
    `reviewers: ${JSON.stringify(extra.reviewers ?? [])}`,
    ...(extra.qa === undefined ? [] : [`qa: ${extra.qa}`]),
    ...(extra.focus === undefined
      ? []
      : [`focus: ${JSON.stringify(extra.focus)}`]),
    ...(extra.operatorReview ? ["operator_review: true"] : []),
    `planned_paths: ${JSON.stringify(extra.planned ?? ["src/filter.ts"])}`,
    `depends_on: ${JSON.stringify(extra.depends ?? [])}`,
    "out_of_scope:",
    "  - Saved filters.",
    "criteria:",
    extra.criteria ??
      [
        "  - id: C1",
        "    statement: The filter keeps matching rows.",
        "    evidence: test",
        "    command: yarn test:sample",
        "  - id: C2",
        "    statement: The build step passes.",
        "    evidence: check",
        "    command: yarn check:ok",
      ].join("\n"),
    "---",
    "",
    `# Contract — ${id} filter`,
    "",
  ].join("\n");
}

export const AS_BUILT = (id: string, notVerified = "none") =>
  [
    `# As-built — ${id}`,
    "",
    "## Shipped against the contract",
    "",
    "C1, C2: the filter (synthetic).",
    "",
    "## Deviations",
    "",
    "none",
    "",
    "## Ledger IDs",
    "",
    "none",
    "",
    "## Migrations",
    "",
    "applied: n/a",
    "",
    "## Test changes",
    "",
    "none",
    "",
    "## Not verified",
    "",
    notVerified,
    "",
    "## Model",
    "",
    "fixture-model",
    "",
    "## Next",
    "",
    "Nothing.",
    "",
  ].join("\n");

/** Starts WEB-1 and returns the repo, still on the work branch. */
export function startOneOff(
  extra?: Parameters<typeof oneOffContract>[1],
): string {
  const repo = freshRepo();
  let r = tool(repo, "contract.ts", ["init", "web", "filter"]);
  assert.equal(r.status, 0, r.out);
  const rel = "specs/web/one-offs/WEB-001-filter/contract.md";
  assert.match(read(repo, rel), /\[FILL/);
  write(repo, rel, oneOffContract("WEB-1", extra));
  r = tool(repo, "contract.ts", ["init", "web", "filter"]);
  assert.equal(r.status, 0, r.out);
  assert.equal(git(repo, "rev-parse", "--abbrev-ref", "HEAD"), WORK_BRANCH);
  return repo;
}

export function buildAndProve(repo: string) {
  write(repo, "src/filter.ts", "export const keep = (n: number) => n > 1;\n");
  commit(repo, "WEB-1: filter");
  const r = tool(repo, "contract.ts", ["run", "WEB-1"]);
  assert.equal(r.status, 0, r.out);
}

/** What a single-app repo starts with; each case changes what it tests. */
export type SingleAppOptions = {
  /** Write a specs root (`specs/_status.md`); the default has none. */
  specsRoot?: boolean;
  /** Write a turbo.json defining these tasks; the default has no turbo.json. */
  turboTasks?: string[];
  /** Extra root package.json scripts, merged over the default ones. */
  scripts?: Record<string, string>;
};

/**
 * A fresh repo shaped as an overlay target (MIG T3): one app at the root, no
 * `workspaces`, no `turbo.json`, `toolkit.json` at tier `overlay` with
 * `apps.web.path` ".", a `prettier --write` format script with no Prettier
 * installed, no CI and, by default, no specs root. The spine is this repo's
 * own three files, so the budget reads real caps. The setup is committed on
 * main and the work branch restarts there, so a case's edits are the
 * branch's only changes. Needs `useScratchRepo()` in the calling file.
 */
export function singleAppRepo(options: SingleAppOptions = {}): string {
  const repo = freshRepo();
  git(repo, "switch", "-q", "main");
  for (const rel of ["sample.test.ts", "review-runner.ts", "docs"])
    rmSync(path.join(repo, rel), { recursive: true, force: true });
  for (const rel of ["AGENTS.md", "CLAUDE.md", "docs/index.md"])
    write(repo, rel, read(REPO, rel));
  const toolkit = JSON.parse(read(repo, "toolkit.json"));
  for (const app of Object.values(toolkit.apps) as { path: string }[])
    rmSync(path.join(repo, app.path), { recursive: true, force: true });
  write(
    repo,
    "toolkit.json",
    JSON.stringify(
      {
        ...toolkit,
        tier: "overlay",
        apps: { web: { path: ".", prefix: "WEB", designLayer: null } },
        migrationsDir: null,
        reviewers: [],
        stack: {},
      },
      null,
      2,
    ),
  );
  write(
    repo,
    "package.json",
    JSON.stringify(
      {
        // The template's name: Yarn's install state is keyed on it.
        name: "loop-scratch",
        private: true,
        packageManager: "yarn@4.13.0",
        scripts: {
          format: "prettier --write .",
          // The scratch install has no devDependencies: tsc comes through the symlink below.
          "check-types": "node node_modules/typescript/bin/tsc -p .",
          "verify:fast": "node tooling/verify-fast.ts",
          budget: "node tooling/budget.ts",
          ...options.scripts,
        },
      },
      null,
      2,
    ),
  );
  symlinkSync(
    path.join(REPO, "node_modules/typescript"),
    path.join(repo, "node_modules/typescript"),
  );
  write(
    repo,
    "tsconfig.json",
    JSON.stringify({
      compilerOptions: { strict: true, noEmit: true, target: "es2022" },
      include: ["src"],
    }),
  );
  write(
    repo,
    "src/sum.ts",
    "export const sum = (a: number, b: number): number => a + b;\n",
  );
  if (options.specsRoot) write(repo, "specs/_status.md", "# Status\n");
  if (options.turboTasks)
    write(
      repo,
      "turbo.json",
      JSON.stringify({
        tasks: Object.fromEntries(options.turboTasks.map((t) => [t, {}])),
      }),
    );
  commit(repo, "PEM: single-app overlay repo");
  git(repo, "switch", "-q", "-C", WORK_BRANCH);
  return repo;
}
