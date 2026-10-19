/**
 * Native commit-msg hook (A9): on an agent branch, the message opens with a
 * work-id. Taylor's own commits on other branches are free (convention 2).
 * The same law as bash-guard, for Cursor sessions and people.
 */

import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { getCurrentBranch } from "../lib/git.ts";
import { hasWorkId, isAgentBranch, readLayout } from "../lib/work-ids.ts";

const ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);
const file = process.argv[2];
if (!file) process.exit(0);

// Reads an unborn branch too: a product's first commit follows a fresh git init.
const branch = getCurrentBranch(ROOT) ?? "";
const layout = readLayout(ROOT);
if (!isAgentBranch(branch, layout.branchPattern)) process.exit(0);

const subject =
  readFileSync(file, "utf8")
    .split("\n")
    .find((line) => line.trim() !== "" && !line.startsWith("#")) ?? "";
if (hasWorkId(subject, layout.prefixes)) process.exit(0);
console.error(
  `commit-msg: on ${branch}, the message opens with a work-id, as in "${layout.prefixes[0] ?? "PEM"}: <outcome>" or "WEB-41: <outcome>". Admitted prefixes: ${[...new Set(layout.prefixes)].join(", ")}.`,
);
process.exit(1);
