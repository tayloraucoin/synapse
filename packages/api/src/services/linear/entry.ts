/**
 * What the web app's routes and the Linear router call (USE-100). Each reads
 * the client id and the key itself (`config.ts`), so the key never leaves
 * this folder, and each uses the real `fetch`. The pieces they compose take
 * their dependencies, for the tests.
 */
import type { RlsClient } from "@syn/db";
import type { LinearReadOutput } from "@syn/validators";
import { linearServiceConfig } from "./config";
import { completeLinearConnect } from "./connect";
import { disconnectLinear } from "./disconnect";
import { buildLinearAuthorizeUrl, createLinearAuthorization } from "./oauth";
import { encodeLinearOAuthCookie } from "./oauth-cookie";
import { readLinear } from "./read";
import { createLinearTokens } from "./refresh";
import { syncLinear, type LinearSyncDeps } from "./sync";
import { createLinearSyncStore } from "./sync-store";
import { createLinearTokenStore } from "./token-store";

/** The start route's redirect and the cookie it sets, for one connect. */
export function startLinearConnect(input: {
  redirectUri: string;
  returnTo: string;
}): { authorizeUrl: string; cookie: string } {
  const { clientId } = linearServiceConfig();
  const { state, verifier, challenge } = createLinearAuthorization();
  return {
    authorizeUrl: buildLinearAuthorizeUrl({
      clientId,
      redirectUri: input.redirectUri,
      state,
      challenge,
    }),
    cookie: encodeLinearOAuthCookie({
      state,
      verifier,
      return: input.returnTo,
    }),
  };
}

/** The callback's exchange and write, once `handleLinearCallback` has checked it. */
export async function finishLinearConnect(
  rls: RlsClient,
  userId: string,
  input: { code: string; verifier: string; redirectUri: string },
): Promise<void> {
  const { clientId, key } = linearServiceConfig();
  await completeLinearConnect(rls, userId, input, { fetch, key, clientId });
}

export function disconnectLinearConnection(
  rls: RlsClient,
  connectionId: string,
): Promise<void> {
  const { key } = linearServiceConfig();
  return disconnectLinear(rls, createLinearTokenStore(rls), connectionId, {
    fetch,
    key,
  });
}

/** A connection's access token for a call to Linear inside `@syn/api` (USE-101's sync). */
export function linearTokensFor(rls: RlsClient) {
  const { clientId, key } = linearServiceConfig();
  return createLinearTokens({
    store: createLinearTokenStore(rls),
    fetch,
    key,
    clientId,
  });
}

function linearSyncDeps(rls: RlsClient, userId: string): LinearSyncDeps {
  return {
    store: createLinearSyncStore(rls, userId),
    // Read the config only when a connection is due, so an account with no
    // workspace never needs the Linear app's environment.
    tokens: {
      accessToken: (id) => linearTokensFor(rls).accessToken(id),
      refresh: (id, options) => linearTokensFor(rls).refresh(id, options),
    },
    fetch,
  };
}

/**
 * `linear.read` (USE-101): a connection whose snapshot is two minutes old
 * is synced first (the cadence's server side), then the snapshots are read.
 */
export async function readLinearFor(
  rls: RlsClient,
  userId: string,
): Promise<LinearReadOutput> {
  await syncLinear(linearSyncDeps(rls, userId));
  return readLinear(rls);
}

/** Sync now: one workspace or every one, refused within 30 s of the last. */
export async function syncLinearNow(
  rls: RlsClient,
  userId: string,
  connectionId?: string,
): Promise<LinearReadOutput> {
  await syncLinear(linearSyncDeps(rls, userId), {
    connectionId,
    force: true,
  });
  return readLinear(rls);
}
