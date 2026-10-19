/**
 * Promotes an epic's approved UX proposals into the living truth (A8).
 *
 *   yarn truth:promote <EPIC>
 *
 * For each proposal under the epic's ux/ that is approved and not yet
 * promoted, and whose citing tickets are all merged or closed on this branch:
 * copies its body to its target under specs/<app>/ux/ and stamps promoted:
 * with today's date. The promoting agent then reconciles the truth file with
 * those tickets' as-built Deviations; the PR diff shows the result. A promoted
 * proposal freezes once merged (check-specs).
 */

import YAML from "yaml";

import { listFiles, splitFrontmatter } from "./lib/docs.ts";
import {
  fileExists,
  readContract,
  readItemState,
  readRepoText,
  readSpecsTree,
  refreshStatusFile,
  writeRepoText,
} from "./lib/specs.ts";
import { loadToolkit } from "./lib/toolkit.ts";

const toolkit = loadToolkit();
const prefix = process.argv[2];
const tree = readSpecsTree(toolkit);
const epic = tree.epics.find((e) => e.prefix === prefix);
if (!epic) {
  console.error(
    `truth:promote — no epic ${prefix ?? "(none named)"}; epics: ${tree.epics.map((e) => e.prefix).join(", ") || "none"}`,
  );
  process.exit(1);
}

const today = new Date().toISOString().slice(0, 10);
const promoted: string[] = [];
const waiting: string[] = [];
for (const file of listFiles(`${epic.dir}/ux`).filter((f) =>
  f.endsWith(".md"),
)) {
  const { raw, body } = splitFrontmatter(readRepoText(file));
  const doc = YAML.parseDocument(raw ?? "");
  const target = String(doc.get("target") ?? "");
  if (doc.get("status") !== "approved" || doc.get("promoted") || !target)
    continue;
  const citing = tree.items.filter((item) => {
    const cites = readContract(item).contract?.cites ?? [];
    return cites.includes(target) || cites.includes(file);
  });
  const open = citing.filter((item) => {
    const state = readItemState(item, tree.specsRoot);
    return (
      !state.merged &&
      state.stage !== "closed" &&
      state.stage !== "migration pending"
    );
  });
  if (citing.length === 0 || open.length > 0) {
    waiting.push(
      `${file} (${citing.length === 0 ? "no ticket cites it" : `waiting on ${open.map((i) => i.id).join(", ")}`})`,
    );
    continue;
  }
  const isNew = !fileExists(target);
  writeRepoText(
    target,
    `---\nsource: ${file}\npromoted: ${today}\n---\n${body}`,
  );
  doc.set("promoted", today);
  writeRepoText(file, `---\n${doc.toString({ lineWidth: 0 })}---\n${body}`);
  promoted.push(`${file} → ${target}${isNew ? " (new)" : ""}`);
}
refreshStatusFile(toolkit);
console.log(
  [
    `truth:promote — ${promoted.length} promoted, ${waiting.length} waiting.`,
    ...promoted.map((p) => `  promoted ${p}`),
    ...waiting.map((w) => `  waiting  ${w}`),
    ...(promoted.length
      ? [
          "Next: reconcile each truth file with its tickets' as-built Deviations, in this PR.",
        ]
      : []),
  ].join("\n"),
);
