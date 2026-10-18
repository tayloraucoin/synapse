/**
 * Disconnect a Google account (USE-103): revoke the refresh token at Google
 * (the grant goes with it), then delete the row; its calendars and
 * snapshots go with it (on delete cascade). A 400 counts as done; any other
 * failure keeps the row, so a grant is never orphaned. A token that will not
 * decrypt (the key changed) cannot be revoked by us; the row goes anyway.
 */
import { eq } from "drizzle-orm";
import { googleAccounts, type RlsClient } from "@syn/db";
import { decryptToken, TokenDecryptError } from "../integrations/token-crypto";
import { revokeGoogleToken, type FetchLike } from "./oauth";
import { GoogleAccountMissing, type GoogleTokenStore } from "./token-store";

export async function disconnectGoogle(
  rls: RlsClient,
  store: GoogleTokenStore,
  accountId: string,
  deps: { fetch: FetchLike; key: Buffer },
): Promise<void> {
  const ciphertext = await store.readRefreshToken(accountId);
  if (!ciphertext) throw new GoogleAccountMissing();

  let token: string | null = null;
  try {
    token = decryptToken(ciphertext, deps.key);
  } catch (error) {
    if (!(error instanceof TokenDecryptError)) throw error;
  }
  if (token !== null) await revokeGoogleToken(deps.fetch, token);

  await rls.execute((tx) =>
    tx.delete(googleAccounts).where(eq(googleAccounts.id, accountId)),
  );
}
