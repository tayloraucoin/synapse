/**
 * The stop gate's tier (E-18; A13.3): what this branch changes, checked fast.
 *
 *   yarn verify:fast
 *
 * The changed set is every file the branch changes against the protected
 * branch's merge-base, working tree and untracked files included. Each step
 * runs only when that set reaches it:
 *   - format: Prettier on the changed files;
 *   - lint and types: Turbo's `lint` and `check-types` on the affected
 *     workspaces and their dependents (the cache makes the rest free), the
 *     boundaries lint on changed code, and `tsc -p tooling` for tooling;
 *   - the repo's own checks when their inputs change: the docs lint, the
 *     settings check, the hook fixtures;
 *   - check-specs and budget, when run by hand over the whole branch.
 * The layout probe (lib/layout.ts; MIG T3) says what this repo can run. Turbo
 * runs only when turbo.json defines both tasks; otherwise ESLint runs on the
 * changed code (when a config exists) and the repo's type-check script once.
 * A toolkit step runs only when its script exists. Each step that cannot run
 * is printed as `not run: <step> (<why>)`, never counted as passed.
 * The build and the contract-loop tests (16 s) stay in `yarn verify` and CI. Fails fast;
 * prints each step's time.
 *
 * The stop gate scopes it (PR-15): PEM_VERIFY_FAST_FILES, one repo path per
 * line, replaces the changed set with the files that session edited, and the
 * branch-wide steps (check-specs, budget) are skipped. Threads share the
 * operator's checkout, so one thread's stop never judges another's files.
 */

import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";

import { REPO_ROOT } from "./lib/docs.ts";
import { getBaseRef, runGit } from "./lib/git.ts";
import {
  findCodeRoot,
  findTool,
  probeLayout,
  TURBO_TASKS,
} from "./lib/layout.ts";

/**
 * A step runs when the changed set reaches it (`when`) and it can run here.
 * `missing` says why it cannot (its script, task, tool or config is absent):
 * such a step is named as not run, never counted as passed, whether or not
 * the changed set reached it.
 */
type Step = {
  name: string;
  command: string[];
  when: boolean;
  missing?: string;
  cwd?: string;
  /**
   * The exit code that means the tool could not start (ESLint's 2: a config
   * or usage fault, never a finding): named as not run, never as a pass.
   */
  cannotStart?: RegExp;
};

const layout = probeLayout(REPO_ROOT);
/** Why a toolkit step cannot run, or undefined when its script exists. */
const needsScript = (script: string) =>
  layout.scripts.includes(script) ? undefined : `no ${script} script`;
/**
 * Why `yarn <tool>` cannot run at the root, or undefined when it can. A
 * missing binary would fail the step, and block the stop, for want of an
 * install rather than a fault in the code.
 */
const needsTool = (tool: string) =>
  findTool(REPO_ROOT, ".", tool)
    ? undefined
    : `${tool} is not a root dependency`;
const formatCheck = layout.scriptCommands["format:check"];

const base = getBaseRef();
const fork = base ? runGit(["merge-base", base, "HEAD"]) : null;
const lines = (text: string | null) => (text ?? "").split("\n").filter(Boolean);
const scoped = process.env.PEM_VERIFY_FAST_FILES;
const changed = (
  scoped !== undefined ? scoped.split("\n").filter(Boolean) : branchChanges()
).filter((file) => existsSync(path.join(REPO_ROOT, file)));

function branchChanges(): string[] {
  return [
    ...new Set([
      ...lines(
        fork
          ? runGit(["diff", "--name-only", fork, "--"])
          : runGit(["diff", "--name-only", "HEAD", "--"]),
      ),
      ...lines(runGit(["ls-files", "--others", "--exclude-standard"])),
    ]),
  ];
}

/**
 * The toolkit's own folders are never product code, even when an app sits at
 * the root ("."): each has its own step below.
 */
const TOOLKIT_DIRS = [
  "tooling",
  "docs",
  ".claude",
  ".github",
  layout.specsRoot,
];
/** The code root a changed file sits in, or null for a file outside every one. */
const rootOf = (file: string) =>
  TOOLKIT_DIRS.some((dir) => file.startsWith(`${dir}/`))
    ? null
    : findCodeRoot(layout, file);
const inCode = changed.filter((file) => rootOf(file) !== null);
/** What the starter's boundaries lint covers: unchanged since E-18. */
const code = inCode.filter((file) => /\.(ts|tsx|mjs)$/.test(file));
/** Without Turbo, every extension ESLint lints by default in a flat config. */
const lintable = inCode.filter((file) =>
  /\.(js|jsx|mjs|cjs|ts|tsx|mts|cts)$/.test(file),
);

/** The workspaces the scoped files sit in, each with its dependents; unscoped, whatever the branch changed. */
const workspaceFilters =
  scoped !== undefined
    ? [
        ...new Set(
          inCode
            .map(rootOf)
            .filter((dir): dir is string => dir !== null && dir !== "."),
        ),
      ].map((dir) => `--filter=...{./${dir}}`)
    : [`--filter=...[${fork ?? "HEAD"}]`];

