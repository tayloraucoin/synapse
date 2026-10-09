/**
 * Every path, script and skill a live file names must exist (E-45, pulled
 * forward on audit day: the workflow docs named a prompt builder that did not
 * exist, and no check said so).
 *
 *   yarn check-refs
 *
 * Scans the live files an agent or a person follows: the spine, the rules, the
 * generated agents, the skills, and docs/ minus the byte-preserved bodies
 * (research, roles, the verbatim prompts). Checks markdown link targets,
 * repo paths in code spans, `yarn <script>` names and `/tk-<skill>` names.
 *
 * A reference to something a later step lands goes in tooling/refs-pending.json
 * with the step that lands it. The check fails on an unlisted missing
 * reference, and on a pending entry that now exists, so the list only shrinks;
 * a git-ignored entry is machine-local and never counts as existing.
 */

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

import { listMarkdown, REPO_ROOT } from "./lib/docs.ts";
import { runGit } from "./lib/git.ts";
import { loadToolkit } from "./lib/toolkit.ts";

const PENDING = "tooling/refs-pending.json";
const toolkit = loadToolkit();

/** Day one's file list (MIG T2); installed into an overlay target at this same path. */
const MANIFEST = "docs/runbooks/migrate/manifest.json";

/**
 * Under the overlay tiers the host's own docs are left alone, as lint:docs
 * leaves them (MIG T3): the live files are the manifest's paths that exist,
 * folders expanded to their markdown, plus the spine.
 */
function overlayFiles(): string[] {
  const manifest = JSON.parse(
    readFileSync(path.join(REPO_ROOT, MANIFEST), "utf8"),
  ) as { entries: { path: string }[] };
  const files = manifest.entries.flatMap(({ path: rel }) => {
    const clean = rel.replace(/\/+$/, "");
    if (!existsSync(path.join(REPO_ROOT, clean))) return [];
    if (statSync(path.join(REPO_ROOT, clean)).isDirectory())
      return listMarkdown(clean);
    return clean.endsWith(".md") ? [clean] : [];
  });
  return [
    ...new Set([
      ...["AGENTS.md", "CLAUDE.md", "docs/index.md"].filter((f) =>
        existsSync(path.join(REPO_ROOT, f)),
      ),
      ...files.filter(
        (f) =>
          !f.startsWith("docs/roles/") &&
          !f.startsWith("docs/decisions/records/"),
      ),
    ]),
  ];
}

/** Live files: what an agent loads or a person follows. Byte-preserved bodies are out. */
function liveFiles(): string[] {
  if (toolkit.tier !== "starter") return overlayFiles();
  const roots = ["AGENTS.md", "CLAUDE.md", "README.md"];
  const under = (dir: string) =>
    existsSync(path.join(REPO_ROOT, dir)) ? listMarkdown(dir) : [];
  const apps = Object.values(toolkit.apps).flatMap((app) =>
    ["AGENTS.md", "CLAUDE.md"]
      .map((f) => `${app.path}/${f}`)
      .filter((f) => existsSync(path.join(REPO_ROOT, f))),
  );
  const docs = under("docs").filter(
    (f) =>
      !f.startsWith("docs/research/") &&
      !f.startsWith("docs/roles/") &&
      !f.startsWith("docs/_generated/") &&
      // History, not instruction: the changelog and the records name paths as they were.
      f !== "docs/decisions/changelog.md" &&
      !f.startsWith("docs/decisions/records/") &&
      !/^docs\/prompts\/archive\//.test(f),
  );
  return [
    ...roots,
    ...apps,
    ...under(".claude/rules"),
    ...under(".claude/agents"),
    ...under(".claude/skills"),
    ...docs,
  ];
}

const scripts = new Set(
  Object.keys(
    (
      JSON.parse(
        readFileSync(path.join(REPO_ROOT, "package.json"), "utf8"),
      ) as {
        scripts: Record<string, string>;
      }
    ).scripts,
  ),
);
const skills = new Set(
  existsSync(path.join(REPO_ROOT, ".claude/skills"))
    ? readdirSync(path.join(REPO_ROOT, ".claude/skills")).filter((n) =>
        existsSync(path.join(REPO_ROOT, ".claude/skills", n, "SKILL.md")),
      )
    : [],
);
const pending = JSON.parse(
  readFileSync(path.join(REPO_ROOT, PENDING), "utf8"),
) as Record<string, string>;

