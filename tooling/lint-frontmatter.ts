/**
 * Lints every markdown file under docs/: file and folder names (record 0006)
 * and the frontmatter schema (record 0006 §Frontmatter, CF-16).
 * This file is the enforceable copy of both; the docs describe, this decides.
 *
 *   yarn lint:docs
 */

import path from "node:path";

import { listMarkdown, readMarkdown, type Frontmatter } from "./lib/docs.ts";
import { loadToolkit } from "./lib/toolkit.ts";

// An overlay leaves the host repo's docs alone (report §1, adoption tiers).
if (loadToolkit().tier !== "starter") {
  console.log("lint:docs — skipped: the overlay tiers do not lint host docs.");
  process.exit(0);
}

const DOCS = "docs";

/**
 * One value per top-level folder under docs/. CF-16's enum, plus `engineering`
 * (changelog 2026-10-01), `measurement` (metrics and evals, 2026-10-02) and
 * `workflows` (A12).
 */
const LAYERS = [
  "decisions",
  "roles",
  "design",
  "product",
  "references",
  "prompts",
  "research",
  "measurement",
  "runbooks",
  "engineering",
  "workflows",
] as const;

const STATUSES = [
  "draft",
  "ruling",
  "adopted",
  "superseded",
  "archived",
] as const;

/** Keys every file carries (values may be empty except where noted). */
const REQUIRED_KEYS = [
  "title",
  "description",
  "layer",
  "status",
  "thread",
  "role",
  "date",
  "supersedes",
  "load_when",
];
const NON_EMPTY_KEYS = ["title", "description", "layer", "status", "date"];

/** CF-16 per-layer extensions for source files under docs/references/. */
const REFERENCE_KEYS = [
  "source",
  "source_type",
  "review_by",
  "verification",
  "coverage",
  "exclusions",
];
const LAW_KEYS = ["family", "laws", "budget"];

const DESCRIPTION_MAX = 400;
const UPPERCASE_STEMS = [
  "README",
  "DESIGN",
  "SKILL",
  "PROVENANCE",
  "CHANGELOG",
  "LICENSE",
];
const FOLDER = /^_?[a-z0-9]+(-[a-z0-9]+)*$/;
const FILE = /^([a-z0-9]+(-[a-z0-9]+)*|[A-Z]+)(\.template)?\.md$/;
const DATE = /^\d{4}-\d{2}(-\d{2})?$/;

const errors: string[] = [];
const fail = (file: string, message: string) =>
  errors.push(`${file}: ${message}`);

function lintName(file: string) {
  const segments = file.split("/");
  const name = segments.pop()!;
  for (const folder of segments) {
    if (!FOLDER.test(folder))
      fail(file, `folder "${folder}" is not ASCII kebab-case (record 0006)`);
  }
  if (!FILE.test(name)) {
    fail(file, `file name "${name}" is not ASCII kebab-case (record 0006)`);
    return;
  }
  const stem = name.replace(/(\.template)?\.md$/, "");
  if (
    stem === stem.toUpperCase() &&
    /[A-Z]/.test(stem) &&
    !UPPERCASE_STEMS.includes(stem)
  ) {
    fail(
      file,
      `upper-case name "${name}" is not on the conventional list (record 0006)`,
    );
  }
  if (name === "index.md" && file !== "docs/index.md")
    fail(
      file,
      "folder landing pages are README.md inside docs/ (record 0006, amended 2026-10-02); docs/index.md is the one exception",
    );
}

function isEmpty(value: unknown) {
  return value === null || value === undefined || value === "";
}

function expectedLayer(file: string): string | null {
  const [, top] = file.split("/");
  if (!top || top.endsWith(".md") || top.startsWith("_")) return null;
  return top;
}

