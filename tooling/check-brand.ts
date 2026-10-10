/**
 * Holds the app to the brand kit (WEB-1; Design System artifact
 * EhNLGGfozdciR27ukmtmxL). Three checks, one per contract criterion:
 *
 *   yarn check-brand shape   no shadow, no pill or circle outside the mark,
 *                            a category dot and the current-item dot, no raw
 *                            colour outside preset.css, Newsreader on Review
 *                            surfaces only
 *   yarn check-brand docs    the brand docs and the typed token mirror name
 *                            the same roles, steps, fonts and sizes as
 *                            preset.css
 *   yarn check-brand trust   the trust line reads as the kit has it, in one
 *                            wording wherever it appears
 *
 * It reports and never edits. An allowlist entry names its reason; adding one
 * is a brand decision, not a fix.
 */

import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";

import { REPO_ROOT } from "./lib/docs.ts";

const PRESET = "packages/config/tailwind/preset.css";

/** The kit's README, "Words": the one wording of the trust line. */
const KIT_TRUST_LINE =
  "Only you can see your data. Not the people who built this, not anyone you invite.";

/** Round is allowed only here: the kit's mark, a category dot, the current-item dot. */
const ROUND_ALLOWED: Record<string, string> = {
  "apps/web/app/(shell)/settings/categories/_components/category-list.tsx": "category dot",
  "packages/ui/src/composed/display/category-bar/category-bar.tsx": "category dot in the legend",
  "packages/ui/src/composed/control/color-swatch-row/color-swatch-row.tsx": "category dot as a swatch",
  "apps/web/app/(shell)/_components/rail.tsx": "current-item dot",
  "apps/web/components/week-build/week-canvas.tsx": "current-item dot",
  "packages/ui/src/primitives/navigation/bottom-nav/bottom-nav.tsx": "current-item dot",
  "packages/ui/src/composed/display/state-word/state-word.tsx": "current-item dot",
  "packages/ui/src/composed/display/now-line/now-line.tsx": "current-item dot on the now line",
  "packages/ui/src/composed/display/firing-mark/firing-mark.tsx": "the running thread's dot (kit voice.md, Workflow)",
  "packages/ui/src/composed/control/picker-list/picker-list.tsx": "current-item dot",
};

/** A raw colour outside the preset is allowed only where CSS cannot reach. */
const RAW_COLOUR_ALLOWED: Record<string, string> = {
  "apps/web/app/layout.tsx": "viewport themeColor is static metadata; kit neutral-50 and neutral-900",
  "apps/web/app/manifest.ts": "the manifest is static JSON; kit neutral-50",
  "packages/ui/src/composed/control/oauth-button/oauth-button.tsx": "Google's own mark, in Google's required colours",
};

/** Newsreader belongs to Review screens (and the components only they render). */
const SERIF_ALLOWED: Record<string, string> = {
  "packages/ui/src/primitives/typography/text/text.variants.ts": "defines the review-* variants",
  "packages/ui/src/composed/display/big-number/big-number.tsx": "the Review figure",
  "apps/web/components/review-day/review-day.tsx": "Day Review",
  "apps/web/components/review-day/finished.tsx": "Day Review",
  "apps/web/components/review-week/review-week.tsx": "Week Review",
  "apps/web/app/_components/landing/review-figure.tsx": "a picture of the Day Review on the landing page",
};

type Finding = { file: string; line: number; text: string; why: string };

