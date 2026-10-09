/**
 * Native pre-commit hook (A9): when a commit stages anything under the specs
 * root, check-specs runs on the live tree (results integrity, closure,
 * immutability; its fixtures are verify's job). It reads
 * the working tree, not the staged snapshot; CI's run of `yarn verify` is the
 * gate on what merges.
 */

import { execFileSync, spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { readLayout } from "../lib/work-ids.ts";

const ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);
const staged = execFileSync("git", ["diff", "--cached", "--name-only"], {
  cwd: ROOT,
  encoding: "utf8",
})
  .split("\n")
  .filter(Boolean);
const { specsRoot } = readLayout(ROOT);
if (!staged.some((file) => file.startsWith(`${specsRoot}/`))) process.exit(0);

const result = spawnSync(
  process.execPath,
  [path.join(ROOT, "tooling/check-specs.ts"), "--skip-fixtures"],
  { cwd: ROOT, stdio: "inherit" },
);
process.exit(result.status ?? 1);
