/**
 * The contract loop (E-23; A4 to A9, A13.2). Results are written only here
 * and by review-run.ts, never by hand.
 *
 *   yarn contract:init <APP | app | EPIC> <slug> [--from <file>] [--draft]
 *       First call: allocates the next id and writes contract.md from the
 *       template (or from --from). Run it again once the contract is filled:
 *       it checks the gates (A6, the pre-flight, dependencies), adds the
 *       review criteria, freezes the criteria and writes every result at
 *       FAIL, on the branch the operator has checked out (PR-14). --draft
 *       stops before starting.
 *   yarn contract:run <id> [criterion…]
 *       Runs the test and check criteria on a committed tree and records a
 *       run record per criterion: command, exit, time, HEAD, evidence log
 *       and its hash, and for a test the number of tests the runner reported.
 *   yarn contract:record <id> <criterion> --evidence <path> [--verdict pass|fail|deferred]
 *       Records a capture or manual criterion against an evidence file.
 *       deferred hands a manual criterion only a person can check to the
 *       operator: it counts as done for the ticket and is listed under
 *       Operator checks in _status.md (PR-16).
 *   yarn contract:add <id> <criterion> --evidence <type> --statement <text> [--command | --path | --reason <text>]
 *   yarn contract:add <id> review:<role>
 *       Adds a criterion at FAIL: the only way the frozen set grows.
 *   yarn contract:qa <id> <Q0 | Q1 | Q2 | Q3> [--reviewers <role,role>]
 *       Sets a started ticket's QA level and reviewers, as the operator asked
 *       (PR-19). At Q3 each reviewer gets a review:<role> criterion; below Q3
 *       the review criteria are dropped and the review happens in the thread.
 *   yarn contract:built <id>
 *       Records built_at: the code is in and committed, the criteria are not
 *       yet recorded (audit R9). Status reads "built" until a criterion is
 *       recorded after it; contract:run proceeds as on an open ticket.
 *
 * The level is the operator's choice, never computed. contract:init reads
 * `qa:` from the contract (Q1 when absent) and flags once any planned path
 * that reaches a critical path below Q3. Q2 is one reviewer: init and qa
 * refuse a further seat unless a `focus` line names what it examines (C6).
 */

import { spawnSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  realpathSync,
  renameSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import YAML from "yaml";

import { REPO_ROOT, splitFrontmatter } from "./lib/docs.ts";
import {
  getCurrentBranch,
  getHead,
  listBranches,
  listDirty,
  listOnRef,
} from "./lib/git.ts";
import {
  asBuiltPath,
  checkCommand,
  checkContract,
  CONTRACT_TEMPLATE,
  contractPath,
  criticalPathsOf,
  EVIDENCE_TYPES,
  evidenceDir,
  fileExists,
  findItem,
  findRoleFile,
  formatResults,
  hashCriteria,
  hashFile,
  hashText,
  inPlannedPaths,
  isMerged,
  isReview,
  isWholeChain,
  now,
  openDecisions,
  preflightPath,
  q2ReviewerProblem,
  QA_LEVELS,
  qaOf,
  readContract,
  readItemState,
  readRepoText,
  readResults,
  readSpecsTree,
  refreshStatusFile,
  resultsPath,
  reviewCriterion,
  SLUG,
  splitCommand,
  ticketFolder,
  wholeChainProblem,
  writeRepoText,
  type Contract,
  type Criterion,
  type EvidenceType,
  type Item,
  type Qa,
  type Results,
  type RunRecord,
  type SpecsTree,
} from "./lib/specs.ts";
import { loadToolkit, type Toolkit } from "./lib/toolkit.ts";

const toolkit = loadToolkit();
const [command, ...argv] = process.argv.slice(2);
const OPERATOR_REVIEW_REASON =
  "operator_review: true; the builder defers it with what to look at";

function stop(message: string): never {
  console.error(`contract:${command} — ${message}`);
  process.exit(1);
}

function option(name: string): string | undefined {
  const i = argv.indexOf(name);
  if (i === -1) return undefined;
  const value = argv[i + 1];
  if (value === undefined || value.startsWith("--"))
    stop(`${name} needs a value`);
  argv.splice(i, 2);
  return value;
}
function flag(name: string): boolean {
  const i = argv.indexOf(name);
  if (i !== -1) argv.splice(i, 1);
  return i !== -1;
}

/** Repo-relative path from a path the person typed, from wherever they ran yarn. Symlinked folders (macOS /tmp) are resolved on both sides. */
const real = (p: string) => {
  try {
    return realpathSync(p);
  } catch {
    return p;
  }
};
const toRepoPath = (typed: string) =>
  path
    .relative(
      real(REPO_ROOT),
      real(path.resolve(process.env.INIT_CWD ?? process.cwd(), typed)),
    )
    .split(path.sep)
    .join("/");

function requireItem(tree: SpecsTree, id: string | undefined): Item {
  if (!id) stop("name the work-id, as in WEB-41");
  const item = findItem(tree, id);
  if (!item)
    stop(
      `no ticket ${id} under ${toolkit.specsRoot}/; start one with yarn contract:init`,
    );
  return item;
}

function requireResults(item: Item): Results {
  const { results, problems } = readResults(item);
  if (problems.length) stop(problems.join("\n  "));
  if (!results)
    stop(
      `${item.id} has not started: run yarn contract:init with its app or epic and slug again`,
    );
  return results;
}

/**
 * contract:run and contract:record prove a commit, so this item's planned
 * paths are committed first. Any branch will do, and other tickets' uncommitted
 * files are theirs: parallel threads share the operator's checkout (PR-14).
 */
function requireProvable(item: Item, contract: Contract) {
  const dirty = listDirty().filter((file) =>
    inPlannedPaths(file, contract.planned_paths),
  );
  if (dirty.length > 0)
    stop(
      `a run records the commit it proves, so commit first: ${dirty.slice(0, 5).join(", ")}${dirty.length > 5 ? " …" : ""}. Run: git add <those paths> && git commit -m "${item.id}: <outcome>"`,
    );
}

function requireFrozen(item: Item, contract: Contract, results: Results) {
  if (hashCriteria(contract.criteria) !== results.criteria_sha256)
    stop(
      `${contractPath(item)}: the criteria changed after init. Restore them (git restore), and add a criterion only with yarn contract:add ${item.id}`,
    );
}

function writeResults(item: Item, results: Results) {
  results.updated_at = now();
  writeRepoText(resultsPath(item), formatResults(results));
  refreshStatusFile(toolkit);
}

function printLeft(item: Item) {
  const state = readItemState(item, toolkit.specsRoot);
  const left = state.criteria.filter((c) => c.status !== "PASS");
  console.log(
    left.length === 0
      ? `${item.id}: every criterion PASS (${state.stage}).`
      : `${item.id} left to go: ${left.map((c) => `${c.id} ${c.evidence}${c.reason ? ` (${c.reason})` : ""}`).join("; ")}`,
  );
}

// ---------------------------------------------------------------- init

/**
 * The next free number for a prefix, counting every local branch and the
 * archive, so parallel tickets never collide and no number is reused.
 */
function nextNumber(prefix: string, tree: SpecsTree): number {
  const pattern = new RegExp(`/${prefix}-0*([1-9][0-9]*)-[a-z0-9-]+/`);
  const used = tree.items
    .filter((i) => i.prefix === prefix)
    .map((i) => i.number);
  for (const branch of listBranches())
    for (const file of listOnRef(branch, toolkit.specsRoot)) {
      const n = `/${file}`.match(pattern)?.[1];
      if (n) used.push(Number(n));
    }
  return Math.max(0, ...used) + 1;
}

/** The contract file text from the template: its yaml block becomes the frontmatter. */
function contractFromTemplate(id: string, slug: string): string {
  const { body } = splitFrontmatter(readRepoText(CONTRACT_TEMPLATE));
  const yaml = body.match(/```yaml\n([\s\S]*?)```/)?.[1];
  if (!yaml) stop(`${CONTRACT_TEMPLATE} has no yaml block to copy`);
  const at = body.indexOf("## Build notes");
  if (at === -1)
    stop(`${CONTRACT_TEMPLATE} has no "## Build notes" section to copy`);
  const notes = body.slice(at);
  return `---\n${yaml.replace(/^id: .*$/m, `id: ${id}`)}---\n\n# Contract — ${id} ${slug}\n\n${notes}`;
}

function setFrontmatter(rel: string, edit: (doc: YAML.Document) => void): void {
  const { raw, body } = splitFrontmatter(readRepoText(rel));
  if (raw === null) stop(`${rel} has no frontmatter`);
  const doc = YAML.parseDocument(raw);
  edit(doc);
  writeRepoText(rel, `---\n${doc.toString({ lineWidth: 0 })}---\n${body}`);
}

/** A criterion whose command is the whole chain is refused before anything else is judged. */
function refuseWholeChain(
  item: Item,
  criteria: { id: string; command?: string }[] | undefined,
) {
  for (const criterion of criteria ?? [])
    if (isWholeChain(criterion.command))
      stop(`${item.id} cannot start: ${wholeChainProblem(criterion.id)}`);
}

function init() {
  const fromFile = option("--from");
  const draftOnly = flag("--draft");
  const [target, slug] = argv;
  if (!target || !slug)
    stop(
      "usage: yarn contract:init <APP | app | EPIC> <slug> [--from <file>] [--draft]",
    );
  if (!SLUG.test(slug)) stop(`"${slug}" is not a kebab-case slug`);

  const tree = readSpecsTree(toolkit);
  const appEntry =
    Object.entries(toolkit.apps).find(
      ([name, app]) => name === target || app.prefix === target,
    ) ?? null;
  const epic = appEntry ? null : tree.epics.find((e) => e.prefix === target);
  if (!appEntry && !epic)
    stop(
      `${target} is neither an app in toolkit.json (${Object.entries(
        toolkit.apps,
      )
        .map(([n, a]) => `${n} or ${a.prefix}`)
        .join(
          ", ",
        )}) nor an epic on disk. Start an epic with yarn spec:init <app> <EPIC> <slug>`,
    );
  if (epic?.archived)
    stop(
      `${epic.prefix} is archived at ${epic.dir}/, so it takes no new tickets. Move it back to ${epic.origin}/ first, or start a new epic with yarn spec:init`,
    );
  const prefix = appEntry ? appEntry[1].prefix : epic!.prefix;
  const container = appEntry
    ? `${toolkit.specsRoot}/${appEntry[0]}/one-offs`
    : `${epic!.dir}/tickets`;

  let item =
    tree.items.find(
      (i) => i.slug === slug && path.posix.dirname(i.dir) === container,
    ) ?? null;
  if (item && fileExists(resultsPath(item)))
    stop(`${item.id} has already started. Run: yarn status ${item.id}`);

  if (!item) {
    const n = nextNumber(prefix, tree);
    const id = `${prefix}-${n}`;
    const dir = `${container}/${ticketFolder(prefix, n, slug)}`;
    let text = contractFromTemplate(id, slug);
    if (fromFile) {
      const sourcePath = path.resolve(
        process.env.INIT_CWD ?? process.cwd(),
        fromFile,
      );
      if (!existsSync(sourcePath))
        stop(
          `--from ${fromFile} does not exist; write the drafted contract there first`,
        );
      const source = readFileSync(sourcePath, "utf8");
      const { raw, body } = splitFrontmatter(source);
      if (raw === null)
        stop(`${fromFile} has no frontmatter; start from ${CONTRACT_TEMPLATE}`);
      const doc = YAML.parseDocument(raw);
      doc.set("id", id);
      text = `---\n${doc.toString({ lineWidth: 0 })}---\n${body}`;
    }
    writeRepoText(`${dir}/contract.md`, text);
    refreshStatusFile(toolkit);
    item = findItem(readSpecsTree(toolkit), id)!;
    if (!fromFile) {
      console.log(
        `contract:init — wrote ${dir}/contract.md for ${id}. Fill every [FILL], then run the same command again to start it.`,
      );
      return;
    }
  }
  if (draftOnly) {
    const drafted = readContract(item);
    refuseWholeChain(item, drafted.contract?.criteria);
    const problems = checkContract(item, drafted, toolkit, {
      started: false,
    });
    if (problems.length)
      stop(`${item.id} is drafted, with problems:\n  ${problems.join("\n  ")}`);
    // A draft's seats are the operator's to settle at the Tickets gate: said, not refused.
    const q2 = drafted.contract ? q2ReviewerProblem(drafted.contract) : null;
    if (q2) console.log(`contract:init — note: ${item.id} ${q2}`);
    console.log(
      `contract:init — ${item.id} drafted at ${item.dir}/; nothing started (--draft).`,
    );
    return;
  }
  start(item, tree);
}

function start(item: Item, tree: SpecsTree) {
  const file = readContract(item);
  refuseWholeChain(item, file.contract?.criteria);
  const draftProblems = checkContract(item, file, toolkit, { started: false });
  if (/\[FILL/.test(file.text))
    stop(
      `${contractPath(item)} still holds [FILL] markers; fill every one, then run this again`,
    );
  if (draftProblems.length)
    stop(`${item.id} cannot start:\n  ${draftProblems.join("\n  ")}`);
  const contract = file.contract!;

  // A6: gates are checks.
  const refusals: string[] = [];
  for (const cited of contract.cites.filter(
    (c) => c.includes("/") && c.endsWith(".md"),
  )) {
    const status = YAML.parse(
      splitFrontmatter(readRepoText(cited)).raw ?? "",
    )?.status;
    if (status !== "approved")
      refusals.push(
        `${cited} is status: ${status ?? "(none)"}; the UX gate approves it first (status: approved)`,
      );
  }
  const decisions = openDecisions(contract);
  for (const cited of decisions.blocking)
    refusals.push(
      `${cited} holds [NEEDS DECISION — BLOCKING]; decide it in the file, then start`,
    );

  // The level is the operator's (PR-19): read, never computed. A critical
  // path below Q3 is said once, here, and the start goes ahead.
  const qa = qaOf(contract);
  const notes: string[] = [];
  const critical = qa === "Q3" ? [] : criticalPathsOf(contract);
  if (critical.length)
    notes.push(
      `${critical.slice(0, 3).join(", ")}${critical.length > 3 ? ` and ${critical.length - 3} more` : ""} ${critical.length === 1 ? "is a critical path" : "are critical paths"} and this ticket is ${qa}, below Q3; tell the operator once, and raise it with yarn contract:qa ${item.id} Q3 if they say so`,
    );
  // A13.2: a Q3 epic ticket starts only with its pre-flight PASS. A contract
  // edited since (a build note, a planned path) is named, not refused.
  if (item.epic && qa === "Q3") {
    const pre = preflightPath(item.epic);
    const contractHash = hashText(file.text);
    const line = fileExists(pre)
      ? readRepoText(pre).match(
          new RegExp(
            `^- ${item.id}: (PASS|FAIL) \\(contract ([0-9a-f]{12})\\)`,
            "m",
          ),
        )
      : null;
    if (!line)
      refusals.push(
        `${pre} has no pre-flight line for ${item.id}; run yarn review:run vigil ${item.epic.prefix} (the Tickets gate)`,
      );
    else if (line[1] !== "PASS")
      refusals.push(
        `the pre-flight failed ${item.id}; read ${pre}, fix the contract, and run the gate again`,
      );
    else if (
      /^- runner: fixture/m.test(readRepoText(pre)) &&
      process.env.PEM_SPECS_FIXTURE !== "1"
    )
      refusals.push(
        `${pre} was written by a fixture reviewer, not Claude; run yarn review:run vigil ${item.epic.prefix}`,
      );
    else if (line[2] !== contractHash.slice(0, 12))
      notes.push(`the contract was edited after its pre-flight PASS`);
  }

  // A dependent ticket starts once its predecessor is built here: its build
  // pass recorded built_at (PR-21; the third audit's R1), or every criterion
  // of its own is recorded PASS. Its reviews and its as-built never hold the
  // next ticket (PR-15).
  for (const dep of contract.depends_on) {
    const other = findItem(tree, dep);
    const recorded = other ? readResults(other).results : null;
    const unproven = recorded
      ? Object.entries(recorded.criteria)
          .filter(([id, c]) => !id.startsWith("review:") && c.status !== "PASS")
          .map(([id]) => id)
      : [];
    if (!other || !recorded)
      refusals.push(
        `depends on ${dep}, which has not started on this branch; build it first`,
      );
    else if (!recorded.built_at && unproven.length)
      refusals.push(
        `depends on ${dep}, which is not built yet: no built_at, and ${unproven.join(", ")} not PASS. Build it and run yarn contract:built ${dep}`,
      );
  }

  // The operator owns branches: any number of tickets build on the branch
  // checked out, never on the protected one, where agents do not commit (PR-14).
  const branch = getCurrentBranch() ?? "";
  if (branch === toolkit.protectedBranch)
    refusals.push(
      `this is ${branch}, where agents do not commit; the operator picks a work branch (git switch -c <name>), then run this again`,
    );
  // Q2 is one reviewer; a second seat needs a focus line that names it (C6).
  const q2 = q2ReviewerProblem(contract);
  if (q2) refusals.push(q2);
  if (refusals.length)
    stop(`${item.id} cannot start:\n  ${refusals.join("\n  ")}`);

  // Reviewers as the contract names them (PR-19), then freeze. Q3 with none
  // named gets Vigil; only Q3 reviewers become criteria.
  const roles = [
    ...new Set(
      qa === "Q3" && contract.reviewers.length === 0
        ? ["vigil"]
        : contract.reviewers,
    ),
  ].sort();
  const reviewRoles = qa === "Q3" ? roles : [];
  setFrontmatter(contractPath(item), (doc) => {
    doc.set("qa", qa);
    doc.delete("tier");
    doc.set("reviewers", roles);
    const criteria = doc.get("criteria") as YAML.YAMLSeq;
    const have = new Set(contract.criteria.map((c) => c.id));
    // PR-16: Taylor's own look is a manual criterion, handed over at close.
    if (
      contract.operator_review &&
      !contract.criteria.some((c) => c.reason === OPERATOR_REVIEW_REASON)
    ) {
      const next =
        Math.max(
          0,
          ...contract.criteria
            .map((c) => Number(c.id.match(/^C(\d+)$/)?.[1]))
            .filter(Number.isFinite),
        ) + 1;
      criteria.add(
        doc.createNode({
          id: `C${next}`,
          statement: "Taylor has looked this ticket over and approved it.",
          evidence: "manual",
          reason: OPERATOR_REVIEW_REASON,
        }),
      );
    }
    for (const role of reviewRoles)
      if (!have.has(`review:${role}`))
        criteria.add(doc.createNode(reviewCriterion(role)));
  });
  const frozen = readContract(item).contract!;
  const results: Results = {
    id: item.id,
    criteria_sha256: hashCriteria(frozen.criteria),
    criteria: Object.fromEntries(
      frozen.criteria.map((c) => [
        c.id,
        { status: "FAIL", evidence: c.evidence, run: null },
      ]),
    ),
    updated_at: now(),
  };
  writeResults(item, results);
  console.log(
    `contract:init — ${item.id} started on ${branch}, ${qa}: ${frozen.criteria.length} criteria at FAIL` +
      (roles.length
        ? `; reviewers ${roles.join(", ")}${qa === "Q3" ? "" : " (in the thread)"}`
        : "; no reviewer") +
      (frozen.focus?.length ? `; focus: ${frozen.focus.join("; ")}` : "") +
      (notes.length ? `. Note: ${notes.join("; ")}` : "") +
      (decisions.open.length
        ? `. Open decisions (not blocking): ${decisions.open.join(", ")}`
        : "") +
      `. Next: build, commit as "${item.id}: <outcome>", then yarn contract:run ${item.id}`,
  );
}

// ---------------------------------------------------------------- run

/**
 * One contract:run at a time per checkout (PR-16). Threads share the
 * operator's tree, and two full builds at once overwrite each other's output
 * and fail falsely; the second run waits its turn. A lock left by a dead
 * process, or older than twenty minutes, is taken over.
 */
function takeRunLock(): void {
  const lock = path.join(
    REPO_ROOT,
    "node_modules/.cache/pem/contract-run.lock",
  );
  const alive = (pid: number) => {
    try {
      process.kill(pid, 0);
      return true;
    } catch {
      return false;
    }
  };
  const deadline = Date.now() + 20 * 60_000;
  let said = false;
  for (;;) {
    try {
      mkdirSync(path.dirname(lock), { recursive: true });
      writeFileSync(lock, String(process.pid), { flag: "wx" });
      break;
    } catch {
      let holder = NaN;
      let age = 0;
      try {
        holder = Number(readFileSync(lock, "utf8"));
        age = Date.now() - statSync(lock).mtimeMs;
      } catch {
        continue;
      }
      if (!alive(holder) || age > 20 * 60_000 || Date.now() > deadline) {
        rmSync(lock, { force: true });
        continue;
      }
      if (!said) {
        console.log(
          "contract:run — another thread's run is in progress; waiting for it to finish.",
        );
        said = true;
      }
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 2000);
    }
  }
  process.on("exit", () => {
    try {
      if (Number(readFileSync(lock, "utf8")) === process.pid)
        rmSync(lock, { force: true });
    } catch {
      // Already gone.
    }
  });
}

/**
 * The environment a criterion runs in. It runs as its own top-level run:
 * NODE_TEST_CONTEXT from an enclosing node --test (even empty) makes a child
 * runner skip its files and report to that parent, so the key is removed.
 */
function criterionEnv(): NodeJS.ProcessEnv {
  const env: NodeJS.ProcessEnv = { ...process.env, NO_COLOR: "1" };
  delete env.NODE_TEST_CONTEXT;
  // picocolors turns colour on whenever FORCE_COLOR is present, even as "0".
  delete env.FORCE_COLOR;
  return env;
}

/**
 * How many tests a runner reported passing: Node's test runner (TAP, as it
 * prints when piped), Vitest or Playwright. Null when it printed no count.
 *
 * Node wraps each test file in a subtest of its own, and that wrapper passes
 * even when a name pattern matched nothing inside it ("ok 1 - x.test.ts" with
 * a plan of 1..0; observed on Node 22.22.2, 2026-10-02). So the summary's
 * "pass" is not a test count: count the passing entries that are not files.
 */
function countTests(output: string): number | null {
  if (/^TAP version \d+/m.test(output))
    return [...output.matchAll(/^\s*ok \d+ - (.+?)(\s+#.*)?$/gm)].filter(
      (m) =>
        !/\.[cm]?[jt]sx?$/.test(m[1]!.trim()) && !/#\s*SKIP/i.test(m[2] ?? ""),
    ).length;
  const vitest = output.match(/^\s*Tests\s+(\d+) passed/m);
  if (vitest) return Number(vitest[1]);
  const playwright = output.match(/^\s*(\d+) passed\b/m);
  if (playwright) return Number(playwright[1]);
  return null;
}

function run() {
  const tree = readSpecsTree(toolkit);
  const [id, ...only] = argv;
  const item = requireItem(tree, id);
  const results = requireResults(item);
  const contract = readContract(item).contract;
  if (!contract)
    stop(
      `${contractPath(item)} is not a valid contract; yarn check-specs names the problem`,
    );
  requireFrozen(item, contract, results);
  for (const name of only) {
    const criterion = contract.criteria.find((c) => c.id === name);
    if (!criterion) stop(`${item.id} has no criterion ${name}`);
    if (criterion.evidence !== "test" && criterion.evidence !== "check")
      stop(
        isReview(criterion)
          ? `${name} is recorded by yarn review:run ${name.slice(7)} ${item.id}`
          : `${name} is ${criterion.evidence} evidence; record it with yarn contract:record ${item.id} ${name} --evidence <path>`,
      );
  }
  requireProvable(item, contract);
  const head = getHead()!;
  const selected = contract.criteria.filter(
    (c) =>
      (c.evidence === "test" || c.evidence === "check") &&
      (only.length === 0 || only.includes(c.id)),
  );
  if (selected.length === 0)
    stop(`${item.id} has no test or check criteria to run`);

  takeRunLock();
  let failed = 0;
  // Criteria that share a command share its run (PR-19): four criteria proven
  // by `yarn test` run it once, not four times.
  const ran = new Map<
    string,
    { output: string; exit: number; at: string; seconds: string }
  >();
  for (const criterion of selected) {
    const problem = checkCommand(criterion.command ?? "");
    if (problem) stop(`${criterion.id}: ${problem}`);
    const words = splitCommand(criterion.command!);
    const shared = ran.get(criterion.command!);
    const started = Date.now();
    let run = shared;
    if (!run) {
      const at = now();
      const result = spawnSync(words[0]!, words.slice(1), {
        cwd: REPO_ROOT,
        encoding: "utf8",
        maxBuffer: 64 * 1024 * 1024,
        env: criterionEnv(),
      });
      run = {
        output: `${result.stdout ?? ""}${result.stderr ?? ""}`
          .split(REPO_ROOT)
          .join("."),
        exit: result.status ?? 1,
        at,
        seconds: ((Date.now() - started) / 1000).toFixed(1),
      };
      ran.set(criterion.command!, run);
    }
    const { output, exit, at } = run;
    const tests =
      criterion.evidence === "test" ? (countTests(output) ?? 0) : undefined;
    // The log lands by rename, and its result is written at once: a check-specs
    // in another thread, or in this run's own later criterion, never sees a new
    // log beside an old hash for longer than one write (PR-14).
    const log = `${evidenceDir(item)}/${criterion.id}.log`;
    const pending = `${evidenceDir(item)}/.${criterion.id}.log.${process.pid}.tmp`;
    writeRepoText(
      pending,
      `command: ${criterion.command}\nexit: ${exit}\nat: ${at}\nhead: ${head}\n` +
        (tests !== undefined ? `tests: ${tests}\n` : "") +
        `---\n${output}`,
    );
    const pass = exit === 0 && (tests === undefined || tests > 0);
    const record: RunRecord = {
      command: criterion.command!,
      exit,
      at,
      head,
      evidence_path: log,
      evidence_sha256: hashFile(pending),
      ...(tests !== undefined && { tests }),
    };
    results.criteria[criterion.id] = {
      status: pass ? "PASS" : "FAIL",
      evidence: criterion.evidence,
      run: record,
    };
    renameSync(path.join(REPO_ROOT, pending), path.join(REPO_ROOT, log));
    writeResults(item, results);
    if (!pass) failed++;
    console.log(
      `${pass ? "PASS" : "FAIL"} ${criterion.id} ${criterion.evidence}  ${criterion.command}  (${shared ? "shared run" : `${run.seconds} s`}` +
        (tests !== undefined ? `, ${tests} tests` : "") +
        `)${!pass && tests === 0 && exit === 0 ? "  the runner matched zero tests: name a test after the criterion" : ""}`,
    );
  }
  printLeft(item);
  if (failed) process.exit(1);
}

// ---------------------------------------------------------------- record

function record() {
  const evidence = option("--evidence");
  const verdict = option("--verdict") ?? "pass";
  const tree = readSpecsTree(toolkit);
  const [id, name] = argv;
  const item = requireItem(tree, id);
  const results = requireResults(item);
  const contract = readContract(item).contract;
  if (!contract) stop(`${contractPath(item)} is not a valid contract`);
  requireFrozen(item, contract, results);
  const criterion = contract.criteria.find((c) => c.id === name);
  if (!name || !criterion)
    stop(`${item.id} has no criterion ${name ?? "(none named)"}`);
  if (isReview(criterion))
    stop(
      `a review is recorded only by its run, never by pointing at a file (B1). Run: yarn review:run ${name.slice(7)} ${item.id}`,
    );
  if (criterion.evidence === "test" || criterion.evidence === "check")
    stop(
      `${name} is ${criterion.evidence} evidence; run it: yarn contract:run ${item.id} ${name}`,
    );
  if (!evidence) stop(`name the evidence file: --evidence <path>`);
  if (verdict !== "pass" && verdict !== "fail" && verdict !== "deferred")
    stop("--verdict is pass, fail or deferred");
  if (verdict === "deferred" && criterion.evidence !== "manual")
    stop(
      `${name} is ${criterion.evidence} evidence; only a manual criterion, one a person must check, can be deferred to the operator`,
    );
  const rel = toRepoPath(evidence);
  if (rel.startsWith(".."))
    stop(
      `${evidence} is outside the repo; evidence lives in the repo, ideally in ${evidenceDir(item)}/`,
    );
  if (!fileExists(rel) || readFileSync(path.join(REPO_ROOT, rel)).length === 0)
    stop(`${rel} does not exist or is empty; write the evidence first`);
  if (/\/evidence\/[^/]+\.log$/.test(rel))
    stop(
      `${rel} is a .log, and git ignores logs under evidence/ (PR-19); save recorded evidence as .md or .txt so it is committed`,
    );
  if (
    criterion.evidence === "capture" &&
    criterion.path &&
    criterion.path !== rel
  )
    stop(
      `${name}'s contract names ${criterion.path} as its evidence, not ${rel}`,
    );
  requireProvable(item, contract);
  const at = now();
  results.criteria[criterion.id] = {
    status: verdict === "fail" ? "FAIL" : "PASS",
    evidence: criterion.evidence,
    run: {
      command: `yarn contract:record ${item.id} ${name} --evidence ${rel}${verdict === "pass" ? "" : ` --verdict ${verdict}`}`,
      exit: 0,
      at,
      head: getHead()!,
      evidence_path: rel,
      evidence_sha256: hashFile(rel),
      ...(verdict === "deferred" && { deferred: true }),
    },
  };
  writeResults(item, results);
  console.log(
    verdict === "deferred"
      ? `contract:record — ${name} handed to the operator (${rel}); it is listed under Operator checks in _status.md and does not hold ${item.id}.`
      : `contract:record — ${name} ${verdict.toUpperCase()} against ${rel}.`,
  );
  printLeft(item);
}

// ---------------------------------------------------------------- add

function add() {
  const evidence = option("--evidence") as EvidenceType | undefined;
  const statement = option("--statement");
  const commandText = option("--command");
  const evidencePath = option("--path");
  const reason = option("--reason");
  const tree = readSpecsTree(toolkit);
  const [id, name] = argv;
  const item = requireItem(tree, id);
  const results = requireResults(item);
  if (isMerged(item))
    stop(`${item.id} has merged; its contract is a record now`);
  const contract = readContract(item).contract;
  if (!contract) stop(`${contractPath(item)} is not a valid contract`);
  requireFrozen(item, contract, results);
  if (!name) stop("name the criterion: C<n>, or review:<role>");
  if (contract.criteria.some((c) => c.id === name))
    stop(`${item.id} already has ${name}`);

  let criterion: Criterion;
  if (name.startsWith("review:")) {
    criterion = reviewCriterion(name.slice(7));
  } else {
    if (!/^C[1-9][0-9]*$/.test(name))
      stop(`${name} is not a criterion id; use C<n> or review:<role>`);
    if (!evidence || !(EVIDENCE_TYPES as readonly string[]).includes(evidence))
      stop(`--evidence is one of ${EVIDENCE_TYPES.join(", ")}`);
    if (!statement) stop("--statement says what is true when this is done");
    criterion = { id: name, statement, evidence };
    if (commandText) criterion.command = commandText;
    if (evidencePath) criterion.path = evidencePath;
    if (reason) criterion.reason = reason;
    if (evidence === "test" || evidence === "check") {
      if (isWholeChain(commandText)) stop(wholeChainProblem(name));
      const problem = checkCommand(commandText ?? "");
      if (problem) stop(problem);
    }
  }
  setFrontmatter(contractPath(item), (doc) => {
    (doc.get("criteria") as YAML.YAMLSeq).add(doc.createNode(criterion));
    if (name.startsWith("review:")) {
      const roles = new Set(contract.reviewers);
      roles.add(name.slice(7));
      doc.set("reviewers", [...roles].sort());
    }
  });
  const updated = readContract(item);
  const problems = checkContract(item, updated, toolkit, { started: false });
  if (problems.length)
    stop(
      `the added criterion breaks the contract:\n  ${problems.join("\n  ")}`,
    );
  results.criteria_sha256 = hashCriteria(updated.contract!.criteria);
  results.criteria[name] = {
    status: "FAIL",
    evidence: criterion.evidence,
    run: null,
  };
  writeResults(item, results);
  console.log(`contract:add — ${item.id} gains ${name} at FAIL.`);
}

// ---------------------------------------------------------------- qa

function setQa() {
  const named = option("--reviewers");
  const tree = readSpecsTree(toolkit);
  const [id, level] = argv;
  const item = requireItem(tree, id);
  const results = requireResults(item);
  if (isMerged(item))
    stop(`${item.id} has merged; its contract is a record now`);
  const contract = readContract(item).contract;
  if (!contract) stop(`${contractPath(item)} is not a valid contract`);
  requireFrozen(item, contract, results);
  if (!level || !(QA_LEVELS as readonly string[]).includes(level))
    stop(
      `name the level: yarn contract:qa ${item.id} <${QA_LEVELS.join(" | ")}> [--reviewers <role,role>]`,
    );
  const qa = level as Qa;
  const given =
    named !== undefined
      ? named
          .split(",")
          .map((r) => r.trim())
          .filter(Boolean)
      : contract.reviewers;
  for (const role of given)
    if (!findRoleFile(role)) stop(`no role file for ${role} under docs/roles/`);
  const roles = [
    ...new Set(qa === "Q3" && given.length === 0 ? ["vigil"] : given),
  ].sort();
  // Q2 is one reviewer; a second seat needs a focus line that names it (C6).
  const q2 = q2ReviewerProblem({ qa, reviewers: roles, focus: contract.focus });
  if (q2) stop(`${item.id} ${q2}`);
  // Only Q3 reviewers are criteria; below Q3 the review happens in the thread.
  const wanted = new Set(
    qa === "Q3" ? roles.map((role) => `review:${role}`) : [],
  );
  const dropped = contract.criteria
    .filter((c) => isReview(c) && !wanted.has(c.id))
    .map((c) => c.id);
  const added = [...wanted].filter(
    (id) => !contract.criteria.some((c) => c.id === id),
  );
  setFrontmatter(contractPath(item), (doc) => {
    doc.set("qa", qa);
    doc.delete("tier");
    doc.set("reviewers", roles);
    const criteria = doc.get("criteria") as YAML.YAMLSeq;
    criteria.items = criteria.items.filter(
      (node) => !dropped.includes(String((node as YAML.YAMLMap).get("id"))),
    );
    for (const id of added)
      criteria.add(doc.createNode(reviewCriterion(id.slice(7))));
  });
  const updated = readContract(item).contract!;
  results.criteria_sha256 = hashCriteria(updated.criteria);
  for (const id of dropped) delete results.criteria[id];
  for (const id of added)
    results.criteria[id] = { status: "FAIL", evidence: "manual", run: null };
  writeResults(item, results);
  console.log(
    `contract:qa — ${item.id} is ${qa}` +
      (roles.length
        ? `; reviewers ${roles.join(", ")}${qa === "Q3" ? "" : " (in the thread)"}`
        : "") +
      (dropped.length ? `; dropped ${dropped.join(", ")}` : "") +
      (added.length ? `; added ${added.join(", ")} at FAIL` : "") +
      ".",
  );
  printLeft(item);
}

// ---------------------------------------------------------------- built

function built() {
  const tree = readSpecsTree(toolkit);
  const item = requireItem(tree, argv[0]);
  const results = requireResults(item);
  const contract = readContract(item).contract;
  if (!contract) stop(`${contractPath(item)} is not a valid contract`);
  requireFrozen(item, contract, results);
  requireProvable(item, contract);
  results.built_at = now();
  writeResults(item, results);
  const stage = readItemState(item, toolkit.specsRoot).stage;
  console.log(
    stage === "built"
      ? `contract:built — ${item.id} is built at ${results.built_at}: code in, criteria unrecorded, awaiting harden. Harden with yarn contract:run ${item.id}.`
      : `contract:built — ${item.id} built_at ${results.built_at} recorded; it reads ${stage}, since its criteria already hold.`,
  );
}

// ---------------------------------------------------------------- main

if (command === "init") init();
else if (command === "run") run();
else if (command === "record") record();
else if (command === "add") add();
else if (command === "qa") setQa();
else if (command === "built") built();
else
  stop(
    "usage: node tooling/contract.ts <init | run | record | add | qa | built> …",
  );
