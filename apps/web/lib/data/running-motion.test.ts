import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { HELD_FIGURE_CLASS } from "@/components/planner/running-card";

/**
 * C8: the paused figure's pulse sits under `prefers-reduced-motion:
 * no-preference` (Tailwind's `motion-safe:`) and the reduced rule holds it at
 * 60% (`motion-reduce:opacity-60`); the pulse itself is 100% to 40% over the
 * 2 s `--dur-pulse`.
 */
const read = (path: string) =>
  readFileSync(fileURLToPath(new URL(path, import.meta.url)), "utf8");

describe("C8: the paused pulse and reduced motion", () => {
  const classes = HELD_FIGURE_CLASS.split(" ");

  it("attaches the pulse only where motion is allowed", () => {
    const pulse = classes.filter((name) => name.includes("animate-"));
    expect(pulse).toEqual(["motion-safe:animate-held"]);
  });

  it("holds the figure at 60% under reduced motion", () => {
    expect(classes).toContain("motion-reduce:opacity-60");
  });

  it("pulses 100% to 40% over --dur-pulse, 2 s", () => {
    const globals = read("../../../../packages/ui/src/styles/globals.css");
    expect(globals).toMatch(
      /--animate-held:\s*syn-held var\(--dur-pulse\) ease-in-out infinite/,
    );
    const frames = globals.slice(globals.indexOf("@keyframes syn-held"));
    expect(frames).toMatch(/opacity:\s*1;[\s\S]*opacity:\s*0\.4;/);
    const preset = read("../../../../packages/config/tailwind/preset.css");
    expect(preset).toMatch(/--dur-pulse:\s*2000ms;/);
  });
});
