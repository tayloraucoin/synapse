/**
 * MIG-7, the auth SDK seam: every @supabase/* import sits in @syn/auth or in
 * the one named exception, a reviewer glob reaches each, and check-stack
 * keeps the auth module whole.
 *
 * C1 scans every tracked and new source file for the vendor's imports, then
 * lints probe text through the root (boundaries) config.
 * C2 reads toolkit.json's reviewer globs against the importers.
 * C3 reads the auth stack entry and the verify chain, and runs check-stack on
 * the repo and on a tree with the module's package gone.
 */

import { strict as assert } from "node:assert";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, matchesGlob, resolve } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { ESLint } from "eslint";

import { importsModule, readImportedModules } from "../tooling/lib/specs.ts";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const RULE = "boundaries/dependencies";
const VENDOR = "@supabase/*";

const EXCEPTION = "packages/db/scripts/seed-users.ts";
/** The importers MIG-7 found outside a reviewer glob, wrapped or named. */
const ASSESSED = [
  "apps/web/lib/clients/supabase/client.ts",
  "packages/api/src/context.ts",
  EXCEPTION,
];

const toolkit = JSON.parse(readFileSync(join(root, "toolkit.json"), "utf8"));

function sourceFiles() {
  const run = spawnSync(
    "git",
    ["ls-files", "--cached", "--others", "--exclude-standard"],
    { cwd: root, encoding: "utf8" },
  );
  assert.equal(run.status, 0, run.stderr);
  return run.stdout
    .split("\n")
    .filter(Boolean)
    .filter((file) => !file.startsWith("tooling/fixtures/"));
}

function vendorImporters() {
  return sourceFiles().filter((file) =>
    readImportedModules(file, root).some((specifier) =>
      importsModule(specifier, VENDOR),
    ),
  );
}

async function ruleHits(filePath, code) {
  const eslint = new ESLint({ cwd: root });
  const [result] = await eslint.lintText(code, { filePath });
  return result.messages.filter((m) => m.ruleId === RULE);
}

const valueImport = `import { createClient } from "@supabase/supabase-js";\nexport const c = createClient;\n`;
const typeImport = `import type { User } from "@supabase/supabase-js";\nexport type U = User;\n`;
const ssrImport = `import { createBrowserClient } from "@supabase/ssr";\nexport const c = createBrowserClient;\n`;

test("C1: @supabase/* is imported only in packages/auth and the named exception", () => {
  const outside = vendorImporters().filter(
    (file) => !file.startsWith("packages/auth/") && file !== EXCEPTION,
  );
  assert.deepEqual(outside, []);
  assert.ok(
    vendorImporters().includes(EXCEPTION),
    "the exception still imports the SDK; if it stopped, drop it from boundaries.js",
  );
});

test("C1: a new @supabase/* import outside @syn/auth is a lint:boundaries error", async () => {
  const probes = [
    "apps/web/lib/seam-probe.ts",
    "apps/web/lib/auth/seam-probe.ts",
    "apps/web/app/seam-probe.tsx",
    "packages/api/src/seam-probe.ts",
    "packages/db/src/seam-probe.ts",
    "packages/db/scripts/seam-probe.ts",
    "packages/utils/src/seam-probe.ts",
  ];
  for (const filePath of probes)
    for (const code of [valueImport, typeImport, ssrImport]) {
      const hits = await ruleHits(filePath, code);
      assert.equal(hits.length, 1, `${filePath}: ${code}`);
      assert.equal(hits[0].severity, 2, filePath);
      assert.match(hits[0].message, /@supabase\/\*/);
    }
});

test("C1: @syn/auth and the exception may import it; the exception keeps every other rule", async () => {
  for (const code of [valueImport, typeImport, ssrImport])
    assert.deepEqual(await ruleHits("packages/auth/src/seam-probe.ts", code), []);

  const seeder = readFileSync(join(root, EXCEPTION), "utf8");
  assert.deepEqual(await ruleHits(EXCEPTION, seeder), []);

  // The override drops the vendor restriction only: db still may not reach up.
  const upward = `import { getUser } from "@syn/auth";\nexport const g = getUser;\n`;
  const hits = await ruleHits(EXCEPTION, upward);
  assert.equal(hits.length, 1);
  assert.equal(hits[0].severity, 2);
});

