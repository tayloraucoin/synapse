/**
 * What the Linear routes and procedures need from the environment, in one
 * read: the client id and the token key. Throws naming the variable that
 * is missing, so an unset deploy fails at the connect, not at import.
 */
import { readApiEnv } from "../../env";
import { readTokenKey } from "../integrations/token-crypto";

export interface LinearServiceConfig {
  clientId: string;
  key: Buffer;
}

export function linearServiceConfig(): LinearServiceConfig {
  const clientId = readApiEnv().LINEAR_CLIENT_ID;
  if (!clientId) {
    throw new Error(
      "Missing LINEAR_CLIENT_ID: the Linear OAuth app's client id.",
    );
  }
  return { clientId, key: readTokenKey() };
}
