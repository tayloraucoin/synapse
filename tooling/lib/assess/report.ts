/**
 * The assess report: assess.md's data contract as JSON, and the same data as
 * the markdown the interview opens with (MIG T1). The listings (conflicts,
 * sdkImports, records, collisions, hygiene) are MIG-6's; preconditions are
 * MIG-7's and stay empty until then.
 */

import { listSdkImports, readToolkitGlobs } from "./conventions.ts";
import {
  listCollisions,
  readHygiene,
  readManifestPaths,
  type HygieneReport,
} from "./hygiene.ts";
import {
  checkPreconditions,
  type Precondition,
  type PreconditionOptions,
} from "./preconditions.ts";
import { listConflicts, listRecords } from "./process.ts";
import { runGit, type Repo } from "./repo.ts";
import {
  FAR_FROM,
  MIDDLE_FROM,
  NEAR_UP_TO,
  scoreSignals,
  type Path,
} from "./score.ts";
import type { SignalResult } from "./signal.ts";
import { buildSignals, measureSignals, SIGNALS } from "./signals.ts";

export type { Precondition };
export type Conflict = {
  policy: string;
  file: string;
  line: number;
  text: string;
};
export type SdkImport = { file: string; module: string; matchedBy: string };
export type RecordRow = { kind: string; path: string; lines: number };
export type Hygiene = HygieneReport | Record<string, never>;

export type AssessData = {
  target: string;
  commit: string | null;
  toolkitCommit: string | null;
  signals: SignalResult[];
  total: number;
  path: Path | null;
  gate: { failed: boolean; reasons: string[] };
  preconditions: Precondition[];
  conflicts: Conflict[];
  sdkImports: SdkImport[];
  records: RecordRow[];
  collisions: string[];
  hygiene: Hygiene;
};

/** The toolkit checkout this script runs from: its commit, or null outside git. */
export const readToolkitCommit = (toolkitRoot: string) =>
  runGit(toolkitRoot, ["rev-parse", "HEAD"]);

export function assessRepo(
  repo: Repo,
  toolkitRoot: string,
  check: PreconditionOptions | null = null,
): AssessData {
  const signals = measureSignals(repo, buildSignals(toolkitRoot));
  const javascript = repo.tracked.has("package.json");
  const verdict = scoreSignals(signals, { javascript });
  return {
    target: repo.root,
    commit: repo.commit,
    toolkitCommit: readToolkitCommit(toolkitRoot),
    signals,
    total: verdict.total,
    path: verdict.path,
    gate: verdict.gate,
    preconditions: check ? checkPreconditions(repo, check) : [],
    conflicts: listConflicts(repo),
    sdkImports: listSdkImports(repo, readToolkitGlobs(toolkitRoot)),
    records: listRecords(repo),
    collisions: listCollisions(repo, readManifestPaths(toolkitRoot)),
    hygiene: readHygiene(repo),
  };
}

const GROUP_TITLES: Record<string, string> = {
  shape: "Shape",
  checks: "Checks",
  conventions: "Conventions",
  process: "Process",
};

const cell = (s: string) => s.replace(/\|/g, "\\|").replace(/\n/g, " ");

export function renderMarkdown(data: AssessData): string {
  const verdict = scoreSignals(data.signals, {
    javascript: !data.gate.reasons.includes("not a JavaScript repo"),
  });
  const byId = new Map(SIGNALS.map((s) => [s.id, s]));
  const out: string[] = [
    `# Migration assessment: ${data.target.split("/").pop()}`,
    "",
    `- Target: \`${data.target}\` at \`${data.commit ?? "no commit"}\``,
    `- Toolkit: \`${data.toolkitCommit ?? "not a git checkout"}\``,
    `- Total: **${data.total}** of ${verdict.measured * 2} measured (${verdict.measured} of ${data.signals.length} signals)`,
    `- Gate: ${data.gate.failed ? `**failed** (${data.gate.reasons.join("; ")})` : data.signals.find((s) => s.id === "S1")?.score === null ? "not measured (S1 has no score)" : "passed"}`,
    `- Path: **${data.path ?? "not decided"}**${pathWhy(data, verdict)}`,
  ];
  const pending = data.signals.filter((s) => s.evidence === "not yet measured");
  const failed = data.signals.filter(
    (s) => s.score === null && s.evidence !== "not yet measured",
  );
  if (pending.length)
    out.push(
      `- Not yet measured: ${pending.map((s) => s.id).join(", ")} (left out of the total; with them the total could reach ${verdict.ceiling})`,
    );
  if (failed.length)
    out.push(
      `- Detector failed, left out of the total: ${failed.map((s) => `${s.id} (${s.evidence})`).join(", ")}`,
    );
  for (const group of Object.keys(GROUP_TITLES)) {
    const rows = data.signals.filter((s) => byId.get(s.id)?.group === group);
    if (!rows.length) continue;
    out.push(
      "",
      `## ${GROUP_TITLES[group]}`,
      "",
      "| # | Signal | Layer | Score | Evidence |",
      "| --- | --- | --- | --- | --- |",
    );
    for (const s of rows) {
      const signal = byId.get(s.id);
      out.push(
        `| ${s.id} | ${cell(signal?.title ?? s.id)} | ${signal?.layer ?? ""} | ${s.score ?? "not yet measured"} | ${cell(s.evidence)} |`,
      );
    }
  }
  out.push(...renderListings(data));
  return `${out.join("\n")}\n`;
}

