import { afterEach, describe, expect, it, vi } from "vitest";

/**
 * MIG-17 C2: Web Push reads its VAPID pair through the package's env.ts,
 * when it is used rather than at import, so the same module answers both
 * ways as the environment changes.
 */

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe("Web Push reads VAPID through env.ts (MIG-17)", () => {
  it("MIG-17 C2: is unconfigured without the pair, and a send throws naming both keys", async () => {
    vi.stubEnv("NEXT_PUBLIC_VAPID_PUBLIC_KEY", "");
    vi.stubEnv("VAPID_PRIVATE_KEY", "");
    const { isVapidConfigured, sendWebPush } = await import("./web-push");
    expect(isVapidConfigured()).toBe(false);
    await expect(
      sendWebPush(
        {
          endpoint: "https://push.example/1",
          keys: { p256dh: "p", auth: "a" },
        },
        { title: "Walk" },
      ),
    ).rejects.toThrow(/NEXT_PUBLIC_VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY/);
  });

  it("MIG-17 C2: is configured once the pair and a subject are set, read when asked", async () => {
    vi.stubEnv("NEXT_PUBLIC_VAPID_PUBLIC_KEY", "public");
    vi.stubEnv("VAPID_PRIVATE_KEY", "private");
    vi.stubEnv("VAPID_SUBJECT", "mailto:push@example.com");
    const { isVapidConfigured } = await import("./web-push");
    expect(isVapidConfigured()).toBe(true);
    vi.stubEnv("VAPID_PRIVATE_KEY", "");
    expect(isVapidConfigured()).toBe(false);
  });
});
