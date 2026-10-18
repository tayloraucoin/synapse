import { expect, test, type Page, type Request } from "@playwright/test";
import { env } from "../env";

/**
 * USE-106 C1: offline, Start then Prompt sent then Done on a work item; the
 * app killed while still offline and opened again online; the server gets
 * the three events once each, in order, with the times they were tapped.
 *
 * The live source on the local tier, signed in as the journeys' account
 * (`E2E_EMAIL`, `E2E_PASSWORD`), which has a work item on today. The clock's
 * write is recorded by a route on `clock.writeEvents` and answered there, so
 * nothing is stored; every read goes to the local server.
 *
 * The page is closed offline rather than reloaded: until USE-107 caches the
 * shell, a reload with no signal has no page to load. Opening it again is
 * the reload the persisted queue has to survive.
 */

const WRITE_EVENTS = "**/api/trpc/**clock.writeEvents**";

interface Recorded {
  kind: string;
  at: string;
  clientEventId: string;
}

/** The events in one batched tRPC call's body, superjson's `json` side. */
function eventsOf(request: Request): Recorded[] {
  const body = request.postDataJSON() as Record<
    string,
    { json: Recorded[] } | Recorded[]
  >;
  return Object.values(body).flatMap((call) =>
    Array.isArray(call) ? call : call.json,
  );
}

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

test("taps made offline replay once each, in order, with their own times", async ({
  context,
}) => {
  const recorded: Recorded[] = [];
  await context.route(WRITE_EVENTS, async (route) => {
    const events = eventsOf(route.request());
    recorded.push(...events);
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify(
        events.map((event, i) => ({
          result: { data: { json: [{ id: `e2e-${i}`, ...event }] } },
        })),
      ),
    });
  });

  const page = await context.newPage();
  await signIn(page);
  const card = page.getByRole("article").filter({
    has: page.getByRole("button", { name: "Start", exact: true }),
  });
  await expect(card.first()).toBeVisible();

  await context.setOffline(true);
  const tapped: string[] = [];
  for (const name of ["Start", "Prompt sent", "Done"]) {
    tapped.push(new Date().toISOString());
    await card.first().getByRole("button", { name, exact: true }).click();
    await page.waitForTimeout(1_100);
  }
  expect(recorded).toEqual([]);

  // The persister writes at most once a second: let the last tap land.
  await page.waitForTimeout(1_500);
  await page.close();
  await context.setOffline(false);

  const again = await context.newPage();
  await again.goto("/today");
  await expect.poll(() => recorded.length, { timeout: 15_000 }).toBe(3);

  expect(recorded.map((e) => e.kind)).toEqual([
    "started",
    "prompt_sent",
    "done",
  ]);
  expect(new Set(recorded.map((e) => e.clientEventId)).size).toBe(3);
  recorded.forEach((event, i) => {
    const drift = Math.abs(Date.parse(event.at) - Date.parse(tapped[i]!));
    expect(drift).toBeLessThan(1_000);
  });
});
