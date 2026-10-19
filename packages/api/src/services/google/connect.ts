/**
 * The callback's write (USE-103): the code for the tokens, the calendar list
 * for the account's address and label, then the account and its calendars
 * inside RLS. The address is the primary calendar's id and the label its
 * summary, so no profile scope is asked for [devs_call: the recommended
 * label]. An account connected again (the same address) keeps its row,
 * its switches and its snapshots, and takes the new refresh token.
 */
import { eq, sql } from "drizzle-orm";
import { z } from "zod";
import { googleAccounts, type RlsClient } from "@syn/db";
import { encryptToken } from "../integrations/token-crypto";
import { writeCalendars } from "./calendars";
import { createGoogleCalendarClient, type GoogleClientDeps } from "./client";
import { exchangeGoogleCode, type FetchLike } from "./oauth";

export interface CompleteGoogleConnectInput {
  code: string;
  verifier: string;
  redirectUri: string;
}

export interface GoogleConnectDeps {
  fetch: FetchLike;
  key: Buffer;
  clientId: string;
  clientSecret: string;
  now?: () => Date;
  sleep?: GoogleClientDeps["sleep"];
}

export class GoogleConnectError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GoogleConnectError";
  }
}

const email = z.string().email();

export async function completeGoogleConnect(
  rls: RlsClient,
  userId: string,
  input: CompleteGoogleConnectInput,
  deps: GoogleConnectDeps,
): Promise<{ accountId: string }> {
  const tokens = await exchangeGoogleCode(
    deps.fetch,
    {
      code: input.code,
      verifier: input.verifier,
      clientId: deps.clientId,
      clientSecret: deps.clientSecret,
      redirectUri: input.redirectUri,
    },
    deps.now?.() ?? new Date(),
  );
  if (!tokens.refreshToken) {
    throw new GoogleConnectError("Google sent no refresh token.");
  }
  const entries = await createGoogleCalendarClient(tokens.accessToken, {
    fetch: deps.fetch,
    sleep: deps.sleep,
  }).listCalendars();
  const primary = entries.find((entry) => entry.primary && !entry.deleted);
  const address = email.safeParse(primary?.id);
  if (!primary || !address.success) {
    throw new GoogleConnectError(
      "The account's primary calendar was not read.",
    );
  }

  const secret = {
    refreshTokenCt: encryptToken(tokens.refreshToken, deps.key),
    refreshTokenExpiresAt: tokens.refreshExpiresAt,
  };
  const label = primary.summaryOverride ?? primary.summary;

  const accountId = await rls.execute(async (tx) => {
    const [existing] = await tx
      .select({ id: googleAccounts.id })
      .from(googleAccounts)
      .where(eq(googleAccounts.email, address.data))
      .limit(1);
    if (existing) {
      await tx
        .update(googleAccounts)
        .set({ ...secret, label, lastSyncError: null, updatedAt: sql`now()` })
        .where(eq(googleAccounts.id, existing.id));
      return existing.id;
    }
    const [row] = await tx
      .insert(googleAccounts)
      .values({ userId, email: address.data, label, ...secret })
      .returning({ id: googleAccounts.id });
    if (!row)
      throw new GoogleConnectError("The Google account was not stored.");
    return row.id;
  });

  await writeCalendars(rls, userId, accountId, entries);
  return { accountId };
}
