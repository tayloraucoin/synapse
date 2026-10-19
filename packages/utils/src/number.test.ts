import { describe, expect, it } from "vitest";
import { clamp, formatBytes, roundToStep } from "./number";

describe("clamp", () => {
  it("keeps a value inside the range", () => {
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(-3, 0, 10)).toBe(0);
    expect(clamp(42, 0, 10)).toBe(10);
  });
});

describe("formatBytes", () => {
  it("reports small counts in bytes", () => {
    expect(formatBytes(0)).toBe("0 bytes");
    expect(formatBytes(999)).toBe("999 bytes");
  });

  it("uses decimal units, whole KB and one place from MB up", () => {
    expect(formatBytes(1000)).toBe("1 KB");
    expect(formatBytes(412_300)).toBe("412 KB");
    expect(formatBytes(2_100_000)).toBe("2.1 MB");
    expect(formatBytes(3_000_000_000)).toBe("3 GB");
  });

  it("stays in GB past the largest unit", () => {
    expect(formatBytes(5_000_000_000_000)).toBe("5000 GB");
  });

  it("treats invalid input as zero", () => {
    expect(formatBytes(-1)).toBe("0 bytes");
    expect(formatBytes(Number.NaN)).toBe("0 bytes");
    expect(formatBytes(Number.POSITIVE_INFINITY)).toBe("0 bytes");
  });
});

describe("roundToStep", () => {
  it("snaps to the nearest multiple", () => {
    expect(roundToStep(22, 15)).toBe(15);
    expect(roundToStep(23, 15)).toBe(30);
  });

  it("anchors the steps at the origin", () => {
    expect(roundToStep(12, 10, 5)).toBe(15);
  });

  it("returns the value when the step is not positive", () => {
    expect(roundToStep(7, 0)).toBe(7);
    expect(roundToStep(7, -5)).toBe(7);
  });
});
