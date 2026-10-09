#!/usr/bin/env node
/**
 * `yarn check-migrations` (in `yarn verify`, after build): fails before anyone
 * can apply a migration that acts on Supabase's `auth` schema, or one that
 * breaks the append-only rule. Modelled on the toolkit's
 * packages/db/scripts/check-migrations.ts.
 *
 * The auth rule reads every statement of every migration, never a file name.
 * Supabase owns `auth`; a migration may point a foreign key at `auth.users`
 * and call `auth.uid()`, `auth.role()`, `auth.jwt()` or `auth.email()`, and
 * nothing else. The one exception is the guarded stub `0000` carries (see
 * packages/db/AGENTS.md): a DO block whose whole body is "if auth.users does
 * not exist, create the schema and a stub table". On Supabase it is a no-op;
 * even if its condition lied, its body can only no-op or abort. The unguarded
 * form `drizzle-kit generate` re-emits (`CREATE SCHEMA "auth"`, then
 * `CREATE TABLE "auth"."users"`) fails.
 *
 * The append-only rule reads `meta/_journal.json` and the lock file in the
 * migrations folder (`migrations.lock.json`, where the folder's reviewer glob
 * reaches it), which records each migration's journal entry and the sha256 of
 * its SQL. A recorded migration that changed,
 * moved or went missing fails, and so does one not recorded yet:
 * `yarn check-migrations --record` appends the new entries once the SQL is
 * final, and never rewrites one already there.
 *
 * What a lexical check cannot see: SQL that a DO block builds at run time from
 * pieces that never spell `auth` (a name read from the catalogue, say). Dynamic
 * EXECUTE is flagged whenever it concatenates, escapes or names auth at all;
 * past that, the human who reads the SQL before `db:migrate` is the door.
 */
import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

export type Statement = { number: number; line: number; text: string };

export type Finding = {
  file: string;
  rule: string;
  message: string;
  statement?: number;
  line?: number;
};

export type LockEntry = {
  idx: number;
  tag: string;
  when: number;
  sha256: string;
};

type JournalEntry = { idx: number; tag: string; when: number };

const IDENT_CHAR = /[A-Za-z0-9_$\u0080-\uFFFF]/;

/**
 * Cuts SQL into top-level statements on `;`, the way Postgres reads it:
 * single-quoted strings (with `''` and, for `E'…'`, backslash escapes),
 * double-quoted identifiers, `$tag$…$tag$` bodies and nested block comments
 * are kept whole; comments outside them become a space. Drizzle's
 * `--> statement-breakpoint` is a comment. Anything left unterminated at the
 * end is reported, never guessed at.
 */
