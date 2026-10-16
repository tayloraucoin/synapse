/**
 * A connection's access token, refreshed when it has expired or Linear
 * answered 401 (USE-100, C7).
 *
 * SINGLE-FLIGHT. Linear rotates the refresh token, so two refreshes racing
 * with the same one would leave one of them holding a dead token. Within an
 * instance, concurrent callers for one connection share one promise; across
 * instances, the row lock (`withLockedTokens`) serializes them, and the
 * second finds the pair already fresh and makes no call. The new access and
 * refresh tokens are written together, in one UPDATE.
 *
 * A refresh Linear refuses sets `last_sync_error` (the Reconnect state) and
 * throws `LinearReconnectNeeded`.
 */
import { decryptToken, encryptToken } from "../integrations/token-crypto";
import { LinearOAuthError, refreshLinearTokens, type FetchLike } from "./oauth";
import {
  LinearConnectionMissing,
  type LinearTokenStore,
  type StoredLinearTokens,
} from "./token-store";

/** Refresh a little early, so a call never starts with a token about to lapse. */
const EARLY_MS = 60_000;

export const LINEAR_RECONNECT_MESSAGE = "Reconnect";

export class LinearReconnectNeeded extends Error {
  constructor() {
    super("Linear refused the refresh; the workspace needs reconnecting.");
    this.name = "LinearReconnectNeeded";
  }
}

export interface LinearTokensDeps {
  store: LinearTokenStore;
  fetch: FetchLike;
  key: Buffer;
  clientId: string;
  now?: () => Date;
}

/** One promise per connection while its refresh runs, in this instance. */
const inFlight = new Map<string, Promise<string>>();

export function createLinearTokens(deps: LinearTokensDeps) {
  const now = deps.now ?? (() => new Date());

  const expired = (tokens: StoredLinearTokens) =>
    tokens.tokenExpiresAt.getTime() - EARLY_MS <= now().getTime();

  async function runRefresh(
    connectionId: string,
    rejected: string | undefined,
  ): Promise<string> {
    try {
      return await deps.store.withLockedTokens(
        connectionId,
        async (current) => {
          const access = decryptToken(current.accessTokenCt, deps.key);
          // Another refresh got here first: its pair stands, no call to Linear.
          const stillGood =
            rejected === undefined ? !expired(current) : access !== rejected;
          if (stillGood) return { write: null, result: access };

          const pair = await refreshLinearTokens(
            deps.fetch,
            {
              refreshToken: decryptToken(current.refreshTokenCt, deps.key),
              clientId: deps.clientId,
            },
            now(),
          );
          return {
            write: {
              accessTokenCt: encryptToken(pair.accessToken, deps.key),
              refreshTokenCt: encryptToken(pair.refreshToken, deps.key),
              tokenExpiresAt: pair.expiresAt,
            },
            result: pair.accessToken,
          };
        },
      );
    } catch (error) {
      if (error instanceof LinearOAuthError) {
        await deps.store.markSyncError(connectionId, LINEAR_RECONNECT_MESSAGE);
        throw new LinearReconnectNeeded();
      }
      throw error;
    }
  }

  /**
   * Refreshes the connection's pair once, however many callers ask at once.
   * `rejected` is the access token Linear just answered 401 to; without it,
   * the pair is refreshed only if it has expired.
   */
  function refresh(
    connectionId: string,
    options: { rejected?: string } = {},
  ): Promise<string> {
    const running = inFlight.get(connectionId);
    if (running) return running;
    const started = runRefresh(connectionId, options.rejected).finally(() => {
      inFlight.delete(connectionId);
    });
    inFlight.set(connectionId, started);
    return started;
  }

  /** The access token to call Linear with, refreshed first if it has expired. */
  async function accessToken(connectionId: string): Promise<string> {
    const current = await deps.store.read(connectionId);
    if (!current) throw new LinearConnectionMissing();
    if (expired(current)) return refresh(connectionId);
    return decryptToken(current.accessTokenCt, deps.key);
  }

  return { accessToken, refresh };
}
