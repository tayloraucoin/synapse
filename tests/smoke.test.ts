import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("the root package is readable and named", () => {
  const pkg = JSON.parse(
    readFileSync(new URL("../package.json", import.meta.url), "utf8"),
  );
  assert.equal(typeof pkg.name, "string");
});
