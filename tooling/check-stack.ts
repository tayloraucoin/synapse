/**
 * Guards removal of the default stack's modules (D-STK-13, STK-2).
 *
 *   yarn check-stack                the repo, against toolkit.json's stack block
 *   yarn check-stack --root <dir>   one fixture tree holding its own toolkit.json
 *
 * Fails when a present module's listed file or folder is missing, and when a
 * module marked removed still has a listed file, a variable in any
 * .env.example (commented lines and the _LOCAL and _STAGING forms count) or
 * in any turbo.json's env lists, or a dependency in any package.json. The
 * entry's shape, the locked rules and the runbook path are checked by
 * validateStack in tooling/lib/toolkit.ts. It reports and never removes.
 * A missing .env.example means no variables are present (STK-4 creates it).
 */

import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";

import { REPO_ROOT } from "./lib/docs.ts";
import {
  loadToolkit,
  validateStack,
  type ToolkitStackModule,
} from "./lib/toolkit.ts";

/** Never walked: installs, build output, VCS, and this repo's own fixtures. */
const SKIP_DIRS = new Set([
  "node_modules",
  ".git",
  ".next",
  ".turbo",
  "dist",
  "build",
  "coverage",
]);
const FIXTURES = "tooling/fixtures";
const DEPENDENCY_FIELDS = [
  "dependencies",
  "devDependencies",
  "peerDependencies",
  "optionalDependencies",
] as const;
const TIER_SUFFIXES = ["", "_LOCAL", "_STAGING"];

/** Repo-relative paths of every file named in `names`, under `root`. */
function findFiles(root: string, names: Set<string>): string[] {
  const found: string[] = [];
  const walk = (rel: string) => {
    for (const entry of readdirSync(path.join(root, rel), {
      withFileTypes: true,
    })) {
      const child = rel ? `${rel}/${entry.name}` : entry.name;
      if (entry.isDirectory()) {
        if (!SKIP_DIRS.has(entry.name) && child !== FIXTURES) walk(child);
      } else if (names.has(entry.name)) found.push(child);
    }
  };
  walk("");
  return found.sort();
}

function readJson(root: string, rel: string, problems: string[]): unknown {
  try {
    return JSON.parse(readFileSync(path.join(root, rel), "utf8"));
  } catch (error) {
    problems.push(
      `${rel} could not be read as JSON: ${error instanceof Error ? error.message : String(error)}`,
    );
    return null;
  }
}

/** Variable names an .env.example declares, commented-out lines included. */
function envFileNames(text: string): Set<string> {
  const names = new Set<string>();
  for (const line of text.split("\n")) {
    const match = /^\s*#?\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=/.exec(
      line,
    );
    if (match) names.add(match[1]!);
  }
  return names;
}

/** Variable names in a turbo.json's global and per-task env lists, with where each sits. */
function turboEnvNames(data: unknown): Map<string, string> {
  const names = new Map<string, string>();
  const collect = (value: unknown, where: string) => {
    if (!Array.isArray(value)) return;
    for (const item of value)
      if (typeof item === "string") names.set(item.replace(/^!/, ""), where);
  };
  if (typeof data !== "object" || data === null) return names;
  const turbo = data as Record<string, unknown>;
  collect(turbo.globalEnv, "globalEnv");
  collect(turbo.globalPassThroughEnv, "globalPassThroughEnv");
  const tasks = turbo.tasks;
  if (typeof tasks === "object" && tasks !== null)
    for (const [task, config] of Object.entries(tasks)) {
      if (typeof config !== "object" || config === null) continue;
      const fields = config as Record<string, unknown>;
      collect(fields.env, `tasks.${task}.env`);
      collect(fields.passThroughEnv, `tasks.${task}.passThroughEnv`);
    }
  return names;
}

