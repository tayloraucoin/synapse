/**
 * Regenerates the tree section of docs/architecture/directory-map.md.
 *
 * Run from the repo root:  yarn directory-map
 *
 * Sources the file list from `git ls-files --cached --others --exclude-standard`
 * (tracked + untracked, .gitignore respected), so node_modules, build output,
 * and env files never appear. Noise subtrees (individual migration SQL files,
 * font binaries, design-handoff exports, transcripts) are collapsed to a single
 * summary line.
 *
 * Annotations live in the ANNOTATIONS map below (path → note) and are re-applied
 * on every run — edit them HERE, not in the generated markdown. Keys that no
 * longer match a real path are reported as drift so stale notes get pruned.
 */

import { execSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const docPath = path.join(repoRoot, "docs/architecture/directory-map.md");

const BEGIN = "<!-- BEGIN:generated-tree -->";
const END = "<!-- END:generated-tree -->";

/** Paths (files or dirs) excluded from the map entirely. */
const EXCLUDE = [/^\.cursor\//, /^\.vscode\//, /\.DS_Store$/];

/**
 * Collapse rules: any path matching `test` is folded into a single synthetic
 * line rendered as `label` under `parent`.
 */
const COLLAPSE = [
  {
    test: /^packages\/db\/migrations\/\d{4}_.*\.sql$/,
    parent: "packages/db/migrations",
    label: (n, matches) => {
      const nums = matches
        .map((m) => m.match(/migrations\/(\d{4})_/)?.[1])
        .filter(Boolean)
        .sort();
      return `<${n} migration .sql files, ${nums[0]}\u2013${nums[nums.length - 1]} \u2014 append-only, human-reviewed before a hosted migrate>`;
    },
  },
  {
    test: /^packages\/db\/migrations\/meta\//,
    parent: "packages/db/migrations",
    label: (n) => `meta/ <${n} drizzle snapshot files + _journal.json>`,
  },
  {
    test: /^apps\/web\/public\/icons\//,
    parent: "apps/web/public/icons",
    label: (n) => `<${n} app-mark PNGs \u2014 generated placeholder, official spec \u00a79.8>`,
  },
];

const ANNOTATIONS = {
  // --- the spine ---
  "AGENTS.md": "the canonical agent instruction spine \u2014 shared guidance is edited only here",
  "CLAUDE.md": "one line: @AGENTS.md. Never add content",
  "turbo.json": "task graph + globalEnv \u2014 an undeclared env var fails the turbo lint, so add it here",
  "eslint.config.mjs": "root config, import boundaries only; code quality runs per package",
  "tsconfig.json": "project references only; no files of its own",

  // --- config ---
  "packages/config/eslint/boundaries.js": "the import matrix. Diverges from CC's copy \u2014 see TECHNICAL-DECISIONS",
  "packages/config/tailwind/preset.css": "every design token, and the ONE place a hex may appear",

  // --- platform-pure leaves ---
  "packages/types/src/domain/domain.ts": "schema-shaped unions, snake_case, fixed by v2 handoff \u00a73.5",
  "packages/types/src/domain/ui-state.ts": "presentational unions, kebab-case; derived per render, never stored",
  "packages/types/src/domain/view.ts": "what a component receives \u2014 never a DB row",
  "packages/constants/src/limits.ts": "Epic 1 \u00a79's bounds, shared by the zod schema and the input's maxLength",
  "packages/utils/src/time.ts": "every formatter takes an explicit timeZone \u2014 the day's, not the viewer's",

  // --- data ---
  "packages/db/src/rls.ts": "THE RLS bridge. Every user-scoped query goes through it; the singleton db bypasses policies",
  "packages/db/src/connection-env.ts": "tier resolution; defaults to local so nothing reaches production by omission",
  "packages/db/src/schema/rls/standard-policies.ts": "three factories, all owner-private. No admin-read exists",
  "packages/db/supabase/setup/02_apply_triggers_rls.sql": "data-driven: a new table gets updated_at and RLS automatically",
  "packages/db/SETUP.md": "who owns auth.users, the tier rules, and the never-migrate-a-hosted-tier rule",
  "packages/db/SCHEMA_REFERENCE.md": "generated from src/schema by db:schema-reference \u2014 never hand-edited",

  // --- identity ---
  "packages/auth/src/middleware.ts": "updateSession \u2014 the only place sessions refresh; protection lives in layouts",
  "packages/auth/src/context.ts": "one person role, guest. service_role is for the scheduler",

  // --- contract ---
  "packages/api/src/trpc.ts": "two procedure tiers, the error formatter, and the RLS rule in its header",
  "packages/api/src/services/notifications/fan-out.ts": "the one named RLS bypass, for the sessionless scheduler",
  "packages/api/src/services/jobs/run-scheduled-jobs.ts": "the job registry \u2014 empty until the feature epics land",

  // --- ui ---
  "packages/ui/src/index.ts": "enumerated exports; no \"./*\" wildcard",
  "packages/ui/components.json": "shadcn CLI config; writes to src/_shadcn, which the re-slot empties",
  "packages/ui/src/_shadcn": "the CLI's landing zone. Never ships code \u2014 only .gitkeep",

  // --- the app ---
  "apps/web/env.ts": "the only process.env reader in the app",
  "apps/web/next.config.ts": "collapses the tier vars into canonical names the browser can inline",
  "apps/web/proxy.ts": "session refresh only \u2014 Next 16's name for middleware",
  "apps/web/lib/routes.ts": "every path in the app. A hardcoded string elsewhere is a defect",
  "apps/web/lib/entry/resolve-entry.ts": "the cross-cutting \u00a74.2 decision tree, as a pure function",
  "apps/web/lib/stores/README.md": "the client-state rule, and why there is no Zustand store yet",
  "apps/web/public/sw.js": "push only. No caching \u2014 Phase 1 has no offline contract",
  "apps/web/app/(shell)/layout.tsx": "THE auth gate",
  "apps/mobile/README.md": "a deliberate empty seam. Do not scaffold",

  // --- delivery ---
  ".claude/settings.json": "tracked so every worktree inherits it; denies destructive database commands",
  ".github/workflows/ci.yml": "lint \u2192 boundaries \u2192 types \u2192 build, with no secrets",
  "docs/specs/infrastructure/PROGRESS.md": "the only authoritative answer to \"is this Complete\"",
  "docs/specs/infrastructure/DEVIATIONS.md": "append-only. Never edit a spec to match what shipped",
};

const raw = execSync("git ls-files --cached --others --exclude-standard", {
  cwd: repoRoot,
  encoding: "utf8",
  maxBuffer: 64 * 1024 * 1024,
})
  .split("\n")
  .map((l) => l.trim())
  .filter(Boolean)
  // git quotes paths with special chars; unquote and decode octal escapes
  .map((l) => {
    if (!l.startsWith('"')) return l;
    return l
      .slice(1, -1)
      .replace(/\\(\d{3})/g, (_, oct) => String.fromCharCode(parseInt(oct, 8)))
      .replace(/\\(.)/g, "$1");
  })
  // git emits raw UTF-8 bytes as individual escapes; normalize
  .map((l) => Buffer.from(l, "latin1").toString("utf8"))
  .filter((f) => !EXCLUDE.some((re) => re.test(f)));

// ── apply collapse rules ────────────────────────────────────────────────────

const collapsed = new Map(); // parentDir → label
const keep = [];
for (const rule of COLLAPSE) {
  rule._matches = [];
}
outer: for (const f of raw) {
  for (const rule of COLLAPSE) {
    if (rule.test.test(f)) {
      rule._matches.push(f);
      continue outer;
    }
  }
  keep.push(f);
}
for (const rule of COLLAPSE) {
  if (rule._matches.length === 0) continue;
  const byParent = new Map();
  for (const m of rule._matches) {
    const parent =
      typeof rule.parent === "function" ? rule.parent(m) : rule.parent;
    if (!byParent.has(parent)) byParent.set(parent, []);
    byParent.get(parent).push(m);
  }
  for (const [parent, matches] of byParent) {
    const label = rule.label(matches.length, matches);
    collapsed.set(parent, [...(collapsed.get(parent) ?? []), label]);
  }
}

// ── build tree ──────────────────────────────────────────────────────────────

const root = { dirs: new Map(), files: [] };
function ensureDir(parts) {
  let node = root;
  for (const part of parts) {
    if (!node.dirs.has(part)) node.dirs.set(part, { dirs: new Map(), files: [] });
    node = node.dirs.get(part);
  }
  return node;
}
for (const f of keep) {
  const parts = f.split("/");
  const dir = ensureDir(parts.slice(0, -1));
  dir.files.push(parts[parts.length - 1]);
}
for (const [parent, labels] of collapsed) {
  const dir = ensureDir(parent === "" ? [] : parent.split("/"));
  for (const label of labels) dir.files.push(label);
}

// ── render ──────────────────────────────────────────────────────────────────

const usedAnnotations = new Set();
function note(fullPath) {
  const n = ANNOTATIONS[fullPath];
  if (n === undefined) return "";
  usedAnnotations.add(fullPath);
  return `  # ${n}`;
}

const lines = [];
function render(node, prefix, depth) {
  const dirNames = [...node.dirs.keys()].sort((a, b) => a.localeCompare(b));
  const fileNames = [...node.files].sort((a, b) => a.localeCompare(b));
  const indent = "  ".repeat(depth);
  for (const d of dirNames) {
    const full = prefix ? `${prefix}/${d}` : d;
    lines.push(`${indent}${d}/${note(full)}`);
    render(node.dirs.get(d), full, depth + 1);
  }
  for (const f of fileNames) {
    const full = prefix ? `${prefix}/${f}` : f;
    lines.push(`${indent}${f}${note(full)}`);
  }
}
render(root, "", 0);

const drift = Object.keys(ANNOTATIONS).filter((k) => !usedAnnotations.has(k));

const stamp = new Date().toISOString().slice(0, 10);
const treeBlock = [
  BEGIN,
  "",
  `_Generated ${stamp} · ${keep.length} files (noise collapsed) · \`yarn directory-map\` to refresh._`,
  "",
  "```",
  ...lines,
  "```",
  "",
  END,
].join("\n");

// ── splice into doc ─────────────────────────────────────────────────────────

const doc = readFileSync(docPath, "utf8");
const beginIdx = doc.indexOf(BEGIN);
const endIdx = doc.indexOf(END);
if (beginIdx === -1 || endIdx === -1) {
  console.error(`Markers ${BEGIN} / ${END} not found in ${docPath}`);
  process.exit(1);
}
writeFileSync(
  docPath,
  doc.slice(0, beginIdx) + treeBlock + doc.slice(endIdx + END.length),
);

console.log(`directory-map: wrote ${lines.length} tree lines to ${path.relative(repoRoot, docPath)}`);
if (drift.length > 0) {
  console.warn(
    `directory-map: ${drift.length} annotation key(s) no longer match a path — prune or fix in scripts/generate-directory-map.mjs:\n  ${drift.join("\n  ")}`,
  );
}
