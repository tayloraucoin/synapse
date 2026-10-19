/**
 * PreToolUse guard for the Bash tool (E-16, E-32, E-33; A1, A4; the J0 results).
 *
 * Reads the hook input on stdin. Exit 0 lets the command run. Exit 2 blocks it,
 * and stderr tells the agent what to run instead. Exit 0 with a JSON
 * `permissionDecision: "ask"` on stdout asks the user first.
 *
 * Blocks: npm, npx and pnpm; any git push; a commit on main; a commit whose
 * message does not open with an admitted work-id; and a shell write to a
 * results.json under the specs root, or to an as-built.md that exists on main.
 * Database commands (D-STK-18): a reset or drop is blocked; a migrate, push,
 * seed, setup or local reset is answered with "ask", so it waits for Taylor.
 *
 * The command is tokenized, not prefix-matched: a deny rule on `git push *`
 * misses `git -C . push`, `sh -c 'git push'` and `/usr/bin/git push`. This
 * guard does not. It is still text analysis, so it is a first line and never a
 * boundary: a path held in a variable is invisible to it. The boundary for
 * results is the run record that check-specs verifies (A9).
 *
 * Imports only node built-ins and tooling/lib/work-ids.ts, so it starts fast. Fixtures:
 * tooling/hooks/fixtures/bash-guard.json, run by `yarn test:hooks`.
 */

import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { hasWorkId, readLayout, type Layout } from "../lib/work-ids.ts";

const ROOT =
  process.env.CLAUDE_PROJECT_DIR ??
  path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

/** Set only by the fixture runner, so cases do not depend on the checkout's state. */
type FixtureContext = {
  branch?: string;
  epicPrefixes?: string[];
  asBuiltOnMain?: string[];
  aliases?: Record<string, string>;
  protectedBranch?: string;
};
const fixture: FixtureContext | null = process.env.PEM_HOOK_FIXTURE_CONTEXT
  ? (JSON.parse(process.env.PEM_HOOK_FIXTURE_CONTEXT) as FixtureContext)
  : null;

/** A denial blocks the command; with `ask`, the command waits for Taylor's yes instead. */
type Denial = { rule: string; message: string; ask?: true };

// ---------------------------------------------------------------- layout

function readGuardLayout(): Layout {
  const layout = readLayout(ROOT, fixture?.epicPrefixes);
  return fixture?.protectedBranch
    ? { ...layout, protectedBranch: fixture.protectedBranch }
    : layout;
}

/**
 * A commit is judged by the layout of the repo it lands in: a worktree or
 * another checkout holds its own epics, which this checkout cannot see.
 */
function commitLayout(dir: string, fallback: Layout): Layout {
  if (fixture) return fallback;
  const top = git(dir, ["rev-parse", "--show-toplevel"]);
  return top && path.resolve(top) !== path.resolve(ROOT)
    ? readLayout(top)
    : fallback;
}