export function splitStatements(sql: string): {
  statements: Statement[];
  unterminated?: { line: number; what: string };
} {
  const statements: Statement[] = [];
  let current = "";
  let startLine = 1;
  let line = 1;
  let i = 0;

  const push = () => {
    const text = current.replace(/\s+/g, " ").trim();
    if (text !== "") {
      statements.push({ number: statements.length + 1, line: startLine, text });
    }
    current = "";
  };
  const advance = (count: number) => {
    const piece = sql.slice(i, i + count);
    for (const ch of piece) if (ch === "\n") line += 1;
    i += count;
    return piece;
  };

  while (i < sql.length) {
    if (current.trim() === "") startLine = line;
    const ch = sql[i] as string;
    const next = sql[i + 1];

    if (ch === "-" && next === "-") {
      const end = sql.indexOf("\n", i);
      advance((end === -1 ? sql.length : end) - i);
      current += " ";
      continue;
    }
    if (ch === "/" && next === "*") {
      const from = line;
      let depth = 0;
      let j = i;
      while (j < sql.length) {
        if (sql[j] === "/" && sql[j + 1] === "*") {
          depth += 1;
          j += 2;
        } else if (sql[j] === "*" && sql[j + 1] === "/") {
          depth -= 1;
          j += 2;
          if (depth === 0) break;
        } else j += 1;
      }
      if (depth !== 0) {
        return { statements, unterminated: { line: from, what: "comment" } };
      }
      advance(j - i);
      current += " ";
      continue;
    }
    if (ch === "'") {
      const from = line;
      const prev = sql[i - 1] ?? "";
      const escapes = /[eE]/.test(prev) && !IDENT_CHAR.test(sql[i - 2] ?? "");
      let j = i + 1;
      let closed = false;
      while (j < sql.length) {
        if (escapes && sql[j] === "\\") j += 2;
        else if (sql[j] === "'" && sql[j + 1] === "'") j += 2;
        else if (sql[j] === "'") {
          closed = true;
          j += 1;
          break;
        } else j += 1;
      }
      if (!closed) {
        return { statements, unterminated: { line: from, what: "string" } };
      }
      current += advance(j - i);
      continue;
    }
    if (ch === '"') {
      const from = line;
      let j = i + 1;
      let closed = false;
      while (j < sql.length) {
        if (sql[j] === '"' && sql[j + 1] === '"') j += 2;
        else if (sql[j] === '"') {
          closed = true;
          j += 1;
          break;
        } else j += 1;
      }
      if (!closed) {
        return { statements, unterminated: { line: from, what: "identifier" } };
      }
      current += advance(j - i);
      continue;
    }
    if (ch === "$" && !IDENT_CHAR.test(sql[i - 1] ?? "")) {
      const tag =
        /^\$(?:[A-Za-z_\u0080-\uFFFF][A-Za-z0-9_\u0080-\uFFFF]*)?\$/.exec(
          sql.slice(i),
        )?.[0];
      if (tag) {
        const from = line;
        const end = sql.indexOf(tag, i + tag.length);
        if (end === -1) {
          return {
            statements,
            unterminated: { line: from, what: `${tag} body` },
          };
        }
        current += advance(end + tag.length - i);
        continue;
      }
    }
    if (ch === ";") {
      advance(1);
      push();
      continue;
    }
    current += advance(1);
  }
  push();
  return { statements };
}

/** `auth` as Postgres would read it: bare in any case, or quoted exactly. */
const AUTH = String.raw`(?:"auth"(?!")|(?<![A-Za-z0-9_$"])auth(?![A-Za-z0-9_$"]))`;
const IDENT = String.raw`(?:"(?:[^"]|"")*"|[A-Za-z_][A-Za-z0-9_$]*)`;

