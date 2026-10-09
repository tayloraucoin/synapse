/**
 * Moves finished work out of the live specs tree, so it stays readable as
 * tickets pile up.
 *
 *   yarn specs:archive              move every closed one-off, and every epic
 *                                   whose tickets are all closed, into
 *                                   specs/<app>/_archive/<YYYY>/<MM>/ by close month
 *   yarn specs:archive --dry-run    print what would move and what is held, and why
 *
 * Never moves draft, open, proven, closing or migration-pending work, a folder
 * with uncommitted changes (another thread may be in it), or an epic with an
 * approved UX proposal not yet promoted. The close month is in UTC (closedAt);
 * an epic's is its latest ticket's. Records are not rewritten: the paths they name
 * follow the folder (relocate in lib/specs.ts), and every id and prefix stays
 * taken, because readSpecsTree reads the archive too.
 */

import { mkdirSync, renameSync } from "node:fs";
import path from "node:path";
import YAML from "yaml";

import { listFiles, REPO_ROOT, splitFrontmatter } from "./lib/docs.ts";
import { listDirty, runGit } from "./lib/git.ts";
import {
  ARCHIVE,
  asBuiltPath,
  fileExists,
  parseAsBuilt,
  readItemState,
  readRepoText,
  readSpecsTree,
  refreshStatusFile,
  type Item,
  type ItemState,
} from "./lib/specs.ts";
import { loadToolkit } from "./lib/toolkit.ts";

type Move = { label: string; from: string; to: string };
type Hold = { label: string; why: string };

const toolkit = loadToolkit();
const dryRun = process.argv.includes("--dry-run");
const tree = readSpecsTree(toolkit);
const dirty = listDirty();

if (tree.problems.length > 0) {
  console.error(
    `specs:archive — the specs tree has layout problems; fix them first (yarn check-specs):\n  ${tree.problems.join("\n  ")}`,
  );
  process.exit(1);
}

const stateOf = new Map<string, ItemState>(
  tree.items.map((item) => [item.id, readItemState(item, tree.specsRoot)]),
);

/**
 * When an item closed: the latest of its last result, the commit that added
 * its as-built (a later edit, such as a bulk migration, does not move it) and
 * the as-built's applied: date, which closes a migration-pending ticket.
 */
function closedAt(item: Item): string {
  const recorded = stateOf.get(item.id)!.results?.updated_at ?? "";
  const added = runGit([
    "log",
    "--diff-filter=A",
    "--format=%cI",
    "--",
    asBuiltPath(item),
  ])
    ?.split("\n")
    .at(-1);
  const applied = parseAsBuilt(readRepoText(asBuiltPath(item))).applied;
  return [
    recorded,
    added ? new Date(added).toISOString() : "",
    applied && /^\d{4}-\d{2}-\d{2}$/.test(applied) ? applied : "",
  ]
    .sort()
    .at(-1)!;
}

const destination = (app: string, at: string, from: string) =>
  `${tree.specsRoot}/${app}/${ARCHIVE}/${at.slice(0, 4)}/${at.slice(5, 7)}/${path.posix.basename(from)}`;

const uncommitted = (dir: string) =>
  dirty.filter((file) => file.startsWith(`${dir}/`));

const notClosed = (items: Item[]) =>
  items
    .map((item) => [item.id, stateOf.get(item.id)!.stage] as const)
    .filter(([, stage]) => stage !== "closed");

const summarize = (parts: string[]) =>
  parts.length > 3
    ? `${parts.slice(0, 3).join(", ")} and ${parts.length - 3} more`
    : parts.join(", ");

/** Approved proposals that truth:promote has not stamped: the epic has not shipped its UX. */
function unpromoted(epicDir: string): string[] {
  if (!fileExists(`${epicDir}/ux`)) return [];
  return listFiles(`${epicDir}/ux`)
    .filter((file) => file.endsWith(".md"))
    .filter((file) => {
      const raw = splitFrontmatter(readRepoText(file)).raw;
      const fm = (raw ? YAML.parse(raw) : null) as Record<
        string,
        unknown
      > | null;
      return fm?.status === "approved" && !fm.promoted;
    });
}

const planned: Move[] = [];
const holds: Hold[] = [];

for (const item of tree.items) {
  if (item.kind !== "one-off" || item.archived) continue;
  const label = `${item.id} one-off`;
  const stage = stateOf.get(item.id)!.stage;
  const changed = uncommitted(item.dir);
  if (stage !== "closed") holds.push({ label, why: stage });
  else if (changed.length)
    holds.push({ label, why: `uncommitted: ${summarize(changed)}` });
  else
    planned.push({
      label,
      from: item.dir,
      to: destination(item.app, closedAt(item), item.dir),
    });
}

for (const epic of tree.epics) {
  if (epic.archived) continue;
  const label = `${epic.prefix} epic`;
  const tickets = tree.items.filter((i) => i.epic?.prefix === epic.prefix);
  const open = notClosed(tickets);
  const changed = uncommitted(epic.dir);
  const proposals = unpromoted(epic.dir);
  if (tickets.length === 0) holds.push({ label, why: "no tickets yet" });
  else if (open.length)
    holds.push({
      label,
      why: summarize(open.map(([id, stage]) => `${id} ${stage}`)),
    });
  else if (changed.length)
    holds.push({ label, why: `uncommitted: ${summarize(changed)}` });
  else if (proposals.length)
    holds.push({
      label,
      why: `approved proposals not promoted (yarn truth:promote ${epic.prefix}): ${summarize(proposals)}`,
    });
  else {
    const at = tickets.map(closedAt).sort().at(-1)!;
    planned.push({
      label: `${label}, ${tickets.length} ticket(s)`,
      from: epic.dir,
      to: destination(epic.app, at, epic.dir),
    });
  }
}

const moves = planned.filter((move) => {
  if (!fileExists(move.to)) return true;
  holds.push({ label: move.label, why: `${move.to} already exists` });
  return false;
});

const lines = [
  ...moves.map((m) => `  move  ${m.label}: ${m.from}/ → ${m.to}/`),
  ...holds.map((h) => `  hold  ${h.label}: ${h.why}`),
];
const head = `specs:archive${dryRun ? " --dry-run" : ""} — ${moves.length} to move, ${holds.length} held${lines.length ? ":" : "."}`;

if (dryRun) {
  console.log([head, ...lines, "Nothing moved (--dry-run)."].join("\n"));
  process.exit(0);
}

for (const move of moves) {
  mkdirSync(path.join(REPO_ROOT, path.posix.dirname(move.to)), {
    recursive: true,
  });
  renameSync(path.join(REPO_ROOT, move.from), path.join(REPO_ROOT, move.to));
}
if (moves.length) refreshStatusFile(toolkit);
console.log(
  [
    head,
    ...lines,
    moves.length
      ? `Moved ${moves.length}, and regenerated ${tree.specsRoot}/_status.md. Next: yarn check-specs, then commit each move with its old and new paths.`
      : "Nothing to move.",
  ].join("\n"),
);
