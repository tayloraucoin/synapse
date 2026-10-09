/**
 * What a ticket cost, read from Claude Code's transcripts (audit R4).
 *
 *   yarn cost <id>               one line: calls, weighted tokens by category,
 *                                context at the last call, threads, headless runs
 *   yarn cost <id> --record      the same, written as a cost block in results.json
 *   yarn cost --epic <EPIC>      one line for the epic, then one per ticket
 *
 * Reads every `*.jsonl` under `<config>/projects/<slug>*` (the slug is the
 * repo path with every character that is not a letter or digit as `-`, as
 * Claude Code names the folder, so worktree folders match too; `<config>` is
 * CLAUDE_CONFIG_DIR or ~/.claude, as Claude Code reads it; the tests point it
 * at a synthetic copy). The folder is outside the repo, so the sandbox may
 * refuse it: run this unsandboxed.
 *
 * Never reads transcript text into output or a file. Of each assistant record
 * it keeps the message id, session id, sidechain flag, timestamp, usage, and
 * per tool call the tool's name with a category and any work-id matched in
 * its input; the input itself is dropped where it is read. Of a subagent's
 * `.meta.json` it keeps `agentType` only.
 *
 * The rules, each named in the line it prints:
 * - One API call per message id: Claude Code writes one record per content
 *   block, and a resumed session copies earlier records, so records sharing an
 *   id count once (each usage field at its largest), in the thread of the
 *   file that ended first. A record with no usage, or a `<synthetic>` one for
 *   an API error, is not a call.
 * - Weights, the first report's: input 1, cache write 1.25, cache read 0.1,
 *   output 5 [an estimate of cost, not the meter's formula].
 * - Attribution, the second audit's [estimate]: a call belongs to the ticket
 *   most recently named, in its thread, by a work command (contract:init, run,
 *   record, qa, built, add, review:run, a commit message) or a spec-file edit;
 *   the naming call is its ticket's. A thread whose first human prompt names
 *   exactly one ticket (a range such as "DEMO-1 to 17" names several), or
 *   failing that whose session title does, belongs to it from its first call
 *   (the third audit's Y2); only the ids leave the
 *   prompt and title, as from a tool input. A `contract:init … --draft` names
 *   nothing, and a ticket first drafted in a thread is not taken by that
 *   thread's later spec edits or commits; a work command still takes it. A
 *   subagent's calls are in its parent's thread, so two subagents working
 *   different tickets at once can take each other's calls. A resumed
 *   session's dropped copies still set its ticket. Calls before any naming
 *   belong to none; the epic line counts them.
 * - Category, by the call's first tool (COST_CATEGORIES): a reviewer
 *   subagent's calls are reviews.
 * - Headless runs: the review runs results.json holds with cost fields, the
 *   last run per review criterion; earlier runs are not on record.
 */

import { readdirSync, readFileSync, statSync } from "node:fs";
import os from "node:os";
import path from "node:path";

import { REPO_ROOT } from "./lib/docs.ts";
import {
  COST_CATEGORIES,
  findItem,
  formatResults,
  formatTicketCost,
  now,
  pickCost,
  readResults,
  readSpecsTree,
  refreshStatusFile,
  resultsPath,
  writeRepoText,
  type CostCategory,
  type Item,
  type SpecsTree,
  type TicketCost,
} from "./lib/specs.ts";
import { loadToolkit } from "./lib/toolkit.ts";

type Usage = {
  input: number;
  cacheRead: number;
  cacheWrite: number;
  output: number;
};

/** One API call: what survives of its records. No text. */
type Call = {
  id: string;
  session: string;
  sidechain: boolean;
  at: string;
  usage: Usage;
  /** The first tool's category; build when the call used no tool. */
  category: CostCategory | null;
  /** Work-ids its tool inputs named, in order. */
  named: Naming[];
  ticket: string | null;
};

/**
 * A work-id a tool input named: by a work command, by a draft (contract:init
 * --draft), or softly (a spec-file edit, a commit message), which does not
 * take a ticket the thread itself drafted.
 */
type Naming = { id: string; kind: "work" | "draft" | "soft" };

