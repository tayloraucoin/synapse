/**
 * The preconditions a migration run checks before it writes anything and
 * again before its last commit (MIG T4, assess.md "T4 Preconditions and
 * branches"; the runbook's steps 0 and 8). Each rule returns { id, ok, fix },
 * every rule runs so one run names every failure, and the protected branch is
 * the operator's answer (`--protected`), never read from origin/HEAD.
 *
 * The start set (--check): a clean tree, untracked files included; HEAD on a
 * branch that is not the protected one; no commits beyond the fork point; the
 * protected branch equal to its copy under refs/remotes/origin/ (an upstream
 * is never read, since it may be unset); the protected branch holding the
 * fork point; no toolkit.json and no tracked local settings file; Node 22.18
 * or later. The end set (--check --end) skips the clean-tree, fork-point and
 * toolkit.json rules and fails when the protected branch moved past the fork
 * point.
 */

import type { Repo } from "./repo.ts";

export type Precondition = { id: string; ok: boolean; fix: string };

/** Type stripping runs .ts files unflagged from this release (verified at MIG-7). */
export const NODE_FLOOR = "22.18.0";
export const LOCAL_SETTINGS = ".claude/settings.local.json";

export type PreconditionOptions = {
  /** The branch merged work lives on, from the interview; null when not given. */
  protectedBranch: string | null;
  /** The end check, before the last commit. */
  end?: boolean;
  /** The Node version to judge; tests inject one. */
  nodeVersion?: string;
};

const parseVersion = (v: string) =>
  v
    .replace(/^v/, "")
    .split(".")
    .map((n) => Number.parseInt(n, 10) || 0);

/** Whether a Node version meets the floor. */
export function nodeFloorOk(
  version: string,
  floor: string = NODE_FLOOR,
): boolean {
  const a = parseVersion(version);
  const b = parseVersion(floor);
  for (let i = 0; i < 3; i++) {
    const x = a[i] ?? 0;
    const y = b[i] ?? 0;
    if (x !== y) return x > y;
  }
  return true;
}

