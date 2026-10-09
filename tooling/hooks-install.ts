/**
 * Installs the native git hooks (A9) by pointing core.hooksPath at
 * tooling/git-hooks/. No hook manager is added.
 *
 *   yarn hooks:install
 *
 * The sandbox write-protects .git/config, so a person runs this once (or
 * approves it unsandboxed). `yarn doctor` warns until it is done.
 */

import { execFileSync } from "node:child_process";

import { REPO_ROOT } from "./lib/docs.ts";
import { NATIVE_HOOKS_PATH as HOOKS_PATH } from "./lib/git.ts";

try {
  execFileSync("git", ["config", "core.hooksPath", HOOKS_PATH], {
    cwd: REPO_ROOT,
    stdio: ["ignore", "ignore", "pipe"],
  });
} catch (error) {
  console.error(
    `hooks:install — could not set core.hooksPath (${error instanceof Error ? error.message.split("\n")[0] : String(error)}). From an agent's sandboxed shell, .git/config is read-only: run it in your own terminal.`,
  );
  process.exit(1);
}
console.log(
  `hooks:install — core.hooksPath is ${HOOKS_PATH}: commit-msg and pre-commit run on every commit.`,
);
