/**
 * What the report lists but never scores (assess.md, "Not scored"): the
 * practice paths that already exist in the target (collisions, read from the
 * toolkit's day-one manifest), and hygiene: the branch and its remote copy,
 * the working tree, git worktrees, and tracked files over 10 MB.
 */

import { readFileSync } from "node:fs";
import path from "node:path";

import type { Repo } from "./repo.ts";

export const LARGE_FILE_BYTES = 10 * 1024 * 1024;

export type HygieneReport = {
  branch: string | null;
  remote: {
    ref: string;
    state: "equal" | "ahead" | "behind" | "diverged" | "absent";
    ahead: number;
    behind: number;
  } | null;
  dirty: number;
  worktrees: string[];
  largeFiles: { path: string; bytes: number }[];
};

/** Every JavaScript repo has one; its presence is no collision. */
const EVERY_REPO = new Set(["package.json"]);

/**
 * The manifest's paths with no placeholder, folders kept with their trailing
 * slash, plus the practice folder each file entry under docs/ or .claude/
 * sits in (docs/decisions/ for its ledger), so a host folder of the same name
 * is a collision even when none of its files is.
 */
export function readManifestPaths(toolkitRoot: string): string[] {
  try {
    const text = readFileSync(
      path.join(toolkitRoot, "docs/runbooks/migrate/manifest.json"),
      "utf8",
    );
    const data = JSON.parse(text) as { entries?: { path?: unknown }[] };
    const paths = (data.entries ?? [])
      .map((e) => e.path)
      .filter(
        (p): p is string =>
          typeof p === "string" && !/[{}]/.test(p) && !EVERY_REPO.has(p),
      );
    const folders = paths
      .filter((p) => !p.endsWith("/") && /^(?:docs|\.claude)\/[^/]+\//.test(p))
      .map((p) => `${p.split("/").slice(0, 2).join("/")}/`);
    return [...new Set([...paths, ...folders])];
  } catch {
    return [];
  }
}

/** Practice paths the target already holds: a tracked file, or any tracked file under a folder entry. */
export function listCollisions(repo: Repo, manifestPaths: string[]): string[] {
  return manifestPaths.filter((p) =>
    p.endsWith("/")
      ? repo.files.some((rel) => rel.startsWith(p))
      : repo.tracked.has(p),
  );
}

export function readHygiene(repo: Repo): HygieneReport {
  const head = repo.git("symbolic-ref", "-q", "--short", "HEAD");
  const branch = head || null;
  let remote: HygieneReport["remote"] = null;
  if (branch) {
    const ref = `refs/remotes/origin/${branch}`;
    const exists = repo.git("rev-parse", "--verify", "-q", ref);
    if (!exists) remote = { ref, state: "absent", ahead: 0, behind: 0 };
    else {
      const counts =
        repo.git("rev-list", "--left-right", "--count", `${branch}...${ref}`) ??
        "0\t0";
      const [ahead = 0, behind = 0] = counts.split(/\s+/).map(Number);
      const state =
        ahead && behind
          ? "diverged"
          : ahead
            ? "ahead"
            : behind
              ? "behind"
              : "equal";
      remote = { ref, state, ahead, behind };
    }
  }
  const status =
    repo.git("status", "--porcelain", "--untracked-files=all") ?? "";
  const dirty = status ? status.split("\n").filter(Boolean).length : 0;
  const list = repo.git("worktree", "list", "--porcelain") ?? "";
  const worktrees = list
    .split("\n")
    .filter((line) => line.startsWith("worktree "))
    .map((line) => line.slice("worktree ".length))
    .slice(1);
  const largeFiles = repo.files
    .map((rel) => ({ path: rel, bytes: repo.size(rel) ?? 0 }))
    .filter((f) => f.bytes > LARGE_FILE_BYTES);
  return { branch, remote, dirty, worktrees, largeFiles };
}
