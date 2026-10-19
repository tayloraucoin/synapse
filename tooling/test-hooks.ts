/**
 * Runs every hook against its fixtures (E-16; J3).
 *
 *   yarn test:hooks
 *
 * A fixture file is tooling/hooks/fixtures/<hook>.json: synthetic hook inputs,
 * each with what it must produce. Its `kind` says how the hook answers:
 *   - "guard" (the default, PreToolUse): exit 0 allows, exit 2 denies, and
 *     the denial on stderr starts with "<hook> [<rule>]"; "ask" means exit 0
 *     with `permissionDecision: "ask"` on stdout, its reason opening the same way;
 *   - "stop": exit 0 and one JSON object on stdout; "deny" means
 *     `decision: "block"`, "allow" means no decision;
 *   - "context" (SessionStart): exit 0 and plain text on stdout that never
 *     opens with "{" and stays within `limit` characters; only "allow" cases.
 * The run fails when a case misbehaves, when a guard or stop rule lacks an
 * allow or a deny case (an ask rule: an allow and an ask case), when a denial or reason is longer than its budget,
 * or when the hook is slow.
 */

import { spawnSync } from "node:child_process";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { performance } from "node:perf_hooks";

import { REPO_ROOT } from "./lib/docs.ts";

const FIXTURES = "tooling/hooks/fixtures";
/** A PreToolUse hook runs before every matching call; the build prompt's limit is 200 ms. */
const MEDIAN_LIMIT_MS = 200;
/** E-16: at most 60 tokens per denial, estimated as characters / 4. */
const DENIAL_TOKEN_LIMIT = 60;

type Case = {
  rule: string;
  expect: "allow" | "deny" | "ask";
  name: string;
  command?: string;
  input?: Record<string, unknown>;
  cwd?: string;
  context?: Record<string, unknown>;
  message?: string;
};
type FixtureFile = {
  hook: string;
  kind?: "guard" | "stop" | "context";
  /** context: the most characters the hook may print. */
  limit?: number;
  defaultContext?: Record<string, unknown>;
  cases: Case[];
};

const failures: string[] = [];
const summary: string[] = [];

/** A Stop or SessionStart hook's answer against its case; the problem, or null. */
function checkAnswer(
  kind: "stop" | "context",
  item: Case,
  result: { status: number | null; stdout: string },
  limit = 600,
): string | null {
  if (result.status !== 0) return `expected exit 0, got ${result.status}`;
  const out = result.stdout.trim();
  if (kind === "context") {
    if (out.startsWith("{"))
      return "the output opens with {, which Claude Code may drop as broken JSON (V2)";
    if (out.length > limit)
      return `the output is ${out.length} characters; the limit is ${limit}`;
    if (item.message && !out.includes(item.message))
      return `the output does not say "${item.message}": ${out}`;
    return null;
  }
  let answer: { decision?: string; reason?: string; systemMessage?: string };
  try {
    answer = JSON.parse(out);
  } catch {
    return `stdout is not one JSON object: ${out.slice(0, 200)}`;
  }
  const blocked = answer.decision === "block";
  if (blocked !== (item.expect === "deny"))
    return `expected ${item.expect === "deny" ? "a block" : "no block"}, got ${JSON.stringify(answer).slice(0, 200)}`;
  const text = `${answer.reason ?? ""} ${answer.systemMessage ?? ""}`;
  if (item.message && !text.includes(item.message))
    return `the answer does not say "${item.message}": ${text.slice(0, 200)}`;
  if (Math.ceil((answer.reason ?? "").length / 4) > 300)
    return "the block reason is over 300 tokens (E-18)";
  return null;
}

/** A guard's "ask" reason from its stdout, or null when it did not ask. */
function askReason(stdout: string): string | null {
  const out = stdout.trim();
  if (!out.startsWith("{")) return null;
  try {
    const answer = JSON.parse(out) as {
      hookSpecificOutput?: {
        permissionDecision?: string;
        permissionDecisionReason?: string;
      };
    };
    const decision = answer.hookSpecificOutput;
    return decision?.permissionDecision === "ask"
      ? (decision.permissionDecisionReason ?? "")
      : null;
  } catch {
    return null;
  }
}

