/**
 * Guards the tracked agent permissions (E-15; ruling (d)).
 *
 *   yarn check-settings            fixtures first, then .claude/settings.json
 *   yarn check-settings <file>     one settings file, no fixtures
 *
 * Fails when: a required deny or ask is missing, a deny would block the local
 * reset, an allow rule admits every shell
 * command, a value holds a machine path, the sandbox is off, a required hook is
 * not registered, a registered hook points at a script that does not exist, or
 * settings.local.json is tracked.
 *
 * The tier comes from toolkit.json. At starter every rule below is required in
 * the tracked file. Under the overlay tiers (MIG T2) only the floor and the
 * team hooks are: the git push deny, bash-guard.ts and stop-gate.ts are the
 * operator's rows, ruled into the gitignored local file, and `yarn doctor`
 * checks them there; the sandbox is the operator's too, so only a tracked
 * sandbox that is off fails. A hook in the local file must still point at a
 * script that exists.
 */

import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, realpathSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { REPO_ROOT } from "./lib/docs.ts";
import { loadToolkit, type Toolkit } from "./lib/toolkit.ts";

type Tier = Toolkit["tier"];

const SETTINGS = ".claude/settings.json";
const LOCAL = ".claude/settings.local.json";
const FIXTURES = "tooling/fixtures/settings";
const TEMPLATE = "docs/engineering/templates/settings.template.json";

/**
 * The git push deny: required in the tracked file at starter; under overlay an
 * operator row, which doctor finds in the local file.
 */
export const PUSH_DENIES = ["Bash(git push)", "Bash(git push *)"];
/**
 * The floor (MIG T2): ruling (d)'s denies other than push, required at every
 * tier. Each must appear in permissions.deny exactly as written.
 */
const FLOOR_DENIES = [
  "Bash(git reset --hard *)",
  "Bash(git clean *)",
  "Bash(git branch -D *)",
  "Bash(git filter-branch *)",
  "Bash(npm publish *)",
  "Bash(npm login *)",
  "Read(**/.env)",
  "Read(**/secrets/**)",
  "Read(**/*.pem)",
  "Read(~/.ssh/**)",
  "Read(~/.aws/**)",
  // D-STK-18: no agent resets or drops a database.
  "Bash(*db:reset*)",
  "Bash(*db:drop*)",
  "Bash(*drizzle-kit drop*)",
  "Bash(*supabase db reset*)",
  "Bash(*DROP SCHEMA*)",
  "Bash(*DROP DATABASE*)",
];
/**
 * The env files that hold values (PR-16). Either the blanket rule, or every
 * one of the named files: the named form leaves .env.example readable, which
 * holds names and local defaults, never a key.
 */
const ENV_BLANKET_DENY = "Read(**/.env.*)";
const ENV_FILE_DENIES = [
  "Read(**/.env.local)",
  "Read(**/.env.*.local)",
  "Read(**/.env.development)",
  "Read(**/.env.staging)",
  "Read(**/.env.production)",
];
/** D-STK-18's asks, part of the floor: every command that changes a database waits for Taylor. */
const REQUIRED_ASKS = [
  "Bash(*db:migrate*)",
  "Bash(*db:push*)",
  "Bash(*db:seed*)",
  "Bash(*db:setup*)",
  "Bash(*db:local:reset*)",
  "Bash(*drizzle-kit migrate*)",
  "Bash(*drizzle-kit push*)",
  "Bash(*supabase db push*)",
];
/** Asked, never denied: a deny broad enough to catch it takes the local rebuild away. */
const LOCAL_RESET = "yarn db:local:reset";
/**
 * Hooks that must stay registered (A13.1). Deleting a hook block would
 * otherwise pass every check. A hook joins this list in the step that lands
 * its script (A2). Team hooks are required in the tracked file at every tier;
 * operator hooks only at starter (MIG T2: a ruling covers a whole hook).
 */
