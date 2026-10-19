/**
 * toolkit.json: the one home for layout facts (E-05, amended by A4 and A7).
 * Every tooling script loads it through here, so a missing or malformed key
 * fails loudly, with the key's name and the fix, before any check runs.
 *
 * Template: docs/engineering/templates/toolkit.template.json
 */

import { existsSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

import { REPO_ROOT } from "./docs.ts";

export const TOOLKIT_FILE = "toolkit.json";
const TEMPLATE = "docs/engineering/templates/toolkit.template.json";

const TIERS = ["starter", "overlay", "overlay-local"] as const;
const REVIEWER_STATUSES = ["draft", "ruled"] as const;
/** A work-id prefix: 2 to 5 upper-case letters or digits, letter first (A4). */
const PREFIX = /^[A-Z][A-Z0-9]{1,4}$/;
const APP_NAME = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const ROLE = /^[a-z]+$/;
/**
 * A module a reviewer row's imports list names: a package (`stripe`,
 * `@clerk/nextjs`), one of its subpaths (`stripe/webhooks`), or every package
 * in a scope (`@supabase/*`).
 */
const MODULE =
  /^(?:@[a-z0-9][a-z0-9._-]*\/(?:\*|[a-z0-9][a-z0-9._-]*(?:\/[A-Za-z0-9._-]+)*)|[a-z0-9][a-z0-9._-]*(?:\/[A-Za-z0-9._-]+)*)$/;
const REVIEWER_FIELDS = ["glob", "imports", "role", "why", "status"] as const;

export type ToolkitApp = {
  /** Repo-relative folder of the app. */
  path: string;
  /** Work-id prefix for the app's one-offs, as in `WEB-41`. */
  prefix: string;
  /** Repo-relative folder of the app's design layer, or null when it has none. */
  designLayer: string | null;
};

/**
 * One seat in the reviewer map. A row carries a glob, an imports list, or
 * both; a file reaches the row when either matches (T6).
 */
export type ToolkitReviewer = {
  /** Repo-relative glob matched against a ticket's planned paths and its diff. */
  glob?: string;
  /**
   * Modules whose importers reach the row wherever they sit: a package, a
   * subpath of one, or a whole scope as `@scope/*`. A file reaches the row
   * when a static import, export-from, require or import() names one of
   * them or a subpath of it.
   */
  imports?: string[];
  /** Lower-case role name, as in the role's file name. */
  role: string;
  why: string;
  status?: (typeof REVIEWER_STATUSES)[number];
};

export type Toolkit = {
  tier: (typeof TIERS)[number];
  specsRoot: string;
  apps: Record<string, ToolkitApp>;
  toolkitPrefixes: string[];
  verify: { full: string; fast: string };
  migrationsDir: string | null;
  branchPattern: string;
  /** The branch agents never commit on and merged work lives on, as in "main". */
  protectedBranch: string;
  reviewers: ToolkitReviewer[];
  /** The default stack's modules, by name (D-STK-13); read by `yarn check-stack`. */
  stack: Record<string, ToolkitStackModule>;
};

export type ToolkitStackModule = {
  /** Repo-relative files or folders the module owns. */
  files: string[];
  /** Environment variable names, unsuffixed; `_LOCAL` and `_STAGING` forms are implied. */
  env: string[];
  /** npm package names the module brings, as they appear in any package.json. */
  dependencies: string[];
  /** Element names the module holds in packages/config/eslint/boundaries.js. */
  boundaries: string[];
  /** A locked module cannot be removed, and has no runbook. */
  locked: boolean;
  /** Repo-relative path of the removal runbook; null when locked. */
  runbook: string | null;
  /** Set once the module's runbook has run in this repo; absent means present. */
  removed?: boolean;
};

const KEYS = [
  "tier",
  "specsRoot",
  "apps",
  "toolkitPrefixes",
  "verify",
  "migrationsDir",
  "branchPattern",
  "protectedBranch",
  "reviewers",
  "stack",
] as const;

const STACK_FIELDS = [
  "files",
  "env",
  "dependencies",
  "boundaries",
  "locked",
  "runbook",
] as const;
const ENV_NAME = /^[A-Z][A-Z0-9_]*$/;

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);
const isText = (value: unknown): value is string =>
  typeof value === "string" && value.trim() !== "";
const isRelative = (value: string) =>
  !path.isAbsolute(value) && !value.startsWith("~") && !value.includes("..");

