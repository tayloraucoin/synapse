/**
 * The process signals, P1 to P5 (assess.md's table; all inform layer 1), and
 * the listings the interview rules on: the instruction lines that conflict
 * with a toolkit policy, and the records by kind (T5).
 *
 * P1 instruction-file lines that conflict with a toolkit policy: none 0, one
 *    or two policies 1, three or more 2 (counted by policy, not by line).
 * P2 docs with frontmatter, as a share: 90% or more 0, 10% or more 1, below 2.
 * P3 record kinds in a foreign format: none 0, one 1, two or more 2.
 * P4 living truth: specs/<app>/ux/ 0, a UX spec elsewhere 1, none found 2.
 * P5 tracked markdown paths with a space or a non-ASCII character: 0, 1 to 50, over 50.
 */

import path from "node:path";

import type { Repo } from "./repo.ts";
import { BANDS } from "./score.ts";
import type { Measure, Signal } from "./signal.ts";

export type ConflictRow = {
  policy: string;
  file: string;
  line: number;
  text: string;
};
export type RecordRow = { kind: string; path: string; lines: number };

/** The toolkit policies an instruction line can contradict, each with the words that mark a contradiction. */
export const POLICIES: { id: string; toolkit: string; pattern: RegExp }[] = [
  {
    id: "tests",
    toolkit: "the contract loop proves a ticket with tests",
    pattern:
      /\b(?:no tests?\b|do not write tests|don't write tests|never write tests|tests? (?:are|is) (?:forbidden|not allowed|banned)|skip (?:the )?tests)/i,
  },
  {
    id: "branches",
    toolkit:
      "the operator manages branches; a thread never creates, switches or pushes one, and never commits on the protected branch",
    pattern:
      /\b(?:no (?:git )?branch(?:es|ing)?\b|never (?:create|make|open) (?:a )?(?:git )?branch|do not (?:create|make) (?:git )?branches|no (?:PRs|pull requests)\b|never open (?:a )?(?:PR|pull request))/i,
  },
  {
    id: "push",
    toolkit: "git push is denied to agents; the operator pushes",
    pattern:
      /\b(?:always push\b|must push\b|push (?:directly )?to (?:main|master|origin)\b|push (?:your|the) (?:changes|commits|work)\b)/i,
  },
  {
    id: "protected-branch",
    toolkit: "bash-guard refuses a commit on the protected branch",
    pattern: /\bcommit (?:directly )?(?:to|on) (?:main|master)\b/i,
  },
];

const INSTRUCTION_FILE =
  /(?:^|\/)(?:AGENTS\.md|CLAUDE\.md|\.cursorrules|\.windsurfrules)$|^\.claude\/rules\/[^/]+\.md$|^\.cursor\/rules\/[^/]+$|^\.github\/copilot-instructions\.md$/;

/** A line that forbids the thing a policy pattern looks for is on the toolkit's side, not against it. */
const NEGATED_PUSH =
  /\b(?:never|do not|don't|must not|no)\s+(?:\w+\s+)?push\b/i;

export const listInstructionFiles = (repo: Repo) =>
  repo.files.filter((rel) => INSTRUCTION_FILE.test(rel));

/** Every instruction line that contradicts a toolkit policy, with its file and 1-based line. */
export function listConflicts(repo: Repo): ConflictRow[] {
  const rows: ConflictRow[] = [];
  for (const file of listInstructionFiles(repo)) {
    const lines = (repo.read(file) ?? "").split("\n");
    lines.forEach((text, i) => {
      for (const policy of POLICIES)
        if (
          policy.pattern.test(text) &&
          !(policy.id === "push" && NEGATED_PUSH.test(text))
        )
          rows.push({
            policy: policy.id,
            file,
            line: i + 1,
            text: text.trim(),
          });
    });
  }
  return rows;
}

export const P1: Signal = {
  id: "P1",
  group: "process",
  layer: 1,
  title: "Instruction lines that conflict",
  measure(repo): Measure {
    const rows = listConflicts(repo);
    const policies = [...new Set(rows.map((r) => r.policy))];
    const score =
      policies.length === 0
        ? 0
        : policies.length <= BANDS.conflictPoliciesPartialUpTo
          ? 1
          : 2;
    return {
      value: { policies, lines: rows.length },
      score,
      evidence: rows.length
        ? `${rows.length} lines against ${policies.length} policies (${policies.join(", ")}): ${rows
            .slice(0, 2)
            .map((r) => `${r.file}:${r.line}`)
            .join(
              ", ",
            )}${rows.length > 2 ? ` and ${rows.length - 2} more` : ""}`
        : `no line in ${listInstructionFiles(repo).length || "any"} instruction file(s) contradicts a toolkit policy`,
    };
  },
};

const MARKDOWN = /\.(?:md|mdx)$/i;
const docsMarkdown = (repo: Repo) =>
  repo.files.filter((rel) => rel.startsWith("docs/") && MARKDOWN.test(rel));

export const hasFrontmatter = (text: string) => /^﻿?---\r?\n/.test(text);

export const P2: Signal = {
  id: "P2",
  group: "process",
  layer: 1,
  title: "Docs with frontmatter",
  measure(repo): Measure {
    const docs = docsMarkdown(repo);
    const withIt = docs.filter((rel) => hasFrontmatter(repo.read(rel) ?? ""));
    const share = docs.length ? withIt.length / docs.length : 0;
    const score =
      docs.length === 0
        ? 2
        : share >= BANDS.frontmatterShareFull
          ? 0
          : share >= BANDS.frontmatterSharePartial
            ? 1
            : 2;
    return {
      value: { docs: docs.length, withFrontmatter: withIt.length },
      score,
      evidence: docs.length
        ? `${withIt.length} of ${docs.length} markdown files under docs/ open with frontmatter (${Math.round(share * 100)}%)`
        : "no markdown under docs/",
    };
  },
};

const RECORD_KINDS: { kind: string; test: (rel: string) => boolean }[] = [
  {
    kind: "decision log",
    test: (rel) => /(?:^|\/)(?:TECHNICAL-)?DECISIONS\.md$/.test(rel),
  },
  { kind: "deviation log", test: (rel) => /(?:^|\/)DEVIATIONS\.md$/.test(rel) },
  { kind: "progress log", test: (rel) => /(?:^|\/)PROGRESS\.md$/.test(rel) },
];

const ARCHIVE = /(?:^|\/)_?archive\//i;
/** A `ux/` folder anywhere in the path, or a basename holding ux-spec, ux-design or ux-architecture as its own word (never "linux-design"). */
const UX_SPEC =
  /(?:^|\/)ux\/.+\.mdx?$|(?:^|\/)(?:[^/]*[^a-z0-9/])?ux[-_ ]?(?:spec|design|architecture)[^/]*\.mdx?$/i;
const PRACTICE_UX = /^specs\/[^/]+\/ux\/.+\.mdx?$/;

/** UX specs outside the practice's living truth, archives excluded. */
export const listUxSpecs = (repo: Repo) =>
  repo.files.filter(
    (rel) =>
      MARKDOWN.test(rel) &&
      UX_SPEC.test(rel) &&
      !ARCHIVE.test(rel) &&
      !PRACTICE_UX.test(rel),
  );

const PRACTICE_DECISIONS =
  /^docs\/decisions\/(?:README\.md|ledger\.md|changelog\.md|conflicts\.md|only-you\.md|decision\.template\.md|records\/)/;

/** Whether a role file carries the practice's frontmatter (a `role:` key in it). */
const practiceRole = (text: string) =>
  hasFrontmatter(text) && /^role:\s*\S/m.test(text.split(/^---\s*$/m)[1] ?? "");

/** Lines as an editor counts them: a trailing newline closes the last line rather than opening another. */
const countLines = (text: string) => text.replace(/\n$/, "").split("\n").length;

/** A tracked file's text from the working tree, else from HEAD (a tracked file deleted but not yet committed). */
const readTracked = (repo: Repo, rel: string): string =>
  repo.read(rel) ?? repo.git("show", `HEAD:${rel}`) ?? "";

/** The kinds P3 scores: a log, or a host decisions folder, in a format of its own (assess.md's table). */
export const SCORED_RECORD_KINDS = [
  "decision log",
  "deviation log",
  "host decisions",
];

/**
 * Every record in a format of its own (T5): logs by kind, each closed spec
 * folder (one row per folder holding a log, its lines the folder's tracked
 * file count), UX specs, host decisions and host role prompts.
 */
export function listRecords(repo: Repo): RecordRow[] {
  const rows: RecordRow[] = [];
  const uxSpecs = new Set(listUxSpecs(repo));
  const specFolders = new Map<string, number>();
  for (const rel of repo.files) {
    if (!MARKDOWN.test(rel)) continue;
    const log = RECORD_KINDS.find((k) => k.test(rel))?.kind;
    const kind =
      log ??
      (rel.startsWith("docs/decisions/") && !PRACTICE_DECISIONS.test(rel)
        ? "host decisions"
        : rel.startsWith("docs/roles/") && !practiceRole(readTracked(repo, rel))
          ? "host role prompt"
          : uxSpecs.has(rel)
            ? "ux spec"
            : null);
    if (kind)
      rows.push({ kind, path: rel, lines: countLines(readTracked(repo, rel)) });
    if (log) {
      const folder = `${path.posix.dirname(rel)}/`;
      if (!specFolders.has(folder))
        specFolders.set(
          folder,
          repo.files.filter((f) => f.startsWith(folder)).length,
        );
    }
  }
  for (const [folder, files] of specFolders)
    rows.push({ kind: "closed spec folder", path: folder, lines: files });
  return rows;
}

export const P3: Signal = {
  id: "P3",
  group: "process",
  layer: 1,
  title: "Record kinds in a foreign format",
  measure(repo): Measure {
    const rows = listRecords(repo).filter((r) =>
      SCORED_RECORD_KINDS.includes(r.kind),
    );
    const kinds = [...new Set(rows.map((r) => r.kind))];
    const score = kinds.length === 0 ? 0 : kinds.length === 1 ? 1 : 2;
    return {
      value: { kinds, files: rows.length },
      score,
      evidence: kinds.length
        ? kinds
            .map((k) => {
              const n = rows.filter((r) => r.kind === k).length;
              return `${n} ${k}${n === 1 || k.endsWith("s") ? "" : "s"}`;
            })
            .join(", ")
        : "no decision or deviation log, and no host decisions folder, in a format of its own",
    };
  },
};

export const P4: Signal = {
  id: "P4",
  group: "process",
  layer: 1,
  title: "Living truth",
  measure(repo): Measure {
    const living = repo.files.filter((rel) => PRACTICE_UX.test(rel));
    if (living.length)
      return {
        value: "living",
        score: 0,
        evidence: `${living.length} files under specs/<app>/ux/`,
      };
    const elsewhere = listUxSpecs(repo);
    if (elsewhere.length)
      return {
        value: "elsewhere",
        score: 1,
        evidence: `${elsewhere.length} UX spec files outside specs/<app>/ux/: ${elsewhere.slice(0, 3).join(", ")}${elsewhere.length > 3 ? ` and ${elsewhere.length - 3} more` : ""}`,
      };
    return {
      value: "none",
      score: 2,
      evidence: "no UX spec found by name (archives excluded)",
    };
  },
};

export const hasOddCharacters = (rel: string) => /[\s]|[^\x20-\x7e]/.test(rel);

export const P5: Signal = {
  id: "P5",
  group: "process",
  layer: 1,
  title: "Doc paths with spaces or non-ASCII",
  measure(repo): Measure {
    const odd = repo.files.filter(
      (rel) => MARKDOWN.test(rel) && hasOddCharacters(rel),
    );
    const n = odd.length;
    const score = n === 0 ? 0 : n <= BANDS.oddPathsPartialUpTo ? 1 : 2;
    return {
      value: n,
      score,
      evidence: n
        ? `${n} tracked markdown paths hold a space or a non-ASCII character: ${odd
            .slice(0, 2)
            .map((r) => path.posix.basename(r))
            .join(", ")}${n > 2 ? ` and ${n - 2} more` : ""}`
        : "every tracked markdown path is plain ASCII without spaces",
    };
  },
};
