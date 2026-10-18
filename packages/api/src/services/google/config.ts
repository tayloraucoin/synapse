/**
 * What the Google routes and procedures need from the environment, in one
 * read: Google Calendar's own client (never the sign-in's) and the token
 * key. Throws naming the variable that is missing, so an unset deploy fails
 * at the connect, not at import.
 */
import { readApiEnv } from "../../env";
import { readTokenKey } from "../integrations/token-crypto";

export interface GoogleServiceConfig {
  clientId: string;
  clientSecret: string;
  key: Buffer;
}

export function googleServiceConfig(): GoogleServiceConfig {
  const env = readApiEnv();
  if (!env.GOOGLE_CALENDAR_CLIENT_ID) {
    throw new Error(
      "Missing GOOGLE_CALENDAR_CLIENT_ID: Google Calendar's OAuth client id.",
    );
  }
  if (!env.GOOGLE_CALENDAR_CLIENT_SECRET) {
    throw new Error(
      "Missing GOOGLE_CALENDAR_CLIENT_SECRET: Google Calendar's OAuth client secret.",
    );
  }
  return {
    clientId: env.GOOGLE_CALENDAR_CLIENT_ID,
    clientSecret: env.GOOGLE_CALENDAR_CLIENT_SECRET,
    key: readTokenKey(),
  };
}
