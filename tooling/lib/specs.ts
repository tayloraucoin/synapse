/**
 * The work loop's model (J5; E-22 to E-26, A4 to A9, A13.2): where tickets and
 * epics live, what a contract and a results file hold, which reviewers a
 * ticket needs, and whether each recorded PASS still holds.
 *
 * Every script of the loop reads the specs tree through here, so the layout,
 * the hashing and the staleness rule have one home.
 */

import { createHash } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from "node:fs";
import path, { matchesGlob } from "node:path";
import YAML from "yaml";

import {
  estimateTokens,
  listFiles,
  REPO_ROOT,
  splitFrontmatter,
} from "./docs.ts";
import {
  getBaseRef,
  isAncestor,
  listChangedAgainstBase,
  listChangedSince,
  readOnRef,
  runGit,
} from "./git.ts";
import { validateJson } from "./json-schema.ts";
import type { Toolkit, ToolkitReviewer } from "./toolkit.ts";

// ---------------------------------------------------------------- constants

export const EVIDENCE_TYPES = ["test", "check", "capture", "manual"] as const;
export type EvidenceType = (typeof EVIDENCE_TYPES)[number];

/** The ticket is the whole brief: frontmatter plus its Build notes (PR-15). */
export const CONTRACT_TOKEN_CAP = 2500;
/** A10's spec-file caps, enforced with a message that says to split. */
export const SPEC_FILE_CAPS = {
  surface: 2000,
  overview: 1500,
  technical: 2000,
} as const;
export const MAX_NON_NEGOTIABLES = 7;

/** The sections every as-built carries (PR-15). Migrations and Test changes are added when the ticket has any. */
export const AS_BUILT_SECTIONS = [
  "Shipped against the contract",
  "Deviations",
  "Not verified",
  "Next",
] as const;

/**
 * The QA level the operator confirmed for a ticket (PR-19;
 * docs/workflows/qa-levels.md). It sets proof, review and paperwork:
 *   Q0  nothing extra (work at Q0 rarely has a ticket);
 *   Q1  the builder runs the criteria; no reviewer;
 *   Q2  plus one reviewer in the thread; no review criterion, no review file;
 *   Q3  recorded proofs that can go stale, and a review:<role> criterion and
 *       kept review file for each listed reviewer.
 * The level is never computed. Planned paths that reach a critical path below
 * Q3 are flagged once, at the start. `tier` is the pre-PR-19 field, read only
 * for a contract that has no `qa` yet.
 */
export const QA_LEVELS = ["Q0", "Q1", "Q2", "Q3"] as const;
export type Qa = (typeof QA_LEVELS)[number];
export type Tier = 0 | 1 | 2;
export const CRITICAL_PATHS = [
  /(^|\/)(migrations|schema|policies|db|auth|billing|webhooks)(\/|$)/,
  /(^|\/)(env|proxy)\.ts$/,
  /\.sql$/,
  /^\.claude\/settings\.json$/,
  /^tooling\/hooks\//,
];

export const CONTRACT_TEMPLATE =
  "docs/engineering/templates/contract.template.md";
export const AS_BUILT_TEMPLATE =
  "docs/engineering/templates/as-built.template.md";
export const RESULTS_SCHEMA = "docs/engineering/schemas/results.schema.json";
export const CONTRACT_SCHEMA = "docs/engineering/schemas/contract.schema.json";

export const BLOCKING_MARKER = "[NEEDS DECISION — BLOCKING]";
export const OPEN_MARKER = "[NEEDS DECISION]";
/** Set only by the contract-loop harness: lets a fixture review runner count. */
export const FIXTURE_ENV = "PEM_SPECS_FIXTURE";

const PREFIX = "[A-Z][A-Z0-9]{1,4}";
export const WORK_ID = new RegExp(`^(${PREFIX})-([1-9][0-9]*)$`);
/**
 * A ticket folder is <PREFIX>-<n>-<slug>. New folders pad n to three digits
 * (STK-007-slug), so a listing sorts in number order; the id stays STK-7.
 * Folders filed before padding keep their names: results.json records paths
 * into them, and a merged record never changes.
 */
const FOLDER = new RegExp(
  `^(${PREFIX})-0*([1-9][0-9]*)-([a-z0-9]+(?:-[a-z0-9]+)*)$`,
);
export const FOLDER_DIGITS = 3;
export const ticketFolder = (prefix: string, n: number, slug: string) =>
  `${prefix}-${String(n).padStart(FOLDER_DIGITS, "0")}-${slug}`;
const EPIC_FOLDER = new RegExp(`^(${PREFIX})-([a-z0-9]+(?:-[a-z0-9]+)*)$`);
export const EPIC_PREFIX = new RegExp(`^${PREFIX}$`);
/** What an app's specs folder may hold: truth, tickets, and the tracks' own records. */
const APP_FOLDERS = [
  "ux",
  "epics",
  "one-offs",
  "explorations",
  "audits",
  "reports",
  "_archive",
];
/** Closed one-offs and finished epics, by close month: <app>/_archive/<YYYY>/<MM>/<folder>/. */
export const ARCHIVE = "_archive";
const YEAR = /^\d{4}$/;
const MONTH = /^(0[1-9]|1[0-2])$/;
export const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;

// ---------------------------------------------------------------- types

export type Criterion = {
  id: string;
  statement: string;
  evidence: EvidenceType;
  command?: string;
  path?: string;
  reason?: string;
};

export type Contract = {
  id: string;
  size: "small" | "medium" | "large";
  objective: string;
  slice_type: string;
  non_negotiables: string[];
  devs_call: string;
  cites: string[];
  waiver?: string;
  truth_files: string[] | string;
  reviewers: string[];
  planned_paths: string[];
  depends_on: string[];
  out_of_scope: string[];
  criteria: Criterion[];
  qa?: Qa;
  /** Named parts raised to a higher level on the operator's request. */
  focus?: string[];
  /** Pre-PR-19; read only when `qa` is absent. */
  tier?: Tier;
  /** Taylor looks the ticket over himself: contract:init adds a manual criterion for it (PR-16). */
  operator_review?: boolean;
};

/**
 * What a reviewer run cost (the audit's O4): the headless result's usage and
 * the wall-clock seconds review:run measured. This is the one home of the
 * field names; the review file header and the run record carry the same keys.
 */
export const COST_FIELDS = [
  "tokens_input",
  "tokens_cache_read",
  "tokens_cache_write",
  "tokens_output",
  "seconds",
] as const;
export type CostField = (typeof COST_FIELDS)[number];
export type Cost = Record<CostField, number>;

export type RunRecord = {
  command: string;
  exit: number;
  at: string;
  head: string;
  evidence_path: string;
  evidence_sha256: string;
  tests?: number;
  contract_sha256?: string;
  /** For a review: the criteria set it judged; a criterion added later makes its PASS stale (WEB-12). */
  criteria_sha256?: string;
  as_built_sha256?: string;
  runner?: string;
  /** A manual criterion only a person can check, handed to the operator: it never holds the ticket (PR-16). */
  deferred?: boolean;
} & Partial<Cost>;

/** A review:run attempt a guard stopped before the reviewer ran (the audit's Y5). */
export type Refusal = { at: string; reason: string };

export type CriterionResult = {
  status: "PASS" | "FAIL";
  evidence: EvidenceType;
  run: RunRecord | null;
  /** Every refused attempt, oldest first; a completed run never clears them. */
  refused?: Refusal[];
  /** For a review: completed runs that gave a verdict. The cap reads it (WEB-12): a second run only after a FAIL, a third only with --operator. */
  runs?: number;
};

/**
 * What a ticket's threads cost, by `yarn cost <id> --record` (audit R4): one
 * API call per message id, weighted at the first report's weights, attributed
 * by the second audit's rule. The one home of the category names.
 */
export const COST_CATEGORIES = [
  "build",
  "proofs",
  "captures",
  "reviews",
  "status",
  "git",
  "re-reading",
  "other",
] as const;
export type CostCategory = (typeof COST_CATEGORIES)[number];
export type TicketCost = {
  at: string;
  calls: number;
  /** Weighted tokens: input 1, cache write 1.25, cache read 0.1, output 5 (an estimate of cost, not the meter). */
  weighted: number;
  tokens_input: number;
  tokens_cache_read: number;
  tokens_cache_write: number;
  tokens_output: number;
  by_category: Record<CostCategory, { calls: number; weighted: number }>;
  /** Input, cache read and cache write of the last main-thread call; null when every call was a subagent's. */
  context_last_call: number | null;
  threads: number;
  /** review:run runs on record in results.json that carry cost fields (the last run per review). */
  headless_runs: number;
  headless_weighted: number;
};

