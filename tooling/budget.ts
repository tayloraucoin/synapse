/**
 * The context budget, enforced (docs/index.md "Budget per build"; CF-03).
 * Reads the caps from docs/index.md itself, so the table there is the contract.
 *
 *   yarn budget
 *
 * Token counts are an estimate: characters / 4 after collapsing runs of
 * whitespace (markdown table padding costs almost nothing once tokenized).
 * A sharper counter is part of thread P-F.
 */

import { existsSync, readdirSync } from "node:fs";
import path, { matchesGlob } from "node:path";

import {
  estimateTokens,
  listFiles,
  readMarkdown,
  readText,
  REPO_ROOT,
  splitFrontmatter,
} from "./lib/docs.ts";
import { probeLayout } from "./lib/layout.ts";
import { loadToolkit } from "./lib/toolkit.ts";

const INDEX = "docs/index.md";
const LINE_CAPS: Record<string, number> = {
  "AGENTS.md": 100,
  "CLAUDE.md": 20,
  [INDEX]: 80,
};

// Where the apps, their design layers and the specs live (toolkit.json).
const toolkit = loadToolkit();
const apps = Object.values(toolkit.apps);
// What is on disk (MIG T3): a repo with one app at its root has no apps/ or packages/.
const layout = probeLayout(REPO_ROOT);
/** Files and probe paths this repo lacks, named in the report rather than failed or silently dropped. */
const skipped: string[] = [];

const exists = (rel: string) => existsSync(path.join(REPO_ROOT, rel));
const estimate = estimateTokens;
const tokensOf = (rel: string) => (exists(rel) ? estimate(readText(rel)) : 0);

function listIn(relDir: string, filter: (name: string) => boolean): string[] {
  if (!exists(relDir)) return [];
  return readdirSync(path.join(REPO_ROOT, relDir))
    .filter(filter)
    .map((name) => path.posix.join(relDir, name));
}

/** "always 4,000 + design layer 5,000 + …" → { always: 4000, "design layer": 5000, … } */
type Row = { cap: number; parts: Map<string, number> };

