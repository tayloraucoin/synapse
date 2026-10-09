/**
 * SessionStart hook (E-19; A13.3; V2).
 *
 * Prints one plain-text line, at most 600 characters, which Claude Code adds
 * to the session's context: the spine's commit (the spine is whichever of
 * AGENTS.md, CLAUDE.md and docs/index.md exist: an overlay run stopped
 * part-way may not have written all three, MIG T3), so an agent can tell when the
 * text it runs on is older than the files (Crucible, audit day), and
 * `yarn status --brief`. The output never opens with "{" (V2: from v2.1.248,
 * stdout that looks like JSON and fails to parse is dropped).
 *
 * It also records the working tree's fingerprint for this session, so
 * stop-gate can tell whether the session changed anything.
 *
 * Fixtures: tooling/hooks/fixtures/session-start.json, run by `yarn test:hooks`.
 */

import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  readSnapshot,
  saveSnapshot,
  treeFingerprint,
} from "./session-state.ts";

const ROOT =
  process.env.CLAUDE_PROJECT_DIR ??
  path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const LIMIT = 600;
const SPINE = ["AGENTS.md", "CLAUDE.md", "docs/index.md"];

/** Set only by the fixture runner; `root` is the repo-relative folder the spine is looked for in. */
type FixtureContext = { spine?: string; brief?: string; root?: string };
const fixture: FixtureContext | null = process.env.PEM_HOOK_FIXTURE_CONTEXT
  ? (JSON.parse(process.env.PEM_HOOK_FIXTURE_CONTEXT) as FixtureContext)
  : null;

const run = (command: string, args: string[]) => {
  const result = spawnSync(command, args, { cwd: ROOT, encoding: "utf8" });
  return result.status === 0 ? result.stdout.trim() : null;
};

let input: { session_id?: string; source?: string } = {};
try {
  input = JSON.parse(readFileSync(0, "utf8"));
} catch {
  // No input still gets the line: the status is worth more than the guard.
}

const present = SPINE.filter((rel) =>
  existsSync(path.join(ROOT, fixture?.root ?? "", rel)),
);
const spine =
  fixture?.spine ??
  (() => {
    if (present.length === 0) return "";
    // An untracked spine has no commit yet: git log prints nothing.
    const commit = run("git", [
      "log",
      "-1",
      "--format=%h %cs",
      "--",
      ...present,
    ]);
    const edited = (
      run("git", ["status", "--porcelain", "--", ...present]) ?? ""
    )
      .split("\n")
      .filter(Boolean).length;
    return `${commit || "uncommitted"}${edited ? `, plus ${edited} uncommitted edit(s): reread them` : ""}`;
  })();
const brief =
  fixture?.brief ??
  run(process.execPath, [path.join(ROOT, "tooling/status.ts"), "--brief"]) ??
  "Status unavailable: run yarn status.";

// Recorded once per session: a resume, clear or compaction keeps the first
// fingerprint, so the stop gate never reports "nothing changed" for a check
// that did not run (Crucible, J7 stop).
if (!fixture && input.session_id && readSnapshot(input.session_id) === null)
  saveSnapshot(input.session_id, treeFingerprint(ROOT));

const line = present.length
  ? `Spine (${present.join(", ")}) as of ${spine}. ${brief}`
  : `Spine: none of ${SPINE.join(", ")} exists. ${brief}`;
process.stdout.write(
  `${line.length > LIMIT ? `${line.slice(0, LIMIT - 1)}…` : line}\n`,
);
