import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

// USE-143: Vercel ran the turbo build directly and never staged the emoji
// dataset, so the picker's Emoji tab was blank in production. The build goes
// through the root web:build, which copies it first, outside turbo's cache.

const web = path.resolve(__dirname, "../..");
const read = (file: string) =>
  JSON.parse(readFileSync(path.join(web, file), "utf8")) as {
    buildCommand?: string;
    scripts?: Record<string, string>;
  };

describe("the production build on Vercel", () => {
  it("runs the root web:build", () => {
    expect(read("vercel.json").buildCommand).toBe("cd ../.. && yarn web:build");
  });

  it("whose first step stages the emoji data", () => {
    const build = read("../../package.json").scripts?.["web:build"] ?? "";
    expect(build.startsWith("yarn emoji-data && ")).toBe(true);
    expect(build).toContain("turbo run build --filter=web");
  });
});
