/**
 * An account's access token for one sync (USE-103): the stored refresh token
 * for a fresh access token, held in memory only. `invalid_grant` sets
 * `last_sync_error` to Reconnect and throws `GoogleReconnectNeeded`; the
 * account's snapshots are left as they were.
 */
import { decryptToken, encryptToken } from "../integrations/token-crypto";
import { GoogleOAuthError, refreshGoogleAccess, type FetchLike } from "./oauth";
import { GoogleAccountMissing, type GoogleTokenStore } from "./token-store";

export const GOOGLE_RECONNECT_MESSAGE = "Reconnect";

export class GoogleReconnectNeeded extends Error {
  constructor() {
    super("Google refused the refresh; the account needs reconnecting.");
    this.name = "GoogleReconnectNeeded";
  }
}

export interface GoogleTokensDeps {
  store: GoogleTokenStore;
  fetch: FetchLike;
  key: Buffer;
  clientId: string;
  clientSecret: string;
  now?: () => Date;
}

export async function googleAccessToken(
  accountId: string,
  deps: GoogleTokensDeps,
): Promise<string> {
  const ciphertext = await deps.store.readRefreshToken(accountId);
  if (!ciphertext) throw new GoogleAccountMissing();
  try {
    const tokens = await refreshGoogleAccess(
      deps.fetch,
      {
        refreshToken: decryptToken(ciphertext, deps.key),
        clientId: deps.clientId,
        clientSecret: deps.clientSecret,
      },
      deps.now?.() ?? new Date(),
    );
    if (tokens.refreshToken) {
      await deps.store.writeRefreshToken(
        accountId,
        encryptToken(tokens.refreshToken, deps.key),
        tokens.refreshExpiresAt,
      );
    }
    return tokens.accessToken;
  } catch (error) {
    if (error instanceof GoogleOAuthError && error.invalidGrant) {
      await deps.store.markSyncError(accountId, GOOGLE_RECONNECT_MESSAGE);
      throw new GoogleReconnectNeeded();
    }
    throw error;
  }
}
