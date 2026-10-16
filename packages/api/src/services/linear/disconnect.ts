/**
 * ··· › Disconnect (USE-100): revoke at Linear, then delete the row; its
 * snapshots, project mappings and outbox go with it (on delete cascade), and
 * its work items stay in the pool, unlinked (set null).
 *
 * Both tokens are revoked; a 400 (already revoked or expired) counts as
 * done. Any other failure keeps the row, so a grant is never orphaned, and
 * the screen says "Not saved. Try again." A token that will not decrypt
 * (the key changed) cannot be revoked by us; the row is removed anyway and
 * the grant is Taylor's to remove in Linear.
 */
import { eq } from "drizzle-orm";
import { linearConnections, type RlsClient } from "@syn/db";
import { decryptToken, TokenDecryptError } from "../integrations/token-crypto";
import { revokeLinearToken, type FetchLike } from "./oauth";
import { LinearConnectionMissing, type LinearTokenStore } from "./token-store";

export async function disconnectLinear(
  rls: RlsClient,
  store: LinearTokenStore,
  connectionId: string,
  deps: { fetch: FetchLike; key: Buffer },
): Promise<void> {
  const tokens = await store.read(connectionId);
  if (!tokens) throw new LinearConnectionMissing();

  for (const ciphertext of [tokens.refreshTokenCt, tokens.accessTokenCt]) {
    let token: string;
    try {
      token = decryptToken(ciphertext, deps.key);
    } catch (error) {
      if (error instanceof TokenDecryptError) continue;
      throw error;
    }
    await revokeLinearToken(deps.fetch, token);
  }

  await rls.execute((tx) =>
    tx.delete(linearConnections).where(eq(linearConnections.id, connectionId)),
  );
}
