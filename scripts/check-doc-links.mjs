#!/usr/bin/env node
/**
 * Verifies that every relative markdown link in tracked *.md files resolves to
 * a real file or directory. Run via `yarn docs:check-links`.
 *
 * Exit code 1 with a file:line report when broken links are found.
 */
import { execSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";

const repoRoot = resolve(import.meta.dirname, "..");

const files = execSync("git ls-files --cached --others --exclude-standard", {
  cwd: repoRoot,
  encoding: "utf8",
})
  .split("\n")
  // docs/archive/** is read-only history (see AGENTS.md) — its links point at
  // paths as they existed when archived and are never updated.
  .filter((f) => f.endsWith(".md") && !f.startsWith("docs/archive/"));

// [text](target) — capture target; tolerate titles ("...") after the URL and
// one level of balanced parentheses in the path (Next.js route groups).
const CODE_SPAN_RE = /(`+)(?:(?!\1)[\s\S])+?\1/g;
const LINK_RE = /\[[^\]]*\]\(<?((?:[^()\s<>]|\([^()\s]*\))+)(?:\s+"[^"]*")?>?\)/g;

// Leading "/" targets are site URLs in specs, not repo files.
const IGNORED_PREFIXES = ["http://", "https://", "mailto:", "tel:", "#", "/"];

let broken = 0;

for (const file of files) {
  const abs = resolve(repoRoot, file);
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
      if (!existsSync(resolved)) {
        broken++;
        console.log(`${file}:${i + 1}  →  ${target}`);
      }
    }
  });
}

if (broken > 0) {
  console.error(`\n${broken} broken markdown link(s).`);
  process.exit(1);
}
console.log(`All markdown links resolve (${files.length} files checked).`);
