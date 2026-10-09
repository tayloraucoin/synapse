/**
 * The git facts the work loop reads (J5; A9, A13.2 B2). Every call is
 * read-only (the operator owns branches, PR-14), and every one runs in the repo root
 * the script was loaded from, so a copy of `tooling/` in a scratch repo
 * works on that repo.
 */

import { execFileSync } from "node:child_process";

import { REPO_ROOT } from "./docs.ts";
import { readLayout } from "./work-ids.ts";

/** Where the native git hooks live; `yarn hooks:install` points core.hooksPath here (A9). */
export const NATIVE_HOOKS_PATH = "tooling/git-hooks";

/** Runs git and returns trimmed stdout, or null when git exits non-zero. */
export function runGit(
  args: string[],
  root: string = REPO_ROOT,
): string | null {
  try {
    return execFileSync("git", args, {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
      maxBuffer: 64 * 1024 * 1024,
    }).trimEnd();
  } catch {
    return null;
  }
}

const lines = (text: string | null) =>
  (text ?? "").split("\n").filter((line) => line !== "");

/**
 * The checked-out branch, `HEAD` when detached, or null outside a repo.
 * `symbolic-ref` reads it even on an unborn branch (a fresh `git init` with no
 * commit yet), where `rev-parse` fails (WEB-10).
 */
export const getCurrentBranch = (root?: string) =>
  runGit(["symbolic-ref", "--short", "-q", "HEAD"], root) ??
  runGit(["rev-parse", "--abbrev-ref", "HEAD"], root);

export const getHead = (root?: string) => runGit(["rev-parse", "HEAD"], root);

/**
 * The ref merged work lives on: the local base branch, or its remote copy in
 * a CI checkout that has no local branch. Null when neither exists.
 */
const baseRefs = new Map<string, string | null>();
export function getBaseRef(root: string = REPO_ROOT): string | null {
  if (baseRefs.has(root)) return baseRefs.get(root)!;
  baseRefs.set(root, findBaseRef(root));
  return baseRefs.get(root)!;
}
/** The protected branch (toolkit.json), local or as its remote copy: where merged work lives. */
function findBaseRef(root: string): string | null {
  const { protectedBranch } = readLayout(root);
  for (const ref of [protectedBranch, `origin/${protectedBranch}`])
    if (runGit(["rev-parse", "--verify", "--quiet", `${ref}^{commit}`], root))
      return ref;
  return null;
}

/** A file's text on a ref, or null when it is not there. */
export function readOnRef(
  ref: string,
  rel: string,
  root?: string,
): string | null {
  try {
    return execFileSync("git", ["show", `${ref}:${rel}`], {
      cwd: root ?? REPO_ROOT,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
      maxBuffer: 64 * 1024 * 1024,
    });
  } catch {
    return null;
  }
}

/** Every file path on a ref under a folder. */
export const listOnRef = (ref: string, dir: string, root?: string) =>
  lines(runGit(["ls-tree", "-r", "--name-only", ref, "--", dir], root));

/** Tracked files that differ between a commit and the working tree, staged or not. */
export const listChangedSince = (commit: string, root?: string) =>
  lines(runGit(["diff", "--name-only", commit, "--"], root));

/** Files the working tree changes against HEAD: tracked edits, staged or not, and untracked files git does not ignore. */
export const listDirty = (root?: string) => [
  ...lines(runGit(["diff", "--name-only", "HEAD", "--"], root)),
  ...lines(runGit(["ls-files", "--others", "--exclude-standard"], root)),
];

/** Files the branch changes against the base, working tree included. */
export function listChangedAgainstBase(root?: string): string[] | null {
  const base = getBaseRef(root);
  if (!base) return null;
  const fork = runGit(["merge-base", base, "HEAD"], root);
  return fork ? listChangedSince(fork, root) : null;
}

/** Whether `ancestor` is reachable from `commit`. */
export const isAncestor = (ancestor: string, commit: string, root?: string) =>
  runGit(["merge-base", "--is-ancestor", ancestor, commit], root) !== null;

/** Local branch names. */
export const listBranches = (root?: string) =>
  lines(
    runGit(["for-each-ref", "--format=%(refname:short)", "refs/heads"], root),
  );

/** The ISO date of the last commit touching a path, or null when it has none. */
export const getLastCommitDate = (rel: string, root?: string) =>
  runGit(["log", "-1", "--format=%cI", "--", rel], root) || null;