function git(cwd: string, args: string[]): string | null {
  try {
    return execFileSync("git", args, {
      cwd,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return null;
  }
}

const currentBranch = (cwd: string) =>
  fixture?.branch ?? git(cwd, ["rev-parse", "--abbrev-ref", "HEAD"]);

const aliasOf = (cwd: string, name: string) =>
  fixture
    ? (fixture.aliases?.[name] ?? null)
    : git(cwd, ["config", "--get", `alias.${name}`]);

function existsOnProtected(rel: string, layout: Layout): boolean {
  if (fixture) return (fixture.asBuiltOnMain ?? []).includes(rel);
  return (
    git(ROOT, ["cat-file", "-e", `${layout.protectedBranch}:${rel}`]) !== null
  );
}

function anyAsBuiltOnProtected(layout: Layout): boolean {
  if (fixture) return (fixture.asBuiltOnMain ?? []).length > 0;
  const listing = git(ROOT, [
    "ls-tree",
    "-r",
    "--name-only",
    layout.protectedBranch,
    layout.specsRoot,
  ]);
  return (listing ?? "")
    .split("\n")
    .some((file) => file.endsWith("/as-built.md"));
}

// ---------------------------------------------------------------- lexing

type Token =
  | { kind: "word"; value: string }
  | { kind: "separator" }
  | { kind: "redirect"; writes: boolean; needsTarget: boolean };

type Lexed = { tokens: Token[]; nested: string[] };

const HEREDOC_MARK = "\u0001HEREDOC";

/** Pulls heredoc bodies out of the text, leaving a marker word where each began. */
function extractHeredocs(command: string): {
  text: string;
  bodies: { body: string; expands: boolean }[];
} {
  const bodies: { body: string; expands: boolean }[] = [];
  const lines = command.split("\n");
  const out: string[] = [];
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i]!;
    const starts = [
      ...line.matchAll(/(?<!<)<<(?!<)-?\s*(['"]?)([A-Za-z_][A-Za-z0-9_]*)\1/g),
    ];
    const pending: { delimiter: string; expands: boolean; text: string }[] = [];
    for (const start of starts) {
      const delimiter = start[2]!;
      const closes = lines
        .slice(i + 1)
        .some((later) => later.trim() === delimiter);
      if (closes)
        pending.push({ delimiter, expands: start[1] === "", text: start[0] });
    }
    for (const item of pending)
      line = line.replace(
        item.text,
        ` ${HEREDOC_MARK}${bodies.length + pending.indexOf(item)} `,
      );
    out.push(line);
    for (const item of pending) {
      const body: string[] = [];
      while (++i < lines.length && lines[i]!.trim() !== item.delimiter)
        body.push(lines[i]!);
      bodies.push({ body: body.join("\n"), expands: item.expands });
    }
  }
  return { text: out.join("\n"), bodies };
}

/** The text between an opening `(` at `open` and its matching `)`. */
function matchParen(input: string, open: number): number {
  let depth = 0;
  let quote: string | null = null;
  for (let i = open; i < input.length; i++) {
    const c = input[i]!;
    if (quote) {
      if (c === "\\" && quote === '"') i++;
      else if (c === quote) quote = null;
    } else if (c === "'" || c === '"') quote = c;
    else if (c === "\\") i++;
    else if (c === "(") depth++;
    else if (c === ")" && --depth === 0) return i;
  }
  throw new Error("unbalanced parenthesis");
}

/** Every `$(…)` and backtick body in a text that the shell would expand. */
function substitutions(text: string): string[] {
  const found: string[] = [];
  for (let i = 0; i < text.length; i++) {
    const c = text[i]!;
    if (c === "\\") i++;
    else if (c === "$" && text[i + 1] === "(") {
      const close = matchParen(text, i + 1);
      found.push(text.slice(i + 2, close));
      i = close;
    } else if (c === "`") {
      const close = text.indexOf("`", i + 1);
      if (close === -1) throw new Error("unbalanced backtick");
      found.push(text.slice(i + 1, close));
      i = close;
    }
  }
  return found;
}

function lex(input: string): Lexed {
  const tokens: Token[] = [];
  const nested: string[] = [];
  let word: string | null = null;
  const push = () => {
    if (word !== null) tokens.push({ kind: "word", value: word });
    word = null;
  };
  const add = (text: string) => (word = (word ?? "") + text);

  for (let i = 0; i < input.length; i++) {
    const c = input[i]!;
    const next = input[i + 1];

    if (c === "\\") {
      if (next === "\n") i++;
      else if (next !== undefined) add(input[++i]!);
      continue;
    }
    if (c === "'") {
      const close = input.indexOf("'", i + 1);
      if (close === -1) throw new Error("unbalanced quote");
      add(input.slice(i + 1, close));
      i = close;
      continue;
    }
    if (c === '"') {
      let j = i + 1;
      let text = "";
      for (; j < input.length && input[j] !== '"'; j++) {
        if (input[j] === "\\" && j + 1 < input.length) text += input[++j];
        else if (input[j] === "$" && input[j + 1] === "(") {
          const close = matchParen(input, j + 1);
          nested.push(input.slice(j + 2, close));
          text += "$()";
          j = close;
        } else if (input[j] === "`") {
          const close = input.indexOf("`", j + 1);
          if (close === -1) throw new Error("unbalanced backtick");
          nested.push(input.slice(j + 1, close));
          text += "$()";
          j = close;
        } else text += input[j];
      }
      if (j >= input.length) throw new Error("unbalanced quote");
      add(text);
      i = j;
      continue;
    }
    if ((c === "$" || c === "<" || c === ">") && next === "(") {
      const close = matchParen(input, i + 1);
      nested.push(input.slice(i + 2, close));
      add("$()");
      i = close;
      continue;
    }
    if (c === "`") {
      const close = input.indexOf("`", i + 1);
      if (close === -1) throw new Error("unbalanced backtick");
      nested.push(input.slice(i + 1, close));
      add("$()");
      i = close;
      continue;
    }
    if (c === "#" && word === null) {
      const end = input.indexOf("\n", i);
      i = end === -1 ? input.length : end - 1;
      continue;
    }
    if (c === " " || c === "\t") {
      push();
      continue;
    }
    if (c === "\n" || c === ";" || c === "(" || c === ")") {
      push();
      tokens.push({ kind: "separator" });
      continue;
    }
    if (c === "|") {
      push();
      tokens.push({ kind: "separator" });
      if (next === "|" || next === "&") i++;
      continue;
    }
    if (c === "&") {
      if (next === ">") {
        // &> and &>> write both streams to a file.
        push();
        i += input[i + 2] === ">" ? 2 : 1;
        tokens.push({ kind: "redirect", writes: true, needsTarget: true });
        continue;
      }
      push();
      tokens.push({ kind: "separator" });
      if (next === "&") i++;
      continue;
    }
    if (c === ">" || c === "<") {
      // A bare number before a redirect is its file descriptor, not a word.
      if (word !== null && /^\d+$/.test(word)) word = null;
      push();
      let op = c;
      while (
        (input[i + 1] === ">" ||
          input[i + 1] === "<" ||
          input[i + 1] === "|") &&
        op.length < 3
      )
        op += input[++i];
      if (input[i + 1] === "&") {
        i++;
        const rest = input.slice(i + 1).match(/^(\d+|-)/);
        if (rest) {
          // 2>&1 and >&- duplicate or close a descriptor; no file is written.
          i += rest[0].length;
          continue;
        }
      }
      tokens.push({
        kind: "redirect",
        writes: op.startsWith(">"),
        needsTarget: true,
      });
      continue;
    }
    add(c);
  }
  push();
  return { tokens, nested };
}

// ---------------------------------------------------------------- segments

type Segment = { words: string[]; writes: string[]; heredocs: number[] };

function toSegments(tokens: Token[]): Segment[] {
  const segments: Segment[] = [];
  let current: Segment = { words: [], writes: [], heredocs: [] };
  const close = () => {
    if (current.words.length > 0 || current.writes.length > 0)
      segments.push(current);
    current = { words: [], writes: [], heredocs: [] };
  };
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i]!;
    if (token.kind === "separator") close();
    else if (token.kind === "redirect") {
      const target = tokens[i + 1];
      if (target?.kind === "word") {
        if (token.writes) current.writes.push(target.value);
        i++;
      }
    } else if (token.value.startsWith(HEREDOC_MARK))
      current.heredocs.push(Number(token.value.slice(HEREDOC_MARK.length)));
    else current.words.push(token.value);
  }
  close();
  return segments;
}

const KEYWORDS = new Set([
  "if",
  "then",
  "else",
  "elif",
  "do",
  "while",
  "until",
  "!",
  "{",
  "}",
  "time",
]);
/** Wrappers that run another program, with the flags of theirs that take a value. */
const WRAPPERS: Record<string, string[]> = {
  sudo: ["-u", "-g", "-h", "-p", "-C", "-D", "-R", "-T", "-U"],
  env: ["-u", "-C", "-S"],
  nice: ["-n"],
  timeout: ["-s", "-k"],
  xargs: ["-I", "-n", "-P", "-L", "-d", "-E", "-s", "-a"],
  nohup: [],
  command: [],
  exec: ["-a"],
  builtin: [],
  stdbuf: ["-i", "-o", "-e"],
};
const SHELLS = new Set(["bash", "sh", "zsh", "dash", "ksh", "fish"]);

/** Drops keywords, variable assignments and wrappers to reach the program that runs. */
function unwrap(words: string[]): string[] {
  const rest = [...words];
  while (rest.length > 0) {
    const first = rest[0]!;
    const name = path.posix.basename(first);
    if (KEYWORDS.has(first) || /^[A-Za-z_][A-Za-z0-9_]*=/.test(first)) {
      rest.shift();
    } else if (name in WRAPPERS) {
      rest.shift();
      const valued = WRAPPERS[name]!;
      while (
        rest.length > 0 &&
        (rest[0]!.startsWith("-") || /^[A-Za-z_]\w*=/.test(rest[0]!))
      ) {
        const flag = rest.shift()!;
        if (valued.includes(flag)) rest.shift();
      }
      if (name === "timeout") rest.shift();
    } else break;
  }
  return rest;
}

// ---------------------------------------------------------------- rules

const isFlag = (arg: string) => arg.startsWith("-") && arg !== "-";

function packageManager(program: string, args: string[]): Denial | null {
  if (!["npm", "npx", "pnpm", "pnpx"].includes(program)) return null;
  const [sub, ...rest] = args.filter((arg) => !isFlag(arg));
  let instead = `yarn ${args.join(" ")}`.trim();
  if (
    program === "npx" ||
    program === "pnpx" ||
    sub === "exec" ||
    sub === "dlx"
  )
    instead = `yarn ${(program.endsWith("x") ? args : rest).join(" ")} (a local binary), or yarn dlx <package> (asks first)`;
  else if (sub === "run" || sub === "run-script")
    instead = `yarn ${rest.join(" ")}`;
  else if (["install", "i", "add", "ci"].includes(sub ?? ""))
    instead = rest.length > 0 ? `yarn add ${rest.join(" ")}` : "yarn install";
  return {
    rule: "package-manager",
    message: `This repo uses Yarn 4; ${program} is blocked. Run: ${instead}`,
  };
}

/**
 * Git ignores an alias that shares a built-in command's name, so these can
 * never be an alias for push. Skipping the alias lookup for them saves a spawn.
 */
const GIT_BUILTINS = new Set(
  (
    "add apply blame branch cat-file checkout cherry-pick clean clone config describe diff " +
    "fetch grep init log ls-files ls-tree merge mv pull rebase reflog remote reset restore " +
    "rev-parse revert rm show stash status switch tag worktree"
  ).split(" "),
);

/** Git's own options that take a separate value, skipped to reach the subcommand. */
const GIT_VALUED = [
  "-C",
  "-c",
  "--git-dir",
  "--work-tree",
  "--namespace",
  "--super-prefix",
  "--config-env",
];

function parseGit(args: string[]) {
  let dir: string | null = null;
  let inlineAlias = false;
  let i = 0;
  for (; i < args.length; i++) {
    const arg = args[i]!;
    if (GIT_VALUED.includes(arg)) {
      const value = args[++i] ?? "";
      if (arg === "-C") dir = dir ? path.join(dir, value) : value;
      if (arg === "-c" && /^alias\./i.test(value)) inlineAlias = true;
    } else if (!isFlag(arg)) break;
    else if (/^--config-env=alias\./i.test(arg)) inlineAlias = true;
  }
  return { dir, inlineAlias, sub: args[i] ?? null, rest: args.slice(i + 1) };
}

type Message =
  | { kind: "text"; subject: string }
  | { kind: "reused" }
  | { kind: "editor" }
  | { kind: "unreadable" };

function commitMessage(
  rest: string[],
  heredoc: string | undefined,
  cwd: string,
): Message {
  let reused = false;
  for (let i = 0; i < rest.length; i++) {
    const arg = rest[i]!;
    if (arg === "--") break;
    const subject = (text: string): Message => ({
      kind: "text",
      subject: text.trimStart().split("\n")[0] ?? "",
    });
    if (arg === "--message") return subject(rest[i + 1] ?? "");
    if (arg.startsWith("--message=")) return subject(arg.slice(10));
    if (
      arg === "--file" ||
      arg.startsWith("--file=") ||
      /^-[a-zA-Z]*F$/.test(arg) ||
      /^-F./.test(arg)
    ) {
      const file = arg.startsWith("--file=")
        ? arg.slice(7)
        : /^-F./.test(arg)
          ? arg.slice(2)
          : (rest[i + 1] ?? "");
      if (file === "-")
        return heredoc === undefined
          ? { kind: "unreadable" }
          : subject(heredoc);
      try {
        return subject(readFileSync(path.resolve(cwd, file), "utf8"));
      } catch {
        return { kind: "unreadable" };
      }
    }
    if (/^-[a-zA-Z]*m$/.test(arg)) return subject(rest[i + 1] ?? "");
    if (/^-m./.test(arg)) return subject(arg.slice(2));
    if (
      arg === "--no-edit" ||
      arg === "-C" ||
      arg.startsWith("--reuse-message") ||
      arg.startsWith("--fixup") ||
      arg.startsWith("--squash")
    )
      reused = true;
  }
  return reused ? { kind: "reused" } : { kind: "editor" };
}

function gitRules(
  args: string[],
  segment: Segment,
  cwd: string,
  layout: Layout,
  heredocs: string[],
): Denial | null {
  const parsed = parseGit(args);
  const dir = parsed.dir ? path.resolve(cwd, parsed.dir) : cwd;
  if (parsed.inlineAlias)
    return {
      rule: "push",
      message:
        "An inline git alias hides the subcommand, so it is blocked. Run the git subcommand under its own name.",
    };
  let sub = parsed.sub;
  if (sub && sub !== "push" && sub !== "commit" && !GIT_BUILTINS.has(sub)) {
    const alias = aliasOf(dir, sub);
    if (alias) sub = alias.replace(/^!\s*git\s+/, "").split(/\s+/)[0] ?? sub;
  }
  if (sub === "push")
    return {
      rule: "push",
      message:
        "Agents never push (ruling (e)); no command replaces it. Stop, and report the branch name: Taylor pushes and merges.",
    };
  if (sub !== "commit") return null;

  layout = commitLayout(dir, layout);
  if (currentBranch(dir) === layout.protectedBranch)
    return {
      rule: "commit-on-main",
      message: `Agents do not commit on ${layout.protectedBranch}. Run: git switch -c ${layout.branchPattern.replace("{id}", "<work-id>")}   then commit there. Your staged changes come with you.`,
    };

  const message = commitMessage(
    parsed.rest,
    heredocs[segment.heredocs[0] ?? -1],
    dir,
  );
  if (message.kind === "reused") return null;
  const example = `git commit -m "${layout.prefixes[0] ?? "PEM"}: <outcome>"`;
  if (message.kind === "editor")
    return {
      rule: "commit-work-id",
      message: `This commit would open an editor. Pass the message on the command line: ${example}`,
    };
  if (message.kind === "unreadable")
    return {
      rule: "commit-work-id",
      message: `The guard cannot read this commit's message. Pass it with -m, or with -F - and a heredoc: ${example}`,
    };
  if (!layout.readable)
    return {
      rule: "commit-work-id",
      message:
        "toolkit.json is missing or unreadable, so no work-id can be checked. Run: yarn doctor",
    };
  if (hasWorkId(message.subject, layout.prefixes)) return null;
  return {
    rule: "commit-work-id",
    message:
      `The commit message must open with a work-id, as in ${example} or "WEB-41: <outcome>". ` +
      `Admitted prefixes: ${[...new Set(layout.prefixes)].join(", ")}.`,
  };
}

const HAS_GLOB = /[*?[{]/;
const globToRegExp = (glob: string) =>
  new RegExp(
    `^${glob
      .replace(/[.+^$()|\\]/g, "\\$&")
      .replace(/\*+/g, ".*")
      .replace(/\?/g, ".")}$`,
  );

/** "results", "review", "as-built", or null: what a shell write to this path would overwrite. */
function protectedFile(
  target: string,
  cwd: string,
  layout: Layout,
): "results" | "review" | "as-built" | null {
  if (target.includes("$")) return null;
  const rel = path
    .relative(ROOT, path.resolve(cwd, target))
    .split(path.sep)
    .join("/");
  if (rel.startsWith("..")) return null;
  const first = rel.split("/")[0]!;
  const inSpecs =
    rel.startsWith(`${layout.specsRoot}/`) ||
    (HAS_GLOB.test(first) && globToRegExp(first).test(layout.specsRoot));
  if (!inSpecs) return null;
  const base = path.posix.basename(rel);
  const matches = (name: string) =>
    HAS_GLOB.test(base) ? globToRegExp(base).test(name) : base === name;
  if (matches("results.json")) return "results";
  // Written by review:run: a review in a ticket folder, and an epic's pre-flight.
  if (
    /^review-[a-z*?]+\.md$/.test(base) ||
    (matches("_preflight.md") && rel.includes("/tickets/"))
  )
    return "review";
  if (matches("as-built.md"))
    return (
      HAS_GLOB.test(rel)
        ? anyAsBuiltOnProtected(layout)
        : existsOnProtected(rel, layout)
    )
      ? "as-built"
      : null;
  return null;
}

/** The paths a segment would write to through the shell. */
function shellWrites(
  program: string,
  args: string[],
  segment: Segment,
): string[] {
  const targets = [...segment.writes];
  const plain = args.filter((arg) => !isFlag(arg));
  const into = (destination: string, sources: string[]) => [
    destination,
    ...sources.map((source) =>
      path.posix.join(destination, path.posix.basename(source)),
    ),
  ];
  if (program === "tee" || program === "truncate") targets.push(...plain);
  else if (program === "sed" || program === "gsed") {
    if (
      args.some(
        (arg) => /^-[a-zA-Z]*i/.test(arg) || arg.startsWith("--in-place"),
      )
    )
      targets.push(...plain);
  } else if (program === "cp" || program === "mv" || program === "install") {
    const flagged = args
      .find((arg) => arg.startsWith("--target-directory="))
      ?.slice(19);
    const t = args.indexOf("-t");
    const destination = flagged ?? (t !== -1 ? args[t + 1] : plain.at(-1));
    const sources = plain.filter((arg) => arg !== destination);
    if (destination) targets.push(...into(destination, sources));
    // Moving a protected file away destroys it as surely as overwriting it.
    if (program === "mv") targets.push(...sources);
  } else if (program === "dd") {
    for (const arg of args)
      if (arg.startsWith("of=")) targets.push(arg.slice(3));
  }
  return targets;
}

function writeRules(
  program: string,
  args: string[],
  segment: Segment,
  cwd: string,
  layout: Layout,
): Denial | null {
  for (const target of shellWrites(program, args, segment)) {
    const kind = protectedFile(target, cwd, layout);
    if (kind === "results")
      return {
        rule: "results-write",
        message:
          "results.json is written only by tooling, so the builder cannot grade itself. " +
          "Run: yarn contract:run <id>   or   yarn contract:record <id> <criterion> --evidence <path>",
      };
    if (kind === "review")
      return {
        rule: "review-write",
        message:
          "Reviews and the pre-flight are written only by their run. " +
          "Run: yarn review:run <role> <id>   or, for the Tickets gate, yarn review:run vigil <EPIC>",
      };
    if (kind === "as-built")
      return {
        rule: "as-built-write",
        message:
          `This as-built.md is on ${layout.protectedBranch} and immutable. To set applied:, edit that one field with the Edit tool. ` +
          "A new result goes through yarn contract:run or yarn contract:record on a new item.",
      };
  }
  return null;
}

// ---------------------------------------------------------------- database (D-STK-18)

/** Programs that run a package script named in their arguments. */
const SCRIPT_RUNNERS = new Set(["yarn", "turbo", "bun"]);
/** A script name, bare or as a turbo task (`@pem/db#db:migrate`). */
const DESTROY_SCRIPT = /^(?:\S*#)?db:(?:reset|drop)/;
const CHANGE_SCRIPT = /^(?:\S*#)?db:(?:migrate|push|seed|setup|local:reset)/;
/** The db package's scripts that change a database, run by path rather than by name. */
const CHANGE_FILE =
  /(?:^|\/)scripts\/(?:migrate|setup|setup-local|seed-users|reset-local-db)\.ts$/;
const SQL_CLIENTS = new Set(["psql", "pgcli", "usql"]);
const DROP_SQL = /\bdrop\s+(?:schema|database)\b/i;

const DESTROY: Denial = {
  rule: "db-destroy",
  message:
    "Agents never reset or drop a database (D-STK-18). Write the change as a migration and stop for Taylor; " +
    "for the local database only, yarn db:local:reset rebuilds it (it asks first).",
};
const CHANGE: Denial = {
  rule: "db-change",
  ask: true,
  message:
    "This changes a database (D-STK-18). Agents write the migration or SQL and stop; approve only a run you asked for.",
};

/** The words after `name` (a program, anywhere in the segment), flags dropped. */
function subcommandAfter(words: string[], name: string): string[] | null {
  const at = words.findIndex((word) => path.posix.basename(word) === name);
  return at === -1 ? null : words.slice(at + 1).filter((arg) => !isFlag(arg));
}

function databaseRules(
  program: string,
  args: string[],
  segment: Segment,
  heredocs: string[],
): Denial | null {
  const words = [program, ...args];
  if (program === "dropdb") return DESTROY;
  if (words.some((word) => SQL_CLIENTS.has(path.posix.basename(word)))) {
    const sql = [...args, ...segment.heredocs.map((i) => heredocs[i] ?? "")];
    if (sql.some((text) => DROP_SQL.test(text))) return DESTROY;
  }

  const drizzle = subcommandAfter(words, "drizzle-kit");
  if (drizzle?.[0] === "drop") return DESTROY;
  const supabase = subcommandAfter(words, "supabase");
  if (supabase?.[0] === "db" && supabase[1] === "reset") return DESTROY;

  const scripts = SCRIPT_RUNNERS.has(program) ? args : [];
  if (scripts.some((arg) => DESTROY_SCRIPT.test(arg))) return DESTROY;

  if (
    scripts.some((arg) => CHANGE_SCRIPT.test(arg)) ||
    ["migrate", "push"].includes(drizzle?.[0] ?? "") ||
    (supabase?.[0] === "db" && supabase[1] === "push") ||
    (supabase?.[0] === "migration" && supabase[1] === "up") ||
    (["node", "tsx", "bun", "deno"].includes(program) &&
      args.some((arg) => CHANGE_FILE.test(arg)))
  )
    return CHANGE;
  return null;
}

// ---------------------------------------------------------------- evaluate

function evaluate(
  command: string,
  cwd: string,
  layout: Layout,
  depth = 0,
): Denial | null {
  if (depth > 6) return null;
  const { text, bodies } = extractHeredocs(command);
  const { tokens, nested } = lex(text);
  const heredocs = bodies.map((entry) => entry.body);
  for (const entry of bodies)
    if (entry.expands) nested.push(...substitutions(entry.body));

  // A deny anywhere wins; an ask is held until nothing in the command denies.
  let ask: Denial | null = null;
  const weigh = (denial: Denial | null) => {
    if (denial?.ask) ask ??= denial;
    return denial && !denial.ask ? denial : null;
  };

  for (const inner of nested) {
    const denial = weigh(evaluate(inner, cwd, layout, depth + 1));
    if (denial) return denial;
  }
  for (const segment of toSegments(tokens)) {
    const words = unwrap(segment.words);
    const program = path.posix.basename(words[0] ?? "");
    const args = words.slice(1);

    if (SHELLS.has(program)) {
      const flag = args.findIndex((arg) => /^-[a-zA-Z]*c$/.test(arg));
      const script = flag === -1 ? null : args[flag + 1];
      if (script) {
        const denial = weigh(evaluate(script, cwd, layout, depth + 1));
        if (denial) return denial;
      }
    } else if (program === "eval") {
      const denial = weigh(evaluate(args.join(" "), cwd, layout, depth + 1));
      if (denial) return denial;
    }

    const denial = weigh(
      packageManager(program, args) ??
        (program === "git"
          ? gitRules(args, segment, cwd, layout, heredocs)
          : null) ??
        writeRules(program, args, segment, cwd, layout) ??
        databaseRules(program, args, segment, heredocs),
    );
    if (denial) return denial;
  }
  return ask;
}

/** When the command cannot be tokenized, refuse what plainly looks like a blocked action. */
function fallback(command: string): Denial | null {
  const message = (what: string) =>
    `The guard could not parse this command, and it appears to ${what}. Rewrite it as simple commands joined by &&.`;
  if (/(^|[\s;&|(])(npm|npx|pnpm)\s/.test(command))
    return {
      rule: "package-manager",
      message: message("call npm, npx or pnpm; use yarn"),
    };
  if (/\bgit\b[^\n;&|]*\bpush\b/.test(command))
    return { rule: "push", message: message("push; agents never push") };
  if (
    /results\.json|as-built\.md/.test(command) &&
    /(>|\btee\b|\bsed\b|\bcp\b|\bmv\b|\btruncate\b)/.test(command)
  )
    return {
      rule: "results-write",
      message: message(
        "write a results or as-built file; use yarn contract:run",
      ),
    };
  if (
    /db:(reset|drop)|drizzle-kit\s+drop|supabase\s+db\s+reset|\bdropdb\b|drop\s+(schema|database)/i.test(
      command,
    )
  )
    return { ...DESTROY, message: message("reset or drop a database") };
  return null;
}

// ---------------------------------------------------------------- main

let input: {
  tool_name?: string;
  tool_input?: { command?: unknown };
  cwd?: string;
};
try {
  input = JSON.parse(readFileSync(0, "utf8"));
} catch {
  process.exit(0);
}
const command = input.tool_input?.command;
if (input.tool_name !== "Bash" || typeof command !== "string") process.exit(0);

const cwd = input.cwd ?? ROOT;
let denial: Denial | null;
try {
  denial = evaluate(command, cwd, readGuardLayout());
} catch {
  denial = fallback(command);
}
if (denial?.ask) {
  // Exit 0 with this JSON makes Claude Code ask the user, showing the reason
  // (PreToolUse hookSpecificOutput; code.claude.com/docs/en/hooks, 2026-10-04).
  console.log(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: "ask",
        permissionDecisionReason: `bash-guard [${denial.rule}]: ${denial.message}`,
      },
    }),
  );
} else if (denial) {
  console.error(`bash-guard [${denial.rule}]: ${denial.message}`);
  process.exit(2);
}
process.exit(0);