/** Every problem in a parsed toolkit file, each naming its key and the fix. */
export function validateToolkit(
  data: unknown,
  root: string = REPO_ROOT,
): string[] {
  const problems: string[] = [];
  const bad = (key: string, fix: string) => problems.push(`"${key}" ${fix}`);
  if (!isObject(data)) return ["the file must hold one JSON object"];

  for (const key of KEYS) {
    if (!(key in data))
      bad(key, `is missing; copy it from ${TEMPLATE} and fill it in`);
  }
  for (const key of Object.keys(data)) {
    if (!(KEYS as readonly string[]).includes(key))
      bad(key, `is not a toolkit key; the keys are ${KEYS.join(", ")}`);
  }

  if ("tier" in data && !(TIERS as readonly unknown[]).includes(data.tier))
    bad("tier", `must be one of ${TIERS.join(", ")}`);

  if ("specsRoot" in data) {
    if (!isText(data.specsRoot) || !isRelative(data.specsRoot))
      bad("specsRoot", 'must be a repo-relative folder, such as "specs"');
  }

  const prefixes = new Map<string, string>();
  const claim = (prefix: unknown, key: string) => {
    if (typeof prefix !== "string" || !PREFIX.test(prefix)) {
      bad(key, "must be 2 to 5 upper-case letters or digits, letter first");
      return;
    }
    const owner = prefixes.get(prefix);
    if (owner)
      bad(key, `repeats the prefix ${prefix} already used by ${owner}`);
    else prefixes.set(prefix, key);
  };

  if ("apps" in data) {
    if (!isObject(data.apps) || Object.keys(data.apps).length === 0) {
      bad(
        "apps",
        "must map at least one app name to { path, prefix, designLayer }",
      );
    } else {
      for (const [name, app] of Object.entries(data.apps)) {
        const at = `apps.${name}`;
        if (!APP_NAME.test(name)) bad(at, "must be a kebab-case app name");
        if (!isObject(app)) {
          bad(at, "must be { path, prefix, designLayer }");
          continue;
        }
        if (!isText(app.path) || !isRelative(app.path))
          bad(`${at}.path`, "must be a repo-relative folder");
        else if (
          !existsSync(path.join(root, app.path)) ||
          !statSync(path.join(root, app.path)).isDirectory()
        )
          bad(`${at}.path`, `points at ${app.path}, which is not a folder`);
        claim(app.prefix, `${at}.prefix`);
        if (!("designLayer" in app))
          bad(`${at}.designLayer`, "is missing; use a folder path, or null");
        else if (
          app.designLayer !== null &&
          (!isText(app.designLayer) || !isRelative(app.designLayer))
        )
          bad(`${at}.designLayer`, "must be a repo-relative folder, or null");
      }
    }
  }

  if ("toolkitPrefixes" in data) {
    if (
      !Array.isArray(data.toolkitPrefixes) ||
      data.toolkitPrefixes.length === 0
    )
      bad("toolkitPrefixes", 'must list at least one prefix, such as ["PEM"]');
    else
      data.toolkitPrefixes.forEach((prefix, i) =>
        claim(prefix, `toolkitPrefixes[${i}]`),
      );
  }

  if ("verify" in data) {
    if (!isObject(data.verify)) bad("verify", "must be { full, fast }");
    else
      for (const key of ["full", "fast"])
        if (!isText(data.verify[key]))
          bad(`verify.${key}`, "must be the command to run, as a string");
  }

  if ("migrationsDir" in data) {
    const dir = data.migrationsDir;
    if (dir !== null && (!isText(dir) || !isRelative(dir)))
      bad("migrationsDir", "must be a repo-relative folder, or null");
  }

  if ("branchPattern" in data) {
    if (!isText(data.branchPattern) || !data.branchPattern.includes("{id}"))
      bad("branchPattern", 'must contain {id}, as in "agent/{id}"');
  }

  if ("protectedBranch" in data) {
    if (!isText(data.protectedBranch) || /\s|\{id\}/.test(data.protectedBranch))
      bad("protectedBranch", 'must be a branch name, such as "main"');
  }

  if ("reviewers" in data) {
    if (!Array.isArray(data.reviewers)) {
      bad("reviewers", "must be a list of { glob or imports, role, why }");
    } else {
      data.reviewers.forEach((row, i) => {
        const at = `reviewers[${i}]`;
        if (!isObject(row)) {
          bad(at, "must be { glob or imports, role, why }");
          return;
        }
        for (const key of Object.keys(row))
          if (!(REVIEWER_FIELDS as readonly string[]).includes(key))
            bad(
              `${at}.${key}`,
              `is not a reviewer field; the fields are ${REVIEWER_FIELDS.join(", ")}`,
            );
        if (!("glob" in row) && !("imports" in row))
          bad(
            at,
            'needs a glob, an imports list, or both, as in "glob": "**/billing/**" or "imports": ["stripe"]',
          );
        if ("glob" in row && (!isText(row.glob) || !isRelative(row.glob)))
          bad(`${at}.glob`, "must be a repo-relative glob");
        if ("imports" in row) {
          if (!Array.isArray(row.imports) || row.imports.length === 0)
            bad(
              `${at}.imports`,
              'must list at least one module, as in ["stripe"]; to match by glob alone, leave the key out',
            );
          else
            row.imports.forEach((module, j) => {
              if (typeof module !== "string" || !MODULE.test(module))
                bad(
                  `${at}.imports[${j}]`,
                  'must be a module name ("stripe"), a subpath ("stripe/webhooks") or a scope ("@supabase/*")',
                );
              else if ((row.imports as unknown[]).indexOf(module) !== j)
                bad(`${at}.imports[${j}]`, `repeats ${module}; list it once`);
            });
        }
        if (typeof row.role !== "string" || !ROLE.test(row.role))
          bad(`${at}.role`, 'must be a lower-case role name, such as "warden"');
        if (!isText(row.why))
          bad(`${at}.why`, "must say in one line why this role reads the path");
        if (
          "status" in row &&
          !(REVIEWER_STATUSES as readonly unknown[]).includes(row.status)
        )
          bad(`${at}.status`, `must be one of ${REVIEWER_STATUSES.join(", ")}`);
      });
    }
  }

  if ("stack" in data) problems.push(...validateStack(data.stack, root));

  return problems;
}