const touches = (pattern: RegExp) => changed.some((file) => pattern.test(file));
/** The extensions `yarn format:check` covers, read from its glob so the two never disagree. */
const formatExtensions = (
  formatCheck?.match(/\{([a-z,]+)\}/)?.[1] ?? "ts,tsx,md"
).split(",");
const formattable = changed.filter((file) =>
  formatExtensions.includes(path.extname(file).slice(1)),
);

/**
 * Turbo runs lint and types only when turbo.json defines both tasks and Turbo
 * is installed; otherwise the fallback below does, and this names why.
 */
const absentTasks = TURBO_TASKS.filter(
  (task) => !layout.turboTasks.includes(task),
);
const turboMissing = !layout.hasTurbo
  ? "no turbo.json"
  : absentTasks.length
    ? `turbo.json has no ${absentTasks.join(" or ")} task`
    : needsTool("turbo");

const ESLINT_CONFIGS = [
  "eslint.config.js",
  "eslint.config.mjs",
  "eslint.config.cjs",
  "eslint.config.ts",
  "eslint.config.mts",
  "eslint.config.cts",
  ".eslintrc.js",
  ".eslintrc.cjs",
  ".eslintrc.json",
  ".eslintrc.yml",
  ".eslintrc.yaml",
  ".eslintrc",
];

const FLAT_CONFIG = /^eslint\.config\./;
/** ESLint's own words when it finds no config it can read, or rejects a flag of another mode. */
const ESLINT_CANNOT_START =
  /couldn't find an eslint\.config|No ESLint configuration found|Invalid option '--/i;
const eslintConfigIn = (dir: string) =>
  ESLINT_CONFIGS.find((name) => existsSync(path.join(REPO_ROOT, dir, name)));

/**
 * ESLint on the changed files. A root config lints every code root in one
 * run; without one, each code root with its own config is linted from there,
 * through the root's ESLint dependency (`yarn run -T`, which keeps that
 * folder as the cwd) when that folder declares none.
 * Changed code under a root with no config is named. Without Turbo, a flat
 * config skips ignored files rather than failing on ESLint's "File ignored"
 * warning (the flag does not exist for an .eslintrc), and an ESLint that
 * cannot start is named as not run; the starter's boundaries step is unchanged.
 */
function eslintSteps(name: string, files: string[], fallback: boolean): Step[] {
  const flags = (config: string) => [
    "--max-warnings",
    "0",
    ...(fallback && FLAT_CONFIG.test(config) ? ["--no-warn-ignored"] : []),
  ];
  // Only a missing or unreadable-by-this-ESLint config counts as "could not
  // start"; any other exit 2 (a config the change broke, a crashing rule) fails.
  const cannotStart = fallback ? ESLINT_CANNOT_START : undefined;
  const rootConfig = eslintConfigIn(".");
  if (rootConfig)
    return [
      {
        name,
        command: ["yarn", "eslint", ...flags(rootConfig), ...files],
        when: files.length > 0,
        missing: needsTool("eslint"),
        cannotStart,
      },
    ];
  const byRoot = new Map<string, string[]>();
  for (const file of files) {
    const dir = rootOf(file)!;
    byRoot.set(dir, [...(byRoot.get(dir) ?? []), file]);
  }
  const roots = byRoot.size ? [...byRoot.keys()] : layout.codeRoots;
  return roots.map((dir) => {
    const local = (byRoot.get(dir) ?? []).map((file) =>
      dir === "." ? file : path.posix.relative(dir, file),
    );
    const config = eslintConfigIn(dir);
    const own = findTool(REPO_ROOT, dir, "eslint") !== null;
    const top = !own && findTool(REPO_ROOT, ".", "eslint") === "dependency";
    return {
      name: roots.length > 1 ? `${name} in ${dir}` : name,
      command: [
        "yarn",
        ...(top ? ["run", "-T"] : []),
        "eslint",
        ...flags(config ?? ""),
        ...local,
      ],
      when: local.length > 0,
      missing: !config
        ? "no ESLint config"
        : own || top
          ? undefined
          : `no eslint dependency in ${dir} or the root`,
      cwd: dir,
      cannotStart,
    };
  });
}

/** The repo's own type-check script, run once when Turbo cannot run check-types. */
const TYPE_CHECK_SCRIPTS = ["check-types", "typecheck", "type-check", "tsc"];
const typeCheckScript = TYPE_CHECK_SCRIPTS.find((script) =>
  layout.scripts.includes(script),
);