export type Results = {
  id: string;
  criteria_sha256: string;
  criteria: Record<string, CriterionResult>;
  /** When yarn contract:built said the code is in (audit R9); the ticket reads "built" until a criterion is recorded after it. */
  built_at?: string;
  cost?: TicketCost;
  updated_at: string;
};

export type Epic = {
  prefix: string;
  slug: string;
  app: string;
  /** Repo-relative folder. */
  dir: string;
  /** Where it was filed: dir, unless it is archived. */
  origin: string;
  /** The archive month, as in "2026/10"; null while it is live. */
  archived: string | null;
};

export type Item = {
  id: string;
  prefix: string;
  number: number;
  slug: string;
  app: string;
  kind: "one-off" | "epic ticket";
  epic: Epic | null;
  /** Repo-relative folder. */
  dir: string;
  /** Where it was filed: dir, unless it or its epic is archived. Records name paths there. */
  origin: string;
  /** The archive month, as in "2026/10"; null while it is live. */
  archived: string | null;
};

export type SpecsTree = {
  specsRoot: string;
  epics: Epic[];
  items: Item[];
  /** Layout problems: misnamed folders, duplicate ids and prefixes. */
  problems: string[];
};

// ---------------------------------------------------------------- files

const abs = (rel: string) => path.join(REPO_ROOT, rel);
export const fileExists = (rel: string) => existsSync(abs(rel));
const isDir = (rel: string) =>
  fileExists(rel) && statSync(abs(rel)).isDirectory();
/**
 * Files the OS drops into any folder it shows (Finder, Explorer). They are
 * never part of the layout and never a stray, so every listing skips them;
 * anything else unexpected is still reported (A4).
 */
export const OS_METADATA = new Set([".DS_Store", "Thumbs.db", "desktop.ini"]);
const listDir = (rel: string) =>
  isDir(rel)
    ? readdirSync(abs(rel))
        .filter((name) => !OS_METADATA.has(name))
        .sort()
    : [];
export const readRepoText = (rel: string) => readFileSync(abs(rel), "utf8");

export const hashText = (text: string | Buffer) =>
  createHash("sha256").update(text).digest("hex");
export const hashFile = (rel: string) => hashText(readFileSync(abs(rel)));

/** The header contract:run writes atop a log, before its `---`; null when there is none. */
export function readRunHeader(
  rel: string,
): { command: string; at: string; head: string } | null {
  const text = readRepoText(rel);
  const end = text.indexOf("\n---\n");
  if (end === -1) return null;
  const fields = new Map(
    text
      .slice(0, end)
      .split("\n")
      .map((line) => line.match(/^([a-z]+): (.*)$/))
      .filter((m) => m !== null)
      .map((m) => [m[1]!, m[2]!]),
  );
  const [command, at, head] = ["command", "at", "head"].map((k) =>
    fields.get(k),
  );
  return command && at && head ? { command, at, head } : null;
}

export const contractPath = (item: Item) => `${item.dir}/contract.md`;
export const resultsPath = (item: Item) => `${item.dir}/results.json`;
export const asBuiltPath = (item: Item) => `${item.dir}/as-built.md`;
export const reviewPath = (item: Item, role: string) =>
  `${item.dir}/review-${role}.md`;
export const evidenceDir = (item: Item) => `${item.dir}/evidence`;
export const preflightPath = (epic: Epic) =>
  `${epic.dir}/tickets/_preflight.md`;
export const statusPath = (specsRoot: string) => `${specsRoot}/_status.md`;

/**
 * Where a path a record names is now. Records are never rewritten: a path
 * inside the folder an item was filed at follows the folder into the archive.
 */
export const relocate = (item: Item, recorded: string) =>
  item.origin !== item.dir && recorded.startsWith(`${item.origin}/`)
    ? `${item.dir}/${recorded.slice(item.origin.length + 1)}`
    : recorded;

export const compareIds = (a: string, b: string) => {
  const [pa, na] = a.split("-");
  const [pb, nb] = b.split("-");
  return pa === pb ? Number(na) - Number(nb) : pa!.localeCompare(pb!);
};

/** Every prefix the layout claims before any epic does: toolkit and app prefixes. */
export const reservedPrefixes = (toolkit: Toolkit) => [
  ...toolkit.toolkitPrefixes,
  ...Object.values(toolkit.apps).map((app) => app.prefix),
];

// ---------------------------------------------------------------- the tree

/**
 * Reads the specs tree (A4): `<specsRoot>/<app | _shared>/{ux, epics, one-offs}`.
 * `specsRoot` defaults to toolkit.json's; check-specs passes a fixture's.
 */
export function readSpecsTree(
  toolkit: Toolkit,
  specsRoot: string = toolkit.specsRoot,
): SpecsTree {
  const problems: string[] = [];
  const epics: Epic[] = [];
  const items: Item[] = [];
  const apps = new Set([...Object.keys(toolkit.apps), "_shared"]);

  for (const app of listDir(specsRoot)) {
    const appDir = `${specsRoot}/${app}`;
    if (!isDir(appDir)) {
      if (app !== "_status.md")
        problems.push(
          `${appDir} is not part of the layout; ${specsRoot}/ holds _status.md and one folder per app (A4)`,
        );
      continue;
    }
    if (!apps.has(app)) {
      problems.push(
        `${appDir}/ is not an app in toolkit.json; use one of ${[...apps].join(", ")}`,
      );
      continue;
    }
    for (const part of listDir(appDir)) {
      if (!APP_FOLDERS.includes(part))
        problems.push(
          `${appDir}/${part} is not part of the layout; an app folder holds ${APP_FOLDERS.map((f) => `${f}/`).join(", ")}`,
        );
    }

    const appPrefix = toolkit.apps[app]?.prefix ?? null;
    const oneOff = (name: string, dir: string, archived: string | null) => {
      const match = name.match(FOLDER);
      if (!match || !isDir(dir)) {
        problems.push(
          `${dir} is not named <PREFIX>-<n>-<slug>; create one-offs with yarn contract:init`,
        );
        return;
      }
      if (match[1] !== appPrefix) {
        problems.push(
          `${dir}: a one-off in ${app}/ uses the app's prefix ${appPrefix ?? "(none: _shared work is an epic)"}, not ${match[1]}`,
        );
        return;
      }
      items.push({
        id: `${match[1]}-${match[2]}`,
        prefix: match[1]!,
        number: Number(match[2]),
        slug: match[3]!,
        app,
        kind: "one-off",
        epic: null,
        dir,
        origin: `${appDir}/one-offs/${name}`,
        archived,
      });
    };
    const readEpic = (name: string, dir: string, archived: string | null) => {
      const match = name.match(EPIC_FOLDER);
      if (!match || !isDir(dir)) {
        problems.push(
          `${dir} is not named <EPIC>-<slug>; create epics with yarn spec:init`,
        );
        return;
      }
      const origin = `${appDir}/epics/${name}`;
      const epic: Epic = {
        prefix: match[1]!,
        slug: match[2]!,
        app,
        dir,
        origin,
        archived,
      };
      epics.push(epic);
      for (const ticket of listDir(`${dir}/tickets`)) {
        const tdir = `${dir}/tickets/${ticket}`;
        if (!isDir(tdir)) {
          if (ticket !== "_preflight.md" && ticket !== ".gitkeep")
            problems.push(
              `${tdir} is not part of the layout; tickets/ holds ticket folders and _preflight.md`,
            );
          continue;
        }
        const tmatch = ticket.match(FOLDER);
        if (!tmatch || tmatch[1] !== epic.prefix) {
          problems.push(
            `${tdir} is not named ${epic.prefix}-<n>-<slug>; create tickets with yarn contract:init ${epic.prefix} <slug>`,
          );
          continue;
        }
        items.push({
          id: `${tmatch[1]}-${tmatch[2]}`,
          prefix: tmatch[1]!,
          number: Number(tmatch[2]),
          slug: tmatch[3]!,
          app,
          kind: "epic ticket",
          epic,
          dir: tdir,
          origin: `${origin}/tickets/${ticket}`,
          archived,
        });
      }
    };

    for (const name of listDir(`${appDir}/one-offs`))
      oneOff(name, `${appDir}/one-offs/${name}`, null);
    for (const name of listDir(`${appDir}/epics`))
      readEpic(name, `${appDir}/epics/${name}`, null);

    // The archive keeps every id and prefix in sight, so none is reused.
    const archive = `${appDir}/${ARCHIVE}`;
    for (const year of listDir(archive)) {
      if (!YEAR.test(year) || !isDir(`${archive}/${year}`)) {
        problems.push(
          `${archive}/${year} is not part of the layout; the archive holds <YYYY>/<MM>/ folders, written by yarn specs:archive`,
        );
        continue;
      }
      for (const month of listDir(`${archive}/${year}`)) {
        const monthDir = `${archive}/${year}/${month}`;
        if (!MONTH.test(month) || !isDir(monthDir)) {
          problems.push(
            `${monthDir} is not part of the layout; the archive holds <YYYY>/<MM>/ folders, written by yarn specs:archive`,
          );
          continue;
        }
        for (const name of listDir(monthDir)) {
          const dir = `${monthDir}/${name}`;
          if (name.match(FOLDER)?.[1] === appPrefix)
            oneOff(name, dir, `${year}/${month}`);
          else readEpic(name, dir, `${year}/${month}`);
        }
      }
    }
  }

  // Duplicate prefixes (A4): an epic's prefix is unique in the repo and never an app's or the toolkit's.
  const reserved = new Set(reservedPrefixes(toolkit));
  const seen = new Map<string, string>();
  for (const epic of epics) {
    if (reserved.has(epic.prefix))
      problems.push(
        `${epic.dir}: the prefix ${epic.prefix} belongs to toolkit.json; rename the epic with a free prefix`,
      );
    const other = seen.get(epic.prefix);
    if (other)
      problems.push(
        `${epic.dir}: the prefix ${epic.prefix} is already used by ${other}; an epic prefix is unique in the repo`,
      );
    else seen.set(epic.prefix, epic.dir);
  }
  const ids = new Map<string, string>();
  for (const item of items) {
    const other = ids.get(item.id);
    if (other)
      problems.push(
        `${item.dir}: the id ${item.id} is already used by ${other}; ids are allocated by yarn contract:init, never typed`,
      );
    else ids.set(item.id, item.dir);
  }

  items.sort((a, b) => compareIds(a.id, b.id));
  epics.sort((a, b) => a.prefix.localeCompare(b.prefix));
  return { specsRoot, epics, items, problems };
}

