import { expect, test, type Page } from "@playwright/test";
import { env } from "./env";

/**
 * USE-114 C1: with a new build's worker waiting, the shell shows SY-02's
 * line, and *Reload* reloads into the new build. Signed in as the journeys'
 * account (`E2E_EMAIL`, `E2E_PASSWORD`), on the local dev server. The new
 * build is `/sw.js?build=next`, the URL a new deploy's page registers.
 */

async function signIn(page: Page) {
  await page.goto("/signin?next=/today");
  await page.getByLabel("Email").fill(env.e2e.email!);
  await page.getByLabel("Password").fill(env.e2e.password!);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await page.waitForURL("**/today**");
}

test.skip(
  !env.e2e.email || !env.e2e.password,
  "E2E_EMAIL and E2E_PASSWORD name the local test account",
);

test("C1: a waiting worker raises the update line; Reload lands on the new build", async ({
  context,
}) => {
  const page = await context.newPage();
  await signIn(page);
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  await expect
    .poll(() => page.evaluate(() => !!navigator.serviceWorker.controller))
    .toBe(true);

  const status = page.getByRole("complementary", { name: "App status" });
  // Nothing waits yet, so no line.
  await expect(status).toHaveCount(0);

  // Same scope, so the registration leaf's `updatefound` sees the new build.
  await page.evaluate(() =>
    navigator.serviceWorker.register("/sw.js?build=next", {
      scope: "/",
      updateViaCache: "none",
    }),
  );

  await expect(status.getByText("A new version is ready.")).toBeVisible();
  // No dismiss: a new version is a fact.
  await expect(status.getByRole("button")).toHaveCount(1);
  // Never a reload without the tap: the old build still controls the page.
  expect(
    await page.evaluate(() => navigator.serviceWorker.controller?.scriptURL),
  ).not.toContain("build=next");

  await Promise.all([
    page.waitForEvent("load"),
    status.getByRole("button", { name: "Reload" }).click(),
  ]);
  await expect
    .poll(() =>
      page.evaluate(() => navigator.serviceWorker.controller?.scriptURL ?? ""),
    )
    .toContain("build=next");
  await expect(
    page.getByRole("complementary", { name: "App status" }),
  ).toHaveCount(0);
});
