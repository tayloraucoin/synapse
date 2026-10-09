/**
 * The target repo as assess sees it: its tracked files and nothing else (MIG T1).
 *
 * Lists tracked files once with `git --no-optional-locks ls-files -z`, so a
 * worktree, a build folder or an untracked env file is never walked, and paths
 * with spaces or em-dashes survive. Reads a file only when it is tracked, never
 * one named like an env file, and records every path it opens so a test can
 * prove what was read. Git runs without optional locks, so nothing under the
 * target is written, the index included.
 *
 * Node built-ins only: assess runs from a cold session before any install.
 */

import { execFileSync } from "node:child_process";
import { readFileSync, realpathSync, statSync } from "node:fs";
import path from "node:path";

export type Repo = {
  /** Absolute path of the target's top level. */
  root: string;
  commit: string | null;
  /** Tracked paths, relative to root, in git's order. */
  files: string[];
  tracked: Set<string>;
  /** Every absolute path read so far, in order. */
  opened: string[];
  /** A tracked file's text, or null when it is untracked, unreadable or an env file. */
  read(rel: string): string | null;
  /** A tracked JSON file, parsed, or null. */
  json<T = Record<string, unknown>>(rel: string): T | null;
  /** A tracked file's size in bytes, or null. */
  size(rel: string): number | null;
  /** Runs a read-only git command in the target and returns its trimmed stdout, or null on failure. */
  git(...args: string[]): string | null;
};

/** A name the sandbox and the practice treat as a secret: never opened. */
export const isEnvFile = (rel: string) =>
  /^\.env(\..*)?$/.test(path.posix.basename(rel));

export function runGit(cwd: string, args: string[]): string | null {
  try {
    return execFileSync("git", ["--no-optional-locks", ...args], {
      cwd,
      encoding: "utf8",
      maxBuffer: 256 * 1024 * 1024,
      stdio: ["ignore", "pipe", "ignore"],
      env: { ...process.env, GIT_OPTIONAL_LOCKS: "0" },
    }).replace(/\n$/, "");
  } catch {
    return null;
  }
}

export class NotARepo extends Error {}

export function openRepo(target: string): Repo {
  const dir = path.resolve(target);
  let exists = false;
  try {
    exists = statSync(dir).isDirectory();
  } catch {
    exists = false;
  }
  if (!exists) throw new NotARepo(`${dir} is not a folder.`);
  const top = runGit(dir, ["rev-parse", "--show-toplevel"]);
  if (!top) throw new NotARepo(`${dir} is not inside a git repository.`);
  const root = realpathSync(top);
  const listing = runGit(root, ["ls-files", "-z"]) ?? "";
  const files = listing.split("\0").filter(Boolean);
  const tracked = new Set(files);
  const opened: string[] = [];

  const read = (rel: string): string | null => {
    if (!tracked.has(rel) || isEnvFile(rel)) return null;
    const abs = path.join(root, rel);
    opened.push(abs);
    try {
      return readFileSync(abs, "utf8");
    } catch {
      return null;
    }
  };

  return {
    root,
    commit: runGit(root, ["rev-parse", "HEAD"]),
    files,
    tracked,
    opened,
    read,
    json<T>(rel: string): T | null {
      const text = read(rel);
      if (text === null) return null;
      try {
        return JSON.parse(text) as T;
      } catch {
        return null;
      }
    },
    size(rel: string): number | null {
      if (!tracked.has(rel)) return null;
      try {
        return statSync(path.join(root, rel)).size;
      } catch {
        return null;
      }
    },
    git: (...args: string[]) => runGit(root, args),
  };
}

/** The shape of a package.json that assess reads. */
export type PackageJson = {
  packageManager?: string;
  engines?: Record<string, string>;
  workspaces?: string[] | { packages?: string[] };
  scripts?: Record<string, string>;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
};

/** Every tracked package.json, root first, parsed. */
export function listPackages(repo: Repo): { rel: string; pkg: PackageJson }[] {
  const rels = repo.files.filter(
    (rel) => rel === "package.json" || rel.endsWith("/package.json"),
  );
  rels.sort((a, b) => a.split("/").length - b.split("/").length);
  return rels.flatMap((rel) => {
    const pkg = repo.json<PackageJson>(rel);
    return pkg ? [{ rel, pkg }] : [];
  });
}
