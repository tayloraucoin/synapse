#!/usr/bin/env node
/**
 * The ledger indexes the imported decision logs entry by entry (MIG-11).
 *
 *   yarn check-ledger           every entry heading in the nine logs has
 *                               exactly one ledger line citing its file and
 *                               its heading, and no entry line cites nothing
 *   yarn check-ledger --bytes   every file under the imported specs folder is
 *                               byte for byte its blob at the archive commit
 *
 * An entry is a `## ` heading in a TECHNICAL-DECISIONS.md, less the format
 * template's own. An entry line is `- <heading>: [`<log>`](<path>#<anchor>).`
 * Prettier writes the heading's `*emphasis*` as `_emphasis_`, so the two
 * asterisk and underscore forms compare equal.
 */
import { execFileSync } from "node:child_process";
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const LEDGER = "docs/decisions/ledger.md";
const IMPORTED = "docs/decisions/imported/specs";
/** The commit the logs were archived from, by git mv (record 0001). */
const ARCHIVE_COMMIT = "f2bfeb1";
const ARCHIVE_DIR = "docs/specs";
const TEMPLATE_HEADING = /^YYYY-MM-DD · /;
const DATED = /^\d{4}-\d{2}-\d{2} · /;
const sameEmphasis = (heading) => heading.replace(/\*/g, "_");

const read = (rel) => readFileSync(path.join(ROOT, rel), "utf8");
const git = (...args) =>
  execFileSync("git", args, { cwd: ROOT, encoding: "utf8" }).trim();

/** GitHub's heading anchor: lowercase, punctuation dropped, spaces to hyphens. */
function slug(text) {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{M}\p{N}\p{Pc} -]/gu, "")
    .replace(/ /g, "-");
}

function logEntries(log) {
  const rel = `${IMPORTED}/${log}/TECHNICAL-DECISIONS.md`;
  const seen = new Map();
  const entries = [];
  for (const line of read(rel).split("\n")) {
    const match = /^(#{1,6}) (.+)$/.exec(line);
    if (!match) continue;
    const base = slug(match[2]);
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    const anchor = count ? `${base}-${count}` : base;
    if (match[1] !== "##" || TEMPLATE_HEADING.test(match[2])) continue;
    entries.push({ heading: match[2], anchor, dated: DATED.test(match[2]) });
  }
  return entries;
}

function checkIndex() {
  const logs = readdirSync(path.join(ROOT, IMPORTED))
    .filter((d) => statSync(path.join(ROOT, IMPORTED, d)).isDirectory())
    .filter((d) =>
      readdirSync(path.join(ROOT, IMPORTED, d)).includes(
        "TECHNICAL-DECISIONS.md",
      ),
    );
  const entryLine =
    /^- (.+): \[`([a-z0-9-]+)`\]\(imported\/specs\/([a-z0-9-]+)\/TECHNICAL-DECISIONS\.md#([^)]+)\)\.$/;
  const cited = new Map();
  const problems = [];
  for (const line of read(LEDGER).split("\n")) {
    const match = entryLine.exec(line);
    if (!match) continue;
    const [, heading, text, log, anchor] = match;
    if (text !== log)
      problems.push(`link text ${text} names another log: ${line}`);
    const key = `${log}\n${sameEmphasis(heading)}\n${anchor}`;
    cited.set(key, (cited.get(key) ?? 0) + 1);
  }
  let dated = 0;
  let undated = 0;
  for (const log of logs)
    for (const entry of logEntries(log)) {
      entry.dated ? dated++ : undated++;
      const key = `${log}\n${sameEmphasis(entry.heading)}\n${entry.anchor}`;
      const count = cited.get(key) ?? 0;
      if (count !== 1)
        problems.push(
          `${log}: "${entry.heading}" has ${count} ledger lines, not 1`,
        );
      cited.delete(key);
    }
  for (const key of cited.keys()) {
    const [log, heading] = key.split("\n");
    problems.push(
      `${log}: the ledger cites "${heading}", which no heading matches`,
    );
  }
  const lines = dated + undated;
  for (const problem of problems) console.error(problem);
  console.log(
    `check-ledger — ${logs.length} logs, ${dated} dated entries and ${undated} undated (${lines}), ` +
      `${problems.length} not cited exactly once: ${problems.length ? "FAIL" : "ok"}`,
  );
  return problems.length === 0;
}

function checkBytes() {
  const files = git("ls-files", IMPORTED).split("\n").filter(Boolean);
  const changed = git("status", "--porcelain", "--", IMPORTED);
  const differ = files.filter((file) => {
    const archived = `${ARCHIVE_COMMIT}:${ARCHIVE_DIR}/${path.relative(IMPORTED, file)}`;
    return git("rev-parse", archived) !== git("hash-object", file);
  });
  for (const file of differ)
    console.error(`differs from ${ARCHIVE_COMMIT}: ${file}`);
  if (changed) console.error(`uncommitted under ${IMPORTED}:\n${changed}`);
  const ok = differ.length === 0 && !changed;
  console.log(
    `check-ledger --bytes — ${files.length} files under ${IMPORTED}, ${differ.length} differ from ${ARCHIVE_COMMIT}, ` +
      `${changed ? "uncommitted changes" : "none uncommitted"}: ${ok ? "ok" : "FAIL"}`,
  );
  return ok;
}

const ok = process.argv.includes("--bytes") ? checkBytes() : checkIndex();
process.exit(ok ? 0 : 1);
