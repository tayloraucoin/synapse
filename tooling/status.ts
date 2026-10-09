/**
 * Status is generated, never hand-kept (ruling (b), (i); E-26, A4).
 *
 *   yarn status                  regenerate specs/_status.md and summarize it
 *   yarn status <id>             "Left to go" for one item, live: staleness,
 *                                pending migration, not verified, open decisions,
 *                                and the cost block yarn cost <id> --record wrote
 *   yarn status --brief          one line of at most 600 characters (SessionStart)
 *   yarn status --deviations     every as-built's Deviations, oldest first
 *   yarn status --epic <EPIC>    an epic's tickets in build order, from depends_on,
 *                                with the critical path of what is left
 */

import { getLastCommitDate } from "./lib/git.ts";
import {
  asBuiltPath,
  compareIds,
  fileExists,
  findItem,
  formatCost,
  formatTicketCost,
  leftOf,
  openDecisions,
  parseAsBuilt,
  qaOf,
  readItemState,
  readRepoText,
  readSpecsTree,
  refreshStatusFile,
  renderBrief,
  type ItemState,
} from "./lib/specs.ts";
import { loadToolkit } from "./lib/toolkit.ts";

const BRIEF_LIMIT = 600;

const toolkit = loadToolkit();
const args = process.argv.slice(2);
const tree = readSpecsTree(toolkit);
const states = () =>
  tree.items.map((item) => readItemState(item, tree.specsRoot));
const done = (state: ItemState) =>
  state.stage === "closed" || state.stage === "migration pending";

function one(id: string) {
  const item = findItem(tree, id);
  if (!item) {
    console.error(`status — no item ${id} under ${toolkit.specsRoot}/`);
    process.exit(1);
  }
  // One ticket, asked for by name: with --strict, the one place a rewritten
  // evidence log or (at Q3 only) a later commit is shown (PR-19, C7). A
  // review PASS goes stale only when the criteria changed after it (WEB-12).
  const state = readItemState(item, tree.specsRoot, { staleness: true });
  const qa = state.contract ? qaOf(state.contract) : null;
  const lines = [
    `${item.id} ${item.slug} (${item.kind}${qa ? `, ${qa}` : ""}, ${state.stage}${state.merged ? ", merged" : ""}${item.archived ? `, archived ${item.archived}` : ""}) — ${item.dir}/`,
  ];
  if (qa && state.contract!.reviewers.length)
    lines.push(
      `Reviewers: ${state.contract!.reviewers.join(", ")}${qa === "Q3" ? "" : " (in the thread)"}.`,
    );
  if (state.contract?.focus?.length)
    lines.push(`Focus: ${state.contract.focus.join("; ")}.`);
  const left = leftOf(state);
  lines.push(
    left.length ? `Left to go:\n  ${left.join("\n  ")}` : "Left to go: none.",
  );
  // Each recorded review's cost (O4) and every attempt a guard refused (Y5).
  const reviews = (state.contract?.criteria ?? [])
    .filter((c) => c.id.startsWith("review:"))
    .flatMap((c) => {
      const result = state.results?.criteria[c.id];
      const run = result?.run;
      return [
        ...(run
          ? [
              `${c.id}: ${result.status}${run.exit === 0 ? "" : ` (exit ${run.exit})`}, ${formatCost(run)}, ${run.at}`,
            ]
          : []),
        ...(result?.refused ?? []).map(
          (r) => `${c.id}: refused ${r.at}: ${r.reason}`,
        ),
      ];
    });
  if (reviews.length) lines.push(`Reviews:\n  ${reviews.join("\n  ")}`);
  if (state.stage === "built")
    lines.push(
      `Built ${state.results!.built_at}: code in, criteria unrecorded, awaiting harden.`,
    );
  // R4: what the ticket's threads cost, as yarn cost <id> --record wrote it.
  const cost = state.results?.cost;
  if (cost)
    lines.push(
      `Cost, recorded ${cost.at}: ${formatTicketCost(item.id, cost)}.`,
    );
  const deferred = state.criteria.filter((c) => c.deferred).map((c) => c.id);
  if (deferred.length)
    lines.push(
      `Operator checks (not holding the ticket): ${deferred.join(", ")}. See specs/_status.md.`,
    );
  if (state.stage === "migration pending")
    lines.push(
      `Migration pending: set applied: in ${asBuiltPath(item)} once a person applies it.`,
    );
  const manual = (state.contract?.criteria ?? []).filter(
    (c) => c.evidence === "manual" && !c.id.startsWith("review:"),
  );
  if (manual.length)
    lines.push(`Not verified (manual): ${manual.map((c) => c.id).join(", ")}.`);
  if (state.contract) {
    const { blocking, open } = openDecisions(state.contract);
    if (blocking.length)
      lines.push(`Blocking decisions in: ${blocking.join(", ")}.`);
    if (open.length) lines.push(`Open decisions in: ${open.join(", ")}.`);
  }
  if (!state.hasAsBuilt && left.every((l) => l.startsWith("review:")))
    lines.push(
      `Next: write ${asBuiltPath(item)}, then yarn review:run <role> ${item.id} for each reviewer.`,
    );
  console.log(lines.join("\n"));
}

