import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readdirSync, readFileSync } from "node:fs";
import test from "node:test";

// MIG-5: the workspace runner is Vitest, reached through Turbo, and an empty
// suite fails rather than passes.

const root = new URL("../", import.meta.url);
const readJson = (path: string) =>
  JSON.parse(readFileSync(new URL(path, root), "utf8"));

const workspaces = ["apps", "packages"].flatMap((dir) =>
  readdirSync(new URL(dir, root)).map((name) => `${dir}/${name}`),
);
const testScripts = workspaces.flatMap((dir) => {
  try {
    const pkg = readJson(`${dir}/package.json`);
    return pkg.scripts?.test
      ? [{ dir, name: pkg.name, script: pkg.scripts.test }]
      : [];
  } catch {
    return [];
  }
});

test("yarn test runs the workspace suites through Turbo", () => {
  const pkg = readJson("package.json");
  assert.match(pkg.scripts.test, /^turbo run test\b/);
  assert.ok(
    readJson("turbo.json").tasks.test,
    "turbo.json defines a test task",
  );
});

test("at least one workspace has a test script, each on Vitest", () => {
  assert.ok(testScripts.length > 0, "no workspace has a test script");
  for (const { name, script } of testScripts) {
    assert.match(script, /^vitest run\b/, `${name} runs ${script}`);
    assert.doesNotMatch(
      script,
      /passWithNoTests/,
      `${name} passes on zero tests`,
    );
  }
});

test("a workspace suite with no test files fails", () => {
  const { name } = testScripts[0]!;
  const run = spawnSync(
    "yarn",
    ["workspace", name, "vitest", "run", "--dir", "src/__no_tests_here__"],
    { cwd: root, encoding: "utf8" },
  );
  assert.notEqual(run.status, 0, "vitest exited 0 on an empty suite");
  assert.match(`${run.stdout}${run.stderr}`, /No test files found/);
});