export type RequiredHook = {
  event: string;
  matcher: string | undefined;
  script: string;
  team: boolean;
};
const REQUIRED_HOOKS: RequiredHook[] = [
  {
    event: "PreToolUse",
    matcher: "Bash",
    script: "tooling/hooks/bash-guard.ts",
    team: false,
  },
  {
    event: "PreToolUse",
    matcher: "Edit|Write|NotebookEdit",
    script: "tooling/hooks/results-gate.ts",
    team: true,
  },
  {
    event: "SessionStart",
    matcher: undefined,
    script: "tooling/hooks/session-start.ts",
    team: true,
  },
  {
    event: "Stop",
    matcher: undefined,
    script: "tooling/hooks/stop-gate.ts",
    team: false,
  },
];
/** The hooks an overlay operator keeps in the local file; doctor checks them there. */
export const OPERATOR_HOOKS = REQUIRED_HOOKS.filter((hook) => !hook.team);
/** Shell reads the Read tool's deny cannot be trusted to cover on its own. */
const REQUIRED_DENY_READ = ["~/.ssh", "~/.aws"];
const MACHINE_PATH =
  /(^|[\s("'=:])(\/\/?(Users|home|private|var|opt)\/|[A-Za-z]:\\)/;

type Json = Record<string, unknown>;
const isObject = (value: unknown): value is Json =>
  typeof value === "object" && value !== null && !Array.isArray(value);
const strings = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((v) => typeof v === "string") : [];

/** Every string in a JSON value, with the path that reaches it. */
function walk(value: unknown, at: string, out: [string, string][]) {
  if (typeof value === "string") out.push([at, value]);
  else if (Array.isArray(value))
    value.forEach((item, i) => walk(item, `${at}[${i}]`, out));
  else if (isObject(value))
    for (const [key, item] of Object.entries(value))
      walk(item, at ? `${at}.${key}` : key, out);
}

/** Whether a `Bash(...)` rule's pattern, with `*` as any text, matches the whole command. */
export function bashRuleMatches(rule: string, command: string): boolean {
  const pattern = rule.match(/^Bash\((.*)\)$/)?.[1];
  if (pattern === undefined) return false;
  // The legacy `prefix:*` form means the prefix, then anything.
  const body = pattern
    .replace(/:\*$/, "*")
    .split("*")
    .map((part) => part.replace(/[.+?^${}()|[\]\\]/g, "\\$&"))
    .join(".*");
  return new RegExp(`^${body}$`).test(command);
}

/** Whether a settings object registers the hook, for its event and matcher. */
export function hookRegistered(settings: unknown, hook: RequiredHook): boolean {
  const hooks =
    isObject(settings) && isObject(settings.hooks) ? settings.hooks : {};
  const value = hooks[hook.event];
  const entries = Array.isArray(value) ? value : [];
  return entries.some(
    (entry) =>
      isObject(entry) &&
      (entry.matcher ?? "") === (hook.matcher ?? "") &&
      JSON.stringify(entry.hooks ?? []).includes(
        `\${CLAUDE_PROJECT_DIR}/${hook.script}`,
      ),
  );
}

/** A problem for each hook a settings object registers to a script that does not exist (A2). */
function missingScripts(settings: unknown, label = ""): string[] {
  const found: [string, string][] = [];
  walk(settings, "", found);
  const problems: string[] = [];
  for (const [at, value] of found) {
    const script = value.match(/\$\{CLAUDE_PROJECT_DIR\}\/([^"'\s]+)/);
    if (
      at.startsWith("hooks.") &&
      script &&
      !existsSync(path.join(REPO_ROOT, script[1]!))
    )
      problems.push(
        `${label}${at} registers ${script[1]}, which does not exist; ` +
          "land the script and its fixtures first, then register the hook",
      );
  }
  return problems;
}

/**
 * The problems in a tracked settings file judged at `tier`. Under the overlay
 * tiers, `local` is the operator's settings.local.json when there is one: its
 * hooks may register the operator hooks, and each must point at a script that
 * exists. Nothing is ever required in it (it is absent in CI).
 */
export function checkSettings(
  settings: unknown,
  tier: Tier = "starter",
  local?: unknown,
): string[] {
  const problems: string[] = [];
  if (!isObject(settings)) return ["the file must hold one JSON object"];
  const overlay = tier !== "starter";
  const permissions = isObject(settings.permissions)
    ? settings.permissions
    : {};
  const deny = strings(permissions.deny);
  const allow = strings(permissions.allow);
  const ask = strings(permissions.ask);

  for (const rule of overlay
    ? FLOOR_DENIES
    : [...PUSH_DENIES, ...FLOOR_DENIES]) {
    if (!deny.includes(rule))
      problems.push(
        `permissions.deny is missing ${rule}; restore it from ${TEMPLATE}`,
      );
  }
  if (
    !deny.includes(ENV_BLANKET_DENY) &&
    !ENV_FILE_DENIES.every((rule) => deny.includes(rule))
  )
    problems.push(
      `permissions.deny must hold ${ENV_BLANKET_DENY}, or every one of ${ENV_FILE_DENIES.join(", ")}; restore it from ${TEMPLATE}`,
    );
  for (const rule of REQUIRED_ASKS) {
    if (!ask.includes(rule))
      problems.push(
        `permissions.ask is missing ${rule}; restore it from ${TEMPLATE}`,
      );
  }
  for (const rule of deny) {
    if (bashRuleMatches(rule, LOCAL_RESET))
      problems.push(
        `permissions.deny holds ${rule}, which also blocks ${LOCAL_RESET}; ` +
          "narrow it so the local reset stays an ask (D-STK-18)",
      );
  }
  for (const rule of allow) {
    if (/^Bash(\(\s*\*?\s*\)|\(\*:\*\))?$/.test(rule))
      problems.push(
        `permissions.allow holds ${rule}, which admits every shell command; ` +
          "replace it with the specific commands, as in the template",
      );
  }

  for (const hook of REQUIRED_HOOKS) {
    if (overlay && !hook.team) continue;
    if (!hookRegistered(settings, hook))
      problems.push(
        `hooks.${hook.event} does not register ${hook.script}${hook.matcher ? ` for "${hook.matcher}"` : ""}; restore the entry from ${TEMPLATE}`,
      );
  }

  // Under overlay the sandbox is ruled operator and may live in the local
  // file; a tracked one is still judged in full, and one that is off fails.
  const tracked = "sandbox" in settings;
  const sandbox = isObject(settings.sandbox) ? settings.sandbox : {};
  if (!overlay || tracked) {
    if (sandbox.enabled !== true)
      problems.push(
        "sandbox.enabled must be true; the sandbox is the boundary",
      );
    const filesystem = isObject(sandbox.filesystem) ? sandbox.filesystem : {};
    const denyRead = strings(filesystem.denyRead);
    for (const entry of REQUIRED_DENY_READ) {
      if (!denyRead.includes(entry))
        problems.push(
          `sandbox.filesystem.denyRead is missing ${entry}; restore it from ${TEMPLATE}`,
        );
    }
  }

  const found: [string, string][] = [];
  walk(settings, "", found);
  for (const [at, value] of found) {
    if (MACHINE_PATH.test(value))
      problems.push(
        `${at} holds a machine path (${value}); use ~/, a repo-relative path, ` +
          "or ${CLAUDE_PROJECT_DIR}",
      );
  }
  // A hook is never registered to a script that does not exist (A2).
  problems.push(...missingScripts(settings));
  if (overlay && local !== undefined)
    problems.push(...missingScripts(local, `${LOCAL}: `));
  return problems;
}

function isTracked(rel: string): boolean {
  try {
    return (
      execFileSync("git", ["ls-files", "--", rel], {
        cwd: REPO_ROOT,
        encoding: "utf8",
      }).trim() !== ""
    );
  } catch {
    return false;
  }
}

function readJson(rel: string): unknown {
  return JSON.parse(readFileSync(path.join(REPO_ROOT, rel), "utf8"));
}

/**
 * Each fixture: { expect: "pass" | "fail", message?: string, tier?: string,
 * local?: {...}, settings: {...} }. A fixture is judged at its `tier`
 * (starter when absent); an overlay one is named `overlay-<criterion>-…` and
 * may carry the operator's `local` settings. `local-*.json` files are doctor's.
 */
function runFixtures(): string[] {
  const failures: string[] = [];
  const dir = path.join(REPO_ROOT, FIXTURES);
  const files = readdirSync(dir).filter(
    (name) => name.endsWith(".json") && !name.startsWith("local-"),
  );
  for (const name of files) {
    const fixture = readJson(`${FIXTURES}/${name}`) as {
      expect: "pass" | "fail";
      message?: string;
      tier?: Tier;
      local?: unknown;
      settings: unknown;
    };
    const problems = checkSettings(
      fixture.settings,
      fixture.tier ?? "starter",
      fixture.local,
    );
    const failed = problems.length > 0;
    if (failed !== (fixture.expect === "fail"))
      failures.push(
        `${name}: expected ${fixture.expect}, got ${failed ? `fail (${problems[0]})` : "pass"}`,
      );
    else if (
      fixture.message &&
      !problems.some((problem) => problem.includes(fixture.message!))
    )
      failures.push(
        `${name}: no problem mentions "${fixture.message}"; got: ${problems.join(" | ")}`,
      );
  }
  if (files.length === 0) failures.push(`no fixtures found in ${FIXTURES}`);
  return failures.length ? failures : [`${files.length}`];
}

// Run as a script; doctor imports the rows and matchers above. Real paths,
// since $TMPDIR on macOS reaches the same file through a symlink.
const invoked = process.argv[1] ? realpathSync(process.argv[1]) : "";
if (realpathSync(fileURLToPath(import.meta.url)) === invoked) {
  const { tier } = loadToolkit();
  const localRows = (): unknown =>
    tier !== "starter" && existsSync(path.join(REPO_ROOT, LOCAL))
      ? readJson(LOCAL)
      : undefined;
  const only = process.argv[2];
  if (only) {
    const problems = checkSettings(readJson(only), tier);
    if (problems.length > 0) {
      console.error(
        `${only} — ${problems.length} problem(s):\n  ${problems.join("\n  ")}`,
      );
      process.exit(1);
    }
    console.log(`check-settings — ${only} is clean.`);
    process.exit(0);
  }

  const fixtureResult = runFixtures();
  if (fixtureResult.length > 1 || !/^\d+$/.test(fixtureResult[0]!)) {
    console.error(
      `check-settings — fixtures misbehaved:\n  ${fixtureResult.join("\n  ")}`,
    );
    process.exit(1);
  }

  const problems: string[] = [];
  if (!existsSync(path.join(REPO_ROOT, SETTINGS)))
    problems.push(`${SETTINGS} does not exist; copy ${TEMPLATE} to it`);
  else problems.push(...checkSettings(readJson(SETTINGS), tier, localRows()));
  if (isTracked(LOCAL))
    problems.push(
      `${LOCAL} is tracked; run \`git rm --cached ${LOCAL}\` (it is machine-local and may hold secrets)`,
    );

  if (problems.length > 0) {
    console.error(
      `check-settings — ${problems.length} problem(s) in ${SETTINGS}:\n  ${problems.join("\n  ")}`,
    );
    process.exit(1);
  }
  console.log(
    `check-settings — ${fixtureResult[0]} fixtures behaved; ${SETTINGS} is clean.`,
  );
}