const exists = (rel: string) => existsSync(path.join(REPO_ROOT, rel));
const isDir = (rel: string) =>
  exists(rel) && statSync(path.join(REPO_ROOT, rel)).isDirectory();
const ROOTS = [
  "docs/",
  "apps/",
  "packages/",
  "tooling/",
  ".claude/",
  ".github/",
];
/** Paths under the specs root are illustrations of the A4 layout, never checked. */
const illustrative = (rel: string) =>
  rel === toolkit.specsRoot || rel.startsWith(`${toolkit.specsRoot}/`);

type Ref = { file: string; ref: string; kind: "path" | "script" | "skill" };

function refsIn(file: string): Ref[] {
  const text = readFileSync(path.join(REPO_ROOT, file), "utf8");
  const found: Ref[] = [];
  const dir = path.posix.dirname(file);
  // Markdown links to repo files.
  for (const match of text.matchAll(/\]\(([^)\s#]+)(?:#[^)]*)?\)/g)) {
    const target = match[1]!;
    if (/^[a-z]+:/i.test(target) || target.startsWith("/")) continue;
    const resolved = path.posix.normalize(path.posix.join(dir, target));
    found.push({ file, ref: resolved, kind: "path" });
  }
  // Repo paths in code spans, without globs or placeholders.
  for (const match of text.matchAll(/`([^`\n]+)`/g)) {
    const span = match[1]!.trim();
    if (/[*?<>{}$|]/.test(span) || /\s/.test(span)) continue;
    if (ROOTS.some((root) => span.startsWith(root)))
      found.push({ file, ref: span, kind: "path" });
  }
  for (const match of text.matchAll(/`yarn ([a-z][a-z0-9:-]*)/g))
    found.push({ file, ref: match[1]!, kind: "script" });
  for (const match of text.matchAll(/`\/(tk-[a-z-]+)/g))
    found.push({ file, ref: match[1]!, kind: "skill" });
  return found;
}

const BUILTIN_SCRIPTS = new Set([
  "install",
  "add",
  "dlx",
  "up",
  "remove",
  "run",
  "prettier",
  "playwright",
  "node",
  "tsc",
  "eslint",
  "why",
  "npm",
  "workspace",
]);

const missing = new Map<string, Set<string>>();
const seenPending = new Set<string>();
for (const file of liveFiles()) {
  for (const { ref, kind } of refsIn(file)) {
    let ok: boolean;
    let key: string;
    if (kind === "script") {
      if (BUILTIN_SCRIPTS.has(ref)) continue;
      ok = scripts.has(ref);
      key = `yarn ${ref}`;
    } else if (kind === "skill") {
      ok = skills.has(ref);
      key = `/${ref}`;
    } else {
      const rel = ref.replace(/\/$/, "");
      if (illustrative(rel)) continue;
      ok = ref.endsWith("/") ? isDir(rel) : exists(rel);
      key = ref;
    }
    if (ok) continue;
    if (key in pending) {
      seenPending.add(key);
      continue;
    }
    missing.set(key, (missing.get(key) ?? new Set()).add(file));
  }
}

/** A git-ignored path is machine-local: present on one machine, never in CI. */
const ignored = (rel: string) => runGit(["check-ignore", "-q", rel]) !== null;

const stale = Object.keys(pending).filter((key) => {
  if (key.startsWith("yarn ")) return scripts.has(key.slice(5));
  if (key.startsWith("/tk-")) return skills.has(key.slice(1));
  if (ignored(key)) return false;
  return key.endsWith("/") ? isDir(key.slice(0, -1)) : exists(key);
});

const problems: string[] = [];
for (const [key, files] of missing)
  problems.push(
    `${key} does not exist; named in ${[...files].join(", ")}. Create it, fix the name, or add it to ${PENDING} with the step that lands it.`,
  );
for (const key of stale)
  problems.push(`${key} exists now; remove it from ${PENDING}.`);

if (problems.length > 0) {
  console.error(
    `check-refs — ${problems.length} problem(s):\n  ${problems.join("\n  ")}`,
  );
  process.exit(1);
}
const waiting = Object.keys(pending).length;
console.log(
  `check-refs — every reference in ${liveFiles().length} live files resolves; ${waiting} pending (${[...new Set(Object.values(pending))].join(", ")}).`,
);
