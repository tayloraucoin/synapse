/**
 * Stop hook (E-18; A13.3; V1, ruling (i)).
 *
 * When the working tree changed since SessionStart (or since the last green
 * stop), runs `yarn verify:fast` over the files this session edited, read
 * from its transcript (PR-15): threads share the operator's checkout, so a
 * stop never judges another thread's files. A session that edited nothing
 * is never blocked. On failure it blocks the stop
 * once, with the failure as the reason, so the agent fixes it; Claude Code
 * sets `stop_hook_active` on the stop that follows, and this hook never
 * blocks that one (V1). It always shows the person "Left to go" for the
 * active ticket through `systemMessage`, which does not continue the turn,
 * and the thread's context size from the transcript's last usage record;
 * above 200k it says to start a fresh thread (audit O1). On an unchanged
 * tree it reuses the status line stored at the last stop instead of calling
 * `yarn status --brief` again (audit Y2).
 *
 * Output is one JSON object on stdout, exit 0. Fixtures:
 * tooling/hooks/fixtures/stop-gate.json, run by `yarn test:hooks`.
 */

import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  readSnapshot,
  readSnapshotStatus,
  saveSnapshot,
  treeFingerprint,
} from "./session-state.ts";

const ROOT =
  process.env.CLAUDE_PROJECT_DIR ??
  path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
/** E-18: the whole reason stays within about 300 tokens (1,200 characters), prefix included. */
const REASON_LIMIT = 1000;
/** The person's message keeps to the same 300 tokens; the status line is trimmed first, never the verdict or the context clause. */
const MESSAGE_LIMIT = 1200;
/** Audit O1: above this context the message says to start a fresh thread. */
const FRESH_THREAD_TOKENS = 200_000;

/** Set only by the fixture runner: the git, verify and snapshot facts a case assumes. */
type FixtureContext = {
  changed?: boolean;
  verifyExit?: number;
  verifyOutput?: string;
  left?: string;
  /** The status line stored beside the snapshot at the last stop. */
  cached?: string;
};
const fixture: FixtureContext | null = process.env.PEM_HOOK_FIXTURE_CONTEXT
  ? (JSON.parse(process.env.PEM_HOOK_FIXTURE_CONTEXT) as FixtureContext)
  : null;

let input: {
  session_id?: string;
  stop_hook_active?: boolean;
  transcript_path?: string;
} = {};
try {
  input = JSON.parse(readFileSync(0, "utf8"));
} catch {
  process.exit(0);
}

const node = (script: string, args: string[], env?: NodeJS.ProcessEnv) =>
  spawnSync(process.execPath, [path.join(ROOT, "tooling", script), ...args], {
    cwd: ROOT,
    encoding: "utf8",
    maxBuffer: 16 * 1024 * 1024,
    timeout: 90_000,
    env: { ...process.env, ...env },
  });

/** The session's transcript, one record per line, read once; null when it cannot be read. */
const transcript: string[] | null = (() => {
  if (!input.transcript_path) return null;
  try {
    return readFileSync(input.transcript_path, "utf8").split("\n");
  } catch {
    return null;
  }
})();

/**
 * The repo files this session wrote with its edit tools, from its transcript.
 * Null when the transcript cannot be read: the gate then checks the whole
 * branch, as it did before PR-15.
 */
function sessionFiles(): string[] | null {
  if (!transcript) return null;
  const files = new Set<string>();
  for (const line of transcript) {
    if (!line.includes('"tool_use"')) continue;
    try {
      const content = (JSON.parse(line) as { message?: { content?: unknown } })
        .message?.content;
      if (!Array.isArray(content)) continue;
      for (const block of content as {
        type?: string;
        name?: string;
        input?: { file_path?: string; notebook_path?: string };
      }[]) {
        if (block.type !== "tool_use") continue;
        if (!/^(Edit|Write|MultiEdit|NotebookEdit)$/.test(block.name ?? ""))
          continue;
        const file = block.input?.file_path ?? block.input?.notebook_path;
        if (!file) continue;
        const rel = path.relative(ROOT, path.resolve(ROOT, file));
        if (!rel.startsWith("..") && !path.isAbsolute(rel))
          files.add(rel.split(path.sep).join("/"));
      }
    } catch {
      // A partial line: skip it.
    }
  }
  return [...files];
}

/**
 * The thread's context at its last call: input plus cache read plus cache
 * write from the usage of the last assistant record that is the thread's own
 * (a subagent's sidechain record is not), as the audit counted it (O1). Only
 * the usage fields are read, never the text. Null when the transcript has none.
 */