export const findItem = (tree: SpecsTree, id: string) =>
  tree.items.find((item) => item.id === id) ?? null;

// ---------------------------------------------------------------- contracts

const schemaCache: Record<string, Record<string, unknown>> = {};
export function readSchema(rel: string): Record<string, unknown> {
  schemaCache[rel] ??= JSON.parse(readRepoText(rel)) as Record<string, unknown>;
  return schemaCache[rel]!;
}

export type ContractFile = {
  contract: Contract | null;
  /** Raw text, for hashing and the token cap. */
  text: string;
  /** Raw frontmatter text, for edits that keep its layout. */
  rawFrontmatter: string | null;
  body: string;
  problems: string[];
};

export function readContract(item: Item): ContractFile {
  const rel = contractPath(item);
  if (!fileExists(rel))
    return {
      contract: null,
      text: "",
      rawFrontmatter: null,
      body: "",
      problems: [`${rel} is missing; run yarn contract:init to write it`],
    };
  const text = readRepoText(rel);
  const { raw, body } = splitFrontmatter(text);
  if (raw === null)
    return {
      contract: null,
      text,
      rawFrontmatter: null,
      body,
      problems: [
        `${rel} has no frontmatter; copy the fields from ${CONTRACT_TEMPLATE}`,
      ],
    };
  let data: unknown;
  try {
    data = YAML.parse(raw);
  } catch (error) {
    return {
      contract: null,
      text,
      rawFrontmatter: raw,
      body,
      problems: [
        `${rel}: the frontmatter is not valid YAML (${error instanceof Error ? error.message.split("\n")[0] : String(error)})`,
      ],
    };
  }
  const problems = validateJson(data, readSchema(CONTRACT_SCHEMA)).map(
    (problem) =>
      `${rel}: ${problem.replace(/^\$\.?/, "") || "the frontmatter"} (${CONTRACT_SCHEMA})`,
  );
  return {
    contract: problems.length ? null : (data as Contract),
    text,
    rawFrontmatter: raw,
    body,
    problems,
  };
}

/** The frozen form of a criteria set: what `criteria_sha256` hashes (A13.2). */
export function hashCriteria(criteria: Criterion[]): string {
  const canonical = criteria.map((criterion) =>
    Object.fromEntries(
      Object.entries(criterion).sort(([a], [b]) => a.localeCompare(b)),
    ),
  );
  return hashText(JSON.stringify(canonical));
}

export const isReview = (criterion: { id: string }) =>
  criterion.id.startsWith("review:");
export const reviewRole = (criterionId: string) =>
  criterionId.replace(/^review:/, "");

export const truthFilesOf = (contract: Contract) =>
  Array.isArray(contract.truth_files) ? contract.truth_files : [];

/** A cited entry is a file when it names a path; otherwise it is a decision or criterion id. */
export const isCitedFile = (entry: string) => entry.includes("/");

/**
 * A `test` or `check` command is a package.json script, run through yarn
 * (A13.2): `yarn <script> [args]` or `yarn workspace <name> <script> [args]`.
 * Returns the problem, or null.
 */
/**
 * The whole chain is never a criterion (specs.md; the contract template): the
 * batch close runs `yarn verify` once, and a criterion names the specific check
 * it proves. The exact script only; `yarn verify:fast` is the stop gate's own.
 */
export function isWholeChain(command: string | undefined): boolean {
  const words = splitCommand(command ?? "");
  return words.length === 2 && words[0] === "yarn" && words[1] === "verify";
}

export const wholeChainProblem = (criterionId: string) =>
  `${criterionId} runs yarn verify, which is never a criterion: the batch close proves the whole chain once. Name the specific check this criterion proves (yarn test, yarn check-types, yarn lint:boundaries, ...)`;

export function checkCommand(command: string): string | null {
  const words = splitCommand(command);
  if (words[0] !== "yarn")
    return `"${command}" is not a yarn script; test and check commands are package.json scripts run as yarn <script>`;
  let scripts: Record<string, string> = {};
  let script = words[1];
  let where = "package.json";
  if (script === "workspace") {
    const name = words[2];
    script = words[3];
    const workspace = findWorkspace(name ?? "");
    if (!workspace)
      return `"${command}" names the workspace ${name}, which does not exist`;
    where = `${workspace}/package.json`;
  }
  try {
    scripts =
      (JSON.parse(readRepoText(where)) as { scripts?: Record<string, string> })
        .scripts ?? {};
  } catch {
    return `${where} cannot be read`;
  }
  if (!script || !(script in scripts))
    return `"${command}" runs ${script ?? "nothing"}, which is not a script in ${where}; add the script, then cite it`;
  return null;
}

function findWorkspace(name: string): string | null {
  for (const group of ["apps", "packages"])
    for (const dir of listDir(group)) {
      const rel = `${group}/${dir}/package.json`;
      if (!fileExists(rel)) continue;
      try {
        if ((JSON.parse(readRepoText(rel)) as { name?: string }).name === name)
          return `${group}/${dir}`;
      } catch {
        // An unreadable package.json is the build's problem, not this check's.
      }
    }
  return null;
}

/** Splits a command into words, honouring single and double quotes. No expansion. */
export function splitCommand(command: string): string[] {
  const words: string[] = [];
  let word: string | null = null;
  let quote: string | null = null;
  for (const c of command) {
    if (quote) {
      if (c === quote) quote = null;
      else word = (word ?? "") + c;
    } else if (c === "'" || c === '"') {
      quote = c;
      word ??= "";
    } else if (/\s/.test(c)) {
      if (word !== null) words.push(word);
      word = null;
    } else word = (word ?? "") + c;
  }
  if (word !== null) words.push(word);
  return words;
}

// ---------------------------------------------------------------- reviewers

