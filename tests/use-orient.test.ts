import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import test from "node:test";
import { fileURLToPath } from "node:url";

// USE-12: Orient reads no clock, imports no fixture and nothing legacy, and
// says nothing in the second person. Read as text, so nothing here imports
// the app.

const root = fileURLToPath(new URL("../", import.meta.url));
const ORIENT = "apps/web/app/(shell)/orient";

function filesUnder(dir: string): string[] {
  return readdirSync(`${root}${dir}`).flatMap((name) => {
    const path = `${dir}/${name}`;
    return statSync(`${root}${path}`).isDirectory()
      ? filesUnder(path)
      : /\.tsx?$/.test(name)
        ? [path]
        : [];
  });
}

const files = filesUnder(ORIENT);
const read = (path: string) => readFileSync(`${root}${path}`, "utf8");

test("C10: Orient's files exist", () => {
  assert.ok(files.includes(`${ORIENT}/page.tsx`));
  assert.ok(files.some((path) => path.includes("/_components/")));
});

test("C10: nothing under app/(shell)/orient imports a clock hook, lib/fixtures or _legacy/", () => {
  for (const path of files) {
    const imports = [...read(path).matchAll(/from\s+"([^"]+)"/g)].map(
      (match) => match[1],
    );
    for (const spec of imports) {
      assert.doesNotMatch(spec, /lib\/fixtures|_legacy/, `${path}: ${spec}`);
      assert.doesNotMatch(spec, /use-now|use-clock/, `${path}: ${spec}`);
    }
    const source = read(path);
    assert.doesNotMatch(source, /\buse(Now|Clock|Countdown)\b/, path);
    assert.doesNotMatch(source, /\bnew Date\(\)|Date\.now\(/, path);
  }
});

test("C10: Orient's copy holds no second-person word", () => {
  const copy = read(`${ORIENT}/_components/copy.ts`);
  const strings = [...copy.matchAll(/"([^"]*)"|`([^`]*)`/g)].map(
    (match) => match[1] ?? match[2] ?? "",
  );
  assert.ok(strings.length > 10);
  for (const text of strings) {
    assert.doesNotMatch(text, /\b(you|your|yours|yourself)\b/i, text);
  }
});
