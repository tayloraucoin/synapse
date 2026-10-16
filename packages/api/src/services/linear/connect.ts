/**
 * The callback's write (USE-100): the code for a pair, the pair for the
 * workspace's name, then one upsert of the connection inside RLS. A
 * workspace connected again (the same organization) keeps its row, its
 * client mapping and its items, and takes the new pair. Returns the id only.
 */
import { sql } from "drizzle-orm";
import { linearConnections, type RlsClient } from "@syn/db";
import { encryptToken } from "../integrations/token-crypto";
import { exchangeLinearCode, type FetchLike } from "./oauth";
import { readLinearOrganization } from "./organization";

export interface CompleteLinearConnectInput {
  code: string;
  verifier: string;
  redirectUri: string;
}

export interface LinearConnectDeps {
  fetch: FetchLike;
  key: Buffer;
  clientId: string;
  now?: () => Date;
}

export async function completeLinearConnect(
  rls: RlsClient,
  userId: string,
  input: CompleteLinearConnectInput,
  deps: LinearConnectDeps,
): Promise<{ connectionId: string }> {
  const now = deps.now?.() ?? new Date();
  const pair = await exchangeLinearCode(
    deps.fetch,
    {
      code: input.code,
      verifier: input.verifier,
      clientId: deps.clientId,
      redirectUri: input.redirectUri,
    },
    now,
  );
  const organization = await readLinearOrganization(
    deps.fetch,
    pair.accessToken,
  );
  const tokens = {
    accessTokenCt: encryptToken(pair.accessToken, deps.key),
    refreshTokenCt: encryptToken(pair.refreshToken, deps.key),
    tokenExpiresAt: pair.expiresAt,
    scopes: pair.scopes,
  };

  const rows = await rls.execute((tx) =>
    tx
      .insert(linearConnections)
      .values({
        userId,
        organizationId: organization.id,
        name: organization.name,
        urlKey: organization.urlKey,
        logoUrl: organization.logoUrl,
        ...tokens,
      })
      .onConflictDoUpdate({
        target: [linearConnections.userId, linearConnections.organizationId],
        set: {
          name: organization.name,
          urlKey: organization.urlKey,
          logoUrl: organization.logoUrl,
          ...tokens,
          lastSyncError: null,
          updatedAt: sql`now()`,
        },
      })
      .returning({ id: linearConnections.id }),
  );
  const row = rows[0];
  if (!row) throw new Error("The Linear connection was not stored.");
  return { connectionId: row.id };
}