const WEIGHTS = { input: 1, cacheWrite: 1.25, cacheRead: 0.1, output: 5 };
const weigh = (u: Usage) =>
  u.input * WEIGHTS.input +
  u.cacheWrite * WEIGHTS.cacheWrite +
  u.cacheRead * WEIGHTS.cacheRead +
  u.output * WEIGHTS.output;

/** Claude Code's project folder name for a path. */
const projectSlug = (repoPath: string) =>
  repoPath.replace(/[^a-zA-Z0-9]/g, "-");

const ID = "([A-Za-z][A-Za-z0-9]{1,4}-0*[1-9][0-9]*)";
const normalizeId = (raw: string) =>
  raw.toUpperCase().replace(/-0*([1-9][0-9]*)$/, "-$1");
const WORK_COMMANDS = [
  new RegExp(
    `\\bcontract(?::|\\.ts\\s+)(?:run|record|qa|built|add)\\s+${ID}\\b`,
    "g",
  ),
  new RegExp(`\\breview(?::run|-run\\.ts)\\s+[a-z-]+\\s+${ID}\\b`, "g"),
];
const INIT = /\bcontract(?::|\.ts\s+)init\s+([A-Za-z0-9]+)\s+([a-z0-9-]+)/g;
/** The rest of one shell command after a match: up to the next && ; | or newline. */
const SEGMENT_END = /&&|;|\||\n/;
const COMMIT_ID = new RegExp(
  `\\bgit\\b(?:\\s+-C\\s+\\S+)?\\s+commit\\b[\\s\\S]*?${ID}:`,
);
const TICKET_FOLDER =
  /(?:^|\/)([A-Z][A-Z0-9]{1,4})-0*([1-9][0-9]*)-[a-z0-9-]+\//g;
/** A work-id written in prose (a prompt, a title): upper case, as ids are written. */
const PROSE_ID = /\b([A-Z][A-Z0-9]{1,4})-0*([1-9][0-9]*)\b/g;
/** A range after a prose id: "DEMO-1 to 17", "DEMO-1–17", "DEMO-1 through DEMO-17". */
const RANGE_END =
  /^\s*(?:to|through|-|–|—)\s*(?:([A-Z][A-Z0-9]{1,4})-)?0*([1-9][0-9]*)\b/;
const EDIT_TOOLS = /^(Edit|Write|MultiEdit|NotebookEdit)$/;
const BROWSER_TOOL = /Browser__|claude-in-chrome__|^mcp__.*preview_/;

/** The reviewer seats: the evaluators and every role the reviewer map names. */
function reviewerRoles(): Set<string> {
  const roles = new Set(["assay", "vigil"]);
  for (const row of loadToolkit().reviewers) roles.add(row.role);
  return roles;
}

/** The work-ids a tool call's input names; only the ids leave this function. */
function namedIds(
  tool: string,
  input: Record<string, unknown>,
  tree: SpecsTree,
): Naming[] {
  const ids: Naming[] = [];
  if (tool === "Bash" && typeof input.command === "string") {
    const command = input.command;
    const found: { at: number; naming: Naming }[] = [];
    for (const pattern of WORK_COMMANDS)
      for (const m of command.matchAll(pattern))
        found.push({
          at: m.index,
          naming: { id: normalizeId(m[1]!), kind: "work" },
        });
    for (const m of command.matchAll(INIT)) {
      const id = initId(tree, m[1]!, m[2]!);
      const rest = command.slice(m.index).split(SEGMENT_END)[0]!;
      if (id)
        found.push({
          at: m.index,
          naming: { id, kind: /\s--draft\b/.test(rest) ? "draft" : "work" },
        });
    }
    const commit = COMMIT_ID.exec(command);
    if (commit)
      found.push({
        at: commit.index,
        naming: { id: normalizeId(commit[1]!), kind: "soft" },
      });
    ids.push(...found.sort((a, b) => a.at - b.at).map((f) => f.naming));
  }
  const file = input.file_path ?? input.notebook_path;
  if (
    EDIT_TOOLS.test(tool) &&
    typeof file === "string" &&
    /(^|\/)specs\//.test(file)
  )
    for (const m of file.matchAll(TICKET_FOLDER))
      ids.push({ id: `${m[1]}-${m[2]}`, kind: "soft" });
  return ids;
}

