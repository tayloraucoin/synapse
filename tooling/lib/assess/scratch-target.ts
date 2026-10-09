/**
 * Scratch target repos for the assess tests (tooling/migrate-assess*.test.ts):
 * a real git repository in $TMPDIR per case, written from a map of files and
 * committed, so detectors read `git ls-files` exactly as they do in a target.
 * Every repo and file here is synthetic. Test-only; node built-ins only, like
 * the rest of this folder.
 */

import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const scratch = mkdtempSync(
  path.join(process.env.TMPDIR ?? tmpdir(), "pem-assess-"),
);
let counter = 0;

export const removeScratch = () =>
  rmSync(scratch, { recursive: true, force: true });

export const git = (cwd: string, ...args: string[]) =>
  execFileSync("git", args, {
    cwd,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  }).trim();

export function writeFiles(dir: string, files: Record<string, string>) {
  for (const [rel, text] of Object.entries(files)) {
    mkdirSync(path.dirname(path.join(dir, rel)), { recursive: true });
    writeFileSync(path.join(dir, rel), text);
  }
}

export function commitAll(dir: string, message = "fixture") {
  git(dir, "add", "-A");
  git(dir, "commit", "-q", "--no-verify", "--allow-empty", "-m", message);
}

/** A new git repo on `main` holding `files`, committed. */
export function scratchTarget(
  files: Record<string, string>,
  name = "target",
): string {
  const dir = path.join(scratch, `${name}-${++counter}`);
  mkdirSync(dir, { recursive: true });
  git(dir, "init", "-q", "-b", "main");
  git(dir, "config", "user.email", "fixture@example.invalid");
  git(dir, "config", "user.name", "Fixture");
  git(dir, "config", "commit.gpgsign", "false");
  writeFiles(dir, files);
  commitAll(dir);
  return dir;
}

/** A bare repo to act as a target's origin. */
export function scratchOrigin(): string {
  const dir = path.join(scratch, `origin-${++counter}.git`);
  mkdirSync(dir, { recursive: true });
  git(dir, "init", "-q", "--bare", "-b", "main");
  return dir;
}

export const pkg = (body: Record<string, unknown>) =>
  `${JSON.stringify({ name: "fixture", private: true, ...body }, null, 2)}\n`;

/** Every file under dir, .git included, by path and content hash. */
export function snapshotTree(dir: string): Map<string, string> {
  const out = new Map<string, string>();
  const walk = (abs: string) => {
    for (const entry of readdirSync(abs, { withFileTypes: true })) {
      const child = path.join(abs, entry.name);
      if (entry.isDirectory()) walk(child);
      else
        out.set(
          path.relative(dir, child),
          createHash("sha256").update(readFileSync(child)).digest("hex"),
        );
    }
  };
  walk(dir);
  return out;
}