const RULES: { rule: string; message: string; test: (s: string) => boolean }[] =
  [
    {
      rule: "auth-schema",
      message:
        "names the auth schema (create, alter, drop, grant on, set schema, in schema)",
      test: (s) =>
        new RegExp(
          String.raw`\bschema\s+(?:if\s+(?:not\s+)?exists\s+)?(?:${IDENT}\s*,\s*)*${AUTH}`,
          "i",
        ).test(s) ||
        new RegExp(
          String.raw`\bschema\s+(?:if\s+not\s+exists\s+)?authorization\s+${AUTH}`,
          "i",
        ).test(s) ||
        new RegExp(String.raw`\brename\s+to\s+${AUTH}`, "i").test(s),
    },
    {
      rule: "auth-routine",
      message:
        "defines, alters, drops, grants, comments or triggers a routine in auth",
      test: (s) =>
        new RegExp(
          String.raw`\b(?:function|procedure|routine|call)\s+(?:if\s+exists\s+)?${AUTH}\s*\.`,
          "i",
        ).test(s),
    },
    {
      rule: "auth-object",
      message:
        "acts on an object in auth; only REFERENCES auth.users and auth.uid(), role(), jwt(), email() are allowed",
      test: (s) => {
        const rest = s
          .replace(
            new RegExp(
              String.raw`\breferences\s+${AUTH}\s*\.\s*(?:"users"(?!")|users\b)`,
              "gi",
            ),
            " ",
          )
          .replace(
            new RegExp(
              String.raw`${AUTH}\s*\.\s*(?:"(?:uid|role|jwt|email)"|(?:uid|role|jwt|email)\b)\s*\(\s*\)`,
              "gi",
            ),
            " ",
          );
        return new RegExp(String.raw`${AUTH}\s*\.`, "i").test(rest);
      },
    },
    {
      rule: "search-path",
      message:
        "sets a search_path, which can point unqualified names at auth; name each object's schema instead",
      test: (s) => /search_path/i.test(s),
    },
    {
      rule: "unicode-escape",
      message:
        "uses a U& escaped identifier or string, which can spell auth unseen",
      test: (s) => /\bU&["']/i.test(s),
    },
    {
      rule: "dynamic-sql",
      message:
        "runs dynamic SQL that names auth, concatenates, escapes or reads the schema catalogue",
      test: (s) =>
        /\bexecute\b(?!\s+(?:function|procedure)\b)/i.test(s) &&
        (new RegExp(AUTH, "i").test(s) ||
          /\|\||\\|\bchr\s*\(|\bU&|pg_namespace|regnamespace|\bschemata\b/i.test(
            s,
          )),
    },
  ];

/**
 * The guarded stub, exactly: a DO block whose body is one IF NOT EXISTS on
 * information_schema.tables for auth.users, then CREATE SCHEMA IF NOT EXISTS
 * auth and CREATE TABLE auth.users with a plain column list, and nothing else.
 */
export function isGuardedAuthStub(statement: string): boolean {
  const spaced = statement
    .replace(/\s*([(),;=])\s*/g, " $1 ")
    .replace(/\s+/g, " ")
    .trim();
  const match = new RegExp(
    String.raw`^DO \$([A-Za-z_]*)\$ BEGIN IF NOT EXISTS \( SELECT 1 FROM information_schema\.tables WHERE table_schema = '([^']*)' AND table_name = '([^']*)' \) THEN CREATE SCHEMA IF NOT EXISTS ${AUTH} ; CREATE TABLE ${AUTH}\.(?:"users"|users) \( ((?:[^;$'()]|\( [0-9 ,]* \))+) \) ; END IF ; END(?: ;)? \$\1\$$`,
    "i",
  ).exec(spaced);
  return match !== null && match[2] === "auth" && match[3] === "users";
}

/** Every auth finding in one migration's SQL. */
export function findAuthDdl(file: string, sql: string): Finding[] {
  const { statements, unterminated } = splitStatements(sql);
  const findings: Finding[] = [];
  for (const statement of statements) {
    if (isGuardedAuthStub(statement.text)) continue;
    for (const { rule, message, test } of RULES) {
      if (test(statement.text)) {
        findings.push({
          file,
          rule,
          statement: statement.number,
          line: statement.line,
          message: `${message}: ${statement.text.slice(0, 160)}`,
        });
      }
    }
  }
  if (unterminated) {
    findings.push({
      file,
      rule: "unterminated",
      line: unterminated.line,
      message: `an unterminated ${unterminated.what} runs to the end of the file; nothing after it was read`,
    });
  }
  return findings;
}

export function sha256(text: string | Buffer): string {
  return createHash("sha256").update(text).digest("hex");
}

function readJournal(dir: string): {
  entries?: JournalEntry[];
  finding?: Finding;
} {
  const file = path.join(dir, "meta", "_journal.json");
  if (!existsSync(file)) {
    return {
      finding: {
        file: "meta/_journal.json",
        rule: "journal",
        message: "is missing",
      },
    };
  }
  try {
    const parsed = JSON.parse(readFileSync(file, "utf8")) as {
      entries?: JournalEntry[];
    };
    if (!Array.isArray(parsed.entries)) throw new Error("no entries array");
    return { entries: parsed.entries };
  } catch (error) {
    return {
      finding: {
        file: "meta/_journal.json",
        rule: "journal",
        message: `cannot be read: ${(error as Error).message}`,
      },
    };
  }
}

function readLock(lockPath: string): {
  entries: LockEntry[];
  finding?: Finding;
} {
  const file = path.basename(lockPath);
  if (!existsSync(lockPath)) {
    return {
      entries: [],
      finding: {
        file,
        rule: "lock",
        message: "is missing; nothing is recorded as applied-safe",
      },
    };
  }
  try {
    const parsed = JSON.parse(readFileSync(lockPath, "utf8")) as {
      migrations?: LockEntry[];
    };
    if (!Array.isArray(parsed.migrations))
      throw new Error("no migrations array");
    return { entries: parsed.migrations };
  } catch (error) {
    return {
      entries: [],
      finding: {
        file,
        rule: "lock",
        message: `cannot be read: ${(error as Error).message}`,
      },
    };
  }
}

/**
 * The append-only findings: the journal is in order and matches the SQL
 * files, every recorded migration is unchanged and in place, and nothing sits
 * unrecorded. `record` appends what is new and unflagged instead of failing
 * on it, and only when everything recorded is intact.
 */
export function checkAppendOnly(
  dir: string,
  lockPath: string,
  options: { record?: boolean; authClean?: (file: string) => boolean } = {},
): { findings: Finding[]; recorded: string[] } {
  const findings: Finding[] = [];
  const { entries, finding } = readJournal(dir);
  if (!entries) return { findings: [finding as Finding], recorded: [] };

  const sqlFiles = readdirSync(dir).filter((name) => name.endsWith(".sql"));
  const tags = new Set(entries.map((entry) => entry.tag));
  for (const name of sqlFiles) {
    if (!tags.has(name.slice(0, -4))) {
      findings.push({
        file: name,
        rule: "journal",
        message:
          "has no meta/_journal.json entry, so db:migrate would skip it silently",
      });
    }
  }
  entries.forEach((entry, position) => {
    if (entry.idx !== position) {
      findings.push({
        file: "meta/_journal.json",
        rule: "journal",
        message: `entry ${position} (${entry.tag}) has idx ${entry.idx}`,
      });
    }
    const previous = entries[position - 1];
    if (previous && !(entry.when > previous.when)) {
      findings.push({
        file: "meta/_journal.json",
        rule: "journal",
        message: `${entry.tag} has when ${entry.when}, not after ${previous.tag}'s ${previous.when}, so db:migrate would skip it`,
      });
    }
    if (!existsSync(path.join(dir, `${entry.tag}.sql`))) {
      findings.push({
        file: `${entry.tag}.sql`,
        rule: "journal",
        message: "is in meta/_journal.json but not on disk",
      });
    }
  });

  const lock = readLock(lockPath);
  if (lock.finding && !(options.record && !existsSync(lockPath)))
    findings.push(lock.finding);

  lock.entries.forEach((recorded, position) => {
    const file = `${recorded.tag}.sql`;
    const entry = entries[position];
    if (!entry || entry.tag !== recorded.tag) {
      findings.push({
        file,
        rule: "append-only",
        message: `was recorded at position ${position}; the journal now has ${entry ? entry.tag : "nothing"} there (removed, renamed or reordered)`,
      });
      return;
    }
    if (entry.when !== recorded.when || entry.idx !== recorded.idx) {
      findings.push({
        file,
        rule: "append-only",
        message: `its journal entry changed since it was recorded (when ${recorded.when} -> ${entry.when})`,
      });
    }
    const full = path.join(dir, file);
    if (!existsSync(full)) {
      findings.push({
        file,
        rule: "append-only",
        message:
          "was recorded and is gone; migrations are append-only, never deleted",
      });
    } else if (sha256(readFileSync(full)) !== recorded.sha256) {
      findings.push({
        file,
        rule: "append-only",
        message:
          "was edited after it was recorded; migrations are append-only, so write a new migration instead",
      });
    }
  });

  const fresh = entries.slice(lock.entries.length);
  const recordedNow: string[] = [];
  // Recording stops at the first entry it refuses, so the lock stays a
  // prefix of the journal and nothing later takes a refused entry's place.
  let recordable = findings.length === 0;
  for (const entry of fresh) {
    const file = `${entry.tag}.sql`;
    const full = path.join(dir, file);
    const clean = options.authClean ? options.authClean(file) : true;
    recordable = recordable && clean && existsSync(full);
    if (options.record && recordable) {
      lock.entries.push({
        idx: entry.idx,
        tag: entry.tag,
        when: entry.when,
        sha256: sha256(readFileSync(full)),
      });
      recordedNow.push(file);
    } else {
      findings.push({
        file,
        rule: "append-only",
        message: options.record
          ? "was not recorded: fix the findings above, or the entry before it, first"
          : "is not recorded in the lock; once its SQL is final, run yarn check-migrations --record",
      });
    }
  }

  if (options.record && recordedNow.length > 0) {
    writeFileSync(
      lockPath,
      `${JSON.stringify(
        {
          about:
            "Written by yarn check-migrations --record. One entry per migration, in journal order, with the sha256 of its SQL. Never edit an entry: a recorded migration that changes fails verify. Only the last entry, for a migration no tier has applied, may be removed, in the commit that amends that migration (docs/developer-guides/migrations.md).",
          migrations: lock.entries,
        },
        null,
        2,
      )}\n`,
    );
  }
  return { findings, recorded: recordedNow };
}

/** Both rules over one migrations folder. */
export function runCheck(
  dir: string,
  lockPath: string,
  options: { record?: boolean } = {},
): { files: number; findings: Finding[]; recorded: string[] } {
  if (!existsSync(dir)) {
    return {
      files: 0,
      findings: [
        {
          file: dir,
          rule: "missing",
          message: "the migrations folder does not exist",
        },
      ],
      recorded: [],
    };
  }
  const files = readdirSync(dir)
    .filter((name) => name.endsWith(".sql"))
    .sort();
  const auth = files.flatMap((name) =>
    findAuthDdl(name, readFileSync(path.join(dir, name), "utf8")),
  );
  const flagged = new Set(auth.map((finding) => finding.file));
  const appendOnly = checkAppendOnly(dir, lockPath, {
    record: options.record,
    authClean: (file) => !flagged.has(file),
  });
  return {
    files: files.length,
    findings: [...auth, ...appendOnly.findings],
    recorded: appendOnly.recorded,
  };
}

export const PACKAGE_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
export const MIGRATIONS_DIR = path.join(PACKAGE_DIR, "migrations");
export const LOCK_PATH = path.join(MIGRATIONS_DIR, "migrations.lock.json");

function main(argv: string[]): number {
  const record = argv.includes("--record");
  const { files, findings, recorded } = runCheck(MIGRATIONS_DIR, LOCK_PATH, {
    record,
  });
  for (const file of recorded)
    console.log(`check-migrations: recorded ${file}`);
  if (findings.length === 0) {
    console.log(
      `check-migrations: ${files} migration(s) in packages/db/migrations; none act on the auth schema, all recorded and unchanged.`,
    );
    return 0;
  }
  for (const finding of findings) {
    const where = [
      finding.statement ? `statement ${finding.statement}` : "",
      finding.line ? `line ${finding.line}` : "",
    ]
      .filter(Boolean)
      .join(", ");
    console.error(
      `check-migrations: ${finding.file}${where ? ` (${where})` : ""} [${finding.rule}] ${finding.message}`,
    );
  }
  if (
    findings.some(
      (finding) =>
        finding.rule.startsWith("auth") || finding.rule === "search-path",
    )
  ) {
    console.error(
      "Supabase owns auth: point a foreign key at auth.users if you must, and put anything else in packages/db/supabase/setup.",
    );
  }
  return 1;
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  process.exitCode = main(process.argv.slice(2));
}
