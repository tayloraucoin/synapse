/**
 * What session-start records and stop-gate reads: a fingerprint of the
 * working tree per session, kept in the OS temp folder (hooks run outside the
 * sandbox), never in the repo. Beside it, the status line stop-gate last
 * printed for that tree, so a stop on an unchanged tree reuses it instead of
 * paying for `yarn status --brief` again (audit Y2). Node built-ins only, so
 * the hooks start fast.
 */

import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const DIR = path.join(tmpdir(), "pem-hook-sessions");
const fileFor = (session: string) =>
  path.join(DIR, `${session.replace(/[^A-Za-z0-9_-]/g, "")}.json`);

type Snapshot = { fingerprint: string; status?: string };

/** HEAD plus every uncommitted change, hashed: equal fingerprints mean nothing changed. */
export function treeFingerprint(root: string): string {
  const git = (args: string[]) => {
    try {
      return execFileSync("git", args, {
        cwd: root,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "ignore"],
        maxBuffer: 64 * 1024 * 1024,
      });
    } catch {
      return "";
    }
  };
  return createHash("sha256")
    .update(git(["rev-parse", "HEAD"]))
    .update(git(["status", "--porcelain=v1", "-uall"]))
    .update(git(["diff", "HEAD"]))
    .digest("hex");
}

/** Records the tree's fingerprint and, when given, the status line printed for it. */
export function saveSnapshot(
  session: string,
  fingerprint: string,
  status?: string,
) {
  mkdirSync(DIR, { recursive: true });
  const snapshot: Snapshot = status ? { fingerprint, status } : { fingerprint };
  writeFileSync(fileFor(session), JSON.stringify(snapshot));
}

function readFile(session: string): Snapshot | null {
  try {
    return JSON.parse(readFileSync(fileFor(session), "utf8")) as Snapshot;
  } catch {
    return null;
  }
}

export function readSnapshot(session: string): string | null {
  return readFile(session)?.fingerprint ?? null;
}

/** The status line saved with the fingerprint, or null when none was. */
export function readSnapshotStatus(session: string): string | null {
  return readFile(session)?.status ?? null;
}
