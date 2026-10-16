/**
 * The one place a Linear token column is selected or written (USE-100).
 * Each select names its columns; nothing here returns a row whole, and
 * nothing outside `services/linear/` sees a ciphertext or a token.
 *
 * `withLockedTokens` holds the connection's row (`FOR UPDATE`) while a
 * refresh runs, so two instances refreshing the same connection serialize
 * on Postgres and the second sees the first's pair; whatever the callback
 * returns to write is one UPDATE of both tokens and the expiry together.
 */
import { eq } from "drizzle-orm";
import { linearConnections, type RlsClient } from "@syn/db";

export interface StoredLinearTokens {
  accessTokenCt: Buffer;
  refreshTokenCt: Buffer;
  tokenExpiresAt: Date;
}

export interface LinearTokenStore {
  read(connectionId: string): Promise<StoredLinearTokens | null>;
  withLockedTokens<T>(
    connectionId: string,
    run: (
      current: StoredLinearTokens,
    ) => Promise<{ write: StoredLinearTokens | null; result: T }>,
  ): Promise<T>;
  /** The Reconnect state: a refresh Linear refused. */
  markSyncError(connectionId: string, message: string): Promise<void>;
}

export class LinearConnectionMissing extends Error {
  constructor() {
    super("No such Linear connection.");
    this.name = "LinearConnectionMissing";
  }
}

const TOKEN_COLUMNS = {
  accessTokenCt: linearConnections.accessTokenCt,
  refreshTokenCt: linearConnections.refreshTokenCt,
  tokenExpiresAt: linearConnections.tokenExpiresAt,
};

export function createLinearTokenStore(rls: RlsClient): LinearTokenStore {
  return {
    async read(connectionId) {
      const rows = await rls.execute((tx) =>
        tx
          .select(TOKEN_COLUMNS)
          .from(linearConnections)
          .where(eq(linearConnections.id, connectionId))
          .limit(1),
      );
      return rows[0] ?? null;
    },

    withLockedTokens(connectionId, run) {
      return rls.execute(async (tx) => {
        const rows = await tx
          .select(TOKEN_COLUMNS)
          .from(linearConnections)
          .where(eq(linearConnections.id, connectionId))
          .limit(1)
          .for("update");
        const current = rows[0];
        if (!current) throw new LinearConnectionMissing();
        const { write, result } = await run(current);
        if (write) {
          await tx
            .update(linearConnections)
            .set({
              accessTokenCt: write.accessTokenCt,
              refreshTokenCt: write.refreshTokenCt,
              tokenExpiresAt: write.tokenExpiresAt,
              lastSyncError: null,
              updatedAt: new Date(),
            })
            .where(eq(linearConnections.id, connectionId));
        }
        return result;
      });
    },

    async markSyncError(connectionId, message) {
      await rls.execute((tx) =>
        tx
          .update(linearConnections)
          .set({ lastSyncError: message, updatedAt: new Date() })
          .where(eq(linearConnections.id, connectionId)),
      );
    },
  };
}
