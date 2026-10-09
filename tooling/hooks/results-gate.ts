/**
 * PreToolUse guard for the Edit, Write and NotebookEdit tools (E-17; A9).
 *
 * Exit 0 lets the edit run. Exit 2 blocks it, and stderr names the command
 * that writes the file instead. Blocks a direct edit to:
 *   - a results.json under the specs root (only tooling writes results);
 *   - a review-<role>.md or tickets/_preflight.md (written by review:run);
 *   - the generated _status.md;
 *   - an as-built.md on the protected branch (toolkit.json), unless the edit changes only its
 *     `applied:` value.
 *
 * The shell's route to the same files is bash-guard's; the boundary behind
 * both is check-specs' run records and hashes. Kept free of workspace
 * imports so it starts fast. Fixtures: tooling/hooks/fixtures/results-gate.json.
 */

import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT =
  process.env.CLAUDE_PROJECT_DIR ??
  path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

/** Set only by the fixture runner: files on main, and files on disk, by repo path. */
type FixtureContext = {
  onMain?: Record<string, string>;
  onDisk?: Record<string, string>;
};
const fixture: FixtureContext | null = process.env.PEM_HOOK_FIXTURE_CONTEXT
  ? (JSON.parse(process.env.PEM_HOOK_FIXTURE_CONTEXT) as FixtureContext)
  : null;

/** Where specs live and which branch holds merged work (toolkit.json). */
function readLayout(): { specsRoot: string; protectedBranch: string } {
  try {
    const toolkit = JSON.parse(
      readFileSync(path.join(ROOT, "toolkit.json"), "utf8"),
    ) as { specsRoot: string; protectedBranch?: string };
    return {
      specsRoot: toolkit.specsRoot,
      protectedBranch: toolkit.protectedBranch ?? "main",
    };
  } catch {
    return { specsRoot: "specs", protectedBranch: "main" };
  }
}
const layout = readLayout();

function onMain(rel: string): string | null {
  if (fixture) return fixture.onMain?.[rel] ?? null;
  try {
    return execFileSync("git", ["show", `${layout.protectedBranch}:${rel}`], {
      cwd: ROOT,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
  } catch {
    return null;
  }
}

function onDisk(rel: string): string {
  if (fixture) return fixture.onDisk?.[rel] ?? "";
  try {
    return readFileSync(path.join(ROOT, rel), "utf8");
  } catch {
    return "";
  }
}

const withoutApplied = (text: string) =>
  text.replace(/^applied:.*$/m, "applied:");

let input: {
  tool_name?: string;
  tool_input?: {
    file_path?: unknown;
    notebook_path?: unknown;
    old_string?: unknown;
    new_string?: unknown;
    replace_all?: unknown;
    content?: unknown;
  };
};
try {
  input = JSON.parse(readFileSync(0, "utf8"));
} catch {
  process.exit(0);
}
const target = input.tool_input?.file_path ?? input.tool_input?.notebook_path;
if (typeof target !== "string") process.exit(0);

const rel = path
  .relative(ROOT, path.resolve(ROOT, target))
  .split(path.sep)
  .join("/");
const root = layout.specsRoot;
if (rel.startsWith("..") || !rel.startsWith(`${root}/`)) process.exit(0);

const deny = (rule: string, message: string): never => {
  console.error(`results-gate [${rule}]: ${message}`);
  process.exit(2);
};
const base = path.posix.basename(rel);

if (base === "results.json")
  deny(
    "results",
    "results.json is written only by tooling, so the builder cannot grade itself. Run: yarn contract:run <id>   or   yarn contract:record <id> <criterion> --evidence <path>",
  );
const inTicket = /^[A-Z][A-Z0-9]{1,4}-[0-9]+-/.test(
  path.posix.basename(path.posix.dirname(rel)),
);
if (
  (inTicket && /^review-[a-z]+\.md$/.test(base)) ||
  (base === "_preflight.md" && rel.endsWith("/tickets/_preflight.md"))
)
  deny(
    "review",
    "Reviews are written only by their run. Run: yarn review:run <role> <id>   (the pre-flight: yarn review:run vigil <EPIC>)",
  );
if (rel === `${root}/_status.md`)
  deny("status", "_status.md is generated. Run: yarn status");

if (base === "as-built.md") {
  const merged = onMain(rel);
  if (merged === null) process.exit(0);
  let next: string;
  const tool = input.tool_input!;
  if (input.tool_name === "Write" && typeof tool.content === "string")
    next = tool.content;
  else if (
    typeof tool.old_string === "string" &&
    typeof tool.new_string === "string"
  ) {
    const current = onDisk(rel);
    next =
      tool.replace_all === true
        ? current.split(tool.old_string).join(tool.new_string)
        : current.replace(tool.old_string, () => tool.new_string as string);
  } else next = "";
  if (withoutApplied(next) !== withoutApplied(merged))
    deny(
      "as-built",
      `This as-built.md is on ${layout.protectedBranch} and immutable except its applied: value. Change only that line; a new result belongs to a new item.`,
    );
}
process.exit(0);