for (const name of readdirSync(path.join(REPO_ROOT, FIXTURES)).sort()) {
  if (!name.endsWith(".json")) continue;
  const file = JSON.parse(
    readFileSync(path.join(REPO_ROOT, FIXTURES, name), "utf8"),
  ) as FixtureFile;
  const script = path.join(REPO_ROOT, "tooling/hooks", `${file.hook}.ts`);
  const seen = new Map<string, Set<string>>();
  const times: number[] = [];
  let longest = 0;

  for (const item of file.cases) {
    const input = item.input
      ? JSON.parse(JSON.stringify(item.input).replaceAll("$ROOT", REPO_ROOT))
      : {
          hook_event_name: "PreToolUse",
          tool_name: "Bash",
          tool_input: { command: item.command },
          cwd: (item.cwd ?? "$ROOT").replace("$ROOT", REPO_ROOT),
        };
    const env = { ...process.env };
    delete env.CLAUDE_PROJECT_DIR;
    env.PEM_HOOK_FIXTURE_CONTEXT = JSON.stringify({
      ...file.defaultContext,
      ...item.context,
    });
    const started = performance.now();
    const result = spawnSync(process.execPath, [script], {
      input: JSON.stringify(input),
      encoding: "utf8",
      env,
    });
    times.push(performance.now() - started);

    const where = `${file.hook} / ${item.rule} / ${item.name}`;
    seen.set(item.rule, (seen.get(item.rule) ?? new Set()).add(item.expect));
    const kind = file.kind ?? "guard";
    if (kind !== "guard") {
      const problem = checkAnswer(kind, item, result, file.limit);
      if (problem) failures.push(`${where}: ${problem}`);
      continue;
    }
    const expected = item.expect === "deny" ? 2 : 0;
    if (result.status !== expected) {
      failures.push(
        `${where}: expected exit ${expected}, got ${result.status}. stderr: ${result.stderr.trim() || "(empty)"}`,
      );
      continue;
    }
    const asked = askReason(result.stdout);
    if ((asked !== null) !== (item.expect === "ask")) {
      failures.push(
        `${where}: expected ${item.expect}, got ${asked === null ? "no ask" : `an ask: ${asked}`}`,
      );
      continue;
    }
    if (item.expect === "allow") continue;
    const stderr = asked ?? result.stderr.trim();
    longest = Math.max(longest, Math.ceil(stderr.length / 4));
    if (!stderr.startsWith(`${file.hook} [${item.rule}]`))
      failures.push(`${where}: ${item.expect} by the wrong rule: ${stderr}`);
    if (item.message && !stderr.includes(item.message))
      failures.push(
        `${where}: the denial does not say "${item.message}": ${stderr}`,
      );
    if (Math.ceil(stderr.length / 4) > DENIAL_TOKEN_LIMIT)
      failures.push(
        `${where}: the denial is about ${Math.ceil(stderr.length / 4)} tokens; the limit is ${DENIAL_TOKEN_LIMIT}`,
      );
  }

  for (const [rule, kinds] of (file.kind ?? "guard") === "context"
    ? []
    : seen) {
    for (const kind of ["allow", kinds.has("ask") ? "ask" : "deny"])
      if (!kinds.has(kind))
        failures.push(
          `${file.hook} / ${rule}: no ${kind} case; every rule needs both`,
        );
  }

  const sorted = [...times].sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)] ?? 0;
  const max = sorted.at(-1) ?? 0;
  if (median > MEDIAN_LIMIT_MS)
    failures.push(
      `${file.hook}: median ${median.toFixed(0)} ms per call; the limit is ${MEDIAN_LIMIT_MS} ms`,
    );
  summary.push(
    `${file.hook}: ${file.cases.length} cases, ${seen.size} rules; ` +
      `median ${median.toFixed(0)} ms, max ${max.toFixed(0)} ms per call; ` +
      ((file.kind ?? "guard") === "guard"
        ? `longest denial about ${longest} tokens`
        : `answers as ${file.kind}`),
  );
}

if (summary.length === 0) failures.push(`no fixture files in ${FIXTURES}`);
if (failures.length > 0) {
  console.error(
    `test:hooks — ${failures.length} failure(s):\n  ${failures.join("\n  ")}`,
  );
  process.exit(1);
}
console.log(`test:hooks — every case behaved.\n  ${summary.join("\n  ")}`);
