#!/usr/bin/env node
/**
 * Verifies that every relative markdown link in tracked *.md files resolves to
 * a real file or directory. Run via `yarn docs:check-links`.
 *
 * Exit code 1 with a file:line report when broken links are found.
 */
import { execSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
import { dirname, relative, resolve, sep } from "node:path";

const repoRoot = resolve(import.meta.dirname, "..");

// Read-only history, never updated, so its links point at paths as they were:
// docs/archive/** (see AGENTS.md) and docs/decisions/imported/** (what the
// practice replaced, record 0001).
const SKIPPED_DIRS = ["docs/archive/", "docs/decisions/imported/"];

// A target a later step lands, accepted as check-refs accepts it.
const PENDING = "tooling/refs-pending.json";

// [text](target) — capture target; tolerate titles ("...") after the URL and
// one level of balanced parentheses in the path (Next.js route groups).
const CODE_SPAN_RE = /(`+)(?:(?!\1)[\s\S])+?\1/g;
const LINK_RE = /\[[^\]]*\]\(<?((?:[^()\s<>]|\([^()\s]*\))+)(?:\s+"[^"]*")?>?\)/g;

// Leading "/" targets are site URLs in specs, not repo files.
const IGNORED_PREFIXES = ["http://", "https://", "mailto:", "tel:", "#", "/"];

/** Every markdown link in `files` (repo-relative) that resolves to nothing under `root`. */
export function findBroken({ root, files, pending = {} }) {
  const accepted = new Set(Object.keys(pending).map((k) => k.replace(/\/$/, "")));
  const broken = [];
  for (const file of files) {
    if (!file.endsWith(".md")) continue;
    if (SKIPPED_DIRS.some((dir) => file.startsWith(dir))) continue;
    const abs = resolve(root, file);
    const lines = readFileSync(abs, "utf8").split("\n");
    lines.forEach((line, i) => {
      // Strip inline code spans first. A regex like
      // `grep -E "from ['\"](next|react-dom)"` reads as [text](target) to the
      // link pattern, and a grep alternation is not a path. The backtick run is
      // matched by length so a doubled fence (used when the span itself contains
      // a backtick) closes on its own delimiter, not on the first backtick.
      const scannable = line.replace(CODE_SPAN_RE, (m) => " ".repeat(m.length));
      for (const match of scannable.matchAll(LINK_RE)) {
        const target = match[1];
        if (IGNORED_PREFIXES.some((p) => target.startsWith(p))) continue;
        const path = decodeURIComponent(target.split("#")[0]);
        if (!path) continue;
        const resolved = resolve(dirname(abs), path);
        if (existsSync(resolved)) continue;
        const rel = relative(root, resolved).split(sep).join("/");
        if (accepted.has(rel)) continue;
        broken.push({ file, line: i + 1, target });
      }
    });
  }
  return broken;
}

if (import.meta.filename === resolve(process.argv[1] ?? "")) {
  const files = execSync("git ls-files --cached --others --exclude-standard", {
    cwd: repoRoot,
    encoding: "utf8",
  })
    .split("\n")
    .filter((f) => f.endsWith(".md"));
  const pending = JSON.parse(readFileSync(resolve(repoRoot, PENDING), "utf8"));
  const broken = findBroken({ root: repoRoot, files, pending });
  for (const { file, line, target } of broken) {
    console.log(`${file}:${line}  →  ${target}`);
  }
  if (broken.length > 0) {
    console.error(`\n${broken.length} broken markdown link(s).`);
    process.exit(1);
  }
  console.log(`All markdown links resolve (${files.length} files checked).`);
}