const steps: Step[] = [
  {
    name: "format (changed files)",
    command: [
      "yarn",
      "prettier",
      "--check",
      "--ignore-unknown",
      ...formattable,
    ],
    when: formattable.length > 0,
    missing: needsTool("prettier"),
  },
  ...(turboMissing === undefined
    ? [
        {
          name: "lint and types (affected workspaces)",
          command: [
            "yarn",
            "turbo",
            "run",
            ...TURBO_TASKS,
            ...workspaceFilters,
            "--output-logs=errors-only",
            "--ui=stream",
          ],
          when: inCode.length > 0,
        },
        ...eslintSteps("boundaries (changed code)", code, false),
      ]
    : [
        {
          name: "lint and types via Turbo",
          command: [],
          when: false,
          missing: turboMissing,
        },
        ...eslintSteps("lint (changed code)", lintable, true),
        {
          name: `types (${typeCheckScript ?? "type-check script"})`,
          command: ["yarn", typeCheckScript ?? ""],
          // Any change under a code root: a tsconfig.json or package.json edit can break types too.
          when: inCode.length > 0,
          missing: typeCheckScript
            ? undefined
            : `no ${TYPE_CHECK_SCRIPTS.join(", ")} script`,
        },
      ]),
  {
    name: "types (tooling)",
    command: ["yarn", "check-types:tooling"],
    when: touches(/^tooling\/.+\.ts$/),
    missing: needsScript("check-types:tooling"),
  },
  {
    name: "docs lint",
    command: ["yarn", "lint:docs"],
    when: touches(/^(docs\/|\.claude\/rules\/|toolkit\.json$)/),
    missing: needsScript("lint:docs"),
  },
  {
    name: "settings",
    command: ["yarn", "check-settings"],
    when: touches(
      /^(\.claude\/settings\.json|tooling\/check-settings\.ts|tooling\/fixtures\/settings\/)/,
    ),
    missing: needsScript("check-settings"),
  },
  {
    name: "hook fixtures",
    command: ["yarn", "test:hooks"],
    when: touches(
      /^tooling\/(hooks\/|lib\/(work-ids|layout)\.ts|test-hooks\.ts)/,
    ),
    missing: needsScript("test:hooks"),
  },
  {
    name: "check-specs",
    command: ["yarn", "check-specs"],
    when: scoped === undefined,
    missing: needsScript("check-specs"),
  },
  {
    name: "budget",
    command: ["yarn", "budget"],
    when: scoped === undefined,
    missing: needsScript("budget"),
  },
];

/** No colour codes in output the stop gate quotes: picocolors colours whenever FORCE_COLOR is present, even as "0". */
const plainEnv: NodeJS.ProcessEnv = {
  ...process.env,
  TURBO_TELEMETRY_DISABLED: "1",
  NO_COLOR: "1",
};
delete plainEnv.FORCE_COLOR;

/** One short line per step that cannot run here; the stop gate quotes this within its reason. */
const notRun: string[] = steps
  .filter((step) => step.missing !== undefined)
  .map((step) => `not run: ${step.name} (${step.missing})`);

const started = Date.now();
const timings: string[] = [];
for (const step of steps) {
  if (!step.when || step.missing !== undefined) continue;
  const t = Date.now();
  const result = spawnSync(step.command[0]!, step.command.slice(1), {
    cwd: path.join(REPO_ROOT, step.cwd ?? "."),
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
    env: plainEnv,
  });
  const seconds = ((Date.now() - t) / 1000).toFixed(1);
  const output = `${result.stdout ?? ""}${result.stderr ?? ""}`.trim();
  // Yarn itself absent, or the tool unable to start: named, never counted.
  // Under the overlay tiers, a tool that is absent or cannot start is named,
  // never a failure, so the stop never blocks for want of an install. At
  // starter every tool is the toolkit's own, so either still fails, as before.
  const errno = (result.error as NodeJS.ErrnoException | undefined)?.code;
  const firstLine = output.split("\n").find(Boolean)?.slice(0, 120);
  const unstarted =
    layout.tier === "starter"
      ? null
      : errno === "ENOENT"
        ? `${step.command[0]} not found`
        : result.status === 127
          ? `could not start: ${firstLine ?? "command not found"}`
          : result.status === 2 && step.cannotStart?.test(output)
            ? `could not start: ${firstLine}`
            : null;
  if (unstarted) {
    notRun.push(`not run: ${step.name} (${unstarted})`);
    continue;
  }
  timings.push(`${step.name} ${seconds} s`);
  if (result.status !== 0) {
    const tail = output.split("\n").slice(-25).join("\n");
    // The not-run lines go first so the failure stays in the tail the stop gate quotes.
    if (notRun.length) console.error(notRun.join("\n"));
    console.error(`verify:fast — ${step.name} failed (${seconds} s):\n${tail}`);
    process.exit(1);
  }
}
console.log(
  `verify:fast — ${changed.length} changed file(s); ${((Date.now() - started) / 1000).toFixed(1)} s: ${timings.join(", ") || "nothing to check"}.`,
);
if (notRun.length) console.log(notRun.join("\n"));
