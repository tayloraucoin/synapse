/**
 * The layout probe (MIG T3): the filesystem facts a script or hook needs to
 * run on a repo that is not shaped like this one. toolkit.json stays the one
 * home for what a person declares (lib/toolkit.ts, and readLayout in
 * lib/work-ids.ts for the hooks); this answers what is on disk.
 *
 * Node built-ins only, so a hook can import it and start fast.
 */

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

/** The Turbo tasks verify:fast runs; a turbo.json defining fewer is reported. */
export const TURBO_TASKS = ["lint", "check-types"] as const;
export type TurboTask = (typeof TURBO_TASKS)[number];

export type RepoLayout = {
  /** A turbo.json exists at the root. */
  hasTurbo: boolean;
  /** Which of TURBO_TASKS that turbo.json defines; [] without one. */
  turboTasks: TurboTask[];
  /** The root package.json's workspace patterns, or [] without the key. */
  workspaces: string[];
  /**
   * Repo-relative folders that hold product code: each toolkit app's path,
   * then each workspace folder, sorted and without repeats; ["."] when there
   * is neither (a single app at the root).
   */
  codeRoots: string[];
  /** toolkit.json's specsRoot, or `specs` without one. */
  specsRoot: string;
  /** The specs root exists. */
  hasSpecsRoot: boolean;
  /** The root package.json's script names. */
  scripts: string[];
  /** The root package.json's scripts, each name with its command. */
  scriptCommands: Record<string, string>;
  /** toolkit.json's tier, or `starter` without one (lib/toolkit.ts validates it). */
  tier: string;
};

const readJson = (file: string): unknown => {
  try {
    return JSON.parse(readFileSync(file, "utf8"));
  } catch {
    return null;
  }
};

/** turbo.json may carry comments (JSONC); they are stripped outside strings before parsing. */
function readJsonc(file: string): unknown {
  let text: string;
  try {
    text = readFileSync(file, "utf8");
  } catch {
    return null;
  }
  try {
    return JSON.parse(text);
  } catch {
    const bare = text.replace(
      /("(?:\\.|[^"\\])*")|\/\/[^\n]*|\/\*[\s\S]*?\*\//g,
      (match, string: string | undefined) => string ?? "",
    );
    try {
      return JSON.parse(bare.replace(/,(\s*[}\]])/g, "$1"));
    } catch {
      return null;
    }
  }
}

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/** `apps/*` → each folder under apps/; a pattern without a wildcard → itself, when it is a folder. */
function expandWorkspace(root: string, pattern: string): string[] {
  const clean = pattern.replace(/^\.\//, "").replace(/\/+$/, "");
  if (clean.startsWith("!")) return [];
  const star = clean.indexOf("*");
  if (star === -1) return isDir(root, clean) ? [clean] : [];
  const parent = clean.slice(0, star).replace(/\/+$/, "");
  if (clean.slice(star) !== "*" || !isDir(root, parent || ".")) return [];
  return readdirSync(path.join(root, parent || "."), { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith("."))
    .map((entry) => (parent ? `${parent}/${entry.name}` : entry.name))
    .filter((dir) => dir !== "node_modules");
}

function isDir(root: string, rel: string): boolean {
  try {
    return statSync(path.join(root, rel)).isDirectory();
  } catch {
    return false;
  }
}

/** The layout of the repo at `root`, read fresh each call. */
export function probeLayout(root: string): RepoLayout {
  const pkg = readJson(path.join(root, "package.json"));
  const scriptCommands = Object.fromEntries(
    Object.entries(
      isObject(pkg) && isObject(pkg.scripts) ? pkg.scripts : {},
    ).filter(
      (entry): entry is [string, string] => typeof entry[1] === "string",
    ),
  );
  const scripts = Object.keys(scriptCommands);
  const declared = isObject(pkg) ? pkg.workspaces : undefined;
  // Yarn and npm take an array; Yarn 1 also takes { packages: [...] }.
  const list = Array.isArray(declared)
    ? declared
    : isObject(declared) && Array.isArray(declared.packages)
      ? declared.packages
      : [];
  const workspaces = list.filter(
    (entry): entry is string => typeof entry === "string",
  );

  const turboFile = path.join(root, "turbo.json");
  const hasTurbo = existsSync(turboFile);
  const turbo = hasTurbo ? readJsonc(turboFile) : null;
  // Turbo 2 names the map `tasks`; Turbo 1 named it `pipeline`. A key may be
  // scoped to one workspace (`web#lint`), which still defines the task there.
  const taskMap = isObject(turbo)
    ? isObject(turbo.tasks)
      ? turbo.tasks
      : isObject(turbo.pipeline)
        ? turbo.pipeline
        : {}
    : {};
  const turboTasks = TURBO_TASKS.filter((task) =>
    Object.keys(taskMap).some(
      (key) => key === task || key.endsWith(`#${task}`),
    ),
  );

  const toolkit = readJson(path.join(root, "toolkit.json"));
  const appPaths =
    isObject(toolkit) && isObject(toolkit.apps)
      ? Object.values(toolkit.apps)
          .map((app) => (isObject(app) ? app.path : undefined))
          .filter((p): p is string => typeof p === "string" && p !== "")
      : [];
  const specsRoot =
    isObject(toolkit) && typeof toolkit.specsRoot === "string"
      ? toolkit.specsRoot
      : "specs";

  const roots = [
    ...appPaths.map((p) => p.replace(/^\.\//, "").replace(/\/+$/, "") || "."),
    ...workspaces.flatMap((pattern) => expandWorkspace(root, pattern)),
  ];
  const codeRoots = roots.length ? [...new Set(roots)].sort() : ["."];

  return {
    hasTurbo,
    turboTasks,
    workspaces,
    codeRoots,
    specsRoot,
    hasSpecsRoot: isDir(root, specsRoot),
    scripts,
    scriptCommands,
    tier:
      isObject(toolkit) && typeof toolkit.tier === "string"
        ? toolkit.tier
        : "starter",
  };
}

/**
 * What `yarn <tool>` run in `dir` finds: Yarn runs a script of that name
 * first, else a binary of a dependency that folder's package.json declares;
 * null when it finds neither. A root dependency's binary is reached from a
 * child workspace with `yarn run -T <tool>`, in that workspace's folder; a
 * root script is not (it runs in the root).
 */
export function findTool(
  root: string,
  dir: string,
  tool: string,
): "script" | "dependency" | null {
  const pkg = readJson(path.join(root, dir, "package.json"));
  if (!isObject(pkg)) return null;
  const has = (key: string) => {
    const map = pkg[key];
    return isObject(map) && typeof map[tool] === "string";
  };
  if (has("scripts")) return "script";
  return has("dependencies") || has("devDependencies") ? "dependency" : null;
}

/** The code root a repo path sits in, the deepest one first; null when it is in none. */
export function findCodeRoot(layout: RepoLayout, file: string): string | null {
  let best: string | null = null;
  for (const dir of layout.codeRoots) {
    const inside = dir === "." || file === dir || file.startsWith(`${dir}/`);
    if (inside && (best === null || best === "." || dir.length > best.length))
      best = dir;
  }
  return best;
}
