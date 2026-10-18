import { afterEach, describe, expect, it, vi } from "vitest";
import { clearShellCache } from "./shell-cache";

describe("clearShellCache", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("deletes every build's shell cache and nothing else", async () => {
    const names = new Set(["syn-shell-dev", "syn-shell-abc", "other"]);
    vi.stubGlobal("caches", {
      keys: async () => [...names],
      delete: async (name: string) => names.delete(name),
    });

    await clearShellCache();

    expect([...names]).toEqual(["other"]);
  });

  it("does nothing where there is no Cache Storage", async () => {
    await expect(clearShellCache()).resolves.toBeUndefined();
  });
});
