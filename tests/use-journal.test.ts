import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import test from "node:test";
import { fileURLToPath } from "node:url";

// USE-44: Close the day came back from _legacy/ and is owned live: none of
// its files imports _legacy/ or the tRPC client (it reads through
// useJournal), and its copy says nothing in the second person. Read as text,
// so nothing here imports the app.

const root = fileURLToPath(new URL("../", import.meta.url));
const ROUTE = "apps/web/app/(shell)/day/[date]/journal";
const SCREEN = "apps/web/components/journal";
const DATA = "apps/web/lib/data/use-journal.ts";

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

const files = [...filesUnder(ROUTE), ...filesUnder(SCREEN), DATA];
const read = (path: string) => readFileSync(`${root}${path}`, "utf8");

test("C5: the journal's files are live", () => {
  assert.ok(files.includes(`${ROUTE}/page.tsx`));
  assert.ok(files.includes(`${SCREEN}/journal-screen.tsx`));
  assert.ok(files.includes(`${SCREEN}/copy.ts`));
});

test("C5: nothing in the journal imports _legacy/ or the tRPC client", () => {
  for (const path of files) {
    const imports = [...read(path).matchAll(/from\s+"([^"]+)"/g)].map(
      (match) => match[1],
    );
    for (const spec of imports) {
      assert.doesNotMatch(spec, /_legacy/, `${path}: ${spec}`);
      assert.doesNotMatch(spec, /lib\/trpc|@trpc\//, `${path}: ${spec}`);
    }
  }
});

test("C5: the journal's copy holds no second-person word", () => {
  const copy = read(`${SCREEN}/copy.ts`);
  const strings = [...copy.matchAll(/"([^"]*)"|`([^`]*)`/g)].map(
    (match) => match[1] ?? match[2] ?? "",
  );
  assert.ok(strings.length > 10);
  for (const text of strings) {
    assert.doesNotMatch(text, /\b(you|your|yours|yourself)\b/i, text);
  }
  // D-USE-75 replaced the built offline line.
  assert.ok(
    copy.includes("Offline. The words stay on this phone until back online."),
  );
});
