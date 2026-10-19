/**
 * Is this machine ready to work in the repo? (E-21)
 *
 *   yarn doctor
 *   yarn doctor --local-settings <file>   scan another local-settings file
 *
 * Prints one line per check and the fix for each failure. Exits non-zero only
 * when something is broken; a warning never fails it.
 *
 * Under the overlay tiers (MIG T2) it also fails when an operator row is in
 * neither settings file: the git push deny, bash-guard.ts or stop-gate.ts.
 * check-settings cannot require them (the local file is gitignored and absent
 * in CI), and the local file is disposable, so this is their guard.
 */

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import net from "node:net";
import path from "node:path";

import {
  bashRuleMatches,
  hookRegistered,
  OPERATOR_HOOKS,
  PUSH_DENIES,
} from "./check-settings.ts";
import { REPO_ROOT } from "./lib/docs.ts";
import { NATIVE_HOOKS_PATH } from "./lib/git.ts";
import { loadToolkit } from "./lib/toolkit.ts";

const LOCAL = ".claude/settings.local.json";
const SETTINGS = ".claude/settings.json";
const SETTINGS_TEMPLATE = "docs/engineering/templates/settings.template.json";
/** Commands the operator's push deny must stop: the bare push and a push with arguments. */
const PUSHES = ["git push", "git push origin HEAD"];
/** More local rules than this means approvals are accumulating, not configured. */
const LOCAL_RULE_LIMIT = 40;
const PORTS = [3000, 3001];

