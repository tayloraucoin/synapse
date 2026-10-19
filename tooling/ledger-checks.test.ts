/**
 * The ledger of the boards (adaptation 2026-10-12; MIG-23 C3): check-specs
 * checks coverage both ways between a coverage index and the files that
 * carry its artboards. The tree is the pass-ledger-desk-and-phone fixture,
 * copied into a scratch repo, then broken one way per test.
 */

import assert from "node:assert/strict";
import { cpSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { describe, test } from "node:test";
import { fileURLToPath } from "node:url";

import {
  checkSpecs,
  freshRepo,
  read,
  tool,
  useScratchRepo,
  write,
} from "./lib/scratch-repo.ts";

const FIXTURE = "tooling/fixtures/specs/pass-ledger-desk-and-phone";
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const EPIC = "specs/web/epics/WK1-work";

useScratchRepo();

/** The fixture's epic in a fresh repo, its targets mirroring the scratch truth path. */
function ledgerRepo() {
  const dir = freshRepo();
  cpSync(path.join(REPO, FIXTURE, EPIC), path.join(dir, EPIC), {
    recursive: true,
  });
  const walk = (rel: string): string[] =>
    readdirSync(path.join(dir, rel)).flatMap((name) => {
      const child = `${rel}/${name}`;
      return statSync(path.join(dir, child)).isDirectory()
        ? walk(child)
        : [child];
    });
  for (const file of walk(EPIC).filter((f) => f.endsWith(".md")))
    write(dir, file, read(dir, file).replaceAll(`${FIXTURE}/`, ""));
  tool(dir, "status.ts", []);
  return dir;
}

const edit = (dir: string, rel: string, from: string, to: string) => {
  const text = read(dir, rel);
  assert.ok(text.includes(from), `${rel} holds ${from}`);
  write(dir, rel, text.replace(from, to));
};

describe("C3 the ledger's coverage, both ways", () => {
  test("the fixture's ledger passes as copied", () => {
    const run = checkSpecs(ledgerRepo());
    assert.equal(run.status, 0, run.out);
  });

  test("a specced row whose carrier does not list the artboard is refused", () => {
    const dir = ledgerRepo();
    edit(
      dir,
      `${EPIC}/ux/boards/use-work.md`,
      "| `today / working, firing in place / 1728 / light` | 0 | 0 | specced | `work/today/states/working.md` |",
      "| `today / working, firing in place / 1728 / light` | 0 | 0 | specced | `work/today/states/loading.md` |",
    );
    const run = checkSpecs(dir);
    assert.equal(run.status, 1, run.out);
    assert.match(
      run.out,
      /`today \/ working, firing in place \/ 1728 \/ light` is specced, carried by work\/today\/states\/loading\.md, which does not list it under boards:/,
    );
  });

  test("an artboard claimed by two carriers is refused", () => {
    const dir = ledgerRepo();
    edit(
      dir,
      `${EPIC}/ux/work/today/states/everything-firing.md`,
      "boards:\n",
      'boards:\n  - name: "today / working, firing in place / 1728 / light"\n    page: "USE — work"\n    at: [0, 0]\n',
    );
    const run = checkSpecs(dir);
    assert.equal(run.status, 1, run.out);
    assert.match(
      run.out,
      /`today \/ working, firing in place \/ 1728 \/ light` is claimed by both \S+states\/(working|everything-firing)\.md and \S+states\/(working|everything-firing)\.md/,
    );
  });
});