test("C2: a mason and a warden reviewer glob reach every importer and each assessed file", () => {
  const files = [...new Set([...vendorImporters(), ...ASSESSED])];
  const globRows = toolkit.reviewers.filter((row) => row.glob);
  for (const file of files)
    for (const role of ["mason", "warden"])
      assert.ok(
        globRows.some((row) => row.role === role && matchesGlob(file, row.glob)),
        `${file} has no ${role} glob`,
      );
});

test("C3: toolkit.json carries the auth stack entry", () => {
  const auth = toolkit.stack?.auth;
  assert.ok(auth, "stack.auth is missing");
  assert.equal(auth.locked, false);
  assert.equal(auth.runbook, "docs/developer-guides/remove-supabase-auth.md");
  assert.deepEqual(auth.boundaries, ["auth"]);
  for (const dependency of ["@syn/auth", "@supabase/ssr", "@supabase/supabase-js"])
    assert.ok(auth.dependencies.includes(dependency), dependency);
  for (const file of ["packages/auth", "apps/web/proxy.ts"])
    assert.ok(auth.files.includes(file), file);
});

test("C3: yarn verify runs check-stack, and check-stack passes", () => {
  const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
  assert.equal(pkg.scripts["check-stack"], "node tooling/check-stack.ts");
  assert.match(pkg.scripts.verify, /(^| && )yarn check-stack( && |$)/);

  const run = spawnSync(process.execPath, ["tooling/check-stack.ts"], {
    cwd: root,
    encoding: "utf8",
  });
  assert.equal(run.status, 0, run.stderr);
  assert.match(run.stdout, /nothing missing, nothing left behind/);
});

test("C3: check-stack fails when the auth package is gone but the entry says present", () => {
  const tree = mkdtempSync(join(tmpdir(), "auth-seam-"));
  const runbook = toolkit.stack.auth.runbook;
  mkdirSync(join(tree, dirname(runbook)), { recursive: true });
  writeFileSync(join(tree, runbook), "# runbook\n");
  writeFileSync(
    join(tree, "toolkit.json"),
    JSON.stringify({ stack: { auth: toolkit.stack.auth } }),
  );
  const run = spawnSync(
    process.execPath,
    [join(root, "tooling/check-stack.ts"), "--root", tree],
    { cwd: root, encoding: "utf8" },
  );
  assert.equal(run.status, 1);
  assert.match(run.stderr, /stack\.auth is present, but its file packages\/auth is missing/);
});

/** Every file of packages/auth/src a module reaches through relative imports. */
function reachable(entry) {
  const seen = new Set();
  const external = new Set();
  const visit = (file) => {
    if (seen.has(file)) return;
    seen.add(file);
    for (const specifier of readImportedModules(file, root)) {
      if (!specifier.startsWith(".")) {
        external.add(specifier);
        continue;
      }
      visit(join(dirname(file), `${specifier.replace(/\.ts$/, "")}.ts`));
    }
  };
  visit(entry);
  return { files: [...seen].sort(), external: [...external].sort() };
}

test("C6: @syn/auth/browser reaches no server-only module and no environment", () => {
  const pkg = JSON.parse(
    readFileSync(join(root, "packages/auth/package.json"), "utf8"),
  );
  assert.equal(pkg.exports["./browser"], "./src/browser.ts");

  const { files, external } = reachable("packages/auth/src/browser.ts");
  assert.deepEqual(files, [
    "packages/auth/src/browser.ts",
    "packages/auth/src/context.ts",
  ]);
  for (const specifier of external)
    assert.ok(
      importsModule(specifier, VENDOR) || specifier.startsWith("@syn/types"),
      `browser entry imports ${specifier}`,
    );
  for (const file of files)
    assert.doesNotMatch(
      readFileSync(join(root, file), "utf8"),
      /process\.env|SERVICE_ROLE|SECRET_KEY/,
      file,
    );

  // The app's browser client takes the browser entry, never the barrel,
  // which re-exports the admin client and next/server.
  const client = "apps/web/lib/clients/supabase/client.ts";
  const modules = readImportedModules(client, root);
  assert.ok(modules.includes("@syn/auth/browser"), client);
  assert.ok(!modules.includes("@syn/auth"), client);
});