function listSource(): string[] {
  const result = spawnSync(
    "git",
    ["ls-files", "--cached", "--others", "--exclude-standard", "apps", "packages"],
    { cwd: REPO_ROOT, encoding: "utf8" },
  );
  if (result.status !== 0) throw new Error(result.stderr);
  return result.stdout
    .split("\n")
    .filter((file) => /\.(tsx?|css)$/.test(file))
    .filter((file) => !/(^|\/)(node_modules|\.next|dist)\//.test(file))
    .filter((file) => file !== PRESET);
}

const read = (file: string) => readFileSync(path.join(REPO_ROOT, file), "utf8");

/** A line that is only a comment says what a rule is; it does not break one. */
const isCommentLine = (line: string) => /^\s*(\*|\/\/|\/\*)/.test(line);

function scan(
  files: string[],
  pattern: RegExp,
  why: string,
  allowed: Record<string, string> = {},
): Finding[] {
  const found: Finding[] = [];
  for (const file of files) {
    if (file in allowed) continue;
    read(file)
      .split("\n")
      .forEach((text, index) => {
        if (!isCommentLine(text) && pattern.test(text))
          found.push({ file, line: index + 1, text: text.trim().slice(0, 140), why });
      });
  }
  return found;
}

function checkShape(): Finding[] {
  const files = listSource();
  const code = files.filter((file) => !file.endsWith(".stories.tsx"));
  return [
    ...scan(
      files,
      /(^|[\s"'`:])shadow-(2xs|xs|sm|md|lg|xl|2xl|inner|none|\(|\[)|box-shadow\s*:|--shadow-/,
      "shadow: the kit has no shadow token; separate with border",
    ),
    ...scan(
      files,
      /rounded-full|radius-full|rounded-\[9999px\]|border-radius:\s*(50%|9999px)/,
      "pill or circle: only the mark, a category dot and the current-item dot are round",
      ROUND_ALLOWED,
    ),
    ...scan(
      code,
      /#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3}\b(?![-\w])|\b(rgba?|hsla?|oklch|oklab|lab|lch)\(/,
      "raw colour: values live only in preset.css; reach them through a role",
      RAW_COLOUR_ALLOWED,
    ).filter((finding) => !/#[0-9a-fA-F]{3}\b/.test(finding.text) || /["'`\s(]#[0-9a-fA-F]{3,6}\b/.test(finding.text)),
    ...scan(
      code,
      /(^|[\s"'`])font-serif\b|var\(--font-serif\)|variant="review-(headline|sentence)"/,
      "Newsreader outside Review: the kit keeps it for Review screens",
      SERIF_ALLOWED,
    ),
    ...scan(
      files,
      /(bg|text|border|ring|fill|stroke|outline|from|to|via)-(neutral|brand|accent|violet|red|cat-[a-z]+)-[0-9]{2,3}\b/,
      "raw step in a class: reach it through a role",
    ),
  ];
}

/** Every custom property the preset declares, with its value, per theme. */
function readPreset(): { light: Map<string, string>; dark: Map<string, string> } {
  const css = read(PRESET).replace(/\/\*[\s\S]*?\*\//g, "");
  const block = (selector: RegExp) => {
    const match = selector.exec(css);
    if (!match) throw new Error(`${PRESET}: no ${selector} block`);
    const start = match.index + match[0].length;
    const body = css.slice(start, css.indexOf("\n}", start));
    const map = new Map<string, string>();
    for (const decl of body.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g))
      map.set(decl[1] ?? "", (decl[2] ?? "").trim());
    return map;
  };
  return { light: block(/^:root\s*\{/m), dark: block(/^\.dark\s*\{/m) };
}

/** `var(--syn-neutral-50)` → `neutral-50`; a literal stays itself. */
const stepOf = (value: string | undefined) =>
  value?.replace(/^var\(--syn-([\w-]+)\)$/, "$1").replace(/^var\((--[\w-]+)\)$/, "$1");

const ROLE_NAMES = [
  "background", "surface", "foreground", "muted-foreground", "border", "input",
  "primary", "primary-foreground", "now", "link", "off-schedule",
  "off-schedule-text", "destructive", "destructive-foreground", "destructive-text",
];
const CATEGORY_KEYS = ["leaf", "sky", "clay", "rose", "amber", "slate", "plum", "moss"];
const TYPE_NAMES = ["title", "heading", "body", "label", "figure", "caption", "review-title", "review-body"];

function checkDocs(): Finding[] {
  const found: Finding[] = [];
  const fail = (file: string, why: string, text = "") => found.push({ file, line: 0, text, why });
  const { light, dark } = readPreset();

  // 1. brand-tokens.md: one table row per role and per category token, light
  //    and dark, matching the preset; and no token named that the preset lacks.
  const tokensDoc = "docs/ai-guides/brand-tokens.md";
  const doc = read(tokensDoc);
  const rows = new Map<string, [string, string]>();
  for (const row of doc.matchAll(/^\|\s*`(--[\w-]+)`\s*\|\s*`([^`]+)`\s*\|\s*`([^`]+)`\s*\|/gm))
    rows.set(row[1] ?? "", [row[2] ?? "", row[3] ?? ""]);
  const expected = [
    ...ROLE_NAMES.map((name) => `--${name}`),
    ...CATEGORY_KEYS.flatMap((key) => [`--category-${key}-chip`, `--category-${key}-dot`]),
  ];
  for (const token of expected) {
    const want: [string, string] = [stepOf(light.get(token)) ?? "", stepOf(dark.get(token) ?? light.get(token)) ?? ""];
    if (!want[0]) fail(PRESET, `kit token ${token} has no role in the preset`);
    const got = rows.get(token);
    // A literal (a category's sRGB) stays in the preset; the doc cites the kit.
    if (want.every((value) => value.startsWith("#"))) want.fill("tokens.json");
    if (!got) fail(tokensDoc, `no table row for ${token}`);
    else if (got[0] !== want[0] || got[1] !== want[1])
      fail(tokensDoc, `${token} reads ${got.join(" / ")}; preset.css has ${want.join(" / ")}`);
  }
  const retiredAt = doc.search(/^## Retired names/m);
  const live = retiredAt === -1 ? doc : doc.slice(0, retiredAt);
  for (const mention of new Set(live.match(/`(--[\w-]+)`/g) ?? [])) {
    const token = mention.slice(1, -1);
    if (!light.has(token) && !dark.has(token) && !/^--(color|text|font|radius)-/.test(token))
      fail(tokensDoc, `names ${token}, which preset.css does not declare`);
  }

  // 2. Every ramp step the kit defines is declared.
  for (const ramp of ["neutral", "brand", "violet", "red"])
    for (const step of [50, 100, 200, 300, 400, 500, 600, 700, 800, 900])
      if (!light.has(`--syn-${ramp}-${step}`)) fail(PRESET, `missing --syn-${ramp}-${step}`);

  // 3. typography-guidelines.md: the two families and every size and leading.
  const typeDoc = "docs/ai-guides/typography-guidelines.md";
  const type = read(typeDoc);
  for (const family of ["Public Sans", "Newsreader"])
    if (!type.includes(family)) fail(typeDoc, `does not name ${family}`);
  for (const name of TYPE_NAMES) {
    const size = light.get(`--fs-${name}`);
    const leading = light.get(`--lh-${name}`);
    const row = new RegExp(`\\|\\s*\`${name}\`\\s*\\|\\s*${size}\\s*\\|\\s*${leading}\\s*\\|`);
    if (!size || !leading) fail(PRESET, `no --fs-${name} / --lh-${name}`);
    else if (!row.test(type)) fail(typeDoc, `no row \`${name}\` | ${size} | ${leading}`);
  }

  // 4. No brand doc still names the old face.
  for (const file of [
    tokensDoc,
    typeDoc,
    "docs/ux/branding-guide.md",
    "apps/web/docs/design/DESIGN.md",
    "apps/web/docs/design/tokens.md",
  ]) {
    const full = read(file);
    const retired = full.search(/^## Retired names/m);
    const text = retired === -1 ? full : full.slice(0, retired);
    if (/\bGeist\b/.test(text)) fail(file, "still names Geist; the interface is Public Sans");
    if (/--shadow-overlay|--radius-full|--syn-accent-/.test(text))
      fail(file, "names a token the kit retired (--shadow-overlay, --radius-full, --syn-accent-*)");
  }

  // 5. The typed mirror lists the same roles.
  const mirror = read("packages/ui/src/branding/tokens.ts");
  for (const name of ROLE_NAMES)
    if (!mirror.includes(`"--${name}"`)) fail("packages/ui/src/branding/tokens.ts", `ROLE_TOKENS lacks --${name}`);

  return found;
}

function checkTrust(): Finding[] {
  const found: Finding[] = [];
  const copyFile = "packages/ui/src/composed/display/trust-line/copy.ts";
  const copy = read(copyFile);
  const text = /text:\s*"([^"]+)"/.exec(copy)?.[1];
  if (text !== KIT_TRUST_LINE)
    found.push({ file: copyFile, line: 0, text: text ?? "(none)", why: "the trust line differs from the kit's wording" });
  // Anywhere else the sentence is started, it must be the whole sentence.
  for (const finding of scan(listSource(), /Only you can see/, ""))
    if (finding.file !== copyFile && !finding.text.includes(KIT_TRUST_LINE))
      found.push({ ...finding, why: "a second wording of the trust line; use TRUST_LINE_COPY" });
  return found;
}

const mode = process.argv[2];
const checks: Record<string, () => Finding[]> = { shape: checkShape, docs: checkDocs, trust: checkTrust };
const check = mode ? checks[mode] : undefined;
if (!check) {
  console.error("usage: yarn check-brand <shape|docs|trust>");
  process.exit(2);
}
const findings = check();
for (const f of findings) console.log(`${f.file}${f.line ? `:${f.line}` : ""}  ${f.why}${f.text ? `\n    ${f.text}` : ""}`);
console.log(`check-brand ${mode}: ${findings.length === 0 ? "pass" : `${findings.length} finding(s)`}`);
process.exit(findings.length === 0 ? 0 : 1);
