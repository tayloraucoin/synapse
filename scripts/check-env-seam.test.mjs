/**
 * MIG-6, the env seam: the environment is read only in each workspace's
 * env.ts, and the lint rule's frozen readers only fall.
 *
 * C1 lints probe text through each workspace's own config (Node API).
 * C2 runs the ESLint CLI over the frozen files against altered copies of the
 * committed suppressions file, the way `yarn lint` reads it.
 * C3 reads the rule's config for the two named exemptions.
 */

import { strict as assert } from "node:assert";
import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { ESLint } from "eslint";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const eslintBin = join(root, "node_modules/eslint/bin/eslint.js");
const RULE = "no-restricted-properties";

const OBJ = "process";
const PROP = "env";
const memberRead = `export const v = ${OBJ}.${PROP}.NODE_ENV;\n`;
const destructuredRead = `const { ${PROP} } = ${OBJ};\nexport const v = ${PROP}.NODE_ENV;\n`;

const EXEMPT = ["lib/clients/supabase/client.ts", "lib/trpc/provider.tsx"];

async function ruleHits(workspace, filePath, code) {
  const eslint = new ESLint({ cwd: join(root, workspace) });
  const [result] = await eslint.lintText(code, { filePath });
  return result.messages.filter((m) => m.ruleId === RULE);
}

function frozen(workspace) {
  const file = join(root, workspace, "eslint-suppressions.json");
  return existsSync(file) ? JSON.parse(readFileSync(file, "utf8")) : null;
}

const FROZEN_WORKSPACES = [
  "apps/web",
  "packages/api",
  "packages/auth",
  "packages/db",
  "packages/observability",
];

function lintWith(workspace, files, suppressions) {
  const dir = mkdtempSync(join(tmpdir(), "env-seam-"));
  const location = join(dir, "suppressions.json");
  writeFileSync(location, JSON.stringify(suppressions, null, 2));
  const run = spawnSync(
    process.execPath,
    [
      eslintBin,
      ...files,
      "--max-warnings",
      "0",
      "--suppressions-location",
      location,
    ],
    { cwd: join(root, workspace), encoding: "utf8" },
  );
  return run.status;
}

test("C1: a new read outside env.ts is an error in every workspace", async () => {
  const probes = [
    ["apps/web", "lib/seam-probe.ts"],
    ["packages/auth", "src/seam-probe.ts"],
    ["packages/utils", "src/seam-probe.ts"],
  ];
  for (const [workspace, filePath] of probes) {
    for (const code of [memberRead, destructuredRead]) {
      const hits = await ruleHits(workspace, filePath, code);
      assert.equal(hits.length, 1, `${workspace}/${filePath}`);
      assert.equal(
        hits[0].severity,
        2,
        `${workspace}: an error, not a warning`,
      );
    }
  }
});

test("C1: a read through an import of env from the process module is an error", async () => {
  const eslint = new ESLint({ cwd: join(root, "packages/auth") });
  for (const from of [OBJ, `node:${OBJ}`]) {
    const [result] = await eslint.lintText(
      `import { ${PROP} } from "${from}";\nexport const v = ${PROP}.NODE_ENV;\n`,
      { filePath: "src/seam-probe.ts" },
    );
    const hits = result.messages.filter(
      (m) => m.ruleId === "no-restricted-imports",
    );
    assert.equal(hits.length, 1, from);
  }
});

test("C1: an env.ts below the workspace root is not the seam", async () => {
  const hits = await ruleHits("apps/web", "lib/feature/env.ts", memberRead);
  assert.equal(hits.length, 1);
});

test("C1: env.ts itself reads freely", async () => {
  for (const [workspace, filePath] of [
    ["apps/web", "env.ts"],
    ["packages/auth", "src/env.ts"],
  ]) {
    assert.deepEqual(await ruleHits(workspace, filePath, memberRead), []);
  }
});

test("C2: each committed count is exact, and a read added to a frozen file fails", () => {
  for (const workspace of FROZEN_WORKSPACES) {
    const committed = frozen(workspace);
    assert.ok(committed, `${workspace} commits eslint-suppressions.json`);
    const files = Object.keys(committed);
    const [file] = files;

    assert.equal(
      lintWith(workspace, files, committed),
      0,
      `${workspace}: green as committed`,
    );

    const lowered = structuredClone(committed);
    lowered[file][RULE].count -= 1;
    if (lowered[file][RULE].count === 0) delete lowered[file];
    assert.equal(
      lintWith(workspace, files, lowered),
      1,
      `${workspace}: one more read than frozen in ${file} fails`,
    );

    const raised = structuredClone(committed);
    raised[file][RULE].count += 1;
    assert.equal(
      lintWith(workspace, files, raised),
      2,
      `${workspace}: a count above the reads fails until pruned`,
    );
  }
});

test("C3: the two NEXT_PUBLIC_* literal readers are exempt by name, and only they", async () => {
  const config = readFileSync(
    join(root, "packages/config/eslint/process-env.js"),
    "utf8",
  );
  for (const path of EXEMPT) assert.ok(config.includes(`"${path}"`), path);

  for (const path of EXEMPT) {
    assert.deepEqual(await ruleHits("apps/web", path, memberRead), [], path);
  }
  const eslint = new ESLint({ cwd: join(root, "apps/web") });
  for (const path of EXEMPT) {
    const [result] = await eslint.lintText(
      `export const a = ${OBJ}.${PROP}.NEXT_PUBLIC_SUPABASE_URL;\nexport const b = ${OBJ}.${PROP}.DATABASE_URL;\nexport const c = ${OBJ}.${PROP}["SUPABASE_SECRET_KEY"];\n`,
      { filePath: path },
    );
    const hits = result.messages.filter(
      (m) => m.ruleId === "env-seam/public-names-only",
    );
    assert.deepEqual(
      hits.map((m) => m.line),
      [2, 3],
      `${path}: only public names`,
    );
  }

  const sibling = await ruleHits("apps/web", "lib/trpc/server.ts", memberRead);
  assert.equal(sibling.length, 1, "a sibling of an exempt file is not exempt");
});