function deviations() {
  const entries = tree.items
    .filter((item) => fileExists(asBuiltPath(item)))
    .map((item) => {
      const text =
        parseAsBuilt(readRepoText(asBuiltPath(item))).sections.get(
          "Deviations",
        ) ?? "";
      return {
        item,
        text,
        date: getLastCommitDate(asBuiltPath(item)) ?? "uncommitted",
      };
    })
    .filter((entry) => entry.text && !/^none\.?$/i.test(entry.text))
    .sort(
      (a, b) =>
        a.date.localeCompare(b.date) || compareIds(a.item.id, b.item.id),
    );
  console.log(
    entries.length
      ? entries
          .map((e) => `## ${e.item.id} (${e.date.slice(0, 10)})\n\n${e.text}`)
          .join("\n\n")
      : "No deviations recorded.",
  );
}

function epicOrder(prefix: string) {
  const epic = tree.epics.find((e) => e.prefix === prefix);
  if (!epic) {
    console.error(
      `status — no epic ${prefix}; epics: ${tree.epics.map((e) => e.prefix).join(", ") || "none"}`,
    );
    process.exit(1);
  }
  const tickets = states().filter((s) => s.item.epic?.prefix === prefix);
  const byId = new Map(tickets.map((s) => [s.item.id, s]));
  const deps = (s: ItemState) =>
    (s.contract?.depends_on ?? []).filter((d) => byId.has(d));
  // Kahn's order, ties by id.
  const order: ItemState[] = [];
  const placed = new Set<string>();
  while (order.length < tickets.length) {
    const ready = tickets
      .filter(
        (s) => !placed.has(s.item.id) && deps(s).every((d) => placed.has(d)),
      )
      .sort((a, b) => compareIds(a.item.id, b.item.id));
    if (ready.length === 0) {
      console.error(
        `status — ${prefix}'s depends_on has a cycle among: ${tickets
          .filter((s) => !placed.has(s.item.id))
          .map((s) => s.item.id)
          .join(", ")}`,
      );
      process.exit(1);
    }
    for (const s of ready) {
      order.push(s);
      placed.add(s.item.id);
    }
  }
  // Critical path: the longest chain of tickets not yet done.
  const length = new Map<string, number>();
  const prev = new Map<string, string | null>();
  for (const s of order) {
    const own = done(s) ? 0 : 1;
    let best = 0;
    let from: string | null = null;
    for (const d of deps(s))
      if ((length.get(d) ?? 0) > best) {
        best = length.get(d)!;
        from = d;
      }
    length.set(s.item.id, best + own);
    prev.set(s.item.id, from);
  }
  let end = [...length.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
  const path: string[] = [];
  while (end) {
    if (!done(byId.get(end)!)) path.unshift(end);
    end = prev.get(end) ?? null;
  }
  console.log(
    [
      `${prefix} ${epic.slug} — ${tickets.length} ticket(s), build order:`,
      ...order.map(
        (s, i) =>
          `  ${i + 1}. ${s.item.id} ${s.item.slug} (${s.stage}${deps(s).length ? `; after ${deps(s).join(", ")}` : ""})`,
      ),
      `Critical path: ${path.length ? path.join(" → ") : "nothing left"}.`,
    ].join("\n"),
  );
}

if (args.includes("--brief")) console.log(renderBrief(tree, BRIEF_LIMIT));
else if (args.includes("--deviations")) deviations();
else if (args.includes("--epic"))
  epicOrder(args[args.indexOf("--epic") + 1] ?? "");
else if (args[0]) one(args[0]);
else {
  const rel = refreshStatusFile(toolkit);
  const all = states();
  console.log(
    `status — wrote ${rel}: ${all.length} item(s), ${tree.epics.length} epic(s).` +
      (all.length
        ? `\n  ${all.map((s) => `${s.item.id} ${s.stage}`).join("\n  ")}`
        : ""),
  );
}
