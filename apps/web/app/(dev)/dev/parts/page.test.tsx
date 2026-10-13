import type * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const env = vi.hoisted(() => ({ NODE_ENV: "development" }));

vi.mock("@/env", () => ({ env }));
// The shell's frame reads the pathname; here it is a plain wrapper.
vi.mock("@/app/(shell)/_components/app-shell", () => ({
  AppShell: ({ children }: { children: React.ReactNode }) => (
    <div data-frame="shell">{children}</div>
  ),
}));

const { registerPart } = await import("@/lib/fixtures/parts");
const { default: DevPartsPage } = await import("./page");

registerPart("test-part-a", () => <p>Part A drawn</p>);
registerPart("test-part-b", () => <p>Part B drawn</p>);

async function render(state?: string) {
  const element = await DevPartsPage({
    searchParams: Promise.resolve(state === undefined ? {} : { state }),
  });
  return renderToStaticMarkup(element);
}

describe("C8: /dev/parts", () => {
  beforeEach(() => {
    env.NODE_ENV = "development";
  });

  it("renders the part ?state= names inside the shell's frame", async () => {
    const html = await render("test-part-b");
    expect(html).toContain('data-frame="shell"');
    expect(html).toContain("Part B drawn");
    expect(html).not.toContain("Part A drawn");
  });

  it("lists every registered name when none is given", async () => {
    const html = await render();
    expect(html).toContain("/dev/parts?state=test-part-a");
    expect(html).toContain("/dev/parts?state=test-part-b");
    expect(html).not.toContain("drawn");
  });

  it("is not found in a production build", async () => {
    env.NODE_ENV = "production";
    await expect(render("test-part-a")).rejects.toThrow();
    await expect(render()).rejects.toThrow();
  });
});
