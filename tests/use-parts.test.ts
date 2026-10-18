import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import test from "node:test";
import { fileURLToPath } from "node:url";

// USE-10: the shared day parts print what they are given. Read as text, so
// nothing here imports the app or the package.

const root = fileURLToPath(new URL("../", import.meta.url));
const read = (path: string) => readFileSync(`${root}${path}`, "utf8");

function filesUnder(dir: string): string[] {
  return readdirSync(`${root}${dir}`).flatMap((name) => {
    const path = `${dir}/${name}`;
    return statSync(`${root}${path}`).isDirectory()
      ? filesUnder(path)
      : /\.(ts|tsx)$/.test(name)
        ? [path]
        : [];
  });
}

const PART_DIRS = ["apps/web/components/planner", "apps/web/components/work"];

/**
 * What a part may never reach for: the fixtures, tRPC, the wall clock. Wave 3
 * wired these folders, so their sheets read the data seam (lib/data) and tick
 * from its source through @syn/hooks; tRPC stays behind lib/data. Calendar
 * arithmetic (`new Date(Date.UTC(…))`) reads no clock.
 */
const FORBIDDEN: { what: string; pattern: RegExp }[] = [
  { what: "lib/fixtures", pattern: /from\s+["'][^"']*lib\/fixtures\b/ },
  { what: "the tRPC client", pattern: /from\s+["'][^"']*(lib\/trpc|@trpc\/)/ },
  { what: "the clock", pattern: /\bDate\.now\(|\bnew Date\((?!Date\.UTC\()/ },
];

test("C6: nothing under components/{planner,work} imports lib/fixtures or the tRPC client, or reads the wall clock", () => {
  const files = PART_DIRS.flatMap(filesUnder);
  assert.ok(
    files.length >= 8,
    `expected the parts, found ${files.length} files`,
  );
  for (const file of files) {
    const text = read(file);
    for (const { what, pattern } of FORBIDDEN)
      assert.doesNotMatch(text, pattern, `${file} reaches for ${what}`);
  }
});

/** Each @syn/ui part USE-10 adds or restyles: its story and its subpath. */
const UI_PARTS: { name: string; subpath: string; story: string }[] = [
  {
    name: "FiringMark",
    subpath: "./firing-mark",
    story:
      "packages/ui/src/composed/display/firing-mark/firing-mark.stories.tsx",
  },
  {
    name: "LinearStatusShape",
    subpath: "./linear-status-shape",
    story:
      "packages/ui/src/composed/display/linear-status-shape/linear-status-shape.stories.tsx",
  },
  {
    name: "LinearLine",
    subpath: "./linear-line",
    story:
      "packages/ui/src/composed/display/linear-line/linear-line.stories.tsx",
  },
  {
    name: "CountdownFace",
    subpath: "./countdown-face",
    story:
      "packages/ui/src/composed/display/timer-display/countdown-face.stories.tsx",
  },
  {
    name: "HueSquare",
    subpath: "./hue-square",
    story: "packages/ui/src/composed/display/hue-square/hue-square.stories.tsx",
  },
];

test("C6: each new @syn/ui part has a story file and an exports subpath", () => {
  const exports = JSON.parse(read("packages/ui/package.json"))
    .exports as Record<string, { types: string; default: string }>;
  const barrel = read("packages/ui/src/index.ts");
  for (const part of UI_PARTS) {
    const story = read(part.story);
    assert.match(story, /export default meta/, `${part.story} is a story file`);
    const entry = exports[part.subpath];
    assert.ok(entry, `${part.subpath} is missing from packages/ui exports`);
    assert.match(
      read(`packages/ui/${entry.default.replace(/^\.\//, "")}`),
      new RegExp(`\\b${part.name}\\b`),
      `${part.subpath} resolves to ${part.name}`,
    );
    assert.match(
      barrel,
      new RegExp(`\\b${part.name}\\b`),
      `${part.name} is in the barrel`,
    );
  }
});

test("C6: the firing mark is rust on grey, never verdigris, and still under reduced motion", () => {
  const mark = read(
    "packages/ui/src/composed/display/firing-mark/firing-mark.tsx",
  );
  assert.match(mark, /bg-category-clay-dot/);
  assert.match(mark, /bg-fill-muted/);
  assert.doesNotMatch(mark, /bg-now\b|bg-accent-mark/);
  // The breath is attached only where motion is allowed.
  assert.doesNotMatch(mark, /(?<!motion-safe:)animate-breathe/);
});