/** The one ticket a prompt or title names, when it names exactly one; only the id leaves. */
function oneTicketIn(text: string, tree: SpecsTree): string | null {
  const ids = new Set<string>();
  for (const m of text.matchAll(PROSE_ID)) {
    const id = `${m[1]}-${m[2]}`;
    if (findItem(tree, id)) ids.add(id);
    // A range names every ticket in it, so it never seeds one.
    const range = RANGE_END.exec(text.slice(m.index + m[0].length));
    if (range && (range[1] ?? m[1]) === m[1] && Number(range[2]) > Number(m[2]))
      ids.add(`${m[1]}-${range[2]}`);
  }
  return ids.size === 1 ? [...ids][0]! : null;
}

/** A user record's typed text, or null when it is a tool result, a meta record or a summary. */
function humanText(record: {
  isSidechain?: boolean;
  isMeta?: boolean;
  isCompactSummary?: boolean;
  message?: { content?: unknown };
}): string | null {
  if (record.isSidechain || record.isMeta || record.isCompactSummary)
    return null;
  const content = record.message?.content;
  if (typeof content === "string") return content;
  if (!Array.isArray(content)) return null;
  const blocks = content as { type?: string; text?: unknown }[];
  if (blocks.some((b) => b.type === "tool_result")) return null;
  const text = blocks
    .filter((b) => b.type === "text" && typeof b.text === "string")
    .map((b) => b.text as string)
    .join("\n");
  return text || null;
}

/** contract:init names an app or epic and a slug, not an id: the tree has the id. */
function initId(tree: SpecsTree, where: string, slug: string): string | null {
  const matches = tree.items.filter(
    (item) =>
      item.slug === slug &&
      (item.epic
        ? item.epic.prefix === where.toUpperCase()
        : item.app === where.toLowerCase() ||
          item.prefix === where.toUpperCase()),
  );
  return matches.sort((a, b) => b.number - a.number)[0]?.id ?? null;
}

/** A tool call's category, from its name and input; the input is not kept. */
function categoryOf(
  tool: string,
  input: Record<string, unknown>,
  cwd: string,
  reviewers: Set<string>,
): CostCategory {
  if (BROWSER_TOOL.test(tool)) return "captures";
  if (tool === "Agent" || tool === "Task")
    return reviewers.has(String(input.subagent_type ?? ""))
      ? "reviews"
      : "other";
  if (tool === "Bash") {
    const command = typeof input.command === "string" ? input.command : "";
    if (/\breview(?::run|-run\.ts)\b/.test(command)) return "reviews";
    if (/^\s*(?:cd\s+\S+\s*&&\s*)?(?:git|gh)\b/.test(command)) return "git";
    if (
      /\b(?:yarn\s+(?:status|check-specs)|status\.ts|check-specs\.ts)\b/.test(
        command,
      )
    )
      return "status";
    if (
      /\bcontract(?::|\.ts\s+)(?:run|record)\b|\byarn\s+(?:test|lint|check-|verify|build|format:check|contrast-audit|budget)|\bnode\s+--test\b|\btsc\b|playwright|\bcapture/.test(
        command,
      )
    )
      return "proofs";
    return "build";
  }
  if (tool === "Read") {
    const file = typeof input.file_path === "string" ? input.file_path : "";
    const rel = path.isAbsolute(file) ? path.relative(cwd, file) : file;
    if (/(^|\/)review-[^/]*\.md$|(^|\/)evidence\//.test(rel)) return "reviews";
    if (
      /^(?:docs|specs)\/|^(?:AGENTS|CLAUDE)\.md$|^\.claude\/(?:rules|skills|agents)\//.test(
        rel,
      )
    )
      return "re-reading";
    return "build";
  }
  if (EDIT_TOOLS.test(tool) || tool === "Grep" || tool === "Glob")
    return "build";
  return "other";
}

