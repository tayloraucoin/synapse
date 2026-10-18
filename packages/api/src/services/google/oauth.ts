/**
 * Google Calendar's OAuth 2.0 (USE-103), from the platform research checked
 * 2026-10-13. Read-only, and the narrower pair only (D-USE-116): the
 * calendar list and the events, never `calendar.readonly`, and nothing is
 * ever written to Google.
 *
 * Its own Web application client, apart from sign-in: never the sign-in's
 * scopes and never `include_granted_scopes`. `access_type=offline` with
 * `prompt=consent` returns a refresh token on every connect (without
 * consent, only the first). PKCE (S256) beside the client secret, as
 * Google's web flow takes both.
 *
 * Google does not rotate the refresh token; the access token lives an hour
 * and is never stored (`google_accounts` has no column for it), so each
 * sync refreshes once. `invalid_grant` (revoked, six months unused, the
 * hundredth newer token, or a Testing client's seven days) means Reconnect.
 *
 * Every call takes its `fetch`, so a test stubs Google and nothing here
 * reaches the network on its own.
 */
import { createHash, randomBytes } from "node:crypto";
import { z } from "zod";

export const GOOGLE_AUTHORIZE_URL =
  "https://accounts.google.com/o/oauth2/v2/auth";
export const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
export const GOOGLE_REVOKE_URL = "https://oauth2.googleapis.com/revoke";

/** The read-only pair, and nothing more (D-USE-116). */
export const GOOGLE_CALENDAR_SCOPES = [
  "https://www.googleapis.com/auth/calendar.calendarlist.readonly",
  "https://www.googleapis.com/auth/calendar.events.readonly",
] as const;

export type FetchLike = (url: string, init?: RequestInit) => Promise<Response>;

/** A Google OAuth call that did not succeed; carries the status and Google's error code, never a body or a token. */
export class GoogleOAuthError extends Error {
  readonly status: number;
  readonly code: string | null;
  constructor(
    step: "exchange" | "refresh" | "revoke",
    status: number,
    code: string | null = null,
  ) {
    super(`Google ${step} failed (${status}${code ? `, ${code}` : ""}).`);
    this.name = "GoogleOAuthError";
    this.status = status;
    this.code = code;
  }

  /** The grant is gone: the account needs reconnecting. */
  get invalidGrant(): boolean {
    return this.code === "invalid_grant";
  }
}

/** A fresh PKCE verifier and its S256 challenge, and the state that ties the callback to this start. */
export function createGoogleAuthorization(): {
  state: string;
  verifier: string;
  challenge: string;
} {
  const verifier = randomBytes(32).toString("base64url");
  return {
    state: randomBytes(32).toString("base64url"),
    verifier,
    challenge: createHash("sha256").update(verifier).digest("base64url"),
  };
}

export function buildGoogleAuthorizeUrl(input: {
  clientId: string;
  redirectUri: string;
  state: string;
  challenge: string;
}): string {
  const url = new URL(GOOGLE_AUTHORIZE_URL);
  url.searchParams.set("client_id", input.clientId);
  url.searchParams.set("redirect_uri", input.redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", GOOGLE_CALENDAR_SCOPES.join(" "));
  url.searchParams.set("access_type", "offline");
  url.searchParams.set("prompt", "consent select_account");
  url.searchParams.set("state", input.state);
  url.searchParams.set("code_challenge", input.challenge);
  url.searchParams.set("code_challenge_method", "S256");
  return url.toString();
}

const tokenResponse = z.object({
  access_token: z.string().min(1),
  expires_in: z.number().positive(),
  refresh_token: z.string().min(1).optional(),
  refresh_token_expires_in: z.number().positive().optional(),
  scope: z.string().optional(),
});

const errorResponse = z.object({ error: z.string() });

/** What a grant or a refresh returned; plaintext, so it never leaves `services/google/`. */
export interface GoogleTokens {
  accessToken: string;
  accessExpiresAt: Date;
  /** On the exchange always (prompt=consent); on a refresh, only if Google sent a new one. */
  refreshToken: string | null;
  refreshExpiresAt: Date | null;
  scopes: string[];
}

async function postTokenForm(
  fetchFn: FetchLike,
  step: "exchange" | "refresh",
  form: Record<string, string>,
  now: Date,
): Promise<GoogleTokens> {
  const response = await fetchFn(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(form).toString(),
  });
  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const parsed = errorResponse.safeParse(body);
    throw new GoogleOAuthError(
      step,
      response.status,
      parsed.success ? parsed.data.error : null,
    );
  }
  const parsed = tokenResponse.safeParse(body);
  if (!parsed.success) throw new GoogleOAuthError(step, response.status);
  const at = now.getTime();
  return {
    accessToken: parsed.data.access_token,
    accessExpiresAt: new Date(at + parsed.data.expires_in * 1000),
    refreshToken: parsed.data.refresh_token ?? null,
    refreshExpiresAt: parsed.data.refresh_token_expires_in
      ? new Date(at + parsed.data.refresh_token_expires_in * 1000)
      : null,
    scopes: parsed.data.scope ? parsed.data.scope.split(" ") : [],
  };
}

/** The callback's code for the tokens: the verifier and the secret. */
export function exchangeGoogleCode(
  fetchFn: FetchLike,
  input: {
    code: string;
    verifier: string;
    clientId: string;
    clientSecret: string;
    redirectUri: string;
  },
  now: Date = new Date(),
): Promise<GoogleTokens> {
  return postTokenForm(
    fetchFn,
    "exchange",
    {
      code: input.code,
      client_id: input.clientId,
      client_secret: input.clientSecret,
      redirect_uri: input.redirectUri,
      code_verifier: input.verifier,
      grant_type: "authorization_code",
    },
    now,
  );
}

/** An access token for the stored refresh token. */
export function refreshGoogleAccess(
  fetchFn: FetchLike,
  input: { refreshToken: string; clientId: string; clientSecret: string },
  now: Date = new Date(),
): Promise<GoogleTokens> {
  return postTokenForm(
    fetchFn,
    "refresh",
    {
      grant_type: "refresh_token",
      refresh_token: input.refreshToken,
      client_id: input.clientId,
      client_secret: input.clientSecret,
    },
    now,
  );
}

/** Revokes the grant (the refresh token takes the access token with it); a 400 (already gone) counts as done. */
export async function revokeGoogleToken(
  fetchFn: FetchLike,
  token: string,
): Promise<void> {
  const response = await fetchFn(GOOGLE_REVOKE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ token }).toString(),
  });
  if (response.ok || response.status === 400) return;
  throw new GoogleOAuthError("revoke", response.status);
}