/** Every problem with the stack block against the tree at `root`. */
function checkStack(
  stack: Record<string, ToolkitStackModule>,
  root: string,
): string[] {
  const problems: string[] = [];
  const found = findFiles(
    root,
    new Set(["package.json", "turbo.json", ".env.example"]),
  );
  const byName = (name: string) =>
    found.filter((rel) => path.posix.basename(rel) === name);

  // Read lazily: a tree with no removed module needs none of them.
  let envFiles: { rel: string; names: Set<string> }[] | null = null;
  let turboFiles: { rel: string; names: Map<string, string> }[] | null = null;
  let packageFiles: { rel: string; deps: Map<string, string> }[] | null = null;
  const loadEnvFiles = () =>
    (envFiles ??= byName(".env.example").flatMap((rel) => {
      try {
        return [
          {
            rel,
            names: envFileNames(readFileSync(path.join(root, rel), "utf8")),
          },
        ];
      } catch (error) {
        problems.push(
          `${rel} could not be read, so its variables are unchecked: ${error instanceof Error ? error.message : String(error)}`,
        );
        return [];
      }
    }));
  const loadTurboFiles = () =>
    (turboFiles ??= byName("turbo.json").map((rel) => ({
      rel,
      names: turboEnvNames(readJson(root, rel, problems)),
    })));
  const loadPackageFiles = () =>
    (packageFiles ??= byName("package.json").map((rel) => {
      const data = readJson(root, rel, problems) as Record<
        string,
        unknown
      > | null;
      const deps = new Map<string, string>();
      for (const field of DEPENDENCY_FIELDS) {
        const block = data?.[field];
        if (typeof block === "object" && block !== null)
          for (const name of Object.keys(block)) deps.set(name, field);
      }
      return { rel, deps };
    }));

  for (const [name, module] of Object.entries(stack)) {
    const at = `stack.${name}`;
    if (!module.removed) {
      for (const file of module.files)
        if (!existsSync(path.join(root, file)))
          problems.push(
            `${at} is present, but its file ${file} is missing; restore it, fix the path, or mark the module removed`,
          );
      continue;
    }
    const leftover = (what: string) =>
      problems.push(
        `${at} is removed, but ${what}; run its runbook (${module.runbook ?? "none"}) to the end`,
      );
    for (const file of module.files)
      if (existsSync(path.join(root, file)))
        leftover(`its file ${file} is still present`);
    for (const variable of module.env)
      for (const suffix of TIER_SUFFIXES) {
        const full = `${variable}${suffix}`;
        for (const env of loadEnvFiles())
          if (env.names.has(full))
            leftover(`its variable ${full} is still in ${env.rel}`);
        for (const turbo of loadTurboFiles()) {
          const where = turbo.names.get(full);
          if (where)
            leftover(
              `its variable ${full} is still in ${turbo.rel} (${where})`,
            );
        }
      }
    for (const dependency of module.dependencies)
      for (const pkg of loadPackageFiles()) {
        const field = pkg.deps.get(dependency);
        if (field)
          leftover(
            `its dependency ${dependency} is still in ${pkg.rel} (${field})`,
          );
      }
  }
  return problems;
}

function report(problems: string[], modules: number): never {
  if (problems.length > 0) {
    console.error(
      `check-stack — ${problems.length} problem(s):\n  ${problems.join("\n  ")}`,
    );
    process.exit(1);
  }
  console.log(
    `check-stack — ${modules} module(s); nothing missing, nothing left behind.`,
  );
  process.exit(0);
}

const rootFlag = process.argv.indexOf("--root");
if (rootFlag !== -1) {
  const root = path.resolve(process.argv[rootFlag + 1] ?? ".");
  const problems: string[] = [];
  const data = readJson(root, "toolkit.json", problems) as Record<
    string,
    unknown
  > | null;
  if (!data) report(problems, 0);
  const shape = validateStack(data.stack, root);
  if (shape.length > 0) report(shape, 0);
  const stack = data.stack as Record<string, ToolkitStackModule>;
  report(checkStack(stack, root), Object.keys(stack).length);
}

const toolkit = loadToolkit();
report(checkStack(toolkit.stack, REPO_ROOT), Object.keys(toolkit.stack).length);