function parseCaps(text: string): Map<string, Row> {
  const rows = new Map<string, { cap: number; parts: Map<string, number> }>();
  for (const line of text.split("\n")) {
    const cells = line.split("|").map((c) => c.trim());
    if (cells.length < 5 || !/^[\d,]+$/.test(cells[3] ?? "")) continue;
    const parts = new Map<string, number>();
    for (const m of cells[2]!.matchAll(
      /([a-z`/][a-z`/. ,()'-]*?)\s+([\d,]{3,})/gi,
    )) {
      parts.set(
        m[1]!.replace(/[`]/g, "").trim().toLowerCase(),
        Number(m[2]!.replace(/,/g, "")),
      );
    }
    rows.set(cells[1]!.toLowerCase(), {
      cap: Number(cells[3]!.replace(/,/g, "")),
      parts,
    });
  }
  return rows;
}

/** Descriptions the model sees in every session: model-invocable skills and subagents. */
function listingTokens(): {
  tokens: number;
  skills: number;
  agents: number;
  problems: string[];
} {
  let tokens = 0;
  const all = listIn(".claude/skills", (n) => !n.endsWith(".md"))
    .map((dir) => `${dir}/SKILL.md`)
    .filter(exists);
  // Frontmatter Claude Code cannot parse loses its disable-model-invocation
  // key, so the skill would be counted as listed with an empty description.
  const problems = [
    ...all,
    ...listIn(".claude/agents", (n) => n.endsWith(".md")),
  ]
    .filter((rel) => readMarkdown(rel).frontmatterError)
    .map(
      (rel) =>
        `${rel}: the frontmatter is not valid YAML (${readMarkdown(rel).frontmatterError}); quote any value holding ": "`,
    );
  const skills = all.filter(
    (rel) =>
      readMarkdown(rel).frontmatter?.["disable-model-invocation"] !== true,
  );
  for (const rel of skills)
    tokens += estimate(
      String(readMarkdown(rel).frontmatter?.description ?? ""),
    );
  const agents = listIn(".claude/agents", (n) => n.endsWith(".md"));
  for (const rel of agents)
    tokens += estimate(
      String(readMarkdown(rel).frontmatter?.description ?? ""),
    );
  return { tokens, skills: skills.length, agents: agents.length, problems };
}

/** What a forked critic loads from the canon: canon-rubric.md plus canon §2, the tells C-R14 checks (record 0009). */
function criticCanon(): number {
  if (!exists("docs/design/canon.md")) {
    skipped.push("docs/design/canon.md");
    return tokensOf("docs/design/canon-rubric.md");
  }
  const { body } = splitFrontmatter(readText("docs/design/canon.md"));
  const start = body.indexOf("\n## 2.");
  const end = body.indexOf("\n## Changelog");
  return (
    estimate(body.slice(start, end === -1 ? undefined : end)) +
    tokensOf("docs/design/canon-rubric.md")
  );
}

function largest(files: string[]) {
  return files.reduce((max, f) => Math.max(max, tokensOf(f)), 0);
}

const sum = (files: string[]) => files.reduce((s, f) => s + tokensOf(f), 0);

/** The heaviest of several file sets: a build loads one app's, never all of them. */
function heaviest(sets: string[][]): string[] {
  return sets.reduce((max, set) => (sum(set) > sum(max) ? set : max), []);
}

/** Every folder under the specs root that holds a brief or a package, as its pair. */
function briefAndPackagePairs(): string[][] {
  if (!exists(toolkit.specsRoot)) return [];
  const folders = new Map<string, string[]>();
  for (const file of listFiles(toolkit.specsRoot)) {
    if (!/\/(brief|package)\.md$/.test(file)) continue;
    const dir = path.posix.dirname(file);
    folders.set(dir, [...(folders.get(dir) ?? []), file]);
  }
  return [...folders.values()];
}

const errors: string[] = [];
const report: string[] = [];

// Line caps. The index holds the caps, so it alone is required.
for (const [rel, cap] of Object.entries(LINE_CAPS)) {
  if (rel !== INDEX && !exists(rel)) {
    skipped.push(rel);
    continue;
  }
  const lines = readText(rel).trimEnd().split("\n").length;
  if (lines > cap)
    errors.push(`${rel}: ${lines} lines over the ${cap}-line cap`);
  report.push(
    `${lines > cap ? "FAIL" : "ok  "} ${`${rel} (lines)`.padEnd(44)} ${String(lines).padStart(6)} / ${cap}`,
  );
}

// What each build loads. Missing files (Phase 3 and later) count as zero and are named.
const productLayer = heaviest(
  apps.flatMap((app) =>
    app.designLayer ? [listIn(app.designLayer, (n) => n.endsWith(".md"))] : [],
  ),
);
const example = heaviest(briefAndPackagePairs());
const skillBodies = listIn(".claude/skills", (n) => !n.endsWith(".md"))
  .map((d) => `${d}/SKILL.md`)
  .filter(exists);
const listing = listingTokens();

/**
 * SessionStart output is counted at its declared allowance (E-19), read from
 * the map's Always line, since what it prints varies by session; the hook
 * truncates its line in code.
 */
const sessionStart = Number(
  readText(INDEX)
    .match(/SessionStart hook output \(≤([\d,]+)\)/)?.[1]
    ?.replace(/,/g, "") ?? Number.NaN,
);
if (Number.isNaN(sessionStart))
  errors.push(
    `${INDEX}: the Always line no longer declares "SessionStart hook output (≤<tokens>)"; budget.ts counts that allowance`,
  );
const always =
  tokensOf("AGENTS.md") +
  tokensOf("CLAUDE.md") +
  tokensOf(INDEX) +
  listing.tokens +
  (sessionStart || 0);
const canon = tokensOf("docs/design/canon.md");
const uiRule = tokensOf(".claude/rules/ui.md");
const design = canon + sum(productLayer);
const briefAndPackage = sum(example);
const skillBody = largest(skillBodies);
/**
 * Path rules load per file, so the cost is the heaviest set one file can fire,
 * not the sum of every rule. One probe path per glob family; add one when a
 * new rule's globs match none of these. The app probes sit in each app's
 * folder. A probe under a top folder this repo lacks (a single app has no
 * packages/) is skipped and named.
 */
const APP_PROBES = ["lib/records.test.ts", "app/page.tsx", "package.json"];
const SHARED_PROBES = [
  "turbo.json",
  ".yarnrc.yml",
  "docs/design/canon.md",
  `${toolkit.specsRoot}/web/one-offs/WEB-1-filter/contract.md`,
  "packages/ui/src/primitives/control/button/button.tsx",
].filter((probe) => {
  const top = probe.split("/")[0]!;
  const present = top === probe || exists(top);
  if (!present) skipped.push(probe);
  return present;
});
const PROBES = [
  ...apps.flatMap((app) =>
    APP_PROBES.map((rel) =>
      app.path === "." ? rel : path.posix.join(app.path, rel),
    ),
  ),
  ...SHARED_PROBES,
];
const rules = listIn(
  ".claude/rules",
  (n) => n.endsWith(".md") && n !== "ui.md",
);
const globsOf = (rel: string) => {
  const paths = readMarkdown(rel).frontmatter?.paths;
  return Array.isArray(paths)
    ? paths.filter((p): p is string => typeof p === "string")
    : [];
};
const pathRules = Math.max(
  0,
  ...PROBES.map((probe) =>
    rules
      .filter((rel) => globsOf(rel).some((glob) => matchesGlob(probe, glob)))
      .reduce((s, rel) => s + tokensOf(rel), 0),
  ),
);
/** Folders never searched for a nested AGENTS.md: installs and builds at any depth, and the toolkit's own at the root. */
const NOT_CODE_NAMES = new Set(["node_modules", "dist", "build", "coverage"]);
const TOOLKIT_FOLDERS = new Set(["tooling", "docs", toolkit.specsRoot]);
/** Every AGENTS.md below a code root, the root's own spine file excluded. */
function nestedAgentsFiles(dir: string): string[] {
  if (!exists(dir)) return [];
  return readdirSync(path.join(REPO_ROOT, dir), { withFileTypes: true })
    .flatMap((entry) => {
      const rel = dir === "." ? entry.name : `${dir}/${entry.name}`;
      if (entry.isDirectory())
        return entry.name.startsWith(".") ||
          NOT_CODE_NAMES.has(entry.name) ||
          TOOLKIT_FOLDERS.has(rel)
          ? []
          : nestedAgentsFiles(rel);
      return entry.name === "AGENTS.md" && rel !== "AGENTS.md" ? [rel] : [];
    })
    .sort();
}
/** Nested AGENTS.md load by path under each code root (docs/index.md). */
const nestedAgents = largest(layout.codeRoots.flatMap(nestedAgentsFiles));
const nonUiRules = pathRules + nestedAgents;

/** The largest contract under the specs root, with the one surface file it cites. */
function contractAndCitedSpec(): string[] {
  if (!exists(toolkit.specsRoot)) return [];
  const contracts = listFiles(toolkit.specsRoot).filter((f) =>
    f.endsWith("/contract.md"),
  );
  return heaviest(
    contracts.map((contract) => {
      const cited = readMarkdown(contract).frontmatter?.cites;
      const surface = Array.isArray(cited)
        ? cited.map(String).find((c) => c.endsWith(".md") && exists(c))
        : undefined;
      return surface ? [contract, surface] : [contract];
    }),
  );
}
const contractSpec = contractAndCitedSpec();
const contractAndSpec = sum(contractSpec);
const surfaces = exists(toolkit.specsRoot)
  ? listFiles(toolkit.specsRoot).filter((f) => /\/ux\/.+\.md$/.test(f))
  : [];
const citedSurface = largest(surfaces);
const evaluatorBody = tokensOf(".claude/agents/vigil.md");

/**
 * Measures every build against the caps in a budget table's text. A row or
 * part label the script reads but the table lacks is an error, never a
 * silently dropped cap (Mason, audit day).
 */
function checkAgainst(
  text: string,
  source: string,
): { errors: string[]; report: string[] } {
  const errors: string[] = [];
  const report: string[] = [];
  const rows = parseCaps(text);
  const line = (label: string, tokens: number, cap?: number, note = "") => {
    const over = cap !== undefined && tokens > cap;
    if (over) errors.push(`${label}: ${tokens} tokens over the ${cap} cap`);
    report.push(
      `${over ? "FAIL" : "ok  "} ${label.padEnd(44)} ${String(tokens).padStart(6)}${cap ? ` / ${cap}` : ""}${note ? `  ${note}` : ""}`,
    );
  };
  const part = (row: Row, label: string) => {
    const cap = row.parts.get(label);
    if (cap === undefined)
      errors.push(
        `${source}: the budget table has no "${label}" part; budget.ts reads that label, so restore it or rename it in both`,
      );
    return cap;
  };
  const ui = rows.get("ui build");
  const nonUi = rows.get("non-ui build");
  const critic = rows.get("critic pass (forked)");
  const evaluator = rows.get("evaluator pass (forked)");
  if (!ui || !nonUi || !critic || !evaluator) {
    errors.push(
      `${source}: the budget table is missing a row this script reads (UI build, Non-UI build, Critic pass (forked), Evaluator pass (forked))`,
    );
    return { errors, report };
  }

  line(
    "always-on",
    always,
    part(ui, "always"),
    `skills ${listing.skills}, agents ${listing.agents}, SessionStart ${sessionStart || 0}`,
  );
  line(
    "design layer (canon + product layer)",
    design,
    part(ui, "design layer"),
    productLayer.length ? "" : "(product layer not written yet)",
  );
  line(
    "brief and package (largest example)",
    briefAndPackage,
    part(ui, "brief and package"),
    example.length ? "" : "(not written yet)",
  );
  line(
    "one skill body (largest)",
    skillBody,
    part(ui, "one skill body"),
    skillBodies.length ? "" : "(no skills yet)",
  );
  line(
    "UI build (+ ui.md rule)",
    always + design + uiRule + briefAndPackage + skillBody,
    ui.cap,
  );
  line(
    "path rules and nested AGENTS.md (heaviest file)",
    nonUiRules,
    part(nonUi, "path rules and nested agents.md"),
  );
  line(
    "contract and cited spec (largest)",
    contractAndSpec,
    part(nonUi, "contract and cited spec"),
    contractSpec.length ? "" : "(no contract yet)",
  );
  line("non-UI build", always + nonUiRules + contractAndSpec, nonUi.cap);
  line(
    "critic pass (rubric + canon §2 + cited surface)",
    criticCanon() + citedSurface,
    critic.cap,
  );
  line(
    "evaluator pass (vigil + contract and spec + evidence index)",
    evaluatorBody + contractAndSpec,
    evaluator.cap,
    evaluatorBody ? "" : "(vigil not generated yet)",
  );
  // The body part warns rather than fails: vigil's body is its role verbatim
  // until refinement 22c (held for Taylor), and a role body is never cut here.
  const bodyPart = part(evaluator, "evaluator body");
  if (bodyPart !== undefined && evaluatorBody > bodyPart)
    report.push(
      `WARN vigil's body is ${evaluatorBody} tokens, over the ${bodyPart} the evaluator row allots it; the row total holds. Refinement 22c (held) cuts it.`,
    );
  return { errors, report };
}

/**
 * The checker proves itself first (Touchstone, audit day): a synthetic map
 * whose caps every real measurement exceeds must fail on each named row, and
 * a map with a renamed part label must fail on that label.
 */
const BUDGET_FIXTURES: [string, string[]][] = [
  [
    "tooling/fixtures/budget/over-cap-index.md",
    [
      "always-on:",
      "design layer (canon + product layer):",
      "UI build (+ ui.md rule):",
      "non-UI build:",
      "critic pass",
    ],
  ],
  ["tooling/fixtures/budget/renamed-part-index.md", ['no "always" part']],
];
for (const [fixture, expected] of BUDGET_FIXTURES) {
  // A repo that copied the toolkit without its budget fixtures names the
  // self-check as skipped; at starter they are the toolkit's own and required.
  if (toolkit.tier !== "starter" && !exists(fixture)) {
    skipped.push(fixture);
    continue;
  }
  const result = checkAgainst(readText(fixture), fixture);
  for (const text of expected)
    if (!result.errors.some((error) => error.includes(text))) {
      console.error(
        `budget — the fixture ${fixture} did not fail with "${text}"; the budget check is broken. Got: ${result.errors.join(" | ") || "no errors"}`,
      );
      process.exit(1);
    }
}

errors.push(...listing.problems);
const measured = checkAgainst(readText(INDEX), INDEX);
errors.push(...measured.errors);
report.push(...measured.report);
const ui = parseCaps(readText(INDEX)).get("ui build");

// The index allots a product's own design layer about 1,700 of the design-layer cap.
const PRODUCT_SHARE = 1700;
const designCap = ui?.parts.get("design layer") ?? 0;
const headroom = designCap - canon;
if (headroom < PRODUCT_SHARE) {
  report.push(
    `WARN canon.md is ${canon} tokens; the design layer cap leaves ${headroom} for a product layer, ` +
      `not the ${PRODUCT_SHARE} docs/index.md allots. Open item in docs/decisions/changelog.md.`,
  );
}

if (skipped.length)
  report.push(`SKIP not in this repo, so not counted: ${skipped.join(", ")}`);
console.log(report.join("\n"));
if (errors.length > 0) {
  console.error(`\nbudget — ${errors.length} over:\n${errors.join("\n")}`);
  process.exit(1);
}
console.log("\nbudget — within every cap in docs/index.md.");