function lintFrontmatter(file: string, fm: Frontmatter) {
  for (const key of REQUIRED_KEYS) {
    if (!(key in fm)) fail(file, `missing frontmatter key "${key}"`);
  }
  for (const key of NON_EMPTY_KEYS) {
    if (key in fm && isEmpty(fm[key])) fail(file, `"${key}" is empty`);
  }

  const { layer, status, description, date } = fm;
  if (
    typeof layer === "string" &&
    !(LAYERS as readonly string[]).includes(layer)
  ) {
    fail(file, `layer "${layer}" is not one of ${LAYERS.join(", ")}`);
  }
  const folderLayer = expectedLayer(file);
  if (folderLayer && layer !== folderLayer) {
    fail(
      file,
      `layer is "${String(layer)}" but the file sits in docs/${folderLayer}/`,
    );
  }
  if (
    typeof status === "string" &&
    !(STATUSES as readonly string[]).includes(status)
  ) {
    fail(file, `status "${status}" is not one of ${STATUSES.join(", ")}`);
  }
  const isLanding = path.posix.basename(file) === "README.md";
  if (layer === "research" && status !== "archived" && !isLanding) {
    fail(file, `research files are status: archived (record 0006)`);
  }
  if (typeof description === "string") {
    if (description.includes("\n")) fail(file, "description must be one line");
    if (description.length > DESCRIPTION_MAX) {
      fail(
        file,
        `description is ${description.length} characters; the cap is ${DESCRIPTION_MAX}`,
      );
    }
  } else if (description !== undefined) {
    fail(file, "description must be a string");
  }
  if (!isEmpty(fm.thread) && typeof fm.thread !== "string") {
    fail(
      file,
      `thread must be a string; quote it ("${String(fm.thread)}" was read as a ${typeof fm.thread})`,
    );
  }
  if (!isEmpty(date) && !DATE.test(String(date)))
    fail(file, `date "${String(date)}" is not YYYY-MM-DD or YYYY-MM`);
  if (!isEmpty(fm.last_reviewed) && !DATE.test(String(fm.last_reviewed))) {
    fail(file, `last_reviewed "${String(fm.last_reviewed)}" is not YYYY-MM-DD`);
  }

  if (layer === "roles") {
    if ("subagent" in fm && typeof fm.subagent !== "boolean")
      fail(file, "subagent must be true or false");
    for (const key of ["subagent_tools", "subagent_disallowed_tools"]) {
      if (
        key in fm &&
        !(
          Array.isArray(fm[key]) &&
          (fm[key] as unknown[]).every((t) => typeof t === "string")
        )
      ) {
        fail(file, `${key} must be a list of tool names`);
      }
    }
  }

  const isReferenceSource =
    file.startsWith("docs/references/") &&
    !file.startsWith("docs/references/_meta/") &&
    !isLanding;
  if (isReferenceSource) {
    for (const key of REFERENCE_KEYS)
      if (!(key in fm)) fail(file, `references add "${key}" (CF-16)`);
    if (isEmpty(fm.load_when)) fail(file, "references need load_when (P-D)");
    if (file.startsWith("docs/references/laws-of-ux/")) {
      for (const key of LAW_KEYS)
        if (!(key in fm)) fail(file, `law files add "${key}" (CF-16)`);
    }
  }
}

function lintLawBody(file: string, body: string) {
  if (
    !file.startsWith("docs/references/laws-of-ux/") ||
    file.endsWith("/index.md")
  )
    return;
  if (!/^#+ .*Example/m.test(body) || !/^#+ .*Counter-example/m.test(body)) {
    fail(
      file,
      "law files have both an Example and a Counter-example section (CF-49)",
    );
  }
}

/**
 * Path rules (E-13): `.claude/rules/*.md` may carry only `paths`, the one key
 * Claude Code reads (verified against the memory docs, 2026-10-02). Any other
 * key implies loading that never happens.
 */
function lintRule(file: string): string | null {
  const md = readMarkdown(file);
  if (md.rawFrontmatter === null)
    return `${file}: no frontmatter; a rule opens with a paths list`;
  if (md.frontmatterError)
    return `${file}: frontmatter is not valid YAML: ${md.frontmatterError}`;
  const keys = Object.keys(md.frontmatter ?? {});
  const extra = keys.filter((key) => key !== "paths");
  if (extra.length > 0)
    return (
      `${file}: rules carry only \`paths\`; Claude Code reads nothing else. ` +
      `Move ${extra.map((k) => `"${k}"`).join(", ")} into the body, or delete it.`
    );
  const paths = md.frontmatter?.paths;
  if (
    !Array.isArray(paths) ||
    paths.length === 0 ||
    !paths.every((p) => typeof p === "string")
  )
    return `${file}: paths must be a non-empty list of globs`;
  return null;
}

// Each fixture must fail with its own message, or the rule lint is not checking anything.
const RULE_FIXTURES: [string, string][] = [
  ["tooling/fixtures/rules/with-description.md", "rules carry only `paths`"],
  ["tooling/fixtures/rules/paths-missing.md", "paths must be a non-empty list"],
];
for (const [fixture, expected] of RULE_FIXTURES)
  if (!lintRule(fixture)?.includes(expected))
    fail(
      fixture,
      `the fixture did not fail with "${expected}"; the rule lint is broken`,
    );
for (const file of listMarkdown(".claude/rules")) {
  const problem = lintRule(file);
  if (problem) errors.push(problem);
}

// docs/_generated/ is written by tooling and never loaded (docs/index.md); it is exempt.
const files = listMarkdown(DOCS).filter(
  (file) => !file.startsWith("docs/_generated/"),
);
for (const file of files) {
  lintName(file);
  const md = readMarkdown(file);
  if (md.rawFrontmatter === null) {
    fail(file, "no frontmatter; copy the block record 0006 §Frontmatter lists");
    continue;
  }
  if (md.frontmatterError) {
    fail(file, `frontmatter is not valid YAML: ${md.frontmatterError}`);
    continue;
  }
  lintFrontmatter(file, md.frontmatter!);
  lintLawBody(file, md.body);
}

if (errors.length > 0) {
  console.error(errors.join("\n"));
  console.error(
    `\nlint:docs — ${errors.length} problem(s) in ${files.length} files.`,
  );
  process.exit(1);
}
console.log(
  `lint:docs — ${files.length} files, names and frontmatter clean; ${listMarkdown(".claude/rules").length} path rules carry only paths.`,
);