/** Concrete paths a planned path stands for, so a glob can be tested against the reviewer globs. */
function samplePaths(
  planned: string,
  toolkit: Toolkit,
  tracked: string[],
): string[] {
  if (!/[*?[{]/.test(planned)) return [planned];
  const basenames = new Set(["x", "x.ts", "x.tsx", "x.md", "x.json", "x.sql"]);
  for (const row of toolkit.reviewers) {
    if (!row.glob) continue;
    const last = row.glob.split("/").at(-1)!;
    if (!/[*?[{]/.test(last)) basenames.add(last);
    else if (/^\*\.[a-z]+$/.test(last)) basenames.add(`x${last.slice(1)}`);
  }
  const segments = planned.split("/");
  const last = segments.pop()!;
  const heads = [""];
  for (const segment of segments) {
    const next: string[] = [];
    for (const head of heads) {
      if (segment === "**") next.push(head, `${head}x/`);
      else next.push(`${head}${segment.includes("*") ? "x" : segment}/`);
    }
    heads.splice(0, heads.length, ...next);
  }
  const lasts =
    last === "**"
      ? [...basenames].flatMap((name) => [name, `x/${name}`])
      : [...basenames].filter((name) => matchesGlob(name, last));
  const samples = heads.flatMap((head) => lasts.map((name) => head + name));
  return [...samples, ...tracked.filter((file) => matchesGlob(file, planned))];
}

type SourceToken = {
  kind: "word" | "punct" | "string" | "other";
  text: string;
};

/** Words after which a slash opens a regular expression, not a division. */
const REGEX_AFTER = new Set([
  "return",
  "typeof",
  "instanceof",
  "case",
  "do",
  "else",
  "in",
  "of",
  "new",
  "delete",
  "void",
  "throw",
  "yield",
  "await",
]);

/**
 * A JS or TS source as the tokens an import can be read from: words,
 * punctuation and quoted strings with their contents. Comments are dropped,
 * and template and regular-expression literals become opaque tokens, so a
 * module named inside a comment, a template or another string is never read
 * as an import. A quote left open at the end of a line (an apostrophe in JSX
 * text) is dropped with the rest of that line.
 */
function tokenizeSource(source: string): SourceToken[] {
  const tokens: SourceToken[] = [];
  const braces: ("code" | "template")[] = [];
  const n = source.length;
  let i = 0;

  const regexMayStart = () => {
    const last = tokens.at(-1);
    if (!last) return true;
    if (last.kind === "word") return REGEX_AFTER.has(last.text);
    if (last.kind === "punct") return !/^[)\]}]$/.test(last.text);
    return false;
  };
  /** From just inside a template (or after its `}`), to its end or its next `${`. */
  const scanTemplate = () => {
    while (i < n) {
      const c = source[i]!;
      if (c === "\\") i += 2;
      else if (c === "`") {
        i++;
        tokens.push({ kind: "other", text: "`" });
        return;
      } else if (c === "$" && source[i + 1] === "{") {
        i += 2;
        braces.push("template");
        return;
      } else i++;
    }
  };

  while (i < n) {
    const c = source[i]!;
    const next = source[i + 1];
    if (/\s/.test(c)) i++;
    else if (c === "/" && next === "/") {
      while (i < n && source[i] !== "\n") i++;
    } else if (c === "/" && next === "*") {
      const end = source.indexOf("*/", i + 2);
      i = end === -1 ? n : end + 2;
    } else if (c === '"' || c === "'") {
      let text = "";
      let j = i + 1;
      while (j < n && source[j] !== c && source[j] !== "\n") {
        if (source[j] === "\\") j++;
        text += source[j] ?? "";
        j++;
      }
      if (source[j] === c) tokens.push({ kind: "string", text });
      i = j + 1;
    } else if (c === "`") {
      i++;
      scanTemplate();
    } else if (c === "/" && regexMayStart()) {
      let j = i + 1;
      let inClass = false;
      while (j < n && source[j] !== "\n") {
        const r = source[j]!;
        if (r === "\\") j++;
        else if (r === "[") inClass = true;
        else if (r === "]") inClass = false;
        else if (r === "/" && !inClass) break;
        j++;
      }
      i = j + 1;
      while (i < n && /[a-z]/i.test(source[i]!)) i++;
      tokens.push({ kind: "other", text: "/regex/" });
    } else if (/[\w$#]/.test(c)) {
      let j = i + 1;
      while (j < n && /[\w$]/.test(source[j]!)) j++;
      tokens.push({ kind: "word", text: source.slice(i, j) });
      i = j;
    } else {
      if (c === "{") braces.push("code");
      if (c === "}" && braces.pop() === "template") {
        i++;
        scanTemplate();
        continue;
      }
      tokens.push({ kind: "punct", text: c });
      i++;
    }
  }
  return tokens;
}

/**
 * The module specifiers a JS or TS source names in a static import or
 * export-from (`import x from "m"`, `import "m"`, `export * from "m"`), a
 * `require("m")` or an `import("m")`. Never a name in a comment or a string.
 */
export function listImportedModules(source: string): string[] {
  const tokens = tokenizeSource(source);
  const found = new Set<string>();
  tokens.forEach((token, k) => {
    if (token.kind !== "word" || tokens[k - 1]?.text === ".") return;
    const at = (offset: number) => tokens[k + offset];
    const called = at(1)?.text === "(" && at(2)?.kind === "string";
    if (token.text === "from" && at(1)?.kind === "string")
      found.add(at(1)!.text);
    else if (token.text === "import" && at(1)?.kind === "string")
      found.add(at(1)!.text);
    else if ((token.text === "import" || token.text === "require") && called)
      found.add(at(2)!.text);
  });
  return [...found];
}

/** Whether a specifier names a module of an imports row: the module, a subpath of it, or a package in its `@scope/*`. */
export function importsModule(specifier: string, module: string): boolean {
  if (module.endsWith("/*"))
    return (
      specifier.startsWith(module.slice(0, -1)) &&
      specifier.length > module.length - 1
    );
  return specifier === module || specifier.startsWith(`${module}/`);
}

/** Source files the import scan reads; anything else (env files among them) is never opened. */
const SOURCE_FILE = /\.(?:[cm]?[jt]sx?)$/;
const importsCache = new Map<string, string[]>();

/** The modules a tracked source file imports; empty for a file that is not source, or cannot be read. */
export function readImportedModules(
  file: string,
  root: string = REPO_ROOT,
): string[] {
  if (!SOURCE_FILE.test(file) || path.basename(file).startsWith(".env"))
    return [];
  const key = path.join(root, file);
  let modules = importsCache.get(key);
  if (!modules) {
    try {
      modules = listImportedModules(readFileSync(key, "utf8"));
    } catch {
      modules = [];
    }
    importsCache.set(key, modules);
  }
  return modules;
}

/** The first imported specifier that reaches a row's imports list, or null. */
export function findImportMatch(
  row: Pick<ToolkitReviewer, "imports">,
  modules: readonly string[],
): string | null {
  for (const specifier of modules)
    if (row.imports?.some((module) => importsModule(specifier, module)))
      return specifier;
  return null;
}

/**
 * Why an existing file reaches a reviewer row, or null: by the row's glob,
 * else by a module it imports (T6). The one matcher for a file that exists;
 * suggestReviewers' import pass and check-reviewers both go through
 * findImportMatch, so the two never disagree.
 */
export function findRowReach(
  row: ToolkitReviewer,
  file: string,
  modules: readonly string[],
): string | null {
  if (row.glob && matchesGlob(file, row.glob))
    return `${file} reaches ${row.glob}`;
  const specifier = findImportMatch(row, modules);
  return specifier ? `${file} imports ${specifier}` : null;
}

export type RequiredReviewers = Map<string, string[]>;
let trackedCache: string[] | null = null;

/**
 * The reviewers a contract's planned paths suggest (PR-19): every toolkit.json
 * row whose glob they reach, and every imports row a tracked file they hold
 * imports (T6). The tracked files a ticket's planned paths hold include every
 * committed file of its diff; a planned file that does not exist yet matches
 * by glob only. Evidence for the builder's recommendation and for a warning,
 * never an assignment: the operator confirms who reviews. Globs are compared
 * by sampling.
 */
export function suggestReviewers(
  contract: Pick<Contract, "planned_paths">,
  toolkit: Toolkit,
): RequiredReviewers {
  const suggested: RequiredReviewers = new Map();
  const add = (role: string, why: string) => {
    const reasons = suggested.get(role) ?? [];
    if (!reasons.includes(why)) suggested.set(role, [...reasons, why]);
  };
  trackedCache ??= (runGit(["ls-files"]) ?? "").split("\n").filter(Boolean);
  const tracked = trackedCache;
  const importRows = toolkit.reviewers.filter((row) => row.imports);

  for (const planned of contract.planned_paths) {
    const samples = samplePaths(planned, toolkit, tracked);
    for (const row of toolkit.reviewers)
      if (row.glob && samples.some((sample) => matchesGlob(sample, row.glob!)))
        add(row.role, `${planned} reaches ${row.glob}`);
    if (importRows.length === 0) continue;
    for (const file of tracked) {
      if (!inPlannedPaths(file, [planned])) continue;
      const modules = readImportedModules(file);
      for (const row of importRows) {
        const specifier = findImportMatch(row, modules);
        if (specifier) add(row.role, `${file} imports ${specifier}`);
      }
    }
  }
  return suggested;
}

/** A ticket's QA level: its contract's `qa:`, else the old `tier:` read across, else Q1. */
export function qaOf(contract: Pick<Contract, "qa" | "tier">): Qa {
  if (contract.qa) return contract.qa;
  return contract.tier === 2 ? "Q3" : "Q1";
}

/**
 * Q2 is one reviewer (docs/workflows/qa-levels.md; the audit's C6). A further
 * seat is allowed only where a focus line names what that reviewer examines,
 * as the template's "the webhook handler: every event type handled (warden)".
 * Returns the problem, or null. contract:init and contract:qa refuse on it;
 * check-specs warns on a draft, whose seats the operator settles at the
 * Tickets gate. Q3 is untouched: its reviewers are the operator's list.
 */
export function q2ReviewerProblem(
  contract: Pick<Contract, "qa" | "tier" | "reviewers" | "focus">,
): string | null {
  if (qaOf(contract) !== "Q2" || contract.reviewers.length <= 1) return null;
  const focus = (Array.isArray(contract.focus) ? contract.focus : []).map(
    (line) => String(line).toLowerCase(),
  );
  const unfocused = contract.reviewers.filter(
    (role) =>
      !focus.some((line) =>
        new RegExp(`\\b${role.toLowerCase()}\\b`).test(line),
      ),
  );
  if (unfocused.length <= 1) return null;
  return `names ${contract.reviewers.length} reviewers at Q2 (${contract.reviewers.join(", ")}); Q2 is one reviewer unless a focus line names what each other seat examines, as in "the webhook handler: every event type handled (${unfocused[1]})" (docs/workflows/qa-levels.md)`;
}

/**
 * The planned paths that reach a critical path (money, auth, schema, personal
 * data, agent permissions). A planned path reaches one when it names one, or
 * when it is a glob that holds a tracked critical file. Never by sampling: a
 * folder glob is not critical because an env.ts could one day sit in it.
 */
export function criticalPathsOf(
  contract: Pick<Contract, "planned_paths">,
): string[] {
  trackedCache ??= (runGit(["ls-files"]) ?? "").split("\n").filter(Boolean);
  const tracked = trackedCache;
  const isCritical = (file: string) =>
    CRITICAL_PATHS.some((door) => door.test(file));
  return contract.planned_paths.filter(
    (planned) =>
      isCritical(planned) ||
      (/[*?[{]/.test(planned) || planned.endsWith("/")
        ? tracked.some(
            (file) => inPlannedPaths(file, [planned]) && isCritical(file),
          )
        : false),
  );
}

export function reviewCriterion(role: string): Criterion {
  return {
    id: `review:${role}`,
    statement: `${role[0]!.toUpperCase()}${role.slice(1)} reviews this ticket in fresh context against its contract and evidence.`,
    evidence: "manual",
    reason: `a reviewer's judgment, recorded only by yarn review:run ${role} <id>`,
  };
}

/** The role file a review loads: docs/roles/<department>/<role>-<title>.md. */
export function findRoleFile(role: string): string | null {
  return (
    listFiles("docs/roles").find((file) =>
      path.posix.basename(file).startsWith(`${role}-`),
    ) ?? null
  );
}

// ---------------------------------------------------------------- results

export function readResults(item: Item): {
  results: Results | null;
  problems: string[];
} {
  const rel = resultsPath(item);
  if (!fileExists(rel)) return { results: null, problems: [] };
  let data: unknown;
  try {
    data = JSON.parse(readRepoText(rel));
  } catch {
    return {
      results: null,
      problems: [
        `${rel} is not valid JSON; it is written only by tooling: git restore it, then re-run yarn contract:run ${item.id}`,
      ],
    };
  }
  const problems = validateJson(data, readSchema(RESULTS_SCHEMA)).map(
    (problem) => `${rel}: ${problem.replace(/^\$\.?/, "")} (${RESULTS_SCHEMA})`,
  );
  return { results: problems.length ? null : (data as Results), problems };
}

/** The cost fields a run record carries, in COST_FIELDS order; none when the run predates cost recording. */
export function pickCost(run: Partial<Cost>): Partial<Cost> {
  const cost: Partial<Cost> = {};
  for (const field of COST_FIELDS)
    if (typeof run[field] === "number") cost[field] = run[field];
  return cost;
}

const COUNT = new Intl.NumberFormat("en-US");

/** One phrase for a status line: `1,200 in, 3,400 read, 500 write, 260 out, 0.1 s`, or that no cost was recorded. */
export function formatCost(run: Partial<Cost>): string {
  const cost = pickCost(run);
  if (Object.keys(cost).length === 0) return "cost not recorded";
  const n = (v: number | undefined) =>
    v === undefined ? "?" : COUNT.format(v);
  return `${n(cost.tokens_input)} in, ${n(cost.tokens_cache_read)} read, ${n(cost.tokens_cache_write)} write, ${n(cost.tokens_output)} out, ${cost.seconds === undefined ? "?" : cost.seconds} s`;
}

/** A cost block with a stable key order. */
function orderCost(cost: TicketCost): TicketCost {
  return {
    at: cost.at,
    calls: cost.calls,
    weighted: cost.weighted,
    tokens_input: cost.tokens_input,
    tokens_cache_read: cost.tokens_cache_read,
    tokens_cache_write: cost.tokens_cache_write,
    tokens_output: cost.tokens_output,
    by_category: Object.fromEntries(
      COST_CATEGORIES.map((c) => [
        c,
        {
          calls: cost.by_category[c]?.calls ?? 0,
          weighted: cost.by_category[c]?.weighted ?? 0,
        },
      ]),
    ) as TicketCost["by_category"],
    context_last_call: cost.context_last_call,
    threads: cost.threads,
    headless_runs: cost.headless_runs,
    headless_weighted: cost.headless_weighted,
  };
}

/** As the audits print weighted tokens: `18.4M` from 0.1M, `16k` from 1k, the integer below. */
export const formatMillions = (n: number) =>
  n >= 100_000
    ? `${(n / 1e6).toFixed(1)}M`
    : n >= 1000
      ? `${Math.round(n / 1000)}k`
      : String(Math.round(n));

/**
 * A cost block as one line, each count with its rule (WEB-13): what `yarn cost`
 * prints and `yarn status <id>` shows. Attribution decides every count, so its
 * label leads; the weights are model-blind and are not the meter.
 */
export function formatTicketCost(label: string, cost: TicketCost): string {
  const categories = COST_CATEGORIES.filter(
    (c) => cost.by_category[c].calls > 0,
  ).map(
    (c) =>
      `${c} ${cost.by_category[c].calls} ${formatMillions(cost.by_category[c].weighted)}`,
  );
  const context =
    cost.context_last_call === null
      ? "none"
      : `${Math.round(cost.context_last_call / 1000)}k`;
  return (
    `${label} [attributed to the last ticket a work command named in its thread; estimate]: ` +
    `${COUNT.format(cost.calls)} calls [one per message id], ` +
    `${formatMillions(cost.weighted)} weighted [in 1, write 1.25, read 0.1, out 5; model-blind estimate, not the meter]` +
    `${categories.length ? ` (${categories.join(", ")}) [by first tool]` : ""}, ` +
    `raw ${formatMillions(cost.tokens_cache_read)} read and ${formatMillions(cost.tokens_output)} out [summed once per message id], ` +
    `thread context at its last main-thread call ${context} [in + read + write], ` +
    `${cost.threads} thread(s) naming it, ` +
    `headless at least ${cost.headless_runs} run(s) ${formatMillions(cost.headless_weighted)} [results.json keeps the last run per review; not in the weighted total]`
  );
}

/** Serializes results with a stable key order, so a diff shows only what changed. */
export function formatResults(results: Results): string {
  const criteria = Object.fromEntries(
    Object.entries(results.criteria).map(([id, result]) => [
      id,
      {
        status: result.status,
        evidence: result.evidence,
        run: result.run && {
          command: result.run.command,
          exit: result.run.exit,
          at: result.run.at,
          head: result.run.head,
          evidence_path: result.run.evidence_path,
          evidence_sha256: result.run.evidence_sha256,
          ...(result.run.tests !== undefined && { tests: result.run.tests }),
          ...(result.run.contract_sha256 && {
            contract_sha256: result.run.contract_sha256,
          }),
          ...(result.run.criteria_sha256 && {
            criteria_sha256: result.run.criteria_sha256,
          }),
          ...(result.run.as_built_sha256 && {
            as_built_sha256: result.run.as_built_sha256,
          }),
          ...(result.run.runner && { runner: result.run.runner }),
          ...(result.run.deferred && { deferred: true }),
          ...pickCost(result.run),
        },
        ...(result.refused?.length && {
          refused: result.refused.map((r) => ({ at: r.at, reason: r.reason })),
        }),
        ...(result.runs && { runs: result.runs }),
      },
    ]),
  );
  return `${JSON.stringify(
    {
      id: results.id,
      criteria_sha256: results.criteria_sha256,
      criteria,
      ...(results.built_at && { built_at: results.built_at }),
      ...(results.cost && { cost: orderCost(results.cost) }),
      updated_at: results.updated_at,
    },
    null,
    2,
  )}\n`;
}

export const now = () => new Date().toISOString().replace(/\.\d+Z$/, "Z");

// ---------------------------------------------------------------- as-built

export type AsBuilt = {
  sections: Map<string, string>;
  /** The Migrations section's `applied:` value: n/a, pending or a date. */
  applied: string | null;
  text: string;
};

export function parseAsBuilt(text: string): AsBuilt {
  const { body } = splitFrontmatter(text);
  const sections = new Map<string, string>();
  const parts = body.split(/^## /m).slice(1);
  for (const part of parts) {
    const newline = part.indexOf("\n");
    const heading = (newline === -1 ? part : part.slice(0, newline)).trim();
    sections.set(heading, newline === -1 ? "" : part.slice(newline + 1).trim());
  }
  const applied =
    (sections.get("Migrations") ?? "")
      .match(/^applied:\s*(.+)$/m)?.[1]
      ?.trim() ?? null;
  return { sections, applied, text };
}

/** A section counts as empty when it says nothing, or only "none". */
export const isEmptySection = (text: string | undefined) =>
  !text ||
  /^(none|n\/a|-)\.?$/i.test(text.replace(/<!--[\s\S]*?-->/g, "").trim());

/** The as-built with its `applied:` value blanked: the part that is immutable after merge. */
export const withoutApplied = (text: string) =>
  text.replace(/^applied:.*$/m, "applied:");

// ---------------------------------------------------------------- status

export type CriterionState = {
  id: string;
  evidence: EvidenceType;
  /** PASS only when the recorded PASS still holds. */
  status: "PASS" | "FAIL";
  /** Why it is not PASS, or why a recorded PASS does not hold. */
  reason: string | null;
  /** A recorded PASS that fails its run record: a defect, not work left to do. */
  tampered: boolean;
  /** A recorded PASS the code or the contract has since outrun (B2). */
  stale: boolean;
  /** Handed to the operator: counts as done for the ticket, listed under Operator checks. */
  deferred: boolean;
};

export type ItemState = {
  item: Item;
  contract: Contract | null;
  results: Results | null;
  criteria: CriterionState[];
  hasAsBuilt: boolean;
  merged: boolean;
  stage:
    | "draft"
    | "open"
    | "built"
    | "proven"
    | "closing"
    | "closed"
    | "migration pending";
};

type Git = {
  base: string | null;
  changedAgainstBase: string[] | null;
  head: string | null;
};
let gitCache: Git | null = null;
/** check-specs' static fixtures turn git off: their run records name no real commit. */
export function disableGit() {
  gitCache = { base: null, changedAgainstBase: null, head: null };
}
/** Reads git again on the next call (after fixtures ran with it off). */
export function enableGit() {
  gitCache = null;
}
function gitFacts(): Git {
  gitCache ??= {
    base: getBaseRef(),
    changedAgainstBase: listChangedAgainstBase(),
    head: runGit(["rev-parse", "HEAD"]),
  };
  return gitCache;
}

/** Whether an item's as-built is on the base branch: merged, so frozen rather than live. */
export function isMerged(item: Item): boolean {
  const { base } = gitFacts();
  return (
    base !== null &&
    (readOnRef(base, asBuiltPath(item)) ??
      readOnRef(base, `${item.origin}/as-built.md`)) !== null
  );
}

/** Whether a repo path is one of an item's planned paths: a file, a folder ending in "/", or a glob. */
export function inPlannedPaths(file: string, planned: string[]): boolean {
  return planned.some((p) =>
    p.endsWith("/") ? file.startsWith(p) : matchesGlob(file, p),
  );
}

/**
 * This item's planned paths changed after `commit`, in this branch's change.
 * Only its own paths: tickets share the operator's branch, so another ticket's
 * commit never stales this one's proof (PR-14). The specs root is outside it:
 * records and living truth are not what evidence proves (A8).
 */
function changedAfter(
  commit: string,
  planned: string[],
  specsRoot: string,
): string[] {
  const { changedAgainstBase } = gitFacts();
  const branch = new Set(changedAgainstBase ?? []);
  return listChangedSince(commit).filter(
    (file) =>
      branch.has(file) &&
      !file.startsWith(`${specsRoot}/`) &&
      inPlannedPaths(file, planned),
  );
}

/**
 * Whether each criterion's recorded status still holds (A9, A13.2): a PASS
 * needs a run record, an evidence file whose hash matches, the contract's
 * command, at least one test for a test criterion, and no later change to
 * its planned paths in the branch's diff.
 *
 * Staleness is asked for, never assumed (PR-19): only a Q3 ticket's proofs go
 * stale, and only the pre-merge check and `yarn status <id>` look. A commit to
 * a shared file reopens nothing while tickets are in build. A test or check
 * log is local (never committed), so a missing one is not a defect, and a
 * rewritten one is read only when staleness is asked for: every contract:run
 * rewrites its logs, so outside `--strict` and `yarn status <id>` a changed
 * log is not a defect and never moves a closed ticket back to closing (C7).
 * A results.json that contradicts itself (a PASS with no run record, a
 * failing exit, the wrong command, zero tests) is always a defect.
 */
export function readItemState(
  item: Item,
  specsRoot: string,
  options: { staleness?: boolean } = {},
): ItemState {
  const { contract } = readContract(item);
  const lookAtEvidence = options.staleness === true;
  const checkStaleness =
    lookAtEvidence && contract !== null && qaOf(contract) === "Q3";
  const { results } = readResults(item);
  const hasAsBuilt = fileExists(asBuiltPath(item));
  const merged = hasAsBuilt && isMerged(item);
  const { head } = gitFacts();
  const criteria: CriterionState[] = [];
  // A closed ticket's proofs are frozen (PR-16): every criterion recorded PASS
  // and the as-built written. A later edit to a file it shares with another
  // ticket no longer reopens it; the batch's yarn verify guards regressions.
  const frozen =
    hasAsBuilt &&
    (contract?.criteria ?? []).every(
      (c) => results?.criteria[c.id]?.status === "PASS",
    );

  for (const criterion of contract?.criteria ?? []) {
    const result = results?.criteria[criterion.id];
    const state: CriterionState = {
      id: criterion.id,
      evidence: criterion.evidence,
      status: "FAIL",
      reason: null,
      tampered: false,
      stale: false,
      deferred: false,
    };
    criteria.push(state);
    const fail = (reason: string, kind?: "tampered" | "stale") => {
      state.reason = reason;
      if (kind === "tampered") state.tampered = true;
      if (kind === "stale") state.stale = true;
    };
    if (!result) {
      fail("not in results.json");
      continue;
    }
    const run = result.run;
    if (result.status === "FAIL") {
      fail(
        !run
          ? "not proven yet"
          : run.tests === 0
            ? "the runner matched zero tests"
            : `last run exited ${run.exit}`,
      );
      continue;
    }
    if (!run) {
      fail(
        "PASS with no run record; results are written only by tooling (A9)",
        "tampered",
      );
      continue;
    }
    const isLog =
      criterion.evidence === "test" || criterion.evidence === "check";
    const evidence = relocate(item, run.evidence_path);
    const hasEvidence = fileExists(evidence);
    if (!hasEvidence && !isLog) {
      fail(`evidence ${evidence} is missing`, "tampered");
      continue;
    }
    if (
      lookAtEvidence &&
      hasEvidence &&
      hashFile(evidence) !== run.evidence_sha256
    ) {
      // A newer contract:run has written this log and not yet its result
      // (another thread on the shared branch, PR-14, or a run that stopped
      // between the two): work in flight, not an edit. A log whose header is
      // the recorded run's, an older one, none, one from the future or from a
      // commit outside this branch was edited. No run writes a merged log.
      const header = !merged && isLog ? readRunHeader(evidence) : null;
      const newer =
        header !== null &&
        header.command === run.command &&
        header.at <= now() &&
        (head === null || isAncestor(header.head, head)) &&
        (header.at > run.at ||
          (header.at === run.at && header.head !== run.head));
      if (newer)
        fail(
          `evidence ${evidence} is from a newer run (${header.at}, ${header.head.slice(0, 7)}) than the one recorded (${run.at}); a contract:run is recording it, or stopped before it could`,
          "stale",
        );
      else
        fail(`evidence ${evidence} changed after it was recorded`, "tampered");
      continue;
    }
    if (run.exit !== 0) {
      fail(`PASS recorded with exit ${run.exit}`, "tampered");
      continue;
    }
    if (criterion.evidence === "test" || criterion.evidence === "check") {
      if (run.command !== criterion.command) {
        fail(
          `recorded command "${run.command}" is not the contract's "${criterion.command}"`,
          "tampered",
        );
        continue;
      }
      if (criterion.evidence === "test" && !run.tests) {
        fail("PASS recorded with zero tests", "tampered");
        continue;
      }
    }
    if (isReview(criterion)) {
      if (!run.contract_sha256 || !run.as_built_sha256 || !run.runner) {
        fail("a review PASS not written by yarn review:run (B1)", "tampered");
        continue;
      }
      if (
        run.runner.startsWith("fixture") &&
        process.env[FIXTURE_ENV] !== "1"
      ) {
        fail(
          `reviewed by a fixture runner (${run.runner}), not Claude`,
          "tampered",
        );
        continue;
      }
      // A review PASS is final for its round (WEB-12, the audit's C1). It
      // judged the frozen criteria, so only a change to them resets it: never
      // the as-built, never a later planned-path commit (those reset proofs
      // of code, below). The run record carries the criteria hash it judged.
      if (
        checkStaleness &&
        !merged &&
        !frozen &&
        run.criteria_sha256 &&
        results &&
        run.criteria_sha256 !== results.criteria_sha256
      ) {
        fail(
          "the criteria changed after this review; it judged the earlier set",
          "stale",
        );
        continue;
      }
    }
    state.deferred = run.deferred === true;
    if (checkStaleness && !merged && !frozen && head) {
      if (!isAncestor(run.head, head)) {
        fail(
          `recorded on ${run.head.slice(0, 7)}, which is not in this branch`,
          "stale",
        );
        continue;
      }
      const changed = isReview(criterion)
        ? []
        : changedAfter(run.head, contract?.planned_paths ?? [], specsRoot);
      if (changed.length > 0) {
        fail(
          `${changed.slice(0, 3).join(", ")}${changed.length > 3 ? ` and ${changed.length - 3} more` : ""} changed after it was recorded`,
          "stale",
        );
        continue;
      }
    }
    state.status = "PASS";
  }

  const left = criteria.filter((c) => c.status !== "PASS");
  const nonReviewLeft = left.filter((c) => !c.id.startsWith("review:"));
  let stage: ItemState["stage"];
  if (!results) stage = "draft";
  else if (hasAsBuilt) {
    if (left.length > 0) stage = "closing";
    else {
      const applied = parseAsBuilt(readRepoText(asBuiltPath(item))).applied;
      stage = applied === "pending" ? "migration pending" : "closed";
    }
  } else if (nonReviewLeft.length === 0) stage = "proven";
  else stage = isBuilt(results) ? "built" : "open";
  return { item, contract, results, criteria, hasAsBuilt, merged, stage };
}

/**
 * Built (audit R9): yarn contract:built said the code is in, and no criterion
 * has been recorded since. A run at or after built_at ends it; contract:run
 * on a built ticket proceeds as on an open one.
 */
export function isBuilt(results: Results): boolean {
  const builtAt = results.built_at;
  if (!builtAt) return false;
  return Object.values(results.criteria).every(
    (r) => !r.run || r.run.at < builtAt,
  );
}

/** Recorded state only, no git: what the generated _status.md shows, so it never drifts with HEAD. */
export function recordedLeft(state: ItemState): string[] {
  if (!state.contract || !state.results) return [];
  return state.contract.criteria
    .filter((c) => state.results!.criteria[c.id]?.status !== "PASS")
    .map((c) => `${c.id} ${c.evidence}`);
}

function recordedStage(state: ItemState): string {
  if (!state.results) return "draft";
  const left = recordedLeft(state);
  if (state.hasAsBuilt) {
    if (left.length > 0) return "closing";
    return parseAsBuilt(readRepoText(asBuiltPath(state.item))).applied ===
      "pending"
      ? "code complete, migration pending"
      : "closed";
  }
  if (left.length === 0) return "proven";
  return isBuilt(state.results) ? "built" : "open";
}

/** What a criterion still needs, as the brief line and `yarn status <id>` print it. */
export function leftOf(state: ItemState): string[] {
  return state.criteria
    .filter((c) => c.status !== "PASS")
    .map(
      (c) =>
        `${c.id} ${c.evidence}${c.reason && c.reason !== "not proven yet" ? ` (${c.reason})` : ""}`,
    );
}

/** The stages a ticket is in build: it orients the thread on its own work. */
const IN_BUILD = new Set<ItemState["stage"]>([
  "open",
  "built",
  "proven",
  "closing",
]);

/**
 * The one line the hooks print into every session (C7, O7). It lists the
 * tickets in build, whatever the branch (tickets share the operator's branch,
 * PR-14), and omits closed and migration-pending ones. It never asks for
 * staleness, so a rewritten evidence log or a later commit is not reported
 * here: the pre-merge `check-specs --strict` and `yarn status <id>` look.
 */
export function renderBrief(tree: SpecsTree, limit: number): string {
  const all = tree.items
    .map((item) => readItemState(item, tree.specsRoot))
    .filter((s) => !s.merged);
  const active = all.filter((s) => IN_BUILD.has(s.stage));
  const parts: string[] = [];
  if (active.length) {
    const items = active.map((s) => {
      const left = leftOf(s);
      return `${s.item.id} ${s.item.slug} (${s.stage}; ${left.length ? `left: ${left.join(", ")}` : "nothing left"})`;
    });
    parts.push(
      `Active: ${items.join("; ")}. Next: yarn status ${active.length === 1 ? active[0]!.item.id : "<id>"}.`,
    );
  } else parts.push("Active: none.");
  const drafts = all.filter((s) => s.stage === "draft");
  if (drafts.length)
    parts.push(`Drafted: ${drafts.map((s) => s.item.id).join(", ")}.`);
  const line = parts.join(" ");
  return line.length > limit ? `${line.slice(0, limit - 1)}…` : line;
}

/** The generated view of every item (E-26). Deterministic: it reads files, never git or the clock. */
export function renderStatusFile(tree: SpecsTree): string {
  const states = tree.items.map((item) => readItemState(item, tree.specsRoot));
  const link = (dir: string) => `${path.posix.relative(tree.specsRoot, dir)}/`;
  const rows = states
    .filter((state) => !state.item.archived)
    .map((state) => {
      const left = recordedLeft(state);
      return `| ${state.item.id} | ${state.item.kind} | ${recordedStage(state)} | ${left.length ? left.join(", ") : "none"} | [\`${state.item.slug}\`](${link(state.item.dir)}) |`;
    });
  const operatorRows = states.flatMap((state) =>
    (state.contract?.criteria ?? [])
      .filter((c) => state.results?.criteria[c.id]?.run?.deferred === true)
      .map(
        (c) =>
          `| ${state.item.id} | ${c.id} | ${c.statement.replaceAll("|", "\\|")} | \`${relocate(state.item, state.results!.criteria[c.id]!.run!.evidence_path)}\` |`,
      ),
  );
  const ticketsOf = (epic: Epic) =>
    tree.items.filter((item) => item.epic?.prefix === epic.prefix);
  const epicRows = tree.epics
    .filter((epic) => !epic.archived)
    .map(
      (epic) =>
        `| ${epic.prefix} | ${epic.app} | ${ticketsOf(epic).length} | [\`${epic.slug}\`](${link(epic.dir)}) |`,
    );
  const archiveRows = [
    ...tree.epics
      .filter((epic) => epic.archived)
      .map((epic) => ({
        month: epic.archived!,
        id: epic.prefix,
        row: `| ${epic.archived} | ${epic.prefix} | epic, ${ticketsOf(epic).length} ticket(s) | [\`${epic.slug}\`](${link(epic.dir)}) |`,
      })),
    ...tree.items
      .filter((item) => item.archived && item.kind === "one-off")
      .map((item) => ({
        month: item.archived!,
        id: item.id,
        row: `| ${item.archived} | ${item.id} | one-off | [\`${item.slug}\`](${link(item.dir)}) |`,
      })),
  ]
    .sort(
      (a, b) =>
        b.month.localeCompare(a.month) ||
        (EPIC_PREFIX.test(a.id) === EPIC_PREFIX.test(b.id)
          ? compareIds(a.id, b.id)
          : EPIC_PREFIX.test(a.id)
            ? -1
            : 1),
    )
    .map((entry) => entry.row);
  return [
    "# Status",
    "",
    "Generated by `yarn status` from every contract and results file. Do not edit: `check-specs` fails when this is out of date. Live state, with staleness against the code, is `yarn status <id>`.",
    "",
    "## Items",
    "",
    "| ID | Kind | Stage | Left | Folder |",
    "| --- | --- | --- | --- | --- |",
    ...(rows.length ? rows : ["| none | | | | |"]),
    "",
    "## Operator checks",
    "",
    "What only a person can check. None of it holds a ticket. Once checked, tell any thread, which records it: `yarn contract:record <id> <criterion> --evidence <path>`.",
    "",
    "| ID | Criterion | What to check | How |",
    "| --- | --- | --- | --- |",
    ...(operatorRows.length ? operatorRows : ["| none | | | |"]),
    "",
    "## Epics",
    "",
    "| Epic | App | Tickets | Folder |",
    "| --- | --- | --- | --- |",
    ...(epicRows.length ? epicRows : ["| none | | | |"]),
    "",
    ...(archiveRows.length
      ? [
          "## Archive",
          "",
          "Closed one-offs and finished epics, moved by `yarn specs:archive`, newest month first. Their ids stay taken; `yarn status <id>` still reads them.",
          "",
          "| Month | ID | What | Folder |",
          "| --- | --- | --- | --- |",
          ...archiveRows,
          "",
        ]
      : []),
  ].join("\n");
}

/** Cited files that hold an open decision: listed by status, blocking only with the BLOCKING marker (A6). */
export function openDecisions(contract: Contract): {
  blocking: string[];
  open: string[];
} {
  const blocking: string[] = [];
  const open: string[] = [];
  for (const cited of contract.cites.filter(isCitedFile)) {
    if (!fileExists(cited)) continue;
    const text = readRepoText(cited);
    if (text.includes(BLOCKING_MARKER)) blocking.push(cited);
    else if (text.includes(OPEN_MARKER)) open.push(cited);
  }
  return { blocking, open };
}

// ---------------------------------------------------------------- writes

/** Regenerates _status.md; every script that changes a contract or a result calls it. */
export function refreshStatusFile(toolkit: Toolkit): string {
  const tree = readSpecsTree(toolkit);
  const rel = statusPath(tree.specsRoot);
  mkdirSync(abs(tree.specsRoot), { recursive: true });
  writeFileSync(abs(rel), renderStatusFile(tree));
  return rel;
}

export function writeRepoText(rel: string, text: string) {
  mkdirSync(path.dirname(abs(rel)), { recursive: true });
  writeFileSync(abs(rel), text);
}

// ---------------------------------------------------------------- contract rules

/**
 * The contract rules no schema can carry (A5, A7, A11, A13.2). Each problem
 * names the file and the fix. `started` is false for a draft, which may still
 * hold [FILL] markers and has no reviewers yet.
 */
export function checkContract(
  item: Item,
  file: ContractFile,
  toolkit: Toolkit,
  options: { started: boolean; testChanges?: boolean; specsRoot?: string },
): string[] {
  const rel = contractPath(item);
  // A draft still being filled is work in progress, not a defect.
  if (!options.started && /\[FILL/.test(file.text)) return [];
  const problems = [...file.problems];
  const contract = file.contract;
  if (!contract) return problems;
  const bad = (text: string) => problems.push(`${rel}: ${text}`);
  // An archived contract is a record of a closed ticket: it was checked
  // against the tree it closed in, and the files and scripts it names may
  // since have moved with it or changed.
  if (item.archived) {
    if (contract.id !== item.id)
      bad(`id is ${contract.id}, but the folder is ${item.id}`);
    return problems;
  }

  if (/\[FILL/.test(file.text)) {
    if (options.started) bad("still holds [FILL] markers; fill every one");
    return problems;
  }
  if (contract.id !== item.id)
    bad(
      `id is ${contract.id}, but the folder is ${item.id}; ids are allocated by contract:init`,
    );
  const tokens = estimateTokens(file.text);
  if (tokens > CONTRACT_TOKEN_CAP)
    bad(
      `is about ${tokens} tokens, over the ${CONTRACT_TOKEN_CAP} cap (A5); split the ticket`,
    );
  if (contract.non_negotiables.length > MAX_NON_NEGOTIABLES)
    bad(
      `has ${contract.non_negotiables.length} non-negotiables; at most ${MAX_NON_NEGOTIABLES}, or split the ticket`,
    );
  if (contract.size === "large")
    bad(
      "is sized large (over two days); split it into tickets of under half a day",
    );

  const surfaces = contract.cites.filter(isCitedFile);
  if (surfaces.length > 1 && !contract.waiver)
    bad(
      `cites ${surfaces.length} surface files; a ticket cites one (A5): split it, or add a waiver: line with the reason`,
    );
  for (const cited of surfaces)
    if (!fileExists(cited)) bad(`cites ${cited}, which does not exist`);
  const citedText = surfaces.filter(fileExists).map(readRepoText).join("\n");
  if (surfaces.length > 0)
    for (const id of contract.cites.filter((entry) => !isCitedFile(entry)))
      if (!citedText.includes(id))
        bad(
          `cites ${id}, which no cited file holds; cite the file that defines it`,
        );

  if (/docs\/research\//.test(file.text))
    bad(
      "names a docs/research/ path; research is never attached to a build thread (A11). Cite the distilled file instead",
    );

  if (Array.isArray(contract.truth_files)) {
    const specsRoot = options.specsRoot ?? toolkit.specsRoot;
    const roots = [`${specsRoot}/${item.app}/ux/`, `${specsRoot}/_shared/ux/`];
    for (const truth of contract.truth_files)
      if (!roots.some((root) => truth.startsWith(root)))
        bad(
          `truth file ${truth} is not under ${roots[0]}; truth files are the app's living UX (A8)`,
        );
  }

  const ids = new Set<string>();
  for (const criterion of contract.criteria) {
    const at = `criterion ${criterion.id}`;
    if (ids.has(criterion.id)) bad(`${at} appears twice`);
    ids.add(criterion.id);
    if (criterion.evidence === "test" || criterion.evidence === "check") {
      if (!criterion.command)
        bad(`${at} (${criterion.evidence}) needs a command`);
      else {
        const problem = checkCommand(criterion.command);
        if (problem) bad(`${at}: ${problem}`);
      }
    }
    if (criterion.evidence === "capture" && !criterion.path)
      bad(`${at} (capture) needs the path its evidence will be written to`);
    if (criterion.evidence === "manual" && !criterion.reason)
      bad(`${at} (manual) needs a reason: why no script can prove it`);
    if (isReview(criterion) && criterion.evidence !== "manual")
      bad(`${at} is a review, so its evidence type is manual`);
  }
  if (contract.criteria.filter((c) => !isReview(c)).length === 0)
    bad("has no criteria; every ticket proves at least one thing");

  if (!options.started) return problems;

  // Reviewers are the operator's choice (PR-19). At Q3 each one reviews
  // through a criterion and a kept file; below Q3 the review happens in the
  // thread, and a review criterion exists only where one was asked for.
  const qa = qaOf(contract);
  const listed = new Set(contract.reviewers);
  for (const role of listed) {
    if (qa === "Q3" && !ids.has(`review:${role}`))
      bad(
        `is Q3 and lists the reviewer ${role} but has no review:${role} criterion; run yarn contract:add ${item.id} review:${role}`,
      );
    if (!findRoleFile(role))
      bad(
        `lists the reviewer ${role}, which has no role file under docs/roles/`,
      );
  }
  if (qa === "Q3" && listed.size === 0)
    bad(
      `is Q3 with no reviewer; name who reviews it: yarn contract:qa ${item.id} Q3 --reviewers <role,role>`,
    );
  for (const id of ids)
    if (id.startsWith("review:") && !listed.has(reviewRole(id)))
      bad(`has ${id} but does not list ${reviewRole(id)} under reviewers`);
  return problems;
}
