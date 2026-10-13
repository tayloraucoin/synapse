import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { fileURLToPath } from "node:url";

// USE-4: the desk break is one token and one hook that agree. Read as text, so
// nothing here imports the app or the package.

const root = fileURLToPath(new URL("../", import.meta.url));
const read = (path: string) => readFileSync(`${root}${path}`, "utf8");

test("C1: preset.css defines --breakpoint-split: 1024px beside --breakpoint-wide: 768px, and useIsSplit matches (min-width: 1024px)", () => {
  const preset = read("packages/config/tailwind/preset.css");
  assert.match(preset, /--breakpoint-wide:\s*768px;/);
  assert.match(preset, /--breakpoint-split:\s*1024px;/);
  assert.equal(preset.match(/--breakpoint-[a-z0-9-]+:/g)?.length, 2);

  const hook = read("packages/ui/src/lib/use-media-query.ts");
  assert.match(
    hook,
    /export function useIsSplit\(\): boolean \{\s*return useMediaQuery\("\(min-width: 1024px\)"\);/,
  );
  assert.match(
    hook,
    /export function useIsWide\(\): boolean \{\s*return useMediaQuery\("\(min-width: 768px\)"\);/,
  );
  assert.match(read("packages/ui/src/index.ts"), /\buseIsSplit\b/);
});