/**
 * Every problem in a stack block's shape (D-STK-13), each naming the module
 * and the field. Whether listed files, variables and dependencies are present
 * is check-stack's question, not this one's; a runbook path is checked here,
 * like an app's path, because a bad one makes the entry itself wrong.
 */
export function validateStack(
  stack: unknown,
  root: string = REPO_ROOT,
): string[] {
  const problems: string[] = [];
  const bad = (key: string, fix: string) => problems.push(`"${key}" ${fix}`);
  if (!isObject(stack))
    return [`"stack" must map each module name to its entry`];
  for (const [name, entry] of Object.entries(stack)) {
    const at = `stack.${name}`;
    if (!APP_NAME.test(name)) bad(at, "must be a kebab-case module name");
    if (!isObject(entry)) {
      bad(at, `must be { ${STACK_FIELDS.join(", ")} }`);
      continue;
    }
    for (const field of STACK_FIELDS)
      if (!(field in entry))
        bad(`${at}.${field}`, "is missing; every module entry carries it");
    for (const key of Object.keys(entry))
      if (
        !(STACK_FIELDS as readonly string[]).includes(key) &&
        key !== "removed"
      )
        bad(
          `${at}.${key}`,
          `is not a module field; the fields are ${STACK_FIELDS.join(", ")}, and removed`,
        );

    const list = (
      field: string,
      ok: (item: string) => boolean,
      fix: string,
    ) => {
      if (!(field in entry)) return;
      const value = entry[field];
      if (!Array.isArray(value)) bad(`${at}.${field}`, "must be a list");
      else
        value.forEach((item, i) => {
          if (typeof item !== "string" || !ok(item))
            bad(`${at}.${field}[${i}]`, fix);
        });
    };
    list(
      "files",
      (item) => isText(item) && isRelative(item) && !/[*?{}[\]]/.test(item),
      "must be a repo-relative path, without globs",
    );
    list(
      "env",
      (item) => ENV_NAME.test(item) && !/_(LOCAL|STAGING)$/.test(item),
      "must be an upper-case variable name without a tier suffix",
    );
    list("dependencies", isText, "must be an npm package name");
    list("boundaries", isText, "must be an element name in boundaries.js");

    if ("locked" in entry && typeof entry.locked !== "boolean")
      bad(`${at}.locked`, "must be true or false");
    if ("removed" in entry && typeof entry.removed !== "boolean")
      bad(
        `${at}.removed`,
        "must be true, or left out while the module is present",
      );
    if (entry.locked === true && entry.removed === true)
      bad(at, "is locked, so it cannot be marked removed");

    if ("runbook" in entry) {
      const runbook = entry.runbook;
      if (entry.locked === true && runbook !== null)
        bad(
          `${at}.runbook`,
          "must be null: a locked module has no removal runbook",
        );
      else if (runbook === null) {
        if (entry.locked === false)
          bad(
            `${at}.runbook`,
            "must name the removal runbook of a module that is not locked",
          );
      } else if (!isText(runbook) || !isRelative(runbook))
        bad(`${at}.runbook`, "must be a repo-relative path, or null");
      else if (!existsSync(path.join(root, runbook)))
        bad(`${at}.runbook`, `points at ${runbook}, which does not exist`);
    }
  }
  return problems;
}

/** Reads and validates a toolkit file; exits 1 with every problem named. */
export function loadToolkit(file: string = TOOLKIT_FILE): Toolkit {
  const target = path.join(REPO_ROOT, file);
  const stop = (problems: string[]): never => {
    console.error(
      `${file} — ${problems.length} problem(s):\n${problems
        .map((problem) => `  ${problem}`)
        .join("\n")}`,
    );
    process.exit(1);
  };
  if (!existsSync(target))
    stop([
      `the file does not exist; copy ${TEMPLATE} to ${file} and fill it in`,
    ]);
  let data: unknown;
  try {
    data = JSON.parse(readFileSync(target, "utf8"));
  } catch (error) {
    stop([
      `is not valid JSON: ${error instanceof Error ? error.message : String(error)}`,
    ]);
  }
  const problems = validateToolkit(data);
  if (problems.length > 0) stop(problems);
  return data as Toolkit;
}

/** Every work-id prefix the layout file admits, toolkit prefixes first. */
export function staticPrefixes(toolkit: Toolkit): string[] {
  return [
    ...toolkit.toolkitPrefixes,
    ...Object.values(toolkit.apps).map((app) => app.prefix),
  ];
}