/** The --check output: one line per rule, then the count. */
export function renderPreconditions(rows: Precondition[]): string {
  const failed = rows.filter((r) => !r.ok);
  const lines = rows.map((r) =>
    r.ok ? `ok    ${r.id}` : `FAIL  ${r.id}: ${r.fix}`,
  );
  lines.push(
    failed.length
      ? `migrate:assess --check: ${failed.length} of ${rows.length} preconditions failed; each fix is the operator's`
      : `migrate:assess --check: every precondition holds (${rows.length})`,
  );
  return `${lines.join("\n")}\n`;
}

const table = (header: string[], rows: string[][]): string[] =>
  rows.length
    ? [
        `| ${header.join(" | ")} |`,
        `| ${header.map(() => "---").join(" | ")} |`,
        ...rows.map((r) => `| ${r.map(cell).join(" | ")} |`),
      ]
    : ["none"];

/** The listings the interview rules on, and the hygiene lines read out to the operator. */
export function renderListings(data: AssessData): string[] {
  const out: string[] = [];
  if (data.preconditions.length)
    out.push(
      "",
      "## Preconditions",
      "",
      ...table(
        ["#", "State", "Fix"],
        data.preconditions.map((p) => [
          p.id,
          p.ok ? "ok" : "failed",
          p.ok ? "" : p.fix,
        ]),
      ),
    );
  out.push(
    "",
    "## Conflicts",
    "",
    "Instruction lines against a toolkit policy; the interview rules each team or operator.",
    "",
    ...table(
      ["Policy", "File", "Line", "Text"],
      data.conflicts.map((c) => [c.policy, c.file, String(c.line), c.text]),
    ),
    "",
    "## SDK importers",
    "",
    "Money, auth, email and AI SDKs, with the toolkit reviewer glob that reaches the file, or none.",
    "",
    ...table(
      ["File", "Module", "Matched by"],
      data.sdkImports.map((s) => [s.file, s.module, s.matchedBy]),
    ),
    "",
    "## Records by kind",
    "",
    ...table(
      ["Kind", "Path", "Lines"],
      data.records.map((r) => [r.kind, r.path, String(r.lines)]),
    ),
    "",
    "## Collisions",
    "",
    "Practice paths the target already holds; each stops for a ruling.",
    "",
    ...(data.collisions.length
      ? data.collisions.map((c) => `- \`${c}\``)
      : ["none"]),
    "",
    "## Hygiene",
    "",
    "Reported, never scored.",
    "",
  );
  const h = data.hygiene as Partial<HygieneReport>;
  if (h.branch === undefined) out.push("not read");
  else {
    out.push(
      `- Branch: ${h.branch ? `\`${h.branch}\`` : "detached HEAD"}${
        h.remote
          ? h.remote.state === "absent"
            ? `; no \`${h.remote.ref}\``
            : `; ${h.remote.state === "equal" ? "equals" : h.remote.state} \`${h.remote.ref}\`${h.remote.ahead || h.remote.behind ? ` (ahead ${h.remote.ahead}, behind ${h.remote.behind})` : ""}`
          : ""
      }`,
      `- Working tree: ${h.dirty ? `${h.dirty} changed or untracked ${h.dirty === 1 ? "entry" : "entries"}` : "clean"}`,
      `- Worktrees: ${h.worktrees?.length ? h.worktrees.join(", ") : "none"}`,
      `- Tracked files over 10 MB: ${h.largeFiles?.length ? h.largeFiles.map((f) => `${f.path} (${Math.round(f.bytes / 1024 / 1024)} MB)`).join(", ") : "none"}`,
    );
  }
  return out;
}

function pathWhy(
  data: AssessData,
  verdict: ReturnType<typeof scoreSignals>,
): string {
  if (data.gate.failed) return ` (the gate: ${data.gate.reasons.join("; ")})`;
  if (data.path === null)
    return ` (the measured total ${verdict.total} and the ceiling ${verdict.ceiling} fall in different bands)`;
  return ` (total ${data.total}: near up to ${NEAR_UP_TO}, middle ${MIDDLE_FROM} to ${FAR_FROM - 1}, far from ${FAR_FROM})`;
}
