/**
 * What the web app's routes and the Google router call (USE-103). Each reads
 * the client and the key itself (`config.ts`), so neither leaves this folder,
 * and each uses the real `fetch`. The pieces they compose take their
 * dependencies, for the tests.
 */
import { eq } from "drizzle-orm";
import { users, type RlsClient } from "@syn/db";
import { mondayOf, toDateKey } from "@syn/utils";
import type { GoogleDayEvent } from "@syn/validators";
import { googleServiceConfig } from "./config";
import { completeGoogleConnect } from "./connect";
import { disconnectGoogle } from "./disconnect";
import { googleEventsOn } from "./events";
import { buildGoogleAuthorizeUrl, createGoogleAuthorization } from "./oauth";
import { encodeGoogleOAuthCookie } from "./oauth-cookie";
import { selectGoogleRows } from "./read-events";
import { ensureGoogleWeek, type GoogleSyncDeps } from "./sync";
import { createGoogleTokenStore } from "./token-store";

/** The start route's redirect and the cookie it sets, for one connect. */
export function startGoogleConnect(input: {
  redirectUri: string;
  returnTo: string;
}): { authorizeUrl: string; cookie: string } {
  const { clientId } = googleServiceConfig();
  const { state, verifier, challenge } = createGoogleAuthorization();
  return {
    authorizeUrl: buildGoogleAuthorizeUrl({
      clientId,
      redirectUri: input.redirectUri,
      state,
      challenge,
    }),
    cookie: encodeGoogleOAuthCookie({
      state,
      verifier,
      return: input.returnTo,
    }),
  };
}

/** The callback's exchange and write, once `handleGoogleCallback` has checked it; then this week's first sync. */
export async function finishGoogleConnect(
  rls: RlsClient,
  userId: string,
  input: { code: string; verifier: string; redirectUri: string },
): Promise<void> {
  const config = googleServiceConfig();
  await completeGoogleConnect(rls, userId, input, { fetch, ...config });
  const timeZone = await rls.execute(async (tx) => {
    const [account] = await tx
      .select({ timeZone: users.timezone })
      .from(users)
      .where(eq(users.id, userId));
    return account?.timeZone ?? "UTC";
  });
  const today = toDateKey(new Date(), timeZone);
  // The first sync is a courtesy: a failure here is the next read's to retry.
  await ensureGoogleWeek(rls, userId, mondayOf(today), syncDeps(rls)).catch(
    () => undefined,
  );
}

function syncDeps(rls: RlsClient): GoogleSyncDeps {
  return {
    store: createGoogleTokenStore(rls),
    fetch,
    ...googleServiceConfig(),
  };
}

export function disconnectGoogleAccount(
  rls: RlsClient,
  accountId: string,
): Promise<void> {
  const { key } = googleServiceConfig();
  return disconnectGoogle(rls, createGoogleTokenStore(rls), accountId, {
    fetch,
    key,
  });
}

/** Sync now: the week of `date`, every account. */
export function syncGoogleNow(
  rls: RlsClient,
  userId: string,
  date: string,
): Promise<void> {
  return ensureGoogleWeek(rls, userId, mondayOf(date), syncDeps(rls), {
    force: true,
  });
}

/**
 * `google.events`: a date's events, after syncing its week where the
 * snapshot is stale. A sync that fails reads the last snapshot.
 */
export async function readGoogleEventsFor(
  rls: RlsClient,
  userId: string,
  date: string,
): Promise<GoogleDayEvent[]> {
  await ensureGoogleWeek(rls, userId, mondayOf(date), syncDeps(rls));
  return rls.execute(async (tx) => {
    const [account] = await tx
      .select({ timeZone: users.timezone })
      .from(users)
      .where(eq(users.id, userId));
    if (!account) throw new Error("No account row.");
    const rows = await selectGoogleRows(tx, [date]);
    return googleEventsOn(
      rows.googleSnapshots,
      rows.googleCalendars,
      date,
      account.timeZone,
    );
  });
}
