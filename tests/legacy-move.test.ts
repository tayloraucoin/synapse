import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { ESLint } from "eslint";

// USE-1: the old app moved into _legacy/ folders that nothing builds, lints or
// imports. These read the tree and the source text; nothing here imports the
// app, so they run on plain Node.

const root = fileURLToPath(new URL("../", import.meta.url));
const at = (path: string) => `${root}${path}`;
const read = (path: string) => readFileSync(at(path), "utf8");
const dirs = (path: string) =>
  readdirSync(at(path)).filter((name) =>
    statSync(at(`${path}/${name}`)).isDirectory(),
  );

test("C1: the live route folders are the auth, api, legal and logout groups and a Today-only shell", () => {
  // "_" folders are private in Next (not routes); dot folders are tooling's.
  const isRoute = (name: string) =>
    !name.startsWith("_") && !name.startsWith(".");
  const routes = dirs("apps/web/app").filter(isRoute);
  assert.deepEqual(routes.sort(), [
    "(auth)",
    "(auth-pending)",
    "(shell)",
    "api",
    "auth",
    "legal",
    "logout",
  ]);
  const shell = readdirSync(at("apps/web/app/(shell)")).filter(isRoute);
  assert.deepEqual(shell.sort(), ["layout.tsx", "today"]);
  assert.equal(existsSync(at("apps/web/app/(setup)")), false);
});

test("C9: every moved route folder, router and job is under _legacy/, so a deletion fails", () => {
  const web = "apps/web/_legacy/app";
  for (const name of [
    "orient",
    "today",
    "day",
    "review",
    "settings",
    "workflow",
  ]) {
    assert.ok(
      existsSync(at(`${web}/(shell)/${name}`)),
      `${name} is in _legacy`,
    );
  }
  assert.ok(existsSync(at(`${web}/(setup)`)), "(setup) is in _legacy");

  const api = "packages/api/src/_legacy";
  const routers = [
    "adjust",
    "category",
    "day",
    "day-plan",
    "fixture",
    "habit",
    "item",
    "journal",
    "link",
    "passage",
    "quote",
    "reason",
    "review",
    "shell",
    "template",
    "timer",
    "week",
    "workflow",
  ];
  for (const name of routers) {
    assert.ok(
      existsSync(at(`${api}/routers/${name}.ts`)),
      `router ${name} is in _legacy`,
    );
  }
  for (const name of [
    "day",
    "library",
    "plan",
    "review",
    "shell",
    "workflow",
  ]) {
    assert.ok(
      existsSync(at(`${api}/services/${name}`)),
      `service ${name} is in _legacy`,
    );
  }
  for (const path of [
    "services/notifications/block-pushes.ts",
    "services/jobs/auto-close-days.ts",
    "services/jobs/notify.ts",
  ]) {
    assert.ok(existsSync(at(`${api}/${path}`)), `${path} is in _legacy`);
  }
});

test("C2: appRouter mounts exactly user, notification, asset and feedback; the scheduler runs expire_exports alone", () => {
  const rootRouter = read("packages/api/src/root.ts");
  const body = /router\(\{([\s\S]*?)\}\)/.exec(rootRouter)?.[1] ?? "";
  const keys = [...body.matchAll(/^\s*(\w+):/gm)].map((match) => match[1]);
  assert.deepEqual(keys.sort(), ["asset", "feedback", "notification", "user"]);

  const jobs = read("packages/api/src/services/jobs/run-scheduled-jobs.ts");
  const list = /SCHEDULED_JOBS[^=]*=\s*\[([\s\S]*?)\]/.exec(jobs)?.[1] ?? "";
  assert.deepEqual(
    list
      .split(",")
      .map((entry) => entry.trim())
      .filter(Boolean),
    ["expireExportsJob"],
  );
  assert.match(
    read("packages/api/src/services/jobs/expire-exports.ts"),
    /name: "expire_exports"/,
  );
});

test("C3: a live file that imports a _legacy/ path fails lint, and the message names the fix", async () => {
  const cases = [
    {
      cwd: "apps/web",
      file: "lib/probe.ts",
      source: "@/_legacy/components/day-list",
    },
    {
      cwd: "packages/api",
      file: "src/probe.ts",
      source: "./_legacy/routers/day",
    },
  ];
  for (const { cwd, file, source } of cases) {
    const eslint = new ESLint({ cwd: at(cwd) });
    const [result] = await eslint.lintText(`export * from "${source}";\n`, {
      filePath: at(`${cwd}/${file}`),
    });
    const hit = result.messages.find(
      (message) => message.ruleId === "legacy/no-import",
    );
    assert.ok(hit, `${cwd}: the import is reported`);
    assert.match(hit.message, /git mv the file back out of _legacy\//);
  }
});