export function checkPreconditions(
  repo: Repo,
  options: PreconditionOptions,
): Precondition[] {
  const end = options.end === true;
  const out: Precondition[] = [];
  const rule = (id: string, ok: boolean, fix: string) =>
    out.push({ id, ok, fix: ok ? "" : fix });
  const rev = (ref: string) =>
    repo.git("rev-parse", "--verify", "-q", `${ref}^{commit}`);
  const isAncestor = (a: string, b: string) =>
    repo.git("merge-base", "--is-ancestor", a, b) !== null;

  if (!end) {
    const status =
      repo.git("status", "--porcelain", "--untracked-files=all") ?? "";
    const entries = status.split("\n").filter(Boolean);
    rule(
      "clean-tree",
      entries.length === 0,
      `the tree has ${entries.length} changed or untracked entries (${entries
        .slice(0, 3)
        .map((e) => e.slice(3))
        .join(
          ", ",
        )}${entries.length > 3 ? ", …" : ""}); the operator commits or removes them, outside the thread`,
    );
  }

  const branch = repo.git("symbolic-ref", "-q", "--short", "HEAD");
  rule(
    "on-a-branch",
    Boolean(branch),
    "HEAD is detached; the operator checks out the migration branch (git switch <branch>)",
  );

  const protectedBranch = options.protectedBranch;
  rule(
    "protected-named",
    Boolean(protectedBranch),
    "no protected branch was given; name the branch work merges into with --protected <branch> (the interview's round 0)",
  );
  if (!protectedBranch) {
    rule(
      "no-toolkit-json",
      !repo.tracked.has("toolkit.json"),
      "toolkit.json already exists; this repo has been set up before, so the run stops for the operator",
    );
    rule(
      "local-settings-untracked",
      !repo.tracked.has(LOCAL_SETTINGS),
      `${LOCAL_SETTINGS} is tracked; the operator removes it from the index (git rm --cached) and ignores it`,
    );
    nodeRule();
    return out;
  }

  // A local branch by name, never a tag or a remote-tracking ref: `origin/main` is a typo here.
  const protectedTip = rev(`refs/heads/${protectedBranch}`);
  rule(
    "protected-exists",
    Boolean(protectedTip),
    `no local branch ${protectedBranch}; name the branch work merges into, without a remote prefix, or fetch it first`,
  );

  if (branch) {
    rule(
      "not-on-protected",
      branch !== protectedBranch,
      `the protected branch ${protectedBranch} is checked out; the operator creates and checks out the migration branch (git switch -c <name>) and never commits on ${protectedBranch}`,
    );
  }

  if (protectedTip) {
    const remoteRef = `refs/remotes/origin/${protectedBranch}`;
    const remoteTip = rev(remoteRef);
    rule(
      "protected-pushed",
      remoteTip !== null && remoteTip === protectedTip,
      remoteTip === null
        ? `${protectedBranch} has no copy under ${remoteRef}; the operator pushes it (git push origin ${protectedBranch}) or fetches`
        : `${protectedBranch} differs from ${remoteRef}; the operator fetches and merges, or pushes, until the two are equal`,
    );

    const head = rev("HEAD");
    if (head) {
      if (!end) {
        const protectedIsAncestor = isAncestor(protectedTip, head);
        // Remote branches holding HEAD, the migration branch's own copy aside
        // (a retry after an aborted day pushed it; those commits are still its own).
        const pushedElsewhere = (
          repo.git("branch", "-r", "--contains", head) ?? ""
        )
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean)
          .some((name) => name !== `origin/${branch}`);
        const ahead = Number(
          repo.git("rev-list", "--count", `${protectedBranch}..HEAD`) ?? "0",
        );
        // Commits past the protected tip that no other remote branch holds are the migration branch's own.
        const ownCommits =
          head !== protectedTip && protectedIsAncestor && !pushedElsewhere;
        rule(
          "fork-point-clean",
          !ownCommits,
          `the migration branch already has ${ahead} commits beyond its fork point from ${protectedBranch}; the operator starts from a fresh branch off ${protectedBranch}`,
        );
        // Behind the protected tip: the merge base is HEAD, not the tip, as after the operator pulls the protected branch and keeps the old migration branch.
        const behind = head !== protectedTip && isAncestor(head, protectedTip);
        // HEAD held by the protected branch's remote copy: the local protected branch is stale behind its own remote, and protected-pushed carries the fix.
        const remoteHoldsHead = Boolean(
          remoteTip && isAncestor(head, remoteTip),
        );
        const holds = behind
          ? false
          : ownCommits || head === protectedTip || remoteHoldsHead;
        rule(
          "protected-holds-fork",
          holds,
          behind
            ? `the migration branch is behind ${protectedBranch} by ${repo.git("rev-list", "--count", `HEAD..${protectedBranch}`) ?? "?"} commits; the operator resets it to ${protectedBranch}'s tip (git reset --hard ${protectedBranch}) before the run`
            : `${protectedBranch} does not hold the fork point (${head.slice(0, 7)} is not on it); set the protected branch to the branch work merges into`,
        );
      } else {
        rule(
          "protected-holds-fork",
          isAncestor(protectedTip, head),
          `${protectedBranch} moved during the day (${protectedTip.slice(0, 7)} is not behind HEAD); the operator rebases or merges, in their own hands`,
        );
      }
    }
  }

  if (!end)
    rule(
      "no-toolkit-json",
      !repo.tracked.has("toolkit.json"),
      "toolkit.json already exists; this repo has been set up before, so the run stops for the operator",
    );
  rule(
    "local-settings-untracked",
    !repo.tracked.has(LOCAL_SETTINGS),
    `${LOCAL_SETTINGS} is tracked; the operator removes it from the index (git rm --cached) and ignores it`,
  );
  nodeRule();
  return out;

  function nodeRule() {
    const version =
      options.nodeVersion ??
      process.env.PEM_ASSESS_NODE_VERSION ??
      process.versions.node;
    rule(
      "node-floor",
      nodeFloorOk(version),
      `Node ${version} is below ${NODE_FLOOR}, the first release that runs .ts files unflagged; install Node ${NODE_FLOOR} or later`,
    );
  }
}
