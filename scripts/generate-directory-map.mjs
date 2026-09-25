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
  "packages/config/eslint/no-emoji.js": "UX v1.2 R29 as lint: no emoji in any copy.ts; a glyph is IconValue data on the person's nouns (TD-20)",
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
  "packages/db/src/schema/enum-values.ts": "checks every pgEnum against its @syn/types union at compile time — wrap every new enum",
  "packages/db/src/schema/day/day-items.ts": "the record. Snapshots title/icon/unit/axes/preflight; original_scheduled_start is trigger-immutable",
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
  "packages/api/src/services/plan/save-slot.ts": "THE same-position rule (v1.1 \u00a73.5): multitask or one-of at one position, else SamePositionError. Every slot write pays it",
  "packages/api/src/services/plan/anchors.ts": "which profile time a block kind walks from, and in which direction \u2014 the only reader of that mapping",
  "packages/api/src/services/plan/to-view.ts": "one stackBlock walk per template; startClock is derived here, never stored",
  "packages/api/src/services/day/materialize-day.ts": "THE materialiser, by block (v1.1 §11.11). Reconciles, never rebuilds; pooled blocks hold nothing; originals only for fixtures and pins",
  "packages/api/src/services/day/lay-out-day.ts": "the whole day's arithmetic — chains stackBlock per kind, forward from wake, backward to work and lights-out. Pure; build and confirm both call it",
  "packages/api/src/services/day/confirm-day.ts": "Set the day — resolves the pools, walks once, writes original_scheduled_start for the first and only time",
  "packages/api/src/services/day/untouched.ts": "the two predicates that decide what materialisation may rewrite — item and block",
  "packages/api/src/services/day/undo-eligibility.ts": "the three refusals an undo of any shifts row meets \u2014 ten minutes, a later shift, done anyway; Adjust's undo reads it",
  "packages/api/src/services/day/reflow-block.ts": "the one re-lay of a set day (v1.1 §6.3–6.5): fixed points as pins, the rest walked forward; two columns written, never the original",
  "packages/api/src/services/day/adjust-day.ts": "Adjust — scope computed, preview then commit with a fingerprint, one shifts row of the right kind, undo per decision (b)",
  "packages/utils/src/day/adjust.ts": "Adjust's arithmetic, pure: slide or hold; shorten · cut · choose over fitToBudget and stackBlock",
  "packages/api/src/services/notifications/block-pushes.ts": "the seam confirmDay calls: the scan model is the delivery (v1.1 §9, DYN-20), so it reports the block boundaries ahead and writes nothing",
  "packages/api/src/services/plan/fit.ts": "the fit at planning time (v1.1 §3.10): computeBudget over the profile and the orient/prep templates — first run's last screen reads it",
  "packages/api/src/services/day/trade-workouts.ts": "the week build's training swap (R25): both days' workout items, refused on a set day",
  "packages/api/src/services/user/complete-first-run.ts": "the one write that ends first run: marks the row, stores the overflow mode, pre-fills the current week",

  // --- ui ---
  "packages/ui/src/index.ts": "enumerated exports; no \"./*\" wildcard",
  "packages/ui/components.json": "shadcn CLI config; writes to src/_shadcn, which the re-slot empties",
  "packages/ui/src/_shadcn": "the CLI's landing zone. Never ships code \u2014 only .gitkeep",
  "packages/ui/src/composed/control/drag-layer/drag-layer.tsx": "THE drag layer (v1.1 \u00a76.5, \u00a710.4): owns the gesture, the preview, the keyboard and the live region; emits intents, writes nothing",
  "packages/hooks/src/use-optimistic-value.ts": "the optimistic contract (v1.2 TD-18): the value moves on the tap, the write follows on a debounce, a rejection reverts unless a newer tap is pending; platform-pure",
  "packages/ui/src/lib/committing.ts": "the committing face, one string: a hairline pulse, never a disabled control (v1.2 guardrail 4)",
  "packages/ui/src/primitives/layout/card/card.tsx": "the setup card's base (v1.2 \u00a74): surface, hairline, 16px, flat; feature folders compose it",
  "packages/ui/src/composed/display/emoji-slot/emoji-slot.tsx": "the one home for the emoji rule (v1.2 \u00a710.2): a 44px square, font-emoji, aria-hidden; every row and card header renders through it",
  "packages/ui/src/composed/control/select-row/select-row.tsx": "the row that is the selection (v1.2 \u00a74): button[aria-pressed], tick on the tap, optimistic",
  "packages/ui/src/composed/control/sortable-list/sortable-list.tsx": "reorder by handle, pointer and keyboard over dnd-kit (v1.2 TD-16); Alt+arrows and a live region; shares no code with drag-layer",
  "packages/ui/src/composed/control/range-editor/range-editor.tsx": "from \u00b7 to \u00b7 min on one 44px line; never clamps (R21); the one sentence when to < from",
  "packages/ui/src/composed/control/rich-text-editor/rich-text-editor.tsx": "the passage editor over tiptap (v1.2 TD-15): five controls, Markdown at the boundary, one renderer for editing and reading",
  "packages/ui/src/composed/control/tag-input/tag-input.tsx": "chips from Enter or a comma, a 44px \u00d7 each, Backspace takes the last, a cap with a count",
  "packages/ui/src/composed/display/passage-carousel/passage-carousel.tsx": "the orient frame's reading (v1.2 \u00a75.2): one slide, dots as tabs, swipe or arrows, crossfade under reduced motion",
  "packages/ui/src/composed/display/block-band/band.variants.ts": "the bands' skin \u2014 bg-surface at rest, no new colour (v1.1 \u00a710.3)",
  "packages/ui/src/composed/layout/step-frame/step-frame.tsx": "the first-run frame, presentational; the app's (setup)/_components/step-frame.tsx binds it",
  "packages/ui/src/composed/__fixtures__/view-models.ts": "story fixtures shaped as the app's view models \u2014 Taylor's Monday by block lives here",

  // --- the app ---
  "apps/web/env.ts": "the only process.env reader in the app",
  "apps/web/next.config.ts": "collapses the tier vars into canonical names the browser can inline",
  "apps/web/proxy.ts": "session refresh only \u2014 Next 16's name for middleware",
  "apps/web/lib/routes.ts": "every path in the app. A hardcoded string elsewhere is a defect",
  "apps/web/lib/entry/resolve-entry.ts": "the cross-cutting \u00a74.2 decision tree, as a pure function",
  "apps/web/app/page.tsx": "the landing page when signed out; the \u00a74.2 entry tree when signed in",
  "apps/web/content/landing.ts": "the landing page's copy deck (SYS-6). Surface prose lives here, never inline",
  "apps/web/app/_components/landing/example-day.ts": "the landing's example day, its block grouping, and its state derivation \u2014 no React",
  "apps/web/lib/stores/README.md": "the client-state rule, and why there is no Zustand store yet",
  "apps/web/public/sw.js": "push only. No caching \u2014 Phase 1 has no offline contract",
  "apps/web/app/(shell)/layout.tsx": "THE auth gate",
  "apps/web/components/block-editor/use-block-editor.ts": "the block editor's state (v1.1 §3.11): the autosave queue, and the client walk — stackBlock over the page's SlotViews, so the footer never fetches",
  "apps/web/components/block-editor/slot-sheet.tsx": "the editor's one form; the same-position question with three answers lives in its footer",
  "apps/web/app/(setup)/_components/fact-screen.tsx": "one first-run screen's two frames — the sequence (StepFrame) and Settings → Your day (embedded)",
  "apps/web/app/(setup)/_components/step-3-work-shape.tsx": "screen 3 (v1.2 §4.3): Yes — the anchor, its end, what gives, ensureWork; No — the work-day type cards, each writing itself",
  "apps/web/app/(setup)/_components/work-day-type-card.tsx": "one kind of work day (v1.2 §4.3, TD-14): kind chips fill name and glyph, Done writes the template and collapses to one line",
  "apps/web/app/(setup)/_components/step-9-ranked.tsx": "screen 9 (v1.2 §4.9): one HabitSetupCard per morning slot in tick order; collapsed cards sink; nothing reorders here",
  "apps/web/app/(setup)/_components/habit-setup-card.tsx": "one habit ranked (v1.2 §4.9, TD-11): matters, usually (the slot's length), up to three versions; every control writes its own fact",
  "apps/web/app/(setup)/_components/use-prep-steps.ts": "screen 7's writes: a tick creates the step and its prep slot at once, queued per row so a second tap is never a second create (S7.5)",
  "apps/web/components/habit-sheet/quick-habit-sheet.tsx": "the habit sheet's quick modes (v1.2 S7.3): emoji, name, range — a step before work, a morning habit, a wind-down habit",
  "apps/web/app/(setup)/_components/workout-setup-card.tsx": "one workout of the rotation (v1.2 §4.10, TD-12): type chips fill name and glyph when empty; where, and the travel beside the length; creates on the first fact",
  "apps/web/app/(setup)/_components/focus-setup-card.tsx": "one focus (v1.2 §4.12): a blank glyph by default, a week count, usual days with Flexible; creates on the first fact",
  "apps/web/app/(setup)/_components/step-11-closing.tsx": "screen 11 (v1.2 §4.11, R38): phone away follows lights out until touched; wind-down rows; sortable prompts; the reminder in the person's words",
  "apps/web/components/passages/passage-sheet.tsx": "a passage's sheet (v1.2 §4.6, TD-15): title, the five-control editor, four image tiles uploaded on add, tags; writes on Save",
  "apps/web/components/passages/passage-list.tsx": "the passages in cycle order — sortable cards, an archive with a five-second undo; screen 6 and Settings mount the same list",
  "apps/web/components/passages/use-passages.ts": "the list's writes at once: reorder on drop, archive with undo through restore",
  "apps/web/components/passages/excerpt.ts": "the card's decorative excerpt — Markdown stripped to text; the body itself is only ever rendered by the read-only editor",
  "apps/web/app/(setup)/_components/step-2-blocks.tsx": "screen 2 — the blocks primer (v1.3 §4.2): the example day and the legend, one read, no skip",
  "apps/web/app/(setup)/_components/step-4-days.tsx": "screen 4 — mounts YourDays (the day builder, components/day-builder); Continue · n days moves to 5; ?edit= opens a plan's review",
  "apps/web/app/(setup)/_components/step-5-week.tsx": "screen 5 — the seven weekday rows and the mode question (v1.3 §4.5); Open today / Plan this week first complete first run with morning_mode and pre-fill the week from the plans",
  "apps/web/components/blocks-primer/blocks-primer.tsx": "the example day on the 28px axis (7:00–22:30, sleep shortened beneath), hued bands with one label lane, and the legend",
  "apps/web/components/day-builder/day-builder.tsx": "the nine-screen builder (v1.2 §4.13): one plan held by useDayBuilder, every screen writes as it goes, Next moves, Save Day A completes",
  "apps/web/components/day-builder/use-day-builder.ts": "the builder's state — the plan from the service's response (TD-21 clocks), the templates with usedBy, the habits, the fixtures; a chained patch",
  "apps/web/components/day-builder/use-list-screen.ts": "13d/13e/13h's writes: a list created on arrival once per plan and kind, chosen by FK never copied, slots saved per change",
  "apps/web/components/day-builder/preview.ts": "13i's client preview — the whole day through stackBlock, the one arithmetic; nothing here writes a block or an item",
  "apps/web/components/day-builder/screens/13e-morning.tsx": "the routine against the room: computeBudget's number stated as room, the greedy fill by rank, BudgetLine with 'for the routine' and 'runs to'",
  "apps/web/components/day-builder/your-days.tsx": "the list of plans (sequence and Settings): DayPlanCards, Build another day, first arrival opens the builder at once",
  "apps/web/app/(shell)/settings/your-day/_components/your-day-list.tsx": "the twelve first-run screens as a list (v1.1 §4.14); block-kind rows open the editor for their kind",
  "apps/web/components/landscape-chooser/use-landscape.ts": "the landscape's single commit (W4): ticks are local, Continue writes the habits then the morning template's slots — never a fit number",
  "apps/web/components/week-build/day-sheet.tsx": "one day's plan by block (v1.1 §4.13): every write is assignBlocks with the whole assignment; the sheet never reconciles",
  "apps/web/components/orient-frame/orient-frame.tsx": "the first screen of the morning (v1.1 §5.2): the person's words, one line to write, one primary — no time, no count, no chrome",
  "apps/web/components/quick-pick/use-quick-pick.ts": "the quick-pick's answers and the live budget line (v1.1 §5.3); Set the day sends only what changed",
  "packages/utils/src/day/skip-line.ts": "R18 as code: the one behaviour line, second consecutive skip only, once in seven days",
  "packages/api/src/services/day/orient.ts": "the frame's read, and the wake stamp that rides in it — once per day (R11)",
  "packages/api/src/services/day/choose-alternate.ts": "one of, after the pick (v1.1 §6.3): the row takes the other member; the block re-flows",
  "packages/api/src/services/day/add-from-library.ts": "Add from the library: a habit-day item at the end of a block, re-flowed; no block on an unstructured day",
  "packages/api/src/services/day/habit-item.ts": "a habit as a pick- or plan-made item, its version resolved (v1.2 §3.5), and the workout with its two travel rows — one writer for the pick, the trade and the week build (v1.2 §3.7)",
  "packages/api/src/services/day/apply-work-type.ts": "Working today (v1.2 §3.9): a work-day type onto a Rarely day through the materialiser, and the reverse — not_today, items parked, the day's work anchors cleared; nothing scored",
  "apps/web/components/day-list/block-section.tsx": "one block's rows (v1.1 §6.1): the work container with nested fixtures, the devices-off marker, the confirm-in-the-morning rows",
  "apps/web/components/adjust-sheet/use-adjust.ts": "Adjust's four answers feeding one server preview (v1.1 §6.6); Set sends the fingerprint; nothing is inferred",
  "apps/web/components/habit-day-sheet/habit-day-sheet.tsx": "Edit today's (v1.1 §6.4): the day, never the habit; no clamp on Takes",
  "apps/web/components/journal/journal-screen.tsx": "the journal (v1.1 §7.2): the person's prompts over serif fields that autosave; no finish, no count, no starter phrase",
  "packages/api/src/services/review/confirm-last-night.ts": "confirm yesterday from the review (v1.1 §7.3): the morning's rule on the review's own day; never a reason",
  "packages/api/src/services/review/get-review-week.ts": "the week read: adherence from the resolver, and v1.1 §8.2's counts, time by block and reflections derived from the rows, never stored",
  "packages/api/src/services/jobs/notify.ts": "the notification scans: the four start kinds in one job gated on confirmed_at and grouped by the minute (v1.1 §9), then N4–N6; quiet after Day Complete on every query",
  "apps/web/components/schedule-canvas/layout.ts": "the Schedule's arithmetic, pure: bands, slack, the work container, blocks, ghosts only once the original time has passed (v1.1 §6.5)",
  "apps/web/components/schedule-canvas/schedule-canvas.tsx": "the editable Schedule (v1.1 §6.5): the layer's intents as DYN-6's writes; a pin asks, the morning band goes to Adjust, a record has no layer",
  "apps/web/components/block-editor/block-strip.tsx": "the editor's strip (v1.1 §3.11): the layer in editor mode — reorder through moveSlot, resize and gap through saveSlot, nothing clamped",
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