function contextTokens(): number | null {
  if (!transcript) return null;
  for (let i = transcript.length - 1; i >= 0; i--) {
    const line = transcript[i] ?? "";
    if (!line.includes('"assistant"') || !line.includes('"usage"')) continue;
    try {
      const record = JSON.parse(line) as {
        type?: string;
        isSidechain?: boolean;
        message?: { usage?: Record<string, unknown> };
      };
      if (record.type !== "assistant" || record.isSidechain) continue;
      const usage = record.message?.usage;
      if (!usage) continue;
      const count = (key: string) => {
        const value = usage[key];
        return typeof value === "number" ? value : 0;
      };
      return (
        count("input_tokens") +
        count("cache_read_input_tokens") +
        count("cache_creation_input_tokens")
      );
    } catch {
      // A partial line: skip it.
    }
  }
  return null;
}

/** The context clause for the person; empty when the transcript gives no usage. */
function contextClause(): string {
  const tokens = contextTokens();
  if (tokens === null) return "";
  const size = `Context about ${Math.round(tokens / 1000)}k tokens`;
  return tokens > FRESH_THREAD_TOKENS
    ? ` ${size}: start a fresh thread for the next ticket; resuming this one after a break re-writes the whole context.`
    : ` ${size}.`;
}

/** What is left on every item in build: tickets share the operator's branch (PR-14). */
function leftToGo(): string {
  if (fixture) return fixture.left ?? "Active: none.";
  const status = node("status.ts", ["--brief"]);
  return (status.stdout || "").trim() || "Status unavailable: run yarn status.";
}

/** The person's message: the verdict, what is left, the context size, within the budget. */
function message(verdict: string, left: string): string {
  const clause = contextClause();
  const room = Math.max(MESSAGE_LIMIT - verdict.length - clause.length, 0);
  const status =
    left.length > room ? `${left.slice(0, Math.max(room - 1, 0))}…` : left;
  return `${verdict}${status}${clause}`;
}

// A headless reviewer started by review:run is read-only; never block it.
if (process.env.PEM_HEADLESS_REVIEW === "1" && !fixture) process.exit(0);

const session = input.session_id ?? "unknown";
const fingerprint = fixture ? "" : treeFingerprint(ROOT);
const changed = fixture
  ? (fixture.changed ?? true)
  : readSnapshot(session) !== fingerprint;

const reply = (body: Record<string, unknown>): never => {
  process.stdout.write(`${JSON.stringify(body)}\n`);
  process.exit(0);
};

/** Stores the tree as checked, with the status line printed for it, so the next unchanged stop reuses both. */
const remember = (status: string) => {
  if (!fixture) saveSnapshot(session, fingerprint, status);
};

if (!changed) {
  // Y2: the tree is as it was at the last stop, so the status line is too.
  const cached = fixture
    ? (fixture.cached ?? null)
    : readSnapshotStatus(session);
  const status = cached ?? leftToGo();
  if (cached === null) remember(status);
  reply({
    systemMessage: message("Nothing changed since the last check. ", status),
  });
}

const mine = fixture ? null : sessionFiles();
if (mine && mine.length === 0) {
  const status = leftToGo();
  remember(status);
  reply({
    systemMessage: message(
      "This session edited no files; nothing to check. ",
      status,
    ),
  });
}

const started = Date.now();
const verify = fixture
  ? {
      status: fixture.verifyExit ?? 0,
      stdout: fixture.verifyOutput ?? "",
      stderr: "",
    }
  : node(
      "verify-fast.ts",
      [],
      mine ? { PEM_VERIFY_FAST_FILES: mine.join("\n") } : undefined,
    );
const seconds = ((Date.now() - started) / 1000).toFixed(1);
const output = `${verify.stdout ?? ""}${verify.stderr ?? ""}`.trim();

if (verify.status === 0) {
  const status = leftToGo();
  remember(status);
  reply({
    systemMessage: message(`verify:fast passed (${seconds} s). `, status),
  });
}

const tail =
  output.length > REASON_LIMIT ? `…${output.slice(-REASON_LIMIT)}` : output;
if (input.stop_hook_active)
  reply({
    systemMessage: message(
      `verify:fast still fails (${seconds} s); not blocking a second time (loop guard). `,
      leftToGo(),
    ),
  });
reply({
  decision: "block",
  reason: `verify:fast failed on files this session edited. Fix them, then finish; this blocks once. If the file is another thread's, say so and stop. Output:\n${tail}`,
  systemMessage: message("", leftToGo()),
});
