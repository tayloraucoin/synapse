/**
 * The one place `google_accounts.refresh_token_ct` is selected (USE-103).
 * Each select names its columns; nothing here returns a row whole, and
 * nothing outside `services/google/` sees a ciphertext or a token. The
 * access token is never stored.
 */
import { eq } from "drizzle-orm";
import { googleAccounts, type RlsClient } from "@syn/db";

export interface GoogleTokenStore {
  readRefreshToken(accountId: string): Promise<Buffer | null>;
  /** A refresh that came back with a new refresh token (Google rarely sends one). */
  writeRefreshToken(
    accountId: string,
    refreshTokenCt: Buffer,
    refreshTokenExpiresAt: Date | null,
  ): Promise<void>;
  /** The Reconnect state, or a sync that failed: the last snapshot stays. */
  markSyncError(accountId: string, message: string): Promise<void>;
}

export class GoogleAccountMissing extends Error {
  constructor() {
    super("No such Google account.");
    this.name = "GoogleAccountMissing";
  }
}

export function createGoogleTokenStore(rls: RlsClient): GoogleTokenStore {
  return {
    async readRefreshToken(accountId) {
      const rows = await rls.execute((tx) =>
        tx
          .select({ refreshTokenCt: googleAccounts.refreshTokenCt })
          .from(googleAccounts)
          .where(eq(googleAccounts.id, accountId))
          .limit(1),
      );
      return rows[0]?.refreshTokenCt ?? null;
    },

    async writeRefreshToken(accountId, refreshTokenCt, refreshTokenExpiresAt) {
      await rls.execute((tx) =>
        tx
          .update(googleAccounts)
          .set({ refreshTokenCt, refreshTokenExpiresAt, updatedAt: new Date() })
          .where(eq(googleAccounts.id, accountId)),
      );
    },

    async markSyncError(accountId, message) {
      await rls.execute((tx) =>
        tx
          .update(googleAccounts)
          .set({ lastSyncError: message, updatedAt: new Date() })
          .where(eq(googleAccounts.id, accountId)),
      );
    },
  };
}
