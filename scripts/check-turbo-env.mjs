#!/usr/bin/env node
/**
 * Proves where Turbo hashes env files (MIG-3). Run via `yarn check-turbo-env`.
 *
 * Claude Code's sandbox denies reading `.env` and `.env.*` files (never
 * `.env.example`, which is tracked). Turbo reads every file it hashes, so an
 * env file in `globalDependencies` or in a task's inputs makes that task fail
 * inside the sandbox before it runs. The rule: only `web#build` hashes env
 * files, because Next loads `apps/web/.env*` inside that task and the bundle
 * embeds the `NEXT_PUBLIC_*` values.
 *
 *   yarn check-turbo-env          dry-runs lint and check-types: no env file
 *                                 among the global inputs or any task's inputs
 *   yarn check-turbo-env --build  dry-runs build as well: every apps/web/.env*
 *                                 file that exists is in web#build's inputs
 *                                 and in no other task's, and apps/web/turbo.json
 *                                 declares `.env*` as a build input
 *
 * Only file names are read, never their contents. The `--build` form runs
 * unsandboxed on a machine that holds apps/web/.env.local, since web#build
 * hashes that file on purpose. Exit 1 with one line per problem.
 */
import { spawnSync } from "node:child_process";
import { readdirSync, readFileSync } from "node:fs";
import { basename, resolve } from "node:path";

const repoRoot = resolve(import.meta.dirname, "..");
const withBuild = process.argv.includes("--build");
const tasks = withBuild
  ? ["lint", "check-types", "build"]
  : ["lint", "check-types"];

/** `.env` and `.env.*` are env files; the tracked `.env.example` is not. */
const isEnvFile = (file) => {
  const name = basename(file);
  return (
    name === ".env" || (name.startsWith(".env.") && name !== ".env.example")
  );
};

const dry = spawnSync("yarn", ["turbo", "run", ...tasks, "--dry=json"], {
  cwd: repoRoot,
  encoding: "utf8",
  env: { ...process.env, TURBO_TELEMETRY_DISABLED: "1", DO_NOT_TRACK: "1" },
  maxBuffer: 64 * 1024 * 1024,
});
if (dry.status !== 0) {
  const denied = /Operation not permitted/.test(dry.stderr ?? "");
  console.error(
    `check-turbo-env: turbo run ${tasks.join(" ")} --dry=json exited ${dry.status}${
      denied
        ? "; the sandbox refused a file Turbo hashes (an env file in a task's inputs)" +
          (withBuild
            ? ": web#build hashes apps/web/.env* on purpose, so run the --build form unsandboxed"
            : "")
        : ""
    }`,
  );
  console.error((dry.stderr ?? "").trim());
  process.exit(1);
}

const report = JSON.parse(dry.stdout);
const problems = [];
const globalFiles = Object.keys(report.globalCacheInputs?.files ?? {});
for (const file of globalFiles.filter(isEnvFile))
  problems.push(
    `global inputs hash ${file}; drop env files from globalDependencies (only web#build hashes them)`,
  );

for (const task of report.tasks ?? []) {
  const envInputs = Object.keys(task.inputs ?? {}).filter(isEnvFile);
  if (task.taskId === "web#build") continue;
  for (const file of envInputs)
    problems.push(
      `${task.taskId} hashes ${file}; only web#build names env files in its inputs`,
    );
}

if (withBuild) {
  const build = (report.tasks ?? []).find((t) => t.taskId === "web#build");
  if (!build) problems.push("web#build is missing from the dry run");
  const hashed = new Set(Object.keys(build?.inputs ?? {}));
  const present = readdirSync(resolve(repoRoot, "apps/web")).filter(isEnvFile);
  for (const file of present)
    if (!hashed.has(file))
      problems.push(
        `web#build does not hash apps/web/${file}; an edited env file would hit a stale build cache`,
      );
  let inputs = [];
  try {
    inputs =
      JSON.parse(readFileSync(resolve(repoRoot, "apps/web/turbo.json"), "utf8"))
        .tasks?.build?.inputs ?? [];
  } catch (error) {
    problems.push(`apps/web/turbo.json cannot be read: ${error.message}`);
  }
  if (inputs[0] !== "$TURBO_EXTENDS$" || !inputs.includes(".env*"))
    problems.push(
      `apps/web/turbo.json build inputs are ${JSON.stringify(inputs)}; expected ["$TURBO_EXTENDS$", ".env*"]`,
    );
  console.log(
    `check-turbo-env: web#build hashes ${present.length} env file(s) in apps/web (names only); ${globalFiles.length} global input file(s)`,
  );
}

if (problems.length) {
  for (const problem of problems) console.error(`check-turbo-env: ${problem}`);
  process.exit(1);
}
console.log(
  `check-turbo-env: ${tasks.join(", ")} dry-run clean; no env file among ${globalFiles.length} global input file(s) or ${(report.tasks ?? []).length} task(s) outside web#build`,
);
