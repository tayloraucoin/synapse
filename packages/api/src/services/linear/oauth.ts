/**
 * Linear's OAuth 2.0 (USE-100, D-USE-114: OAuth only, no API-key path),
 * from `docs/research/platform-apis/linear-api.md`, checked 2026-10-13.
 *
 * One public application, PKCE (S256), so no client secret is held. Every
 * connect asks for consent again (`prompt=consent`), so "+ Add a workspace"
 * can pick another workspace. Linear rotates the refresh token on every
 * refresh: the old one stops working, so a refreshed pair is stored in one
 * write (`refresh.ts`).
 *
 * Every call takes its `fetch`, so a test stubs Linear and nothing here
 * reaches the network on its own.
 */
import { createHash, randomBytes } from "node:crypto";
import { z } from "zod";

export const LINEAR_AUTHORIZE_URL = "https://linear.app/oauth/authorize";
export const LINEAR_TOKEN_URL = "https://api.linear.app/oauth/token";
export const LINEAR_REVOKE_URL = "https://api.linear.app/oauth/revoke";
export const LINEAR_GRAPHQL_URL = "https://api.linear.app/graphql";

/** Read and write: the outbox writes status, priority, description and estimate (D-USE-113). */
export const LINEAR_SCOPES = ["read", "write"] as const;

export type FetchLike = (url: string, init?: RequestInit) => Promise<Response>;

/** A Linear OAuth call that did not succeed; carries the status, never a body or a token. */
export class LinearOAuthError extends Error {
  readonly status: number;
  constructor(step: "exchange" | "refresh" | "revoke", status: number) {
    super(`Linear ${step} failed (${status}).`);
    this.name = "LinearOAuthError";
    this.status = status;
  }
}

function base64url(bytes: Buffer): string {
  return bytes.toString("base64url");
}

/** A fresh PKCE verifier and its S256 challenge, and the state that ties the callback to this start. */
export function createLinearAuthorization(): {
  state: string;
  verifier: string;
  challenge: string;
} {
  const verifier = base64url(randomBytes(32));
  return {
    state: base64url(randomBytes(32)),
    verifier,
    challenge: base64url(createHash("sha256").update(verifier).digest()),
  };
}

export function buildLinearAuthorizeUrl(input: {
  clientId: string;
  redirectUri: string;
  state: string;
  challenge: string;
}): string {
  const url = new URL(LINEAR_AUTHORIZE_URL);
  url.searchParams.set("client_id", input.clientId);
  url.searchParams.set("redirect_uri", input.redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", LINEAR_SCOPES.join(","));
  url.searchParams.set("state", input.state);
  url.searchParams.set("actor", "user");
  url.searchParams.set("code_challenge", input.challenge);
  url.searchParams.set("code_challenge_method", "S256");
  url.searchParams.set("prompt", "consent");
  return url.toString();
}

const tokenResponse = z.object({
  access_token: z.string().min(1),
  refresh_token: z.string().min(1),
  expires_in: z.number().positive(),
  scope: z.union([z.string(), z.array(z.string())]).optional(),
});

/** A token pair as Linear granted it; plaintext, so it never leaves `services/linear/`. */
export interface LinearTokenPair {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  scopes: string;
}

async function postTokenForm(
  fetchFn: FetchLike,
  step: "exchange" | "refresh",
  form: Record<string, string>,
  now: Date,
): Promise<LinearTokenPair> {
  const response = await fetchFn(LINEAR_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(form).toString(),
  });
  if (!response.ok) throw new LinearOAuthError(step, response.status);
  const parsed = tokenResponse.safeParse(await response.json());
  if (!parsed.success) throw new LinearOAuthError(step, response.status);
  const { scope } = parsed.data;
  return {
    accessToken: parsed.data.access_token,
    refreshToken: parsed.data.refresh_token,
    expiresAt: new Date(now.getTime() + parsed.data.expires_in * 1000),
    scopes: Array.isArray(scope)
      ? scope.join(",")
      : (scope ?? LINEAR_SCOPES.join(",")),
  };
}

/** The callback's code for a token pair (PKCE: the verifier, no secret). */
export function exchangeLinearCode(
  fetchFn: FetchLike,
  input: {
    code: string;
    verifier: string;
    clientId: string;
    redirectUri: string;
  },
  now: Date = new Date(),
): Promise<LinearTokenPair> {
  return postTokenForm(
    fetchFn,
    "exchange",
    {
      code: input.code,
      redirect_uri: input.redirectUri,
      client_id: input.clientId,
      code_verifier: input.verifier,
      grant_type: "authorization_code",
    },
    now,
  );
}

/** A new pair for the refresh token; the old refresh token stops working. */
export function refreshLinearTokens(
  fetchFn: FetchLike,
  input: { refreshToken: string; clientId: string },
  now: Date = new Date(),
): Promise<LinearTokenPair> {
  return postTokenForm(
    fetchFn,
    "refresh",
    {
      grant_type: "refresh_token",
      refresh_token: input.refreshToken,
      client_id: input.clientId,
    },
    now,
  );
}

/** Revokes a token; a 400 (already revoked or expired) counts as done. */
export async function revokeLinearToken(
  fetchFn: FetchLike,
  token: string,
): Promise<void> {
  const response = await fetchFn(LINEAR_REVOKE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ token }).toString(),
  });
  if (response.ok || response.status === 400) return;
  throw new LinearOAuthError("revoke", response.status);
}