/** Every transcript file of this repo and its worktrees. */
function transcriptFiles(): string[] {
  const projects = path.join(
    process.env.CLAUDE_CONFIG_DIR ?? path.join(os.homedir(), ".claude"),
    "projects",
  );
  const slug = projectSlug(REPO_ROOT);
  let folders: string[];
  try {
    folders = readdirSync(projects).filter((name) => name.startsWith(slug));
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    stop(
      code === "EPERM" || code === "EACCES"
        ? `cannot read ${projects} (${code}): it is outside the repo, so run yarn cost unsandboxed`
        : `no transcript folder at ${projects}`,
    );
  }
  const files: string[] = [];
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith(".jsonl")) files.push(full);
    }
  };
  for (const folder of folders) {
    const full = path.join(projects, folder);
    if (statSync(full).isDirectory()) walk(full);
  }
  return files;
}

/** A subagent file's agent type, from its .meta.json; nothing else of it is read. */
function agentTypeOf(file: string): string | null {
  try {
    const meta = JSON.parse(
      readFileSync(file.replace(/\.jsonl$/, ".meta.json"), "utf8"),
    ) as { agentType?: unknown };
    return typeof meta.agentType === "string" ? meta.agentType : null;
  } catch {
    return null;
  }
}

type FileCalls = {
  file: string;
  lastAt: string;
  calls: Call[];
  /** A main thread's file: the ticket its first human prompt, else its last title, names alone. */
  seed: { session: string; ticket: string } | null;
};

/** One file's calls, in file order, merged by message id within the file. */
function readFile(
  file: string,
  tree: SpecsTree,
  reviewers: Set<string>,
): FileCalls {
  const fallbackSession = path.basename(file, ".jsonl");
  const agentType = /\/subagents\//.test(file) ? agentTypeOf(file) : null;
  const reviewerFile = agentType !== null && reviewers.has(agentType);
  const byId = new Map<string, Call>();
  let lastAt = "";
  // Only a main thread's file can seed its ticket; a subagent's prompt is its parent's.
  const main = agentType === null && !/\/subagents\//.test(file);
  let promptTicket: string | null = null;
  let promptSeen = false;
  let titleTicket: string | null = null;
  let seedSession: string | null = null;
  for (const line of readFileSync(file, "utf8").split("\n")) {
    const isAssistant = line.includes('"assistant"');
    const isPrompt = main && !promptSeen && line.includes('"user"');
    const isTitle = main && line.includes('"custom-title"');
    if (!isAssistant && !isPrompt && !isTitle) continue;
    let record: {
      type?: string;
      sessionId?: string;
      isSidechain?: boolean;
      isMeta?: boolean;
      isCompactSummary?: boolean;
      customTitle?: unknown;
      timestamp?: string;
      cwd?: string;
      uuid?: string;
      message?: {
        id?: string;
        model?: string;
        usage?: Record<string, unknown>;
        content?: unknown;
      };
    };
    try {
      record = JSON.parse(line);
    } catch {
      continue; // A partial line.
    }
    // The text is matched for ids here and dropped; only an id is kept.
    if (
      record.type === "custom-title" &&
      typeof record.customTitle === "string"
    ) {
      titleTicket = oneTicketIn(record.customTitle, tree);
      seedSession ??= record.sessionId ?? null;
      continue;
    }
    if (record.type === "user" && !promptSeen) {
      const text = humanText(record);
      if (text === null) continue;
      promptSeen = true;
      promptTicket = oneTicketIn(text, tree);
      seedSession ??= record.sessionId ?? null;
      continue;
    }
    // A record with no usage, or Claude Code's synthetic one for an API
    // error, is not an API call (as stop-gate's contextTokens reads it).
    if (
      record.type !== "assistant" ||
      !record.message?.usage ||
      record.message.model === "<synthetic>"
    )
      continue;
    const id = record.message.id;
    if (!id) continue;
    const at = record.timestamp ?? "";
    if (at > lastAt) lastAt = at;
    const usage = record.message.usage;
    const field = (key: string) =>
      typeof usage[key] === "number" ? (usage[key] as number) : 0;
    let call = byId.get(id);
    if (!call) {
      call = {
        id,
        session: record.sessionId ?? fallbackSession,
        sidechain: record.isSidechain === true || agentType !== null,
        at,
        usage: { input: 0, cacheRead: 0, cacheWrite: 0, output: 0 },
        category: null,
        named: [],
        ticket: null,
      };
      byId.set(id, call);
    }
    if (at && (!call.at || at < call.at)) call.at = at;
    call.usage.input = Math.max(call.usage.input, field("input_tokens"));
    call.usage.cacheRead = Math.max(
      call.usage.cacheRead,
      field("cache_read_input_tokens"),
    );
    call.usage.cacheWrite = Math.max(
      call.usage.cacheWrite,
      field("cache_creation_input_tokens"),
    );
    call.usage.output = Math.max(call.usage.output, field("output_tokens"));
    const content = Array.isArray(record.message.content)
      ? (record.message.content as {
          type?: string;
          name?: string;
          input?: unknown;
        }[])
      : [];
    for (const block of content) {
      if (block.type !== "tool_use" || typeof block.name !== "string") continue;
      const input =
        block.input && typeof block.input === "object"
          ? (block.input as Record<string, unknown>)
          : {};
      call.category ??= reviewerFile
        ? "reviews"
        : categoryOf(block.name, input, record.cwd ?? REPO_ROOT, reviewers);
      call.named.push(...namedIds(block.name, input, tree));
    }
  }
  for (const call of byId.values()) if (reviewerFile) call.category = "reviews";
  const ticket = promptTicket ?? titleTicket;
  return {
    file,
    lastAt,
    calls: [...byId.values()],
    seed: ticket ? { session: seedSession ?? fallbackSession, ticket } : null,
  };
}