/** Shapes of real credentials. A match is reported by kind, never printed. */
const SECRET_SHAPES: [string, RegExp][] = [
  ["an API key (sk-…)", /\bsk-[A-Za-z0-9_-]{20,}/],
  ["a GitHub token", /\b(ghp|gho|ghu|ghs|ghr|github_pat)_[A-Za-z0-9_]{20,}/],
  ["an AWS access key", /\bAKIA[0-9A-Z]{16}\b/],
  ["a private key block", /-----BEGIN [A-Z ]*PRIVATE KEY-----/],
  ["a JSON web token", /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\./],
  ["a Slack token", /\bxox[abprs]-[A-Za-z0-9-]{10,}/],
  [
    "an inline credential",
    /(api[_-]?key|token|secret|password|passwd)["']?\s*[=:]\s*["']?[A-Za-z0-9_\-/+]{16,}/i,
  ],
];

const failures: string[] = [];
const warnings: string[] = [];
const lines: string[] = [];
const ok = (text: string) => lines.push(`ok    ${text}`);
const fail = (text: string, fix: string) => {
  lines.push(`FAIL  ${text}`);
  failures.push(`${text}\n      fix: ${fix}`);
};
const warn = (text: string, fix: string) => {
  lines.push(`warn  ${text}`);
  warnings.push(`${text}\n      fix: ${fix}`);
};

function run(command: string, args: string[]): string | null {
  try {
    return execFileSync(command, args, {
      cwd: REPO_ROOT,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return null;
  }
}

/** "blocked" is the sandbox refusing to bind at all, not another process holding the port. */
function probePort(port: number): Promise<"free" | "busy" | "blocked"> {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once("error", (error: NodeJS.ErrnoException) =>
      resolve(error.code === "EADDRINUSE" ? "busy" : "blocked"),
    );
    server.once("listening", () => server.close(() => resolve("free")));
    server.listen(port, "127.0.0.1");
  });
}

// Node, Yarn, corepack.
const pkg = JSON.parse(
  readFileSync(path.join(REPO_ROOT, "package.json"), "utf8"),
) as {
  packageManager?: string;
  engines?: { node?: string };
};
const wantNode = Number(pkg.engines?.node?.match(/\d+/)?.[0] ?? 22);
const haveNode = Number(process.versions.node.split(".")[0]);
if (haveNode >= wantNode) ok(`Node ${process.versions.node}`);
else
  fail(
    `Node ${process.versions.node}; the repo needs ${wantNode} or later`,
    `nvm install ${wantNode} && nvm use ${wantNode}`,
  );

const wantYarn = pkg.packageManager?.replace(/^yarn@/, "") ?? "";
const haveYarn = run("yarn", ["--version"]);
if (haveYarn === wantYarn) ok(`Yarn ${haveYarn}`);
else
  fail(
    `Yarn ${haveYarn ?? "not found"}; package.json pins ${wantYarn}`,
    "corepack enable && yarn install",
  );
if (run("corepack", ["--version"])) ok("corepack is on the path");
else
  fail(
    "corepack is not on the path",
    "install Node 22 with corepack, then corepack enable",
  );

// The layout file. loadToolkit exits 1 itself, naming each key and its fix.
const toolkit = loadToolkit();
ok(
  `toolkit.json (${toolkit.tier}; apps ${Object.keys(toolkit.apps).join(", ")})`,
);

// Hooks: every registered script exists.
if (existsSync(path.join(REPO_ROOT, SETTINGS))) {
  const text = readFileSync(path.join(REPO_ROOT, SETTINGS), "utf8");
  const scripts = [
    ...text.matchAll(/\$\{CLAUDE_PROJECT_DIR\}\/([^"'\s\\]+)/g),
  ].map((match) => match[1]!);
  const missing = scripts.filter(
    (rel) => !existsSync(path.join(REPO_ROOT, rel)),
  );
  if (missing.length > 0)
    fail(
      `registered hook scripts are missing: ${missing.join(", ")}`,
      "git restore the scripts, or remove their entries from .claude/settings.json",
    );
  else ok(`hooks: ${scripts.length} registered, every script present`);
} else {
  fail(
    `${SETTINGS} does not exist`,
    "copy docs/engineering/templates/settings.template.json to it",
  );
}

// Native git hooks (A9). A warning, not a failure, until Taylor has run the
// install once: the sandbox keeps an agent from writing .git/config.
const hooksPath = run("git", ["config", "--get", "core.hooksPath"]);
if (hooksPath === NATIVE_HOOKS_PATH)
  ok(`git hooks: core.hooksPath is ${NATIVE_HOOKS_PATH}`);
else
  warn(
    `git hooks are not installed (core.hooksPath is ${hooksPath ?? "unset"})`,
    "yarn hooks:install, in your own terminal",
  );

// Local settings: secrets and rule growth.
const flag = process.argv.indexOf("--local-settings");
const localFile = flag === -1 ? LOCAL : process.argv[flag + 1]!;
if (existsSync(path.join(REPO_ROOT, localFile))) {
  const text = readFileSync(path.join(REPO_ROOT, localFile), "utf8");
  const kinds = SECRET_SHAPES.filter(([, shape]) => shape.test(text)).map(
    ([kind]) => kind,
  );
  if (kinds.length > 0)
    fail(
      `${localFile} holds what looks like ${kinds.join(" and ")}`,
      "rotate that credential now, then delete the rule that carries it; the file is disposable",
    );
  else ok(`${localFile}: no credential-shaped strings`);
  let rules = 0;
  try {
    const permissions = (
      JSON.parse(text) as { permissions?: Record<string, unknown> }
    ).permissions;
    for (const list of Object.values(permissions ?? {}))
      if (Array.isArray(list)) rules += list.length;
  } catch {
    fail(
      `${localFile} is not valid JSON`,
      "delete it; Claude Code recreates it",
    );
  }
  if (rules > LOCAL_RULE_LIMIT)
    warn(
      `${localFile} has ${rules} rules (over ${LOCAL_RULE_LIMIT})`,
      "delete the file; move any rule you still need into .claude/settings.json with a ledger line",
    );
} else {
  ok(`${localFile}: absent`);
}

// Operator rows (MIG T2). A row the team ruled into the tracked file counts.
if (toolkit.tier !== "starter") {
  const parse = (rel: string): Record<string, unknown> => {
    try {
      const value: unknown = JSON.parse(
        readFileSync(path.join(REPO_ROOT, rel), "utf8"),
      );
      return typeof value === "object" && value !== null
        ? (value as Record<string, unknown>)
        : {};
    } catch {
      return {};
    }
  };
  const files = [parse(localFile), parse(SETTINGS)];
  const pushDenied = (settings: Record<string, unknown>) => {
    const deny = (settings.permissions as { deny?: unknown } | undefined)?.deny;
    const rules = Array.isArray(deny)
      ? deny.filter((rule): rule is string => typeof rule === "string")
      : [];
    return PUSHES.every((command) =>
      rules.some((rule) => bashRuleMatches(rule, command)),
    );
  };
  const missing: string[] = [];
  if (!files.some(pushDenied))
    missing.push(`the git push deny (${PUSH_DENIES.join(", ")})`);
  for (const hook of OPERATOR_HOOKS)
    if (!files.some((settings) => hookRegistered(settings, hook)))
      missing.push(
        `${hook.script} on ${hook.event}${hook.matcher ? ` "${hook.matcher}"` : ""}`,
      );
  for (const row of missing)
    fail(
      `${localFile} lacks the operator row ${row} (tier ${toolkit.tier})`,
      `copy it from ${SETTINGS_TEMPLATE} into ${localFile}; the file is disposable, so restore it after every reset`,
    );
  if (missing.length === 0)
    ok(
      `${localFile}: operator rows present (git push deny, ${OPERATOR_HOOKS.map((hook) => path.basename(hook.script)).join(", ")})`,
    );
}

// Ports the dev servers use. Busy is a warning: a dev server may be running.
for (const port of PORTS) {
  const state = await probePort(port);
  if (state === "free") ok(`port ${port} is free`);
  else if (state === "busy")
    warn(`port ${port} is in use`, `stop what holds it: lsof -ti:${port}`);
  else
    warn(
      `port ${port} cannot be bound from this shell`,
      "the sandbox is blocking local ports; keep sandbox.network.allowLocalBinding true in .claude/settings.json",
    );
}

console.log(lines.join("\n"));
if (warnings.length > 0)
  console.log(
    `\ndoctor — ${warnings.length} warning(s):\n  ${warnings.join("\n  ")}`,
  );
if (failures.length > 0) {
  console.error(
    `\ndoctor — ${failures.length} broken:\n  ${failures.join("\n  ")}`,
  );
  process.exit(1);
}
console.log("\ndoctor — ready.");
