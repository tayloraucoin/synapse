/**
 * The layout probe on synthetic roots written in $TMPDIR (MIG-1 C1). Every
 * file here is synthetic.
 */

import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { after, test } from "node:test";

import { findCodeRoot, findTool, probeLayout } from "./layout.ts";

const scratch = mkdtempSync(
  path.join(process.env.TMPDIR ?? tmpdir(), "pem-layout-"),
);
after(() => rmSync(scratch, { recursive: true, force: true }));
let counter = 0;

/** A root holding the given files, each path relative to it. */
function root(files: Record<string, unknown>): string {
  const dir = path.join(scratch, `root-${++counter}`);
  for (const [rel, body] of Object.entries(files)) {
    mkdirSync(path.dirname(path.join(dir, rel)), { recursive: true });
    writeFileSync(
      path.join(dir, rel),
      typeof body === "string" ? body : JSON.stringify(body),
    );
  }
  mkdirSync(dir, { recursive: true });
  return dir;
}

const singleApp = {
  "package.json": {
    name: "app",
    scripts: { format: "prettier --write .", "check-types": "tsc -p ." },
  },
  "toolkit.json": { specsRoot: "specs", apps: { web: { path: "." } } },
};

test("C1 a single app at the root: no Turbo, no workspaces, one code root at '.'", () => {
  const layout = probeLayout(root(singleApp));
  assert.deepEqual(layout, {
    hasTurbo: false,
    turboTasks: [],
    workspaces: [],
    codeRoots: ["."],
    specsRoot: "specs",
    hasSpecsRoot: false,
    scripts: ["format", "check-types"],
    scriptCommands: {
      format: "prettier --write .",
      "check-types": "tsc -p .",
    },
    tier: "starter",
  });
});

test("C1 with neither toolkit apps nor workspaces the code root is still '.'", () => {
  const layout = probeLayout(root({ "package.json": { name: "bare" } }));
  assert.deepEqual(layout.codeRoots, ["."]);
  assert.deepEqual(layout.scripts, []);
  assert.deepEqual(layout.workspaces, []);
});

test("C1 a turbo.json reports the tasks it defines, and only lint and check-types", () => {
  const both = probeLayout(
    root({
      ...singleApp,
      "turbo.json": {
        tasks: { build: {}, lint: {}, "check-types": {}, test: {} },
      },
    }),
  );
  assert.equal(both.hasTurbo, true);
  assert.deepEqual(both.turboTasks, ["lint", "check-types"]);

  const lintOnly = probeLayout(
    root({ ...singleApp, "turbo.json": { tasks: { build: {}, lint: {} } } }),
  );
  assert.equal(lintOnly.hasTurbo, true);
  assert.deepEqual(lintOnly.turboTasks, ["lint"]);
});

test("C1 turbo.json with comments, a Turbo 1 pipeline and a workspace-scoped task", () => {
  const layout = probeLayout(
    root({
      ...singleApp,
      "turbo.json": `{
  // Turbo 1 shape
  "pipeline": {
    "web#lint": {},
    /* types */ "check-types": { "outputs": ["dist/**"] },
  }
}`,
    }),
  );
  assert.deepEqual(layout.turboTasks, ["lint", "check-types"]);
});

test("C1 an unreadable turbo.json is still Turbo, with no tasks", () => {
  const layout = probeLayout(root({ ...singleApp, "turbo.json": "{ nope" }));
  assert.equal(layout.hasTurbo, true);
  assert.deepEqual(layout.turboTasks, []);
});

test("C1 a monorepo: code roots are the app paths plus each workspace folder", () => {
  const dir = root({
    "package.json": { name: "mono", workspaces: ["apps/*", "packages/ui"] },
    "toolkit.json": {
      specsRoot: "work/specs",
      apps: { web: { path: "apps/web" }, docs: { path: "./apps/docs/" } },
    },
    "apps/web/package.json": {},
    "apps/docs/package.json": {},
    "apps/admin/package.json": {},
    "packages/ui/package.json": {},
    "packages/db/package.json": {},
    "work/specs/_status.md": "",
  });
  const layout = probeLayout(dir);
  assert.deepEqual(layout.workspaces, ["apps/*", "packages/ui"]);
  assert.deepEqual(layout.codeRoots, [
    "apps/admin",
    "apps/docs",
    "apps/web",
    "packages/ui",
  ]);
  assert.equal(layout.specsRoot, "work/specs");
  assert.equal(layout.hasSpecsRoot, true);
  assert.equal(findCodeRoot(layout, "apps/web/app/page.tsx"), "apps/web");
  assert.equal(findCodeRoot(layout, "tooling/budget.ts"), null);
});

test("C1 Yarn 1's workspaces object is read; a missing package.json gives no scripts", () => {
  const layout = probeLayout(
    root({
      "package.json": { workspaces: { packages: ["libs/*"] } },
      "libs/core/index.ts": "",
    }),
  );
  assert.deepEqual(layout.workspaces, ["libs/*"]);
  assert.deepEqual(layout.codeRoots, ["libs/core"]);
  assert.deepEqual(probeLayout(root({ "README.md": "" })).scripts, []);
});

test("C1 the specs root is found where toolkit.json puts it, or at specs by default", () => {
  assert.equal(
    probeLayout(root({ ...singleApp, "specs/_status.md": "" })).hasSpecsRoot,
    true,
  );
  assert.equal(
    probeLayout(root({ "specs/_status.md": "" })).hasSpecsRoot,
    true,
  );
});

test("C1 a file at a '.' code root is in it; a deeper root wins", () => {
  const layout = probeLayout(
    root({
      "package.json": { workspaces: ["packages/*"] },
      "toolkit.json": { apps: { web: { path: "." } } },
      "packages/ui/index.ts": "",
    }),
  );
  assert.deepEqual(layout.codeRoots, [".", "packages/ui"]);
  assert.equal(findCodeRoot(layout, "src/index.ts"), ".");
  assert.equal(findCodeRoot(layout, "packages/ui/index.ts"), "packages/ui");
});

test("C1 a tool is declared by a script of its name or a dependency, in the folder asked", () => {
  const dir = root({
    "package.json": {
      scripts: { eslint: "node lint.js" },
      devDependencies: { prettier: "3.0.0" },
    },
    "apps/web/package.json": { dependencies: { turbo: "2.0.0" } },
  });
  assert.equal(findTool(dir, ".", "eslint"), "script");
  assert.equal(findTool(dir, ".", "prettier"), "dependency");
  assert.equal(findTool(dir, ".", "turbo"), null);
  assert.equal(findTool(dir, "apps/web", "turbo"), "dependency");
  assert.equal(findTool(dir, "apps/missing", "turbo"), null);
});
