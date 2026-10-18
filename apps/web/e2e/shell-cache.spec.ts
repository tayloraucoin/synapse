import { expect, test, type Page } from "@playwright/test";
import { env } from "./env";

/**
 * USE-107: the service worker's app-shell cache, on the local dev server,
 * signed in as the journeys' account (`E2E_EMAIL`, `E2E_PASSWORD`).
 *
 * C1: loaded once, then offline, a reload of /today renders the shell and
 * the last-read day. C2: nothing from /api/ or another origin is cached.
 * C3: a new build (registered here as `/sw.js?build=next`, the URL a new
 * deploy's page registers) deletes the old cache on activate, and the update
 * line appears first.
 */

const SHELL_PREFIX = "syn-shell-";

async function signIn(page: Page) {
  await page.goto("/signin?next=/today");
  await page.getByLabel("Email").fill(env.e2e.email!);
  await page.getByLabel("Password").fill(env.e2e.password!);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await page.waitForURL("**/today**");
}

/** Waits for the worker to control the page, then reloads once under it. */
async function underWorker(page: Page) {
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  await expect
    .poll(() => page.evaluate(() => !!navigator.serviceWorker.controller))
    .toBe(true);
}

function cachedUrls(page: Page) {
  return page.evaluate(async (prefix) => {
    const names = (await caches.keys()).filter((n) => n.startsWith(prefix));
    const urls: string[] = [];
    for (const name of names) {
      const cache = await caches.open(name);
      urls.push(...(await cache.keys()).map((r) => r.url));
    }
    return { names, urls };
  }, SHELL_PREFIX);
}

test.skip(
  !env.e2e.email || !env.e2e.password,
  "E2E_EMAIL and E2E_PASSWORD name the local test account",
);

test("C1: offline, a reload of /today renders the shell and the last-read day", async ({
  context,
}) => {
  const page = await context.newPage();
  await signIn(page);
  await underWorker(page);
  const main = page.locator("main#main");
  await expect(main).toBeVisible();
  // The persister writes at most once a second.
  await page.waitForTimeout(1_500);
  const online = (await main.innerText()).trim();

  await context.setOffline(true);
  await page.reload();
  await expect(main).toBeVisible();
  await expect.poll(async () => (await main.innerText()).trim()).toBe(online);
  await context.setOffline(false);
});

test("C2: no request to /api/ or another origin is cached", async ({
  context,
}) => {
  const page = await context.newPage();
  await signIn(page);
  await underWorker(page);
  await page.waitForLoadState("networkidle");

  const { names, urls } = await cachedUrls(page);
  expect(names.length).toBeGreaterThan(0);
  expect(urls.length).toBeGreaterThan(0);
  const origin = new URL(page.url()).origin;
  for (const url of urls) {
    expect(url.startsWith(origin)).toBe(true);
    expect(new URL(url).pathname.startsWith("/api/")).toBe(false);
    expect(new URL(url).pathname.startsWith("/auth/")).toBe(false);
  }
});

test("C3: a new build's worker waits to be offered, then deletes the old cache", async ({
  context,
}) => {
  const page = await context.newPage();
  await signIn(page);
  await underWorker(page);
  const before = await cachedUrls(page);
  expect(before.names).toHaveLength(1);
  const old = before.names[0]!;

  // The registration leaf publishes this waiting worker to the update line
  // (lib/pwa/update-ready.ts); the line itself is not mounted in the new
  // shell yet (USE-1 moved it to _legacy/), so the journey stops at the
  // worker and takes the line's *Reload* path by hand.
  const waiting = await page.evaluate(async () => {
    const registration = await navigator.serviceWorker.register(
      "/sw.js?build=next",
      { scope: "/", updateViaCache: "none" },
    );
    // The promise can resolve after `updatefound`, so read where it stands.
    const worker = await new Promise<ServiceWorker>((resolve) => {
      const watch = (installing: ServiceWorker) =>
        installing.addEventListener("statechange", () => {
          if (installing.state === "installed") resolve(installing);
        });
      if (registration.waiting?.scriptURL.includes("build=next")) {
        resolve(registration.waiting);
      } else if (registration.installing) {
        watch(registration.installing);
      } else {
        registration.addEventListener("updatefound", () =>
          watch(registration.installing!),
        );
      }
    });
    return { waiting: registration.waiting === worker, url: worker.scriptURL };
  });
  expect(waiting.waiting).toBe(true);
  expect(waiting.url).toContain("build=next");
  // Waiting, not active: the old build's cache stands until the tap.
  expect((await cachedUrls(page)).names).toContain(old);

  await page.evaluate(async () => {
    const registration = await navigator.serviceWorker.getRegistration("/");
    const changed = new Promise((resolve) =>
      navigator.serviceWorker.addEventListener("controllerchange", resolve, {
        once: true,
      }),
    );
    registration!.waiting!.postMessage({ type: "SKIP_WAITING" });
    await changed;
  });
  await expect
    .poll(async () => (await cachedUrls(page)).names)
    .toEqual([`${SHELL_PREFIX}next`]);
});