/** Every call once per message id, each attributed to a ticket or none. */
function readCalls(tree: SpecsTree): Call[] {
  const reviewers = reviewerRoles();
  const files = transcriptFiles()
    .map((file) => readFile(file, tree, reviewers))
    // The file that ended first holds a message's original; a resumed
    // session's copy of it is dropped.
    .sort(
      (a, b) =>
        a.lastAt.localeCompare(b.lastAt) || a.file.localeCompare(b.file),
    );
  const calls = new Map<string, Call>();
  // A thread's seed: the first main file of the session that has one.
  const seeds = new Map<string, string>();
  for (const { seed } of files)
    if (seed && !seeds.has(seed.session)) seeds.set(seed.session, seed.ticket);
  // A dropped copy still tells its own thread which ticket the copied
  // history named: it sets the walk's ticket but is never counted.
  const markers: Pick<Call, "session" | "at" | "named">[] = [];
  for (const { calls: fileCalls } of files)
    for (const call of fileCalls) {
      const seen = calls.get(call.id);
      if (!seen) {
        calls.set(call.id, call);
        continue;
      }
      if (call.session !== seen.session && call.named.length)
        markers.push({
          session: call.session,
          at: call.at,
          named: call.named,
        });
      // A copy: same response, so the same usage; keep the largest of each.
      seen.usage.input = Math.max(seen.usage.input, call.usage.input);
      seen.usage.cacheRead = Math.max(
        seen.usage.cacheRead,
        call.usage.cacheRead,
      );
      seen.usage.cacheWrite = Math.max(
        seen.usage.cacheWrite,
        call.usage.cacheWrite,
      );
      seen.usage.output = Math.max(seen.usage.output, call.usage.output);
    }
  type Step = { call: Call | null; at: string; named: Naming[] };
  const threads = new Map<string, Step[]>();
  const add = (session: string, step: Step) => {
    const list = threads.get(session) ?? [];
    list.push(step);
    threads.set(session, list);
  };
  for (const call of calls.values())
    add(call.session, { call, at: call.at, named: call.named });
  for (const m of markers)
    add(m.session, { call: null, at: m.at, named: m.named });
  for (const [session, list] of threads) {
    list.sort((a, b) => a.at.localeCompare(b.at));
    let current: string | null = seeds.get(session) ?? null;
    // Tickets this thread drafted: a spec edit or commit does not take them.
    const drafts = new Set<string>();
    for (const step of list) {
      for (const { id, kind } of step.named) {
        if (kind === "draft") drafts.add(id);
        else if (kind === "soft" && drafts.has(id)) continue;
        else {
          if (kind === "work") drafts.delete(id);
          current = id;
        }
      }
      if (step.call) step.call.ticket = current;
    }
  }
  return [...calls.values()];
}

