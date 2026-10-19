import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { after, test } from "node:test";

import { findBroken } from "./check-doc-links.mjs";

const root = mkdtempSync(join(tmpdir(), "check-doc-links-"));
after(() => rmSync(root, { recursive: true, force: true }));

function put(rel, body) {
  mkdirSync(dirname(join(root, rel)), { recursive: true });
  writeFileSync(join(root, rel), body);
}

put("docs/guide.md", "See [the target](target.md).\n");
put("docs/target.md", "# Target\n");

const pending = { "docs/later.md": "a later step", "docs/later-dir/": "a later step" };

test("a link to a file that exists passes", () => {
  assert.deepEqual(findBroken({ root, files: ["docs/guide.md"], pending }), []);
});

test("a real break is reported with its file and line", () => {
  put("docs/live.md", "# Live\n\n[gone](missing.md)\n");
  assert.deepEqual(findBroken({ root, files: ["docs/live.md"], pending }), [
    { file: "docs/live.md", line: 3, target: "missing.md" },
  ]);
});

test("a break inside docs/archive/ is skipped", () => {
  put("docs/archive/old.md", "[gone](missing.md)\n");
  assert.deepEqual(findBroken({ root, files: ["docs/archive/old.md"], pending }), []);
});

test("a break inside docs/decisions/imported/ is skipped", () => {
  put("docs/decisions/imported/old.md", "[gone](../../specs/old/README.md)\n");
  assert.deepEqual(
    findBroken({ root, files: ["docs/decisions/imported/old.md"], pending }),
    [],
  );
});

test("a target listed in refs-pending is accepted, file or folder", () => {
  put("docs/pointer.md", "[later](later.md) [dir](later-dir/) [dir](./later-dir)\n");
  assert.deepEqual(findBroken({ root, files: ["docs/pointer.md"], pending }), []);
});

test("a path under a pending folder is not accepted unless listed itself", () => {
  put("docs/deeper.md", "[inside](later-dir/child.md)\n");
  assert.equal(findBroken({ root, files: ["docs/deeper.md"], pending }).length, 1);
});

test("a folder named like a skipped one elsewhere is still checked", () => {
  put("apps/web/docs/archive/note.md", "[gone](missing.md)\n");
  assert.equal(
    findBroken({ root, files: ["apps/web/docs/archive/note.md"], pending }).length,
    1,
  );
});