/** The review runs results.json holds with cost fields, weighted the same way. */
function headless(item: Item): { runs: number; weighted: number } {
  const { results } = readResults(item);
  let runs = 0;
  let weighted = 0;
  for (const result of Object.values(results?.criteria ?? {})) {
    const cost = result.run ? pickCost(result.run) : {};
    if (Object.keys(cost).length === 0) continue;
    runs += 1;
    weighted += weigh({
      input: cost.tokens_input ?? 0,
      cacheRead: cost.tokens_cache_read ?? 0,
      cacheWrite: cost.tokens_cache_write ?? 0,
      output: cost.tokens_output ?? 0,
    });
  }
  return { runs, weighted: Math.round(weighted) };
}

/** The cost block for the calls attributed to any of these tickets. */
function summarize(calls: Call[], items: Item[]): TicketCost {
  const ids = new Set(items.map((i) => i.id));
  const mine = calls
    .filter((c) => c.ticket !== null && ids.has(c.ticket))
    .sort((a, b) => a.at.localeCompare(b.at));
  const total: Usage = { input: 0, cacheRead: 0, cacheWrite: 0, output: 0 };
  const byCategory = Object.fromEntries(
    COST_CATEGORIES.map((c) => [c, { calls: 0, raw: 0 }]),
  ) as Record<CostCategory, { calls: number; raw: number }>;
  for (const call of mine) {
    total.input += call.usage.input;
    total.cacheRead += call.usage.cacheRead;
    total.cacheWrite += call.usage.cacheWrite;
    total.output += call.usage.output;
    const bucket = byCategory[call.category ?? "build"];
    bucket.calls += 1;
    bucket.raw += weigh(call.usage);
  }
  const last = mine.filter((c) => !c.sidechain).at(-1);
  const runs = items.map(headless);
  return {
    at: now(),
    calls: mine.length,
    weighted: Math.round(weigh(total)),
    tokens_input: total.input,
    tokens_cache_read: total.cacheRead,
    tokens_cache_write: total.cacheWrite,
    tokens_output: total.output,
    by_category: Object.fromEntries(
      COST_CATEGORIES.map((c) => [
        c,
        { calls: byCategory[c].calls, weighted: Math.round(byCategory[c].raw) },
      ]),
    ) as TicketCost["by_category"],
    context_last_call: last
      ? last.usage.input + last.usage.cacheRead + last.usage.cacheWrite
      : null,
    threads: new Set(mine.map((c) => c.session)).size,
    headless_runs: runs.reduce((n, r) => n + r.runs, 0),
    headless_weighted: runs.reduce((n, r) => n + r.weighted, 0),
  };
}

function stop(message: string): never {
  console.error(`cost — ${message}`);
  process.exit(1);
}

function main() {
  const args = process.argv.slice(2);
  const toolkit = loadToolkit();
  const tree = readSpecsTree(toolkit);
  if (args[0] === "--epic") {
    const prefix = args[1] ?? "";
    const epic = tree.epics.find((e) => e.prefix === prefix);
    if (!epic) stop(`no epic ${prefix || "(none named)"}`);
    const items = tree.items.filter((i) => i.epic?.prefix === prefix);
    const calls = readCalls(tree);
    const unattributed = calls.filter((c) => c.ticket === null).length;
    console.log(
      `${formatTicketCost(prefix, summarize(calls, items))}; ${unattributed.toLocaleString("en-US")} call(s) in these transcripts belong to no ticket [before any work command]`,
    );
    for (const item of items)
      console.log(`  ${formatTicketCost(item.id, summarize(calls, [item]))}`);
    return;
  }
  const id = args.find((a) => !a.startsWith("--"));
  if (!id) stop("usage: yarn cost <id> [--record] | yarn cost --epic <EPIC>");
  const item = findItem(tree, id);
  if (!item) stop(`no ticket ${id} under ${toolkit.specsRoot}/`);
  const cost = summarize(readCalls(tree), [item]);
  console.log(formatTicketCost(item.id, cost));
  if (!args.includes("--record")) return;
  const { results, problems } = readResults(item);
  if (problems.length) stop(problems.join("\n  "));
  if (!results) stop(`${item.id} has not started; nothing to record into`);
  results.cost = cost;
  results.updated_at = now();
  writeRepoText(resultsPath(item), formatResults(results));
  refreshStatusFile(toolkit);
  console.log(`cost — recorded in ${resultsPath(item)}.`);
}

main();
